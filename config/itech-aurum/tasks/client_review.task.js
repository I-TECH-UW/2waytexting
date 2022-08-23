const clientReviewTask = {
  name: 'client-review-request',
  icon: 'man-risk',
  title: 'task.client-review-request.title',
  appliesTo: 'reports',
  appliesToType: ['no_contact', 'referral_for_care'],
  actions: [
    {
      form: 'client_review',
      label: 'Client review',
      modifyContent: function (content, contact, report) {
        if (report.form === 'no_contact') {
          content.is_no_contact_ctx = true;
        } else {
          content.is_referral_for_care_ctx = true;
        }
      },
    },
  ],
  events: [
    {
      days: 0,
      start: 1,
      end: 21,
    },
  ],
};

clientReviewTask.appliesIf =  (contact, report) => {
    return (
      report.form === 'referral_for_care' ||
      (report.form === 'no_contact' &&
        Utils.getField(report, 'n.client_ok') === 'no')
    );
  };

clientReviewTask.resolvedIf = (contact, report) => {
  const mostRecentReport = Utils.getMostRecentReport(contact.reports, ['client_review', 'no_contact', 'referral_for_care']);
  if (!mostRecentReport) return false;
  return Utils.isFirstReportNewer(mostRecentReport, report);
};

module.exports = clientReviewTask;
