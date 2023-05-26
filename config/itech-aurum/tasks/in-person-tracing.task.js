const noContactTaskResolver = (contact, report, event, dueDate) => {
  // a tracing form was submitted
  // client reported no AE
  // client reported AE
  // 'client_review', 'client_visit', '0', '1',
  const tracing_submitted = Utils.isFormSubmittedInWindow(
    contact.reports,
    'tracing',
    report.reported_date,
    Utils.addDate(dueDate, event.end + 1).getTime()
  );

  const client_review_submitted = Utils.isFormSubmittedInWindow(
    contact.reports,
    'client_review',
    report.reported_date + 1000,
    Utils.addDate(dueDate, event.end + 1).getTime()
  );

  const client_visit_submitted = Utils.isFormSubmittedInWindow(
    contact.reports,
    'client_visit',
    report.reported_date,
    Utils.addDate(dueDate, event.end + 1).getTime()
  );

  // Todo: contact.last_seen_date will be a more accurate check
  const report_0_submitted = Utils.isFormSubmittedInWindow(
    contact.reports,
    '0',
    report.reported_date,
    Utils.addDate(dueDate, 1).getTime()
  );

  const report_1_submitted = Utils.isFormSubmittedInWindow(
    contact.reports,
    '1',
    report.reported_date,
    Utils.addDate(dueDate, 1).getTime()
  );

  return (
    tracing_submitted ||
    client_review_submitted ||
    client_visit_submitted ||
    report_0_submitted ||
    report_1_submitted
  );
};

const contactLabel = function (contact) {
  return (
    contact.contact.name
  );
};

const InPersonTracingTask = {
  name: 'in-person-tracing',
  icon: 'follow-up',
  title: 'task.in-person-tracing.title',
  appliesTo: 'reports',
  appliesToType: ['client_review'],
  contactLabel,
  appliesIf: (contact, report) => {
    return Utils.getField(report, 'review.tracing_method') === 'no';
  },
  resolvedIf: noContactTaskResolver,
  actions: [
    {
      form: 'tracing',
      label: 'In-Person Tracing',
    },
  ],
  events: [
    {
      days: 0,
      start: 1,
      end: 21,
    },
  ]
};

module.exports = InPersonTracingTask;