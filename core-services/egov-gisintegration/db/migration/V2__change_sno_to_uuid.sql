-- Migration script to change sno column to UUID in watertax and seweragetax tables

-- For watertax table
ALTER TABLE watertax DROP COLUMN sno CASCADE;
ALTER TABLE watertax ADD COLUMN sno UUID PRIMARY KEY DEFAULT gen_random_uuid();

-- For seweragetax table
ALTER TABLE seweragetax DROP COLUMN sno CASCADE;
ALTER TABLE seweragetax ADD COLUMN sno UUID PRIMARY KEY DEFAULT gen_random_uuid();

-- Note: gen_random_uuid() requires the pgcrypto extension enabled in PostgreSQL
-- Enable it if not already enabled:
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";
