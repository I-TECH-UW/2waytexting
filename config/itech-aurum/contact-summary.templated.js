const thisContact = contact;
const thisLineage = lineage;

function isPatient () {
    return thisContact.type === 'person' && (!isNurse() || thisContact.role === 'patient');
}

function reportDaysAfterEnrollment (contact, report) {
    const hours = Math.ceil((report.reported_date - contact.reported_date) / (1000 * 60 * 60 ));
    const days = hours / 24;
    console.log('actual diff ', hours);
    
    return hours < 24 ? 1 : Math.ceil(days);
}

/**
 * 
 * @param {object} contact  
 * @param {object} report 
 * @param {tuple} daysRange [min, max] days after min, on or before max
 * @returns 
 */

function onOrBeforeDays (contact = {}, report = {}, daysRange) {
    const daysDiff = reportDaysAfterEnrollment(report, contact);
    if (daysDiff <= daysRange[0]) {
        return false;
    }
     if (daysDiff > daysRange[1]) {
        return false;
    }
    
    return true;
}

function getSMSStatus (contact, reports) {
    let onOrBeforeDay2 = false;
    let afterDay2 = false;
    reports.forEach(report => {
        if (!onOrBeforeDay2) {
            onOrBeforeDay2 = onOrBeforeDays(contact, report, [0, 4]);
        }
        if (!afterDay2) {
            afterDay2 = onOrBeforeDays(contact, report, [5, 8]);
        }
    });
    return [onOrBeforeDay2, afterDay2];
}

function getAEreports (allReports) {
    return allReports.filter(report => (report.form === 'potential_ae'));
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
    { appliesToType: 'person', appliesIf: isNotNurse,  label: 'person.field.is_minor', value: isMinor ? 'Yes' : 'No', width: 4 },
    { appliesToType: 'person', appliesIf: isNotNurse, label: 'person.field.phone', value: thisContact.phone, width: 4, filter: 'phone' },
    { appliesToType: 'person', appliesIf: isNotNurse, label: 'person.field.alternate_phone', value: thisContact.alternative_phone, width: 4, filter: 'phone' },
    { appliesToType: 'person', appliesIf: isNotNurse, label: 'contact.dob', value: thisContact.dob, width: 4, filter: 'date' },
    { appliesToType: 'person', appliesIf: isNotNurse, label: 'contact.days_since_enrollment', value: daysSinceEnrollment, width: 4 },
    { appliesToType: 'person', appliesIf: isNotNurse, label: 'contact.enrollment_date', value: contact.reported_date, width: 4, filter: 'date' },
    { appliesToType: 'person', appliesIf: isNotNurse,  label: 'person.field.language_preference', value: thisContact.language_preference, width: 8 },
    { appliesToType: ['clinic', 'health_center', 'district_hospital'], label: 'Contact', value: thisContact.contact && thisContact.contact.name, width: 4 },
    { appliesToType: ['clinic', 'health_center', 'district_hospital'], label: 'contact.phone_number', value: thisContact.contact && thisContact.contact.phone, width: 4 },
    { appliesToType: ['clinic', 'health_center', 'district_hospital'], label: 'External ID', value: thisContact.external_id, width: 4 },
    { appliesToType: ['clinic', 'health_center', 'district_hospital'], appliesIf: function () { return thisContact.parent && thisLineage[0]; }, label: 'contact.parent', value: thisLineage, filter: 'lineage' }
];

if (isMinor) {
    fields.push({ appliesToType: 'person', appliesIf: isNotNurse,  label: 'person.field.phone_owner', value: thisContact.phone_owner, width: 4 });
}

fields.push({ appliesToType: 'person', label: 'contact.parent', value: thisLineage, filter: 'lineage', width: 12 });

const cards = [
    {
        label: 'SMS Status',
        appliesToType: ['person'],
        appliesIf: isPatient,
        fields: function () {
            const SMS_RECEIVED = 'Received';
            const SMS_NOT_RECEIVED = 'Not received';
            const fields = [];

            if (daysSinceEnrollment < 2) return;

            if (!reports.length) return;

            const aeReports = getAEreports(reports);
            if (!aeReports.length) return;

            const [onOrBeforeDay2, afterDay2] = getSMSStatus(thisContact, aeReports);

            fields.push({ 
                    appliesToType: 'person', 
                    label: 'Day 2 SMS', 
                    value: onOrBeforeDay2 ? SMS_RECEIVED : SMS_NOT_RECEIVED, 
                    width: 6,
                    icon: onOrBeforeDay2 ? 'on' : 'off'
                });
            if (daysSinceEnrollment >= 7) {
                fields.push({ 
                    appliesToType: 'person', 
                    label: 'Day 7 SMS', 
                    value: afterDay2 ? SMS_RECEIVED : SMS_NOT_RECEIVED, 
                    width: 6, 
                    icon: afterDay2 ? 'on' : 'risk' 
                });
            } 
                
            return fields;
        }
    }
];

module.exports = {
    fields: fields,
    cards
};
