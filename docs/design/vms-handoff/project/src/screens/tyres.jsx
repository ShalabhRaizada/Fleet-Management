// Tyre Management — master, axle map, rotation, CPK analytics.

function TyresScreen({ onNav }) {
  const V = window.VMS;
  const I = window.Icons;
  const [tab, setTab] = React.useState("Map");

  const truck = V.TRUCKS.find(t => t.code === "TRK-0008");
  const truckTyres = V.TYRES.filter(t => t.fittedTo === "TRK-0008");

  const inStock = V.TYRES.filter(t => t.status === "In Stock").length;
  const fitted = V.TYRES.filter(t => t.status === "Fitted").length;
  const inRepair = V.TYRES.filter(t => t.status === "In Repair").length;
  const condemned = V.TYRES.filter(t => t.status === "Condemned").length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Tyre Management</h1>
          <div className="sub">Lifecycle, fitment, rotation, wheel alignment and cost-per-km analytics.</div>
        </div>
        <div className="row gap-8">
          <window.Button variant="ghost" icon={I.Rotate}>Rotation</window.Button>
          <window.Button variant="ghost" icon={I.Activity}>Wheel alignment</window.Button>
          <window.Button variant="primary" icon={I.Plus}>Add tyres</window.Button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 16 }}>
        <window.KPI label="In stock" value={inStock} icon={I.Package} trend="Buffer: 4 weeks" />
        <window.KPI label="Fitted" value={fitted} icon={I.CheckCircle} trend="across 7 trucks" />
        <window.KPI label="In repair" value={inRepair} icon={I.Wrench} trend="2.5d avg TAT" />
        <window.KPI label="Condemned (90d)" value={condemned} icon={I.Trash} trend="Avg life 81,200 km" />
        <window.KPI label="Avg CPK" value="₹2.14" suffix="/km" icon={I.BarChart} trend="Target ₹2.30" trendDir="up" />
      </div>

      <div className="page-tabs">
        {["Map", "Inventory", "Rotation history", "Alignment", "CPK analytics"].map(t => (
          <div key={t} className={"page-tab " + (tab === t ? "active" : "")} onClick={() => setTab(t)}>{t}</div>
        ))}
      </div>

      {tab === "Map" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>
          <window.Card title="Tyre map" sub={`${truck.reg} · ${truck.make} ${truck.model} · ${truck.axles} axles, 10 tyres`}>
            <div className="row gap-12" style={{ marginBottom: 14, alignItems: "center" }}>
              <window.Select defaultValue="TRK-0008">
                {V.TRUCKS.map(t => <option key={t.code} value={t.code}>{t.reg} · {t.code}</option>)}
              </window.Select>
              <div className="grow" />
              <window.Segmented value="Truck" onChange={() => {}} options={["Truck", "Trailer"]} />
            </div>

            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, padding: "32px 40px", margin: "16px 0" }}>
              <div style={{ textAlign: "center", marginBottom: 14 }}>
                <span className="muted" style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>▲ Front</span>
              </div>
              <TyreMapDetailed truck={truck} tyres={truckTyres} />
              <div style={{ textAlign: "center", marginTop: 14 }}>
                <span className="muted" style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>REAR</span>
              </div>
            </div>

            <div className="row gap-16" style={{ marginTop: 16, fontSize: 12 }}>
              <Legend color="#1f2937" label="Healthy" />
              <Legend color="#b45309" label="Wear &gt; 50%" />
              <Legend color="#b91c1c" label="Condemn soon" />
              <Legend color="white" border="dashed" label="Empty position" />
            </div>
          </window.Card>

          <window.Card title="Tyre details" sub="MRF Steel Muscle MUS Plus · 11R22.5">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13 }}>
              <MetricLine label="Serial number" value="MRF2201A77819" mono />
              <MetricLine label="Position" value="Axle 1 · LF" />
              <MetricLine label="Purchased" value={V.fmtDate("2024-08-12")} />
              <MetricLine label="Cost basis" value="Bought Out" />
              <MetricLine label="Purchase price" value="₹22,500" />
              <MetricLine label="OEM life" value="90,000 km" />
              <MetricLine label="Fitted at" value="95,000 km" />
              <MetricLine label="Current odo" value="142,875 km" />
              <MetricLine label="Total km run" value="47,875 km" />
              <MetricLine label="Tread depth" value="14 mm" />
            </div>
            <div className="divider" />
            <div>
              <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Life consumed</div>
              <window.Progress value={47875} max={90000} />
              <div className="row" style={{ justifyContent: "space-between", marginTop: 4, fontSize: 11.5 }}>
                <span className="muted">0 km</span>
                <span style={{ fontWeight: 500 }}>53% · 42,125 km remaining</span>
                <span className="muted">90,000 km</span>
              </div>
            </div>
            <div className="divider" />
            <div>
              <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Projected CPK</div>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <div className="muted" style={{ fontSize: 11 }}>Budget</div>
                  <div style={{ fontWeight: 600, fontSize: 18 }}>₹0.25/km</div>
                </div>
                <div>
                  <div className="muted" style={{ fontSize: 11 }}>Tracking</div>
                  <div style={{ fontWeight: 600, fontSize: 18, color: "var(--success)" }}>₹0.22/km</div>
                </div>
                <div>
                  <div className="muted" style={{ fontSize: 11 }}>Delta</div>
                  <div style={{ fontWeight: 600, fontSize: 18, color: "var(--success)" }}>-12%</div>
                </div>
              </div>
            </div>
            <div className="divider" />
            <div className="row gap-8">
              <window.Button size="sm" variant="ghost" icon={I.Rotate}>Rotate</window.Button>
              <window.Button size="sm" variant="ghost" icon={I.Wrench}>Send to repair</window.Button>
              <window.Button size="sm" variant="ghost" icon={I.Trash}>Condemn</window.Button>
            </div>
          </window.Card>
        </div>
      )}

      {tab === "Inventory" && (
        <window.Card flush>
          <window.Toolbar>
            <window.Filter label="Status" value="All" />
            <window.Filter label="OEM" value="All" />
            <window.Filter label="Size" value="11R22.5" />
            <window.Filter label="Type" value="All" />
            <div className="grow" />
            <window.Button size="sm" variant="ghost" icon={I.Download}>Export</window.Button>
          </window.Toolbar>
          <table className="tbl">
            <thead>
              <tr>
                <th>Tyre code</th>
                <th>Serial</th>
                <th>OEM / Brand</th>
                <th>Size</th>
                <th>Type</th>
                <th>Status</th>
                <th>Fitted to</th>
                <th className="num">Tread (mm)</th>
                <th className="num">KM run</th>
                <th className="num">CPK</th>
              </tr>
            </thead>
            <tbody>
              {V.TYRES.map(t => (
                <tr key={t.code} className="clickable">
                  <td className="mono">{t.code}</td>
                  <td className="mono secondary">{t.serial}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{t.oem}</div>
                    <div className="secondary">{t.brand} · {t.model}</div>
                  </td>
                  <td className="mono">{t.size}</td>
                  <td>{t.type}</td>
                  <td><window.StatusBadge value={t.status} /></td>
                  <td>
                    {t.fittedTo ? (
                      <div>
                        <span className="mono">{t.fittedTo}</span>
                        <div className="secondary">Axle {t.axle} · {t.position}</div>
                      </div>
                    ) : <span className="muted">—</span>}
                  </td>
                  <td className="num tnum">{t.treadAtPurchase}</td>
                  <td className="num tnum">{t.kmRun.toLocaleString("en-IN")}</td>
                  <td className="num tnum">
                    {t.cpkActual ? "₹" + t.cpkActual.toFixed(2) : t.kmRun > 0 ? "₹" + (t.price / t.kmRun).toFixed(2) : <span className="muted">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </window.Card>
      )}

      {tab === "Rotation history" && (
        <window.Card flush>
          <table className="tbl">
            <thead>
              <tr>
                <th>Transaction</th><th>Vehicle</th><th>Date</th><th>Odo</th>
                <th>Reason</th><th>Movements</th><th>Performed by</th><th className="num">Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="mono">ROT-0094</td>
                <td className="mono">MH04 EQ 8821</td>
                <td>{V.fmtDate("2026-04-12")}</td>
                <td className="tnum">138,400</td>
                <td>Scheduled (every 25,000 km)</td>
                <td>
                  <span className="mono" style={{ fontSize: 12 }}>A2-LO ↔ A2-RO · A2-LI ↔ A2-RI</span>
                </td>
                <td>Bajaj Tyre House</td>
                <td className="num tnum">₹1,200</td>
              </tr>
              <tr>
                <td className="mono">ROT-0093</td>
                <td className="mono">KA03 MN 4419</td>
                <td>{V.fmtDate("2026-03-28")}</td>
                <td className="tnum">38,200</td>
                <td>Uneven wear (A1-LF)</td>
                <td>
                  <span className="mono" style={{ fontSize: 12 }}>A1-LF → Spare · Spare → A1-LF</span>
                </td>
                <td>Bajaj Tyre House</td>
                <td className="num tnum">₹600</td>
              </tr>
              <tr>
                <td className="mono">ROT-0092</td>
                <td className="mono">GJ05 KK 9001</td>
                <td>{V.fmtDate("2026-03-14")}</td>
                <td className="tnum">19,100</td>
                <td>Scheduled</td>
                <td>
                  <span className="mono" style={{ fontSize: 12 }}>Full rotation (6 positions)</span>
                </td>
                <td>Bajaj Tyre House</td>
                <td className="num tnum">₹2,800</td>
              </tr>
              <tr>
                <td className="mono">ROT-0091</td>
                <td className="mono">TN10 BB 1102</td>
                <td>{V.fmtDate("2026-02-22")}</td>
                <td className="tnum">190,000</td>
                <td>Flat (puncture A3-RO)</td>
                <td>
                  <span className="mono" style={{ fontSize: 12 }}>A3-RO → Spare · Spare → A3-RO</span>
                </td>
                <td>—</td>
                <td className="num tnum">₹450</td>
              </tr>
            </tbody>
          </table>
        </window.Card>
      )}

      {tab === "Alignment" && (
        <window.Card flush>
          <table className="tbl">
            <thead>
              <tr>
                <th>Transaction</th><th>Vehicle</th><th>Date</th><th>Odo</th>
                <th>Alignment type</th><th>Performed by</th><th className="num">Cost</th><th>Next due</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="mono">ALG-0042</td>
                <td className="mono">MH04 EQ 8823</td>
                <td>{V.fmtDate("2026-04-04")}</td>
                <td className="tnum">82,200</td>
                <td>Full (4-wheel)</td>
                <td>Sterling Auto Services</td>
                <td className="num tnum">₹4,200</td>
                <td className="tnum">107,200 km</td>
              </tr>
              <tr>
                <td className="mono">ALG-0041</td>
                <td className="mono">GJ05 KK 9001</td>
                <td>{V.fmtDate("2026-03-19")}</td>
                <td className="tnum">19,300</td>
                <td>Front</td>
                <td>Sterling Auto Services</td>
                <td className="num tnum">₹2,800</td>
                <td className="tnum">44,300 km</td>
              </tr>
              <tr>
                <td className="mono">ALG-0040</td>
                <td className="mono">MH04 EQ 8821</td>
                <td>{V.fmtDate("2026-02-08")}</td>
                <td className="tnum">128,100</td>
                <td>Full (4-wheel)</td>
                <td>Sterling Auto Services</td>
                <td className="num tnum">₹4,200</td>
                <td className="tnum">153,100 km · <window.Badge tone="warn" outline>10k away</window.Badge></td>
              </tr>
            </tbody>
          </table>
        </window.Card>
      )}

      {tab === "CPK analytics" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
          <window.Card title="CPK by tyre brand" sub="Average across all tyres of each brand">
            <div className="col gap-12">
              {[
                { brand: "Bridgestone M788", actual: 0.28, budget: 0.32, count: 14, life: 108200 },
                { brand: "MRF Steel Muscle", actual: 0.22, budget: 0.25, count: 22, life: 89400 },
                { brand: "CEAT Win Energy", actual: 0.24, budget: 0.26, count: 8, life: 91800 },
                { brand: "Apollo Endurance", actual: 0.31, budget: 0.24, count: 12, life: 71200 },
              ].map(b => {
                const overBudget = b.actual > b.budget;
                return (
                  <div key={b.brand} style={{ display: "grid", gridTemplateColumns: "200px 1fr 100px 100px 80px", gap: 12, alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{b.brand}</div>
                      <div className="muted" style={{ fontSize: 11 }}>{b.count} tyres · avg life {b.life.toLocaleString("en-IN")} km</div>
                    </div>
                    <div style={{ position: "relative", height: 8, background: "var(--surface-3)", borderRadius: 999 }}>
                      <div style={{
                        position: "absolute", left: 0, top: 0, bottom: 0,
                        width: `${(b.actual / 0.4) * 100}%`,
                        background: overBudget ? "var(--danger)" : "var(--brand-blue)",
                        borderRadius: 999,
                      }} />
                      <div style={{
                        position: "absolute", left: `${(b.budget / 0.4) * 100}%`, top: -4, bottom: -4,
                        width: 2, background: "var(--text-2)",
                      }} title="Budget" />
                    </div>
                    <div className="tnum" style={{ fontSize: 13, fontWeight: 500 }}>₹{b.actual.toFixed(2)}</div>
                    <div className="tnum muted" style={{ fontSize: 12 }}>Budget ₹{b.budget.toFixed(2)}</div>
                    <window.Badge tone={overBudget ? "danger" : "success"} outline>
                      {overBudget ? "+" : ""}{Math.round((b.actual / b.budget - 1) * 100)}%
                    </window.Badge>
                  </div>
                );
              })}
            </div>
          </window.Card>

          <window.Card title="Top performers (last 12 months)">
            <div className="col gap-10">
              {[
                { name: "Bridgestone M788 · 11R22.5", lifeKm: "108,200", cpk: "₹0.28", note: "Lowest CPK across drive axles" },
                { name: "MRF Steel Muscle · 11R22.5", lifeKm: "89,400", cpk: "₹0.22", note: "Best value buy" },
                { name: "CEAT Win Energy X3 · 11R22.5", lifeKm: "91,800", cpk: "₹0.24", note: "Used in Hoskote routes" },
              ].map((p, i) => (
                <div key={i} style={{ padding: 10, border: "1px solid var(--border)", borderRadius: 8 }}>
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{p.name}</div>
                    <window.Badge tone="success">{p.cpk}/km</window.Badge>
                  </div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{p.lifeKm} km avg life · {p.note}</div>
                </div>
              ))}
            </div>
            <div className="divider" />
            <div>
              <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 6 }}>⚠ Watchlist</div>
              <div style={{ padding: 10, border: "1px solid var(--danger-border)", borderRadius: 8, background: "var(--danger-bg)" }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 500, fontSize: 13, color: "var(--danger)" }}>Apollo Endurance RA</div>
                  <window.Badge tone="danger">+29% over budget</window.Badge>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 4 }}>Premature wear on drive axles. Suggested action: switch new procurements to Bridgestone M788 for similar routes.</div>
              </div>
            </div>
          </window.Card>
        </div>
      )}
    </div>
  );
}

function TyreMapDetailed({ truck, tyres }) {
  // Truck: 3 axles, A1 = 2 tyres (steering), A2/A3 = 4 each (drive)
  const I = window.Icons;
  const get = (axle, pos) => tyres.find(t => t.axle === axle && t.position === pos);
  return (
    <div className="axle-map">
      {[1, 2, 3].map(axle => {
        const positions = axle === 1 ? ["LF", "RF"] : ["LO", "LI", "RI", "RO"];
        return (
          <div key={axle} className="axle">
            <div className="lbl">
              Axle {axle}
              <div className="muted" style={{ fontSize: 10, fontWeight: 400, marginTop: 2 }}>{axle === 1 ? "Steering" : "Drive"}</div>
            </div>
            <div style={{ position: "relative" }}>
              <div className="bar" />
              <div className="wheels" style={{ position: "absolute", top: -38, left: 0, right: 0 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {positions.slice(0, positions.length / 2).map(pos => {
                    const t = get(axle, pos);
                    return (
                      <div key={pos} style={{ position: "relative" }}>
                        <div className="pos">{pos}</div>
                        <div className={"tyre " + (!t ? "empty" : "")}>
                          {t ? (t.oem.slice(0, 3) + "\n" + t.code.slice(-3)) : "—"}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {positions.slice(positions.length / 2).map(pos => {
                    const t = get(axle, pos);
                    return (
                      <div key={pos} style={{ position: "relative" }}>
                        <div className="pos">{pos}</div>
                        <div className={"tyre " + (!t ? "empty" : "")}>
                          {t ? (t.oem.slice(0, 3) + "\n" + t.code.slice(-3)) : "—"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="lbl">{positions.length} tyres</div>
          </div>
        );
      })}
      <div className="axle">
        <div className="lbl">Spare</div>
        <div style={{ position: "relative" }}>
          <div className="bar" style={{ background: "transparent" }} />
          <div style={{ position: "absolute", top: -38, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
            <div style={{ position: "relative" }}>
              <div className="pos">SP</div>
              <div className="tyre empty">—</div>
            </div>
          </div>
        </div>
        <div className="lbl">1 slot</div>
      </div>
    </div>
  );
}

function MetricLine({ label, value, mono }) {
  return (
    <div>
      <div className="muted" style={{ fontSize: 11.5 }}>{label}</div>
      <div style={{ fontWeight: 500, fontFamily: mono ? "var(--font-mono)" : "inherit" }}>{value}</div>
    </div>
  );
}

function Legend({ color, label, border }) {
  return (
    <div className="row gap-4">
      <span style={{
        width: 14, height: 14, background: color, borderRadius: 3,
        border: border ? "1.5px " + border + " var(--border-strong)" : "1px solid rgba(0,0,0,.1)",
      }} />
      <span className="muted">{label}</span>
    </div>
  );
}

window.TyresScreen = TyresScreen;
