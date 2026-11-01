BEGIN;
-- Reusable function to automatically update updated_at.
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- USERS
CREATE TRIGGER trg_users_updated_at BEFORE
UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- DOCUMENTATION COLLECTIONS
CREATE TRIGGER trg_documentation_collections_updated_at BEFORE
UPDATE ON documentation_collections FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- CONTENTS
CREATE TRIGGER trg_contents_updated_at BEFORE
UPDATE ON contents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- CATEGORIES
CREATE TRIGGER trg_categories_updated_at BEFORE
UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- TAGS
CREATE TRIGGER trg_tags_updated_at BEFORE
UPDATE ON tags FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- CONTENT ASSETS
CREATE TRIGGER trg_content_assets_updated_at BEFORE
UPDATE ON content_assets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
COMMIT;