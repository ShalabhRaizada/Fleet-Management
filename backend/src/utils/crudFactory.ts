import { Router, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { pool } from '../db/pool';
import { ok, fail } from './envelope';
import { tableColumns, schemaSpec } from './schemaSpec';
import { authenticate, requireRole } from '../middleware/auth';

export interface CrudOptions {
  table: string;
  pk: string;
  /** role codes allowed to write (create/update/delete); empty = any authenticated user */
  writeRoles?: string[];
  /** columns searchable via ?q= */
  searchColumns?: string[];
  /** zod schema validated against POST body (full create payload) */
  createSchema?: ZodSchema;
  /** zod schema validated against PUT body (defaults to createSchema.partial() behavior is NOT automatic - pass explicitly if needed) */
  updateSchema?: ZodSchema;
  /** hook to validate/transform payload before insert/update; throw Error to reject */
  beforeWrite?: (payload: any, isUpdate: boolean, client: any) => Promise<any>;
  /** hook invoked after successful insert/update inside same transaction */
  afterWrite?: (row: any, isUpdate: boolean, client: any) => Promise<void>;
}

function quoteIdent(name: string) {
  return `"${name.replace(/"/g, '')}"`;
}

/**
 * Best-effort audit log insert for create/update/soft-delete operations performed
 * through the generic CRUD router. Failures here must never block or fail the
 * main CRUD write, so all errors are caught and logged as a warning.
 */
async function recordAudit(
  table: string,
  recordId: string,
  action: 'Insert' | 'Update' | 'Delete',
  changedBy: string | null,
  oldValues: any,
  newValues: any
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO audit_log (table_name, record_id, action, changed_by, changed_at, old_values, new_values)
       VALUES ($1, $2, $3, $4, now(), $5, $6)`,
      [
        table,
        recordId,
        action,
        changedBy,
        oldValues === undefined || oldValues === null ? null : JSON.stringify(oldValues),
        newValues === undefined || newValues === null ? null : JSON.stringify(newValues),
      ]
    );
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.warn(`audit_log insert failed for ${table}/${recordId} (${action}):`, err.message || err);
  }
}

export function buildCrudRouter(opts: CrudOptions): Router {
  const router = Router();
  const validCols = new Set(tableColumns(opts.table));
  const tableIdent = quoteIdent(opts.table);

  router.use(authenticate);

  // LIST with pagination/filter/search
  router.get('/', async (req: Request, res: Response) => {
    try {
      const page = Math.max(parseInt((req.query.page as string) || '1', 10), 1);
      const pageSize = Math.min(Math.max(parseInt((req.query.pageSize as string) || '20', 10), 1), 200);
      const offset = (page - 1) * pageSize;
      const where: string[] = ['deleted_flag = false'];
      const params: any[] = [];

      for (const [key, value] of Object.entries(req.query)) {
        if (['page', 'pageSize', 'q', 'sortBy', 'sortDir', 'export'].includes(key)) continue;
        if (!validCols.has(key) || value === undefined || value === '') continue;
        params.push(value);
        where.push(`${quoteIdent(key)} = $${params.length}`);
      }

      if (req.query.q && opts.searchColumns && opts.searchColumns.length) {
        const likeParams: string[] = [];
        params.push(`%${req.query.q}%`);
        const idx = params.length;
        for (const col of opts.searchColumns) {
          likeParams.push(`${quoteIdent(col)} ILIKE $${idx}`);
        }
        where.push(`(${likeParams.join(' OR ')})`);
      }

      let sortBy = (req.query.sortBy as string) || opts.pk;
      if (!validCols.has(sortBy)) sortBy = opts.pk;
      const sortDir = (req.query.sortDir as string)?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

      const isExport = req.query.export === 'csv';

      if (isExport) {
        const { rows } = await pool.query(
          `SELECT * FROM ${tableIdent} ${whereSql} ORDER BY ${quoteIdent(sortBy)} ${sortDir}`,
          params
        );
        const csv = toCsv(rows);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${opts.table}.csv"`);
        return res.send(csv);
      }

      const countResult = await pool.query(`SELECT COUNT(*) FROM ${tableIdent} ${whereSql}`, params);
      const total = parseInt(countResult.rows[0].count, 10);

      params.push(pageSize, offset);
      const { rows } = await pool.query(
        `SELECT * FROM ${tableIdent} ${whereSql} ORDER BY ${quoteIdent(sortBy)} ${sortDir} LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params
      );

      return ok(res, { items: rows, page, pageSize, total, totalPages: Math.ceil(total / pageSize) });
    } catch (err: any) {
      return fail(res, err.message || 'List failed', 500);
    }
  });

  // GET ONE
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { rows } = await pool.query(
        `SELECT * FROM ${tableIdent} WHERE ${quoteIdent(opts.pk)} = $1 AND deleted_flag = false`,
        [req.params.id]
      );
      if (!rows.length) return fail(res, `${opts.table} not found`, 404);
      return ok(res, rows[0]);
    } catch (err: any) {
      return fail(res, err.message || 'Fetch failed', 500);
    }
  });

  const writeGuard = opts.writeRoles && opts.writeRoles.length ? requireRole(...opts.writeRoles) : requireRole();

  // CREATE
  router.post('/', writeGuard, async (req: Request, res: Response) => {
    if (opts.createSchema) {
      const parsed = opts.createSchema.safeParse(req.body);
      if (!parsed.success) return fail(res, 'Validation failed', 422, parsed.error.issues);
      req.body = parsed.data;
    }
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      let payload = { ...req.body };
      delete payload[opts.pk];
      Object.keys(payload).forEach((k) => {
        if (!validCols.has(k)) delete payload[k];
      });
      if (opts.beforeWrite) {
        payload = await opts.beforeWrite(payload, false, client);
      }
      payload.created_by = req.user?.user_id || null;
      payload.updated_by = req.user?.user_id || null;

      const cols = Object.keys(payload);
      const placeholders = cols.map((_, i) => `$${i + 1}`);
      const values = cols.map((c) => payload[c]);

      const insertSql = `INSERT INTO ${tableIdent} (${cols.map(quoteIdent).join(',')}) VALUES (${placeholders.join(',')}) RETURNING *`;
      const { rows } = await client.query(insertSql, values);
      if (opts.afterWrite) await opts.afterWrite(rows[0], false, client);
      await client.query('COMMIT');
      await recordAudit(opts.table, String(rows[0][opts.pk]), 'Insert', req.user?.user_id || null, null, rows[0]);
      return ok(res, rows[0], `${opts.table} created`, 201);
    } catch (err: any) {
      await client.query('ROLLBACK');
      const status = err.statusCode || (err.code === '23505' ? 409 : err.code === '23503' ? 409 : 400);
      return fail(res, err.message || 'Create failed', status);
    } finally {
      client.release();
    }
  });

  // UPDATE
  router.put('/:id', writeGuard, async (req: Request, res: Response) => {
    if (opts.updateSchema) {
      const parsed = opts.updateSchema.safeParse(req.body);
      if (!parsed.success) return fail(res, 'Validation failed', 422, parsed.error.issues);
      req.body = parsed.data;
    }
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows: existingRows } = await client.query(
        `SELECT * FROM ${tableIdent} WHERE ${quoteIdent(opts.pk)} = $1 AND deleted_flag = false`,
        [req.params.id]
      );
      let payload = { ...req.body };
      delete payload[opts.pk];
      Object.keys(payload).forEach((k) => {
        if (!validCols.has(k)) delete payload[k];
      });
      if (opts.beforeWrite) {
        payload = await opts.beforeWrite(payload, true, client);
      }
      payload.updated_by = req.user?.user_id || null;
      payload.updated_at = new Date();

      const cols = Object.keys(payload);
      if (!cols.length) {
        await client.query('ROLLBACK');
        return fail(res, 'No valid fields to update', 400);
      }
      const setSql = cols.map((c, i) => `${quoteIdent(c)} = $${i + 1}`).join(',');
      const values = cols.map((c) => payload[c]);
      values.push(req.params.id);

      const { rows } = await client.query(
        `UPDATE ${tableIdent} SET ${setSql} WHERE ${quoteIdent(opts.pk)} = $${values.length} AND deleted_flag = false RETURNING *`,
        values
      );
      if (!rows.length) {
        await client.query('ROLLBACK');
        return fail(res, `${opts.table} not found`, 404);
      }
      if (opts.afterWrite) await opts.afterWrite(rows[0], true, client);
      await client.query('COMMIT');
      await recordAudit(opts.table, String(rows[0][opts.pk]), 'Update', req.user?.user_id || null, existingRows[0] || null, rows[0]);
      return ok(res, rows[0], `${opts.table} updated`);
    } catch (err: any) {
      await client.query('ROLLBACK');
      const status = err.statusCode || (err.code === '23505' ? 409 : err.code === '23503' ? 409 : 400);
      return fail(res, err.message || 'Update failed', status);
    } finally {
      client.release();
    }
  });

  // SOFT DELETE
  router.delete('/:id', writeGuard, async (req: Request, res: Response) => {
    try {
      const { rows: existingRows } = await pool.query(
        `SELECT * FROM ${tableIdent} WHERE ${quoteIdent(opts.pk)} = $1 AND deleted_flag = false`,
        [req.params.id]
      );
      const { rows } = await pool.query(
        `UPDATE ${tableIdent} SET deleted_flag = true, deleted_at = now(), updated_by = $2 WHERE ${quoteIdent(opts.pk)} = $1 AND deleted_flag = false RETURNING *`,
        [req.params.id, req.user?.user_id || null]
      );
      if (!rows.length) return fail(res, `${opts.table} not found`, 404);
      await recordAudit(opts.table, String(rows[0][opts.pk]), 'Delete', req.user?.user_id || null, existingRows[0] || null, null);
      return ok(res, rows[0], `${opts.table} deleted`);
    } catch (err: any) {
      return fail(res, err.message || 'Delete failed', 500);
    }
  });

  return router;
}

function toCsv(rows: any[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(
      headers
        .map((h) => {
          const v = row[h];
          if (v === null || v === undefined) return '';
          const s = typeof v === 'object' && v instanceof Date ? v.toISOString() : String(v);
          return `"${s.replace(/"/g, '""')}"`;
        })
        .join(',')
    );
  }
  return lines.join('\n');
}

export { schemaSpec };
