// Server-only: talks to the Gemini API (Google AI Studio key). Temporary stand-in for Claude
// while prototyping on the free tier. Never import this from app screens.
import { ApiError, FinishReason, GoogleGenAI, type Content } from '@google/genai';

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

/** Speech to text for the in-app mic button. Returns the transcript only. */
export async function transcribe(audioBase64: string, mimeType: string): Promise<string> {
  const response = await getClient().models.generateContent({
    model: ROUTINE_MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType, data: audioBase64 } },
          {
            text: 'Transcribe this voice note word for word, with normal punctuation. Output only the transcript. If there is no speech, output nothing.',
          },
        ],
      },
    ],
    config: { maxOutputTokens: 4000 },
  });
  return (response.text ?? '').trim();
}

export async function runGemini(opts: {
  deep: boolean;
  system: string;
  messages: ChatMessage[];
}): Promise<{ text: string; model: string; blocked: boolean }> {
  let model = opts.deep ? DEEP_MODEL : ROUTINE_MODEL;
  const request = (m: string) =>
    getClient().models.generateContent({
      model: m,
      contents: toContents(opts.messages),
      config: { systemInstruction: opts.system, maxOutputTokens: 16000 },
    });
  let response;
  try {
    response = await request(model);
  } catch (error) {
    // Free-tier models are often overloaded (503). Fall back to the lighter model once.
    if (!(error instanceof ApiError) || error.status !== 503 || model === ROUTINE_MODEL) throw error;
    console.warn(`${model} overloaded; falling back to ${ROUTINE_MODEL}`);
    model = ROUTINE_MODEL;
    response = await request(model);
  }

  const finish = response.candidates?.[0]?.finishReason;
  const blocked =
    Boolean(response.promptFeedback?.blockReason) ||
    finish === FinishReason.SAFETY ||
    finish === FinishReason.PROHIBITED_CONTENT;
  return { text: response.text ?? '', model, blocked };
}
