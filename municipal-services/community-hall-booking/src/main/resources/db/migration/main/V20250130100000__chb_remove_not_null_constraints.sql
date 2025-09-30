-- Migration to remove NOT NULL constraints from redundant fields
-- These fields are not required from frontend and should be optional

-- Remove NOT NULL constraints from eg_chb_applicant_detail table
ALTER TABLE eg_chb_applicant_detail ALTER COLUMN account_no DROP NOT NULL;
ALTER TABLE eg_chb_applicant_detail ALTER COLUMN ifsc_code DROP NOT NULL;
ALTER TABLE eg_chb_applicant_detail ALTER COLUMN bank_name DROP NOT NULL;
ALTER TABLE eg_chb_applicant_detail ALTER COLUMN bank_branch_name DROP NOT NULL;
ALTER TABLE eg_chb_applicant_detail ALTER COLUMN account_holder_name DROP NOT NULL;

-- Remove NOT NULL constraints from eg_chb_address_detail table
ALTER TABLE eg_chb_address_detail ALTER COLUMN city DROP NOT NULL;
ALTER TABLE eg_chb_address_detail ALTER COLUMN city_code DROP NOT NULL;
ALTER TABLE eg_chb_address_detail ALTER COLUMN locality DROP NOT NULL;
ALTER TABLE eg_chb_address_detail ALTER COLUMN locality_code DROP NOT NULL;
ALTER TABLE eg_chb_address_detail ALTER COLUMN pincode DROP NOT NULL;