BEGIN;
-- Stores individual authenticated user sessions
CREATE TABLE auth_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Quickly find sessions belonging to a user
CREATE INDEX idx_auth_sessions_user_id ON auth_sessions(user_id);
-- Quickly find active sessions by expiration
CREATE INDEX idx_auth_sessions_expires_at ON auth_sessions(expires_at);
COMMIT;