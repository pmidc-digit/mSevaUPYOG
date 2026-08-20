ALTER TABLE IF EXISTS egf_chartofaccount RENAME COLUMN desciption TO description;

--rollback ALTER TABLE IF EXISTS egf_chartofaccount RENAME COLUMN description TO desciption;