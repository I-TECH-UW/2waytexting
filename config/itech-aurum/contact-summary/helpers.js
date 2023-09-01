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
function getAESuspectedReports(allReports) {
  return allReports.filter(report => (['1', '0']).includes(report.form));
}

function getAEReportedReports(allReports) {
  return allReports.filter(report => (report.form === 'potential_ae'));
}

function dateDiffInDays(date1, data2) {
  const hours = Math.ceil((date1 - data2) / (1000 * 60 * 60));
  const days = hours / 24;
  return hours < 24 ? 1 : Math.ceil(days);
}

/**
*@param {Contact} contact
* @returns {number[]} 
*/
function lastSeenFromLogs(contact) {
  const logs = contact.last_seen_log;
  try {
    const logsStringToArray = JSON.parse(logs).split(';').map(log => JSON.parse(log));
    const daysActive = logsStringToArray.map(log => dateDiffInDays(new Date(log.time).getTime(), new Date(contact.reported_date).getTime()));
    console.log('Days active', daysActive, logsStringToArray);
    return [...new Set(daysActive)];
  } catch (error) {
    console.log('Error in last seen log', error);
    return null;
  }
}
/**
 * 
 * @param {Contact} contact 
 * @param {Report} report 
 * @param {*} daysRange 
 * @returns 
 */
// function isOnOrBeforeDays(contact, report = {}, daysRange) {
//   let daysDiff;

//   daysDiff = new Date(contact.last_seen).getTime() <= new Date(report.reported_date).getTime() ? dateDiffInDays(new Date(contact.reported_date).getTime(), new Date(contact.last_seen).getTime()) : dateDiffInDays(contact.reported_date, report.reported_date);
//   console.log('Days diff', daysDiff, daysRange);
//   if (daysDiff <= daysRange[0]) {
//     return false;
//   }
//   if (daysDiff >= daysRange[1]) {
//     return false;
//   }
//   return true;
// }
/**
 * 
 * @param {Contact} contact
 * @param {Report[]} reports 
 */

function getAEReportDays(contact, reports) {
  const days = [];
  reports.forEach(report => {
    const daysDiff = dateDiffInDays(new Date(report.reported_date).getTime(), new Date(contact.reported_date).getTime());
    days.push(daysDiff);
  });
  return days;
}

module.exports = {
  getAESuspectedReports,
  getAEReportedReports,
  getAEReportDays,
  lastSeenFromLogs,
  dateDiffInDays
};