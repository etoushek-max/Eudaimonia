// "Make it yours": thinkers, authors and teachers the user loves or dislikes.
// Influences shape how the coach frames things (language, tone, examples) — never the method or safety rules.
// Cards and lenses are our own short summaries; the coach credits ideas and never speaks as the person.

export type Rating = 'love' | 'no' | 'unknown';
export type Tone = 'gentle' | 'balanced' | 'direct';
type Style = 'gentle' | 'calm' | 'direct' | 'energetic';
type Approach = 'practical' | 'science' | 'spiritual' | 'philosophical';

export interface Influence {
  id: string;
  name: string;
  /** One line on the idea, so people can rate it even if they don't know the name. */
  idea: string;
  symbol: string;
  colour: string;
  style: Style;
  approach: Approach;
  /** Coach-facing summary of their core ideas, in our words. */
  lens: string;
}

export const INFLUENCES: readonly Influence[] = [
  {
    id: 'atomic-habits',
    name: 'Atomic Habits (James Clear)',
    idea: 'Tiny habits, 1% better each day — become who you want to be, one vote at a time.',
    symbol: '⚛️',
    colour: '#3D8BD9',
    style: 'calm',
    approach: 'practical',
    lens: 'Make it obvious, attractive, easy and satisfying. Tiny changes compound. Every action is a vote for the person you want to become; focus on systems and identity, not goals alone.',
  },
  {
    id: 'mel-robbins',
    name: 'Mel Robbins',
    idea: 'Count 5-4-3-2-1 and move before your brain talks you out of it.',
    symbol: '🚀',
    colour: '#E07A5F',
    style: 'energetic',
    approach: 'practical',
    lens: 'The 5 Second Rule: act within five seconds of an instinct before hesitation wins. "Let Them": let other people be who they are and put your energy into what you control. Cheer yourself on (the high-five habit).',
  },
  {
    id: 'dr-phil',
    name: 'Dr. Phil',
    idea: 'Straight talk: is what you are doing actually getting you what you want?',
    symbol: '🎯',
    colour: '#B4442F',
    style: 'direct',
    approach: 'practical',
    lens: 'Blunt, practical accountability. Ask what someone is getting out of a behaviour they say they hate; you can’t change what you don’t acknowledge; people do what works for them; judge by results, not intentions.',
  },
  {
    id: 'power-of-now',
    name: 'The Power of Now (Eckhart Tolle)',
    idea: 'Peace lives in the present moment, not in your thoughts about the past or future.',
    symbol: '🌿',
    colour: '#6FBF8F',
    style: 'calm',
    approach: 'spiritual',
    lens: 'You are not your thoughts; notice the mind’s chatter instead of being run by it. Most suffering comes from resisting what is. Bring full attention to the present moment and to the body.',
  },
  {
    id: 'tony-robbins',
    name: 'Tony Robbins',
    idea: 'Big energy, big goals: change your state and you change your life.',
    symbol: '🔥',
    colour: '#E0A526',
    style: 'energetic',
    approach: 'practical',
    lens: 'Change your physical and emotional state first (move, breathe, posture). Raise your standards; turn “shoulds” into “musts”. Ask better questions; find a compelling “why” and take massive action.',
  },
  {
    id: 'brene-brown',
    name: 'Brené Brown',
    idea: 'Courage starts with being willing to be seen — imperfections and all.',
    symbol: '💛',
    colour: '#E0A526',
    style: 'gentle',
    approach: 'science',
    lens: 'Vulnerability is the birthplace of courage and connection. Shame thrives in secrecy; name it and share it with someone safe. Clear is kind. Self-worth isn’t earned through perfection.',
  },
  {
    id: 'stoics',
    name: 'Marcus Aurelius & the Stoics',
    idea: 'Focus on what you control; meet hardship with calm and character.',
    symbol: '🏛️',
    colour: '#8A6FD6',
    style: 'calm',
    approach: 'philosophical',
    lens: 'Separate what is in your control (your judgements and actions) from what isn’t. The obstacle is the way. Remember life is short (memento mori). Live by virtue: wisdom, courage, justice, self-control.',
  },
  {
    id: 'david-goggins',
    name: 'David Goggins',
    idea: 'Embrace discomfort — you are capable of far more than you think.',
    symbol: '⛰️',
    colour: '#6B7280',
    style: 'direct',
    approach: 'practical',
    lens: 'Callous the mind by choosing hard things. The 40% rule: when you think you are done you are only partway there. Take ownership with no excuses; keep a “cookie jar” of past wins to draw on. (Balance with recovery and safety — never push through injury or illness.)',
  },
  {
    id: 'jay-shetty',
    name: 'Jay Shetty',
    idea: 'Think like a monk: purpose, service and a calm, clear mind.',
    symbol: '🧘',
    colour: '#6FBF8F',
    style: 'gentle',
    approach: 'spiritual',
    lens: 'Find your purpose (your dharma) where passion meets serving others. Notice the mind’s noise; detach from comparison and ego. Gratitude, service and daily stillness.',
  },
  {
    id: 'getting-things-done',
    name: 'Getting Things Done (David Allen)',
    idea: 'Get everything out of your head into one trusted list, then decide the next action.',
    symbol: '✅',
    colour: '#3D8BD9',
    style: 'calm',
    approach: 'practical',
    lens: 'Capture every open loop in one trusted system. For each, decide the very next physical action. If it takes under two minutes, do it now. A weekly review keeps the system trusted and the mind clear.',
  },
  {
    id: 'jesus',
    name: 'Jesus',
    idea: 'Love God and love your neighbour; grace, forgiveness and service.',
    symbol: '✝️',
    colour: '#E0A526',
    style: 'gentle',
    approach: 'spiritual',
    lens: 'Love of God and neighbour, grace and forgiveness (including of oneself), humility, service to others, hope. Draw on this tradition only as the user does, in their language; never preach or tell them what to believe.',
  },
  {
    id: 'buddha',
    name: 'The Buddha',
    idea: 'Ease suffering through mindfulness, compassion and letting go.',
    symbol: '☸️',
    colour: '#E07A5F',
    style: 'calm',
    approach: 'spiritual',
    lens: 'Suffering comes from craving and clinging; it eases through letting go. Mindfulness of breath, body and mind; loving-kindness and compassion; the middle way between extremes. Follow the user’s lead on practice.',
  },
  {
    id: 'viktor-frankl',
    name: 'Viktor Frankl',
    idea: 'Find meaning, even in suffering — you can always choose your response.',
    symbol: '🕯️',
    colour: '#8A6FD6',
    style: 'calm',
    approach: 'philosophical',
    lens: 'Between stimulus and response there is a space, and in it our freedom. Meaning comes from work, love, and the attitude we take to unavoidable suffering. Someone with a why can bear almost any how.',
  },
  {
    id: 'michelle-obama',
    name: 'Michelle Obama',
    idea: 'Keep becoming: own your story, go high, and lift others as you grow.',
    symbol: '🌱',
    colour: '#2F6F4F',
    style: 'gentle',
    approach: 'practical',
    lens: 'Own your story, including the hard parts. Growth is ongoing (“becoming”). Go high: respond to negativity with dignity. Build a circle of strong friendships and lift others up.',
  },
  {
    id: 'jordan-peterson',
    name: 'Jordan Peterson',
    idea: 'Take on responsibility; set your own house in order first.',
    symbol: '🦞',
    colour: '#B4442F',
    style: 'direct',
    approach: 'philosophical',
    lens: 'Meaning comes from taking on responsibility. Start by setting your own house in order (literally: make your bed, tidy your room). Compare yourself to who you were yesterday, not to others. Aim high and tell the truth.',
  },
  {
    id: 'esther-perel',
    name: 'Esther Perel',
    idea: 'The quality of your relationships determines the quality of your life.',
    symbol: '💞',
    colour: '#E07A5F',
    style: 'gentle',
    approach: 'science',
    lens: 'Relationships need both security and aliveness. Curiosity about the other person keeps love alive. Many conflicts are recurring; what matters is how you repair. Bring the same care to friendships and work relationships.',
  },
  {
    id: 'huberman',
    name: 'Andrew Huberman',
    idea: 'Science-based tools: morning light, sleep, focus and movement.',
    symbol: '🔬',
    colour: '#3D8BD9',
    style: 'calm',
    approach: 'science',
    lens: 'Practical biology: morning sunlight to set the body clock, consistent sleep and wake times, caffeine timing, exercise, deliberate cold or heat, breathing to calm stress (physiological sigh). Keep it practical and safe; refer medical questions to a doctor.',
  },
  {
    id: 'cal-newport',
    name: 'Cal Newport',
    idea: 'Protect your attention: deep work, less phone, more of what matters.',
    symbol: '📵',
    colour: '#3D8BD9',
    style: 'calm',
    approach: 'practical',
    lens: 'Deep work: protect long blocks of focused time. Digital minimalism: choose technology on purpose for what you value; declutter, then add back deliberately. Slow productivity: do fewer things, at a natural pace, with obsession for quality.',
  },
  {
    id: 'oprah',
    name: 'Oprah Winfrey',
    idea: 'Live your best life: gratitude, intention and purpose.',
    symbol: '✨',
    colour: '#8A6FD6',
    style: 'gentle',
    approach: 'spiritual',
    lens: 'Gratitude practice (a daily gratitude journal). Act from intention. Your life is speaking to you — listen to the whispers before they become shouts. Purpose and service.',
  },
  {
    id: 'landmark',
    name: 'Landmark Forum',
    idea: 'Break through by seeing the stories you tell yourself — and choosing new ones.',
    symbol: '🗝️',
    colour: '#B4442F',
    style: 'direct',
    approach: 'philosophical',
    lens: 'Distinguish what happened from the story you made it mean. Take responsibility for your life as it is. Complete the past (including making things right with people). Create new possibilities through what you declare and commit to.',
  },
];

export interface Influences {
  ratings: Record<string, Rating>;
  /** Anyone else who shaped them, in their words. */
  others: string;
  tone: Tone;
  takenAt: string;
}

const BY_ID = new Map(INFLUENCES.map((i) => [i.id, i]));
const RATINGS: readonly Rating[] = ['love', 'no', 'unknown'];
const TONES: readonly Tone[] = ['gentle', 'balanced', 'direct'];
const MAX_OTHERS = 500;

/** Validate influences from untrusted input; null if invalid. */
export function parseInfluences(input: unknown): Influences | null {
  if (typeof input !== 'object' || input === null) return null;
  const m = input as Record<string, unknown>;
  if (typeof m.ratings !== 'object' || m.ratings === null) return null;
  const ratings: Record<string, Rating> = {};
  for (const [id, r] of Object.entries(m.ratings as Record<string, unknown>)) {
    if (!BY_ID.has(id) || !RATINGS.includes(r as Rating)) return null;
    ratings[id] = r as Rating;
  }
  if (!TONES.includes(m.tone as Tone)) return null;
  return {
    ratings,
    others: typeof m.others === 'string' ? m.others.slice(0, MAX_OTHERS) : '',
    tone: m.tone as Tone,
    takenAt: typeof m.takenAt === 'string' ? m.takenAt.slice(0, 40) : '',
  };
}

const named = (ratings: Record<string, Rating>, r: Rating) => INFLUENCES.filter((i) => ratings[i.id] === r);

/** Suggest a coaching tone from what they love and dislike. */
export function suggestTone(ratings: Record<string, Rating>): Tone {
  let score = 0;
  for (const i of INFLUENCES) {
    const sign = ratings[i.id] === 'love' ? 1 : ratings[i.id] === 'no' ? -1 : 0;
    if (i.style === 'direct' || i.style === 'energetic') score += sign;
    if (i.style === 'gentle') score -= sign;
  }
  return score >= 2 ? 'direct' : score <= -2 ? 'gentle' : 'balanced';
}

/** A short "here's what we noticed" line for the user. */
export function styleSummary(ratings: Record<string, Rating>): string {
  const loved = named(ratings, 'love');
  if (loved.length === 0) return 'No favourites yet — your coach will learn your style as you go.';
  const counts = new Map<Approach, number>();
  loved.forEach((i) => counts.set(i.approach, (counts.get(i.approach) ?? 0) + 1));
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([a]) => a);
  const words: Record<Approach, string> = {
    practical: 'practical tools',
    science: 'science-backed ideas',
    spiritual: 'spiritual wisdom',
    philosophical: 'big-picture philosophy',
  };
  return `You lean towards ${top
    .slice(0, 2)
    .map((a) => words[a])
    .join(' and ')}.`;
}

/** Context for the coach: who they love, dislike and mentioned, their tone, and lenses for their favourites. */
export function influencesSummary(inf: Influences): string {
  const love = named(inf.ratings, 'love');
  const no = named(inf.ratings, 'no');
  const lines = [
    `Influences (from the app's "Make it yours" cards):`,
    `- Loves: ${love.map((i) => i.name).join(', ') || '(none)'}`,
    `- Not for them: ${no.map((i) => i.name).join(', ') || '(none)'}`,
    `- Also shaped by (their words): ${inf.others.trim() || '(nothing added)'}`,
    `- Preferred coaching tone: ${inf.tone}`,
  ];
  if (love.length) {
    lines.push('', 'Lenses for their favourites (frame ideas in these terms when it fits):');
    love.forEach((i) => lines.push(`- ${i.name}: ${i.lens}`));
  }
  return lines.join('\n');
}
