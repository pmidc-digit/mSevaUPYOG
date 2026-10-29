CREATE TABLE IF NOT EXISTS egcl_resettle_batch (
    id character varying(64) NOT NULL,
    batch_id character varying(64) NOT NULL,
    tenantid character varying(256),
    businessservice character varying(256),
    from_time bigint,
    to_time bigint,
    total_found integer DEFAULT 0,
    total_settled integer DEFAULT 0,
    total_skipped integer DEFAULT 0,
    total_failed integer DEFAULT 0,
    status character varying(32),
    createdtime bigint,
    createdby character varying(64),
    CONSTRAINT pk_egcl_resettle_batch PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_egcl_resettle_batch_time ON egcl_resettle_batch(createdtime DESC);
CREATE INDEX IF NOT EXISTS idx_egcl_resettle_batch_id ON egcl_resettle_batch(batch_id);

CREATE TABLE IF NOT EXISTS egcl_resettle_detail (
    id character varying(64) NOT NULL,
    batch_id character varying(64),
    paymentid character varying(64) NOT NULL,
    consumercode character varying(256),
    businessservice character varying(256),
    billid character varying(64),
    tenantid character varying(256),
    resettle_status character varying(32),
    failure_reason text,
    createdtime bigint,
    createdby character varying(64),
    CONSTRAINT pk_egcl_resettle_detail PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_egcl_resettle_detail_batch ON egcl_resettle_detail(batch_id);
CREATE INDEX IF NOT EXISTS idx_egcl_resettle_detail_payment ON egcl_resettle_detail(paymentid);
CREATE INDEX IF NOT EXISTS idx_egcl_resettle_detail_status ON egcl_resettle_detail(resettle_status);
