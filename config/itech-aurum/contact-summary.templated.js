const { DateTime } = require('luxon');
const thisContact = contact;
const thisLineage = lineage;
const allReports = reports;

const isPatient = () => (thisContact.role === 'patient' || !thisContact.role);
const context = {
    isContact: 'yes'
};


const fields = [
    { appliesToType: ['person'], label: 'person.field.phone', value: thisContact.phone, width: 6, filter: 'phone' },
    { appliesToType: ['person', 'nurse'], label: 'contact.parent', value: thisLineage, filter: 'lineage' },
    { appliesToType: ['district_hospital', 'health_center'], label: 'Contact', value: thisContact.contact && thisContact.contact.name, width: 6 },
    { appliesToType: ['district_hospital', 'health_center'], label: 'person.field.phone', value: thisContact.contact && thisContact.contact.phone, width: 6 },
    { appliesToType: ['district_hospital', 'health_center'], label: 'External ID', value: thisContact.external_id, width: 4 },
    { appliesToType: ['district_hospital', 'health_center'], appliesIf: function () { return thisContact.parent && thisLineage[0]; }, label: 'contact.parent', value: thisLineage, filter: 'lineage' },

];

const cards = [
    {
        label: 'contact.profile.vmmc',
        appliesToType: ['person'],
        appliesIf: isPatient,
        fields: function () {
            const fields = [];

            fields.push(
                { label: 'contact.profile.vmmc.enrollment_date', value: thisContact.reported_date, filter: 'date', width: 6 },
                { label: 'contact.profile.vmmc.group', value: 'contact.profile.vmmc.group.' + thisContact.randomization, width: 6, translate: true },
                { label: 'contact.profile.vmmc.vmmc_no', value: thisContact.vmmc_no, width: 6 },
                { label: 'contact.profile.vmmc.study_no', value: thisContact.study_no, width: 6 },
                { label: 'contact.profile.vmmc.language', value: 'contact.profile.vmmc.language.' + thisContact.language_preference, width: 6, translate: true }
            );

            if (thisContact.randomization === 'texting') {
                const day2SMSReceived = allReports.some(
                    report => ['0', '1'].includes(report.form) &&
                        report.reported_date >= DateTime.fromMillis(thisContact.reported_date).plus({ day: 2 }).startOf('day') &&
                        report.reported_date <= DateTime.fromMillis(thisContact.reported_date).plus({ day: 2 }).endOf('day')
                );

                const day7SMSReceived = allReports.some(
                    report => ['0', '1'].includes(report.form) &&
                        report.reported_date >= DateTime.fromMillis(thisContact.reported_date).plus({ day: 7 }).startOf('day') &&
                        report.reported_date <= DateTime.fromMillis(thisContact.reported_date).plus({ day: 7 }).endOf('day')
                );

                const latestResponse = allReports.filter(report => ['0', '1'].includes(report.form)).reduce(function (prev, current) {
                    return (prev.reported_date > current.reported_date) ? prev : current;
                }, false);

                fields.push(
                    { label: 'contact.profile.vmmc.day2', value: day2SMSReceived ? 'Yes' : 'No', width: 6 },
                    { label: 'contact.profile.vmmc.day7', value: day7SMSReceived ? 'Yes' : 'No', width: 6 }
                );

                if (latestResponse.form === '1') {
                    fields.push({ label: 'contact.profile.vmmc.pae', value: latestResponse.reported_date, icon: 'risk', filter: 'relativeDate', width: 6 });
                }
            }

            return fields;
        }
    }
];

module.exports = {
    context: context,
    fields: fields,
    cards: cards
};