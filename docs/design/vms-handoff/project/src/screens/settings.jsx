// Schedule Templates — PM templates (Schedule Master).

function SettingsScreen({ onNav }) {
  const V = window.VMS;
  const I = window.Icons;
  const [selected, setSelected] = React.useState(null);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Schedule Templates</h1>
          <div className="sub">Standard preventive-maintenance templates. Each onboarded vehicle auto-inherits applicable templates based on type and fuel.</div>
        </div>
        <div className="row gap-8">
          <window.Button variant="ghost" icon={I.Download}>Export</window.Button>
          <window.Button variant="primary" icon={I.Plus}>New template</window.Button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        <window.Card flush>
          <window.Toolbar>
            <window.Filter label="Applies to" value="All" />
            <window.Filter label="Category" value="All" />
            <window.Filter label="Trigger" value="All" />
            <div className="grow" />
            <window.Segmented value="Templates" onChange={() => {}} options={["Templates", "Checklists"]} />
          </window.Toolbar>
          <table className="tbl">
            <thead>
              <tr>
                <th>Template</th><th>Applies to</th><th>Trigger</th><th>Interval</th>
                <th>Category</th><th className="num">Items</th><th className="num">Est. cost</th>
              </tr>
            </thead>
            <tbody>
              {V.SCHEDULE_TEMPLATES.map(t => (
                <tr key={t.code} className={"clickable " + (selected?.code === t.code ? "" : "")} onClick={() => setSelected(t)} style={{ background: selected?.code === t.code ? "var(--brand-blue-50)" : undefined }}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{t.name}</div>
                    <div className="secondary mono">{t.code}</div>
                  </td>
                  <td>{t.appliesTo}</td>
                  <td>{t.trigger}</td>
                  <td className="mono">{t.interval}</td>
                  <td><window.Badge outline>{t.category}</window.Badge></td>
                  <td className="num tnum">{t.items}</td>
                  <td className="num tnum">{V.fmtINR(t.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </window.Card>

        <window.Card title="Template details" sub={selected ? selected.name : "Select a template to preview"}>
          {selected ? (
            <div className="col gap-16">
              <div className="field-row cols-2">
                <Stat label="Code" value={selected.code} mono />
                <Stat label="Applies to" value={selected.appliesTo} />
                <Stat label="Trigger basis" value={selected.trigger} />
                <Stat label="Interval" value={selected.interval} />
                <Stat label="Estimated duration" value={selected.duration} />
                <Stat label="Estimated cost" value={V.fmtINR(selected.cost)} />
                <Stat label="Default vendor category" value={selected.category} />
                <Stat label="Auto-assign vendor" value="Disabled" />
              </div>

              <div>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Checklist items ({selected.items})</div>
                <div className="col gap-8" style={{ maxHeight: 240, overflowY: "auto" }}>
                  {[
                    "Engine oil & filter change",
                    "Air filter inspection",
                    "Coolant top-up",
                    "Brake fluid level",
                    "Clutch free-play adjustment",
                    "Battery terminals — clean & grease",
                    "Tyre pressure all positions",
                    "Wheel nuts torque check",
                    "Lights, indicators, horn",
                    "Wipers & washers",
                    "Mirror alignment",
                    "Underbody inspection",
                  ].slice(0, Math.min(selected.items, 12)).map((c, i) => (
                    <div key={i} className="row gap-8" style={{ padding: "6px 8px", background: "var(--surface-2)", borderRadius: 6, fontSize: 12.5 }}>
                      <I.Check size={14} style={{ color: "var(--success)" }} />
                      <span>{c}</span>
                    </div>
                  ))}
                  {selected.items > 12 && <div className="muted" style={{ fontSize: 12, paddingLeft: 8 }}>… + {selected.items - 12} more items</div>}
                </div>
              </div>

              <div className="row gap-8">
                <window.Button variant="primary" icon={I.Edit}>Edit template</window.Button>
                <window.Button variant="ghost" icon={I.Layers}>Duplicate</window.Button>
              </div>
            </div>
          ) : (
            <window.EmptyState icon={I.Layers} title="No template selected">
              Click a row to preview its details.
            </window.EmptyState>
          )}
        </window.Card>
      </div>

      <div style={{ marginTop: 16 }}>
        <window.Card title="Auto-assignment rules" sub="How VMS picks a default vendor when a PM event triggers">
          <table className="tbl">
            <thead><tr><th>If template category</th><th>Then suggest</th><th>Fallback</th><th>Override</th></tr></thead>
            <tbody>
              <tr><td>Engine</td><td>Sterling Auto Services (rating ≥ 4.5)</td><td>Chennai Brake Systems</td><td>Manual</td></tr>
              <tr><td>Tyre</td><td>Bajaj Tyre House (nearest depot)</td><td>—</td><td>Auto</td></tr>
              <tr><td>LNG/CNG</td><td>GreenGas LNG Certifiers</td><td>—</td><td>Manual</td></tr>
              <tr><td>Body</td><td>Patil Industrial Works</td><td>Sterling Auto Services</td><td>Manual</td></tr>
              <tr><td>General</td><td>Best-rated vendor at depot</td><td>—</td><td>Auto</td></tr>
            </tbody>
          </table>
        </window.Card>
      </div>
    </div>
  );
}

function Stat({ label, value, mono }) {
  return (
    <div>
      <div className="muted" style={{ fontSize: 11.5 }}>{label}</div>
      <div style={{ fontWeight: 500, fontFamily: mono ? "var(--font-mono)" : "inherit", marginTop: 2 }}>{value}</div>
    </div>
  );
}

window.SettingsScreen = SettingsScreen;
