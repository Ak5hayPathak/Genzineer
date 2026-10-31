import { randomUUID, createHash } from "node:crypto";
import bcrypt from "bcrypt";

import { pool } from "../config/db.config.js";

import {
  createUser,
  findUserByEmail,
  findUserByUsername,
} from "../repositories/user.repository.js";

import {
  createAuthSession,
  updateRefreshTokenHash,
  revokeAuthSession,
} from "../repositories/auth-session.repository.js";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/token.utils.js";

// IMPORTANT: ApiError is a default export in your utility file.
import ApiError from "../utils/ApiError.utils.js";

// Hash a refresh token using SHA-256
const hashRefreshToken = (token) => {
  return createHash("sha256").update(token).digest("hex");
};

// Generate tokens and create an authentication session
// Accepts a transaction client when provided.
const generateAuthTokens = async (user, db = pool) => {
  const sessionId = randomUUID();

  const payload = {
    userId: user.id,
    sessionId,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const refreshTokenHash = hashRefreshToken(refreshToken);

  const decodedToken = verifyRefreshToken(refreshToken);
  const expiresAt = new Date(decodedToken.exp * 1000);

  await createAuthSession(
    {
      id: sessionId,
      userId: user.id,
      refreshTokenHash,
      expiresAt,
    },
    db
  );

  return { accessToken, refreshToken };
};

// Register a new user
const registerUser = async ({ username, fullName, email, password }) => {
  const existingEmail = await findUserByEmail(email);

  if (existingEmail) {
    throw new ApiError(409, "Email is already registered");
  }

  const existingUsername = await findUserByUsername(username);

  if (existingUsername) {
    throw new ApiError(409, "Username is already taken");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const user = await createUser(
      {
        username,
        fullName,
        email,
        passwordHash,
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
      console.error("Registration rollback failed:", rollbackError);
    }

    // Handle duplicate email or username errors.
    if (error.code === "23505") {
      if (error.constraint === "users_email_key") {
        throw new ApiError(409, "Email is already registered");
      }

      if (error.constraint === "users_username_key") {
        throw new ApiError(409, "Username is already taken");
      }

      throw new ApiError(409, "A record with these details already exists");
    }

    throw error;
  } finally {
    client.release();
  }
};

// Login an existing user
const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);

  if (!user || !user.password_hash) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const { password_hash, ...safeUser } = user;

  const tokens = await generateAuthTokens(safeUser);

  return { user: safeUser, ...tokens };
};

// Refresh access and refresh tokens
const refreshUserTokens = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const { userId, sessionId } = payload;

  if (!userId || !sessionId) {
    throw new ApiError(401, "Invalid refresh token payload");
  }

  const newPayload = { userId, sessionId };

  const newAccessToken = generateAccessToken(newPayload);
  const newRefreshToken = generateRefreshToken(newPayload);

  const oldRefreshTokenHash = hashRefreshToken(refreshToken);
  const newRefreshTokenHash = hashRefreshToken(newRefreshToken);

  const decodedNewToken = verifyRefreshToken(newRefreshToken);
  const expiresAt = new Date(decodedNewToken.exp * 1000);

  const updatedSession = await updateRefreshTokenHash(
    sessionId,
    userId,
    oldRefreshTokenHash,
    newRefreshTokenHash,
    expiresAt
  );

  if (!updatedSession) {
    throw new ApiError(401, "Refresh token has already been used or revoked");
  }

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

// Logout and revoke the current session
const logoutUser = async (refreshToken) => {
  if (!refreshToken) return;

  let payload;

  try {
    payload = verifyRefreshToken(refreshToken, {
      ignoreExpiration: true,
    });
  } catch {
    return;
  }

  if (payload.sessionId) {
    await revokeAuthSession(payload.sessionId);
  }
};

export { registerUser, loginUser, refreshUserTokens, logoutUser, generateAuthTokens };
