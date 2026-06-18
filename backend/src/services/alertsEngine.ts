import { pool } from '../db/pool';

/**
 * Alerts engine: evaluates simple, deterministic business rules against
 * live data and upserts rows into alert_event. Designed to be invoked
 * either on-demand (POST /api/alerts/evaluate) or on a schedule (see
 * src/index.ts node-cron wiring).
 *
 * Rules implemented (P1 scope):
 *  1. Compliance expiry: asset_compliance.valid_upto within COMPLIANCE_WARNING_DAYS
 *     (or already expired) -> alert_type='ComplianceExpiry'.
 *  2. Maintenance due (mileage-based, P1 proxy using vehicle_master.current_odometer_km
 *     vs. last job_card odometer + a fixed threshold) -> alert_type='MaintenanceDue'.
 *
 * Note: maintenance_schedule / maintenance_due are formally P2 tables; this
 * P1 rule is a light heuristic so the alerts engine has a working
 * maintenance-due signal without depending on P2 scheduling logic.
 */

const COMPLIANCE_WARNING_DAYS = 30;
const MAINTENANCE_DUE_KM_THRESHOLD = 10000; // km since last job card before flagged due

export interface AlertsEvalResult {
  complianceAlertsCreated: number;
  maintenanceAlertsCreated: number;
}

async function alertAlreadyOpen(entityType: string, entityId: string, alertType: string): Promise<boolean> {
  const { rows } = await pool.query(
    `SELECT 1 FROM alert_event
     WHERE entity_type = $1 AND entity_id = $2 AND alert_type = $3 AND status = 'Open' AND deleted_flag = false
     LIMIT 1`,
    [entityType, entityId, alertType]
  );
  return rows.length > 0;
}

async function evaluateComplianceExpiry(): Promise<number> {
  const { rows } = await pool.query(
    `SELECT asset_compliance_id, asset_type, asset_id, compliance_type_code, valid_upto
     FROM asset_compliance
     WHERE deleted_flag = false
       AND valid_upto <= (CURRENT_DATE + $1::int)
       AND status NOT IN ('Exempted', 'NotApplicable')`,
    [COMPLIANCE_WARNING_DAYS]
  );
  let created = 0;
  for (const row of rows) {
    const isExpired = new Date(row.valid_upto) < new Date();
    const severity = isExpired ? 'Critical' : 'Warning';
    const already = await alertAlreadyOpen(row.asset_type, row.asset_id, 'ComplianceExpiry');
    if (already) continue;
    await pool.query(
      `INSERT INTO alert_event (alert_type, severity, entity_type, entity_id, alert_title, alert_message, status)
       VALUES ('ComplianceExpiry', $1, $2, $3, $4, $5, 'Open')`,
      [
        severity,
        row.asset_type,
        row.asset_id,
        `${row.compliance_type_code} ${isExpired ? 'expired' : 'expiring soon'}`,
        `${row.compliance_type_code} for ${row.asset_type} ${row.asset_id} ${isExpired ? 'expired' : 'expires'} on ${row.valid_upto}`,
      ]
    );
    created++;
  }
  return created;
}

async function evaluateMaintenanceDue(): Promise<number> {
  const { rows } = await pool.query(
    `SELECT v.vehicle_id, v.registration_no, v.current_odometer_km,
            COALESCE(MAX(jc.odometer_km), 0) AS last_service_km
     FROM vehicle_master v
     LEFT JOIN job_card jc ON jc.vehicle_id = v.vehicle_id AND jc.job_card_type = 'Scheduled' AND jc.deleted_flag = false
     WHERE v.deleted_flag = false AND v.current_odometer_km IS NOT NULL
     GROUP BY v.vehicle_id, v.registration_no, v.current_odometer_km`
  );
  let created = 0;
  for (const row of rows) {
    const delta = Number(row.current_odometer_km) - Number(row.last_service_km);
    if (delta < MAINTENANCE_DUE_KM_THRESHOLD) continue;
    const already = await alertAlreadyOpen('Vehicle', row.vehicle_id, 'MaintenanceDue');
    if (already) continue;
    await pool.query(
      `INSERT INTO alert_event (alert_type, severity, entity_type, entity_id, alert_title, alert_message, status)
       VALUES ('MaintenanceDue', 'Warning', 'Vehicle', $1, $2, $3, 'Open')`,
      [
        row.vehicle_id,
        `Maintenance due for ${row.registration_no}`,
        `Vehicle ${row.registration_no} has run ${delta} km since last scheduled service (threshold ${MAINTENANCE_DUE_KM_THRESHOLD} km).`,
      ]
    );
    created++;
  }
  return created;
}

export async function evaluateAlerts(): Promise<AlertsEvalResult> {
  const complianceAlertsCreated = await evaluateComplianceExpiry();
  const maintenanceAlertsCreated = await evaluateMaintenanceDue();
  return { complianceAlertsCreated, maintenanceAlertsCreated };
}
