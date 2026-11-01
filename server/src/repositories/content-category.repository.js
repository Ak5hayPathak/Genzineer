import { pool } from "../config/db.config.js";

// Assign a category to content.
const assignCategoryToContent = async (
  { contentId, categoryId },
  db = pool
) => {
  const query = `
    INSERT INTO content_categories (
      content_id,
      category_id
    )
    VALUES ($1, $2)
    ON CONFLICT (content_id, category_id) DO NOTHING
    RETURNING
      content_id,
      category_id;
  `;

  const { rows } = await db.query(query, [contentId, categoryId]);

  return rows[0] ?? null;
};

// Find all categories assigned to content.
const findCategoriesByContentId = async (contentId, db = pool) => {
  const query = `
    SELECT
      c.id,
      c.name,
      c.slug,
      c.created_at,
      c.updated_at
    FROM categories AS c
    INNER JOIN content_categories AS cc
      ON cc.category_id = c.id
    WHERE cc.content_id = $1
    ORDER BY c.name ASC, c.id ASC;
  `;

  const { rows } = await db.query(query, [contentId]);

  return rows;
};

// Find all content assigned to a category.
const findContentByCategoryId = async (categoryId, db = pool) => {
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
    INNER JOIN content_categories AS cc
      ON cc.content_id = c.id
    WHERE cc.category_id = $1
    ORDER BY c.created_at DESC, c.id ASC;
  `;

  const { rows } = await db.query(query, [categoryId]);

  return rows;
};

// Remove a category from content.
const removeCategoryFromContent = async (
  { contentId, categoryId },
  db = pool
) => {
  const query = `
    DELETE FROM content_categories
    WHERE content_id = $1
      AND category_id = $2
    RETURNING
      content_id,
      category_id;
  `;

  const { rows } = await db.query(query, [contentId, categoryId]);

  return rows[0] ?? null;
};

// Remove all categories assigned to content.
const removeAllCategoriesFromContent = async (contentId, db = pool) => {
  const query = `
    DELETE FROM content_categories
    WHERE content_id = $1
    RETURNING category_id;
  `;

  const { rows } = await db.query(query, [contentId]);

  return rows;
};

export {
  assignCategoryToContent,
  findCategoriesByContentId,
  findContentByCategoryId,
  removeCategoryFromContent,
  removeAllCategoriesFromContent,
};
