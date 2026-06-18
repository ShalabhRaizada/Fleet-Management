// Vendors — master list with performance metrics.

function VendorsScreen({ onNav }) {
  const V = window.VMS;
  const I = window.Icons;
  const [tab, setTab] = React.useState("All");
  const [selected, setSelected] = React.useState(null);

  const counts = {
    All: V.VENDORS.length,
    "Service Provider": V.VENDORS.filter(v => v.type !== "Spare Parts Supplier").length,
    "Spare Parts": V.VENDORS.filter(v => v.type !== "Service Provider").length,
    Blacklisted: V.VENDORS.filter(v => v.status === "Blacklisted").length,
  };

  const filtered = V.VENDORS.filter(v =>
    tab === "All" ? true :
    tab === "Service Provider" ? v.type !== "Spare Parts Supplier" :
    tab === "Spare Parts" ? v.type !== "Service Provider" :
    tab === "Blacklisted" ? v.status === "Blacklisted" :
    true
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Vendors</h1>
          <div className="sub">Approved service providers and spare-parts suppliers. Ratings auto-update from completed jobs.</div>
        </div>
        <div className="row gap-8">
          <window.Button variant="ghost" icon={I.Download}>Export</window.Button>
          <window.Button variant="primary" icon={I.Plus}>Add vendor</window.Button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
        <window.KPI label="Active vendors" value={V.VENDORS.filter(v => v.status === "Active").length} icon={I.Briefcase} />
        <window.KPI label="Avg rating" value="4.2" suffix="/ 5" icon={I.Star} trend="6 vendors above 4.5" trendDir="up" />
        <window.KPI label="Jobs (90d)" value="328" icon={I.Wrench} trend="₹14.7L paid" />
        <window.KPI label="Contract renewals (60d)" value="3" icon={I.Calendar} trend="2 due in May, 1 in Jun" />
      </div>

      <div className="page-tabs">
        {Object.keys(counts).map(t => (
          <div key={t} className={"page-tab " + (tab === t ? "active" : "")} onClick={() => setTab(t)}>
            {t}<span className="ct">{counts[t]}</span>
          </div>
        ))}
      </div>

      <window.Card flush>
        <window.Toolbar>
          <window.Filter label="City" value="All" />
          <window.Filter label="Category" value="All" />
          <window.Filter label="Status" value="Active" />
          <div className="grow" />
          <window.Segmented value="Cards" onChange={() => {}} options={["Cards", "Table"]} />
        </window.Toolbar>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, padding: 16 }}>
          {filtered.map(v => (
            <div
              key={v.code}
              className="card"
              style={{ padding: 16, cursor: "pointer", border: v.status === "Blacklisted" ? "1px solid var(--danger-border)" : "1px solid var(--border)", opacity: v.status === "Blacklisted" ? 0.85 : 1 }}
              onClick={() => setSelected(v)}
            >
              <div className="row" style={{ alignItems: "flex-start", justifyContent: "space-between" }}>
                <div className="row gap-12">
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: v.status === "Blacklisted" ? "var(--danger-bg)" : "var(--brand-blue-50)",
                    color: v.status === "Blacklisted" ? "var(--danger)" : "var(--brand-blue)",
                    display: "grid", placeItems: "center",
                  }}>
                    <I.Building size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{v.name}</div>
                    <div className="muted mono" style={{ fontSize: 11.5 }}>{v.code} · {v.type}</div>
                  </div>
                </div>
                <div className="col gap-4" style={{ alignItems: "flex-end" }}>
                  <window.StatusBadge value={v.status} />
                  <div className="row gap-4" style={{ fontSize: 12 }}>
                    <I.Star size={12} fill="#d97706" style={{ color: "#d97706" }} /> <b>{v.rating}</b>
                    <span className="muted">· {v.jobsCompleted} jobs</span>
                  </div>
                </div>
              </div>

              <div className="row gap-4" style={{ marginTop: 10, flexWrap: "wrap" }}>
                {v.categories.map(c => <window.Badge key={c} outline>{c}</window.Badge>)}
              </div>

              <div className="divider" />

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, fontSize: 12 }}>
                <div>
                  <div className="muted">Location</div>
                  <div style={{ fontWeight: 500 }}>{v.city}</div>
                </div>
                <div>
                  <div className="muted">Avg TAT</div>
                  <div style={{ fontWeight: 500 }}>{v.avgTAT}</div>
                </div>
                <div>
                  <div className="muted">Payment</div>
                  <div style={{ fontWeight: 500 }}>{v.payment}</div>
                </div>
                <div>
                  <div className="muted">Contract</div>
                  <div style={{ fontWeight: 500 }}>{V.fmtDate(v.contractEnd)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </window.Card>

      {selected && <VendorDetail vendor={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function VendorDetail({ vendor, onClose }) {
  const V = window.VMS;
  const I = window.Icons;
  return (
    <window.Drawer onClose={onClose} width={780}>
      <div className="dh">
        <div className="row gap-12">
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--brand-blue-50)", color: "var(--brand-blue)", display: "grid", placeItems: "center" }}>
            <I.Building size={22} />
          </div>
          <div>
            <h2>{vendor.name}</h2>
            <div className="meta"><span className="mono">{vendor.code}</span> · {vendor.type} · {vendor.city}</div>
          </div>
        </div>
        <div className="row gap-8" style={{ marginLeft: "auto" }}>
          <window.StatusBadge value={vendor.status} />
          <window.IconButton icon={I.X} onClick={onClose} />
        </div>
      </div>
      <div className="db" style={{ padding: 24 }}>
        <div className="col gap-16">
          <window.Card>
            <div className="field-row cols-3">
              <Stat label="GST" value={vendor.gst} mono />
              <Stat label="PAN" value={vendor.gst.slice(2, 12)} mono />
              <Stat label="Rating" value={
                <div className="row gap-4">
                  <I.Star size={14} fill="#d97706" style={{ color: "#d97706" }} />
                  <span style={{ fontWeight: 500 }}>{vendor.rating}</span>
                  <span className="muted">/ 5</span>
                </div>
              } />
              <Stat label="Primary contact" value={`${vendor.contact} · ${vendor.phone}`} />
              <Stat label="Email" value={vendor.email} />
              <Stat label="Payment terms" value={vendor.payment} />
              <Stat label="Categories" value={vendor.categories.join(", ")} />
              <Stat label="Approved brands" value={vendor.brands.length ? vendor.brands.join(", ") : "—"} />
              <Stat label="Contract end" value={
                <div className="row gap-8">
                  <span>{V.fmtDate(vendor.contractEnd)}</span>
                  <window.ExpiryPill date={vendor.contractEnd} />
                </div>
              } />
            </div>
          </window.Card>

          <window.Card title="Performance (90d)">
            <div className="field-row cols-4">
              <PerfStat label="Jobs completed" value={vendor.jobsCompleted} />
              <PerfStat label="Avg TAT" value={vendor.avgTAT} />
              <PerfStat label="On-time rate" value="94%" />
              <PerfStat label="Total billed" value="₹4.2L" />
            </div>
          </window.Card>

          <window.Card title="Recent jobs" flush>
            <table className="tbl">
              <thead><tr><th>Job</th><th>Vehicle</th><th>Template</th><th>Status</th><th className="num">Cost</th></tr></thead>
              <tbody>
                {V.JOBS.filter(j => j.vendorCode === vendor.code).map(j => (
                  <tr key={j.id}>
                    <td className="mono">{j.id}</td>
                    <td className="mono">{j.truck}</td>
                    <td>{j.template}</td>
                    <td><window.StatusBadge value={j.status} /></td>
                    <td className="num tnum">{V.fmtINR(j.actualCost || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </window.Card>
        </div>
      </div>
    </window.Drawer>
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
function PerfStat({ label, value }) {
  return (
    <div>
      <div className="muted" style={{ fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 600, marginTop: 2 }}>{value}</div>
    </div>
  );
}

window.VendorsScreen = VendorsScreen;
