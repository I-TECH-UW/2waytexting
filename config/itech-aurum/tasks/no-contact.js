const { VMMC_NO_CONTACT_TASKS_LIFESPAN } = require('./constants');

console.log(VMMC_NO_CONTACT_TASKS_LIFESPAN);

const noContactTaskResolver = (contact, report, event, dueDate) => {
  const deadline = Utils.addDate(dueDate, 1).getTime();

  if (contact.last_seen_log) {
    const last_seen_log = JSON.parse(contact.last_seen_log);
    const activityArray = last_seen_log.split(';').map((log) => JSON.parse(log));
    const seenInWindow = activityArray.some((log) => {
      const logTime = new Date(log.time).getTime();
      return Utils.isTimely(logTime, deadline);
    });
    return seenInWindow.length > 0;
  }
  if (contact.contact.last_seen) {
    const last_seen = new Date(contact.contact.last_seen).getTime();

    if (Utils.isTimely(last_seen, deadline)) {
      return true;
    }
  }
  const no_contact_submitted = Utils.isFormSubmittedInWindow(
    contact.reports,
    'no_contact',
    report.reported_date,
    Utils.addDate(dueDate, event.end + 1).getTime()
  );

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

  return no_contact_submitted || report_0_submitted || report_1_submitted;
};

const noContactTask = {
  name: 'no-contact',
  icon: 'off',
  title: 'task.no-contact.title',
  appliesTo: 'reports',
  appliesToType: ['enroll', 'client_review'],
  contactLabel: function (contact) {
    return (
      contact.contact.name + ' (' + contact.contact.enrollment_location + ')'
    );
  },
  appliesIf: (contact, report) => {
    return (
      report.form === 'enroll' || Utils.getField(report, 'review.tracing_method') === 'no'
    );
  },
  resolvedIf: noContactTaskResolver,
  actions: [
    {
      form: 'no_contact',
      label: 'No Contact',
      modifyContent: function (content) {
        content.is_task = true;
        content.task_shows_on_day = 8;
      },
    },
  ],
  events: [
    {
      days: 8,
      start: 0,
      end: VMMC_NO_CONTACT_TASKS_LIFESPAN,
    },
  ],
};

const noContactMinorTask = {
  name: 'no-contact-minor',
  icon: 'minor-danger',
  title: 'task.no-contact.title',
  appliesTo: 'reports',
  appliesToType: ['enroll'],
  contactLabel: function (contact) {
    return (
      contact.contact.name + ' (' + contact.contact.enrollment_location + ')'
    );
  },
  appliesIf: (contact) => {
    return contact.contact.is_minor === 'yes';
  },
  resolvedIf: noContactTaskResolver,
  priority: {
    level: 'high',
    label: 'Minor no contact',
  },
  actions: [
    {
      form: 'no_contact',
      label: 'No Contact Minor',
      modifyContent: function (content) {
        content.is_task = true;
        content.task_shows_on_day = 3;
      },
    },
  ],
  events: [
    {
      days: 3,
      start: 3,
      end: VMMC_NO_CONTACT_TASKS_LIFESPAN,
    },
  ],
};

module.exports = { noContactTask, noContactMinorTask };