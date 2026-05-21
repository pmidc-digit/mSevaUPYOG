CREATE TABLE eg_clu_owner (
    id         VARCHAR(256) NOT NULL,
    tenantid              VARCHAR(256),
    cluid    VARCHAR(256) NOT NULL,
    status                VARCHAR(128) ,
    isprimaryowner        BOOLEAN DEFAULT FALSE,
    ownertype             VARCHAR(256) ,
    ownershippercentage   VARCHAR(128),
    institutionid         VARCHAR(128) ,
    relationship          VARCHAR(128) ,
    createdby             VARCHAR(128) ,
    createdtime           BIGINT      ,
    lastmodifiedby        VARCHAR(128) ,
    lastmodifiedtime      BIGINT      ,
    additionaldetails     JSONB,

    CONSTRAINT pk_eg_clu_owner PRIMARY KEY (id, cluid),
    CONSTRAINT fk_eg_clu_owner FOREIGN KEY (cluid)
        REFERENCES eg_clu(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX idx_eg_clu_owner_cluid ON eg_clu_owner (cluid);
CREATE INDEX idx_eg_clu_owner_tenantid ON eg_clu_owner (tenantid);




CREATE SEQUENCE SEQ_EG_CL_RECEIPT_ID
    START WITH 1
    INCREMENT BY 1

