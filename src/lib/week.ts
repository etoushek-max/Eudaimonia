// This week's plan: which days habits fall on, plus one-off plan items (from the coach or the user).
import { dateKey } from './dates';
import { AREAS, type Area, type Habit, type HabitLog } from './types';

/** Index = JS getDay() (0 = Sunday). */
export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
/** Weeks run Monday to Sunday. */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

export interface PlanItem {
  id: string;
  title: string;
  area: Area;
  /** "YYYY-MM-DD" */
  date: string;
  /** "HH:MM" or "" */
  time: string;
  done: boolean;
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** The Monday of the week containing `d`. */
export function weekStart(d: Date = new Date()): Date {
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
}

/** Monday to Sunday date keys for the week containing `d`. */
export function weekKeys(d: Date = new Date()): string[] {
  const start = weekStart(d);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    return dateKey(day);
  });
}

const DAY_WORDS: Record<string, number> = {
  sun: 0,
  sunday: 0,
  mon: 1,
  monday: 1,
  tue: 2,
  tues: 2,
  tuesday: 2,
  wed: 3,
  wednesday: 3,
  thu: 4,
  thur: 4,
  thurs: 4,
  thursday: 4,
  fri: 5,
  friday: 5,
  sat: 6,
  saturday: 6,
};

/**
 * Days a habit runs on, from text like "Mon/Wed/Fri 07:00", "weekdays", "Mon-Fri".
 * Returns undefined for every day (or when no days are named).
 */
export function parseDays(text: string): number[] | undefined {
  const t = text.toLowerCase();
  if (/\bweekdays?\b/.test(t)) return [1, 2, 3, 4, 5];
  if (/\bweekends?\b/.test(t)) return [0, 6];
  const range = t.match(/\b([a-z]{3,9})\s*[-–]\s*([a-z]{3,9})\b/);
  if (range && range[1] in DAY_WORDS && range[2] in DAY_WORDS) {
    const days: number[] = [];
    for (let d = DAY_WORDS[range[1]]; ; d = (d + 1) % 7) {
      days.push(d);
      if (d === DAY_WORDS[range[2]] || days.length === 7) break;
    }
    return days.length === 7 ? undefined : days.sort();
  }
  const days = [...new Set((t.match(/[a-z]+/g) ?? []).filter((w) => w in DAY_WORDS).map((w) => DAY_WORDS[w]))];
  return days.length === 0 || days.length === 7 ? undefined : days.sort();
}

export function daysLabel(days?: number[]): string {
  if (!days || days.length === 0 || days.length === 7) return 'Every day';
  if (days.join() === '1,2,3,4,5') return 'Weekdays';
  if (days.join() === '0,6') return 'Weekends';
  return WEEK_ORDER.filter((d) => days.includes(d))
    .map((d) => DAY_SHORT[d])
    .join(', ');
}

export function isScheduled(habit: Pick<Habit, 'days'>, key: string): boolean {
  return !habit.days || habit.days.length === 0 || habit.days.includes(fromKey(key).getDay());
}

const PLAN_BLOCK = /```[a-z]*\s*\n(# Week plan[\s\S]*?)```/;

/**
 * Read a "# Week plan" block from a coach reply. Lines look like "- Mon 18:00 | Relationships | Call Mum".
 * Each day name maps to its next occurrence from `from` (today included), so a Sunday review plans the week ahead.
 */
export function extractWeekPlan(text: string, from: Date = new Date()): Omit<PlanItem, 'id' | 'done'>[] | null {
  const match = text.match(PLAN_BLOCK);
  if (!match) return null;
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  return match[1]
    .split('\n')
    .map((l) => l.trim().match(/^[-*]\s*([A-Za-z]{3,9})\.?\s*(\d{1,2}:\d{2})?\s*\|\s*([^|]+?)\s*\|\s*(.+)$/))
    .filter((m): m is RegExpMatchArray => m !== null && m[1].toLowerCase() in DAY_WORDS)
    .slice(0, 30)
    .map((m) => {
      const day = new Date(today);
      day.setDate(today.getDate() + ((DAY_WORDS[m[1].toLowerCase()] - today.getDay() + 7) % 7));
      const area = AREAS.find((a) => a.toLowerCase() === m[3].toLowerCase()) ?? 'Other';
      const [h, min] = (m[2] ?? '').split(':');
      return {
        title: m[4].trim().slice(0, 120),
        area,
        date: dateKey(day),
        time: m[2] ? `${String(Math.min(23, Number(h))).padStart(2, '0')}:${min}` : '',
      };
    });
}

/** The reply with any Week plan block removed, for the chat view. */
export function withoutWeekPlan(text: string): {
  text: string;
  hadPlan: boolean;
} {
  return {
    text: text.replace(PLAN_BLOCK, '').trim(),
    hadPlan: PLAN_BLOCK.test(text),
  };
}

/** Plain-text week for the coach: plan items and habit days, Monday to Sunday. */
export function weekSummary(items: PlanItem[], habits: Habit[], log: HabitLog, from: Date = new Date()): string {
  const lines = weekKeys(from).map((key) => {
    const day = DAY_SHORT[fromKey(key).getDay()];
    const planned = items
      .filter((i) => i.date === key)
      .map((i) => `${i.time ? `${i.time} ` : ''}${i.title} (${i.area})${i.done ? ' ✓' : ''}`);
    const due = habits
      .filter((h) => isScheduled(h, key))
      .map((h) => `${h.name}${log[key]?.[h.id] === 'done' ? ' ✓' : log[key]?.[h.id] === 'missed' ? ' ✗' : ''}`);
    return `- ${day} ${key}: ${[...planned, ...due.map((d) => `habit: ${d}`)].join('; ') || '—'}`;
  });
  return lines.join('\n');
}
