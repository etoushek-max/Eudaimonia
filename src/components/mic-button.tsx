import { requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder } from 'expo-audio';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { notify } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { readRecording, RECORDING_OPTIONS } from '@/lib/voice';

const MAX_MS = 5 * 60 * 1000;

async function transcribeAudio(uri: string): Promise<string> {
  const body = await readRecording(uri);
  const res = await fetch('/api/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as { text?: string; error?: string };
  if (!res.ok) throw new Error(json.error ?? `Voice is unavailable (HTTP ${res.status}).`);
  return json.text ?? '';
}

/** Tap to record, tap again to stop. The transcript goes into the text box so it can be fixed before sending. */
export function MicButton({ onText, disabled }: { onText: (text: string) => void; disabled?: boolean }) {
  const theme = useTheme();
  const recorder = useAudioRecorder(RECORDING_OPTIONS);
  const [state, setState] = useState<'idle' | 'recording' | 'transcribing'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const start = async () => {
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      notify('Microphone off', 'Allow microphone access in your settings to answer by voice.');
      return;
    }
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
    setState('recording');
    timer.current = setTimeout(stop, MAX_MS);
  };

  const stop = async () => {
    if (timer.current) clearTimeout(timer.current);
    setState('transcribing');
    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false });
      if (!recorder.uri) throw new Error('Nothing was recorded.');
      const text = await transcribeAudio(recorder.uri);
      if (text) onText(text);
      else notify('No speech heard', 'Try again a little closer to the microphone.');
    } catch (e) {
      notify('Voice didn’t work', e instanceof Error ? e.message : 'Try again, or type instead.');
    } finally {
      setState('idle');
    }
  };

  const recording = state === 'recording';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={recording ? 'Stop recording' : 'Answer by voice'}
      disabled={disabled || state === 'transcribing'}
      onPress={() => (recording ? stop() : start().catch((e) => notify('Microphone error', String(e))))}
      style={[
        styles.button,
        { backgroundColor: recording ? theme.danger : theme.backgroundElement, opacity: disabled ? 0.5 : 1 },
      ]}>
      {state === 'transcribing' ? (
        <ActivityIndicator color={theme.accent} />
      ) : (
        <ThemedText style={[styles.icon, recording && { color: '#FFFFFF' }]}>{recording ? '■' : '🎙'}</ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 20, lineHeight: 24 },
});
