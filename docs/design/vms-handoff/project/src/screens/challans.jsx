// Challans & PUC — combined view of fines and PUC certificates.

function ChallansScreen({ onNav }) {
  const V = window.VMS;
  const I = window.Icons;
  const [tab, setTab] = React.useState("Challans");

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Challans &amp; PUC</h1>
          <div className="sub">Traffic fines, RTO penalties, and Pollution Under Control certificates.</div>
        </div>
        <div className="row gap-8">
          <window.Button variant="ghost" icon={I.Download}>Export</window.Button>
          {tab === "Challans" ?
            <window.Button variant="primary" icon={I.Plus}>Log challan</window.Button> :
            <window.Button variant="primary" icon={I.Plus}>Record PUC test</window.Button>
          }
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
        <window.KPI label="Challans (90d)" value={V.CHALLANS.length} icon={I.Receipt} trend={"₹" + V.CHALLANS.reduce((s, c) => s + c.fine, 0).toLocaleString("en-IN") + " total"} />
        <window.KPI label="Unpaid" value={V.CHALLANS.filter(c => c.status === "Unpaid").length} icon={I.AlertTriangle} trend="₹12,000 outstanding" />
        <window.KPI label="PUC valid" value={V.PUC.filter(p => p.result === "Pass" && V.daysFromNow(p.validity) > 0).length} icon={I.CheckCircle} trend={`${V.PUC.length} total tests`} />
        <window.KPI label="PUC expiring (30d)" value={V.PUC.filter(p => V.daysFromNow(p.validity) >= 0 && V.daysFromNow(p.validity) <= 30).length} icon={I.Clock} trend="Block dispatch on expiry" />
      </div>

      <div className="page-tabs">
        {["Challans", "PUC Certificates"].map(t => (
          <div key={t} className={"page-tab " + (tab === t ? "active" : "")} onClick={() => setTab(t)}>{t}</div>
        ))}
      </div>

      {tab === "Challans" && (
        <window.Card flush>
          <window.Toolbar>
            <window.Filter label="Status" value="All" />
            <window.Filter label="Authority" value="All" />
            <window.Filter label="Date range" value="90 days" />
            <div className="grow" />
            <window.Button size="sm" variant="ghost" icon={I.Download}>Export</window.Button>
          </window.Toolbar>
          <table className="tbl">
            <thead>
              <tr>
                <th>Challan ID</th><th>Vehicle</th><th>Date</th><th>Authority</th>
                <th>Offence</th><th>Driver</th><th className="num">Fine</th><th>Status</th><th>Document</th>
              </tr>
            </thead>
            <tbody>
              {V.CHALLANS.map(c => (
                <tr key={c.id} className="clickable">
                  <td className="mono">{c.id}</td>
                  <td className="mono" style={{ fontWeight: 500 }}>{c.reg}</td>
                  <td>{V.fmtDate(c.date)}</td>
                  <td>
                    <div>{c.authority}</div>
                    <div className="secondary mono">{c.number}</div>
                  </td>
                  <td className="elide" style={{ maxWidth: 280 }}>{c.offence}</td>
                  <td>{c.driver}</td>
                  <td className="num tnum" style={{ fontWeight: 500 }}>{V.fmtINR(c.fine)}</td>
                  <td>
                    <window.StatusBadge value={c.status} />
                    {c.paidOn && <div className="secondary" style={{ fontSize: 11 }}>{V.fmtDate(c.paidOn)} · {c.ref}</div>}
                  </td>
                  <td><window.IconButton icon={I.Eye} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </window.Card>
      )}

      {tab === "PUC Certificates" && (
        <window.Card flush>
          <window.Toolbar>
            <window.Filter label="Result" value="All" />
            <window.Filter label="Test centre" value="All" />
            <div className="grow" />
            <window.Button size="sm" variant="ghost" icon={I.Download}>Export</window.Button>
          </window.Toolbar>
          <table className="tbl">
            <thead>
              <tr>
                <th>PUC ID</th><th>Vehicle</th><th>Test centre</th><th>Tested</th>
                <th>Valid until</th><th className="num">CO %</th><th className="num">HC ppm</th><th>Result</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {V.PUC.map(p => (
                <tr key={p.id}>
                  <td className="mono">{p.id}</td>
                  <td className="mono" style={{ fontWeight: 500 }}>{p.reg}</td>
                  <td>{p.testCentre}</td>
                  <td>{V.fmtDate(p.testDate)}</td>
                  <td>
                    <div>{V.fmtDate(p.validity)}</div>
                    {V.daysFromNow(p.validity) < 0 ?
                      <div className="secondary" style={{ color: "var(--danger)" }}>{-V.daysFromNow(p.validity)}d expired</div> :
                      <div className="secondary">{V.daysFromNow(p.validity)}d left</div>}
                  </td>
                  <td className="num tnum">{p.co}</td>
                  <td className="num tnum">{p.hc}</td>
                  <td><window.StatusBadge value={p.result} /></td>
                  <td><window.ExpiryPill date={p.validity} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </window.Card>
      )}
    </div>
  );
}

window.ChallansScreen = ChallansScreen;
