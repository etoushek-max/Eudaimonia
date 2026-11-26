// Run: npx tsx tests/life-map.test.ts
import assert from 'node:assert/strict';
import { LIFE_AREAS, lifeMapSummary, parseLifeMap, playbooksFor } from '../src/lib/life-map';

const scores = Object.fromEntries(LIFE_AREAS.map((a, i) => [a.name, (i % 10) + 1]));
const map = { scores, focus: ['Body', 'Money'], whyNow: 'New baby, no time for anything.', takenAt: '2026-11-25T10:00:00Z' };

// Valid map passes through.
const parsed = parseLifeMap(map);
assert.ok(parsed);
assert.deepEqual(parsed.focus, ['Body', 'Money']);

// Invalid input is rejected at the boundary.
assert.equal(parseLifeMap(null), null);
assert.equal(parseLifeMap({ ...map, scores: { ...scores, Body: 11 } }), null);
assert.equal(parseLifeMap({ ...map, scores: { ...scores, Body: 2.5 } }), null);
assert.equal(parseLifeMap({ ...map, scores: { Hacking: 5 } }), null);
assert.equal(parseLifeMap({ ...map, focus: ['Body', 'Money', 'Career', 'Home & environment'] }), null);
assert.equal(parseLifeMap({ ...map, focus: ['../../etc/passwd'] }), null);
assert.equal(parseLifeMap({ ...map, whyNow: 'x'.repeat(5000) })!.whyNow.length, 1000);

// Summary for the coach shows scores, focus, why now, and change since last time.
const previous = { ...map, scores: { ...scores, Body: 7 }, takenAt: '2026-10-25T10:00:00Z' };
const summary = lifeMapSummary(map, previous);
assert.match(summary, /- Body: 1\/10 \(was 7\) ← wants change here/);
assert.match(summary, /- Money: \d+\/10 ← wants change here \[no full coaching yet\]/);
assert.match(summary, /Why they downloaded the app: New baby/);
assert.match(summary, /Previous map taken 2026-10-25/);

// Playbooks: focus areas with full coaching, else all launch playbooks.
assert.deepEqual(playbooksFor(map), ['body']);
assert.deepEqual(playbooksFor({ ...map, focus: ['Money'] }), ['body', 'relationships', 'time-attention']);
assert.deepEqual(playbooksFor(null), ['body', 'relationships', 'time-attention']);

console.log('life map tests passed');
