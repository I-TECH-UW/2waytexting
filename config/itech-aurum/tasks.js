const clientReviewTask = require('./tasks/client_review.task');
const InPersonTracingTask = require('./tasks/in-person-tracing.task');
const { noContactTask, noContactMinorTask } = require('./tasks/no-contact');

module.exports = [
  clientReviewTask,
  InPersonTracingTask,
  noContactTask,
  noContactMinorTask
];
