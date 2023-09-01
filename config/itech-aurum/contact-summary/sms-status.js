const {
  getAESuspectedReports,
  lastSeenFromLogs,
  getAEReportDays,
  dateDiffInDays
} = require('./helpers');

const SEEN_ON_DAY_2_START = 0;
const SEEN_ON_DAY_2_END = 4;
const SEEN_AFTER_DAY_2_START = 5;
const SEEN_AFTER_DAY_2_END = 8;

/**
 * @typedef {Object} Contact
 * @property {string} type
 * @property {string} role
 * @property {string} last_seen
 * @property {string} reported_date
 * @property {string} last_seen_logs
 */

/**
 * @typedef {Object} Report
 * @property {string} reported_date 
 */

/**
 * 
 * @param {Contact} contact 
 * @param {Report[]} reports 
 * @returns 
 */
function getSMSStatus(contact, reports) {
  let onOrBeforeDay2 = false;
  let afterDay2 = false;
  if (contact.last_seen_log) {
    const daysSeen = lastSeenFromLogs(contact);
    onOrBeforeDay2 = daysSeen.filter(day => day >= SEEN_ON_DAY_2_START && day <= SEEN_ON_DAY_2_END).length > 0;
    afterDay2 = daysSeen.filter(day => day >= SEEN_AFTER_DAY_2_START && day <= SEEN_AFTER_DAY_2_END).length > 0;

  } else if (reports.length) {
    const reportDays = getAEReportDays(contact, reports);
    onOrBeforeDay2 = reportDays.filter(day => day >= SEEN_ON_DAY_2_START && day <= SEEN_ON_DAY_2_END).length > 0;
    afterDay2 = reportDays.filter(day => day >= SEEN_AFTER_DAY_2_START && day <= SEEN_AFTER_DAY_2_END).length > 0;
  } else if (contact.last_seen) {
    const daysDiff = dateDiffInDays(new Date(contact.reported_date).getTime(), new Date(contact.last_seen).getTime());
    onOrBeforeDay2 = daysDiff >= SEEN_ON_DAY_2_START && daysDiff <= SEEN_ON_DAY_2_END;
    afterDay2 = daysDiff >= SEEN_AFTER_DAY_2_START && daysDiff <= SEEN_AFTER_DAY_2_END;
  }
  console.log('SMS Status', onOrBeforeDay2, afterDay2);
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
  if (daysSinceEnrollment >= 5) {
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