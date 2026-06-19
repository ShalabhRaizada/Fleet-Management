/* Closes gap-analysis findings: EPIC 1.0 vehicle status upload/reconcile workflow
   (replacing the simplistic client-side status filter in NonWorkingList) and a
   formal PDI handover document with driver/workshop acceptance, linked to
   inspection_event. */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('epic_status_upload', {
    upload_id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    uploaded_by: { type: 'uuid', references: 'user_master', onDelete: 'SET NULL' },
    uploaded_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    file_name: { type: 'text', notNull: true },
    total_rows: { type: 'int', notNull: true, default: 0 },
    matched_rows: { type: 'int', notNull: true, default: 0 },
    unmatched_rows: { type: 'int', notNull: true, default: 0 },
    status: { type: 'varchar(20)', notNull: true, default: 'Processing' },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable('non_working_vehicle_action', {
    action_id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    upload_id: { type: 'uuid', notNull: true, references: 'epic_status_upload', onDelete: 'CASCADE' },
    vehicle_id: { type: 'uuid', references: 'vehicle_master', onDelete: 'SET NULL' },
    vehicle_no_raw: { type: 'text' },
    epic_status_raw: { type: 'text' },
    issue_category: { type: 'text' },
    remedial_action: { type: 'text' },
    assigned_vendor_id: { type: 'uuid', references: 'vendor_master', onDelete: 'SET NULL' },
    escalation_level: { type: 'int', notNull: true, default: 0 },
    resolved: { type: 'boolean', notNull: true, default: false },
    resolved_at: { type: 'timestamptz' },
    remarks: { type: 'text' },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createIndex('non_working_vehicle_action', 'upload_id');
  pgm.createIndex('non_working_vehicle_action', 'vehicle_id');

  pgm.createTable('handover_document', {
    handover_id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    inspection_event_id: { type: 'uuid', notNull: true, references: 'inspection_event', onDelete: 'CASCADE' },
    vehicle_id: { type: 'uuid', notNull: true, references: 'vehicle_master', onDelete: 'SET NULL' },
    handover_type: { type: 'text', notNull: true },
    handed_over_by: { type: 'text' },
    received_by: { type: 'text' },
    handover_date: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    driver_signature_name: { type: 'text' },
    acceptance_remarks: { type: 'text' },
    accepted: { type: 'boolean', notNull: true, default: false },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createIndex('handover_document', 'inspection_event_id');
  pgm.createIndex('handover_document', 'vehicle_id');
};

exports.down = (pgm) => {
  pgm.dropTable('handover_document');
  pgm.dropTable('non_working_vehicle_action');
  pgm.dropTable('epic_status_upload');
};
