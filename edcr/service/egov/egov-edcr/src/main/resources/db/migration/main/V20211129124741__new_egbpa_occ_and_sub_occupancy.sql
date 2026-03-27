
-- insert a occupancy into the DB for pertol pump
INSERT INTO egbpa_occupancy(id, code, name, isactive, version, createdby, createddate, lastmodifiedby,lastmodifieddate, maxcoverage, minfar, maxfar, ordernumber, description, colorcode)
VALUES (nextval('seq_egbpa_occupancy'), 'J', 'Petrol Pumps', 't', 0, 1, now(), 1,now(), 40, 1.5, 2.5, 24, 'Petrol Pumps', 13);

-- insert a occupancy into the DB for Hotel/Motel
INSERT INTO egbpa_occupancy(id, code, name, isactive, version, createdby, createddate, lastmodifiedby,lastmodifieddate, maxcoverage, minfar, maxfar, ordernumber, description, colorcode)
VALUES (nextval('seq_egbpa_occupancy'), 'K', 'Hotel/Motel', 't', 0, 1, now(), 1,now(), 40, 1.5, 2.5, 24, 'Hotel/Motel', 18);

-- insert a occupancy into the DB for Public Building
INSERT INTO egbpa_occupancy(id, code, name, isactive, version, createdby, createddate, lastmodifiedby,lastmodifieddate, maxcoverage, minfar, maxfar, ordernumber, description, colorcode)
VALUES (nextval('seq_egbpa_occupancy'), 'L', 'Public Building', 't', 0, 1, now(), 1,now(), 40, 1.5, 2.5, 24, 'Public Building', 29);

-- insert a occupancy into the DB for Marriage Palace
INSERT INTO egbpa_occupancy(id, code, name, isactive, version, createdby, createddate, lastmodifiedby,lastmodifieddate, maxcoverage, minfar, maxfar, ordernumber, description, colorcode)
VALUES (nextval('seq_egbpa_occupancy'), 'M', 'Marriage Palace', 't', 0, 1, now(), 1,now(), 40, 1.5, 2.5, 24, 'Marriage Palace', 30);


-- first update sub-Occupancy for the code 20 , 21, 18 ,30
update egbpa_sub_occupancy set colorcode=null, occupancy=36 where code='C-MOP';
update egbpa_sub_occupancy set colorcode=null, occupancy=36 where code='C-MA';
update egbpa_sub_occupancy set colorcode=null, occupancy=36 where code='F-PA';
update egbpa_sub_occupancy set colorcode=null, occupancy=36 where code='F-CB';
update egbpa_sub_occupancy set colorcode=20  where code='A-AF';


-- first update sub-Occupancy for the code 13
INSERT INTO egbpa_sub_occupancy(
    id, code, name, ordernumber, isactive, createdby, createddate, 
    lastmodifieddate, lastmodifiedby, version, description, maxcoverage, 
    minfar, maxfar, occupancy, colorcode
) VALUES
(nextval('seq_egbpa_sub_occupancy'), 'J-FS', 'Filling Station', (select max(ordernumber)+1 from egbpa_sub_occupancy), 
't', 1, now(), now(), 1, 0, 'Filling Station', 65, 0, 2, (select id from egbpa_occupancy where code='J'), 42);

INSERT INTO egbpa_sub_occupancy(

    id, code, name, ordernumber, isactive, createdby, createddate, 
    lastmodifieddate, lastmodifiedby, version, description, maxcoverage, 
    minfar, maxfar, occupancy, colorcode
) VALUES
(nextval('seq_egbpa_sub_occupancy'), 'J-FCSS', 'Filling Cum Service Station', (select max(ordernumber)+1 from egbpa_sub_occupancy), 
't', 1, now(), now(), 1, 0, 'Filling Cum Service Station', 65, 0, 2, (select id from egbpa_occupancy where code='J'), 44);

INSERT INTO egbpa_sub_occupancy(
    id, code, name, ordernumber, isactive, createdby, createddate, 
    lastmodifieddate, lastmodifiedby, version, description, maxcoverage, 
    minfar, maxfar, occupancy, colorcode
) VALUES
(nextval('seq_egbpa_sub_occupancy'), 'J-CNG', 'Compressed Natural Gas (CNG) Mother Station', (select max(ordernumber)+1 from egbpa_sub_occupancy), 
't', 1, now(), now(), 1, 0, 'Compressed Natural Gas (CNG) Mother Station', 65, 0, 2, 
(select id from egbpa_occupancy where code='J'), 45);

-- first update sub-Occupancy for the code Independent floor
INSERT INTO egbpa_sub_occupancy(
    id, code, name, ordernumber, isactive, createdby, createddate, 
    lastmodifieddate, lastmodifiedby, version, description, maxcoverage, 
    minfar, maxfar, occupancy, colorcode
) VALUES
(nextval('seq_egbpa_sub_occupancy'), 'A-AIF', 'Independent Floor', (select max(ordernumber)+1 from egbpa_sub_occupancy), 
't', 1, now(), now(), 1, 0, 'Independent Floor', 65, 0, 2, (select id from egbpa_occupancy where code='A'), 21);

INSERT INTO egbpa_sub_occupancy(
    id, code, name, ordernumber, isactive, createdby, createddate, 
    lastmodifieddate, lastmodifiedby, version, description, maxcoverage, 
    minfar, maxfar, occupancy, colorcode
) VALUES
(nextval('seq_egbpa_sub_occupancy'), 'K-HM', 'Hotel/Motel', (select max(ordernumber)+1 from egbpa_sub_occupancy), 
't', 1, now(), now(), 1, 0, 'Hotel/Motel', 65, 0, 2, (select id from egbpa_occupancy where code='K'), 18);

INSERT INTO egbpa_sub_occupancy(
    id, code, name, ordernumber, isactive, createdby, createddate, 
    lastmodifieddate, lastmodifiedby, version, description, maxcoverage, 
    minfar, maxfar, occupancy, colorcode
) VALUES
(nextval('seq_egbpa_sub_occupancy'), 'M-MP', 'Marriage Palace', (select max(ordernumber)+1 from egbpa_sub_occupancy), 
't', 1, now(), now(), 1, 0, 'Marriage Palace', 65, 0, 2, (select id from egbpa_occupancy where code='M'), 30);

INSERT INTO egbpa_sub_occupancy(
    id, code, name, ordernumber, isactive, createdby, createddate, 
    lastmodifieddate, lastmodifiedby, version, description, maxcoverage, 
    minfar, maxfar, occupancy, colorcode
) VALUES
(nextval('seq_egbpa_sub_occupancy'), 'L-GPB', 'General Public/Semi-public buildings', (select max(ordernumber)+1 from egbpa_sub_occupancy), 
't', 1, now(), now(), 1, 0, 'General Public/Semi-public buildings', 65, 0, 2, (select id from egbpa_occupancy where code='L'), 60);
============================================================
INSERT INTO egbpa_sub_occupancy(
    id, code, name, ordernumber, isactive, createdby, createddate, 
    lastmodifieddate, lastmodifiedby, version, description, maxcoverage, 
    minfar, maxfar, occupancy, colorcode
) VALUES
(nextval('seq_egbpa_sub_occupancy'), 'L-GO', 'Government Offices/Integrated Office Complex', (select max(ordernumber)+1 from egbpa_sub_occupancy), 
't', 1, now(), now(), 1, 0, 'Government Offices/Integrated Office Complex', 65, 0, 2, (select id from egbpa_occupancy where code='L'), 61);

INSERT INTO egbpa_sub_occupancy(
    id, code, name, ordernumber, isactive, createdby, createddate, 
    lastmodifieddate, lastmodifiedby, version, description, maxcoverage, 
    minfar, maxfar, occupancy, colorcode
) VALUES
(nextval('seq_egbpa_sub_occupancy'), 'L-EB-NS', 'Educational Buildings-Nursery School', (select max(ordernumber)+1 from egbpa_sub_occupancy), 
't', 1, now(), now(), 1, 0, 'Educational Buildings-Nursery School', 65, 0, 2, (select id from egbpa_occupancy where code='L'), 62);

INSERT INTO egbpa_sub_occupancy(
    id, code, name, ordernumber, isactive, createdby, createddate, 
    lastmodifieddate, lastmodifiedby, version, description, maxcoverage, 
    minfar, maxfar, occupancy, colorcode
) VALUES
(nextval('seq_egbpa_sub_occupancy'), 'L-EB-PS', 'Educational Buildings-Primary School', (select max(ordernumber)+1 from egbpa_sub_occupancy), 
't', 1, now(), now(), 1, 0, 'Educational Buildings-Primary School', 65, 0, 2, (select id from egbpa_occupancy where code='L'), 63);

INSERT INTO egbpa_sub_occupancy(
    id, code, name, ordernumber, isactive, createdby, createddate, 
    lastmodifieddate, lastmodifiedby, version, description, maxcoverage, 
    minfar, maxfar, occupancy, colorcode
) VALUES
(nextval('seq_egbpa_sub_occupancy'), 'L-EB-HSS', 'Educational Buildings-Higher Secondary School', (select max(ordernumber)+1 from egbpa_sub_occupancy), 
't', 1, now(), now(), 1, 0, 'Educational Buildings-Higher Secondary School', 65, 0, 2, (select id from egbpa_occupancy where code='L'), 64);

INSERT INTO egbpa_sub_occupancy(
    id, code, name, ordernumber, isactive, createdby, createddate, 
    lastmodifieddate, lastmodifiedby, version, description, maxcoverage, 
    minfar, maxfar, occupancy, colorcode
) VALUES
(nextval('seq_egbpa_sub_occupancy'), 'L-EB-C', 'Educational Buildings-College', (select max(ordernumber)+1 from egbpa_sub_occupancy), 
't', 1, now(), now(), 1, 0, 'Educational Buildings-College', 65, 0, 2, (select id from egbpa_occupancy where code='L'), 65);

INSERT INTO egbpa_sub_occupancy(
    id, code, name, ordernumber, isactive, createdby, createddate, 
    lastmodifieddate, lastmodifiedby, version, description, maxcoverage, 
    minfar, maxfar, occupancy, colorcode
) VALUES
(nextval('seq_egbpa_sub_occupancy'), 'L-E-RC', 'Education and Research Centre (Large Campus)', (select max(ordernumber)+1 from egbpa_sub_occupancy), 
't', 1, now(), now(), 1, 0, 'Education and Research Centre (Large Campus)', 65, 0, 2, (select id from egbpa_occupancy where code='L'), 66);

