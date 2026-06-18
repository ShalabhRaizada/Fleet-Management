# Fleet Management Module

Enterprise fleet management system for a logistics/transportation company covering
Diesel/CNG/LNG/EV trucks, trailers, coupling, fuel & energy, maintenance, workshops,
job cards, tyres, accessories, mandatory accompaniments, statutory compliance,
approvals, alerts, and reporting.

Built as one product, internally phase-tagged:

- **Phase 1 (built, fully functional)** — core fleet, trailer, coupling, fuel,
  compliance, job card, workshop/invoice, tyre, accessory, accompaniment,
  approval and alert workflows, end to end (DB → API → UI).
- **Phase 2 / Phase 3 (schema + stubs)** — tables for maintenance automation,
  breakdown/accident management, invoice three-way match, tyre lifecycle
  movements, inspections, ULIP/VAHAN/SARATHI/FASTag/GPS/OBD/EV/OCR/ERP
  integrations exist in the database and have mock connectors / stub
  endpoints behind feature flags, ready to be built out without schema
  changes. See `docs/ARCHITECTURE.md`.

## Stack

- **Database**: PostgreSQL 16, migrations via `node-pg-migrate`
- **Backend**: Node.js + TypeScript + Express, JWT auth (access + refresh),
  RBAC, Swagger/OpenAPI
- **Frontend**: React + TypeScript + Vite + Tailwind CSS

## Prerequisites

- Node.js 18+
- PostgreSQL 16 (local or container)

## 1. Database setup

```bash
sudo -u postgres psql -c "CREATE ROLE fleet_app LOGIN PASSWORD 'fleet_app_pw';"
sudo -u postgres psql -c "CREATE DATABASE fleet_management OWNER fleet_app;"
```

## 2. Backend

```bash
cd backend
cp .env.example .env   # adjust DATABASE_URL/JWT_SECRET if needed
npm install
npm run migrate:up      # creates all 49 tables
npm run seed             # loads sample data (branches, vehicles, users, etc.)
npm run build             # tsc typecheck/build
npm test                   # 38 backend tests: auth, RBAC, CRUD, approvals
npm run dev                 # starts API on http://localhost:4000
```

Swagger UI is available at `http://localhost:4000/api-docs` once the server is running.

## 3. Frontend

```bash
cd frontend
cp .env.example .env    # VITE_API_BASE_URL should point at the backend
npm install
npm run dev               # http://localhost:5173
# or: npm run build       # production build into frontend/dist
```

## 4. Default login credentials (from seed data)

| Role              | Login ID                  | Password      |
|-------------------|----------------------------|----------------|
| Admin             | admin@fleet.test           | Password@123  |
| Fleet Manager     | fleetmanager@fleet.test    | Password@123  |
| Workshop Supervisor | workshop@fleet.test      | Password@123  |
| Driver            | driver1@fleet.test         | Password@123  |
| Driver            | driver2@fleet.test         | Password@123  |
| Approver          | approver@fleet.test        | Password@123  |

## Repository layout

```
backend/            Node/TS API, migrations, seed script, tests
frontend/           React/Vite/Tailwind app
docs/
  source/           Original wireframe (.docx) and data model (.xlsx) documents
  extracted/         CSV extracts of the data model (tables, columns, FKs, screens, enums...)
  ARCHITECTURE.md    Service boundaries and phase strategy
  USER_GUIDE.md      Walkthrough of the main Phase 1 workflows
```

## Useful references

- `docs/extracted/Table_Catalog.csv` — all 49 tables with phase tagging
- `docs/extracted/Screen_Catalog.csv` — all 376 planned screens with phase tagging
- `docs/extracted/Integration_Mapping.csv` — external integrations (ULIP, FASTag, GPS, OBD, EV, OCR, ERP)
- `backend/openapi.json` — generated OpenAPI spec for implemented APIs
