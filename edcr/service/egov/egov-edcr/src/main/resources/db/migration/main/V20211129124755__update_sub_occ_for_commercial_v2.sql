
UPDATE egbpa_sub_occupancy
SET code='F-F', colorcode=7, 
name='Commercial',
    description='Commercial', year='2018', subyear='2018-01',
    lastmodifieddate=NOW()
WHERE colorcode=34 and code='F-F';