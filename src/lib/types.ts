import type Anthropic from '@anthropic-ai/sdk';

import type { LifeMap } from './life-map';

export type Area = 'Body' | 'Time & attention' | 'Relationships' | 'Other';
export const AREAS: readonly Area[] = ['Body', 'Time & attention', 'Relationships', 'Other'];

export interface Habit {
  id: string;
  name: string;
  area: Area;
  /** 24-hour "HH:MM", or "" when unknown. */
  time: string;
  /** The plan in the user's own words ("after I drop the kids at school"). */
  when: string;
  tiny: string;
  obstacle: string;
  createdAt: string;
}

export type LogStatus = 'done' | 'missed';

/** dateKey ("YYYY-MM-DD") -> habitId -> status */
export type HabitLog = Record<string, Record<string, LogStatus>>;

export type ChatMessage = Anthropic.Beta.BetaMessageParam;

export interface AppData {
  profile: string | null;
  profileUpdatedAt: string | null;
  habits: Habit[];
  log: HabitLog;
  /** Ongoing coach conversation (onboarding, chat, weekly review). */
  coachThread: ChatMessage[];
  /** One short check-in conversation per day. */
  checkins: Record<string, ChatMessage[]>;
  /** Every life map taken, oldest first; the last one is current. */
  lifeMaps: LifeMap[];
}

export const EMPTY_DATA: AppData = {
  profile: null,
  profileUpdatedAt: null,
  habits: [],
  log: {},
  coachThread: [],
  checkins: {},
  lifeMaps: [],
};
