
CREATE TABLE IF NOT EXISTS egf_accountcodepurpose( 
	id bigint,
	name varchar(256) NOT NULL,
		createdby bigint,
		createddate timestamp without time zone,
		lastmodifiedby bigint,
		lastmodifieddate timestamp without time zone,
		version bigint
);
alter table egf_accountcodepurpose add constraint pk_egf_accountcodepurpose primary key (id);
CREATE SEQUENCE IF NOT EXISTS seq_egf_accountcodepurpose;
