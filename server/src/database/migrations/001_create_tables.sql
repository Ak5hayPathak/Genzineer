-- BEGIN starts a transaction.
-- All changes will be committed together at the end.
BEGIN;
-- 1. USERS
-- Creates a table named users to store user account information.
CREATE TABLE users (
    -- Creates a UUID column that uniquely identifies each user.
    -- gen_random_uuid() automatically generates a UUID when a user is created.
    -- PRIMARY KEY means this value must be unique and cannot be NULL.
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Stores the username. It is required and must be unique.
    username VARCHAR(50) NOT NULL UNIQUE,
    -- Stores the user's full name. It is required.
    full_name VARCHAR(100) NOT NULL,
    -- Stores the user's email. It is required and must be unique.
    email VARCHAR(255) NOT NULL UNIQUE,
    -- Stores the hashed password, not the original password.
    -- TEXT allows variable-length text.
    password_hash TEXT NOT NULL,
    -- Stores when the user account was created.
    -- NOW() automatically inserts the current timestamp.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Stores when the user account was last updated.
    -- Initially, it receives the current timestamp.
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- 2. DOCUMENTATION COLLECTIONS
-- Creates a table to store documentation collections (books, courses, etc.).
CREATE TABLE documentation_collections (
    -- Unique identifier generated automatically for each collection.
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Stores the collection's title.
    title VARCHAR(255) NOT NULL,
    -- Stores the URL-friendly name of the collection.
    -- Every collection must have a unique slug.
    slug VARCHAR(255) NOT NULL UNIQUE,
    -- Stores an optional description of the collection.
    description TEXT,
    -- Stores the Backblaze B2 object key of the collection's cover image.
    cover_image_key TEXT,
    -- Records when the collection was created.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Records when the collection was last updated.
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- 3. CONTENTS
-- Creates the central table for blogs and documentation pages.
CREATE TABLE contents (
    -- Unique identifier generated automatically for every content item.
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Identifies the user who created this content.
    -- REFERENCES connects this column to the users table.
    -- ON DELETE RESTRICT prevents deleting a user who has authored content.
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    -- Identifies the documentation collection this page belongs to.
    -- NULL means it does not belong to a collection.
    -- ON DELETE RESTRICT prevents deleting a collection while it has content.
    collection_id UUID REFERENCES documentation_collections(id) ON DELETE RESTRICT,
    -- Identifies the parent documentation page.
    -- NULL means this is a top-level page.
    parent_id UUID,
    -- Stores the content title.
    title VARCHAR(255) NOT NULL,
    -- Stores the URL-friendly version of the title.
    slug VARCHAR(255) NOT NULL,
    -- Defines whether this content is a blog or documentation page.
    -- CHECK prevents any value other than these two.
    type VARCHAR(20) NOT NULL CHECK (type IN ('blog', 'documentation')),
    -- Stores an optional short description of the content.
    description TEXT,
    -- Stores the Backblaze B2 object key of the Markdown file.
    -- Each content item must have a unique B2 key.
    b2_key TEXT NOT NULL UNIQUE,
    -- Stores the publication status.
    -- New content is automatically marked as draft.
    -- CHECK restricts the allowed status values.
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    -- Controls the manual display order of pages.
    -- Defaults to zero.
    position INTEGER NOT NULL DEFAULT 0,
    -- Records when the content was created.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Records when the content was last updated.
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Records when the content was published.
    -- NULL means it has not been published yet.
    published_at TIMESTAMPTZ,
    -- Prevents blogs from belonging to documentation collections
    -- or having parent documentation pages.
    CONSTRAINT blog_hierarchy_check CHECK (
        type <> 'blog'
        OR (
            collection_id IS NULL
            AND parent_id IS NULL
        )
    ),
    -- Ensures that a nested page must belong to a collection.
    -- A page cannot have a parent while having no collection.
    CONSTRAINT parent_collection_check CHECK (
        parent_id IS NULL
        OR collection_id IS NOT NULL
    ),
    -- Prevents a content item from becoming its own parent.
    CONSTRAINT prevent_self_parent CHECK (
        parent_id IS NULL
        OR parent_id <> id
    ),
    -- Creates a composite unique constraint on id and collection_id.
    -- This allows the foreign key below to verify both values together.
    UNIQUE (id, collection_id),
    -- Connects a page to its parent page.
    -- Both parent_id and collection_id must match an existing content row.
    -- This ensures parent and child belong to the same collection.
    -- ON DELETE RESTRICT prevents deleting a parent that still has children.
    CONSTRAINT contents_parent_fk FOREIGN KEY (parent_id, collection_id) REFERENCES contents(id, collection_id) ON DELETE RESTRICT
);
-- 4. CATEGORIES
-- Creates a table for broad content categories and their hierarchy.
CREATE TABLE categories (
    -- Unique identifier generated automatically for each category.
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Stores the category name.
    name VARCHAR(100) NOT NULL,
    -- Stores the URL-friendly category name.
    -- Every category must have a unique slug.
    slug VARCHAR(150) NOT NULL UNIQUE,
    -- Stores an optional category description.
    description TEXT,
    -- References another category as its parent.
    -- NULL means this is a top-level category.
    -- ON DELETE SET NULL makes it a top-level category if its parent is deleted.
    parent_id UUID REFERENCES categories(id) ON DELETE
    SET NULL,
        -- Records when the category was created.
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        -- Records when the category was last updated.
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        -- Prevents a category from being its own parent.
        CHECK (
            parent_id IS NULL
            OR parent_id <> id
        )
);
-- 5. CONTENT CATEGORIES
-- Creates a junction table for the many-to-many relationship
-- between contents and categories.
CREATE TABLE content_categories (
    -- Identifies the content item.
    -- CASCADE automatically removes this relationship if the content is deleted.
    content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    -- Identifies the category.
    -- CASCADE automatically removes this relationship if the category is deleted.
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    -- Makes the combination unique.
    -- The same category cannot be assigned to the same content twice.
    PRIMARY KEY (content_id, category_id)
);
-- 6. TAGS
-- Creates a table for specific keywords associated with content.
CREATE TABLE tags (
    -- Unique identifier generated automatically for every tag.
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Stores the tag name.
    name VARCHAR(100) NOT NULL,
    -- Stores the URL-friendly tag name.
    -- Every tag must have a unique slug.
    slug VARCHAR(150) NOT NULL UNIQUE,
    -- Records when the tag was created.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- 7. CONTENT TAGS
-- Creates a junction table for the many-to-many relationship
-- between contents and tags.
CREATE TABLE content_tags (
    -- Identifies the content item.
    -- Its relationships are removed automatically if the content is deleted.
    content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    -- Identifies the tag.
    -- Its relationships are removed automatically if the tag is deleted.
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    -- Prevents assigning the same tag to the same content more than once.
    PRIMARY KEY (content_id, tag_id)
);
-- 8. CONTENT ASSETS
-- Creates a table to store metadata about media files belonging to content.
CREATE TABLE content_assets (
    -- Unique identifier generated automatically for every asset.
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Identifies the content item to which this asset belongs.
    -- Deleting the content automatically deletes its asset metadata.
    content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    -- Stores the original name of the uploaded file.
    file_name VARCHAR(255) NOT NULL,
    -- Stores the unique Backblaze B2 object key of the file.
    b2_key TEXT NOT NULL UNIQUE,
    -- Stores the file's MIME type, such as image/png or video/mp4.
    mime_type VARCHAR(100) NOT NULL,
    -- Stores the file size in bytes.
    -- BIGINT supports large file sizes.
    -- CHECK prevents negative file sizes.
    file_size BIGINT NOT NULL CHECK (file_size >= 0),
    -- Records when the asset metadata was created.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- INDEXES
-- Creates an index on author_id to speed up queries
-- that find content written by a particular user.
CREATE INDEX idx_contents_author_id ON contents(author_id);
-- Speeds up queries that find content belonging to a collection.
CREATE INDEX idx_contents_collection_id ON contents(collection_id);
-- Speeds up queries that find child pages belonging to a parent page.
CREATE INDEX idx_contents_parent_id ON contents(parent_id);
-- Speeds up filtering content by publication status.
CREATE INDEX idx_contents_status ON contents(status);
-- Speeds up filtering content by its type (blog or documentation).
CREATE INDEX idx_contents_type ON contents(type);
-- Creates a unique index for blog slugs.
-- The WHERE clause means it only applies to rows whose type is blog.
CREATE UNIQUE INDEX idx_contents_blog_slug ON contents(slug)
WHERE type = 'blog';
-- Creates a unique index for documentation slugs within collections.
-- The same slug can exist in different collections, but not in the same one.
CREATE UNIQUE INDEX idx_contents_documentation_slug ON contents(collection_id, slug)
WHERE type = 'documentation'
    AND collection_id IS NOT NULL;
-- Creates a unique index for standalone documentation slugs.
-- Standalone documentation pages cannot share the same slug.
CREATE UNIQUE INDEX idx_contents_standalone_doc_slug ON contents(slug)
WHERE type = 'documentation'
    AND collection_id IS NULL;
-- Speeds up queries that find subcategories of a particular category.
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
-- Speeds up reverse lookups:
-- Finding all content items associated with a particular category.
CREATE INDEX idx_content_categories_category_id ON content_categories(category_id);
-- Speeds up reverse lookups:
-- Finding all content items associated with a particular tag.
CREATE INDEX idx_content_tags_tag_id ON content_tags(tag_id);
-- Speeds up queries that find all media assets belonging to a content item.
CREATE INDEX idx_content_assets_content_id ON content_assets(content_id);
-- COMMIT saves all the changes made in this transaction.
-- If an error occurs before COMMIT, the transaction can be rolled back.
COMMIT;