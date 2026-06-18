// Compliance — documents & permits expiry tracker, PESO/Piping detail.

function ComplianceScreen({ onNav }) {
  const V = window.VMS;
  const I = window.Icons;
  const [tab, setTab] = React.useState("All");

  const enriched = V.COMPLIANCE.map(d => ({ ...d, days: V.daysFromNow(d.expiry) }));

  const counts = {
    All: enriched.length,
    Expired: enriched.filter(d => d.days < 0).length,
    "0–7 days": enriched.filter(d => d.days >= 0 && d.days <= 7).length,
    "8–30 days": enriched.filter(d => d.days > 7 && d.days <= 30).length,
    "31–60 days": enriched.filter(d => d.days > 30 && d.days <= 60).length,
    Valid: enriched.filter(d => d.days > 60).length,
  };

  const filtered = enriched.filter(d => {
    if (tab === "All") return true;
    if (tab === "Expired") return d.days < 0;
    if (tab === "0–7 days") return d.days >= 0 && d.days <= 7;
    if (tab === "8–30 days") return d.days > 7 && d.days <= 30;
    if (tab === "31–60 days") return d.days > 30 && d.days <= 60;
    if (tab === "Valid") return d.days > 60;
  }).sort((a, b) => a.days - b.days);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Documents &amp; Permits</h1>
          <div className="sub">Insurance, Fitness, Permits, PESO and Piping certificates. Renewal alerts fire 60/30/7 days prior.</div>
        </div>
        <div className="row gap-8">
          <window.Button variant="ghost" icon={I.Calendar}>Compliance calendar</window.Button>
          <window.Button variant="ghost" icon={I.Download}>Renewal forecast</window.Button>
          <window.Button variant="primary" icon={I.Upload}>Upload document</window.Button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 16 }}>
        {[
          { key: "Expired", color: "var(--danger)", count: counts.Expired },
          { key: "0–7 days", color: "var(--danger)", count: counts["0–7 days"] },
          { key: "8–30 days", color: "var(--warn)", count: counts["8–30 days"] },
          { key: "31–60 days", color: "var(--warn)", count: counts["31–60 days"] },
          { key: "Valid", color: "var(--success)", count: counts.Valid },
          { key: "All", color: "var(--text-3)", count: counts.All },
        ].map(s => (
          <div
            key={s.key}
            className="card"
            style={{ padding: 12, cursor: "pointer", borderLeft: "3px solid " + s.color, background: tab === s.key ? "var(--surface-2)" : undefined }}
            onClick={() => setTab(s.key)}
          >
            <div className="muted" style={{ fontSize: 11.5, fontWeight: 500 }}>{s.key === "All" ? "Total" : s.key}</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: s.color }}>{s.count}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <window.Card title={`${filtered.length} documents · ${tab}`} flush>
          <window.Toolbar>
            <window.Filter label="Type" value="All" />
            <window.Filter label="Depot" value="All" />
            <window.Filter label="Vehicle type" value="All" />
            <div className="grow" />
            <window.Button size="sm" variant="ghost" icon={I.Download}>Export</window.Button>
          </window.Toolbar>
          <table className="tbl">
            <thead>
              <tr>
                <th>Type</th><th>Vehicle</th><th>Document number</th><th>Expiry</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.vCode + d.type}>
                  <td>
                    {(d.type === "PESO" || d.type === "Piping") ? <window.Badge tone="info">{d.type}</window.Badge> :
                     <window.Badge outline>{d.type}</window.Badge>}
                  </td>
                  <td>
                    <div className="mono" style={{ fontWeight: 500 }}>{d.vehicle}</div>
                    <div className="secondary">{d.vCode}</div>
                  </td>
                  <td className="mono">{d.number}</td>
                  <td>
                    <div>{V.fmtDate(d.expiry)}</div>
                    <div className="secondary">{d.days < 0 ? `${-d.days}d ago` : `in ${d.days}d`}</div>
                  </td>
                  <td><window.ExpiryPill date={d.expiry} /></td>
                  <td>
                    <div className="row gap-4">
                      <window.IconButton icon={I.Eye} />
                      <window.IconButton icon={I.Refresh} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </window.Card>

        <div className="col gap-16">
          <window.Card title="PESO &amp; Piping snapshot" sub="LNG/CNG tanker compliance">
            <div className="col gap-12">
              {V.TRUCKS.filter(t => t.peso).map(t => (
                <div key={t.code} style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 8 }}>
                  <div className="row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
                    <div>
                      <div className="mono" style={{ fontWeight: 500, fontSize: 13 }}>{t.reg}</div>
                      <div className="muted" style={{ fontSize: 11.5 }}>{t.make} · {t.fuel} tanker</div>
                    </div>
                    <window.Badge tone="info">{t.fuel}</window.Badge>
                  </div>
                  <div className="row" style={{ justifyContent: "space-between", padding: "4px 0" }}>
                    <span className="muted" style={{ fontSize: 12 }}>PESO</span>
                    <window.ExpiryPill date={t.peso} />
                  </div>
                  <div className="row" style={{ justifyContent: "space-between", padding: "4px 0" }}>
                    <span className="muted" style={{ fontSize: 12 }}>Piping</span>
                    <window.ExpiryPill date={t.piping} />
                  </div>
                </div>
              ))}
            </div>
          </window.Card>

          <window.Card title="Alert schedule">
            <div className="col gap-8" style={{ fontSize: 12.5 }}>
              <AlertRule type="Insurance" windows={["30d", "7d"]} channels="Email" />
              <AlertRule type="Fitness Certificate" windows={["30d", "7d"]} channels="Email" />
              <AlertRule type="Permit" windows={["30d", "7d"]} channels="Email" />
              <AlertRule type="PESO Certificate" windows={["60d", "30d", "7d"]} channels="Email + SMS" highlight />
              <AlertRule type="Piping Certificate" windows={["60d", "30d", "7d"]} channels="Email + SMS" highlight />
              <AlertRule type="PUC" windows={["30d", "7d"]} channels="Email" />
            </div>
          </window.Card>
        </div>
      </div>
    </div>
  );
}

function AlertRule({ type, windows, channels, highlight }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px",
      borderRadius: 6, background: highlight ? "var(--info-bg)" : "transparent",
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500 }}>{type}</div>
        <div className="muted" style={{ fontSize: 11.5 }}>{channels}</div>
      </div>
      <div className="row gap-4">
        {windows.map(w => <window.Badge key={w} outline>{w}</window.Badge>)}
      </div>
    </div>
  );
}

window.ComplianceScreen = ComplianceScreen;
