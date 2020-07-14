select study_no, enrollment_date_format1 as "Enrollment Date", randomization, visit_date_filled as "Visit Date As filled by Clerk", visit_date as "Form Submit Date", visit as "Visit Label", ae_severity, mobile_company, phone_credit as "Phone Card received", why_no_phone_credit as "Why Phone Card Was not given" , comments from 

(	SELECT 
  patient_id, visit, to_char(to_date(visit_date_filled, 'YYYY-MM-DD')::date, 'Mon dd, yyyy') as visit_date_filled, reported_date, to_char(to_date(reported_date, 'YYYY-MM-DD')::date, 'Mon dd, yyyy') as visit_date, ae_severity, phone_credit, why_no_phone_credit, comments 
  FROM client_visit
) a
 INNER JOIN
 (
	SELECT 
    p.uuid,p.study_no,p.enrollment_date_format1,p.mobile_company,p.language_p,p.randomization
  FROM people p
    WHERE 
      p.uuid != '06f2b862-5b10-464e-ad7f-a162c8da1e2c' AND p.parent = 'b16d3190-843d-415b-b8f1-6e37863cbb3d'
 ) b
 on a.patient_id = b.uuid

 ORDER BY a.reported_date ASC