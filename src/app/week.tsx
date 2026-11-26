import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, Card, notify, Pill, Row, Screen } from '@/components/ui';
import { AreaColors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { addHabitsToCalendar } from '@/lib/calendar';
import { dateKey } from '@/lib/dates';
import { AREAS, type Area } from '@/lib/types';
import { DAY_SHORT, fromKey, isScheduled, weekKeys, type PlanItem } from '@/lib/week';
import { useStore } from '@/state/store';

export default function WeekScreen() {
  const { data, loaded, setStatus, togglePlanItem, removePlanItem } = useStore();
  const theme = useTheme();
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  if (!loaded) return <Screen>{null}</Screen>;

  const today = dateKey();
  const base = new Date();
  base.setDate(base.getDate() + offset * 7);
  const keys = weekKeys(base);
  const itemsOn = (key: string) =>
    data.plan.filter((p) => p.date === key).sort((a, b) => (a.time || '99').localeCompare(b.time || '99'));
  const habitsOn = (key: string) => data.habits.filter((h) => isScheduled(h, key));
  const weekItems = data.plan.filter((p) => keys.includes(p.date));
  const shown = selected && keys.includes(selected) ? [selected] : keys;
  const title = offset === 0 ? 'This week' : offset === 1 ? 'Next week' : offset === -1 ? 'Last week' : 'Week';
  const range = `${fromKey(keys[0]).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${fromKey(
    keys[6],
  ).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;

  const exportWeek = async () => {
    try {
      await addHabitsToCalendar([], false, weekItems);
    } catch (e) {
      notify('Calendar', e instanceof Error ? e.message : 'Could not open the calendar file.');
    }
  };

  return (
    <Screen>
      <Row style={styles.between}>
        <Button label="‹" kind="secondary" small onPress={() => setOffset((o) => o - 1)} />
        <View style={styles.titleBox}>
          <ThemedText type="subtitle">{title}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {range}
          </ThemedText>
        </View>
        <Button label="›" kind="secondary" small onPress={() => setOffset((o) => o + 1)} />
      </Row>

      {/* Calendar strip: tap a day to see just that day; tap again for the whole week. */}
      <View style={styles.strip}>
        {keys.map((key) => {
          const isToday = key === today;
          const isSelected = key === selected;
          const dots = [
            ...itemsOn(key).map((p) => ({ area: p.area, done: p.done })),
            ...habitsOn(key).map((h) => ({
              area: h.area,
              done: data.log[key]?.[h.id] === 'done',
            })),
          ].slice(0, 5);
          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityLabel={`${DAY_SHORT[fromKey(key).getDay()]} ${key}`}
              onPress={() => setSelected(isSelected ? null : key)}
              style={[
                styles.day,
                {
                  backgroundColor: isSelected ? theme.backgroundSelected : theme.backgroundElement,
                },
                isToday && { borderColor: theme.accent, borderWidth: 2 },
              ]}>
              <ThemedText type="small" themeColor="textSecondary">
                {DAY_SHORT[fromKey(key).getDay()]}
              </ThemedText>
              <ThemedText type="smallBold">{fromKey(key).getDate()}</ThemedText>
              <View style={styles.dots}>
                {dots.map((d, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      {
                        borderColor: AreaColors[d.area],
                        backgroundColor: d.done ? AreaColors[d.area] : 'transparent',
                      },
                    ]}
                  />
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>
      {selected && <Button label="Show the whole week" kind="secondary" small onPress={() => setSelected(null)} />}

      {weekItems.length === 0 && data.habits.length === 0 && (
        <Card>
          <ThemedText>
            Nothing planned yet. Plan your week with your coach in a couple of minutes, or add things yourself below.
          </ThemedText>
        </Card>
      )}

      {/* Whole-week view: daily habits once at the top instead of on every day. Tap a day to tick them off. */}
      {shown.length > 1 && data.habits.some((h) => !h.days) && (
        <ThemedText type="small" themeColor="textSecondary">
          Every day:{' '}
          {data.habits
            .filter((h) => !h.days)
            .map((h) => h.name)
            .join(', ')}{' '}
          — tap a day above to tick them off.
        </ThemedText>
      )}

      {shown.map((key) => {
        const items = itemsOn(key);
        const habits = habitsOn(key).filter((h) => shown.length === 1 || h.days);
        const canLog = key <= today;
        return (
          <View key={key} style={styles.dayList}>
            <ThemedText type="smallBold" themeColor={key === today ? 'text' : 'textSecondary'}>
              {fromKey(key).toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
              {key === today ? ' · today' : ''}
            </ThemedText>
            {items.length === 0 && habits.length === 0 && (
              <ThemedText type="small" themeColor="textSecondary">
                {shown.length > 1 && data.habits.some((h) => !h.days) ? 'Just your daily habits.' : 'Free day.'}
              </ThemedText>
            )}
            {items.map((item) => (
              <PlanRow
                key={item.id}
                item={item}
                onToggle={() => togglePlanItem(item.id)}
                onRemove={() => removePlanItem(item.id)}
              />
            ))}
            {habits.map((h) => {
              const status = data.log[key]?.[h.id];
              return (
                <Pressable
                  key={h.id}
                  disabled={!canLog}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: status === 'done' }}
                  onPress={() => setStatus(h.id, status === 'done' ? null : 'done', key)}
                  style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
                  <Check done={status === 'done'} colour={AreaColors[h.area]} />
                  <View style={styles.flex}>
                    <ThemedText style={status === 'done' && styles.doneText}>{h.name}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      Habit · {h.area}
                      {h.time ? ` · ${h.time}` : ''}
                      {status === 'missed' ? ' · skipped' : ''}
                    </ThemedText>
                  </View>
                </Pressable>
              );
            })}
          </View>
        );
      })}

      <Button
        label="Plan my week with my coach"
        onPress={() => router.navigate({ pathname: '/coach', params: { start: 'plan' } })}
      />
      <AddPlanItem keys={keys} defaultKey={selected ?? (keys.includes(today) ? today : keys[0])} />
      {weekItems.length > 0 && (
        <Button label="Add this week’s plan to my calendar" kind="secondary" onPress={exportWeek} />
      )}
    </Screen>
  );
}

function Check({ done, colour }: { done: boolean; colour: string }) {
  return (
    <View style={[styles.check, { borderColor: colour, backgroundColor: done ? colour : 'transparent' }]}>
      {done ? <ThemedText style={styles.tick}>✓</ThemedText> : null}
    </View>
  );
}

function PlanRow({ item, onToggle, onRemove }: { item: PlanItem; onToggle: () => void; onRemove: () => void }) {
  const theme = useTheme();
  return (
    <View style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.done }}
        accessibilityLabel={item.title}
        onPress={onToggle}
        style={styles.rowMain}>
        <Check done={item.done} colour={AreaColors[item.area]} />
        <View style={styles.flex}>
          <ThemedText style={item.done && styles.doneText}>{item.title}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {item.area}
            {item.time ? ` · ${item.time}` : ''}
          </ThemedText>
        </View>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${item.title}`} onPress={onRemove} hitSlop={8}>
        <ThemedText themeColor="textSecondary">✕</ThemedText>
      </Pressable>
    </View>
  );
}

function AddPlanItem({ keys, defaultKey }: { keys: string[]; defaultKey: string }) {
  const { addPlanItem } = useStore();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [day, setDay] = useState<string | null>(null);
  const [time, setTime] = useState('');
  const [area, setArea] = useState<Area>('Other');
  const chosen = day && keys.includes(day) ? day : defaultKey;
  const validTime = time === '' || /^([01]?\d|2[0-3]):[0-5]\d$/.test(time);

  if (!open) return <Button label="+ Add to this week" kind="secondary" onPress={() => setOpen(true)} />;

  const save = () => {
    addPlanItem({
      title: title.trim(),
      area,
      date: chosen,
      time: time ? time.padStart(5, '0') : '',
    });
    setTitle('');
    setTime('');
    setOpen(false);
  };
  const input = [styles.input, { color: theme.text, borderColor: theme.backgroundSelected }];
  return (
    <Card>
      <ThemedText type="smallBold">Add to this week</ThemedText>
      <TextInput
        style={input}
        placeholder="e.g. Call Mum, meal prep, book a physio"
        placeholderTextColor={theme.textSecondary}
        value={title}
        onChangeText={setTitle}
        maxLength={120}
      />
      <Row>
        {keys.map((k) => (
          <Pill key={k} label={DAY_SHORT[fromKey(k).getDay()]} selected={k === chosen} onPress={() => setDay(k)} />
        ))}
      </Row>
      <Row>
        {AREAS.map((a) => (
          <Pill key={a} label={a} selected={a === area} onPress={() => setArea(a)} />
        ))}
      </Row>
      <TextInput
        style={input}
        placeholder="Time, 24-hour (e.g. 18:00) — optional"
        placeholderTextColor={theme.textSecondary}
        value={time}
        onChangeText={setTime}
        maxLength={5}
      />
      {!validTime && (
        <ThemedText type="small" style={{ color: theme.danger }}>
          Use HH:MM, like 18:00.
        </ThemedText>
      )}
      <Row>
        <Button label="Add" onPress={save} disabled={!title.trim() || !validTime} />
        <Button label="Cancel" kind="secondary" onPress={() => setOpen(false)} />
      </Row>
    </Card>
  );
}

const styles = StyleSheet.create({
  between: {
    justifyContent: 'space-between',
    flexWrap: 'nowrap',
    alignItems: 'center',
  },
  titleBox: { alignItems: 'center' },
  strip: { flexDirection: 'row', gap: 4 },
  day: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    gap: 2,
  },
  dots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 2,
    minHeight: 8,
    maxWidth: 34,
  },
  dot: { width: 6, height: 6, borderRadius: 3, borderWidth: 1 },
  dayList: { gap: Spacing.one },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two,
    borderRadius: Spacing.two,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  flex: { flex: 1 },
  check: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tick: { color: '#FFFFFF', fontSize: 14, lineHeight: 18 },
  doneText: { textDecorationLine: 'line-through', opacity: 0.6 },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    padding: Spacing.two,
    fontSize: 16,
  },
});
