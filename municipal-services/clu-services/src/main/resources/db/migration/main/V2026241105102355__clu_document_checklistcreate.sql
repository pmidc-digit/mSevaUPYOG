CREATE TABLE IF NOT EXISTS  public.eg_clu_document_check_list(
    id character varying(64)  NOT NULL,
    documentuid character varying(64),
    applicationno character varying(64),
    tenantid character varying(256),
    action character varying(64),
    remarks character varying(5120),
    createdby character varying(64),
    lastmodifiedby character varying(64),
    createdtime bigint,
    lastmodifiedtime bigint,
    CONSTRAINT uk_eg_clu_document_check_list PRIMARY KEY (id),
    CONSTRAINT fk_eg_clu_document_check_list FOREIGN KEY (documentuid)
        REFERENCES public.eg_clu_document (uuid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);
