CREATE OR REPLACE MATERIALIZED VIEW people
AS SELECT c.doc ->> '_id'::text AS uuid,
    initcap(replace(c.doc ->> 'name'::text, '"'::text, ''::text)) AS name,
    initcap(replace(c.doc ->> 'patient_id'::text, '"'::text, ''::text)) AS patient_id,
    replace((c.doc #> '{parent,_id}'::text[])::text, '"'::text, ''::text) AS parent,
    initcap(replace(c.doc ->> 'phone'::text, '"'::text, ''::text)) AS phone,
    to_timestamp((NULLIF(c.doc ->> 'reported_date'::text, ''::text)::bigint / 1000)::double precision) AS enrollment_date,
    to_char(to_timestamp((NULLIF(c.doc ->> 'reported_date'::text, ''::text)::bigint / 1000)::double precision), 'dd-MM-yyyy'::text) AS enrollment_date_format1,
    to_char(to_timestamp((NULLIF(c.doc ->> 'reported_date'::text, ''::text)::bigint / 1000)::double precision), 'yyyy-MM-dd'::text) AS enrollment_date_format2,
    initcap(replace(c.doc ->> 'language_preference'::text, '"'::text, ''::text)) AS language_p,
    initcap(replace(c.doc ->> 'vmmc_no'::text, '"'::text, ''::text)) AS vmmc_no,
    initcap(replace(c.doc ->> 'study_no'::text, '"'::text, ''::text)) AS study_no,
    initcap(replace(c.doc ->> 'randomization'::text, '"'::text, ''::text)) AS randomization,
    initcap(replace(c.doc ->> 'mobile_company'::text, '"'::text, ''::text)) AS mobile_company
   FROM couchdb c
  WHERE (c.doc ->> 'type'::text) = 'person'::text
  and (replace((c.doc #> '{parent,_id}'::text[])::text, '"'::text, ''::text) = 'b16d3190-843d-415b-b8f1-6e37863cbb3d'
  			OR
  	    replace((c.doc #> '{parent,_id}'::text[])::text, '"'::text, ''::text) = '6780a6cc-df51-444b-8772-e9965dd96f15'
    	)
       and LOWER(initcap(replace(c.doc ->> 'name'::text, '"'::text, ''::text))) NOT LIKE '%fake%'
  ;

-- Permissions
CREATE UNIQUE INDEX people_uuid ON people USING btree (uuid);
ALTER MATERIALIZED VIEW public.people OWNER TO full_access;
GRANT ALL ON MATERIALIZED VIEW public.people TO full_access;
GRANT ALL ON MATERIALIZED VIEW public.people TO full_access;