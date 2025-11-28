CREATE TABLE eg_gc_connection_audit (
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
INCREMENT BY 1;



CREATE SEQUENCE SEQ_GC_APP_ID
START WITH 1
INCREMENT BY 1;


CREATE SEQUENCE DC_SEQ_GC_APP_ID
START WITH 1
INCREMENT BY 1;


ALTER TABLE public.eg_gc_applicationdocument
RENAME COLUMN documentuid TO applicationid;