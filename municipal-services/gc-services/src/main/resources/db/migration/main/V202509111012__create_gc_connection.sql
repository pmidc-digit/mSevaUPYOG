CREATE TABLE IF NOT EXISTS eg_gc_connection (
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
	disconnectionexecutiondate int8 NULL,
	CONSTRAINT eg_gc_connection_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_eg_gc_connection_connectionno_property_id ON public.eg_gc_connection USING btree (connectionno, property_id);
CREATE INDEX IF NOT EXISTS index_eg_gc_connection_applicationno ON public.eg_gc_connection USING btree (applicationno);
CREATE INDEX IF NOT EXISTS index_eg_gc_connection_applicationstatus ON public.eg_gc_connection USING btree (applicationstatus);
CREATE INDEX IF NOT EXISTS index_eg_gc_connection_connectionno ON public.eg_gc_connection USING btree (connectionno);
CREATE INDEX IF NOT EXISTS index_eg_gc_connection_oldconnectionno ON public.eg_gc_connection USING btree (oldconnectionno);
CREATE INDEX IF NOT EXISTS index_eg_gc_connection_property_id ON public.eg_gc_connection USING btree (property_id);
CREATE INDEX IF NOT EXISTS index_eg_gc_connection_tenantid ON public.eg_gc_connection USING btree (tenantid);

CREATE TABLE IF NOT EXISTS eg_gc_service (
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
CREATE INDEX IF NOT EXISTS index_eg_gc_service_appcreateddate ON public.eg_gc_service USING btree (appcreateddate);
CREATE INDEX IF NOT EXISTS index_eg_gc_service_connectioncategory ON public.eg_gc_service USING btree (connectioncategory);
--CREATE INDEX IF NOT EXISTS index_eg_gc_service_usagecategory ON public.eg_gc_service USING btree (usagecategory);

CREATE TABLE public.eg_gc_applicationdocument (
	id varchar(64) NOT NULL,
	tenantid varchar(64) NULL,
	documenttype varchar(64) NULL,
	filestoreid varchar(64) NULL,
	gcid varchar(64) NULL,
	active varchar(64) NULL,
	documentuid varchar(64) NULL,
	createdby varchar(64) NULL,
	lastmodifiedby varchar(64) NULL,
	createdtime int8 NULL,
	lastmodifiedtime int8 NULL,
	CONSTRAINT uk_eg_gc_applicationdocument PRIMARY KEY (id)
);
CREATE INDEX eg_gc_gcid ON public.eg_gc_applicationdocument USING btree (gcid) WITH (deduplicate_items='true');

ALTER TABLE public.eg_gc_applicationdocument ADD CONSTRAINT fk_eg_gc_applicationdocument_connection_id FOREIGN KEY (gcid) REFERENCES public.eg_gc_connection(id);
