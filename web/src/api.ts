export interface VoiceResult {
  reply: string;
  intent: string;
  data?: unknown;
  suggestions?: string[];
  requiresPreview?: boolean;
  conversationId: string;
}

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error ?? 'Request failed');
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
