'use strict';

const { HttpError } = require('../http');
const { recordAudit, listAudit } = require('../audit');
const constants = require('../constants');
const { requireRole, licenseUsage, ADMIN_ROLES } = require('./assets');

const REPORT_ROLES = [...ADMIN_ROLES, 'finance', 'security', 'it_support', 'manager'];

function register(app, db) {
  // ---------------- Meta / session ----------------

  app.get('/api/meta', ({ ctx }) => ({
    module: 'Ticktrack',
    product: 'Tickie',
    user: ctx.user ?? null,
    categories: constants.ASSET_CATEGORIES,
    asset_statuses: constants.ASSET_STATUSES,
    request_statuses: constants.REQUEST_STATUSES,
    urgency_levels: constants.URGENCY_LEVELS,
    approval_stages: constants.APPROVAL_STAGES,
    return_reasons: constants.RETURN_REASONS,
    environments: constants.ENVIRONMENTS,
    data_sensitivity: constants.DATA_SENSITIVITY,
    roles: constants.ROLES,
  }));

  // ---------------- Users (demo directory; admin manages) ----------------

  app.get('/api/users', ({ ctx }) => {
    if (!ctx.user) throw new HttpError(401, 'Sign in required');
    return db
      .prepare(`SELECT id, name, email, role, manager_id, department, cost_center, active FROM users ORDER BY id`)
      .all();
  });

  app.post('/api/users', ({ ctx, body }) => {
    requireRole(ctx, ['admin']);
    if (!body.name || !body.email) throw new HttpError(400, 'name and email are required');
    if (!constants.ROLES.includes(body.role)) {
      throw new HttpError(400, `role must be one of: ${constants.ROLES.join(', ')}`);
    }
    const info = db
      .prepare(`INSERT INTO users (name, email, role, manager_id, department, cost_center) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(body.name, body.email, body.role, body.manager_id ?? null, body.department ?? null, body.cost_center ?? null);
    const id = Number(info.lastInsertRowid);
    recordAudit(db, {
      entityType: 'user', entityId: id, action: 'user.created',
      actorId: ctx.user.id, details: { name: body.name, role: body.role },
    });
    return db.prepare('SELECT id, name, email, role, manager_id, department, cost_center FROM users WHERE id = ?').get(id);
  });

  // ---------------- Reports (sections 3.2, 3.3, 3.4, 4.5) ----------------

  // Inventory accuracy: what do we own, where, who has it, what state, what cost.
  app.get('/api/reports/inventory', ({ ctx }) => {
    requireRole(ctx, REPORT_ROLES);
    const byStatus = db
      .prepare(`SELECT status, COUNT(*) count FROM asset_instances GROUP BY status ORDER BY count DESC`)
      .all();
    const byCategory = db
      .prepare(
        `SELECT a.category, COUNT(i.id) instances, COALESCE(SUM(i.purchase_cost), 0) total_cost
         FROM assets a LEFT JOIN asset_instances i ON i.asset_id = a.id
         GROUP BY a.category ORDER BY a.category`
      )
      .all();
    const allocatedNow = db
      .prepare(
        `SELECT i.id, a.name AS asset_name, a.category, i.asset_tag, i.serial_number, i.status,
                i.location, u.name AS allocated_to_name, i.warranty_end
         FROM asset_instances i
         JOIN assets a ON a.id = i.asset_id
         LEFT JOIN users u ON u.id = i.allocated_to
         WHERE i.allocated_to IS NOT NULL
         ORDER BY a.category, a.name`
      )
      .all();
    return { by_status: byStatus, by_category: byCategory, allocated: allocatedNow };
  });

  // Software license compliance position (section 6.5 step 10).
  app.get('/api/reports/licenses', ({ ctx }) => {
    requireRole(ctx, REPORT_ROLES);
    const assets = db
      .prepare(`SELECT * FROM assets WHERE track_license = 1 ORDER BY name`)
      .all();
    return assets.map((a) => {
      const usage = licenseUsage(db, a);
      const expired = a.license_expiry && a.license_expiry < new Date().toISOString().slice(0, 10);
      const assigned = db
        .prepare(
          `SELECT u.name, al.issue_date FROM allocations al JOIN users u ON u.id = al.user_id
           WHERE al.asset_id = ? AND al.status IN ('Issued', 'Accepted', 'Return Requested') ORDER BY al.id`
        )
        .all(a.id);
      return {
        asset_id: a.id,
        name: a.name,
        vendor: a.vendor,
        license_type: a.license_type,
        license_start: a.license_start,
        license_expiry: a.license_expiry,
        renewal_date: a.renewal_date,
        total: usage.total,
        used: usage.used,
        available: usage.available,
        assigned_users: assigned,
        compliance: expired ? 'Expired' : usage.used > usage.total ? 'Over-allocated' : 'Compliant',
      };
    });
  });

  // What is due: renewals, expiries, warranty ends, expected returns, cloud reviews.
  app.get('/api/reports/renewals', ({ ctx, query }) => {
    requireRole(ctx, REPORT_ROLES);
    const days = Number(query.get('days') ?? 90);
    const horizon = `date('now', '+${Math.min(Math.max(days, 1), 3650)} days')`;
    const licenses = db
      .prepare(
        `SELECT id, name, vendor, license_expiry, renewal_date, license_count, unit_cost, monthly_cost, currency
         FROM assets WHERE track_license = 1
           AND (license_expiry <= ${horizon} OR renewal_date <= ${horizon})
         ORDER BY COALESCE(renewal_date, license_expiry)`
      )
      .all();
    const warranties = db
      .prepare(
        `SELECT i.id, a.name AS asset_name, i.asset_tag, i.warranty_end
         FROM asset_instances i JOIN assets a ON a.id = i.asset_id
         WHERE i.warranty_end IS NOT NULL AND i.warranty_end <= ${horizon}
         ORDER BY i.warranty_end`
      )
      .all();
    const returnsDue = db
      .prepare(
        `SELECT al.id, a.name AS asset_name, u.name AS user_name, al.expected_return_date
         FROM allocations al JOIN assets a ON a.id = al.asset_id JOIN users u ON u.id = al.user_id
         WHERE al.status IN ('Issued', 'Accepted') AND al.expected_return_date IS NOT NULL
           AND al.expected_return_date <= ${horizon}
         ORDER BY al.expected_return_date`
      )
      .all();
    const cloudReviews = db
      .prepare(
        `SELECT i.id, a.name AS asset_name, i.cloud_resource_id, i.review_date, i.decommission_date
         FROM asset_instances i JOIN assets a ON a.id = i.asset_id
         WHERE i.status IN ('Cloud Provisioned', 'Cloud Suspended')
           AND ((i.review_date IS NOT NULL AND i.review_date <= ${horizon})
             OR (i.decommission_date IS NOT NULL AND i.decommission_date <= ${horizon}))
         ORDER BY COALESCE(i.review_date, i.decommission_date)`
      )
      .all();
    return { horizon_days: days, licenses, warranties, returns_due: returnsDue, cloud_reviews: cloudReviews };
  });

  // Cloud cost governance: spend mapped to tags (FinOps, section 6.8).
  app.get('/api/reports/cloud', ({ ctx }) => {
    requireRole(ctx, REPORT_ROLES);
    const rows = db
      .prepare(
        `SELECT i.id, a.name AS asset_name, a.cloud_provider, a.cloud_service, a.monthly_cost, a.currency,
                i.cloud_resource_id, i.cloud_tags, i.status, i.location AS region,
                i.review_date, i.decommission_date, u.name AS allocated_to_name
         FROM asset_instances i
         JOIN assets a ON a.id = i.asset_id
         LEFT JOIN users u ON u.id = i.allocated_to
         WHERE a.category = 'cloud'
         ORDER BY i.id DESC`
      )
      .all()
      .map((r) => ({ ...r, cloud_tags: r.cloud_tags ? JSON.parse(r.cloud_tags) : null }));

    const active = rows.filter((r) => r.status === 'Cloud Provisioned');
    const rollup = (key) => {
      const out = {};
      for (const r of active) {
        const k = r.cloud_tags?.[key] ?? 'untagged';
        out[k] = (out[k] ?? 0) + (r.monthly_cost ?? 0);
      }
      return out;
    };
    return {
      resources: rows,
      monthly_cost_by_cost_center: rollup('cost_center'),
      monthly_cost_by_project: rollup('project'),
      monthly_cost_by_department: rollup('department'),
      total_active_monthly_cost: active.reduce((s, r) => s + (r.monthly_cost ?? 0), 0),
    };
  });

  // Financial view (section 4.5): costs, vendors, PO/invoice, renewal liabilities.
  app.get('/api/reports/finance', ({ ctx }) => {
    requireRole(ctx, [...ADMIN_ROLES, 'finance']);
    const hardware = db
      .prepare(
        `SELECT a.name AS asset_name, a.vendor, i.asset_tag, i.po_reference, i.invoice_reference,
                i.purchase_date, i.purchase_cost, i.warranty_end, i.status
         FROM asset_instances i JOIN assets a ON a.id = i.asset_id
         WHERE i.purchase_cost IS NOT NULL OR i.po_reference IS NOT NULL
         ORDER BY i.purchase_date DESC`
      )
      .all();
    const recurring = db
      .prepare(
        `SELECT name, category, vendor, license_count, unit_cost, monthly_cost, currency,
                license_expiry, renewal_date
         FROM assets WHERE monthly_cost IS NOT NULL OR (track_license = 1 AND unit_cost IS NOT NULL)
         ORDER BY category, name`
      )
      .all();
    return { purchases: hardware, recurring_liabilities: recurring };
  });

  // ---------------- Audit trail (section 3.5) ----------------

  app.get('/api/audit', ({ ctx, query }) => {
    requireRole(ctx, [...ADMIN_ROLES, 'finance', 'security']);
    return listAudit(db, {
      entityType: query.get('entity_type') ?? undefined,
      entityId: query.get('entity_id') ? Number(query.get('entity_id')) : undefined,
      action: query.get('action') ?? undefined,
      limit: Math.min(Number(query.get('limit') ?? 200), 1000),
    });
  });
}

module.exports = { register };
