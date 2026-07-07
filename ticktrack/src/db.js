'use strict';

const { DatabaseSync } = require('node:sqlite');

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  role        TEXT NOT NULL,
  manager_id  INTEGER REFERENCES users(id),
  department  TEXT,
  cost_center TEXT,
  active      INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Asset Master: defines the asset item (section 6.1). Instances live in
-- asset_instances; what users can request lives in catalog_items.
CREATE TABLE IF NOT EXISTS assets (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  name              TEXT NOT NULL,
  category          TEXT NOT NULL,
  subcategory       TEXT,
  description       TEXT,
  requestable       INTEGER NOT NULL DEFAULT 0,
  approval_stages   TEXT NOT NULL DEFAULT '[]',   -- JSON array, subset of APPROVAL_STAGES in order
  track_stock       INTEGER NOT NULL DEFAULT 0,
  track_license     INTEGER NOT NULL DEFAULT 0,
  owner_id          INTEGER REFERENCES users(id), -- custodian / owner
  lifecycle_status  TEXT NOT NULL DEFAULT 'Planned',
  vendor            TEXT,
  unit_cost         REAL,
  currency          TEXT DEFAULT 'INR',
  -- Software / license fields (section 3.3)
  license_type      TEXT,
  license_count     INTEGER,
  license_start     TEXT,
  license_expiry    TEXT,
  renewal_date      TEXT,
  -- Cloud fields (section 3.4)
  cloud_provider    TEXT,
  cloud_service     TEXT,
  region            TEXT,
  monthly_cost      REAL,
  created_by        INTEGER REFERENCES users(id),
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Physical / logical instances of an asset (inventory).
CREATE TABLE IF NOT EXISTS asset_instances (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_id        INTEGER NOT NULL REFERENCES assets(id),
  asset_tag       TEXT UNIQUE,
  serial_number   TEXT,
  status          TEXT NOT NULL DEFAULT 'In Stock',
  condition       TEXT DEFAULT 'New',
  location        TEXT,
  allocated_to    INTEGER REFERENCES users(id),
  po_reference    TEXT,
  invoice_reference TEXT,
  purchase_date   TEXT,
  purchase_cost   REAL,
  warranty_end    TEXT,
  -- Cloud instance metadata (section 6.8): resource id + mandatory cost tags
  cloud_resource_id TEXT,
  cloud_tags      TEXT,                            -- JSON {department, project, application, owner, cost_center}
  review_date     TEXT,
  decommission_date TEXT,
  notes           TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Approved Asset Catalog: what end users see and can request (section 11).
CREATE TABLE IF NOT EXISTS catalog_items (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_id              INTEGER NOT NULL REFERENCES assets(id),
  name                  TEXT NOT NULL,
  description           TEXT,
  who_can_request       TEXT NOT NULL DEFAULT 'all',  -- 'all' or JSON array of roles
  standard_issue_days   INTEGER,
  cost_indicator        TEXT,                          -- e.g. 'Free', '₹', '₹₹', 'Monthly cost applies'
  usage_policy          TEXT,
  requires_justification INTEGER NOT NULL DEFAULT 1,
  allocation_type       TEXT NOT NULL DEFAULT 'permanent', -- 'permanent' | 'temporary'
  max_duration_days     INTEGER,
  requires_return       INTEGER NOT NULL DEFAULT 0,
  active                INTEGER NOT NULL DEFAULT 1,
  created_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS requests (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  request_no        TEXT NOT NULL UNIQUE,
  user_id           INTEGER NOT NULL REFERENCES users(id),
  catalog_item_id   INTEGER NOT NULL REFERENCES catalog_items(id),
  asset_id          INTEGER NOT NULL REFERENCES assets(id),
  justification     TEXT,
  urgency           TEXT NOT NULL DEFAULT 'Normal',
  required_date     TEXT,
  duration_days     INTEGER,
  status            TEXT NOT NULL DEFAULT 'Draft',
  pending_stage     TEXT,                            -- current approval stage, when pending
  -- Context fields for API / AI / cloud requests (sections 6.6-6.8)
  environment       TEXT,
  data_sensitivity  TEXT,
  project           TEXT,
  application_name  TEXT,
  expected_usage    TEXT,
  confidential_data INTEGER,
  policy_acknowledged INTEGER,
  cpu               INTEGER,
  memory_gb         INTEGER,
  storage_gb        INTEGER,
  region            TEXT,
  est_monthly_cost  REAL,
  cost_center       TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS approvals (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id  INTEGER NOT NULL REFERENCES requests(id),
  stage       TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending',        -- pending | approved | rejected | info_requested
  approver_id INTEGER REFERENCES users(id),
  comment     TEXT,
  acted_at    TEXT
);

-- One row per issue of an instance / license / access to a user.
CREATE TABLE IF NOT EXISTS allocations (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id          INTEGER REFERENCES requests(id),
  asset_id            INTEGER NOT NULL REFERENCES assets(id),
  instance_id         INTEGER REFERENCES asset_instances(id),
  user_id             INTEGER NOT NULL REFERENCES users(id),
  issued_by           INTEGER REFERENCES users(id),
  issue_date          TEXT,
  location            TEXT,
  expected_return_date TEXT,
  condition_at_issue  TEXT,
  accessories         TEXT,
  status              TEXT NOT NULL DEFAULT 'Issued', -- Issued | Accepted | Return Requested | Returned
  accepted_at         TEXT,
  return_reason       TEXT,
  return_requested_at TEXT,
  return_date         TEXT,
  returned_condition  TEXT,
  missing_accessories TEXT,
  damage_notes        TEXT,
  data_wipe_required  INTEGER,
  license_revoked     INTEGER,
  received_by         INTEGER REFERENCES users(id),
  created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Immutable audit trail (section 3.5). Never updated or deleted.
CREATE TABLE IF NOT EXISTS audit_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,
  entity_id   INTEGER,
  action      TEXT NOT NULL,
  actor_id    INTEGER,
  details     TEXT,                                   -- JSON snapshot of what changed
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_instances_asset  ON asset_instances(asset_id);
CREATE INDEX IF NOT EXISTS idx_requests_user    ON requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status  ON requests(status);
CREATE INDEX IF NOT EXISTS idx_approvals_req    ON approvals(request_id);
CREATE INDEX IF NOT EXISTS idx_alloc_user       ON allocations(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity     ON audit_log(entity_type, entity_id);
`;

function openDb(path) {
  const db = new DatabaseSync(path);
  db.exec(SCHEMA);
  return db;
}

module.exports = { openDb };
