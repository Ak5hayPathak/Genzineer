import { pool } from "../config/db.config.js";

// Assign a tag to content.
const assignTagToContent = async ({ contentId, tagId }, db = pool) => {
  const query = `
    INSERT INTO content_tags (
      content_id,
      tag_id
    )
    VALUES ($1, $2)
    ON CONFLICT (content_id, tag_id) DO NOTHING
    RETURNING
      content_id,
      tag_id;
  `;

  const { rows } = await db.query(query, [contentId, tagId]);

  return rows[0] ?? null;
};

// Find all tags assigned to content.
const findTagsByContentId = async (contentId, db = pool) => {
  const query = `
    SELECT
      t.id,
      t.name,
      t.slug,
      t.created_at,
      t.updated_at
    FROM tags AS t
    INNER JOIN content_tags AS ct
      ON ct.tag_id = t.id
    WHERE ct.content_id = $1
    ORDER BY t.name ASC, t.id ASC;
  `;

  const { rows } = await db.query(query, [contentId]);

  return rows;
};

// Find all content assigned to a tag.
const findContentByTagId = async (tagId, db = pool) => {
  const query = `
    SELECT
      c.id,
      c.author_id,
      c.collection_id,
      c.parent_id,
      c.title,
      c.slug,
      c.type,
      c.description,
      c.b2_key,
      c.status,
      c.position,
      c.created_at,
      c.updated_at,
      c.published_at
    FROM contents AS c
    INNER JOIN content_tags AS ct
      ON ct.content_id = c.id
    WHERE ct.tag_id = $1
    ORDER BY c.created_at DESC, c.id ASC;
  `;

  const { rows } = await db.query(query, [tagId]);

  return rows;
};

// Remove a tag from content.
const removeTagFromContent = async ({ contentId, tagId }, db = pool) => {
  const query = `
    DELETE FROM content_tags
    WHERE content_id = $1
      AND tag_id = $2
    RETURNING
      content_id,
      tag_id;
  `;

  const { rows } = await db.query(query, [contentId, tagId]);

  return rows[0] ?? null;
};

// Remove all tags from content.
const removeAllTagsFromContent = async (contentId, db = pool) => {
  const query = `
    DELETE FROM content_tags
    WHERE content_id = $1
    RETURNING tag_id;
  `;

  const { rows } = await db.query(query, [contentId]);

  return rows;
};

export {
  assignTagToContent,
  findTagsByContentId,
  findContentByTagId,
  removeTagFromContent,
  removeAllTagsFromContent,
};
