#!/usr/bin/env python3
"""Generate node-pg-migrate JS migration files from docs/extracted/schema_spec.json"""
import json, re

SPEC_PATH = "docs/extracted/schema_spec.json"
OUT_DIR = "backend/migrations"

TYPE_MAP_SIMPLE = {
    'uniqueidentifier': 'uuid',
    'datetime2': 'timestamptz',
    'bit': 'boolean',
    'nvarchar(max)': 'text',
    'int': 'integer',
    'smallint': 'smallint',
    'date': 'date',
}

def map_type(t):
    if t in TYPE_MAP_SIMPLE:
        return TYPE_MAP_SIMPLE[t]
    m = re.match(r'decimal\((\d+),(\d+)\)', t)
    if m:
        return f'numeric({m.group(1)},{m.group(2)})'
    m = re.match(r'varchar\((\d+)\)', t)
    if m:
        return f'varchar({m.group(1)})'
    raise ValueError(f"unmapped type {t}")

AUDIT_COLS = ['created_by', 'created_at', 'updated_by', 'updated_at', 'deleted_flag', 'deleted_at']

# pure lookup/reference tables: skip audit columns (keep schema lean) but still fine to add; we add audit cols to ALL tables for consistency per spec.
SKIP_AUDIT = set()  # add audit columns everywhere

def js_str(s):
    return json.dumps(s)

def gen_table_js(table_name, info, fk_map):
    cols = info['columns']
    pk_col = info['pk']
    lines = []
    lines.append(f"  pgm.createTable({js_str(table_name)}, {{")
    for c in cols:
        cname = c['name']
        ctype = map_type(c['type'])
        notnull = (not c['nullable']) and not c['pk']
        opts = [f"type: {js_str(ctype)}"]
        if c['pk']:
            opts.append("primaryKey: true")
            if ctype == 'uuid':
                opts.append("default: pgm.func('gen_random_uuid()')")
        else:
            if notnull:
                opts.append("notNull: true")
        lines.append(f"    {cname}: {{ {', '.join(opts)} }},")
    if table_name not in SKIP_AUDIT:
        lines.append("    created_by: { type: 'uuid' },")
        lines.append("    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },")
        lines.append("    updated_by: { type: 'uuid' },")
        lines.append("    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },")
        lines.append("    deleted_flag: { type: 'boolean', notNull: true, default: false },")
        lines.append("    deleted_at: { type: 'timestamptz' },")
    lines.append("  });")
    return "\n".join(lines)

def main():
    spec = json.load(open(SPEC_PATH))
    tables = spec['tables']
    fks = spec['fks']

    # order tables: those with no FK dependency on each other go first; do simple topological-ish ordering.
    fk_by_child = {}
    for fk in fks:
        fk_by_child.setdefault(fk['child_table'], []).append(fk)

    all_names = list(tables.keys())
    resolved = []
    resolved_set = set()
    remaining = set(all_names)
    # iterative topo sort, break cycles by just appending
    guard = 0
    while remaining and guard < 200:
        guard += 1
        progressed = False
        for t in list(remaining):
            deps = [fk['parent_table'] for fk in fk_by_child.get(t, []) if fk['parent_table'] != t]
            if all(d in resolved_set or d not in tables for d in deps):
                resolved.append(t)
                resolved_set.add(t)
                remaining.discard(t)
                progressed = True
        if not progressed:
            # cycle or missing; just dump remaining in original order
            for t in list(remaining):
                resolved.append(t)
                resolved_set.add(t)
                remaining.discard(t)
            break

    ts = "1700000000000"
    fname = f"{OUT_DIR}/{ts}_create-core-schema.js"
    out = []
    out.append("/* Auto-generated from docs/extracted/schema_spec.json - DO NOT hand edit column list without regenerating */")
    out.append("exports.shorthands = undefined;")
    out.append("")
    out.append("exports.up = (pgm) => {")
    out.append("  pgm.createExtension('pgcrypto', { ifNotExists: true });")
    for t in resolved:
        out.append(gen_table_js(t, tables[t], fk_by_child))
        out.append("")
    # add FKs as separate ALTER TABLE statements (after all tables exist) to avoid ordering issues
    out.append("  // Foreign keys")
    seen_fk = set()
    for fk in fks:
        child, ccol, parent, pcol = fk['child_table'], fk['child_col'], fk['parent_table'], fk['parent_col']
        if child not in tables or parent not in tables:
            continue
        key = (child, ccol, parent, pcol)
        if key in seen_fk:
            continue
        seen_fk.add(key)
        constraint_name = f"fk_{child}_{ccol}"[:60]
        out.append(f"  pgm.addConstraint({js_str(child)}, {js_str(constraint_name)}, {{")
        out.append(f"    foreignKeys: {{ columns: {js_str(ccol)}, references: {js_str(parent + '(' + pcol + ')')} }},")
        out.append("  });")
    out.append("};")
    out.append("")
    out.append("exports.down = (pgm) => {")
    for t in reversed(resolved):
        out.append(f"  pgm.dropTable({js_str(t)}, {{ cascade: true }});")
    out.append("};")

    with open(fname, 'w') as f:
        f.write("\n".join(out) + "\n")
    print("Wrote", fname)
    print("Table order:", resolved)

if __name__ == '__main__':
    main()
