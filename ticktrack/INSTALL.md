# Ticktrack — Install & Run Guide

Ticktrack is the IT Asset Management module of Tickie, the Portfolio and
Project Management System. It is fully
self-contained: **no npm install, no database server, no configuration files
needed**. The only requirement is Node.js.

## 1. Prerequisites

- **Node.js version 22.5 or newer** (the module uses Node's built-in SQLite).

Check your version:

```bash
node --version
```

If you need Node.js, download the LTS installer from https://nodejs.org
(Windows / macOS) or use your package manager (Linux).

## 2. Install

Unzip the archive anywhere, then open a terminal in the extracted folder:

```bash
cd ticktrack
```

That's it — there is nothing to install. (`npm install` is not needed; the
module has zero dependencies.)

## 3. Load demo data (first run only)

```bash
npm run seed
```

This creates `ticktrack.db` (a local SQLite file) with:

- 8 demo users covering every role (admin, IT asset admin, manager, security,
  finance, IT support, and two end users)
- An asset master across all categories (laptops, monitors, chargers,
  firewall, Microsoft 365, ERP access, Google Maps API, AI tool, cloud VM,
  storage bucket)
- Inventory instances with tags, serials, PO/invoice references, warranties
- The Approved Asset Catalog users request from

To start over with fresh data at any time: delete `ticktrack.db*` and run
`npm run seed` again.

## 4. Start the server

```bash
npm start
```

Then open **http://localhost:3000** in your browser.

To use a different port:

```bash
PORT=8080 npm start          # macOS / Linux
set PORT=8080 && npm start   # Windows (cmd)
$env:PORT=8080; npm start    # Windows (PowerShell)
```

You may see a Node warning that SQLite is experimental — this is harmless.

## 5. Take a test drive

Use the **"Signed in as"** dropdown (top right) to switch between roles.
A good end-to-end walkthrough:

1. **Ravi Kumar (end_user)** → *Request Asset* → pick **Laptop — Standard
   Business** → type a justification like "New joiner cannot work without
   laptop" → click *Suggest urgency* (it will suggest Critical) → Submit.
2. **Meera Nair (manager)** → *Approvals* → review justification, urgency and
   cost → Approve (or Reject / Ask info).
3. **Ishaan Rao (it_asset_admin)** → *Fulfilment & Returns* → Allocate →
   pick an instance (e.g. TT-LT-0001), record location, condition,
   accessories.
4. **Ravi Kumar** → *My Assets* → **Confirm receipt** (digital handover).
5. **Ravi Kumar** → *My Assets* → **Return** → choose a reason.
6. **Ishaan Rao** → *Fulfilment & Returns* → **Receive return** → record
   condition, data wipe, new status.
7. **Ishaan Rao** → *Audit Log* → see every step above recorded.

Other flows worth trying:

- Request the **Cloud VM** (as Ravi): note the CPU/memory/storage/cost-center
  fields, the manager → IT → finance chain, and that allocation (as Ishaan)
  demands the cloud resource ID plus all five FinOps cost tags.
- Request **AI Tool Access**: the usage policy must be acknowledged, and
  ticking "confidential data" automatically adds a Security approval stage
  (approve it as Sanjay Iyer).
- Request the **Laptop Charger**: no approval — it goes straight to the
  fulfilment queue.
- As **Tarun Gupta (it_support)**: *Inventory* → mark the firewall
  **Under Repair** with a ticket reference.
- As **Farah Khan (finance)**: *Reports* → license compliance, renewal
  liabilities, PO/invoice purchases, cloud cost by tag.

## 6. Run the automated tests (optional)

```bash
npm test
```

13 end-to-end API tests boot a real server on a temporary database and walk
all the main business flows.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `Cannot find module 'node:sqlite'` or SQLite error on start | Your Node.js is older than 22.5 — upgrade from https://nodejs.org |
| Browser shows "API not reachable, or database not seeded" | Run `npm run seed`, then restart with `npm start` |
| Port 3000 already in use | Start with a different port (see step 4) |
| Want a clean slate | Stop the server, delete `ticktrack.db*`, re-run `npm run seed` |

## Notes for integration

Sign-in is demo-only: the UI sends the selected user's id as an `x-user-id`
header. The single place to swap in Tickie's real session authentication is
the `ctxFactory` function in `server.js`.
