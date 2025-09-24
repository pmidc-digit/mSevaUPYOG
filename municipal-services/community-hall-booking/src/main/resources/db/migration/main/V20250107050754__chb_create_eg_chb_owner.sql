DROP TABLE IF EXISTS eg_chb_owner;

CREATE TABLE eg_chb_owner (
                              uuid         VARCHAR(256) NOT NULL,
                              tenantid              VARCHAR(256),
                              booking_id    VARCHAR(256) NOT NULL,
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

                              CONSTRAINT pk_eg_chb_owner PRIMARY KEY (uuid, booking_id),
                              CONSTRAINT fk_eg_chb_owner FOREIGN KEY (booking_id)
                                  REFERENCES eg_chb_booking_detail(booking_id)
                                  ON DELETE CASCADE
                                  ON UPDATE CASCADE
);

CREATE INDEX idx_eg_chb_owner_booking_id ON eg_chb_owner (booking_id);
CREATE INDEX idx_eg_chb_owner_tenantid ON eg_chb_owner (tenantid);
