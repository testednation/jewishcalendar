import React, { useState, useMemo } from 'react';
import {
  Clock,
  Flame,
  Sun,
  BookOpen,
  CalendarPlus,
  Check,
  Copy,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  LocateFixed,
} from 'lucide-react';
import {
  CalendarDay,
  CalendarSettings,
  CustomCalendarEvent,
  GeneratedCalendar,
  PersonalHebrewEvent,
  WEEKDAY_NAMES,
  ZMANIM_LIST,
  formatZmanTime,
  getEventsForDay,
} from '../lib/calendarEngine';

export function TodayZmanimView({
  calendar,
  settings,
  specialEvents,
  personalHebrewEvents,
  customEvents = [],
  onExportIcs,
  onDetectLocation,
  detectingGeo = false,
}: {
  calendar: GeneratedCalendar;
  settings: CalendarSettings;
  specialEvents: Record<string, string[]>;
  personalHebrewEvents: PersonalHebrewEvent[];
  customEvents?: CustomCalendarEvent[];
  onExportIcs: () => void;
  onDetectLocation?: () => void;
  detectingGeo?: boolean;
}) {
  const allDays = useMemo(
    () =>
      calendar.months.flatMap((m) =>
        m.weeks.flat().filter((d): d is CalendarDay => d !== null)
      ),
    [calendar]
  );

  const initialIdx = useMemo(() => {
    const todayIdx = allDays.findIndex((d) => d.isToday);
    return todayIdx >= 0 ? todayIdx : 0;
  }, [allDays]);

  const [selectedIdx, setSelectedIdx] = useState<number>(initialIdx);
  const [copiedWebcal, setCopiedWebcal] = useState<boolean>(false);

  const activeDay = allDays[selectedIdx] ?? allDays[0];

  // 7-day horizontal scroller window centered around selectedIdx
  const stripStart = Math.max(0, Math.min(selectedIdx - 3, allDays.length - 7));
  const weekStrip = allDays.slice(stripStart, stripStart + 7);

  // Determine the next upcoming Zman for the selected day
  const nextZmanHighlight = useMemo(() => {
    if (!activeDay) return null;
    const now = new Date();
    for (const item of ZMANIM_LIST) {
      const zDate = activeDay.zmanim[item.key];
      if (zDate && zDate.getTime() > now.getTime()) {
        const diffMins = Math.max(1, Math.round((zDate.getTime() - now.getTime()) / 60000));
        const hrs = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return {
          label: item.label,
          timeStr: formatZmanTime(zDate, calendar.location.tzid, settings.hour12),
          countdown: hrs > 0 ? `in ${hrs}h ${mins}m` : `in ${mins}m`,
        };
      }
    }
    return {
      label: 'Sunrise (Netz HaChama)',
      timeStr: formatZmanTime(activeDay.zmanim.sunrise, calendar.location.tzid, settings.hour12),
      countdown: 'Daily Schedule',
    };
  }, [activeDay, calendar.location.tzid, settings.hour12]);

  const webcalUrl = useMemo(() => {
    const host = typeof window !== 'undefined' ? window.location.host : 'luach.app';
    const citySlug = calendar.location.city.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `webcal://${host}/feeds/${citySlug}-${calendar.year}-${settings.minhag}.ics`;
  }, [calendar.location.city, calendar.year, settings.minhag]);

  const handleCopyWebcal = () => {
    navigator.clipboard?.writeText(webcalUrl);
    setCopiedWebcal(true);
    setTimeout(() => setCopiedWebcal(false), 2200);
  };

  if (!activeDay) return null;

  const dayEvents = getEventsForDay(
    activeDay,
    specialEvents,
    personalHebrewEvents,
    customEvents
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 pb-16">
      {/* Header & Horizontal 7-Day Touch Scroller */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold text-primary">
                Daily Halachic Clock · {calendar.location.name}
              </p>
              <span className="rounded-md border border-border bg-muted/40 px-2 py-0.5 font-mono text-[10px] font-medium tabular-nums text-muted-foreground">
                Lat {calendar.location.latitude.toFixed(4)}° · Lon {calendar.location.longitude.toFixed(4)}°
              </span>
              {onDetectLocation && (
                <button
                  type="button"
                  onClick={onDetectLocation}
                  disabled={detectingGeo}
                  className="inline-flex min-h-[28px] cursor-pointer items-center gap-1 rounded-lg border border-primary/35 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/15 disabled:opacity-50"
                >
                  {detectingGeo ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <LocateFixed className="size-3" />
                  )}
                  <span>{detectingGeo ? 'Detecting…' : 'Detect My Location'}</span>
                </button>
              )}
            </div>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground">
              {activeDay.hebrewDate}, {activeDay.hebrewYear}
            </h2>
            <p className="text-xs text-muted-foreground">
              {activeDay.date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}{' '}
              · {activeDay.hebrewGematriya}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous day"
              onClick={() => setSelectedIdx((i) => Math.max(0, i - 1))}
              className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Next day"
              onClick={() => setSelectedIdx((i) => Math.min(allDays.length - 1, i + 1))}
              className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Date Strip (Mobile Touch Pattern 4A) */}
        <div className="mt-4 grid grid-cols-7 gap-1.5">
          {weekStrip.map((d) => {
            const idxInAll = allDays.indexOf(d);
            const isSelected = idxInAll === selectedIdx;
            return (
              <button
                key={d.date.toISOString()}
                type="button"
                onClick={() => setSelectedIdx(idxInAll)}
                className={`flex min-h-[56px] cursor-pointer flex-col items-center justify-center rounded-2xl border px-1 py-2 transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                    : d.isToday
                    ? 'border-primary/50 bg-primary/10 text-foreground'
                    : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <span className="text-[10px] font-medium uppercase">
                  {WEEKDAY_NAMES[d.weekday]}
                </span>
                <span className="mt-0.5 font-mono text-sm font-bold tabular-nums">
                  {d.gregDay}
                </span>
                <span
                  className={`text-[9px] font-medium ${
                    isSelected ? 'text-primary-foreground/85' : 'text-chabad'
                  }`}
                >
                  {d.hebrewDay}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Top Metric Cards (Next Zman + Sunrise/Sunset or Candle Lighting) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {nextZmanHighlight && (
          <div className="flex flex-col justify-between rounded-3xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
                <Clock className="size-4" />
                <span>Next Halachic Zman</span>
              </span>
              <span className="font-mono font-medium text-foreground">
                {nextZmanHighlight.countdown}
              </span>
            </div>
            <div className="mt-3">
              <p className="font-mono text-3xl font-bold tracking-tight tabular-nums text-foreground">
                {nextZmanHighlight.timeStr}
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                {nextZmanHighlight.label}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col justify-between rounded-3xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 font-semibold text-candle">
              {activeDay.zmanim.candleLighting || activeDay.zmanim.havdalah ? (
                <Flame className="size-4" />
              ) : (
                <Sun className="size-4 text-primary" />
              )}
              <span>
                {activeDay.zmanim.havdalah && activeDay.zmanim.havdalahType === 'yom-tov'
                  ? 'Motzei Yom Tov · Havdalah'
                  : activeDay.zmanim.candleLighting
                  ? 'Erev Shabbat / Yom Tov'
                  : activeDay.zmanim.havdalah
                  ? 'Motzei Shabbat / Havdalah'
                  : 'Solar Horizon'}
              </span>
            </span>
            <span>{calendar.location.city}</span>
          </div>

          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-4">
            {activeDay.zmanim.candleLighting && (
              <div>
                <p className="font-mono text-2xl font-bold tabular-nums text-candle sm:text-3xl">
                  {formatZmanTime(
                    activeDay.zmanim.candleLighting,
                    calendar.location.tzid,
                    settings.hour12
                  )}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {activeDay.zmanim.candleLightingType === 'after-nightfall'
                    ? 'Yom Tov Candle Lighting (after nightfall)'
                    : `Candle Lighting (${settings.candleMinutes}m before sunset)`}
                </p>
              </div>
            )}
            {activeDay.zmanim.havdalah && (
              <div>
                <p className="font-mono text-2xl font-bold tabular-nums text-candle sm:text-3xl">
                  {formatZmanTime(
                    activeDay.zmanim.havdalah,
                    calendar.location.tzid,
                    settings.hour12
                  )}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {activeDay.zmanim.havdalahType === 'yom-tov'
                    ? `Yom Tov Havdalah (${settings.tzeitMinutes}m after sunset)`
                    : activeDay.zmanim.havdalahType === 'yaknahaz'
                    ? 'Havdalah · Yaknahaz (with Yom Tov Kiddush)'
                    : `Shabbat Havdalah (${settings.tzeitMinutes}m after sunset)`}
                </p>
              </div>
            )}
            {!activeDay.zmanim.candleLighting && !activeDay.zmanim.havdalah && (
              <div className="flex w-full items-center justify-between">
                <div>
                  <p className="font-mono text-2xl font-bold tabular-nums text-foreground">
                    {formatZmanTime(
                      activeDay.zmanim.sunrise,
                      calendar.location.tzid,
                      settings.hour12
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">Sunrise (Netz)</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-2xl font-bold tabular-nums text-foreground">
                    {formatZmanTime(
                      activeDay.zmanim.sunset,
                      calendar.location.tzid,
                      settings.hour12
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">Sunset (Shkiah)</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Holidays, Yahrzeits & Daily Study Card */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
        <h3 className="flex items-center gap-2 font-display text-base font-semibold">
          <BookOpen className="size-4 text-primary" />
          <span>Daily Torah Study, Holidays &amp; Yahrzeits</span>
        </h3>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background p-3.5 text-xs">
            <span className="font-semibold text-foreground">Chitas &amp; Parsha</span>
            <p className="mt-1 text-muted-foreground">
              {activeDay.jewishInfo.parsha ? `${activeDay.jewishInfo.parsha} · ` : ''}
              {activeDay.jewishInfo.chitas}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background p-3.5 text-xs">
            <span className="font-semibold text-foreground">Daf Yomi &amp; Daily Rambam</span>
            <p className="mt-1 text-muted-foreground">
              {activeDay.jewishInfo.dafYomi} · {activeDay.jewishInfo.rambam}
            </p>
          </div>
        </div>

        {(activeDay.holidays.length > 0 || dayEvents.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3 text-xs">
            {activeDay.holidays.map((h, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 font-semibold text-primary"
              >
                <Sparkles className="size-3.5" />
                <span>{h.name}</span>
              </span>
            ))}
            {dayEvents.map((ev, i) => (
              <span
                key={`ev-${i}`}
                className="inline-flex items-center gap-1.5 font-semibold text-candle"
              >
                <span>{ev}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Complete 13 Halachic Zmanim Table */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold">
            All 13 Halachic Zmanim
          </h3>
          <span className="text-xs text-muted-foreground">
            {settings.zmanimProfile === 'chabad'
              ? 'Baal HaTanya / Chabad'
              : settings.zmanimProfile === 'ovadia-yosef'
              ? 'Harav Ovadia Yosef'
              : 'Vilna Gaon (GRA)'}
          </span>
        </div>

        <div className="divide-y divide-border/60">
          {ZMANIM_LIST.map(({ key, label, heLabel }) => (
            <div
              key={key}
              className="flex min-h-[44px] items-center justify-between gap-4 py-2 text-xs"
            >
              <span className="text-muted-foreground">
                {label}{' '}
                {settings.bilingual && (
                  <span dir="rtl" className="ml-1 opacity-75">
                    · {heLabel}
                  </span>
                )}
              </span>
              <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                {formatZmanTime(activeDay.zmanim[key], calendar.location.tzid, settings.hour12)}
              </span>
            </div>
          ))}

          {activeDay.zmanim.candleLighting && (
            <div className="flex min-h-[44px] items-center justify-between gap-4 py-2 text-xs font-semibold text-candle">
              <span className="inline-flex items-center gap-1.5">
                <Flame className="size-3.5" />
                <span>
                  {activeDay.zmanim.candleLightingType === 'after-nightfall'
                    ? 'Yom Tov Candle Lighting (After Nightfall)'
                    : 'Candle Lighting'}
                </span>
                {settings.bilingual && (
                  <span dir="rtl" className="ml-1 opacity-80">
                    · הדלקת נרות
                  </span>
                )}
              </span>
              <span className="font-mono text-sm font-bold tabular-nums">
                {formatZmanTime(
                  activeDay.zmanim.candleLighting,
                  calendar.location.tzid,
                  settings.hour12
                )}
              </span>
            </div>
          )}

          {activeDay.zmanim.havdalah && (
            <div className="flex min-h-[44px] items-center justify-between gap-4 py-2 text-xs font-semibold text-candle">
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="size-3.5" />
                <span>
                  {activeDay.zmanim.havdalahType === 'yom-tov'
                    ? 'Yom Tov Havdalah (Motzei Yom Tov)'
                    : activeDay.zmanim.havdalahType === 'yaknahaz'
                    ? 'Havdalah · Yaknahaz'
                    : 'Motzei Shabbat Havdalah'}
                </span>
                {settings.bilingual && (
                  <span dir="rtl" className="ml-1 opacity-80">
                    · {activeDay.zmanim.havdalahType === 'yom-tov' ? 'הבדלה למוצאי יו״ט' : 'הבדלה'}
                  </span>
                )}
              </span>
              <span className="font-mono text-sm font-bold tabular-nums">
                {formatZmanTime(
                  activeDay.zmanim.havdalah,
                  calendar.location.tzid,
                  settings.hour12
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Live Webcal Subscription Feed Card */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <CalendarPlus className="size-4 text-primary" />
          <h3 className="font-display text-base font-semibold">
            Live Calendar Feed (`webcal://`) &amp; ICS Sync
          </h3>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Subscribe in Apple Calendar, Google Calendar, or Outlook to keep local candle lighting, holidays, and your tracked Yahrzeits synced on your phone.
        </p>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            readOnly
            value={webcalUrl}
            className="h-11 flex-1 rounded-xl border border-border bg-background px-3 font-mono text-xs text-muted-foreground outline-none"
          />
          <button
            type="button"
            onClick={handleCopyWebcal}
            className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground whitespace-nowrap shrink-0"
          >
            {copiedWebcal ? <Check className="size-4" /> : <Copy className="size-4" />}
            <span>{copiedWebcal ? 'Copied Feed URL!' : 'Copy webcal:// URL'}</span>
          </button>
          <button
            type="button"
            onClick={onExportIcs}
            className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-4 text-xs font-semibold text-foreground hover:bg-accent whitespace-nowrap shrink-0"
          >
            <Download className="size-4 text-primary" />
            <span>Download .ICS File</span>
          </button>
        </div>
      </div>
    </div>
  );
}
