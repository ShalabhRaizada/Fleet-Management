import Anthropic from '@anthropic-ai/sdk';
import { AGENT_PROMPTS, buildUserMessage, type AgentName } from './prompts.js';

// Claude adapter — claude-opus-4-8 with adaptive thinking. Returns the agent's
// text reply, or null on any failure so callers use their rule-based fallback.

export const CLAUDE_MODEL = 'claude-opus-4-8';

let client: Anthropic | null = null;

export function anthropicAvailable(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

function getClient(): Anthropic | null {
  if (!anthropicAvailable()) return null;
  if (!client) client = new Anthropic();
  return client;
}

export async function runClaudeAgent(agent: AgentName, userText: string, context?: unknown): Promise<string | null> {
  const c = getClient();
  if (!c) return null;
  try {
    const response = await c.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      thinking: { type: 'adaptive' },
      system: AGENT_PROMPTS[agent],
      messages: [{ role: 'user', content: buildUserMessage(userText, context) }],
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
