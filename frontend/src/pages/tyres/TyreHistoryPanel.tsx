import { useEffect, useState } from 'react';
import { getTyreHistory } from '../../api/tyreRotation';
import { ApiError } from '../../api/client';
import type { TyreMovementHistoryRow } from '../../types/tyreRotation';

export default function TyreHistoryPanel({ tyreId }: { tyreId: string }) {
  const [movements, setMovements] = useState<TyreMovementHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTyreHistory(tyreId)
      .then((res) => setMovements(res.movements))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load history'))
      .finally(() => setLoading(false));
  }, [tyreId]);

  if (loading) return <div className="muted" style={{ fontSize: 12.5 }}>Loading history...</div>;
  if (error) return <div className="badge danger" style={{ display: 'block', padding: '8px 12px' }}>{error}</div>;
  if (!movements.length) return <div className="muted" style={{ fontSize: 12.5 }}>No movement history recorded yet.</div>;

  return (
    <table className="tbl">
      <thead>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Asset</th>
          <th>From</th>
          <th>To</th>
          <th className="num">Odometer</th>
          <th className="num">Tread (mm)</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {movements.map((m) => (
          <tr key={m.tyre_movement_id}>
            <td>{new Date(m.movement_datetime).toLocaleDateString()}</td>
            <td>{m.movement_type}</td>
            <td>{m.registration_no || m.trailer_no || '-'}</td>
            <td>{m.from_position || 'Spare'}</td>
            <td>{m.to_position || 'Spare/Removed'}</td>
            <td className="num tnum">{m.odometer_km ?? '-'}</td>
            <td className="num tnum">{m.tread_depth_mm ?? '-'}</td>
            <td>{m.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
