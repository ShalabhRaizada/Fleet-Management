import { useEffect, useState } from 'react';
import { api } from '../api';
import { useConvo } from '../App';

export default function CalendarScreen() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const { send } = useConvo();
  useEffect(() => { api.meetings().then(setMeetings).catch(() => {}); }, []);

  return (
    <div className="screen">
      <h1>Today's plan</h1>
      {meetings.length === 0 && (
        <>
          <p className="prompt">No meetings yet.</p>
          <button className="action" onClick={() => send('Plan my day. Visit Tata Steel at Jamshedpur. Then UltraTech at Kharagpur. Lunch with JSW.')}>
            🎤 Plan my day
          </button>
        </>
      )}
      {meetings.map(m => (
        <div key={m.id} className="card">
          <h3>{new Date(m.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {m.title}</h3>
          <p>
            <span className="badge">{m.type.replace(/_/g, ' ')}</span>
            {m.travelMinutesFromPrevious ? `🚗 ${m.travelMinutesFromPrevious} min travel` : ''}
          </p>
          {m.agenda?.slice(0, 2).map((a: string, i: number) => <p key={i}>• {a}</p>)}
        </div>
      ))}
    </div>
  );
}
