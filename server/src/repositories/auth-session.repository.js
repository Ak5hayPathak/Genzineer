import { pool } from "../config/db.config.js";

// Create a new authentication session
const createAuthSession = async (
  { id, userId, refreshTokenHash, expiresAt },
  db = pool
) => {
  const query = `
    INSERT INTO auth_sessions (
      id,
      user_id,
      refresh_token_hash,
      expires_at
    )
    VALUES ($1, $2, $3, $4)
    RETURNING id, user_id, expires_at, created_at;
  `;

  const values = [id, userId, refreshTokenHash, expiresAt];

  const { rows } = await db.query(query, values);

  return rows[0];
};

// Find an active session using its ID
const findActiveAuthSession = async (sessionId) => {
  const query = `
    SELECT id, user_id, refresh_token_hash, expires_at
    FROM auth_sessions
    WHERE id = $1
      AND revoked_at IS NULL
      AND expires_at > NOW();
  `;

  const { rows } = await pool.query(query, [sessionId]);

  return rows[0] ?? null;
};

// Update the refresh token hash during token rotation
const updateRefreshTokenHash = async (
  sessionId,
  userId,
  oldRefreshTokenHash,
  newRefreshTokenHash,
  expiresAt
) => {
  const query = `
    UPDATE auth_sessions
    SET
      refresh_token_hash = $1,
      expires_at = $2
    WHERE id = $3
      AND user_id = $4
      AND refresh_token_hash = $5
      AND revoked_at IS NULL
      AND expires_at > NOW()
    RETURNING id;
  `;

  const values = [
    newRefreshTokenHash,
    expiresAt,
    sessionId,
    userId,
    oldRefreshTokenHash,
  ];

  const { rows } = await pool.query(query, values);

  return rows[0] ?? null;
};

// Revoke an authentication session
const revokeAuthSession = async (sessionId) => {
  const query = `
    UPDATE auth_sessions
    SET revoked_at = NOW()
    WHERE id = $1
      AND revoked_at IS NULL
    RETURNING id;
  `;

  const { rows } = await pool.query(query, [sessionId]);

  return rows[0] ?? null;
};

export {
  createAuthSession,
  updateRefreshTokenHash,
  revokeAuthSession,
  findActiveAuthSession,
};
