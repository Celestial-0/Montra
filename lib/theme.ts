import { useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, type Theme } from 'expo-router/react-navigation';
import { useUniwind } from 'uniwind';
import { parseOklch, parseThemeOklch } from './oklch';

/**
 * Montra Official OKLCH Psychological Trust Palette
 * 100% OKLCH format for perceptual uniformity across displays.
 *
 * Core Tokens:
 * - Charcoal Black: oklch(0.177 0.001 240) [#121212]
 * - Deep Forest: oklch(0.274 0.046 145) [#162B1D]
 * - Ivory: oklch(0.972 0.008 75) [#FAF5F0]
 * - Soft Fog Gray: oklch(0.916 0.007 230) [#E1E5E8]
 */
export const OKLCH_THEME = {
  light: {
    background: 'oklch(0.972 0.008 75)',           /* Ivory */
    foreground: 'oklch(0.177 0.001 240)',          /* Charcoal Black */
    card: 'oklch(1 0 0)',                          /* Pure White */
    cardForeground: 'oklch(0.177 0.001 240)',
    popover: 'oklch(1 0 0)',
    popoverForeground: 'oklch(0.177 0.001 240)',
    primary: 'oklch(0.274 0.046 145)',             /* Deep Forest */
    primaryForeground: 'oklch(0.972 0.008 75)',    /* Ivory */
    secondary: 'oklch(0.940 0.010 75)',            /* Muted Ivory */
    secondaryForeground: 'oklch(0.177 0.001 240)',
    muted: 'oklch(0.940 0.010 75)',
    mutedForeground: 'oklch(0.480 0.012 230)',     /* Fog Slate */
    accent: 'oklch(0.910 0.012 75)',               /* Sand Accent */
    accentForeground: 'oklch(0.177 0.001 240)',
    destructive: 'oklch(0.550 0.180 20)',          /* Mindful Crimson */
    border: 'oklch(0.916 0.007 230)',              /* Soft Fog Gray */
    input: 'oklch(0.916 0.007 230)',
    ring: 'oklch(0.274 0.046 145)',
    radius: '0.875rem',
    // Semantic Accents
    income: 'oklch(0.500 0.150 150)',              /* Deep Forest Mint */
    expense: 'oklch(0.550 0.180 20)',              /* Mindful Crimson */
    transfer: 'oklch(0.500 0.080 230)',            /* Fog Slate */
    warning: 'oklch(0.640 0.140 75)',              /* Golden Amber */
    // Analytical Spectrum
    chart1: 'oklch(0.274 0.046 145)',              /* Deep Forest */
    chart2: 'oklch(0.500 0.150 150)',              /* Forest Mint */
    chart3: 'oklch(0.640 0.140 75)',               /* Golden Amber */
    chart4: 'oklch(0.550 0.180 20)',               /* Mindful Crimson */
    chart5: 'oklch(0.500 0.080 230)',              /* Fog Slate */
  },
  dark: {
    background: 'oklch(0.177 0.001 240)',          /* Charcoal Black */
    foreground: 'oklch(0.972 0.008 75)',           /* Ivory */
    card: 'oklch(0.210 0.008 145)',                /* Charcoal Dark Card */
    cardForeground: 'oklch(0.972 0.008 75)',
    popover: 'oklch(0.210 0.008 145)',
    popoverForeground: 'oklch(0.972 0.008 75)',
    primary: 'oklch(0.972 0.008 75)',              /* Ivory */
    primaryForeground: 'oklch(0.177 0.001 240)',   /* Charcoal Black */
    secondary: 'oklch(0.250 0.010 145)',           /* Secondary Dark Surface */
    secondaryForeground: 'oklch(0.972 0.008 75)',
    muted: 'oklch(0.235 0.008 145)',               /* Muted Dark Charcoal */
    mutedForeground: 'oklch(0.720 0.008 230)',     /* Muted Fog Gray */
    accent: 'oklch(0.280 0.012 145)',              /* Accent Dark */
    accentForeground: 'oklch(0.972 0.008 75)',
    destructive: 'oklch(0.660 0.180 20)',          /* Mindful Crimson */
    border: 'oklch(0.280 0.012 145)',              /* Dark Hairline Border */
    input: 'oklch(0.280 0.012 145)',
    ring: 'oklch(0.972 0.008 75)',
    radius: '0.875rem',
    // Semantic Accents
    income: 'oklch(0.720 0.160 150)',              /* Deep Forest Mint */
    expense: 'oklch(0.660 0.180 20)',              /* Mindful Crimson */
    transfer: 'oklch(0.680 0.080 230)',            /* Fog Slate */
    warning: 'oklch(0.780 0.140 75)',              /* Golden Amber */
    // Analytical Spectrum
    chart1: 'oklch(0.720 0.160 150)',              /* Forest Mint */
    chart2: 'oklch(0.916 0.007 230)',              /* Fog Gray */
    chart3: 'oklch(0.780 0.140 75)',               /* Golden Amber */
    chart4: 'oklch(0.660 0.180 20)',               /* Mindful Crimson */
    chart5: 'oklch(0.680 0.080 230)',              /* Fog Slate */
  },
};

export const THEME = parseThemeOklch(OKLCH_THEME);

export const NAV_THEME: Record<'light' | 'dark', Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};

export function useAppTheme() {
  const { theme, hasAdaptiveThemes } = useUniwind();
  const systemScheme = useColorScheme();

  const isSystem = Boolean(hasAdaptiveThemes) || theme === undefined;
  const resolved: 'light' | 'dark' = isSystem
    ? systemScheme === 'dark'
      ? 'dark'
      : 'light'
    : theme === 'dark'
    ? 'dark'
    : 'light';

  return {
    themeName: (isSystem ? 'system' : theme) as 'light' | 'dark' | 'system',
    hasAdaptiveThemes: Boolean(hasAdaptiveThemes),
    resolvedTheme: resolved,
    isDark: resolved === 'dark',
    oklch: OKLCH_THEME[resolved],
    colors: THEME[resolved],
    parseColor: parseOklch,
  };
}