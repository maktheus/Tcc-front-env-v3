-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- Convert time_series into a hypertable partitioned by time
SELECT create_hypertable('time_series', 'time', if_not_exists => TRUE);

-- Index for fast per-run time range queries
CREATE INDEX IF NOT EXISTS idx_time_series_run_time ON time_series (run_id, time DESC);
