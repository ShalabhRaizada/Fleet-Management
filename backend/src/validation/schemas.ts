import { z } from 'zod';

// Enumerations.csv-derived enums used for validation
export const FUEL_TYPES = ['Diesel', 'CNG', 'LNG', 'EV', 'Hybrid'] as const;
export const VEHICLE_STATUS = [
  'Available', 'Assigned', 'InTrip', 'UnderMaintenance', 'Breakdown',
  'AccidentHold', 'ComplianceHold', 'WorkshopHold', 'Sold', 'Scrapped', 'Inactive',
] as const;
export const OWNERSHIP_TYPES = ['Owned', 'Leased', 'Attached', 'Market'] as const;
export const TRAILER_STATUS = ['Available', 'Attached', 'UnderMaintenance', 'ComplianceHold', 'Inactive'] as const;
export const JOB_CARD_STATUS = [
  'Open', 'Assigned', 'Diagnosis', 'AwaitingParts', 'UnderRepair', 'QC',
  'Completed', 'Closed', 'Reopened', 'Cancelled',
] as const;
export const JOB_CARD_TYPE = [
  'Scheduled', 'Breakdown', 'Accident', 'Inspection', 'Tyre', 'Accessory', 'Trailer', 'Consumable',
] as const;
export const APPROVAL_STATUS = ['Pending', 'Approved', 'Rejected', 'Returned', 'Overridden'] as const;
export const TYRE_STATUS = [
  'New', 'InStock', 'Fitted', 'Running', 'Removed', 'Repairable',
  'SentForRepair', 'Retreaded', 'Spare', 'Dead', 'Scrap', 'Disposed',
] as const;
export const ACCESSORY_STATUS = ['InStock', 'Installed', 'Active', 'Faulty', 'Removed', 'UnderRepair', 'Replaced', 'Scrap'] as const;
export const ACCOMPANIMENT_TYPE = ['Tarpaulin', 'Seal', 'SmartSeal', 'OTPLock', 'ELock', 'Rope', 'Chain', 'LashingBelt', 'SafetyKit'] as const;
export const COMPLIANCE_STATUS = ['Valid', 'ExpiringSoon', 'Expired', 'UnderRenewal', 'Exempted', 'NotApplicable'] as const;
export const ALERT_SEVERITY = ['Info', 'Warning', 'Critical'] as const;

export const vehicleSchema = z.object({
  registration_no: z.string().min(1).max(20),
  vehicle_code: z.string().max(30).optional().nullable(),
  ownership_type: z.enum(OWNERSHIP_TYPES),
  vehicle_category: z.string().min(1).max(50),
  vehicle_type: z.string().min(1).max(50),
  fuel_type: z.enum(FUEL_TYPES),
  make: z.string().max(80).optional().nullable(),
  model: z.string().max(80).optional().nullable(),
  manufacture_year: z.number().int().optional().nullable(),
  vin_no: z.string().max(50).optional().nullable(),
  chassis_no: z.string().max(50).optional().nullable(),
  engine_no: z.string().max(50).optional().nullable(),
  gvw_kg: z.number().optional().nullable(),
  payload_capacity_kg: z.number().optional().nullable(),
  volume_cbm: z.number().optional().nullable(),
  axle_configuration: z.string().max(30).optional().nullable(),
  body_type: z.string().max(50).optional().nullable(),
  branch_id: z.string().uuid().optional().nullable(),
  current_driver_id: z.string().uuid().optional().nullable(),
  status: z.enum(VEHICLE_STATUS),
  odo_source: z.string().max(20).optional().nullable(),
  current_odometer_km: z.number().optional().nullable(),
}).partial({
  vehicle_code: true, make: true, model: true, manufacture_year: true, vin_no: true,
  chassis_no: true, engine_no: true, gvw_kg: true, payload_capacity_kg: true, volume_cbm: true,
  axle_configuration: true, body_type: true, branch_id: true, current_driver_id: true,
  odo_source: true, current_odometer_km: true,
});

export const trailerSchema = z.object({
  trailer_no: z.string().min(1).max(20),
  trailer_type: z.string().min(1).max(50),
  body_type: z.string().max(50).optional().nullable(),
  chassis_no: z.string().max(50).optional().nullable(),
  payload_capacity_kg: z.number().optional().nullable(),
  volume_cbm: z.number().optional().nullable(),
  length_ft: z.number().optional().nullable(),
  axle_count: z.number().int().optional().nullable(),
  branch_id: z.string().uuid().optional().nullable(),
  status: z.enum(TRAILER_STATUS),
});

export const couplingSchema = z.object({
  vehicle_id: z.string().uuid(),
  trailer_id: z.string().uuid(),
  coupled_at: z.coerce.date(),
  decoupled_at: z.coerce.date().optional().nullable(),
  coupling_location: z.string().max(150).optional().nullable(),
  odometer_km: z.number().optional().nullable(),
  coupled_by_user_id: z.string().uuid().optional().nullable(),
  status: z.string().max(20),
});

export const fuelTransactionSchema = z.object({
  vehicle_id: z.string().uuid(),
  trip_id: z.string().uuid().optional().nullable(),
  driver_id: z.string().uuid().optional().nullable(),
  station_id: z.string().uuid().optional().nullable(),
  fuel_type: z.enum(FUEL_TYPES),
  txn_datetime: z.coerce.date(),
  quantity: z.number().positive(),
  unit_of_measure: z.string().min(1).max(10),
  rate_per_unit: z.number().positive(),
  amount: z.number().positive(),
  odometer_km: z.number().optional().nullable(),
  start_soc_pct: z.number().optional().nullable(),
  end_soc_pct: z.number().optional().nullable(),
  fill_pressure: z.number().optional().nullable(),
  fuel_temperature: z.number().optional().nullable(),
  receipt_no: z.string().max(50).optional().nullable(),
  invoice_id: z.string().uuid().optional().nullable(),
  status: z.string().max(30).default('Recorded'),
});

export const assetComplianceSchema = z.object({
  asset_type: z.enum(['Vehicle', 'Trailer']),
  asset_id: z.string().uuid(),
  compliance_type_code: z.string().min(1).max(50),
  document_no: z.string().max(80).optional().nullable(),
  issued_by: z.string().max(120).optional().nullable(),
  valid_from: z.coerce.date().optional().nullable(),
  valid_upto: z.coerce.date(),
  amount: z.number().optional().nullable(),
  document_url: z.string().max(500).optional().nullable(),
  status: z.enum(COMPLIANCE_STATUS),
  last_verified_source: z.string().max(50).optional().nullable(),
  verified_at: z.coerce.date().optional().nullable(),
});

export const jobCardSchema = z.object({
  job_card_no: z.string().min(1).max(50),
  job_card_type: z.enum(JOB_CARD_TYPE),
  vehicle_id: z.string().uuid().optional().nullable(),
  trailer_id: z.string().uuid().optional().nullable(),
  branch_id: z.string().uuid().optional().nullable(),
  workshop_id: z.string().uuid().optional().nullable(),
  reported_by_user_id: z.string().uuid().optional().nullable(),
  reported_datetime: z.coerce.date(),
  odometer_km: z.number().optional().nullable(),
  defect_summary: z.string().min(1).max(500),
  priority: z.string().min(1).max(20),
  estimated_amount: z.number().optional().nullable(),
  approved_amount: z.number().optional().nullable(),
  actual_amount: z.number().optional().nullable(),
  status: z.enum(JOB_CARD_STATUS).default('Open'),
  opened_at: z.coerce.date(),
  closed_at: z.coerce.date().optional().nullable(),
});

export const workshopSchema = z.object({
  workshop_code: z.string().min(1).max(30),
  workshop_name: z.string().min(1).max(150),
  workshop_type: z.string().min(1).max(50),
  vendor_id: z.string().uuid().optional().nullable(),
  branch_id: z.string().uuid().optional().nullable(),
  gstin: z.string().max(15).optional().nullable(),
  service_categories: z.string().max(300).optional().nullable(),
  payment_terms_days: z.number().int().optional().nullable(),
  status: z.string().max(20),
});

export const tyreSchema = z.object({
  tyre_serial_no: z.string().min(1).max(80),
  brand: z.string().max(80).optional().nullable(),
  model: z.string().max(80).optional().nullable(),
  size: z.string().min(1).max(40),
  ply_rating: z.string().max(20).optional().nullable(),
  purchase_date: z.coerce.date().optional().nullable(),
  vendor_id: z.string().uuid().optional().nullable(),
  purchase_cost: z.number().optional().nullable(),
  warranty_upto: z.coerce.date().optional().nullable(),
  current_branch_id: z.string().uuid().optional().nullable(),
  current_vehicle_id: z.string().uuid().optional().nullable(),
  current_trailer_id: z.string().uuid().optional().nullable(),
  current_position: z.string().max(30).optional().nullable(),
  status: z.enum(TYRE_STATUS),
  total_run_km: z.number().optional().nullable(),
});

export const accessorySchema = z.object({
  accessory_code: z.string().min(1).max(50),
  accessory_type: z.string().min(1).max(50),
  serial_no: z.string().max(80).optional().nullable(),
  vendor_id: z.string().uuid().optional().nullable(),
  purchase_date: z.coerce.date().optional().nullable(),
  warranty_upto: z.coerce.date().optional().nullable(),
  sim_no: z.string().max(30).optional().nullable(),
  imei_no: z.string().max(30).optional().nullable(),
  current_vehicle_id: z.string().uuid().optional().nullable(),
  current_trailer_id: z.string().uuid().optional().nullable(),
  health_status: z.string().max(30).optional().nullable(),
  status: z.enum(ACCESSORY_STATUS),
});

export const accompanimentSchema = z.object({
  accompaniment_code: z.string().min(1).max(50),
  accompaniment_type: z.enum(ACCOMPANIMENT_TYPE),
  item_id: z.string().uuid().optional().nullable(),
  size_or_spec: z.string().max(100).optional().nullable(),
  is_reusable: z.boolean(),
  current_branch_id: z.string().uuid().optional().nullable(),
  current_status: z.string().max(30),
  vendor_id: z.string().uuid().optional().nullable(),
});

export const approvalDecisionSchema = z.object({
  decision: z.enum(['Approved', 'Rejected']),
  remarks: z.string().max(500).optional().nullable(),
});
