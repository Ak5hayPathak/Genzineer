BEGIN;
CREATE TABLE content_categories (
    content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (content_id, category_id)
);
CREATE INDEX idx_content_categories_category_id ON content_categories(category_id);
COMMIT;