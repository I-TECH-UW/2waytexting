module.exports = [
  {
    name: 'day2-sms',
    icon: 'treatment',
    title: 'task.day2-sms.title',
    appliesTo: 'contacts',
    appliesToType: ['person'],
    appliesIf: (contact) => {
      return contact.contact.randomization && contact.contact.randomization === 'texting'
        && !contact.contact.role;//Avoid showing tasks for nurse contact
    },
    resolvedIf: (contact, report, event, dueDate) => {
      return Utils.isFormSubmittedInWindow(
        contact.reports,
        'day2_sms',
        Utils.addDate(dueDate, -event.start).getTime(),
        Utils.addDate(dueDate, event.end + 1).getTime()
      );
    },
    actions: [{
      form: 'day2_sms',
      label: 'Follow up client'
    }],
    events: [{
      id: 'sms-followup-day-2',
      days: 2,
      start: 0,
      end: 365
    }]
  },

  {
    name: 'day7-sms',
    icon: 'treatment',
    title: 'task.day7-sms.title',
    appliesTo: 'contacts',
    appliesToType: ['person'],
    appliesIf: (contact) => {
      return contact.contact.randomization && contact.contact.randomization === 'texting'
        && !contact.contact.role;//Avoid showing tasks for nurse contact
    },
    resolvedIf: (contact, report, event, dueDate) => {
      return Utils.isFormSubmittedInWindow(
        contact.reports,
        'day7_sms',
        Utils.addDate(dueDate, -event.start).getTime(),
        Utils.addDate(dueDate, event.end + 1).getTime()
      );
    },
    actions: [{
      form: 'day7_sms',
      label: 'Follow up client'
    }],
    events: [{
      id: 'sms-followup-day-7',
      days: 7,
      start: 0,
      end: 365
    }]
  },

  {
    name: 'followup-day-14',
    icon: 'treatment',
    title: 'task.followup-day-14.title',
    appliesTo: 'contacts',
    appliesToType: ['person'],
    appliesIf: (contact) => {
      return contact.contact.randomization && contact.contact.randomization === 'texting'
        && !contact.contact.role;//Avoid showing tasks for nurse contact
    },
    resolvedIf: (contact, report, event, dueDate) => {
      return Utils.isFormSubmittedInWindow(
        contact.reports,
        'day14_client_visit',
        Utils.addDate(dueDate, -event.start).getTime(),
        Utils.addDate(dueDate, event.end + 1).getTime()
      ) || contact.reports.some(function (r) {
        return r.form === 'client_visit' && r.fields.visit === 'day14';
      });
    },
    actions: [{
      form: 'day14_client_visit',
      label: 'Follow up client',
    }],
    events: [{
      id: 'followup-day-14',
      days: 14,
      start: 2,
      end: 365
    }]
  },

  {
    name: 'ae-referral',
    icon: 'treatment',
    title: 'task.ae-referral.title',
    appliesTo: 'reports',
    appliesToType: ['potential_ae'],
    appliesIf: () => true,
    resolvedIf: (contact, report, event, dueDate) => {
      return Utils.isFormSubmittedInWindow(
        contact.reports,
        'referral_confirmation',
        Utils.addDate(dueDate, -event.start).getTime(),
        Utils.addDate(dueDate, event.end + 1).getTime()
      );
    },
    actions: [{
      form: 'referral_confirmation',
      label: 'SMS Referral',
    }],
    events: [{
      id: 'ae-referral',
      days: 2,
      start: 2,
      end: 365
    }]
  },

  {
    name: 'no-contact',
    icon: 'off',
    title: 'task.no-contact.title',
    appliesTo: 'reports',
    appliesToType: ['enroll'],
    appliesIf: (contact, report) => report.form === 'enroll',
    resolvedIf: (contact, report, event, dueDate) => {
        const no_contact_submitted = Utils.isFormSubmittedInWindow(
            contact.reports,
            'no_contact',
            Utils.addDate(dueDate, -event.start).getTime(),
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
    },
    actions: [{
        form: 'no_contact',
        label: 'No Contact',
        modifyContent: function (content) {
            content.is_task = true;
        }
    }],
    events: [{
        days: 8,
        start: 0,
        end: 365
    }]
}

];
