import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Sparkles,
  BookOpen,
  Clock,
  Calendar,
  Flame,
  Moon,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  Filter,
} from 'lucide-react';
import {
  CLUTTER_PRESETS,
  ClutterPresetKey,
  DEFAULT_JEWISH_OPTIONS,
  JewishInfoOptions,
} from '../lib/calendarEngine';

export function EventFilterControlPanel({
  options,
  onChangeOptions,
  onReset,
}: {
  options: JewishInfoOptions;
  onChangeOptions: (next: JewishInfoOptions) => void;
  onReset?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'presets' | 'zmanim' | 'holidays' | 'torah' | 'all'>('presets');
  const [collapsed, setCollapsed] = useState(false);

  const toggleOption = (key: keyof JewishInfoOptions) => {
    onChangeOptions({
      ...options,
      [key]: !Boolean(options[key] ?? DEFAULT_JEWISH_OPTIONS[key]),
    });
  };

  const applyPreset = (presetKey: ClutterPresetKey) => {
    const preset = CLUTTER_PRESETS.find((p) => p.id === presetKey);
    if (!preset) return;
    onChangeOptions({
      ...options,
      ...preset.options,
    });
  };

  // Calculate how many categories/items are currently hidden
  const allKeys = Object.keys(DEFAULT_JEWISH_OPTIONS) as (keyof JewishInfoOptions)[];
  const hiddenCount = allKeys.filter(
    (k) => (options[k] ?? DEFAULT_JEWISH_OPTIONS[k]) === false
  ).length;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-primary" />
          <h2 className="font-display text-base font-semibold">Display Filters & Clutter</h2>
        </div>
        <div className="flex items-center gap-1.5">
          {hiddenCount > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary">
              {hiddenCount} hidden
            </span>
          )}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand panel' : 'Collapse panel'}
            className="cursor-pointer rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {collapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
          </button>
        </div>
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        Customize exactly what appears on your calendar grid: hide or show Parshat HaShavua, halachic prayer times, and specific holiday categories.
      </p>

      {!collapsed && (
        <div className="mt-4 flex flex-col gap-4">
          {/* Quick Clutter-Reduction Presets */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quick Clutter Presets
              </span>
              <button
                type="button"
                onClick={() => {
                  onChangeOptions({ ...DEFAULT_JEWISH_OPTIONS });
                  onReset?.();
                }}
                className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                <RotateCcw className="size-3" />
                <span>Reset</span>
              </button>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CLUTTER_PRESETS.map((preset) => {
                const isMatching = Object.entries(preset.options).every(
                  ([k, v]) => (options[k as keyof JewishInfoOptions] ?? DEFAULT_JEWISH_OPTIONS[k as keyof JewishInfoOptions]) === v
                );

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset.id)}
                    className={`group relative flex cursor-pointer flex-col rounded-xl border p-2.5 text-left transition-all ${
                      isMatching
                        ? 'border-primary bg-primary/[0.08] text-foreground ring-1 ring-primary/40'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground text-xs">{preset.label}</span>
                      {isMatching && <Check className="size-3 text-primary shrink-0" />}
                    </div>
                    <span className="mt-0.5 inline-block text-[10px] font-medium text-primary">
                      {preset.badge}
                    </span>
                    <p className="mt-1 line-clamp-2 text-[10px] leading-tight opacity-75">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section Tabs */}
          <div className="flex rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`flex-1 cursor-pointer rounded-md py-1 font-medium transition-colors ${
                activeTab === 'presets'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Presets
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('zmanim')}
              className={`flex-1 cursor-pointer rounded-md py-1 font-medium transition-colors ${
                activeTab === 'zmanim'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Zmanim
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('holidays')}
              className={`flex-1 cursor-pointer rounded-md py-1 font-medium transition-colors ${
                activeTab === 'holidays'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Holidays
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('torah')}
              className={`flex-1 cursor-pointer rounded-md py-1 font-medium transition-colors ${
                activeTab === 'torah'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Torah
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex-1 cursor-pointer rounded-md py-1 font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All Toggles
            </button>
          </div>

          {/* Tab 1: Halachic Zmanim */}
          {(activeTab === 'zmanim' || activeTab === 'all') && (
            <div className="rounded-xl border border-border bg-background p-3">
              <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                <Clock className="size-3.5 text-primary" />
                <span>Daily Halachic Zmanim (Prayer & Sun Times)</span>
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Control the bottom prayer times and sun calculations shown inside daily calendar cells.
              </p>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border/70 bg-card p-2 text-xs transition-colors hover:border-primary/50">
                  <span className="font-semibold text-foreground">Show Daily Zmanim (Master)</span>
                  <input
                    type="checkbox"
                    checked={options.showDailyZmanim ?? true}
                    onChange={() => toggleOption('showDailyZmanim')}
                    className="size-4 accent-primary"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border/70 bg-card p-2 text-xs transition-colors hover:border-primary/50">
                  <span className="inline-flex items-center gap-1.5">
                    <Flame className="size-3 text-candle" />
                    <span>Candle Lighting Times</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={options.showCandleLighting ?? true}
                    onChange={() => toggleOption('showCandleLighting')}
                    className="size-4 accent-primary"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border/70 bg-card p-2 text-xs transition-colors hover:border-primary/50">
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles className="size-3 text-candle" />
                    <span>Havdalah Times</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={options.showHavdalah ?? true}
                    onChange={() => toggleOption('showHavdalah')}
                    className="size-4 accent-primary"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border/70 bg-card p-2 text-xs transition-colors hover:border-primary/50">
                  <span>Sunrise & Sunset (Netz / Shekiya)</span>
                  <input
                    type="checkbox"
                    checked={options.showSunTimes ?? true}
                    onChange={() => toggleOption('showSunTimes')}
                    className="size-4 accent-primary"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border/70 bg-card p-2 text-xs transition-colors hover:border-primary/50">
                  <span>Dual Shema Times (MGA & GRA)</span>
                  <input
                    type="checkbox"
                    checked={options.dualZmanim ?? false}
                    onChange={() => toggleOption('dualZmanim')}
                    className="size-4 accent-primary"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border/70 bg-card p-2 text-xs transition-colors hover:border-primary/50">
                  <span>Fast Day Begin & End Times</span>
                  <input
                    type="checkbox"
                    checked={options.fastDetails ?? true}
                    onChange={() => toggleOption('fastDetails')}
                    className="size-4 accent-primary"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Tab 2: Holiday Categories */}
          {(activeTab === 'holidays' || activeTab === 'all') && (
            <div className="rounded-xl border border-border bg-background p-3">
              <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                <Calendar className="size-3.5 text-primary" />
                <span>Jewish Holiday Categories</span>
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Filter out secondary holidays to give major Yom Tov and Shabbat maximum focus.
              </p>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border/70 bg-card p-2 text-xs transition-colors hover:border-primary/50">
                  <span className="font-semibold text-primary">Major Yom Tov (Torah Holidays)</span>
                  <input
                    type="checkbox"
                    checked={options.holidayMajor ?? true}
                    onChange={() => toggleOption('holidayMajor')}
                    className="size-4 accent-primary"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border/70 bg-card p-2 text-xs transition-colors hover:border-primary/50">
                  <span>Rosh Chodesh (New Month)</span>
                  <input
                    type="checkbox"
                    checked={options.holidayRoshChodesh ?? true}
                    onChange={() => toggleOption('holidayRoshChodesh')}
                    className="size-4 accent-primary"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border/70 bg-card p-2 text-xs transition-colors hover:border-primary/50">
                  <span>Chol HaMoed (Intermediate Days)</span>
                  <input
                    type="checkbox"
                    checked={options.holidayCholHaMoed ?? true}
                    onChange={() => toggleOption('holidayCholHaMoed')}
                    className="size-4 accent-primary"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border/70 bg-card p-2 text-xs transition-colors hover:border-primary/50">
                  <span>Fast Days (Tzom Gedalia, 10 Tevet, etc.)</span>
                  <input
                    type="checkbox"
                    checked={options.holidayFast ?? true}
                    onChange={() => toggleOption('holidayFast')}
                    className="size-4 accent-primary"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border/70 bg-card p-2 text-xs transition-colors hover:border-primary/50">
                  <span>Minor Holidays (Chanukah, Purim, etc.)</span>
                  <input
                    type="checkbox"
                    checked={options.holidayMinor ?? true}
                    onChange={() => toggleOption('holidayMinor')}
                    className="size-4 accent-primary"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border/70 bg-card p-2 text-xs transition-colors hover:border-primary/50">
                  <span>Special Shabbatot (Shekalim, Zachor, etc.)</span>
                  <input
                    type="checkbox"
                    checked={options.holidaySpecialShabbat ?? true}
                    onChange={() => toggleOption('holidaySpecialShabbat')}
                    className="size-4 accent-primary"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border/70 bg-card p-2 text-xs transition-colors hover:border-primary/50">
                  <span className="text-chabad font-medium">Chabad Hasidic Dates (Yud-Tes Kislev, etc.)</span>
                  <input
                    type="checkbox"
                    checked={options.holidayChabad ?? true}
                    onChange={() => toggleOption('holidayChabad')}
                    className="size-4 accent-primary"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border/70 bg-card p-2 text-xs transition-colors hover:border-primary/50">
                  <span>Modern Israeli Dates (Yom HaAtzmaut, etc.)</span>
                  <input
                    type="checkbox"
                    checked={options.holidayModern ?? false}
                    onChange={() => toggleOption('holidayModern')}
                    className="size-4 accent-primary"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Tab 3: Torah & Portions */}
          {(activeTab === 'torah' || activeTab === 'all') && (
            <div className="rounded-xl border border-border bg-background p-3">
              <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                <BookOpen className="size-3.5 text-primary" />
                <span>Torah Portions & Study Tracks</span>
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Show or hide weekly readings, Pirkei Avot, and daily study schedules.
              </p>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border/70 bg-card p-2 text-xs transition-colors hover:border-primary/50">
                  <span className="font-semibold text-foreground">Parshat HaShavua (Weekly Portion)</span>
                  <input
                    type="checkbox"
                    checked={options.parsha ?? true}
                    onChange={() => toggleOption('parsha')}
                    className="size-4 accent-primary"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border/70 bg-card p-2 text-xs transition-colors hover:border-primary/50">
                  <span>Pirkei Avot (Summer Ethics)</span>
                  <input
                    type="checkbox"
                    checked={options.pirkeiAvot ?? true}
                    onChange={() => toggleOption('pirkeiAvot')}
                    className="size-4 accent-primary"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border/70 bg-card p-2 text-xs transition-colors hover:border-primary/50">
                  <span>Sefirat HaOmer Counting</span>
                  <input
                    type="checkbox"
                    checked={options.omer ?? true}
                    onChange={() => toggleOption('omer')}
                    className="size-4 accent-primary"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border/70 bg-card p-2 text-xs transition-colors hover:border-primary/50">
                  <span>Birkat HaChodesh / Molad Announcement</span>
                  <input
                    type="checkbox"
                    checked={options.birkatHaChodesh ?? true}
                    onChange={() => toggleOption('birkatHaChodesh')}
                    className="size-4 accent-primary"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border/70 bg-card p-2 text-xs transition-colors hover:border-primary/50">
                  <span>Daily Chitas (Chumash/Tehillim/Tanya)</span>
                  <input
                    type="checkbox"
                    checked={options.chitas ?? true}
                    onChange={() => toggleOption('chitas')}
                    className="size-4 accent-primary"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border/70 bg-card p-2 text-xs transition-colors hover:border-primary/50">
                  <span>Daf Yomi (Daily Talmud Page)</span>
                  <input
                    type="checkbox"
                    checked={options.dafYomi ?? false}
                    onChange={() => toggleOption('dafYomi')}
                    className="size-4 accent-primary"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border/70 bg-card p-2 text-xs transition-colors hover:border-primary/50">
                  <span>Daily Rambam (Mishneh Torah)</span>
                  <input
                    type="checkbox"
                    checked={options.rambam ?? false}
                    onChange={() => toggleOption('rambam')}
                    className="size-4 accent-primary"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border/70 bg-card p-2 text-xs transition-colors hover:border-primary/50">
                  <span>Hayom Yom Daily Teaching</span>
                  <input
                    type="checkbox"
                    checked={options.hayomYom ?? false}
                    onChange={() => toggleOption('hayomYom')}
                    className="size-4 accent-primary"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Personal & Visual Markers */}
          <div className="rounded-xl border border-border bg-background p-3">
            <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
              <Filter className="size-3.5 text-primary" />
              <span>Personal Dates & Visual Indicators</span>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border/70 bg-card p-2 text-xs transition-colors hover:border-primary/50">
                <span className="inline-flex items-center gap-1.5">
                  <Flame className="size-3 text-candle" />
                  <span>Yahrzeits & Memorials</span>
                </span>
                <input
                  type="checkbox"
                  checked={options.showYahrzeits ?? true}
                  onChange={() => toggleOption('showYahrzeits')}
                  className="size-4 accent-primary"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border/70 bg-card p-2 text-xs transition-colors hover:border-primary/50">
                <span>Custom Events</span>
                <input
                  type="checkbox"
                  checked={options.showCustomEvents ?? true}
                  onChange={() => toggleOption('showCustomEvents')}
                  className="size-4 accent-primary"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border/70 bg-card p-2 text-xs transition-colors hover:border-primary/50">
                <span className="inline-flex items-center gap-1.5">
                  <Moon className="size-3 text-chabad" />
                  <span>Lunar Phase Discs</span>
                </span>
                <input
                  type="checkbox"
                  checked={options.moonPhase ?? true}
                  onChange={() => toggleOption('moonPhase')}
                  className="size-4 accent-primary"
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
