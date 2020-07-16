CREATE OR REPLACE VIEW public.confirm_clinic_visit
AS SELECT c.doc ->> '_id'::text AS uuid,
    replace((c.doc #> '{fields,patient_id}'::text[])::text, '"'::text, ''::text) AS patient_id,
    replace((c.doc #> '{fields,return}'::text[])::text, '"'::text, ''::text) AS return,
    replace((c.doc #> '{fields,visit_date}'::text[])::text, '"'::text, ''::text) AS visit_date,
    replace((c.doc #> '{fields,trace}'::text[])::text, '"'::text, ''::text) AS followup_method,
    replace((c.doc #> '{fields,explanation}'::text[])::text, '"'::text, ''::text) AS client_return,
    replace((c.doc #> '{fields,comments}'::text[])::text, '"'::text, ''::text) AS client_return,
    to_char(to_timestamp((NULLIF(c.doc ->> 'reported_date'::text, ''::text)::bigint / 1000)::double precision), 'yyyy-MM-dd'::text) AS reported_date
   FROM couchdb c
  WHERE (c.doc ->> 'form'::text) = 'referral_confirmation'::text AND (replace((c.doc #> '{contact,parent,_id}'::text[])::text, '"'::text, ''::text) = 'b16d3190-843d-415b-b8f1-6e37863cbb3d'::text OR replace((c.doc #> '{contact,parent,_id}'::text[])::text, '"'::text, ''::text) = '6780a6cc-df51-444b-8772-e9965dd96f15'::text) AND lower(replace((c.doc #> '{contact,parent,_id}'::text[])::text, '"'::text, ''::text)) !~~ '%fake%'::text;

-- Permissions

ALTER TABLE public.confirm_clinic_visit OWNER TO full_access;
GRANT ALL ON TABLE public.confirm_clinic_visit TO full_access;
