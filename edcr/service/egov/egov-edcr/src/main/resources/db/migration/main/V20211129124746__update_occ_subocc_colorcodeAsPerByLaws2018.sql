-- add new column year and subYear 
-- for table occupancy and subOccupancy

ALTER TABLE egbpa_occupancy
ADD COLUMN IF NOT EXISTS "year" VARCHAR(50),
ADD COLUMN IF NOT EXISTS "subYear" VARCHAR(50);


ALTER TABLE egbpa_sub_occupancy
ADD COLUMN IF NOT EXISTS "year" VARCHAR(50),
ADD COLUMN IF NOT EXISTS "subYear" VARCHAR(50);

