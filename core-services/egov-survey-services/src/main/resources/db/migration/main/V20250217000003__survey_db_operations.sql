CREATE TABLE IF NOT EXISTS public.eg_ss_survey_entity
(
    uuid character varying(128) COLLATE pg_catalog."default" NOT NULL,
    tenantid character varying(128) COLLATE pg_catalog."default" NOT NULL,
    title character varying(60) COLLATE pg_catalog."default" NOT NULL,
    category character varying(128) COLLATE pg_catalog."default",
    description character varying(140) COLLATE pg_catalog."default",
    startdate bigint,
    enddate bigint,
    postedby character varying(128) COLLATE pg_catalog."default",
    active boolean DEFAULT true,
    answerscount bigint DEFAULT 0,
    hasresponded boolean DEFAULT false,
    createdTime bigint,
    lastModifiedTime bigint,
    CONSTRAINT eg_survey_entity_pkey PRIMARY KEY (uuid)
);

CREATE TABLE IF NOT EXISTS public.eg_ss_survey_section
(
    uuid character varying(128) COLLATE pg_catalog."default" NOT NULL,
    surveyuuid character varying(128) COLLATE pg_catalog."default",
    title character varying(128) COLLATE pg_catalog."default",
    weightage integer,
    CONSTRAINT eg_survey_section_pkey PRIMARY KEY (uuid),
    CONSTRAINT eg_survey_section_surveyuuid_fkey FOREIGN KEY (surveyuuid) REFERENCES public.eg_survey_entity (uuid)
);

CREATE TABLE IF NOT EXISTS public.eg_ss_question_weightage
(
    questionuuid character varying(128) COLLATE pg_catalog."default" NOT NULL,
    sectionuuid character varying(128) COLLATE pg_catalog."default" NOT NULL,
    weightage integer,
    qorder integer,
    CONSTRAINT eg_question_weightage_pkey PRIMARY KEY (questionuuid, sectionuuid),
    CONSTRAINT eg_question_weightage_sectionuuid_fkey FOREIGN KEY (sectionuuid) REFERENCES public.eg_survey_section (uuid)
);
