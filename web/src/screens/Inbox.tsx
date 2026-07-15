import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

const TABS = ['all', 'customer', 'network_planning', 'finance', 'commercial', 'legal', 'contracts', 'overdue'] as const;

export default function Inbox() {
  const [items, setItems] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [tab, setTab] = useState<string>('all');
  const navigate = useNavigate();

  const load = () => {
    api.inbox().then(setItems).catch(() => {});
    api.financeReviews().then(setReviews).catch(() => {});
  };
  useEffect(load, []);

  const visible = items.filter(i => tab === 'all' || i.category === tab || (tab === 'overdue' && i.overdue));

  return (
    <div className="screen">
      <h1>Collaboration Inbox</h1>
      <div className="chips">
        {TABS.map(t => (
          <button key={t} className="chip" style={tab === t ? { background: '#0369a1', color: '#fff' } : undefined}
            onClick={() => setTab(t)}>{t.replace(/_/g, ' ')}</button>
        ))}
      </div>

      {visible.length === 0 && <p className="prompt">Nothing needs your attention here.</p>}
      {visible.map(i => {
        const review = i.refKind === 'CollaborationRequest'
          ? reviews.find(r => r.collaborationRequestId === i.refId && !r.decision)
          : undefined;
        return (
          <div key={i.id} className="card">
            <h3>{i.overdue ? '🔴 ' : ''}{i.title}</h3>
            <p>{i.detail}</p>
            {review && (
              <>
                <p style={{ color: 'var(--warn)' }}>🤖 {review.aiRecommendation}</p>
                <button className="action" onClick={() => api.financeDecision(review.id, 'approved').then(load)}>Approve</button>
                <button className="action ghost" onClick={() => api.financeDecision(review.id, 'approved_with_conditions', 'Reduce credit days to 45').then(load)}>Approve with condition</button>
                <button className="action ghost" onClick={() => api.financeDecision(review.id, 'returned', 'Revise pricing').then(load)}>Return</button>
                <button className="action danger" onClick={() => api.financeDecision(review.id, 'rejected').then(load)}>Reject</button>
              </>
            )}
            {i.opportunityId && (
              <button className="action ghost" onClick={() => navigate(`/deal/${i.opportunityId}`)}>Open deal room</button>
            )}
          </div>
        );
      })}
    </div>
  );
}
