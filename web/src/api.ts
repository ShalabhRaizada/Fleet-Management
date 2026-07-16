export interface VoiceResult {
  reply: string;
  intent: string;
  data?: unknown;
  suggestions?: string[];
  requiresPreview?: boolean;
  conversationId: string;
}

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('Cannot reach the API — is the server running? (cd server && npm run dev)');
  }
  const text = await res.text();
  let json: { ok?: boolean; error?: string; data?: unknown };
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(
      res.status === 504 || res.status === 502 || text === ''
        ? 'API server not reachable on port 4000 — start it with: cd server && npm run dev'
        : `Unexpected API response (${res.status}): ${text.slice(0, 120)}`,
    );
  }
  if (!json.ok) throw new Error(json.error ?? `Request failed (${res.status})`);
  return json.data as T;
}

export const api = {
  voice: (text: string, opts?: { conversationId?: string; opportunityId?: string; viaVoice?: boolean }) =>
    req<VoiceResult>('/voice', { method: 'POST', body: JSON.stringify({ text, ...opts }) }),
  accounts: () => req<any[]>('/accounts'),
  account: (id: string) => req<any>(`/accounts/${id}`),
  opportunities: () => req<any[]>('/opportunities'),
  dealRoom: (id: string) => req<any>(`/opportunities/${id}`),
  meetings: () => req<any[]>('/meetings'),
  inbox: () => req<any[]>('/inbox'),
  commandCentre: () => req<any>('/command-centre'),
  sendCommunication: (id: string) => req<any>(`/communications/${id}/send`, { method: 'POST', body: '{}' }),
  financeDecision: (id: string, decision: string, comments?: string) =>
    req<any>(`/finance-reviews/${id}/decision`, {
      method: 'POST',
      body: JSON.stringify({ reviewerId: 'user_fin1', decision, comments }),
    }),
  financeReviews: () => req<any[]>('/finance-reviews'),
  health: () => req<any>('/health'),
};
