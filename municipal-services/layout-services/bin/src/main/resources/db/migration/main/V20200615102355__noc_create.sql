CREATE TABLE eg_layout_owner (
    id         VARCHAR(256) NOT NULL,
    tenantid              VARCHAR(256),
    layoutid    VARCHAR(256) NOT NULL,
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

    CONSTRAINT pk_eg_layout_owner PRIMARY KEY (id, layoutid),
    CONSTRAINT fk_eg_layout_owner FOREIGN KEY (layoutid)
        REFERENCES eg_layout(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX idx_eg_layout_owner_layoutid ON eg_layout_owner (layoutid);
CREATE INDEX idx_eg_layout_owner_tenantid ON eg_layout_owner (tenantid);

