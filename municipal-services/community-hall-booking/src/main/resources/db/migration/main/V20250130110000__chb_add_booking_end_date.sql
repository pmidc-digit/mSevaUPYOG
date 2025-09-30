-- Migration to add booking_end_date column to slot detail tables
-- This column will store the end date for multi-day bookings

-- Add booking_end_date column to main table
ALTER TABLE eg_chb_slot_detail 
ADD COLUMN booking_end_date date;

-- Add booking_end_date column to audit table  
ALTER TABLE eg_chb_slot_detail_audit 
ADD COLUMN booking_end_date date;
