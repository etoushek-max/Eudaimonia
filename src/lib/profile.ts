import { AREAS, type Area, type ChatMessage, type Habit } from './types';
import { parseDays } from './week';

const PROFILE_BLOCK = /```[a-z]*\s*\n(# Vision Profile[\s\S]*?)```/;

/** Pull a Vision Profile out of a coach reply, if it contains one. */
export function extractProfile(text: string): string | null {
  const match = text.match(PROFILE_BLOCK);
  return match ? match[1].trim() : null;
}

/** The reply with any Vision Profile block replaced by a short marker, for the chat view. */
export function withoutProfile(text: string): { text: string; hadProfile: boolean } {
  const hadProfile = PROFILE_BLOCK.test(text);
  return { text: text.replace(PROFILE_BLOCK, '').trim(), hadProfile };
}

/** Text of a message, ignoring thinking and other non-text blocks. */
export function messageText(message: ChatMessage): string {
  if (!message.content) return '';
  if (typeof message.content === 'string') return message.content;
  return message.content
    .map((b) => (b.type === 'text' ? b.text : ''))
    .filter(Boolean)
    .join('\n\n');
}

function section(profile: string, heading: string): string {
  const start = profile.indexOf(`## ${heading}`);
  if (start === -1) return '';
  const rest = profile.slice(start + heading.length + 3);
  const next = rest.search(/\n## /);
  return next === -1 ? rest : rest.slice(0, next);
}

function toArea(value: string): Area {
  const v = value.trim().toLowerCase();
  return AREAS.find((a) => a.toLowerCase() === v) ?? (v.startsWith('time') ? 'Time & attention' : 'Other');
}

function toTime(value: string): string {
  const m = value.match(/(\d{1,2}):(\d{2})/);
  if (!m) return '';
  const h = Math.min(23, Number(m[1]));
  return `${String(h).padStart(2, '0')}:${m[2]}`;
}

/** Read the "Active habits" table. Expects: Habit | Area | Time | When | Tiny | Obstacle. */
export function parseHabits(profile: string): Omit<Habit, 'id' | 'createdAt'>[] {
  const rows = section(profile, 'Active habits')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('|'))
    .map((l) => l.replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));

  return rows
    .filter((cells) => cells.length >= 2 && !/^-+$/.test(cells[0].replace(/:/g, '')))
    .filter((cells) => cells[0].toLowerCase() !== 'habit' && cells[0] !== '')
    .slice(0, 3)
    .map((cells) => {
      const sixCol = cells.length >= 6;
      const days = sixCol ? parseDays(cells[2]) : undefined;
      return {
        name: cells[0],
        area: sixCol ? toArea(cells[1]) : 'Other',
        time: sixCol ? toTime(cells[2]) : '',
        ...(days ? { days } : {}),
        when: sixCol ? cells[3] : (cells[1] ?? ''),
        tiny: sixCol ? cells[4] : (cells[2] ?? ''),
        obstacle: sixCol ? cells[5] : (cells[3] ?? ''),
      };
    });
}

/** "- Body: a trail at dawn..." lines from the Vision picture section. */
export function parseVisionPicture(profile: string): { area: string; scene: string }[] {
  return section(profile, 'Vision picture')
    .split('\n')
    .map((l) => l.trim().match(/^[-*]\s*([^:]+):\s*(.+)$/))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((m) => ({ area: m[1].trim(), scene: m[2].trim() }));
}
