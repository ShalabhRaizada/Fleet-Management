# Ticktrack — IT Asset Management module for Tickie

Ticktrack is the IT Asset Management module of **Tickie**, the Portfolio and
Project Management System. It is a simple, auditable, ITAM-aligned module. It manages the
full lifecycle of IT assets — hardware, desk-side equipment, network gear, software,
licenses, business applications, APIs, AI tools, and cloud infrastructure — from
creation through allocation, return, repair, renewal, retirement, and disposal.

Design intent (aligned with ISO/IEC 19770-1 lifecycle control and ITIL practice):

- **For users**: *Select what you need. Tell us why. Tell us how urgent it is. Submit.*
- **For asset admins**: *Create asset. Approve request. Allocate. Track. Recover. Audit.*

No ITAM jargon is shown to end users; the controls run in the background.

## Quick start

Requires Node.js ≥ 22.5 (uses the built-in `node:sqlite` — **zero npm dependencies**).

```bash
cd ticktrack
npm run seed     # load demo users, asset master, inventory, catalog
npm start        # http://localhost:3000
npm test         # end-to-end API tests
```

Sign in via the header dropdown (demo auth — the selected user id is sent as the
`x-user-id` header; replace with Tickie's session auth on integration). Seeded users
cover every role: admin, IT asset admin, manager, security, finance, IT support, and
two end users.

## Concepts

| Object | Meaning |
| --- | --- |
| **Asset Master** (`assets`) | Defines the asset item: category, costs, license terms, cloud metadata, approval chain, whether stock/licenses are tracked. |
| **Asset Inventory** (`asset_instances`) | Physical/logical instances: tag, serial, PO/invoice, warranty, location, status — and for cloud, resource id + mandatory cost tags. |
| **Approved Catalog** (`catalog_items`) | What users see and can request: plain description, cost indicator, issue time, usage policy, temporary/permanent, return required. |
| **Requests** (`requests` + `approvals`) | Justification, urgency, required date, duration, and category-specific context (environment, data sensitivity, CPU/memory/storage, cost center…). |
| **Allocations** (`allocations`) | Issue → digital handover acknowledgement → return with condition, missing accessories, data-wipe and license-revocation flags. |
| **Audit log** (`audit_log`) | Append-only record of every significant action, with actor and JSON detail. Never updated or deleted. |

## Approval workflow

Each asset configures an ordered approval chain from `manager → it → security → finance`
(empty = no approval, section 10.1). Two dynamic rules are applied per request:

- **Security** is added when the request involves confidential/restricted data.
- **Finance** is added when there is a monthly/estimated recurring cost.

Approvers can approve, reject (reason required), or ask for more information (the
requester responds and the request re-enters the same stage). Managers only see their
own reports' requests. Urgency is suggested from the justification text (rule-based,
`POST /api/suggest-urgency`) and remains editable by the user and the approver.

## Category-specific behaviour

- **Hardware / stock-tracked**: allocation picks an available instance; status flows
  `In Stock → Allocated → In Use → Return Requested → Available for Reuse / Under
  Repair / Retired / Lost / Damaged`.
- **Software / licenses**: seat availability is enforced at allocation; the free count
  is license total minus active allocations; assignment and revocation are audited;
  the compliance report shows Compliant / Over-allocated / Expired per title.
- **AI tools**: usage-policy acknowledgement is required at request time; confidential
  data triggers security approval.
- **APIs**: application, environment, expected usage and data sensitivity are captured.
- **Cloud**: provisioning records the cloud resource id and **mandatory FinOps cost
  allocation tags** (department, project, application, owner, cost center) plus review
  and decommission dates; the cloud report rolls up monthly cost by each tag.

## API surface

All endpoints are JSON under `/api`. Highlights:

```
GET  /api/meta                              vocabulary + current user
GET  /api/catalog                           user-facing approved catalog
POST /api/requests                          create + submit a request
POST /api/requests/:id/approve|reject|request-info|provide-info|cancel
GET  /api/requests?scope=mine|approvals|fulfilment|all
POST /api/requests/:id/allocate             issue instance / seat / cloud resource
GET  /api/my-assets                         current user's allocations
POST /api/allocations/:id/accept            digital handover acknowledgement
POST /api/allocations/:id/request-return    user starts return (reason required)
POST /api/allocations/:id/return            admin completes return
POST /api/allocations/:id/report            report damaged / lost
POST /api/assets · /api/assets/:id/instances · /api/catalog     admin CRUD
GET  /api/reports/inventory|licenses|renewals|cloud|finance
GET  /api/audit                             filterable audit trail
```

Role enforcement is server-side on every route (end user, manager, IT asset admin,
IT support, security, finance, admin).

## Layout

```
ticktrack/
  server.js            entry point (node:http, static + API)
  src/
    constants.js       statuses, categories, urgency, stages, roles
    db.js              SQLite schema (node:sqlite)
    audit.js           append-only audit helpers
    http.js            tiny router / JSON / static helpers
    routes/assets.js   asset master, inventory, catalog
    routes/requests.js request → approval → allocation → return workflow
    routes/reports.js  meta, users, reports, audit
    seed.js            demo data
  public/              vanilla-JS single-page UI
  test/api.test.js     end-to-end flow tests (node --test)
```
