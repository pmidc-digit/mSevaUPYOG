-- =========================================================
-- Update Commercial Occupancy & Sub-Occupancy as per 2018
-- =========================================================

-- =====================================================
-- Rename subYear column to subyear (PostgreSQL)
-- =====================================================


-- egbpa_occupancy
DO $$
BEGIN
    ALTER TABLE egbpa_occupancy
    RENAME COLUMN "subYear" TO subyear;
EXCEPTION
    WHEN undefined_column THEN
        -- column already renamed or never existed
        NULL;
END
$$;


-- egbpa_sub_occupancy
DO $$
BEGIN
    ALTER TABLE egbpa_sub_occupancy
    RENAME COLUMN "subYear" TO subyear;
EXCEPTION
    WHEN undefined_column THEN
        NULL;
END
$$;


-- Update Hotel / Motel
UPDATE egbpa_sub_occupancy
SET code='F-HM', occupancy=34, name='Hotels/Motels', description='Hotels/Motels',
    year='2018', subyear='2018-01', lastmodifieddate=NOW()
WHERE name='Hotel/Motel';


-- Update Restaurants / Banquet Halls
UPDATE egbpa_sub_occupancy
SET code='F-RB', colorcode=35, name='Restaurants/Banquet Halls',
    description='Restaurants/Banquet Halls', year='2018', subyear='2018-01',
    lastmodifieddate=NOW()
WHERE name='Restaurants'
  AND occupancy=34;


-- Update Shops / Showrooms / Commercial Complexes
UPDATE egbpa_sub_occupancy
SET name='Shops/Showrooms/Commercial Complexes etc.',
    description='Shops/Showrooms/Commercial Complexes etc.',
    colorcode=28, year='2018', subyear='2018-01',
    lastmodifieddate=NOW()
WHERE code='F-SCC';


-- Clear colorcode for CNG
UPDATE egbpa_sub_occupancy
SET colorcode=NULL, year='2018', subyear='2018-01',
    lastmodifieddate=NOW()
WHERE code='J-CNG';


-- Update Private Offices (Corrected syntax)
UPDATE egbpa_sub_occupancy
SET code='F-PO', name='Private Offices', description='Private Offices',
    colorcode=45, year='2018', subyear='2018-01',
    lastmodifieddate=NOW()
WHERE code='F-CO';


-- Clear colorcode for Banquet / Theatre
UPDATE egbpa_sub_occupancy
SET colorcode=NULL, year='2018', subyear='2018-01',
    lastmodifieddate=NOW()
WHERE code='F-BTH';


-- Update Banks
UPDATE egbpa_sub_occupancy
SET name='Banks', description='Banks',
    colorcode=37, year='2018', subyear='2018-01',
    lastmodifieddate=NOW()
WHERE name='Bank';


-- Update Lodges
UPDATE egbpa_sub_occupancy
SET code='F-LB',
    name='Club/ Guest House / Lodging & Boarding / Service Apartments',
    description='Club/ Guest House / Lodging & Boarding / Service Apartments',
    colorcode=23, year='2018', subyear='2018-01',
    lastmodifieddate=NOW()
WHERE name='Lodges';


-- Clear colorcode for Residential Private Office
UPDATE egbpa_sub_occupancy
SET colorcode=NULL, year='2018', subyear='2018-01',
    lastmodifieddate=NOW()
WHERE code='A-PO';


-- Clear colorcode for Industrial I-2
UPDATE egbpa_sub_occupancy
SET colorcode=NULL, year='2018', subyear='2018-01',
    lastmodifieddate=NOW()
WHERE code='I-2';


-- Clear colorcode for Shopping Complex
UPDATE egbpa_sub_occupancy
SET colorcode=NULL, year='2018', subyear='2018-01',
    lastmodifieddate=NOW()
WHERE code='F-SC';


-- Clear colorcode for Food Services
UPDATE egbpa_sub_occupancy
SET colorcode=NULL, year='2018', subyear='2018-01',
    lastmodifieddate=NOW()
WHERE code='J-FS';


-- Clear colorcode for Food Court / Sweet Shop
UPDATE egbpa_sub_occupancy
SET colorcode=NULL, year='2018', subyear='2018-01',
    lastmodifieddate=NOW()
WHERE code='J-FCSS';


-- =========================================================
-- Insert New Commercial Sub-Occupancies (2018)
-- =========================================================


-- Dhaba
INSERT INTO egbpa_sub_occupancy
(id, code, name, ordernumber, isactive, createdby, createddate,
 lastmodifieddate, lastmodifiedby, version, description,
 maxcoverage, minfar, maxfar, occupancy, colorcode, year, subyear)
VALUES
(nextval('seq_egbpa_sub_occupancy'), 'F-D', 'Dhaba',
 (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
 TRUE, 1, NOW(), NOW(), 1, 0, 'Dhaba',
 0, 0, 0, (SELECT id FROM egbpa_occupancy WHERE code='F'),
 26, '2018', '2018-01');


-- Cinemas and Auditoriums
INSERT INTO egbpa_sub_occupancy
(id, code, name, ordernumber, isactive, createdby, createddate,
 lastmodifieddate, lastmodifiedby, version, description,
 maxcoverage, minfar, maxfar, occupancy, colorcode, year, subyear)
VALUES
(nextval('seq_egbpa_sub_occupancy'), 'F-CA', 'Cinemas and Auditoriums',
 (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
 TRUE, 1, NOW(), NOW(), 1, 0, 'Cinemas and Auditoriums',
 0, 0, 0, (SELECT id FROM egbpa_occupancy WHERE code='F'),
 59, '2018', '2018-01');


-- Video Game Parlors
INSERT INTO egbpa_sub_occupancy
(id, code, name, ordernumber, isactive, createdby, createddate,
 lastmodifieddate, lastmodifiedby, version, description,
 maxcoverage, minfar, maxfar, occupancy, colorcode, year, subyear)
VALUES
(nextval('seq_egbpa_sub_occupancy'), 'F-VGP', 'Video Games Parlors',
 (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
 TRUE, 1, NOW(), NOW(), 1, 0, 'Video Games Parlors',
 0, 0, 0, (SELECT id FROM egbpa_occupancy WHERE code='F'),
 24, '2018', '2018-01');


-- Boutiques
INSERT INTO egbpa_sub_occupancy
(id, code, name, ordernumber, isactive, createdby, createddate,
 lastmodifieddate, lastmodifiedby, version, description,
 maxcoverage, minfar, maxfar, occupancy, colorcode, year, subyear)
VALUES
(nextval('seq_egbpa_sub_occupancy'), 'F-BU', 'Boutiques',
 (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
 TRUE, 1, NOW(), NOW(), 1, 0, 'Boutiques',
 0, 0, 0, (SELECT id FROM egbpa_occupancy WHERE code='F'),
 27, '2018', '2018-01');


-- Petrol Filling Station – Four Wheeler
INSERT INTO egbpa_sub_occupancy
(id, code, name, ordernumber, isactive, createdby, createddate,
 lastmodifieddate, lastmodifiedby, version, description,
 maxcoverage, minfar, maxfar, occupancy, colorcode, year, subyear)
VALUES
(nextval('seq_egbpa_sub_occupancy'), 'F-PFSF',
 'Petrol Filling Station – Four Wheeler',
 (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
 TRUE, 1, NOW(), NOW(), 1, 0,
 'Petrol Filling Station – Four Wheeler',
 0, 0, 0, (SELECT id FROM egbpa_occupancy WHERE code='F'),
 13, '2018', '2018-01');


-- Petrol Filling Station – Two Wheeler
INSERT INTO egbpa_sub_occupancy
(id, code, name, ordernumber, isactive, createdby, createddate,
 lastmodifieddate, lastmodifiedby, version, description,
 maxcoverage, minfar, maxfar, occupancy, colorcode, year, subyear)
VALUES
(nextval('seq_egbpa_sub_occupancy'), 'F-PFST',
 'Petrol Filling Station – Two Wheeler',
 (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
 TRUE, 1, NOW(), NOW(), 1, 0,
 'Petrol Filling Station – Two Wheeler',
 0, 0, 0, (SELECT id FROM egbpa_occupancy WHERE code='F'),
 41, '2018', '2018-01');


-- Petrol Filling Station Service
INSERT INTO egbpa_sub_occupancy
(id, code, name, ordernumber, isactive, createdby, createddate,
 lastmodifieddate, lastmodifiedby, version, description,
 maxcoverage, minfar, maxfar, occupancy, colorcode, year, subyear)
VALUES
(nextval('seq_egbpa_sub_occupancy'), 'F-PFSS',
 'Petrol Filling Station Service',
 (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
 TRUE, 1, NOW(), NOW(), 1, 0,
 'Petrol Filling Station Service',
 0, 0, 0, (SELECT id FROM egbpa_occupancy WHERE code='F'),
 42, '2018', '2018-01');


-- Petrol Station
INSERT INTO egbpa_sub_occupancy
(id, code, name, ordernumber, isactive, createdby, createddate,
 lastmodifieddate, lastmodifiedby, version, description,
 maxcoverage, minfar, maxfar, occupancy, colorcode, year, subyear)
VALUES
(nextval('seq_egbpa_sub_occupancy'), 'F-PS', 'Petrol Station',
 (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
 TRUE, 1, NOW(), NOW(), 1, 0, 'Petrol Station',
 0, 0, 0, (SELECT id FROM egbpa_occupancy WHERE code='F'),
 43, '2018', '2018-01');


-- Compressed Natural Gas Station
INSERT INTO egbpa_sub_occupancy
(id, code, name, ordernumber, isactive, createdby, createddate,
 lastmodifieddate, lastmodifiedby, version, description,
 maxcoverage, minfar, maxfar, occupancy, colorcode, year, subyear)
VALUES
(nextval('seq_egbpa_sub_occupancy'), 'F-CNGS',
 'Compressed Natural Gas Station',
 (SELECT COALESCE(MAX(ordernumber),0)+1 FROM egbpa_sub_occupancy),
 TRUE, 1, NOW(), NOW(), 1, 0,
 'Compressed Natural Gas Station',
 0, 0, 0, (SELECT id FROM egbpa_occupancy WHERE code='F'),
 44, '2018', '2018-01');
