CREATE TABLE eg_clu(
    id character varying(64) NOT NULL,
    applicationno character varying(64),
    tenantid character varying(256),
    status character varying(64),

    createdby character varying(256),
    lastmodifiedby character varying(256),
    createdtime bigint,
    lastmodifiedtime bigint,
    cluno character varying(64) DEFAULT NULL,
    applicationType character varying(64) NOT NULL,
    clutype character varying(64) NOT NULL,
    accountid character varying(256) DEFAULT NULL,


    applicationstatus character varying(64) NOT NULL,
    CONSTRAINT pk_eg_clu PRIMARY KEY (id)
);

CREATE TABLE eg_clu_auditdetails(
    id character varying(64) NOT NULL,
    applicationno character varying(64),
    tenantid character varying(256),
    status character varying(64),
--    landid character varying(256),
--    additionaldetails jsonb,
    createdby character varying(256),
    lastmodifiedby character varying(256),
    createdtime bigint,
    lastmodifiedtime bigint,
    cluno character varying(64) DEFAULT NULL,
    applicationType character varying(64) NOT NULL,
    clutype character varying(64) NOT NULL,
    accountid character varying(256) DEFAULT NULL,

    applicationstatus character varying(64) NOT NULL
);

CREATE TABLE eg_clu_document(
    uuid character varying(64) NOT NULL,
    documenttype character varying(64),
    documentattachment character varying(64),
    documentuid character varying(64),
    cluid character varying(64),

    createdby character varying(64),
    lastmodifiedby character varying(64),
    createdtime bigint,
    lastmodifiedtime bigint,
    CONSTRAINT uk_eg_clu_document PRIMARY KEY (uuid),
    CONSTRAINT fk_eg_clu_document FOREIGN KEY (cluid)
        REFERENCES public.eg_clu (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

CREATE TABLE eg_clu_details(
    id character varying(64) NOT NULL,
    cluid character varying(64) NOT NULL,
    -- Applicant Details
    additionaldetails jsonb,
    createdby character varying(64),
    lastmodifiedby character varying(64),
    createdtime bigint,
    lastmodifiedtime bigint,
    tenantid character varying(256),
    CONSTRAINT pk_eg_clu_details PRIMARY KEY (id),
    CONSTRAINT fk_eg_clu_details FOREIGN KEY (cluid)
        REFERENCES public.eg_clu (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE INDEX clu_index ON eg_clu
(
    applicationno,
    cluno,
    tenantid,
    id,
    applicationstatus,
    clutype
);

CREATE SEQUENCE SEQ_EG_CLU_APPLICATION
START WITH 1
INCREMENT BY 1;


CREATE INDEX idx_eg_clu_details_cluuuid ON eg_clu_details (cluid);

CREATE SEQUENCE IF NOT EXISTS SEQ_EG_CLU_RECEIPT_ID;

