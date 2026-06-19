/* Job card SLA breach tracking (Phase A item 4): adds sla_target_hours and
   sla_breached columns to job_card so the alerts engine can flag job cards
   that have remained open past their SLA target. */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns('job_card', {
    sla_target_hours: { type: 'integer', notNull: false, default: 48 },
    sla_breached: { type: 'boolean', notNull: true, default: false },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('job_card', ['sla_target_hours', 'sla_breached']);
};
