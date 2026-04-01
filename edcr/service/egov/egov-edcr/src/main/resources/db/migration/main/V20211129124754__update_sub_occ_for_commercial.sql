
UPDATE egbpa_sub_occupancy
SET code='F-F', colorcode=(SELECT id FROM egbpa_occupancy WHERE code='F'), 
name='Commercial',
    description='Commercial', year='2018', subyear='2018-01',
    lastmodifieddate=NOW()
WHERE colorcode=7;