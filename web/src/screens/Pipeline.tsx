import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useConvo } from '../App';

export default function Pipeline() {
  const [opps, setOpps] = useState<any[]>([]);
  const navigate = useNavigate();
  const { setOpportunityId } = useConvo();

  useEffect(() => { api.opportunities().then(setOpps).catch(() => {}); }, []);

  return (
    <div className="screen">
      <h1>Pipeline</h1>
      {opps.map(o => (
        <div key={o.id} className="card tap" onClick={() => { setOpportunityId(o.id); navigate(`/deal/${o.id}`); }}>
          <h3>{o.name}</h3>
          <p>
            <span className="badge">{o.stage}</span>
            <span className={`badge ${o.probability >= 60 ? 'green' : o.probability >= 35 ? 'amber' : 'red'}`}>{o.probability}%</span>
            {o.healthScore != null && <span className="badge">health {o.healthScore}</span>}
          </p>
          <p>₹{(o.expectedMonthlyRevenue ?? 0).toLocaleString('en-IN')}/month · {o.lanes.length} lane(s)</p>
        </div>
      ))}
    </div>
  );
}
