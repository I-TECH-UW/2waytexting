module.exports = {
  text_expression: 'at 12 am on Monday',
  run_every_days: 2,
  cron: '0 0 * * MON',
  fn: function (userCtx, contact, reports, messages) {
    const old = Date.now() - (1000 * 60 * 60 * 24 * 45);
    const oldMessages = Date.now() - (1000 * 60 * 60 * 24 * 45);

    const reportsToPurge = reports
      .filter(r => r.reported_date < old)
      .map(r => r._id);
    const messagesToPurge = messages
      .filter(m => m.reported_date < oldMessages)
      .map(m => m._id);

    return [...reportsToPurge, ...messagesToPurge];
  }
};