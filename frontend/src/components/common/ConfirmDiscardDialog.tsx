interface ConfirmDiscardDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Confirms before navigating away from a form with unsaved changes. */
export function ConfirmDiscardDialog({ open, onConfirm, onCancel }: ConfirmDiscardDialogProps) {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
      <div className="card" style={{ width: 360, padding: 20 }}>
        <h3 style={{ marginTop: 0 }}>Discard unsaved changes?</h3>
        <p className="muted" style={{ fontSize: 13 }}>You have unsaved changes. Leaving now will discard them.</p>
        <div className="row gap-8" style={{ marginTop: 16, justifyContent: 'flex-end' }}>
          <button type="button" className="btn" onClick={onCancel}>Keep Editing</button>
          <button type="button" className="btn danger" onClick={onConfirm}>Discard</button>
        </div>
      </div>
    </div>
  );
}
