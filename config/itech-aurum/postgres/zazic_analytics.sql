select a.uuid,a."Person Name", a."enrollment_date", a."Randomization", a."Language",a."Day 1",j.reported_date as reported_date1, 
  CASE WHEN j."patient_id" IS NULL THEN 'No AE' ELSE 'AE' END AS "Day 1",
  CASE WHEN b."patient_id" IS NULL THEN 'No' ELSE 'Yes' END AS "Day 2 SMS Receieved",
  CASE WHEN d."patient_id" IS NULL THEN 'No' ELSE 'Yes' END AS "Day 7 SMS Receieved",
  CASE WHEN e."patient_id" IS NULL THEN 'No' ELSE 'Yes' END AS "Day 14 Client Visit",
  CASE WHEN k."patient_id" IS NULL THEN 'No' ELSE 'Yes' END AS "Day 42 Client Visit",
  CASE WHEN f."ae_reported_forms" IS NULL THEN 0 ELSE f."ae_reported_forms" END AS "SMS Suspected AE",
  CASE WHEN g."ae_reported_confirmed_forms" IS NULL THEN 0 ELSE g."ae_reported_confirmed_forms" END AS "AE Confirmed",
  CASE WHEN h."all_submitted_reports" IS NULL THEN 0 ELSE h."all_submitted_reports" END AS "Total number of responses per person"
from (SELECT 
    doc ->> '_id' AS "uuid",
    initcap(replace((doc ->> 'name')::text, '"', '')) AS "Person Name",
    to_timestamp((NULLIF(c.doc ->> 'reported_date', '')::BIGINT)/1000) AS "enrollment_date",
    initcap(replace((doc ->> 'randomization')::text, '"', '')) AS "Randomization"
    to_timestamp((NULLIF(c.doc ->> 'reported_date', '')::BIGINT)/1000)+ interval '1' day AS "Day 1",
    initcap(replace((doc ->> 'language_preference')::text, '"', '')) AS "Language"
  FROM couchdb c
    WHERE 
      doc ->> 'type' = 'person'
      AND replace((doc #> '{parent, _id}')::TEXT, '"', '') = 'b16d3190-843d-415b-b8f1-6e37863cbb3d'
) a
LEFT JOIN
(
  SELECT 
    replace((doc #> '{contact, _id}')::text, '"', '') AS "patient_id",
    to_timestamp((NULLIF(c.doc ->> 'reported_date', '')::BIGINT)/1000) AS "reported_date"
    FROM couchdb c
    WHERE 
        doc ->> 'form' = '1'
        OR doc ->> 'form' = '0'
          AND doc ->> 'type' = 'data_record'
) j
ON a.uuid = j.patient_id
LEFT JOIN 
(
SELECT 
replace((doc #> '{fields, patient_id}')::text, '"', '') AS "patient_id"
 FROM couchdb c
    WHERE 
    doc ->> 'form' = 'day2_sms'
      AND doc ->> 'type' = 'data_record'
) b
ON a.uuid = b.patient_id
LEFT JOIN
(
  SELECT 
  replace((doc #> '{fields, patient_id}')::text, '"', '') AS "patient_id"
  FROM couchdb c
    WHERE 
    doc ->> 'form' = 'day7_sms'
      AND doc ->> 'type' = 'data_record'
) d

ON a.uuid = d.patient_id

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
  replace((doc #> '{fields, patient_id}')::text, '"', '') AS "patient_id"
  FROM couchdb c
    WHERE 
    replace((doc #> '{fields, visit}')::text, '"', '') = 'day42'
      AND doc ->> 'type' = 'data_record'
) k
ON a.uuid = k.patient_id
LEFT JOIN
(
  SELECT 
  replace((doc #> '{fields, patient_id}')::text, '"', '') AS "patient_id"
  FROM couchdb c
    WHERE 
    replace((doc #> '{fields, visit}')::text, '"', '') = 'additional'
      AND doc ->> 'type' = 'data_record'
) l

ON a.uuid = l.patient_id
LEFT JOIN 
(
  SELECT 
  replace((doc #> '{fields, patient_id}')::text, '"', '') AS "patient_id"
  FROM couchdb c
    WHERE 
    replace((doc #> '{fields, visit}')::text, '"', '') = 'day42'
      AND doc ->> 'type' = 'data_record'
)
ON a.uuid = k.patient_id
LEFT JOIN
(
  SELECT 
    replace((doc #> '{contact, _id}')::text, '"', '') AS "patient_id",
    count(*) as ae_reported_forms
    FROM couchdb c
    WHERE 
        doc ->> 'form' = '1'
          AND doc ->> 'type' = 'data_record'
    GROUP BY replace((doc #> '{contact, _id}')::text, '"', '')
) f
ON a.uuid = f.patient_id
LEFT JOIN
(
  SELECT 
    replace((doc #> '{contact, _id}')::text, '"', '') AS "patient_id",
    count(*) as ae_reported_confirmed_forms
    FROM couchdb c
    WHERE 
        doc ->> 'form' = '1' AND 
        doc ->> 'verified' = 'true'
          AND doc ->> 'type' = 'data_record'
    GROUP BY replace((doc #> '{contact, _id}')::text, '"', '')
) g
ON a.uuid = g.patient_id
LEFT JOIN
(
  SELECT 
    replace((doc #> '{contact, _id}')::text, '"', '') AS "patient_id",
    count(*) as all_submitted_reports
    FROM couchdb c
    WHERE 
        (doc ->> 'form' = '1' OR doc ->> 'form' = '0' )
          AND doc ->> 'type' = 'data_record'
    GROUP BY replace((doc #> '{contact, _id}')::text, '"', '')
) h
ON a.uuid = h.patient_id