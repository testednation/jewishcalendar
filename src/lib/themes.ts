import React from 'react';

export interface ThemeTokens {
  background: string;
  card: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  primary: string;
  primaryForeground: string;
  accent: string;
  accentForeground: string;
  secondary: string;
  secondaryForeground: string;
  chabad: string;
  candle: string;
  ring: string;
  font?: 'sans' | 'serif';
}

export interface CalendarTheme {
  id: string;
  name: string;
  description?: string;
  custom?: boolean;
  tokens: ThemeTokens;
}

export interface CustomThemeDraft {
  id: string;
  name: string;
  paper: string;
  card: string;
  accent: string;
  chabad: string;
  candle: string;
  font: 'sans' | 'serif';
}

function hexToRgb(hex: string): [number, number, number] {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(clean, 16);
  if (Number.isNaN(num)) return [0, 0, 0];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
  );
}

function mixColors(hexA: string, hexB: string, ratio: number): string {
  const [r1, g1, b1] = hexToRgb(hexA);
  const [r2, g2, b2] = hexToRgb(hexB);
  return rgbToHex(r1 + (r2 - r1) * ratio, g1 + (g2 - g1) * ratio, b1 + (b2 - b1) * ratio);
}

function getLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

export const BUILTIN_THEMES: CalendarTheme[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'The default — crisp white and refined blue.',
    tokens: {
      background: '#fafbfd',
      card: '#ffffff',
      foreground: '#1c2130',
      muted: '#f1f3f8',
      mutedForeground: '#5c667d',
      border: '#e4e8f0',
      primary: '#3a5bd9',
      primaryForeground: '#f8faff',
      accent: '#eef1f8',
      accentForeground: '#262c3e',
      secondary: '#f3f5fa',
      secondaryForeground: '#2e3548',
      chabad: '#8f6211',
      candle: '#b05a17',
      ring: '#5a7df0',
    },
  },
  {
    id: 'ivory',
    name: 'Ivory',
    description: 'Warm parchment with sage and gold — a traditional feel.',
    tokens: {
      background: '#f7f2e7',
      card: '#fffdf6',
      foreground: '#33291c',
      muted: '#efe8d6',
      mutedForeground: '#786951',
      border: '#e5dac0',
      primary: '#4d6143',
      primaryForeground: '#f4f8ef',
      accent: '#eee5d0',
      accentForeground: '#3a3321',
      secondary: '#f2ecdc',
      secondaryForeground: '#453d2b',
      chabad: '#9a6a12',
      candle: '#b0671a',
      ring: '#6b7f5d',
      font: 'serif',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Deep navy with soft silver-blue accents.',
    tokens: {
      background: '#0e1420',
      card: '#151d2d',
      foreground: '#e7ecf6',
      muted: '#1b2434',
      mutedForeground: '#8b96ad',
      border: '#28344a',
      primary: '#7ea2f2',
      primaryForeground: '#0d1530',
      accent: '#1f2a3e',
      accentForeground: '#e7ecf6',
      secondary: '#222d42',
      secondaryForeground: '#dbe2f0',
      chabad: '#e0b35a',
      candle: '#f0a35e',
      ring: '#7ea2f2',
    },
  },
  {
    id: 'burgundy',
    name: 'Burgundy',
    description: 'Deep wine on warm cream.',
    tokens: {
      background: '#faf6f3',
      card: '#fffdfb',
      foreground: '#2a2025',
      muted: '#f2eae8',
      mutedForeground: '#7b6870',
      border: '#e7dbd9',
      primary: '#8e2f43',
      primaryForeground: '#fdf2f4',
      accent: '#f2e7e5',
      accentForeground: '#3b262d',
      secondary: '#f5edeb',
      secondaryForeground: '#483039',
      chabad: '#9a6a12',
      candle: '#b0671a',
      ring: '#a85063',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Evergreen on soft paper.',
    tokens: {
      background: '#f3f7f2',
      card: '#ffffff',
      foreground: '#212b23',
      muted: '#e8efe6',
      mutedForeground: '#617062',
      border: '#d9e4d6',
      primary: '#2f6b4f',
      primaryForeground: '#effaf2',
      accent: '#e5eee4',
      accentForeground: '#263528',
      secondary: '#edf3ea',
      secondaryForeground: '#33453a',
      chabad: '#9a6a12',
      candle: '#b0671a',
      ring: '#3f8a64',
    },
  },
  {
    id: 'sapphire',
    name: 'Sapphire',
    description: 'Classic royal blue with gold — the classic luach look.',
    tokens: {
      background: '#f7f9fd',
      card: '#ffffff',
      foreground: '#1b2333',
      muted: '#edf1f9',
      mutedForeground: '#57657e',
      border: '#dbe3f0',
      primary: '#2447b4',
      primaryForeground: '#f4f7ff',
      accent: '#e8eefb',
      accentForeground: '#222c4a',
      secondary: '#f0f3fb',
      secondaryForeground: '#2c3554',
      chabad: '#9a6a12',
      candle: '#b0671a',
      ring: '#4a6fe0',
      font: 'serif',
    },
  },
  {
    id: 'aqua',
    name: 'Aqua Glass',
    description: 'Frosted aqua layers with deep teal ink.',
    tokens: {
      background: '#e6f3f6',
      card: '#f6fbfd',
      foreground: '#0d3540',
      muted: '#dceef2',
      mutedForeground: '#466f7c',
      border: '#c3e0e8',
      primary: '#0d7d95',
      primaryForeground: '#f0fbfd',
      accent: '#e1f1f5',
      accentForeground: '#104049',
      secondary: '#e7f3f6',
      secondaryForeground: '#124049',
      chabad: '#9a6a12',
      candle: '#b0671a',
      ring: '#1a9cb4',
    },
  },
  {
    id: 'lagoon',
    name: 'Lagoon Glass',
    description: 'Deep teal water with bright aqua glass.',
    tokens: {
      background: '#08222b',
      card: '#10303c',
      foreground: '#dff2f7',
      muted: '#153a47',
      mutedForeground: '#8fb4c0',
      border: '#1f4e5e',
      primary: '#5fd0e8',
      primaryForeground: '#06222b',
      accent: '#143f4d',
      accentForeground: '#dff2f7',
      secondary: '#123844',
      secondaryForeground: '#cfe8f0',
      chabad: '#dcc06a',
      candle: '#f0a35e',
      ring: '#5fd0e8',
    },
  },
  {
    id: 'graphite',
    name: 'Graphite Glass',
    description: 'Dark frosted slate with a cool silver-blue sheen.',
    tokens: {
      background: '#111417',
      card: '#1b2126',
      foreground: '#e9edf1',
      muted: '#23292f',
      mutedForeground: '#9ba9b3',
      border: '#2d353c',
      primary: '#8ab6d6',
      primaryForeground: '#0f1418',
      accent: '#242b31',
      accentForeground: '#e9edf1',
      secondary: '#20272d',
      secondaryForeground: '#dde3e9',
      chabad: '#d9b25c',
      candle: '#e8985a',
      ring: '#8ab6d6',
    },
  },
  {
    id: 'blush',
    name: 'Blush',
    description: 'Soft rose glass with deep rose accents on warm white.',
    tokens: {
      background: '#f9f3f5',
      card: '#fffdfd',
      foreground: '#33222a',
      muted: '#f4e8ec',
      mutedForeground: '#7c5d69',
      border: '#ecdbe2',
      primary: '#a94d68',
      primaryForeground: '#fef3f6',
      accent: '#f5e8ec',
      accentForeground: '#3c242e',
      secondary: '#f6eaee',
      secondaryForeground: '#462d38',
      chabad: '#9a6a12',
      candle: '#b0671a',
      ring: '#c07089',
    },
  },
];

export function buildCustomTheme(draft: CustomThemeDraft): CalendarTheme {
  const isDarkPaper = getLuminance(draft.paper) < 0.45;
  const fg = isDarkPaper ? '#e8edf7' : '#1b2233';
  const blend = (r: number) => mixColors(draft.paper, fg, r);
  const isDarkAccent = getLuminance(draft.accent) < 0.45;

  return {
    id: draft.id,
    name: draft.name.trim() || 'Custom theme',
    custom: true,
    tokens: {
      background: draft.paper,
      card: draft.card,
      foreground: fg,
      muted: blend(isDarkPaper ? 0.12 : 0.05),
      mutedForeground: blend(0.6),
      border: blend(isDarkPaper ? 0.18 : 0.14),
      primary: draft.accent,
      primaryForeground: isDarkAccent ? '#f5f7ff' : '#1b2233',
      accent: blend(isDarkPaper ? 0.08 : 0.04),
      accentForeground: fg,
      secondary: blend(isDarkPaper ? 0.06 : 0.03),
      secondaryForeground: fg,
      chabad: draft.chabad,
      candle: draft.candle,
      ring: draft.accent,
      font: draft.font,
    },
  };
}

export function resolveTheme(themeId: string, customThemes: CustomThemeDraft[] = []): CalendarTheme {
  const custom = customThemes.find((t) => t.id === themeId);
  if (custom) return buildCustomTheme(custom);
  return BUILTIN_THEMES.find((t) => t.id === themeId) ?? BUILTIN_THEMES[0];
}

export function getThemeStyleVars(theme: CalendarTheme): React.CSSProperties {
  const t = theme.tokens;
  const vars: Record<string, string> = {
    '--background': t.background,
    '--card': t.card,
    '--foreground': t.foreground,
    '--muted': t.muted,
    '--muted-foreground': t.mutedForeground,
    '--border': t.border,
    '--primary': t.primary,
    '--primary-foreground': t.primaryForeground,
    '--accent': t.accent,
    '--accent-foreground': t.accentForeground,
    '--secondary': t.secondary,
    '--secondary-foreground': t.secondaryForeground,
    '--chabad': t.chabad,
    '--candle': t.candle,
    '--ring': t.ring,
    '--custom-font-display':
      t.font === 'serif'
        ? '"Fraunces", Georgia, "Times New Roman", serif'
        : '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif',
  };
  return vars as React.CSSProperties;
}
