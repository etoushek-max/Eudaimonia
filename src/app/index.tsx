import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Switch, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, Card, confirm, notify, Pill, Row, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { addHabitsToCalendar } from '@/lib/calendar';
import { dateKey, prettyDate } from '@/lib/dates';
import { habitStats } from '@/lib/progress';
import { AREAS, type Area, type Habit } from '@/lib/types';
import { useStore } from '@/state/store';

export default function TodayScreen() {
  const { data, loaded, setStatus, removeHabit } = useStore();
  const [discreet, setDiscreet] = useState(false);
  const today = dateKey();

  if (!loaded) return <Screen>{null}</Screen>;

  const openCheckin = () => router.navigate({ pathname: '/coach', params: { tab: 'checkin' } });

  const addToCalendar = async () => {
    try {
      await addHabitsToCalendar(data.habits, discreet);
    } catch (e) {
      notify('Calendar', e instanceof Error ? e.message : 'Could not open the calendar file.');
    }
  };

  return (
    <Screen>
      <View>
        <ThemedText type="small" themeColor="textSecondary">
          {prettyDate()}
        </ThemedText>
        <ThemedText type="subtitle">Today</ThemedText>
      </View>

      {!data.profile && (
        <Card>
          <ThemedText type="smallBold">Start here</ThemedText>
          <ThemedText>
            A 10-minute conversation with your coach about what a flourishing life means to you. You’ll get your
            vision, one insight, and your first tiny habits.
          </ThemedText>
          <Button label="Start my first session" onPress={() => router.navigate('/coach')} />
        </Card>
      )}

      {data.habits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          status={data.log[today]?.[habit.id] ?? null}
          missedTwice={habitStats(habit, data.log).missedTwice}
          onSet={(s) => setStatus(habit.id, s)}
          onRemove={() =>
            confirm('Remove habit?', `"${habit.name}" will be removed. Its history stays in your log.`, () =>
              removeHabit(habit.id),
            )
          }
        />
      ))}

      {data.habits.length > 0 && (
        <>
          <Button label="Check in with my coach" onPress={openCheckin} />
          <Card>
            <ThemedText type="smallBold">Reminders in your calendar</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Adds each habit as a daily event at its time, with a line of encouragement in the title.
            </ThemedText>
            <Row style={styles.between}>
              <ThemedText type="small">Discreet titles (for shared calendars)</ThemedText>
              <Switch value={discreet} onValueChange={setDiscreet} />
            </Row>
            <Button label="Add habits to my calendar" kind="secondary" onPress={addToCalendar} />
          </Card>
        </>
      )}

      <AddHabit />
    </Screen>
  );
}

function HabitCard({
  habit,
  status,
  missedTwice,
  onSet,
  onRemove,
}: {
  habit: Habit;
  status: 'done' | 'missed' | null;
  missedTwice: boolean;
  onSet: (s: 'done' | 'missed' | null) => void;
  onRemove: () => void;
}) {
  return (
    <Card>
      <Row style={styles.between}>
        <View style={styles.flex}>
          <ThemedText type="smallBold">{habit.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {habit.area}
            {habit.time ? ` · ${habit.time}` : ''}
            {habit.when ? ` · ${habit.when}` : ''}
          </ThemedText>
        </View>
        <Button label="Remove" kind="secondary" small onPress={onRemove} />
      </Row>
      {habit.tiny ? (
        <ThemedText type="small" themeColor="textSecondary">
          Tiny version: {habit.tiny}
        </ThemedText>
      ) : null}
      <Row>
        <Pill label="✓ Done" selected={status === 'done'} onPress={() => onSet(status === 'done' ? null : 'done')} />
        <Pill
          label="Not today"
          selected={status === 'missed'}
          onPress={() => onSet(status === 'missed' ? null : 'missed')}
        />
      </Row>
      {missedTwice && (
        <ThemedText type="small" themeColor="textSecondary">
          Two misses in a row. That’s useful information, not a failure — your coach can help you re-plan.
        </ThemedText>
      )}
    </Card>
  );
}

function AddHabit() {
  const { addHabit } = useStore();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [area, setArea] = useState<Area>('Body');
  const [time, setTime] = useState('');

  const validTime = time === '' || /^([01]?\d|2[0-3]):[0-5]\d$/.test(time);
  const save = () => {
    addHabit({ name: name.trim(), area, time: time ? time.padStart(5, '0') : '', when: '', tiny: '', obstacle: '' });
    setName('');
    setTime('');
    setOpen(false);
  };

  if (!open) return <Button label="+ Add a habit myself" kind="secondary" onPress={() => setOpen(true)} />;

  const input = [styles.input, { color: theme.text, borderColor: theme.backgroundSelected }];
  return (
    <Card>
      <ThemedText type="smallBold">New habit</ThemedText>
      <TextInput
        style={input}
        placeholder="e.g. Walk 15 minutes after dropping the kids off"
        placeholderTextColor={theme.textSecondary}
        value={name}
        onChangeText={setName}
        maxLength={120}
      />
      <Row>
        {AREAS.map((a) => (
          <Pill key={a} label={a} selected={a === area} onPress={() => setArea(a)} />
        ))}
      </Row>
      <TextInput
        style={input}
        placeholder="Time, 24-hour (e.g. 07:30) — optional"
        placeholderTextColor={theme.textSecondary}
        value={time}
        onChangeText={setTime}
        maxLength={5}
      />
      {!validTime && (
        <ThemedText type="small" style={{ color: theme.danger }}>
          Use HH:MM, like 07:30.
        </ThemedText>
      )}
      <Row>
        <Button label="Save habit" onPress={save} disabled={!name.trim() || !validTime} />
        <Button label="Cancel" kind="secondary" onPress={() => setOpen(false)} />
      </Row>
    </Card>
  );
}

const styles = StyleSheet.create({
  between: { justifyContent: 'space-between', flexWrap: 'nowrap' },
  flex: { flex: 1 },
  input: { borderWidth: 1, borderRadius: Spacing.two, padding: Spacing.two, fontSize: 16 },
});
