/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://unistyl.es/), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1B1D1C',
    background: '#FAF8F4',
    backgroundElement: '#F0EDE6',
    backgroundSelected: '#E3DFD5',
    textSecondary: '#5F625F',
    accent: '#2F6F4F',
    onAccent: '#FFFFFF',
    danger: '#B4442F',
    sketch: '#D9D6CF',
  },
  dark: {
    text: '#F2F1EE',
    background: '#121413',
    backgroundElement: '#1E2120',
    backgroundSelected: '#2A2E2C',
    textSecondary: '#A9ADA9',
    accent: '#6FBF8F',
    onAccent: '#0D1A13',
    danger: '#E07A65',
    sketch: '#3A3D3B',
  },
} as const;

/** Full-colour tone for each life area's vision panel. */
export const AreaColors: Record<string, string> = {
  Body: '#E07A5F',
  'Time & attention': '#3D8BD9',
  Relationships: '#E0A526',
  Other: '#8A6FD6',
};

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
