-- Add root-level comments to survey response
ALTER TABLE public.eg_ss_survey_response
ADD COLUMN comments VARCHAR(1000);
