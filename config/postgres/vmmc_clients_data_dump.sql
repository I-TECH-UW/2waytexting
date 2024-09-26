select 
study_no, 
a.uuid,
	to_char(to_date(enrollment_date_format1, 'DD-MM-YYYY')::date, 'Mon dd, yyyy') as enrollment_date,
	day_1,
	day_2,
	day_2_sms_received as day_2_CLERK_FILLED_FORM_sms_received,
	day_3,
	day_4,
	day_5,
	day_6,
	day_7,
	day_7_sms_received as day_7_CLERK_FILLED_FORM_sms_received,
	day_8,
	day_9,
	day_10,
	day_11,
	day_12,
	day_13,
	day_14,
	day_14_client_visit,
	sms_suspected_ae,
	total_number_of_responses_per_person,
	which_study
from 

(	SELECT 
	uuid,
	to_char(to_date(enrollment_date_format1, 'DD-MM-YYYY')::date, 'Mon dd, yyyy'),
	day_1,
	day_2,
	day_2_sms_received,
	day_3,
	day_4,
	day_5,
	day_6,
	day_7,
	day_7_sms_received,
	day_8,
	day_9,
	day_10,
	day_11,
	day_12,
	day_13,
	day_14,
	day_14_client_visit,
	sms_suspected_ae,
	total_number_of_responses_per_person,
	which_study
FROM vmmc_clients_data
) a
 INNER JOIN
 (
	SELECT 
    p.uuid,p.study_no,p.enrollment_date_format1,p.mobile_company,p.language_p,p.randomization
  FROM people p
    WHERE 
      p.uuid != '06f2b862-5b10-464e-ad7f-a162c8da1e2c' AND p.parent = 'b16d3190-843d-415b-b8f1-6e37863cbb3d'
 ) b
 on a.uuid = b.uuid

 ORDER BY b.study_no ASC