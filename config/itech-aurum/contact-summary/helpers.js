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

function isOnOrBeforeDays(contact = {}, report = {}, daysRange) {
  let lastSeenDiff, reportDaysDiff;
  if (contact.last_seen) {
    lastSeenDiff = dateDiffInDays(new Date(contact.last_seen).getTime(), contact.reported_date);
  } else {
    reportDaysDiff = dateDiffInDays(contact.reported_date, report.reported_date);
  }
  const daysDiff = lastSeenDiff || reportDaysDiff;
  if (daysDiff <= daysRange[0]) {
    return false;
  }
  if (daysDiff >= daysRange[1]) {
    return false;
  }
  return true;
}

module.exports = { getAESuspectedReports, getAEReportedReports, isOnOrBeforeDays };