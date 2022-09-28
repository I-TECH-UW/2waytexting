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

const fields = [
    { appliesToType: ['person', 'nurse'], appliesIf: isNurse, label: 'contact.profile.nurse', value: '', width: 12 },
    { appliesToType: 'person', appliesIf: isNotNurse, label: 'person.field.is_minor', value: isMinor ? 'Yes' : 'No', width: 4 },
    { appliesToType: 'person', appliesIf: isNotNurse, label: 'person.field.phone', value: thisContact.phone, width: 4, filter: 'phone' },
    { appliesToType: 'person', appliesIf: isNotNurse, label: 'person.field.alternate_phone', value: thisContact.alternative_phone, width: 4, filter: 'phone' },
    { appliesToType: 'person', appliesIf: isNotNurse, label: 'contact.dob', value: thisContact.dob, width: 4, filter: 'date' },
    { appliesToType: 'person', appliesIf: isNotNurse, label: 'contact.days_since_enrollment', value: daysSinceEnrollment, width: 4 },
    { appliesToType: 'person', appliesIf: isNotNurse, label: 'contact.enrollment_date', value: contact.reported_date, width: 4, filter: 'date' },
    { appliesToType: 'person', appliesIf: isNotNurse, label: 'person.field.language_preference', value: thisContact.language_preference, width: 8 },
    { appliesToType: ['clinic', 'health_center', 'district_hospital'], label: 'Contact', value: thisContact.contact && thisContact.contact.name, width: 4 },
    { appliesToType: ['clinic', 'health_center', 'district_hospital'], label: 'contact.phone_number', value: thisContact.contact && thisContact.contact.phone, width: 4 },
    { appliesToType: ['clinic', 'health_center', 'district_hospital'], label: 'External ID', value: thisContact.external_id, width: 4 },
    { appliesToType: ['clinic', 'health_center', 'district_hospital'], appliesIf: function () { return thisContact.parent && thisLineage[0]; }, label: 'contact.parent', value: thisLineage, filter: 'lineage' }
];

if (isMinor) {
    fields.push({ appliesToType: 'person', appliesIf: isNotNurse, label: 'person.field.phone_owner', value: thisContact.phone_owner, width: 4 });
}

fields.push({ appliesToType: 'person', label: 'contact.parent', value: thisLineage, filter: 'lineage', width: 12 });
const cards = [];

if (isPatient()) {
    const smsStatusCard = getSMSStatusCard(contact, reports, daysSinceEnrollment);
    cards.push(smsStatusCard);
}

module.exports = {
    fields: fields,
    cards
};
