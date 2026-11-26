import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, Card, Row, Screen } from '@/components/ui';
import { AreaColors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { parseVisionPicture } from '@/lib/profile';
import { areaColour, FULL_COLOUR_AT, habitStats } from '@/lib/progress';
import { AREAS, type Area } from '@/lib/types';
import { useStore } from '@/state/store';

/** Blend from the grey "sketch" towards the area's colour as it's earned. */
function blend(from: string, to: string, t: number): string {
  const a = from.match(/\w\w/g)!.map((h) => parseInt(h, 16));
  const b = to.match(/\w\w/g)!.map((h) => parseInt(h, 16));
  return `#${a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
}

export default function ProgressScreen() {
  const { data, loaded } = useStore();
  const theme = useTheme();
  if (!loaded) return <Screen>{null}</Screen>;
  const colour = areaColour(data.habits, data.log);
  const scenes = data.profile ? parseVisionPicture(data.profile) : [];
  const activeAreas = AREAS.filter(
    (a) => data.habits.some((h) => h.area === a) || scenes.some((s) => s.area.toLowerCase() === a.toLowerCase()),
  );

  return (
    <Screen>
      <ThemedText type="subtitle">Progress</ThemedText>

      <View style={styles.section}>
        <ThemedText type="smallBold">Your vision, coming into colour</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Each completed habit adds colour to its area. Colour you’ve earned never fades — full colour at{' '}
          {FULL_COLOUR_AT} completions.
        </ThemedText>
        {activeAreas.length === 0 && (
          <Card>
            <ThemedText>Your vision picture appears here after your first session with the coach.</ThemedText>
          </Card>
        )}
        {activeAreas.map((area) => (
          <VisionPanel
            key={area}
            area={area}
            level={colour[area]}
            scene={scenes.find((s) => s.area.toLowerCase() === area.toLowerCase())?.scene}
            sketch={theme.sketch}
          />
        ))}
      </View>

      {data.habits.length > 0 && (
        <View style={styles.section}>
          <ThemedText type="smallBold">Last 14 days</ThemedText>
          {data.habits.map((habit) => {
            const s = habitStats(habit, data.log);
            return (
              <Card key={habit.id}>
                <Row style={styles.between}>
                  <ThemedText type="smallBold" style={styles.flex}>
                    {habit.name}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {s.doneThisWeek}/{s.plannedThisWeek} this week
                  </ThemedText>
                </Row>
                <Row style={styles.dots}>
                  {s.days.map((d) => (
                    <View
                      key={d.key}
                      accessibilityLabel={`${d.key}: ${d.status ?? 'not logged'}`}
                      style={[
                        styles.dot,
                        {
                          backgroundColor:
                            d.status === 'done'
                              ? AreaColors[habit.area]
                              : d.status === 'missed'
                                ? theme.backgroundSelected
                                : 'transparent',
                          borderColor: d.status === 'done' ? AreaColors[habit.area] : theme.backgroundSelected,
                        },
                      ]}
                    />
                  ))}
                </Row>
                <ThemedText type="small" themeColor="textSecondary">
                  {s.totalDone} done in total{s.missedTwice ? ' · two misses in a row — worth a chat with your coach' : ''}
                </ThemedText>
              </Card>
            );
          })}
        </View>
      )}

      {data.profile && (
        <Button
          label="Do my weekly review"
          onPress={() => router.navigate({ pathname: '/coach', params: { start: 'review' } })}
        />
      )}
    </Screen>
  );
}

function VisionPanel({ area, level, scene, sketch }: { area: Area; level: number; scene?: string; sketch: string }) {
  const bg = blend(sketch, AreaColors[area], level);
  const strong = level > 0.55;
  return (
    <View style={[styles.panel, { backgroundColor: bg }]}>
      <Row style={styles.between}>
        <ThemedText type="smallBold" style={strong && styles.light}>
          {area}
        </ThemedText>
        <ThemedText type="small" style={strong && styles.light}>
          {Math.round(level * 100)}% in colour
        </ThemedText>
      </Row>
      {scene ? (
        <ThemedText style={[styles.scene, strong && styles.light]}>{scene}</ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.two },
  between: { justifyContent: 'space-between', flexWrap: 'nowrap' },
  flex: { flex: 1 },
  dots: { gap: Spacing.one, flexWrap: 'nowrap' },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5 },
  panel: { borderRadius: Spacing.three, padding: Spacing.three, gap: Spacing.two, minHeight: 96 },
  scene: { fontStyle: 'italic' },
  light: { color: '#FFFFFF' },
});
