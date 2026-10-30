
-- Update commercial occupany name
UPDATE egbpa_occupancy
SET name='Commercial',
    description='Commercial',
    year='2018', subyear='2018-01',
    lastmodifieddate=NOW()
WHERE code='F';