// Users & Roles — user master + RBAC matrix.

function UsersScreen({ onNav }) {
  const V = window.VMS;
  const I = window.Icons;
  const [tab, setTab] = React.useState("Users");

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Users &amp; Roles</h1>
          <div className="sub">User master, role-based permissions, audit-trail enabled deactivation.</div>
        </div>
        <div className="row gap-8">
          <window.Button variant="ghost" icon={I.Download}>Export</window.Button>
          <window.Button variant="primary" icon={I.Plus}>Add user</window.Button>
        </div>
      </div>

      <div className="page-tabs">
        {["Users", "Roles & Permissions", "Login policy"].map(t => (
          <div key={t} className={"page-tab " + (tab === t ? "active" : "")} onClick={() => setTab(t)}>{t}</div>
        ))}
      </div>

      {tab === "Users" && (
        <window.Card flush>
          <window.Toolbar>
            <window.Filter label="Role" value="All" />
            <window.Filter label="Department" value="All" />
            <window.Filter label="Status" value="Active" />
            <div className="grow" />
            <window.Button size="sm" variant="ghost" icon={I.Download}>Export</window.Button>
          </window.Toolbar>
          <table className="tbl">
            <thead>
              <tr>
                <th>User</th><th>Username</th><th>Department</th><th>Roles</th><th>Last login</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {V.USERS.map(u => (
                <tr key={u.id} className="clickable">
                  <td>
                    <div className="row gap-8">
                      <window.Avatar name={u.name} size={28} />
                      <div>
                        <div style={{ fontWeight: 500 }}>{u.name}</div>
                        <div className="secondary">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="mono">{u.username}</td>
                  <td>{u.dept}</td>
                  <td>
                    <div className="row gap-4" style={{ flexWrap: "wrap" }}>
                      {u.roles.map(r => <window.Badge key={r} outline>{r}</window.Badge>)}
                    </div>
                  </td>
                  <td><span className="mono secondary">{u.lastLogin}</span></td>
                  <td><window.StatusBadge value={u.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </window.Card>
      )}

      {tab === "Roles & Permissions" && (
        <window.Card title="Permission matrix" sub="Create / Read / Update / Delete / Approve / Export per module">
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Module</th>
                  <th style={{ textAlign: "center" }}>System Admin</th>
                  <th style={{ textAlign: "center" }}>Fleet Mgr</th>
                  <th style={{ textAlign: "center" }}>Maintenance Mgr</th>
                  <th style={{ textAlign: "center" }}>Workshop Sup.</th>
                  <th style={{ textAlign: "center" }}>Accounts Exec.</th>
                  <th style={{ textAlign: "center" }}>Compliance</th>
                  <th style={{ textAlign: "center" }}>Driver</th>
                  <th style={{ textAlign: "center" }}>Vendor</th>
                  <th style={{ textAlign: "center" }}>Read-only</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Vehicle Master", "F", "F", "RU", "R", "R", "RU", "R", "R", "R"],
                  ["Trailer Master", "F", "F", "RU", "R", "R", "RU", "R", "R", "R"],
                  ["Coupling", "F", "F", "F", "CRU", "R", "R", "R", "—", "R"],
                  ["Workbench", "F", "F+A", "F", "CRU", "R", "R", "—", "RU", "R"],
                  ["Tyre Management", "F", "F", "F", "CRU", "R", "R", "—", "—", "R"],
                  ["Vendor Master", "F", "F", "R", "R", "F", "R", "—", "—", "R"],
                  ["Non-Working", "F", "F+A", "F", "CRU", "R", "R", "C", "RU", "R"],
                  ["Compliance Docs", "F", "F", "R", "R", "R", "F", "R", "—", "R"],
                  ["PDI", "F", "F+A", "F", "CRU", "R", "R", "C", "—", "R"],
                  ["Challans / PUC", "F", "R", "R", "R", "F", "F", "R", "—", "R"],
                  ["Reports", "F", "F", "F", "R", "F", "F", "R", "—", "F"],
                  ["Users & Roles", "F", "—", "—", "—", "—", "—", "—", "—", "—"],
                ].map(([mod, ...perms]) => (
                  <tr key={mod}>
                    <td style={{ fontWeight: 500 }}>{mod}</td>
                    {perms.map((p, i) => <td key={i} style={{ textAlign: "center" }}><PermCell value={p} /></td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="divider" />
          <div className="row gap-16" style={{ fontSize: 12 }}>
            <span><b>F</b> = Full</span>
            <span><b>F+A</b> = Full + Approve</span>
            <span><b>CRU</b> = Create / Read / Update</span>
            <span><b>RU</b> = Read / Update</span>
            <span><b>R</b> = Read</span>
            <span><b>C</b> = Create only</span>
            <span><b>—</b> = No access</span>
          </div>
        </window.Card>
      )}

      {tab === "Login policy" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <window.Card title="Authentication">
            <PolicyRow label="Minimum password length" value="8 characters" />
            <PolicyRow label="Password complexity" value="Mixed case + number + special" />
            <PolicyRow label="Password expiry" value="90 days" />
            <PolicyRow label="Account lockout" value="5 failed attempts" />
            <PolicyRow label="CAPTCHA threshold" value="3 failed attempts" />
            <PolicyRow label="Session timeout" value="30 minutes idle" />
            <PolicyRow label="Multi-factor (OTP)" value="Email + SMS for password reset" />
            <PolicyRow label="Remember me cookie" value="7 days max" />
          </window.Card>

          <window.Card title="Audit & security">
            <PolicyRow label="Login audit log" value="All attempts (success + failure)" />
            <PolicyRow label="Failed attempt log retention" value="180 days" />
            <PolicyRow label="Active session log retention" value="90 days" />
            <PolicyRow label="Data encryption (transit)" value="TLS 1.2+" />
            <PolicyRow label="Data encryption (rest)" value="AES-256" />
            <PolicyRow label="Audit trail" value="Immutable; 7-year retention" />
            <PolicyRow label="Daily automated backup" value="30-day retention" />
            <PolicyRow label="Browser support" value="Chrome / Firefox / Edge (latest 2)" />
          </window.Card>
        </div>
      )}
    </div>
  );
}

function PermCell({ value }) {
  if (value === "—") return <span className="muted">—</span>;
  const tone = value === "F" || value === "F+A" ? "success" : value === "R" ? "neutral" : "info";
  return <window.Badge tone={tone} outline>{value}</window.Badge>;
}

function PolicyRow({ label, value }) {
  return (
    <div className="row" style={{ justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--divider)" }}>
      <span className="muted">{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

window.UsersScreen = UsersScreen;
