CREATE TABLE eg_layout(
    id character varying(64) NOT NULL,
    applicationno character varying(64),
    tenantid character varying(256),
    status character varying(64),

    createdby character varying(256),
    lastmodifiedby character varying(256),
    createdtime bigint,
    lastmodifiedtime bigint,
    layoutno character varying(64) DEFAULT NULL,
    applicationType character varying(64) NOT NULL,
    layouttype character varying(64) NOT NULL,
    accountid character varying(256) DEFAULT NULL,


    applicationstatus character varying(64) NOT NULL,
    CONSTRAINT pk_eg_layout PRIMARY KEY (id)
);

CREATE TABLE eg_layout_auditdetails(
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
    layoutno character varying(64) DEFAULT NULL,
    applicationType character varying(64) NOT NULL,
    layouttype character varying(64) NOT NULL,
    accountid character varying(256) DEFAULT NULL,

    applicationstatus character varying(64) NOT NULL
);

CREATE TABLE eg_layout_document(
    uuid character varying(64) NOT NULL,
    documenttype character varying(64),
    documentattachment character varying(64),
    documentuid character varying(64),
    layoutid character varying(64),

    createdby character varying(64),
    lastmodifiedby character varying(64),
    createdtime bigint,
    lastmodifiedtime bigint,
    CONSTRAINT uk_eg_layout_document PRIMARY KEY (uuid),
    CONSTRAINT fk_eg_layout_document FOREIGN KEY (layoutid)
        REFERENCES public.eg_layout (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

CREATE TABLE eg_layout_details(
    id character varying(64) NOT NULL,
    layoutid character varying(64) NOT NULL,
    -- Applicant Details
    additionaldetails jsonb,
    createdby character varying(64),
    lastmodifiedby character varying(64),
    createdtime bigint,
    lastmodifiedtime bigint,
    tenantid character varying(256),
    CONSTRAINT pk_eg_layout_details PRIMARY KEY (id),
    CONSTRAINT fk_eg_layout_details FOREIGN KEY (layoutid)
        REFERENCES public.eg_layout (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE INDEX layout_index ON eg_layout
(
    applicationno,
    layoutno,
    tenantid,
    id,
    applicationstatus,
    layouttype
);

CREATE SEQUENCE SEQ_EG_LAYOUT_APPLICATION
START WITH 1
INCREMENT BY 1;


CREATE INDEX idx_eg_layout_details_layoutuuid ON eg_layout_details (layoutid);

CREATE SEQUENCE IF NOT EXISTS SEQ_EG_LAYOUT_RECEIPT_ID;

