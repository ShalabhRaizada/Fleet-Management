import { createContext, useCallback, useContext, useState } from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { api, type VoiceResult } from './api';
import { speak, useVoice } from './voice';
import Home from './screens/Home';
import Talk from './screens/Talk';
import Customers from './screens/Customers';
import Pipeline from './screens/Pipeline';
import CalendarScreen from './screens/CalendarScreen';
import Inbox from './screens/Inbox';
import CommandCentre from './screens/CommandCentre';
import DealRoom from './screens/DealRoom';

export interface Turn { role: 'user' | 'ai'; text: string; suggestions?: string[]; }

interface ConvoCtx {
  turns: Turn[];
  busy: boolean;
  opportunityId?: string;
  setOpportunityId: (id?: string) => void;
  send: (text: string, viaVoice?: boolean) => Promise<void>;
  preview: any | null;
  setPreview: (p: any | null) => void;
}

const Ctx = createContext<ConvoCtx>(null!);
export const useConvo = () => useContext(Ctx);

export default function App() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const [opportunityId, setOpportunityId] = useState<string | undefined>('opp_tata1');
  const [preview, setPreview] = useState<any | null>(null);
  const navigate = useNavigate();

  const send = useCallback(async (text: string, viaVoice = false) => {
    if (!text.trim()) return;
    setTurns(t => [...t, { role: 'user', text }]);
    setBusy(true);
    navigate('/talk');
    try {
      const r: VoiceResult = await api.voice(text, { conversationId, opportunityId, viaVoice });
      setConversationId(r.conversationId);
      setTurns(t => [...t, { role: 'ai', text: r.reply, suggestions: r.suggestions }]);
      if (viaVoice) speak(r.reply);
      if (r.requiresPreview && r.data && (r.data as any).preview) {
        setPreview(r.data);
      }
    } catch (e) {
      setTurns(t => [...t, { role: 'ai', text: `⚠️ ${(e as Error).message}` }]);
    } finally {
      setBusy(false);
    }
  }, [conversationId, opportunityId, navigate]);

  return (
    <Ctx.Provider value={{ turns, busy, opportunityId, setOpportunityId, send, preview, setPreview }}>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/talk" element={<Talk />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/deal/:id" element={<DealRoom />} />
          <Route path="/calendar" element={<CalendarScreen />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/ai" element={<CommandCentre />} />
        </Routes>
        <VoiceBar />
        <BottomNav />
        {preview && <PreviewModal />}
      </div>
    </Ctx.Provider>
  );
}

function VoiceBar() {
  const { send, busy } = useConvo();
  const [text, setText] = useState('');
  const { listening, interim, supported, start, stop } = useVoice(t => send(t, true));

  return (
    <div className="voiceBar">
      <input
        value={listening ? interim || '…listening' : text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { send(text); setText(''); } }}
        placeholder={supported ? 'Speak or type…' : 'Type a command…'}
        disabled={busy}
      />
      {supported && (
        <button
          className={`micBtn ${listening ? 'listening' : ''}`}
          onClick={() => (listening ? stop() : start())}
          aria-label="microphone"
        >🎤</button>
      )}
    </div>
  );
}

function PreviewModal() {
  const { preview, setPreview } = useConvo();
  const p = preview?.preview;
  const commId = preview?.communication?.id;
  if (!p) return null;
  return (
    <div className="modal" onClick={() => setPreview(null)}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <h1>Review before sending</h1>
        <div className="kv"><span>To</span><span>{p.recipient}</span></div>
        <div className="kv"><span>Subject</span><span>{p.subject}</span></div>
        <div className="kv"><span>Attachments</span><span>{p.attachments?.join(', ')}</span></div>
        <div className="kv"><span>Pricing</span><span>{p.approvedPricingVersion}</span></div>
        <div className="kv"><span>Valid until</span><span>{p.validityPeriod?.slice(0, 10)}</span></div>
        <div className="card" style={{ marginTop: 12 }}><p style={{ whiteSpace: 'pre-wrap' }}>{p.body}</p></div>
        <p style={{ fontSize: '.75rem', color: 'var(--muted)', margin: '8px 0' }}>{p.disclaimer}</p>
        <button className="action" onClick={async () => {
          await api.sendCommunication(commId);
          setPreview(null);
          speak('Quotation sent to the customer and follow-up scheduled.');
        }}>Send</button>
        <button className="action ghost" onClick={() => setPreview(null)}>Edit later</button>
        <button className="action danger" onClick={() => setPreview(null)}>Cancel</button>
      </div>
    </div>
  );
}

function BottomNav() {
  const items = [
    ['/', '🏠', 'Home'], ['/talk', '🎙️', 'Talk'], ['/customers', '👥', 'Customers'],
    ['/pipeline', '📈', 'Pipeline'], ['/calendar', '📅', 'Calendar'], ['/inbox', '📥', 'Inbox'], ['/ai', '🤖', 'AI'],
  ] as const;
  return (
    <nav className="nav">
      {items.map(([to, ico, label]) => (
        <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
          <span className="ico">{ico}</span>{label}
        </NavLink>
      ))}
    </nav>
  );
}
