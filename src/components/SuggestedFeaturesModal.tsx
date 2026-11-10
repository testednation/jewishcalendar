import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  CalendarRange,
  Flame,
  HeartHandshake,
  FileText,
  Scale,
  Check,
  Copy,
  Plus,
  Trash2,
  X,
  Megaphone,
  Rss,
  Scissors,
} from 'lucide-react';
import { HDate } from '@hebcal/core';
import {
  CalendarSettings,
  GeneratedCalendar,
  HEBREW_MONTH_OPTIONS,
  JewishInfoOptions,
  PersonalHebrewEvent,
  formatZmanTime,
  normalizeHebrewName,
} from '../lib/calendarEngine';

export function SuggestedFeaturesModal({
  open,
  onClose,
  calendar,
  settings,
  onUpdateSettings,
  jewishOptions,
  onUpdateJewishOptions,
  personalHebrewEvents,
  onAddPersonalEvent,
  onRemovePersonalEvent,
  sponsorsCount = 0,
  sponsorsEnabled = true,
  onToggleSponsors,
  showCropMarks = false,
  onToggleCropMarks,
  onOpenTodayTab,
}: {
  open: boolean;
  onClose: () => void;
  calendar: GeneratedCalendar;
  settings: CalendarSettings;
  onUpdateSettings: (partial: Partial<CalendarSettings>) => void;
  jewishOptions: JewishInfoOptions;
  onUpdateJewishOptions: (partial: Partial<JewishInfoOptions>) => void;
  personalHebrewEvents: PersonalHebrewEvent[];
  onAddPersonalEvent: (ev: PersonalHebrewEvent) => void;
  onRemovePersonalEvent: (id: string) => void;
  sponsorsCount?: number;
  sponsorsEnabled?: boolean;
  onToggleSponsors?: () => void;
  showCropMarks?: boolean;
  onToggleCropMarks?: () => void;
  onOpenTodayTab?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'yahrzeits' | 'shabbat-flyer'>('roadmap');

  // Yahrzeit / Hebrew Date form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'yahrzeit' | 'birthday' | 'anniversary' | 'community'>('yahrzeit');
  const [inputMode, setInputMode] = useState<'hebrew' | 'gregorian'>('hebrew');
  const [hebrewDay, setHebrewDay] = useState(14);
  const [hebrewMonth, setHebrewMonth] = useState(9); // Kislev
  const [gregDateStr, setGregDateStr] = useState('2025-12-10');
  const [afterSunset, setAfterSunset] = useState(false);

  // Shabbat Flyer state
  const [copiedFlyer, setCopiedFlyer] = useState(false);

  const upcomingShabbatPairs = useMemo(() => {
    const pairs: {
      friday: (typeof calendar.months)[0]['weeks'][0][0];
      saturday: (typeof calendar.months)[0]['weeks'][0][0];
      monthName: string;
    }[] = [];

    const allDays = calendar.months.flatMap((m) =>
      m.weeks.flat().filter((d): d is NonNullable<typeof d> => d !== null)
    );

    for (let i = 0; i < allDays.length - 1; i++) {
      if (allDays[i].isFriday && allDays[i + 1].isSaturday) {
        pairs.push({
          friday: allDays[i],
          saturday: allDays[i + 1],
          monthName: calendar.months.find((m) => m.gregMonth === allDays[i].gregMonth)?.name ?? '',
        });
      }
    }
    return pairs;
  }, [calendar]);

  const [selectedShabbatIdx, setSelectedShabbatIdx] = useState(0);

  if (!open) return null;

  const handleAddHebrewEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let finalDay = hebrewDay;
    let finalMonth = hebrewMonth;
    let finalMonthName =
      HEBREW_MONTH_OPTIONS.find((m) => m.num === hebrewMonth)?.name ?? 'Tishrei';

    if (inputMode === 'gregorian') {
      const parsed = new Date(`${gregDateStr}T12:00:00`);
      if (!Number.isNaN(parsed.getTime())) {
        let hd = new HDate(parsed);
        if (afterSunset) hd = hd.next();
        finalDay = hd.getDate();
        finalMonth = hd.getMonth() === 13 ? 12 : hd.getMonth();
        finalMonthName = normalizeHebrewName(hd.getMonthName());
      }
    }

    onAddPersonalEvent({
      id: `heb-${Date.now().toString(36)}`,
      title: title.trim(),
      category,
      hebrewDay: finalDay,
      hebrewMonth: finalMonth,
      hebrewMonthName: finalMonthName,
    });
    setTitle('');
  };

  const activePair = upcomingShabbatPairs[selectedShabbatIdx] ?? upcomingShabbatPairs[0];
  const fri = activePair?.friday;
  const sat = activePair?.saturday;

  const generateFlyerText = () => {
    if (!fri || !sat) return '';
    const tz = calendar.location.tzid;
    const h12 = settings.hour12;
    return [
      `SHABBAT SCHEDULE · ${calendar.location.city.toUpperCase()}`,
      `${sat.jewishInfo.parsha ?? 'Shabbat Kodesh'} · ${sat.hebrewDate}, ${sat.hebrewYear}`,
      `Friday, ${fri.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – Saturday, ${sat.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      `----------------------------------------`,
      `• Erev Shabbat Candle Lighting: ${formatZmanTime(fri.zmanim.candleLighting, tz, h12)}`,
      `• Friday Plag HaMincha: ${formatZmanTime(fri.zmanim.plagHaMincha, tz, h12)}`,
      `• Friday Sunset (Shkiah): ${formatZmanTime(fri.zmanim.sunset, tz, h12)}`,
      `• Shabbat Morning Sof Zman Shema (MGA / GRA): ${formatZmanTime(sat.zmanim.sofZmanShmaMGA, tz, h12)} / ${formatZmanTime(sat.zmanim.sofZmanShma, tz, h12)}`,
      `• Shabbat Sof Zman Tefillah: ${formatZmanTime(sat.zmanim.sofZmanTfilla, tz, h12)}`,
      `• Shabbat Mincha Gedolah: ${formatZmanTime(sat.zmanim.minchaGedola, tz, h12)}`,
      sat.jewishInfo.pirkeiAvot ? `• Afternoon Study: ${sat.jewishInfo.pirkeiAvot}` : null,
      sat.jewishInfo.birkatHaChodesh ? `• Blessing of the New Month: ${sat.jewishInfo.birkatHaChodesh}` : null,
      `• Motzei Shabbat Havdalah: ${formatZmanTime(sat.zmanim.havdalah, tz, h12)}`,
      `• Rabbeinu Tam (72 min): ${formatZmanTime(sat.zmanim.rabbeinuTam, tz, h12)}`,
    ]
      .filter(Boolean)
      .join('\n');
  };

  const handleCopyFlyer = () => {
    navigator.clipboard?.writeText(generateFlyerText());
    setCopiedFlyer(true);
    setTimeout(() => setCopiedFlyer(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-0 backdrop-blur-xs sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl border border-border bg-card p-5 pb-8 text-foreground shadow-2xl sm:max-h-[90vh] sm:rounded-2xl sm:p-6"
      >
        {/* Mobile Bottom-Sheet Drag Handle */}
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-border sm:hidden" />

        <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" />
              <span>Luach Studio · All 7 Suggested Features Implemented Live</span>
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold tracking-tight sm:text-2xl">
              Suggested Features &amp; Live Power Tools
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Every community and print-shop enhancement we recommended for jewishcalendar.freebuff.app is now active in your studio.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-4 flex flex-wrap gap-1 rounded-xl border border-border bg-muted/50 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('roadmap')}
            className={`min-h-[40px] flex-1 cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'roadmap'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            1. All 7 Features (Interactive)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('yahrzeits')}
            className={`min-h-[40px] flex-1 cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'yahrzeits'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            2. Yahrzeit Tracker ({personalHebrewEvents.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shabbat-flyer')}
            className={`min-h-[40px] flex-1 cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'shabbat-flyer'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            3. Weekly Shabbat Bulletin
          </button>
        </div>

        {activeTab === 'roadmap' && (
          <div className="mt-5 grid gap-3.5 sm:grid-cols-2">
            {/* Suggestion 1 */}
            <div className="flex flex-col justify-between rounded-xl border border-border bg-background p-4">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <CalendarRange className="size-4" />
                    <span>01. Jewish Year Cycle (Tishrei–Elul)</span>
                  </span>
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    Active
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Generate Rosh Hashanah wall calendars on a true <strong>Tishrei–Elul</strong> cycle (September–August) or secular January–December.
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs font-medium">
                  Current: {settings.cycle === 'hebrew' ? 'Hebrew (Sep–Aug)' : 'Secular (Jan–Dec)'}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSettings({
                      cycle: settings.cycle === 'hebrew' ? 'secular' : 'hebrew',
                    })
                  }
                  className="min-h-[36px] cursor-pointer rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
                >
                  Switch to {settings.cycle === 'hebrew' ? 'Jan–Dec' : 'Tishrei–Elul'}
                </button>
              </div>
            </div>

            {/* Suggestion 2 */}
            <div className="flex flex-col justify-between rounded-xl border border-border bg-background p-4">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <HeartHandshake className="size-4" />
                    <span>02. Hebrew-Date Yahrzeit &amp; Birthday Sync</span>
                  </span>
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    Active
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Convert any Gregorian passing date (including after sunset) to Hebrew and mark it on the exact Hebrew date every year with Adar leap-year support.
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span className="font-mono text-xs font-medium tabular-nums">
                  {personalHebrewEvents.length} dates tracked
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('yahrzeits')}
                  className="min-h-[36px] cursor-pointer rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent"
                >
                  Manage Yahrzeits
                </button>
              </div>
            </div>

            {/* Suggestion 3 */}
            <div className="flex flex-col justify-between rounded-xl border border-border bg-background p-4">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <Scale className="size-4" />
                    <span>03. Dual-Opinion Shema &amp; Rabbeinu Tam</span>
                  </span>
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    Active
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Display both <strong>Magen Avraham (MGA)</strong> and <strong>Baal HaTanya / GRA</strong> for Sof Zman Krias Shema directly on each calendar cell.
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs font-medium">
                  Dual Shema in Grid: {jewishOptions.dualZmanim ? 'Shown' : 'Hidden'}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateJewishOptions({ dualZmanim: !jewishOptions.dualZmanim })
                  }
                  className="min-h-[36px] cursor-pointer rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent"
                >
                  {jewishOptions.dualZmanim ? 'Hide Dual Shema' : 'Show Dual Shema'}
                </button>
              </div>
            </div>

            {/* Suggestion 4 */}
            <div className="flex flex-col justify-between rounded-xl border border-border bg-background p-4">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <FileText className="size-4" />
                    <span>04. Weekly Shabbat Shul Bulletin</span>
                  </span>
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    Active
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Generate weekly WhatsApp/email announcements with Friday candle lighting, Plag HaMincha, Shacharit Shema cutoffs, Pirkei Avot, and Havdalah.
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span className="font-mono text-xs font-medium tabular-nums">
                  {upcomingShabbatPairs.length} Shabbatot ready
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('shabbat-flyer')}
                  className="min-h-[36px] cursor-pointer rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent"
                >
                  Open Bulletin Tool
                </button>
              </div>
            </div>

            {/* Suggestion 5: Donor Ad-Box Sponsorship Grid */}
            <div className="flex flex-col justify-between rounded-xl border border-border bg-background p-4">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <Megaphone className="size-4" />
                    <span>05. Community Sponsor &amp; Ad-Box Grid</span>
                  </span>
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    Active
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Place local business ads and family dedications inside empty calendar cells ($180) and monthly footer banners ($360) with live fundraising totals.
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span className="font-mono text-xs font-medium tabular-nums">
                  {sponsorsCount} sponsors · {sponsorsEnabled ? 'Visible' : 'Hidden'}
                </span>
                {onToggleSponsors && (
                  <button
                    type="button"
                    onClick={onToggleSponsors}
                    className="min-h-[36px] cursor-pointer rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent"
                  >
                    {sponsorsEnabled ? 'Hide Sponsor Ads' : 'Show Sponsor Ads'}
                  </button>
                )}
              </div>
            </div>

            {/* Suggestion 6: Live Webcal Feed & Daily Halachic Clock */}
            <div className="flex flex-col justify-between rounded-xl border border-border bg-background p-4">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <Rss className="size-4" />
                    <span>06. Live Webcal Feed &amp; Halachic Clock</span>
                  </span>
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    Active
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Interactive Today Zmanim dashboard with live countdown to the next halachic time, 7-day mobile scroller, and <code>webcal://</code> subscription URL.
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs font-medium">
                  {calendar.location.city} Live Feed
                </span>
                {onOpenTodayTab && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenTodayTab();
                      onClose();
                    }}
                    className="min-h-[36px] cursor-pointer rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
                  >
                    Open Today &amp; Webcal View
                  </button>
                )}
              </div>
            </div>

            {/* Suggestion 7: Commercial Print Bleed & Crop Marks */}
            <div className="flex flex-col justify-between rounded-xl border border-border bg-background p-4 sm:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                      <Scissors className="size-4" />
                      <span>07. Commercial Print-Shop Crop Marks &amp; 0.125&quot; Bleed Guides</span>
                    </span>
                    <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      Active
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    Add corner trim ticks, registration crosshairs, and 0.125-inch bleed guides on calendar pages so commercial print shops can trim 28-page saddle-stitched wall calendars cleanly.
                  </p>
                </div>
                {onToggleCropMarks && (
                  <button
                    type="button"
                    onClick={onToggleCropMarks}
                    className="min-h-[38px] cursor-pointer rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold hover:bg-accent whitespace-nowrap shrink-0"
                  >
                    {showCropMarks ? 'Hide Print Crop Marks' : 'Enable Print Crop Marks'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'yahrzeits' && (
          <div className="mt-5 flex flex-col gap-5">
            <form
              onSubmit={handleAddHebrewEvent}
              className="rounded-xl border border-border bg-background p-4"
            >
              <h3 className="text-sm font-semibold">
                Add Family Yahrzeit, Hebrew Birthday, or Anniversary
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Automatically appears on the matching Hebrew date across every year in your calendar, CSV, and ICS exports.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    Person or Event Name
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Grandfather Avraham ben Yitzchak"
                    className="mt-1 min-h-[42px] w-full rounded-lg border border-border bg-card px-3 text-xs outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as PersonalHebrewEvent['category'])
                    }
                    className="mt-1 min-h-[42px] w-full rounded-lg border border-border bg-card px-3 text-xs outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="yahrzeit">🕯️ Yahrzeit (In Memory)</option>
                    <option value="birthday">🎉 Hebrew Birthday</option>
                    <option value="anniversary">💍 Wedding Anniversary</option>
                    <option value="community">📌 Community Commemoration</option>
                  </select>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
                <label className="inline-flex min-h-[36px] cursor-pointer items-center gap-1.5">
                  <input
                    type="radio"
                    checked={inputMode === 'hebrew'}
                    onChange={() => setInputMode('hebrew')}
                  />
                  <span>Select Hebrew Date directly</span>
                </label>
                <label className="inline-flex min-h-[36px] cursor-pointer items-center gap-1.5">
                  <input
                    type="radio"
                    checked={inputMode === 'gregorian'}
                    onChange={() => setInputMode('gregorian')}
                  />
                  <span>Convert from English / Gregorian Date</span>
                </label>
              </div>

              {inputMode === 'hebrew' ? (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">
                      Hebrew Day (1–30)
                    </label>
                    <select
                      value={hebrewDay}
                      onChange={(e) => setHebrewDay(Number(e.target.value))}
                      className="mt-1 min-h-[42px] w-full rounded-lg border border-border bg-card px-3 text-xs"
                    >
                      {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>
                          Day {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">
                      Hebrew Month
                    </label>
                    <select
                      value={hebrewMonth}
                      onChange={(e) => setHebrewMonth(Number(e.target.value))}
                      className="mt-1 min-h-[42px] w-full rounded-lg border border-border bg-card px-3 text-xs"
                    >
                      {HEBREW_MONTH_OPTIONS.map((m) => (
                        <option key={m.num} value={m.num}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex flex-wrap items-end gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-muted-foreground">
                      Original Gregorian Date
                    </label>
                    <input
                      type="date"
                      value={gregDateStr}
                      onChange={(e) => setGregDateStr(e.target.value)}
                      className="mt-1 min-h-[42px] w-full rounded-lg border border-border bg-card px-3 text-xs"
                    />
                  </div>
                  <label className="flex min-h-[42px] cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs">
                    <input
                      type="checkbox"
                      checked={afterSunset}
                      onChange={(e) => setAfterSunset(e.target.checked)}
                    />
                    <span>Occurred after sunset (next Hebrew day)</span>
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={!title.trim()}
                className="mt-4 inline-flex min-h-[42px] cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
              >
                <Plus className="size-3.5" />
                <span>Add to Calendar</span>
              </button>
            </form>

            <div className="rounded-xl border border-border bg-background p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Saved Hebrew Dates ({personalHebrewEvents.length})
              </h4>
              {personalHebrewEvents.length === 0 ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  No recurring Hebrew dates added yet. Add a family Yahrzeit or birthday above to see it highlighted in your calendar.
                </p>
              ) : (
                <div className="mt-3 divide-y divide-border">
                  {personalHebrewEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="flex items-center justify-between gap-3 py-2.5 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-foreground">{ev.title}</span>
                        <span className="ml-2 text-muted-foreground">
                          · {ev.hebrewDay} {ev.hebrewMonthName} ({ev.category})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemovePersonalEvent(ev.id)}
                        className="inline-flex min-h-[36px] min-w-[36px] cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-red-600"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'shabbat-flyer' && (
          <div className="mt-5 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Select Shabbat Weekend ({calendar.year})
                </label>
                <select
                  value={selectedShabbatIdx}
                  onChange={(e) => setSelectedShabbatIdx(Number(e.target.value))}
                  className="mt-1 min-h-[42px] rounded-lg border border-border bg-background px-3 text-xs font-medium"
                >
                  {upcomingShabbatPairs.map((pair, idx) => (
                    <option key={idx} value={idx}>
                      {pair.friday?.date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      –{' '}
                      {pair.saturday?.date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      · {pair.saturday?.jewishInfo.parsha ?? pair.saturday?.hebrewDate}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleCopyFlyer}
                className="inline-flex min-h-[42px] cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
              >
                {copiedFlyer ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                <span>{copiedFlyer ? 'Copied to Clipboard!' : 'Copy Bulletin Text'}</span>
              </button>
            </div>

            {fri && sat && (
              <div className="rounded-2xl border border-border bg-background p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <p className="text-xs font-semibold text-primary">
                      Shabbat Schedule · {calendar.location.name}
                    </p>
                    <h3 className="mt-1 font-display text-2xl font-semibold text-foreground">
                      {sat.jewishInfo.parsha ?? 'Shabbat Kodesh'}
                    </h3>
                    <p className="mt-0.5 text-xs font-medium text-chabad">
                      {fri.hebrewDate} – {sat.hebrewDate}, {sat.hebrewYear}
                    </p>
                  </div>
                  <div className="text-left text-xs text-muted-foreground sm:text-right">
                    <p className="font-semibold text-foreground">
                      {fri.date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      –{' '}
                      {sat.date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    <p>{calendar.location.tzid.replace(/_/g, ' ')}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-card p-3.5">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-candle">
                      <Flame className="size-3.5" />
                      <span>Friday · Erev Shabbat</span>
                    </p>
                    <div className="mt-2.5 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Plag HaMincha</span>
                        <span className="font-mono font-medium tabular-nums">
                          {formatZmanTime(fri.zmanim.plagHaMincha, calendar.location.tzid, settings.hour12)}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold text-candle">
                        <span>Candle Lighting ({settings.candleMinutes}m)</span>
                        <span className="font-mono tabular-nums">
                          {formatZmanTime(fri.zmanim.candleLighting, calendar.location.tzid, settings.hour12)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sunset (Shkiah)</span>
                        <span className="font-mono font-medium tabular-nums">
                          {formatZmanTime(fri.zmanim.sunset, calendar.location.tzid, settings.hour12)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-3.5">
                    <p className="text-xs font-semibold text-primary">
                      Saturday · Shabbat Day &amp; Motzei Shabbat
                    </p>
                    <div className="mt-2.5 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sof Zman Shema (MGA / GRA)</span>
                        <span className="font-mono font-medium tabular-nums">
                          {formatZmanTime(sat.zmanim.sofZmanShmaMGA, calendar.location.tzid, settings.hour12, true)}{' '}
                          /{' '}
                          {formatZmanTime(sat.zmanim.sofZmanShma, calendar.location.tzid, settings.hour12)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mincha Gedolah</span>
                        <span className="font-mono font-medium tabular-nums">
                          {formatZmanTime(sat.zmanim.minchaGedola, calendar.location.tzid, settings.hour12)}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold text-candle">
                        <span>Havdalah ({settings.tzeitMinutes}m)</span>
                        <span className="font-mono tabular-nums">
                          {formatZmanTime(sat.zmanim.havdalah, calendar.location.tzid, settings.hour12)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rabbeinu Tam (72m)</span>
                        <span className="font-mono font-medium tabular-nums">
                          {formatZmanTime(sat.zmanim.rabbeinuTam, calendar.location.tzid, settings.hour12)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
