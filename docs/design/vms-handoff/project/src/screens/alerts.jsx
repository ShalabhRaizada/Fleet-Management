// Alerts — central inbox + rule configuration.

function AlertsScreen({ onNav }) {
  const V = window.VMS;
  const I = window.Icons;
  const [tab, setTab] = React.useState("Inbox");

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Alerts</h1>
          <div className="sub">Auto-generated alerts from compliance, PM, EPIC and tyre rules. Configure thresholds and delivery channels.</div>
        </div>
        <div className="row gap-8">
          <window.Button variant="ghost" icon={I.Settings}>Notification preferences</window.Button>
          <window.Button variant="primary" icon={I.Check}>Mark all read</window.Button>
        </div>
      </div>

      <div className="page-tabs">
        {["Inbox", "Rules", "Audit log"].map(t => (
          <div key={t} className={"page-tab " + (tab === t ? "active" : "")} onClick={() => setTab(t)}>
            {t}
            {t === "Inbox" && <span className="ct">{V.ALERTS_FEED.length}</span>}
            {t === "Rules" && <span className="ct">15</span>}
          </div>
        ))}
      </div>

      {tab === "Inbox" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>
          <window.Card flush>
            <window.Toolbar>
              <window.Filter label="Severity" value="All" />
              <window.Filter label="Type" value="All" />
              <window.Filter label="Status" value="Unread" />
              <div className="grow" />
              <window.Segmented value="List" onChange={() => {}} options={["List", "Grouped"]} />
            </window.Toolbar>
            <div className="col">
              {V.ALERTS_FEED.map(a => (
                <div key={a.id} style={{ display: "flex", gap: 12, padding: 14, borderBottom: "1px solid var(--divider)", cursor: "pointer" }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                    background: a.severity === "danger" ? "var(--danger-bg)" : a.severity === "warn" ? "var(--warn-bg)" : "var(--info-bg)",
                    color: a.severity === "danger" ? "var(--danger)" : a.severity === "warn" ? "var(--warn)" : "var(--info)",
                    display: "grid", placeItems: "center",
                  }}>
                    <I.AlertTriangle size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row" style={{ justifyContent: "space-between", marginBottom: 2 }}>
                      <div className="row gap-8">
                        <span style={{ fontWeight: 500 }}>{a.type}</span>
                        <window.Badge tone={a.severity === "danger" ? "danger" : a.severity === "warn" ? "warn" : "info"} outline>{a.severity}</window.Badge>
                      </div>
                      <span className="muted" style={{ fontSize: 12 }}>{a.time}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-2)" }}>{a.message}</div>
                    <div className="row gap-8" style={{ marginTop: 6 }}>
                      <span className="mono muted" style={{ fontSize: 11.5 }}>{a.target}</span>
                      <span className="muted" style={{ fontSize: 11 }}>·</span>
                      <span className="muted" style={{ fontSize: 11.5 }}>Sent: {a.channel}</span>
                    </div>
                  </div>
                  <window.IconButton icon={I.ChevronRight} />
                </div>
              ))}
            </div>
          </window.Card>

          <div className="col gap-16">
            <window.Card title="By severity">
              <div className="col gap-10">
                <SeverityBar tone="danger" label="Critical" count={V.ALERTS_FEED.filter(a => a.severity === "danger").length} total={V.ALERTS_FEED.length} />
                <SeverityBar tone="warn" label="Warning" count={V.ALERTS_FEED.filter(a => a.severity === "warn").length} total={V.ALERTS_FEED.length} />
                <SeverityBar tone="info" label="Info" count={V.ALERTS_FEED.filter(a => a.severity === "info").length} total={V.ALERTS_FEED.length} />
              </div>
            </window.Card>

            <window.Card title="By type">
              <div className="col gap-8" style={{ fontSize: 13 }}>
                {[
                  ["PESO Expiry", 1],
                  ["PM Overdue", 2],
                  ["Battery Warranty", 1],
                  ["Non-Working", 1],
                  ["PUC Expired", 1],
                  ["Insurance Expiry", 1],
                  ["Tyre CPK Breach", 1],
                  ["Challan Unpaid", 1],
                ].map(([type, count]) => (
                  <div key={type} className="row" style={{ justifyContent: "space-between", padding: "4px 0" }}>
                    <span>{type}</span>
                    <span className="muted tnum">{count}</span>
                  </div>
                ))}
              </div>
            </window.Card>
          </div>
        </div>
      )}

      {tab === "Rules" && (
        <window.Card flush>
          <table className="tbl">
            <thead>
              <tr>
                <th>Alert rule</th><th>Trigger</th><th>Channels</th><th>Recipients</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["PM Due Reminder", "7d / 500 km before due", "In-app + Email + SMS", "Maintenance Manager"],
                ["PM Overdue Escalation", "2 days past due", "In-app + Email", "Fleet Manager"],
                ["Insurance Expiry", "30d, 7d before", "In-app + Email", "Compliance Officer"],
                ["Fitness Certificate Expiry", "30d, 7d before", "In-app + Email", "Compliance Officer"],
                ["Permit Expiry", "30d, 7d before", "In-app + Email", "Compliance Officer"],
                ["PESO Certificate Expiry", "60d, 30d, 7d before", "In-app + Email + SMS", "Compliance Officer"],
                ["Piping Certificate Expiry", "60d, 30d, 7d before", "In-app + Email + SMS", "Compliance Officer"],
                ["PUC Certificate Expiry", "30d, 7d before", "In-app + Email", "Compliance Officer"],
                ["Non-Working Critical", "Critical > 4 hrs unassigned", "In-app + SMS", "Fleet Manager"],
                ["Non-Working past ETA", "Past expected resolution", "In-app + Email", "Fleet Manager"],
                ["Account Lockout", "5 failed login attempts", "In-app", "System Administrator"],
                ["Vendor Contract Expiry", "30d before", "In-app + Email", "Fleet Manager"],
                ["Tyre CPK Threshold Breach", "Actual > budget by 20%", "In-app", "Fleet Manager"],
                ["Battery Warranty Expiry", "30d before", "In-app + Email", "Maintenance Manager"],
                ["Challan Unpaid", "30d past challan date", "In-app + Email", "Accounts Executive"],
              ].map(([rule, trig, ch, rec]) => (
                <tr key={rule}>
                  <td><div style={{ fontWeight: 500 }}>{rule}</div></td>
                  <td>{trig}</td>
                  <td>{ch}</td>
                  <td>{rec}</td>
                  <td><window.Badge tone="success" dot>Enabled</window.Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </window.Card>
      )}

      {tab === "Audit log" && (
        <window.Card flush>
          <window.Toolbar>
            <window.Filter label="User" value="All" />
            <window.Filter label="Module" value="All" />
            <window.Filter label="Action" value="All" />
            <window.Filter label="Date" value="Last 7 days" />
            <div className="grow" />
            <window.Button size="sm" variant="ghost" icon={I.Download}>Export</window.Button>
          </window.Toolbar>
          <table className="tbl">
            <thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Module</th><th>Target</th><th>IP</th></tr></thead>
            <tbody>
              <tr><td className="mono">2026-05-19 09:42:11</td><td>Anika Mehta</td><td>UPDATE</td><td>Workbench</td><td className="mono">JOB-1042 status → In Progress</td><td className="mono secondary">10.42.18.5</td></tr>
              <tr><td className="mono">2026-05-19 09:14:02</td><td>Anika Mehta</td><td>CREATE</td><td>Workbench</td><td className="mono">JOB-1048</td><td className="mono secondary">10.42.18.5</td></tr>
              <tr><td className="mono">2026-05-19 08:42:11</td><td>Anika Mehta</td><td>LOGIN</td><td>Auth</td><td className="mono">—</td><td className="mono secondary">10.42.18.5</td></tr>
              <tr><td className="mono">2026-05-19 08:14:08</td><td>K. Joshi</td><td>CREATE</td><td>Coupling</td><td className="mono">CPL-0211</td><td className="mono secondary">10.42.18.18</td></tr>
              <tr><td className="mono">2026-05-19 07:15:33</td><td>Rohit Sharma</td><td>LOGIN</td><td>Auth</td><td className="mono">—</td><td className="mono secondary">10.42.18.7</td></tr>
              <tr><td className="mono">2026-05-19 06:12:01</td><td>Rohit Sharma</td><td>UPLOAD</td><td>Operations</td><td className="mono">vehicle_status_19may2026_062.xlsx</td><td className="mono secondary">10.42.18.7</td></tr>
              <tr><td className="mono">2026-05-18 19:22:14</td><td>K. Joshi</td><td>UPDATE</td><td>Tyres</td><td className="mono">TYR-2050 → In Repair</td><td className="mono secondary">10.42.18.18</td></tr>
              <tr><td className="mono">2026-05-18 14:33:47</td><td>Priya Nair</td><td>UPLOAD</td><td>Compliance</td><td className="mono">INS/TRK-0008 renewal</td><td className="mono secondary">10.42.18.21</td></tr>
            </tbody>
          </table>
        </window.Card>
      )}
    </div>
  );
}

function SeverityBar({ tone, label, count, total }) {
  const pct = (count / total) * 100;
  const color = tone === "danger" ? "var(--danger)" : tone === "warn" ? "var(--warn)" : "var(--info)";
  return (
    <div>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
        <span className="tnum" style={{ fontSize: 13, fontWeight: 500 }}>{count}</span>
      </div>
      <div style={{ height: 6, background: "var(--surface-3)", borderRadius: 999 }}>
        <div style={{ height: "100%", width: pct + "%", background: color, borderRadius: 999 }} />
      </div>
    </div>
  );
}

window.AlertsScreen = AlertsScreen;
