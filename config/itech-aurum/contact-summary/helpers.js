function getAESuspectedReports(allReports) {
  return allReports.filter(report => (['1', '0']).includes(report.form));
}

function getAEReportedReports(allReports) {
  return allReports.filter(report => (report.form === 'potential_ae'));
}

function reportDaysAfterEnrollment(contact, report) {
  const hours = Math.ceil((report.reported_date - contact.reported_date) / (1000 * 60 * 60));
  const days = hours / 24;

  return hours < 24 ? 1 : Math.ceil(days);
}

function isOnOrBeforeDays(contact = {}, report = {}, daysRange) {
  const daysDiff = reportDaysAfterEnrollment(contact, report);
  if (daysDiff <= daysRange[0]) {
    return false;
  }
  if (daysDiff >= daysRange[1]) {
    return false;
  }
  return true;
}

module.exports = { getAESuspectedReports, getAEReportedReports, isOnOrBeforeDays };