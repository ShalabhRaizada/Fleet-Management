export type TyreAssetType = 'Vehicle' | 'Trailer';
export type TyreRotationStatus = 'Draft' | 'Submitted' | 'Approved';
export type TyreMovementType = 'Rotation' | 'MoveToSpare' | 'SpareToActive' | 'Remove' | 'AddReplacement';
export type TyreDestinationStatus = 'Spare' | 'SentForRepair' | 'Repairable' | 'Retreaded' | 'Scrap';

export interface TyrePosition {
  position_id: string;
  asset_type: TyreAssetType;
  axle_configuration: string;
  position_code: string;
  position_label: string | null;
  sort_order: number;
}

export interface TyreLayoutTyre {
  tyre_id: string;
  tyre_serial_no: string;
  brand: string | null;
  model: string | null;
  size: string;
  current_position: string | null;
  status: string;
  total_run_km: number | null;
  last_rotation_date: string | null;
  last_rotation_odometer_km: number | null;
}

export interface TyreLayoutPosition {
  positionCode: string;
  positionLabel: string | null;
  sortOrder: number;
  tyre: TyreLayoutTyre | null;
}

export interface TyreLayout {
  assetType: TyreAssetType;
  assetId: string;
  axleConfiguration: string | null;
  odometer: number | null;
  positions: TyreLayoutPosition[];
  spareTyres: TyreLayoutTyre[];
}

export interface TyreRotationLineInput {
  tyreId: string;
  oldPositionCode?: string | null;
  newPositionCode?: string | null;
  oldTreadDepth?: number | null;
  newTreadDepth?: number | null;
  airPressure?: number | null;
  movementType: TyreMovementType;
  destinationStatus?: TyreDestinationStatus | null;
  remarks?: string | null;
}

export interface TyreRotationCreateInput {
  assetType: TyreAssetType;
  assetId: string;
  rotationDate: string;
  odometerReading: number;
  workshopId?: string | null;
  technicianName?: string | null;
  supervisorId?: string | null;
  reasonCode?: string | null;
  remarks?: string | null;
  lines: TyreRotationLineInput[];
}

export interface TyreRotationHeader {
  rotation_header_id: string;
  asset_type: TyreAssetType;
  asset_id: string;
  rotation_date: string;
  odometer_km: number;
  workshop_id: string | null;
  technician_name: string | null;
  supervisor_id: string | null;
  reason_code: string | null;
  remarks: string | null;
  status: TyreRotationStatus;
  created_by: string | null;
  created_at: string;
  submitted_by: string | null;
  submitted_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  line_count?: number;
  asset_label?: string | null;
}

export interface TyreRotationLine {
  tyre_movement_id: string;
  tyre_id: string;
  movement_type: TyreMovementType;
  from_position: string | null;
  to_position: string | null;
  odometer_km: number | null;
  tread_depth_mm: number | null;
  condition_notes: string | null;
  movement_datetime: string;
  status: string;
  rotation_header_id: string;
  tyre_serial_no: string;
  brand: string | null;
  model: string | null;
  size: string;
}

export interface TyreRotationDetail extends TyreRotationHeader {
  lines: TyreRotationLine[];
}

export interface TyreHistoryResponse {
  tyre: Record<string, unknown> & { tyre_id: string; tyre_serial_no: string };
  movements: (TyreMovementHistoryRow)[];
}

export interface TyreMovementHistoryRow {
  tyre_movement_id: string;
  movement_type: string;
  from_position: string | null;
  to_position: string | null;
  odometer_km: number | null;
  tread_depth_mm: number | null;
  condition_notes: string | null;
  movement_datetime: string;
  status: string;
  rotation_header_id: string | null;
  registration_no: string | null;
  trailer_no: string | null;
}
