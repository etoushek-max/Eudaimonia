// Run: npx tsx tests/influences.test.ts
import assert from 'node:assert/strict';
import { INFLUENCES, influencesSummary, parseInfluences, styleSummary, suggestTone } from '../src/lib/influences';

const inf = {
  ratings: { 'mel-robbins': 'love', 'dr-phil': 'love', 'david-goggins': 'love', 'brene-brown': 'no' },
  others: 'My grandad, and the Huberman podcast',
  tone: 'direct',
  takenAt: '2026-11-25T10:00:00Z',
};

// Every card has a unique id and a lens for the coach.
assert.equal(new Set(INFLUENCES.map((i) => i.id)).size, INFLUENCES.length);
assert.ok(INFLUENCES.every((i) => i.lens.length > 10 && i.name && i.symbol));

// Valid input passes through.
const parsed = parseInfluences(inf);
assert.ok(parsed);
assert.equal(parsed.tone, 'direct');
assert.equal(parsed.ratings['mel-robbins'], 'love');

// Invalid input is rejected at the boundary.
assert.equal(parseInfluences(null), null);
assert.equal(parseInfluences('love everyone'), null);
assert.equal(parseInfluences({ ...inf, tone: 'brutal' }), null);
assert.equal(parseInfluences({ ...inf, ratings: { 'andrew-tate': 'love' } }), null);
assert.equal(parseInfluences({ ...inf, ratings: { stoics: 'maybe' } }), null);
assert.equal(parseInfluences({ ...inf, ratings: null }), null);
assert.equal(parseInfluences({ ...inf, others: 'x'.repeat(5000) })!.others.length, 500);
assert.equal(parseInfluences({ ...inf, others: 42 })!.others, '');

// Tone follows the swipes.
assert.equal(suggestTone(parsed.ratings), 'direct');
assert.equal(suggestTone({ 'mel-robbins': 'no', 'dr-phil': 'no', 'david-goggins': 'no' }), 'gentle');
assert.equal(suggestTone({}), 'balanced');

// Summaries.
assert.match(styleSummary(parsed.ratings), /^You lean towards /);
assert.match(styleSummary({}), /No favourites yet/);
const summary = influencesSummary(parsed);
assert.match(summary, /Loves: .*Mel Robbins/);
assert.match(summary, /Not for them: .*Bren/);
assert.match(summary, /My grandad/);
assert.match(summary, /Preferred coaching tone: direct/);
assert.match(summary, /Lenses for their favourites/);

console.log('influences tests passed');
