const STATUS_TONE: Record<string, 'success' | 'warn' | 'danger' | 'info' | 'neutral'> = {
  Active: 'success', Available: 'success', Approved: 'success', Valid: 'success', Closed: 'neutral',
  Draft: 'warn', PendingApproval: 'warn', Pending: 'warn', UnderMaintenance: 'warn', Coupled: 'info',
  Inactive: 'neutral', Decoupled: 'neutral', Submitted: 'info', InTrip: 'info', Assigned: 'info',
  Expired: 'danger', Scrapped: 'danger', Sold: 'neutral', Breakdown: 'danger', AccidentHold: 'danger',
  ComplianceHold: 'danger', WorkshopHold: 'danger', Dead: 'danger', Scrap: 'danger', Disposed: 'neutral',
};

function toneFor(status: string): 'success' | 'warn' | 'danger' | 'info' | 'neutral' {
  return STATUS_TONE[status] ?? 'neutral';
}

function humanize(status: string): string {
  return status.replace(/([a-z])([A-Z])/g, '$1 $2');
}

export function StatusBadge({ status }: { status: string | null | undefined }) {
  if (!status) return <span className="badge neutral">Not Applicable</span>;
  return <span className={`badge ${toneFor(status)}`}>{humanize(status)}</span>;
}

export type ExpiryTone = 'success' | 'warn' | 'danger' | 'neutral';

export function expiryTone(expiryDate: string | null | undefined, amberDays = 30, redDays = 7): ExpiryTone {
  if (!expiryDate) return 'neutral';
  const days = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000);
  if (days < 0) return 'danger';
  if (days <= redDays) return 'danger';
  if (days <= amberDays) return 'warn';
  return 'success';
}

/** Red/Amber/Green expiry indicator that always pairs color with a text label. */
export function ExpiryStatusBadge({ expiryDate, amberDays = 30, redDays = 7 }: { expiryDate: string | null | undefined; amberDays?: number; redDays?: number }) {
  if (!expiryDate) return <span className="badge neutral">Not Applicable</span>;
  const date = new Date(expiryDate);
  const days = Math.ceil((date.getTime() - Date.now()) / 86400000);
  const tone = expiryTone(expiryDate, amberDays, redDays);
  const label = days < 0
    ? 'Expired'
    : days <= redDays
      ? `Expiring in ${days} day${days === 1 ? '' : 's'}`
      : days <= amberDays
        ? `Expiring in ${days} days`
        : `Valid till ${date.toLocaleDateString()}`;
  return <span className={`badge ${tone}`}>{label}</span>;
}
