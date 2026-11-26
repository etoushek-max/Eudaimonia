import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';

import { MicButton } from '@/components/mic-button';
import { ThemedText } from '@/components/themed-text';
import { Button, Card, Pill, Row } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { isComplete, LIFE_AREAS, MAX_FOCUS, type LifeMap } from '@/lib/life-map';

const FOCUS_COLOUR = '#E0A526';

function point(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function wedge(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p0 = point(cx, cy, r, a0);
  const p1 = point(cx, cy, r, a1);
  return `M ${cx} ${cy} L ${p0.x} ${p0.y} A ${r} ${r} 0 0 1 ${p1.x} ${p1.y} Z`;
}

function arc(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p0 = point(cx, cy, r, a0);
  const p1 = point(cx, cy, r, a1);
  return `M ${p0.x} ${p0.y} A ${r} ${r} 0 0 1 ${p1.x} ${p1.y}`;
}

/** The "Wheel of Life": one wedge per area, filled out to its 1–10 score. */
export function LifeMapWheel({
  scores,
  focus = [],
  previous,
  size = 300,
}: {
  scores: Record<string, number | undefined>;
  focus?: string[];
  previous?: Record<string, number> | null;
  size?: number;
}) {
  const theme = useTheme();
  const c = size / 2;
  const R = c - 58; // room for labels around the wheel
  const step = (2 * Math.PI) / LIFE_AREAS.length;
  const gap = 0.02;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} accessibilityLabel="Life map wheel">
      {LIFE_AREAS.map((area, i) => {
        const a0 = -Math.PI / 2 + i * step + gap;
        const a1 = -Math.PI / 2 + (i + 1) * step - gap;
        const mid = (a0 + a1) / 2;
        const score = scores[area.name];
        const before = previous?.[area.name];
        const label = point(c, c, R + 10, mid);
        const cos = Math.cos(mid);
        const anchor = cos > 0.3 ? 'start' : cos < -0.3 ? 'end' : 'middle';
        const isFocus = focus.includes(area.name);
        return (
          <G key={area.name}>
            <Path d={wedge(c, c, R, a0, a1)} fill={theme.sketch} opacity={0.5} />
            {score ? (
              <Path d={wedge(c, c, (R * score) / 10, a0, a1)} fill={isFocus ? FOCUS_COLOUR : theme.accent} />
            ) : null}
            {before ? (
              <Path
                d={arc(c, c, (R * before) / 10, a0, a1)}
                stroke={theme.text}
                strokeWidth={2}
                strokeDasharray="4 3"
                fill="none"
              />
            ) : null}
            <SvgText
              x={label.x}
              y={label.y + 4}
              fontSize={12}
              fontFamily="system-ui, -apple-system, Roboto, sans-serif"
              fontWeight={isFocus ? 'bold' : 'normal'}
              fill={isFocus ? FOCUS_COLOUR : theme.textSecondary}
              textAnchor={anchor}>
              {area.short}
            </SvgText>
          </G>
        );
      })}
      <Circle cx={c} cy={c} r={R / 2} stroke={theme.background} strokeWidth={1} fill="none" />
    </Svg>
  );
}

type Step = 'rate' | 'focus' | 'why';

/** Visual first step of onboarding (and retakes): rate every area, pick focus areas, say why now. */
export function LifeMapForm({
  initial,
  previous,
  retake,
  onDone,
  onCancel,
}: {
  initial?: LifeMap | null;
  previous?: LifeMap | null;
  retake?: boolean;
  onDone: (map: LifeMap) => void;
  onCancel?: () => void;
}) {
  const theme = useTheme();
  const [step, setStep] = useState<Step>('rate');
  const [scores, setScores] = useState<Record<string, number | undefined>>(initial?.scores ?? {});
  const [focus, setFocus] = useState<string[]>(initial?.focus ?? []);
  const [whyNow, setWhyNow] = useState(retake ? '' : (initial?.whyNow ?? ''));
  const rated = LIFE_AREAS.filter((a) => scores[a.name]).length;

  const toggleFocus = (name: string) =>
    setFocus((f) => (f.includes(name) ? f.filter((x) => x !== name) : f.length < MAX_FOCUS ? [...f, name] : f));

  const finish = () =>
    onDone({
      scores: Object.fromEntries(LIFE_AREAS.map((a) => [a.name, scores[a.name]!])),
      focus,
      whyNow: whyNow.trim(),
      takenAt: new Date().toISOString(),
    });

  return (
    <View style={styles.wrap}>
      <ThemedText type="subtitle">{retake ? 'Update your life map' : 'Your life map'}</ThemedText>
      <ThemedText themeColor="textSecondary">
        {step === 'rate'
          ? 'How satisfied are you with each part of your life right now? 1 = not at all, 10 = completely. Go with your gut.'
          : step === 'focus'
            ? `Where do you most want things to change? Pick up to ${MAX_FOCUS}.`
            : retake
              ? 'Anything you want your coach to know about what changed?'
              : 'Last one, in your own words.'}
      </ThemedText>

      <View style={styles.wheel}>
        <LifeMapWheel scores={scores} focus={focus} previous={previous?.scores} />
      </View>
      {previous && (
        <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
          Dashed line: your last map ({new Date(previous.takenAt).toLocaleDateString()})
        </ThemedText>
      )}

      {step === 'rate' && (
        <>
          {LIFE_AREAS.map((area) => (
            <Card key={area.name}>
              <Row style={styles.between}>
                <ThemedText type="smallBold">{area.name}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
                  {area.hint}
                </ThemedText>
              </Row>
              <View style={styles.scale}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
                  const on = scores[area.name] === n;
                  return (
                    <Pressable
                      key={n}
                      accessibilityRole="button"
                      accessibilityLabel={`${area.name}: ${n} out of 10`}
                      accessibilityState={{ selected: on }}
                      onPress={() => setScores((s) => ({ ...s, [area.name]: n }))}
                      style={[
                        styles.dot,
                        {
                          backgroundColor: on ? theme.accent : theme.backgroundElement,
                          borderColor: (scores[area.name] ?? 0) >= n ? theme.accent : theme.backgroundSelected,
                        },
                      ]}>
                      <ThemedText type="small" style={on ? { color: theme.onAccent } : undefined}>
                        {n}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </Card>
          ))}
          <Button
            label={isComplete(scores) ? 'Next' : `Rate all areas (${rated}/${LIFE_AREAS.length})`}
            disabled={!isComplete(scores)}
            onPress={() => setStep('focus')}
          />
        </>
      )}

      {step === 'focus' && (
        <>
          <Row style={styles.chips}>
            {LIFE_AREAS.map((area) => (
              <Pill
                key={area.name}
                label={`${area.name} · ${scores[area.name]}`}
                selected={focus.includes(area.name)}
                onPress={() => toggleFocus(area.name)}
              />
            ))}
          </Row>
          <ThemedText type="small" themeColor="textSecondary">
            Your coach goes deepest on Body, Time & attention and Relationships today, but tell it everything — it helps
            to know the whole picture.
          </ThemedText>
          <Row>
            <Button label="Back" kind="secondary" onPress={() => setStep('rate')} />
            <Button label="Next" disabled={focus.length === 0} onPress={() => setStep('why')} />
          </Row>
        </>
      )}

      {step === 'why' && (
        <>
          <ThemedText type="smallBold">
            {retake ? 'What’s changed since last time?' : 'What made you download Eudaimonia today?'}
          </ThemedText>
          <View style={styles.answer}>
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
              placeholder="Type, or tap 🎙 to talk"
              placeholderTextColor={theme.textSecondary}
              value={whyNow}
              onChangeText={setWhyNow}
              multiline
              maxLength={1000}
            />
            <MicButton onText={(t) => setWhyNow((w) => (w.trim() ? `${w.trim()} ${t}` : t))} />
          </View>
          <Row>
            <Button label="Back" kind="secondary" onPress={() => setStep('focus')} />
            <Button label={retake ? 'Save and talk to my coach' : 'Start my first session'} onPress={finish} />
          </Row>
        </>
      )}

      {onCancel && <Button label="Cancel" kind="secondary" small onPress={onCancel} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.three },
  wheel: { alignItems: 'center' },
  center: { textAlign: 'center' },
  hint: { flexShrink: 1, textAlign: 'right' },
  between: {
    justifyContent: 'space-between',
    flexWrap: 'nowrap',
    gap: Spacing.two,
  },
  scale: { flexDirection: 'row', gap: 4 },
  dot: {
    flex: 1,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: { flexWrap: 'wrap', gap: Spacing.two },
  answer: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.two },
  input: {
    flex: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    fontSize: 16,
    minHeight: 100,
  },
});
