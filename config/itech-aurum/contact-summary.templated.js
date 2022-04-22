const thisContact = contact;
const thisLineage = lineage;

const isNurse = () => { return contact.contact_type === 'nurse' || !!contact.is_nurse; };
const isNotNurse = () => { return !isNurse(); };
let daysSinceEnrollment;
if (contact.type === 'person' && !isNurse()) {
    const diff = new Date().getTime() - new Date(contact.reported_date).getTime();
    daysSinceEnrollment = Math.floor(Math.abs(Math.round(diff / (1000 * 60 * 60 * 24))));
}

const fields = [
    { appliesToType: ['person', 'nurse'], appliesIf: isNurse, label: 'contact.profile.nurse', value: '', width: 12 },
    { appliesToType: 'person', appliesIf: isNotNurse, label: 'person.field.phone', value: thisContact.phone, width: 6, filter: 'phone' },
    { appliesToType: 'person', appliesIf: isNotNurse, label: 'person.field.alternate_phone', value: thisContact.alternate_phone, width: 6, filter: 'phone' },
    { appliesToType: 'person', appliesIf: isNotNurse, label: 'contact.age', value: thisContact.age_years, width: 4},
    { appliesToType: 'person', appliesIf: isNotNurse, label: 'contact.days_since_enrollment', value: daysSinceEnrollment, width: 4 },
    { appliesToType: 'person', appliesIf: isNotNurse, label: 'contact.enrollment_date', value: contact.enrollment_date, width: 4, filter: 'date' },
    { appliesToType: ['clinic', 'health_center', 'district_hospital'], label: 'Contact', value: thisContact.contact && thisContact.contact.name, width: 4 },
    { appliesToType: ['clinic', 'health_center', 'district_hospital'], label: 'contact.phone_number', value: thisContact.contact && thisContact.contact.phone, width: 4 },
    { appliesToType: ['clinic', 'health_center', 'district_hospital'], label: 'External ID', value: thisContact.external_id, width: 4 },
    { appliesToType: ['clinic', 'health_center', 'district_hospital'], appliesIf: function () { return thisContact.parent && thisLineage[0]; }, label: 'contact.parent', value: thisLineage, filter: 'lineage' }
];
fields.push({ appliesToType: 'person', label: 'contact.parent', value: thisLineage, filter: 'lineage', width: 12 });

module.exports = {
    fields: fields
};
