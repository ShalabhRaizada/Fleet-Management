import crypto from 'crypto';
import { pool } from '../db/pool';

/**
 * Mock client for the ULIP-hosted VAHAN vehicle-data API.
 *
 * Contract intentionally mirrors the real API so that swapping in the live
 * endpoint later only requires populating an `integration_config` row for
 * code `ULIP_VAHAN` (base_url + credential_ref/token) - no caller-side code
 * changes are needed. The mock branch below stands in for the real HTTP call
 * until sandbox credentials are available.
 *
 * Real contract:
 *   POST {base_url}/vahan/vehicle-details
 *   Headers: Authorization: Bearer {token}
 *   Body: { vehicleno: string }
 *   200 -> VahanSuccessResponse, 400/404 -> VahanErrorResponse
 */

export interface VahanRegistrationDetails {
  rc_number: string;
  registration_date: string;
  rc_status: string;
  registered_at_rto: string;
  owner_name: string;
  owner_serial_number: string;
}

export interface VahanVehicleIdentity {
  chassis_number: string;
  engine_number: string;
  vehicle_category: string;
  vehicle_class: string;
  maker_model: string;
  fuel_type: string;
  color: string;
}

export interface VahanWeightAndCapacity {
  gross_vehicle_weight_kg: number;
  unladen_weight_kg: number;
  seating_capacity: number;
}

export interface VahanFitnessAndCompliance {
  fitness_certificate_number: string;
  fitness_valid_upto: string;
  pucc_emission_number: string;
  pucc_valid_upto: string;
  emission_norms: string;
}

export interface VahanInsuranceDetails {
  insurance_company: string;
  policy_number: string;
  insurance_type: string;
  insurance_valid_upto: string;
}

export interface VahanPermitDetails {
  permit_number: string;
  permit_type: string;
  permit_valid_upto: string;
  permit_issued_by: string;
}

export interface VahanTaxDetails {
  road_tax_paid_upto: string;
  tax_status: string;
}

export interface VahanStatusFlags {
  is_blacklisted: boolean;
  blacklist_reason: string | null;
  is_financed: boolean;
  financier_name: string | null;
}

export interface VahanVehicleData {
  registration_details: VahanRegistrationDetails;
  vehicle_identity: VahanVehicleIdentity;
  weight_and_capacity: VahanWeightAndCapacity;
  fitness_and_compliance: VahanFitnessAndCompliance;
  insurance_details: VahanInsuranceDetails;
  permit_details: VahanPermitDetails;
  tax_details: VahanTaxDetails;
  status_flags: VahanStatusFlags;
}

export interface VahanSuccessResponse {
  status: 'success';
  code: 200;
  message: string;
  data: VahanVehicleData;
}

export interface VahanErrorResponse {
  status: 'error';
  code: 400 | 404;
  message: string;
}

export type VahanResponse = VahanSuccessResponse | VahanErrorResponse;

const VEHICLE_NO_RE = /^[A-Z]{2}\s?[0-9]{1,2}\s?[A-Z]{0,3}\s?[0-9]{1,4}$/i;

/** Deterministic 32-bit hash so the same vehicle number always yields the same mock payload. */
function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pick<T>(hash: number, options: T[], salt: number): T {
  return options[(hash + salt) % options.length];
}

function dateOffsetFromToday(hash: number, salt: number, minDays: number, maxDays: number): string {
  const span = maxDays - minDays;
  const days = minDays + ((hash + salt) % (span + 1));
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Looks up the `ULIP_VAHAN` integration_config row (if any) so the mock client
 * exercises the same config lookup path the real client will use. Absence of
 * a row is non-fatal - the mock simply notes it would have used defaults.
 */
async function resolveIntegrationConfig(): Promise<{ baseUrl: string; token: string }> {
  try {
    const { rows } = await pool.query(
      `SELECT base_url, credential_ref FROM integration_config
       WHERE integration_name = 'ULIP_VAHAN' AND deleted_flag = false AND is_enabled = true
       ORDER BY created_at DESC LIMIT 1`
    );
    if (rows.length) {
      return { baseUrl: rows[0].base_url || 'https://ulip.gov.in/api', token: rows[0].credential_ref || 'mock-token' };
    }
  } catch {
    // integration_config lookup is best-effort for the mock client
  }
  return { baseUrl: 'https://ulip.gov.in/api (default - no integration_config row found)', token: 'mock-token' };
}

function buildMockSuccessResponse(vehicleNo: string): VahanSuccessResponse {
  const norm = vehicleNo.toUpperCase().replace(/\s+/g, '');
  const hash = hashString(norm);

  const rcStatus = pick(hash, ['ACTIVE', 'ACTIVE', 'ACTIVE', 'SUSPENDED'], 1);
  const isBlacklisted = hash % 11 === 0; // occasional, deterministic per vehicle
  const isFinanced = hash % 3 !== 0;

  const fuelType = pick(hash, ['DIESEL', 'PETROL', 'CNG', 'ELECTRIC'], 2);
  const vehicleCategory = pick(hash, ['Goods Carrier', 'Passenger Vehicle', 'Tanker', 'Trailer'], 3);

  const data: VahanVehicleData = {
    registration_details: {
      rc_number: norm,
      registration_date: dateOffsetFromToday(hash, 11, -3650, -180),
      rc_status: rcStatus,
      registered_at_rto: `RTO ${norm.slice(0, 4)}`,
      owner_name: `Owner-${hash % 9000}`,
      owner_serial_number: '1',
    },
    vehicle_identity: {
      chassis_number: `CHS${hash.toString(36).toUpperCase().padStart(10, '0')}`,
      engine_number: `ENG${(hash * 7).toString(36).toUpperCase().padStart(10, '0')}`,
      vehicle_category: vehicleCategory,
      vehicle_class: 'Heavy Goods Vehicle',
      maker_model: pick(hash, ['Tata Prima', 'Ashok Leyland Captain', 'Eicher Pro', 'BharatBenz 3128'], 4),
      fuel_type: fuelType,
      color: pick(hash, ['White', 'Blue', 'Red', 'Grey'], 5),
    },
    weight_and_capacity: {
      gross_vehicle_weight_kg: 15000 + (hash % 30) * 1000,
      unladen_weight_kg: 8000 + (hash % 10) * 700,
      seating_capacity: 2 + (hash % 3),
    },
    fitness_and_compliance: {
      fitness_certificate_number: `FIT${hash % 1000000}`,
      fitness_valid_upto: dateOffsetFromToday(hash, 21, -60, 400),
      pucc_emission_number: `PUCC${hash % 1000000}`,
      pucc_valid_upto: dateOffsetFromToday(hash, 31, -30, 200),
      emission_norms: pick(hash, ['BHARAT STAGE VI (BS-VI)', 'BHARAT STAGE IV (BS-IV)'], 6),
    },
    insurance_details: {
      insurance_company: pick(hash, ['ICICI Lombard', 'HDFC Ergo', 'Bajaj Allianz', 'New India Assurance'], 7),
      policy_number: `POL${hash % 1000000}`,
      insurance_type: pick(hash, ['Comprehensive', 'Third Party'], 8),
      insurance_valid_upto: dateOffsetFromToday(hash, 41, -45, 365),
    },
    permit_details: {
      permit_number: `PER${hash % 1000000}`,
      permit_type: pick(hash, ['National Permit', 'State Permit'], 9),
      permit_valid_upto: dateOffsetFromToday(hash, 51, -30, 1500),
      permit_issued_by: `RTO ${norm.slice(0, 4)}`,
    },
    tax_details: {
      road_tax_paid_upto: dateOffsetFromToday(hash, 61, -30, 365),
      tax_status: pick(hash, ['PAID', 'PAID', 'OVERDUE'], 10),
    },
    status_flags: {
      is_blacklisted: isBlacklisted,
      blacklist_reason: isBlacklisted ? 'Pending challan dues exceeding threshold' : null,
      is_financed: isFinanced,
      financier_name: isFinanced ? pick(hash, ['HDFC Bank', 'SBI', 'Tata Capital'], 12) : null,
    },
  };

  return {
    status: 'success',
    code: 200,
    message: 'Vehicle details retrieved successfully',
    data,
  };
}

/**
 * Calls the (mock) VAHAN API for a single vehicle number and logs the call
 * into ulip_api_log, mirroring how a real ULIP integration call would be
 * audited.
 */
export async function callVahanApi(
  vehicleNo: string,
  opts?: { referenceId?: string | null }
): Promise<VahanResponse> {
  const requestPayload = { vehicleno: vehicleNo };
  const config = await resolveIntegrationConfig();

  let response: VahanResponse;
  let httpStatus: number;
  let apiStatus: string;
  let errorMessage: string | null = null;

  if (!vehicleNo || !VEHICLE_NO_RE.test(vehicleNo.trim())) {
    response = { status: 'error', code: 400, message: 'Invalid Vehicle Number format provided.' };
    httpStatus = 400;
    apiStatus = 'Failed';
    errorMessage = response.message;
  } else {
    const norm = vehicleNo.toUpperCase().replace(/\s+/g, '');
    const { rows } = await pool.query(
      `SELECT vehicle_id FROM vehicle_master WHERE registration_no = $1 AND deleted_flag = false LIMIT 1`,
      [norm]
    );
    if (!rows.length) {
      response = { status: 'error', code: 404, message: 'Vehicle details not found in the VAHAN database.' };
      httpStatus = 404;
      apiStatus = 'Failed';
      errorMessage = response.message;
    } else {
      response = buildMockSuccessResponse(norm);
      httpStatus = 200;
      apiStatus = 'Success';
    }
  }

  // Best-effort audit log; failures here must never block the validation flow.
  try {
    await pool.query(
      `INSERT INTO ulip_api_log
        (api_log_id, api_name, reference_type, reference_id, request_payload, response_payload, http_status_code, api_status, error_message)
       VALUES ($1, 'VAHAN_VEHICLE_DETAILS', 'Vehicle', $2, $3, $4, $5, $6, $7)`,
      [
        crypto.randomUUID(),
        opts?.referenceId || null,
        JSON.stringify({ ...requestPayload, _mockBaseUrl: config.baseUrl }),
        JSON.stringify(response),
        httpStatus,
        apiStatus,
        errorMessage,
      ]
    );
  } catch {
    // logging is best-effort
  }

  return response;
}
