import { GoogleGenAI } from '@google/genai';
import { AGENT_PROMPTS, buildUserMessage, type AgentName } from './prompts.js';

// Gemini adapter — same contract as the Claude adapter: returns the agent's
// text reply, or null on any failure so callers use their rule-based fallback.

export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-pro';

let client: GoogleGenAI | null = null;

export function geminiAvailable(): boolean {
  return Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
}

function getClient(): GoogleGenAI | null {
  if (!geminiAvailable()) return null;
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY });
  }
  return client;
}

export async function runGeminiAgent(agent: AgentName, userText: string, context?: unknown): Promise<string | null> {
  const c = getClient();
  if (!c) return null;
  try {
    const response = await c.models.generateContent({
      model: GEMINI_MODEL,
      contents: buildUserMessage(userText, context),
      config: {
        systemInstruction: AGENT_PROMPTS[agent],
        maxOutputTokens: 2048,
      },
    });
    return response.text?.trim() || null;
  } catch {
    return null; // callers fall back to rule-based behaviour
  }
}
