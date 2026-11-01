import { pool } from "../config/db.config.js";

// Link an asset to content.
const linkAssetToContent = async ({ contentId, assetId }, db = pool) => {
  const query = `
    INSERT INTO content_asset_links (
      content_id,
      asset_id
    )
    VALUES ($1, $2)
    ON CONFLICT (content_id, asset_id) DO NOTHING
    RETURNING
      content_id,
      asset_id;
  `;

  const { rows } = await db.query(query, [contentId, assetId]);

  return rows[0] ?? null;
};

// Find all assets linked to content.
const findAssetsByContentId = async (contentId, db = pool) => {
  const query = `
    SELECT
      a.id,
      a.file_name,
      a.b2_key,
      a.mime_type,
      a.file_size,
      a.asset_type,
      a.created_at,
      a.updated_at
    FROM content_assets AS a
    INNER JOIN content_asset_links AS cal
      ON cal.asset_id = a.id
    WHERE cal.content_id = $1
    ORDER BY a.created_at ASC, a.id ASC;
  `;

  const { rows } = await db.query(query, [contentId]);

  return rows;
};

// Find all content linked to an asset.
const findContentByAssetId = async (assetId, db = pool) => {
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
    INNER JOIN content_asset_links AS cal
      ON cal.content_id = c.id
    WHERE cal.asset_id = $1
    ORDER BY c.created_at DESC, c.id ASC;
  `;

  const { rows } = await db.query(query, [assetId]);

  return rows;
};

// Remove an asset link from content.
const unlinkAssetFromContent = async ({ contentId, assetId }, db = pool) => {
  const query = `
    DELETE FROM content_asset_links
    WHERE content_id = $1
      AND asset_id = $2
    RETURNING
      content_id,
      asset_id;
  `;

  const { rows } = await db.query(query, [contentId, assetId]);

  return rows[0] ?? null;
};

// Remove all asset links from content.
const unlinkAllAssetsFromContent = async (contentId, db = pool) => {
  const query = `
    DELETE FROM content_asset_links
    WHERE content_id = $1
    RETURNING asset_id;
  `;

  const { rows } = await db.query(query, [contentId]);

  return rows;
};

export {
  linkAssetToContent,
  findAssetsByContentId,
  findContentByAssetId,
  unlinkAssetFromContent,
  unlinkAllAssetsFromContent,
};
