exports.shorthands = undefined;

exports.up = (pgm) => {
  // partial unique indexes so soft-deleted rows don't collide with active ones
  pgm.createIndex('vehicle_master', 'registration_no', { unique: true, where: 'deleted_flag = false', name: 'uq_vehicle_master_registration_no' });
  pgm.createIndex('trailer_master', 'trailer_no', { unique: true, where: 'deleted_flag = false', name: 'uq_trailer_master_trailer_no' });
  pgm.createIndex('tyre_master', 'tyre_serial_no', { unique: true, where: 'deleted_flag = false', name: 'uq_tyre_master_tyre_serial_no' });
  pgm.createIndex('workshop_master', 'workshop_code', { unique: true, where: 'deleted_flag = false', name: 'uq_workshop_master_workshop_code' });
  pgm.createIndex('item_master', 'item_code', { unique: true, where: 'deleted_flag = false', name: 'uq_item_master_item_code' });
  pgm.createIndex('accessory_master', 'accessory_code', { unique: true, where: 'deleted_flag = false', name: 'uq_accessory_master_accessory_code' });
  pgm.createIndex('accompaniment_master', 'accompaniment_code', { unique: true, where: 'deleted_flag = false', name: 'uq_accompaniment_master_accompaniment_code' });
  pgm.createIndex('vendor_invoice', ['vendor_id', 'invoice_no', 'invoice_date'], { unique: true, where: 'deleted_flag = false', name: 'uq_vendor_invoice_vendor_invoiceno_date' });
  pgm.createIndex('role_master', 'role_code', { unique: true, name: 'uq_role_master_role_code' });
  pgm.createIndex('user_master', 'login_id', { unique: true, where: 'deleted_flag = false', name: 'uq_user_master_username' });
  pgm.createIndex('branch_master', 'branch_code', { unique: true, where: 'deleted_flag = false', name: 'uq_branch_master_branch_code' });
};

exports.down = (pgm) => {
  pgm.dropIndex('vehicle_master', 'registration_no', { name: 'uq_vehicle_master_registration_no' });
  pgm.dropIndex('trailer_master', 'trailer_no', { name: 'uq_trailer_master_trailer_no' });
  pgm.dropIndex('tyre_master', 'tyre_serial_no', { name: 'uq_tyre_master_tyre_serial_no' });
  pgm.dropIndex('workshop_master', 'workshop_code', { name: 'uq_workshop_master_workshop_code' });
  pgm.dropIndex('item_master', 'item_code', { name: 'uq_item_master_item_code' });
  pgm.dropIndex('accessory_master', 'accessory_code', { name: 'uq_accessory_master_accessory_code' });
  pgm.dropIndex('accompaniment_master', 'accompaniment_code', { name: 'uq_accompaniment_master_accompaniment_code' });
  pgm.dropIndex('vendor_invoice', ['vendor_id', 'invoice_no', 'invoice_date'], { name: 'uq_vendor_invoice_vendor_invoiceno_date' });
  pgm.dropIndex('role_master', 'role_code', { name: 'uq_role_master_role_code' });
  pgm.dropIndex('user_master', 'login_id', { name: 'uq_user_master_username' });
  pgm.dropIndex('branch_master', 'branch_code', { name: 'uq_branch_master_branch_code' });
};
