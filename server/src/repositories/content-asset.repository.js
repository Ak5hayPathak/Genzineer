import { pool } from "../config/db.config.js";

// Create an asset record.
const createContentAsset = async (
  { fileName, b2Key, mimeType, fileSize, assetType },
  db = pool
) => {
  const query = `
    INSERT INTO content_assets (
      file_name,
      b2_key,
      mime_type,
      file_size,
      asset_type
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING
      id,
      file_name,
      b2_key,
      mime_type,
      file_size,
      asset_type,
      created_at,
      updated_at;
  `;

  const { rows } = await db.query(query, [
    fileName,
    b2Key,
    mimeType,
    fileSize,
    assetType,
  ]);

  return rows[0];
};

// Find an asset by ID.
const findContentAssetById = async (id, db = pool) => {
  const query = `
    SELECT
      id,
      file_name,
      b2_key,
      mime_type,
      file_size,
      asset_type,
      created_at,
      updated_at
    FROM content_assets
    WHERE id = $1;
  `;

  const { rows } = await db.query(query, [id]);

  return rows[0] ?? null;
};

// Find an asset by its B2 object key.
const findContentAssetByB2Key = async (b2Key, db = pool) => {
  const query = `
    SELECT
      id,
      file_name,
      b2_key,
      mime_type,
      file_size,
      asset_type,
      created_at,
      updated_at
    FROM content_assets
    WHERE b2_key = $1;
  `;

  const { rows } = await db.query(query, [b2Key]);

  return rows[0] ?? null;
};

// Retrieve all asset records.
const findAllContentAssets = async (db = pool) => {
  const query = `
    SELECT
      id,
      file_name,
      b2_key,
      mime_type,
      file_size,
      asset_type,
      created_at,
      updated_at
    FROM content_assets
    ORDER BY created_at DESC, id ASC;
  `;

  const { rows } = await db.query(query);

  return rows;
};

// Update asset metadata.
const updateContentAsset = async (data, db = pool) => {
  const { id, fileName, mimeType, fileSize, assetType } = data;

  const fields = [
    ["file_name", fileName],
    ["mime_type", mimeType],
    ["file_size", fileSize],
    ["asset_type", assetType],
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
    return findContentAssetById(id, db);
  }

  const query = `
    UPDATE content_assets
    SET ${assignments.join(", ")}
    WHERE id = $1
    RETURNING
      id,
      file_name,
      b2_key,
      mime_type,
      file_size,
      asset_type,
      created_at,
      updated_at;
  `;

  const { rows } = await db.query(query, values);

  return rows[0] ?? null;
};

// Delete an asset record.
const deleteContentAsset = async (id, db = pool) => {
  const query = `
    DELETE FROM content_assets
    WHERE id = $1
    RETURNING id, b2_key;
  `;

  const { rows } = await db.query(query, [id]);

  return rows[0] ?? null;
};

export {
  createContentAsset,
  findContentAssetById,
  findContentAssetByB2Key,
  findAllContentAssets,
  updateContentAsset,
  deleteContentAsset,
};
