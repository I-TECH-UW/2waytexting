const getSMSStatusCard = require('./contact-summary/sms-status');

const thisContact = contact;
const thisLineage = lineage;

function isPatient() {
    return thisContact.type === 'person' && (!isNurse() || thisContact.role === 'patient');
}

const isNurse = () => { return contact.contact_type === 'nurse' || !!contact.is_nurse; };
const isNotNurse = () => { return !isNurse(); };
const isMinor = contact.is_minor === 'yes';
let daysSinceEnrollment;
if (isPatient) {
    const diff = new Date().getTime() - new Date(contact.reported_date).getTime();
    daysSinceEnrollment = Math.floor(Math.abs(Math.round(diff / (1000 * 60 * 60 * 24))));
}

const showDashboardButton = true;

const fields = [
    { appliesToType: ['person', 'nurse'], appliesIf: isNurse, label: 'contact.profile.nurse', value: '', width: 12 },
    { appliesToType: 'person', appliesIf: isNotNurse, label: 'person.field.is_minor', value: isMinor ? 'Yes' : 'No', width: 4 },
    { appliesToType: 'person', appliesIf: isNotNurse, label: 'person.field.phone', value: thisContact.phone, width: 4, filter: 'phone' },
    { appliesToType: 'person', appliesIf: isNotNurse, label: 'person.field.alternate_phone', value: thisContact.alternative_phone, width: 4, filter: 'phone' },
    { appliesToType: 'person', appliesIf: isNotNurse, label: 'contact.dob', value: thisContact.dob, width: 4, filter: 'date' },
    { appliesToType: 'person', appliesIf: isNotNurse, label: 'contact.days_since_enrollment', value: daysSinceEnrollment, width: 4 },
    { appliesToType: 'person', appliesIf: isNotNurse, label: 'contact.enrollment_date', value: contact.reported_date, width: 4, filter: 'date' },
    { appliesToType: 'person', appliesIf: isNotNurse, label: 'person.field.language_preference', value: thisContact.language_preference, width: 4 },
    { appliesToType: 'person', appliesIf: isNotNurse, label: 'person.field.preferred_channel', value: thisContact.use_whatsapp === 'Yes' ? 'SMS and WhatsApp' : 'SMS Only', width: 4 },
    { appliesToType: 'person', appliesIf: isNotNurse, label: 'contact.last_seen', value: contact.last_seen, width: 4, filter: 'date' },
    { appliesToType: ['clinic', 'health_center', 'district_hospital'], label: 'Contact', value: thisContact.contact && thisContact.contact.name, width: 4 },
    { appliesToType: ['clinic', 'health_center', 'district_hospital'], label: 'contact.phone_number', value: thisContact.contact && thisContact.contact.phone, width: 4 },
    { appliesToType: ['clinic', 'health_center', 'district_hospital'], label: 'External ID', value: thisContact.external_id, width: 4 },
    { appliesToType: ['clinic', 'health_center', 'district_hospital'], appliesIf: function () { return thisContact.parent && thisLineage[0]; }, label: 'contact.parent', value: thisLineage, filter: 'lineage' }
];

if (isMinor) {
    fields.push({ appliesToType: 'person', appliesIf: isNotNurse, label: 'person.field.phone_owner', value: thisContact.phone_owner, width: 4 });
}

fields.push({ appliesToType: ['person', 'nurse'], label: 'contact.parent', value: thisLineage, filter: 'lineage', width: 12 });

if (showDashboardButton)
{
    const dashboardUrl='http://superset.cht.uwdigi.org';
    const dashboardId='1';
    const dashboardFilter='NATIVE_FILTER-4c9bGW7ih';
    const dashboardValue= encodeURIComponent(thisContact.name);
    const dashboardColumn='enrollment_facility';

    const dashboardButton = `<a href="${dashboardUrl}/superset/dashboard/${dashboardId}/?native_filters=(${dashboardFilter}:(__cache:(label:'${dashboardValue}',validateStatus:!f,value:!('${dashboardValue}')),extraFormData:(filters:!((col:${dashboardColumn},op:IN,val:!('${dashboardValue}')))),filterState:(label:'${dashboardValue}',validateStatus:!f,value:!('${dashboardValue}')),id:${dashboardFilter},ownState:()))" target="_blank" rel="noopener"><button mat-flat-button="" color="primary">Open Dashboard <i class="fa fa-line-chart"></i></button></a>`;

    fields.push({ appliesToType: ['clinic', 'health_center', 'district_hospital'], label: '', value: dashboardButton, width: 12, filter:'safeHtml' });
}

const cards = [];

const aeReports = reports.filter(report => report.form === '0' || report.form === '1');
if (isPatient()) {
    const smsStatusCard = getSMSStatusCard(contact, aeReports, daysSinceEnrollment);
    cards.push(smsStatusCard);
}

module.exports = {
    fields: fields,
    cards
};
