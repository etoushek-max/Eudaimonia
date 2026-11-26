// Web: browsers record WebM, which Gemini doesn't list as supported, so convert to 16 kHz mono WAV.
import type { RecordingOptions } from 'expo-audio';

export const RECORDING_OPTIONS: RecordingOptions = {
  extension: '.webm',
  sampleRate: 44100,
  numberOfChannels: 1,
  bitRate: 64000,
  android: { outputFormat: 'default', audioEncoder: 'default' },
  ios: { audioQuality: 96 },
  web: { mimeType: 'audio/webm' },
};

const TARGET_RATE = 16000;

function toWav(samples: Float32Array, rate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const text = (offset: number, s: string) => [...s].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));
  text(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  text(8, 'WAVE');
  text(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, 'data');
  view.setUint32(40, samples.length * 2, true);
  samples.forEach((s, i) => view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, s)) * 0x7fff, true));
  return buffer;
}

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

export async function readRecording(uri: string): Promise<{ audio: string; mimeType: string }> {
  const encoded = await (await fetch(uri)).arrayBuffer();
  const ctx = new AudioContext();
  const decoded = await ctx.decodeAudioData(encoded).finally(() => ctx.close());
  // Resample to 16 kHz mono.
  const offline = new OfflineAudioContext(1, Math.ceil(decoded.duration * TARGET_RATE), TARGET_RATE);
  const source = offline.createBufferSource();
  source.buffer = decoded;
  source.connect(offline.destination);
  source.start();
  const rendered = await offline.startRendering();
  return { audio: toBase64(toWav(rendered.getChannelData(0), TARGET_RATE)), mimeType: 'audio/wav' };
}
