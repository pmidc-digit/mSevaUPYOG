-- Free-form JSONB bag on the booking header so any extra key can be stored
-- (payment gateway refs, frontend metadata, ULB specific fields, ...) without
-- a schema change.
--
-- NOTE: eg_adv_booking_detail_audit is populated with "INSERT ... SELECT *",
-- so the new column must be appended LAST on BOTH tables to keep the column
-- order of the two tables identical.

ALTER TABLE public.eg_adv_booking_detail
ADD COLUMN IF NOT EXISTS additionaldetails JSONB;

ALTER TABLE public.eg_adv_booking_detail_audit
ADD COLUMN IF NOT EXISTS additionaldetails JSONB;

-- Allows efficient lookups on arbitrary keys inside the JSONB bag
-- e.g. additionaldetails @> '{"gatewayTxnId":"ABC"}'
CREATE INDEX IF NOT EXISTS idx_eg_adv_booking_detail_additionaldetails
ON public.eg_adv_booking_detail USING GIN (additionaldetails);
