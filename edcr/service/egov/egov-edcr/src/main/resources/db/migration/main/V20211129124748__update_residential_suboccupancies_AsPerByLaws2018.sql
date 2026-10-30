
-- Update Residential occupany name
UPDATE egbpa_sub_occupancy
SET name='Residential - Plotted',
    description='Residential - Plotted',
    year='2018', subyear='2018-01',
    lastmodifieddate=NOW()
WHERE code='A-R';