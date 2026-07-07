'use strict';

const { HttpError } = require('../http');
const { recordAudit } = require('../audit');
const {
  ASSET_CATEGORIES,
  ASSET_STATUSES,
  ALLOCATABLE_STATUSES,
  APPROVAL_STAGES,
} = require('../constants');

const ADMIN_ROLES = ['it_asset_admin', 'admin'];
const ACTIVE_ALLOCATION = "('Issued', 'Accepted', 'Return Requested')";

function requireRole(ctx, roles) {
  if (!ctx.user) throw new HttpError(401, 'Sign in required (x-user-id header)');
  if (!roles.includes(ctx.user.role)) {
    throw new HttpError(403, `Requires role: ${roles.join(' or ')}`);
  }
}

// Available stock = instances in an allocatable status.
function stockCounts(db, assetId) {
  const placeholders = ALLOCATABLE_STATUSES.map(() => '?').join(',');
  const available = db
    .prepare(`SELECT COUNT(*) c FROM asset_instances WHERE asset_id = ? AND status IN (${placeholders})`)
    .get(assetId, ...ALLOCATABLE_STATUSES).c;
  const total = db.prepare('SELECT COUNT(*) c FROM asset_instances WHERE asset_id = ?').get(assetId).c;
  return { available, total };
}

// Licenses in use = active allocations against a license-tracked asset.
function licenseUsage(db, asset) {
  if (!asset.track_license) return null;
  const used = db
    .prepare(`SELECT COUNT(*) c FROM allocations WHERE asset_id = ? AND status IN ${ACTIVE_ALLOCATION}`)
    .get(asset.id).c;
  const total = asset.license_count ?? 0;
  return { total, used, available: Math.max(total - used, 0) };
}

function validateApprovalStages(stages) {
  if (!Array.isArray(stages)) throw new HttpError(400, 'approval_stages must be an array');
  for (const s of stages) {
    if (!APPROVAL_STAGES.includes(s)) throw new HttpError(400, `Unknown approval stage: ${s}`);
  }
  // Keep canonical order regardless of input order.
  return APPROVAL_STAGES.filter((s) => stages.includes(s));
}

function register(app, db) {
  // ---------------- Asset Master ----------------

  app.get('/api/assets', ({ ctx, query }) => {
    requireRole(ctx, [...ADMIN_ROLES, 'it_support', 'finance', 'manager', 'security']);
    const category = query.get('category');
    const rows = category
      ? db.prepare('SELECT * FROM assets WHERE category = ? ORDER BY name').all(category)
      : db.prepare('SELECT * FROM assets ORDER BY category, name').all();
    return rows.map((a) => ({
      ...a,
      approval_stages: JSON.parse(a.approval_stages),
      stock: a.track_stock ? stockCounts(db, a.id) : null,
      licenses: licenseUsage(db, a),
    }));
  });

  app.post('/api/assets', ({ ctx, body }) => {
    requireRole(ctx, ADMIN_ROLES);
    if (!body.name) throw new HttpError(400, 'name is required');
    if (!ASSET_CATEGORIES[body.category]) {
      throw new HttpError(400, `category must be one of: ${Object.keys(ASSET_CATEGORIES).join(', ')}`);
    }
    if (body.lifecycle_status && !ASSET_STATUSES.includes(body.lifecycle_status)) {
      throw new HttpError(400, 'Unknown lifecycle_status');
    }
    const stages = validateApprovalStages(body.approval_stages ?? []);
    const info = db
      .prepare(
        `INSERT INTO assets (name, category, subcategory, description, requestable, approval_stages,
           track_stock, track_license, owner_id, lifecycle_status, vendor, unit_cost, currency,
           license_type, license_count, license_start, license_expiry, renewal_date,
           cloud_provider, cloud_service, region, monthly_cost, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        body.name, body.category, body.subcategory ?? null, body.description ?? null,
        body.requestable ? 1 : 0, JSON.stringify(stages),
        body.track_stock ? 1 : 0, body.track_license ? 1 : 0,
        body.owner_id ?? null, body.lifecycle_status ?? 'Planned',
        body.vendor ?? null, body.unit_cost ?? null, body.currency ?? 'INR',
        body.license_type ?? null, body.license_count ?? null,
        body.license_start ?? null, body.license_expiry ?? null, body.renewal_date ?? null,
        body.cloud_provider ?? null, body.cloud_service ?? null, body.region ?? null,
        body.monthly_cost ?? null, ctx.user.id
      );
    const id = Number(info.lastInsertRowid);
    recordAudit(db, {
      entityType: 'asset', entityId: id, action: 'asset.created',
      actorId: ctx.user.id, details: { name: body.name, category: body.category },
    });
    return db.prepare('SELECT * FROM assets WHERE id = ?').get(id);
  });

  app.get('/api/assets/:id', ({ ctx, params }) => {
    requireRole(ctx, [...ADMIN_ROLES, 'it_support', 'finance', 'manager', 'security']);
    const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(params.id);
    if (!asset) throw new HttpError(404, 'Asset not found');
    const instances = db
      .prepare(
        `SELECT i.*, u.name AS allocated_to_name
         FROM asset_instances i LEFT JOIN users u ON u.id = i.allocated_to
         WHERE i.asset_id = ? ORDER BY i.id`
      )
      .all(asset.id);
    const allocations = db
      .prepare(
        `SELECT al.*, u.name AS user_name FROM allocations al
         JOIN users u ON u.id = al.user_id WHERE al.asset_id = ? ORDER BY al.id DESC`
      )
      .all(asset.id);
    return {
      ...asset,
      approval_stages: JSON.parse(asset.approval_stages),
      stock: asset.track_stock ? stockCounts(db, asset.id) : null,
      licenses: licenseUsage(db, asset),
      instances,
      allocations,
    };
  });

  const ASSET_EDITABLE = [
    'name', 'subcategory', 'description', 'requestable', 'track_stock', 'track_license',
    'owner_id', 'lifecycle_status', 'vendor', 'unit_cost', 'currency',
    'license_type', 'license_count', 'license_start', 'license_expiry', 'renewal_date',
    'cloud_provider', 'cloud_service', 'region', 'monthly_cost',
  ];

  app.patch('/api/assets/:id', ({ ctx, params, body }) => {
    requireRole(ctx, ADMIN_ROLES);
    const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(params.id);
    if (!asset) throw new HttpError(404, 'Asset not found');
    if (body.lifecycle_status && !ASSET_STATUSES.includes(body.lifecycle_status)) {
      throw new HttpError(400, 'Unknown lifecycle_status');
    }
    const changes = {};
    const sets = [];
    const args = [];
    for (const field of ASSET_EDITABLE) {
      if (body[field] !== undefined) {
        sets.push(`${field} = ?`);
        const v = ['requestable', 'track_stock', 'track_license'].includes(field)
          ? (body[field] ? 1 : 0) : body[field];
        args.push(v);
        changes[field] = { from: asset[field], to: v };
      }
    }
    if (body.approval_stages !== undefined) {
      const stages = validateApprovalStages(body.approval_stages);
      sets.push('approval_stages = ?');
      args.push(JSON.stringify(stages));
      changes.approval_stages = { from: asset.approval_stages, to: stages };
    }
    if (!sets.length) throw new HttpError(400, 'Nothing to update');
    sets.push("updated_at = datetime('now')");
    db.prepare(`UPDATE assets SET ${sets.join(', ')} WHERE id = ?`).run(...args, asset.id);
    const isRetire = body.lifecycle_status === 'Retired';
    const isDispose = body.lifecycle_status === 'Disposed';
    recordAudit(db, {
      entityType: 'asset', entityId: asset.id,
      action: isDispose ? 'asset.disposed' : isRetire ? 'asset.retired' : 'asset.updated',
      actorId: ctx.user.id, details: changes,
    });
    return db.prepare('SELECT * FROM assets WHERE id = ?').get(asset.id);
  });

  // ---------------- Inventory instances ----------------

  app.post('/api/assets/:id/instances', ({ ctx, params, body }) => {
    requireRole(ctx, ADMIN_ROLES);
    const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(params.id);
    if (!asset) throw new HttpError(404, 'Asset not found');
    if (body.status && !ASSET_STATUSES.includes(body.status)) throw new HttpError(400, 'Unknown status');
    const info = db
      .prepare(
        `INSERT INTO asset_instances (asset_id, asset_tag, serial_number, status, condition, location,
           po_reference, invoice_reference, purchase_date, purchase_cost, warranty_end,
           cloud_resource_id, cloud_tags, review_date, decommission_date, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        asset.id, body.asset_tag ?? null, body.serial_number ?? null,
        body.status ?? 'In Stock', body.condition ?? 'New', body.location ?? null,
        body.po_reference ?? null, body.invoice_reference ?? null,
        body.purchase_date ?? null, body.purchase_cost ?? null, body.warranty_end ?? null,
        body.cloud_resource_id ?? null,
        body.cloud_tags ? JSON.stringify(body.cloud_tags) : null,
        body.review_date ?? null, body.decommission_date ?? null, body.notes ?? null
      );
    const id = Number(info.lastInsertRowid);
    recordAudit(db, {
      entityType: 'instance', entityId: id, action: 'instance.created',
      actorId: ctx.user.id, details: { asset: asset.name, asset_tag: body.asset_tag },
    });
    return db.prepare('SELECT * FROM asset_instances WHERE id = ?').get(id);
  });

  const INSTANCE_EDITABLE = [
    'asset_tag', 'serial_number', 'status', 'condition', 'location', 'po_reference',
    'invoice_reference', 'purchase_date', 'purchase_cost', 'warranty_end',
    'cloud_resource_id', 'review_date', 'decommission_date', 'notes',
  ];

  // IT support may update operational status (e.g. Under Repair); admins may edit everything.
  app.patch('/api/instances/:id', ({ ctx, params, body }) => {
    requireRole(ctx, [...ADMIN_ROLES, 'it_support']);
    const inst = db.prepare('SELECT * FROM asset_instances WHERE id = ?').get(params.id);
    if (!inst) throw new HttpError(404, 'Instance not found');
    if (body.status && !ASSET_STATUSES.includes(body.status)) throw new HttpError(400, 'Unknown status');

    const allowed = ctx.user.role === 'it_support' ? ['status', 'condition', 'notes', 'location'] : INSTANCE_EDITABLE;
    const changes = {};
    const sets = [];
    const args = [];
    for (const field of allowed) {
      if (body[field] !== undefined) {
        sets.push(`${field} = ?`);
        args.push(body[field]);
        changes[field] = { from: inst[field], to: body[field] };
      }
    }
    if (body.cloud_tags !== undefined && ctx.user.role !== 'it_support') {
      sets.push('cloud_tags = ?');
      args.push(JSON.stringify(body.cloud_tags));
      changes.cloud_tags = { from: inst.cloud_tags, to: body.cloud_tags };
    }
    if (!sets.length) throw new HttpError(400, 'Nothing to update');
    sets.push("updated_at = datetime('now')");
    db.prepare(`UPDATE asset_instances SET ${sets.join(', ')} WHERE id = ?`).run(...args, inst.id);
    const action = body.status === 'Cloud Decommissioned' ? 'cloud.decommissioned' : 'instance.updated';
    recordAudit(db, {
      entityType: 'instance', entityId: inst.id, action,
      actorId: ctx.user.id, details: changes,
    });
    return db.prepare('SELECT * FROM asset_instances WHERE id = ?').get(inst.id);
  });

  // ---------------- Approved Asset Catalog ----------------

  // End-user view: active items the caller is allowed to request, with plain-language
  // availability info and no internal procurement detail (section 11).
  app.get('/api/catalog', ({ ctx }) => {
    if (!ctx.user) throw new HttpError(401, 'Sign in required');
    const rows = db
      .prepare(
        `SELECT c.*, a.category, a.name AS asset_name, a.requestable, a.approval_stages,
                a.track_stock, a.track_license, a.unit_cost, a.monthly_cost, a.currency
         FROM catalog_items c JOIN assets a ON a.id = c.asset_id
         WHERE c.active = 1 AND a.requestable = 1
         ORDER BY a.category, c.name`
      )
      .all();
    return rows
      .filter((r) => {
        if (r.who_can_request === 'all') return true;
        try { return JSON.parse(r.who_can_request).includes(ctx.user.role); } catch { return false; }
      })
      .map((r) => {
        const asset = { id: r.asset_id, track_license: r.track_license, license_count: null };
        const licenses = r.track_license
          ? licenseUsage(db, db.prepare('SELECT * FROM assets WHERE id = ?').get(r.asset_id))
          : null;
        return {
          id: r.id,
          asset_id: r.asset_id,
          name: r.name,
          category: r.category,
          category_label: ASSET_CATEGORIES[r.category],
          description: r.description,
          approval_required: JSON.parse(r.approval_stages).length > 0,
          approval_stages: JSON.parse(r.approval_stages),
          standard_issue_days: r.standard_issue_days,
          cost_indicator: r.cost_indicator,
          usage_policy: r.usage_policy,
          requires_justification: !!r.requires_justification,
          allocation_type: r.allocation_type,
          max_duration_days: r.max_duration_days,
          requires_return: !!r.requires_return,
          available_stock: r.track_stock ? stockCounts(db, r.asset_id).available : null,
          available_licenses: licenses ? licenses.available : null,
        };
      });
  });

  // Admin view including inactive items.
  app.get('/api/catalog/all', ({ ctx }) => {
    requireRole(ctx, ADMIN_ROLES);
    return db
      .prepare(
        `SELECT c.*, a.name AS asset_name, a.category FROM catalog_items c
         JOIN assets a ON a.id = c.asset_id ORDER BY c.id`
      )
      .all();
  });

  app.post('/api/catalog', ({ ctx, body }) => {
    requireRole(ctx, ADMIN_ROLES);
    const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(body.asset_id);
    if (!asset) throw new HttpError(404, 'Asset not found');
    const info = db
      .prepare(
        `INSERT INTO catalog_items (asset_id, name, description, who_can_request, standard_issue_days,
           cost_indicator, usage_policy, requires_justification, allocation_type, max_duration_days,
           requires_return, active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        asset.id, body.name ?? asset.name, body.description ?? asset.description,
        Array.isArray(body.who_can_request) ? JSON.stringify(body.who_can_request) : 'all',
        body.standard_issue_days ?? null, body.cost_indicator ?? null, body.usage_policy ?? null,
        body.requires_justification === false ? 0 : 1,
        body.allocation_type === 'temporary' ? 'temporary' : 'permanent',
        body.max_duration_days ?? null, body.requires_return ? 1 : 0,
        body.active === false ? 0 : 1
      );
    const id = Number(info.lastInsertRowid);
    recordAudit(db, {
      entityType: 'catalog', entityId: id, action: 'catalog.created',
      actorId: ctx.user.id, details: { name: body.name ?? asset.name, asset_id: asset.id },
    });
    return db.prepare('SELECT * FROM catalog_items WHERE id = ?').get(id);
  });

  app.patch('/api/catalog/:id', ({ ctx, params, body }) => {
    requireRole(ctx, ADMIN_ROLES);
    const item = db.prepare('SELECT * FROM catalog_items WHERE id = ?').get(params.id);
    if (!item) throw new HttpError(404, 'Catalog item not found');
    const editable = [
      'name', 'description', 'standard_issue_days', 'cost_indicator', 'usage_policy',
      'allocation_type', 'max_duration_days',
    ];
    const changes = {};
    const sets = [];
    const args = [];
    for (const field of editable) {
      if (body[field] !== undefined) {
        sets.push(`${field} = ?`);
        args.push(body[field]);
        changes[field] = { from: item[field], to: body[field] };
      }
    }
    for (const flag of ['requires_justification', 'requires_return', 'active']) {
      if (body[flag] !== undefined) {
        sets.push(`${flag} = ?`);
        args.push(body[flag] ? 1 : 0);
        changes[flag] = { from: item[flag], to: body[flag] ? 1 : 0 };
      }
    }
    if (body.who_can_request !== undefined) {
      const v = Array.isArray(body.who_can_request) ? JSON.stringify(body.who_can_request) : 'all';
      sets.push('who_can_request = ?');
      args.push(v);
      changes.who_can_request = { from: item.who_can_request, to: v };
    }
    if (!sets.length) throw new HttpError(400, 'Nothing to update');
    db.prepare(`UPDATE catalog_items SET ${sets.join(', ')} WHERE id = ?`).run(...args, item.id);
    recordAudit(db, {
      entityType: 'catalog', entityId: item.id, action: 'catalog.updated',
      actorId: ctx.user.id, details: changes,
    });
    return db.prepare('SELECT * FROM catalog_items WHERE id = ?').get(item.id);
  });
}

module.exports = { register, requireRole, stockCounts, licenseUsage, ADMIN_ROLES };
