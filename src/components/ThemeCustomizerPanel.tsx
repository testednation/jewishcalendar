import React, { useState } from 'react';
import {
  BookOpen,
  Check,
  Columns2,
  Eye,
  Flame,
  Monitor,
  Palette,
  Plus,
  Printer,
  RotateCcw,
  Sliders,
  Sparkles,
  Sun,
  Trash2,
  Type,
} from 'lucide-react';
import {
  CalendarTheme,
  CustomThemeDraft,
  HEX_COLOR_REGEX,
  PaletteOverrides,
  PRIMARY_PALETTE_PRESETS,
  ThemeCategory,
  getThemeStyleVars,
} from '../lib/themes';

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  const safeHex = HEX_COLOR_REGEX.test(value) ? value : '#2447b4';
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5">
      <span className="truncate text-[11px] font-medium text-foreground">{label}</span>
      <div className="flex items-center gap-1.5 shrink-0">
        <input
          type="color"
          aria-label={`${label} color picker`}
          value={safeHex}
          onChange={(e) => onChange(e.target.value)}
          className="h-6 w-7 cursor-pointer rounded border border-border bg-transparent p-0"
        />
        <input
          type="text"
          aria-label={`${label} hex code`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-16 rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] uppercase tabular-nums text-foreground"
        />
      </div>
    </div>
  );
}

function LiveThemeMiniSpecimen({
  theme,
  mode,
  orgName,
  locationCity,
  showCropMarks,
}: {
  theme: CalendarTheme;
  mode: 'regular' | 'print';
  orgName: string;
  locationCity: string;
  showCropMarks: boolean;
}) {
  const isPrint = mode === 'print';
  const highContrastGrid = theme.tokens.gridStrokeWidth === '1.5px';

  return (
    <div
      style={getThemeStyleVars(theme)}
      className={`relative overflow-hidden transition-all duration-150 ${
        isPrint
          ? 'rounded-lg border border-neutral-300 bg-[#ffffff] p-2.5 shadow-sm'
          : 'rounded-xl border border-border bg-background p-2.5 shadow-xs'
      }`}
    >
      {/* Simulated Print Crop Marks when in Print Preview */}
      {isPrint && showCropMarks && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-1 z-10">
          <span className="absolute left-0 top-1.5 h-px w-2 bg-black/70" />
          <span className="absolute left-1.5 top-0 h-2 w-px bg-black/70" />
          <span className="absolute right-0 top-1.5 h-px w-2 bg-black/70" />
          <span className="absolute right-1.5 top-0 h-2 w-px bg-black/70" />
          <span className="absolute bottom-1.5 left-0 h-px w-2 bg-black/70" />
          <span className="absolute bottom-0 left-1.5 h-2 w-px bg-black/70" />
          <span className="absolute bottom-1.5 right-0 h-px w-2 bg-black/70" />
          <span className="absolute bottom-0 right-1.5 h-2 w-px bg-black/70" />
        </div>
      )}

      {/* Mode Header Tag */}
      <div className="mb-1.5 flex items-center justify-between gap-1 border-b border-border pb-1.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate font-display text-[11px] font-bold tracking-tight text-primary">
              {isPrint ? orgName || `Jewish Calendar of ${locationCity}` : 'Tishrei · October'}
            </span>
          </div>
          <p className="truncate text-[9px] font-medium text-chabad">
            {isPrint ? 'Tishrei 5787 · Print Sheet (8.5×11)' : 'תשרי תשפ״ז · Interactive Grid'}
          </p>
        </div>
        <span className="shrink-0 font-mono text-[9px] font-semibold text-muted-foreground">
          {isPrint ? 'PRINT 300 DPI' : 'REGULAR UI'}
        </span>
      </div>

      {/* Mini 3-Day Specimen Grid */}
      <div
        className={`grid grid-cols-3 overflow-hidden rounded-lg border border-border bg-border ${
          highContrastGrid ? 'gap-[1.5px] border-[1.5px]' : 'gap-px'
        }`}
      >
        {/* Cell 1: Erev Shabbat / Yom Tov */}
        <div className="flex flex-col justify-between bg-card p-1.5">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[10px] font-bold tabular-nums text-primary">14</span>
            <span className="text-[8px] font-medium text-muted-foreground">Fri · ו׳</span>
          </div>
          <span className="mt-0.5 truncate text-[9px] font-semibold text-chabad">14 Tishrei</span>
          <span className="truncate text-[8px] font-semibold text-primary">Erev Sukkot</span>
          <span className="mt-1 inline-flex items-center gap-0.5 truncate font-mono text-[8px] font-medium tabular-nums text-candle">
            <Flame className="size-2.5 shrink-0" />
            <span>6:11p</span>
          </span>
        </div>

        {/* Cell 2: Shabbat / Yom Tov */}
        <div className="flex flex-col justify-between bg-muted/50 p-1.5 ring-1 ring-inset ring-primary/35">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[10px] font-bold tabular-nums text-primary">15</span>
            <span className="text-[8px] font-medium text-muted-foreground">Sat · ש׳</span>
          </div>
          <span className="mt-0.5 truncate text-[9px] font-semibold text-chabad">15 Tishrei</span>
          <span className="truncate text-[8px] font-bold text-primary">Sukkot I</span>
          <span className="mt-1 inline-flex items-center gap-0.5 truncate font-mono text-[8px] font-medium tabular-nums text-candle">
            <Flame className="size-2.5 shrink-0" />
            <span>YT 7:09p</span>
          </span>
        </div>

        {/* Cell 3: Motzei Yom Tov (Yom Tov Havdalah) */}
        <div className="flex flex-col justify-between bg-card p-1.5">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[10px] font-bold tabular-nums text-primary">16</span>
            <span className="text-[8px] font-medium text-muted-foreground">Sun · א׳</span>
          </div>
          <span className="mt-0.5 truncate text-[9px] font-semibold text-chabad">16 Tishrei</span>
          <span className="truncate text-[8px] font-semibold text-primary">Sukkot II</span>
          <span className="mt-1 inline-flex items-center gap-0.5 truncate font-mono text-[8px] font-medium tabular-nums text-candle">
            <Sparkles className="size-2.5 shrink-0" />
            <span>Hav 7:08p</span>
          </span>
        </div>
      </div>

      {/* Mini Footer Legend */}
      <div className="mt-1.5 flex items-center justify-between text-[8.5px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Sun className="size-2.5 text-primary" />
          <span>Font: {theme.tokens.font === 'serif' ? 'Fraunces Serif' : 'Plus Jakarta Sans'}</span>
        </span>
        <span className="font-mono tabular-nums">{theme.name}</span>
      </div>
    </div>
  );
}

export function ThemeCustomizerPanel({
  themes,
  activeThemeId,
  previewedTheme,
  onSelectTheme,
  onHoverTheme,
  paletteOverrides,
  onChangePaletteOverrides,
  onResetPaletteOverrides,
  customThemes,
  onSaveCustomTheme,
  onDeleteCustomTheme,
  previewMode,
  onChangePreviewMode,
  orgName,
  locationCity,
  showCropMarks,
  onNotify,
}: {
  themes: CalendarTheme[];
  activeThemeId: string;
  previewedTheme: CalendarTheme;
  onSelectTheme: (id: string) => void;
  onHoverTheme: (id: string | null) => void;
  paletteOverrides: PaletteOverrides;
  onChangePaletteOverrides: (next: PaletteOverrides) => void;
  onResetPaletteOverrides: () => void;
  customThemes: CustomThemeDraft[];
  onSaveCustomTheme: (draft: CustomThemeDraft) => void;
  onDeleteCustomTheme: (id: string) => void;
  previewMode: 'continuous' | 'pages';
  onChangePreviewMode: (mode: 'continuous' | 'pages') => void;
  orgName: string;
  locationCity: string;
  showCropMarks: boolean;
  onNotify: (msg: string) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | ThemeCategory>('all');
  const [specimenView, setSpecimenView] = useState<'split' | 'regular' | 'print'>('split');
  const [showFineTune, setShowFineTune] = useState<boolean>(false);
  const [customDraftName, setCustomDraftName] = useState<string>('');
  const [savingAsCustom, setSavingAsCustom] = useState<boolean>(false);

  const filteredThemes = themes.filter((th) =>
    selectedCategory === 'all' ? true : th.category === selectedCategory
  );

  const hasOverrides = Boolean(
    paletteOverrides.primary ||
      paletteOverrides.chabad ||
      paletteOverrides.candle ||
      paletteOverrides.paper ||
      paletteOverrides.font ||
      paletteOverrides.highContrastBorders ||
      paletteOverrides.printInkSaver
  );

  const handleSaveCurrentPaletteAsTheme = () => {
    const trimmed = customDraftName.trim() || `${previewedTheme.name} Custom`;
    const newDraft: CustomThemeDraft = {
      id: `custom-${Date.now().toString(36)}`,
      name: trimmed,
      paper: previewedTheme.tokens.background,
      card: previewedTheme.tokens.card,
      accent: previewedTheme.tokens.primary,
      chabad: previewedTheme.tokens.chabad,
      candle: previewedTheme.tokens.candle,
      font: previewedTheme.tokens.font ?? 'sans',
    };
    onSaveCustomTheme(newDraft);
    setCustomDraftName('');
    setSavingAsCustom(false);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="size-4 text-primary" />
            <h2 className="font-display text-base font-semibold">
              Theme &amp; Print Palette Studio
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose a Traditional, Minimalist, or High-Contrast theme and customize primary inks with live Regular &amp; Print previews.
          </p>
        </div>
        {hasOverrides && (
          <button
            type="button"
            onClick={() => {
              onResetPaletteOverrides();
              onNotify('Reset palette to theme defaults');
            }}
            className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground whitespace-nowrap shrink-0"
          >
            <RotateCcw className="size-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Live Preview Switcher: Syncs both Specimen & Main Calendar Canvas */}
      <div className="mt-4 rounded-xl border border-border bg-muted/30 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Eye className="size-3.5 text-primary" />
            <span>Live Theme Preview</span>
          </div>

          {/* Specimen Mode Switcher */}
          <div className="inline-flex items-center rounded-lg border border-border bg-background p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setSpecimenView('regular');
                onChangePreviewMode('continuous');
              }}
              className={`inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 font-medium transition-colors whitespace-nowrap shrink-0 ${
                specimenView === 'regular' && previewMode === 'continuous'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Monitor className="size-3" />
              <span>Regular</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSpecimenView('print');
                onChangePreviewMode('pages');
              }}
              className={`inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 font-medium transition-colors whitespace-nowrap shrink-0 ${
                specimenView === 'print' && previewMode === 'pages'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Printer className="size-3" />
              <span>Print Sheet</span>
            </button>
            <button
              type="button"
              onClick={() => setSpecimenView('split')}
              className={`inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 font-medium transition-colors whitespace-nowrap shrink-0 ${
                specimenView === 'split'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Columns2 className="size-3" />
              <span>Both</span>
            </button>
          </div>
        </div>

        {/* Live Specimen Canvas */}
        <div className="mt-2.5 flex flex-col gap-2">
          {(specimenView === 'regular' || specimenView === 'split') && (
            <LiveThemeMiniSpecimen
              theme={previewedTheme}
              mode="regular"
              orgName={orgName}
              locationCity={locationCity}
              showCropMarks={showCropMarks}
            />
          )}
          {(specimenView === 'print' || specimenView === 'split') && (
            <LiveThemeMiniSpecimen
              theme={previewedTheme}
              mode="print"
              orgName={orgName}
              locationCity={locationCity}
              showCropMarks={showCropMarks}
            />
          )}
        </div>

        {/* Main Canvas View Sync Bar */}
        <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-border/70 pt-2 text-[11px]">
          <span className="text-muted-foreground">Main Canvas View:</span>
          <div className="inline-flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onChangePreviewMode('continuous')}
              className={`inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 font-medium transition-colors ${
                previewMode === 'continuous'
                  ? 'bg-card text-primary ring-1 ring-primary/30'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Monitor className="size-3" />
              <span>Regular Calendar</span>
            </button>
            <button
              type="button"
              onClick={() => onChangePreviewMode('pages')}
              className={`inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 font-medium transition-colors ${
                previewMode === 'pages'
                  ? 'bg-card text-primary ring-1 ring-primary/30'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BookOpen className="size-3" />
              <span>Print Calendar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs: All / Traditional / Minimalist / High-Contrast */}
      <div className="mt-4">
        <span className="block text-xs font-medium text-muted-foreground">
          1. Select Theme Style Family
        </span>
        <div className="mt-1.5 grid grid-cols-4 gap-1 rounded-xl border border-border bg-muted/40 p-1">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'traditional', label: 'Traditional' },
              { id: 'minimalist', label: 'Minimalist' },
              { id: 'high-contrast', label: 'High-Contrast' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              className={`min-h-[32px] cursor-pointer rounded-lg px-1.5 py-1 text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 truncate ${
                selectedCategory === tab.id
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Theme Presets Grid (Hover for instant Live Preview, Click to apply) */}
      <div
        className="mt-3 grid grid-cols-2 gap-2"
        onMouseLeave={() => onHoverTheme(null)}
      >
        {filteredThemes.map((th) => {
          const isSelected = activeThemeId === th.id;
          return (
            <button
              key={th.id}
              type="button"
              onMouseEnter={() => onHoverTheme(th.id)}
              onFocus={() => onHoverTheme(th.id)}
              onClick={() => {
                onSelectTheme(th.id);
                onNotify(`Applied ${th.name} (${th.badgeLabel ?? th.category}) theme`);
              }}
              className={`group relative flex cursor-pointer flex-col items-start gap-1.5 rounded-xl border p-2.5 text-left transition-all ${
                isSelected
                  ? 'border-primary bg-primary/[0.05] ring-1 ring-primary/40'
                  : 'border-border bg-card hover:border-primary/40 hover:bg-accent/40'
              }`}
            >
              {/* 5-Bar Color Strip */}
              <div className="flex h-5 w-full overflow-hidden rounded-md border border-border/80">
                {[
                  th.tokens.background,
                  th.tokens.card,
                  th.tokens.primary,
                  th.tokens.chabad,
                  th.tokens.candle,
                ].map((color, idx) => (
                  <span
                    key={idx}
                    className="h-full flex-1"
                    style={{ background: color }}
                  />
                ))}
              </div>

              <div className="flex w-full items-center justify-between gap-1">
                <span className="truncate text-xs font-semibold text-foreground">
                  {th.name}
                </span>
                {isSelected && <Check className="size-3.5 shrink-0 text-primary" />}
              </div>

              <span className="text-[10px] font-medium text-muted-foreground">
                {th.badgeLabel ?? th.category} ·{' '}
                {th.tokens.font === 'serif' ? 'Serif' : 'Sans'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Primary Color Palette Swatches */}
      <div className="mt-4 border-t border-border pt-3.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            2. Primary Color Palette
          </span>
          <span className="font-mono text-[10px] uppercase tabular-nums text-primary">
            {previewedTheme.tokens.primary}
          </span>
        </div>

        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {PRIMARY_PALETTE_PRESETS.map((swatch) => {
            const isActiveSwatch =
              previewedTheme.tokens.primary.toLowerCase() === swatch.primary.toLowerCase();
            return (
              <button
                key={swatch.id}
                type="button"
                onClick={() => {
                  onChangePaletteOverrides({
                    ...paletteOverrides,
                    primary: swatch.primary,
                    chabad: swatch.chabad,
                    candle: swatch.candle,
                  });
                  onNotify(`Primary palette set to ${swatch.name}`);
                }}
                className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg border p-1.5 text-center transition-colors ${
                  isActiveSwatch
                    ? 'border-primary bg-primary/[0.06] ring-1 ring-primary/40'
                    : 'border-border bg-background hover:bg-accent/50'
                }`}
              >
                <span className="flex items-center gap-0.5">
                  <span
                    className="size-3.5 rounded-full border border-black/15"
                    style={{ background: swatch.primary }}
                  />
                  <span
                    className="size-2.5 rounded-full border border-black/15"
                    style={{ background: swatch.chabad }}
                  />
                  <span
                    className="size-2.5 rounded-full border border-black/15"
                    style={{ background: swatch.candle }}
                  />
                </span>
                <span className="w-full truncate text-[9.5px] font-medium text-foreground">
                  {swatch.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Print Optimization Quick Toggles (High-Contrast Borders & Ink Saver) */}
      <div className="mt-3.5 flex flex-col gap-2 border-t border-border pt-3">
        <label className="flex min-h-[34px] cursor-pointer items-center justify-between gap-2 text-xs">
          <div>
            <span className="block font-medium text-foreground">High-Contrast Print Grid</span>
            <span className="text-[10.5px] text-muted-foreground">
              Darker 1.5px cell borders &amp; deeper ink contrast
            </span>
          </div>
          <input
            type="checkbox"
            checked={Boolean(
              paletteOverrides.highContrastBorders ||
                previewedTheme.category === 'high-contrast'
            )}
            onChange={(e) =>
              onChangePaletteOverrides({
                ...paletteOverrides,
                highContrastBorders: e.target.checked,
              })
            }
            className="size-4 accent-primary"
          />
        </label>

        <label className="flex min-h-[34px] cursor-pointer items-center justify-between gap-2 text-xs">
          <div>
            <span className="block font-medium text-foreground">
              Pure White Paper (Print Ink-Saver)
            </span>
            <span className="text-[10.5px] text-muted-foreground">
              Use #FFFFFF background for unbleached home printing
            </span>
          </div>
          <input
            type="checkbox"
            checked={Boolean(paletteOverrides.printInkSaver)}
            onChange={(e) =>
              onChangePaletteOverrides({
                ...paletteOverrides,
                printInkSaver: e.target.checked,
              })
            }
            className="size-4 accent-primary"
          />
        </label>
      </div>

      {/* Fine-Tune Custom Color Pickers & Typography Accordion */}
      <div className="mt-3 border-t border-border pt-3">
        <button
          type="button"
          onClick={() => setShowFineTune((v) => !v)}
          className="flex min-h-[36px] w-full cursor-pointer items-center justify-between rounded-lg bg-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent"
        >
          <span className="inline-flex items-center gap-1.5">
            <Sliders className="size-3.5 text-primary" />
            <span>Fine-Tune Custom Inks &amp; Typography</span>
          </span>
          <span className="text-[11px] text-primary">{showFineTune ? 'Hide' : 'Customize'}</span>
        </button>

        {showFineTune && (
          <div className="mt-2.5 flex flex-col gap-2">
            <ColorField
              label="Primary Accent"
              value={paletteOverrides.primary ?? previewedTheme.tokens.primary}
              onChange={(hex) =>
                onChangePaletteOverrides({ ...paletteOverrides, primary: hex })
              }
            />
            <ColorField
              label="Hebrew / Chabad"
              value={paletteOverrides.chabad ?? previewedTheme.tokens.chabad}
              onChange={(hex) =>
                onChangePaletteOverrides({ ...paletteOverrides, chabad: hex })
              }
            />
            <ColorField
              label="Candle / Havdalah"
              value={paletteOverrides.candle ?? previewedTheme.tokens.candle}
              onChange={(hex) =>
                onChangePaletteOverrides({ ...paletteOverrides, candle: hex })
              }
            />
            <ColorField
              label="Paper Background"
              value={paletteOverrides.paper ?? previewedTheme.tokens.background}
              onChange={(hex) =>
                onChangePaletteOverrides({
                  ...paletteOverrides,
                  paper: hex,
                  printInkSaver: false,
                })
              }
            />

            <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium">
                <Type className="size-3.5 text-primary" />
                <span>Heading Font</span>
              </span>
              <select
                value={paletteOverrides.font ?? previewedTheme.tokens.font ?? 'sans'}
                onChange={(e) =>
                  onChangePaletteOverrides({
                    ...paletteOverrides,
                    font: e.target.value as 'sans' | 'serif',
                  })
                }
                className="rounded border border-border bg-card px-2 py-1 text-[11px] font-medium"
              >
                <option value="sans">Modern Sans (Plus Jakarta)</option>
                <option value="serif">Traditional Serif (Fraunces)</option>
              </select>
            </div>

            {/* Save as reusable Custom Theme */}
            {savingAsCustom ? (
              <div className="mt-1 flex gap-1.5">
                <input
                  type="text"
                  value={customDraftName}
                  onChange={(e) => setCustomDraftName(e.target.value)}
                  placeholder="Custom palette name…"
                  className="min-h-[36px] flex-1 rounded-lg border border-border bg-background px-2.5 text-xs"
                />
                <button
                  type="button"
                  onClick={handleSaveCurrentPaletteAsTheme}
                  className="min-h-[36px] cursor-pointer rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="mt-1 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSavingAsCustom(true)}
                  className="inline-flex min-h-[34px] flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg border border-border bg-background px-2.5 text-xs font-medium hover:bg-accent"
                >
                  <Plus className="size-3.5 text-primary" />
                  <span>Save Palette as Custom Theme</span>
                </button>
                {customThemes.some((t) => t.id === activeThemeId) && (
                  <button
                    type="button"
                    onClick={() => onDeleteCustomTheme(activeThemeId)}
                    className="inline-flex min-h-[34px] cursor-pointer items-center gap-1 rounded-lg border border-border px-2.5 text-xs text-red-600 hover:bg-accent"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
