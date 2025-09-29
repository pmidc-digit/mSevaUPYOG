ALTER TABLE watertax
ADD COLUMN billamount DECIMAL(15, 2),
ADD COLUMN amountpaid DECIMAL(15, 2);

ALTER TABLE seweragetax
ADD COLUMN billamount DECIMAL(15, 2),
ADD COLUMN amountpaid DECIMAL(15, 2);
