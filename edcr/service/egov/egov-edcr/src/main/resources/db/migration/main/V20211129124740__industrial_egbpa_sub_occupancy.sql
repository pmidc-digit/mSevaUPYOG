-- Added new Sub occupancy for Industrial
INSERT INTO egbpa_sub_occupancy(
    id, code, name, ordernumber, isactive, createdby, createddate, 
    lastmodifieddate, lastmodifiedby, version, description, maxcoverage, 
    minfar, maxfar, occupancy, colorcode
) VALUES
(nextval('seq_egbpa_sub_occupancy'), 'G-I', 'Industrial', (select max(ordernumber)+1 from egbpa_sub_occupancy), 't', 1, now(), now(), 1, 0, 'Industrial', 65, 0, 2, (select id from egbpa_occupancy where code='G'), 14);

INSERT INTO egbpa_sub_occupancy VALUES
(nextval('seq_egbpa_sub_occupancy'), 'G-F', 'Factory', (select max(ordernumber)+1 from egbpa_sub_occupancy), 't', 1, now(), now(), 1, 0, 'Factory', 65, 0, 2, (select id from egbpa_occupancy where code='G'), 31);

INSERT INTO egbpa_sub_occupancy VALUES
(nextval('seq_egbpa_sub_occupancy'), 'G-S', 'Storage', (select max(ordernumber)+1 from egbpa_sub_occupancy), 't', 1, now(), now(), 1, 0, 'Storage', 65, 0, 2, (select id from egbpa_occupancy where code='G'), 32);

INSERT INTO egbpa_sub_occupancy VALUES
(nextval('seq_egbpa_sub_occupancy'), 'G-H', 'Hazard Industries', (select max(ordernumber)+1 from egbpa_sub_occupancy), 't', 1, now(), now(), 1, 0, 'Hazard Industries', 65, 0, 2, (select id from egbpa_occupancy where code='G'), 33);

INSERT INTO egbpa_sub_occupancy VALUES
(nextval('seq_egbpa_sub_occupancy'), 'G-W', 'Warehouse', (select max(ordernumber)+1 from egbpa_sub_occupancy), 't', 1, now(), now(), 1, 0, 'Warehouse', 40, 0, 1.5, (select id from egbpa_occupancy where code='G'), 34);

INSERT INTO egbpa_sub_occupancy VALUES
(nextval('seq_egbpa_sub_occupancy'), 'G-RS', 'Retail Service Industry', (select max(ordernumber)+1 from egbpa_sub_occupancy), 't', 1, now(), now(), 1, 0, 'Retail Service Industry', 65, 0, 2, (select id from egbpa_occupancy where code='G'), 35);

INSERT INTO egbpa_sub_occupancy VALUES
(nextval('seq_egbpa_sub_occupancy'), 'G-GI', 'General Industry', (select max(ordernumber)+1 from egbpa_sub_occupancy), 't', 1, now(), now(), 1, 0, 'General Industry', 40, 0, 2, (select id from egbpa_occupancy where code='G'), 36);

INSERT INTO egbpa_sub_occupancy VALUES
(nextval('seq_egbpa_sub_occupancy'), 'G-IT', 'Information Technology', (select max(ordernumber)+1 from egbpa_sub_occupancy), 't', 1, now(), now(), 1, 0, 'Information Technology', 40, 0, 2.5, (select id from egbpa_occupancy where code='G'), 37);

INSERT INTO egbpa_sub_occupancy VALUES
(nextval('seq_egbpa_sub_occupancy'), 'G-T', 'Textile Industry', (select max(ordernumber)+1 from egbpa_sub_occupancy), 't', 1, now(), now(), 1, 0, 'Textile Industry', 65, 0, 2, (select id from egbpa_occupancy where code='G'), 38);

INSERT INTO egbpa_sub_occupancy VALUES
(nextval('seq_egbpa_sub_occupancy'), 'G-K', 'Knitwear Industry', (select max(ordernumber)+1 from egbpa_sub_occupancy), 't', 1, now(), now(), 1, 0, 'Knitwear Industry', 65, 0, 2, (select id from egbpa_occupancy where code='G'), 39);

INSERT INTO egbpa_sub_occupancy VALUES
(nextval('seq_egbpa_sub_occupancy'), 'G-SP', 'Sports Industry', (select max(ordernumber)+1 from egbpa_sub_occupancy), 't', 1, now(), now(), 1, 0, 'Sports Industry', 65, 0, 2, (select id from egbpa_occupancy where code='G'), 40);
