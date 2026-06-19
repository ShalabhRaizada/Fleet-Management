/* Closes gap-analysis findings: no tables for battery tracking, challan/fine
   management, or login-lockout. Adds battery_master, challan, and
   failed_login_attempts/locked_until columns on user_master. */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('battery_master', {
    battery_id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    battery_serial_no: { type: 'varchar(80)', notNull: true },
    vehicle_id: { type: 'uuid' },
    oem_name: { type: 'varchar(120)' },
    capacity_ah: { type: 'numeric(10,2)' },
    voltage: { type: 'numeric(8,2)' },
    warranty_months: { type: 'integer' },
    fitment_date: { type: 'date' },
    removal_date: { type: 'date' },
    removal_reason: { type: 'varchar(300)' },
    status: { type: 'varchar(20)', notNull: true },
    purchase_cost: { type: 'numeric(14,2)' },
    vendor_id: { type: 'uuid' },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.addConstraint('battery_master', 'battery_master_vehicle_fk', {
    foreignKeys: { columns: 'vehicle_id', references: 'vehicle_master(vehicle_id)' },
  });
  pgm.addConstraint('battery_master', 'battery_master_vendor_fk', {
    foreignKeys: { columns: 'vendor_id', references: 'vendor_master(vendor_id)' },
  });

  pgm.createTable('challan', {
    challan_id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    challan_no: { type: 'varchar(50)', notNull: true },
    vehicle_id: { type: 'uuid', notNull: true },
    driver_id: { type: 'uuid' },
    violation_type: { type: 'varchar(120)', notNull: true },
    violation_date: { type: 'date', notNull: true },
    location: { type: 'varchar(300)' },
    amount: { type: 'numeric(14,2)', notNull: true },
    issuing_authority: { type: 'varchar(150)' },
    due_date: { type: 'date' },
    payment_status: { type: 'varchar(20)', notNull: true },
    payment_date: { type: 'date' },
    payment_reference: { type: 'varchar(100)' },
    responsibility: { type: 'varchar(20)' },
    remarks: { type: 'varchar(500)' },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.addConstraint('challan', 'challan_vehicle_fk', {
    foreignKeys: { columns: 'vehicle_id', references: 'vehicle_master(vehicle_id)' },
  });
  pgm.addConstraint('challan', 'challan_driver_fk', {
    foreignKeys: { columns: 'driver_id', references: 'driver_master(driver_id)' },
  });

  pgm.addColumns('user_master', {
    failed_login_attempts: { type: 'integer', notNull: true, default: 0 },
    locked_until: { type: 'timestamptz' },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('user_master', ['failed_login_attempts', 'locked_until']);
  pgm.dropTable('challan');
  pgm.dropTable('battery_master');
};
