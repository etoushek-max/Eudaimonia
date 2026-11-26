import { prettyDate } from './dates';
import type { Influences } from './influences';
import type { LifeMap } from './life-map';
import type { ChatMessage } from './types';

export type CoachMode = 'onboarding' | 'chat' | 'review' | 'plan' | 'checkin';

type Content = NonNullable<ChatMessage['content']>;

export interface CoachReply {
  /** Full assistant content blocks — stored unchanged so thinking blocks replay correctly. */
  content: Content;
  text: string;
}

/** Calls the app's own server route (/api/coach), which holds the Claude API key. */
export async function askCoach(args: {
  mode: CoachMode;
  messages: ChatMessage[];
  profile: string | null;
  habitLog: string;
  weekPlan: string;
  lifeMap: LifeMap | null;
  previousLifeMap: LifeMap | null;
  influences: Influences | null;
}): Promise<CoachReply> {
  const res = await fetch('/api/coach', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...args, today: prettyDate() }),
  });
  const json = (await res.json().catch(() => ({}))) as { error?: string; content?: Content; text?: string };
  if (!res.ok || !json.content) {
    throw new Error(json.error ?? `The coach is unavailable (HTTP ${res.status}).`);
  }
  return { content: json.content, text: json.text ?? '' };
}
