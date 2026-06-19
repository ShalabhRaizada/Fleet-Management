interface ActionFooterProps {
  onCancel: () => void;
  saving?: boolean;
  /** Omit to hide the "Save & Add Another" button (e.g. on Edit screens). */
  onSaveAndAddAnother?: () => void;
  onSaveAsDraft?: () => void;
  saveLabel?: string;
}

/** Sticky footer with the standard Save / Save & Add Another / Save as Draft / Cancel action set. */
export function ActionFooter({ onCancel, saving, onSaveAndAddAnother, onSaveAsDraft, saveLabel = 'Save' }: ActionFooterProps) {
  return (
    <div
      className="row gap-8"
      style={{
        position: 'sticky', bottom: 0, background: 'var(--surface)',
        padding: '12px 0', borderTop: '1px solid var(--divider)', marginTop: 16,
      }}
    >
      <button type="submit" disabled={saving} className="btn primary">
        {saving ? 'Saving...' : saveLabel}
      </button>
      {onSaveAndAddAnother && (
        <button type="button" disabled={saving} onClick={onSaveAndAddAnother} className="btn">
          Save & Add Another
        </button>
      )}
      {onSaveAsDraft && (
        <button type="button" disabled={saving} onClick={onSaveAsDraft} className="btn">
          Save as Draft
        </button>
      )}
      <button type="button" onClick={onCancel} className="btn" style={{ marginLeft: 'auto' }}>
        Cancel
      </button>
    </div>
  );
}
