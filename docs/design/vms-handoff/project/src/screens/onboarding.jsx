// New Truck Onboarding wizard — 6-step flow: identification → battery → docs → fittings → PDI → handover.

function OnboardingWizard({ onClose }) {
  const V = window.VMS;
  const I = window.Icons;
  const [step, setStep] = React.useState(0);
  const [data, setData] = React.useState({
    reg: "MH04 EQ 8825",
    vehicleType: "Tanker",
    make: "Tata",
    model: "Signa 4825.T",
    year: "2026",
    vin: "MAT1AVNFP3PG12368",
    engineNo: "BS6-4825-22789",
    chassisNo: "CH-2026-MH-44211",
    fuel: "LNG",
    gvw: 49000,
    payload: 28000,
    axles: 3,
    fleetNo: "GLN-0019",
    purchaseDate: "2026-05-10",
    purchasePrice: 4350000,
    odoStart: 18,
    depot: "JNPT",
    ownership: "Owned",
    batteryMake: "Exide",
    batterySerial: "EX-26-1119",
    batteryCapacity: 180,
    batteryInstall: "2026-05-12",
    batteryWarranty: "2030-05-12",
    docs: {
      cinSketch: true,
      chassisSketch: true,
      purchaseInvoice: true,
      insurance: false,
      fitness: false,
      permit: false,
      peso: false,
      piping: false,
    },
    fittings: [
      { type: "GPS Tracker", make: "iTriangle", model: "XT8000-94413", installed: "2026-05-14", status: "Working" },
      { type: "FASTag", make: "SBI ETC", model: "607498661122-A", installed: "2026-05-14", status: "Working" },
    ],
    pdi: {},
    handover: {},
  });

  const STEPS = [
    { key: "id", label: "Identification", icon: I.Truck },
    { key: "battery", label: "Battery", icon: I.Battery },
    { key: "docs", label: "Documents", icon: I.FileText },
    { key: "fittings", label: "Fittings", icon: I.Zap },
    { key: "pdi", label: "PDI Checklist", icon: I.Clipboard },
    { key: "handover", label: "Handover", icon: I.PenTool },
  ];

  const isLng = data.fuel === "LNG" || data.fuel === "CNG";
  const next = () => setStep(s => Math.min(STEPS.length - 1, s + 1));
  const back = () => setStep(s => Math.max(0, s - 1));

  return (
    <window.Drawer onClose={onClose} width="100vw">
      <div className="dh" style={{ paddingTop: 18, paddingBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: "linear-gradient(135deg, #2563eb, #10b981)",
            display: "grid", placeItems: "center", color: "white", fontWeight: 700,
          }}>
            <I.Plus size={20} />
          </div>
          <div>
            <h2>Onboard new truck</h2>
            <div className="meta">Step {step + 1} of {STEPS.length} · {STEPS[step].label}</div>
          </div>
        </div>
        <div className="row gap-8" style={{ marginLeft: "auto" }}>
          <span className="muted" style={{ fontSize: 12 }}>Draft saved 2 min ago</span>
          <window.Button variant="ghost">Save & exit</window.Button>
          <window.IconButton icon={I.X} onClick={onClose} />
        </div>
      </div>

      <div className="stepper">
        {STEPS.map((s, i) => {
          const StepIco = s.icon;
          return (
            <div key={s.key} className={"step " + (i < step ? "done " : "") + (i === step ? "active" : "")} onClick={() => setStep(i)}>
              <div className="num">{i < step ? <I.Check size={12} /> : i + 1}</div>
              <span>{s.label}</span>
            </div>
          );
        })}
      </div>

      <div className="db" style={{ padding: 0 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 32 }}>
          {step === 0 && <StepIdentification data={data} setData={setData} />}
          {step === 1 && <StepBattery data={data} setData={setData} />}
          {step === 2 && <StepDocuments data={data} setData={setData} isLng={isLng} />}
          {step === 3 && <StepFittings data={data} setData={setData} />}
          {step === 4 && <StepPDI data={data} setData={setData} isLng={isLng} />}
          {step === 5 && <StepHandover data={data} setData={setData} />}
        </div>
      </div>

      <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border)", background: "white", display: "flex", gap: 8, justifyContent: "space-between" }}>
        <window.Button variant="ghost" icon={I.ChevronLeft} onClick={back} disabled={step === 0}>Back</window.Button>
        <div className="row gap-8">
          <window.Button variant="ghost">Save draft</window.Button>
          {step < STEPS.length - 1 ? (
            <window.Button variant="primary" iconRight={I.ChevronRight} onClick={next}>
              Continue · {STEPS[step + 1].label}
            </window.Button>
          ) : (
            <window.Button variant="primary" icon={I.Check} onClick={onClose}>
              Complete onboarding
            </window.Button>
          )}
        </div>
      </div>
    </window.Drawer>
  );
}

// ── Step 1: Identification ────────────────────────────────────────────────
function StepIdentification({ data, setData }) {
  const V = window.VMS;
  const I = window.Icons;
  const set = (k, v) => setData({ ...data, [k]: v });
  return (
    <div className="col gap-16">
      <SectionHeader
        title="Basic identification"
        sub="Critical fields (VIN, Engine #, Chassis #) lock after first save. Only the System Administrator can edit them later."
      />
      <window.Card>
        <div className="field-row cols-3">
          <window.Field label="Registration number" required>
            <window.Input value={data.reg} onChange={e => set("reg", e.target.value)} className="mono" />
          </window.Field>
          <window.Field label="Vehicle code" hint="auto">
            <window.Input value="TRK-0019" readOnly className="mono" style={{ background: "var(--surface-3)" }} />
          </window.Field>
          <window.Field label="Fleet number">
            <window.Input value={data.fleetNo} onChange={e => set("fleetNo", e.target.value)} />
          </window.Field>
          <window.Field label="Vehicle type" required>
            <window.Select value={data.vehicleType} onChange={e => set("vehicleType", e.target.value)}>
              <option value="Truck">Truck</option><option value="Tanker">Tanker</option><option value="Tipper">Tipper</option><option value="Flatbed">Flatbed</option>
            </window.Select>
          </window.Field>
          <window.Field label="Make / Brand" required>
            <window.Select value={data.make} onChange={e => set("make", e.target.value)}>
              <option value="Tata">Tata</option><option value="Ashok Leyland">Ashok Leyland</option><option value="Volvo">Volvo</option><option value="Eicher">Eicher</option><option value="BharatBenz">BharatBenz</option>
            </window.Select>
          </window.Field>
          <window.Field label="Model" required>
            <window.Input value={data.model} onChange={e => set("model", e.target.value)} />
          </window.Field>
          <window.Field label="Year of manufacture" required>
            <window.Input value={data.year} onChange={e => set("year", e.target.value)} />
          </window.Field>
          <window.Field label="Fuel type" required>
            <window.Select value={data.fuel} onChange={e => set("fuel", e.target.value)}>
              <option value="Diesel">Diesel</option><option value="CNG">CNG</option><option value="LNG">LNG</option><option value="Electric">Electric</option><option value="Hybrid">Hybrid</option>
            </window.Select>
          </window.Field>
          <window.Field label="Number of axles" required>
            <window.Input type="number" value={data.axles} onChange={e => set("axles", e.target.value)} />
          </window.Field>
        </div>

        <div className="divider" />

        <div className="field-row cols-3">
          <window.Field label="VIN" required hint="17 chars · locks after save">
            <window.Input value={data.vin} onChange={e => set("vin", e.target.value)} className="mono" />
          </window.Field>
          <window.Field label="Engine number" required hint="locks after save">
            <window.Input value={data.engineNo} onChange={e => set("engineNo", e.target.value)} className="mono" />
          </window.Field>
          <window.Field label="Chassis number" required hint="locks after save">
            <window.Input value={data.chassisNo} onChange={e => set("chassisNo", e.target.value)} className="mono" />
          </window.Field>
        </div>

        <div className="divider" />

        <div className="field-row cols-4">
          <window.Field label="Gross vehicle weight" required>
            <window.Input value={data.gvw + " kg"} onChange={() => {}} />
          </window.Field>
          <window.Field label="Payload capacity" required>
            <window.Input value={data.payload + " kg"} onChange={() => {}} />
          </window.Field>
          <window.Field label="Odometer at onboarding" required>
            <window.Input value={data.odoStart + " km"} onChange={() => {}} />
          </window.Field>
          <window.Field label="Assigned depot" required>
            <window.Select value={data.depot} onChange={e => set("depot", e.target.value)}>
              {V.DEPOTS.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
            </window.Select>
          </window.Field>
        </div>

        <div className="divider" />

        <div className="field-row cols-3">
          <window.Field label="Date of purchase" required>
            <window.Input type="date" value={data.purchaseDate} onChange={e => set("purchaseDate", e.target.value)} />
          </window.Field>
          <window.Field label="Purchase price (₹)" required>
            <window.Input value={data.purchasePrice.toLocaleString("en-IN")} onChange={() => {}} />
          </window.Field>
          <window.Field label="Ownership" required>
            <window.Select value={data.ownership} onChange={e => set("ownership", e.target.value)}>
              <option value="Owned">Owned</option><option value="Leased">Leased</option><option value="Hired">Hired</option>
            </window.Select>
          </window.Field>
        </div>
      </window.Card>

      {(data.fuel === "LNG" || data.fuel === "CNG") && (
        <div className="card" style={{ padding: 12, background: "var(--info-bg)", border: "1px solid var(--info-border)", color: "var(--info)", display: "flex", gap: 10, alignItems: "flex-start" }}>
          <I.Info size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12.5, color: "var(--text-2)" }}>
            <b style={{ color: "var(--info)" }}>{data.fuel} tanker detected.</b> PESO &amp; Piping certificates will be required at the Documents step. PDI will include an additional <b>{data.fuel} system</b> checklist category.
          </div>
        </div>
      )}
    </div>
  );
}

// ── Step 2: Battery ───────────────────────────────────────────────────────
function StepBattery({ data, setData }) {
  const I = window.Icons;
  const set = (k, v) => setData({ ...data, [k]: v });
  return (
    <div className="col gap-16">
      <SectionHeader title="Battery information" sub="Tagged to this truck. Replacement history is logged automatically." />
      <window.Card>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 24, alignItems: "flex-start" }}>
          <div style={{
            width: 140, height: 140, borderRadius: 16,
            background: "linear-gradient(180deg, var(--brand-blue-50), white)",
            border: "1px solid var(--border)",
            display: "grid", placeItems: "center", color: "var(--brand-blue)",
          }}>
            <I.Battery size={64} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="field-row cols-3">
              <window.Field label="Battery make" required>
                <window.Select value={data.batteryMake} onChange={e => set("batteryMake", e.target.value)}>
                  <option>Exide</option><option>Amaron</option><option>Bosch</option><option>SF Sonic</option>
                </window.Select>
              </window.Field>
              <window.Field label="Battery model" required>
                <window.Input value="MGRID 180Ah" onChange={() => {}} />
              </window.Field>
              <window.Field label="Capacity (Ah)" required>
                <window.Input value={data.batteryCapacity} onChange={e => set("batteryCapacity", e.target.value)} />
              </window.Field>
              <window.Field label="Battery serial number" required hint="locked after save">
                <window.Input value={data.batterySerial} onChange={e => set("batterySerial", e.target.value)} className="mono" />
              </window.Field>
              <window.Field label="Date of installation" required>
                <window.Input type="date" value={data.batteryInstall} onChange={e => set("batteryInstall", e.target.value)} />
              </window.Field>
              <window.Field label="Warranty expiry">
                <window.Input type="date" value={data.batteryWarranty} onChange={e => set("batteryWarranty", e.target.value)} />
              </window.Field>
            </div>
          </div>
        </div>
      </window.Card>

      <window.Card title="Battery replacement history" sub="No replacements yet — first installation">
        <div className="empty" style={{ padding: "24px 12px" }}>
          <I.Battery size={24} />
          <h4>First battery installed</h4>
          <div>Any future replacements will appear here with date, serial, vendor and cost.</div>
        </div>
      </window.Card>
    </div>
  );
}

// ── Step 3: Documents ─────────────────────────────────────────────────────
function StepDocuments({ data, setData, isLng }) {
  const I = window.Icons;
  const setDoc = (k, v) => setData({ ...data, docs: { ...data.docs, [k]: v } });

  const docs = [
    { key: "cinSketch", name: "CIN Stencil Sketch Image", mandatory: true, image: true, instructions: "Upload the stencil rubbing or clear photograph of the CIN plate." },
    { key: "chassisSketch", name: "Chassis Stencil Sketch Image", mandatory: true, image: true, instructions: "Required for RTO records." },
    { key: "purchaseInvoice", name: "Vehicle Purchase Invoice", mandatory: true, instructions: "Original tax invoice from the dealer (GST applicable)." },
    { key: "insurance", name: "Insurance Policy Copy", mandatory: true, expiryField: true, alertDays: 30, instructions: "Comprehensive cover policy. Expiry alerts at 30 days." },
    { key: "fitness", name: "Fitness Certificate", mandatory: true, expiryField: true, alertDays: 30 },
    { key: "permit", name: "National / State Permit", mandatory: true, expiryField: true, alertDays: 30 },
    ...(isLng ? [
      { key: "peso", name: "PESO Certificate", mandatory: true, expiryField: true, alertDays: 60, special: true, instructions: "Mandatory for LNG/CNG tankers — Petroleum and Explosives Safety Organisation." },
      { key: "piping", name: "Piping Certificate", mandatory: true, expiryField: true, alertDays: 60, special: true, instructions: "Attests to the integrity of the gas piping system." },
    ] : []),
    { key: "roadTax", name: "Road Tax Receipt", mandatory: false, expiryField: true, alertDays: 60 },
  ];

  return (
    <div className="col gap-16">
      <SectionHeader title="Document uploads" sub={`${docs.filter(d => d.mandatory).length} mandatory documents · expiry-based documents auto-generate renewal alerts`} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
        {docs.map(d => (
          <div key={d.key} className="card" style={{ padding: 16, border: d.special ? "1px solid var(--info-border)" : "1px solid var(--border)" }}>
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <div className="row gap-8" style={{ alignItems: "center" }}>
                  <div style={{ fontWeight: 500 }}>{d.name}</div>
                  {d.mandatory && <window.Badge tone="danger" outline>Required</window.Badge>}
                  {d.special && <window.Badge tone="info">LNG/CNG</window.Badge>}
                </div>
                {d.instructions && <div className="secondary" style={{ fontSize: 12, marginTop: 4 }}>{d.instructions}</div>}
              </div>
              {data.docs[d.key] && <I.CheckCircle size={18} style={{ color: "var(--success)" }} />}
            </div>

            {d.expiryField && (
              <div className="field-row cols-2" style={{ marginBottom: 10 }}>
                <window.Field label="Document number">
                  <window.Input placeholder="Enter policy / certificate number" defaultValue={d.key === "insurance" ? "POL/26/MH/8825" : d.key === "peso" ? "PESO/MUM/2026/0224" : ""} className="mono" />
                </window.Field>
                <window.Field label="Expiry date" hint={`alert ${d.alertDays}d prior`}>
                  <window.Input type="date" defaultValue={d.key === "peso" ? "2027-05-12" : d.key === "piping" ? "2027-07-12" : "2027-05-12"} />
                </window.Field>
              </div>
            )}

            <window.Drop filled={!!data.docs[d.key]} fileName={d.image ? `${d.key}.jpg` : `${d.key}.pdf`} />
            {!data.docs[d.key] && (
              <button
                onClick={() => setDoc(d.key, true)}
                style={{ marginTop: 8, fontSize: 12, color: "var(--brand-blue)", background: "none", border: 0, cursor: "pointer", padding: 0 }}
              >
                Simulate upload →
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Step 4: Fittings ──────────────────────────────────────────────────────
function StepFittings({ data, setData }) {
  const V = window.VMS;
  const I = window.Icons;
  const add = () => setData({ ...data, fittings: [...data.fittings, { type: "GPS Tracker", make: "", model: "", installed: "2026-05-19", status: "Working" }] });
  const remove = (i) => setData({ ...data, fittings: data.fittings.filter((_, idx) => idx !== i) });
  const upd = (i, k, v) => setData({ ...data, fittings: data.fittings.map((f, idx) => idx === i ? { ...f, [k]: v } : f) });

  return (
    <div className="col gap-16">
      <SectionHeader title="Additional fittings" sub="GPS, dashcams, telematics, FASTag, speedometer and accessories. Add one row per fitting." />
      <window.Card flush>
        <table className="tbl">
          <thead>
            <tr>
              <th>Type</th><th>Make / Brand</th><th>Model / Serial</th>
              <th>Installation date</th><th>Vendor</th><th>AMC expiry</th><th>Status</th><th style={{ width: 30 }}></th>
            </tr>
          </thead>
          <tbody>
            {data.fittings.map((f, i) => (
              <tr key={i}>
                <td>
                  <window.Select value={f.type} onChange={e => upd(i, "type", e.target.value)}>
                    <option>GPS Tracker</option><option>Video Camera</option><option>Telematics</option>
                    <option>FASTag</option><option>Speedometer</option><option>Refrigeration Unit</option>
                  </window.Select>
                </td>
                <td><window.Input value={f.make} onChange={e => upd(i, "make", e.target.value)} placeholder="e.g. iTriangle" /></td>
                <td><window.Input value={f.model} onChange={e => upd(i, "model", e.target.value)} className="mono" /></td>
                <td><window.Input type="date" value={f.installed} onChange={e => upd(i, "installed", e.target.value)} /></td>
                <td>
                  <window.Select defaultValue="">
                    <option value="">— Select —</option>
                    {V.VENDORS.filter(v => v.status === "Active").map(v => <option key={v.code} value={v.code}>{v.name}</option>)}
                  </window.Select>
                </td>
                <td><window.Input type="date" defaultValue="2028-05-19" /></td>
                <td>
                  <window.Select value={f.status} onChange={e => upd(i, "status", e.target.value)}>
                    <option>Working</option><option>Faulty</option><option>Removed</option>
                  </window.Select>
                </td>
                <td><window.IconButton icon={I.Trash} onClick={() => remove(i)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: "10px 14px", borderTop: "1px solid var(--divider)" }}>
          <window.Button variant="ghost" icon={I.Plus} onClick={add}>Add fitting</window.Button>
        </div>
      </window.Card>

      <window.Card title="Common fittings checklist" sub="Tap to pre-fill a row">
        <div className="row gap-8" style={{ flexWrap: "wrap" }}>
          {["GPS Tracker", "Dashcam (front)", "Driver-facing Camera", "Telematics ECU", "FASTag", "Reverse Camera", "Speedometer", "Refrigeration Unit"].map(t => (
            <span key={t} className="tag" style={{ cursor: "pointer", padding: "4px 10px", fontSize: 12, background: "var(--surface-3)", border: "1px solid var(--border)" }}>
              + {t}
            </span>
          ))}
        </div>
      </window.Card>
    </div>
  );
}

// ── Step 5: PDI Checklist ─────────────────────────────────────────────────
function StepPDI({ data, setData, isLng }) {
  const I = window.Icons;
  const [results, setResults] = React.useState(() => {
    const r = {};
    PDI_CATEGORIES.forEach(c => c.items.forEach(it => r[c.cat + ":" + it] = "OK"));
    if (isLng) PDI_LNG.items.forEach(it => r["LNG:" + it] = "OK");
    return r;
  });

  const allItems = [...PDI_CATEGORIES, ...(isLng ? [PDI_LNG] : [])];
  const totalItems = allItems.reduce((s, c) => s + c.items.length, 0);
  const okCount = Object.values(results).filter(v => v === "OK").length;
  const nokCount = Object.values(results).filter(v => v === "Not OK").length;
  const naCount = Object.values(results).filter(v => v === "N/A").length;

  return (
    <div className="col gap-16">
      <SectionHeader title="Pre-Delivery Inspection (PDI) checklist" sub={`${allItems.length} categories · ${totalItems} items · Inspector signs off each item before handover`} />

      <div className="card" style={{ padding: 16 }}>
        <div className="row gap-16">
          <div style={{ flex: 1 }}>
            <div className="muted" style={{ fontSize: 12 }}>PDI Document ID</div>
            <div className="mono" style={{ fontWeight: 500 }}>PDI-2026-0048</div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="muted" style={{ fontSize: 12 }}>PDI Type</div>
            <div style={{ fontWeight: 500 }}>New Vehicle</div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="muted" style={{ fontSize: 12 }}>Odometer at PDI</div>
            <div style={{ fontWeight: 500 }} className="tnum">{data.odoStart} km</div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="muted" style={{ fontSize: 12 }}>Inspector</div>
            <div style={{ fontWeight: 500 }}>K. Joshi (Workshop Supervisor)</div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="muted" style={{ fontSize: 12 }}>Approver</div>
            <div style={{ fontWeight: 500 }}>Rohit Sharma (Fleet Manager)</div>
          </div>
          <div style={{ borderLeft: "1px solid var(--divider)", paddingLeft: 16 }}>
            <div className="muted" style={{ fontSize: 12 }}>Result</div>
            <window.Badge tone={nokCount === 0 ? "success" : "danger"} dot>
              {nokCount === 0 ? "Pass" : `${nokCount} Not OK`}
            </window.Badge>
            <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>
              {okCount} OK · {naCount} N/A
            </div>
          </div>
        </div>
      </div>

      <div className="col gap-12">
        {allItems.map((cat) => {
          const CatIco = I[cat.icon] || I.CheckCircle;
          return (
            <div key={cat.cat} className="card" style={{ padding: 0 }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--divider)", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--brand-blue-50)", color: "var(--brand-blue)", display: "grid", placeItems: "center" }}>
                  <CatIco size={15} />
                </div>
                <div style={{ fontWeight: 600 }}>{cat.cat}</div>
                <span className="muted" style={{ fontSize: 12 }}>{cat.items.length} items</span>
                <div className="grow" />
                <window.Button size="sm" variant="ghost" onClick={() => {
                  const r = { ...results };
                  cat.items.forEach(it => r[cat.cat + ":" + it] = "OK");
                  setResults(r);
                }}>Mark all OK</window.Button>
              </div>
              <div style={{ padding: "8px 16px" }}>
                {cat.items.map(it => {
                  const key = cat.cat + ":" + it;
                  const val = results[key];
                  return (
                    <div key={it} style={{ display: "grid", gridTemplateColumns: "1fr 280px 1fr", gap: 16, padding: "10px 0", borderBottom: "1px solid var(--divider)", alignItems: "center" }}>
                      <div style={{ fontSize: 13 }}>{it}</div>
                      <div className="seg" style={{ width: "fit-content" }}>
                        {["OK", "Not OK", "N/A"].map(o => (
                          <button key={o} className={val === o ? "on" : ""} onClick={() => setResults({ ...results, [key]: o })}>
                            {o}
                          </button>
                        ))}
                      </div>
                      <input className="input" placeholder="Remarks…" style={{ background: val === "Not OK" ? "var(--danger-bg)" : undefined, borderColor: val === "Not OK" ? "var(--danger-border)" : undefined }} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const PDI_CATEGORIES = [
  { cat: "Engine & Drivetrain", icon: "Gauge", items: ["Engine oil level", "Coolant level", "Belts & hoses condition", "Exhaust system", "Idle stability"] },
  { cat: "Brakes", icon: "Activity", items: ["Service brake response", "Parking brake hold", "ABS indicator", "Brake fluid level", "Brake disc condition"] },
  { cat: "Tyres & Wheels", icon: "Tyre", items: ["Tread depth all positions ≥4 mm", "Inflation pressure", "Wheel nuts torque (450 Nm)", "Spare tyre fitted", "No visible cuts / bulges"] },
  { cat: "Electrical", icon: "Zap", items: ["Headlamps / fog lamps", "Indicators (4-way)", "Horn", "Wipers & washers", "Battery terminals tight", "Alternator output"] },
  { cat: "Body & Chassis", icon: "Boxes", items: ["Frame integrity (no cracks)", "Cabin door locks", "Mirrors aligned & secure", "Windscreen — no cracks"] },
  { cat: "Safety Equipment", icon: "Shield", items: ["Fire extinguisher (charged, in-date)", "First aid kit", "Reflective triangles ×2", "Wheel chocks", "Toolbox complete"] },
  { cat: "Documents on Board", icon: "FileText", items: ["RC original / certified copy", "Insurance original", "Fitness certificate", "Permit (National)", "Driver licence (current)"] },
  { cat: "GPS / Telematics", icon: "MapPin", items: ["GPS device functioning", "Signal active to control tower", "Driver display visible"] },
  { cat: "Overall Cleanliness", icon: "Sparkles", items: ["Cabin interior cleaned", "Exterior wash done", "Fluid spills cleaned"] },
];

const PDI_LNG = {
  cat: "LNG / CNG System",
  icon: "Zap",
  items: ["Tank pressure within range", "Vapour vent valves seated", "Piping leak test — soap solution", "Emergency shutoff accessible", "PESO certificate on board", "Piping certificate on board"],
};

// ── Step 6: Handover ──────────────────────────────────────────────────────
function StepHandover({ data, setData }) {
  const V = window.VMS;
  const I = window.Icons;
  return (
    <div className="col gap-16">
      <SectionHeader title="Handover & sign-off" sub="Generate the signed handover PDF. Vehicle moves to Active status." />

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <window.Card title="Handover details">
          <div className="field-row cols-2">
            <window.Field label="Handover to (Driver)" required>
              <window.Select>
                <option>B. Yadav (USR-0006)</option>
                <option>K. Joshi (USR-0003)</option>
                <option>Other…</option>
              </window.Select>
            </window.Field>
            <window.Field label="Handover date & time" required>
              <window.Input type="datetime-local" defaultValue="2026-05-19T14:30" />
            </window.Field>
            <window.Field label="Approving Fleet Manager" required>
              <window.Select defaultValue="Rohit Sharma">
                <option>Rohit Sharma (USR-0002)</option>
              </window.Select>
            </window.Field>
            <window.Field label="Receiving depot">
              <window.Select defaultValue={data.depot}>
                {V.DEPOTS.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
              </window.Select>
            </window.Field>
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label>Handover remarks</label>
            <window.Textarea defaultValue="Vehicle inspected and cleared for service. Driver briefed on PESO compliance for LNG hauling. Fuel tank filled to 80%. Toolbox sealed." />
          </div>
        </window.Card>

        <window.Card title="Onboarding summary">
          <div className="col gap-8" style={{ fontSize: 13 }}>
            <SumRow icon={I.Truck} label="Vehicle" value={data.reg} />
            <SumRow icon={I.Briefcase} label="Make" value={`${data.make} ${data.model}`} />
            <SumRow icon={I.Zap} label="Fuel" value={data.fuel} />
            <SumRow icon={I.Battery} label="Battery" value={`${data.batteryMake} · ${data.batteryCapacity}Ah`} />
            <SumRow icon={I.FileText} label="Documents" value={`${Object.values(data.docs).filter(Boolean).length} uploaded`} />
            <SumRow icon={I.MapPin} label="Fittings" value={`${data.fittings.length} installed`} />
            <SumRow icon={I.CheckCircle} label="PDI" value={<window.Badge tone="success" dot>Pass</window.Badge>} />
          </div>
          <div className="divider" />
          <window.Button variant="ghost" icon={I.FileText} style={{ width: "100%" }}>Preview handover PDF</window.Button>
        </window.Card>
      </div>

      <window.Card title="Digital sign-off" sub="OTP-based confirmation by all three parties">
        <div className="field-row cols-3">
          <SignBlock role="Inspected by" name="K. Joshi" role2="Workshop Supervisor" signed />
          <SignBlock role="Approved by" name="Rohit Sharma" role2="Fleet Manager" signed />
          <SignBlock role="Handover received by" name="B. Yadav" role2="Driver / Operator" signed={false} />
        </div>
      </window.Card>

      <div className="card" style={{
        padding: 14, background: "var(--success-bg)", border: "1px solid var(--success-border)",
        display: "flex", gap: 10, alignItems: "flex-start", color: "var(--success)"
      }}>
        <I.CheckCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 13, color: "var(--text-2)" }}>
          <b style={{ color: "var(--success)" }}>Ready to complete.</b> On submission, the vehicle becomes <b>Active</b>, PM schedules will be auto-generated based on the templates configured for {data.vehicleType}, and the signed PDF will be emailed to all signatories.
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, sub }) {
  return (
    <div>
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em" }}>{title}</h2>
      {sub && <div className="muted" style={{ fontSize: 13, marginTop: 4, maxWidth: 720 }}>{sub}</div>}
    </div>
  );
}

function SumRow({ icon: I, label, value }) {
  return (
    <div className="row" style={{ justifyContent: "space-between", padding: "4px 0" }}>
      <div className="row gap-8" style={{ color: "var(--text-3)" }}>
        {I && <I size={14} />}
        <span style={{ fontSize: 12.5 }}>{label}</span>
      </div>
      <div style={{ fontWeight: 500 }}>{value}</div>
    </div>
  );
}

function SignBlock({ role, name, role2, signed }) {
  const I = window.Icons;
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 14, background: signed ? "var(--surface-2)" : "white" }}>
      <div className="muted" style={{ fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 }}>{role}</div>
      <div style={{ fontWeight: 500, marginTop: 4 }}>{name}</div>
      <div className="muted" style={{ fontSize: 12 }}>{role2}</div>
      <div style={{ height: 50, marginTop: 10, borderTop: "1px dashed var(--border-strong)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {signed ? (
          <div style={{ fontFamily: "cursive", fontSize: 22, color: "var(--brand-blue)", transform: "rotate(-4deg)" }}>{name.split(" ")[0]}</div>
        ) : (
          <window.Button size="sm" variant="primary">Request OTP</window.Button>
        )}
      </div>
      <div className="muted" style={{ fontSize: 11, textAlign: "center", marginTop: 6 }}>
        {signed ? "Signed at 19 May 2026, 14:32 · OTP verified" : "Awaiting"}
      </div>
    </div>
  );
}

window.OnboardingWizard = OnboardingWizard;
