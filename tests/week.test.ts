// Run: npx tsx tests/week.test.ts
import assert from 'node:assert/strict';
import { buildIcs } from '../src/lib/ics';
import { parseHabits } from '../src/lib/profile';
import { habitStats } from '../src/lib/progress';
import { daysLabel, extractWeekPlan, isScheduled, parseDays, weekKeys, withoutWeekPlan } from '../src/lib/week';

// Days from the habits table's Time column.
assert.deepEqual(parseDays('Mon/Wed/Fri 07:00'), [1, 3, 5]);
assert.deepEqual(parseDays('Weekdays 18:30'), [1, 2, 3, 4, 5]);
assert.deepEqual(parseDays('Mon-Thu'), [1, 2, 3, 4]);
assert.deepEqual(parseDays('Sat–Sun'), [0, 6]);
assert.equal(parseDays('07:00'), undefined);
assert.equal(parseDays('daily 07:00'), undefined);
assert.equal(daysLabel([1, 3, 5]), 'Mon, Wed, Fri');
assert.equal(daysLabel(undefined), 'Every day');

// Weeks run Monday to Sunday. 2026-11-25 is a Wednesday.
const wed = new Date(2026, 10, 25);
assert.deepEqual(weekKeys(wed), ['2026-11-23', '2026-11-24', '2026-11-25', '2026-11-26', '2026-11-27', '2026-11-28', '2026-11-29']);
assert.equal(isScheduled({ days: [1, 3, 5] }, '2026-11-25'), true);
assert.equal(isScheduled({ days: [1, 3, 5] }, '2026-11-26'), false);
assert.equal(isScheduled({}, '2026-11-26'), true);

// Habits table with days.
const profile = `# Vision Profile
## Active habits (max 3)
| Habit | Area | Time | When / where (their words) | Tiny version | Obstacle → plan |
|---|---|---|---|---|---|
| Gym | Body | Mon/Wed/Fri 07:00 | before work | 10 min | tired → lay out kit |
| Read | Other | 21:30 | in bed | 1 page | phone → charge outside |`;
const habits = parseHabits(profile);
assert.deepEqual(habits[0].days, [1, 3, 5]);
assert.equal(habits[0].time, '07:00');
assert.equal(habits[1].days, undefined);

// Stats count only scheduled days.
const gym = { ...habits[0], id: 'g', createdAt: '' };
assert.equal(habitStats(gym, {}).plannedThisWeek, 3);

// Week plan block from a coach reply; day names map to the next occurrence (today included).
const reply = `Here's your week.

\`\`\`markdown
# Week plan
- Sun | Body | Meal prep for the week
- Thu 18:00 | Relationships | Call Mum
- Wed 07:00 | body | Book a physio appointment
- Funday | Other | ignored
\`\`\`

Saved in your Week tab.`;
const plan = extractWeekPlan(reply, wed)!;
assert.equal(plan.length, 3);
assert.deepEqual(plan[0], { title: 'Meal prep for the week', area: 'Body', date: '2026-11-29', time: '' });
assert.deepEqual(plan[1], { title: 'Call Mum', area: 'Relationships', date: '2026-11-26', time: '18:00' });
assert.equal(plan[2].date, '2026-11-25');
assert.equal(plan[2].area, 'Body');
assert.equal(extractWeekPlan('no plan here'), null);
assert.deepEqual(withoutWeekPlan(reply), { text: "Here's your week.\n\n\n\nSaved in your Week tab.", hadPlan: true });

// Calendar: weekly habits repeat on their days; plan items are one-off events.
const ics = buildIcs([gym], false, [{ id: 'p1', title: 'Call Mum', area: 'Relationships', date: '2026-11-26', time: '18:00', done: false }]);
assert.match(ics, /RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR/);
assert.match(ics, /DTSTART:20261126T180000/);
assert.match(ics, /SUMMARY:🌱 Call Mum/);

console.log('week tests passed');
