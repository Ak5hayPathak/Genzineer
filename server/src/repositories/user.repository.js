import { pool } from "../config/db.config.js";

// Create a new user
const createUser = async ({ username, fullName, email, passwordHash }) => {
  const query = `
    INSERT INTO users (username, full_name, email, password_hash)
    VALUES ($1, $2, $3, $4)
    RETURNING id, username, full_name, email, created_at, updated_at;
  `;

  const values = [username, fullName, email, passwordHash];

  const { rows } = await pool.query(query, values);

  return rows[0];
};

// Find a user by email
const findUserByEmail = async (email) => {
  const query = `
    SELECT *
    FROM users
    WHERE email = $1;
  `;

  const { rows } = await pool.query(query, [email]);

  return rows[0] ?? null;
};

// Find a user by username
const findUserByUsername = async (username) => {
  const query = `
    SELECT id, username, full_name, email, created_at, updated_at
    FROM users
    WHERE username = $1;
  `;

  const { rows } = await pool.query(query, [username]);

  return rows[0] ?? null;
};

// Find a user by ID
const findUserById = async (id) => {
  const query = `
    SELECT id, username, full_name, email, created_at, updated_at
    FROM users
    WHERE id = $1;
  `;

  const { rows } = await pool.query(query, [id]);

  return rows[0] ?? null;
};

export { createUser, findUserByEmail, findUserByUsername, findUserById };
