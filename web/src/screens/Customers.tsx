import { useEffect, useState } from 'react';
import { api } from '../api';
import { useConvo } from '../App';

export default function Customers() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [detail, setDetail] = useState<any | null>(null);
  const { send, setOpportunityId } = useConvo();

  useEffect(() => { api.accounts().then(setAccounts).catch(() => {}); }, []);

  if (detail) {
    return (
      <div className="screen">
        <button className="action ghost" onClick={() => setDetail(null)}>← Back</button>
        <h1>{detail.account.name}</h1>
        <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>
          {detail.account.industry} · {detail.account.region} · {detail.account.creditDays} credit days
        </p>
        <h2>Opportunities</h2>
        {detail.opportunities.map((o: any) => (
          <div key={o.id} className="card tap" onClick={() => setOpportunityId(o.id)}>
            <h3>{o.name}</h3>
            <p><span className="badge">{o.stage}</span><span className="badge green">{o.probability}%</span>
              ₹{(o.expectedMonthlyRevenue ?? 0).toLocaleString('en-IN')}/mo</p>
          </div>
        ))}
        <h2>Contacts</h2>
        {detail.contacts.map((c: any) => (
          <div key={c.id} className="card"><h3>{c.name}</h3><p>{c.role}{c.decisionMaker ? ' · decision maker' : ''}</p></div>
        ))}
        <h2>Growth opportunities</h2>
        {detail.growth.length === 0 && <p className="prompt">None yet — run a scan by voice.</p>}
        {detail.growth.map((g: any) => (
          <div key={g.id} className="card"><h3>{g.kind.replace(/_/g, ' ')}</h3><p>{g.description}</p></div>
        ))}
        <button className="action" onClick={() => send(`Ask ${detail.account.name} for more lanes`)}>
          🔍 Find lane potential
        </button>
        <button className="action ghost" onClick={() => send(`What is blocking the ${detail.account.name} opportunity?`)}>
          🧱 What's blocking?
        </button>
      </div>
    );
  }

  return (
    <div className="screen">
      <h1>Customers</h1>
      {accounts.map(a => (
        <div key={a.id} className="card tap" onClick={() => api.account(a.id).then(setDetail)}>
          <h3>{a.name}</h3>
          <p>{a.industry} · {a.region}</p>
        </div>
      ))}
    </div>
  );
}
