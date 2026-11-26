import { ApiError } from '@google/genai';

import { hasGeminiKey, transcribe } from '@/server/gemini';

// Voice notes up to ~5 minutes of 16 kHz mono WAV (base64 adds a third).
const MAX_BASE64 = 14_000_000;
const MIME_TYPES = new Set(['audio/wav', 'audio/aac', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'audio/flac']);

function bad(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  let body: { audio?: unknown; mimeType?: unknown };
  try {
    body = await request.json();
  } catch {
    return bad('Invalid JSON.');
  }
  // Validate at the boundary: known audio type, base64 only, bounded size.
  if (typeof body.mimeType !== 'string' || !MIME_TYPES.has(body.mimeType)) return bad('Unsupported audio type.');
  if (typeof body.audio !== 'string' || body.audio.length === 0) return bad('No audio.');
  if (body.audio.length > MAX_BASE64) return bad('Voice note too long — keep it under 5 minutes.');
  if (!/^[A-Za-z0-9+/]+=*$/.test(body.audio)) return bad('Audio must be base64.');
  if (!hasGeminiKey()) {
    return bad('Voice input needs GEMINI_API_KEY in .env for now. You can still type, or use your keyboard’s mic.', 503);
  }

  try {
    return Response.json({ text: await transcribe(body.audio, body.mimeType) });
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Gemini transcription error ${error.status}:`, error.message);
      if (error.status === 429) return bad('The free AI quota is used up for now. Try typing instead.', 429);
      if (error.status === 503) return bad('Voice is busy right now. Try again in a moment.', 503);
      return bad('Could not transcribe that. Try again, or type instead.', 502);
    }
    console.error(error);
    return bad('Something went wrong on the server.', 500);
  }
}
