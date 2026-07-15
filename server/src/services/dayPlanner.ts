import type { Store } from '../store/store.js';
import { uid, now } from '../store/store.js';
import type { DayPlan, Meeting, MeetingType } from '../domain/types.js';

// Parses a spoken day description like:
//   "Today I want to visit Tata Steel at Jamshedpur. Then UltraTech at Kharagpur.
//    Lunch with JSW. Evening Teams call with Pepsi."
// into a sequenced day plan with meeting types, travel estimates, agendas and reminders.

interface ParsedStop { customer: string; location?: string; type: MeetingType; }

const TYPE_HINTS: [RegExp, MeetingType][] = [
  [/teams call|teams meeting|on teams/i, 'teams'],
  [/zoom/i, 'zoom'],
  [/phone call|call with/i, 'phone'],
  [/lunch/i, 'lunch'],
  [/dinner/i, 'dinner'],
  [/conference/i, 'conference'],
  [/plant visit/i, 'plant_visit'],
  [/site visit/i, 'site_visit'],
  [/informal|social/i, 'informal_social'],
];

export function parseDayUtterance(raw: string): ParsedStop[] {
  const sentences = raw.split(/[.\n;]+/).map(s => s.trim()).filter(Boolean);
  const stops: ParsedStop[] = [];
  for (const s of sentences) {
    if (/^plan my day/i.test(s)) continue;
    let type: MeetingType = 'face_to_face';
    for (const [re, t] of TYPE_HINTS) if (re.test(s)) { type = t; break; }
    // "visit X at Y" | "then X at Y" | "lunch with X" | "call with X"
    const m =
      s.match(/(?:visit|then|meet(?:ing)?(?: with)?)\s+([A-Z][\w& ]*?)(?:\s+at\s+([A-Z][\w]+))?$/i) ||
      s.match(/(?:lunch|dinner|call|teams call)\s+with\s+([A-Z][\w& ]*?)(?:\s+at\s+([A-Z][\w]+))?$/i) ||
      s.match(/^([A-Z][\w& ]*?)\s+at\s+([A-Z][\w]+)$/i);
    if (m) stops.push({ customer: m[1].trim(), location: m[2]?.trim(), type });
  }
  return stops;
}

const TRAVEL_MINUTES_DEFAULT = 90;
const MEETING_MINUTES: Partial<Record<MeetingType, number>> = {
  lunch: 90, dinner: 120, teams: 45, zoom: 45, phone: 30,
};

export function buildDayPlan(store: Store, ownerId: string, raw: string, date = new Date()): DayPlan {
  const stops = parseDayUtterance(raw);
  const dateStr = date.toISOString().slice(0, 10);
  let cursor = new Date(`${dateStr}T09:00:00`);
  const meetings: Meeting[] = [];

  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i];
    const isRemote = stop.type === 'teams' || stop.type === 'zoom' || stop.type === 'phone';
    const travel = i === 0 || isRemote ? (i === 0 && !isRemote ? 45 : 0) : TRAVEL_MINUTES_DEFAULT;
    cursor = new Date(cursor.getTime() + travel * 60_000);
    const durMin = MEETING_MINUTES[stop.type] ?? 60;
    const start = new Date(cursor);
    const end = new Date(cursor.getTime() + durMin * 60_000);
    cursor = end;

    const account = store.db.accounts.find(a => a.name.toLowerCase().includes(stop.customer.toLowerCase()));
    const meeting: Meeting = {
      id: uid('mtg'),
      ownerId,
      accountId: account?.id,
      title: `${stop.customer}${stop.location ? ` @ ${stop.location}` : ''}`,
      type: stop.type,
      location: stop.location,
      start: start.toISOString(),
      end: end.toISOString(),
      travelMinutesFromPrevious: travel,
      agenda: [
        `Review open opportunities with ${stop.customer}`,
        'Capture pain points and volume changes',
        'Agree next actions and follow-up date',
      ],
      reminders: [`Reminder 30 min before ${stop.customer} meeting`],
    };
    meetings.push(meeting);
    store.db.meetings.push(meeting);
  }

  const routeSummary = meetings
    .filter(m => m.location)
    .map(m => m.location)
    .join(' → ') || 'No road travel required';

  const plan: DayPlan = { id: uid('day'), ownerId, date: dateStr, meetings, routeSummary, createdAt: now() };
  store.db.dayPlans.push(plan);
  store.audit(ownerId, 'DayPlan', plan.id, 'created', { stops: stops.length });
  store.save();
  return plan;
}
