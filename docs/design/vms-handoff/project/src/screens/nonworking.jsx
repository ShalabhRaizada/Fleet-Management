// Non-Working Vehicles + EPIC 1.0 integration

function NonWorkingScreen({ onNav }) {
  const V = window.VMS;
  const I = window.Icons;
  const [selected, setSelected] = React.useState(null);
  const [showEpic, setShowEpic] = React.useState(false);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Non-Working Vehicles</h1>
          <div className="sub">Issue register, remedial actions, vendor assignment. EPIC 1.0 status reports surface new non-working vehicles automatically.</div>
        </div>
        <div className="row gap-8">
          <window.Button variant="ghost" icon={I.Download}>Export register</window.Button>
          <window.Button variant="ghost" icon={I.Upload} onClick={() => setShowEpic(true)}>EPIC 1.0 upload</window.Button>
          <window.Button variant="primary" icon={I.Plus}>Log new issue</window.Button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ padding: 14, borderLeft: "3px solid var(--danger)" }}>
          <div className="muted" style={{ fontSize: 12 }}>Critical · open</div>
          <div style={{ fontSize: 24, fontWeight: 600 }}>1</div>
          <div className="muted" style={{ fontSize: 11.5 }}>Avg 3.2 days to resolve</div>
        </div>
        <div className="card" style={{ padding: 14, borderLeft: "3px solid var(--warn)" }}>
          <div className="muted" style={{ fontSize: 12 }}>Major · open</div>
          <div style={{ fontSize: 24, fontWeight: 600 }}>1</div>
          <div className="muted" style={{ fontSize: 11.5 }}>1 escalated to Fleet Manager</div>
        </div>
        <div className="card" style={{ padding: 14, borderLeft: "3px solid var(--info)" }}>
          <div className="muted" style={{ fontSize: 12 }}>In progress</div>
          <div style={{ fontSize: 24, fontWeight: 600 }}>1</div>
          <div className="muted" style={{ fontSize: 11.5 }}>Sterling Auto · est. 21 May</div>
        </div>
        <div className="card" style={{ padding: 14, borderLeft: "3px solid var(--success)" }}>
          <div className="muted" style={{ fontSize: 12 }}>Resolved (30d)</div>
          <div style={{ fontSize: 24, fontWeight: 600 }}>8</div>
          <div className="muted" style={{ fontSize: 11.5 }}>Avg cost ₹14,200/issue</div>
        </div>
      </div>

      {/* EPIC summary */}
      <div className="card" style={{ padding: 14, marginBottom: 16, background: "var(--brand-blue-50)", border: "1px solid var(--info-border)" }}>
        <div className="row gap-12">
          <div style={{ width: 40, height: 40, borderRadius: 8, background: "white", color: "var(--brand-blue)", display: "grid", placeItems: "center" }}>
            <I.Database size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500 }}>Last EPIC 1.0 upload · today at 06:12 IST</div>
            <div className="muted" style={{ fontSize: 12.5 }}>
              <span>file: <span className="mono">vehicle_status_19may2026_062.xlsx</span></span> ·
              <span> by Rohit Sharma</span> ·
              <span> <b style={{ color: "var(--text)" }}>8 records</b> matched · <b style={{ color: "var(--success)" }}>6</b> active · <b style={{ color: "var(--danger)" }}>2</b> newly non-working</span>
            </div>
          </div>
          <window.Button size="sm" variant="ghost">View reconciliation</window.Button>
          <window.Button size="sm" onClick={() => setShowEpic(true)}>New upload</window.Button>
        </div>
      </div>

      <window.Card flush>
        <window.Toolbar>
          <window.Filter label="Severity" value="All" />
          <window.Filter label="Category" value="All" />
          <window.Filter label="Status" value="Open + In Progress" />
          <div className="grow" />
          <window.Segmented value="Active" onChange={() => {}} options={["Active", "All", "Resolved"]} />
        </window.Toolbar>
        <table className="tbl">
          <thead>
            <tr>
              <th>Issue ID</th><th>Vehicle</th><th>Category</th><th>Severity</th>
              <th>Description</th><th>Reported</th><th>Vendor</th><th>Expected fix</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {V.ISSUES.map(i => {
              const daysSince = V.daysFromNow(i.date);
              return (
                <tr key={i.id} className="clickable" onClick={() => setSelected(i)}>
                  <td className="mono">{i.id}</td>
                  <td>
                    <div className="mono" style={{ fontWeight: 500 }}>{i.reg}</div>
                    <div className="secondary">{i.truckCode || "—"}</div>
                  </td>
                  <td><window.Badge outline>{i.category}</window.Badge></td>
                  <td>
                    {i.severity === "Critical" ? <window.Badge tone="danger" dot>{i.severity}</window.Badge> :
                      i.severity === "Major" ? <window.Badge tone="warn" dot>{i.severity}</window.Badge> :
                      <window.Badge tone="neutral" dot>{i.severity}</window.Badge>}
                  </td>
                  <td className="elide" style={{ maxWidth: 280 }}>{i.description}</td>
                  <td>
                    <div>{V.fmtDate(i.date)}</div>
                    <div className="secondary">{Math.abs(daysSince)}d ago · {i.reportedBy}</div>
                  </td>
                  <td>{i.vendor || <span className="muted">Unassigned</span>}</td>
                  <td>{i.expectedFix ? V.fmtDate(i.expectedFix) : <span className="muted">—</span>}</td>
                  <td><window.StatusBadge value={i.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </window.Card>

      {selected && <IssueDetail issue={selected} onClose={() => setSelected(null)} />}
      {showEpic && <EpicUploadModal onClose={() => setShowEpic(false)} />}
    </div>
  );
}

function IssueDetail({ issue, onClose }) {
  const V = window.VMS;
  const I = window.Icons;
  return (
    <window.Drawer onClose={onClose} width={860}>
      <div className="dh">
        <div className="row gap-12">
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: issue.severity === "Critical" ? "var(--danger-bg)" : issue.severity === "Major" ? "var(--warn-bg)" : "var(--surface-3)",
            color: issue.severity === "Critical" ? "var(--danger)" : issue.severity === "Major" ? "var(--warn)" : "var(--text-3)",
            display: "grid", placeItems: "center",
          }}>
            <I.AlertTriangle size={22} />
          </div>
          <div>
            <h2>{issue.id}</h2>
            <div className="meta"><span className="mono">{issue.reg}</span> · {issue.category} · Reported {V.fmtDate(issue.date)}</div>
          </div>
        </div>
        <div className="row gap-8" style={{ marginLeft: "auto" }}>
          {issue.severity === "Critical" ? <window.Badge tone="danger" dot>{issue.severity}</window.Badge> :
            issue.severity === "Major" ? <window.Badge tone="warn" dot>{issue.severity}</window.Badge> :
            <window.Badge tone="neutral" dot>{issue.severity}</window.Badge>}
          <window.StatusBadge value={issue.status} />
          <window.IconButton icon={I.X} onClick={onClose} />
        </div>
      </div>
      <div className="db" style={{ padding: 24 }}>
        <div className="col gap-16">
          <window.Card title="Issue description">
            <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>{issue.description}</div>
            <div className="divider" />
            <div>
              <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Suggested remedial action</div>
              <div style={{ padding: 12, background: "var(--surface-2)", borderRadius: 8, fontSize: 13, lineHeight: 1.5 }}>{issue.action}</div>
            </div>
          </window.Card>

          <window.Card title="Assignment & resolution">
            <div className="field-row cols-3">
              <Stat label="Assigned to vendor" value={issue.vendor || "—"} />
              <Stat label="Assignment date" value={issue.assigned ? V.fmtDate(issue.assigned) : "—"} />
              <Stat label="Expected resolution" value={V.fmtDate(issue.expectedFix)} />
              <Stat label="Repair cost (est.)" value="₹18,500" />
              <Stat label="Repair cost (actual)" value={issue.status === "Resolved" ? "₹16,800" : "Pending"} />
              <Stat label="Reported by" value={issue.reportedBy} />
            </div>
            {!issue.vendor && (
              <div style={{ marginTop: 12 }}>
                <window.Button variant="primary" icon={I.Send}>Assign vendor & dispatch</window.Button>
              </div>
            )}
          </window.Card>

          <window.Card title="Timeline">
            <div className="timeline">
              <div className="ev">
                <div className="when">{V.fmtDate(issue.date)}</div>
                <div className="what"><b>{issue.reportedBy}</b> reported issue · {issue.severity} severity</div>
              </div>
              {issue.assigned && (
                <div className="ev">
                  <div className="when">{V.fmtDate(issue.assigned)}</div>
                  <div className="what"><b>Anika Mehta</b> assigned to <b>{issue.vendor}</b></div>
                </div>
              )}
              {issue.status === "In Progress" && (
                <div className="ev">
                  <div className="when">2 days ago</div>
                  <div className="what"><b>{issue.vendor}</b> confirmed receipt; vehicle towed to workshop</div>
                </div>
              )}
              {issue.status === "Escalated" && (
                <div className="ev">
                  <div className="when">Yesterday</div>
                  <div className="what" style={{ color: "var(--danger)" }}>System auto-escalated — past expected resolution date</div>
                </div>
              )}
              {issue.status === "Resolved" && (
                <div className="ev">
                  <div className="when">3 days ago</div>
                  <div className="what" style={{ color: "var(--success)" }}><b>{issue.vendor}</b> marked issue resolved; vehicle returned to depot</div>
                </div>
              )}
            </div>
          </window.Card>
        </div>
      </div>
    </window.Drawer>
  );
}

function EpicUploadModal({ onClose }) {
  const I = window.Icons;
  return (
    <window.Modal onClose={onClose} width={720}>
      <div className="mh">
        <h3>EPIC 1.0 Vehicle Status Report — upload</h3>
        <div style={{ marginLeft: "auto" }}><window.IconButton icon={I.X} onClick={onClose} /></div>
      </div>
      <div className="mb">
        <div className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
          Upload an Excel or CSV export from EPIC 1.0. Records will be matched to vehicles by Registration Number. Non-working flags will create issue records automatically.
        </div>
        <window.Drop filled fileName="vehicle_status_19may2026_062.xlsx" />
        <div className="divider" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <Stat label="Records" value="8" />
          <Stat label="Matched" value="8" />
          <Stat label="Active" value="6" />
          <Stat label="Newly non-working" value="2 ▴" />
        </div>
        <div className="divider" />
        <div style={{ maxHeight: 240, overflowY: "auto", border: "1px solid var(--border)", borderRadius: 8 }}>
          <table className="tbl">
            <thead>
              <tr><th>Reg #</th><th>EPIC status</th><th>VMS match</th><th>Diff</th></tr>
            </thead>
            <tbody>
              <tr><td className="mono">MH04 EQ 8821</td><td>Active</td><td><window.Badge tone="success" outline>Active</window.Badge></td><td className="muted">—</td></tr>
              <tr><td className="mono">MH04 EQ 8823</td><td>Active</td><td><window.Badge tone="success" outline>Active</window.Badge></td><td className="muted">—</td></tr>
              <tr><td className="mono">KA03 MN 4419</td><td>Active</td><td><window.Badge tone="success" outline>Active</window.Badge></td><td className="muted">—</td></tr>
              <tr><td className="mono">TN10 BB 1102</td><td>Active</td><td><window.Badge tone="success" outline>Active</window.Badge></td><td className="muted">—</td></tr>
              <tr style={{ background: "var(--danger-bg)" }}><td className="mono">MH12 AC 3344</td><td><b>Non-Working</b></td><td><window.Badge tone="success" outline>Active</window.Badge></td><td style={{ color: "var(--danger)", fontWeight: 500 }}>NEW NW</td></tr>
              <tr><td className="mono">MH14 DA 7702</td><td>Active</td><td><window.Badge tone="success" outline>Active</window.Badge></td><td className="muted">—</td></tr>
              <tr><td className="mono">GJ05 KK 9001</td><td>Active</td><td><window.Badge tone="success" outline>Active</window.Badge></td><td className="muted">—</td></tr>
              <tr style={{ background: "var(--danger-bg)" }}><td className="mono">KA51 AC 6610</td><td><b>Non-Working</b></td><td><window.Badge tone="success" outline>Active</window.Badge></td><td style={{ color: "var(--danger)", fontWeight: 500 }}>NEW NW</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="mf">
        <window.Button onClick={onClose}>Cancel</window.Button>
        <window.Button variant="primary" icon={I.Check} onClick={onClose}>Apply changes &amp; create issues</window.Button>
      </div>
    </window.Modal>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="muted" style={{ fontSize: 12 }}>{label}</div>
      <div style={{ fontWeight: 500, marginTop: 2 }}>{value}</div>
    </div>
  );
}

window.NonWorkingScreen = NonWorkingScreen;
