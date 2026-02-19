-- RUMAD API Platform Database Schema
-- Version 1.0.0

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  api_key TEXT NOT NULL UNIQUE,
  tier TEXT NOT NULL DEFAULT 'free',
  scopes TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked BOOLEAN NOT NULL DEFAULT false,
  last_used_at TIMESTAMPTZ,
  CONSTRAINT valid_tier CHECK (tier IN ('free', 'basic', 'pro', 'enterprise'))
);

-- Create index on api_key for fast lookups
CREATE INDEX idx_api_keys_key ON api_keys(api_key) WHERE NOT revoked;
CREATE INDEX idx_api_keys_email ON api_keys(user_email);

-- Usage counters table for rate limiting and analytics
CREATE TABLE IF NOT EXISTS usage_counters (
  api_key TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  route TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(api_key, window_start, route)
);

-- Create index for time-based queries
CREATE INDEX idx_usage_counters_window ON usage_counters(window_start);
CREATE INDEX idx_usage_counters_route ON usage_counters(route);

-- Request logs table (optional, for analytics)
CREATE TABLE IF NOT EXISTS request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT NOT NULL UNIQUE,
  api_key TEXT,
  route TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  latency_ms INTEGER,
  ip_address INET,
  user_agent TEXT,
  cached BOOLEAN DEFAULT false,
  error_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_request_logs_api_key ON request_logs(api_key);
CREATE INDEX idx_request_logs_route ON request_logs(route);
CREATE INDEX idx_request_logs_created ON request_logs(created_at DESC);
CREATE INDEX idx_request_logs_status ON request_logs(status_code);

-- Seed some demo API keys
INSERT INTO api_keys (user_email, api_key, tier, scopes) VALUES
  ('demo@rumad.club', 'demo_key_12345', 'free', ARRAY['quotes', 'weather', 'crypto']),
  ('test@rumad.club', 'test_key_67890', 'basic', ARRAY['quotes', 'weather', 'crypto', 'news']),
  ('admin@rumad.club', 'admin_key_abcde', 'pro', ARRAY['*'])
ON CONFLICT (api_key) DO NOTHING;

-- Function to clean up old usage counters (older than 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_usage_counters() 
RETURNS void AS $$
BEGIN
  DELETE FROM usage_counters WHERE window_start < NOW() - INTERVAL '7 days';
  DELETE FROM request_logs WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to run cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-usage', '0 2 * * *', 'SELECT cleanup_old_usage_counters()');

COMMENT ON TABLE api_keys IS 'Stores API keys and their associated metadata';
COMMENT ON TABLE usage_counters IS 'Tracks API usage per key, route, and time window';
COMMENT ON TABLE request_logs IS 'Detailed request logs for analytics and debugging';
