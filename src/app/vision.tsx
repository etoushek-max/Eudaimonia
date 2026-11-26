import { router } from 'expo-router';
import { View } from 'react-native';

import { LifeMapWheel } from '@/components/life-map';
import { ProfileView } from '@/components/profile-view';
import { ThemedText } from '@/components/themed-text';
import { Button, Card, confirm, Row, Screen } from '@/components/ui';
import { INFLUENCES, styleSummary } from '@/lib/influences';
import { useStore } from '@/state/store';

const TONE_NAMES = { gentle: 'Gentle', balanced: 'Balanced', direct: 'Straight-talking' } as const;

export default function VisionScreen() {
  const { data, loaded, resetAll } = useStore();
  if (!loaded) return <Screen>{null}</Screen>;
  const latest = data.lifeMaps.at(-1);
  const previous = data.lifeMaps.at(-2);

  return (
    <Screen>
      <ThemedText type="subtitle">My vision</ThemedText>

      <Card>
        <ThemedText type="smallBold">My life map</ThemedText>
        {latest ? (
          <>
            <View style={{ alignItems: 'center' }}>
              <LifeMapWheel scores={latest.scores} focus={latest.focus} previous={previous?.scores} />
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              Taken {new Date(latest.takenAt).toLocaleDateString()}
              {previous ? ` · dashed line: ${new Date(previous.takenAt).toLocaleDateString()}` : ''}. Gold = where you
              want change. Retake it every month or so to see how your life is shifting.
            </ThemedText>
            <Button
              label="Update my life map"
              kind="secondary"
              onPress={() => router.navigate({ pathname: '/coach', params: { lifemap: 'retake' } })}
            />
          </>
        ) : (
          <>
            <ThemedText type="small" themeColor="textSecondary">
              Rate every part of your life in two minutes, and see it at a glance.
            </ThemedText>
            <Button
              label="Take my life map"
              kind="secondary"
              onPress={() => router.navigate({ pathname: '/coach', params: { lifemap: 'retake' } })}
            />
          </>
        )}
      </Card>

      <Card>
        <ThemedText type="smallBold">My influences</ThemedText>
        {data.influences ? (
          <>
            <ThemedText type="small">
              Love:{' '}
              {INFLUENCES.filter((i) => data.influences?.ratings[i.id] === 'love')
                .map((i) => `${i.symbol} ${i.name}`)
                .join(', ') || '—'}
            </ThemedText>
            <ThemedText type="small">
              Not for me:{' '}
              {INFLUENCES.filter((i) => data.influences?.ratings[i.id] === 'no')
                .map((i) => i.name)
                .join(', ') || '—'}
            </ThemedText>
            {data.influences.others ? <ThemedText type="small">Also: {data.influences.others}</ThemedText> : null}
            <ThemedText type="small">Coach tone: {TONE_NAMES[data.influences.tone]}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {styleSummary(data.influences.ratings)}
            </ThemedText>
          </>
        ) : (
          <ThemedText type="small" themeColor="textSecondary">
            Tell your coach who you already learn from, so it can speak your language.
          </ThemedText>
        )}
        <Button
          label={data.influences ? 'Update my influences' : 'Choose my influences'}
          kind="secondary"
          onPress={() => router.navigate({ pathname: '/coach', params: { influences: 'edit' } })}
        />
      </Card>

      {data.profile ? (
        <>
          {data.profileUpdatedAt && (
            <ThemedText type="small" themeColor="textSecondary">
              Last updated {new Date(data.profileUpdatedAt).toLocaleDateString()}. Your coach updates this after your
              first session and each weekly review.
            </ThemedText>
          )}
          <Card>
            <ProfileView profile={data.profile} />
          </Card>
          <Button label="Talk to my coach about my vision" onPress={() => router.navigate('/coach')} />
        </>
      ) : (
        <Card>
          <ThemedText>
            Your Vision Profile appears here after your first session: your eudaimonia in your own words, your vision
            picture, and your active habits.
          </ThemedText>
          <Button label="Start my first session" onPress={() => router.navigate('/coach')} />
        </Card>
      )}

      <Card>
        <ThemedText type="smallBold">Your data</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          In this prototype everything is stored only on this device. Your conversations and voice notes are sent to an
          AI model (Google Gemini for now) to generate the coach’s replies.
        </ThemedText>
        <Row>
          <Button
            label="Delete all my data"
            kind="danger"
            small
            onPress={() =>
              confirm(
                'Delete everything?',
                'Your vision, habits, history and conversations will be permanently deleted from this device.',
                resetAll,
              )
            }
          />
        </Row>
      </Card>
    </Screen>
  );
}
