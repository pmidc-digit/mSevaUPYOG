INSERT INTO egbpa_occupancy (id,code,name,isactive,version,createdby,createddate,lastmodifiedby,lastmodifieddate,maxcoverage,minfar,maxfar,ordernumber,description,colorcode)
VALUES (nextval('seq_egbpa_occupancy'),'X','Other Category',TRUE,0,1,NOW(),
        1,NOW(),0,0,0,0,'Other Category',15);

UPDATE egbpa_sub_occupancy SET occupancy=(SELECT id FROM egbpa_occupancy WHERE code='X'), colorcode=NULL WHERE code IN ('G-LI','G-SI','G-PHI','G-NPHI','G-I','G-F','G-S','G-H','G-W','G-RS','G-GI','G-IT','G-T','G-K','G-SP');

INSERT INTO egbpa_sub_occupancy (id,code,name,ordernumber,isactive,createdby,createddate,lastmodifieddate,lastmodifiedby,version,description,maxcoverage,minfar,maxfar,occupancy,colorcode)
VALUES (nextval('seq_egbpa_sub_occupancy'),'G-GTKS','Industrial Plotted - General, Textile, Knitwear, Sports',(SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
        TRUE,1,NOW(),NOW(),1,0,'Industrial Plotted - General, Textile, Knitwear, Sports',
        0,0,0,(SELECT id FROM egbpa_occupancy WHERE code='G'),47);

INSERT INTO egbpa_sub_occupancy (id,code,name,ordernumber,isactive,createdby,createddate,lastmodifieddate,lastmodifiedby,version,description,maxcoverage,minfar,maxfar,occupancy,colorcode)
VALUES (nextval('seq_egbpa_sub_occupancy'),'G-IT','Industrial Plotted - Information Technology',(SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
        TRUE,1,NOW(),NOW(),1,0,'Industrial Plotted - Information Technology',
        0,0,0,(SELECT id FROM egbpa_occupancy WHERE code='G'),48);

INSERT INTO egbpa_sub_occupancy (id,code,name,ordernumber,isactive,createdby,createddate,lastmodifieddate,lastmodifiedby,version,description,maxcoverage,minfar,maxfar,occupancy,colorcode)
VALUES (nextval('seq_egbpa_sub_occupancy'),'G-F','Industrial Flatted',(SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
        TRUE,1,NOW(),NOW(),1,0,'Industrial Flatted',
        0,0,0,(SELECT id FROM egbpa_occupancy WHERE code='G'),49);
