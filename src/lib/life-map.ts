// The life map: a "Wheel of Life" across every area (assess everything, coach a few).
// Shared by the app (wheel + form) and the server (validation + coach context).

export interface LifeArea {
  name: string;
  /** Short label for the wheel. */
  short: string;
  hint: string;
  /** Playbook file in src/coach/playbooks for areas with full coaching. */
  playbook?: 'body' | 'time-attention' | 'relationships';
}

export const LIFE_AREAS: readonly LifeArea[] = [
  { name: 'Body', short: 'Body', hint: 'Fitness, food, sleep, energy', playbook: 'body' },
  { name: 'Mental health', short: 'Mind', hint: 'Mood, stress, calm' },
  { name: 'Relationships', short: 'People', hint: 'Partner, family, friends', playbook: 'relationships' },
  { name: 'Time & attention', short: 'Time', hint: 'Screens, gaming, focus, work hours', playbook: 'time-attention' },
  { name: 'Career', short: 'Career', hint: 'Work, skills, ambition' },
  { name: 'Money', short: 'Money', hint: 'Spending, saving, money stress' },
  { name: 'Purpose & spirituality', short: 'Purpose', hint: 'Meaning, values, faith' },
  { name: 'Contribution & service', short: 'Giving', hint: 'Volunteering, helping others' },
  { name: 'Home & environment', short: 'Home', hint: 'Your space, tidiness' },
  { name: 'Learning & growth', short: 'Growth', hint: 'Reading, skills, curiosity' },
  { name: 'Play & rest', short: 'Play', hint: 'Fun, hobbies, recovery' },
];

export const MAX_FOCUS = 3;
const MAX_WHY = 1000;

export interface LifeMap {
  /** Area name -> satisfaction 1–10. */
  scores: Record<string, number>;
  /** Up to 3 area names where they most want change. */
  focus: string[];
  /** "What made you download Eudaimonia today?" in their words. */
  whyNow: string;
  takenAt: string;
}

const AREA_NAMES = new Set(LIFE_AREAS.map((a) => a.name));

/** Validate a life map from untrusted input. Returns null if it isn't a valid map. */
export function parseLifeMap(input: unknown): LifeMap | null {
  if (typeof input !== 'object' || input === null) return null;
  const m = input as Record<string, unknown>;
  if (typeof m.scores !== 'object' || m.scores === null || !Array.isArray(m.focus)) return null;
  const scores: Record<string, number> = {};
  for (const [area, value] of Object.entries(m.scores as Record<string, unknown>)) {
    if (!AREA_NAMES.has(area) || typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 10) {
      return null;
    }
    scores[area] = value;
  }
  const focus = m.focus.filter((f): f is string => typeof f === 'string' && AREA_NAMES.has(f));
  if (focus.length !== m.focus.length || focus.length > MAX_FOCUS) return null;
  return {
    scores,
    focus: [...new Set(focus)],
    whyNow: typeof m.whyNow === 'string' ? m.whyNow.slice(0, MAX_WHY) : '',
    takenAt: typeof m.takenAt === 'string' ? m.takenAt.slice(0, 40) : '',
  };
}

export function isComplete(scores: Record<string, number | undefined>): boolean {
  return LIFE_AREAS.every((a) => typeof scores[a.name] === 'number');
}

/** Plain-text summary for the coach, including change since the previous map. */
export function lifeMapSummary(map: LifeMap, previous?: LifeMap | null): string {
  const lines = LIFE_AREAS.filter((a) => map.scores[a.name] !== undefined).map((a) => {
    const now = map.scores[a.name];
    const before = previous?.scores[a.name];
    const change = before === undefined || before === now ? '' : ` (was ${before})`;
    const focus = map.focus.includes(a.name) ? ' ← wants change here' : '';
    const coached = a.playbook ? '' : ' [no full coaching yet]';
    return `- ${a.name}: ${now}/10${change}${focus}${coached}`;
  });
  const when = map.takenAt ? ` (taken ${map.takenAt.slice(0, 10)})` : '';
  const prev = previous?.takenAt ? `\nPrevious map taken ${previous.takenAt.slice(0, 10)}.` : '';
  return [
    `Life map — satisfaction 1–10${when}:`,
    ...lines,
    `Focus areas: ${map.focus.join(', ') || '(none chosen)'}`,
    `Why they downloaded the app: ${map.whyNow.trim() || '(not given)'}`,
  ].join('\n') + prev;
}

/** Playbooks to load: the focus areas that have one, or all launch playbooks if none chosen. */
export function playbooksFor(map: LifeMap | null): NonNullable<LifeArea['playbook']>[] {
  const all = LIFE_AREAS.flatMap((a) => (a.playbook ? [a.playbook] : []));
  if (!map) return all;
  const chosen = LIFE_AREAS.filter((a) => a.playbook && map.focus.includes(a.name)).map((a) => a.playbook!);
  return chosen.length ? chosen : all;
}
