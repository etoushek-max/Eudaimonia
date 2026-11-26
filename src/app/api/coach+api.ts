import Anthropic from '@anthropic-ai/sdk';
import { ApiError as GeminiError } from '@google/genai';

import { parseLifeMap } from '@/lib/life-map';
import { COACH_MODES, hasCredentials, runCoach, type CoachMode, type CoachRequest } from '@/server/coach';

const MAX_MESSAGES = 300;
const MAX_TEXT = 20_000;

function bad(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

// Validate input at the system boundary before it reaches the Claude API.
function parse(body: unknown): CoachRequest | string {
  if (typeof body !== 'object' || body === null) return 'Body must be a JSON object.';
  const b = body as Record<string, unknown>;
  if (!COACH_MODES.includes(b.mode as CoachMode)) return 'Unknown mode.';
  if (!Array.isArray(b.messages) || b.messages.length === 0) return 'messages must be a non-empty array.';
  if (b.messages.length > MAX_MESSAGES) return 'Conversation too long — start a new one.';
  const last = b.messages[b.messages.length - 1] as { role?: unknown; content?: unknown };
  if (last.role !== 'user') return 'The last message must be from the user.';
  if (typeof last.content === 'string' && last.content.length > MAX_TEXT) return 'Message too long.';
  if (b.profile !== null && typeof b.profile !== 'string') return 'profile must be a string or null.';
  if (typeof b.today !== 'string' || typeof b.habitLog !== 'string') return 'today and habitLog are required.';
  if (b.weekPlan !== undefined && typeof b.weekPlan !== 'string') return 'weekPlan must be a string.';
  const lifeMap = b.lifeMap == null ? null : parseLifeMap(b.lifeMap);
  const previousLifeMap = b.previousLifeMap == null ? null : parseLifeMap(b.previousLifeMap);
  if ((b.lifeMap != null && !lifeMap) || (b.previousLifeMap != null && !previousLifeMap)) return 'Invalid life map.';
  return {
    mode: b.mode as CoachMode,
    messages: b.messages as CoachRequest['messages'],
    profile: (b.profile as string | null) ?? null,
    today: b.today.slice(0, 100),
    habitLog: b.habitLog.slice(0, MAX_TEXT),
    weekPlan: typeof b.weekPlan === 'string' ? b.weekPlan.slice(0, MAX_TEXT) : '',
    lifeMap,
    previousLifeMap,
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return bad('Invalid JSON.');
  }
  const req = parse(body);
  if (typeof req === 'string') return bad(req);
  if (!hasCredentials()) {
    return bad(
      'The server has no AI key yet. Add GEMINI_API_KEY (or ANTHROPIC_API_KEY) to the .env file and restart the server.',
      503,
    );
  }

  try {
    return Response.json(await runCoach(req));
  } catch (error) {
    if (error instanceof GeminiError) {
      console.error(`Gemini API error ${error.status}:`, error.message);
      if (error.status === 429) return bad('The free AI quota is used up for now. Try again in a minute (or tomorrow).', 429);
      if (/api key/i.test(error.message) || error.status === 401 || error.status === 403) {
        return bad('The Gemini API key is not valid. Check GEMINI_API_KEY in .env and restart.', 500);
      }
      if (error.status === 503) return bad('The free AI model is busy right now. Try again in a moment.', 503);
      if (error.status === 400 || error.status === 404) {
        return bad('The coach could not process this conversation. Try starting a new one.', 400);
      }
      return bad('The coach is unavailable right now. Try again shortly.', 502);
    }
    if (error instanceof Anthropic.AuthenticationError) {
      return bad('The server has no valid Claude API key. Add ANTHROPIC_API_KEY to .env and restart.', 500);
    }
    if (error instanceof Anthropic.RateLimitError) {
      return bad('The coach is busy right now. Try again in a minute.', 429);
    }
    if (error instanceof Anthropic.BadRequestError) {
      console.error('Claude API rejected the request:', error.message);
      return bad('The coach could not process this conversation. Try starting a new one.', 400);
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`Claude API error ${error.status}:`, error.message);
      return bad('The coach is unavailable right now. Try again shortly.', 502);
    }
    console.error(error);
    return bad('Something went wrong on the server.', 500);
  }
}
