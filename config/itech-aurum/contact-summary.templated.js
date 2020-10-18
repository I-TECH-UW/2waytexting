const thisContact = contact;
const thisLineage = lineage;

const isPatient = () => (thisContact.role === 'patient' || !thisContact.role);


const fields = [
    { appliesToType: ['person'], label: 'person.field.phone', value: thisContact.phone, width: 6, filter: 'phone' },
    { appliesToType: ['person'], appliesIf: isPatient, label: 'person.field.group', value: 'person.field.group.' + thisContact.randomization, width: 6, translate: true  },
    { appliesToType: ['person'], appliesIf: isPatient, label: 'person.field.vmmc_no', value: thisContact.vmmc_no, width: 6  },
    { appliesToType: ['person'], appliesIf: isPatient, label: 'person.field.study_no', value: thisContact.study_no, width: 6  },
    { appliesToType: ['person'], appliesIf: isPatient, label: 'person.field.language', value: 'person.field.language.' + thisContact.language_preference, width: 6, translate: true  },
    { appliesToType: ['person', 'nurse'], label: 'contact.parent', value: thisLineage, filter: 'lineage' },
    { appliesToType: ['district_hospital', 'health_center'], label: 'Contact', value: thisContact.contact && thisContact.contact.name, width: 6 },
    { appliesToType: ['district_hospital', 'health_center'], label: 'person.field.phone', value: thisContact.contact && thisContact.contact.phone, width: 6 },
    { appliesToType: ['district_hospital', 'health_center'], label: 'External ID', value: thisContact.external_id, width: 4 },
    { appliesToType: ['district_hospital', 'health_center'], appliesIf: function () { return thisContact.parent && thisLineage[0]; }, label: 'contact.parent', value: thisLineage, filter: 'lineage' },

];

module.exports = {
    fields: fields
};