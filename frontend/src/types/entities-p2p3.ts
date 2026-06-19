export interface InspectionTemplate {
  template_id: string;
  template_code: string;
  template_name: string;
  asset_type: string;
  fuel_type?: string | null;
  inspection_type: string;
  status: string;
}

export interface RouteFuelNorm {
  route_fuel_norm_id: string;
  route_code: string;
  origin: string;
  destination: string;
  vehicle_type: string;
  fuel_type: string;
  planned_quantity: number;
  planned_toll_amount?: number | null;
  distance_km?: number | null;
  effective_from: string;
  status: string;
}

export interface ComplianceAlertRecord {
  compliance_alert_id: string;
  asset_compliance_id: string;
  alert_date: string;
  days_to_expiry: number;
  severity: string;
  status: string;
  assigned_to_user_id?: string | null;
}

export interface TripMaster {
  trip_id: string;
  trip_no: string;
  vehicle_id: string;
  trailer_id?: string | null;
  driver_id?: string | null;
  origin: string;
  destination: string;
  route_code?: string | null;
  customer_name?: string | null;
  cargo_type?: string | null;
  planned_start_at?: string | null;
  actual_start_at?: string | null;
  status: string;
}

export interface TollTransaction {
  toll_txn_id: string;
  vehicle_id: string;
  trip_id?: string | null;
  toll_plaza_code?: string | null;
  toll_plaza_name?: string | null;
  txn_datetime: string;
  amount: number;
  source: string;
  reference_no?: string | null;
  reconciliation_status: string;
}

export interface ApprovalMatrix {
  approval_matrix_id: string;
  transaction_type: string;
  branch_id?: string | null;
  amount_from?: number | null;
  amount_to?: number | null;
  approval_level: number;
  role_code: string;
  is_active: boolean;
}

export interface MaintenanceSchedule {
  maintenance_schedule_id: string;
  schedule_code: string;
  vehicle_category?: string | null;
  vehicle_type?: string | null;
  fuel_type?: string | null;
  maintenance_type: string;
  trigger_km?: number | null;
  trigger_days?: number | null;
  trigger_engine_hours?: number | null;
  checklist_template_id?: string | null;
  is_blocking: boolean;
  status: string;
}

export interface MaintenanceDue {
  maintenance_due_id: string;
  vehicle_id: string;
  maintenance_schedule_id: string;
  due_date?: string | null;
  due_odometer_km?: number | null;
  current_odometer_km?: number | null;
  status: string;
  job_card_id?: string | null;
}

export interface BreakdownEvent {
  breakdown_id: string;
  job_card_id?: string | null;
  vehicle_id: string;
  trip_id?: string | null;
  breakdown_datetime: string;
  location_text?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  breakdown_category: string;
  severity: string;
  downtime_minutes?: number | null;
  root_cause?: string | null;
  status: string;
}

export interface AccidentEvent {
  accident_id: string;
  job_card_id?: string | null;
  vehicle_id: string;
  trailer_id?: string | null;
  driver_id?: string | null;
  accident_datetime: string;
  location_text?: string | null;
  third_party_involved: boolean;
  fir_no?: string | null;
  damage_summary?: string | null;
  insurance_claim_no?: string | null;
  estimated_loss_amount?: number | null;
  claim_status?: string | null;
  status: string;
}

export interface PayableValidation {
  validation_id: string;
  invoice_id: string;
  job_card_id?: string | null;
  validation_type: string;
  validation_status: string;
  expected_value?: string | null;
  actual_value?: string | null;
  variance_amount?: number | null;
  remarks?: string | null;
  approved_by_user_id?: string | null;
}

export interface StockLedger {
  stock_ledger_id: string;
  txn_datetime: string;
  branch_id: string;
  item_id: string;
  movement_type: string;
  quantity: number;
  unit_cost?: number | null;
  reference_type?: string | null;
  reference_id?: string | null;
  issued_to_type?: string | null;
  issued_to_id?: string | null;
  status: string;
}

export interface InspectionEvent {
  inspection_id: string;
  template_id: string;
  asset_type: string;
  asset_id: string;
  vehicle_id?: string | null;
  trailer_id?: string | null;
  performed_by_user_id?: string | null;
  inspection_datetime: string;
  outcome: string;
  remarks?: string | null;
  job_card_id?: string | null;
}

export interface InspectionResultLine {
  inspection_line_id: string;
  inspection_id: string;
  check_item_code: string;
  check_item_name: string;
  result: string;
  severity?: string | null;
  photo_url?: string | null;
  remarks?: string | null;
}

export interface IntegrationConfig {
  integration_config_id: string;
  integration_name: string;
  environment: string;
  base_url?: string | null;
  auth_type?: string | null;
  credential_ref?: string | null;
  is_enabled: boolean;
  last_success_at?: string | null;
}

export interface UlipApiLog {
  api_log_id: string;
  api_name?: string | null;
  reference_type?: string | null;
  reference_id?: string | null;
  request_payload?: string | null;
  response_payload?: string | null;
  http_status_code?: number | null;
  api_status?: string | null;
  error_message?: string | null;
  created_at: string;
}

export interface AlertRule {
  alert_rule_id: string;
  alert_type: string;
  entity_type: string;
  threshold_value?: number | null;
  threshold_unit?: string | null;
  severity: string;
  notify_role_code?: string | null;
  is_active: boolean;
}

export interface DocumentStore {
  document_id: string;
  entity_type: string;
  entity_id: string;
  document_category: string;
  file_name: string;
  file_url: string;
  mime_type?: string | null;
  uploaded_by_user_id?: string | null;
  uploaded_at?: string | null;
  ocr_json?: string | null;
}

export interface UserRecord {
  user_id: string;
  login_id: string;
  display_name: string;
  mobile_no?: string | null;
  email?: string | null;
  role_code: string;
  branch_id?: string | null;
  status: string;
  created_at?: string;
}
