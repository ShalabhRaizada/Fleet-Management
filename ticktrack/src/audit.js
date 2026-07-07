'use strict';

// Append-only audit trail. Every significant action in the module goes through
// here (section 3.5). Rows are never updated or deleted.

function recordAudit(db, { entityType, entityId, action, actorId, details }) {
  db.prepare(
    `INSERT INTO audit_log (entity_type, entity_id, action, actor_id, details)
     VALUES (?, ?, ?, ?, ?)`
  ).run(entityType, entityId ?? null, action, actorId ?? null, details ? JSON.stringify(details) : null);
}

function listAudit(db, { entityType, entityId, action, limit = 200 } = {}) {
  const where = [];
  const args = [];
  if (entityType) { where.push('a.entity_type = ?'); args.push(entityType); }
  if (entityId) { where.push('a.entity_id = ?'); args.push(entityId); }
  if (action) { where.push('a.action = ?'); args.push(action); }
  const sql = `
    SELECT a.*, u.name AS actor_name
    FROM audit_log a LEFT JOIN users u ON u.id = a.actor_id
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY a.id DESC LIMIT ?`;
  args.push(limit);
  return db.prepare(sql).all(...args);
}

module.exports = { recordAudit, listAudit };
