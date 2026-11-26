// In-app dialog for the web. Browser pop-ups (window.confirm / alert) can be blocked silently —
// the desktop app's browser pane does — so the web build shows its own dialog instead.
import { useSyncExternalStore } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';

interface Dialog {
  title: string;
  message: string;
  /** Present for a yes/no question; absent for a simple notice. */
  onYes?: () => void;
}

let current: Dialog | null = null;
const listeners = new Set<() => void>();
function set(dialog: Dialog | null) {
  current = dialog;
  listeners.forEach((l) => l());
}
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function showDialog(dialog: Dialog) {
  set(dialog);
}

/** Mount once at the root of the app. */
export function DialogHost() {
  const dialog = useSyncExternalStore(subscribe, () => current, () => null);
  const theme = useTheme();
  if (!dialog) return null;
  const close = () => set(null);
  return (
    <Modal transparent animationType="fade" visible onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={[styles.box, { backgroundColor: theme.background }]} accessibilityRole="alert">
          <ThemedText type="smallBold">{dialog.title}</ThemedText>
          <ThemedText themeColor="textSecondary">{dialog.message}</ThemedText>
          <View style={styles.buttons}>
            {dialog.onYes && (
              <Pressable
                accessibilityRole="button"
                onPress={close}
                style={[styles.button, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText type="smallBold">Cancel</ThemedText>
              </Pressable>
            )}
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                close();
                dialog.onYes?.();
              }}
              style={[styles.button, { backgroundColor: dialog.onYes ? theme.danger : theme.accent }]}>
              <ThemedText type="smallBold" style={{ color: '#FFFFFF' }}>
                {dialog.onYes ? 'Yes, go ahead' : 'OK'}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  box: { width: '100%', maxWidth: 420, borderRadius: Spacing.three, padding: Spacing.four, gap: Spacing.three },
  buttons: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.two },
  button: { paddingVertical: Spacing.two, paddingHorizontal: Spacing.three, borderRadius: Spacing.five },
});
