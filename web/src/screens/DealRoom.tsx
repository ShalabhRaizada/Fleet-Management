import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import { useConvo } from '../App';

type Tab = 'overview' | 'lanes' | 'quotation' | 'approvals' | 'contract' | 'activity';

export default function DealRoom() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any | null>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const { send } = useConvo();

  const load = () => { api.dealRoom(id!).then(setData).catch(() => {}); };
  useEffect(load, [id]);
  if (!data) return <div className="screen"><p className="prompt">Loading deal room…</p></div>;

  const o = data.opportunity;
  const tabs: Tab[] = ['overview', 'lanes', 'quotation', 'approvals', 'contract', 'activity'];

  return (
    <div className="screen">
      <h1>{o.name}</h1>
      <div className="grid2" style={{ marginBottom: 10 }}>
        <div className="card stat"><div className="n">{o.healthScore ?? '—'}</div><div className="l">Deal health</div></div>
        <div className="card stat"><div className="n">{o.probability}%</div><div className="l">Closure probability</div></div>
        <div className="card stat"><div className="n">₹{((o.expectedMonthlyRevenue ?? 0) / 100000).toFixed(1)}L</div><div className="l">Monthly revenue</div></div>
        <div className="card stat"><div className="n">{o.stage}</div><div className="l">Stage</div></div>
      </div>

      <div className="chips">
        {tabs.map(t => (
          <button key={t} className="chip" style={tab === t ? { background: '#0369a1', color: '#fff' } : undefined}
            onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <h2>Critical blockers</h2>
          {data.blockers.map((b: string, i: number) => <div key={i} className="card"><p>🧱 {b}</p></div>)}
          <h2>Next actions</h2>
          {o.nextActions.map((a: string, i: number) => <div key={i} className="card"><p>▸ {a}</p></div>)}
        </>
      )}
      {tab === 'lanes' && o.lanes.map((l: any) => (
        <div key={l.id} className="card">
          <h3>{l.origin} → {l.destination}</h3>
          <p>{l.distanceKm ? `${l.distanceKm} km · ` : ''}{l.backhaulRoute ? 'backhaul paired' : 'no backhaul yet'}</p>
        </div>
      ))}
      {tab === 'quotation' && (data.quotations.length
        ? data.quotations.map((q: any) => (
          <div key={q.id} className="card">
            <h3>v{q.version} — ₹{q.quotedPricePerTrip}/trip <span className="badge">{q.status}</span></h3>
            <p>{q.planning.vehicleRequirement} vehicles · {q.planning.emptyKmPct}% empty km · cost ₹{q.planning.costPerTrip}/trip</p>
          </div>
        ))
        : <p className="prompt">No quotations yet — ask by voice.</p>)}
      {tab === 'approvals' && (data.approvals.length
        ? data.approvals.map((d: any) => (
          <div key={d.id} className="card">
            <h3>{d.decision.replace(/_/g, ' ')}</h3>
            <p>{d.reviewerId} · {new Date(d.decidedAt).toLocaleString()} {d.comments ? `· ${d.comments}` : ''}</p>
            {d.conditions?.map((c: string, i: number) => <p key={i}>• {c}</p>)}
          </div>
        ))
        : <p className="prompt">No approval decisions yet.</p>)}
      {tab === 'contract' && (data.contracts.length
        ? data.contracts.map((c: any) => (
          <div key={c.id} className="card"><h3>{c.title}</h3><p>v{c.currentVersion} · {c.status}</p></div>
        ))
        : <p className="prompt">No contract yet.</p>)}
      {tab === 'activity' && data.activities.slice().reverse().map((a: any) => (
        <div key={a.id} className="card"><p>{new Date(a.createdAt).toLocaleString()} — {a.action}</p></div>
      ))}

      <h2>Ask anything about this deal</h2>
      <div className="chips">
        <button className="chip" onClick={() => send('What is blocking this deal?').then(load)}>What's blocking?</button>
        <button className="chip" onClick={() => send('Send this lane to Network Planning for quotation. Include a backhaul option.').then(load)}>Request quotation</button>
        <button className="chip" onClick={() => send('Send this quotation to Finance for validation').then(load)}>Send to Finance</button>
        <button className="chip" onClick={() => send('Send the approved quotation to the customer and propose a meeting on Friday').then(load)}>Email customer</button>
      </div>
    </div>
  );
}
