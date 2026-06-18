// Shared UI primitives — exposed on window.

const { useState, useEffect, useRef, useMemo, useCallback, Fragment } = React;

function Badge({ children, tone = "neutral", dot = false, outline = false, ...rest }) {
  const cls = ["badge", tone, outline ? "outline" : "", ...(rest.className ? [rest.className] : [])].join(" ");
  return (
    <span {...rest} className={cls}>
      {dot && <span className="dot" />}
      {children}
    </span>
  );
}

function StatusBadge({ value }) {
  const map = {
    "Active": { tone: "success", dot: true },
    "Non-Working": { tone: "danger", dot: true },
    "Scrapped": { tone: "neutral", dot: true },
    "Sold": { tone: "neutral", dot: true },
    "Coupled": { tone: "info", dot: true },
    "Decoupled": { tone: "neutral", dot: true },
    "Upcoming": { tone: "neutral", dot: true },
    "Due": { tone: "warn", dot: true },
    "Overdue": { tone: "danger", dot: true },
    "In Progress": { tone: "info", dot: true },
    "Completed": { tone: "success", dot: true },
    "Cancelled": { tone: "neutral", dot: true },
    "Open": { tone: "warn", dot: true },
    "Resolved": { tone: "success", dot: true },
    "Escalated": { tone: "danger", dot: true },
    "Fitted": { tone: "info", dot: true },
    "In Stock": { tone: "success", dot: true },
    "In Repair": { tone: "warn", dot: true },
    "Condemned": { tone: "neutral", dot: true },
    "Retreading": { tone: "info", dot: true },
    "Paid": { tone: "success", dot: true },
    "Unpaid": { tone: "danger", dot: true },
    "Contested": { tone: "warn", dot: true },
    "Pass": { tone: "success" },
    "Fail": { tone: "danger" },
    "Blacklisted": { tone: "danger", dot: true },
    "Valid": { tone: "success", dot: true },
    "Expiring Soon": { tone: "warn", dot: true },
    "Expired": { tone: "danger", dot: true },
  };
  const conf = map[value] || { tone: "neutral" };
  return <Badge tone={conf.tone} dot={conf.dot}>{value}</Badge>;
}

function PriorityBadge({ value }) {
  const map = { Critical: "danger", High: "warn", Medium: "info", Low: "neutral" };
  return <Badge tone={map[value] || "neutral"} dot>{value}</Badge>;
}

function ExpiryPill({ date }) {
  const days = window.VMS.daysFromNow(date);
  let tone = "success", label = "";
  if (days < 0) { tone = "danger"; label = `Expired ${-days}d ago`; }
  else if (days <= 7) { tone = "danger"; label = `${days}d left`; }
  else if (days <= 30) { tone = "warn"; label = `${days}d left`; }
  else if (days <= 60) { tone = "warn"; label = `${days}d left`; }
  else { tone = "success"; label = `${days}d left`; }
  return <Badge tone={tone}>{label}</Badge>;
}

function Button({ children, variant, size, icon: I, iconRight: IR, ...rest }) {
  const cls = [
    "btn",
    variant === "primary" ? "primary" : "",
    variant === "ghost" ? "ghost" : "",
    variant === "danger" ? "danger" : "",
    size === "lg" ? "lg" : size === "sm" ? "sm" : "",
    rest.className || "",
  ].join(" ");
  return (
    <button {...rest} className={cls}>
      {I && <I size={14} />}
      {children}
      {IR && <IR size={14} />}
    </button>
  );
}

function IconButton({ icon: I, size = 16, ...rest }) {
  return (
    <button {...rest} className={"icon-btn " + (rest.className || "")}>
      <I size={size} />
    </button>
  );
}

function Card({ title, sub, action, children, flush, padded = true, className = "" }) {
  return (
    <div className={"card " + className}>
      {(title || sub || action) && (
        <div className="card-h">
          <div>
            {title && <h3>{title}</h3>}
            {sub && <div className="sub">{sub}</div>}
          </div>
          {action}
        </div>
      )}
      <div className={"card-b" + (flush || !padded ? " flush" : "")}>{children}</div>
    </div>
  );
}

function KPI({ label, value, suffix, trend, trendDir, icon: I, sparkData }) {
  return (
    <div className="kpi">
      <div className="label">
        {I && <I size={13} />}
        {label}
      </div>
      <div className="value">
        {value}
        {suffix && <small>{suffix}</small>}
      </div>
      {(trend || sparkData) && (
        <div className="row" style={{ justifyContent: "space-between" }}>
          {trend && (
            <div className={"trend " + (trendDir === "up" ? "up" : trendDir === "down" ? "down" : "")}>
              {trendDir === "up" ? "▲" : trendDir === "down" ? "▼" : ""} {trend}
            </div>
          )}
          {sparkData && <Spark values={sparkData} />}
        </div>
      )}
    </div>
  );
}

function Spark({ values = [] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="spark">
      {values.map((v, i) => (
        <span
          key={i}
          className={i === values.length - 1 ? "hi" : ""}
          style={{ height: `${(v / max) * 100}%` }}
        />
      ))}
    </div>
  );
}

function Segmented({ value, onChange, options }) {
  return (
    <div className="seg">
      {options.map(o => (
        <button key={o} className={value === o ? "on" : ""} onClick={() => onChange(o)}>
          {o}
        </button>
      ))}
    </div>
  );
}

function Toolbar({ children }) {
  return <div className="toolbar">{children}</div>;
}
function Filter({ label, value, onClick }) {
  const Chev = window.Icons.ChevronDown;
  return (
    <button className="filter" onClick={onClick}>
      <span className="muted">{label}:</span>
      <b>{value}</b>
      <Chev size={12} />
    </button>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <div className="field">
      <label>
        {label}
        {required && <span className="req">*</span>}
        {hint && <span className="hint">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function Input(props) { return <input className="input" {...props} />; }
function Select({ children, ...rest }) { return <select className="select" {...rest}>{children}</select>; }
function Textarea(props) { return <textarea className="textarea" {...props} />; }

function Checkbox({ checked, onChange, label }) {
  return (
    <label className="checkbox">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange && onChange(e.target.checked)} />
      {label}
    </label>
  );
}

function Drop({ name, hint = "PDF, JPG, PNG up to 10 MB", filled, fileName }) {
  if (filled) {
    return (
      <div className="drop with-file">
        <div className="file-ico">
          <window.Icons.FileText size={16} />
        </div>
        <div style={{ flex: 1 }}>
          <div className="file-name">{fileName || `${name}.pdf`}</div>
          <div className="file-meta">1.2 MB · Uploaded just now</div>
        </div>
        <button className="icon-btn"><window.Icons.X size={14} /></button>
      </div>
    );
  }
  return (
    <div className="drop">
      <div style={{ marginBottom: 4 }}>
        <window.Icons.Upload size={18} />
      </div>
      <div><b>Click to upload</b> or drag &amp; drop</div>
      <div style={{ marginTop: 2, fontSize: 11.5 }}>{hint}</div>
    </div>
  );
}

function Progress({ value, max = 100, tone }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className={"progress " + (tone || "")}><span style={{ width: `${pct}%` }} /></div>
  );
}

function Avatar({ name, size = 28, color }) {
  const initials = (name || "").split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();
  const colors = ["#2563eb", "#7c3aed", "#0d9488", "#b45309", "#be123c", "#0369a1", "#16a34a", "#9333ea"];
  const bg = color || colors[(initials.charCodeAt(0) || 0) % colors.length];
  return (
    <span style={{
      width: size, height: size, borderRadius: "50%", display: "inline-grid", placeItems: "center",
      background: bg, color: "white", fontWeight: 600, fontSize: size * 0.4, flexShrink: 0,
    }}>{initials}</span>
  );
}

function Modal({ children, onClose, width = 640 }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <Fragment>
      <div className="scrim" onClick={onClose} />
      <div className="modal" style={{ width }}>{children}</div>
    </Fragment>
  );
}
function Drawer({ children, onClose, width }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <Fragment>
      <div className="scrim" onClick={onClose} />
      <div className="drawer" style={width ? { width } : undefined}>{children}</div>
    </Fragment>
  );
}

function EmptyState({ icon: I, title, children, action }) {
  return (
    <div className="empty">
      {I && <I size={28} />}
      <h4>{title}</h4>
      <div>{children}</div>
      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </div>
  );
}

function StatDot({ tone = "active", label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span className={"dot-status " + tone} />
      {label}
    </span>
  );
}

Object.assign(window, {
  Badge, StatusBadge, PriorityBadge, ExpiryPill, Button, IconButton,
  Card, KPI, Spark, Segmented, Toolbar, Filter,
  Field, Input, Select, Textarea, Checkbox, Drop, Progress, Avatar,
  Modal, Drawer, EmptyState, StatDot,
});
