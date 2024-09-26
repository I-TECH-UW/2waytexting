define Target {
  _id: null,
  contact: null,
  deleted: null,
  type: null,
  pass: null,
  date: null
}

define Contact {
  contact: null,
  reports: null
}

define Task {
  _id: null,
  deleted: null,
  doc: null,
  contact: null,
  icon: null,
  date: null,
  readyStart: null,
  readyEnd: null,
  title: null,
  fields: null,
  resolved: null,
  priority: null,
  priorityLabel: null,
  reports: null,
  actions: null
}

rule GenerateEvents {
  when {
    c: Contact
  }
  then {
    var createTask = function(contact, schedule, report) {
      return new Task({
        // One task instance for each schedule event per form that triggers a task, not per contact
        // Otherwise they collide when contact has multiple reports of the same form
        // _id: report._id + '-' + schedule.id,
        _id: contact.contact._id + '-' + schedule.id,
        deleted: (contact.contact ? contact.contact.deleted : false) || (report ? report.deleted : false),
        doc: contact,
        contact: contact.contact,
        icon: schedule.icon,
        priority: schedule.description ? 'high' : null,
        priorityLabel: schedule.description ? schedule.description : '',
        icon: schedule.type,
        date: null,
        readyStart: schedule.start,
        readyEnd: schedule.end,
        title: schedule.title,
        resolved: false,
        actions: []
      });
    };

    var emitTask = function(task, scheduleEvent) {
      if (Utils.isTimely(task.date, scheduleEvent)) {
        emit('task', task);
      }
    };

    // ==============================
    // GENERATES TASKS
    // ==============================
    if (c.contact && c.contact.type === 'person') {
      // ------------------------------
      // PERSON-BASED TASKS
      // ------------------------------
      // Avoid generating tasks for these pilot phase clients who don't have a
      // 2WT scheduled messages report (https://github.com/medic/medic-projects/issues/4443)
      let pilot_users = [
        "58284f3c-9c2e-49f5-a039-8d90071c8022",
        "303f9f4c-0c6f-405c-940a-b2f573a85a0c",
        "fcac5344-c15d-4c04-b888-df0cf77fc275",
        "f69d7760-fd9c-418a-a41d-a349cbe5cba2",
        "f8af310b-ffb3-4ecf-b345-b46c196f6d5c",
        "711fe306-e072-433b-9de7-1666d709e87b",
        "d36fb82a-c150-4745-a991-4644f10e1883",
        "3457a5f1-e806-438a-929b-a246ffdb98d4",
        "749cc214-d05a-4f19-8ce0-61e233bac7b2",
        "323d1b41-3427-4109-9336-32e5f37c03dd",
        "4bccd638-6f69-4fbd-914a-c115eba1563b",
        "72a86cdc-4d32-4cb0-85c2-7b5c63d0bb32",
        "4b9ac080-a3ee-4959-94dd-c5b7ea29e7a1",
        "112d37f9-25e2-49b7-b289-d4ead1ce248c",
        "5fe44ccb-8cc2-4d26-9157-df01d4899d34",
        "f4d7b1e7-ff89-40b3-9d70-9afa5685c6fa"
      ];
      let schedule = Utils.getSchedule('scheduled-msgs');
      if (schedule && c.contact.patient_id && pilot_users.indexOf(c.contact._id) == -1) {
        schedule.events.forEach(function(s){
          let dueDate = new Date(Utils.addDate(new Date(c.contact.reported_date), s.days));
          let task = createTask(c, s);
          task.date = dueDate;
          task.resolved = !!Utils.getMostRecentReport(c.reports, 'scheduled_msgs');
          task.actions.push({
            type: 'report',
            form: "scheduled_msgs",
            label: 'Send 14-day scheduled SMSs',
            content: {
              source: 'task',
              source_id: c._id,
              contact: c.contact
            }
          });
          emitTask(task, s);
        });
      }

      let nurse_id = "06f2b862-5b10-464e-ad7f-a162c8da1e2c"; // Avoid showing tasks for nurse contact
      if (c.contact.randomization && c.contact.randomization == 'texting' && c.contact._id != nurse_id) {
        schedule = Utils.getSchedule('texting-group');
        if (schedule) {
          for (var k = 0; k < schedule.events.length; k++) {
            var s = schedule.events[k];
            var dueDate = new Date(Utils.addDate(new Date(c.contact.reported_date), s.days));
            var task = createTask(c, s);
            task._id += '-' + k;
            task.date = dueDate;
            task.resolved = !!Utils.getMostRecentReport(c.reports, s.form);
            task.actions.push({
              type: 'report',
              form: s.form,
              label: 'Follow up client',
              content: {
                source: 'task',
                source_id: c._id,
                contact: c.contact
              }
            });
            emitTask(task, s);
          }
        }
      }

      schedule = "";
      schedule = Utils.getSchedule("followup-day-14");
      if (schedule && c.contact._id != nurse_id){
        var s = schedule.events[0];
        var task = createTask(c, s);
        var dueDate = new Date(Utils.addDate(new Date(c.contact.reported_date), s.days));
        task._id += '-' + k;
        task.date = dueDate;
        task.resolved = !!Utils.getMostRecentReport(c.reports, "day14_client_visit");
        if (!task.resolved){
          task.resolved = c.reports.some(function(r){
            return r.form == "client_visit" && r.fields.visit == "day14"
          });
        }
        task.actions.push({
          type: 'report',
          form: s.form,
          label: 'Follow up client',
          content: {
            source: 'task',
            source_id: c._id,
            contact: c.contact
          }
        });
        emitTask(task, s);
      }


      // Report based tasks
      c.reports.forEach(
        function(r) {
          switch(r.form) {
            case 'potential_ae':
              if(r.fields.n.client_return == 'yes'){
                let schedule = Utils.getSchedule('ae-referral');
                if(schedule){
                  schedule.events.forEach(function(s) {
                    var dueDate = new Date(Utils.addDate(new Date(r.reported_date), s.days));
                    var visit = createTask(c, s, r);
                    visit.date = dueDate;
                    visit.resolved = Utils.isFormSubmittedInWindow(c.reports, 'referral_confirmation', Utils.addDate(dueDate, s.start * -1).getTime(), Utils.addDate(dueDate, (s.end + 1)).getTime() );
                    visit.actions.push({
                      type: 'report',
                      form: 'referral_confirmation',
                      label: 'SMS Referral',
                      content: {
                        source: 'task',
                        source_id: r._id,
                        contact: c.contact,
                      }
                    });
                    emitTask(visit, s);
                });
              }
            }
          break;
        }
      });

    }
    emit('_complete', { _id: true });
  }
}
