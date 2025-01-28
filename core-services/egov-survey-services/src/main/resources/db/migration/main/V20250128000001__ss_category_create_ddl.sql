CREATE TABLE public.eg_ss_category (
	id varchar(128) NOT NULL,
	"label" varchar(128) NOT NULL,
	tenantid varchar(128) NOT NULL,
	isactive bool NULL,
	createdby varchar(64) NOT NULL,
	lastmodifiedby varchar(64) NOT NULL,
	createdtime bigint NOT NULL,
	lastmodifiedtime bigint NOT NULL,
	CONSTRAINT pk_eg_ss_category_id PRIMARY KEY (id),
    CONSTRAINT uk_eg_ss_category_label_tenantid UNIQUE (label, tenantid)
    );
);