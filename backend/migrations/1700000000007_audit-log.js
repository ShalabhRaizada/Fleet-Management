/* Immutable, append-only audit log capturing create/update/soft-delete actions
   performed through the generic CRUD router (buildCrudRouter). No standard
   updated_at/deleted_flag audit columns - this table is intentionally
   write-once (besides the legal_hold toggle). */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('audit_log', {
    audit_id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    table_name: { type: 'varchar(100)', notNull: true },
    record_id: { type: 'varchar(100)', notNull: true },
    action: { type: 'varchar(20)', notNull: true },
    changed_by: { type: 'uuid', references: 'user_master', onDelete: 'SET NULL' },
    changed_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    old_values: { type: 'jsonb' },
    new_values: { type: 'jsonb' },
    legal_hold: { type: 'boolean', notNull: true, default: false },
  });

  pgm.createIndex('audit_log', 'table_name');
  pgm.createIndex('audit_log', 'record_id');
  pgm.createIndex('audit_log', 'action');
  pgm.createIndex('audit_log', 'changed_at');
};

exports.down = (pgm) => {
  pgm.dropTable('audit_log');
};
