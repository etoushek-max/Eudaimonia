import { dateKey, lastNDays } from './dates';
import type { Area, Habit, HabitLog, LogStatus } from './types';

export interface HabitStats {
  days: { key: string; status: LogStatus | null }[];
  doneThisWeek: number;
  /** Two misses in a row, most recent first — time for a gentle dig. */
  missedTwice: boolean;
  totalDone: number;
}

export function habitStats(habit: Habit, log: HabitLog, window = 14): HabitStats {
  const days = lastNDays(window).map((key) => ({ key, status: log[key]?.[habit.id] ?? null }));
  const week = days.slice(-7);
  const logged = days.filter((d) => d.status !== null);
  const lastTwo = logged.slice(-2);
  const totalDone = Object.values(log).filter((day) => day[habit.id] === 'done').length;
  return {
    days,
    doneThisWeek: week.filter((d) => d.status === 'done').length,
    missedTwice: lastTwo.length === 2 && lastTwo.every((d) => d.status === 'missed'),
    totalDone,
  };
}

/** Completions needed for an area's picture to reach full colour. */
export const FULL_COLOUR_AT = 20;

/**
 * How much colour each area's vision panel has earned (0–1).
 * Built from total completions, so colour never fades — earned colour stays.
 */
export function areaColour(habits: Habit[], log: HabitLog): Record<Area, number> {
  const points: Record<Area, number> = { Body: 0, 'Time & attention': 0, Relationships: 0, Other: 0 };
  for (const habit of habits) {
    for (const day of Object.values(log)) {
      if (day[habit.id] === 'done') points[habit.area] += 1;
    }
  }
  const result = { ...points };
  for (const area of Object.keys(points) as Area[]) {
    result[area] = Math.min(1, points[area] / FULL_COLOUR_AT);
  }
  return result;
}

/** Plain-text summary of today's log, sent to the coach as context. */
export function todaySummary(habits: Habit[], log: HabitLog, key = dateKey()): string {
  if (habits.length === 0) return 'No active habits yet.';
  return habits
    .map((h) => {
      const status = log[key]?.[h.id];
      const stats = habitStats(h, log);
      const label = status === 'done' ? 'done' : status === 'missed' ? 'missed' : 'not logged yet';
      const flag = stats.missedTwice ? ' (missed twice in a row)' : '';
      return `- ${h.name}: ${label}; ${stats.doneThisWeek}/7 this week${flag}`;
    })
    .join('\n');
}
