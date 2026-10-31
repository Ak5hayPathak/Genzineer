import { randomBytes, createHash } from "node:crypto";

import { pool } from "../config/db.config.js";

import {
  revokeActiveEmailVerificationTokens,
  createEmailVerificationToken,
  consumeEmailVerificationToken,
  markUserEmailVerified,
} from "../repositories/email-verification.repository.js";

import ApiError from "../utils/ApiError.utils.js";

// Verification tokens expire after 24 hours.
const EMAIL_VERIFICATION_TOKEN_EXPIRY = 24 * 60 * 60 * 1000;

// Hash a verification token using SHA-256.
const hashVerificationToken = (token) => {
  return createHash("sha256").update(token).digest("hex");
};

// Generate and store a new email verification token.
const generateEmailVerificationToken = async (userId) => {
  const token = randomBytes(32).toString("hex");

  const tokenHash = hashVerificationToken(token);

  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_EXPIRY);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Invalidate previously issued, unused tokens.
    await revokeActiveEmailVerificationTokens(userId, client);

    // Store the hash instead of the original token.
    await createEmailVerificationToken(
      {
        userId,
        tokenHash,
        expiresAt,
      },
      client
    );

    await client.query("COMMIT");

    // Return the original token for the email service.
    return {
      token,
      expiresAt,
    };
  } catch (error) {
    await client.query("ROLLBACK");
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

    // Atomically consume the token if it is valid.
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

    // Mark the associated user's email as verified.
    const user = await markUserEmailVerified(verificationToken.user_id, client);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Invalidate any other outstanding verification tokens.
    await revokeActiveEmailVerificationTokens(
      verificationToken.user_id,
      client
    );

    await client.query("COMMIT");

    return user;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export { generateEmailVerificationToken, verifyEmailAddress };
