import { pool } from "../config/db.config.js";

// Create a tag.
const createTag = async ({ name, slug }, db = pool) => {
  const query = `
    INSERT INTO tags (name, slug)
    VALUES ($1, $2)
    RETURNING
      id,
      name,
      slug,
      created_at,
      updated_at;
  `;

  const { rows } = await db.query(query, [name, slug]);

  return rows[0];
};

// Find a tag by ID.
const findTagById = async (id, db = pool) => {
  const query = `
    SELECT
      id,
      name,
      slug,
      created_at,
      updated_at
    FROM tags
    WHERE id = $1;
  `;

  const { rows } = await db.query(query, [id]);

  return rows[0] ?? null;
};

// Find a tag by slug.
const findTagBySlug = async (slug, db = pool) => {
  const query = `
    SELECT
      id,
      name,
      slug,
      created_at,
      updated_at
    FROM tags
    WHERE slug = $1;
  `;

  const { rows } = await db.query(query, [slug]);

  return rows[0] ?? null;
};

// Retrieve all tags.
const findAllTags = async (db = pool) => {
  const query = `
    SELECT
      id,
      name,
      slug,
      created_at,
      updated_at
    FROM tags
    ORDER BY name ASC, id ASC;
  `;

  const { rows } = await db.query(query);

  return rows;
};

// Update a tag.
const updateTag = async (data, db = pool) => {
  const { id, name, slug } = data;

  const fields = [
    ["name", name],
    ["slug", slug],
  ];

  const values = [id];
  const assignments = [];

  for (const [column, value] of fields) {
    if (value !== undefined) {
      values.push(value);
      assignments.push(`${column} = $${values.length}`);
    }
  }

  if (assignments.length === 0) {
    return findTagById(id, db);
  }

  const query = `
    UPDATE tags
    SET ${assignments.join(", ")}
    WHERE id = $1
    RETURNING
      id,
      name,
      slug,
      created_at,
      updated_at;
  `;

  const { rows } = await db.query(query, values);

  return rows[0] ?? null;
};

// Delete a tag.
const deleteTag = async (id, db = pool) => {
  const query = `
    DELETE FROM tags
    WHERE id = $1
    RETURNING id;
  `;

  const { rows } = await db.query(query, [id]);

  return rows[0] ?? null;
};

export {
  createTag,
  findTagById,
  findTagBySlug,
  findAllTags,
  updateTag,
  deleteTag,
};
