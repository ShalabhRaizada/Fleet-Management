'use strict';

// Tricktrack — IT Asset Management module for Tickie.
// Zero-dependency Node.js server: node:http + node:sqlite.
//
//   node server.js            start on PORT (default 3000) with tricktrack.db
//   node src/seed.js          load demo users, assets, and catalog first

const http = require('node:http');
const path = require('node:path');

const { openDb } = require('./src/db');
const { createApp, dispatch } = require('./src/http');
const assets = require('./src/routes/assets');
const requests = require('./src/routes/requests');
const reports = require('./src/routes/reports');

function buildServer(dbPath) {
  const db = openDb(dbPath);
  const app = createApp();
  assets.register(app, db);
  requests.register(app, db);
  reports.register(app, db);

  const publicDir = path.join(__dirname, 'public');

  // Demo authentication: the client identifies as a directory user via the
  // x-user-id header. Replace with Tickie's real session auth on integration.
  const ctxFactory = (req) => {
    const userId = Number(req.headers['x-user-id']);
    const user = userId
      ? db.prepare('SELECT id, name, email, role, manager_id, department, cost_center FROM users WHERE id = ? AND active = 1').get(userId)
      : null;
    return { user: user ?? null, db };
  };

  const server = http.createServer((req, res) => dispatch(app, ctxFactory, publicDir, req, res));
  server.tricktrackDb = db;
  return server;
}

if (require.main === module) {
  const port = Number(process.env.PORT ?? 3000);
  const dbPath = process.env.TRICKTRACK_DB ?? path.join(__dirname, 'tricktrack.db');
  const server = buildServer(dbPath);
  server.listen(port, () => {
    console.log(`Tricktrack (Tickie ITAM module) listening on http://localhost:${port}`);
    console.log(`Database: ${dbPath}`);
  });
}

module.exports = { buildServer };
