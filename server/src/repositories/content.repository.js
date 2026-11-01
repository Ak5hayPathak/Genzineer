import { pool } from "../config/db.config.js";

// Create a new content record.
const createContent = async (
  {
    authorId,
    collectionId = null,
    parentId = null,
    title,
    slug,
    type,
    description = null,
    position = 0,
  },
  db = pool
) => {
  const query = `
    INSERT INTO contents (
      author_id,
      collection_id,
      parent_id,
      title,
      slug,
      type,
      description,
      position
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING
      id,
      author_id,
      collection_id,
      parent_id,
      title,
      slug,
      type,
      description,
      b2_key,
      status,
      position,
      created_at,
      updated_at,
      published_at;
  `;

  const values = [
    authorId,
    collectionId,
    parentId,
    title,
    slug,
    type,
    description,
    position,
  ];

  const { rows } = await db.query(query, values);

  return rows[0];
};

// Find content by ID.
const findContentById = async (id, db = pool) => {
  const query = `
    SELECT
      id,
      author_id,
      collection_id,
      parent_id,
      title,
      slug,
      type,
      description,
      b2_key,
      status,
      position,
      created_at,
      updated_at,
      published_at
    FROM contents
    WHERE id = $1;
  `;

  const { rows } = await db.query(query, [id]);

  return rows[0] ?? null;
};

// Find content by slug.
const findContentBySlug = async ({ slug, type, collectionId }, db = pool) => {
  const query = `
    SELECT
      id,
      author_id,
      collection_id,
      parent_id,
      title,
      slug,
      type,
      description,
      b2_key,
      status,
      position,
      created_at,
      updated_at,
      published_at
    FROM contents
    WHERE slug = $1
      AND type = $2
      AND collection_id IS NOT DISTINCT FROM $3;
  `;

  const { rows } = await db.query(query, [slug, type, collectionId ?? null]);

  return rows[0] ?? null;
};

// Update an existing content record.
const updateContent = async (data, db = pool) => {
  const {
    id,
    title,
    slug,
    description,
    parentId,
    position,
    b2Key,
    status,
    publishedAt,
  } = data;

  const fields = [
    ["title", title],
    ["slug", slug],
    ["description", description],
    ["parent_id", parentId],
    ["position", position],
    ["b2_key", b2Key],
    ["status", status],
    ["published_at", publishedAt],
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
    return findContentById(id, db);
  }

  const query = `
    UPDATE contents
    SET ${assignments.join(", ")}
    WHERE id = $1
    RETURNING
      id,
      author_id,
      collection_id,
      parent_id,
      title,
      slug,
      type,
      description,
      b2_key,
      status,
      position,
      created_at,
      updated_at,
      published_at;
  `;

  const { rows } = await db.query(query, values);

  return rows[0] ?? null;
};

// Delete a content record.
const deleteContent = async (id, db = pool) => {
  const query = `
    DELETE FROM contents
    WHERE id = $1
    RETURNING id;
  `;

  const { rows } = await db.query(query, [id]);

  return rows[0] ?? null;
};

// Find all content records in a collection.
const findContentsByCollection = async (collectionId, db = pool) => {
  const query = `
    SELECT
      id,
      author_id,
      collection_id,
      parent_id,
      title,
      slug,
      type,
      description,
      b2_key,
      status,
      position,
      created_at,
      updated_at,
      published_at
    FROM contents
    WHERE collection_id = $1
    ORDER BY position ASC, created_at ASC, id ASC;
  `;

  const { rows } = await db.query(query, [collectionId]);

  return rows;
};

// Find direct child content records.
const findChildContents = async (parentId, db = pool) => {
  const query = `
    SELECT
      id,
      author_id,
      collection_id,
      parent_id,
      title,
      slug,
      type,
      description,
      b2_key,
      status,
      position,
      created_at,
      updated_at,
      published_at
    FROM contents
    WHERE parent_id = $1
    ORDER BY position ASC, created_at ASC, id ASC;
  `;

  const { rows } = await db.query(query, [parentId]);

  return rows;
};

// Find all content records created by an author.
const findContentsByAuthor = async (authorId, db = pool) => {
  const query = `
    SELECT
      id,
      author_id,
      collection_id,
      parent_id,
      title,
      slug,
      type,
      description,
      b2_key,
      status,
      position,
      created_at,
      updated_at,
      published_at
    FROM contents
    WHERE author_id = $1
    ORDER BY created_at DESC, id ASC;
  `;

  const { rows } = await db.query(query, [authorId]);

  return rows;
};

export {
  createContent,
  findContentById,
  findContentBySlug,
  updateContent,
  deleteContent,
  findContentsByCollection,
  findChildContents,
  findContentsByAuthor,
};
