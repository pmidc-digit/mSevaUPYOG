UPDATE egbpa_sub_occupancy
SET colorcode = NULL, occupancy=(SELECT id FROM egbpa_occupancy WHERE code='X'), lastmodifieddate = now()
WHERE colorcode BETWEEN 64 AND 80;

INSERT INTO egbpa_sub_occupancy (id,code,name,ordernumber,isactive,createdby,createddate,lastmodifieddate,
                                 lastmodifiedby,version,description,maxcoverage,minfar,maxfar,occupancy,colorcode)
VALUES (nextval('seq_egbpa_sub_occupancy'),'F-RS','Retail Shops',
        (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
        TRUE,1,NOW(),NOW(),1,0,'Retail Shops',
        0,0,0,(SELECT id FROM egbpa_occupancy WHERE code='F'),64);

INSERT INTO egbpa_sub_occupancy (id,code,name,ordernumber,isactive,createdby,createddate,lastmodifieddate,
                                 lastmodifiedby,version,description,maxcoverage,minfar,maxfar,occupancy,colorcode)
VALUES (nextval('seq_egbpa_sub_occupancy'),'F-R','Restaurants',
        (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
        TRUE,1,NOW(),NOW(),1,0,'Restaurants',
        0,0,0,(SELECT id FROM egbpa_occupancy WHERE code='F'),65);

INSERT INTO egbpa_sub_occupancy (id,code,name,ordernumber,isactive,createdby,createddate,lastmodifieddate,
                                 lastmodifiedby,version,description,maxcoverage,minfar,maxfar,occupancy,colorcode)
VALUES (nextval('seq_egbpa_sub_occupancy'),'F-FP','Food Plazas',
        (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
        TRUE,1,NOW(),NOW(),1,0,'Food Plazas',
        0,0,0,(SELECT id FROM egbpa_occupancy WHERE code='F'),66);

INSERT INTO egbpa_sub_occupancy (id,code,name,ordernumber,isactive,createdby,createddate,lastmodifieddate,
                                 lastmodifiedby,version,description,maxcoverage,minfar,maxfar,occupancy,colorcode)
VALUES (nextval('seq_egbpa_sub_occupancy'),'F-FC','Fitness Center',
        (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
        TRUE,1,NOW(),NOW(),1,0,'Fitness Center',
        0,0,0,(SELECT id FROM egbpa_occupancy WHERE code='F'),67);

INSERT INTO egbpa_sub_occupancy (id,code,name,ordernumber,isactive,createdby,createddate,lastmodifieddate,
                                 lastmodifiedby,version,description,maxcoverage,minfar,maxfar,occupancy,colorcode)
VALUES (nextval('seq_egbpa_sub_occupancy'),'F-CC','Call Center',
        (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
        TRUE,1,NOW(),NOW(),1,0,'Call Center',
        0,0,0,(SELECT id FROM egbpa_occupancy WHERE code='F'),68);

INSERT INTO egbpa_sub_occupancy (id,code,name,ordernumber,isactive,createdby,createddate,lastmodifieddate,
                                 lastmodifiedby,version,description,maxcoverage,minfar,maxfar,occupancy,colorcode)
VALUES (nextval('seq_egbpa_sub_occupancy'),'F-CO','Corporate Offices',
        (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
        TRUE,1,NOW(),NOW(),1,0,'Corporate Offices',
        0,0,0,(SELECT id FROM egbpa_occupancy WHERE code='F'),69);

INSERT INTO egbpa_sub_occupancy (id,code,name,ordernumber,isactive,createdby,createddate,lastmodifieddate,
                                 lastmodifiedby,version,description,maxcoverage,minfar,maxfar,occupancy,colorcode)
VALUES (nextval('seq_egbpa_sub_occupancy'),'F-B','Bank',
        (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
        TRUE,1,NOW(),NOW(),1,0,'Bank',
        0,0,0,(SELECT id FROM egbpa_occupancy WHERE code='F'),70);

INSERT INTO egbpa_sub_occupancy (id,code,name,ordernumber,isactive,createdby,createddate,lastmodifieddate,
                                 lastmodifiedby,version,description,maxcoverage,minfar,maxfar,occupancy,colorcode)
VALUES (nextval('seq_egbpa_sub_occupancy'),'F-DS','Departmental Store',
        (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
        TRUE,1,NOW(),NOW(),1,0,'Departmental Store',
        0,0,0,(SELECT id FROM egbpa_occupancy WHERE code='F'),71);

INSERT INTO egbpa_sub_occupancy (id,code,name,ordernumber,isactive,createdby,createddate,lastmodifieddate,
                                 lastmodifiedby,version,description,maxcoverage,minfar,maxfar,occupancy,colorcode)
VALUES (nextval('seq_egbpa_sub_occupancy'),'F-BS','Bank Services',
        (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
        TRUE,1,NOW(),NOW(),1,0,'Bank Services',
        0,0,0,(SELECT id FROM egbpa_occupancy WHERE code='F'),72);

INSERT INTO egbpa_sub_occupancy (id,code,name,ordernumber,isactive,createdby,createddate,lastmodifieddate,
                                 lastmodifiedby,version,description,maxcoverage,minfar,maxfar,occupancy,colorcode)
VALUES (nextval('seq_egbpa_sub_occupancy'),'F-BO','Business Office',
        (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
        TRUE,1,NOW(),NOW(),1,0,'Business Office',
        0,0,0,(SELECT id FROM egbpa_occupancy WHERE code='F'),73);

INSERT INTO egbpa_sub_occupancy (id,code,name,ordernumber,isactive,createdby,createddate,lastmodifieddate,
                                 lastmodifiedby,version,description,maxcoverage,minfar,maxfar,occupancy,colorcode)
VALUES (nextval('seq_egbpa_sub_occupancy'),'F-IT','IT Office',
        (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
        TRUE,1,NOW(),NOW(),1,0,'IT Office',
        0,0,0,(SELECT id FROM egbpa_occupancy WHERE code='F'),74);

INSERT INTO egbpa_sub_occupancy (id,code,name,ordernumber,isactive,createdby,createddate,lastmodifieddate,
                                 lastmodifiedby,version,description,maxcoverage,minfar,maxfar,occupancy,colorcode)
VALUES (nextval('seq_egbpa_sub_occupancy'),'F-O','Office',
        (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
        TRUE,1,NOW(),NOW(),1,0,'Office',
        0,0,0,(SELECT id FROM egbpa_occupancy WHERE code='F'),75);

INSERT INTO egbpa_sub_occupancy (id,code,name,ordernumber,isactive,createdby,createddate,lastmodifieddate,
                                 lastmodifiedby,version,description,maxcoverage,minfar,maxfar,occupancy,colorcode)
VALUES (nextval('seq_egbpa_sub_occupancy'),'F-S','Shop',
        (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
        TRUE,1,NOW(),NOW(),1,0,'Shop',
        0,0,0,(SELECT id FROM egbpa_occupancy WHERE code='F'),76);

INSERT INTO egbpa_sub_occupancy (id,code,name,ordernumber,isactive,createdby,createddate,lastmodifieddate,
                                 lastmodifiedby,version,description,maxcoverage,minfar,maxfar,occupancy,colorcode)
VALUES (nextval('seq_egbpa_sub_occupancy'),'F-SM','Super Market',
        (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
        TRUE,1,NOW(),NOW(),1,0,'Super Market',
        0,0,0,(SELECT id FROM egbpa_occupancy WHERE code='F'),77);

INSERT INTO egbpa_sub_occupancy (id,code,name,ordernumber,isactive,createdby,createddate,lastmodifieddate,
                                 lastmodifiedby,version,description,maxcoverage,minfar,maxfar,occupancy,colorcode)
VALUES (nextval('seq_egbpa_sub_occupancy'),'F-WS','Wholesale Stores',
        (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
        TRUE,1,NOW(),NOW(),1,0,'Wholesale Stores',
        0,0,0,(SELECT id FROM egbpa_occupancy WHERE code='F'),78);

INSERT INTO egbpa_sub_occupancy (id,code,name,ordernumber,isactive,createdby,createddate,lastmodifieddate,
                                 lastmodifiedby,version,description,maxcoverage,minfar,maxfar,occupancy,colorcode)
VALUES (nextval('seq_egbpa_sub_occupancy'),'F-M','Mercantile',
        (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
        TRUE,1,NOW(),NOW(),1,0,'Mercantile',
        0,0,0,(SELECT id FROM egbpa_occupancy WHERE code='F'),79);

INSERT INTO egbpa_sub_occupancy (id,code,name,ordernumber,isactive,createdby,createddate,lastmodifieddate,
                                 lastmodifiedby,version,description,maxcoverage,minfar,maxfar,occupancy,colorcode)
VALUES (nextval('seq_egbpa_sub_occupancy'),'F-SRM','Showroom',
        (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
        TRUE,1,NOW(),NOW(),1,0,'Showroom',
        0,0,0,(SELECT id FROM egbpa_occupancy WHERE code='F'),80);