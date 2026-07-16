import { anthropicAvailable, runClaudeAgent, CLAUDE_MODEL } from './claude.js';
import { geminiAvailable, runGeminiAgent, GEMINI_MODEL } from './gemini.js';
import type { AgentName } from './prompts.js';

export type { AgentName } from './prompts.js';

// Provider selection:
//   AI_PROVIDER=claude | gemini  — explicit choice (only honoured if that key is set)
//   otherwise: Anthropic key wins if both are present, then Gemini, then rule-based fallback.
export type Provider = 'claude' | 'gemini' | 'none';

export function activeProvider(): Provider {
  const forced = process.env.AI_PROVIDER?.toLowerCase();
  if (forced === 'claude' && anthropicAvailable()) return 'claude';
  if (forced === 'gemini' && geminiAvailable()) return 'gemini';
  if (anthropicAvailable()) return 'claude';
  if (geminiAvailable()) return 'gemini';
  return 'none';
}

export function aiStatus(): string {
  const p = activeProvider();
  return p === 'claude' ? CLAUDE_MODEL : p === 'gemini' ? GEMINI_MODEL : 'rule-based fallback';
}

export function anyAIAvailable(): boolean {
  return activeProvider() !== 'none';
}

export async function runAgent(agent: AgentName, userText: string, context?: unknown): Promise<string | null> {
  switch (activeProvider()) {
    case 'claude': return runClaudeAgent(agent, userText, context);
    case 'gemini': return runGeminiAgent(agent, userText, context);
    default: return null;
  }
}
