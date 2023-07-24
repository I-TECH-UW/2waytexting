const { getAESuspectedReports, isOnOrBeforeDays } = require('./helpers');

function getSMSStatus(contact, reports) {
  let onOrBeforeDay2 = false;
  let afterDay2 = false;
  reports.forEach(report => {
    if (!onOrBeforeDay2) {
      onOrBeforeDay2 = isOnOrBeforeDays(contact, report, [0, 4]);
    }
    if (!afterDay2) {
      afterDay2 = isOnOrBeforeDays(contact, report, [5, 8]);
    }
  });
  return [onOrBeforeDay2, afterDay2];
}

function getFields(contact, reports, daysSinceEnrollment) {
  const SMS_RECEIVED = 'Received';
  const SMS_NOT_RECEIVED = 'Not received';
  const fields = [];

  const clientReports = getAESuspectedReports(reports);
  if (contact.last_seen) {
    clientReports.push({
      type: 'data_record',
      reported_date: new Date(contact.last_seen).getTime(),
    });
  }
  const [onOrBeforeDay2, afterDay2] = clientReports.length ? getSMSStatus(contact, clientReports) : [false, false];
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

function getSMSStatusCard(contact, reports, daysSinceEnrollment) {

  const smsStatusCard = {
    label: 'SMS Status',
    appliesToType: ['person'],
    appliesIf: true,
    fields: getFields(contact, reports, daysSinceEnrollment),
  };

  return smsStatusCard;
}

module.exports = getSMSStatusCard;