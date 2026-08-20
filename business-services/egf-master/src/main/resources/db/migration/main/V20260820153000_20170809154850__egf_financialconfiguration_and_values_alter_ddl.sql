ALTER TABLE IF EXISTS egf_financialconfiguration RENAME COLUMN keyName TO name;

ALTER TABLE IF EXISTS egf_financialconfigurationvalues RENAME COLUMN keyId TO financialConfigurationId;
