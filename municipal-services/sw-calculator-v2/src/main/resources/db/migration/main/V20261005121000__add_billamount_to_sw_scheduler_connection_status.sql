ALTER TABLE eg_sw_bill_scheduler_connection_status ADD COLUMN IF NOT EXISTS billamount NUMERIC(15,2) DEFAULT 0;
