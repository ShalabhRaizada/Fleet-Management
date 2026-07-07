'use strict';

const fs = require('node:fs');
const path = require('node:path');

// Minimal zero-dependency router: register handlers with app.get/post/patch,
// path params use ':name' segments. Handlers may return a value (sent as JSON)
// or call res helpers themselves.

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function compilePath(pattern) {
  const names = [];
  const regex = new RegExp(
    '^' +
      pattern
        .split('/')
        .map((seg) => {
          if (seg.startsWith(':')) {
            names.push(seg.slice(1));
            return '([^/]+)';
          }
          return seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        })
        .join('/') +
      '$'
  );
  return { regex, names };
}

function createApp() {
  const routes = [];

  function add(method, pattern, handler) {
    routes.push({ method, ...compilePath(pattern), handler });
  }

  const app = {
    get: (p, h) => add('GET', p, h),
    post: (p, h) => add('POST', p, h),
    patch: (p, h) => add('PATCH', p, h),
    delete: (p, h) => add('DELETE', p, h),
    routes,
  };
  return app;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1e6) reject(new HttpError(413, 'Body too large'));
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new HttpError(400, 'Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(body);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function serveStatic(publicDir, urlPath, res) {
  const rel = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
  const file = path.join(publicDir, rel);
  if (!file.startsWith(publicDir)) return false; // path traversal guard
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return false;
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
  res.end(fs.readFileSync(file));
  return true;
}

async function dispatch(app, ctxFactory, publicDir, req, res) {
  const url = new URL(req.url, 'http://localhost');
  const urlPath = decodeURIComponent(url.pathname);

  try {
    for (const route of app.routes) {
      if (route.method !== req.method) continue;
      const m = route.regex.exec(urlPath);
      if (!m) continue;
      const params = {};
      route.names.forEach((n, i) => (params[n] = m[i + 1]));
      const body = req.method === 'GET' ? {} : await readBody(req);
      const ctx = ctxFactory(req);
      const result = await route.handler({ params, query: url.searchParams, body, ctx, req, res });
      if (!res.writableEnded) sendJson(res, 200, result ?? { ok: true });
      return;
    }
    if (req.method === 'GET' && serveStatic(publicDir, urlPath, res)) return;
    sendJson(res, 404, { error: 'Not found' });
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    if (status === 500) console.error(err);
    sendJson(res, status, { error: err.message || 'Internal error' });
  }
}

module.exports = { createApp, dispatch, sendJson, HttpError };
