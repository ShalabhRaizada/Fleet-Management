/* Auto-generated from docs/extracted/schema_spec.json - DO NOT hand edit column list without regenerating */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createExtension('pgcrypto', { ifNotExists: true });
  pgm.createTable("role_master", {
    role_code: { type: "varchar(50)", primaryKey: true },
    role_name: { type: "varchar(100)", notNull: true },
    description: { type: "varchar(300)" },
    is_active: { type: "boolean", notNull: true },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("integration_config", {
    integration_config_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    integration_name: { type: "varchar(80)", notNull: true },
    environment: { type: "varchar(20)", notNull: true },
    base_url: { type: "varchar(300)" },
    auth_type: { type: "varchar(30)" },
    credential_ref: { type: "varchar(200)" },
    is_enabled: { type: "boolean", notNull: true },
    last_success_at: { type: "timestamptz" },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("compliance_type_master", {
    compliance_type_code: { type: "varchar(50)", primaryKey: true },
    compliance_name: { type: "varchar(120)", notNull: true },
    asset_type: { type: "varchar(20)", notNull: true },
    is_critical: { type: "boolean", notNull: true },
    default_alert_days: { type: "varchar(50)" },
    status: { type: "varchar(20)", notNull: true },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("alert_rule", {
    alert_rule_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    alert_type: { type: "varchar(50)", notNull: true },
    entity_type: { type: "varchar(50)", notNull: true },
    threshold_value: { type: "numeric(14,3)" },
    threshold_unit: { type: "varchar(20)" },
    severity: { type: "varchar(20)", notNull: true },
    notify_role_code: { type: "varchar(50)" },
    is_active: { type: "boolean", notNull: true },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("inspection_template", {
    template_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    template_code: { type: "varchar(50)", notNull: true },
    template_name: { type: "varchar(120)", notNull: true },
    asset_type: { type: "varchar(20)", notNull: true },
    fuel_type: { type: "varchar(20)" },
    inspection_type: { type: "varchar(50)", notNull: true },
    status: { type: "varchar(20)", notNull: true },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("route_fuel_norm", {
    route_fuel_norm_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    route_code: { type: "varchar(50)", notNull: true },
    origin: { type: "varchar(120)", notNull: true },
    destination: { type: "varchar(120)", notNull: true },
    vehicle_type: { type: "varchar(50)", notNull: true },
    fuel_type: { type: "varchar(20)", notNull: true },
    planned_quantity: { type: "numeric(12,3)", notNull: true },
    planned_toll_amount: { type: "numeric(14,2)" },
    distance_km: { type: "numeric(12,2)" },
    effective_from: { type: "date", notNull: true },
    status: { type: "varchar(20)", notNull: true },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("ulip_api_log", {
    api_log_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    api_name: { type: "varchar(80)", notNull: true },
    reference_type: { type: "varchar(50)" },
    reference_id: { type: "uuid" },
    request_payload: { type: "text" },
    response_payload: { type: "text" },
    http_status_code: { type: "integer" },
    api_status: { type: "varchar(30)", notNull: true },
    error_message: { type: "varchar(1000)" },
    created_at: { type: "timestamptz", notNull: true },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("vendor_master", {
    vendor_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    vendor_code: { type: "varchar(30)", notNull: true },
    vendor_name: { type: "varchar(150)", notNull: true },
    vendor_type: { type: "varchar(50)", notNull: true },
    gstin: { type: "varchar(15)" },
    pan_no: { type: "varchar(10)" },
    contact_person: { type: "varchar(100)" },
    mobile_no: { type: "varchar(15)" },
    email: { type: "varchar(120)" },
    address: { type: "varchar(300)" },
    payment_terms_days: { type: "integer" },
    status: { type: "varchar(20)", notNull: true },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("item_master", {
    item_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    item_code: { type: "varchar(50)", notNull: true },
    item_name: { type: "varchar(150)", notNull: true },
    item_category: { type: "varchar(50)", notNull: true },
    uom: { type: "varchar(20)", notNull: true },
    is_serialized: { type: "boolean", notNull: true },
    is_reusable: { type: "boolean", notNull: true },
    standard_cost: { type: "numeric(14,2)" },
    status: { type: "varchar(20)", notNull: true },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("maintenance_schedule", {
    maintenance_schedule_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    schedule_code: { type: "varchar(50)", notNull: true },
    vehicle_category: { type: "varchar(50)" },
    vehicle_type: { type: "varchar(50)" },
    fuel_type: { type: "varchar(20)" },
    maintenance_type: { type: "varchar(50)", notNull: true },
    trigger_km: { type: "numeric(12,1)" },
    trigger_days: { type: "integer" },
    trigger_engine_hours: { type: "numeric(12,1)" },
    checklist_template_id: { type: "uuid" },
    is_blocking: { type: "boolean", notNull: true },
    status: { type: "varchar(20)", notNull: true },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("branch_master", {
    branch_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    branch_code: { type: "varchar(20)", notNull: true },
    branch_name: { type: "varchar(100)", notNull: true },
    region: { type: "varchar(50)" },
    state_code: { type: "varchar(10)" },
    city: { type: "varchar(80)" },
    address: { type: "varchar(300)" },
    is_workshop: { type: "boolean", notNull: true },
    is_store: { type: "boolean", notNull: true },
    status: { type: "varchar(20)", notNull: true },
    created_at: { type: "timestamptz", notNull: true },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("trailer_master", {
    trailer_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    trailer_no: { type: "varchar(20)", notNull: true },
    trailer_type: { type: "varchar(50)", notNull: true },
    body_type: { type: "varchar(50)" },
    chassis_no: { type: "varchar(50)" },
    payload_capacity_kg: { type: "numeric(12,2)" },
    volume_cbm: { type: "numeric(12,2)" },
    length_ft: { type: "numeric(8,2)" },
    axle_count: { type: "integer" },
    branch_id: { type: "uuid" },
    status: { type: "varchar(30)", notNull: true },
    created_at: { type: "timestamptz", notNull: true },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("asset_compliance", {
    asset_compliance_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    asset_type: { type: "varchar(20)", notNull: true },
    asset_id: { type: "uuid", notNull: true },
    compliance_type_code: { type: "varchar(50)", notNull: true },
    document_no: { type: "varchar(80)" },
    issued_by: { type: "varchar(120)" },
    valid_from: { type: "date" },
    valid_upto: { type: "date", notNull: true },
    amount: { type: "numeric(14,2)" },
    document_url: { type: "varchar(500)" },
    status: { type: "varchar(30)", notNull: true },
    last_verified_source: { type: "varchar(50)" },
    verified_at: { type: "timestamptz" },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("stock_ledger", {
    stock_ledger_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    txn_datetime: { type: "timestamptz", notNull: true },
    branch_id: { type: "uuid", notNull: true },
    item_id: { type: "uuid", notNull: true },
    movement_type: { type: "varchar(40)", notNull: true },
    quantity: { type: "numeric(12,3)", notNull: true },
    unit_cost: { type: "numeric(14,2)" },
    reference_type: { type: "varchar(40)" },
    reference_id: { type: "uuid" },
    issued_to_type: { type: "varchar(30)" },
    issued_to_id: { type: "uuid" },
    status: { type: "varchar(30)", notNull: true },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("fuel_vendor_station", {
    station_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    vendor_id: { type: "uuid", notNull: true },
    station_name: { type: "varchar(150)", notNull: true },
    fuel_types_supported: { type: "varchar(100)", notNull: true },
    address: { type: "varchar(300)" },
    latitude: { type: "numeric(10,7)" },
    longitude: { type: "numeric(10,7)" },
    is_approved: { type: "boolean", notNull: true },
    status: { type: "varchar(20)", notNull: true },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("fuel_rate_master", {
    fuel_rate_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    station_id: { type: "uuid", notNull: true },
    fuel_type: { type: "varchar(20)", notNull: true },
    unit_of_measure: { type: "varchar(10)", notNull: true },
    rate_per_unit: { type: "numeric(12,4)", notNull: true },
    effective_from: { type: "date", notNull: true },
    effective_to: { type: "date" },
    status: { type: "varchar(20)", notNull: true },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("user_master", {
    user_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    login_id: { type: "varchar(80)", notNull: true },
    display_name: { type: "varchar(120)", notNull: true },
    mobile_no: { type: "varchar(15)" },
    email: { type: "varchar(120)" },
    role_code: { type: "varchar(50)", notNull: true },
    branch_id: { type: "uuid" },
    status: { type: "varchar(20)", notNull: true },
    created_at: { type: "timestamptz", notNull: true },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("document_store", {
    document_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    entity_type: { type: "varchar(50)", notNull: true },
    entity_id: { type: "uuid", notNull: true },
    document_category: { type: "varchar(50)", notNull: true },
    file_name: { type: "varchar(255)", notNull: true },
    file_url: { type: "varchar(500)", notNull: true },
    mime_type: { type: "varchar(100)" },
    uploaded_by_user_id: { type: "uuid" },
    uploaded_at: { type: "timestamptz", notNull: true },
    ocr_json: { type: "text" },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("driver_master", {
    driver_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    driver_code: { type: "varchar(30)", notNull: true },
    driver_name: { type: "varchar(120)", notNull: true },
    mobile_no: { type: "varchar(15)" },
    licence_no: { type: "varchar(30)" },
    licence_valid_upto: { type: "date" },
    hazmat_certified: { type: "boolean", notNull: true },
    vendor_id: { type: "uuid" },
    home_branch_id: { type: "uuid" },
    status: { type: "varchar(20)", notNull: true },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("vehicle_master", {
    vehicle_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    registration_no: { type: "varchar(20)", notNull: true },
    vehicle_code: { type: "varchar(30)" },
    ownership_type: { type: "varchar(30)", notNull: true },
    vehicle_category: { type: "varchar(50)", notNull: true },
    vehicle_type: { type: "varchar(50)", notNull: true },
    fuel_type: { type: "varchar(20)", notNull: true },
    make: { type: "varchar(80)" },
    model: { type: "varchar(80)" },
    manufacture_year: { type: "smallint" },
    vin_no: { type: "varchar(50)" },
    chassis_no: { type: "varchar(50)" },
    engine_no: { type: "varchar(50)" },
    gvw_kg: { type: "numeric(12,2)" },
    payload_capacity_kg: { type: "numeric(12,2)" },
    volume_cbm: { type: "numeric(12,2)" },
    axle_configuration: { type: "varchar(30)" },
    body_type: { type: "varchar(50)" },
    branch_id: { type: "uuid" },
    current_driver_id: { type: "uuid" },
    status: { type: "varchar(30)", notNull: true },
    odo_source: { type: "varchar(20)" },
    current_odometer_km: { type: "numeric(12,1)" },
    created_at: { type: "timestamptz", notNull: true },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("compliance_alert", {
    compliance_alert_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    asset_compliance_id: { type: "uuid", notNull: true },
    alert_date: { type: "date", notNull: true },
    days_to_expiry: { type: "integer", notNull: true },
    severity: { type: "varchar(20)", notNull: true },
    status: { type: "varchar(20)", notNull: true },
    assigned_to_user_id: { type: "uuid" },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("alert_event", {
    alert_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    alert_type: { type: "varchar(50)", notNull: true },
    severity: { type: "varchar(20)", notNull: true },
    entity_type: { type: "varchar(50)", notNull: true },
    entity_id: { type: "uuid", notNull: true },
    alert_title: { type: "varchar(150)", notNull: true },
    alert_message: { type: "varchar(1000)" },
    assigned_to_user_id: { type: "uuid" },
    created_at: { type: "timestamptz", notNull: true },
    status: { type: "varchar(30)", notNull: true },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("tyre_master", {
    tyre_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    tyre_serial_no: { type: "varchar(80)", notNull: true },
    brand: { type: "varchar(80)" },
    model: { type: "varchar(80)" },
    size: { type: "varchar(40)", notNull: true },
    ply_rating: { type: "varchar(20)" },
    purchase_date: { type: "date" },
    vendor_id: { type: "uuid" },
    purchase_cost: { type: "numeric(14,2)" },
    warranty_upto: { type: "date" },
    current_branch_id: { type: "uuid" },
    current_vehicle_id: { type: "uuid" },
    current_trailer_id: { type: "uuid" },
    current_position: { type: "varchar(30)" },
    status: { type: "varchar(30)", notNull: true },
    total_run_km: { type: "numeric(12,1)" },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("approval_request", {
    approval_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    transaction_type: { type: "varchar(50)", notNull: true },
    transaction_id: { type: "uuid", notNull: true },
    requested_by_user_id: { type: "uuid", notNull: true },
    requested_at: { type: "timestamptz", notNull: true },
    approval_level: { type: "integer", notNull: true },
    approver_user_id: { type: "uuid" },
    approval_status: { type: "varchar(30)", notNull: true },
    decision_at: { type: "timestamptz" },
    remarks: { type: "varchar(500)" },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("approval_matrix", {
    approval_matrix_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    transaction_type: { type: "varchar(50)", notNull: true },
    branch_id: { type: "uuid" },
    amount_from: { type: "numeric(14,2)" },
    amount_to: { type: "numeric(14,2)" },
    approval_level: { type: "integer", notNull: true },
    role_code: { type: "varchar(50)", notNull: true },
    is_active: { type: "boolean", notNull: true },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("workshop_master", {
    workshop_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    workshop_code: { type: "varchar(30)", notNull: true },
    workshop_name: { type: "varchar(150)", notNull: true },
    workshop_type: { type: "varchar(50)", notNull: true },
    vendor_id: { type: "uuid" },
    branch_id: { type: "uuid" },
    gstin: { type: "varchar(15)" },
    service_categories: { type: "varchar(300)" },
    payment_terms_days: { type: "integer" },
    status: { type: "varchar(20)", notNull: true },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("vehicle_fuel_profile", {
    fuel_profile_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    vehicle_id: { type: "uuid", notNull: true },
    fuel_type: { type: "varchar(20)", notNull: true },
    diesel_tank_capacity_ltr: { type: "numeric(10,2)" },
    cng_cylinder_capacity_kg: { type: "numeric(10,2)" },
    cng_hydrotest_valid_upto: { type: "date" },
    lng_tank_capacity_kg: { type: "numeric(10,2)" },
    lng_tank_inspection_valid_upto: { type: "date" },
    battery_capacity_kwh: { type: "numeric(10,2)" },
    charger_connector_type: { type: "varchar(40)" },
    battery_warranty_upto: { type: "date" },
    expected_mileage: { type: "numeric(10,3)" },
    range_km: { type: "numeric(10,2)" },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("accompaniment_master", {
    accompaniment_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    accompaniment_code: { type: "varchar(50)", notNull: true },
    accompaniment_type: { type: "varchar(50)", notNull: true },
    item_id: { type: "uuid" },
    size_or_spec: { type: "varchar(100)" },
    is_reusable: { type: "boolean", notNull: true },
    current_branch_id: { type: "uuid" },
    current_status: { type: "varchar(30)", notNull: true },
    vendor_id: { type: "uuid" },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("accessory_master", {
    accessory_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    accessory_code: { type: "varchar(50)", notNull: true },
    accessory_type: { type: "varchar(50)", notNull: true },
    serial_no: { type: "varchar(80)" },
    vendor_id: { type: "uuid" },
    purchase_date: { type: "date" },
    warranty_upto: { type: "date" },
    sim_no: { type: "varchar(30)" },
    imei_no: { type: "varchar(30)" },
    current_vehicle_id: { type: "uuid" },
    current_trailer_id: { type: "uuid" },
    health_status: { type: "varchar(30)" },
    status: { type: "varchar(30)", notNull: true },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("trip_master", {
    trip_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    trip_no: { type: "varchar(50)", notNull: true },
    vehicle_id: { type: "uuid", notNull: true },
    trailer_id: { type: "uuid" },
    driver_id: { type: "uuid" },
    origin: { type: "varchar(120)", notNull: true },
    destination: { type: "varchar(120)", notNull: true },
    route_code: { type: "varchar(50)" },
    customer_name: { type: "varchar(150)" },
    cargo_type: { type: "varchar(80)" },
    planned_start_at: { type: "timestamptz" },
    actual_start_at: { type: "timestamptz" },
    status: { type: "varchar(30)", notNull: true },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("toll_transaction", {
    toll_txn_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    vehicle_id: { type: "uuid", notNull: true },
    trip_id: { type: "uuid" },
    toll_plaza_code: { type: "varchar(50)" },
    toll_plaza_name: { type: "varchar(150)" },
    txn_datetime: { type: "timestamptz", notNull: true },
    amount: { type: "numeric(14,2)", notNull: true },
    source: { type: "varchar(20)", notNull: true },
    reference_no: { type: "varchar(80)" },
    reconciliation_status: { type: "varchar(30)", notNull: true },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("vehicle_trailer_coupling", {
    coupling_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    vehicle_id: { type: "uuid", notNull: true },
    trailer_id: { type: "uuid", notNull: true },
    coupled_at: { type: "timestamptz", notNull: true },
    decoupled_at: { type: "timestamptz" },
    coupling_location: { type: "varchar(150)" },
    odometer_km: { type: "numeric(12,1)" },
    coupled_by_user_id: { type: "uuid" },
    status: { type: "varchar(20)", notNull: true },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("vendor_invoice", {
    invoice_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    invoice_type: { type: "varchar(40)", notNull: true },
    vendor_id: { type: "uuid", notNull: true },
    workshop_id: { type: "uuid" },
    invoice_no: { type: "varchar(80)", notNull: true },
    invoice_date: { type: "date", notNull: true },
    gstin: { type: "varchar(15)" },
    taxable_amount: { type: "numeric(14,2)", notNull: true },
    cgst_amount: { type: "numeric(14,2)" },
    sgst_amount: { type: "numeric(14,2)" },
    igst_amount: { type: "numeric(14,2)" },
    total_amount: { type: "numeric(14,2)", notNull: true },
    ocr_status: { type: "varchar(30)" },
    document_url: { type: "varchar(500)" },
    payable_status: { type: "varchar(30)", notNull: true },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("job_card", {
    job_card_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    job_card_no: { type: "varchar(50)", notNull: true },
    job_card_type: { type: "varchar(50)", notNull: true },
    vehicle_id: { type: "uuid" },
    trailer_id: { type: "uuid" },
    branch_id: { type: "uuid" },
    workshop_id: { type: "uuid" },
    reported_by_user_id: { type: "uuid" },
    reported_datetime: { type: "timestamptz", notNull: true },
    odometer_km: { type: "numeric(12,1)" },
    defect_summary: { type: "varchar(500)", notNull: true },
    priority: { type: "varchar(20)", notNull: true },
    estimated_amount: { type: "numeric(14,2)" },
    approved_amount: { type: "numeric(14,2)" },
    actual_amount: { type: "numeric(14,2)" },
    status: { type: "varchar(30)", notNull: true },
    opened_at: { type: "timestamptz", notNull: true },
    closed_at: { type: "timestamptz" },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("accompaniment_issue", {
    accompaniment_issue_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    accompaniment_id: { type: "uuid", notNull: true },
    vehicle_id: { type: "uuid" },
    trailer_id: { type: "uuid" },
    trip_id: { type: "uuid" },
    driver_id: { type: "uuid" },
    issue_datetime: { type: "timestamptz", notNull: true },
    return_datetime: { type: "timestamptz" },
    seal_no: { type: "varchar(80)" },
    otp_lock_event_id: { type: "varchar(100)" },
    loading_photo_url: { type: "varchar(500)" },
    unloading_photo_url: { type: "varchar(500)" },
    condition_on_return: { type: "varchar(200)" },
    status: { type: "varchar(30)", notNull: true },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("job_card_line", {
    job_card_line_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    job_card_id: { type: "uuid", notNull: true },
    line_type: { type: "varchar(30)", notNull: true },
    item_id: { type: "uuid" },
    tyre_id: { type: "uuid" },
    accessory_id: { type: "uuid" },
    description: { type: "varchar(300)", notNull: true },
    quantity: { type: "numeric(12,3)", notNull: true },
    unit_rate: { type: "numeric(12,4)" },
    amount: { type: "numeric(14,2)" },
    approval_status: { type: "varchar(30)", notNull: true },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("invoice_line", {
    invoice_line_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    invoice_id: { type: "uuid", notNull: true },
    job_card_id: { type: "uuid" },
    item_id: { type: "uuid" },
    description: { type: "varchar(300)", notNull: true },
    hsn_sac: { type: "varchar(20)" },
    quantity: { type: "numeric(12,3)", notNull: true },
    unit_rate: { type: "numeric(12,4)", notNull: true },
    tax_rate_pct: { type: "numeric(6,2)" },
    line_amount: { type: "numeric(14,2)", notNull: true },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("accident_event", {
    accident_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    job_card_id: { type: "uuid" },
    vehicle_id: { type: "uuid", notNull: true },
    trailer_id: { type: "uuid" },
    driver_id: { type: "uuid" },
    accident_datetime: { type: "timestamptz", notNull: true },
    location_text: { type: "varchar(200)" },
    third_party_involved: { type: "boolean", notNull: true },
    fir_no: { type: "varchar(80)" },
    damage_summary: { type: "varchar(600)" },
    insurance_claim_no: { type: "varchar(80)" },
    estimated_loss_amount: { type: "numeric(14,2)" },
    claim_status: { type: "varchar(30)" },
    status: { type: "varchar(30)", notNull: true },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("workshop_rate_contract", {
    rate_contract_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    workshop_id: { type: "uuid", notNull: true },
    service_code: { type: "varchar(50)", notNull: true },
    service_description: { type: "varchar(200)", notNull: true },
    vehicle_type: { type: "varchar(50)" },
    rate: { type: "numeric(14,2)", notNull: true },
    effective_from: { type: "date", notNull: true },
    effective_to: { type: "date" },
    status: { type: "varchar(20)", notNull: true },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("breakdown_event", {
    breakdown_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    job_card_id: { type: "uuid" },
    vehicle_id: { type: "uuid", notNull: true },
    trip_id: { type: "uuid" },
    breakdown_datetime: { type: "timestamptz", notNull: true },
    location_text: { type: "varchar(200)" },
    latitude: { type: "numeric(10,7)" },
    longitude: { type: "numeric(10,7)" },
    breakdown_category: { type: "varchar(50)", notNull: true },
    severity: { type: "varchar(20)", notNull: true },
    downtime_minutes: { type: "integer" },
    root_cause: { type: "varchar(500)" },
    status: { type: "varchar(30)", notNull: true },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("vehicle_cost_ledger", {
    cost_ledger_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    vehicle_id: { type: "uuid" },
    trailer_id: { type: "uuid" },
    trip_id: { type: "uuid" },
    cost_datetime: { type: "timestamptz", notNull: true },
    cost_category: { type: "varchar(50)", notNull: true },
    source_transaction_type: { type: "varchar(50)" },
    source_transaction_id: { type: "uuid" },
    amount: { type: "numeric(14,2)", notNull: true },
    branch_id: { type: "uuid" },
    posted_to_accounts: { type: "boolean", notNull: true },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("maintenance_due", {
    maintenance_due_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    vehicle_id: { type: "uuid", notNull: true },
    maintenance_schedule_id: { type: "uuid", notNull: true },
    due_date: { type: "date" },
    due_odometer_km: { type: "numeric(12,1)" },
    current_odometer_km: { type: "numeric(12,1)" },
    status: { type: "varchar(30)", notNull: true },
    job_card_id: { type: "uuid" },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("fuel_transaction", {
    fuel_txn_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    vehicle_id: { type: "uuid", notNull: true },
    trip_id: { type: "uuid" },
    driver_id: { type: "uuid" },
    station_id: { type: "uuid" },
    fuel_type: { type: "varchar(20)", notNull: true },
    txn_datetime: { type: "timestamptz", notNull: true },
    quantity: { type: "numeric(12,3)", notNull: true },
    unit_of_measure: { type: "varchar(10)", notNull: true },
    rate_per_unit: { type: "numeric(12,4)", notNull: true },
    amount: { type: "numeric(14,2)", notNull: true },
    odometer_km: { type: "numeric(12,1)" },
    start_soc_pct: { type: "numeric(5,2)" },
    end_soc_pct: { type: "numeric(5,2)" },
    fill_pressure: { type: "numeric(10,2)" },
    fuel_temperature: { type: "numeric(8,2)" },
    receipt_no: { type: "varchar(50)" },
    invoice_id: { type: "uuid" },
    status: { type: "varchar(30)", notNull: true },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("accessory_event", {
    accessory_event_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    accessory_id: { type: "uuid", notNull: true },
    event_type: { type: "varchar(40)", notNull: true },
    vehicle_id: { type: "uuid" },
    trailer_id: { type: "uuid" },
    event_datetime: { type: "timestamptz", notNull: true },
    job_card_id: { type: "uuid" },
    remarks: { type: "varchar(500)" },
    status: { type: "varchar(30)", notNull: true },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("payable_validation", {
    validation_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    invoice_id: { type: "uuid", notNull: true },
    job_card_id: { type: "uuid" },
    validation_type: { type: "varchar(50)", notNull: true },
    validation_status: { type: "varchar(30)", notNull: true },
    expected_value: { type: "varchar(200)" },
    actual_value: { type: "varchar(200)" },
    variance_amount: { type: "numeric(14,2)" },
    remarks: { type: "varchar(500)" },
    approved_by_user_id: { type: "uuid" },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("tyre_movement", {
    tyre_movement_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    tyre_id: { type: "uuid", notNull: true },
    movement_type: { type: "varchar(40)", notNull: true },
    vehicle_id: { type: "uuid" },
    trailer_id: { type: "uuid" },
    from_position: { type: "varchar(30)" },
    to_position: { type: "varchar(30)" },
    odometer_km: { type: "numeric(12,1)" },
    tread_depth_mm: { type: "numeric(6,2)" },
    condition_notes: { type: "varchar(500)" },
    movement_datetime: { type: "timestamptz", notNull: true },
    job_card_id: { type: "uuid" },
    status: { type: "varchar(30)", notNull: true },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("inspection_event", {
    inspection_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    template_id: { type: "uuid", notNull: true },
    asset_type: { type: "varchar(20)", notNull: true },
    asset_id: { type: "uuid", notNull: true },
    vehicle_id: { type: "uuid" },
    trailer_id: { type: "uuid" },
    performed_by_user_id: { type: "uuid" },
    inspection_datetime: { type: "timestamptz", notNull: true },
    outcome: { type: "varchar(30)", notNull: true },
    remarks: { type: "varchar(500)" },
    job_card_id: { type: "uuid" },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("fuel_variance", {
    fuel_variance_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    fuel_txn_id: { type: "uuid", notNull: true },
    route_fuel_norm_id: { type: "uuid" },
    planned_quantity: { type: "numeric(12,3)", notNull: true },
    actual_quantity: { type: "numeric(12,3)", notNull: true },
    variance_quantity: { type: "numeric(12,3)", notNull: true },
    variance_pct: { type: "numeric(8,3)" },
    exception_reason: { type: "varchar(300)" },
    approval_status: { type: "varchar(30)", notNull: true },
    approved_by_user_id: { type: "uuid" },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createTable("inspection_result_line", {
    inspection_line_id: { type: "uuid", primaryKey: true, default: pgm.func('gen_random_uuid()') },
    inspection_id: { type: "uuid", notNull: true },
    check_item_code: { type: "varchar(50)", notNull: true },
    check_item_name: { type: "varchar(150)", notNull: true },
    result: { type: "varchar(30)", notNull: true },
    severity: { type: "varchar(20)" },
    photo_url: { type: "varchar(500)" },
    remarks: { type: "varchar(500)" },
    created_by: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_by: { type: 'uuid' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_flag: { type: 'boolean', notNull: true, default: false },
    deleted_at: { type: 'timestamptz' },
  });

  // Foreign keys
  pgm.addConstraint("user_master", "fk_user_master_role_code", {
    foreignKeys: { columns: "role_code", references: "role_master(role_code)" },
  });
  pgm.addConstraint("user_master", "fk_user_master_branch_id", {
    foreignKeys: { columns: "branch_id", references: "branch_master(branch_id)" },
  });
  pgm.addConstraint("driver_master", "fk_driver_master_vendor_id", {
    foreignKeys: { columns: "vendor_id", references: "vendor_master(vendor_id)" },
  });
  pgm.addConstraint("driver_master", "fk_driver_master_home_branch_id", {
    foreignKeys: { columns: "home_branch_id", references: "branch_master(branch_id)" },
  });
  pgm.addConstraint("vehicle_master", "fk_vehicle_master_branch_id", {
    foreignKeys: { columns: "branch_id", references: "branch_master(branch_id)" },
  });
  pgm.addConstraint("vehicle_master", "fk_vehicle_master_current_driver_id", {
    foreignKeys: { columns: "current_driver_id", references: "driver_master(driver_id)" },
  });
  pgm.addConstraint("vehicle_fuel_profile", "fk_vehicle_fuel_profile_vehicle_id", {
    foreignKeys: { columns: "vehicle_id", references: "vehicle_master(vehicle_id)" },
  });
  pgm.addConstraint("trailer_master", "fk_trailer_master_branch_id", {
    foreignKeys: { columns: "branch_id", references: "branch_master(branch_id)" },
  });
  pgm.addConstraint("vehicle_trailer_coupling", "fk_vehicle_trailer_coupling_vehicle_id", {
    foreignKeys: { columns: "vehicle_id", references: "vehicle_master(vehicle_id)" },
  });
  pgm.addConstraint("vehicle_trailer_coupling", "fk_vehicle_trailer_coupling_trailer_id", {
    foreignKeys: { columns: "trailer_id", references: "trailer_master(trailer_id)" },
  });
  pgm.addConstraint("vehicle_trailer_coupling", "fk_vehicle_trailer_coupling_coupled_by_user_id", {
    foreignKeys: { columns: "coupled_by_user_id", references: "user_master(user_id)" },
  });
  pgm.addConstraint("fuel_vendor_station", "fk_fuel_vendor_station_vendor_id", {
    foreignKeys: { columns: "vendor_id", references: "vendor_master(vendor_id)" },
  });
  pgm.addConstraint("fuel_rate_master", "fk_fuel_rate_master_station_id", {
    foreignKeys: { columns: "station_id", references: "fuel_vendor_station(station_id)" },
  });
  pgm.addConstraint("fuel_transaction", "fk_fuel_transaction_vehicle_id", {
    foreignKeys: { columns: "vehicle_id", references: "vehicle_master(vehicle_id)" },
  });
  pgm.addConstraint("fuel_transaction", "fk_fuel_transaction_trip_id", {
    foreignKeys: { columns: "trip_id", references: "trip_master(trip_id)" },
  });
  pgm.addConstraint("fuel_transaction", "fk_fuel_transaction_driver_id", {
    foreignKeys: { columns: "driver_id", references: "driver_master(driver_id)" },
  });
  pgm.addConstraint("fuel_transaction", "fk_fuel_transaction_station_id", {
    foreignKeys: { columns: "station_id", references: "fuel_vendor_station(station_id)" },
  });
  pgm.addConstraint("fuel_transaction", "fk_fuel_transaction_invoice_id", {
    foreignKeys: { columns: "invoice_id", references: "vendor_invoice(invoice_id)" },
  });
  pgm.addConstraint("fuel_variance", "fk_fuel_variance_fuel_txn_id", {
    foreignKeys: { columns: "fuel_txn_id", references: "fuel_transaction(fuel_txn_id)" },
  });
  pgm.addConstraint("fuel_variance", "fk_fuel_variance_route_fuel_norm_id", {
    foreignKeys: { columns: "route_fuel_norm_id", references: "route_fuel_norm(route_fuel_norm_id)" },
  });
  pgm.addConstraint("fuel_variance", "fk_fuel_variance_approved_by_user_id", {
    foreignKeys: { columns: "approved_by_user_id", references: "user_master(user_id)" },
  });
  pgm.addConstraint("asset_compliance", "fk_asset_compliance_compliance_type_code", {
    foreignKeys: { columns: "compliance_type_code", references: "compliance_type_master(compliance_type_code)" },
  });
  pgm.addConstraint("compliance_alert", "fk_compliance_alert_asset_compliance_id", {
    foreignKeys: { columns: "asset_compliance_id", references: "asset_compliance(asset_compliance_id)" },
  });
  pgm.addConstraint("compliance_alert", "fk_compliance_alert_assigned_to_user_id", {
    foreignKeys: { columns: "assigned_to_user_id", references: "user_master(user_id)" },
  });
  pgm.addConstraint("maintenance_schedule", "fk_maintenance_schedule_checklist_template_id", {
    foreignKeys: { columns: "checklist_template_id", references: "inspection_template(template_id)" },
  });
  pgm.addConstraint("maintenance_due", "fk_maintenance_due_vehicle_id", {
    foreignKeys: { columns: "vehicle_id", references: "vehicle_master(vehicle_id)" },
  });
  pgm.addConstraint("maintenance_due", "fk_maintenance_due_maintenance_schedule_id", {
    foreignKeys: { columns: "maintenance_schedule_id", references: "maintenance_schedule(maintenance_schedule_id)" },
  });
  pgm.addConstraint("maintenance_due", "fk_maintenance_due_job_card_id", {
    foreignKeys: { columns: "job_card_id", references: "job_card(job_card_id)" },
  });
  pgm.addConstraint("job_card", "fk_job_card_vehicle_id", {
    foreignKeys: { columns: "vehicle_id", references: "vehicle_master(vehicle_id)" },
  });
  pgm.addConstraint("job_card", "fk_job_card_trailer_id", {
    foreignKeys: { columns: "trailer_id", references: "trailer_master(trailer_id)" },
  });
  pgm.addConstraint("job_card", "fk_job_card_branch_id", {
    foreignKeys: { columns: "branch_id", references: "branch_master(branch_id)" },
  });
  pgm.addConstraint("job_card", "fk_job_card_workshop_id", {
    foreignKeys: { columns: "workshop_id", references: "workshop_master(workshop_id)" },
  });
  pgm.addConstraint("job_card", "fk_job_card_reported_by_user_id", {
    foreignKeys: { columns: "reported_by_user_id", references: "user_master(user_id)" },
  });
  pgm.addConstraint("job_card_line", "fk_job_card_line_job_card_id", {
    foreignKeys: { columns: "job_card_id", references: "job_card(job_card_id)" },
  });
  pgm.addConstraint("job_card_line", "fk_job_card_line_item_id", {
    foreignKeys: { columns: "item_id", references: "item_master(item_id)" },
  });
  pgm.addConstraint("job_card_line", "fk_job_card_line_tyre_id", {
    foreignKeys: { columns: "tyre_id", references: "tyre_master(tyre_id)" },
  });
  pgm.addConstraint("job_card_line", "fk_job_card_line_accessory_id", {
    foreignKeys: { columns: "accessory_id", references: "accessory_master(accessory_id)" },
  });
  pgm.addConstraint("breakdown_event", "fk_breakdown_event_job_card_id", {
    foreignKeys: { columns: "job_card_id", references: "job_card(job_card_id)" },
  });
  pgm.addConstraint("breakdown_event", "fk_breakdown_event_vehicle_id", {
    foreignKeys: { columns: "vehicle_id", references: "vehicle_master(vehicle_id)" },
  });
  pgm.addConstraint("breakdown_event", "fk_breakdown_event_trip_id", {
    foreignKeys: { columns: "trip_id", references: "trip_master(trip_id)" },
  });
  pgm.addConstraint("accident_event", "fk_accident_event_job_card_id", {
    foreignKeys: { columns: "job_card_id", references: "job_card(job_card_id)" },
  });
  pgm.addConstraint("accident_event", "fk_accident_event_vehicle_id", {
    foreignKeys: { columns: "vehicle_id", references: "vehicle_master(vehicle_id)" },
  });
  pgm.addConstraint("accident_event", "fk_accident_event_trailer_id", {
    foreignKeys: { columns: "trailer_id", references: "trailer_master(trailer_id)" },
  });
  pgm.addConstraint("accident_event", "fk_accident_event_driver_id", {
    foreignKeys: { columns: "driver_id", references: "driver_master(driver_id)" },
  });
  pgm.addConstraint("workshop_master", "fk_workshop_master_vendor_id", {
    foreignKeys: { columns: "vendor_id", references: "vendor_master(vendor_id)" },
  });
  pgm.addConstraint("workshop_master", "fk_workshop_master_branch_id", {
    foreignKeys: { columns: "branch_id", references: "branch_master(branch_id)" },
  });
  pgm.addConstraint("workshop_rate_contract", "fk_workshop_rate_contract_workshop_id", {
    foreignKeys: { columns: "workshop_id", references: "workshop_master(workshop_id)" },
  });
  pgm.addConstraint("vendor_invoice", "fk_vendor_invoice_vendor_id", {
    foreignKeys: { columns: "vendor_id", references: "vendor_master(vendor_id)" },
  });
  pgm.addConstraint("vendor_invoice", "fk_vendor_invoice_workshop_id", {
    foreignKeys: { columns: "workshop_id", references: "workshop_master(workshop_id)" },
  });
  pgm.addConstraint("invoice_line", "fk_invoice_line_invoice_id", {
    foreignKeys: { columns: "invoice_id", references: "vendor_invoice(invoice_id)" },
  });
  pgm.addConstraint("invoice_line", "fk_invoice_line_job_card_id", {
    foreignKeys: { columns: "job_card_id", references: "job_card(job_card_id)" },
  });
  pgm.addConstraint("invoice_line", "fk_invoice_line_item_id", {
    foreignKeys: { columns: "item_id", references: "item_master(item_id)" },
  });
  pgm.addConstraint("payable_validation", "fk_payable_validation_invoice_id", {
    foreignKeys: { columns: "invoice_id", references: "vendor_invoice(invoice_id)" },
  });
  pgm.addConstraint("payable_validation", "fk_payable_validation_job_card_id", {
    foreignKeys: { columns: "job_card_id", references: "job_card(job_card_id)" },
  });
  pgm.addConstraint("payable_validation", "fk_payable_validation_approved_by_user_id", {
    foreignKeys: { columns: "approved_by_user_id", references: "user_master(user_id)" },
  });
  pgm.addConstraint("stock_ledger", "fk_stock_ledger_branch_id", {
    foreignKeys: { columns: "branch_id", references: "branch_master(branch_id)" },
  });
  pgm.addConstraint("stock_ledger", "fk_stock_ledger_item_id", {
    foreignKeys: { columns: "item_id", references: "item_master(item_id)" },
  });
  pgm.addConstraint("tyre_master", "fk_tyre_master_vendor_id", {
    foreignKeys: { columns: "vendor_id", references: "vendor_master(vendor_id)" },
  });
  pgm.addConstraint("tyre_master", "fk_tyre_master_current_branch_id", {
    foreignKeys: { columns: "current_branch_id", references: "branch_master(branch_id)" },
  });
  pgm.addConstraint("tyre_master", "fk_tyre_master_current_vehicle_id", {
    foreignKeys: { columns: "current_vehicle_id", references: "vehicle_master(vehicle_id)" },
  });
  pgm.addConstraint("tyre_master", "fk_tyre_master_current_trailer_id", {
    foreignKeys: { columns: "current_trailer_id", references: "trailer_master(trailer_id)" },
  });
  pgm.addConstraint("tyre_movement", "fk_tyre_movement_tyre_id", {
    foreignKeys: { columns: "tyre_id", references: "tyre_master(tyre_id)" },
  });
  pgm.addConstraint("tyre_movement", "fk_tyre_movement_vehicle_id", {
    foreignKeys: { columns: "vehicle_id", references: "vehicle_master(vehicle_id)" },
  });
  pgm.addConstraint("tyre_movement", "fk_tyre_movement_trailer_id", {
    foreignKeys: { columns: "trailer_id", references: "trailer_master(trailer_id)" },
  });
  pgm.addConstraint("tyre_movement", "fk_tyre_movement_job_card_id", {
    foreignKeys: { columns: "job_card_id", references: "job_card(job_card_id)" },
  });
  pgm.addConstraint("accessory_master", "fk_accessory_master_vendor_id", {
    foreignKeys: { columns: "vendor_id", references: "vendor_master(vendor_id)" },
  });
  pgm.addConstraint("accessory_master", "fk_accessory_master_current_vehicle_id", {
    foreignKeys: { columns: "current_vehicle_id", references: "vehicle_master(vehicle_id)" },
  });
  pgm.addConstraint("accessory_master", "fk_accessory_master_current_trailer_id", {
    foreignKeys: { columns: "current_trailer_id", references: "trailer_master(trailer_id)" },
  });
  pgm.addConstraint("accessory_event", "fk_accessory_event_accessory_id", {
    foreignKeys: { columns: "accessory_id", references: "accessory_master(accessory_id)" },
  });
  pgm.addConstraint("accessory_event", "fk_accessory_event_vehicle_id", {
    foreignKeys: { columns: "vehicle_id", references: "vehicle_master(vehicle_id)" },
  });
  pgm.addConstraint("accessory_event", "fk_accessory_event_trailer_id", {
    foreignKeys: { columns: "trailer_id", references: "trailer_master(trailer_id)" },
  });
  pgm.addConstraint("accessory_event", "fk_accessory_event_job_card_id", {
    foreignKeys: { columns: "job_card_id", references: "job_card(job_card_id)" },
  });
  pgm.addConstraint("accompaniment_master", "fk_accompaniment_master_item_id", {
    foreignKeys: { columns: "item_id", references: "item_master(item_id)" },
  });
  pgm.addConstraint("accompaniment_master", "fk_accompaniment_master_current_branch_id", {
    foreignKeys: { columns: "current_branch_id", references: "branch_master(branch_id)" },
  });
  pgm.addConstraint("accompaniment_master", "fk_accompaniment_master_vendor_id", {
    foreignKeys: { columns: "vendor_id", references: "vendor_master(vendor_id)" },
  });
  pgm.addConstraint("accompaniment_issue", "fk_accompaniment_issue_accompaniment_id", {
    foreignKeys: { columns: "accompaniment_id", references: "accompaniment_master(accompaniment_id)" },
  });
  pgm.addConstraint("accompaniment_issue", "fk_accompaniment_issue_vehicle_id", {
    foreignKeys: { columns: "vehicle_id", references: "vehicle_master(vehicle_id)" },
  });
  pgm.addConstraint("accompaniment_issue", "fk_accompaniment_issue_trailer_id", {
    foreignKeys: { columns: "trailer_id", references: "trailer_master(trailer_id)" },
  });
  pgm.addConstraint("accompaniment_issue", "fk_accompaniment_issue_trip_id", {
    foreignKeys: { columns: "trip_id", references: "trip_master(trip_id)" },
  });
  pgm.addConstraint("accompaniment_issue", "fk_accompaniment_issue_driver_id", {
    foreignKeys: { columns: "driver_id", references: "driver_master(driver_id)" },
  });
  pgm.addConstraint("inspection_event", "fk_inspection_event_template_id", {
    foreignKeys: { columns: "template_id", references: "inspection_template(template_id)" },
  });
  pgm.addConstraint("inspection_event", "fk_inspection_event_vehicle_id", {
    foreignKeys: { columns: "vehicle_id", references: "vehicle_master(vehicle_id)" },
  });
  pgm.addConstraint("inspection_event", "fk_inspection_event_trailer_id", {
    foreignKeys: { columns: "trailer_id", references: "trailer_master(trailer_id)" },
  });
  pgm.addConstraint("inspection_event", "fk_inspection_event_performed_by_user_id", {
    foreignKeys: { columns: "performed_by_user_id", references: "user_master(user_id)" },
  });
  pgm.addConstraint("inspection_event", "fk_inspection_event_job_card_id", {
    foreignKeys: { columns: "job_card_id", references: "job_card(job_card_id)" },
  });
  pgm.addConstraint("inspection_result_line", "fk_inspection_result_line_inspection_id", {
    foreignKeys: { columns: "inspection_id", references: "inspection_event(inspection_id)" },
  });
  pgm.addConstraint("approval_request", "fk_approval_request_requested_by_user_id", {
    foreignKeys: { columns: "requested_by_user_id", references: "user_master(user_id)" },
  });
  pgm.addConstraint("approval_request", "fk_approval_request_approver_user_id", {
    foreignKeys: { columns: "approver_user_id", references: "user_master(user_id)" },
  });
  pgm.addConstraint("alert_event", "fk_alert_event_assigned_to_user_id", {
    foreignKeys: { columns: "assigned_to_user_id", references: "user_master(user_id)" },
  });
  pgm.addConstraint("trip_master", "fk_trip_master_vehicle_id", {
    foreignKeys: { columns: "vehicle_id", references: "vehicle_master(vehicle_id)" },
  });
  pgm.addConstraint("trip_master", "fk_trip_master_trailer_id", {
    foreignKeys: { columns: "trailer_id", references: "trailer_master(trailer_id)" },
  });
  pgm.addConstraint("trip_master", "fk_trip_master_driver_id", {
    foreignKeys: { columns: "driver_id", references: "driver_master(driver_id)" },
  });
  pgm.addConstraint("toll_transaction", "fk_toll_transaction_vehicle_id", {
    foreignKeys: { columns: "vehicle_id", references: "vehicle_master(vehicle_id)" },
  });
  pgm.addConstraint("toll_transaction", "fk_toll_transaction_trip_id", {
    foreignKeys: { columns: "trip_id", references: "trip_master(trip_id)" },
  });
  pgm.addConstraint("document_store", "fk_document_store_uploaded_by_user_id", {
    foreignKeys: { columns: "uploaded_by_user_id", references: "user_master(user_id)" },
  });
  pgm.addConstraint("vehicle_cost_ledger", "fk_vehicle_cost_ledger_vehicle_id", {
    foreignKeys: { columns: "vehicle_id", references: "vehicle_master(vehicle_id)" },
  });
  pgm.addConstraint("vehicle_cost_ledger", "fk_vehicle_cost_ledger_trailer_id", {
    foreignKeys: { columns: "trailer_id", references: "trailer_master(trailer_id)" },
  });
  pgm.addConstraint("vehicle_cost_ledger", "fk_vehicle_cost_ledger_trip_id", {
    foreignKeys: { columns: "trip_id", references: "trip_master(trip_id)" },
  });
  pgm.addConstraint("vehicle_cost_ledger", "fk_vehicle_cost_ledger_branch_id", {
    foreignKeys: { columns: "branch_id", references: "branch_master(branch_id)" },
  });
  pgm.addConstraint("approval_matrix", "fk_approval_matrix_branch_id", {
    foreignKeys: { columns: "branch_id", references: "branch_master(branch_id)" },
  });
  pgm.addConstraint("approval_matrix", "fk_approval_matrix_role_code", {
    foreignKeys: { columns: "role_code", references: "role_master(role_code)" },
  });
  pgm.addConstraint("alert_rule", "fk_alert_rule_notify_role_code", {
    foreignKeys: { columns: "notify_role_code", references: "role_master(role_code)" },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("inspection_result_line", { cascade: true });
  pgm.dropTable("fuel_variance", { cascade: true });
  pgm.dropTable("inspection_event", { cascade: true });
  pgm.dropTable("tyre_movement", { cascade: true });
  pgm.dropTable("payable_validation", { cascade: true });
  pgm.dropTable("accessory_event", { cascade: true });
  pgm.dropTable("fuel_transaction", { cascade: true });
  pgm.dropTable("maintenance_due", { cascade: true });
  pgm.dropTable("vehicle_cost_ledger", { cascade: true });
  pgm.dropTable("breakdown_event", { cascade: true });
  pgm.dropTable("workshop_rate_contract", { cascade: true });
  pgm.dropTable("accident_event", { cascade: true });
  pgm.dropTable("invoice_line", { cascade: true });
  pgm.dropTable("job_card_line", { cascade: true });
  pgm.dropTable("accompaniment_issue", { cascade: true });
  pgm.dropTable("job_card", { cascade: true });
  pgm.dropTable("vendor_invoice", { cascade: true });
  pgm.dropTable("vehicle_trailer_coupling", { cascade: true });
  pgm.dropTable("toll_transaction", { cascade: true });
  pgm.dropTable("trip_master", { cascade: true });
  pgm.dropTable("accessory_master", { cascade: true });
  pgm.dropTable("accompaniment_master", { cascade: true });
  pgm.dropTable("vehicle_fuel_profile", { cascade: true });
  pgm.dropTable("workshop_master", { cascade: true });
  pgm.dropTable("approval_matrix", { cascade: true });
  pgm.dropTable("approval_request", { cascade: true });
  pgm.dropTable("tyre_master", { cascade: true });
  pgm.dropTable("alert_event", { cascade: true });
  pgm.dropTable("compliance_alert", { cascade: true });
  pgm.dropTable("vehicle_master", { cascade: true });
  pgm.dropTable("driver_master", { cascade: true });
  pgm.dropTable("document_store", { cascade: true });
  pgm.dropTable("user_master", { cascade: true });
  pgm.dropTable("fuel_rate_master", { cascade: true });
  pgm.dropTable("fuel_vendor_station", { cascade: true });
  pgm.dropTable("stock_ledger", { cascade: true });
  pgm.dropTable("asset_compliance", { cascade: true });
  pgm.dropTable("trailer_master", { cascade: true });
  pgm.dropTable("branch_master", { cascade: true });
  pgm.dropTable("maintenance_schedule", { cascade: true });
  pgm.dropTable("item_master", { cascade: true });
  pgm.dropTable("vendor_master", { cascade: true });
  pgm.dropTable("ulip_api_log", { cascade: true });
  pgm.dropTable("route_fuel_norm", { cascade: true });
  pgm.dropTable("inspection_template", { cascade: true });
  pgm.dropTable("alert_rule", { cascade: true });
  pgm.dropTable("compliance_type_master", { cascade: true });
  pgm.dropTable("integration_config", { cascade: true });
  pgm.dropTable("role_master", { cascade: true });
};
