// Phone: record a voice note in a format Gemini can transcribe, then read it as base64.
import { AudioQuality, IOSOutputFormat, type RecordingOptions } from 'expo-audio';
import { File } from 'expo-file-system';

// Speech only needs 16 kHz mono. iOS records WAV; Android records raw AAC.
export const RECORDING_OPTIONS: RecordingOptions = {
  extension: '.wav',
  sampleRate: 16000,
  numberOfChannels: 1,
  bitRate: 64000,
  android: { extension: '.aac', outputFormat: 'aac_adts', audioEncoder: 'aac' },
  ios: {
    extension: '.wav',
    outputFormat: IOSOutputFormat.LINEARPCM,
    audioQuality: AudioQuality.HIGH,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: { mimeType: 'audio/webm' },
};

export async function readRecording(uri: string): Promise<{ audio: string; mimeType: string }> {
  const audio = await new File(uri).base64();
  return { audio, mimeType: uri.toLowerCase().endsWith('.aac') ? 'audio/aac' : 'audio/wav' };
}
