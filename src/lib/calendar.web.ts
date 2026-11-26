import { buildIcs } from './ics';
import type { Habit } from './types';
import type { PlanItem } from './week';

/** On the web, download the calendar file; opening it adds the habits to the user's calendar. */
export async function addHabitsToCalendar(habits: Habit[], discreet = false, items: PlanItem[] = []): Promise<void> {
  const blob = new Blob([buildIcs(habits, discreet, items)], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'eudaimonia-habits.ics';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
