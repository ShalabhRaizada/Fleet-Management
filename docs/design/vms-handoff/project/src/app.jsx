// Root app + router + tweaks.

const { useState: useState_app, useEffect: useEffect_app } = React;

const CRUMB_MAP = {
  dashboard: ["Dashboard"],
  workbench: ["Operations", "Maintenance Workbench"],
  nonworking: ["Operations", "Non-Working Vehicles"],
  coupling: ["Operations", "Coupling Board"],
  vehicles: ["Fleet", "Vehicles"],
  trailers: ["Fleet", "Trailers"],
  tyres: ["Fleet", "Tyres"],
  pdi: ["Fleet", "PDI & Handover"],
  compliance: ["Compliance", "Documents & Permits"],
  challans: ["Compliance", "Challans & PUC"],
  vendors: ["Administration", "Vendors"],
  reports: ["Administration", "Reports"],
  alerts: ["Administration", "Alerts"],
  users: ["Administration", "Users & Roles"],
  settings: ["Administration", "Schedule Templates"],
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#2563eb",
  "sidebar": "dark",
  "density": "balanced",
  "compactSidebar": false,
  "showActivityFeed": true
}/*EDITMODE-END*/;

function App() {
  const initial = (location.hash || "#dashboard").replace("#", "");
  const [current, setCurrent] = useState_app(initial);
  const [t, setTweak] = window.useTweaks(TWEAK_DEFAULTS);

  useEffect_app(() => {
    const h = () => {
      const k = (location.hash || "#dashboard").replace("#", "");
      setCurrent(k);
    };
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);

  // Apply tweaks via CSS variable overrides on :root
  useEffect_app(() => {
    document.documentElement.style.setProperty("--brand-blue", t.accent);
    // derive shades
    const root = document.documentElement;
    if (t.accent === "#2563eb") {
      root.style.setProperty("--brand-blue-50", "#eff6ff");
      root.style.setProperty("--brand-blue-100", "#dbeafe");
      root.style.setProperty("--brand-blue-600", "#1d4ed8");
    } else if (t.accent === "#7c3aed") {
      root.style.setProperty("--brand-blue-50", "#f5f3ff");
      root.style.setProperty("--brand-blue-100", "#ede9fe");
      root.style.setProperty("--brand-blue-600", "#6d28d9");
    } else if (t.accent === "#0d9488") {
      root.style.setProperty("--brand-blue-50", "#f0fdfa");
      root.style.setProperty("--brand-blue-100", "#ccfbf1");
      root.style.setProperty("--brand-blue-600", "#0f766e");
    } else if (t.accent === "#dc2626") {
      root.style.setProperty("--brand-blue-50", "#fef2f2");
      root.style.setProperty("--brand-blue-100", "#fee2e2");
      root.style.setProperty("--brand-blue-600", "#b91c1c");
    }
  }, [t.accent]);

  useEffect_app(() => {
    document.documentElement.style.setProperty("--sidebar-w", t.compactSidebar ? "64px" : "240px");
    document.body.dataset.sidebar = t.sidebar;
    document.body.dataset.sidebarCompact = t.compactSidebar ? "1" : "0";
    document.body.dataset.density = t.density;
  }, [t.sidebar, t.compactSidebar, t.density]);

  const go = (k) => { location.hash = "#" + k; setCurrent(k); window.scrollTo(0, 0); };

  const Screen = (() => {
    switch (current) {
      case "dashboard": return window.DashboardScreen;
      case "workbench": return window.WorkbenchScreen;
      case "nonworking": return window.NonWorkingScreen;
      case "coupling": return window.CouplingScreen;
      case "vehicles": return window.VehiclesScreen;
      case "trailers": return window.TrailersScreen;
      case "tyres": return window.TyresScreen;
      case "pdi": return window.PdiScreen;
      case "compliance": return window.ComplianceScreen;
      case "challans": return window.ChallansScreen;
      case "vendors": return window.VendorsScreen;
      case "reports": return window.ReportsScreen;
      case "alerts": return window.AlertsScreen;
      case "users": return window.UsersScreen;
      case "settings": return window.SettingsScreen;
      default: return window.DashboardScreen;
    }
  })() || (() => <div className="page"><div className="empty"><h4>Coming soon</h4><div>This module isn't built yet.</div></div></div>);

  const crumbs = ["GreenLine VMS", ...(CRUMB_MAP[current] || [current])];

  return (
    <div className="app">
      <window.Sidebar current={current} onNav={go} compact={t.compactSidebar} />
      <window.Topbar crumbs={crumbs} />
      <main className="main">
        <Screen onNav={go} />
      </main>

      <window.TweaksPanel>
        <window.TweakSection label="Theme" />
        <window.TweakColor
          label="Accent color"
          value={t.accent}
          options={["#2563eb", "#7c3aed", "#0d9488", "#dc2626"]}
          onChange={(v) => setTweak("accent", v)}
        />
        <window.TweakRadio
          label="Sidebar"
          value={t.sidebar}
          options={["dark", "light"]}
          onChange={(v) => setTweak("sidebar", v)}
        />
        <window.TweakToggle
          label="Compact sidebar"
          value={t.compactSidebar}
          onChange={(v) => setTweak("compactSidebar", v)}
        />
        <window.TweakSection label="Layout" />
        <window.TweakRadio
          label="Density"
          value={t.density}
          options={["dense", "balanced", "spacious"]}
          onChange={(v) => setTweak("density", v)}
        />
        <window.TweakToggle
          label="Show activity feed"
          value={t.showActivityFeed}
          onChange={(v) => setTweak("showActivityFeed", v)}
        />
      </window.TweaksPanel>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
