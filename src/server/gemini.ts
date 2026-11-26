// Server-only: talks to the Gemini API (Google AI Studio key). Temporary stand-in for Claude
// while prototyping on the free tier. Never import this from app screens.
import { FinishReason, GoogleGenAI, type Content } from '@google/genai';

import { messageText } from '@/lib/profile';
import type { ChatMessage } from '@/lib/types';

// Overridable from .env if Google renames models.
const DEEP_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const ROUTINE_MODEL = process.env.GEMINI_CHECKIN_MODEL || 'gemini-3.5-flash-lite';

export function hasGeminiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

let client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  client ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

/** Convert the app's stored conversation (Claude format) to Gemini's: text only, assistant → model. */
function toContents(messages: ChatMessage[]): Content[] {
  return messages
    .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: messageText(m) }] }))
    .filter((c) => c.parts[0].text);
}

export async function runGemini(opts: {
  deep: boolean;
  system: string;
  messages: ChatMessage[];
}): Promise<{ text: string; model: string; blocked: boolean }> {
  const model = opts.deep ? DEEP_MODEL : ROUTINE_MODEL;
  const response = await getClient().models.generateContent({
    model,
    contents: toContents(opts.messages),
    config: { systemInstruction: opts.system, maxOutputTokens: 16000 },
  });

  const finish = response.candidates?.[0]?.finishReason;
  const blocked =
    Boolean(response.promptFeedback?.blockReason) ||
    finish === FinishReason.SAFETY ||
    finish === FinishReason.PROHIBITED_CONTENT;
  return { text: response.text ?? '', model, blocked };
}
