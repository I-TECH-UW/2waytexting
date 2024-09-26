select a.uuid,z."Person Name", z."Enrollment Date", z."Language", 
  CASE WHEN b."patient_id" IS NULL THEN 'No' ELSE 'Yes' END AS "Day 2 SMS Receieved",
  CASE WHEN n."patient_id" IS NULL THEN 'No' ELSE 'Yes' END AS "Day 2 SMS Replied Same Day",
  CASE WHEN s."patient_id" IS NULL THEN 'No' ELSE 'Yes' END AS "Day 2 SMS within one Day",
  CASE WHEN v."Person Name" IS NULL THEN 'No' ELSE 'Yes' END AS "Day 2 SMS Nurse Followup Text",
  CASE WHEN d."patient_id" IS NULL THEN 'No' ELSE 'Yes' END AS "Day 7 SMS Receieved",
  CASE WHEN q."patient_id" IS NULL THEN 'No' ELSE 'Yes' END AS "Day 7 SMS Replied Same Day",
  CASE WHEN u."patient_id" IS NULL THEN 'No' ELSE 'Yes' END AS "Day 7 SMS within one Day",
  CASE WHEN w."Person Name" IS NULL THEN 'No' ELSE 'Yes' END AS "Day 7 SMS Nurse Followup Text",
  CASE WHEN e."patient_id" IS NULL THEN 'No' ELSE 'Yes' END AS "Day 14 Client Visit",
  CASE WHEN f."ae_reported_forms" IS NULL THEN 0 ELSE f."ae_reported_forms" END AS "SMS Suspected AE",
  CASE WHEN g."ae_reported_confirmed_forms" IS NULL THEN 0 ELSE g."ae_reported_confirmed_forms" END AS "AE Confirmed",
  CASE WHEN h."all_submitted_reports" IS NULL THEN 0 ELSE h."all_submitted_reports" END AS "Total number of responses per person"
from (
SELECT 
    doc ->> '_id' AS "uuid"
  FROM couchdb c
    WHERE 
      doc ->> 'type' = 'person'
      AND replace((doc #> '{parent, _id}')::TEXT, '"', '') = 'b16d3190-843d-415b-b8f1-6e37863cbb3d'
     GROUP BY "uuid"
) a
LEFT JOIN
(
 SELECT 
    doc ->> '_id' AS "uuid",
    initcap(replace((doc ->> 'name')::text, '"', '')) AS "Person Name",
    initcap(replace((doc ->> 'language_preference')::text, '"', '')) AS "Language",
    replace((doc ->> 'phone')::text, '"', '') as "phone",
    to_timestamp((NULLIF(c.doc ->> 'reported_date', '')::BIGINT)/1000) AS "Enrollment Date"
  FROM couchdb c
    WHERE 
      doc ->> 'type' = 'person'
      AND replace((doc #> '{parent, _id}')::TEXT, '"', '') = 'b16d3190-843d-415b-b8f1-6e37863cbb3d'
) z
ON a."uuid" = z."uuid"
LEFT JOIN 
(
SELECT 
replace((doc #> '{fields, patient_id}')::text, '"', '') AS "patient_id",
to_timestamp((NULLIF(c.doc ->> 'reported_date', '')::BIGINT)/1000)::date AS "SendDate"
 FROM couchdb c
    WHERE 
    doc ->> 'form' = 'day2_sms'
      AND doc ->> 'type' = 'data_record'
) b
ON a.uuid = b.patient_id
LEFT JOIN
(
select m.patient_id, m."SendDate" as SendDate, count(*) as all_submitted_reports FROM(
SELECT 
    replace((doc #> '{contact, _id}')::text, '"', '') AS "patient_id",
    count(*) as all_submitted_reports,
    to_timestamp((NULLIF(c.doc ->> 'reported_date', '')::BIGINT)/1000)::date AS "SendDate"
    FROM couchdb c
    WHERE 
        (doc ->> 'form' = '1' OR doc ->> 'form' = '0' )
          AND doc ->> 'type' = 'data_record'
    GROUP BY replace((doc #> '{contact, _id}')::text, '"', ''),to_timestamp((NULLIF(c.doc ->> 'reported_date', '')::BIGINT)/1000)::date
    ) m
group by patient_id, SendDate
) n
ON a.uuid = n.patient_id AND b."SendDate" = n.SendDate

LEFT JOIN
(
select r.patient_id, r."SendDate" as SendDate, count(*) as all_submitted_reports FROM(
SELECT 
    replace((doc #> '{contact, _id}')::text, '"', '') AS "patient_id",
    count(*) as all_submitted_reports,
    (to_timestamp((NULLIF(c.doc ->> 'reported_date', '')::BIGINT)/1000)::date + interval '1' day) AS "SendDate"
    FROM couchdb c
    WHERE 
        (doc ->> 'form' = '1' OR doc ->> 'form' = '0' )
          AND doc ->> 'type' = 'data_record'
    GROUP BY replace((doc #> '{contact, _id}')::text, '"', ''),(to_timestamp((NULLIF(c.doc ->> 'reported_date', '')::BIGINT)/1000)::date + interval '1' day)
    ) r
group by patient_id, SendDate
) s
ON a.uuid = s.patient_id AND b."SendDate" = s.SendDate

LEFT JOIN
(
  SELECT
  initcap(replace((doc ->> 'sent_by')::text, '"', '')) AS "Person Name",
  replace((doc #> '{tasks,0, messages,0, message}')::TEXT, '"', '') AS "le_message",
  replace((doc #> '{tasks,0, messages,0, to}')::TEXT, '"', '') AS "to",
  replace((doc #> '{tasks,0, messages,0, contact, _id}')::TEXT, '"', '') AS "to_uuid"
  FROM couchdb c
  WHERE replace((doc ->> 'kujua_message')::text, '"', '') = 'true'
  AND replace((doc ->> 'sent_by')::text, '"', '') != ''
  AND replace((doc #> '{tasks,0, messages,0, message}')::TEXT, '"', '') like '%rechi 2%'
  or  replace((doc #> '{tasks,0, messages,0, message}')::TEXT, '"', '') like '%day 2%'

) v 
ON a.uuid = v."to_uuid"
LEFT JOIN
(
  SELECT 
  replace((doc #> '{fields, patient_id}')::text, '"', '') AS "patient_id",
  to_timestamp((NULLIF(c.doc ->> 'reported_date', '')::BIGINT)/1000)::date AS "SendDate"
  FROM couchdb c
    WHERE 
    doc ->> 'form' = 'day7_sms'
      AND doc ->> 'type' = 'data_record'
) d

ON a.uuid = d.patient_id

LEFT JOIN
(
select p.patient_id, p."SendDate" as SendDate, count(*) as all_submitted_reports FROM(
SELECT 
    replace((doc #> '{contact, _id}')::text, '"', '') AS "patient_id",
    count(*) as all_submitted_reports,
    to_timestamp((NULLIF(c.doc ->> 'reported_date', '')::BIGINT)/1000)::date AS "SendDate"
    FROM couchdb c
    WHERE 
        (doc ->> 'form' = '1' OR doc ->> 'form' = '0' )
          AND doc ->> 'type' = 'data_record'
    GROUP BY replace((doc #> '{contact, _id}')::text, '"', ''),to_timestamp((NULLIF(c.doc ->> 'reported_date', '')::BIGINT)/1000)::date
    ) p
group by patient_id, SendDate
) q
ON d.patient_id = q.patient_id AND d."SendDate" = q.SendDate
LEFT JOIN
(
select t.patient_id, t."SendDate" as SendDate, count(*) as all_submitted_reports FROM(
SELECT 
    replace((doc #> '{contact, _id}')::text, '"', '') AS "patient_id",
    count(*) as all_submitted_reports,
    (to_timestamp((NULLIF(c.doc ->> 'reported_date', '')::BIGINT)/1000)::date + interval '1' day) AS "SendDate"
    FROM couchdb c
    WHERE 
        (doc ->> 'form' = '1' OR doc ->> 'form' = '0' )
          AND doc ->> 'type' = 'data_record'
    GROUP BY replace((doc #> '{contact, _id}')::text, '"', ''),(to_timestamp((NULLIF(c.doc ->> 'reported_date', '')::BIGINT)/1000)::date + interval '1' day)
    ) t
group by patient_id, SendDate
) u
ON a.uuid = u.patient_id AND b."SendDate" = u.SendDate
LEFT JOIN
(
  SELECT
  initcap(replace((doc ->> 'sent_by')::text, '"', '')) AS "Person Name",
  replace((doc #> '{tasks,0, messages,0, message}')::TEXT, '"', '') AS "le_message",
  replace((doc #> '{tasks,0, messages,0, to}')::TEXT, '"', '') AS "to",
  replace((doc #> '{tasks,0, messages,0, contact, _id}')::TEXT, '"', '') AS "to_uuid"
  FROM couchdb c
  WHERE replace((doc ->> 'kujua_message')::text, '"', '') = 'true'
  AND replace((doc ->> 'sent_by')::text, '"', '') != ''
  AND replace((doc #> '{tasks,0, messages,0, message}')::TEXT, '"', '') like '%rechi 7%'
  or  replace((doc #> '{tasks,0, messages,0, message}')::TEXT, '"', '') like '%day 7%'

) w 
ON a.uuid = w."to_uuid"
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
(select x.patient_id, count(*) as ae_reported_forms FROM(
SELECT 
    replace((doc #> '{contact, _id}')::text, '"', '') AS "patient_id",
    count(*) as ae_submitted_reports,
    to_timestamp((NULLIF(c.doc ->> 'reported_date', '')::BIGINT)/1000)::date AS "SendDate"
    FROM couchdb c
    WHERE 
        (doc ->> 'form' = '1')
          AND doc ->> 'type' = 'data_record'
    GROUP BY replace((doc #> '{contact, _id}')::text, '"', ''),to_timestamp((NULLIF(c.doc ->> 'reported_date', '')::BIGINT)/1000)::date
    ) x
group by patient_id
) f
ON a.uuid = f.patient_id
LEFT JOIN
(select x.patient_id, count(*) as ae_reported_confirmed_forms FROM(
SELECT 
    replace((doc #> '{contact, _id}')::text, '"', '') AS "patient_id",
    count(*) as ae_submitted_reports,
    to_timestamp((NULLIF(c.doc ->> 'reported_date', '')::BIGINT)/1000)::date AS "SendDate"
    FROM couchdb c
    WHERE 
        (doc ->> 'form' = '1' and doc->>'verified' = 'true')
          AND doc ->> 'type' = 'data_record'
    GROUP BY replace((doc #> '{contact, _id}')::text, '"', ''),to_timestamp((NULLIF(c.doc ->> 'reported_date', '')::BIGINT)/1000)::date
    ) x
group by patient_id

) g
ON a.uuid = g.patient_id
LEFT JOIN
(
select x.patient_id, count(*) as all_submitted_reports FROM(
SELECT 
    replace((doc #> '{contact, _id}')::text, '"', '') AS "patient_id",
    count(*) as all_submitted_reports,
    to_timestamp((NULLIF(c.doc ->> 'reported_date', '')::BIGINT)/1000)::date AS "SendDate"
    FROM couchdb c
    WHERE 
        (doc ->> 'form' = '1' OR doc ->> 'form' = '0' )
          AND doc ->> 'type' = 'data_record'
    GROUP BY replace((doc #> '{contact, _id}')::text, '"', ''),to_timestamp((NULLIF(c.doc ->> 'reported_date', '')::BIGINT)/1000)::date
    ) x
group by patient_id
) h
ON a.uuid = h.patient_id
