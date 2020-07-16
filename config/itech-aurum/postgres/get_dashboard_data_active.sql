/* ###########################################*/
/* ########## Nepas Zazic - SMS ENGAGEMENT ########*/
/* ###########################################*/

/*
Steps included in this script
- create function get_dashboard_data_active
*/


/* Notes:

Modified - disagg. by district hospital

*/


DROP FUNCTION IF EXISTS get_dashboard_data_active(param_facility_group_by text, param_num_units text, param_interval_unit text, param_include_current boolean);
CREATE FUNCTION get_dashboard_data_active(param_facility_group_by text, param_num_units text default '12', param_interval_unit text default 'month', param_include_current boolean default 'true')

	RETURNS TABLE(
				district_hospital_uuid text,
				district_hospital_name text,
				health_center_uuid text,
				health_center_name text,
				clinic_uuid text,
				clinic_name text,
				period_start date,
				period_start_epoch numeric,
				facility_join_field text,	
				count_reported_by numeric,
				count_any_interaction numeric,
				count_total_forms numeric,
				count_error_forms numeric		
	) AS
	
$BODY$

	WITH period_CTE AS
		(
			SELECT generate_series(date_trunc(param_interval_unit,
				now() - (param_num_units||' '||param_interval_unit)::interval), 
									
				CASE
					WHEN param_include_current 
					THEN now() 
					ELSE now() - ('1 ' || param_interval_unit)::interval
				END, 
									
				('1 '||param_interval_unit)::interval
		)::date AS start
		)
	
--######################
--MAIN QUERY STARTS HERE
--######################

SELECT

	CASE
		WHEN param_facility_group_by = 'clinic' OR param_facility_group_by = 'health_center' OR param_facility_group_by = 'district_hospital'
		THEN place_period.district_hospital_uuid
		ELSE 'All'
	END AS _district_hospital_uuid,	
	CASE
		WHEN param_facility_group_by = 'clinic' OR param_facility_group_by = 'health_center' OR param_facility_group_by = 'district_hospital'
		THEN place_period.district_hospital_name
		ELSE 'All'
	END AS _district_hospital_name,
	
	CASE
		WHEN param_facility_group_by = 'clinic' OR param_facility_group_by = 'health_center'
		THEN 'All'
		ELSE 'All'
	END AS _health_center_uuid,			
	CASE
		WHEN param_facility_group_by = 'clinic' OR param_facility_group_by = 'health_center'
		THEN 'All'
		ELSE 'All'
	END AS _health_center_name,
		
	CASE
		WHEN param_facility_group_by = 'clinic'
		THEN 'All'
		ELSE 'All'
	END AS _clinic_uuid,
	CASE
		WHEN param_facility_group_by = 'clinic'
		THEN 'All'
		ELSE 'All'
	END AS _clinic_name,

	place_period.period_start AS _period_start,
	date_part('epoch',place_period.period_start)::numeric AS _period_start_epoch,
	
	CASE
		WHEN param_facility_group_by = 'district_hospital'
			THEN place_period.district_hospital_uuid
		ELSE
			'All'
	END AS _facility_join_field,
	SUM(COALESCE(district_hospital.count_reported_by,0)) AS count_reported_by,
	SUM(COALESCE(district_hospital.count_any_interaction,0)) AS count_any_interaction,
	SUM(COALESCE(district_hospital.count_total_forms,0)) AS count_total_forms,
	SUM(COALESCE(district_hospital.count_error_forms,0)) AS count_error_forms
	
	
FROM
	(
		SELECT
			district_hospital.uuid AS district_hospital_uuid,
			district_hospital.name AS district_hospital_name,
			--health_center.uuid AS health_center_uuid,
			--health_center.name AS health_center_name
			--chw.uuid AS chw_uuid,
			--chw.name AS chw_name
			period_CTE.start AS period_start
			
		FROM
			period_CTE,	
			--contactview_metadata AS chw 
			--INNER JOIN 
			contactview_metadata AS district_hospital 
			--ON (chw.parent_uuid = district_hospital.uuid)
					
		WHERE
			district_hospital.type ='district_hospital' 
			AND district_hospital.parent_uuid IS NULL
						 	
	) AS place_period
	
	
LEFT JOIN /* CHWs Engagement */
	
	(
SELECT
			doc#>>'{contact,parent,_id}' AS reported_by_parent,
			--doc #>> '{contact,_id}' AS reported_by,
			date_trunc(param_interval_unit,to_timestamp((NULLIF(doc ->> 'reported_date'::text, ''::text)::bigint / 1000)::double precision))::date AS period_reported,
			count(distinct(doc#>>'{contact,_id}')) AS count_reported_by,
			count(*) AS count_any_interaction,
			
				SUM(
					CASE
						WHEN doc ? 'form' AND (doc->>'form') IS NOT NULL 
						THEN 1
						ELSE 0
					END
				) AS count_total_forms,
				
				SUM(
					CASE
						WHEN doc ? 'form' AND (doc->>'form') IS NOT NULL AND (doc->>'errors') = '[]'
						THEN 1
						ELSE 0
					END
				) AS count_valid_forms,
				
				SUM(
					CASE
						WHEN doc ? 'form' AND (doc->>'form') IS NOT NULL AND (doc->>'errors') <> '[]'
						THEN 1
						ELSE 0
					END
				) AS count_error_forms
		
		FROM
			couchdb
			--INNER JOIN contactview_metadata AS contact ON (contact.uuid = doc#>>'{contact,_id}')
			--INNER JOIN contactview_metadata AS parent ON (parent.uuid = doc#>>'{contact,parent,_id}')
	
			
		WHERE
			doc->>'type' = 'data_record'
			AND (doc#>>'{contact,_id}') IS NOT NULL
			AND (doc#>>'{contact,parent,_id}') IS NOT NULL
			--AND parent.type = 'district_hospital'
			
		GROUP BY
			period_reported,
			reported_by_parent

				
		) AS district_hospital ON (place_period.period_start = district_hospital.period_reported AND place_period.district_hospital_uuid = district_hospital.reported_by_parent)
																												
		
GROUP BY
		
	_district_hospital_uuid,
	_district_hospital_name,
	_health_center_uuid,
	_health_center_name,
	_clinic_uuid,
	_clinic_name,
	_period_start,
	_period_start_epoch,
	_facility_join_field
		
ORDER BY
	
	_district_hospital_name,
	_health_center_name,
	_clinic_name,
	_period_start	
			
$BODY$
LANGUAGE 'sql' STABLE;
ALTER FUNCTION get_dashboard_data_active(text,text,text,boolean) OWNER TO full_access;
