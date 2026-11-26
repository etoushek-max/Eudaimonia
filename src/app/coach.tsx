import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';

import { LifeMapForm } from '@/components/life-map';
import { ThemedText } from '@/components/themed-text';
import { Button, Card, confirm, Pill, Row, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { askCoach, type CoachMode } from '@/lib/coach-client';
import { dateKey } from '@/lib/dates';
import type { LifeMap } from '@/lib/life-map';
import { extractProfile, messageText, withoutProfile } from '@/lib/profile';
import { todaySummary } from '@/lib/progress';
import type { ChatMessage } from '@/lib/types';
import { useStore } from '@/state/store';

type Tab = 'coach' | 'checkin';

export default function CoachScreen() {
  const params = useLocalSearchParams<{ tab?: string; start?: string; lifemap?: string }>();
  const { data, loaded, setCoachThread, setCheckin, saveProfile, addLifeMap } = useStore();
  const theme = useTheme();
  // A ?tab=checkin link from the Today screen wins until the user picks a tab here.
  const [chosen, setChosen] = useState<Tab>('coach');
  const tab: Tab = params.tab === 'checkin' ? 'checkin' : chosen;
  const setTab = (t: Tab) => {
    setChosen(t);
    if (params.tab) router.setParams({ tab: undefined });
  };
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const list = useRef<FlatList<ChatMessage>>(null);

  const today = dateKey();
  const thread = tab === 'checkin' ? (data.checkins[today] ?? []) : data.coachThread;
  const saveThread = (messages: ChatMessage[]) =>
    tab === 'checkin' ? setCheckin(today, messages) : setCoachThread(messages);

  const send = async (text: string, mode?: CoachMode, newMap?: LifeMap) => {
    const content = text.trim();
    if (!content || busy) return;
    const messages: ChatMessage[] = [...thread, { role: 'user', content }];
    await run(messages, mode, newMap);
  };

  const run = async (messages: ChatMessage[], mode?: CoachMode, newMap?: LifeMap) => {
    // A map saved this moment isn't in `data` yet, so it's passed in directly.
    const maps = newMap ? [...data.lifeMaps, newMap] : data.lifeMaps;
    setDraft('');
    setError(null);
    saveThread(messages);
    setBusy(true);
    try {
      const reply = await askCoach({
        mode: mode ?? (tab === 'checkin' ? 'checkin' : data.profile ? 'chat' : 'onboarding'),
        messages,
        profile: data.profile,
        habitLog: todaySummary(data.habits, data.log),
        lifeMap: maps.at(-1) ?? null,
        previousLifeMap: maps.at(-2) ?? null,
      });
      saveThread([...messages, { role: 'assistant', content: reply.content }]);
      const profile = extractProfile(reply.text);
      if (profile) saveProfile(profile);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  // Deep link from the Progress screen: ?start=review
  useEffect(() => {
    if (params.start === 'review' && tab === 'coach' && !busy) {
      router.setParams({ start: undefined });
      send("Let's do my weekly review.", 'review');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.start, tab]);

  useEffect(() => {
    const t = setTimeout(() => list.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(t);
  }, [thread.length, busy]);

  const lastIsUser = thread.length > 0 && thread[thread.length - 1].role === 'user';
  if (!loaded) return <Screen scroll={false}>{null}</Screen>;

  // Onboarding starts visually with the life map, not a blank chat. ?lifemap=retake re-measures it.
  const retake = params.lifemap === 'retake';
  const firstTime = !data.profile && data.lifeMaps.length === 0 && data.coachThread.length === 0;
  if (tab === 'coach' && (retake || firstTime)) {
    const latest = data.lifeMaps.at(-1) ?? null;
    return (
      <Screen>
        <LifeMapForm
          retake={retake && !!latest}
          initial={retake ? latest : null}
          previous={retake ? latest : null}
          onCancel={retake ? () => router.setParams({ lifemap: undefined }) : undefined}
          onDone={(map) => {
            addLifeMap(map);
            if (retake) router.setParams({ lifemap: undefined });
            send(
              retake && latest ? "I've updated my life map." : "I've filled in my life map.",
              data.profile ? 'chat' : 'onboarding',
              map,
            );
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll={false}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Row style={styles.header}>
          <Pill label="Coach" selected={tab === 'coach'} onPress={() => setTab('coach')} />
          <Pill label="Today's check-in" selected={tab === 'checkin'} onPress={() => setTab('checkin')} />
          {tab === 'coach' && data.profile && (
            <Pill label="Weekly review" onPress={() => send("Let's do my weekly review.", 'review')} />
          )}
        </Row>

        <FlatList
          ref={list}
          style={styles.flex}
          data={thread}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={styles.messages}
          ListEmptyComponent={<Intro tab={tab} hasProfile={!!data.profile} hasHabits={data.habits.length > 0} onStart={send} />}
          renderItem={({ item }) => <Bubble message={item} />}
          ListFooterComponent={
            <>
              {busy && (
                <Row style={styles.thinking}>
                  <ActivityIndicator color={theme.accent} />
                  <ThemedText type="small" themeColor="textSecondary">
                    Your coach is thinking…
                  </ThemedText>
                </Row>
              )}
              {error && (
                <Card>
                  <ThemedText type="small" style={{ color: theme.danger }}>
                    {error}
                  </ThemedText>
                  {lastIsUser && <Button label="Try again" kind="secondary" small onPress={() => run(thread)} />}
                </Card>
              )}
            </>
          }
        />

        {thread.length > 0 && (
          <View style={styles.composer}>
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
              placeholder="Type, or tap the mic on your keyboard to talk"
              placeholderTextColor={theme.textSecondary}
              value={draft}
              onChangeText={setDraft}
              multiline
              maxLength={4000}
            />
            <Button label="Send" onPress={() => send(draft)} disabled={busy || !draft.trim()} />
          </View>
        )}
        {tab === 'coach' && thread.length > 0 && (
          <Button
            label="New conversation"
            kind="secondary"
            small
            onPress={() =>
              confirm('Start a new conversation?', 'Your Vision Profile and habits are kept.', () => setCoachThread([]))
            }
          />
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Intro({
  tab,
  hasProfile,
  hasHabits,
  onStart,
}: {
  tab: Tab;
  hasProfile: boolean;
  hasHabits: boolean;
  onStart: (text: string) => void;
}) {
  if (tab === 'checkin') {
    return (
      <Card>
        <ThemedText type="smallBold">Today’s check-in</ThemedText>
        <ThemedText>
          {hasHabits
            ? 'Mark your habits on the Today tab first, then check in. It takes under a minute.'
            : 'Once you have habits, check in here each day. It takes under a minute.'}
        </ThemedText>
        <Button label="Start check-in" onPress={() => onStart('Check-in for today.')} />
      </Card>
    );
  }
  return (
    <Card>
      <ThemedText type="smallBold">{hasProfile ? 'Talk to your coach' : 'Your first session'}</ThemedText>
      <ThemedText>
        {hasProfile
          ? 'Talk through a miss, plan your week, or ask for your weekly review.'
          : "About 10 minutes. We'll start with what matters most to you. You can type or use your keyboard's microphone to answer by voice."}
      </ThemedText>
      <Button
        label={hasProfile ? 'Start a conversation' : "Let's begin"}
        onPress={() => onStart(hasProfile ? 'Hi coach.' : "Hi! I'm ready to start.")}
      />
    </Card>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const theme = useTheme();
  const mine = message.role === 'user';
  const { text, hadProfile } = withoutProfile(messageText(message));
  if (!text && !hadProfile) return null;
  return (
    <View
      style={[
        styles.bubble,
        mine
          ? { alignSelf: 'flex-end', backgroundColor: theme.accent }
          : { alignSelf: 'flex-start', backgroundColor: theme.backgroundElement },
      ]}>
      {text ? (
        <ThemedText selectable style={mine ? { color: theme.onAccent } : undefined}>
          {text}
        </ThemedText>
      ) : null}
      {hadProfile && (
        <ThemedText type="smallBold" style={{ color: theme.accent }}>
          ✓ Vision Profile saved — see the Vision tab
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingBottom: Spacing.two },
  messages: { gap: Spacing.two, paddingVertical: Spacing.two },
  bubble: { maxWidth: '88%', borderRadius: Spacing.three, padding: Spacing.three, gap: Spacing.two },
  thinking: { paddingVertical: Spacing.two },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.two, paddingVertical: Spacing.two },
  input: { flex: 1, borderRadius: Spacing.three, padding: Spacing.three, fontSize: 16, maxHeight: 140 },
});
