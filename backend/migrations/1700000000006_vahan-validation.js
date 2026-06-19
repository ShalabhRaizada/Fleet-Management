/* Adds VAHAN (ULIP-hosted) vehicle validation: one row per vehicle per validation
   run, storing the key fields surfaced from the VAHAN response (RC status,
   fitness/PUCC/insurance/permit/road-tax validity, blacklist flag) plus the
   full raw response for audit/history. Surfaced via a read-only history list
   and feeds asset_compliance / alert machinery for any near-expiry items. */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('vahan_validation_result', {
    result_id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    vehicle_id: { type: 'uuid', references: 'vehicle_master', onDelete: 'SET NULL' },
    vehicle_no: { type: 'varchar(20)', notNull: true },
    requested_by: { type: 'uuid', references: 'user_master', onDelete: 'SET NULL' },
    requested_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    response_status: { type: 'varchar(20)', notNull: true },
    raw_response: { type: 'jsonb' },
    rc_status: { type: 'varchar(30)' },
    fitness_valid_upto: { type: 'date' },
    pucc_valid_upto: { type: 'date' },
    insurance_valid_upto: { type: 'date' },
    permit_valid_upto: { type: 'date' },
    road_tax_paid_upto: { type: 'date' },
    is_blacklisted: { type: 'boolean', notNull: true, default: false },
    blacklist_reason: { type: 'text' },
    gross_vehicle_weight_kg: { type: 'numeric(10,2)' },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createIndex('vahan_validation_result', 'vehicle_id');
  pgm.createIndex('vahan_validation_result', 'vehicle_no');
  pgm.createIndex('vahan_validation_result', 'requested_at');
};

exports.down = (pgm) => {
  pgm.dropTable('vahan_validation_result');
};
