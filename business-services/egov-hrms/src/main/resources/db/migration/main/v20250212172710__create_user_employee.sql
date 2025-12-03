
-- Table
CREATE TABLE IF NOT EXISTS eg_user_employee (
    id BIGINT NOT NULL,
    category VARCHAR(256) NOT NULL,
    subcategory VARCHAR(256) NOT NULL,
    zone VARCHAR(256) NOT NULL,
    tenantId VARCHAR(250) NOT NULL,
    createdBy VARCHAR(128),
    createdDate BIGINT NOT NULL,
    lastModifiedBy VARCHAR(128),
    lastModifiedDate BIGINT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_emp_tenant ON eg_user_employee (tenantId);
CREATE INDEX IF NOT EXISTS idx_user_emp_zone   ON eg_user_employee (zone);

-- Composite UNIQUE constraint (NOT a primary key)
ALTER TABLE eg_user_employee
    ADD CONSTRAINT uniq_user_emp_id_zone_tenant
    UNIQUE (id, zone, tenantId);
