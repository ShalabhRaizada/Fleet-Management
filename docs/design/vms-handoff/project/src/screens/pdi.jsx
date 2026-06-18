// PDI & Handover — list of PDI records, detail view of one PDI.

function PdiScreen({ onNav }) {
  const V = window.VMS;
  const I = window.Icons;
  const [tab, setTab] = React.useState("All");
  const [selected, setSelected] = React.useState(null);

  const records = [
    { id: "PDI-2026-0048", vehicle: "MH04 EQ 8825", vCode: "TRK-0019", type: "New Vehicle", date: "2026-05-19", odo: 18, inspector: "K. Joshi", approver: "Rohit Sharma", driver: "B. Yadav", result: "Pending" },
    { id: "PDI-2026-0044", vehicle: "GJ05 KK 9001", vCode: "TRK-0017", type: "Periodic", date: "2026-05-18", odo: 22150, inspector: "K. Joshi", approver: "Rohit Sharma", driver: "R. Patel", result: "Pass" },
    { id: "PDI-2026-0042", vehicle: "MH04 EQ 8821", vCode: "TRK-0008", type: "Post-Major Repair", date: "2026-04-28", odo: 141200, inspector: "K. Joshi", approver: "Rohit Sharma", driver: "K. Joshi", result: "Pass" },
    { id: "PDI-2026-0039", vehicle: "TN10 BB 1102", vCode: "TRK-0013", type: "Post-Major Repair", date: "2026-04-15", odo: 192000, inspector: "A. Subramaniam", approver: "Rohit Sharma", driver: "A. Subramaniam", result: "Conditional Pass" },
    { id: "PDI-2026-0037", vehicle: "KA03 MN 4419", vCode: "TRK-0011", type: "Periodic", date: "2026-04-08", odo: 38400, inspector: "P. Karthik", approver: "Rohit Sharma", driver: "P. Karthik", result: "Pass" },
    { id: "PDI-2026-0033", vehicle: "MH14 DA 7702", vCode: "TRK-0015", type: "Periodic", date: "2026-03-22", odo: 155000, inspector: "K. Joshi", approver: "Rohit Sharma", driver: "B. Yadav", result: "Fail" },
  ];

  const counts = {
    All: records.length,
    Pending: records.filter(r => r.result === "Pending").length,
    "New Vehicle": records.filter(r => r.type === "New Vehicle").length,
    "Post-Major Repair": records.filter(r => r.type === "Post-Major Repair").length,
    Periodic: records.filter(r => r.type === "Periodic").length,
  };
  const filtered = tab === "All" ? records : records.filter(r => r.result === tab || r.type === tab);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>PDI &amp; Handover</h1>
          <div className="sub">Pre-Delivery Inspections — new vehicle, post-repair and periodic. All records digitally signed and archived.</div>
        </div>
        <div className="row gap-8">
          <window.Button variant="ghost" icon={I.Download}>Export</window.Button>
          <window.Button variant="primary" icon={I.Plus}>New PDI</window.Button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
        <window.KPI label="Done this month" value="11" icon={I.Clipboard} trend="9 Pass, 1 Conditional, 1 Fail" />
        <window.KPI label="Pending approval" value="2" icon={I.Clock} trend="Avg approval TAT 1.4h" />
        <window.KPI label="Pass rate (90d)" value="92%" icon={I.CheckCircle} trend="vs 88% prev quarter" trendDir="up" />
        <window.KPI label="Avg items per PDI" value="74" icon={I.Layers} trend="+8 for LNG tankers" />
      </div>

      <div className="page-tabs">
        {Object.keys(counts).map(t => (
          <div key={t} className={"page-tab " + (tab === t ? "active" : "")} onClick={() => setTab(t)}>
            {t}<span className="ct">{counts[t]}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <window.Toolbar>
          <window.Filter label="Type" value="All" />
          <window.Filter label="Result" value="All" />
          <window.Filter label="Inspector" value="All" />
          <div className="grow" />
          <window.Segmented value="Table" onChange={() => {}} options={["Table", "Cards"]} />
        </window.Toolbar>
        <table className="tbl">
          <thead>
            <tr>
              <th>PDI ID</th><th>Vehicle</th><th>Type</th><th>Date</th>
              <th className="num">Odo</th><th>Inspector</th><th>Approver</th><th>Driver</th><th>Result</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="clickable" onClick={() => setSelected(r)}>
                <td className="mono">{r.id}</td>
                <td>
                  <div className="mono" style={{ fontWeight: 500 }}>{r.vehicle}</div>
                  <div className="secondary">{r.vCode}</div>
                </td>
                <td><window.Badge outline>{r.type}</window.Badge></td>
                <td>{V.fmtDate(r.date)}</td>
                <td className="num tnum">{r.odo.toLocaleString("en-IN")}</td>
                <td>{r.inspector}</td>
                <td>{r.approver}</td>
                <td>{r.driver}</td>
                <td>
                  {r.result === "Pending" ? <window.Badge tone="warn" dot>{r.result}</window.Badge> :
                    r.result === "Pass" ? <window.Badge tone="success" dot>{r.result}</window.Badge> :
                    r.result === "Fail" ? <window.Badge tone="danger" dot>{r.result}</window.Badge> :
                    <window.Badge tone="warn" dot>{r.result}</window.Badge>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && <PdiDetail record={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function PdiDetail({ record, onClose }) {
  const V = window.VMS;
  const I = window.Icons;
  const sections = [
    { name: "Engine & Drivetrain", items: 5, ok: 5 },
    { name: "Brakes", items: 5, ok: 5 },
    { name: "Tyres & Wheels", items: 5, ok: 4, nok: 1 },
    { name: "Electrical", items: 6, ok: 6 },
    { name: "Body & Chassis", items: 4, ok: 4 },
    { name: "Safety Equipment", items: 5, ok: 5 },
    { name: "Documents on Board", items: 5, ok: 5 },
    { name: "GPS / Telematics", items: 3, ok: 3 },
    { name: "LNG / CNG System", items: 6, ok: 6 },
    { name: "Overall Cleanliness", items: 3, ok: 3 },
  ];
  return (
    <window.Drawer onClose={onClose} width={920}>
      <div className="dh">
        <div>
          <h2>{record.id}</h2>
          <div className="meta"><span className="mono">{record.vehicle}</span> · {record.type} · {V.fmtDate(record.date)}</div>
        </div>
        <div className="row gap-8" style={{ marginLeft: "auto" }}>
          <window.Button size="sm" variant="ghost" icon={I.Download}>Download PDF</window.Button>
          <window.IconButton icon={I.X} onClick={onClose} />
        </div>
      </div>
      <div className="db" style={{ padding: 24 }}>
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <div className="row gap-24" style={{ alignItems: "flex-start" }}>
            <Stat label="PDI Type" value={record.type} />
            <Stat label="Odometer" value={record.odo.toLocaleString("en-IN") + " km"} />
            <Stat label="Inspected by" value={record.inspector} />
            <Stat label="Approved by" value={record.approver} />
            <Stat label="Handover to" value={record.driver} />
            <div style={{ borderLeft: "1px solid var(--divider)", paddingLeft: 16 }}>
              <div className="muted" style={{ fontSize: 12 }}>Overall result</div>
              {record.result === "Pass" ? <window.Badge tone="success" dot>{record.result}</window.Badge> :
                record.result === "Fail" ? <window.Badge tone="danger" dot>{record.result}</window.Badge> :
                <window.Badge tone="warn" dot>{record.result}</window.Badge>}
            </div>
          </div>
        </div>

        <window.Card title="Checklist sections" sub={`${sections.reduce((s, c) => s + c.items, 0)} items inspected`}>
          <div className="col">
            {sections.map((s, i) => {
              const nokCount = s.nok || 0;
              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 180px 100px", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--divider)", alignItems: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div>
                  <div>
                    <window.Progress value={s.ok} max={s.items} tone={nokCount ? "warn" : "success"} />
                    <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>{s.ok} OK{nokCount ? ` · ${nokCount} Not OK` : ""} of {s.items}</div>
                  </div>
                  <div>{nokCount ? <window.Badge tone="warn">Review</window.Badge> : <window.Badge tone="success">✓</window.Badge>}</div>
                </div>
              );
            })}
          </div>
        </window.Card>

        <div style={{ marginTop: 16 }}>
          <window.Card title="Sign-offs">
            <div className="field-row cols-3">
              <SignDisplay role="Inspected by" name={record.inspector} when="19 May 2026, 11:08" />
              <SignDisplay role="Approved by" name={record.approver} when="19 May 2026, 12:42" />
              <SignDisplay role="Handover received" name={record.driver} when={record.result === "Pending" ? null : "19 May 2026, 14:32"} />
            </div>
          </window.Card>
        </div>
      </div>
    </window.Drawer>
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

function SignDisplay({ role, name, when }) {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
      <div className="muted" style={{ fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 }}>{role}</div>
      <div style={{ fontWeight: 500, marginTop: 4 }}>{name}</div>
      <div style={{ height: 50, marginTop: 10, borderTop: "1px dashed var(--border-strong)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {when ? (
          <div style={{ fontFamily: "cursive", fontSize: 22, color: "var(--brand-blue)", transform: "rotate(-4deg)" }}>{name.split(" ")[0]}</div>
        ) : (
          <span className="muted" style={{ fontSize: 12 }}>Awaiting OTP</span>
        )}
      </div>
      <div className="muted" style={{ fontSize: 11, textAlign: "center", marginTop: 6 }}>
        {when ? "Signed " + when + " · OTP verified" : "Pending"}
      </div>
    </div>
  );
}

window.PdiScreen = PdiScreen;
