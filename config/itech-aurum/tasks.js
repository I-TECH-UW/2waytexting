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
    name: 'scheduled-msgs',
    icon: 'network',
    title: 'task.scheduled-msgs.title',
    appliesTo: 'contacts',
    appliesToType: ['person'],
    appliesIf: (contact) => {
      return contact.contact.patient_id && contact.contact.vmmc_no;
    },
    resolvedIf: (contact, report, event, dueDate) => {
      return Utils.isFormSubmittedInWindow(
        contact.reports,
        'scheduled_msgs',
        Utils.addDate(dueDate, -event.start).getTime(),
        Utils.addDate(dueDate, event.end + 1).getTime()
      );
    },
    actions: [{
      form: 'scheduled_msgs',
      label: 'Send 14-day scheduled SMSs',
    }],
    events: [{
      id: 'scheduled-msgs-0',
      days: 0,
      start: 1,
      end: 365
    }]
  },

];
