-- Add unit_id column to eg_gc_connection table to support unit-based garbage collection
ALTER TABLE eg_gc_connection
    ADD COLUMN IF NOT EXISTS unit_id VARCHAR(64);

-- Add index for efficient queries by unit_id
CREATE INDEX IF NOT EXISTS index_eg_gc_connection_unit_id ON public.eg_gc_connection USING btree (unit_id);

-- Add composite index for property_id + unit_id for faster duplicate checks
CREATE INDEX IF NOT EXISTS index_eg_gc_connection_property_unit ON public.eg_gc_connection USING btree (property_id, unit_id);

-- Add unit_id to audit table
ALTER TABLE eg_gc_connection_audit
    ADD COLUMN IF NOT EXISTS unit_id VARCHAR(64);
