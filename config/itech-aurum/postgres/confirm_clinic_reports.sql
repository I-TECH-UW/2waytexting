SELECT
b.study_no,
to_char(to_date(b.enrollment_date_format1, 'DD-MM-YYYY')::date, 'Mon dd, yyyy') as client_enrollment_date,
to_char(a.reported_date, 'Mon dd, yyyy' as "Confirm Clinic Visit Report Submit Date",
a.visit_date as "Visit Date",
a.trace as "Client Referred for Patient Tracing",
a.explanation,
a.comments

FROM
(SELECT 
    uuid,
patient_id,
return,
visit_date,
trace,
explanation,
comments,
reported_date
FROM 
confirm_clinic_visit
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

ORDER BY b.study_no, "Confirm Clinic Visit Report Submit Date" ASC