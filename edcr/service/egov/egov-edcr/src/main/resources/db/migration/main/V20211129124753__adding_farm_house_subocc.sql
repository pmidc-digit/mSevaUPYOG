--updating existing sub-occ
UPDATE egbpa_sub_occupancy SET occupancy=(SELECT id FROM egbpa_occupancy WHERE code='X'), 
colorcode=NULL WHERE code IN ('D-BT');

INSERT INTO egbpa_sub_occupancy
(id, code, name, ordernumber, isactive, createdby, createddate,
 lastmodifieddate, lastmodifiedby, version, description,
 maxcoverage, minfar, maxfar, occupancy, colorcode, year, subyear)
VALUES
-- 1
(nextval('seq_egbpa_sub_occupancy'), 'A-FH',
 'Farmhouse',
 (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
 TRUE, 1, NOW(), NOW(), 1, 0,
 'Farmhouse',
 0, 0, 0, (SELECT id FROM egbpa_occupancy WHERE code='A'),
 22, '2018', '2018-01');