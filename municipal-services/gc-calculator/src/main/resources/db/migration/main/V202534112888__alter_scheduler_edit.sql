CREATE TABLE IF NOT EXISTS eg_gc_bulkbill_audit (
  id CHARACTER VARYING (128) NOT NULL,
  batchoffset bigint NOT NULL,
  createdtime bigint NOT NULL,
  recordCount bigint NOT NULL,
  tenantid CHARACTER VARYING (256) NOT NULL,
  businessservice CHARACTER VARYING (256) NOT NULL,
  CONSTRAINT pk_eg_gc_bulkbill_audit_id PRIMARY KEY (id)
);



ALTER TABLE eg_gc_bulkbill_audit
ADD COLUMN IF NOT EXISTS audittime bigint NOT NULL,
ADD COLUMN IF NOT EXISTS message CHARACTER VARYING (2048) NOT NULL;


ALTER TABLE IF EXISTS eg_gc_scheduler
ALTER COLUMN id SET NOT NULL;




create table IF NOT EXISTS eg_gc_bill_scheduler_connection_status (id character varying(64) PRIMARY KEY, consumercode character varying(64), eg_gc_scheduler_id character varying(64),locality character varying(64), module character varying(64), createdtime bigint, lastupdatedtime bigint, status character varying(64),tenantid character varying(64), reason character varying(1000) );

