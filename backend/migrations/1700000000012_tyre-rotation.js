/* Tyre Rotation Management: groups individual tyre_movement rows raised
   during a single rotation event (multi-tyre swap/move-to-spare/replace)
   under one header with its own draft/submitted/approved workflow, plus a
   position-code lookup table used to drive the layout/rotation planner UI.
   Builds on the existing tyre_master/tyre_movement tables rather than
   duplicating tyre fitment/lifecycle state. */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('tyre_rotation_header', {
    rotation_header_id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    asset_type: { type: 'varchar(20)', notNull: true }, // Vehicle | Trailer
    asset_id: { type: 'uuid', notNull: true },
    rotation_date: { type: 'date', notNull: true },
    odometer_km: { type: 'decimal(12,1)', notNull: true },
    workshop_id: { type: 'uuid', notNull: false, references: 'workshop_master', onDelete: 'SET NULL' },
    technician_name: { type: 'varchar(120)', notNull: false },
    supervisor_id: { type: 'uuid', notNull: false, references: 'user_master', onDelete: 'SET NULL' },
    reason_code: { type: 'varchar(40)', notNull: false },
    remarks: { type: 'varchar(500)', notNull: false },
    status: { type: 'varchar(20)', notNull: true, default: 'Draft' }, // Draft | Submitted | Approved
    created_by: { type: 'uuid', notNull: false, references: 'user_master', onDelete: 'SET NULL' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    submitted_by: { type: 'uuid', notNull: false, references: 'user_master', onDelete: 'SET NULL' },
    submitted_at: { type: 'timestamptz', notNull: false },
    approved_by: { type: 'uuid', notNull: false, references: 'user_master', onDelete: 'SET NULL' },
    approved_at: { type: 'timestamptz', notNull: false },
  });
  pgm.createIndex('tyre_rotation_header', ['asset_type', 'asset_id']);
  pgm.createIndex('tyre_rotation_header', ['status']);

  pgm.addColumns('tyre_movement', {
    rotation_header_id: { type: 'uuid', notNull: false, references: 'tyre_rotation_header', onDelete: 'SET NULL' },
  });
  pgm.createIndex('tyre_movement', ['rotation_header_id']);

  pgm.addColumns('tyre_master', {
    last_rotation_date: { type: 'date', notNull: false },
    last_rotation_odometer_km: { type: 'decimal(12,1)', notNull: false },
  });

  pgm.createTable('tyre_position_master', {
    position_id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    asset_type: { type: 'varchar(20)', notNull: true }, // Vehicle | Trailer
    axle_configuration: { type: 'varchar(40)', notNull: true },
    position_code: { type: 'varchar(20)', notNull: true },
    position_label: { type: 'varchar(80)', notNull: false },
    sort_order: { type: 'integer', notNull: true, default: 0 },
  });
  pgm.addConstraint('tyre_position_master', 'tyre_position_unique', {
    unique: ['asset_type', 'axle_configuration', 'position_code'],
  });

  const positions = [
    // 4x2 tractor: 1 steer axle (2 tyres), 1 drive axle (4 dual tyres)
    ['Vehicle', '4x2', 'F1L', 'Front Axle - Left', 1], ['Vehicle', '4x2', 'F1R', 'Front Axle - Right', 2],
    ['Vehicle', '4x2', 'D1LO', 'Drive Axle - Left Outer', 3], ['Vehicle', '4x2', 'D1LI', 'Drive Axle - Left Inner', 4],
    ['Vehicle', '4x2', 'D1RI', 'Drive Axle - Right Inner', 5], ['Vehicle', '4x2', 'D1RO', 'Drive Axle - Right Outer', 6],
    // 6x2 tractor: steer + drive + tag axle (single tyres on tag)
    ['Vehicle', '6x2', 'F1L', 'Front Axle - Left', 1], ['Vehicle', '6x2', 'F1R', 'Front Axle - Right', 2],
    ['Vehicle', '6x2', 'D1LO', 'Drive Axle - Left Outer', 3], ['Vehicle', '6x2', 'D1LI', 'Drive Axle - Left Inner', 4],
    ['Vehicle', '6x2', 'D1RI', 'Drive Axle - Right Inner', 5], ['Vehicle', '6x2', 'D1RO', 'Drive Axle - Right Outer', 6],
    ['Vehicle', '6x2', 'T1L', 'Tag Axle - Left', 7], ['Vehicle', '6x2', 'T1R', 'Tag Axle - Right', 8],
    // 6x4 tractor: steer + 2 drive axles (dual tyres on both)
    ['Vehicle', '6x4', 'F1L', 'Front Axle - Left', 1], ['Vehicle', '6x4', 'F1R', 'Front Axle - Right', 2],
    ['Vehicle', '6x4', 'D1LO', 'Drive Axle 1 - Left Outer', 3], ['Vehicle', '6x4', 'D1LI', 'Drive Axle 1 - Left Inner', 4],
    ['Vehicle', '6x4', 'D1RI', 'Drive Axle 1 - Right Inner', 5], ['Vehicle', '6x4', 'D1RO', 'Drive Axle 1 - Right Outer', 6],
    ['Vehicle', '6x4', 'D2LO', 'Drive Axle 2 - Left Outer', 7], ['Vehicle', '6x4', 'D2LI', 'Drive Axle 2 - Left Inner', 8],
    ['Vehicle', '6x4', 'D2RI', 'Drive Axle 2 - Right Inner', 9], ['Vehicle', '6x4', 'D2RO', 'Drive Axle 2 - Right Outer', 10],
    // 10-wheeler rigid truck: same layout as 6x4 tractor
    ['Vehicle', '10-Wheeler', 'F1L', 'Front Axle - Left', 1], ['Vehicle', '10-Wheeler', 'F1R', 'Front Axle - Right', 2],
    ['Vehicle', '10-Wheeler', 'D1LO', 'Rear Axle 1 - Left Outer', 3], ['Vehicle', '10-Wheeler', 'D1LI', 'Rear Axle 1 - Left Inner', 4],
    ['Vehicle', '10-Wheeler', 'D1RI', 'Rear Axle 1 - Right Inner', 5], ['Vehicle', '10-Wheeler', 'D1RO', 'Rear Axle 1 - Right Outer', 6],
    ['Vehicle', '10-Wheeler', 'D2LO', 'Rear Axle 2 - Left Outer', 7], ['Vehicle', '10-Wheeler', 'D2LI', 'Rear Axle 2 - Left Inner', 8],
    ['Vehicle', '10-Wheeler', 'D2RI', 'Rear Axle 2 - Right Inner', 9], ['Vehicle', '10-Wheeler', 'D2RO', 'Rear Axle 2 - Right Outer', 10],
    // 12-wheeler rigid truck: front tandem (4 single) + rear tandem (8 dual)
    ['Vehicle', '12-Wheeler', 'F1L', 'Front Axle 1 - Left', 1], ['Vehicle', '12-Wheeler', 'F1R', 'Front Axle 1 - Right', 2],
    ['Vehicle', '12-Wheeler', 'F2L', 'Front Axle 2 - Left', 3], ['Vehicle', '12-Wheeler', 'F2R', 'Front Axle 2 - Right', 4],
    ['Vehicle', '12-Wheeler', 'D1LO', 'Rear Axle 1 - Left Outer', 5], ['Vehicle', '12-Wheeler', 'D1LI', 'Rear Axle 1 - Left Inner', 6],
    ['Vehicle', '12-Wheeler', 'D1RI', 'Rear Axle 1 - Right Inner', 7], ['Vehicle', '12-Wheeler', 'D1RO', 'Rear Axle 1 - Right Outer', 8],
    ['Vehicle', '12-Wheeler', 'D2LO', 'Rear Axle 2 - Left Outer', 9], ['Vehicle', '12-Wheeler', 'D2LI', 'Rear Axle 2 - Left Inner', 10],
    ['Vehicle', '12-Wheeler', 'D2RI', 'Rear Axle 2 - Right Inner', 11], ['Vehicle', '12-Wheeler', 'D2RO', 'Rear Axle 2 - Right Outer', 12],
    // 2-axle trailer (e.g. flatbed/container, single tyres)
    ['Trailer', '2-Axle', 'T1LO', 'Axle 1 - Left Outer', 1], ['Trailer', '2-Axle', 'T1LI', 'Axle 1 - Left Inner', 2],
    ['Trailer', '2-Axle', 'T1RI', 'Axle 1 - Right Inner', 3], ['Trailer', '2-Axle', 'T1RO', 'Axle 1 - Right Outer', 4],
    ['Trailer', '2-Axle', 'T2LO', 'Axle 2 - Left Outer', 5], ['Trailer', '2-Axle', 'T2LI', 'Axle 2 - Left Inner', 6],
    ['Trailer', '2-Axle', 'T2RI', 'Axle 2 - Right Inner', 7], ['Trailer', '2-Axle', 'T2RO', 'Axle 2 - Right Outer', 8],
    // 3-axle trailer (multi-axle/container/bulker/tanker, dual tyres on all 3 axles)
    ['Trailer', '3-Axle', 'T1LO', 'Axle 1 - Left Outer', 1], ['Trailer', '3-Axle', 'T1LI', 'Axle 1 - Left Inner', 2],
    ['Trailer', '3-Axle', 'T1RI', 'Axle 1 - Right Inner', 3], ['Trailer', '3-Axle', 'T1RO', 'Axle 1 - Right Outer', 4],
    ['Trailer', '3-Axle', 'T2LO', 'Axle 2 - Left Outer', 5], ['Trailer', '3-Axle', 'T2LI', 'Axle 2 - Left Inner', 6],
    ['Trailer', '3-Axle', 'T2RI', 'Axle 2 - Right Inner', 7], ['Trailer', '3-Axle', 'T2RO', 'Axle 2 - Right Outer', 8],
    ['Trailer', '3-Axle', 'T3LO', 'Axle 3 - Left Outer', 9], ['Trailer', '3-Axle', 'T3LI', 'Axle 3 - Left Inner', 10],
    ['Trailer', '3-Axle', 'T3RI', 'Axle 3 - Right Inner', 11], ['Trailer', '3-Axle', 'T3RO', 'Axle 3 - Right Outer', 12],
  ];
  for (const [asset_type, axle_configuration, position_code, position_label, sort_order] of positions) {
    pgm.sql(
      `INSERT INTO tyre_position_master (asset_type, axle_configuration, position_code, position_label, sort_order)
       VALUES ('${asset_type}', '${axle_configuration}', '${position_code}', '${position_label}', ${sort_order})`
    );
  }
};

exports.down = (pgm) => {
  pgm.dropTable('tyre_position_master');
  pgm.dropColumns('tyre_master', ['last_rotation_date', 'last_rotation_odometer_km']);
  pgm.dropColumns('tyre_movement', ['rotation_header_id']);
  pgm.dropTable('tyre_rotation_header');
};
