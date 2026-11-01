BEGIN;
CREATE TABLE contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    collection_id UUID REFERENCES documentation_collections(id) ON DELETE RESTRICT,
    parent_id UUID,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('blog', 'documentation')),
    description TEXT,
    b2_key TEXT UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    position INTEGER NOT NULL DEFAULT 0 CHECK (position >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    CONSTRAINT blog_hierarchy_check CHECK (
        type <> 'blog'
        OR (
            collection_id IS NULL
            AND parent_id IS NULL
        )
    ),
    CONSTRAINT parent_collection_check CHECK (
        parent_id IS NULL
        OR collection_id IS NOT NULL
    ),
    CONSTRAINT prevent_self_parent CHECK (
        parent_id IS NULL
        OR parent_id <> id
    ),
    CONSTRAINT contents_published_check CHECK (
        status <> 'published'
        OR (
            b2_key IS NOT NULL
            AND published_at IS NOT NULL
        )
    ),
    UNIQUE (id, collection_id),
    CONSTRAINT contents_parent_fk FOREIGN KEY (parent_id, collection_id) REFERENCES contents(id, collection_id) ON DELETE RESTRICT
);
-- Blog slugs must be globally unique.
CREATE UNIQUE INDEX idx_contents_blog_slug ON contents(slug)
WHERE type = 'blog';
-- Documentation slugs must be unique within collections.
CREATE UNIQUE INDEX idx_contents_documentation_slug ON contents(collection_id, slug)
WHERE type = 'documentation'
    AND collection_id IS NOT NULL;
-- Standalone documentation slugs must be globally unique.
CREATE UNIQUE INDEX idx_contents_standalone_doc_slug ON contents(slug)
WHERE type = 'documentation'
    AND collection_id IS NULL;
-- Lookup indexes.
CREATE INDEX idx_contents_author_id ON contents(author_id);
CREATE INDEX idx_contents_collection_id ON contents(collection_id);
CREATE INDEX idx_contents_parent_id ON contents(parent_id);
CREATE INDEX idx_contents_status ON contents(status);
CREATE INDEX idx_contents_type ON contents(type);
COMMIT;