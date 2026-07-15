import { useNavigate } from 'react-router-dom';
import { useConvo } from '../App';
import { useVoice } from '../voice';

export default function Home() {
  const { send } = useConvo();
  const navigate = useNavigate();
  const { listening, interim, supported, start, stop } = useVoice(t => send(t, true));

  const cards: [string, string, () => void][] = [
    ['📍 Plan My Day', 'Speak your visits — AI builds the route & calendar', () => send('Plan my day. Visit Tata Steel at Jamshedpur. Then UltraTech at Kharagpur. Lunch with JSW.', false)],
    ["🗓️ Today's Meetings", 'See the planned sequence', () => navigate('/calendar')],
    ['🎙️ Record Customer Visit', 'Debrief after a meeting', () => send('Record meeting', false)],
    ['✨ New Opportunity', 'Start a discovery interview', () => send('Create opportunity for Tata Steel', false)],
    ['📈 Pipeline', 'Deals and health', () => navigate('/pipeline')],
    ['💡 Insights', 'Leadership command centre', () => navigate('/ai')],
  ];

  return (
    <div className="screen">
      <h1>Fleet Sales AI</h1>
      {supported ? (
        <>
          <button className={`micBig ${listening ? 'listening' : ''}`} onClick={() => (listening ? stop() : start())}>🎤</button>
          <p className="prompt">{listening ? (interim || 'Listening…') : 'What would you like to do today?'}</p>
        </>
      ) : (
        <p className="prompt">Voice not supported in this browser — use the text bar below.</p>
      )}
      <h2>Quick actions</h2>
      <div className="grid2">
        {cards.map(([title, sub, fn]) => (
          <div className="card tap" key={title} onClick={fn}>
            <h3>{title}</h3>
            <p>{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
