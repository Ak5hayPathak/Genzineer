import { pool } from "../config/db.config.js";

// Create a category.
const createCategory = async ({ name, slug }, db = pool) => {
  const query = `
    INSERT INTO categories (name, slug)
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

// Find a category by ID.
const findCategoryById = async (id, db = pool) => {
  const query = `
    SELECT
      id,
      name,
      slug,
      created_at,
      updated_at
    FROM categories
    WHERE id = $1;
  `;

  const { rows } = await db.query(query, [id]);

  return rows[0] ?? null;
};

// Find a category by slug.
const findCategoryBySlug = async (slug, db = pool) => {
  const query = `
    SELECT
      id,
      name,
      slug,
      created_at,
      updated_at
    FROM categories
    WHERE slug = $1;
  `;

  const { rows } = await db.query(query, [slug]);

  return rows[0] ?? null;
};

// Retrieve all categories.
const findAllCategories = async (db = pool) => {
  const query = `
    SELECT
      id,
      name,
      slug,
      created_at,
      updated_at
    FROM categories
    ORDER BY name ASC;
  `;

  const { rows } = await db.query(query);

  return rows;
};

// Update a category.
const updateCategory = async ({ id, name, slug }, db = pool) => {
  const fields = [];
  const values = [id];

  if (name !== undefined) {
    values.push(name);
    fields.push(`name = $${values.length}`);
  }

  if (slug !== undefined) {
    values.push(slug);
    fields.push(`slug = $${values.length}`);
  }

  if (fields.length === 0) {
    return findCategoryById(id, db);
  }

  const query = `
    UPDATE categories
    SET ${fields.join(", ")}
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

// Delete a category.
const deleteCategory = async (id, db = pool) => {
  const query = `
    DELETE FROM categories
    WHERE id = $1
    RETURNING id;
  `;

  const { rows } = await db.query(query, [id]);

  return rows[0] ?? null;
};

export {
  createCategory,
  findCategoryById,
  findCategoryBySlug,
  findAllCategories,
  updateCategory,
  deleteCategory,
};
