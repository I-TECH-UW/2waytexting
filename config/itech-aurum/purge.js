module.exports = {
  text_expression: 'at 6 pm on Friday',
  run_every_days: 2,
  cron: '0 1 * * FRI',
  fn: function(userCtx, contact, reports, messages) {
        const old = Date.now() - (1000 * 60 * 60 * 24 * 90);
        const oldMessages = Date.now() - (1000 * 60 * 60 * 24 * 90);
      
        const reportsToPurge = reports
                                 .filter(r => r.reported_date < old)
                                 .map(r => r._id);
        const messagesToPurge = messages
                                 .filter(m => m.reported_date < oldMessages)
                                 .map(m => m._id);
      
        return [...reportsToPurge, ...messagesToPurge];
      } 
};