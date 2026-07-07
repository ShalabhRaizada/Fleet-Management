'use strict';

// Seed demo data for Tricktrack: a small user directory covering every role,
// an asset master spanning all eight categories, inventory instances, and the
// approved catalog cards from section 11 of the spec.
//
//   node src/seed.js          (uses tricktrack.db next to server.js, or TRICKTRACK_DB)

const path = require('node:path');
const { openDb } = require('./db');
const { recordAudit } = require('./audit');

function seed(db) {
  const already = db.prepare('SELECT COUNT(*) c FROM users').get().c;
  if (already > 0) {
    console.log('Database already seeded — skipping.');
    return;
  }

  const insUser = db.prepare(
    `INSERT INTO users (name, email, role, manager_id, department, cost_center) VALUES (?, ?, ?, ?, ?, ?)`
  );
  const u = {};
  u.admin = Number(insUser.run('Asha Verma', 'asha.admin@tickie.example', 'admin', null, 'IT', 'CC-IT').lastInsertRowid);
  u.itadmin = Number(insUser.run('Ishaan Rao', 'ishaan.itam@tickie.example', 'it_asset_admin', null, 'IT', 'CC-IT').lastInsertRowid);
  u.manager = Number(insUser.run('Meera Nair', 'meera.manager@tickie.example', 'manager', null, 'Operations', 'CC-OPS').lastInsertRowid);
  u.security = Number(insUser.run('Sanjay Iyer', 'sanjay.security@tickie.example', 'security', null, 'InfoSec', 'CC-SEC').lastInsertRowid);
  u.finance = Number(insUser.run('Farah Khan', 'farah.finance@tickie.example', 'finance', null, 'Finance', 'CC-FIN').lastInsertRowid);
  u.support = Number(insUser.run('Tarun Gupta', 'tarun.support@tickie.example', 'it_support', null, 'IT Service Desk', 'CC-IT').lastInsertRowid);
  u.user = Number(insUser.run('Ravi Kumar', 'ravi.user@tickie.example', 'end_user', u.manager, 'Operations', 'CC-OPS').lastInsertRowid);
  u.user2 = Number(insUser.run('Priya Singh', 'priya.user@tickie.example', 'end_user', u.manager, 'Operations', 'CC-OPS').lastInsertRowid);

  const insAsset = db.prepare(
    `INSERT INTO assets (name, category, subcategory, description, requestable, approval_stages,
       track_stock, track_license, owner_id, lifecycle_status, vendor, unit_cost, currency,
       license_type, license_count, license_start, license_expiry, renewal_date,
       cloud_provider, cloud_service, region, monthly_cost, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const addAsset = (o) => {
    const id = Number(
      insAsset.run(
        o.name, o.category, o.subcategory ?? null, o.description ?? null,
        o.requestable ? 1 : 0, JSON.stringify(o.approval_stages ?? []),
        o.track_stock ? 1 : 0, o.track_license ? 1 : 0,
        o.owner_id ?? u.itadmin, o.lifecycle_status ?? 'In Stock',
        o.vendor ?? null, o.unit_cost ?? null, o.currency ?? 'INR',
        o.license_type ?? null, o.license_count ?? null,
        o.license_start ?? null, o.license_expiry ?? null, o.renewal_date ?? null,
        o.cloud_provider ?? null, o.cloud_service ?? null, o.region ?? null,
        o.monthly_cost ?? null, u.itadmin
      ).lastInsertRowid
    );
    recordAudit(db, {
      entityType: 'asset', entityId: id, action: 'asset.created',
      actorId: u.itadmin, details: { name: o.name, category: o.category, seeded: true },
    });
    return id;
  };

  // -------- Asset master across all categories --------
  const laptop = addAsset({
    name: 'Laptop — Standard Business', category: 'it_hardware', subcategory: 'Laptop',
    description: '14" business laptop for office productivity users.',
    requestable: true, approval_stages: ['manager'], track_stock: true,
    vendor: 'Dell', unit_cost: 85000,
  });
  const monitor = addAsset({
    name: 'Monitor — 24"', category: 'it_hardware', subcategory: 'Monitor',
    description: 'Full HD external display.', requestable: true,
    approval_stages: ['manager'], track_stock: true, vendor: 'LG', unit_cost: 12000,
  });
  const charger = addAsset({
    name: 'Laptop Charger 65W', category: 'deskside', subcategory: 'Charger',
    description: 'Replacement USB-C charger.', requestable: true,
    approval_stages: [], track_stock: true, vendor: 'Dell', unit_cost: 2500,
  });
  const firewall = addAsset({
    name: 'Branch Firewall', category: 'network', subcategory: 'Firewall',
    description: 'Perimeter firewall appliance for branch offices.',
    requestable: true, approval_stages: ['it', 'security'], track_stock: true,
    vendor: 'Fortinet', unit_cost: 150000,
  });
  const m365 = addAsset({
    name: 'Microsoft 365 License', category: 'software', subcategory: 'Productivity suite',
    description: 'Email and office productivity suite seat.',
    requestable: true, approval_stages: ['manager'], track_license: true,
    vendor: 'Microsoft', license_type: 'Per-user subscription', license_count: 50,
    license_start: '2026-01-01', license_expiry: '2026-12-31', renewal_date: '2026-12-01',
    unit_cost: 900, monthly_cost: 45000,
  });
  addAsset({
    name: 'ERP — Finance System Access', category: 'business_application', subcategory: 'ERP',
    description: 'Named-user access to the corporate ERP.',
    requestable: true, approval_stages: ['manager', 'it'], track_license: true,
    vendor: 'SAP', license_type: 'Named user', license_count: 25,
    license_expiry: '2027-03-31', renewal_date: '2027-03-01',
  });
  const mapsApi = addAsset({
    name: 'Google Maps API Access', category: 'api', subcategory: 'Mapping',
    description: 'API key for geocoding and route planning in fleet apps.',
    requestable: true, approval_stages: ['it', 'security'],
    vendor: 'Google', monthly_cost: 8000,
  });
  const aiTool = addAsset({
    name: 'AI Assistant Subscription', category: 'ai_tool', subcategory: 'LLM assistant',
    description: 'AI assistant seat for productivity, coding and document work.',
    requestable: true, approval_stages: ['manager'], track_license: true,
    vendor: 'Anthropic', license_type: 'Per-seat subscription', license_count: 20,
    license_expiry: '2026-11-30', renewal_date: '2026-11-01', monthly_cost: 30000,
  });
  const devVm = addAsset({
    name: 'Cloud VM — Development', category: 'cloud', subcategory: 'Compute',
    description: '4 vCPU / 16 GB development virtual machine.',
    requestable: true, approval_stages: ['manager', 'it'],
    cloud_provider: 'AWS', cloud_service: 'EC2', region: 'ap-south-1', monthly_cost: 6000,
  });
  addAsset({
    name: 'Object Storage Bucket', category: 'cloud', subcategory: 'Storage',
    description: 'S3-compatible object storage for project data.',
    requestable: true, approval_stages: ['it'],
    cloud_provider: 'AWS', cloud_service: 'S3', region: 'ap-south-1', monthly_cost: 1500,
  });

  // -------- Inventory instances --------
  const insInst = db.prepare(
    `INSERT INTO asset_instances (asset_id, asset_tag, serial_number, status, condition, location,
       po_reference, invoice_reference, purchase_date, purchase_cost, warranty_end)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const addInst = (assetId, tag, serial, extra = {}) => {
    const id = Number(
      insInst.run(
        assetId, tag, serial, extra.status ?? 'In Stock', extra.condition ?? 'New',
        extra.location ?? 'HQ Store', extra.po ?? null, extra.invoice ?? null,
        extra.purchase_date ?? null, extra.cost ?? null, extra.warranty_end ?? null
      ).lastInsertRowid
    );
    recordAudit(db, {
      entityType: 'instance', entityId: id, action: 'instance.created',
      actorId: u.itadmin, details: { asset_tag: tag, seeded: true },
    });
    return id;
  };
  addInst(laptop, 'TT-LT-0001', 'DL5520-8841', { po: 'PO-2026-014', invoice: 'INV-8812', purchase_date: '2026-02-10', cost: 85000, warranty_end: '2029-02-10' });
  addInst(laptop, 'TT-LT-0002', 'DL5520-8842', { po: 'PO-2026-014', invoice: 'INV-8812', purchase_date: '2026-02-10', cost: 85000, warranty_end: '2029-02-10' });
  addInst(laptop, 'TT-LT-0003', 'DL5520-8843', { po: 'PO-2026-014', invoice: 'INV-8812', purchase_date: '2026-02-10', cost: 85000, warranty_end: '2026-09-01' });
  addInst(monitor, 'TT-MN-0001', 'LG24-3301', { po: 'PO-2026-020', cost: 12000, warranty_end: '2028-03-01' });
  addInst(monitor, 'TT-MN-0002', 'LG24-3302', { po: 'PO-2026-020', cost: 12000, warranty_end: '2028-03-01' });
  addInst(charger, 'TT-CH-0001', null, { cost: 2500 });
  addInst(charger, 'TT-CH-0002', null, { cost: 2500 });
  addInst(firewall, 'TT-FW-0001', 'FG100F-77120', { po: 'PO-2026-005', cost: 150000, warranty_end: '2029-01-15', location: 'Mumbai Branch Rack 2' });

  // -------- Approved catalog (section 11 example cards) --------
  const insCat = db.prepare(
    `INSERT INTO catalog_items (asset_id, name, description, who_can_request, standard_issue_days,
       cost_indicator, usage_policy, requires_justification, allocation_type, max_duration_days,
       requires_return, active)
     VALUES (?, ?, ?, 'all', ?, ?, ?, ?, ?, ?, ?, 1)`
  );
  const addCat = (assetId, name, desc, o = {}) => {
    const id = Number(
      insCat.run(
        assetId, name, desc, o.issue_days ?? 2, o.cost ?? null, o.policy ?? null,
        o.justification === false ? 0 : 1, o.temporary ? 'temporary' : 'permanent',
        o.max_days ?? null, o.return_required ? 1 : 0
      ).lastInsertRowid
    );
    recordAudit(db, {
      entityType: 'catalog', entityId: id, action: 'catalog.created',
      actorId: u.itadmin, details: { name, seeded: true },
    });
    return id;
  };
  addCat(laptop, 'Laptop — Standard Business',
    'For office productivity users. Return required on exit / replacement.',
    { issue_days: 2, cost: '₹₹₹', return_required: true });
  addCat(monitor, 'Monitor — 24"',
    'External display for desk setups.',
    { issue_days: 2, cost: '₹₹', return_required: true });
  addCat(charger, 'Laptop Charger 65W',
    'Replacement charger. No approval needed.',
    { issue_days: 1, cost: '₹', justification: false, return_required: false });
  addCat(firewall, 'Branch Firewall',
    'Perimeter firewall for a new branch. IT and Security approval required.',
    { issue_days: 10, cost: '₹₹₹₹', return_required: true });
  addCat(m365, 'Microsoft 365 License',
    'For email and office productivity. License will be revoked when not in use.',
    { issue_days: 1, cost: 'Monthly cost applies' });
  addCat(mapsApi, 'Google Maps API Access',
    'API key for approved applications. Access is revoked when no longer required.',
    { issue_days: 3, cost: 'Usage-based', temporary: true, max_days: 365 });
  addCat(aiTool, 'AI Tool Access',
    'For productivity / coding / document work. Requires policy acknowledgement.',
    { issue_days: 1, cost: 'Monthly cost applies',
      policy: 'Do not paste customer personal data or company confidential data unless approved by Information Security.' });
  addCat(devVm, 'Cloud VM — Development',
    'For approved project development. Monthly cost applies. Mandatory decommission date.',
    { issue_days: 3, cost: 'Monthly cost applies', temporary: true, max_days: 180, return_required: true });

  console.log('Seeded Tricktrack demo data:');
  console.log('  Users (sign in with x-user-id):');
  for (const [key, id] of Object.entries(u)) {
    const row = db.prepare('SELECT name, role FROM users WHERE id = ?').get(id);
    console.log(`    ${id}: ${row.name} (${row.role})${key === 'user' ? ' — demo end user' : ''}`);
  }
}

if (require.main === module) {
  const dbPath = process.env.TRICKTRACK_DB ?? path.join(__dirname, '..', 'tricktrack.db');
  const db = openDb(dbPath);
  seed(db);
}

module.exports = { seed };
