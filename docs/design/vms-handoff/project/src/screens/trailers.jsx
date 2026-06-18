// Trailers — mirrors Vehicles but trailer-specific.

function TrailersScreen({ onNav }) {
  const V = window.VMS;
  const I = window.Icons;
  const [tab, setTab] = React.useState("All");
  const [selected, setSelected] = React.useState(null);

  const filtered = V.TRAILERS.filter(t =>
    tab === "All" ? true :
    tab === "Coupled" ? t.coupledTo :
    tab === "Uncoupled" ? !t.coupledTo && t.status === "Active" :
    tab === "Non-Working" ? t.status === "Non-Working" :
    true
  );

  const counts = {
    All: V.TRAILERS.length,
    Coupled: V.TRAILERS.filter(t => t.coupledTo).length,
    Uncoupled: V.TRAILERS.filter(t => !t.coupledTo && t.status === "Active").length,
    "Non-Working": V.TRAILERS.filter(t => t.status === "Non-Working").length,
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Trailers</h1>
          <div className="sub">Master records for all trailers — including LNG/CNG tanker trailers with PESO compliance.</div>
        </div>
        <div className="row gap-8">
          <window.Button variant="ghost" icon={I.Download}>Export</window.Button>
          <window.Button variant="primary" icon={I.Plus}>Onboard trailer</window.Button>
        </div>
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
          <window.Filter label="Depot" value="All" />
          <window.Filter label="Type" value="All" />
          <window.Filter label="Ownership" value="All" />
          <div className="grow" />
          <window.Segmented value="Table" onChange={() => {}} options={["Table", "Cards"]} />
        </window.Toolbar>
        <table className="tbl">
          <thead>
            <tr>
              <th>Registration</th>
              <th>Code</th>
              <th>Type</th>
              <th>Make / Model</th>
              <th className="num">Capacity</th>
              <th className="num">Tyres</th>
              <th>Depot</th>
              <th>Coupled to</th>
              <th>Documents</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => {
              const docs = [
                { label: "Ins", date: t.insurance },
                { label: "Fit", date: t.fitness },
                ...(t.peso ? [{ label: "PESO", date: t.peso }] : []),
                ...(t.piping ? [{ label: "Pipe", date: t.piping }] : []),
              ];
              const coupledTruck = V.TRUCKS.find(x => x.code === t.coupledTo);
              return (
                <tr key={t.code} className="clickable" onClick={() => setSelected(t)}>
                  <td><div className="mono" style={{ fontWeight: 500 }}>{t.reg}</div></td>
                  <td className="mono secondary">{t.code}</td>
                  <td>
                    <div>{t.type}</div>
                    {t.type.includes("LNG") && <window.Badge tone="info" outline>LNG</window.Badge>}
                    {t.type.includes("CNG") && <window.Badge tone="info" outline>CNG</window.Badge>}
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{t.make}</div>
                    <div className="secondary">{t.model}</div>
                  </td>
                  <td className="num tnum">{t.payload.toLocaleString("en-IN")} kg</td>
                  <td className="num tnum">{t.tyres}</td>
                  <td>{V.DEPOTS.find(d => d.code === t.depot)?.name.split(",")[0]}</td>
                  <td>
                    {coupledTruck ? (
                      <div className="row gap-8">
                        <I.Coupling size={14} className="muted" />
                        <span className="mono">{coupledTruck.reg}</span>
                      </div>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                  <td>
                    <div className="row gap-4" style={{ flexWrap: "wrap" }}>
                      {docs.map(d => {
                        const days = V.daysFromNow(d.date);
                        const tone = days < 0 ? "danger" : days <= 30 ? "warn" : "success";
                        return <window.Badge key={d.label} tone={tone} outline>{d.label}</window.Badge>;
                      })}
                    </div>
                  </td>
                  <td><window.StatusBadge value={t.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && <TrailerDetail trailer={selected} onClose={() => setSelected(null)} onNav={onNav} />}
    </div>
  );
}

function TrailerDetail({ trailer, onClose, onNav }) {
  const V = window.VMS;
  const I = window.Icons;
  const coupledTruck = V.TRUCKS.find(t => t.code === trailer.coupledTo);
  return (
    <window.Drawer onClose={onClose} width={820}>
      <div className="dh">
        <div className="row gap-12">
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#0b1220", color: "#cbd5e1", display: "grid", placeItems: "center" }}>
            <I.Trailer size={22} />
          </div>
          <div>
            <h2>{trailer.reg}</h2>
            <div className="meta"><span className="mono">{trailer.code}</span> · {trailer.type} · {trailer.make} {trailer.model}</div>
          </div>
        </div>
        <div className="row gap-8" style={{ marginLeft: "auto" }}>
          <window.StatusBadge value={trailer.status} />
          <window.IconButton icon={I.X} onClick={onClose} />
        </div>
      </div>
      <div className="db" style={{ padding: 24 }}>
        <div className="col gap-16">
          {coupledTruck && (
            <div className="card" style={{ padding: 14, background: "var(--info-bg)", border: "1px solid var(--info-border)" }}>
              <div className="row gap-12">
                <I.Coupling size={20} style={{ color: "var(--info)" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>Currently coupled to <span className="mono">{coupledTruck.reg}</span></div>
                  <div className="muted" style={{ fontSize: 12 }}>Coupled since 18 Apr 2026 · K. Joshi · JNPT → Dahej LNG dispatch</div>
                </div>
                <window.Button size="sm" onClick={() => onNav("coupling")}>View coupling →</window.Button>
              </div>
            </div>
          )}

          <window.Card title="Basic identification">
            <div className="field-row cols-3">
              <Stat label="Trailer code" value={trailer.code} mono />
              <Stat label="VIN" value={trailer.vin} mono small lock />
              <Stat label="Chassis number" value={"CH-" + trailer.vin.slice(-8)} mono lock />
              <Stat label="Make / Model" value={`${trailer.make} ${trailer.model}`} />
              <Stat label="Year" value={trailer.year} />
              <Stat label="Type" value={trailer.type} />
              <Stat label="Payload capacity" value={trailer.payload.toLocaleString("en-IN") + " kg"} />
              <Stat label="Axles" value={trailer.axles} />
              <Stat label="Tyres" value={trailer.tyres} />
            </div>
          </window.Card>

          <window.Card title="Documents">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
              {[
                { name: "Insurance Policy", expiry: trailer.insurance },
                { name: "Fitness Certificate", expiry: trailer.fitness },
                ...(trailer.peso ? [{ name: "PESO Certificate", expiry: trailer.peso, special: true }] : []),
                ...(trailer.piping ? [{ name: "Piping Certificate", expiry: trailer.piping, special: true }] : []),
              ].map(d => (
                <div key={d.name} style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 8, display: "flex", gap: 10, alignItems: "center" }}>
                  <I.FileText size={20} style={{ color: d.special ? "var(--info)" : "var(--text-3)" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{d.name}</div>
                    <div className="muted" style={{ fontSize: 11.5 }}>Expires {V.fmtDate(d.expiry)}</div>
                  </div>
                  <window.ExpiryPill date={d.expiry} />
                </div>
              ))}
            </div>
          </window.Card>

          <window.Card title="Tyre map" sub={`${trailer.tyres} tyres across ${trailer.axles} axles`}>
            <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>Tap any tyre to see its history</div>
            <TrailerTyreMap trailer={trailer} />
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <window.Button size="sm" variant="ghost" onClick={() => onNav("tyres")}>Open Tyre Management →</window.Button>
            </div>
          </window.Card>
        </div>
      </div>
    </window.Drawer>
  );
}

function TrailerTyreMap({ trailer }) {
  return (
    <div className="axle-map">
      {Array.from({ length: trailer.axles }).map((_, ai) => {
        const isFront = ai === 0;
        const tyresPerSide = isFront ? 1 : 2;
        return (
          <div key={ai} className="axle">
            <div className="lbl">Axle {ai + 1}</div>
            <div style={{ position: "relative" }}>
              <div className="bar" />
              <div className="wheels" style={{ position: "absolute", top: -27, left: 0, right: 0 }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {Array.from({ length: tyresPerSide }).map((_, i) => <div key={i} className="tyre">L{ai+1}{i+1}</div>)}
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {Array.from({ length: tyresPerSide }).map((_, i) => <div key={i} className="tyre">R{ai+1}{i+1}</div>)}
                </div>
              </div>
            </div>
            <div className="lbl">{tyresPerSide * 2} tyres</div>
          </div>
        );
      })}
    </div>
  );
}

function Stat({ label, value, mono, small, lock }) {
  return (
    <div>
      <div className="muted" style={{ fontSize: 11.5, marginBottom: 3 }}>{label} {lock && "🔒"}</div>
      <div style={{ fontSize: small ? 12 : 13, fontWeight: 500, fontFamily: mono ? "var(--font-mono)" : "inherit" }}>{value}</div>
    </div>
  );
}

window.TrailersScreen = TrailersScreen;
