import { randomUUID } from "node:crypto";

import { pool } from "../config/db.config.js";
import { googleOAuthClient } from "../config/google.config.js";

import {
  createUser,
  findUserByEmail,
  findUserByUsername,
  findUserByGoogleId,
} from "../repositories/user.repository.js";

import { generateAuthTokens } from "./auth.service.js";

import ApiError from "../utils/ApiError.utils.js";

// Generate Google's authorization URL.
const getGoogleAuthUrl = (state) => {
  return googleOAuthClient.generateAuthUrl({
    scope: ["openid", "email", "profile"],
    state,
  });
};

// Generate a unique username for a Google user.
const generateGoogleUsername = async (email) => {
  const emailPrefix = email.split("@")[0];

  let baseUsername = emailPrefix.replace(/[^a-zA-Z0-9_]/g, "");

  if (baseUsername.length < 3) {
    baseUsername = `user_${baseUsername}`;
  }

  baseUsername = baseUsername.slice(0, 40);

  const existingUser = await findUserByUsername(baseUsername);

  if (!existingUser) {
    return baseUsername;
  }

  return `${baseUsername}_${randomUUID().slice(0, 8)}`;
};

// Authenticate a user using Google's authorization code.
const authenticateGoogleUser = async (code) => {
  let idToken;

  try {
    const { tokens } = await googleOAuthClient.getToken(code);
    idToken = tokens.id_token;
  } catch {
    throw new ApiError(401, "Google authentication failed");
  }

  if (!idToken) {
    throw new ApiError(401, "Google did not provide an identity token");
  }

  let googlePayload;

  try {
    const ticket = await googleOAuthClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    googlePayload = ticket.getPayload();
  } catch {
    throw new ApiError(401, "Invalid Google identity token");
  }

  const {
    sub: googleId,
    email,
    email_verified: emailVerified,
    name,
  } = googlePayload;

  if (!googleId || !email || !emailVerified) {
    throw new ApiError(
      401,
      "Google account must have a verified email address"
    );
  }

  // Check whether this Google account already exists.
  const existingGoogleUser = await findUserByGoogleId(googleId);

  if (existingGoogleUser) {
    const { password_hash, google_id, ...safeUser } = existingGoogleUser;

    const tokens = await generateAuthTokens(safeUser);

    return { user: safeUser, ...tokens };
  }

  // Do not automatically link an existing email/password account.
  const existingEmailUser = await findUserByEmail(email);

  if (existingEmailUser) {
    throw new ApiError(
      409,
      "An account with this email already exists. Please log in using your password."
    );
  }

  const username = await generateGoogleUsername(email);

  const fullName = name?.trim() || email.split("@")[0];

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const user = await createUser(
      {
        username,
        fullName,
        email,
        googleId,
      },
      client
    );

    const tokens = await generateAuthTokens(user, client);

    await client.query("COMMIT");

    return { user, ...tokens };
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Google registration rollback failed:", rollbackError);
    }

    if (error.code === "23505") {
      throw new ApiError(
        409,
        "An account with these details already exists. Please try signing in again."
      );
    }

    throw error;
  } finally {
    client.release();
  }
};

export { getGoogleAuthUrl, authenticateGoogleUser };
