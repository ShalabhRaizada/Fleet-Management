/* Health & Safety incident tracking: hs_incident captures workplace/vehicle
   safety incidents (near-miss, injury, property damage, spill, gas leak, etc),
   hs_corrective_action tracks remediation tasks raised against an incident. */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('hs_incident', {
    incident_id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    incident_type: { type: 'varchar(30)', notNull: true },
    severity: { type: 'varchar(20)', notNull: true },
    vehicle_id: { type: 'uuid', references: 'vehicle_master', onDelete: 'SET NULL' },
    driver_id: { type: 'uuid', references: 'user_master', onDelete: 'SET NULL' },
    location: { type: 'text' },
    occurred_at: { type: 'timestamptz', notNull: true },
    reported_by: { type: 'uuid', notNull: true, references: 'user_master', onDelete: 'SET NULL' },
    description: { type: 'text' },
    injury_details: { type: 'text' },
    is_recordable: { type: 'boolean', notNull: true, default: false },
    status: { type: 'varchar(30)', notNull: true, default: 'Reported' },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createIndex('hs_incident', 'status');
  pgm.createIndex('hs_incident', 'occurred_at');
  pgm.createIndex('hs_incident', 'vehicle_id');
  pgm.createIndex('hs_incident', 'driver_id');

  pgm.createTable('hs_corrective_action', {
    action_id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    incident_id: { type: 'uuid', notNull: true, references: 'hs_incident', onDelete: 'CASCADE' },
    action_description: { type: 'text', notNull: true },
    assigned_to: { type: 'uuid', notNull: true, references: 'user_master', onDelete: 'SET NULL' },
    due_date: { type: 'date' },
    completed_date: { type: 'date' },
    status: { type: 'varchar(20)', notNull: true, default: 'Open' },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createIndex('hs_corrective_action', 'incident_id');
  pgm.createIndex('hs_corrective_action', 'status');
};

exports.down = (pgm) => {
  pgm.dropTable('hs_corrective_action');
  pgm.dropTable('hs_incident');
};
