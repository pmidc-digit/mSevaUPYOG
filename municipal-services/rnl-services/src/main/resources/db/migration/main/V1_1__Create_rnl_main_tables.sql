

-- 1. CORE LEASE TABLE (FREQUENTLY QUERIED FIELDS)
CREATE TABLE IF NOT EXISTS eg_rnl_lease (
    id VARCHAR(64) NOT NULL,
    tenant_id VARCHAR(64) NOT NULL,
    application_number VARCHAR(64) NOT NULL,
    asset_id VARCHAR(64) NOT NULL,
    status VARCHAR(64) NOT NULL,

    lease_category VARCHAR(64) NOT NULL,
    lease_duration INTEGER NOT NULL, -- months
    monthly_rent DECIMAL(12,2) NOT NULL,
    security_amount DECIMAL(12,2),

    application_date BIGINT,
    lease_start_date BIGINT,
    lease_end_date BIGINT,
    parent_lease_id VARCHAR(64),
    renewal_count INTEGER DEFAULT 0,

    termination_reason VARCHAR(300),
    termination_date BIGINT,

    created_by VARCHAR(64) NOT NULL,
    created_time BIGINT NOT NULL,
    last_modified_by VARCHAR(64),
    last_modified_time BIGINT,

    CONSTRAINT pk_eg_rnl_lease PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS eg_rnl_lease_details (
    id VARCHAR(64) NOT NULL,
    lease_id VARCHAR(64) NOT NULL,

    lease_area DECIMAL(10,2),
    purpose_of_lease VARCHAR(200),

    payment_frequency VARCHAR(64),
    advance_amount DECIMAL(12,2) ,

    gst_applicable BOOLEAN ,
    cow_cess_applicable BOOLEAN ,

    escalation_percentage DECIMAL(5,2) DEFAULT 0,
    increment_cycle VARCHAR(64), -- MONTHLY, QUARTERLY, YEARLY
    increment_applicable BOOLEAN,

    late_payment_percentage DECIMAL(5,2) DEFAULT 0,
    penalty_type VARCHAR(64), -- DAILY, MONTHLY, ONETIME

    refund_applicable BOOLEAN,

    terms_and_conditions TEXT,
    notification_preferences JSONB, -- {push: true, sms: true, email: false}

    deposit_type VARCHAR(64) ,
    is_deposit_refunded BOOLEAN ,

    additional_details JSONB,

    created_by VARCHAR(64),
    created_time BIGINT,
    last_modified_by VARCHAR(64),
    last_modified_time BIGINT,

    CONSTRAINT pk_eg_rnl_lease_details PRIMARY KEY (id),
    CONSTRAINT fk_eg_rnl_lease_details FOREIGN KEY (lease_id)
        REFERENCES eg_rnl_lease(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS eg_rnl_owner (
    uuid VARCHAR(256) NOT NULL,
    tenantid VARCHAR(256) NULL,
    leaseid VARCHAR(256) NOT NULL,
    status VARCHAR(128) NULL,
    isprimaryowner BOOLEAN DEFAULT FALSE NULL,
    ownertype VARCHAR(256) NULL,
    ownershippercentage VARCHAR(128) NULL,
    institutionid VARCHAR(128) NULL,
    relationship VARCHAR(128) NULL,
    createdby VARCHAR(128) NULL,
    createdtime BIGINT NULL,
    lastmodifiedby VARCHAR(128) NULL,
    lastmodifiedtime BIGINT NULL,
    additionaldetails JSONB NULL,

    CONSTRAINT pk_eg_rnl_owner PRIMARY KEY (uuid, leaseid)
);

CREATE TABLE IF NOT EXISTS eg_rnl_witness (
    uuid VARCHAR(256) NOT NULL,
    tenantid VARCHAR(256) NULL,
    leaseid VARCHAR(256) NOT NULL,
    status VARCHAR(128) NULL,
    witnesstype VARCHAR(256) NULL,
    witnessrelationship VARCHAR(128) NULL,
    isprimarywitness BOOLEAN DEFAULT FALSE NULL,
    createdby VARCHAR(128) NULL,
    createdtime BIGINT NULL,
    lastmodifiedby VARCHAR(128) NULL,
    lastmodifiedtime BIGINT NULL,
    additionaldetails JSONB NULL,

    CONSTRAINT pk_eg_rnl_witness PRIMARY KEY (uuid, leaseid)
);

CREATE TABLE IF NOT EXISTS eg_rnl_closure (
    id VARCHAR(64) NOT NULL,
    lease_id VARCHAR(64) NOT NULL,
    closure_reason TEXT NOT NULL,
    closure_date BIGINT,
    status VARCHAR(64), -- UNDER_VERIFICATION, VERIFIED, COMPLETED
    amount_to_refund DECIMAL(12,2),
    amount_to_deduct DECIMAL(12,2),
    actual_refunded_amount DECIMAL(12,2),
    refund_comments TEXT,
    refund_reference_id VARCHAR(128),
    created_by VARCHAR(64),
    created_time BIGINT,
    last_modified_by VARCHAR(64),
    last_modified_time BIGINT,

    CONSTRAINT pk_eg_rnl_closure PRIMARY KEY (id),
    CONSTRAINT fk_eg_rnl_closure FOREIGN KEY (lease_id)
        REFERENCES eg_rnl_lease(id) ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE IF NOT EXISTS eg_rnl_document (
    id VARCHAR(64) NOT NULL,
    documenttype VARCHAR(64) NULL,              -- Following BPA naming
    filestoreid VARCHAR(64) NULL,               -- Following BPA naming
    documentuid VARCHAR(64) NULL,               -- Following BPA pattern
    leaseid VARCHAR(64) NULL,                   -- Our lease reference (like buildingplanid)
    additionaldetails JSONB NULL,               -- Following BPA pattern
    createdby VARCHAR(64) NULL,                 -- Following BPA pattern
    lastmodifiedby VARCHAR(64) NULL,            -- Following BPA pattern
    createdtime BIGINT NULL,                    -- Following BPA pattern
    lastmodifiedtime BIGINT NULL,               -- Following BPA pattern

    CONSTRAINT pk_eg_rnl_document PRIMARY KEY (id)  -- Following BPA constraint naming
);

-- 7. PAYMENT TABLE (PAYMENT TRACKING)
CREATE TABLE IF NOT EXISTS eg_rnl_payment (
    id VARCHAR(64) NOT NULL,
    lease_id VARCHAR(64) NOT NULL,
    payment_type VARCHAR(64) NOT NULL, -- RENT, DEPOSIT, ADVANCE, PENALTY, GST, COW_CESS
    amount DECIMAL(12,2) NOT NULL,
    payment_date BIGINT,
    due_date BIGINT,
    status VARCHAR(64) DEFAULT 'PENDING', -- PAID, PENDING, OVERDUE, CANCELLED
    payment_method VARCHAR(64), -- ONLINE, CASH, CHEQUE, DD, NEFT, UPI
    receipt_number VARCHAR(64),
    transaction_id VARCHAR(128),
    additional_details JSONB,
    created_by VARCHAR(64),
    created_time BIGINT,
    last_modified_by VARCHAR(64),
    last_modified_time BIGINT,

    CONSTRAINT pk_eg_rnl_payment PRIMARY KEY (id),
    CONSTRAINT fk_eg_rnl_payment FOREIGN KEY (lease_id)
        REFERENCES eg_rnl_lease(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ========================================
-- AUDIT TABLES (COMPLETE SET)
-- ========================================


-- ========================================
-- FOREIGN KEY CONSTRAINTS
-- ========================================

ALTER TABLE eg_rnl_owner ADD CONSTRAINT fk_eg_rnl_owner
    FOREIGN KEY (leaseid) REFERENCES eg_rnl_lease(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE eg_rnl_witness ADD CONSTRAINT fk_eg_rnl_witness
    FOREIGN KEY (leaseid) REFERENCES eg_rnl_lease(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_app_no_per_tenant
ON eg_rnl_lease (tenant_id, application_number);

--CREATE UNIQUE INDEX IF NOT EXISTS idx_one_primary_owner_per_lease
--ON eg_rnl_owner (leaseid) WHERE isprimaryowner = true;
--
---- Ensure only one primary witness per lease
--CREATE UNIQUE INDEX IF NOT EXISTS idx_one_primary_witness_per_lease
--ON eg_rnl_witness (leaseid) WHERE isprimarywitness = true;

-- ========================================
-- PERFORMANCE INDEXES - MAIN TABLES
-- ========================================

-- Core Lease Table Indexes (HIGH PERFORMANCE)
CREATE INDEX IF NOT EXISTS idx_eg_rnl_lease_tenant_id ON eg_rnl_lease USING btree (tenant_id);
CREATE INDEX IF NOT EXISTS idx_eg_rnl_lease_application_no ON eg_rnl_lease USING btree (application_number);
CREATE INDEX IF NOT EXISTS idx_eg_rnl_lease_asset_id ON eg_rnl_lease USING btree (asset_id);
CREATE INDEX IF NOT EXISTS idx_eg_rnl_lease_status ON eg_rnl_lease USING btree (status);
CREATE INDEX IF NOT EXISTS idx_eg_rnl_lease_category ON eg_rnl_lease USING btree (lease_category);
CREATE INDEX IF NOT EXISTS idx_eg_rnl_lease_monthly_rent ON eg_rnl_lease USING btree (monthly_rent);
CREATE INDEX IF NOT EXISTS idx_eg_rnl_lease_start_date ON eg_rnl_lease USING btree (lease_start_date);
CREATE INDEX IF NOT EXISTS idx_eg_rnl_lease_end_date ON eg_rnl_lease USING btree (lease_end_date);

-- Lease Details Table Indexes
CREATE INDEX IF NOT EXISTS idx_eg_rnl_lease_details_lease_id ON eg_rnl_lease_details USING btree (lease_id);
CREATE INDEX IF NOT EXISTS idx_eg_rnl_lease_details_payment_freq ON eg_rnl_lease_details USING btree (payment_frequency);
CREATE INDEX IF NOT EXISTS idx_eg_rnl_lease_details_gst ON eg_rnl_lease_details USING btree (gst_applicable);
CREATE INDEX IF NOT EXISTS idx_eg_rnl_lease_details_cow_cess ON eg_rnl_lease_details USING btree (cow_cess_applicable);

CREATE INDEX IF NOT EXISTS idx_eg_rnl_witness_leaseid ON eg_rnl_witness USING btree (leaseid);
CREATE INDEX IF NOT EXISTS idx_eg_rnl_witness_tenantid ON eg_rnl_witness USING btree (tenantid);
CREATE INDEX IF NOT EXISTS idx_eg_rnl_witness_type ON eg_rnl_witness USING btree (witnesstype);
CREATE INDEX IF NOT EXISTS idx_eg_rnl_witness_isprimary ON eg_rnl_witness USING btree (isprimarywitness);

CREATE INDEX IF NOT EXISTS idx_eg_rnl_closure_lease_id ON eg_rnl_closure USING btree (lease_id);
CREATE INDEX IF NOT EXISTS idx_eg_rnl_closure_status ON eg_rnl_closure USING btree (status);
CREATE INDEX IF NOT EXISTS idx_eg_rnl_closure_date ON eg_rnl_closure USING btree (closure_date);

CREATE INDEX IF NOT EXISTS idx_eg_rnl_document_leaseid ON eg_rnl_document USING btree (leaseid);
CREATE INDEX IF NOT EXISTS idx_eg_rnl_document_documenttype ON eg_rnl_document USING btree (documenttype);
CREATE INDEX IF NOT EXISTS idx_eg_rnl_document_filestoreid ON eg_rnl_document USING btree (filestoreid);

CREATE INDEX IF NOT EXISTS idx_eg_rnl_payment_lease_id ON eg_rnl_payment USING btree (lease_id);
CREATE INDEX IF NOT EXISTS idx_eg_rnl_payment_status ON eg_rnl_payment USING btree (status);
CREATE INDEX IF NOT EXISTS idx_eg_rnl_payment_due_date ON eg_rnl_payment USING btree (due_date);
CREATE INDEX IF NOT EXISTS idx_eg_rnl_payment_type ON eg_rnl_payment USING btree (payment_type);
CREATE INDEX IF NOT EXISTS idx_eg_rnl_payment_receipt ON eg_rnl_payment USING btree (receipt_number);

