SELECT
b.study_no,
to_char(to_date(b.enrollment_date_format1, 'DD-MM-YYYY')::date, 'dd-Mon-yyyy') as client_enrollment_date,
to_char(to_date(a.reported_date, 'DD-MM-YYYY')::date, 'dd-Mon-yyyy') as "0/1 Report Submit Date",
a.days_post_mc as "Days Post Male Circumcision (Clerk Picked)",
date_part('day',age(a.reported_date::timestamp, date_trunc('day', b.enrollment_date)))::int as "Days since Enrollment (Calculated From DB)",
a.symptoms as "Symptoms",
a.client_return as "Did you ask Client to return",
a.explanation as "Explanation - Why not ask client to return",
a.followup_method,
a.followup_request,
a.ae as "In your opinion, did the client describe an AE?",
a.info as "Info provided to client"
FROM
(SELECT 
    uuid,
patient_id,
days_post_mc,
symptoms,
followup_request,
followup_method,
client_return,
ae,
info,
explanation,
reported_date
FROM 
potential_ae
) a

INNER JOIN
 (
	SELECT 
    p.uuid,p.study_no,p.enrollment_date,p.enrollment_date_format1,p.mobile_company,p.language_p,p.randomization
  FROM people p
    WHERE 
      p.uuid != '06f2b862-5b10-464e-ad7f-a162c8da1e2c' AND p.parent = 'b16d3190-843d-415b-b8f1-6e37863cbb3d'
 ) b
 on a.patient_id = b.uuid

ORDER BY b.study_no, "0/1 Report Submit Date" ASC