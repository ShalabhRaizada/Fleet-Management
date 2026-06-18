// Maintenance Manager Dashboard — home screen.

function DashboardScreen({ onNav }) {
  const V = window.VMS;
  const I = window.Icons;

  const activeTrucks = V.TRUCKS.filter(t => t.status === "Active").length;
  const nonWorking = V.TRUCKS.filter(t => t.status === "Non-Working").length;
  const overdueJobs = V.JOBS.filter(j => j.status === "Overdue").length;
  const dueJobs = V.JOBS.filter(j => j.status === "Due" || j.status === "In Progress").length;
  const expiringDocs = V.COMPLIANCE.filter(d => {
    const days = V.daysFromNow(d.expiry);
    return days <= 30 && days >= 0;
  }).length;
  const expiredDocs = V.COMPLIANCE.filter(d => V.daysFromNow(d.expiry) < 0).length;

  const todayJobs = V.JOBS.filter(j => ["Overdue", "Due", "In Progress"].includes(j.status))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Good morning, Anika</h1>
          <div className="sub">Tuesday, 19 May 2026 · 8 trucks active · 4 jobs need your attention</div>
        </div>
        <div className="row gap-8">
          <window.Button variant="ghost" icon={I.Download}>Export brief</window.Button>
          <window.Button variant="primary" icon={I.Plus} onClick={() => onNav("workbench")}>
            New maintenance job
          </window.Button>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 20 }}>
        <window.KPI
          label="Active fleet"
          value={activeTrucks}
          suffix={`/ ${V.TRUCKS.length} trucks`}
          icon={I.Truck}
          trend="2 onboarded this month"
          trendDir="up"
        />
        <window.KPI
          label="Non-working"
          value={nonWorking}
          icon={I.AlertTriangle}
          trend="1 critical, 1 escalated"
          trendDir="down"
        />
        <window.KPI
          label="PM jobs overdue"
          value={overdueJobs}
          icon={I.Clock}
          trend={dueJobs + " due / in progress"}
        />
        <window.KPI
          label="Documents expiring"
          value={expiringDocs}
          suffix={`+${expiredDocs} expired`}
          icon={I.Shield}
          trend="Next: PESO KA03 MN 4419, 7 days"
        />
        <window.KPI
          label="Tyre CPK avg."
          value="₹2.14"
          suffix="/km"
          icon={I.Tyre}
          trend="6.2% below target"
          trendDir="up"
          sparkData={[7, 8, 6, 9, 11, 10, 8, 9, 7, 6, 7, 5]}
        />
      </div>

      {/* Two-column body */}
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 16 }}>
        {/* Today's queue */}
        <window.Card
          title="My queue — needs assignment or follow-up"
          sub="Jobs assigned to you as Maintenance Manager"
          action={
            <div className="row gap-8">
              <window.Segmented value="Today" onChange={() => {}} options={["Today", "Week", "Month"]} />
              <window.IconButton icon={I.More} />
            </div>
          }
          flush
        >
          <table className="tbl">
            <thead>
              <tr>
                <th>Job</th>
                <th>Vehicle</th>
                <th>Template</th>
                <th>Due</th>
                <th>Priority</th>
                <th>Vendor</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {todayJobs.map(j => {
                const daysOver = V.daysFromNow(j.dueDate);
                return (
                  <tr key={j.id} className="clickable" onClick={() => onNav("workbench")}>
                    <td className="mono" style={{ fontWeight: 500 }}>{j.id}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{j.truck}</div>
                      <div className="secondary mono">{j.truckCode}</div>
                    </td>
                    <td>
                      <div>{j.template}</div>
                      <div className="secondary">{j.category}</div>
                    </td>
                    <td>
                      <div>{V.fmtDate(j.dueDate)}</div>
                      <div className="secondary" style={{ color: daysOver < 0 ? "var(--danger)" : daysOver <= 3 ? "var(--warn)" : "var(--text-3)" }}>
                        {daysOver < 0 ? `${-daysOver}d overdue` : daysOver === 0 ? "today" : `in ${daysOver}d`}
                      </div>
                    </td>
                    <td><window.PriorityBadge value={j.priority} /></td>
                    <td>
                      {j.assignedVendor ? (
                        <span>{j.assignedVendor}</span>
                      ) : (
                        <span style={{ color: "var(--danger)", fontWeight: 500 }}>Unassigned</span>
                      )}
                    </td>
                    <td className="actions">
                      <window.IconButton icon={I.ChevronRight} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </window.Card>

        {/* Live alerts */}
        <window.Card
          title="Live alerts"
          sub="Auto-generated from compliance, EPIC and PM rules"
          action={<window.Button size="sm" variant="ghost" onClick={() => onNav("alerts")}>View all</window.Button>}
        >
          <div className="col" style={{ gap: 6 }}>
            {V.ALERTS_FEED.slice(0, 6).map(a => (
              <div key={a.id} style={{ display: "flex", gap: 10, padding: "10px 6px", borderBottom: "1px solid var(--divider)" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                  background: a.severity === "danger" ? "var(--danger-bg)" : a.severity === "warn" ? "var(--warn-bg)" : "var(--info-bg)",
                  color: a.severity === "danger" ? "var(--danger)" : a.severity === "warn" ? "var(--warn)" : "var(--info)",
                  display: "grid", placeItems: "center",
                }}>
                  <I.AlertTriangle size={14} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 500 }}>{a.type}</span>
                    <span className="secondary" style={{ fontSize: 11.5 }}>{a.time}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--text-2)" }}>{a.message}</div>
                  <div style={{ fontSize: 11.5, marginTop: 2 }} className="muted">
                    <span className="mono">{a.target}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </window.Card>
      </div>

      {/* Second row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 16 }}>
        {/* Document expiry timeline */}
        <window.Card
          title="Document expiry — next 90 days"
          action={<window.Button size="sm" variant="ghost" onClick={() => onNav("compliance")}>Compliance</window.Button>}
        >
          {V.COMPLIANCE
            .map(d => ({ ...d, days: V.daysFromNow(d.expiry) }))
            .filter(d => d.days <= 90)
            .sort((a, b) => a.days - b.days)
            .slice(0, 6)
            .map(d => (
              <div key={d.vCode + d.type} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--divider)" }}>
                <window.Badge tone={d.type === "PESO" || d.type === "Piping" ? "info" : "neutral"} outline>
                  {d.type}
                </window.Badge>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5 }} className="mono">{d.vehicle}</div>
                  <div className="secondary" style={{ fontSize: 11.5 }}>Expires {V.fmtDate(d.expiry)}</div>
                </div>
                <window.ExpiryPill date={d.expiry} />
              </div>
            ))}
        </window.Card>

        {/* Vendor performance */}
        <window.Card
          title="Top vendors — last 30 days"
          action={<window.Button size="sm" variant="ghost" onClick={() => onNav("vendors")}>All vendors</window.Button>}
        >
          {V.VENDORS.filter(v => v.status === "Active" && v.jobsCompleted > 20)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5)
            .map(v => (
              <div key={v.code} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, padding: "8px 0", borderBottom: "1px solid var(--divider)" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }} className="elide">{v.name}</div>
                  <div className="secondary" style={{ fontSize: 11.5 }}>{v.city} · {v.categories.join(", ")}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>
                    <I.Star size={11} style={{ color: "#d97706", verticalAlign: "-1px" }} fill="#d97706" /> {v.rating}
                  </div>
                  <div className="secondary" style={{ fontSize: 11.5 }}>TAT {v.avgTAT}</div>
                </div>
              </div>
            ))}
        </window.Card>

        {/* Maintenance cost trend */}
        <window.Card
          title="Maintenance spend"
          sub="FY26 to date · ₹ lakh"
          action={<window.Segmented value="3M" onChange={() => {}} options={["1M", "3M", "12M"]} />}
        >
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 140, padding: "10px 4px 16px" }}>
            {[6.2, 7.8, 5.4, 9.1, 8.3, 11.4, 9.7, 12.1, 13.2, 10.6, 11.8, 14.2].map((v, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: "100%",
                  height: `${(v / 16) * 100}%`,
                  background: i === 11 ? "var(--brand-blue)" : "var(--brand-blue-100)",
                  borderRadius: "3px 3px 0 0",
                  minHeight: 4,
                }} />
                <span className="secondary" style={{ fontSize: 10 }}>{["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"][i]}</span>
              </div>
            ))}
          </div>
          <div className="row" style={{ justifyContent: "space-between", marginTop: 4 }}>
            <span className="secondary" style={{ fontSize: 11.5 }}>Engine ₹6.4L · Tyre ₹3.8L · Body ₹2.1L · Other ₹1.9L</span>
            <span style={{ fontSize: 12, fontWeight: 500 }} className="tnum">₹14.2L this month</span>
          </div>
        </window.Card>
      </div>

      {/* Third row — fleet status + recent activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16, marginTop: 16 }}>
        <window.Card title="Fleet status by depot">
          <table className="tbl">
            <thead>
              <tr>
                <th>Depot</th>
                <th className="num">Trucks</th>
                <th className="num">Active</th>
                <th className="num">Non-working</th>
                <th className="num">Trailers</th>
                <th>Utilisation</th>
              </tr>
            </thead>
            <tbody>
              {V.DEPOTS.map(d => {
                const trucksAtDepot = V.TRUCKS.filter(t => t.depot === d.code);
                const trailersAtDepot = V.TRAILERS.filter(t => t.depot === d.code);
                const active = trucksAtDepot.filter(t => t.status === "Active").length;
                const nw = trucksAtDepot.filter(t => t.status === "Non-Working").length;
                const util = trucksAtDepot.length ? Math.round((active / trucksAtDepot.length) * 100) : 0;
                return (
                  <tr key={d.code}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{d.name}</div>
                      <div className="secondary mono">{d.code}</div>
                    </td>
                    <td className="num tnum">{trucksAtDepot.length}</td>
                    <td className="num tnum"><window.StatDot tone="active" label={active} /></td>
                    <td className="num tnum">{nw ? <window.StatDot tone="danger" label={nw} /> : <span className="muted">—</span>}</td>
                    <td className="num tnum">{trailersAtDepot.length}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, maxWidth: 180 }}>
                        <div style={{ flex: 1 }}><window.Progress value={util} tone={util > 80 ? "success" : util > 50 ? "" : "warn"} /></div>
                        <span style={{ fontSize: 12, fontWeight: 500, minWidth: 32, textAlign: "right" }} className="tnum">{util}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </window.Card>

        <window.Card title="Recent activity">
          <div className="timeline">
            <div className="ev">
              <div className="when">just now</div>
              <div className="what"><b>K. Joshi</b> coupled <span className="mono">MH04 EQ 8821</span> ↔ <span className="mono">MH04 EZ 1102</span> for Dahej run</div>
            </div>
            <div className="ev">
              <div className="when">12 min ago</div>
              <div className="what"><b>System</b> generated PESO 7-day expiry alert for <span className="mono">KA03 MN 4419</span></div>
            </div>
            <div className="ev">
              <div className="when">1 h ago</div>
              <div className="what"><b>Sterling Auto</b> updated job <span className="mono">JOB-1042</span> status → In Progress</div>
            </div>
            <div className="ev">
              <div className="when">3 h ago</div>
              <div className="what"><b>EPIC 1.0</b> upload: 8 records, 2 newly non-working</div>
            </div>
            <div className="ev">
              <div className="when">Yesterday</div>
              <div className="what"><b>Anika Mehta</b> approved PDI report PDI-2026-0044 for <span className="mono">GJ05 KK 9001</span></div>
            </div>
            <div className="ev">
              <div className="when">Yesterday</div>
              <div className="what"><b>Priya Nair</b> uploaded Insurance renewal for <span className="mono">MH04 EQ 8821</span></div>
            </div>
          </div>
        </window.Card>
      </div>
    </div>
  );
}

window.DashboardScreen = DashboardScreen;
