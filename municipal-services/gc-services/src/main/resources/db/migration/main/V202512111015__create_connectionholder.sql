CREATE TABLE IF NOT EXISTS eg_gc_connectionholder(
  tenantId            	CHARACTER VARYING (256),
  connectionid       	CHARACTER VARYING (128) NOT NULL UNIQUE,
  status              	CHARACTER VARYING (128),
  userid              	CHARACTER VARYING (128),
  isprimaryholder      	BOOLEAN,
  connectionholdertype  CHARACTER VARYING (256),
  holdershippercentage 	CHARACTER VARYING (128),
  relationship        	CHARACTER VARYING (128),
  createdby           	CHARACTER VARYING (128),
  createdtime         	BIGINT,
  lastmodifiedby      	CHARACTER VARYING (128),
  lastmodifiedtime    	BIGINT,
  CONSTRAINT fk_eg_gc_connectionholder FOREIGN KEY (connectionid) REFERENCES eg_gc_connection (id)
 );

 CREATE INDEX IF NOT EXISTS eg_gc_connectionholder_connectionid ON public.eg_gc_connectionholder USING btree (connectionid) WITH (deduplicate_items='true');
 CREATE INDEX IF NOT EXISTS index_eg_gc_connectionholder_userid ON public.eg_gc_connectionholder USING btree (userid);