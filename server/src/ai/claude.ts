import Anthropic from '@anthropic-ai/sdk';

// Claude-powered agent layer. Uses claude-opus-4-8 with adaptive thinking.
// When no API key is configured the platform still works — callers fall back
// to their deterministic rule-based paths and this module returns null.

const MODEL = 'claude-opus-4-8';

let client: Anthropic | null = null;
export function anthropicAvailable(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}
function getClient(): Anthropic | null {
  if (!anthropicAvailable()) return null;
  if (!client) client = new Anthropic();
  return client;
}

export type AgentName =
  | 'conversation' | 'sales_coach' | 'logistics_expert' | 'pricing_advisor'
  | 'sustainability_advisor' | 'crm' | 'route_optimizer' | 'calendar'
  | 'email' | 'proposal';

const AGENT_PROMPTS: Record<AgentName, string> = {
  conversation:
    'You are the Conversation Agent of a voice-first sales enablement platform for road freight logistics in India. ' +
    'The salesperson speaks while driving or after meetings. Ask ONE short follow-up question at a time to fill missing ' +
    'qualification data (customer, decision makers, lanes, commodity, volume in MT/month, vehicle/trailer types, backhaul, ' +
    'sustainability openness to LNG/EV, pricing model, payment terms). Be brief — answers are read aloud.',
  sales_coach:
    'You are a Sales Coach. Given deal context, give 2-3 concrete, brief coaching points: what to ask next, risks to probe, how to advance the stage.',
  logistics_expert:
    'You are a Logistics Expert for Indian trucking. Advise on lanes, routes, vehicle/trailer selection, multi-pick/multi-drop, drop-trailer operations, and empty-km reduction. Be concise and numeric where possible.',
  pricing_advisor:
    'You are a Pricing Advisor for road freight. Recommend pricing model (per km / per ton / ton-km / slab / trip / dedicated / monthly fixed), commercial safeguards (detention, escalation formula, fuel index), and a price range with rationale. Be concise.',
  sustainability_advisor:
    'You are a Sustainability Advisor. Assess LNG/EV/biofuel/hybrid fit for given lanes and volumes, including fuel/charging availability and TCO direction. Be concise.',
  crm:
    'You are a CRM Agent. Convert conversation notes into structured CRM updates: account notes, contact notes, opportunity field updates, and next actions. Reply as short bullet lists.',
  route_optimizer:
    'You are a Route Optimizer for Indian highways. Given stops, propose the optimal visit order, travel-time estimates and a route summary. Be concise.',
  calendar:
    'You are a Calendar Agent. Turn spoken plans into a meeting schedule with realistic durations and buffers. Be concise.',
  email:
    'You are an Email Agent. Draft professional, warm, concise customer emails for an Indian B2B logistics context. Output subject line then body. Never invent pricing not given in context.',
  proposal:
    'You are a Proposal Agent. Produce a proposal checklist and executive summary from deal context. Be concise and structured.',
};

export async function runAgent(agent: AgentName, userText: string, context?: unknown): Promise<string | null> {
  const c = getClient();
  if (!c) return null;
  try {
    const response = await c.messages.create({
      model: MODEL,
      max_tokens: 2048,
      thinking: { type: 'adaptive' },
      system: AGENT_PROMPTS[agent],
      messages: [{
        role: 'user',
        content: context
          ? `Context (JSON):\n${JSON.stringify(context, null, 2)}\n\nRequest: ${userText}`
          : userText,
      }],
    });
    if (response.stop_reason === 'refusal') return null;
    return response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('\n')
      .trim() || null;
  } catch {
    return null; // callers fall back to rule-based behaviour
  }
}
