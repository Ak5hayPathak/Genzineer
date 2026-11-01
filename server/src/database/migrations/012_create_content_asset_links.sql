BEGIN;
CREATE TABLE content_asset_links (
    content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES content_assets(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (content_id, asset_id)
);
CREATE INDEX idx_content_asset_links_asset_id ON content_asset_links(asset_id);
COMMIT;