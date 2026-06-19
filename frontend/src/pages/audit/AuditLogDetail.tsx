import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { auditLogApi, setAuditLogLegalHold } from '../../api/resources';
import { CrudDetailPage } from '../crud/CrudDetailPage';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import { ApiError } from '../../api/client';
import type { AuditLog } from '../../types/entities-p2p3';

function formatJson(value: unknown): string {
  if (value === null || value === undefined) return '—';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function LegalHoldToggle({ id }: { id: string }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [legalHold, setLegalHold] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role_code !== 'ADMIN') return;
    auditLogApi
      .get(id)
      .then((row) => setLegalHold(row.legal_hold))
      .catch(() => {
        // best-effort; button still renders, will refetch on toggle
      });
  }, [id, user?.role_code]);

  if (user?.role_code !== 'ADMIN') return null;

  async function toggle() {
    setLoading(true);
    try {
      const current = legalHold ?? (await auditLogApi.get(id)).legal_hold;
      const updated = await setAuditLogLegalHold(id, !current);
      setLegalHold(updated.legal_hold);
      addToast(`Legal hold ${updated.legal_hold ? 'enabled' : 'disabled'}.`, 'success');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to update legal hold';
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={toggle} disabled={loading} className="btn">
      {loading ? 'Updating...' : legalHold ? 'Remove Legal Hold' : 'Toggle Legal Hold'}
    </button>
  );
}

export default function AuditLogDetail() {
  const { id } = useParams();

  return (
    <CrudDetailPage<AuditLog>
      title="Audit Log Detail"
      basePath="/audit-log"
      get={auditLogApi.get}
      fieldsToShow={[
        { key: 'table_name', label: 'Table Name' },
        { key: 'record_id', label: 'Record ID' },
        { key: 'action', label: 'Action' },
        { key: 'changed_by', label: 'Changed By' },
        { key: 'changed_at', label: 'Changed At' },
        { key: 'legal_hold', label: 'Legal Hold' },
      ]}
      extra={(row) => (
        <div className="col gap-16">
          <div className="card" style={{ padding: 20 }}>
            <label>Old Values</label>
            <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {formatJson(row.old_values)}
            </pre>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <label>New Values</label>
            <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {formatJson(row.new_values)}
            </pre>
          </div>
          {id && <LegalHoldToggle id={id} />}
        </div>
      )}
    />
  );
}
