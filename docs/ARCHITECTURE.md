# Architecture

## Layers

```
React/Vite/Tailwind frontend
        |
Express REST API (JWT auth, RBAC middleware)
        |
Business logic (route handlers + validation + business-rule checks)
        |
PostgreSQL (pg pool, parameterized queries, node-pg-migrate migrations)
        |
Integration layer (mock connectors behind MOCK_MODE flag)
```

## Service boundaries (logical, implemented as route modules in `backend/src/routes`)

| Module                          | Status (this build)                                |
|----------------------------------|------------------------------------------------------|
| Auth / User & Role Management    | Implemented — JWT access+refresh, RBAC, `role_master`/`user_master` |
| Fleet Master (vehicle, trailer)  | Implemented — full CRUD, status rules                |
| Vehicle-Trailer Coupling         | Implemented — exclusivity + availability rules       |
| Fuel & Energy                    | Implemented — diesel/CNG/LNG/EV entry, planned vs actual, duplicate/odometer checks |
| Compliance                       | Implemented — register, expiry/hold logic            |
| Job Card                          | Implemented — job_card + job_card_line CRUD          |
| Workshop / Invoice                | Implemented — workshop master, vendor_invoice entry  |
| Tyre                              | Implemented — master + fitment/removal, serial uniqueness, double-fitment block |
| Accessory                         | Implemented — master + events                        |
| Accompaniment                     | Implemented — master + issue/return                  |
| Approval Workflow                  | Implemented — generic maker-checker engine (`approval_request`) |
| Alerts & Exceptions                | Implemented — `alert_event` generation for the Phase 1 rules |
| Maintenance automation (PM rules)  | Schema only (`maintenance_schedule`, `maintenance_due`) — no automation engine yet |
| Breakdown / Accident                | Schema only (`breakdown_event`, `accident_event`) — stub endpoints |
| Workshop rate contract / 3-way match| Schema only (`workshop_rate_contract`, `invoice_line`, `payable_validation`) — stub endpoints |
| Tyre lifecycle (rotation/repair/retread/scrap) | Schema only (`tyre_movement`) — stub endpoints |
| Consumables / stock                  | Schema only (`stock_ledger`, `item_master` exists and is used for accessory/accompaniment items) |
| Inspections                          | Schema only (`inspection_template` exists, `inspection_event`/`inspection_result_line` stubbed) |
| ULIP / VAHAN / SARATHI / FASTag / E-Challan / E-Way Bill | Mock connector interface + `ulip_api_log` table; toggle `MOCK_MODE=false` to wire real credentials later |
| GPS/telematics, OBD/CAN, EV charging platform, fuel vendor API, OCR, ERP posting | Mock connector pattern established in `backend/src/integrations`; real adapters can be dropped in without touching callers |
| Reports                              | Implemented for Phase 1 (vehicle cost report); broader BI/MIS reports are P3 |
| Mobile driver/mechanic apps           | Not built in this pass — backend APIs are REST/JSON and can be consumed by a future React Native/Flutter app without changes |

## Phase strategy

The database schema for **all 49 tables across all three phases** was created up
front (`backend/migrations`), so no schema migration is required to "turn on" P2/P3 —
only business logic and UI need to be added later. This was an explicit requirement:
the system is architected from day one to support all phases.

- **Phase 1** tables and workflows are fully wired end-to-end (DB → API → UI) and covered by tests.
- **Phase 2** tables exist and have minimal/stub REST endpoints (mounted behind
  `ENABLE_P2P3_STUBS=true` in `backend/src/config`). They return either a
  "not yet implemented" envelope or pass-through reads, so frontend/mobile work
  can start against a stable contract before full business logic lands.
- **Phase 3** integrations (ULIP and friends) follow one connector interface
  (`backend/src/integrations`). Every connector call is logged to
  `ulip_api_log` with status/error/timestamp/user, supports retry, and can run
  in `MOCK_MODE` (default `true`) until real credentials are supplied via
  environment variables — never hardcoded.

## Enabling a Phase 2/3 capability later

1. Confirm the table already exists (it does — see `docs/extracted/Table_Catalog.csv`).
2. Add/extend the route handler in `backend/src/routes` (follow the pattern in
   `entities.routes.ts` for generic CRUD, or `approvals.routes.ts` for workflow-style endpoints).
2. Add business-rule validation (see `backend/src/validation` and `backend/src/services` for examples already implemented for Phase 1 rules).
3. Add the corresponding frontend screen using the existing `CrudListPage` / `CrudFormPage` / `CrudDetailPage` generic components (`frontend/src/pages/crud`) as a starting point, or a bespoke screen for transaction workbenches (see `JobCardForm`/`ApprovalInbox` for examples).
4. For external integrations, implement a real connector class matching the existing mock connector's interface and swap it in when `MOCK_MODE=false`.

## Security

- Passwords hashed with bcrypt; JWT access (short-lived) + refresh tokens.
- RBAC enforced via Express middleware checking `role_master` permissions per route.
- All SQL uses parameterized queries via `pg` (no string concatenation).
- Audit columns (`created_by`, `created_at`, `updated_by`, `updated_at`,
  `deleted_flag`, `deleted_at`) on master/transactional tables; soft delete used
  for destructive operations on those tables.
- Secrets (JWT secret, DB credentials, future integration credentials) are read
  from environment variables only — see `.env.example` files.
