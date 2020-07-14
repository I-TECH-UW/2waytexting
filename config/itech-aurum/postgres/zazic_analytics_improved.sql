DROP MATERIALIZED VIEW vmmc_clients_data;
CREATE MATERIALIZED VIEW vmmc_clients_data AS
select a.uuid,a.name,a.randomization,a.phone,a.enrollment_date,a.enrollment_date_format1,a.enrollment_date_format2,a.language_p, 
  CASE WHEN a.randomization = 'Routine' THEN 'N/A' WHEN j.formname = '1' THEN 'Potential AE' WHEN j.formname = '0' THEN 'NO AE' ELSE 'NO SMS' END AS day_1,
  CASE WHEN a.randomization = 'Routine' THEN 'N/A' WHEN  v.formname = '1' THEN 'Potential AE' WHEN v.formname = '0' THEN 'NO AE' ELSE 'NO SMS' END AS day_2,
  CASE WHEN a.randomization = 'Routine' THEN 'N/A' WHEN b.patient_id IS NULL THEN 'No' ELSE 'Yes' END AS day_2_sms_received,
  date_part('day',age(b.reported_date::date, a.enrollment_date_format2::date))::INT -2 as day_2_sms_after_x_days,
  CASE WHEN a.randomization = 'Routine' THEN 'N/A' WHEN  k.formname = '1' THEN 'Potential AE' WHEN k.formname = '0' THEN 'NO AE' ELSE 'NO SMS' END AS day_3,
  CASE WHEN a.randomization = 'Routine' THEN 'N/A' WHEN  l.formname = '1' THEN 'Potential AE' WHEN l.formname = '0' THEN 'NO AE' ELSE 'NO SMS' END AS day_4,
  CASE WHEN a.randomization = 'Routine' THEN 'N/A' WHEN  m.formname = '1' THEN 'Potential AE' WHEN m.formname = '0' THEN 'NO AE' ELSE 'NO SMS' END AS day_5,
  CASE WHEN a.randomization = 'Routine' THEN 'N/A' WHEN  n.formname = '1' THEN 'Potential AE' WHEN n.formname = '0' THEN 'NO AE' ELSE 'NO SMS' END AS day_6,
  CASE WHEN a.randomization = 'Routine' THEN 'N/A' WHEN  w.formname = '1' THEN 'Potential AE' WHEN w.formname = '0' THEN 'NO AE' ELSE 'NO SMS' END AS day_7,
  CASE WHEN a.randomization = 'Routine' THEN 'N/A' WHEN  d.patient_id IS NULL THEN 'No' ELSE 'Yes' END AS day_7_sms_received,
  date_part('day',age(d.reported_date::date, a.enrollment_date_format2::date))::INT -7 as day_7_sms_after_x_days,
  CASE WHEN a.randomization = 'Routine' THEN 'N/A' WHEN  p.formname = '1' THEN 'Potential AE' WHEN p.formname = '0' THEN 'NO AE' ELSE 'NO SMS' END AS day_8,
  CASE WHEN a.randomization = 'Routine' THEN 'N/A' WHEN  q.formname = '1' THEN 'Potential AE' WHEN q.formname = '0' THEN 'NO AE' ELSE 'NO SMS' END AS day_9,
  CASE WHEN a.randomization = 'Routine' THEN 'N/A' WHEN  r.formname = '1' THEN 'Potential AE' WHEN r.formname = '0' THEN 'NO AE' ELSE 'NO SMS' END AS day_10,
  CASE WHEN a.randomization = 'Routine' THEN 'N/A' WHEN  s.formname = '1' THEN 'Potential AE' WHEN s.formname = '0' THEN 'NO AE' ELSE 'NO SMS' END AS day_11,
  CASE WHEN a.randomization = 'Routine' THEN 'N/A' WHEN  t.formname = '1' THEN 'Potential AE' WHEN t.formname = '0' THEN 'NO AE' ELSE 'NO SMS' END AS day_12,
  CASE WHEN a.randomization = 'Routine' THEN 'N/A' WHEN  u.formname = '1' THEN 'Potential AE' WHEN u.formname = '0' THEN 'NO AE' ELSE 'NO SMS' END AS day_13,
  CASE WHEN a.randomization = 'Routine' THEN 'N/A' WHEN  x.formname = '1' THEN 'Potential AE' WHEN x.formname = '0' THEN 'NO AE' ELSE 'NO SMS' END AS day_14,
  CASE WHEN e.patient_id IS NULL THEN 'No' ELSE 'Yes' END AS day_14_client_visit,
  CASE WHEN f.ae_reported_forms IS NULL THEN 0 ELSE f.ae_reported_forms END AS sms_suspected_ae,
  CASE WHEN g.all_submitted_reports IS NULL THEN 0 ELSE g.all_submitted_reports END AS total_number_of_responses_per_person,
  CASE WHEN a.parent = 'b16d3190-843d-415b-b8f1-6e37863cbb3d' THEN 'Main Study' WHEN a.parent = '6780a6cc-df51-444b-8772-e9965dd96f15' THEN 'Pilot Study' ELSE 'Test People' END AS which_study
from (SELECT 
    p.uuid,p.name,p.phone,p.enrollment_date_format1,p.enrollment_date_format2,p.enrollment_date,p.language_p,p.randomization,p.parent
  FROM people p
    WHERE 
      p.uuid != '06f2b862-5b10-464e-ad7f-a162c8da1e2c'
) a
LEFT JOIN
(
   SELECT 
    fm.chw AS patient_id,
    to_char(fm.reported, 'dd-MM-yyyy') as reported_date,
    fm.formname as formname
    FROM form_metadata fm
    WHERE 
        (fm.formname = '1'
        OR
        fm.formname = '0')	
) j
ON a.uuid = j.patient_id AND to_char((a.enrollment_date + interval '1 day'), 'dd-MM-yyyy') = j.reported_date
LEFT JOIN
(
   SELECT 
    fm.chw AS patient_id,
    to_char(fm.reported, 'dd-MM-yyyy') as reported_date,
    fm.formname as formname
    FROM form_metadata fm
    WHERE 
        (fm.formname = '1'
        OR
        fm.formname = '0')
) v
ON a.uuid = v.patient_id AND to_char((a.enrollment_date + interval '2 day'), 'dd-MM-yyyy') = v.reported_date
LEFT JOIN 
(
  SELECT 
replace((doc #> '{fields, patient_id}')::text, '"', '') AS "patient_id",
to_char(to_timestamp((NULLIF(c.doc ->> 'reported_date', '')::BIGINT)/1000), 'yyyy-MM-dd') as reported_date
 FROM couchdb c
    WHERE 
    doc ->> 'form' = 'day2_sms'
      AND doc ->> 'type' = 'data_record'
) b
ON a.uuid = b.patient_id
LEFT JOIN
(
   SELECT 
    fm.chw AS patient_id,
    to_char(fm.reported, 'dd-MM-yyyy') as reported_date,
    fm.formname as formname
    FROM form_metadata fm
    WHERE 
        (fm.formname = '1'
        OR
        fm.formname = '0')
) k
ON a.uuid = k.patient_id AND to_char((a.enrollment_date + interval '3 day'), 'dd-MM-yyyy') = k.reported_date
LEFT JOIN
(
   SELECT 
    fm.chw AS patient_id,
    to_char(fm.reported, 'dd-MM-yyyy') as reported_date,
    fm.formname as formname
    FROM form_metadata fm
    WHERE 
        (fm.formname = '1'
        OR
        fm.formname = '0')
) l
ON a.uuid = l.patient_id AND to_char((a.enrollment_date + interval '4 day'), 'dd-MM-yyyy') = l.reported_date
LEFT JOIN
(
   SELECT 
    fm.chw AS patient_id,
    to_char(fm.reported, 'dd-MM-yyyy') as reported_date,
    fm.formname as formname
    FROM form_metadata fm
    WHERE 
        (fm.formname = '1'
        OR
        fm.formname = '0')
) m
ON a.uuid = m.patient_id AND to_char((a.enrollment_date + interval '5 day'), 'dd-MM-yyyy') = m.reported_date
LEFT JOIN
(
   SELECT 
    fm.chw AS patient_id,
    to_char(fm.reported, 'dd-MM-yyyy') as reported_date,
    fm.formname as formname
    FROM form_metadata fm
    WHERE 
        (fm.formname = '1'
        OR
        fm.formname = '0')
) n
ON a.uuid = n.patient_id AND to_char((a.enrollment_date + interval '6 day'), 'dd-MM-yyyy') = n.reported_date
LEFT JOIN
(
   SELECT 
    fm.chw AS patient_id,
    to_char(fm.reported, 'dd-MM-yyyy') as reported_date,
    fm.formname as formname
    FROM form_metadata fm
    WHERE 
        (fm.formname = '1'
        OR
        fm.formname = '0')
) w
ON a.uuid = w.patient_id AND to_char((a.enrollment_date + interval '7 day'), 'dd-MM-yyyy') = w.reported_date
LEFT JOIN
(
  SELECT 
  replace((doc #> '{fields, patient_id}')::text, '"', '') AS "patient_id",
  to_char(to_timestamp((NULLIF(c.doc ->> 'reported_date', '')::BIGINT)/1000), 'yyyy-MM-dd') as reported_date
  FROM couchdb c
    WHERE 
    doc ->> 'form' = 'day7_sms'
      AND doc ->> 'type' = 'data_record'
) d

ON a.uuid = d.patient_id
LEFT JOIN
(
   SELECT 
    fm.chw AS patient_id,
    to_char(fm.reported, 'dd-MM-yyyy') as reported_date,
    fm.formname as formname
    FROM form_metadata fm
    WHERE 
        (fm.formname = '1'
        OR
        fm.formname = '0')
) p
ON a.uuid = p.patient_id AND to_char((a.enrollment_date + interval '8 day'), 'dd-MM-yyyy') = p.reported_date
LEFT JOIN
(
   SELECT 
    fm.chw AS patient_id,
    to_char(fm.reported, 'dd-MM-yyyy') as reported_date,
    fm.formname as formname
    FROM form_metadata fm
    WHERE 
        (fm.formname = '1'
        OR
        fm.formname = '0')
) q
ON a.uuid = q.patient_id AND to_char((a.enrollment_date + interval '9 day'), 'dd-MM-yyyy') = q.reported_date
LEFT JOIN
(
   SELECT 
    fm.chw AS patient_id,
    to_char(fm.reported, 'dd-MM-yyyy') as reported_date,
    fm.formname as formname
    FROM form_metadata fm
    WHERE 
        (fm.formname = '1'
        OR
        fm.formname = '0')
) r
ON a.uuid =r.patient_id AND to_char((a.enrollment_date + interval '10 day'), 'dd-MM-yyyy') = r.reported_date
LEFT JOIN
(
   SELECT 
    fm.chw AS patient_id,
    to_char(fm.reported, 'dd-MM-yyyy') as reported_date,
    fm.formname as formname
    FROM form_metadata fm
    WHERE 
        (fm.formname = '1'
        OR
        fm.formname = '0')
) s
ON a.uuid =s.patient_id AND to_char((a.enrollment_date + interval '11 day'), 'dd-MM-yyyy') = s.reported_date
LEFT JOIN
(
   SELECT 
    fm.chw AS patient_id,
    to_char(fm.reported, 'dd-MM-yyyy') as reported_date,
    fm.formname as formname
    FROM form_metadata fm
    WHERE 
        (fm.formname = '1'
        OR
        fm.formname = '0')
) t
ON a.uuid =t.patient_id AND to_char((a.enrollment_date + interval '12 day'), 'dd-MM-yyyy') = t.reported_date
LEFT JOIN
(
   SELECT 
    fm.chw AS patient_id,
    to_char(fm.reported, 'dd-MM-yyyy') as reported_date,
    fm.formname as formname
    FROM form_metadata fm
    WHERE 
        (fm.formname = '1'
        OR
        fm.formname = '0')
) u
ON a.uuid =u.patient_id AND to_char((a.enrollment_date + interval '13 day'), 'dd-MM-yyyy') = u.reported_date
LEFT JOIN
(
   SELECT 
    fm.chw AS patient_id,
    to_char(fm.reported, 'dd-MM-yyyy') as reported_date,
    fm.formname as formname
    FROM form_metadata fm
    WHERE 
        (fm.formname = '1'
        OR
        fm.formname = '0')
) x
ON a.uuid = x.patient_id AND to_char((a.enrollment_date + interval '14 day'), 'dd-MM-yyyy') = x.reported_date
LEFT JOIN
(
    SELECT 
  replace((doc #> '{fields, patient_id}')::text, '"', '') AS "patient_id"
  FROM couchdb c
    WHERE 
    doc ->> 'form' = 'day14_client_visit'
      AND doc ->> 'type' = 'data_record'
) e

ON a.uuid = e.patient_id
LEFT JOIN
(
  SELECT
  fm.chw AS patient_id,
  count(*) as ae_reported_forms
    FROM form_metadata fm
    WHERE 
        fm.formname = '1'
    GROUP BY fm.chw
) f
ON a.uuid = f.patient_id
LEFT JOIN
(
 SELECT
  fm.chw AS patient_id,
  count(*) as all_submitted_reports
    FROM form_metadata fm
    WHERE 
        fm.formname = '1'
        OR 
         fm.formname = '0'
    GROUP BY fm.chw
) g
ON a.uuid = g.patient_id
GROUP BY uuid,name,randomization,phone,enrollment_date,enrollment_date_format1,enrollment_date_format2,language_p, day_1, day_2, day_2_sms_received, day_2_sms_after_x_days, day_3, day_4, day_5, day_6, day_7, day_7_sms_received, day_7_sms_after_x_days, day_8, day_9, day_10, day_11, day_12, day_13, day_14, day_14_client_visit, sms_suspected_ae, total_number_of_responses_per_person, which_study
;

DROP INDEX IF EXISTS vmmc_clients_data_uuid;
CREATE UNIQUE INDEX vmmc_clients_data_uuid ON vmmc_clients_data USING btree (uuid,name,randomization,phone,enrollment_date,enrollment_date_format1,enrollment_date_format2,language_p, day_1, day_2, day_2_sms_received, day_2_sms_after_x_days, day_3, day_4, day_5, day_6, day_7, day_7_sms_received, day_7_sms_after_x_days, day_8, day_9, day_10, day_11, day_12, day_13, day_14, day_14_client_visit, sms_suspected_ae, total_number_of_responses_per_person, which_study);
ALTER MATERIALIZED VIEW public.vmmc_clients_data OWNER TO full_access;
GRANT ALL ON TABLE public.vmmc_clients_data TO full_access;


DROP VIEW IF EXISTS client_visit;
CREATE VIEW client_visit AS
SELECT 
c.doc ->> '_id' as uuid,
replace((c.doc #> '{fields,patient_id}'::text[])::text, '"'::text, ''::text) AS patient_id,
    replace((c.doc #> '{fields,visit}'::text[])::text, '"'::text, ''::text) AS visit,
    replace((c.doc #> '{fields,ae_severity}'::text[])::text, '"'::text, ''::text) AS ae_severity,
      replace((c.doc #> '{fields,patient_name}'::text[])::text, '"'::text, ''::text) AS client_name,
    replace((c.doc #> '{fields,phone}'::text[])::text, '"'::text, ''::text) AS client_phone_no,
    replace((c.doc #> '{fields,phone_credit}'::text[])::text, '"'::text, ''::text) AS phone_credit,
    replace((c.doc #> '{fields,explanation}'::text[])::text, '"'::text, ''::text) AS why_no_phone_credit,
    replace((c.doc #> '{fields,comments}'::text[])::text, '"'::text, ''::text) AS comments,
    replace((c.doc #> '{fields,visit_date}'::text[])::text, '"'::text, ''::text) AS visit_date_filled,
    to_char(to_timestamp((NULLIF(c.doc ->> 'reported_date'::text, ''::text)::bigint / 1000)::double precision), 'yyyy-MM-dd'::text) AS reported_date
   FROM couchdb c
  WHERE (c.doc ->> 'form'::text) = 'client_visit'::text 
  AND 
  (replace((c.doc #> '{contact,parent,_id}'::text[])::text, '"'::text, ''::text) = 'b16d3190-843d-415b-b8f1-6e37863cbb3d'::text 
  OR 
  replace((c.doc #> '{contact,parent,_id}'::text[])::text, '"'::text, ''::text) = '6780a6cc-df51-444b-8772-e9965dd96f15'::text) 
  AND 
  lower(replace((c.doc #> '{contact,parent,_id}'::text[])::text, '"'::text, ''::text)) !~~ '%fake%'::text
  AND
  replace((c.doc #> '{fields,patient_id}'::text[])::text, '"'::text, ''::text) != ''
UNION

SELECT 
c.doc ->> '_id' as uuid,
replace((c.doc #> '{fields,patient_id}'::text[])::text, '"'::text, ''::text) AS patient_id,
    'day14'::text AS visit,
    replace((c.doc #> '{fields,ae_severity}'::text[])::text, '"'::text, ''::text) AS ae_severity,
      replace((c.doc #> '{fields,patient_name}'::text[])::text, '"'::text, ''::text) AS client_name,
    	replace((c.doc #> '{fields,phone}'::text[])::text, '"'::text, ''::text) AS client_phone_no,
     replace((c.doc #> '{fields,phone_credit}'::text[])::text, '"'::text, ''::text) AS phone_credit,
      replace((c.doc #> '{fields,explanation}'::text[])::text, '"'::text, ''::text) AS why_no_phone_credit,
      replace((c.doc #> '{fields,comments}'::text[])::text, '"'::text, ''::text) AS comments,
        replace((c.doc #> '{fields,visit_date}'::text[])::text, '"'::text, ''::text) AS visit_date_filled,
    to_char(to_timestamp((NULLIF(c.doc ->> 'reported_date'::text, ''::text)::bigint / 1000)::double precision), 'yyyy-MM-dd'::text) AS reported_date
   FROM couchdb c
  WHERE (c.doc ->> 'form'::text) = 'day14_client_visit'::text 
  AND 
  (replace((c.doc #> '{contact,parent,_id}'::text[])::text, '"'::text, ''::text) = 'b16d3190-843d-415b-b8f1-6e37863cbb3d'::text  
  OR replace((c.doc #> '{contact,parent,_id}'::text[])::text, '"'::text, ''::text) = '6780a6cc-df51-444b-8772-e9965dd96f15'::text) 
  AND 
  lower(replace((c.doc #> '{contact,parent,_id}'::text[])::text, '"'::text, ''::text)) !~~ '%fake%'::text
  AND
  replace((c.doc #> '{fields,patient_id}'::text[])::text, '"'::text, ''::text) != ''
;
ALTER TABLE public.client_visit OWNER TO full_access;
GRANT ALL ON TABLE public.client_visit TO full_access;
GRANT ALL ON TABLE public.client_visit TO full_access;


DROP VIEW IF EXISTS potential_ae;
CREATE VIEW potential_ae AS
SELECT 
doc ->>'_id' as uuid,
replace((doc #> '{fields, patient_id}')::text, '"', '') AS "patient_id",
replace((doc #> '{fields, n, days_post_mc}')::text, '"', '') AS "days_post_mc",
replace((doc #> '{fields, n, symptoms}')::text, '"', '') AS "symptoms",
  replace((doc #> '{fields, n, followup_request}')::text, '"', '') AS "followup_request",
    replace((doc #> '{fields, n,followup_method}')::text, '"', '') AS "followup_method",
      replace((doc #> '{fields, n,ae}')::text, '"', '') AS "ae",
        replace((doc #> '{fields, n,info}')::text, '"', '') AS "info",
      replace((doc #> '{fields, n,client_return}')::text, '"', '') AS "client_return",
        replace((doc #> '{fields, n,explanation}')::text, '"', '') AS "explanation",
to_char(to_timestamp((NULLIF(c.doc ->> 'reported_date', '')::BIGINT)/1000), 'yyyy-MM-dd') as reported_date
 FROM couchdb c
    WHERE 
    doc ->> 'form' = 'potential_ae'
    AND 
    (
      replace((doc #> '{contact, parent, _id}')::text, '"', '') = 'b16d3190-843d-415b-b8f1-6e37863cbb3d' 
        OR
      replace((doc #> '{contact, parent, _id}')::text, '"', '') = '6780a6cc-df51-444b-8772-e9965dd96f15' 
    ) 
    AND LOWER(replace((doc #> '{contact, parent, _id}')::text, '"', '')) NOT LIKE '%fake%'
    ;

DROP VIEW IF EXISTS clients_free_text;
CREATE VIEW clients_free_text AS
SELECT 
doc ->>'_id' as uuid,
replace((doc #> '{contact, _id}')::text, '"', '') AS patient_id,
to_char(to_timestamp((NULLIF(c.doc ->> 'reported_date', '')::BIGINT)/1000), 'yyyy-MM-dd') as reported_date,
replace((doc #> '{sms_message, message}')::text, '"', '') as message_contents
 FROM couchdb c
    WHERE 
    doc ->>'form' IS NULL
    AND (doc #> '{sms_message, from}')::text IS NOT NULL
    AND  doc ->> 'type' = 'data_record'
    AND doc ->> 'errors' = '[]'
    AND (doc #> '{contact, _id}')::text IS NOT NULL
    AND 
      (
        replace((doc #> '{contact, parent, _id}')::text, '"', '') = 'b16d3190-843d-415b-b8f1-6e37863cbb3d' 
        OR
        replace((doc #> '{contact, parent, _id}')::text, '"', '') = '6780a6cc-df51-444b-8772-e9965dd96f15'
      )
    AND LOWER(replace((doc #> '{contact, parent, _id}')::text, '"', '')) NOT LIKE '%fake%'
    ;

DROP VIEW IF EXISTS nurses_free_text;
CREATE VIEW nurses_free_text AS
SELECT 
doc ->>'_id' as uuid,
replace((doc->>'sent_by'::text)  , '"', '') AS nurse_username,
replace((doc #> '{tasks, 0, messages, 0, contact, _id}')::text, '"', '') as patient_id,
to_char(to_timestamp((NULLIF(c.doc ->> 'reported_date', '')::BIGINT)/1000), 'yyyy-MM-dd') as reported_date
 FROM couchdb c
    WHERE 
    doc ->>'form' IS NULL
    AND doc->>'sent_by'  IS NOT NULL
    AND  doc ->> 'type' = 'data_record'
    AND doc ->> 'errors' = '[]'
    AND  doc ->> 'kujua_message' IS NOT NULL
    AND 
      (
        replace((doc #> '{tasks, 0, messages, 0, contact, parent,_id}')::text, '"', '') = 'b16d3190-843d-415b-b8f1-6e37863cbb3d' 
        OR
        replace((doc #> '{contact, parent, _id}')::text, '"', '') = '6780a6cc-df51-444b-8772-e9965dd96f15'
      ) 
    AND 
    EXISTS(SELECT name FROM people WHERE uuid = (replace((doc #> '{tasks, 0, messages, 0, contact, _id}')::text, '"', '')) LIMIT 1)
    ;