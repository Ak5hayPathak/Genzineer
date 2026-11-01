import { randomBytes, createHash } from "node:crypto";

import { pool } from "../config/db.config.js";

import {
  revokeActiveEmailVerificationTokens,
  createEmailVerificationToken,
  consumeEmailVerificationToken,
  markUserEmailVerified,
} from "../repositories/email-verification.repository.js";

import ApiError from "../utils/ApiError.utils.js";

const EMAIL_VERIFICATION_TOKEN_EXPIRY = 24 * 60 * 60 * 1000;

const hashVerificationToken = (token) =>
  createHash("sha256").update(token).digest("hex");

// Generate and store a new email verification token.
const generateEmailVerificationToken = async (userId) => {
  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const token = randomBytes(32).toString("hex");
  const tokenHash = hashVerificationToken(token);
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_EXPIRY);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await revokeActiveEmailVerificationTokens(userId, client);

    await createEmailVerificationToken(
      {
        userId,
        tokenHash,
        expiresAt,
      },
      client
    );

    await client.query("COMMIT");

    return { token, expiresAt };
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Token generation rollback failed:", rollbackError);
    }

    throw error;
  } finally {
    client.release();
  }
};

// Verify a user's email using the supplied token.
const verifyEmailAddress = async (token) => {
  if (!token || typeof token !== "string") {
    throw new ApiError(400, "Verification token is required");
  }

  const tokenHash = hashVerificationToken(token);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const verificationToken = await consumeEmailVerificationToken(
      tokenHash,
      client
    );

    if (!verificationToken) {
      throw new ApiError(
        400,
        "Invalid, expired, or already used verification token"
      );
    }

    const user = await markUserEmailVerified(verificationToken.user_id, client);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    await revokeActiveEmailVerificationTokens(
      verificationToken.user_id,
      client
    );

    await client.query("COMMIT");

    return user;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Email verification rollback failed:", rollbackError);
    }

    throw error;
  } finally {
    client.release();
  }
};

export { generateEmailVerificationToken, verifyEmailAddress };
