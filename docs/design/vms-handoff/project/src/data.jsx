// Mock data for GreenLine VMS — fleet of trucks, trailers, tyres, vendors, etc.
// All names/numbers/dates fictional. Indian context (MH/KA/TN plates, GST, INR).

const todayISO = "2026-05-19";
const today = new Date(todayISO);
const daysFromNow = (d) => {
  const t = new Date(d);
  return Math.round((t - today) / 86400000);
};
const fmtDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
const fmtINR = (n) => "₹" + (n || 0).toLocaleString("en-IN");
const fmtKM = (n) => (n || 0).toLocaleString("en-IN") + " km";

// ── Depots ────────────────────────────────────────────────────────────────
const DEPOTS = [
  { code: "JNPT", name: "JNPT, Navi Mumbai" },
  { code: "PUN", name: "Pune Chakan" },
  { code: "CHN", name: "Chennai Ennore" },
  { code: "BLR", name: "Bengaluru Hoskote" },
  { code: "DAH", name: "Dahej, Gujarat" },
];

// ── Vendors ───────────────────────────────────────────────────────────────
const VENDORS = [
  { code: "VEN-0021", name: "Sterling Auto Services", type: "Service Provider", city: "Pune", state: "MH", gst: "27ABCDE1234F1Z5", rating: 4.6, jobsCompleted: 142, avgTAT: "2.1 d", payment: "30 days", status: "Active", categories: ["Engine", "Electrical", "General"], brands: ["Tata", "Ashok Leyland"], contact: "Ravi Deshmukh", phone: "+91 98220 12345", email: "ravi@sterling.in", contractEnd: "2027-03-15" },
  { code: "VEN-0034", name: "Bajaj Tyre House", type: "Spare Parts Supplier", city: "Mumbai", state: "MH", gst: "27FGHIJ5678K2L1", rating: 4.8, jobsCompleted: 98, avgTAT: "0.5 d", payment: "45 days", status: "Active", categories: ["Tyre"], brands: ["MRF", "Apollo", "CEAT"], contact: "Suresh Iyer", phone: "+91 98765 43210", email: "ops@bajajtyres.in", contractEnd: "2026-08-20" },
  { code: "VEN-0058", name: "Patil Industrial Works", type: "Service Provider", city: "Pune", state: "MH", gst: "27MNOPQ9012R3S7", rating: 4.2, jobsCompleted: 71, avgTAT: "3.4 d", payment: "30 days", status: "Active", categories: ["Body", "General"], brands: ["Volvo", "BharatBenz"], contact: "Anita Patil", phone: "+91 90113 22115", email: "anita@patilworks.in", contractEnd: "2026-12-31" },
  { code: "VEN-0072", name: "GreenGas LNG Certifiers", type: "Service Provider", city: "Dahej", state: "GJ", gst: "24STUVW3456X7Y2", rating: 4.9, jobsCompleted: 28, avgTAT: "5.0 d", payment: "60 days", status: "Active", categories: ["LNG/CNG"], brands: [], contact: "Dr. M. Krishnan", phone: "+91 99300 11122", email: "certs@greengas.in", contractEnd: "2027-06-30" },
  { code: "VEN-0089", name: "Chennai Brake Systems", type: "Both", city: "Chennai", state: "TN", gst: "33ABCFG7890H1J2", rating: 4.0, jobsCompleted: 56, avgTAT: "2.8 d", payment: "30 days", status: "Active", categories: ["Engine", "General"], brands: ["Ashok Leyland", "Eicher"], contact: "P. Karthik", phone: "+91 99440 56781", email: "karthik@cbsteam.in", contractEnd: "2026-06-10" },
  { code: "VEN-0104", name: "RoadRunner Diesel", type: "Service Provider", city: "Bengaluru", state: "KA", gst: "29KLMNO4567P8Q3", rating: 3.5, jobsCompleted: 22, avgTAT: "4.6 d", payment: "45 days", status: "Active", categories: ["Engine", "Electrical"], brands: ["Volvo"], contact: "Hemanth Rao", phone: "+91 80471 22399", email: "hemanth@roadrunner.in", contractEnd: "2026-09-12" },
  { code: "VEN-0118", name: "TruckParts Direct", type: "Spare Parts Supplier", city: "Nashik", state: "MH", gst: "27RSTUV6789W4X8", rating: 4.4, jobsCompleted: 0, avgTAT: "—", payment: "30 days", status: "Active", categories: ["General"], brands: ["Tata", "Eicher"], contact: "Ms. Joshi", phone: "+91 96376 11334", email: "sales@truckparts.in", contractEnd: "2027-01-25" },
  { code: "VEN-0033", name: "Quickfix Auto", type: "Service Provider", city: "Mumbai", state: "MH", gst: "27YZABC1357D9E0", rating: 2.4, jobsCompleted: 12, avgTAT: "6.1 d", payment: "30 days", status: "Blacklisted", categories: ["General"], brands: [], contact: "—", phone: "—", email: "—", contractEnd: "2025-12-31" },
];

// ── Trucks ────────────────────────────────────────────────────────────────
const TRUCKS = [
  { code: "TRK-0008", reg: "MH04 EQ 8821", type: "Tanker", make: "Tata", model: "Signa 4825.T", year: 2022, vin: "MAT1AVNFP3PG12345", fuel: "LNG", gvw: 49000, payload: 28000, axles: 3, depot: "JNPT", ownership: "Owned", status: "Active", odo: 142875, batteryMake: "Exide", batterySerial: "EX-22113-A", batteryExpiry: "2026-08-10", purchaseDate: "2022-04-15", purchasePrice: 4275000, fitness: "2027-03-12", insurance: "2026-06-08", permit: "2026-11-30", peso: "2026-07-15", piping: "2026-09-04" },
  { code: "TRK-0009", reg: "MH04 EQ 8823", type: "Tanker", make: "Volvo", model: "FM 460 6x4", year: 2023, vin: "YV2RDX1H1HB678233", fuel: "LNG", gvw: 49000, payload: 30000, axles: 3, depot: "JNPT", ownership: "Owned", status: "Active", odo: 89020, batteryMake: "Amaron", batterySerial: "AM-23-001", batteryExpiry: "2027-02-18", purchaseDate: "2023-01-22", purchasePrice: 6890000, fitness: "2027-12-30", insurance: "2026-08-22", permit: "2027-01-10", peso: "2026-12-30", piping: "2027-02-14" },
  { code: "TRK-0011", reg: "KA03 MN 4419", type: "Tanker", make: "BharatBenz", model: "4928 TT", year: 2024, vin: "MEC4928TT4XPB91200", fuel: "CNG", gvw: 49000, payload: 28000, axles: 3, depot: "BLR", ownership: "Leased", status: "Active", odo: 41320, batteryMake: "Exide", batterySerial: "EX-24-7821", batteryExpiry: "2027-09-04", purchaseDate: "2024-02-10", purchasePrice: 5125000, fitness: "2027-02-09", insurance: "2027-02-09", permit: "2027-02-09", peso: "2026-05-26", piping: "2026-06-30" },
  { code: "TRK-0013", reg: "TN10 BB 1102", type: "Truck", make: "Ashok Leyland", model: "Captain 3520", year: 2021, vin: "ALCT3520BB11023021", fuel: "Diesel", gvw: 35000, payload: 22000, axles: 3, depot: "CHN", ownership: "Owned", status: "Active", odo: 196488, batteryMake: "Amaron", batterySerial: "AM-21-7790", batteryExpiry: "2026-06-02", purchaseDate: "2021-08-04", purchasePrice: 3290000, fitness: "2026-09-21", insurance: "2026-05-30", permit: "2026-08-04", peso: null, piping: null },
  { code: "TRK-0014", reg: "MH12 AC 3344", type: "Truck", make: "Tata", model: "Prima 4028.S", year: 2023, vin: "TAT4028S2023MH3344", fuel: "Diesel", gvw: 40000, payload: 25000, axles: 3, depot: "PUN", ownership: "Owned", status: "Non-Working", odo: 71045, batteryMake: "Exide", batterySerial: "EX-23-1199", batteryExpiry: "2027-01-19", purchaseDate: "2023-03-12", purchasePrice: 4150000, fitness: "2027-03-11", insurance: "2026-07-25", permit: "2026-12-12", peso: null, piping: null },
  { code: "TRK-0015", reg: "MH14 DA 7702", type: "Tipper", make: "Eicher", model: "Pro 6055", year: 2022, vin: "EIC6055P2022MH7702", fuel: "Diesel", gvw: 30000, payload: 18000, axles: 2, depot: "PUN", ownership: "Hired", status: "Active", odo: 158220, batteryMake: "Amaron", batterySerial: "AM-22-3344", batteryExpiry: "2026-06-30", purchaseDate: "2022-06-22", purchasePrice: 2890000, fitness: "2026-06-22", insurance: "2026-06-30", permit: "2026-06-30", peso: null, piping: null },
  { code: "TRK-0017", reg: "GJ05 KK 9001", type: "Tanker", make: "Volvo", model: "FH 540 6x4", year: 2024, vin: "VOL540FH2024GJ9001", fuel: "LNG", gvw: 49000, payload: 32000, axles: 3, depot: "DAH", ownership: "Owned", status: "Active", odo: 22150, batteryMake: "Bosch", batterySerial: "BO-24-1122", batteryExpiry: "2028-01-30", purchaseDate: "2024-04-02", purchasePrice: 7430000, fitness: "2027-04-01", insurance: "2027-04-01", permit: "2027-04-01", peso: "2026-10-12", piping: "2026-12-04" },
  { code: "TRK-0018", reg: "KA51 AC 6610", type: "Truck", make: "Tata", model: "LPT 2518", year: 2020, vin: "TAT2518LPT2020KA661", fuel: "Diesel", gvw: 25000, payload: 15500, axles: 2, depot: "BLR", ownership: "Owned", status: "Non-Working", odo: 248790, batteryMake: "Exide", batterySerial: "EX-20-0089", batteryExpiry: "2026-05-21", purchaseDate: "2020-05-11", purchasePrice: 2150000, fitness: "2026-05-22", insurance: "2026-05-21", permit: "2026-11-08", peso: null, piping: null },
];

// ── Trailers ──────────────────────────────────────────────────────────────
const TRAILERS = [
  { code: "TRL-0102", reg: "MH04 EZ 1102", type: "Tanker (LNG)", make: "Inter Mountain", model: "LNG 40KL", year: 2022, vin: "IM40KL2022MH1102LNG", axles: 3, tyres: 12, depot: "JNPT", ownership: "Owned", status: "Active", coupledTo: "TRK-0008", purchaseDate: "2022-04-15", purchasePrice: 8200000, payload: 28000, peso: "2026-07-15", piping: "2026-09-04", fitness: "2027-03-12", insurance: "2026-06-08" },
  { code: "TRL-0118", reg: "MH04 EZ 1118", type: "Tanker (LNG)", make: "Inter Mountain", model: "LNG 40KL", year: 2023, vin: "IM40KL2023MH1118LNG", axles: 3, tyres: 12, depot: "JNPT", ownership: "Owned", status: "Active", coupledTo: "TRK-0009", purchaseDate: "2023-01-22", purchasePrice: 8400000, payload: 30000, peso: "2026-12-30", piping: "2027-02-14", fitness: "2027-12-30", insurance: "2026-08-22" },
  { code: "TRL-0124", reg: "KA03 MZ 4419", type: "Tanker (CNG)", make: "Cryolor", model: "CNG 35KL", year: 2024, vin: "CR35KLCNG2024KA4419", axles: 3, tyres: 12, depot: "BLR", ownership: "Leased", status: "Active", coupledTo: "TRK-0011", purchaseDate: "2024-02-10", purchasePrice: 7950000, payload: 28000, peso: "2026-05-26", piping: "2026-06-30", fitness: "2027-02-09", insurance: "2027-02-09" },
  { code: "TRL-0089", reg: "TN10 BZ 1102", type: "Flat-Bed", make: "Bharath Forge", model: "FB-40", year: 2021, vin: "BFFB402021TN1102FB", axles: 3, tyres: 12, depot: "CHN", ownership: "Owned", status: "Active", coupledTo: "TRK-0013", purchaseDate: "2021-08-04", purchasePrice: 1850000, payload: 25000, peso: null, piping: null, fitness: "2026-09-21", insurance: "2026-05-30" },
  { code: "TRL-0145", reg: "GJ05 KZ 9001", type: "Tanker (LNG)", make: "Inter Mountain", model: "LNG 45KL", year: 2024, vin: "IM45KL2024GJ9001LNG", axles: 3, tyres: 12, depot: "DAH", ownership: "Owned", status: "Active", coupledTo: "TRK-0017", purchaseDate: "2024-04-02", purchasePrice: 9200000, payload: 32000, peso: "2026-10-12", piping: "2026-12-04", fitness: "2027-04-01", insurance: "2027-04-01" },
  { code: "TRL-0091", reg: "MH12 AZ 3344", type: "Box", make: "Stallion", model: "BX-32", year: 2023, vin: "STBX322023MH3344BX", axles: 2, tyres: 8, depot: "PUN", ownership: "Owned", status: "Active", coupledTo: null, purchaseDate: "2023-03-12", purchasePrice: 1450000, payload: 22000, peso: null, piping: null, fitness: "2027-03-11", insurance: "2026-07-25" },
  { code: "TRL-0067", reg: "MH14 DZ 7702", type: "Tipper", make: "Stallion", model: "TP-30", year: 2022, vin: "STTP302022MH7702TP", axles: 2, tyres: 8, depot: "PUN", ownership: "Hired", status: "Non-Working", coupledTo: null, purchaseDate: "2022-06-22", purchasePrice: 1280000, payload: 18000, peso: null, piping: null, fitness: "2026-06-22", insurance: "2026-06-30" },
];

// ── Maintenance jobs ──────────────────────────────────────────────────────
const SCHEDULE_TEMPLATES = [
  { code: "TPL-001", name: "10,000 km Engine Service", appliesTo: "Truck", trigger: "Mileage", interval: "10,000 km", category: "Engine", duration: "4 h", cost: 12500, items: 14 },
  { code: "TPL-002", name: "40,000 km Major Service", appliesTo: "Truck", trigger: "Mileage", interval: "40,000 km", category: "Engine", duration: "8 h", cost: 38000, items: 28 },
  { code: "TPL-003", name: "6-Month Safety Inspection", appliesTo: "Both", trigger: "Calendar", interval: "180 days", category: "General", duration: "3 h", cost: 6500, items: 22 },
  { code: "TPL-004", name: "Annual Fitness Prep", appliesTo: "Both", trigger: "Calendar", interval: "365 days", category: "General", duration: "6 h", cost: 18000, items: 35 },
  { code: "TPL-005", name: "Wheel Alignment", appliesTo: "Both", trigger: "Mileage", interval: "25,000 km", category: "Tyre", duration: "2 h", cost: 4200, items: 6 },
  { code: "TPL-006", name: "LNG Vapouriser Service", appliesTo: "Truck", trigger: "Calendar", interval: "90 days", category: "LNG/CNG", duration: "3 h", cost: 8500, items: 8 },
];

const JOBS = [
  { id: "JOB-1042", truck: "MH04 EQ 8821", truckCode: "TRK-0008", template: "10,000 km Engine Service", dueDate: "2026-05-15", dueOdo: 145000, priority: "Critical", status: "Overdue", assignedVendor: "Sterling Auto Services", vendorCode: "VEN-0021", assignedDate: "2026-05-11", category: "Engine" },
  { id: "JOB-1043", truck: "MH04 EQ 8823", truckCode: "TRK-0009", template: "6-Month Safety Inspection", dueDate: "2026-05-22", dueOdo: 90000, priority: "High", status: "Due", assignedVendor: "Sterling Auto Services", vendorCode: "VEN-0021", assignedDate: "2026-05-18", category: "General" },
  { id: "JOB-1044", truck: "KA03 MN 4419", truckCode: "TRK-0011", template: "LNG Vapouriser Service", dueDate: "2026-05-26", dueOdo: 42000, priority: "High", status: "Upcoming", assignedVendor: null, vendorCode: null, assignedDate: null, category: "LNG/CNG" },
  { id: "JOB-1045", truck: "TN10 BB 1102", truckCode: "TRK-0013", template: "40,000 km Major Service", dueDate: "2026-05-20", dueOdo: 200000, priority: "Medium", status: "In Progress", assignedVendor: "Chennai Brake Systems", vendorCode: "VEN-0089", assignedDate: "2026-05-14", category: "Engine" },
  { id: "JOB-1046", truck: "MH14 DA 7702", truckCode: "TRK-0015", template: "Annual Fitness Prep", dueDate: "2026-06-10", dueOdo: 160000, priority: "Medium", status: "Upcoming", assignedVendor: "Patil Industrial Works", vendorCode: "VEN-0058", assignedDate: "2026-05-18", category: "General" },
  { id: "JOB-1047", truck: "GJ05 KK 9001", truckCode: "TRK-0017", template: "10,000 km Engine Service", dueDate: "2026-06-02", dueOdo: 25000, priority: "Low", status: "Upcoming", assignedVendor: null, vendorCode: null, assignedDate: null, category: "Engine" },
  { id: "JOB-1048", truck: "MH04 EQ 8821", truckCode: "TRK-0008", template: "Wheel Alignment", dueDate: "2026-05-30", dueOdo: 145000, priority: "Low", status: "Upcoming", assignedVendor: null, vendorCode: null, assignedDate: null, category: "Tyre" },
  { id: "JOB-1040", truck: "KA51 AC 6610", truckCode: "TRK-0018", template: "6-Month Safety Inspection", dueDate: "2026-05-10", dueOdo: 250000, priority: "Critical", status: "Overdue", assignedVendor: "RoadRunner Diesel", vendorCode: "VEN-0104", assignedDate: "2026-05-05", category: "General" },
  { id: "JOB-1037", truck: "MH04 EQ 8821", truckCode: "TRK-0008", template: "40,000 km Major Service", dueDate: "2026-04-22", dueOdo: 140000, priority: "High", status: "Completed", assignedVendor: "Sterling Auto Services", vendorCode: "VEN-0021", assignedDate: "2026-04-18", category: "Engine", actualCost: 41200, completedDate: "2026-04-26" },
  { id: "JOB-1035", truck: "MH04 EQ 8823", truckCode: "TRK-0009", template: "10,000 km Engine Service", dueDate: "2026-04-15", dueOdo: 85000, priority: "Medium", status: "Completed", assignedVendor: "Sterling Auto Services", vendorCode: "VEN-0021", assignedDate: "2026-04-10", category: "Engine", actualCost: 11800, completedDate: "2026-04-18" },
];

// ── Tyres ─────────────────────────────────────────────────────────────────
const TYRES = [
  { code: "TYR-2201", oem: "MRF", brand: "Steel Muscle", model: "MUS Plus", size: "11R22.5", serial: "MRF2201A77819", purchasedAt: "2024-08-12", price: 22500, life: 90000, type: "New", treadAtPurchase: 19, status: "Fitted", fittedTo: "TRK-0008", axle: 1, position: "LF", odoFitted: 95000, kmRun: 47875, cpkActual: null },
  { code: "TYR-2202", oem: "MRF", brand: "Steel Muscle", model: "MUS Plus", size: "11R22.5", serial: "MRF2201A77820", purchasedAt: "2024-08-12", price: 22500, life: 90000, type: "New", treadAtPurchase: 19, status: "Fitted", fittedTo: "TRK-0008", axle: 1, position: "RF", odoFitted: 95000, kmRun: 47875, cpkActual: null },
  { code: "TYR-2203", oem: "Bridgestone", brand: "M788", model: "Drive", size: "11R22.5", serial: "BS788D44115", purchasedAt: "2024-04-08", price: 31200, life: 110000, type: "New", treadAtPurchase: 21, status: "Fitted", fittedTo: "TRK-0008", axle: 2, position: "LO", odoFitted: 86000, kmRun: 56875, cpkActual: null },
  { code: "TYR-2204", oem: "Bridgestone", brand: "M788", model: "Drive", size: "11R22.5", serial: "BS788D44116", purchasedAt: "2024-04-08", price: 31200, life: 110000, type: "New", treadAtPurchase: 21, status: "Fitted", fittedTo: "TRK-0008", axle: 2, position: "LI", odoFitted: 86000, kmRun: 56875, cpkActual: null },
  { code: "TYR-2205", oem: "Bridgestone", brand: "M788", model: "Drive", size: "11R22.5", serial: "BS788D44117", purchasedAt: "2024-04-08", price: 31200, life: 110000, type: "New", treadAtPurchase: 21, status: "Fitted", fittedTo: "TRK-0008", axle: 2, position: "RI", odoFitted: 86000, kmRun: 56875, cpkActual: null },
  { code: "TYR-2206", oem: "Bridgestone", brand: "M788", model: "Drive", size: "11R22.5", serial: "BS788D44118", purchasedAt: "2024-04-08", price: 31200, life: 110000, type: "New", treadAtPurchase: 21, status: "Fitted", fittedTo: "TRK-0008", axle: 2, position: "RO", odoFitted: 86000, kmRun: 56875, cpkActual: null },
  { code: "TYR-1980", oem: "Apollo", brand: "Endurance", model: "LD", size: "11R22.5", serial: "AP19LD0021", purchasedAt: "2023-11-04", price: 18900, life: 80000, type: "Retreaded", treadAtPurchase: 16, status: "Condemned", fittedTo: null, axle: null, position: null, odoFitted: null, kmRun: 81200, cpkActual: 0.233 },
  { code: "TYR-2110", oem: "MRF", brand: "Steel Muscle", model: "MUS Plus", size: "11R22.5", serial: "MRF21SM0118", purchasedAt: "2024-02-22", price: 22500, life: 90000, type: "New", treadAtPurchase: 19, status: "In Stock", fittedTo: null, axle: null, position: null, odoFitted: null, kmRun: 0, cpkActual: null },
  { code: "TYR-2111", oem: "CEAT", brand: "Win Energy X3", model: "Drive", size: "11R22.5", serial: "CT22WX0019", purchasedAt: "2024-05-15", price: 24800, life: 95000, type: "New", treadAtPurchase: 20, status: "In Stock", fittedTo: null, axle: null, position: null, odoFitted: null, kmRun: 0, cpkActual: null },
  { code: "TYR-2050", oem: "Apollo", brand: "Endurance", model: "RA", size: "11R22.5", serial: "AP20EN0044", purchasedAt: "2024-01-12", price: 19500, life: 85000, type: "New", treadAtPurchase: 18, status: "In Repair", fittedTo: null, axle: null, position: null, odoFitted: null, kmRun: 32400, cpkActual: null },
];

// ── Coupling history ──────────────────────────────────────────────────────
const COUPLINGS = [
  { id: "CPL-0211", truck: "TRK-0008", truckReg: "MH04 EQ 8821", trailer: "TRL-0102", trailerReg: "MH04 EZ 1102", coupledAt: "2026-04-18 08:14", coupledBy: "K. Joshi", odo: 138400, status: "Coupled", purpose: "JNPT → Dahej LNG dispatch" },
  { id: "CPL-0210", truck: "TRK-0009", truckReg: "MH04 EQ 8823", trailer: "TRL-0118", trailerReg: "MH04 EZ 1118", coupledAt: "2026-04-22 11:02", coupledBy: "K. Joshi", odo: 84120, status: "Coupled", purpose: "JNPT → Hazira" },
  { id: "CPL-0209", truck: "TRK-0011", truckReg: "KA03 MN 4419", trailer: "TRL-0124", trailerReg: "KA03 MZ 4419", coupledAt: "2026-04-25 06:30", coupledBy: "P. Karthik", odo: 39870, status: "Coupled", purpose: "Hoskote → Coimbatore CNG run" },
  { id: "CPL-0208", truck: "TRK-0013", truckReg: "TN10 BB 1102", trailer: "TRL-0089", trailerReg: "TN10 BZ 1102", coupledAt: "2026-05-01 09:45", coupledBy: "A. Subramaniam", odo: 194000, status: "Coupled", purpose: "Ennore steel haul" },
  { id: "CPL-0207", truck: "TRK-0017", truckReg: "GJ05 KK 9001", trailer: "TRL-0145", trailerReg: "GJ05 KZ 9001", coupledAt: "2026-05-04 07:15", coupledBy: "R. Patel", odo: 20990, status: "Coupled", purpose: "Dahej → Mumbai LNG" },
  { id: "CPL-0205", truck: "TRK-0008", truckReg: "MH04 EQ 8821", trailer: "TRL-0118", trailerReg: "MH04 EZ 1118", coupledAt: "2026-03-12 06:00", decoupledAt: "2026-04-15 18:30", coupledBy: "K. Joshi", odo: 121000, decoupleOdo: 138200, status: "Decoupled", purpose: "Temp swap during TRL-0102 fitness renewal" },
];

// ── Non-Working register ──────────────────────────────────────────────────
const ISSUES = [
  { id: "NWV-0078", reg: "MH12 AC 3344", truckCode: "TRK-0014", date: "2026-05-16", reportedBy: "Driver: B. Yadav", category: "Engine", severity: "Critical", description: "Engine cranks but won't start. Suspected fuel pump failure after long idling at Bhiwandi yard.", action: "Tow to Pune workshop; replace fuel pump, bleed system, test idle 30 min.", vendor: "Sterling Auto Services", assigned: "2026-05-17", expectedFix: "2026-05-21", status: "In Progress" },
  { id: "NWV-0077", reg: "KA51 AC 6610", truckCode: "TRK-0018", date: "2026-05-10", reportedBy: "EPIC 1.0 upload", category: "Transmission", severity: "Major", description: "Gear slipping in 4th and 5th, clutch judder reported by 3 drivers over 2 weeks.", action: "Full clutch assembly replacement; gearbox seal inspection.", vendor: "RoadRunner Diesel", assigned: "2026-05-12", expectedFix: "2026-05-20", status: "Escalated" },
  { id: "NWV-0076", reg: "MH14 DZ 7702", truckCode: null, date: "2026-05-08", reportedBy: "Workshop: Pune", category: "Body", severity: "Minor", description: "Tipper hydraulic ram leaking; cosmetic dent on left side from low-clearance bridge.", action: "Replace seal kit; touch-up paint; alignment check.", vendor: "Patil Industrial Works", assigned: "2026-05-09", expectedFix: "2026-05-15", status: "Resolved" },
  { id: "NWV-0079", reg: "TRL-0067", truckCode: null, date: "2026-05-17", reportedBy: "Compliance Officer", category: "Regulatory", severity: "Major", description: "Fitness certificate not renewed; vehicle parked at Chakan since due date.", action: "Submit RTO documents; book fitness inspection slot; vehicle cleaned and prepped.", vendor: null, assigned: null, expectedFix: "2026-05-25", status: "Open" },
];

// ── Compliance docs / alerts ──────────────────────────────────────────────
const COMPLIANCE = (() => {
  const docs = [];
  TRUCKS.forEach(t => {
    if (t.insurance) docs.push({ vehicle: t.reg, vCode: t.code, type: "Insurance", number: "POL/" + t.code.slice(-4) + "/26", expiry: t.insurance, status: "Truck" });
    if (t.fitness) docs.push({ vehicle: t.reg, vCode: t.code, type: "Fitness", number: "FIT/" + t.code.slice(-4) + "/26", expiry: t.fitness, status: "Truck" });
    if (t.permit) docs.push({ vehicle: t.reg, vCode: t.code, type: "Permit (National)", number: "NP/" + t.code.slice(-4) + "/26", expiry: t.permit, status: "Truck" });
    if (t.peso) docs.push({ vehicle: t.reg, vCode: t.code, type: "PESO", number: "PESO/MUM/2026/" + t.code.slice(-4), expiry: t.peso, status: "Truck" });
    if (t.piping) docs.push({ vehicle: t.reg, vCode: t.code, type: "Piping", number: "PIP/MUM/2026/" + t.code.slice(-4), expiry: t.piping, status: "Truck" });
  });
  return docs;
})();

// ── PUC ───────────────────────────────────────────────────────────────────
const PUC = [
  { id: "PUC-2026-0098", reg: "MH04 EQ 8821", testCentre: "Speedway PUC, Vashi", testDate: "2025-11-22", validity: "2026-05-22", co: 0.18, hc: 81, result: "Pass" },
  { id: "PUC-2026-0102", reg: "MH04 EQ 8823", testCentre: "Speedway PUC, Vashi", testDate: "2026-01-08", validity: "2026-07-08", co: 0.21, hc: 102, result: "Pass" },
  { id: "PUC-2026-0114", reg: "KA03 MN 4419", testCentre: "RTO Test Centre, Bengaluru", testDate: "2025-12-12", validity: "2026-06-12", co: 0.15, hc: 76, result: "Pass" },
  { id: "PUC-2026-0119", reg: "TN10 BB 1102", testCentre: "Auto Care PUC, Ennore", testDate: "2025-12-30", validity: "2026-06-30", co: 0.34, hc: 168, result: "Pass" },
  { id: "PUC-2025-0331", reg: "MH14 DA 7702", testCentre: "Pune PUC Centre 12", testDate: "2025-10-18", validity: "2026-04-18", co: 0.42, hc: 192, result: "Fail" },
];

// ── Challans ──────────────────────────────────────────────────────────────
const CHALLANS = [
  { id: "CHL-2026-0212", reg: "MH04 EQ 8821", date: "2026-05-04", authority: "Traffic Police, Mumbai", number: "MH0405210212", offence: "Over-speeding (98 km/h in 80 zone) — NH-48", fine: 2000, status: "Unpaid", driver: "K. Joshi" },
  { id: "CHL-2026-0198", reg: "MH04 EQ 8823", date: "2026-04-18", authority: "RTO Maharashtra", number: "RTO-MH-04-04-2611", offence: "Permit expired beyond grace period", fine: 5000, status: "Paid", paidOn: "2026-04-25", ref: "TXN3344590", driver: "S. Pawar" },
  { id: "CHL-2026-0184", reg: "TN10 BB 1102", date: "2026-04-11", authority: "NHAI", number: "NHAI-CHN-44129", offence: "Underweight axle declaration", fine: 7500, status: "Contested", driver: "A. Subramaniam" },
  { id: "CHL-2026-0167", reg: "KA03 MN 4419", date: "2026-03-22", authority: "Traffic Police, Bengaluru", number: "BLR-TP-3398211", offence: "Signal violation, Hosur Rd", fine: 1500, status: "Paid", paidOn: "2026-03-26", ref: "TXN3301889", driver: "P. Karthik" },
  { id: "CHL-2026-0241", reg: "MH14 DA 7702", date: "2026-05-13", authority: "Traffic Police, Pune", number: "PUN-TP-5512200", offence: "Driving without valid PUC", fine: 10000, status: "Unpaid", driver: "B. Yadav" },
];

// ── Users ─────────────────────────────────────────────────────────────────
const USERS = [
  { id: "USR-0001", name: "Anika Mehta", username: "anika.mehta", email: "anika.mehta@greenline.in", phone: "+91 98220 11200", dept: "Workshop", roles: ["Maintenance Manager"], status: "Active", lastLogin: "2026-05-19 08:42" },
  { id: "USR-0002", name: "Rohit Sharma", username: "rohit.s", email: "rohit.s@greenline.in", phone: "+91 98220 18821", dept: "Operations", roles: ["Fleet Manager"], status: "Active", lastLogin: "2026-05-19 07:15" },
  { id: "USR-0003", name: "K. Joshi", username: "k.joshi", email: "k.joshi@greenline.in", phone: "+91 98220 33442", dept: "Workshop", roles: ["Workshop Supervisor"], status: "Active", lastLogin: "2026-05-18 19:22" },
  { id: "USR-0004", name: "Priya Nair", username: "priya.n", email: "priya.n@greenline.in", phone: "+91 98220 88112", dept: "Compliance", roles: ["Compliance Officer"], status: "Active", lastLogin: "2026-05-19 09:01" },
  { id: "USR-0005", name: "Sandeep Iyer", username: "sandeep.i", email: "sandeep.i@greenline.in", phone: "+91 98220 22119", dept: "Finance", roles: ["Accounts Executive"], status: "Active", lastLogin: "2026-05-19 08:55" },
  { id: "USR-0006", name: "B. Yadav", username: "byadav", email: "—", phone: "+91 98220 44551", dept: "Operations", roles: ["Driver / Operator"], status: "Active", lastLogin: "2026-05-16 06:11" },
  { id: "USR-0007", name: "Vikram Singh", username: "vikram.s", email: "vikram.s@greenline.in", phone: "+91 98220 67234", dept: "IT", roles: ["System Administrator"], status: "Active", lastLogin: "2026-05-18 22:14" },
  { id: "USR-0008", name: "Meera Patil", username: "meera.p", email: "meera.p@greenline.in", phone: "+91 98220 99001", dept: "Management", roles: ["Read-Only Viewer"], status: "Active", lastLogin: "2026-05-17 14:33" },
];

const ALERTS_FEED = [
  { id: "A-9821", type: "PESO Expiry", severity: "danger", target: "KA03 MN 4419", message: "PESO certificate expires in 7 days", time: "12 min ago", channel: "In-app + SMS" },
  { id: "A-9820", type: "PM Overdue", severity: "danger", target: "MH04 EQ 8821", message: "10,000 km Engine Service overdue by 4 days", time: "1 h ago", channel: "In-app + Email" },
  { id: "A-9819", type: "Battery Warranty", severity: "warn", target: "KA51 AC 6610", message: "Battery warranty expires in 2 days (Exide EX-20-0089)", time: "2 h ago", channel: "In-app + Email" },
  { id: "A-9818", type: "Non-Working Critical", severity: "danger", target: "MH12 AC 3344", message: "Critical issue NWV-0078 — repair started", time: "3 h ago", channel: "In-app + SMS" },
  { id: "A-9817", type: "PUC Expired", severity: "warn", target: "MH14 DA 7702", message: "PUC certificate expired; vehicle flagged on EPIC", time: "5 h ago", channel: "In-app + Email" },
  { id: "A-9816", type: "Insurance Expiry", severity: "warn", target: "TN10 BB 1102", message: "Insurance policy expires in 11 days", time: "Yesterday", channel: "In-app + Email" },
  { id: "A-9815", type: "Tyre CPK Breach", severity: "info", target: "TYR-2204 · TRK-0008", message: "Actual CPK 23% above budget — review required", time: "Yesterday", channel: "In-app" },
  { id: "A-9814", type: "Challan Unpaid", severity: "warn", target: "MH04 EQ 8821", message: "Challan CHL-2026-0212 unpaid (15 days)", time: "2 days ago", channel: "In-app + Email" },
];

// Make all available globally
window.VMS = {
  today, todayISO, daysFromNow, fmtDate, fmtINR, fmtKM,
  DEPOTS, VENDORS, TRUCKS, TRAILERS, JOBS, TYRES, SCHEDULE_TEMPLATES,
  COUPLINGS, ISSUES, COMPLIANCE, PUC, CHALLANS, USERS, ALERTS_FEED,
};
