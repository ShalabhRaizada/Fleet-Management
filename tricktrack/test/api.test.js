'use strict';

// End-to-end API tests for Tricktrack. Boots the real server on an ephemeral
// port with an in-memory-ish temp database and walks the main business flows.

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { buildServer } = require('../server');
const { seed } = require('../src/seed');

let server;
let base;
const tmpDb = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'tricktrack-')), 'test.db');

// Seeded user ids (see src/seed.js insertion order).
const ADMIN = 1, ITADMIN = 2, MANAGER = 3, SECURITY = 4, FINANCE = 5, SUPPORT = 6, USER = 7, USER2 = 8;

async function api(method, urlPath, { user, body } = {}) {
  const res = await fetch(base + urlPath, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(user ? { 'x-user-id': String(user) } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  return { status: res.status, body: json };
}

test.before(async () => {
  server = buildServer(tmpDb);
  seed(server.tricktrackDb);
  await new Promise((resolve) => server.listen(0, resolve));
  base = `http://localhost:${server.address().port}`;
});

test.after(() => server.close());

test('meta endpoint exposes vocabulary and current user', async () => {
  const { status, body } = await api('GET', '/api/meta', { user: USER });
  assert.equal(status, 200);
  assert.equal(body.module, 'Tricktrack');
  assert.equal(body.user.role, 'end_user');
  assert.ok(body.asset_statuses.includes('Cloud Decommissioned'));
  assert.ok(body.request_statuses.includes('Pending Security Approval'));
});

test('asset master requires admin role and records audit', async () => {
  const denied = await api('POST', '/api/assets', {
    user: USER,
    body: { name: 'Rogue Asset', category: 'it_hardware' },
  });
  assert.equal(denied.status, 403);

  const created = await api('POST', '/api/assets', {
    user: ITADMIN,
    body: {
      name: 'Headset — Wireless', category: 'it_hardware', requestable: true,
      approval_stages: ['manager'], track_stock: true, vendor: 'Jabra', unit_cost: 9000,
    },
  });
  assert.equal(created.status, 200);
  assert.equal(created.body.lifecycle_status, 'Planned');

  const audit = await api('GET', `/api/audit?entity_type=asset&entity_id=${created.body.id}`, { user: ITADMIN });
  assert.equal(audit.body[0].action, 'asset.created');
});

test('catalog hides internals and shows availability', async () => {
  const { status, body } = await api('GET', '/api/catalog', { user: USER });
  assert.equal(status, 200);
  const laptop = body.find((c) => c.name.startsWith('Laptop — Standard'));
  assert.ok(laptop);
  assert.equal(laptop.approval_required, true);
  assert.equal(laptop.available_stock, 3);
  const m365 = body.find((c) => c.name.includes('Microsoft 365'));
  assert.equal(m365.available_licenses, 50);
});

test('full hardware flow: request → manager approval → allocate → accept → return', async () => {
  const catalog = (await api('GET', '/api/catalog', { user: USER })).body;
  const laptopItem = catalog.find((c) => c.name.startsWith('Laptop — Standard'));

  // Justification is mandatory.
  const noJust = await api('POST', '/api/requests', {
    user: USER, body: { catalog_item_id: laptopItem.id },
  });
  assert.equal(noJust.status, 400);

  const req = (
    await api('POST', '/api/requests', {
      user: USER,
      body: {
        catalog_item_id: laptopItem.id,
        justification: 'New joiner cannot work without laptop',
        required_date: '2026-07-10',
      },
    })
  ).body;
  assert.equal(req.status, 'Pending Manager Approval');
  assert.equal(req.urgency, 'Critical'); // suggested from justification

  // A random manager of someone else cannot be tricked, but Meera is Ravi's manager.
  const approve = await api('POST', `/api/requests/${req.id}/approve`, {
    user: MANAGER, body: { comment: 'Approved for new joiner' },
  });
  assert.equal(approve.body.status, 'Approved');

  // End user cannot allocate.
  const deniedAlloc = await api('POST', `/api/requests/${req.id}/allocate`, { user: USER, body: {} });
  assert.equal(deniedAlloc.status, 403);

  const avail = (await api('GET', `/api/requests/${req.id}/available-instances`, { user: ITADMIN })).body;
  assert.ok(avail.length >= 1);

  const alloc = await api('POST', `/api/requests/${req.id}/allocate`, {
    user: ITADMIN,
    body: {
      instance_id: avail[0].id, location: 'HQ Desk 12',
      condition_at_issue: 'New', accessories: 'Charger, bag',
    },
  });
  assert.equal(alloc.body.status, 'Issued');
  assert.equal(alloc.body.allocation.condition_at_issue, 'New');

  // User confirms receipt; instance moves to In Use.
  const myAssets = (await api('GET', '/api/my-assets', { user: USER })).body;
  const mine = myAssets.find((a) => a.request_id === req.id);
  await api('POST', `/api/allocations/${mine.id}/accept`, { user: USER });
  const detail = (await api('GET', `/api/requests/${req.id}`, { user: USER })).body;
  assert.equal(detail.status, 'User Accepted');

  // Return flow.
  const ret = await api('POST', `/api/allocations/${mine.id}/request-return`, {
    user: USER, body: { reason: 'Replacement received' },
  });
  assert.equal(ret.body.status, 'Return Requested');

  const queue = (await api('GET', '/api/returns', { user: ITADMIN })).body;
  assert.ok(queue.some((q) => q.id === mine.id));

  const done = await api('POST', `/api/allocations/${mine.id}/return`, {
    user: ITADMIN,
    body: { returned_condition: 'Good', data_wipe_required: true, new_status: 'Available for Reuse' },
  });
  assert.equal(done.body.status, 'Returned');

  const closed = (await api('GET', `/api/requests/${req.id}`, { user: USER })).body;
  assert.equal(closed.status, 'Closed');

  // Instance is available again.
  const inst = (await api('GET', `/api/assets/${laptopItem.asset_id}`, { user: ITADMIN })).body
    .instances.find((i) => i.id === avail[0].id);
  assert.equal(inst.status, 'Available for Reuse');
  assert.equal(inst.allocated_to, null);
});

test('license flow reduces and restores seat count, with audit of assign/revoke', async () => {
  const catalog = (await api('GET', '/api/catalog', { user: USER2 })).body;
  const m365 = catalog.find((c) => c.name.includes('Microsoft 365'));
  const before = m365.available_licenses;

  const req = (
    await api('POST', '/api/requests', {
      user: USER2,
      body: { catalog_item_id: m365.id, justification: 'Software required for project', urgency: 'Normal' },
    })
  ).body;
  // Paid subscription → finance stage is added dynamically after manager.
  assert.deepEqual(req.approvals.map((a) => a.stage), ['manager', 'finance']);
  await api('POST', `/api/requests/${req.id}/approve`, { user: MANAGER, body: { comment: 'ok' } });
  await api('POST', `/api/requests/${req.id}/approve`, { user: FINANCE, body: { comment: 'ok' } });
  const alloc = await api('POST', `/api/requests/${req.id}/allocate`, { user: ITADMIN, body: {} });
  assert.equal(alloc.status, 200);

  const after = (await api('GET', '/api/catalog', { user: USER2 })).body
    .find((c) => c.name.includes('Microsoft 365')).available_licenses;
  assert.equal(after, before - 1);

  const licReport = (await api('GET', '/api/reports/licenses', { user: FINANCE })).body;
  const m365Report = licReport.find((l) => l.name.includes('Microsoft 365'));
  assert.equal(m365Report.compliance, 'Compliant');
  assert.ok(m365Report.assigned_users.some((a) => a.name === 'Priya Singh'));

  // Return → seat restored, license.revoked audited.
  const mine = (await api('GET', '/api/my-assets', { user: USER2 })).body.find((a) => a.request_id === req.id);
  await api('POST', `/api/allocations/${mine.id}/return`, { user: ITADMIN, body: {} });
  const restored = (await api('GET', '/api/catalog', { user: USER2 })).body
    .find((c) => c.name.includes('Microsoft 365')).available_licenses;
  assert.equal(restored, before);

  const audit = (await api('GET', '/api/audit?action=license.revoked', { user: ITADMIN })).body;
  assert.ok(audit.length >= 1);
});

test('cloud flow: dynamic finance stage, mandatory tags, provisioning audit', async () => {
  const catalog = (await api('GET', '/api/catalog', { user: USER })).body;
  const vm = catalog.find((c) => c.name.includes('Cloud VM'));

  // Temporary item requires a duration.
  const noDuration = await api('POST', '/api/requests', {
    user: USER,
    body: { catalog_item_id: vm.id, justification: 'Dev environment for telematics project' },
  });
  assert.equal(noDuration.status, 400);

  const req = (
    await api('POST', '/api/requests', {
      user: USER,
      body: {
        catalog_item_id: vm.id,
        justification: 'Dev environment for telematics project',
        duration_days: 90, environment: 'dev', project: 'Telematics',
        cpu: 4, memory_gb: 16, storage_gb: 100, region: 'ap-south-1',
        est_monthly_cost: 6000, cost_center: 'CC-OPS',
      },
    })
  ).body;
  // Asset configures manager+it; monthly cost adds finance dynamically.
  assert.deepEqual(req.approvals.map((a) => a.stage), ['manager', 'it', 'finance']);
  assert.equal(req.status, 'Pending Manager Approval');

  await api('POST', `/api/requests/${req.id}/approve`, { user: MANAGER, body: {} });
  await api('POST', `/api/requests/${req.id}/approve`, { user: ITADMIN, body: {} });

  // Security user cannot act on the finance stage.
  const wrongStage = await api('POST', `/api/requests/${req.id}/approve`, { user: SECURITY, body: {} });
  assert.equal(wrongStage.status, 403);

  const fin = await api('POST', `/api/requests/${req.id}/approve`, { user: FINANCE, body: { comment: 'Budgeted' } });
  assert.equal(fin.body.status, 'Approved');

  // Tags are mandatory for cloud provisioning.
  const noTags = await api('POST', `/api/requests/${req.id}/allocate`, {
    user: ITADMIN, body: { cloud_resource_id: 'i-0abc123' },
  });
  assert.equal(noTags.status, 400);
  assert.match(noTags.body.error, /tag/);

  const alloc = await api('POST', `/api/requests/${req.id}/allocate`, {
    user: ITADMIN,
    body: {
      cloud_resource_id: 'i-0abc123',
      cloud_tags: { department: 'Operations', project: 'Telematics', application: 'FleetView', owner: 'Ravi Kumar', cost_center: 'CC-OPS' },
      review_date: '2026-09-01', decommission_date: '2026-10-05',
    },
  });
  assert.equal(alloc.status, 200);
  assert.equal(alloc.body.allocation.cloud_resource_id, 'i-0abc123');
  // Temporary allocation gets an expected return date from duration.
  assert.ok(alloc.body.allocation.expected_return_date);

  const cloud = (await api('GET', '/api/reports/cloud', { user: FINANCE })).body;
  assert.equal(cloud.monthly_cost_by_project.Telematics, 6000);
  assert.ok(cloud.total_active_monthly_cost >= 6000);

  const audit = (await api('GET', '/api/audit?action=cloud.provisioned', { user: ITADMIN })).body;
  assert.ok(audit.length >= 1);
});

test('ai tool requires policy acknowledgement; confidential data adds security stage', async () => {
  const catalog = (await api('GET', '/api/catalog', { user: USER })).body;
  const ai = catalog.find((c) => c.name.includes('AI Tool'));

  const noAck = await api('POST', '/api/requests', {
    user: USER, body: { catalog_item_id: ai.id, justification: 'Coding assistant for project' },
  });
  assert.equal(noAck.status, 400);
  assert.match(noAck.body.error, /policy/i);

  const req = (
    await api('POST', '/api/requests', {
      user: USER,
      body: {
        catalog_item_id: ai.id, justification: 'Summarise confidential contracts',
        policy_acknowledged: true, confidential_data: true,
      },
    })
  ).body;
  // Configured: manager. Dynamic: security (confidential) + finance (monthly cost).
  assert.deepEqual(req.approvals.map((a) => a.stage), ['manager', 'security', 'finance']);
});

test('reject and request-info paths', async () => {
  const catalog = (await api('GET', '/api/catalog', { user: USER })).body;
  const monitor = catalog.find((c) => c.name.includes('Monitor'));

  const r1 = (
    await api('POST', '/api/requests', {
      user: USER, body: { catalog_item_id: monitor.id, justification: 'Additional monitor for convenience' },
    })
  ).body;
  assert.equal(r1.urgency, 'Low');
  const rejected = await api('POST', `/api/requests/${r1.id}/reject`, {
    user: MANAGER, body: { comment: 'Not budgeted this quarter' },
  });
  assert.equal(rejected.body.status, 'Rejected');

  const r2 = (
    await api('POST', '/api/requests', {
      user: USER, body: { catalog_item_id: monitor.id, justification: 'Dual screen for dispatch console' },
    })
  ).body;
  const info = await api('POST', `/api/requests/${r2.id}/request-info`, {
    user: MANAGER, body: { comment: 'Which project is this for?' },
  });
  assert.equal(info.body.status, 'More Information Required');
  const provided = await api('POST', `/api/requests/${r2.id}/provide-info`, {
    user: USER, body: { comment: 'For the dispatch control room project' },
  });
  assert.equal(provided.body.status, 'Pending Manager Approval');
});

test('no-approval item goes straight to fulfilment', async () => {
  const catalog = (await api('GET', '/api/catalog', { user: USER })).body;
  const charger = catalog.find((c) => c.name.includes('Charger'));
  assert.equal(charger.approval_required, false);
  const req = (
    await api('POST', '/api/requests', { user: USER, body: { catalog_item_id: charger.id, justification: 'n/a' } })
  ).body;
  assert.equal(req.status, 'Approved');
  const queue = (await api('GET', '/api/requests?scope=fulfilment', { user: ITADMIN })).body;
  assert.ok(queue.some((q) => q.id === req.id));
});

test('it support can mark an instance under repair; audit captures it', async () => {
  const assets = (await api('GET', '/api/assets', { user: SUPPORT })).body;
  const fw = assets.find((a) => a.name.includes('Firewall'));
  const detail = (await api('GET', `/api/assets/${fw.id}`, { user: SUPPORT })).body;
  const inst = detail.instances[0];
  const upd = await api('PATCH', `/api/instances/${inst.id}`, {
    user: SUPPORT, body: { status: 'Under Repair', notes: 'PSU fault, ticket SD-1042' },
  });
  assert.equal(upd.body.status, 'Under Repair');
  // Support cannot edit financial fields.
  const forbidden = await api('PATCH', `/api/instances/${inst.id}`, {
    user: SUPPORT, body: { purchase_cost: 1 },
  });
  assert.equal(forbidden.status, 400); // field ignored → nothing to update
});

test('reports: inventory, renewals, finance', async () => {
  const inv = (await api('GET', '/api/reports/inventory', { user: ITADMIN })).body;
  assert.ok(inv.by_status.length > 0);
  assert.ok(inv.by_category.length > 0);

  const ren = (await api('GET', '/api/reports/renewals?days=365', { user: FINANCE })).body;
  assert.ok(ren.licenses.some((l) => l.name.includes('Microsoft 365')));
  assert.ok(ren.warranties.length >= 1);

  const finance = (await api('GET', '/api/reports/finance', { user: FINANCE })).body;
  assert.ok(finance.purchases.some((p) => p.po_reference === 'PO-2026-014'));
  const deniedFinance = await api('GET', '/api/reports/finance', { user: USER });
  assert.equal(deniedFinance.status, 403);
});

test('audit trail is complete and attributed', async () => {
  const audit = (await api('GET', '/api/audit?limit=1000', { user: ADMIN })).body;
  const actions = new Set(audit.map((a) => a.action));
  for (const expected of [
    'asset.created', 'request.created', 'request.submitted', 'request.approved',
    'request.rejected', 'request.info_requested', 'request.info_provided',
    'allocation.created', 'allocation.accepted', 'allocation.return_requested',
    'allocation.returned', 'license.assigned', 'license.revoked',
    'cloud.provisioned', 'instance.updated',
  ]) {
    assert.ok(actions.has(expected), `missing audit action ${expected}`);
  }
  assert.ok(audit.every((a) => a.created_at));
});

test('anonymous requests are rejected', async () => {
  const res = await api('GET', '/api/catalog');
  assert.equal(res.status, 401);
});
