import fs from 'fs';
import path from 'path';

export interface ColumnSpec {
  name: string;
  type: string;
  pk: boolean;
  fk: string;
  nullable: boolean;
  label: string;
  desc: string;
}

export interface TableSpec {
  pk: string;
  phase: 'P1' | 'P2' | 'P3';
  module: string;
  columns: ColumnSpec[];
}

export interface SchemaSpec {
  tables: Record<string, TableSpec>;
  fks: { child_table: string; child_col: string; parent_table: string; parent_col: string }[];
}

const specPath = path.join(__dirname, '..', '..', '..', 'docs', 'extracted', 'schema_spec.json');

export const schemaSpec: SchemaSpec = JSON.parse(fs.readFileSync(specPath, 'utf-8'));

export const AUDIT_COLUMNS = ['created_by', 'created_at', 'updated_by', 'updated_at', 'deleted_flag', 'deleted_at'];

export function tableColumns(table: string): string[] {
  const spec = schemaSpec.tables[table];
  const cols = new Set<string>(spec.columns.map((c) => c.name));
  AUDIT_COLUMNS.forEach((c) => cols.add(c));
  return Array.from(cols);
}
