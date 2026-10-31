import { pool } from "../config/db.config.js";

// Create a new user.
// Accepts a transaction client when provided; otherwise uses the pool.
const createUser = async (
  { username, fullName, email, passwordHash = null, googleId = null },
  db = pool
) => {
  const query = `
    INSERT INTO users (
      username,
      full_name,
      email,
      password_hash,
      google_id
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING
      id,
      username,
      full_name,
      email,
      created_at,
      updated_at;
  `;

  const values = [username, fullName, email, passwordHash, googleId];

  const { rows } = await db.query(query, values);

  return rows[0];
};

// Find a user by email.
const findUserByEmail = async (email) => {
  const query = `
    SELECT *
    FROM users
    WHERE email = $1;
  `;

  const { rows } = await pool.query(query, [email]);

  return rows[0] ?? null;
};

// Find a user by username.
const findUserByUsername = async (username) => {
  const query = `
    SELECT id, username, full_name, email, created_at, updated_at
    FROM users
    WHERE username = $1;
  `;

  const { rows } = await pool.query(query, [username]);

  return rows[0] ?? null;
};

const findUserByUsernameForAuth = async (username) => {
  const query = `
    SELECT *
    FROM users
    WHERE username = $1;
  `;

  const { rows } = await pool.query(query, [username]);

  return rows[0] ?? null;
};

// Find a user by ID.
const findUserById = async (id) => {
  const query = `
    SELECT id, username, full_name, email, created_at, updated_at
    FROM users
    WHERE id = $1;
  `;

  const { rows } = await pool.query(query, [id]);

  return rows[0] ?? null;
};

// Find a user by Google account ID.
const findUserByGoogleId = async (googleId) => {
  const query = `
    SELECT *
    FROM users
    WHERE google_id = $1;
  `;

  const { rows } = await pool.query(query, [googleId]);

  return rows[0] ?? null;
};

export {
  createUser,
  findUserByEmail,
  findUserByUsername,
  findUserById,
  findUserByGoogleId,
  findUserByUsernameForAuth
};
