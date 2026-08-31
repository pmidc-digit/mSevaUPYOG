-- Add consentdocument column to eg_ptr_registration table for storing filestore ID of consent document
ALTER TABLE eg_ptr_registration
ADD COLUMN IF NOT EXISTS consentdocument character varying(64);
