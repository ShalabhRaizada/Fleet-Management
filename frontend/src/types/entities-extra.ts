export interface FuelVariance {
  fuel_variance_id: string;
  fuel_txn_id: string;
  route_fuel_norm_id?: string | null;
  planned_quantity: number;
  actual_quantity: number;
  variance_quantity: number;
  variance_pct?: number | null;
  exception_reason?: string | null;
  approval_status: string;
  approved_by_user_id?: string | null;
}
