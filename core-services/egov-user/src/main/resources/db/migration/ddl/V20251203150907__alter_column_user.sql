
ALTER TABLE eg_user
ADD COLUMN permanentDistrict VARCHAR(100),
ADD COLUMN correspondenceState VARCHAR(100),
ADD COLUMN permanentState VARCHAR(100),
ADD COLUMN correspondenceDistrict VARCHAR(100);



ALTER TABLE eg_user_address
ADD COLUMN state VARCHAR(100),
ADD COLUMN district VARCHAR(100);
