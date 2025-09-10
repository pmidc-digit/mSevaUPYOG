
-- 1. LEASE AUDIT TABLE
CREATE TABLE IF NOT EXISTS eg_rnl_lease_audit (
    audit_id VARCHAR(64) NOT NULL,
    id VARCHAR(64) NOT NULL,
    tenant_id VARCHAR(64) NOT NULL,
    application_number VARCHAR(64),
    asset_id VARCHAR(64),
    status VARCHAR(64),
    lease_category VARCHAR(64),
    lease_duration INTEGER,
    monthly_rent DECIMAL(12,2),
    security_amount DECIMAL(12,2),
    application_date BIGINT,
    lease_start_date BIGINT,
    lease_end_date BIGINT,
    parent_lease_id VARCHAR(64),
    renewal_count INTEGER,
    termination_reason VARCHAR(300),
    termination_date BIGINT,
    created_by VARCHAR(64),
    created_time BIGINT,
    last_modified_by VARCHAR(64),
    last_modified_time BIGINT,

    -- Audit Specific Fields
    operation_type VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    operation_time BIGINT NOT NULL,
    operation_by VARCHAR(64) NOT NULL,
    version_number INTEGER DEFAULT 1,

    CONSTRAINT pk_eg_rnl_lease_audit PRIMARY KEY (audit_id)
);

CREATE TABLE IF NOT EXISTS eg_rnl_lease_details_audit (
    audit_id VARCHAR(64) NOT NULL,
    id VARCHAR(64) NOT NULL,
    lease_id VARCHAR(64) NOT NULL,
    lease_area DECIMAL(10,2),
    purpose_of_lease VARCHAR(200),
    payment_frequency VARCHAR(64),
    advance_amount DECIMAL(12,2),
    gst_applicable BOOLEAN,
    cow_cess_applicable BOOLEAN,
    escalation_percentage DECIMAL(5,2),
    increment_cycle VARCHAR(64),
    increment_applicable BOOLEAN,
    late_payment_percentage DECIMAL(5,2),
    penalty_type VARCHAR(64),
    refund_applicable BOOLEAN,
    terms_and_conditions TEXT,
    notification_preferences JSONB,
    deposit_type VARCHAR(64),
    is_deposit_refunded BOOLEAN,
    additional_details JSONB,
    created_by VARCHAR(64),
    created_time BIGINT,
    last_modified_by VARCHAR(64),
    last_modified_time BIGINT,

    operation_type VARCHAR(20) NOT NULL,
    operation_time BIGINT NOT NULL,
    operation_by VARCHAR(64) NOT NULL,
    version_number INTEGER DEFAULT 1,

    CONSTRAINT pk_eg_rnl_lease_details_audit PRIMARY KEY (audit_id)
);

CREATE TABLE IF NOT EXISTS eg_rnl_owner_audit (
    audit_id VARCHAR(256) NOT NULL,                -- Separate audit ID
    uuid VARCHAR(256) NOT NULL,                    -- Original owner UUID
    tenantid VARCHAR(256) NULL,
    leaseid VARCHAR(256) NOT NULL,                 -- Original lease ID
    status VARCHAR(128) NULL,
    isprimaryowner BOOLEAN NULL,
    ownertype VARCHAR(256) NULL,
    ownershippercentage VARCHAR(128) NULL,
    institutionid VARCHAR(128) NULL,
    relationship VARCHAR(128) NULL,
    createdby VARCHAR(128) NULL,
    createdtime BIGINT NULL,
    lastmodifiedby VARCHAR(128) NULL,
    lastmodifiedtime BIGINT NULL,
    additionaldetails JSONB NULL,

    operation_type VARCHAR(20) NOT NULL,           -- INSERT, UPDATE, DELETE
    operation_time BIGINT NOT NULL,
    operation_by VARCHAR(64) NOT NULL,
    version_number INTEGER DEFAULT 1,

    CONSTRAINT pk_eg_rnl_owner_audit PRIMARY KEY (audit_id)
);

CREATE TABLE IF NOT EXISTS eg_rnl_witness_audit (
    audit_id VARCHAR(256) NOT NULL,                -- Separate audit ID
    uuid VARCHAR(256) NOT NULL,                    -- Original witness UUID
    tenantid VARCHAR(256) NULL,
    leaseid VARCHAR(256) NOT NULL,                 -- Original lease ID
    status VARCHAR(128) NULL,
    witnesstype VARCHAR(256) NULL,
    witnessrelationship VARCHAR(128) NULL,
    isprimarywitness BOOLEAN NULL,
    createdby VARCHAR(128) NULL,
    createdtime BIGINT NULL,
    lastmodifiedby VARCHAR(128) NULL,
    lastmodifiedtime BIGINT NULL,
    additionaldetails JSONB NULL,

    -- Audit specific fields
    operation_type VARCHAR(20) NOT NULL,
    operation_time BIGINT NOT NULL,
    operation_by VARCHAR(64) NOT NULL,
    version_number INTEGER DEFAULT 1,

    CONSTRAINT pk_eg_rnl_witness_audit PRIMARY KEY (audit_id)
);

-- 5. CLOSURE AUDIT TABLE
CREATE TABLE IF NOT EXISTS eg_rnl_closure_audit (
    audit_id VARCHAR(64) NOT NULL,
    id VARCHAR(64) NOT NULL,
    lease_id VARCHAR(64) NOT NULL,
    closure_reason TEXT,
    closure_date BIGINT,
    status VARCHAR(64),
    amount_to_refund DECIMAL(12,2),
    amount_to_deduct DECIMAL(12,2),
    actual_refunded_amount DECIMAL(12,2),
    refund_notes TEXT,
    refund_reference_id VARCHAR(128),
    created_by VARCHAR(64),
    created_time BIGINT,
    last_modified_by VARCHAR(64),
    last_modified_time BIGINT,

    -- Audit Specific Fields
    operation_type VARCHAR(20) NOT NULL,
    operation_time BIGINT NOT NULL,
    operation_by VARCHAR(64) NOT NULL,
    version_number INTEGER DEFAULT 1,

    CONSTRAINT pk_eg_rnl_closure_audit PRIMARY KEY (audit_id)
);

-- 6. PAYMENT AUDIT TABLE
CREATE TABLE IF NOT EXISTS eg_rnl_payment_audit (
    audit_id VARCHAR(64) NOT NULL,
    id VARCHAR(64) NOT NULL,
    lease_id VARCHAR(64) NOT NULL,
    payment_type VARCHAR(64),
    amount DECIMAL(12,2),
    payment_date BIGINT,
    due_date BIGINT,
    status VARCHAR(64),
    payment_method VARCHAR(64),
    receipt_number VARCHAR(64),
    transaction_id VARCHAR(128),
    additional_details JSONB,
    created_by VARCHAR(64),
    created_time BIGINT,
    last_modified_by VARCHAR(64),
    last_modified_time BIGINT,

    operation_type VARCHAR(20) NOT NULL,
    operation_time BIGINT NOT NULL,
    operation_by VARCHAR(64) NOT NULL,
    version_number INTEGER DEFAULT 1,

    CONSTRAINT pk_eg_rnl_payment_audit PRIMARY KEY (audit_id)
);


CREATE INDEX IF NOT EXISTS idx_eg_rnl_lease_audit_id ON eg_rnl_lease_audit USING btree (id);
CREATE INDEX IF NOT EXISTS idx_eg_rnl_lease_audit_tenant_id ON eg_rnl_lease_audit USING btree (tenant_id);
CREATE INDEX IF NOT EXISTS idx_eg_rnl_lease_audit_operation_time ON eg_rnl_lease_audit USING btree (operation_time);
CREATE INDEX IF NOT EXISTS idx_eg_rnl_lease_audit_operation_type ON eg_rnl_lease_audit USING btree (operation_type);
CREATE INDEX IF NOT EXISTS idx_eg_rnl_lease_audit_version ON eg_rnl_lease_audit USING btree (id, version_number);

-- Lease Details Audit Indexes
CREATE INDEX IF NOT EXISTS idx_eg_rnl_lease_details_audit_id ON eg_rnl_lease_details_audit USING btree (id);
CREATE INDEX IF NOT EXISTS idx_eg_rnl_lease_details_audit_lease_id ON eg_rnl_lease_details_audit USING btree (lease_id);
CREATE INDEX IF NOT EXISTS idx_eg_rnl_lease_details_audit_operation_time ON eg_rnl_lease_details_audit USING btree (operation_time);

-- Owner Audit Indexes
CREATE INDEX IF NOT EXISTS idx_eg_rnl_owner_audit_uuid_leaseid ON eg_rnl_owner_audit USING btree (uuid, leaseid);
CREATE INDEX IF NOT EXISTS idx_eg_rnl_owner_audit_operation_time ON eg_rnl_owner_audit USING btree (operation_time);
CREATE INDEX IF NOT EXISTS idx_eg_rnl_owner_audit_leaseid ON eg_rnl_owner_audit USING btree (leaseid);

-- Witness Audit Indexes
CREATE INDEX IF NOT EXISTS idx_eg_rnl_witness_audit_uuid_leaseid ON eg_rnl_witness_audit USING btree (uuid, leaseid);
CREATE INDEX IF NOT EXISTS idx_eg_rnl_witness_audit_operation_time ON eg_rnl_witness_audit USING btree (operation_time);
CREATE INDEX IF NOT EXISTS idx_eg_rnl_witness_audit_leaseid ON eg_rnl_witness_audit USING btree (leaseid);

-- Closure Audit Indexes
CREATE INDEX IF NOT EXISTS idx_eg_rnl_closure_audit_id ON eg_rnl_closure_audit USING btree (id);
CREATE INDEX IF NOT EXISTS idx_eg_rnl_closure_audit_lease_id ON eg_rnl_closure_audit USING btree (lease_id);
CREATE INDEX IF NOT EXISTS idx_eg_rnl_closure_audit_operation_time ON eg_rnl_closure_audit USING btree (operation_time);

-- Payment Audit Indexes
CREATE INDEX IF NOT EXISTS idx_eg_rnl_payment_audit_id ON eg_rnl_payment_audit USING btree (id);
CREATE INDEX IF NOT EXISTS idx_eg_rnl_payment_audit_lease_id ON eg_rnl_payment_audit USING btree (lease_id);
CREATE INDEX IF NOT EXISTS idx_eg_rnl_payment_audit_operation_time ON eg_rnl_payment_audit USING btree (operation_time);

