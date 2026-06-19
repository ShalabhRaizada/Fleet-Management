/* Alert escalation: adds escalation tracking columns to alert_event so the
   alerts engine can auto-escalate long-open Critical alerts to an admin. */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns('alert_event', {
    escalation_level: { type: 'integer', notNull: true, default: 0 },
    escalated_at: { type: 'timestamptz' },
    escalation_assignee: { type: 'uuid', references: 'user_master', onDelete: 'SET NULL' },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('alert_event', ['escalation_level', 'escalated_at', 'escalation_assignee']);
};
