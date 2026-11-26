// Server-only: talks to the Claude API (or Gemini, for now). Never import this from app screens.
import Anthropic from '@anthropic-ai/sdk';
import fs from 'node:fs';
import path from 'node:path';

import { hasGeminiKey, runGemini } from './gemini';

export type CoachMode = 'onboarding' | 'chat' | 'review' | 'checkin';
export const COACH_MODES: readonly CoachMode[] = ['onboarding', 'chat', 'review', 'checkin'];

// Deep conversations use the strong model; routine check-ins use the cheap one (see product spec).
const DEEP_MODEL = 'claude-opus-5-5';
const ROUTINE_MODEL = 'claude-haiku-5-5';

export interface CoachRequest {
  mode: CoachMode;
  messages: Anthropic.Beta.BetaMessageParam[];
  profile: string | null;
  today: string;
  habitLog: string;
}

export interface CoachResult {
  content: NonNullable<Anthropic.Beta.BetaMessageParam['content']>;
  text: string;
  model: string;
}

const APP_CONTEXT = `You are running inside the Eudaimonia prototype app (not a Claude Project). These app rules adjust the instructions above:

- The app saves the Vision Profile automatically. Whenever you create or update it, output it inside a fenced code block whose first line is "# Vision Profile". Tell the user it's saved in their Vision tab (never ask them to save it to project knowledge).
- In the Vision Profile, use this exact table for active habits so the app can track them:
  | Habit | Area | Time | When / where (their words) | Tiny version | Obstacle → plan |
  Area is one of: Body, Time & attention, Relationships, Other. Time is 24-hour HH:MM (best guess from what they said; leave blank if unknown).
- In "## Vision picture", use one line per area: "- <Area>: <scene>".
- The app gives you today's habit log below. It is the source of truth: don't ask about habits already logged — respond to them.
- The user may answer by voice dictation; ignore obvious transcription errors.`;

const MODE_NOTES: Record<CoachMode, string> = {
  onboarding: 'Current mode: Onboarding interview (no Vision Profile exists yet).',
  chat: 'Current mode: open conversation. Work out what they need (check-in, dig, weekly review, or chat).',
  review: 'Current mode: Weekly review. Finish by outputting the updated Vision Profile.',
  checkin: 'Current mode: Daily check-in. Keep it short — under a minute of their time.',
};

let cachedInstructions: string | null = null;
function coachInstructions(): string {
  if (!cachedInstructions) {
    // Single source of truth for the coach, shared with the Claude Project prototype.
    const file = path.join(process.cwd(), 'src', 'coach', 'coach-instructions.md');
    cachedInstructions = fs.readFileSync(file, 'utf8');
  }
  return cachedInstructions;
}

function contextBlock(req: CoachRequest): string {
  return [
    MODE_NOTES[req.mode],
    `Today: ${req.today}`,
    `Today's habit log:\n${req.habitLog || '(nothing logged yet)'}`,
    `Saved Vision Profile:\n${req.profile ?? '(none yet — run onboarding)'}`,
  ].join('\n\n');
}

export type Provider = 'gemini' | 'claude';

/** Gemini (free AI Studio key) while prototyping; Claude when only a Claude key is set. */
export function provider(): Provider {
  if (process.env.COACH_PROVIDER === 'claude') return 'claude';
  if (process.env.COACH_PROVIDER === 'gemini') return 'gemini';
  return hasGeminiKey() ? 'gemini' : 'claude';
}

const REFUSAL_TEXT =
  "I can't help with that one here. If you're going through something serious, please reach out to someone you trust or a professional — in the US you can call or text 988 any time.";

/** True when a Claude credential is configured for the server (e.g. ANTHROPIC_API_KEY in .env). */
export function hasCredentials(): boolean {
  if (provider() === 'gemini') return hasGeminiKey();
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_PROFILE);
}

let client: Anthropic | null = null;
function getClient(): Anthropic {
  // Resolves ANTHROPIC_API_KEY (from .env) or another configured credential.
  client ??= new Anthropic();
  return client;
}

export async function runCoach(req: CoachRequest): Promise<CoachResult> {
  const deep = req.mode !== 'checkin';

  if (provider() === 'gemini') {
    const system = [coachInstructions(), APP_CONTEXT, contextBlock(req)].join('\n\n');
    const r = await runGemini({ deep, system, messages: req.messages });
    if (!r.blocked && !r.text) throw new Error(`Gemini (${r.model}) returned an empty reply.`);
    const text = r.blocked ? REFUSAL_TEXT : r.text;
    return { content: text, text, model: r.model };
  }

  const model = deep ? DEEP_MODEL : ROUTINE_MODEL;

  const response = await getClient().beta.messages.create({
    model,
    max_tokens: 16000,
    output_config: { effort: deep ? 'medium' : 'low' },
    // Stable content first (cached), per-request context last.
    system: [
      { type: 'text', text: coachInstructions() },
      { type: 'text', text: APP_CONTEXT, cache_control: { type: 'ephemeral' } },
      { type: 'text', text: contextBlock(req) },
    ],
    messages: req.messages,
    // Opus: if a safety classifier declines, retry on a fallback model in the same call.
    ...(deep ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const } : {}),
  });

  if (response.stop_reason === 'refusal') {
    return { content: REFUSAL_TEXT, text: REFUSAL_TEXT, model: response.model };
  }

  const text = response.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n\n');

  return { content: response.content, text, model: response.model };
}
