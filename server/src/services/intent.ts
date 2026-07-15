// Rule-based voice intent parser. Fast, offline, deterministic — used as the first
// pass on every utterance. The Claude-powered Conversation Agent handles anything
// this parser cannot resolve.

export type Intent =
  | { kind: 'plan_day'; raw: string }
  | { kind: 'open_account'; accountName: string }
  | { kind: 'record_meeting' }
  | { kind: 'create_opportunity'; accountName?: string }
  | { kind: 'add_lane'; origin?: string; destination?: string; tonsPerMonth?: number }
  | { kind: 'sustainability'; preference: 'lng' | 'ev' | 'biofuel' | 'hybrid'; sentiment: 'wants' | 'rejected' }
  | { kind: 'estimate_fleet' }
  | { kind: 'schedule_followup'; when?: string }
  | { kind: 'email_summary' }
  | { kind: 'request_quotation'; origin?: string; destination?: string; tonsPerMonth?: number; fuel?: 'lng' | 'ev'; backhaul: boolean; instructions: string }
  | { kind: 'send_to_finance' }
  | { kind: 'request_commercial_approval'; detail: string }
  | { kind: 'send_to_legal' }
  | { kind: 'send_quotation_to_customer'; proposeMeeting?: string }
  | { kind: 'inbox_action'; action: 'approve' | 'reject' | 'escalate' | 'send_reminder' | 'open_deal_room' | 'mark_complete' }
  | { kind: 'growth_scan'; accountName?: string }
  | { kind: 'contract_amendment'; detail: string }
  | { kind: 'deal_blockers'; accountName?: string }
  | { kind: 'unknown'; raw: string };

const num = (s: string | undefined) => (s ? Number(s.replace(/,/g, '')) : undefined);

const NOT_PLACES = new Set(['planning', 'finance', 'legal', 'network', 'quotation', 'this', 'the', 'customer']);

function extractLane(text: string): { origin?: string; destination?: string } {
  // Prefer explicit lane phrasing ("for X to Y", "from X to Y", "lane X to Y"),
  // then fall back to any "X to Y" pair that isn't part of workflow phrasing
  // like "Network Planning to prepare".
  const patterns = [
    /(?:for|from|lane)\s+([A-Z][\w]+)\s+to\s+([A-Z][\w]+)/i,
    /([A-Z][\w]+)\s+to\s+([A-Z][\w]+)/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m && !NOT_PLACES.has(m[1].toLowerCase()) && !NOT_PLACES.has(m[2].toLowerCase())) {
      return { origin: cap(m[1]), destination: cap(m[2]) };
    }
  }
  return {};
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

function extractTons(text: string): number | undefined {
  const m = text.match(/([\d,]+)\s*(?:metric\s*)?tons?/i);
  return num(m?.[1]);
}

export function parseIntent(raw: string): Intent {
  const t = raw.trim().toLowerCase();

  if (/^plan my day/.test(t) || /today i want to visit/.test(t)) return { kind: 'plan_day', raw };
  if (/^open\s+/.test(t)) return { kind: 'open_account', accountName: raw.trim().replace(/^open\s+/i, '') };
  if (/record (a |customer |the )?(meeting|visit)/.test(t)) return { kind: 'record_meeting' };

  if (/finance/.test(t) && /(send|validate|validation|review)/.test(t)) return { kind: 'send_to_finance' };
  if (/legal/.test(t) && /(send|review|compare)/.test(t)) return { kind: 'send_to_legal' };

  if (/quotation|quote/.test(t) && /(network planning|planning|prepare|send|ask|request)/.test(t) && !/customer/.test(t)) {
    const lane = extractLane(raw);
    return {
      kind: 'request_quotation',
      ...lane,
      tonsPerMonth: extractTons(raw),
      fuel: /\blng\b/.test(t) ? 'lng' : /\bev\b|electric/.test(t) ? 'ev' : undefined,
      backhaul: /backhaul|return load/.test(t),
      instructions: raw,
    };
  }
  if (/send (this |the )?(quotation|quote).*(customer)|quotation to the customer/.test(t)) {
    const when = raw.match(/meeting on (\w+)/i)?.[1];
    return { kind: 'send_quotation_to_customer', proposeMeeting: when };
  }
  if (/commercial approval|discount|approval for|approve a lower margin/.test(t)) {
    return { kind: 'request_commercial_approval', detail: raw };
  }
  if (/create (an? )?opportunit/.test(t) || /new opportunit/.test(t)) {
    const m = raw.match(/for\s+(.+)$/i);
    return { kind: 'create_opportunity', accountName: m?.[1] };
  }
  if (/add (this |a |the )?(new )?lane/.test(t) && /contract/.test(t)) return { kind: 'contract_amendment', detail: raw };
  if (/(revise the rate|extend the contract|update the .*clause|add .* to the (existing )?contract|amendment)/.test(t)) {
    return { kind: 'contract_amendment', detail: raw };
  }
  if (/add (this |a |the )?(new )?lane/.test(t)) {
    return { kind: 'add_lane', ...extractLane(raw), tonsPerMonth: extractTons(raw) };
  }
  if (/customer (wants|is open to|accepted)\s+(lng|ev|bio ?fuel|hybrid)/.test(t)) {
    const p = t.match(/(lng|ev|bio ?fuel|hybrid)/)![1].replace(' ', '') as 'lng' | 'ev' | 'biofuel' | 'hybrid';
    return { kind: 'sustainability', preference: p, sentiment: 'wants' };
  }
  if (/customer (rejected|declined|refused|is not open to)\s+(lng|ev|bio ?fuel|hybrid)/.test(t)) {
    const p = t.match(/(lng|ev|bio ?fuel|hybrid)/)![1].replace(' ', '') as 'lng' | 'ev' | 'biofuel' | 'hybrid';
    return { kind: 'sustainability', preference: p, sentiment: 'rejected' };
  }
  if (/estimate .*fleet|monthly fleet/.test(t)) return { kind: 'estimate_fleet' };
  if (/schedule (a )?follow[- ]?up/.test(t)) {
    return { kind: 'schedule_followup', when: raw.match(/on (\w+)/i)?.[1] };
  }
  if (/email (the |a )?summary|summary email/.test(t)) return { kind: 'email_summary' };
  if (/what('s| is) blocking/.test(t)) {
    const m = raw.match(/blocking (?:the )?(.+?)(?: opportunity| deal)?\??$/i);
    return { kind: 'deal_blockers', accountName: m?.[1] };
  }
  if (/(more lanes|lane potential|increase load|return[- ]load opportunit|next[- ]quarter volume|western region)/.test(t)) {
    const m = raw.match(/(?:ask|for)\s+([A-Z][\w ]+?)\s+for/i);
    return { kind: 'growth_scan', accountName: m?.[1] };
  }
  if (/^(approve|reject|escalate)\b/.test(t)) {
    return { kind: 'inbox_action', action: t.split(/\s/)[0] as 'approve' | 'reject' | 'escalate' };
  }
  if (/^send (a )?reminder/.test(t)) return { kind: 'inbox_action', action: 'send_reminder' };
  if (/^open (the )?deal room/.test(t)) return { kind: 'inbox_action', action: 'open_deal_room' };
  if (/^mark (as )?complete/.test(t)) return { kind: 'inbox_action', action: 'mark_complete' };

  return { kind: 'unknown', raw };
}
