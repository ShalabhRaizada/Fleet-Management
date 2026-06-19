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
 *
 * Escalation (Phase A item 3): any Open + Critical alert that has been open
 * longer than ESCALATION_THRESHOLD_MINUTES and has not yet been escalated
 * (escalation_level = 0) is bumped to escalation_level = 1 and assigned to
 * an ADMIN user. This is intentionally single-level (no repeat escalation).
 *
 * Job card SLA breach (Phase A item 4): any job_card still open (status not
 * in 'Closed'/'Reopened') where sla_breached = false and now() is past
 * reported_datetime + sla_target_hours is marked sla_breached = true and an
 * alert_event (alert_type='JobCardSlaBreach') is raised. Severity is
 * 'Critical' once overdue by more than SLA_BREACH_CRITICAL_GRACE_HOURS past
 * the target, otherwise 'Warning'.
 */

const COMPLIANCE_WARNING_DAYS = 30;
const MAINTENANCE_DUE_KM_THRESHOLD = 10000; // km since last job card before flagged due
const ESCALATION_THRESHOLD_MINUTES = 60;
const SLA_BREACH_CRITICAL_GRACE_HOURS = 24; // hours past SLA target before bumping to Critical

export interface AlertsEvalResult {
  complianceAlertsCreated: number;
  maintenanceAlertsCreated: number;
  alertsEscalated: number;
  slaBreachAlertsCreated: number;
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

async function evaluateEscalations(): Promise<number> {
  const { rows: adminRows } = await pool.query(
    `SELECT user_id FROM user_master WHERE role_code = 'ADMIN' AND deleted_flag = false LIMIT 1`
  );
  if (adminRows.length === 0) return 0;
  const adminUserId = adminRows[0].user_id;

  const { rows } = await pool.query(
    `SELECT alert_id FROM alert_event
     WHERE status = 'Open'
       AND severity = 'Critical'
       AND escalation_level = 0
       AND created_at <= (now() - ($1 || ' minutes')::interval)
       AND deleted_flag = false`,
    [ESCALATION_THRESHOLD_MINUTES]
  );
  let escalated = 0;
  for (const row of rows) {
    await pool.query(
      `UPDATE alert_event
       SET escalation_level = 1, escalated_at = now(), escalation_assignee = $2
       WHERE alert_id = $1`,
      [row.alert_id, adminUserId]
    );
    escalated++;
  }
  return escalated;
}

async function evaluateJobCardSlaBreaches(): Promise<number> {
  const { rows } = await pool.query(
    `SELECT job_card_id, job_card_no, reported_datetime, sla_target_hours
     FROM job_card
     WHERE deleted_flag = false
       AND status NOT IN ('Closed', 'Reopened')
       AND sla_breached = false
       AND reported_datetime + (COALESCE(sla_target_hours, 48) || ' hours')::interval < now()`
  );
  let created = 0;
  for (const row of rows) {
    const slaTargetHours = Number(row.sla_target_hours ?? 48);
    const dueAt = new Date(row.reported_datetime).getTime() + slaTargetHours * 3600 * 1000;
    const overdueHours = (Date.now() - dueAt) / (3600 * 1000);
    const severity = overdueHours > SLA_BREACH_CRITICAL_GRACE_HOURS ? 'Critical' : 'Warning';

    await pool.query(`UPDATE job_card SET sla_breached = true, updated_at = now() WHERE job_card_id = $1`, [
      row.job_card_id,
    ]);

    const already = await alertAlreadyOpen('JobCard', row.job_card_id, 'JobCardSlaBreach');
    if (already) continue;
    await pool.query(
      `INSERT INTO alert_event (alert_type, severity, entity_type, entity_id, alert_title, alert_message, status)
       VALUES ('JobCardSlaBreach', $1, 'JobCard', $2, $3, $4, 'Open')`,
      [
        severity,
        row.job_card_id,
        `Job card ${row.job_card_no} breached SLA`,
        `Job card ${row.job_card_no} has been open past its SLA target of ${slaTargetHours} hours (overdue by ~${Math.max(
          0,
          Math.round(overdueHours)
        )} hours).`,
      ]
    );
    created++;
  }
  return created;
}

export async function evaluateAlerts(): Promise<AlertsEvalResult> {
  const complianceAlertsCreated = await evaluateComplianceExpiry();
  const maintenanceAlertsCreated = await evaluateMaintenanceDue();
  const alertsEscalated = await evaluateEscalations();
  const slaBreachAlertsCreated = await evaluateJobCardSlaBreaches();
  return { complianceAlertsCreated, maintenanceAlertsCreated, alertsEscalated, slaBreachAlertsCreated };
}
