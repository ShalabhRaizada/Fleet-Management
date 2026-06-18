/**
 * MOCK / P3-DEFERRED INTEGRATION CONNECTOR
 * =========================================
 * Real ULIP (Unified Logistics Interface Platform) integration - VAHAN vehicle
 * verification, SARATHI driver licence verification, FASTag/toll, e-Challan,
 * e-Way Bill - is explicitly scoped P3 (see Screen_Catalog.csv UL-001..UL-012,
 * Phase=P3) and is NOT implemented for real in this build.
 *
 * This file provides a canned/mock implementation behind a stable interface
 * so that P1/P2 code (e.g. future vehicle-onboarding flows) can call a
 * consistent contract today, and a real adapter can be swapped in later
 * without changing call sites.
 *
 * Every method here returns deterministic, clearly-fake data and logs the
 * call shape to ulip_api_log so the "ULIP API Log" screen (UL-008, P3) has
 * something to display even before a real integration exists.
 */
import { pool } from '../db/pool';

export interface UlipConnector {
  verifyVehicleRC(registrationNo: string): Promise<{ valid: boolean; ownerName: string; rcStatus: string }>;
  verifyDriverLicence(licenceNo: string): Promise<{ valid: boolean; driverName: string; licenceStatus: string }>;
  fetchFastagTransactions(vehicleId: string, fromDate: string, toDate: string): Promise<any[]>;
}

async function logCall(apiName: string, requestPayload: unknown, responsePayload: unknown, status: string) {
  try {
    await pool.query(
      `INSERT INTO ulip_api_log (api_name, request_payload, response_payload, api_status, http_status_code)
       VALUES ($1, $2, $3, $4, 200)`,
      [apiName, JSON.stringify(requestPayload), JSON.stringify(responsePayload), status]
    );
  } catch {
    // Best-effort logging only - failures here must never break the caller.
  }
}

/** MOCK implementation - returns canned data, never calls a real external API. */
export const mockUlipConnector: UlipConnector = {
  async verifyVehicleRC(registrationNo: string) {
    const response = { valid: true, ownerName: 'MOCK OWNER PVT LTD', rcStatus: 'Active' };
    await logCall('VAHAN.verifyVehicleRC', { registrationNo }, response, 'Success');
    return response;
  },
  async verifyDriverLicence(licenceNo: string) {
    const response = { valid: true, driverName: 'MOCK DRIVER', licenceStatus: 'Valid' };
    await logCall('SARATHI.verifyDriverLicence', { licenceNo }, response, 'Success');
    return response;
  },
  async fetchFastagTransactions(vehicleId: string, fromDate: string, toDate: string) {
    const response = [
      { tollPlaza: 'MOCK-PLAZA-1', amount: 75, txnDate: fromDate },
      { tollPlaza: 'MOCK-PLAZA-2', amount: 120, txnDate: toDate },
    ];
    await logCall('FASTag.fetchTransactions', { vehicleId, fromDate, toDate }, response, 'Success');
    return response;
  },
};
