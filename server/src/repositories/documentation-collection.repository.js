import { pool } from "../config/db.config.js";

// Create a documentation collection.
const createDocumentationCollection = async (
  { title, slug, description = null, coverImageKey = null },
  db = pool
) => {
  const query = `
    INSERT INTO documentation_collections (
      title,
      slug,
      description,
      cover_image_key
    )
    VALUES ($1, $2, $3, $4)
    RETURNING
      id,
      title,
      slug,
      description,
      cover_image_key,
      created_at,
      updated_at;
  `;

  const { rows } = await db.query(query, [
    title,
    slug,
    description,
    coverImageKey,
  ]);

  return rows[0];
};

// Find a documentation collection by ID.
const findDocumentationCollectionById = async (id, db = pool) => {
  const query = `
    SELECT
      id,
      title,
      slug,
      description,
      cover_image_key,
      created_at,
      updated_at
    FROM documentation_collections
    WHERE id = $1;
  `;

  const { rows } = await db.query(query, [id]);

  return rows[0] ?? null;
};

// Find a documentation collection by slug.
const findDocumentationCollectionBySlug = async (slug, db = pool) => {
  const query = `
    SELECT
      id,
      title,
      slug,
      description,
      cover_image_key,
      created_at,
      updated_at
    FROM documentation_collections
    WHERE slug = $1;
  `;

  const { rows } = await db.query(query, [slug]);

  return rows[0] ?? null;
};

// Update a documentation collection.
const updateDocumentationCollection = async (data, db = pool) => {
  const { id, title, slug, description, coverImageKey } = data;

  const fields = [
    ["title", title],
    ["slug", slug],
    ["description", description],
    ["cover_image_key", coverImageKey],
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
    return findDocumentationCollectionById(id, db);
  }

  const query = `
    UPDATE documentation_collections
    SET ${assignments.join(", ")}
    WHERE id = $1
    RETURNING
      id,
      title,
      slug,
      description,
      cover_image_key,
      created_at,
      updated_at;
  `;

  const { rows } = await db.query(query, values);

  return rows[0] ?? null;
};

// Delete a documentation collection.
const deleteDocumentationCollection = async (id, db = pool) => {
  const query = `
    DELETE FROM documentation_collections
    WHERE id = $1
    RETURNING id;
  `;

  const { rows } = await db.query(query, [id]);

  return rows[0] ?? null;
};

export {
  createDocumentationCollection,
  findDocumentationCollectionById,
  findDocumentationCollectionBySlug,
  updateDocumentationCollection,
  deleteDocumentationCollection,
};
