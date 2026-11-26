import type Anthropic from '@anthropic-ai/sdk';

import type { Influences } from './influences';
import type { LifeMap } from './life-map';
import type { PlanItem } from './week';

export type Area = 'Body' | 'Time & attention' | 'Relationships' | 'Other';
export const AREAS: readonly Area[] = ['Body', 'Time & attention', 'Relationships', 'Other'];

export interface Habit {
  id: string;
  name: string;
  area: Area;
  /** 24-hour "HH:MM", or "" when unknown. */
  time: string;
  /** Days it runs on (0 = Sunday … 6 = Saturday); missing = every day. */
  days?: number[];
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
  /** One-off plan items for the week (from the coach's weekly plan or added by hand). */
  plan: PlanItem[];
  /** "Make it yours": who they love, dislike and learn from, plus preferred tone. */
  influences: Influences | null;
}

export const EMPTY_DATA: AppData = {
  profile: null,
  profileUpdatedAt: null,
  habits: [],
  log: {},
  coachThread: [],
  checkins: {},
  lifeMaps: [],
  plan: [],
  influences: null,
};
