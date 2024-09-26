SELECT date_part('week', le_time::date) AS "Week Number", COUNT(*) as "Number of Messages in Week" FROM
(
SELECT
	initcap(replace((doc ->> 'sent_by')::text, '"', '')) AS "Person Name",
	replace((doc #> '{tasks,0, messages,0, message}')::TEXT, '"', '') AS "le_message",
	replace((doc #> '{tasks,0, state_history,0, timestamp}')::TEXT, '"', '') as le_time
	FROM couchdb c
	WHERE replace((doc ->> 'kujua_message')::text, '"', '') = 'true'
	AND replace((doc ->> 'sent_by')::text, '"', '') != ''
) k
group by weekly