BEGIN;
-- Add Google's unique account identifier.
ALTER TABLE users
ADD COLUMN google_id TEXT UNIQUE;
-- Allow Google-only users to have no local password.
ALTER TABLE users
ALTER COLUMN password_hash DROP NOT NULL;
-- Ensure every user has at least one authentication method.
ALTER TABLE users
ADD CONSTRAINT users_auth_method_check CHECK (
        password_hash IS NOT NULL
        OR google_id IS NOT NULL
    );
COMMIT;