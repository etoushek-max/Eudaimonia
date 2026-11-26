import { router } from 'expo-router';

import { ProfileView } from '@/components/profile-view';
import { ThemedText } from '@/components/themed-text';
import { Button, Card, confirm, Row, Screen } from '@/components/ui';
import { useStore } from '@/state/store';

export default function VisionScreen() {
  const { data, loaded, resetAll } = useStore();
  if (!loaded) return <Screen>{null}</Screen>;

  return (
    <Screen>
      <ThemedText type="subtitle">My vision</ThemedText>

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
          In this prototype everything is stored only on this device. Your conversations are sent to Claude to
          generate the coach’s replies.
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
