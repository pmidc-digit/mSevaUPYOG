
--updating existing sub-occ
UPDATE egbpa_sub_occupancy SET occupancy=(SELECT id FROM egbpa_occupancy WHERE code='X'), 
colorcode=NULL WHERE code IN ('G-F','G-IT','G-GTKS');

-- updating industry sub_occupancy
INSERT INTO egbpa_sub_occupancy
(id, code, name, ordernumber, isactive, createdby, createddate,
 lastmodifieddate, lastmodifiedby, version, description,
 maxcoverage, minfar, maxfar, occupancy, colorcode, year, subyear)
VALUES
(nextval('seq_egbpa_sub_occupancy'), 'G',
 'Industrial',
 (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
 TRUE, 1, NOW(), NOW(), 1, 0,
 'Industrial',
 0, 0, 0, (SELECT id FROM egbpa_occupancy WHERE code='G'),
 14, '2018', '2018-01');
 
 -- Factory
INSERT INTO egbpa_sub_occupancy
(id, code, name, ordernumber, isactive, createdby, createddate,
 lastmodifieddate, lastmodifiedby, version, description,
 maxcoverage, minfar, maxfar, occupancy, colorcode, year, subyear)
VALUES
(nextval('seq_egbpa_sub_occupancy'), 'G-F',
 'Factory',
 (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
 TRUE, 1, NOW(), NOW(), 1, 0,
 'Factory',
 0, 0, 0, (SELECT id FROM egbpa_occupancy WHERE code='G'),
 31, '2018', '2018-01');


-- Storage
INSERT INTO egbpa_sub_occupancy
VALUES
(nextval('seq_egbpa_sub_occupancy'), 'G-S',
 'Storage',
 (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
 TRUE, 1, NOW(), NOW(), 1, 0,
 'Storage',
 0, 0, 0, (SELECT id FROM egbpa_occupancy WHERE code='G'),
 32, '2018', '2018-01');


-- Hazard Industries
INSERT INTO egbpa_sub_occupancy
VALUES
(nextval('seq_egbpa_sub_occupancy'), 'G-HI',
 'Hazard Industries',
 (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
 TRUE, 1, NOW(), NOW(), 1, 0,
 'Hazard Industries',
 0, 0, 0, (SELECT id FROM egbpa_occupancy WHERE code='G'),
 33, '2018', '2018-01');


-- Wholesale Trade / Ware House / Integrated Freight Complex (Standalone)
INSERT INTO egbpa_sub_occupancy
VALUES
(nextval('seq_egbpa_sub_occupancy'), 'G-WT',
 'Wholesale Trade / Ware House / Integrated Freight Complex (Standalone)',
 (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
 TRUE, 1, NOW(), NOW(), 1, 0,
 'Wholesale Trade / Ware House / Integrated Freight Complex (Standalone)',
 0, 0, 0, (SELECT id FROM egbpa_occupancy WHERE code='G'),
 15, '2018', '2018-01');


-- Retail Service Industry
INSERT INTO egbpa_sub_occupancy
VALUES
(nextval('seq_egbpa_sub_occupancy'), 'G-RSI',
 'Retail Service Industry',
 (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
 TRUE, 1, NOW(), NOW(), 1, 0,
 'Retail Service Industry',
 0, 0, 0, (SELECT id FROM egbpa_occupancy WHERE code='G'),
 34, '2018', '2018-01');


-- General Industry - Industry Plotted
INSERT INTO egbpa_sub_occupancy
VALUES
(nextval('seq_egbpa_sub_occupancy'), 'G-GIP',
 'General Industry - Industry Plotted',
 (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
 TRUE, 1, NOW(), NOW(), 1, 0,
 'General Industry - Industry Plotted',
 0, 0, 0, (SELECT id FROM egbpa_occupancy WHERE code='G'),
 36, '2018', '2018-01');


-- General Industry Flatted
INSERT INTO egbpa_sub_occupancy
VALUES
(nextval('seq_egbpa_sub_occupancy'), 'G-GIF',
 'General Industry Flatted',
 (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
 TRUE, 1, NOW(), NOW(), 1, 0,
 'General Industry Flatted',
 0, 0, 0, (SELECT id FROM egbpa_occupancy WHERE code='G'),
 46, '2018', '2018-01');


-- Informational Technology - Industry Plotted
INSERT INTO egbpa_sub_occupancy
VALUES
(nextval('seq_egbpa_sub_occupancy'), 'G-ITP',
 'Informational Technology - Industry Plotted',
 (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
 TRUE, 1, NOW(), NOW(), 1, 0,
 'Informational Technology - Industry Plotted',
 0, 0, 0, (SELECT id FROM egbpa_occupancy WHERE code='G'),
 48, '2018', '2018-01');


-- Informational Technology - Flatted
INSERT INTO egbpa_sub_occupancy
VALUES
(nextval('seq_egbpa_sub_occupancy'), 'G-ITF',
 'Informational Technology - Flatted',
 (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
 TRUE, 1, NOW(), NOW(), 1, 0,
 'Informational Technology - Flatted',
 0, 0, 0, (SELECT id FROM egbpa_occupancy WHERE code='G'),
 47, '2018', '2018-01');


-- Textile Industry
INSERT INTO egbpa_sub_occupancy
VALUES
(nextval('seq_egbpa_sub_occupancy'), 'G-TI',
 'Textile Industry',
 (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
 TRUE, 1, NOW(), NOW(), 1, 0,
 'Textile Industry',
 0, 0, 0, (SELECT id FROM egbpa_occupancy WHERE code='G'),
 38, '2018', '2018-01');


-- Knitwear Industry
INSERT INTO egbpa_sub_occupancy
VALUES
(nextval('seq_egbpa_sub_occupancy'), 'G-KI',
 'Knitwear Industry',
 (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
 TRUE, 1, NOW(), NOW(), 1, 0,
 'Knitwear Industry',
 0, 0, 0, (SELECT id FROM egbpa_occupancy WHERE code='G'),
 39, '2018', '2018-01');


-- Sports Industry
INSERT INTO egbpa_sub_occupancy
VALUES
(nextval('seq_egbpa_sub_occupancy'), 'G-SI',
 'Sports Industry',
 (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
 TRUE, 1, NOW(), NOW(), 1, 0,
 'Sports Industry',
 0, 0, 0, (SELECT id FROM egbpa_occupancy WHERE code='G'),
 40, '2018', '2018-01');
