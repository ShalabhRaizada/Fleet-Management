'use strict';

const { HttpError } = require('../http');
const { recordAudit } = require('../audit');
const {
  URGENCY_LEVELS,
  APPROVAL_STAGES,
  APPROVAL_STAGE_STATUS,
  STAGE_APPROVER_ROLES,
  RETURN_REASONS,
  ENVIRONMENTS,
  DATA_SENSITIVITY,
  ALLOCATABLE_STATUSES,
} = require('../constants');
const { requireRole, licenseUsage, ADMIN_ROLES } = require('./assets');

const APPROVER_ROLES = ['manager', 'it_asset_admin', 'it_support', 'security', 'finance', 'admin'];

// Statuses in which an allocation still consumes an instance / license seat.
const ACTIVE_ALLOCATION = ['Issued', 'Accepted', 'Return Requested'];

// ---- Urgency suggestion (rule-based "AI"; user and approver can always edit) ----
const URGENCY_RULES = [
  { level: 'Critical', words: ['cannot work', 'cannot continue', 'blocked', 'new joiner', 'not working', 'down', 'outage', 'production issue', 'stopped'] },
  { level: 'High', words: ['customer', 'deadline', 'this week', 'urgent', 'delivery', 'go-live', 'golive', 'audit', 'compliance deadline'] },
  { level: 'Low', words: ['nice to have', 'convenience', 'future', 'backup option', 'when possible', 'no rush', 'additional monitor'] },
];

function suggestUrgency(justification = '') {
  const text = justification.toLowerCase();
  for (const rule of URGENCY_RULES) {
    if (rule.words.some((w) => text.includes(w))) return rule.level;
  }
  return 'Normal';
}

// Effective approval chain for a request = stages configured on the asset,
// plus dynamic rules (section 10): security if confidential data is involved,
// finance if there is a recurring/estimated cost.
function effectiveStages(asset, body) {
  const stages = new Set(JSON.parse(asset.approval_stages));
  if (body.confidential_data || body.data_sensitivity === 'confidential' || body.data_sensitivity === 'restricted') {
    stages.add('security');
  }
  if ((body.est_monthly_cost ?? 0) > 0 || (asset.monthly_cost ?? 0) > 0) {
    stages.add('finance');
  }
  return APPROVAL_STAGES.filter((s) => stages.has(s));
}

function getRequest(db, id) {
  const r = db
    .prepare(
      `SELECT r.*, u.name AS user_name, u.department, c.name AS catalog_name,
              c.allocation_type, c.requires_return, a.name AS asset_name, a.category,
              a.track_stock, a.track_license, a.unit_cost, a.monthly_cost, a.currency
       FROM requests r
       JOIN users u ON u.id = r.user_id
       JOIN catalog_items c ON c.id = r.catalog_item_id
       JOIN assets a ON a.id = r.asset_id
       WHERE r.id = ?`
    )
    .get(id);
  if (!r) throw new HttpError(404, 'Request not found');
  return r;
}

function requestDetail(db, id) {
  const r = getRequest(db, id);
  r.approvals = db
    .prepare(
      `SELECT ap.*, u.name AS approver_name FROM approvals ap
       LEFT JOIN users u ON u.id = ap.approver_id
       WHERE ap.request_id = ? ORDER BY ap.id`
    )
    .all(id);
  r.allocation = db
    .prepare(
      `SELECT al.*, i.asset_tag, i.serial_number, i.cloud_resource_id, ib.name AS issued_by_name
       FROM allocations al
       LEFT JOIN asset_instances i ON i.id = al.instance_id
       LEFT JOIN users ib ON ib.id = al.issued_by
       WHERE al.request_id = ? ORDER BY al.id DESC LIMIT 1`
    )
    .get(id) ?? null;
  return r;
}

// Move a submitted request to its next pending approval stage, or to Approved.
function advanceApproval(db, request, actorId) {
  const next = db
    .prepare(`SELECT * FROM approvals WHERE request_id = ? AND status = 'pending' ORDER BY id LIMIT 1`)
    .get(request.id);
  if (next) {
    db.prepare(`UPDATE requests SET status = ?, pending_stage = ?, updated_at = datetime('now') WHERE id = ?`)
      .run(APPROVAL_STAGE_STATUS[next.stage], next.stage, request.id);
    return APPROVAL_STAGE_STATUS[next.stage];
  }
  db.prepare(`UPDATE requests SET status = 'Approved', pending_stage = NULL, updated_at = datetime('now') WHERE id = ?`)
    .run(request.id);
  recordAudit(db, {
    entityType: 'request', entityId: request.id, action: 'request.approved',
    actorId, details: { request_no: request.request_no, note: 'All approval stages complete' },
  });
  return 'Approved';
}

function submitRequest(db, request, user) {
  const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(request.asset_id);
  const stages = effectiveStages(asset, request);
  db.prepare(`DELETE FROM approvals WHERE request_id = ? AND status = 'pending'`).run(request.id);
  for (const stage of stages) {
    db.prepare('INSERT INTO approvals (request_id, stage) VALUES (?, ?)').run(request.id, stage);
  }
  recordAudit(db, {
    entityType: 'request', entityId: request.id, action: 'request.submitted',
    actorId: user.id, details: { request_no: request.request_no, stages },
  });
  if (!stages.length) {
    // No approval needed (section 10.1) — straight to fulfilment queue.
    db.prepare(`UPDATE requests SET status = 'Approved', pending_stage = NULL, updated_at = datetime('now') WHERE id = ?`)
      .run(request.id);
    return 'Approved';
  }
  db.prepare(`UPDATE requests SET status = 'Submitted', updated_at = datetime('now') WHERE id = ?`).run(request.id);
  return advanceApproval(db, request, user.id);
}

function register(app, db) {
  // ---------------- Request creation (section 6.2) ----------------

  app.post('/api/requests', ({ ctx, body }) => {
    if (!ctx.user) throw new HttpError(401, 'Sign in required');
    const item = db.prepare('SELECT * FROM catalog_items WHERE id = ? AND active = 1').get(body.catalog_item_id);
    if (!item) throw new HttpError(404, 'Catalog item not found or inactive');
    const asset = db.prepare('SELECT * FROM assets WHERE id = ? AND requestable = 1').get(item.asset_id);
    if (!asset) throw new HttpError(400, 'This item is not requestable');
    if (item.who_can_request !== 'all') {
      const roles = JSON.parse(item.who_can_request);
      if (!roles.includes(ctx.user.role)) throw new HttpError(403, 'You are not allowed to request this item');
    }
    if (item.requires_justification && !body.justification?.trim()) {
      throw new HttpError(400, 'Business justification is required for this item');
    }
    const urgency = body.urgency ?? suggestUrgency(body.justification);
    if (!URGENCY_LEVELS.includes(urgency)) throw new HttpError(400, 'Unknown urgency level');
    if (body.environment && !ENVIRONMENTS.includes(body.environment)) throw new HttpError(400, 'Unknown environment');
    if (body.data_sensitivity && !DATA_SENSITIVITY.includes(body.data_sensitivity)) {
      throw new HttpError(400, 'Unknown data_sensitivity');
    }
    if (item.max_duration_days && body.duration_days > item.max_duration_days) {
      throw new HttpError(400, `Maximum allocation duration is ${item.max_duration_days} days`);
    }
    if (item.allocation_type === 'temporary' && !body.duration_days) {
      throw new HttpError(400, 'Duration is required for temporary allocations');
    }
    // AI tools with a usage policy require acknowledgement up front (section 6.7).
    if (asset.category === 'ai_tool' && item.usage_policy && !body.policy_acknowledged) {
      throw new HttpError(400, 'Usage policy must be acknowledged before requesting this AI tool');
    }

    db.exec('BEGIN');
    try {
      const info = db
        .prepare(
          `INSERT INTO requests (request_no, user_id, catalog_item_id, asset_id, justification, urgency,
             required_date, duration_days, status, environment, data_sensitivity, project,
             application_name, expected_usage, confidential_data, policy_acknowledged,
             cpu, memory_gb, storage_gb, region, est_monthly_cost, cost_center)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Draft', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          'PENDING', ctx.user.id, item.id, asset.id,
          body.justification ?? null, urgency, body.required_date ?? null, body.duration_days ?? null,
          body.environment ?? null, body.data_sensitivity ?? null, body.project ?? null,
          body.application_name ?? null, body.expected_usage ?? null,
          body.confidential_data ? 1 : 0, body.policy_acknowledged ? 1 : 0,
          body.cpu ?? null, body.memory_gb ?? null, body.storage_gb ?? null, body.region ?? null,
          body.est_monthly_cost ?? null, body.cost_center ?? ctx.user.cost_center ?? null
        );
      const id = Number(info.lastInsertRowid);
      const requestNo = `REQ-${String(id).padStart(5, '0')}`;
      db.prepare('UPDATE requests SET request_no = ? WHERE id = ?').run(requestNo, id);
      recordAudit(db, {
        entityType: 'request', entityId: id, action: 'request.created',
        actorId: ctx.user.id,
        details: { request_no: requestNo, item: item.name, urgency, justification: body.justification },
      });
      if (body.submit !== false) {
        submitRequest(db, { id, request_no: requestNo, asset_id: asset.id, ...body }, ctx.user);
      }
      db.exec('COMMIT');
      return requestDetail(db, id);
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  });

  app.post('/api/requests/:id/submit', ({ ctx, params }) => {
    if (!ctx.user) throw new HttpError(401, 'Sign in required');
    const r = getRequest(db, params.id);
    if (r.user_id !== ctx.user.id) throw new HttpError(403, 'Only the requester can submit');
    if (r.status !== 'Draft') throw new HttpError(400, `Cannot submit a request in status ${r.status}`);
    submitRequest(db, r, ctx.user);
    return requestDetail(db, r.id);
  });

  app.post('/api/suggest-urgency', ({ body }) => ({ urgency: suggestUrgency(body.justification) }));

  // ---------------- Request queries ----------------

  app.get('/api/requests', ({ ctx, query }) => {
    if (!ctx.user) throw new HttpError(401, 'Sign in required');
    const scope = query.get('scope') ?? 'mine';
    const base = `
      SELECT r.*, u.name AS user_name, c.name AS catalog_name, a.name AS asset_name,
             a.category, a.unit_cost, a.monthly_cost, a.currency
      FROM requests r
      JOIN users u ON u.id = r.user_id
      JOIN catalog_items c ON c.id = r.catalog_item_id
      JOIN assets a ON a.id = r.asset_id`;

    if (scope === 'mine') {
      return db.prepare(`${base} WHERE r.user_id = ? ORDER BY r.id DESC`).all(ctx.user.id);
    }
    if (scope === 'approvals') {
      requireRole(ctx, APPROVER_ROLES);
      const stages = ctx.user.role === 'admin'
        ? APPROVAL_STAGES
        : APPROVAL_STAGES.filter((s) => STAGE_APPROVER_ROLES[s].includes(ctx.user.role));
      if (!stages.length) return [];
      const ph = stages.map(() => '?').join(',');
      const rows = db.prepare(`${base} WHERE r.pending_stage IN (${ph}) ORDER BY r.id DESC`).all(...stages);
      // Managers only see their own reports' requests (unless admin).
      if (ctx.user.role === 'manager') {
        return rows.filter((r) => {
          if (r.pending_stage !== 'manager') return true;
          const requester = db.prepare('SELECT manager_id FROM users WHERE id = ?').get(r.user_id);
          return requester?.manager_id === ctx.user.id || requester?.manager_id == null;
        });
      }
      return rows;
    }
    if (scope === 'fulfilment') {
      requireRole(ctx, ADMIN_ROLES);
      return db
        .prepare(`${base} WHERE r.status IN ('Approved', 'In Fulfilment') ORDER BY
          CASE r.urgency WHEN 'Critical' THEN 0 WHEN 'High' THEN 1 WHEN 'Normal' THEN 2 ELSE 3 END, r.id`)
        .all();
    }
    if (scope === 'all') {
      requireRole(ctx, [...ADMIN_ROLES, 'finance', 'security', 'it_support']);
      return db.prepare(`${base} ORDER BY r.id DESC LIMIT 500`).all();
    }
    throw new HttpError(400, 'Unknown scope');
  });

  app.get('/api/requests/:id', ({ ctx, params }) => {
    if (!ctx.user) throw new HttpError(401, 'Sign in required');
    const r = requestDetail(db, params.id);
    const privileged = [...ADMIN_ROLES, 'finance', 'security', 'it_support', 'manager'].includes(ctx.user.role);
    if (r.user_id !== ctx.user.id && !privileged) throw new HttpError(403, 'Not your request');
    return r;
  });

  // ---------------- Approval actions (section 4.2 / 10) ----------------

  function pendingApprovalFor(db, request, user) {
    if (!request.pending_stage) throw new HttpError(400, 'Request is not pending approval');
    const allowed = user.role === 'admin' || STAGE_APPROVER_ROLES[request.pending_stage].includes(user.role);
    if (!allowed) throw new HttpError(403, `Current stage (${request.pending_stage}) is not yours to action`);
    if (request.pending_stage === 'manager' && user.role === 'manager') {
      const requester = db.prepare('SELECT manager_id FROM users WHERE id = ?').get(request.user_id);
      if (requester?.manager_id != null && requester.manager_id !== user.id) {
        throw new HttpError(403, 'You are not this user\'s manager');
      }
    }
    const ap = db
      .prepare(`SELECT * FROM approvals WHERE request_id = ? AND stage = ? AND status = 'pending'`)
      .get(request.id, request.pending_stage);
    if (!ap) throw new HttpError(409, 'No pending approval row found');
    return ap;
  }

  app.post('/api/requests/:id/approve', ({ ctx, params, body }) => {
    requireRole(ctx, APPROVER_ROLES);
    const r = getRequest(db, params.id);
    const ap = pendingApprovalFor(db, r, ctx.user);
    if (body.urgency) {
      if (!URGENCY_LEVELS.includes(body.urgency)) throw new HttpError(400, 'Unknown urgency level');
      db.prepare('UPDATE requests SET urgency = ? WHERE id = ?').run(body.urgency, r.id);
    }
    db.prepare(`UPDATE approvals SET status = 'approved', approver_id = ?, comment = ?, acted_at = datetime('now') WHERE id = ?`)
      .run(ctx.user.id, body.comment ?? null, ap.id);
    recordAudit(db, {
      entityType: 'request', entityId: r.id, action: 'request.approved',
      actorId: ctx.user.id, details: { request_no: r.request_no, stage: ap.stage, comment: body.comment },
    });
    advanceApproval(db, r, ctx.user.id);
    return requestDetail(db, r.id);
  });

  app.post('/api/requests/:id/reject', ({ ctx, params, body }) => {
    requireRole(ctx, APPROVER_ROLES);
    const r = getRequest(db, params.id);
    const ap = pendingApprovalFor(db, r, ctx.user);
    if (!body.comment?.trim()) throw new HttpError(400, 'A reason is required to reject');
    db.prepare(`UPDATE approvals SET status = 'rejected', approver_id = ?, comment = ?, acted_at = datetime('now') WHERE id = ?`)
      .run(ctx.user.id, body.comment, ap.id);
    db.prepare(`UPDATE requests SET status = 'Rejected', pending_stage = NULL, updated_at = datetime('now') WHERE id = ?`)
      .run(r.id);
    recordAudit(db, {
      entityType: 'request', entityId: r.id, action: 'request.rejected',
      actorId: ctx.user.id, details: { request_no: r.request_no, stage: ap.stage, comment: body.comment },
    });
    return requestDetail(db, r.id);
  });

  app.post('/api/requests/:id/request-info', ({ ctx, params, body }) => {
    requireRole(ctx, APPROVER_ROLES);
    const r = getRequest(db, params.id);
    const ap = pendingApprovalFor(db, r, ctx.user);
    if (!body.comment?.trim()) throw new HttpError(400, 'Say what information you need');
    db.prepare(`UPDATE approvals SET status = 'info_requested', approver_id = ?, comment = ?, acted_at = datetime('now') WHERE id = ?`)
      .run(ctx.user.id, body.comment, ap.id);
    db.prepare(`UPDATE requests SET status = 'More Information Required', updated_at = datetime('now') WHERE id = ?`)
      .run(r.id);
    recordAudit(db, {
      entityType: 'request', entityId: r.id, action: 'request.info_requested',
      actorId: ctx.user.id, details: { request_no: r.request_no, stage: ap.stage, comment: body.comment },
    });
    return requestDetail(db, r.id);
  });

  app.post('/api/requests/:id/provide-info', ({ ctx, params, body }) => {
    if (!ctx.user) throw new HttpError(401, 'Sign in required');
    const r = getRequest(db, params.id);
    if (r.user_id !== ctx.user.id) throw new HttpError(403, 'Only the requester can respond');
    if (r.status !== 'More Information Required') throw new HttpError(400, 'No information was requested');
    if (!body.comment?.trim()) throw new HttpError(400, 'Provide the requested information');
    if (body.justification) {
      db.prepare(`UPDATE requests SET justification = ?, updated_at = datetime('now') WHERE id = ?`)
        .run(body.justification, r.id);
    }
    // Re-open the stage that asked and put the request back in its queue.
    db.prepare(`INSERT INTO approvals (request_id, stage) VALUES (?, ?)`).run(r.id, r.pending_stage);
    db.prepare(`UPDATE requests SET status = ?, updated_at = datetime('now') WHERE id = ?`)
      .run(APPROVAL_STAGE_STATUS[r.pending_stage], r.id);
    recordAudit(db, {
      entityType: 'request', entityId: r.id, action: 'request.info_provided',
      actorId: ctx.user.id, details: { request_no: r.request_no, comment: body.comment },
    });
    return requestDetail(db, r.id);
  });

  app.post('/api/requests/:id/cancel', ({ ctx, params }) => {
    if (!ctx.user) throw new HttpError(401, 'Sign in required');
    const r = getRequest(db, params.id);
    const isOwner = r.user_id === ctx.user.id;
    if (!isOwner && !ADMIN_ROLES.includes(ctx.user.role)) throw new HttpError(403, 'Not your request');
    const cancellable = ['Draft', 'Submitted', 'More Information Required', 'Approved',
      'Pending Manager Approval', 'Pending IT Approval', 'Pending Security Approval', 'Pending Finance Approval'];
    if (!cancellable.includes(r.status)) throw new HttpError(400, `Cannot cancel a request in status ${r.status}`);
    db.prepare(`UPDATE requests SET status = 'Cancelled', pending_stage = NULL, updated_at = datetime('now') WHERE id = ?`)
      .run(r.id);
    recordAudit(db, {
      entityType: 'request', entityId: r.id, action: 'request.cancelled',
      actorId: ctx.user.id, details: { request_no: r.request_no },
    });
    return requestDetail(db, r.id);
  });

  // ---------------- Allocation (section 6.3 / 6.5 / 6.8) ----------------

  app.get('/api/requests/:id/available-instances', ({ ctx, params }) => {
    requireRole(ctx, ADMIN_ROLES);
    const r = getRequest(db, params.id);
    const ph = ALLOCATABLE_STATUSES.map(() => '?').join(',');
    return db
      .prepare(`SELECT * FROM asset_instances WHERE asset_id = ? AND status IN (${ph}) ORDER BY id`)
      .all(r.asset_id, ...ALLOCATABLE_STATUSES);
  });

  app.post('/api/requests/:id/allocate', ({ ctx, params, body }) => {
    requireRole(ctx, ADMIN_ROLES);
    const r = getRequest(db, params.id);
    if (!['Approved', 'In Fulfilment'].includes(r.status)) {
      throw new HttpError(400, `Request must be approved before allocation (current: ${r.status})`);
    }
    const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(r.asset_id);
    const isCloud = asset.category === 'cloud';

    db.exec('BEGIN');
    try {
      let instanceId = null;

      if (isCloud) {
        // Cloud provisioning: resource id + cost allocation tags are mandatory (section 6.8).
        if (!body.cloud_resource_id) throw new HttpError(400, 'cloud_resource_id is required for cloud assets');
        const tags = body.cloud_tags ?? {};
        for (const key of ['department', 'project', 'application', 'owner', 'cost_center']) {
          if (!tags[key]) throw new HttpError(400, `Cloud cost allocation tag "${key}" is mandatory`);
        }
        const info = db
          .prepare(
            `INSERT INTO asset_instances (asset_id, status, location, cloud_resource_id, cloud_tags,
               review_date, decommission_date, allocated_to, notes)
             VALUES (?, 'Cloud Provisioned', ?, ?, ?, ?, ?, ?, ?)`
          )
          .run(
            asset.id, body.region ?? r.region ?? asset.region ?? null, body.cloud_resource_id,
            JSON.stringify(tags), body.review_date ?? null, body.decommission_date ?? null,
            r.user_id, body.notes ?? null
          );
        instanceId = Number(info.lastInsertRowid);
        recordAudit(db, {
          entityType: 'instance', entityId: instanceId, action: 'cloud.provisioned',
          actorId: ctx.user.id,
          details: { request_no: r.request_no, cloud_resource_id: body.cloud_resource_id, tags },
        });
      } else if (asset.track_license) {
        // License assignment: enforce seat availability (section 6.5).
        const usage = licenseUsage(db, asset);
        if (usage.available <= 0) {
          throw new HttpError(409, `No licenses available for ${asset.name} (${usage.used}/${usage.total} in use)`);
        }
      } else if (asset.track_stock || body.instance_id) {
        if (!body.instance_id) throw new HttpError(400, 'instance_id is required for stock-tracked assets');
        const inst = db.prepare('SELECT * FROM asset_instances WHERE id = ?').get(body.instance_id);
        if (!inst || inst.asset_id !== asset.id) throw new HttpError(404, 'Instance not found for this asset');
        if (!ALLOCATABLE_STATUSES.includes(inst.status)) {
          throw new HttpError(409, `Instance is not available (status: ${inst.status})`);
        }
        instanceId = inst.id;
      }

      if (instanceId && !isCloud) {
        db.prepare(`UPDATE asset_instances SET status = 'Allocated', allocated_to = ?, location = COALESCE(?, location), updated_at = datetime('now') WHERE id = ?`)
          .run(r.user_id, body.location ?? null, instanceId);
      }

      const expectedReturn = body.expected_return_date
        ?? (r.allocation_type === 'temporary' && r.duration_days
          ? db.prepare(`SELECT date(COALESCE(?, date('now')), '+' || ? || ' days') d`)
              .get(body.issue_date ?? null, r.duration_days).d
          : null);

      const info = db
        .prepare(
          `INSERT INTO allocations (request_id, asset_id, instance_id, user_id, issued_by, issue_date,
             location, expected_return_date, condition_at_issue, accessories, status)
           VALUES (?, ?, ?, ?, ?, COALESCE(?, date('now')), ?, ?, ?, ?, 'Issued')`
        )
        .run(
          r.id, asset.id, instanceId, r.user_id, ctx.user.id, body.issue_date ?? null,
          body.location ?? null, expectedReturn, body.condition_at_issue ?? null,
          body.accessories ?? null
        );
      const allocId = Number(info.lastInsertRowid);

      db.prepare(`UPDATE requests SET status = 'Issued', updated_at = datetime('now') WHERE id = ?`).run(r.id);
      recordAudit(db, {
        entityType: 'allocation', entityId: allocId, action: 'allocation.created',
        actorId: ctx.user.id,
        details: { request_no: r.request_no, asset: asset.name, issued_to: r.user_name, instance_id: instanceId },
      });
      if (asset.track_license) {
        recordAudit(db, {
          entityType: 'allocation', entityId: allocId, action: 'license.assigned',
          actorId: ctx.user.id, details: { asset: asset.name, user: r.user_name },
        });
      }
      db.exec('COMMIT');
      return requestDetail(db, r.id);
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  });

  // ---------------- My assets / handover / return (sections 6.2 step 13, 6.4) ----------------

  app.get('/api/my-assets', ({ ctx }) => {
    if (!ctx.user) throw new HttpError(401, 'Sign in required');
    return db
      .prepare(
        `SELECT al.*, a.name AS asset_name, a.category, c.requires_return, c.usage_policy,
                i.asset_tag, i.serial_number, i.status AS instance_status, i.cloud_resource_id,
                r.request_no
         FROM allocations al
         JOIN assets a ON a.id = al.asset_id
         LEFT JOIN requests r ON r.id = al.request_id
         LEFT JOIN catalog_items c ON c.id = r.catalog_item_id
         LEFT JOIN asset_instances i ON i.id = al.instance_id
         WHERE al.user_id = ? AND al.status != 'Returned'
         ORDER BY al.id DESC`
      )
      .all(ctx.user.id);
  });

  app.post('/api/allocations/:id/accept', ({ ctx, params }) => {
    if (!ctx.user) throw new HttpError(401, 'Sign in required');
    const al = db.prepare('SELECT * FROM allocations WHERE id = ?').get(params.id);
    if (!al) throw new HttpError(404, 'Allocation not found');
    if (al.user_id !== ctx.user.id) throw new HttpError(403, 'Not your allocation');
    if (al.status !== 'Issued') throw new HttpError(400, `Cannot accept in status ${al.status}`);
    db.prepare(`UPDATE allocations SET status = 'Accepted', accepted_at = datetime('now') WHERE id = ?`).run(al.id);
    if (al.instance_id) {
      const inst = db.prepare('SELECT status FROM asset_instances WHERE id = ?').get(al.instance_id);
      if (inst.status === 'Allocated') {
        db.prepare(`UPDATE asset_instances SET status = 'In Use', updated_at = datetime('now') WHERE id = ?`)
          .run(al.instance_id);
      }
    }
    if (al.request_id) {
      db.prepare(`UPDATE requests SET status = 'User Accepted', updated_at = datetime('now') WHERE id = ?`)
        .run(al.request_id);
    }
    recordAudit(db, {
      entityType: 'allocation', entityId: al.id, action: 'allocation.accepted',
      actorId: ctx.user.id, details: { note: 'Handover digitally acknowledged' },
    });
    return db.prepare('SELECT * FROM allocations WHERE id = ?').get(al.id);
  });

  app.post('/api/allocations/:id/request-return', ({ ctx, params, body }) => {
    if (!ctx.user) throw new HttpError(401, 'Sign in required');
    const al = db.prepare('SELECT * FROM allocations WHERE id = ?').get(params.id);
    if (!al) throw new HttpError(404, 'Allocation not found');
    const privileged = ADMIN_ROLES.includes(ctx.user.role);
    if (al.user_id !== ctx.user.id && !privileged) throw new HttpError(403, 'Not your allocation');
    if (!ACTIVE_ALLOCATION.slice(0, 2).includes(al.status)) {
      throw new HttpError(400, `Cannot request return in status ${al.status}`);
    }
    if (!RETURN_REASONS.includes(body.reason)) {
      throw new HttpError(400, `reason must be one of: ${RETURN_REASONS.join(', ')}`);
    }
    db.prepare(`UPDATE allocations SET status = 'Return Requested', return_reason = ?, return_requested_at = datetime('now') WHERE id = ?`)
      .run(body.reason, al.id);
    if (al.request_id) {
      db.prepare(`UPDATE requests SET status = 'Return Requested', updated_at = datetime('now') WHERE id = ?`)
        .run(al.request_id);
    }
    recordAudit(db, {
      entityType: 'allocation', entityId: al.id, action: 'allocation.return_requested',
      actorId: ctx.user.id, details: { reason: body.reason, notes: body.notes },
    });
    return db.prepare('SELECT * FROM allocations WHERE id = ?').get(al.id);
  });

  // User reports a damaged or lost asset (section 4.1).
  app.post('/api/allocations/:id/report', ({ ctx, params, body }) => {
    if (!ctx.user) throw new HttpError(401, 'Sign in required');
    const al = db.prepare('SELECT * FROM allocations WHERE id = ?').get(params.id);
    if (!al) throw new HttpError(404, 'Allocation not found');
    if (al.user_id !== ctx.user.id) throw new HttpError(403, 'Not your allocation');
    if (!['damaged', 'lost'].includes(body.type)) throw new HttpError(400, 'type must be "damaged" or "lost"');
    const status = body.type === 'lost' ? 'Lost' : 'Damaged';
    if (al.instance_id) {
      db.prepare(`UPDATE asset_instances SET status = ?, notes = COALESCE(?, notes), updated_at = datetime('now') WHERE id = ?`)
        .run(status, body.notes ?? null, al.instance_id);
    }
    recordAudit(db, {
      entityType: 'allocation', entityId: al.id, action: 'instance.updated',
      actorId: ctx.user.id, details: { reported: status, notes: body.notes },
    });
    return { ok: true, reported: status };
  });

  // Admin processes the physical/logical return (section 6.4 steps 6-9).
  const RETURN_OUTCOMES = ['Available for Reuse', 'Under Repair', 'Retired', 'Lost', 'Damaged', 'Cloud Decommissioned'];

  app.post('/api/allocations/:id/return', ({ ctx, params, body }) => {
    requireRole(ctx, ADMIN_ROLES);
    const al = db.prepare('SELECT * FROM allocations WHERE id = ?').get(params.id);
    if (!al) throw new HttpError(404, 'Allocation not found');
    if (!ACTIVE_ALLOCATION.includes(al.status)) throw new HttpError(400, `Cannot return in status ${al.status}`);
    const outcome = body.new_status ?? 'Available for Reuse';
    if (!RETURN_OUTCOMES.includes(outcome)) {
      throw new HttpError(400, `new_status must be one of: ${RETURN_OUTCOMES.join(', ')}`);
    }
    const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(al.asset_id);

    db.exec('BEGIN');
    try {
      db.prepare(
        `UPDATE allocations SET status = 'Returned', return_date = COALESCE(?, date('now')),
           returned_condition = ?, missing_accessories = ?, damage_notes = ?,
           data_wipe_required = ?, license_revoked = ?, received_by = ?,
           return_reason = COALESCE(return_reason, ?)
         WHERE id = ?`
      ).run(
        body.return_date ?? null, body.returned_condition ?? null, body.missing_accessories ?? null,
        body.damage_notes ?? null, body.data_wipe_required ? 1 : 0,
        asset.track_license || body.license_revoked ? 1 : 0, ctx.user.id,
        body.reason ?? 'No longer required', al.id
      );
      if (al.instance_id) {
        db.prepare(`UPDATE asset_instances SET status = ?, allocated_to = NULL, condition = COALESCE(?, condition), updated_at = datetime('now') WHERE id = ?`)
          .run(outcome, body.returned_condition ?? null, al.instance_id);
      }
      if (al.request_id) {
        db.prepare(`UPDATE requests SET status = 'Closed', updated_at = datetime('now') WHERE id = ?`).run(al.request_id);
        recordAudit(db, {
          entityType: 'request', entityId: al.request_id, action: 'request.closed',
          actorId: ctx.user.id, details: { via: 'return' },
        });
      }
      recordAudit(db, {
        entityType: 'allocation', entityId: al.id, action: 'allocation.returned',
        actorId: ctx.user.id,
        details: {
          asset: asset.name, outcome, returned_condition: body.returned_condition,
          missing_accessories: body.missing_accessories, damage_notes: body.damage_notes,
          data_wipe_required: !!body.data_wipe_required,
        },
      });
      if (asset.track_license || body.license_revoked) {
        recordAudit(db, {
          entityType: 'allocation', entityId: al.id, action: 'license.revoked',
          actorId: ctx.user.id, details: { asset: asset.name },
        });
      }
      if (outcome === 'Cloud Decommissioned') {
        recordAudit(db, {
          entityType: 'instance', entityId: al.instance_id, action: 'cloud.decommissioned',
          actorId: ctx.user.id, details: { asset: asset.name },
        });
      }
      db.exec('COMMIT');
      return db.prepare('SELECT * FROM allocations WHERE id = ?').get(al.id);
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  });

  // Return queue for admins.
  app.get('/api/returns', ({ ctx }) => {
    requireRole(ctx, ADMIN_ROLES);
    return db
      .prepare(
        `SELECT al.*, a.name AS asset_name, a.category, u.name AS user_name,
                i.asset_tag, i.cloud_resource_id, r.request_no
         FROM allocations al
         JOIN assets a ON a.id = al.asset_id
         JOIN users u ON u.id = al.user_id
         LEFT JOIN asset_instances i ON i.id = al.instance_id
         LEFT JOIN requests r ON r.id = al.request_id
         WHERE al.status = 'Return Requested'
         ORDER BY al.return_requested_at`
      )
      .all();
  });
}

module.exports = { register, suggestUrgency };
