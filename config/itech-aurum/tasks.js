module.exports = [
    {
        name: 'client-review-request',
        icon: 'man-risk',
        title: 'task.client-review-request.title',
        appliesTo: 'reports',
        appliesToType: ['no_contact', 'referral_for_care'],
        appliesIf: (contact, report) => {
            return report.form === 'referral_for_care' ||
                report.form === 'no_contact' && Utils.getField(report, 'n.client_ok') !== 'yes';
        },
        resolvedIf: (contact, report, event, dueDate) => {
            return Utils.isFormSubmittedInWindow(
                contact.reports,
                'client_review',
                Utils.addDate(dueDate, -event.start).getTime(),
                Utils.addDate(dueDate, event.end + 1).getTime()
            );
        },
        actions: [{
            form: 'client_review',
            label: 'Client review',
            modifyContent: function (content, contact, report) {
                if (report.form === 'no_contact') {
                    content.is_no_contact_ctx = true;
                }
                else {
                    content.is_referral_for_care_ctx = true;
                }
            }
        }],
        events: [{
            days: 0,
            start: 1,
            end: 365
        }]
    },
    {
        name: 'no-contact',
        icon: 'off',
        title: 'task.no-contact.title',
        appliesTo: 'reports',
        appliesToType: ['enroll'],
        contactLabel: function (contact) {
            return  contact.contact.name + ' (' + contact.contact.enrollment_location + ')';
        }, 
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
    },
    {
        name: 'no-contact-minor',
        icon: 'off',
        title: 'task.no-contact-minor.title',
        appliesTo: 'reports',
        appliesToType: ['enroll'],
        contactLabel: function (contact) {
            return  contact.contact.name + ' (' + contact.contact.enrollment_location + ')';
        }, 
        appliesIf: (contact, report) => {
            return report.form === 'enroll' && contact.contact.is_minor;
        },
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
            label: 'No Contact Minor',
            modifyContent: function (content) {
                content.is_task = true;
            }
        }],
        events: [{
            days: 3,
            start: 1,
            end: 365
        }]
    }
];
