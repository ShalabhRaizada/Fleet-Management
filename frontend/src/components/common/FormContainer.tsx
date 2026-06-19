import { useEffect, type FormEvent, type ReactNode } from 'react';

interface FormContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onSubmit: (e: FormEvent) => void;
  loading?: boolean;
  /** When true, warns the user before navigating away (browser unload) with unsaved changes. */
  dirty?: boolean;
  maxWidth?: number;
}

export function FormContainer({ title, subtitle, children, onSubmit, loading, dirty, maxWidth = 980 }: FormContainerProps) {
  useEffect(() => {
    if (!dirty) return;
    function handler(e: BeforeUnloadEvent) { e.preventDefault(); e.returnValue = ''; }
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  if (loading) return <div className="muted">Loading...</div>;

  return (
    <div style={{ maxWidth }}>
      <div className="page-header">
        <h1>{title}</h1>
        {subtitle && <div className="muted">{subtitle}</div>}
      </div>
      <form onSubmit={onSubmit} className="col">
        {children}
      </form>
    </div>
  );
}
