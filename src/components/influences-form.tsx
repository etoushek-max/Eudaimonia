import { useState } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { MicButton } from '@/components/mic-button';
import { ThemedText } from '@/components/themed-text';
import { Button, Pill, Row } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { INFLUENCES, styleSummary, suggestTone, type Influences, type Rating, type Tone } from '@/lib/influences';

const SWIPE = 90;
const TONE_LABELS: Record<Tone, string> = { gentle: 'Gentle', balanced: 'Balanced', direct: 'Straight-talking' };

/** "Make it yours": swipe right on people and ideas you love, left on ones that aren't for you, up if you don't know them. */
export function InfluencesForm({
  initial,
  finishLabel,
  onDone,
  onCancel,
}: {
  initial?: Influences | null;
  finishLabel: string;
  onDone: (influences: Influences) => void;
  onCancel?: () => void;
}) {
  const theme = useTheme();
  // Card position and ratings change together, so one state update handles a swipe.
  const [progress, setProgress] = useState(() => ({
    index: initial ? INFLUENCES.length : 0,
    ratings: initial?.ratings ?? ({} as Record<string, Rating>),
  }));
  const { index, ratings } = progress;
  const [others, setOthers] = useState(initial?.others ?? '');
  const [tone, setTone] = useState<Tone | null>(initial?.tone ?? null);

  // Created once: the swipe animation and the gesture handler only use stable values.
  const [{ pan, rate, responder }] = useState(() => {
    const pan = new Animated.ValueXY();
    const rate = (r: Rating) => {
      const out = r === 'love' ? { x: 500, y: 0 } : r === 'no' ? { x: -500, y: 0 } : { x: 0, y: -600 };
      Animated.timing(pan, { toValue: out, duration: 180, useNativeDriver: false }).start(() => {
        pan.setValue({ x: 0, y: 0 });
        setProgress((p) => {
          const card = INFLUENCES[p.index];
          if (!card) return p;
          return { index: p.index + 1, ratings: { ...p.ratings, [card.id]: r } };
        });
      });
    };
    const responder = PanResponder.create({
      // The card has nothing to tap, so it takes the gesture from the first touch (needed for mouse drags on web).
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, g) => {
        if (g.dx > SWIPE) rate('love');
        else if (g.dx < -SWIPE) rate('no');
        else if (g.dy < -SWIPE) rate('unknown');
        else Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      },
    });
    return { pan, rate, responder };
  });
  const card = INFLUENCES[index];

  const back = () => setProgress((p) => ({ ...p, index: Math.max(0, p.index - 1) }));

  // After the cards: anyone else, and the coaching tone (suggested from the swipes).
  if (!card) {
    const suggested = suggestTone(ratings);
    const chosen = tone ?? suggested;
    const loved = INFLUENCES.filter((i) => ratings[i.id] === 'love');
    return (
      <View style={styles.wrap}>
        <ThemedText type="subtitle">Make it yours</ThemedText>
        {loved.length > 0 && (
          <View style={styles.chips}>
            {loved.map((i) => (
              <View key={i.id} style={[styles.chip, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText type="small">
                  {i.symbol} {i.name}
                </ThemedText>
              </View>
            ))}
          </View>
        )}
        <ThemedText themeColor="textSecondary">{styleSummary(ratings)}</ThemedText>

        <ThemedText type="smallBold">Anyone else who’s shaped you?</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Authors, teachers, podcasts, courses, faith, family — anyone.
        </ThemedText>
        <View style={styles.answer}>
          <TextInput
            style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
            placeholder="Type, or tap 🎙 to talk"
            placeholderTextColor={theme.textSecondary}
            value={others}
            onChangeText={setOthers}
            multiline
            maxLength={500}
          />
          <MicButton onText={(t) => setOthers((o) => (o.trim() ? `${o.trim()}, ${t}` : t))} />
        </View>

        <ThemedText type="smallBold">How should your coach talk to you?</ThemedText>
        <Row>
          {(Object.keys(TONE_LABELS) as Tone[]).map((t) => (
            <Pill
              key={t}
              label={`${TONE_LABELS[t]}${t === suggested ? ' (suggested)' : ''}`}
              selected={t === chosen}
              onPress={() => setTone(t)}
            />
          ))}
        </Row>

        <Row>
          <Button label="Back" kind="secondary" onPress={back} />
          <Button
            label={finishLabel}
            onPress={() => onDone({ ratings, others: others.trim(), tone: chosen, takenAt: new Date().toISOString() })}
          />
        </Row>
        {onCancel && <Button label="Cancel" kind="secondary" small onPress={onCancel} />}
      </View>
    );
  }

  const rotate = pan.x.interpolate({ inputRange: [-200, 0, 200], outputRange: ['-12deg', '0deg', '12deg'] });
  const loveHint = pan.x.interpolate({ inputRange: [0, SWIPE], outputRange: [0, 1], extrapolate: 'clamp' });
  const noHint = pan.x.interpolate({ inputRange: [-SWIPE, 0], outputRange: [1, 0], extrapolate: 'clamp' });

  return (
    <View style={styles.wrap}>
      <ThemedText type="subtitle">Make it yours</ThemedText>
      <ThemedText themeColor="textSecondary">
        Who do you already learn from? Swipe right if you love them, left if they’re not for you, up if you don’t know
        them. Your coach will speak your language.
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
        {index + 1} of {INFLUENCES.length}
      </ThemedText>

      <Animated.View
        {...responder.panHandlers}
        style={[
          styles.card,
          { backgroundColor: theme.backgroundElement, borderColor: card.colour },
          { transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }] },
        ]}>
        <Animated.View style={[styles.stamp, styles.stampLove, { opacity: loveHint }]}>
          <ThemedText type="smallBold" style={styles.stampText}>
            LOVE
          </ThemedText>
        </Animated.View>
        <Animated.View style={[styles.stamp, styles.stampNo, { opacity: noHint }]}>
          <ThemedText type="smallBold" style={styles.stampText}>
            NOT FOR ME
          </ThemedText>
        </Animated.View>
        <View style={[styles.symbolCircle, { backgroundColor: card.colour }]}>
          <ThemedText style={styles.symbol}>{card.symbol}</ThemedText>
        </View>
        <ThemedText type="subtitle" style={styles.center}>
          {card.name}
        </ThemedText>
        <ThemedText style={styles.center}>{card.idea}</ThemedText>
      </Animated.View>

      <View style={styles.actions}>
        <RoundButton label="✕" caption="Not for me" colour={theme.danger} onPress={() => rate('no')} />
        <RoundButton label="?" caption="Don’t know" colour={theme.textSecondary} onPress={() => rate('unknown')} />
        <RoundButton label="♥" caption="Love" colour={theme.accent} onPress={() => rate('love')} />
      </View>

      <Row style={styles.between}>
        {index > 0 ? <Button label="Back" kind="secondary" small onPress={back} /> : <View />}
        <Button
          label="Skip the rest"
          kind="secondary"
          small
          onPress={() => setProgress((p) => ({ ...p, index: INFLUENCES.length }))}
        />
      </Row>
      {onCancel && <Button label="Cancel" kind="secondary" small onPress={onCancel} />}
    </View>
  );
}

function RoundButton({
  label,
  caption,
  colour,
  onPress,
}: {
  label: string;
  caption: string;
  colour: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={caption} onPress={onPress} style={styles.roundWrap}>
      <View style={[styles.round, { borderColor: colour }]}>
        <ThemedText style={[styles.roundLabel, { color: colour }]}>{label}</ThemedText>
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {caption}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.three },
  center: { textAlign: 'center' },
  between: { justifyContent: 'space-between' },
  card: {
    borderWidth: 3,
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
    alignItems: 'center',
    minHeight: 280,
    justifyContent: 'center',
    userSelect: 'none',
    cursor: 'grab',
  },
  symbolCircle: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  symbol: { fontSize: 44, lineHeight: 54 },
  stamp: { position: 'absolute', top: Spacing.three, borderWidth: 2, borderRadius: Spacing.two, paddingHorizontal: 8 },
  stampLove: { left: Spacing.three, borderColor: '#2F6F4F', backgroundColor: '#2F6F4F' },
  stampNo: { right: Spacing.three, borderColor: '#B4442F', backgroundColor: '#B4442F' },
  stampText: { color: '#FFFFFF' },
  actions: { flexDirection: 'row', justifyContent: 'space-around' },
  roundWrap: { alignItems: 'center', gap: Spacing.one },
  round: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  roundLabel: { fontSize: 26, lineHeight: 32 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: { paddingVertical: Spacing.one, paddingHorizontal: Spacing.two, borderRadius: Spacing.three },
  answer: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.two },
  input: { flex: 1, borderRadius: Spacing.three, padding: Spacing.three, fontSize: 16, minHeight: 80 },
});
