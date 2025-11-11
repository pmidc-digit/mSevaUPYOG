CREATE TABLE public.eg_gc_connection_audit (
	id varchar(64) NOT NULL,
	tenantid varchar(250) NOT NULL,
	property_id varchar(64) NOT NULL,
	applicationno varchar(64) NULL,
	applicationstatus varchar(256) NULL,
	status varchar(64) NOT NULL,
	connectionno varchar(256) NULL,
	oldconnectionno varchar(64) NULL,
	"action" varchar(64) NULL,
	adhocrebate numeric(12, 2) NULL,
	adhocpenalty numeric(12, 2) NULL,
	adhocpenaltyreason varchar(1024) NULL,
	adhocpenaltycomment varchar(1024) NULL,
	adhocrebatereason varchar(1024) NULL,
	adhocrebatecomment varchar(1024) NULL,
	createdby varchar(64) NULL,
	lastmodifiedby varchar(64) NULL,
	createdtime int8 NULL,
	lastmodifiedtime int8 NULL,
	applicationtype varchar(64) NULL,
	dateeffectivefrom int8 NULL,
	locality varchar(64) NULL,
	isoldapplication bool DEFAULT false NULL,
	additionaldetails jsonb NULL,
	channel varchar(128) NULL,
	isdisconnectiontemporary bool DEFAULT false NULL,
	disconnectionreason varchar(1024) NULL,
	disconnectionexecutiondate int8 NULL
);
CREATE INDEX index_eg_gc_connection_audit_applicationno ON public.eg_gc_connection_audit USING btree (applicationno);
CREATE INDEX index_eg_gc_connection_audit_applicationstatus ON public.eg_gc_connection_audit USING btree (applicationstatus);
CREATE INDEX index_eg_gc_connection_audit_connectionno ON public.eg_gc_connection_audit USING btree (connectionno);
CREATE INDEX index_eg_gc_connection_audit_oldconnectionno ON public.eg_gc_connection_audit USING btree (oldconnectionno);
CREATE INDEX index_eg_gc_connection_audit_property_id ON public.eg_gc_connection_audit USING btree (property_id);
CREATE INDEX index_eg_gc_connection_audit_tenantid ON public.eg_gc_connection_audit USING btree (tenantid);



CREATE TABLE IF NOT EXISTS eg_gc_connection_audit
(
  id character varying(64) NOT NULL,
  tenantid character varying(250) NOT NULL,
  property_id character varying(64) NOT NULL,
  applicationno character varying(64),
  applicationstatus character varying(256),
  status character varying(64) NOT NULL,
  connectionno character varying(256),
  oldconnectionno character varying(64),
  roadCuttingArea FLOAT,
  action character varying(64),
  roadType character varying(32),
  adhocrebate numeric(12,2),
  adhocpenalty numeric(12,2),
  adhocpenaltyreason character varying(1024),
  adhocpenaltycomment character varying(1024),
  adhocrebatereason character varying(1024),
  adhocrebatecomment character varying(1024),
  createdBy character varying(64),
  lastModifiedBy character varying(64),
  createdTime bigint,
  lastModifiedTime bigint
);

CREATE INDEX IF NOT EXISTS index_eg_gc_connection_audit_tenantId ON eg_gc_connection_audit (tenantid);
CREATE INDEX IF NOT EXISTS index_eg_gc_connection_audit_applicationNo ON eg_gc_connection_audit (applicationno);
CREATE INDEX IF NOT EXISTS index_eg_gc_connection_audit_connectionNo ON eg_gc_connection_audit (connectionno);
CREATE INDEX IF NOT EXISTS index_eg_gc_connection_audit_oldConnectionNo ON eg_gc_connection_audit (oldconnectionno);
CREATE INDEX IF NOT EXISTS index_eg_gc_connection_audit_property_id ON eg_gc_connection_audit (property_id);
CREATE INDEX IF NOT EXISTS index_eg_gc_connection_audit_applicationstatus ON eg_gc_connection_audit (applicationstatus);

CREATE TABLE IF NOT EXISTS eg_gc_service_audit (
	connection_id varchar(64) NOT NULL,
	connectioncategory varchar(32) NULL,
	connectiontype varchar(32) NULL,
	connectionexecutiondate int8 NULL,
	appcreateddate int8 NULL,
	detailsprovidedby varchar(256) NULL,
	estimationfilestoreid varchar(256) NULL,
	sanctionfilestoreid varchar(256) NULL,
	createdby varchar(64) NULL,
	lastmodifiedby varchar(64) NULL,
	createdtime int8 NULL,
	lastmodifiedtime int8 NULL,
	estimationletterdate int8 NULL,
	disconnectionexecutiondate int8 NULL,
	propertyid varchar(64) NULL,
	CONSTRAINT eg_gc_service_connection_id_fkey FOREIGN KEY (connection_id) REFERENCES public.eg_gc_connection(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS index_eg_gc_service_audit_appCreatedDate ON eg_gc_service_audit (appCreatedDate);


CREATE SEQUENCE SEQ_GC_CON_ID
    START WITH 1
    INCREMENT BY 1



CREATE SEQUENCE SEQ_GC_APP_ID
    START WITH 1
    INCREMENT BY 1


    CREATE SEQUENCE DC_SEQ_GC_APP_ID
        START WITH 1
        INCREMENT BY 1