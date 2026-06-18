// Icons — Lucide-style 1.5px stroke, 16px viewbox. Exposed on window.Icons.

const Icons = (() => {
  const make = (path, fill = false) => (props = {}) => {
    const { size = 16, ...rest } = props;
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={fill ? "currentColor" : "none"}
        stroke={fill ? "none" : "currentColor"}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...rest}
      >
        {path}
      </svg>
    );
  };
  return {
    Home: make(<><path d="M3 11l9-8 9 8" /><path d="M5 9v12h14V9" /></>),
    Truck: make(<><path d="M1 3h15v13H1z" /><path d="M16 8h4l3 3v5h-7" /><circle cx="6" cy="19" r="2" /><circle cx="18" cy="19" r="2" /></>),
    Trailer: make(<><rect x="1" y="6" width="20" height="11" rx="1" /><path d="M21 17h2v-3" /><circle cx="7" cy="19" r="2" /><circle cx="15" cy="19" r="2" /></>),
    Link: make(<><path d="M10 14a5 5 0 0 1 0-7l3-3a5 5 0 0 1 7 7l-1.5 1.5" /><path d="M14 10a5 5 0 0 1 0 7l-3 3a5 5 0 0 1-7-7l1.5-1.5" /></>),
    Wrench: make(<><path d="M14 6.5a3.5 3.5 0 1 1-4.5 4.5L4 16.5 7.5 20l5.5-5.5A3.5 3.5 0 1 1 14 6.5z" /></>),
    Tyre: make(<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /></>),
    Clipboard: make(<><rect x="6" y="4" width="12" height="17" rx="2" /><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" /><path d="M9 11h6M9 15h4" /></>),
    AlertTriangle: make(<><path d="M12 3l10 18H2L12 3z" /><path d="M12 10v5M12 18v.5" /></>),
    Shield: make(<><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" /><path d="M9 12l2 2 4-4" /></>),
    Receipt: make(<><path d="M4 3h16v18l-3-2-3 2-3-2-3 2-4-2V3z" /><path d="M8 8h8M8 12h8M8 16h5" /></>),
    Briefcase: make(<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M3 13h18" /></>),
    BarChart: make(<><path d="M4 21V10M10 21V4M16 21v-7M22 21H2" /></>),
    Bell: make(<><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8z" /><path d="M10 21a2 2 0 0 0 4 0" /></>),
    Users: make(<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>),
    Settings: make(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>),
    Search: make(<><circle cx="11" cy="11" r="7" /><path d="M21 21l-5-5" /></>),
    Plus: make(<><path d="M12 5v14M5 12h14" /></>),
    Filter: make(<><path d="M3 4h18l-7 9v7l-4-2v-5L3 4z" /></>),
    Download: make(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5M12 15V3" /></>),
    Upload: make(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M17 8l-5-5-5 5M12 3v12" /></>),
    More: make(<><circle cx="12" cy="12" r="1.4" fill="currentColor" /><circle cx="19" cy="12" r="1.4" fill="currentColor" /><circle cx="5" cy="12" r="1.4" fill="currentColor" /></>),
    ChevronRight: make(<><path d="M9 6l6 6-6 6" /></>),
    ChevronLeft: make(<><path d="M15 6l-6 6 6 6" /></>),
    ChevronDown: make(<><path d="M6 9l6 6 6-6" /></>),
    Check: make(<><path d="M5 13l5 5L20 7" /></>),
    X: make(<><path d="M6 6l12 12M18 6L6 18" /></>),
    ArrowRight: make(<><path d="M5 12h14M13 5l7 7-7 7" /></>),
    ArrowUp: make(<><path d="M12 19V5M5 12l7-7 7 7" /></>),
    ArrowDown: make(<><path d="M12 5v14M19 12l-7 7-7-7" /></>),
    Calendar: make(<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>),
    Clock: make(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
    File: make(<><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6" /></>),
    FileText: make(<><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6M8 13h8M8 17h6" /></>),
    Edit: make(<><path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6" /><path d="M18.4 2.6a2 2 0 0 1 2.8 2.8L11 16l-4 1 1-4 10.4-10.4z" /></>),
    Trash: make(<><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" /><path d="M10 11v6M14 11v6" /></>),
    Eye: make(<><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" /></>),
    Battery: make(<><rect x="2" y="7" width="18" height="10" rx="2" /><path d="M22 11v2" /><path d="M5 10v4M8 10v4M11 10v4" /></>),
    Gauge: make(<><circle cx="12" cy="12" r="9" /><path d="M12 12l5-3" /><path d="M8 15a4 4 0 0 1 8 0" /></>),
    MapPin: make(<><path d="M21 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>),
    Sparkles: make(<><path d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3z" /><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z" /></>),
    Activity: make(<><path d="M3 12h4l3-9 4 18 3-9h4" /></>),
    CheckCircle: make(<><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></>),
    XCircle: make(<><circle cx="12" cy="12" r="9" /><path d="M15 9l-6 6M9 9l6 6" /></>),
    Info: make(<><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8v.5" /></>),
    Refresh: make(<><path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" /><path d="M3 21v-5h5" /></>),
    Rotate: make(<><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></>),
    LogOut: make(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></>),
    Mail: make(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 7 9-7" /></>),
    Phone: make(<><path d="M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></>),
    Building: make(<><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M9 7h1M9 11h1M9 15h1M14 7h1M14 11h1M14 15h1M9 21v-4h6v4" /></>),
    Star: make(<><path d="M12 3l3 6 6 1-4.5 4 1 6.5L12 17l-5.5 3.5 1-6.5L3 10l6-1 3-6z" /></>),
    Layers: make(<><path d="M12 2l10 5-10 5L2 7l10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" /></>),
    Package: make(<><path d="M21 7v10a2 2 0 0 1-1 1.7l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 17V7a2 2 0 0 1 1-1.7l7-4a2 2 0 0 1 2 0l7 4A2 2 0 0 1 21 7z" /><path d="M3.3 6.2L12 11l8.7-4.8" /><path d="M12 22V11" /></>),
    Zap: make(<><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" /></>),
    Camera: make(<><path d="M3 7h4l2-3h6l2 3h4v13H3V7z" /><circle cx="12" cy="13" r="4" /></>),
    Pin: make(<><path d="M12 22V12M9 4h6l2 8H7l2-8z" /></>),
    PenTool: make(<><path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><path d="M2 2l7.6 7.6" /><circle cx="11" cy="11" r="2" /></>),
    Tag: make(<><path d="M20 12l-8 8-9-9V3h8l9 9z" /><circle cx="7.5" cy="7.5" r="1.5" /></>),
    Flag: make(<><path d="M4 22V4M4 4l14-2 1 9-15 2" /></>),
    Globe: make(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z" /></>),
    Database: make(<><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v6c0 1.7 4 3 9 3s9-1.3 9-3V5M3 11v6c0 1.7 4 3 9 3s9-1.3 9-3v-6" /></>),
    Help: make(<><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1.2.5-1.5 1.2-1.5 2M12 17v.5" /></>),
    Command: make(<><path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6z" /></>),
    Send: make(<><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></>),
    Boxes: make(<><path d="M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4M21 7v10l-9 4" /></>),
    Coupling: make(<><circle cx="6" cy="12" r="3" /><circle cx="18" cy="12" r="3" /><path d="M9 12h6" /></>),
    Document: make(<><path d="M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" /><path d="M14 2v6h6" /><path d="M8 13h8M8 17h5" /></>),
  };
})();

window.Icons = Icons;
