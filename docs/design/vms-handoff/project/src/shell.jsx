// App shell: Sidebar + Topbar + crumb. Owns navigation state.

const NAV = [
  { section: "Operations" },
  { key: "dashboard", label: "Dashboard", icon: "Home" },
  { key: "workbench", label: "Maintenance Workbench", icon: "Wrench", count: 7 },
  { key: "nonworking", label: "Non-Working Vehicles", icon: "AlertTriangle", count: 4, countTone: "danger" },
  { key: "coupling", label: "Coupling Board", icon: "Coupling" },
  { section: "Fleet" },
  { key: "vehicles", label: "Vehicles", icon: "Truck" },
  { key: "trailers", label: "Trailers", icon: "Trailer" },
  { key: "tyres", label: "Tyres", icon: "Tyre" },
  { key: "pdi", label: "PDI & Handover", icon: "Clipboard" },
  { section: "Compliance" },
  { key: "compliance", label: "Documents & Permits", icon: "Shield", count: 9, countTone: "danger" },
  { key: "challans", label: "Challans & PUC", icon: "Receipt" },
  { section: "Administration" },
  { key: "vendors", label: "Vendors", icon: "Briefcase" },
  { key: "reports", label: "Reports", icon: "BarChart" },
  { key: "alerts", label: "Alerts", icon: "Bell", count: 12 },
  { key: "users", label: "Users & Roles", icon: "Users" },
  { key: "settings", label: "Schedule Templates", icon: "Settings" },
];

function Sidebar({ current, onNav, compact }) {
  return (
    <aside className="sidebar" data-compact={compact ? "1" : "0"}>
      <div className="brand">
        <div className="brand-mark">G</div>
        {!compact && (
          <div className="brand-name">
            <b>GreenLine VMS</b>
            <span>Mobility Solutions</span>
          </div>
        )}
      </div>
      {!compact && (
        <div className="role-pill">
          <span className="dot" />
          <span className="role-name">Maintenance Manager</span>
          <span className="role-meta">JNPT · PUN</span>
        </div>
      )}
      <div className="nav">
        {NAV.map((n, i) => {
          if (n.section) return compact ? <div key={"s" + i} style={{ height: 12 }} /> : <div key={"s" + i} className="nav-section">{n.section}</div>;
          const I = window.Icons[n.icon];
          return (
            <div
              key={n.key}
              className={"nav-item " + (current === n.key ? "active" : "")}
              onClick={() => onNav(n.key)}
              title={compact ? n.label : undefined}
              style={compact ? { justifyContent: "center", padding: "10px 8px" } : undefined}
            >
              {I && <I className="ico" size={compact ? 18 : 15} />}
              {!compact && <span>{n.label}</span>}
              {!compact && n.count != null && <span className={"count " + (n.countTone || "")}>{n.count}</span>}
            </div>
          );
        })}
      </div>
      {!compact && (
        <div className="footer">
          <div className="avatar">AM</div>
          <div className="user-meta">
            <b>Anika Mehta</b>
            <br /><span>anika.mehta@greenline.in</span>
          </div>
          <window.IconButton icon={window.Icons.LogOut} />
        </div>
      )}
    </aside>
  );
}

function Topbar({ crumbs = [], onCmdK }) {
  return (
    <header className="topbar">
      <div className="crumb">
        {crumbs.map((c, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            {i > 0 && <window.Icons.ChevronRight className="sep" size={12} />}
            {i === crumbs.length - 1 ? <b>{c}</b> : <span>{c}</span>}
          </span>
        ))}
      </div>
      <div className="search" onClick={onCmdK} style={{ cursor: "pointer" }}>
        <window.Icons.Search size={14} />
        <input
          placeholder="Search trucks, jobs, vendors, documents…"
          readOnly
          style={{ cursor: "pointer" }}
        />
        <kbd>⌘K</kbd>
      </div>
      <div className="tb-actions">
        <window.IconButton icon={window.Icons.Help} />
        <window.IconButton icon={window.Icons.Bell} className="rel">
          <span className="badge" />
        </window.IconButton>
        <div style={{ width: 1, height: 22, background: "var(--border)", margin: "0 4px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, paddingRight: 4 }}>
          <window.Avatar name="Anika Mehta" size={26} color="#2563eb" />
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 500 }}>Anika Mehta</div>
            <div style={{ fontSize: 11, color: "var(--text-3)" }}>Maintenance Mgr.</div>
          </div>
        </div>
      </div>
    </header>
  );
}

window.Sidebar = Sidebar;
window.Topbar = Topbar;
window.NAV = NAV;
