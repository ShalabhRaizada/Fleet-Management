import { useEffect, useRef } from 'react';
import { useConvo } from '../App';

const DEFAULT_CHIPS = ['Add lane', 'Add commodity', 'Add volume', 'Add pricing', 'Finish conversation'];

export default function Talk() {
  const { turns, busy, send } = useConvo();
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [turns, busy]);

  const lastAI = [...turns].reverse().find(t => t.role === 'ai');
  const chips = lastAI?.suggestions ?? DEFAULT_CHIPS;

  return (
    <div className="screen">
      <h1>Conversation</h1>
      <div className="chat">
        {turns.length === 0 && (
          <div className="msg ai">
            Try: “Plan my day”, “Open Tata Steel”, “Ask Network Planning to prepare a quotation for Chennai to Pune,
            600 metric tons per month, using LNG tractors. Include a backhaul option.”
          </div>
        )}
        {turns.map((t, i) => (
          <div key={i} className={`msg ${t.role}`}>{t.text}</div>
        ))}
        {busy && <div className="msg ai">▍thinking…</div>}
        <div ref={endRef} />
      </div>
      <div className="chips">
        {chips.map(c => (
          <button key={c} className="chip" onClick={() => send(c)}>{c}</button>
        ))}
      </div>
    </div>
  );
}
