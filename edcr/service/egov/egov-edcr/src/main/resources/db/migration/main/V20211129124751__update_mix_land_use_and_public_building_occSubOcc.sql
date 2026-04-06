--updating existing sub-occ
UPDATE egbpa_sub_occupancy SET occupancy=(SELECT id FROM egbpa_occupancy WHERE code='X'), 
colorcode=NULL WHERE code IN ('A-HE','C-MIP','M-MP','L-GPB');


-- Updating Mix land use Sub Occupancies
INSERT INTO egbpa_occupancy(id, code, name, isactive, version, createdby, createddate, lastmodifiedby,
lastmodifieddate, maxcoverage, minfar, maxfar, ordernumber, description, colorcode, year, subyear)
VALUES (nextval('seq_egbpa_occupancy'), 'R', 'Mixed Land Use', 't', 0, 1, now(), 1,now(), 
40, 1.5, 2.5, 24, 'Mixed Land Use', 19, '2018', '2018-01');


INSERT INTO egbpa_sub_occupancy
(id, code, name, ordernumber, isactive, createdby, createddate,
 lastmodifieddate, lastmodifiedby, version, description,
 maxcoverage, minfar, maxfar, occupancy, colorcode, year, subyear)
VALUES
-- 1
(nextval('seq_egbpa_sub_occupancy'), 'R-R',
 'Mixed Land Use',
 (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
 TRUE, 1, NOW(), NOW(), 1, 0,
 'Mixed Land Use',
 0, 0, 0, (SELECT id FROM egbpa_occupancy WHERE code='R'),
 29, '2018', '2018-01');
 
-- Updating Public / Semi-Public Building Sub Occupancies

INSERT INTO egbpa_sub_occupancy
(id, code, name, ordernumber, isactive, createdby, createddate,
 lastmodifieddate, lastmodifiedby, version, description,
 maxcoverage, minfar, maxfar, occupancy, colorcode, year, subyear)
VALUES
-- 1
(nextval('seq_egbpa_sub_occupancy'), 'L-GP',
 'General Public / Semi-public buildings',
 (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
 TRUE, 1, NOW(), NOW(), 1, 0,
 'General Public / Semi-public buildings',
 0, 0, 0, (SELECT id FROM egbpa_occupancy WHERE code='L'),
 29, '2018', '2018-01'),

-- 2
(nextval('seq_egbpa_sub_occupancy'), 'L-GO',
 'Government offices - Integrated office complex buildings',
 (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
 TRUE, 1, NOW(), NOW(), 1, 0,
 'Government offices - Integrated office complex buildings',
 0, 0, 0, (SELECT id FROM egbpa_occupancy WHERE code='L'),
 60, '2018', '2018-01'),
-- 3
(nextval('seq_egbpa_sub_occupancy'), 'L-NS',
 'Educational (Nursery School)',
 (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
 TRUE, 1, NOW(), NOW(), 1, 0,
 'Educational (Nursery School)',
 0, 0, 0, (SELECT id FROM egbpa_occupancy WHERE code='L'),
 51, '2018', '2018-01'),
-- 4
(nextval('seq_egbpa_sub_occupancy'), 'L-PS',
 'Educational (Primary School)',
 (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
 TRUE, 1, NOW(), NOW(), 1, 0,
 'Educational (Primary School)',
 0, 0, 0, (SELECT id FROM egbpa_occupancy WHERE code='L'),
 52, '2018', '2018-01'),

-- 5
(nextval('seq_egbpa_sub_occupancy'), 'L-CO',
 'Educational (College)',
 (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
 TRUE, 1, NOW(), NOW(), 1, 0,
 'Educational (College)',
 0, 0, 0, (SELECT id FROM egbpa_occupancy WHERE code='L'),
 53, '2018', '2018-01'),

-- 6
(nextval('seq_egbpa_sub_occupancy'), 'L-ERC',
 'Education and Research Centre (large campus i.e. above 8 Ha./19.75 acres)',
 (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
 TRUE, 1, NOW(), NOW(), 1, 0,
 'Education and Research Centre (large campus i.e. above 8 Ha./19.75 acres)',
 0, 0, 0, (SELECT id FROM egbpa_occupancy WHERE code='L'),
 54, '2018', '2018-01'),

-- 7
(nextval('seq_egbpa_sub_occupancy'), 'L-MP',
 'Marriage Palace',
 (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
 TRUE, 1, NOW(), NOW(), 1, 0,
 'Marriage Palace',
 0, 0, 0, (SELECT id FROM egbpa_occupancy WHERE code='L'),
 30, '2018', '2018-01'),

-- 8
(nextval('seq_egbpa_sub_occupancy'), 'L-NH',
 'Nursing Home / Hospital',
 (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
 TRUE, 1, NOW(), NOW(), 1, 0,
 'Nursing Home / Hospital',
 0, 0, 0, (SELECT id FROM egbpa_occupancy WHERE code='L'),
 56, '2018', '2018-01'),
 
-- 9
(nextval('seq_egbpa_sub_occupancy'), 'L-C',
 'Creche / Day Care facilities',
 (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
 TRUE, 1, NOW(), NOW(), 1, 0,
 'Creche / Day Care facilities',
 0, 0, 0, (SELECT id FROM egbpa_occupancy WHERE code='L'),
 50, '2018', '2018-01');
