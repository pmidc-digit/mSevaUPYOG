-- Add billamount column to eg_ws_bill_scheduler_connection_status
-- Stores the total bill amount from the bill generation response for successful records.
ALTER TABLE eg_ws_bill_scheduler_connection_status
    ADD COLUMN IF NOT EXISTS billamount NUMERIC(15,2) DEFAULT 0;
