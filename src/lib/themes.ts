import React from 'react';

export type ThemeCategory =
  | 'traditional'
  | 'minimalist'
  | 'high-contrast'
  | 'dark'
  | 'custom';

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
  gridStrokeWidth?: '1px' | '1.5px' | '2px';
}

export interface CalendarTheme {
  id: string;
  name: string;
  category: ThemeCategory;
  badgeLabel?: string;
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

export interface PaletteOverrides {
  primary?: string;
  chabad?: string;
  candle?: string;
  paper?: string;
  font?: 'sans' | 'serif';
  highContrastBorders?: boolean;
  printInkSaver?: boolean;
}

export interface PrimaryPalettePreset {
  id: string;
  name: string;
  primary: string;
  chabad: string;
  candle: string;
}

export const PRIMARY_PALETTE_PRESETS: PrimaryPalettePreset[] = [
  {
    id: 'royal-sapphire',
    name: 'Royal Sapphire',
    primary: '#2447b4',
    chabad: '#9a6a12',
    candle: '#b0671a',
  },
  {
    id: 'kiddush-burgundy',
    name: 'Kiddush Wine',
    primary: '#8e2f43',
    chabad: '#9a6a12',
    candle: '#b55419',
  },
  {
    id: 'jerusalem-gold',
    name: 'Jerusalem Gold',
    primary: '#8a5a10',
    chabad: '#5c3d08',
    candle: '#b45309',
  },
  {
    id: 'etrog-emerald',
    name: 'Etrog Emerald',
    primary: '#1f6347',
    chabad: '#8f6211',
    candle: '#b05a17',
  },
  {
    id: 'minimal-charcoal',
    name: 'Archival Ink',
    primary: '#18181b',
    chabad: '#52525b',
    candle: '#71717a',
  },
  {
    id: 'high-contrast-cobalt',
    name: 'Bold Cobalt',
    primary: '#0028a8',
    chabad: '#7c2d12',
    candle: '#9a3412',
  },
  {
    id: 'techelet-teal',
    name: 'Techelet Teal',
    primary: '#0d6e8a',
    chabad: '#8f6211',
    candle: '#b45309',
  },
  {
    id: 'pomegranate-crimson',
    name: 'Pomegranate',
    primary: '#991b1b',
    chabad: '#92400e',
    candle: '#b45309',
  },
  {
    id: 'tzfat-indigo',
    name: 'Tzfat Indigo',
    primary: '#3730a3',
    chabad: '#9a6a12',
    candle: '#c2410c',
  },
  {
    id: 'galilee-olive',
    name: 'Galilee Olive',
    primary: '#3f6212',
    chabad: '#854d0e',
    candle: '#b45309',
  },
  {
    id: 'desert-terracotta',
    name: 'Terracotta',
    primary: '#9a3412',
    chabad: '#1e3a8a',
    candle: '#b45309',
  },
  {
    id: 'royal-plum',
    name: 'Malkhut Plum',
    primary: '#6b21a8',
    chabad: '#a16207',
    candle: '#c2410c',
  },
];

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
  // =========================================================================
  // TRADITIONAL THEMES (8)
  // =========================================================================
  {
    id: 'sapphire',
    name: 'Sapphire Heritage',
    category: 'traditional',
    badgeLabel: 'Traditional',
    description: 'Classic royal blue with Jerusalem gold and serif headings — the classic communal luach.',
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
    id: 'ivory',
    name: 'Ivory Parchment',
    category: 'traditional',
    badgeLabel: 'Traditional',
    description: 'Warm klaf parchment with olive-sage and antique gold — timeless synagogue aesthetic.',
    tokens: {
      background: '#f7f2e7',
      card: '#fffdf6',
      foreground: '#33291c',
      muted: '#efe8d6',
      mutedForeground: '#786951',
      border: '#dfd2b5',
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
    id: 'burgundy',
    name: 'Burgundy Kiddush',
    category: 'traditional',
    badgeLabel: 'Traditional',
    description: 'Deep Kiddush wine and warm brass on soft cream paper.',
    tokens: {
      background: '#faf6f3',
      card: '#fffdfb',
      foreground: '#2a2025',
      muted: '#f2eae8',
      mutedForeground: '#7b6870',
      border: '#e5d5d2',
      primary: '#8e2f43',
      primaryForeground: '#fdf2f4',
      accent: '#f2e7e5',
      accentForeground: '#3b262d',
      secondary: '#f5edeb',
      secondaryForeground: '#483039',
      chabad: '#9a6a12',
      candle: '#b0671a',
      ring: '#a85063',
      font: 'serif',
    },
  },
  {
    id: 'jerusalem-stone',
    name: 'Jerusalem Stone',
    category: 'traditional',
    badgeLabel: 'Traditional',
    description: 'Golden limestone hues with warm copper-amber and deep Judean slate.',
    tokens: {
      background: '#f8f4ec',
      card: '#fffcf7',
      foreground: '#2c251d',
      muted: '#efe8da',
      mutedForeground: '#6e6150',
      border: '#e2d6c1',
      primary: '#8a5219',
      primaryForeground: '#fffaf2',
      accent: '#f0e7d5',
      accentForeground: '#362c20',
      secondary: '#f3ece0',
      secondaryForeground: '#3e3326',
      chabad: '#1e4682',
      candle: '#b45309',
      ring: '#a66826',
      font: 'serif',
    },
  },
  {
    id: 'techelet-crown',
    name: 'Techelet & Crown Gold',
    category: 'traditional',
    badgeLabel: 'Traditional',
    description: 'Ancient ritual sea-blue techelet with gilded crown gold on warm archival cream.',
    tokens: {
      background: '#f8f7f2',
      card: '#fffefa',
      foreground: '#182832',
      muted: '#ecebe2',
      mutedForeground: '#536773',
      border: '#d8d7c8',
      primary: '#0b5578',
      primaryForeground: '#f2fafe',
      accent: '#e3eff5',
      accentForeground: '#143342',
      secondary: '#f1f0e8',
      secondaryForeground: '#243a47',
      chabad: '#a16207',
      candle: '#b45309',
      ring: '#0284c7',
      font: 'serif',
    },
  },
  {
    id: 'vilna-classic',
    name: 'Vilna Shas Press',
    category: 'traditional',
    badgeLabel: 'Traditional',
    description: 'Inspired by classic Vilna Talmud volumes with warm rag paper, sepia ink, and rubric red.',
    tokens: {
      background: '#f4ecdc',
      card: '#fcf8ef',
      foreground: '#2b1d12',
      muted: '#eae0cb',
      mutedForeground: '#6e5744',
      border: '#d6c6a9',
      primary: '#7f1d1d',
      primaryForeground: '#fef2f2',
      accent: '#ece0c8',
      accentForeground: '#362214',
      secondary: '#efe5d2',
      secondaryForeground: '#3f2919',
      chabad: '#78350f',
      candle: '#9a3412',
      ring: '#991b1b',
      font: 'serif',
    },
  },
  {
    id: 'pomegranate-honey',
    name: 'Pomegranate & Honey',
    category: 'traditional',
    badgeLabel: 'Traditional',
    description: 'Festive Tishrei palette of deep pomegranate ruby and golden honey on warm silk paper.',
    tokens: {
      background: '#fdf8f5',
      card: '#ffffff',
      foreground: '#2d181c',
      muted: '#f6ebe7',
      mutedForeground: '#78565d',
      border: '#ead6d0',
      primary: '#9f1239',
      primaryForeground: '#fff1f2',
      accent: '#fce7eb',
      accentForeground: '#4c0519',
      secondary: '#f8efec',
      secondaryForeground: '#451a23',
      chabad: '#b45309',
      candle: '#c2410c',
      ring: '#be123c',
      font: 'serif',
    },
  },
  {
    id: 'eastern-parkway',
    name: '770 Brownstone',
    category: 'traditional',
    badgeLabel: 'Traditional',
    description: 'Warm Crown Heights terracotta brick paired with royal sapphire and brass.',
    tokens: {
      background: '#faf6f0',
      card: '#fffdfa',
      foreground: '#291d17',
      muted: '#f1e9de',
      mutedForeground: '#6e594d',
      border: '#e2d5c4',
      primary: '#85321b',
      primaryForeground: '#fff7f5',
      accent: '#f3e5dc',
      accentForeground: '#3b2119',
      secondary: '#f5ede3',
      secondaryForeground: '#42281e',
      chabad: '#1d4ed8',
      candle: '#b45309',
      ring: '#9a3412',
      font: 'serif',
    },
  },

  // =========================================================================
  // MINIMALIST THEMES (8)
  // =========================================================================
  {
    id: 'modern',
    name: 'Modern Studio',
    category: 'minimalist',
    badgeLabel: 'Minimalist',
    description: 'Crisp gallery white with refined cobalt blue and clean geometric sans-serif.',
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
      font: 'sans',
    },
  },
  {
    id: 'minimalist-mono',
    name: 'Pure Minimalist',
    category: 'minimalist',
    badgeLabel: 'Minimalist',
    description: 'Architectural monochrome ink on pure white paper — whisper-quiet and ink-friendly.',
    tokens: {
      background: '#fafafa',
      card: '#ffffff',
      foreground: '#18181b',
      muted: '#f4f4f5',
      mutedForeground: '#52525b',
      border: '#e4e4e7',
      primary: '#18181b',
      primaryForeground: '#ffffff',
      accent: '#f4f4f5',
      accentForeground: '#18181b',
      secondary: '#f4f4f5',
      secondaryForeground: '#27272a',
      chabad: '#3f3f46',
      candle: '#71717a',
      ring: '#3f3f46',
      font: 'sans',
    },
  },
  {
    id: 'minimalist-linen',
    name: 'Nordic Linen',
    category: 'minimalist',
    badgeLabel: 'Minimalist',
    description: 'Soft warm alabaster paper with muted stone ink for modern home framing.',
    tokens: {
      background: '#f6f5f2',
      card: '#fcfbf9',
      foreground: '#262522',
      muted: '#eeece7',
      mutedForeground: '#6b6860',
      border: '#e2dfd8',
      primary: '#44403c',
      primaryForeground: '#fafaf9',
      accent: '#eceae4',
      accentForeground: '#292524',
      secondary: '#f0eee9',
      secondaryForeground: '#44403c',
      chabad: '#78552b',
      candle: '#9a5b25',
      ring: '#57534e',
      font: 'sans',
    },
  },
  {
    id: 'forest',
    name: 'Botanical Sage',
    category: 'minimalist',
    badgeLabel: 'Minimalist',
    description: 'Calm evergreen ink on unweighted archival cotton paper.',
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
      font: 'sans',
    },
  },
  {
    id: 'aqua',
    name: 'Kinneret Mist',
    category: 'minimalist',
    badgeLabel: 'Minimalist',
    description: 'Crisp Sea of Galilee teal ink on bright mist-tinted paper.',
    tokens: {
      background: '#eff7f9',
      card: '#ffffff',
      foreground: '#0d3540',
      muted: '#e1f0f4',
      mutedForeground: '#466f7c',
      border: '#cbe3ea',
      primary: '#0d7d95',
      primaryForeground: '#f0fbfd',
      accent: '#e1f1f5',
      accentForeground: '#104049',
      secondary: '#e7f3f6',
      secondaryForeground: '#124049',
      chabad: '#9a6a12',
      candle: '#b0671a',
      ring: '#1a9cb4',
      font: 'sans',
    },
  },
  {
    id: 'tel-aviv-bauhaus',
    name: 'Tel Aviv Bauhaus',
    category: 'minimalist',
    badgeLabel: 'Minimalist',
    description: 'Sun-washed white stucco with Mediterranean cerulean and warm terracotta.',
    tokens: {
      background: '#f9f8f5',
      card: '#ffffff',
      foreground: '#1e242b',
      muted: '#f0eee9',
      mutedForeground: '#5c6670',
      border: '#e2dfd7',
      primary: '#0369a1',
      primaryForeground: '#f0f9ff',
      accent: '#e0f2fe',
      accentForeground: '#0c4a6e',
      secondary: '#f2f0eb',
      secondaryForeground: '#26303a',
      chabad: '#b45309',
      candle: '#c2410c',
      ring: '#0284c7',
      font: 'sans',
    },
  },
  {
    id: 'galilee-olive',
    name: 'Galilee Olive & Fig',
    category: 'minimalist',
    badgeLabel: 'Minimalist',
    description: 'Organic olive grove greens paired with deep fig-plum highlights on soft stone.',
    tokens: {
      background: '#f5f6f1',
      card: '#fdfdfb',
      foreground: '#23291c',
      muted: '#eaede2',
      mutedForeground: '#5b6450',
      border: '#dadfd0',
      primary: '#3f6212',
      primaryForeground: '#f7fee7',
      accent: '#ecfccb',
      accentForeground: '#365314',
      secondary: '#eef1e6',
      secondaryForeground: '#2e3824',
      chabad: '#701a75',
      candle: '#b45309',
      ring: '#4d7c0f',
      font: 'sans',
    },
  },
  {
    id: 'judean-rose',
    name: 'Desert Rose & Clay',
    category: 'minimalist',
    badgeLabel: 'Minimalist',
    description: 'Warm Judean desert rose-sand with muted terracotta clay and bronze.',
    tokens: {
      background: '#fbf7f5',
      card: '#ffffff',
      foreground: '#2c201e',
      muted: '#f4ebe7',
      mutedForeground: '#755c56',
      border: '#e7d9d3',
      primary: '#881337',
      primaryForeground: '#fff1f2',
      accent: '#ffe4e6',
      accentForeground: '#4c0519',
      secondary: '#f7efec',
      secondaryForeground: '#3f2926',
      chabad: '#92400e',
      candle: '#c2410c',
      ring: '#9f1239',
      font: 'sans',
    },
  },

  // =========================================================================
  // HIGH-CONTRAST THEMES (4)
  // =========================================================================
  {
    id: 'high-contrast-print',
    name: 'High-Contrast Print',
    category: 'high-contrast',
    badgeLabel: 'High-Contrast',
    description: 'Pure white paper, jet-black grid borders, and ultra-crisp cobalt & crimson ink for maximum legibility.',
    tokens: {
      background: '#ffffff',
      card: '#ffffff',
      foreground: '#000000',
      muted: '#f0f2f5',
      mutedForeground: '#1f2937',
      border: '#111827',
      primary: '#0028a8',
      primaryForeground: '#ffffff',
      accent: '#e5edff',
      accentForeground: '#000000',
      secondary: '#f3f4f6',
      secondaryForeground: '#000000',
      chabad: '#7c2d12',
      candle: '#991b1b',
      ring: '#0028a8',
      font: 'sans',
      gridStrokeWidth: '1.5px',
    },
  },
  {
    id: 'high-contrast-gold',
    name: 'Bold Black & Gold',
    category: 'high-contrast',
    badgeLabel: 'High-Contrast',
    description: 'High-visibility ink with deep obsidian borders and rich bronze-gold highlights.',
    tokens: {
      background: '#ffffff',
      card: '#ffffff',
      foreground: '#09090b',
      muted: '#f4f4f5',
      mutedForeground: '#18181b',
      border: '#18181b',
      primary: '#09090b',
      primaryForeground: '#ffffff',
      accent: '#fef3c7',
      accentForeground: '#09090b',
      secondary: '#f4f4f5',
      secondaryForeground: '#09090b',
      chabad: '#92400e',
      candle: '#b45309',
      ring: '#92400e',
      font: 'serif',
      gridStrokeWidth: '1.5px',
    },
  },
  {
    id: 'high-contrast-emerald',
    name: 'Stark Emerald & Ink',
    category: 'high-contrast',
    badgeLabel: 'High-Contrast',
    description: 'High-definition 1.5px black rules with deep forest emerald and dark amber on pure white.',
    tokens: {
      background: '#ffffff',
      card: '#ffffff',
      foreground: '#05150e',
      muted: '#eef5f1',
      mutedForeground: '#142920',
      border: '#0f172a',
      primary: '#065f46',
      primaryForeground: '#ffffff',
      accent: '#d1fae5',
      accentForeground: '#05150e',
      secondary: '#f1f5f9',
      secondaryForeground: '#05150e',
      chabad: '#78350f',
      candle: '#9a3412',
      ring: '#065f46',
      font: 'sans',
      gridStrokeWidth: '1.5px',
    },
  },
  {
    id: 'high-contrast-ruby',
    name: 'Editorial Ruby & Black',
    category: 'high-contrast',
    badgeLabel: 'High-Contrast',
    description: 'Bold newspaper-grade serif typography with 1.5px rules and crimson-ruby accents.',
    tokens: {
      background: '#ffffff',
      card: '#ffffff',
      foreground: '#09090b',
      muted: '#f5f5f5',
      mutedForeground: '#171717',
      border: '#171717',
      primary: '#991b1b',
      primaryForeground: '#ffffff',
      accent: '#fee2e2',
      accentForeground: '#09090b',
      secondary: '#f5f5f5',
      secondaryForeground: '#09090b',
      chabad: '#1e3a8a',
      candle: '#9a3412',
      ring: '#991b1b',
      font: 'serif',
      gridStrokeWidth: '1.5px',
    },
  },

  // =========================================================================
  // DARK / NIGHT THEMES (4)
  // =========================================================================
  {
    id: 'midnight',
    name: 'Midnight Sapphire',
    category: 'dark',
    badgeLabel: 'Dark',
    description: 'Deep navy night canvas with high-luminance silver-blue and gold zmanim.',
    tokens: {
      background: '#0b101b',
      card: '#121a2a',
      foreground: '#f8fafc',
      muted: '#1b263b',
      mutedForeground: '#cbd5e1',
      border: '#334155',
      primary: '#60a5fa',
      primaryForeground: '#090d16',
      accent: '#1e293b',
      accentForeground: '#f8fafc',
      secondary: '#1e293b',
      secondaryForeground: '#f1f5f9',
      chabad: '#fbbf24',
      candle: '#fb923c',
      ring: '#60a5fa',
      font: 'sans',
    },
  },
  {
    id: 'tzfat-mystic',
    name: 'Tzfat Mystic Night',
    category: 'dark',
    badgeLabel: 'Dark',
    description: 'Deep Galilean indigo-violet sky with luminous techelet cyan and warm candle gold.',
    tokens: {
      background: '#0d0c1d',
      card: '#16142c',
      foreground: '#f5f3ff',
      muted: '#211e40',
      mutedForeground: '#c4b5fd',
      border: '#363163',
      primary: '#38bdf8',
      primaryForeground: '#082f49',
      accent: '#252147',
      accentForeground: '#f5f3ff',
      secondary: '#1e1b38',
      secondaryForeground: '#ede9fe',
      chabad: '#facc15',
      candle: '#fb923c',
      ring: '#38bdf8',
      font: 'serif',
    },
  },
  {
    id: 'obsidian-gold',
    name: 'Obsidian & Gold Leaf',
    category: 'dark',
    badgeLabel: 'Dark',
    description: 'Velvet charcoal gallery backdrop with burnished 24k gold leaf and warm amber.',
    tokens: {
      background: '#0c0c0e',
      card: '#151519',
      foreground: '#fafafa',
      muted: '#222228',
      mutedForeground: '#d4d4d8',
      border: '#34343d',
      primary: '#eab308',
      primaryForeground: '#18181b',
      accent: '#27272a',
      accentForeground: '#fafafa',
      secondary: '#1f1f24',
      secondaryForeground: '#f4f4f5',
      chabad: '#f59e0b',
      candle: '#fb923c',
      ring: '#eab308',
      font: 'serif',
    },
  },
  {
    id: 'evergreen-nocturne',
    name: 'Jerusalem Pine Night',
    category: 'dark',
    badgeLabel: 'Dark',
    description: 'Nocturnal Judean forest canvas with luminous sage-emerald and warm brass highlights.',
    tokens: {
      background: '#091410',
      card: '#10211b',
      foreground: '#ecfdf5',
      muted: '#173027',
      mutedForeground: '#a7f3d0',
      border: '#254a3d',
      primary: '#34d399',
      primaryForeground: '#062419',
      accent: '#18352b',
      accentForeground: '#ecfdf5',
      secondary: '#142a22',
      secondaryForeground: '#d1fae5',
      chabad: '#fbbf24',
      candle: '#fb923c',
      ring: '#34d399',
      font: 'sans',
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
    category: 'custom',
    badgeLabel: 'Custom',
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

export function applyPaletteOverrides(
  baseTheme: CalendarTheme,
  overrides?: PaletteOverrides
): CalendarTheme {
  if (!overrides) return baseTheme;
  const hasAny =
    overrides.primary ||
    overrides.chabad ||
    overrides.candle ||
    overrides.paper ||
    overrides.font ||
    overrides.highContrastBorders ||
    overrides.printInkSaver;

  if (!hasAny) return baseTheme;

  const nextTokens: ThemeTokens = { ...baseTheme.tokens };

  if (overrides.paper && HEX_COLOR_REGEX.test(overrides.paper)) {
    const isDarkPaper = getLuminance(overrides.paper) < 0.45;
    const fg = isDarkPaper ? '#f1f5f9' : '#18181b';
    nextTokens.background = overrides.paper;
    nextTokens.card = isDarkPaper ? mixColors(overrides.paper, '#ffffff', 0.06) : '#ffffff';
    nextTokens.foreground = fg;
    nextTokens.muted = mixColors(overrides.paper, fg, isDarkPaper ? 0.12 : 0.06);
    nextTokens.mutedForeground = mixColors(overrides.paper, fg, 0.65);
    nextTokens.border = mixColors(overrides.paper, fg, isDarkPaper ? 0.22 : 0.16);
  }

  if (overrides.primary && HEX_COLOR_REGEX.test(overrides.primary)) {
    const isDarkPrimary = getLuminance(overrides.primary) < 0.5;
    nextTokens.primary = overrides.primary;
    nextTokens.primaryForeground = isDarkPrimary ? '#ffffff' : '#0f172a';
    nextTokens.ring = overrides.primary;
    nextTokens.accent = mixColors(nextTokens.card, overrides.primary, 0.08);
  }

  if (overrides.chabad && HEX_COLOR_REGEX.test(overrides.chabad)) {
    nextTokens.chabad = overrides.chabad;
  }

  if (overrides.candle && HEX_COLOR_REGEX.test(overrides.candle)) {
    nextTokens.candle = overrides.candle;
  }

  if (overrides.font) {
    nextTokens.font = overrides.font;
  }

  if (overrides.printInkSaver) {
    nextTokens.background = '#ffffff';
    nextTokens.card = '#ffffff';
    nextTokens.foreground = '#09090b';
    nextTokens.muted = '#f4f4f5';
    nextTokens.mutedForeground = '#27272a';
  }

  if (overrides.highContrastBorders) {
    const isDark = getLuminance(nextTokens.card) < 0.45;
    nextTokens.border = isDark ? '#94a3b8' : '#18181b';
    nextTokens.mutedForeground = isDark ? '#e2e8f0' : '#1f2937';
    nextTokens.gridStrokeWidth = '1.5px';
  }

  return {
    ...baseTheme,
    tokens: nextTokens,
  };
}

export function resolveTheme(
  themeId: string,
  customThemes: CustomThemeDraft[] = [],
  overrides?: PaletteOverrides
): CalendarTheme {
  const custom = customThemes.find((t) => t.id === themeId);
  const base = custom
    ? buildCustomTheme(custom)
    : BUILTIN_THEMES.find((t) => t.id === themeId) ?? BUILTIN_THEMES[0];
  return applyPaletteOverrides(base, overrides);
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
