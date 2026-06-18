// Vehicles (Trucks) — list + detail drawer. Onboarding wizard lives in onboarding.jsx.

function VehiclesScreen({ onNav }) {
  const V = window.VMS;
  const I = window.Icons;
  const [tab, setTab] = React.useState("All");
  const [selected, setSelected] = React.useState(null);
  const [showOnboard, setShowOnboard] = React.useState(false);

  const filtered = V.TRUCKS.filter(t =>
    tab === "All" ? true :
    tab === "Active" ? t.status === "Active" :
    tab === "Non-Working" ? t.status === "Non-Working" :
    tab === "LNG/CNG" ? t.fuel === "LNG" || t.fuel === "CNG" :
    true
  );

  const counts = {
    All: V.TRUCKS.length,
    Active: V.TRUCKS.filter(t => t.status === "Active").length,
    "Non-Working": V.TRUCKS.filter(t => t.status === "Non-Working").length,
    "LNG/CNG": V.TRUCKS.filter(t => t.fuel === "LNG" || t.fuel === "CNG").length,
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Vehicles</h1>
          <div className="sub">Master records for all trucks — identification, documents, fittings, history.</div>
        </div>
        <div className="row gap-8">
          <window.Button variant="ghost" icon={I.Upload}>Bulk import</window.Button>
          <window.Button variant="ghost" icon={I.Download}>Export</window.Button>
          <window.Button variant="primary" icon={I.Plus} onClick={() => setShowOnboard(true)}>Onboard truck</window.Button>
        </div>
      </div>

      <div className="page-tabs">
        {["All", "Active", "Non-Working", "LNG/CNG"].map(t => (
          <div key={t} className={"page-tab " + (tab === t ? "active" : "")} onClick={() => setTab(t)}>
            {t}<span className="ct">{counts[t]}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <window.Toolbar>
          <window.Filter label="Depot" value="All" />
          <window.Filter label="Brand" value="All" />
          <window.Filter label="Fuel" value="All" />
          <window.Filter label="Year" value="All" />
          <window.Filter label="Ownership" value="All" />
          <div className="grow" />
          <window.Segmented value="Table" onChange={() => {}} options={["Table", "Cards"]} />
        </window.Toolbar>
        <table className="tbl">
          <thead>
            <tr>
              <th>Registration</th>
              <th>Code</th>
              <th>Make / Model</th>
              <th>Type / Fuel</th>
              <th>Depot</th>
              <th className="num">Odometer</th>
              <th>Documents</th>
              <th>Status</th>
              <th style={{ width: 30 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => {
              const docs = [
                { label: "Ins", date: t.insurance },
                { label: "Fit", date: t.fitness },
                { label: "Per", date: t.permit },
                ...(t.peso ? [{ label: "PESO", date: t.peso }] : []),
              ];
              return (
                <tr key={t.code} className="clickable" onClick={() => setSelected(t)}>
                  <td>
                    <div className="mono" style={{ fontWeight: 500 }}>{t.reg}</div>
                    <div className="secondary">{t.year} · {t.vin.slice(0, 8)}…</div>
                  </td>
                  <td className="mono">{t.code}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{t.make}</div>
                    <div className="secondary">{t.model}</div>
                  </td>
                  <td>
                    <div>{t.type}</div>
                    <div className="secondary">
                      {t.fuel === "LNG" || t.fuel === "CNG" ? (
                        <window.Badge tone="info" outline>{t.fuel}</window.Badge>
                      ) : t.fuel}
                    </div>
                  </td>
                  <td>
                    <div className="row gap-4">
                      <I.MapPin size={12} className="muted" />
                      {V.DEPOTS.find(d => d.code === t.depot)?.name.split(",")[0]}
                    </div>
                  </td>
                  <td className="num tnum">{V.fmtKM(t.odo)}</td>
                  <td>
                    <div className="row gap-4" style={{ flexWrap: "wrap" }}>
                      {docs.map(d => {
                        const days = V.daysFromNow(d.date);
                        const tone = days < 0 ? "danger" : days <= 30 ? "warn" : "success";
                        return (
                          <window.Badge key={d.label} tone={tone} outline title={`Expires ${V.fmtDate(d.date)}`}>
                            {d.label}
                          </window.Badge>
                        );
                      })}
                    </div>
                  </td>
                  <td><window.StatusBadge value={t.status} /></td>
                  <td className="actions"><window.IconButton icon={I.More} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && <TruckDetailDrawer truck={selected} onClose={() => setSelected(null)} onNav={onNav} />}
      {showOnboard && <window.OnboardingWizard onClose={() => setShowOnboard(false)} />}
    </div>
  );
}

function TruckDetailDrawer({ truck, onClose, onNav }) {
  const V = window.VMS;
  const I = window.Icons;
  const [tab, setTab] = React.useState("Overview");
  const trailer = V.TRAILERS.find(t => t.coupledTo === truck.code);

  return (
    <window.Drawer onClose={onClose}>
      <div className="dh">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#0b1220", color: "#cbd5e1", display: "grid", placeItems: "center" }}>
            <I.Truck size={22} />
          </div>
          <div>
            <h2>{truck.reg}</h2>
            <div className="meta">
              <span className="mono">{truck.code}</span> · {truck.make} {truck.model} · {truck.year}
            </div>
          </div>
        </div>
        <div className="row gap-8" style={{ marginLeft: "auto" }}>
          {truck.fuel === "LNG" || truck.fuel === "CNG" ? <window.Badge tone="info">{truck.fuel}</window.Badge> : <window.Badge outline>{truck.fuel}</window.Badge>}
          <window.StatusBadge value={truck.status} />
          <window.IconButton icon={I.Edit} />
          <window.IconButton icon={I.X} onClick={onClose} />
        </div>
      </div>

      <div style={{ background: "white", padding: "0 24px", borderBottom: "1px solid var(--border)" }}>
        <div className="page-tabs" style={{ borderBottom: 0, margin: 0 }}>
          {["Overview", "Documents", "Maintenance", "Tyres & Fittings", "PDI History", "Activity"].map(t => (
            <div key={t} className={"page-tab " + (tab === t ? "active" : "")} onClick={() => setTab(t)}>
              {t}
            </div>
          ))}
        </div>
      </div>

      <div className="db" style={{ padding: 24 }}>
        {tab === "Overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
            <div className="col gap-16">
              <window.Card title="Basic identification">
                <div className="field-row cols-3">
                  <Stat label="Registration" value={truck.reg} mono />
                  <Stat label="Vehicle code" value={truck.code} mono />
                  <Stat label="Fleet number" value={"GLN-" + truck.code.slice(-4)} mono />
                  <Stat label="VIN" value={truck.vin} mono small lock />
                  <Stat label="Engine number" value={"EN-" + truck.vin.slice(-8)} mono lock />
                  <Stat label="Chassis number" value={"CH-" + truck.vin.slice(-8)} mono lock />
                  <Stat label="Make / Model" value={`${truck.make} ${truck.model}`} />
                  <Stat label="Year of mfg." value={truck.year} />
                  <Stat label="Fuel type" value={truck.fuel} />
                  <Stat label="Gross weight" value={truck.gvw.toLocaleString("en-IN") + " kg"} />
                  <Stat label="Payload capacity" value={truck.payload.toLocaleString("en-IN") + " kg"} />
                  <Stat label="Axles" value={truck.axles} />
                </div>
              </window.Card>

              <window.Card title="Ownership & deployment">
                <div className="field-row cols-3">
                  <Stat label="Ownership" value={truck.ownership} />
                  <Stat label="Depot" value={V.DEPOTS.find(d => d.code === truck.depot)?.name} />
                  <Stat label="Current odometer" value={V.fmtKM(truck.odo)} />
                  <Stat label="Date of purchase" value={V.fmtDate(truck.purchaseDate)} />
                  <Stat label="Purchase price" value={V.fmtINR(truck.purchasePrice)} />
                  <Stat label="Onboarding odo" value="0 km" />
                </div>
              </window.Card>

              <window.Card title="Battery information" action={<window.Button size="sm" variant="ghost" icon={I.Refresh}>Replace</window.Button>}>
                <div className="row gap-12" style={{ alignItems: "stretch" }}>
                  <div style={{ width: 64, height: 64, borderRadius: 12, background: "var(--brand-blue-50)", color: "var(--brand-blue)", display: "grid", placeItems: "center" }}>
                    <I.Battery size={28} />
                  </div>
                  <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14 }}>
                    <Stat label="Make / Model" value={truck.batteryMake + " · 12V 180Ah"} />
                    <Stat label="Serial" value={truck.batterySerial} mono />
                    <Stat label="Installed" value={V.fmtDate("2023-08-04")} />
                    <Stat label="Warranty expiry" value={
                      <div className="row gap-8">
                        <span>{V.fmtDate(truck.batteryExpiry)}</span>
                        <window.ExpiryPill date={truck.batteryExpiry} />
                      </div>
                    } />
                  </div>
                </div>
              </window.Card>

              <window.Card title="Additional fittings" sub="GPS, cameras, telematics and accessories">
                <table className="tbl">
                  <thead>
                    <tr><th>Type</th><th>Make / Model</th><th>Serial</th><th>Installed</th><th>Warranty / AMC</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><div className="row gap-8"><I.MapPin size={14} /> GPS Tracker</div></td>
                      <td>iTriangle XT8000</td>
                      <td className="mono">XT8000-94412</td>
                      <td>{V.fmtDate("2023-04-22")}</td>
                      <td><span className="muted">AMC </span><window.ExpiryPill date="2027-04-22" /></td>
                      <td><window.Badge tone="success" dot>Working</window.Badge></td>
                    </tr>
                    <tr>
                      <td><div className="row gap-8"><I.Camera size={14} /> Driver-facing camera</div></td>
                      <td>Mobileye 6 Series</td>
                      <td className="mono">MB6-118-A002</td>
                      <td>{V.fmtDate("2023-09-15")}</td>
                      <td><span className="muted">AMC </span><window.ExpiryPill date="2026-09-15" /></td>
                      <td><window.Badge tone="success" dot>Working</window.Badge></td>
                    </tr>
                    <tr>
                      <td><div className="row gap-8"><I.Tag size={14} /> FASTag</div></td>
                      <td>SBI ETC</td>
                      <td className="mono">607498661120-A</td>
                      <td>{V.fmtDate("2022-04-15")}</td>
                      <td><span className="muted">—</span></td>
                      <td><window.Badge tone="success" dot>Working</window.Badge></td>
                    </tr>
                    <tr>
                      <td><div className="row gap-8"><I.Zap size={14} /> Telematics</div></td>
                      <td>Geotab GO9</td>
                      <td className="mono">GO9-77881</td>
                      <td>{V.fmtDate("2024-01-10")}</td>
                      <td><span className="muted">AMC </span><window.ExpiryPill date="2026-06-10" /></td>
                      <td><window.Badge tone="warn" dot>Faulty</window.Badge></td>
                    </tr>
                  </tbody>
                </table>
              </window.Card>
            </div>

            <div className="col gap-16">
              <window.Card title="Currently coupled">
                {trailer ? (
                  <div>
                    <div className="row gap-12">
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--brand-blue-50)", color: "var(--brand-blue)", display: "grid", placeItems: "center" }}>
                        <I.Trailer size={20} />
                      </div>
                      <div>
                        <div className="mono" style={{ fontWeight: 500 }}>{trailer.reg}</div>
                        <div className="secondary">{trailer.code} · {trailer.type}</div>
                      </div>
                    </div>
                    <div className="divider" />
                    <div className="col gap-8" style={{ fontSize: 12.5 }}>
                      <div className="row" style={{ justifyContent: "space-between" }}><span className="muted">Coupled since</span><span>18 Apr 2026, 08:14</span></div>
                      <div className="row" style={{ justifyContent: "space-between" }}><span className="muted">Purpose</span><span>JNPT → Dahej LNG</span></div>
                      <div className="row" style={{ justifyContent: "space-between" }}><span className="muted">Coupled by</span><span>K. Joshi</span></div>
                    </div>
                    <window.Button size="sm" style={{ width: "100%", marginTop: 12 }} variant="ghost" onClick={() => onNav("coupling")}>
                      View coupling history →
                    </window.Button>
                  </div>
                ) : (
                  <window.EmptyState icon={I.Trailer} title="Uncoupled">No trailer currently attached.</window.EmptyState>
                )}
              </window.Card>

              <window.Card title="Key metrics">
                <div className="col gap-12">
                  <MetricRow label="Total km run" value={V.fmtKM(truck.odo)} />
                  <MetricRow label="km this month" value="3,420 km" />
                  <MetricRow label="Fuel efficiency" value="3.2 km/L" trend="+4% vs avg" />
                  <MetricRow label="Maintenance cost / km" value="₹2.84" trend="-8% vs Q4" />
                  <MetricRow label="Uptime (90d)" value="96.4%" />
                  <MetricRow label="Open issues" value="0" />
                </div>
              </window.Card>

              <window.Card title="Quick actions">
                <div className="col gap-8">
                  <window.Button style={{ width: "100%", justifyContent: "flex-start" }} icon={I.Wrench} onClick={() => onNav("workbench")}>Schedule maintenance</window.Button>
                  <window.Button style={{ width: "100%", justifyContent: "flex-start" }} icon={I.Tyre} onClick={() => onNav("tyres")}>Tyre rotation</window.Button>
                  <window.Button style={{ width: "100%", justifyContent: "flex-start" }} icon={I.Clipboard} onClick={() => onNav("pdi")}>Run PDI</window.Button>
                  <window.Button style={{ width: "100%", justifyContent: "flex-start" }} icon={I.AlertTriangle}>Report defect</window.Button>
                </div>
              </window.Card>
            </div>
          </div>
        )}

        {tab === "Documents" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            {[
              { name: "Insurance Policy", number: "POL/MH/26/" + truck.code.slice(-4), expiry: truck.insurance, mandatory: true },
              { name: "Fitness Certificate", number: "FIT/RTO/26/" + truck.code.slice(-4), expiry: truck.fitness, mandatory: true },
              { name: "National Permit", number: "NP/RTO/26/" + truck.code.slice(-4), expiry: truck.permit, mandatory: true },
              ...(truck.peso ? [{ name: "PESO Certificate", number: "PESO/MUM/2026/" + truck.code.slice(-4), expiry: truck.peso, mandatory: true, special: true }] : []),
              ...(truck.piping ? [{ name: "Piping Certificate", number: "PIP/MUM/2026/" + truck.code.slice(-4), expiry: truck.piping, mandatory: true, special: true }] : []),
              { name: "Purchase Invoice", number: "INV/" + truck.code.slice(-4), expiry: null, mandatory: true, oneTime: true },
              { name: "CIN Stencil Sketch", number: "—", expiry: null, mandatory: true, oneTime: true, image: true },
              { name: "Chassis Stencil Sketch", number: "—", expiry: null, mandatory: true, oneTime: true, image: true },
              { name: "Road Tax Receipt", number: "RT/2026/" + truck.code.slice(-4), expiry: "2027-04-01", mandatory: false },
            ].map(d => (
              <div key={d.name} className="card" style={{ padding: 14 }}>
                <div className="row" style={{ alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div className="row gap-12">
                    <div style={{ width: 40, height: 48, borderRadius: 6, background: d.special ? "var(--info-bg)" : "var(--surface-3)", display: "grid", placeItems: "center", color: d.special ? "var(--info)" : "var(--text-3)" }}>
                      <I.FileText size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{d.name}</div>
                      <div className="secondary mono" style={{ fontSize: 11.5 }}>{d.number}</div>
                      {d.expiry && (
                        <div className="row gap-8" style={{ marginTop: 6 }}>
                          <span className="secondary" style={{ fontSize: 11.5 }}>Expires {V.fmtDate(d.expiry)}</span>
                          <window.ExpiryPill date={d.expiry} />
                        </div>
                      )}
                    </div>
                  </div>
                  <window.IconButton icon={I.More} />
                </div>
                <div className="row gap-8" style={{ marginTop: 12 }}>
                  <window.Button size="sm" variant="ghost" icon={I.Eye}>View</window.Button>
                  <window.Button size="sm" variant="ghost" icon={I.Download}>Download</window.Button>
                  {d.expiry && <window.Button size="sm" variant="ghost" icon={I.Refresh}>Renew</window.Button>}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Maintenance" && (
          <div className="col gap-16">
            <window.Card title="Open jobs" flush>
              <table className="tbl">
                <thead><tr><th>Job</th><th>Template</th><th>Due</th><th>Status</th><th>Vendor</th><th className="num">Est. cost</th></tr></thead>
                <tbody>
                  {V.JOBS.filter(j => j.truckCode === truck.code && j.status !== "Completed").map(j => (
                    <tr key={j.id} className="clickable" onClick={() => onNav("workbench")}>
                      <td className="mono">{j.id}</td>
                      <td>{j.template}</td>
                      <td>{V.fmtDate(j.dueDate)}</td>
                      <td><window.StatusBadge value={j.status} /></td>
                      <td>{j.assignedVendor || <span className="muted">Unassigned</span>}</td>
                      <td className="num tnum">{V.fmtINR(V.SCHEDULE_TEMPLATES.find(t => t.name === j.template)?.cost || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </window.Card>
            <window.Card title="Service history" flush>
              <table className="tbl">
                <thead><tr><th>Job</th><th>Template</th><th>Completed</th><th>Vendor</th><th className="num">Cost</th><th>Invoice</th></tr></thead>
                <tbody>
                  {V.JOBS.filter(j => j.truckCode === truck.code && j.status === "Completed").map(j => (
                    <tr key={j.id}>
                      <td className="mono">{j.id}</td>
                      <td>{j.template}</td>
                      <td>{V.fmtDate(j.completedDate)}</td>
                      <td>{j.assignedVendor}</td>
                      <td className="num tnum">{V.fmtINR(j.actualCost)}</td>
                      <td><window.Button size="sm" variant="ghost" icon={I.Eye}>View PDF</window.Button></td>
                    </tr>
                  ))}
                  <tr>
                    <td className="mono">JOB-1019</td><td>6-Month Safety Inspection</td><td>{V.fmtDate("2026-03-04")}</td><td>Sterling Auto Services</td><td className="num tnum">₹6,800</td><td><window.Button size="sm" variant="ghost" icon={I.Eye}>View PDF</window.Button></td>
                  </tr>
                  <tr>
                    <td className="mono">JOB-1004</td><td>10,000 km Engine Service</td><td>{V.fmtDate("2026-01-22")}</td><td>Sterling Auto Services</td><td className="num tnum">₹12,150</td><td><window.Button size="sm" variant="ghost" icon={I.Eye}>View PDF</window.Button></td>
                  </tr>
                </tbody>
              </table>
            </window.Card>
          </div>
        )}

        {tab === "Tyres & Fittings" && (
          <window.EmptyState icon={I.Tyre} title="Open Tyre Management" action={
            <window.Button variant="primary" onClick={() => onNav("tyres")}>Go to Tyre Management →</window.Button>
          }>
            Full tyre map, rotation history and CPK analytics for this truck live in the Tyre module.
          </window.EmptyState>
        )}

        {tab === "PDI History" && (
          <window.Card flush>
            <table className="tbl">
              <thead><tr><th>PDI ID</th><th>Type</th><th>Date</th><th>Odometer</th><th>Inspected by</th><th>Result</th></tr></thead>
              <tbody>
                <tr className="clickable" onClick={() => onNav("pdi")}><td className="mono">PDI-2026-0028</td><td>Post-Major Repair</td><td>{V.fmtDate("2026-04-28")}</td><td className="tnum">141,200 km</td><td>K. Joshi</td><td><window.Badge tone="success">Pass</window.Badge></td></tr>
                <tr><td className="mono">PDI-2025-0211</td><td>Periodic</td><td>{V.fmtDate("2025-11-12")}</td><td className="tnum">122,800 km</td><td>K. Joshi</td><td><window.Badge tone="success">Pass</window.Badge></td></tr>
                <tr><td className="mono">PDI-2022-0004</td><td>New Vehicle</td><td>{V.fmtDate("2022-04-15")}</td><td className="tnum">0 km</td><td>K. Joshi</td><td><window.Badge tone="success">Pass</window.Badge></td></tr>
              </tbody>
            </table>
          </window.Card>
        )}

        {tab === "Activity" && (
          <window.Card>
            <div className="timeline">
              <div className="ev"><div className="when">Today, 08:14</div><div className="what"><b>K. Joshi</b> coupled to trailer <span className="mono">MH04 EZ 1102</span></div></div>
              <div className="ev"><div className="when">Yesterday</div><div className="what"><b>System</b> generated PM reminder for 10,000 km Engine Service</div></div>
              <div className="ev"><div className="when">4 May 2026</div><div className="what"><b>Traffic Police</b> issued challan CHL-2026-0212 (over-speeding, ₹2,000)</div></div>
              <div className="ev"><div className="when">28 Apr 2026</div><div className="what"><b>K. Joshi</b> completed PDI PDI-2026-0028, result Pass</div></div>
              <div className="ev"><div className="when">26 Apr 2026</div><div className="what"><b>Sterling Auto</b> completed 40,000 km Major Service (JOB-1037), ₹41,200</div></div>
              <div className="ev"><div className="when">15 Apr 2022</div><div className="what"><b>System</b> · Vehicle onboarded by Anika Mehta</div></div>
            </div>
          </window.Card>
        )}
      </div>
    </window.Drawer>
  );
}

function Stat({ label, value, mono, small, lock }) {
  return (
    <div>
      <div className="muted" style={{ fontSize: 11.5, marginBottom: 3, display: "flex", alignItems: "center", gap: 4 }}>
        {label}
        {lock && <span style={{ fontSize: 10 }}>🔒</span>}
      </div>
      <div style={{
        fontSize: small ? 12 : 13,
        fontWeight: 500,
        fontFamily: mono ? "var(--font-mono)" : "inherit",
        letterSpacing: mono ? "-0.01em" : "inherit",
        wordBreak: "break-all",
      }}>{value}</div>
    </div>
  );
}

function MetricRow({ label, value, trend }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--divider)" }}>
      <span className="muted" style={{ fontSize: 12.5 }}>{label}</span>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>{value}</div>
        {trend && <div className="muted" style={{ fontSize: 11, color: trend.startsWith("+") || trend.startsWith("-") ? trend.startsWith("-") ? "var(--success)" : "var(--success)" : "var(--text-3)" }}>{trend}</div>}
      </div>
    </div>
  );
}

window.VehiclesScreen = VehiclesScreen;
