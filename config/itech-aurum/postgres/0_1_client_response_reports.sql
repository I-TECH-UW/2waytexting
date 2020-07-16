SELECT
b.study_no,
to_char(to_date(b.enrollment_date_format1, 'DD-MM-YYYY')::date, 'Mon dd, yyyy') as client_enrollment_date,
to_char(a.reported_date, 'Mon dd, yyyy') as "0/1 Report Submit Date",
a.response as "0/1 Response",
date_part('day',age(a.reported_date, date_trunc('day', b.enrollment_date)))::int as "Days since Enrollment"

FROM
(SELECT 
    fm.chw AS patient_id,
    fm.reported as reported_date,
    case when fm.formname = '0' then '0 - NO AE EXPERIENCED' else '1 - AE EXPERIENCED' end as response
    FROM form_metadata fm
    WHERE 
        (fm.formname = '1'
        OR
        fm.formname = '0')
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