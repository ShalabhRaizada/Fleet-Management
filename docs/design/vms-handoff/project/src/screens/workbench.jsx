// Maintenance Workbench — the Maintenance Manager's daily planning tool.

function WorkbenchScreen({ onNav }) {
  const V = window.VMS;
  const I = window.Icons;
  const [filter, setFilter] = React.useState("All");
  const [selectedJob, setSelectedJob] = React.useState(null);
  const [showAssign, setShowAssign] = React.useState(null);

  const TAB_DEFS = [
    { key: "All", label: "All", count: V.JOBS.length },
    { key: "Overdue", label: "Overdue", count: V.JOBS.filter(j => j.status === "Overdue").length },
    { key: "Due", label: "Due this week", count: V.JOBS.filter(j => j.status === "Due").length },
    { key: "In Progress", label: "In progress", count: V.JOBS.filter(j => j.status === "In Progress").length },
    { key: "Upcoming", label: "Upcoming", count: V.JOBS.filter(j => j.status === "Upcoming").length },
    { key: "Completed", label: "Completed", count: V.JOBS.filter(j => j.status === "Completed").length },
  ];

  const filtered = filter === "All" ? V.JOBS : V.JOBS.filter(j =>
    filter === "Due" ? j.status === "Due"
      : j.status === filter
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Maintenance Workbench</h1>
          <div className="sub">All preventive and scheduled jobs across the fleet — assign, track and close.</div>
        </div>
        <div className="row gap-8">
          <window.Button variant="ghost" icon={I.Calendar}>Calendar view</window.Button>
          <window.Button variant="ghost" icon={I.Download}>Export</window.Button>
          <window.Button variant="primary" icon={I.Plus}>New job</window.Button>
        </div>
      </div>

      {/* Summary strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ padding: 14 }}>
          <div className="row gap-8" style={{ alignItems: "flex-start" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--danger-bg)", color: "var(--danger)", display: "grid", placeItems: "center" }}>
              <I.AlertTriangle size={18} />
            </div>
            <div>
              <div className="muted" style={{ fontSize: 12 }}>Overdue</div>
              <div style={{ fontSize: 22, fontWeight: 600 }}>2 jobs</div>
              <div className="muted" style={{ fontSize: 11.5 }}>Avg. 3.5 days past due</div>
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: 14 }}>
          <div className="row gap-8" style={{ alignItems: "flex-start" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--warn-bg)", color: "var(--warn)", display: "grid", placeItems: "center" }}>
              <I.Clock size={18} />
            </div>
            <div>
              <div className="muted" style={{ fontSize: 12 }}>Due this week</div>
              <div style={{ fontSize: 22, fontWeight: 600 }}>1 job</div>
              <div className="muted" style={{ fontSize: 11.5 }}>Needs vendor assignment</div>
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: 14 }}>
          <div className="row gap-8" style={{ alignItems: "flex-start" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--info-bg)", color: "var(--info)", display: "grid", placeItems: "center" }}>
              <I.Wrench size={18} />
            </div>
            <div>
              <div className="muted" style={{ fontSize: 12 }}>In progress</div>
              <div style={{ fontSize: 22, fontWeight: 600 }}>1 job</div>
              <div className="muted" style={{ fontSize: 11.5 }}>Sterling Auto · est. 21 May</div>
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: 14 }}>
          <div className="row gap-8" style={{ alignItems: "flex-start" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--success-bg)", color: "var(--success)", display: "grid", placeItems: "center" }}>
              <I.CheckCircle size={18} />
            </div>
            <div>
              <div className="muted" style={{ fontSize: 12 }}>Completed (30d)</div>
              <div style={{ fontSize: 22, fontWeight: 600 }}>14 jobs</div>
              <div className="muted" style={{ fontSize: 11.5 }}>Avg. TAT 2.4 d · ₹2.1L spent</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="page-tabs">
        {TAB_DEFS.map(t => (
          <div key={t.key} className={"page-tab " + (filter === t.key ? "active" : "")} onClick={() => setFilter(t.key)}>
            {t.label}<span className="ct">{t.count}</span>
          </div>
        ))}
      </div>

      {/* Jobs table */}
      <div className="card">
        <window.Toolbar>
          <window.Filter label="Depot" value="All" />
          <window.Filter label="Vehicle type" value="All" />
          <window.Filter label="Category" value="All" />
          <window.Filter label="Priority" value="All" />
          <div className="grow" />
          <div className="row gap-8">
            <window.Segmented value="Table" onChange={() => {}} options={["Table", "Calendar", "Gantt"]} />
            <window.IconButton icon={I.Refresh} />
          </div>
        </window.Toolbar>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 30 }}><window.Checkbox /></th>
              <th>Job ID</th>
              <th>Vehicle</th>
              <th>Schedule template</th>
              <th>Due</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assigned vendor</th>
              <th className="num">Est. cost</th>
              <th style={{ width: 30 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(j => {
              const daysDelta = V.daysFromNow(j.dueDate);
              return (
                <tr key={j.id} className="clickable" onClick={() => setSelectedJob(j)}>
                  <td><window.Checkbox /></td>
                  <td className="mono" style={{ fontWeight: 500 }}>{j.id}</td>
                  <td>
                    <div style={{ fontWeight: 500 }} className="mono">{j.truck}</div>
                    <div className="secondary">{j.truckCode}</div>
                  </td>
                  <td>
                    <div>{j.template}</div>
                    <div className="secondary">{j.category}</div>
                  </td>
                  <td>
                    <div>{V.fmtDate(j.dueDate)}</div>
                    <div className="secondary" style={{ color: daysDelta < 0 ? "var(--danger)" : daysDelta <= 3 ? "var(--warn)" : "var(--text-3)" }}>
                      {j.status === "Completed" ? `Closed ${V.fmtDate(j.completedDate)}` : daysDelta < 0 ? `${-daysDelta}d overdue` : `in ${daysDelta}d`}
                    </div>
                  </td>
                  <td><window.PriorityBadge value={j.priority} /></td>
                  <td><window.StatusBadge value={j.status} /></td>
                  <td>
                    {j.assignedVendor ? (
                      <div>
                        <div style={{ fontSize: 13 }}>{j.assignedVendor}</div>
                        <div className="secondary mono">{j.vendorCode}</div>
                      </div>
                    ) : (
                      <window.Button size="sm" variant="primary" onClick={(e) => { e.stopPropagation(); setShowAssign(j); }}>
                        Assign vendor
                      </window.Button>
                    )}
                  </td>
                  <td className="num tnum">
                    {j.actualCost ? V.fmtINR(j.actualCost) :
                      V.fmtINR(V.SCHEDULE_TEMPLATES.find(t => t.name === j.template)?.cost || 0)}
                  </td>
                  <td className="actions"><window.IconButton icon={I.More} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedJob && <JobDetailDrawer job={selectedJob} onClose={() => setSelectedJob(null)} />}
      {showAssign && <AssignVendorModal job={showAssign} onClose={() => setShowAssign(null)} />}
    </div>
  );
}

function JobDetailDrawer({ job, onClose }) {
  const V = window.VMS;
  const I = window.Icons;
  const tpl = V.SCHEDULE_TEMPLATES.find(t => t.name === job.template);
  return (
    <window.Drawer onClose={onClose}>
      <div className="dh">
        <div>
          <h2><span className="mono">{job.id}</span> · {job.template}</h2>
          <div className="meta">
            <span className="mono">{job.truck}</span> · {job.truckCode} · Due {V.fmtDate(job.dueDate)}
          </div>
        </div>
        <div className="row gap-8" style={{ marginLeft: "auto" }}>
          <window.PriorityBadge value={job.priority} />
          <window.StatusBadge value={job.status} />
          <window.IconButton icon={I.X} onClick={onClose} />
        </div>
      </div>
      <div className="db" style={{ padding: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
          <div className="col gap-16">
            <window.Card title="Job summary">
              <div className="field-row cols-3">
                <window.Field label="Vehicle">
                  <div className="mono" style={{ fontWeight: 500 }}>{job.truck}</div>
                  <div className="secondary">{job.truckCode} · Tata Signa</div>
                </window.Field>
                <window.Field label="Due odometer">
                  <div className="tnum">{V.fmtKM(job.dueOdo)}</div>
                  <div className="secondary">Current 142,875 km</div>
                </window.Field>
                <window.Field label="Category">
                  <window.Badge tone="info">{job.category}</window.Badge>
                </window.Field>
              </div>
              <div className="divider" />
              <div className="field-row cols-3">
                <window.Field label="Estimated duration">{tpl?.duration || "—"}</window.Field>
                <window.Field label="Estimated cost">{V.fmtINR(tpl?.cost || 0)}</window.Field>
                <window.Field label="Checklist items">{tpl?.items || 0} items</window.Field>
              </div>
            </window.Card>

            <window.Card title="Service checklist" sub="Auto-loaded from template; supervisor signs each item off">
              <div className="col gap-8">
                {[
                  { item: "Engine oil & filter change", action: "Drain, replace 15W-40, replace filter", part: "Filter OF-1542", done: job.status === "Completed" || job.status === "In Progress" },
                  { item: "Air filter inspection", action: "Inspect / replace if dust-loaded", part: "AF-9981 (if req.)", done: job.status === "Completed" || job.status === "In Progress" },
                  { item: "Brake fluid level", action: "Top up to MAX line", part: "DOT-4 250ml", done: job.status === "Completed" || job.status === "In Progress" },
                  { item: "Coolant top-up", action: "Top up to MAX, check for leaks", part: "GLY-EXT 1L", done: job.status === "Completed" },
                  { item: "Clutch free-play", action: "Adjust to 25-30mm", part: null, done: job.status === "Completed" },
                  { item: "Battery terminals", action: "Clean & grease", part: null, done: job.status === "Completed" },
                  { item: "Tyre pressure all positions", action: "Set to 110 PSI cold", part: null, done: job.status === "Completed" },
                  { item: "Lights & indicators", action: "Function check", part: null, done: job.status === "Completed" },
                ].map((row, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "20px 1fr 1fr 1fr", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--divider)" }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: 4, border: "1.5px solid " + (row.done ? "var(--success)" : "var(--border-strong)"),
                      background: row.done ? "var(--success)" : "white",
                      display: "grid", placeItems: "center", color: "white",
                    }}>
                      {row.done && <I.Check size={12} />}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: row.done ? 400 : 500 }}>{row.item}</div>
                    <div className="secondary" style={{ fontSize: 12 }}>{row.action}</div>
                    <div className="secondary" style={{ fontSize: 12 }} title={row.part}>{row.part || "—"}</div>
                  </div>
                ))}
              </div>
            </window.Card>

            <window.Card title="Parts & labour">
              <table className="tbl">
                <thead>
                  <tr><th>Part</th><th className="num">Qty</th><th className="num">Unit cost</th><th className="num">Total</th></tr>
                </thead>
                <tbody>
                  <tr><td>Engine oil 15W-40 (15L)</td><td className="num tnum">1</td><td className="num tnum">₹4,200</td><td className="num tnum">₹4,200</td></tr>
                  <tr><td>Oil filter OF-1542</td><td className="num tnum">1</td><td className="num tnum">₹680</td><td className="num tnum">₹680</td></tr>
                  <tr><td>Air filter AF-9981</td><td className="num tnum">1</td><td className="num tnum">₹1,250</td><td className="num tnum">₹1,250</td></tr>
                  <tr><td>Coolant GLY-EXT (1L)</td><td className="num tnum">2</td><td className="num tnum">₹420</td><td className="num tnum">₹840</td></tr>
                  <tr><td><b>Labour (3.5 h @ ₹450/h)</b></td><td className="num tnum">—</td><td className="num tnum">—</td><td className="num tnum">₹1,575</td></tr>
                  <tr style={{ background: "var(--surface-2)" }}>
                    <td colSpan="3" style={{ textAlign: "right", fontWeight: 600 }}>Estimated total</td>
                    <td className="num tnum" style={{ fontWeight: 600 }}>₹8,545</td>
                  </tr>
                </tbody>
              </table>
            </window.Card>
          </div>

          <div className="col gap-16">
            <window.Card title="Assigned vendor">
              {job.assignedVendor ? (
                <div>
                  <div className="row gap-8">
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--brand-blue-50)", color: "var(--brand-blue)", display: "grid", placeItems: "center" }}>
                      <I.Building size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{job.assignedVendor}</div>
                      <div className="secondary mono">{job.vendorCode}</div>
                    </div>
                  </div>
                  <div className="divider" />
                  <div className="col gap-8" style={{ fontSize: 12.5 }}>
                    <div className="row gap-8"><I.Phone size={13} /><span>+91 98220 12345</span></div>
                    <div className="row gap-8"><I.Mail size={13} /><span>ravi@sterling.in</span></div>
                    <div className="row gap-8"><I.Star size={13} /><span>4.6 rating · 142 jobs · 2.1d avg TAT</span></div>
                  </div>
                </div>
              ) : (
                <window.EmptyState icon={I.Briefcase} title="No vendor assigned" action={
                  <window.Button variant="primary" icon={I.Plus}>Assign vendor</window.Button>
                }>
                  Pick from the Vendor Master filtered by job category.
                </window.EmptyState>
              )}
            </window.Card>

            <window.Card title="Timeline">
              <div className="timeline">
                <div className="ev">
                  <div className="when">11 May, 14:22</div>
                  <div className="what"><b>System</b> generated PM job (10,000 km interval reached)</div>
                </div>
                <div className="ev">
                  <div className="when">11 May, 16:05</div>
                  <div className="what"><b>Anika Mehta</b> assigned to Sterling Auto Services</div>
                </div>
                <div className="ev">
                  <div className="when">12 May, 08:00</div>
                  <div className="what"><b>Sterling Auto</b> confirmed slot for 15 May</div>
                </div>
                {job.status === "Overdue" && (
                  <div className="ev">
                    <div className="when">15 May, 17:00</div>
                    <div className="what" style={{ color: "var(--danger)" }}>Job marked <b>overdue</b> — vehicle in transit, slot missed</div>
                  </div>
                )}
              </div>
            </window.Card>

            <window.Card title="Attachments">
              <div className="col gap-8">
                <window.Drop filled fileName="Service-checklist-TPL-001.pdf" />
                <window.Drop hint="Attach invoice, vendor estimate, etc." />
              </div>
            </window.Card>
          </div>
        </div>
      </div>
      <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border)", background: "white", display: "flex", gap: 8, justifyContent: "space-between" }}>
        <window.Button variant="ghost" icon={I.Trash}>Cancel job</window.Button>
        <div className="row gap-8">
          <window.Button variant="ghost">Save draft</window.Button>
          <window.Button variant="primary" icon={I.Send}>Dispatch to vendor</window.Button>
        </div>
      </div>
    </window.Drawer>
  );
}

function AssignVendorModal({ job, onClose }) {
  const V = window.VMS;
  const I = window.Icons;
  const matchingVendors = V.VENDORS.filter(v => v.status === "Active" && v.categories.includes(job.category));
  const [picked, setPicked] = React.useState(matchingVendors[0]?.code);
  return (
    <window.Modal onClose={onClose} width={720}>
      <div className="mh">
        <div>
          <h3>Assign vendor</h3>
          <div className="muted" style={{ fontSize: 12 }}>{job.id} · {job.template} · {job.truck}</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <window.IconButton icon={I.X} onClick={onClose} />
        </div>
      </div>
      <div className="mb">
        <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
          Showing {matchingVendors.length} active vendors with category <b>{job.category}</b>
        </div>
        <div className="col gap-8">
          {matchingVendors.map(v => (
            <label key={v.code} style={{
              display: "flex", gap: 12, padding: 12,
              border: "1px solid " + (picked === v.code ? "var(--brand-blue)" : "var(--border)"),
              borderRadius: 8, cursor: "pointer",
              background: picked === v.code ? "var(--brand-blue-50)" : "white",
            }}>
              <input type="radio" checked={picked === v.code} onChange={() => setPicked(v.code)} style={{ marginTop: 2 }} />
              <div style={{ flex: 1 }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 500 }}>{v.name}</div>
                  <div className="row gap-8">
                    <window.Badge tone="warn"><I.Star size={11} fill="currentColor" /> {v.rating}</window.Badge>
                    <span className="muted" style={{ fontSize: 12 }}>{v.jobsCompleted} jobs · {v.avgTAT} TAT</span>
                  </div>
                </div>
                <div className="secondary" style={{ fontSize: 12, marginTop: 4 }}>
                  {v.city}, {v.state} · {v.categories.join(", ")} · Payment {v.payment}
                </div>
                <div className="secondary mono" style={{ fontSize: 11.5, marginTop: 2 }}>{v.code} · {v.contact} · {v.phone}</div>
              </div>
            </label>
          ))}
        </div>
        <div className="divider" />
        <div className="field-row cols-2">
          <window.Field label="Expected start"><window.Input type="date" defaultValue="2026-05-21" /></window.Field>
          <window.Field label="Expected completion"><window.Input type="date" defaultValue="2026-05-22" /></window.Field>
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label>Note to vendor</label>
          <window.Textarea defaultValue="Vehicle expected at workshop by 09:00 IST. Confirm completion estimate before starting." />
        </div>
        <window.Checkbox label="Send SMS + email notification to vendor primary contact" />
      </div>
      <div className="mf">
        <window.Button onClick={onClose}>Cancel</window.Button>
        <window.Button variant="primary" icon={I.Send} onClick={onClose}>Dispatch to vendor</window.Button>
      </div>
    </window.Modal>
  );
}

window.WorkbenchScreen = WorkbenchScreen;
