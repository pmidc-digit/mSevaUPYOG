
-- setting occ and sub occ for commercials
UPDATE egbpa_sub_occupancy SET occupancy=(SELECT id FROM egbpa_occupancy WHERE code='X'), 
colorcode=NULL WHERE code IN ('F-PP','F-H','F-K','F-RT','F-LD','F-IT');

INSERT INTO egbpa_sub_occupancy (id,code,name,ordernumber,isactive,createdby,createddate,lastmodifieddate,
lastmodifiedby,version,description,maxcoverage,minfar,maxfar,occupancy,colorcode)
VALUES (nextval('seq_egbpa_sub_occupancy'),'F-SCC','Shopping Complex/Center',
(SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
        TRUE,1,NOW(),NOW(),1,0,'Shopping Complex/Center',
        0,0,0,(SELECT id FROM egbpa_occupancy WHERE code='F'),35);
        
INSERT INTO egbpa_sub_occupancy (id,code,name,ordernumber,isactive,createdby,createddate,lastmodifieddate,
lastmodifiedby,version,description,maxcoverage,minfar,maxfar,occupancy,colorcode)
VALUES (nextval('seq_egbpa_sub_occupancy'),'SCO/SCF','SCO/SCF',
(SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
        TRUE,1,NOW(),NOW(),1,0,'SCO/SCF',
        0,0,0,(SELECT id FROM egbpa_occupancy WHERE code='F'),36);
        
INSERT INTO egbpa_sub_occupancy (id,code,name,ordernumber,isactive,createdby,createddate,lastmodifieddate,
lastmodifiedby,version,description,maxcoverage,minfar,maxfar,occupancy,colorcode)
VALUES (nextval('seq_egbpa_sub_occupancy'),'F-BTH','Booth',
(SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
        TRUE,1,NOW(),NOW(),1,0,'Booth',
        0,0,0,(SELECT id FROM egbpa_occupancy WHERE code='F'),37);
        
INSERT INTO egbpa_sub_occupancy (id,code,name,ordernumber,isactive,createdby,createddate,lastmodifieddate,
lastmodifiedby,version,description,maxcoverage,minfar,maxfar,occupancy,colorcode)
VALUES (nextval('seq_egbpa_sub_occupancy'),'F-DBTH','Double storey Booth',
(SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
        TRUE,1,NOW(),NOW(),1,0,'Double storey Booth',
        0,0,0,(SELECT id FROM egbpa_occupancy WHERE code='F'),38);
        
        
INSERT INTO egbpa_sub_occupancy (id,code,name,ordernumber,isactive,createdby,createddate,lastmodifieddate,
lastmodifiedby,version,description,maxcoverage,minfar,maxfar,occupancy,colorcode)
VALUES (nextval('seq_egbpa_sub_occupancy'),'F-SSTY','Shops (1/2/3 Storey)',
(SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
        TRUE,1,NOW(),NOW(),1,0,'Shops (1/2/3 Storey)',
        0,0,0,(SELECT id FROM egbpa_occupancy WHERE code='F'),39);
        
        
INSERT INTO egbpa_sub_occupancy (id,code,name,ordernumber,isactive,createdby,createddate,lastmodifieddate,
lastmodifiedby,version,description,maxcoverage,minfar,maxfar,occupancy,colorcode)
VALUES (nextval('seq_egbpa_sub_occupancy'),'F-GBA','Goods Booking Agencies',
(SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
        TRUE,1,NOW(),NOW(),1,0,'Goods Booking Agencies',
        0,0,0,(SELECT id FROM egbpa_occupancy WHERE code='F'),40);
        
INSERT INTO egbpa_sub_occupancy (id,code,name,ordernumber,isactive,createdby,createddate,lastmodifieddate,
lastmodifiedby,version,description,maxcoverage,minfar,maxfar,occupancy,colorcode)
VALUES (nextval('seq_egbpa_sub_occupancy'),'F-SC','Scheme Commercial',
(SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
        TRUE,1,NOW(),NOW(),1,0,'Scheme Commercial',
        0,0,0,(SELECT id FROM egbpa_occupancy WHERE code='F'),41);
        