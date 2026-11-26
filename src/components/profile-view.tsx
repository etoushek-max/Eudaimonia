import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';

import { ThemedText } from './themed-text';

type Item =
  | { kind: 'title' | 'section' | 'sub' | 'text' | 'bullet'; text: string }
  | { kind: 'habit'; name: string; details: string };

/** Turn the Vision Profile's simple markdown (headings, bullets, habits table) into display items. */
function toItems(profile: string): Item[] {
  const items: Item[] = [];
  let headerSeen = false;
  for (const raw of profile.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('### ')) items.push({ kind: 'sub', text: line.slice(4) });
    else if (line.startsWith('## ')) {
      headerSeen = false;
      items.push({ kind: 'section', text: line.slice(3).toUpperCase() });
    } else if (line.startsWith('# ')) items.push({ kind: 'title', text: line.slice(2) });
    else if (line.startsWith('|')) {
      const cells = line.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      if (cells.every((c) => /^:?-*:?$/.test(c))) continue;
      if (!headerSeen) {
        headerSeen = true;
        continue;
      }
      const [name, ...rest] = cells;
      items.push({ kind: 'habit', name, details: rest.filter(Boolean).join(' · ') });
    } else if (/^[-*] /.test(line)) items.push({ kind: 'bullet', text: line.slice(2) });
    else items.push({ kind: 'text', text: line });
  }
  return items;
}

export function ProfileView({ profile }: { profile: string }) {
  return (
    <View style={styles.wrap}>
      {toItems(profile).map((item, i) => {
        switch (item.kind) {
          case 'title':
            return (
              <ThemedText key={i} type="smallBold" style={styles.title}>
                {item.text}
              </ThemedText>
            );
          case 'section':
            return (
              <ThemedText key={i} type="smallBold" themeColor="textSecondary" style={styles.section}>
                {item.text}
              </ThemedText>
            );
          case 'sub':
            return (
              <ThemedText key={i} type="smallBold" style={styles.sub}>
                {item.text}
              </ThemedText>
            );
          case 'habit':
            return (
              <ThemedText key={i}>
                • <ThemedText type="smallBold">{item.name}</ThemedText>
                {item.details ? ` — ${item.details}` : ''}
              </ThemedText>
            );
          case 'bullet':
            return <ThemedText key={i}>• {item.text}</ThemedText>;
          default:
            return <ThemedText key={i}>{item.text}</ThemedText>;
        }
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.one },
  title: { fontSize: 18, lineHeight: 26 },
  section: { marginTop: Spacing.three, letterSpacing: 0.5 },
  sub: { marginTop: Spacing.two },
});
