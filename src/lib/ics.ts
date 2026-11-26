import type { Habit } from './types';

// Rotating encouragement for calendar titles (spec: their why, identity, philosophy).
const LINES = [
  "every rep is a vote for who you're becoming",
  'small and done beats big and skipped',
  'never miss twice',
  'the life you described starts here',
  '"Well-being is realised by small steps" — Zeno',
  'show up for future you',
  '"First say to yourself what you would be; then do what you have to do" — Epictetus',
];

const pad = (n: number) => String(n).padStart(2, '0');

function stamp(d: Date): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}

function escape(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/**
 * A calendar file with one daily repeating event per habit, each with an alert at the start time.
 * Times are "floating" local times, so they stay at e.g. 07:00 wherever the phone is.
 */
export function buildIcs(habits: Habit[], discreet = false): string {
  const now = new Date();
  const events = habits.map((h, i) => {
    const [hh, mm] = (h.time || '08:00').split(':').map(Number);
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm);
    const title = discreet ? '🌱 Eudaimonia: habit' : `🌱 ${h.name} — ${LINES[i % LINES.length]}`;
    const details = discreet ? 'Open Eudaimonia to check in.' : [h.when && `Plan: ${h.when}`, h.tiny && `Tiny version: ${h.tiny}`, h.obstacle && `If it gets hard: ${h.obstacle}`].filter(Boolean).join('\n');
    return [
      'BEGIN:VEVENT',
      `UID:${h.id}@eudaimonia.app`,
      `DTSTAMP:${stamp(now)}`,
      `DTSTART:${stamp(start)}`,
      'DURATION:PT30M',
      'RRULE:FREQ=DAILY',
      `SUMMARY:${escape(title)}`,
      `DESCRIPTION:${escape(details)}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escape(title)}`,
      'TRIGGER:PT0M',
      'END:VALARM',
      'END:VEVENT',
    ].join('\r\n');
  });
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Eudaimonia//Prototype//EN', 'CALSCALE:GREGORIAN', ...events, 'END:VCALENDAR'].join('\r\n');
}
