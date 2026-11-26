// Run: npx tsx tests/profile.test.ts
import assert from 'node:assert/strict';
import { extractProfile, parseHabits, parseVisionPicture, withoutProfile } from '../src/lib/profile';
import { buildIcs } from '../src/lib/ics';

const reply = `Here's your vision.

\`\`\`markdown
# Vision Profile — Ethan
Last updated: 2026-11-25

## Coaching style
balanced · Check-ins: daily, 21:00

## Vision picture
- Body: A trail at dawn, running the last kilometre with friends
- Relationships: A long table, friends laughing over dinner you cooked

## Active habits (max 3)
| Habit | Area | Time | When / where (their words) | Tiny version | Obstacle → plan |
|---|---|---|---|---|---|
| Run 2 km | Body | 7:30 | Before work, from my front door | Shoes on, walk to the corner | Rain → treadmill at gym |
| Phone out of bedroom | Time & attention | 22:00 | When I brush my teeth | Plug it in the kitchen | Alarm → buy a clock |
| Call a friend | Relationships |  | Sunday afternoon walk | One text | Forget → calendar |

## Coach notes
- Responds well to direct questions
\`\`\`

Saved to your Vision tab.`;

const profile = extractProfile(reply);
assert.ok(profile?.startsWith('# Vision Profile — Ethan'));
const habits = parseHabits(profile!);
assert.equal(habits.length, 3);
assert.deepEqual(habits[0], { name: 'Run 2 km', area: 'Body', time: '07:30', when: 'Before work, from my front door', tiny: 'Shoes on, walk to the corner', obstacle: 'Rain → treadmill at gym' });
assert.equal(habits[1].area, 'Time & attention');
assert.equal(habits[2].time, '');
const scenes = parseVisionPicture(profile!);
assert.equal(scenes.length, 2);
assert.equal(scenes[1].area, 'Relationships');
const stripped = withoutProfile(reply);
assert.ok(stripped.hadProfile && !stripped.text.includes('Vision Profile') && stripped.text.includes('Saved to your Vision tab'));
assert.equal(extractProfile('No profile here'), null);

const ics = buildIcs(habits.map((h, i) => ({ ...h, id: `h${i}`, createdAt: '' })));
assert.ok(ics.startsWith('BEGIN:VCALENDAR') && ics.includes('RRULE:FREQ=DAILY') && ics.split('BEGIN:VEVENT').length === 4);
assert.ok(/DTSTART:\d{8}T073000/.test(ics));
assert.ok(buildIcs(habits.map((h, i) => ({ ...h, id: `h${i}`, createdAt: '' })), true).includes('Eudaimonia: habit'));
console.log('profile + calendar tests passed');
