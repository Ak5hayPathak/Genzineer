import { pool } from "../config/db.config.js";

// Revoke all unused verification tokens belonging to a user.
const revokeActiveEmailVerificationTokens = async (userId, db = pool) => {
  const query = `
    UPDATE email_verification_tokens
    SET revoked_at = NOW()
    WHERE user_id = $1
      AND used_at IS NULL
      AND revoked_at IS NULL;
  `;

  await db.query(query, [userId]);
};

// Create a new email verification token.
const createEmailVerificationToken = async (
  { userId, tokenHash, expiresAt },
  db = pool
) => {
  const query = `
    INSERT INTO email_verification_tokens (
      user_id,
      token_hash,
      expires_at
    )
    VALUES ($1, $2, $3)
    RETURNING id, user_id, expires_at, created_at;
  `;

  const values = [userId, tokenHash, expiresAt];

  const { rows } = await db.query(query, values);

  return rows[0];
};

// Atomically consume a valid, unused verification token.
const consumeEmailVerificationToken = async (tokenHash, db = pool) => {
  const query = `
    UPDATE email_verification_tokens
    SET used_at = NOW()
    WHERE token_hash = $1
      AND used_at IS NULL
      AND revoked_at IS NULL
      AND expires_at > NOW()
    RETURNING user_id;
  `;

  const { rows } = await db.query(query, [tokenHash]);

  return rows[0] ?? null;
};

// Mark a user's email address as verified.
const markUserEmailVerified = async (userId, db = pool) => {
  const query = `
    UPDATE users
    SET
      email_verified = TRUE,
      updated_at = NOW()
    WHERE id = $1
    RETURNING id, email, email_verified;
  `;

  const { rows } = await db.query(query, [userId]);

  return rows[0] ?? null;
};

export {
  revokeActiveEmailVerificationTokens,
  createEmailVerificationToken,
  consumeEmailVerificationToken,
  markUserEmailVerified,
};
