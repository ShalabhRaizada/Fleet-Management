import { useEffect, useState } from 'react';
import { api } from '../api';
import { useConvo } from '../App';

export default function CommandCentre() {
  const [m, setM] = useState<any | null>(null);
  const { send } = useConvo();
  useEffect(() => { api.commandCentre().then(setM).catch(() => {}); }, []);
  if (!m) return <div className="screen"><p className="prompt">Loading command centre…</p></div>;

  const stats: [string, string | number][] = [
    ['Total pipeline', `₹${(m.totalPipeline / 100000).toFixed(1)}L`],
    ['Weighted pipeline', `₹${(m.weightedPipeline / 100000).toFixed(1)}L`],
    ['Open deals', m.openOpportunities],
    ['Quotes pending', m.quotationsPending],
    ['Contracts expiring', m.contractsNearingExpiry],
    ['Growth ideas', m.growthOpportunities],
    ['Backhaul potential', m.backhaulOpportunities],
    ['LNG pipeline', m.lngConversionPipeline],
    ['SLA breaches', m.approvalBottlenecks],
  ];

  return (
    <div className="screen">
      <h1>Revenue Command Centre</h1>
      <div className="grid2">
        {stats.map(([l, n]) => (
          <div key={l} className="card stat"><div className="n">{n}</div><div className="l">{l}</div></div>
        ))}
      </div>

      <h2>Pipeline by stage</h2>
      {Object.entries(m.pipelineByStage).map(([stage, v]) => (
        <div key={stage} className="kv"><span>{stage}</span><span>₹{((v as number) / 100000).toFixed(1)}L</span></div>
      ))}

      <h2>Likely to close this month</h2>
      {m.likelyToCloseThisMonth.length === 0 && <p className="prompt">No deals above 70% yet.</p>}
      {m.likelyToCloseThisMonth.map((o: any) => (
        <div key={o.id} className="card"><h3>{o.name}</h3><p>{o.probability}% · ₹{(o.expectedMonthlyRevenue ?? 0).toLocaleString('en-IN')}/mo</p></div>
      ))}

      <h2>Ask leadership questions</h2>
      <div className="chips">
        {['Which deals are likely to close this month?', 'Which quotations are delayed?',
          'Which customers can give us more lanes?', 'Which contracts expire in the next 90 days?',
          'Which opportunities are suitable for LNG?'].map(q => (
          <button key={q} className="chip" onClick={() => send(q)}>{q}</button>
        ))}
      </div>
    </div>
  );
}
