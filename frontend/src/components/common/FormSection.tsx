import type { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function FormSection({ title, subtitle, children }: FormSectionProps) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="card-h">
        <div>
          <h3>{title}</h3>
          {subtitle && <div className="sub">{subtitle}</div>}
        </div>
      </div>
      <div className="card-b">{children}</div>
    </div>
  );
}

/** Responsive field grid: 3 columns desktop, 2 tablet, 1 mobile (handled in index.css breakpoints). */
export function FormGridCols({ cols = 3, children }: { cols?: 2 | 3 | 4; children: ReactNode }) {
  return <div className={`field-row cols-${cols}`}>{children}</div>;
}
