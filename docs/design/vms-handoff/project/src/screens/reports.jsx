// Reports — standard report library.

function ReportsScreen({ onNav }) {
  const V = window.VMS;
  const I = window.Icons;
  const [tab, setTab] = React.useState("All");

  const REPORTS = [
    { name: "Fleet Master List", module: "Vehicles", desc: "All trucks and trailers with key specs and status", icon: "Truck", category: "Master" },
    { name: "Vehicle Document Expiry", module: "Compliance", desc: "Documents with colour-coded expiry: red/amber/green", icon: "Shield", category: "Compliance" },
    { name: "Maintenance Schedule Summary", module: "Workbench", desc: "Upcoming, due, overdue PM jobs across fleet", icon: "Wrench", category: "Maintenance" },
    { name: "Maintenance History by Vehicle", module: "Workbench", desc: "All past maintenance jobs with cost for a selected vehicle", icon: "Wrench", category: "Maintenance" },
    { name: "Vendor Performance Report", module: "Vendors", desc: "Jobs assigned, completed, avg TAT, cost per vendor", icon: "Briefcase", category: "Vendors" },
    { name: "Tyre Life & CPK Report", module: "Tyres", desc: "Per-tyre CPK actual vs. budget; life remaining", icon: "Tyre", category: "Tyres" },
    { name: "Tyre Inventory Report", module: "Tyres", desc: "In-stock, fitted, in-repair, condemned tyres", icon: "Package", category: "Tyres" },
    { name: "Non-Working Vehicle Register", module: "Operations", desc: "All non-working vehicles with age, issue, resolution status", icon: "AlertTriangle", category: "Operations" },
    { name: "EPIC Upload Reconciliation", module: "Operations", desc: "Match / mismatch between EPIC upload and VMS master", icon: "Database", category: "Operations" },
    { name: "Challan & Fines Summary", module: "Compliance", desc: "All challans by vehicle, amount paid/pending", icon: "Receipt", category: "Compliance" },
    { name: "PUC Status Report", module: "Compliance", desc: "All vehicles with PUC validity and expiry timeline", icon: "FileText", category: "Compliance" },
    { name: "PESO/Piping Certificate Report", module: "Compliance", desc: "Certificate status for all LNG/CNG tankers", icon: "Shield", category: "Compliance" },
    { name: "Coupling History Report", module: "Operations", desc: "All coupling and decoupling transactions", icon: "Coupling", category: "Operations" },
    { name: "PDI Summary Report", module: "PDI", desc: "All PDI records with pass/fail and handover details", icon: "Clipboard", category: "Operations" },
    { name: "User Activity Audit Log", module: "Admin", desc: "Login/logout, record create/edit/delete with user and timestamp", icon: "Users", category: "Admin" },
    { name: "Cost Summary by Vehicle", module: "Workbench", desc: "Total maintenance, tyre, and fine costs per vehicle (period)", icon: "BarChart", category: "Finance" },
  ];

  const categories = ["All", ...Array.from(new Set(REPORTS.map(r => r.category)))];
  const filtered = tab === "All" ? REPORTS : REPORTS.filter(r => r.category === tab);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <div className="sub">{REPORTS.length} standard reports · scheduled deliveries · export to PDF or Excel</div>
        </div>
        <div className="row gap-8">
          <window.Button variant="ghost" icon={I.Calendar}>Scheduled deliveries</window.Button>
          <window.Button variant="primary" icon={I.Plus}>Custom report</window.Button>
        </div>
      </div>

      <div className="page-tabs">
        {categories.map(t => (
          <div key={t} className={"page-tab " + (tab === t ? "active" : "")} onClick={() => setTab(t)}>
            {t}<span className="ct">{t === "All" ? REPORTS.length : REPORTS.filter(r => r.category === t).length}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {filtered.map(r => {
          const RI = I[r.icon] || I.FileText;
          return (
            <div key={r.name} className="card" style={{ padding: 16, cursor: "pointer" }}>
              <div className="row gap-12" style={{ alignItems: "flex-start" }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--brand-blue-50)", color: "var(--brand-blue)", display: "grid", placeItems: "center" }}>
                  <RI size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
                  <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>{r.module}</div>
                </div>
                <window.Badge outline>{r.category}</window.Badge>
              </div>
              <div className="muted" style={{ fontSize: 12.5, marginTop: 10, lineHeight: 1.5 }}>{r.desc}</div>
              <div className="divider" />
              <div className="row gap-8">
                <window.Button size="sm" variant="ghost" icon={I.Eye}>Preview</window.Button>
                <window.Button size="sm" variant="ghost" icon={I.Download}>Excel</window.Button>
                <window.Button size="sm" variant="ghost" icon={I.FileText}>PDF</window.Button>
                <div className="grow" />
                <window.IconButton icon={I.Calendar} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 16 }}>
        <window.Card title="Scheduled deliveries" sub="Recurring report emails">
          <table className="tbl">
            <thead><tr><th>Report</th><th>Schedule</th><th>Recipients</th><th>Format</th><th>Next run</th></tr></thead>
            <tbody>
              <tr><td>Maintenance Schedule Summary</td><td>Daily, 07:00 IST</td><td>Anika Mehta, Rohit Sharma</td><td>Excel</td><td>Tomorrow 07:00</td></tr>
              <tr><td>Vehicle Document Expiry</td><td>Weekly, Mon 09:00</td><td>Priya Nair, Compliance team (4)</td><td>PDF</td><td>Mon 25 May 09:00</td></tr>
              <tr><td>Non-Working Vehicle Register</td><td>Daily, 18:00 IST</td><td>Fleet Manager, C-suite (3)</td><td>PDF</td><td>Today 18:00</td></tr>
              <tr><td>Tyre Life & CPK Report</td><td>Monthly, 1st</td><td>Anika Mehta, Procurement (2)</td><td>Excel</td><td>1 Jun 09:00</td></tr>
              <tr><td>Cost Summary by Vehicle</td><td>Monthly, last day</td><td>CFO, Finance (3)</td><td>Excel + PDF</td><td>31 May 18:00</td></tr>
            </tbody>
          </table>
        </window.Card>
      </div>
    </div>
  );
}

window.ReportsScreen = ReportsScreen;
