// Coupling Board — Kanban-style view of trucks ↔ trailers + history.

function CouplingScreen({ onNav }) {
  const V = window.VMS;
  const I = window.Icons;
  const [showCouple, setShowCouple] = React.useState(false);

  const coupledPairs = V.COUPLINGS.filter(c => c.status === "Coupled");
  const uncoupledTrucks = V.TRUCKS.filter(t => t.status === "Active" && !V.TRAILERS.some(tr => tr.coupledTo === t.code));
  const uncoupledTrailers = V.TRAILERS.filter(t => t.status === "Active" && !t.coupledTo);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Coupling Board</h1>
          <div className="sub">Truck–trailer pairings. Only Active vehicles can be coupled; one trailer per truck at a time.</div>
        </div>
        <div className="row gap-8">
          <window.Button variant="ghost" icon={I.Download}>Coupling history</window.Button>
          <window.Button variant="primary" icon={I.Coupling} onClick={() => setShowCouple(true)}>New coupling</window.Button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
        <window.KPI label="Currently coupled" value={coupledPairs.length} icon={I.Coupling} suffix="pairs" />
        <window.KPI label="Trucks waiting" value={uncoupledTrucks.length} icon={I.Truck} trend="2 in maintenance, 1 free" />
        <window.KPI label="Trailers waiting" value={uncoupledTrailers.length} icon={I.Trailer} trend="1 fitness pending" />
        <window.KPI label="Couplings today" value="1" icon={I.Activity} trend="0 decoupled" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr 1fr", gap: 16 }}>
        <window.Card title="Active couplings" sub={`${coupledPairs.length} pairings · live`}>
          <div className="col gap-12">
            {coupledPairs.map(c => {
              const truck = V.TRUCKS.find(t => t.code === c.truck);
              const trailer = V.TRAILERS.find(t => t.code === c.trailer);
              return (
                <div key={c.id} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 14, background: "white" }}>
                  <div className="row" style={{ gap: 12, alignItems: "stretch" }}>
                    <CouplingCard kind="truck" reg={c.truckReg} code={c.truck} meta={truck ? `${truck.make} ${truck.model}` : "—"} />
                    <div style={{ display: "grid", placeItems: "center", gap: 6, padding: "0 6px" }}>
                      <div style={{ width: 28, height: 28, borderRadius: 50, background: "var(--brand-blue-50)", color: "var(--brand-blue)", display: "grid", placeItems: "center" }}>
                        <I.Coupling size={16} />
                      </div>
                      <div className="muted" style={{ fontSize: 11, whiteSpace: "nowrap" }}>{c.coupledAt.split(" ")[0]}</div>
                    </div>
                    <CouplingCard kind="trailer" reg={c.trailerReg} code={c.trailer} meta={trailer ? trailer.type : "—"} />
                  </div>
                  <div className="divider" style={{ margin: "12px 0" }} />
                  <div className="row" style={{ justifyContent: "space-between", fontSize: 12 }}>
                    <div className="row gap-12">
                      <span className="muted">Coupled by <b style={{ color: "var(--text)" }}>{c.coupledBy}</b></span>
                      <span className="muted">·</span>
                      <span className="muted">Odo at coupling <b className="mono">{c.odo.toLocaleString("en-IN")}</b></span>
                      <span className="muted">·</span>
                      <span className="muted">Purpose: <b style={{ color: "var(--text)" }}>{c.purpose}</b></span>
                    </div>
                    <window.Button size="sm" variant="ghost">Decouple →</window.Button>
                  </div>
                </div>
              );
            })}
          </div>
        </window.Card>

        <window.Card title={`Available trucks (${uncoupledTrucks.length})`} sub="Ready to couple">
          <div className="col gap-8">
            {uncoupledTrucks.map(t => (
              <div key={t.code} style={{ padding: 10, border: "1px solid var(--border)", borderRadius: 8, display: "flex", gap: 10, alignItems: "center" }}>
                <I.Truck size={18} className="muted" />
                <div style={{ flex: 1 }}>
                  <div className="mono" style={{ fontSize: 12.5, fontWeight: 500 }}>{t.reg}</div>
                  <div className="muted" style={{ fontSize: 11 }}>{t.make} · {t.depot}</div>
                </div>
                <window.IconButton icon={I.Plus} />
              </div>
            ))}
            {uncoupledTrucks.length === 0 && <div className="empty" style={{ padding: 18 }}>All trucks coupled or non-working.</div>}
          </div>
        </window.Card>

        <window.Card title={`Available trailers (${uncoupledTrailers.length})`} sub="Ready to couple">
          <div className="col gap-8">
            {uncoupledTrailers.map(t => (
              <div key={t.code} style={{ padding: 10, border: "1px solid var(--border)", borderRadius: 8, display: "flex", gap: 10, alignItems: "center" }}>
                <I.Trailer size={18} className="muted" />
                <div style={{ flex: 1 }}>
                  <div className="mono" style={{ fontSize: 12.5, fontWeight: 500 }}>{t.reg}</div>
                  <div className="muted" style={{ fontSize: 11 }}>{t.type} · {t.depot}</div>
                </div>
                <window.IconButton icon={I.Plus} />
              </div>
            ))}
            {uncoupledTrailers.length === 0 && <div className="empty" style={{ padding: 18 }}>All active trailers coupled.</div>}
          </div>
        </window.Card>
      </div>

      <div style={{ marginTop: 16 }}>
        <window.Card title="Coupling history" sub="Includes both currently coupled and previously decoupled pairs" flush>
          <table className="tbl">
            <thead>
              <tr>
                <th>Transaction</th><th>Truck</th><th>Trailer</th><th>Coupled</th><th>Decoupled</th><th>Duration</th><th>By</th><th>Purpose</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {V.COUPLINGS.map(c => {
                const start = new Date(c.coupledAt);
                const end = c.decoupledAt ? new Date(c.decoupledAt) : V.today;
                const days = Math.round((end - start) / 86400000);
                return (
                  <tr key={c.id}>
                    <td className="mono">{c.id}</td>
                    <td className="mono">{c.truckReg}</td>
                    <td className="mono">{c.trailerReg}</td>
                    <td>{c.coupledAt}</td>
                    <td>{c.decoupledAt || <span className="muted">—</span>}</td>
                    <td className="tnum">{days}d{c.status === "Coupled" ? " (active)" : ""}</td>
                    <td>{c.coupledBy}</td>
                    <td className="secondary">{c.purpose}</td>
                    <td><window.StatusBadge value={c.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </window.Card>
      </div>

      {showCouple && <NewCouplingModal onClose={() => setShowCouple(false)} uncoupledTrucks={uncoupledTrucks} uncoupledTrailers={uncoupledTrailers} />}
    </div>
  );
}

function CouplingCard({ kind, reg, code, meta }) {
  const I = window.Icons;
  const Ico = kind === "truck" ? I.Truck : I.Trailer;
  return (
    <div style={{ flex: 1, padding: 12, border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface-2)" }}>
      <div className="row gap-8">
        <div style={{ width: 32, height: 32, borderRadius: 7, background: "white", border: "1px solid var(--border)", display: "grid", placeItems: "center", color: "var(--text-2)" }}>
          <Ico size={16} />
        </div>
        <div>
          <div className="mono" style={{ fontWeight: 500, fontSize: 13 }}>{reg}</div>
          <div className="muted mono" style={{ fontSize: 11 }}>{code}</div>
        </div>
      </div>
      <div className="muted" style={{ fontSize: 11.5, marginTop: 6 }}>{meta}</div>
    </div>
  );
}

function NewCouplingModal({ onClose, uncoupledTrucks, uncoupledTrailers }) {
  const I = window.Icons;
  return (
    <window.Modal onClose={onClose} width={640}>
      <div className="mh">
        <h3>New coupling</h3>
        <div style={{ marginLeft: "auto" }}><window.IconButton icon={I.X} onClick={onClose} /></div>
      </div>
      <div className="mb">
        <div className="field-row cols-2">
          <window.Field label="Truck" required>
            <window.Select>
              <option>— Select truck —</option>
              {uncoupledTrucks.map(t => <option key={t.code}>{t.reg} · {t.code}</option>)}
            </window.Select>
          </window.Field>
          <window.Field label="Trailer" required>
            <window.Select>
              <option>— Select trailer —</option>
              {uncoupledTrailers.map(t => <option key={t.code}>{t.reg} · {t.code}</option>)}
            </window.Select>
          </window.Field>
          <window.Field label="Coupling date & time" required>
            <window.Input type="datetime-local" defaultValue="2026-05-19T14:00" />
          </window.Field>
          <window.Field label="Odometer at coupling" required>
            <window.Input placeholder="e.g. 142,875 km" />
          </window.Field>
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label>Purpose / Trip description</label>
          <window.Textarea placeholder="e.g. JNPT → Dahej LNG dispatch (Round 14)" />
        </div>
      </div>
      <div className="mf">
        <window.Button onClick={onClose}>Cancel</window.Button>
        <window.Button variant="primary" icon={I.Coupling} onClick={onClose}>Couple</window.Button>
      </div>
    </window.Modal>
  );
}

window.CouplingScreen = CouplingScreen;
