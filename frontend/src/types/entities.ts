export interface Branch {
  branch_id: string;
  branch_code: string;
  branch_name: string;
  region?: string | null;
  state_code?: string | null;
  city?: string | null;
  address?: string | null;
  is_workshop?: boolean;
  is_store?: boolean;
  status: string;
}

export interface Vendor {
  vendor_id: string;
  vendor_code: string;
  vendor_name: string;
  vendor_type: string;
  gstin?: string | null;
  contact_person?: string | null;
  mobile_no?: string | null;
  email?: string | null;
  payment_terms_days?: number | null;
  status: string;
  is_msme?: boolean;
  service_locations?: string | null;
  oem_association?: string | null;
  rate_contract_valid_from?: string | null;
  rate_contract_valid_to?: string | null;
  sla_terms?: string | null;
  bank_account_no?: string | null;
  bank_ifsc?: string | null;
  approval_status?: string;
  vendor_rating?: number | null;
}

export interface Driver {
  driver_id: string;
  driver_code: string;
  driver_name: string;
  licence_no?: string | null;
  mobile_no?: string | null;
  branch_id?: string | null;
  status: string;
}

export interface Vehicle {
  vehicle_id: string;
  registration_no: string;
  vehicle_code?: string | null;
  ownership_type: string;
  vehicle_category: string;
  vehicle_type: string;
  fuel_type: string;
  make?: string | null;
  model?: string | null;
  manufacture_year?: number | null;
  vin_no?: string | null;
  chassis_no?: string | null;
  engine_no?: string | null;
  gvw_kg?: number | null;
  payload_capacity_kg?: number | null;
  volume_cbm?: number | null;
  axle_configuration?: string | null;
  body_type?: string | null;
  branch_id?: string | null;
  current_driver_id?: string | null;
  status: string;
  odo_source?: string | null;
  current_odometer_km?: number | null;
}

export interface Trailer {
  trailer_id: string;
  trailer_no: string;
  trailer_type: string;
  body_type?: string | null;
  chassis_no?: string | null;
  payload_capacity_kg?: number | null;
  volume_cbm?: number | null;
  length_ft?: number | null;
  axle_count?: number | null;
  branch_id?: string | null;
  status: string;
}

export interface Coupling {
  coupling_id: string;
  vehicle_id: string;
  trailer_id: string;
  coupled_at: string;
  decoupled_at?: string | null;
  coupling_location?: string | null;
  odometer_km?: number | null;
  coupled_by_user_id?: string | null;
  status: string;
}

export interface FuelTransaction {
  fuel_txn_id: string;
  vehicle_id: string;
  trip_id?: string | null;
  driver_id?: string | null;
  station_id?: string | null;
  fuel_type: string;
  txn_datetime: string;
  quantity: number;
  unit_of_measure: string;
  rate_per_unit: number;
  amount: number;
  odometer_km?: number | null;
  start_soc_pct?: number | null;
  end_soc_pct?: number | null;
  fill_pressure?: number | null;
  fuel_temperature?: number | null;
  receipt_no?: string | null;
  invoice_id?: string | null;
  status: string;
}

export interface AssetCompliance {
  asset_compliance_id: string;
  asset_type: 'Vehicle' | 'Trailer';
  asset_id: string;
  compliance_type_code: string;
  document_no?: string | null;
  issued_by?: string | null;
  valid_from?: string | null;
  valid_upto: string;
  amount?: number | null;
  document_url?: string | null;
  status: string;
  last_verified_source?: string | null;
  verified_at?: string | null;
}

export interface ComplianceType {
  compliance_type_code: string;
  compliance_name?: string;
  applicable_to?: string;
}

export interface JobCard {
  job_card_id: string;
  job_card_no: string;
  job_card_type: string;
  vehicle_id?: string | null;
  trailer_id?: string | null;
  branch_id?: string | null;
  workshop_id?: string | null;
  reported_by_user_id?: string | null;
  reported_datetime: string;
  odometer_km?: number | null;
  defect_summary: string;
  priority: string;
  estimated_amount?: number | null;
  approved_amount?: number | null;
  actual_amount?: number | null;
  status: string;
  opened_at: string;
  closed_at?: string | null;
}

export interface JobCardLine {
  job_card_line_id: string;
  job_card_id: string;
  item_id?: string | null;
  description?: string;
  quantity?: number;
  unit_rate?: number;
  line_amount?: number;
  status?: string;
}

export interface Workshop {
  workshop_id: string;
  workshop_code: string;
  workshop_name: string;
  workshop_type: string;
  vendor_id?: string | null;
  branch_id?: string | null;
  gstin?: string | null;
  service_categories?: string | null;
  payment_terms_days?: number | null;
  status: string;
}

export interface VendorInvoice {
  invoice_id: string;
  invoice_type: string;
  vendor_id: string;
  workshop_id?: string | null;
  invoice_no: string;
  invoice_date: string;
  gstin?: string | null;
  taxable_amount: number;
  cgst_amount?: number | null;
  sgst_amount?: number | null;
  igst_amount?: number | null;
  total_amount: number;
  ocr_status?: string | null;
  document_url?: string | null;
  payable_status: string;
}

export interface Tyre {
  tyre_id: string;
  tyre_serial_no: string;
  brand?: string | null;
  model?: string | null;
  size: string;
  ply_rating?: string | null;
  purchase_date?: string | null;
  vendor_id?: string | null;
  purchase_cost?: number | null;
  warranty_upto?: string | null;
  current_branch_id?: string | null;
  current_vehicle_id?: string | null;
  current_trailer_id?: string | null;
  current_position?: string | null;
  status: string;
  total_run_km?: number | null;
}

export interface TyreMovement {
  tyre_movement_id: string;
  tyre_id: string;
  movement_type: string;
  vehicle_id?: string | null;
  trailer_id?: string | null;
  from_position?: string | null;
  to_position?: string | null;
  odometer_km?: number | null;
  tread_depth_mm?: number | null;
  condition_notes?: string | null;
  movement_datetime: string;
  job_card_id?: string | null;
  status: string;
}

export interface Accessory {
  accessory_id: string;
  accessory_code: string;
  accessory_type: string;
  serial_no?: string | null;
  vendor_id?: string | null;
  purchase_date?: string | null;
  warranty_upto?: string | null;
  sim_no?: string | null;
  imei_no?: string | null;
  current_vehicle_id?: string | null;
  current_trailer_id?: string | null;
  health_status?: string | null;
  status: string;
}

export interface AccessoryEvent {
  accessory_event_id: string;
  accessory_id: string;
  event_type: string;
  vehicle_id?: string | null;
  trailer_id?: string | null;
  event_datetime: string;
  job_card_id?: string | null;
  remarks?: string | null;
  status: string;
}

export interface Accompaniment {
  accompaniment_id: string;
  accompaniment_code: string;
  accompaniment_type: string;
  item_id?: string | null;
  size_or_spec?: string | null;
  is_reusable: boolean;
  current_branch_id?: string | null;
  current_status: string;
  vendor_id?: string | null;
}

export interface AccompanimentIssue {
  accompaniment_issue_id: string;
  accompaniment_id: string;
  vehicle_id?: string | null;
  trailer_id?: string | null;
  trip_id?: string | null;
  driver_id?: string | null;
  issue_datetime: string;
  return_datetime?: string | null;
  seal_no?: string | null;
  otp_lock_event_id?: string | null;
  loading_photo_url?: string | null;
  unloading_photo_url?: string | null;
  condition_on_return?: string | null;
  status: string;
}

export interface ApprovalRequest {
  approval_id: string;
  transaction_type: string;
  transaction_id: string;
  approval_level?: number | null;
  approval_status: string;
  requested_by?: string | null;
  requested_at: string;
  decided_by?: string | null;
  decided_at?: string | null;
  remarks?: string | null;
}

export interface AlertEvent {
  alert_id: string;
  alert_type?: string;
  severity: string;
  status: string;
  message?: string;
  vehicle_id?: string | null;
  trailer_id?: string | null;
  created_at: string;
}

export interface VehicleCostLedger {
  cost_ledger_id: string;
  vehicle_id?: string | null;
  trailer_id?: string | null;
  trip_id?: string | null;
  cost_datetime: string;
  cost_category: string;
  source_transaction_type?: string | null;
  source_transaction_id?: string | null;
  amount: number;
  branch_id?: string | null;
  posted_to_accounts: boolean;
}

export interface ItemMaster {
  item_id: string;
  item_code: string;
  item_name: string;
}

export interface Battery {
  battery_id: string;
  battery_serial_no: string;
  vehicle_id?: string | null;
  oem_name?: string | null;
  capacity_ah?: number | null;
  voltage?: number | null;
  warranty_months?: number | null;
  fitment_date?: string | null;
  removal_date?: string | null;
  removal_reason?: string | null;
  status: string;
  purchase_cost?: number | null;
  vendor_id?: string | null;
}

export interface Challan {
  challan_id: string;
  challan_no: string;
  vehicle_id: string;
  driver_id?: string | null;
  violation_type: string;
  violation_date: string;
  location?: string | null;
  amount: number;
  issuing_authority?: string | null;
  due_date?: string | null;
  payment_status: string;
  payment_date?: string | null;
  payment_reference?: string | null;
  responsibility?: string | null;
  remarks?: string | null;
}

export interface EpicStatusUpload {
  upload_id: string;
  uploaded_by?: string | null;
  uploaded_at: string;
  file_name: string;
  total_rows: number;
  matched_rows: number;
  unmatched_rows: number;
  status: string;
}

export interface NonWorkingVehicleAction {
  action_id: string;
  upload_id: string;
  vehicle_id?: string | null;
  vehicle_no_raw?: string | null;
  epic_status_raw?: string | null;
  issue_category?: string | null;
  remedial_action?: string | null;
  assigned_vendor_id?: string | null;
  escalation_level: number;
  resolved: boolean;
  resolved_at?: string | null;
  remarks?: string | null;
}
