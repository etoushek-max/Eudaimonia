import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { buildIcs } from './ics';
import type { Habit } from './types';

/**
 * Opens a calendar file of the habits so the phone's calendar app can add them.
 * (Expo Go can't write to the calendar directly; a development build can use expo-calendar later.)
 */
export async function addHabitsToCalendar(habits: Habit[], discreet = false): Promise<void> {
  const file = new File(Paths.cache, 'eudaimonia-habits.ics');
  if (file.exists) file.delete();
  file.create();
  file.write(buildIcs(habits, discreet));

  if (await File.canPreview(file).catch(() => false)) {
    await File.preview(file, { mimeType: 'text/calendar', title: 'Add habits to calendar' });
    return;
  }
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType: 'text/calendar', UTI: 'com.apple.ical.ics', dialogTitle: 'Add habits to calendar' });
    return;
  }
  throw new Error('This phone has no app that can open calendar files.');
}
