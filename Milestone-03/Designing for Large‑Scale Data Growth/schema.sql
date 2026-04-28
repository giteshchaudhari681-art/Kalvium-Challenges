-- TrackFlow Schema
-- Initial schema for event tracking and user sessions

-- Core users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    plan VARCHAR(20) DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table to track user activity periods
CREATE TABLE sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER
);

-- Main events table for all user interactions
CREATE TABLE events (
    id BIGSERIAL NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    session_id BIGINT REFERENCES sessions(id),
    event_type VARCHAR(50) NOT NULL,
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (created_at, id)
) PARTITION BY RANGE (created_at);

CREATE TABLE events_2026_04 PARTITION OF events
    FOR VALUES FROM ('2026-04-01 00:00:00+00') TO ('2026-05-01 00:00:00+00');

CREATE TABLE events_2026_05 PARTITION OF events
    FOR VALUES FROM ('2026-05-01 00:00:00+00') TO ('2026-06-01 00:00:00+00');

CREATE TABLE events_2026_06 PARTITION OF events
    FOR VALUES FROM ('2026-06-01 00:00:00+00') TO ('2026-07-01 00:00:00+00');

-- Keeps inserts working if a future monthly partition is not created yet.
CREATE TABLE events_default PARTITION OF events DEFAULT;

CREATE INDEX idx_events_user_created_at ON events (user_id, created_at DESC);
CREATE INDEX idx_events_created_at_event_type ON events (created_at, event_type);

-- Cold storage table for raw events retained for compliance and audits.
CREATE TABLE events_archive (
    id BIGINT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    session_id BIGINT REFERENCES sessions(id),
    event_type VARCHAR(50) NOT NULL,
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL,
    archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_archive_user_created_at
    ON events_archive (user_id, created_at DESC);

CREATE INDEX idx_events_archive_created_at
    ON events_archive (created_at);

-- Feature usage tracking for internal analytics
CREATE TABLE feature_usage (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    feature_name VARCHAR(100) NOT NULL,
    used_at TIMESTAMPTZ DEFAULT NOW(),
    count INTEGER DEFAULT 1
);

CREATE INDEX idx_sessions_active
    ON sessions (started_at DESC)
    WHERE ended_at IS NULL;

CREATE INDEX idx_feature_usage_user_used_at
    ON feature_usage (user_id, used_at DESC);
