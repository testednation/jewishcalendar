import React, { useState, useMemo } from 'react';
import { Flame, Plus, Trash2, CalendarSearch, ArrowUpRight } from 'lucide-react';
import { HDate } from '@hebcal/core';
import {
  CalendarDay,
  GeneratedCalendar,
  HEBREW_MONTH_OPTIONS,
  PersonalHebrewEvent,
  findYahrzeitOccurrencesInCalendar,
  normalizeHebrewName,
} from '../lib/calendarEngine';

const HEBREW_DAY_LABELS: Record<number, string> = {
  1: '1 (א׳)',
  2: '2 (ב׳)',
  3: '3 (ג׳)',
  4: '4 (ד׳)',
  5: '5 (ה׳)',
  6: '6 (ו׳)',
  7: '7 (ז׳)',
  8: '8 (ח׳)',
  9: '9 (ט׳)',
  10: '10 (י׳)',
  11: '11 (י״א)',
  12: '12 (י״ב)',
  13: '13 (י״ג)',
  14: '14 (י״ד)',
  15: '15 (ט״ו)',
  16: '16 (ט״ז)',
  17: '17 (י״ז)',
  18: '18 (י״ח)',
  19: '19 (י״ט)',
  20: '20 (כ׳)',
  21: '21 (כ״א)',
  22: '22 (כ״ב)',
  23: '23 (כ״ג)',
  24: '24 (כ״ד)',
  25: '25 (כ״ה)',
  26: '26 (כ״ו)',
  27: '27 (כ״ז)',
  28: '28 (כ״ח)',
  29: '29 (כ״ט)',
  30: '30 (ל׳)',
};

export function YahrzeitTracker({
  calendar,
  events,
  onAddEvent,
  onRemoveEvent,
  onLocateDay,
}: {
  calendar: GeneratedCalendar;
  events: PersonalHebrewEvent[];
  onAddEvent: (ev: PersonalHebrewEvent) => void;
  onRemoveEvent: (id: string) => void;
  onLocateDay?: (day: CalendarDay, monthIndex: number) => void;
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<PersonalHebrewEvent['category']>('yahrzeit');
  const [mode, setMode] = useState<'hebrew' | 'gregorian'>('hebrew');
  const [hebrewDay, setHebrewDay] = useState<number>(24);
  const [hebrewMonth, setHebrewMonth] = useState<number>(10); // Tevet
  const [gregDateStr, setGregDateStr] = useState<string>('2024-12-15');
  const [afterSunset, setAfterSunset] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');

  const convertedPreview = useMemo(() => {
    if (mode !== 'gregorian' || !gregDateStr) return null;
    const parsed = new Date(`${gregDateStr}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) return null;
    let hd = new HDate(parsed);
    if (afterSunset) hd = hd.next();
    return {
      day: hd.getDate(),
      month: hd.getMonth() === 13 ? 12 : hd.getMonth(),
      monthName: normalizeHebrewName(hd.getMonthName()),
      year: hd.getFullYear(),
      gematriya: hd.renderGematriya(),
    };
  }, [mode, gregDateStr, afterSunset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    let finalDay = hebrewDay;
    let finalMonth = hebrewMonth;
    let finalMonthName =
      HEBREW_MONTH_OPTIONS.find((m) => m.num === hebrewMonth)?.name ?? 'Tishrei';

    if (mode === 'gregorian' && convertedPreview) {
      finalDay = convertedPreview.day;
      finalMonth = convertedPreview.month;
      finalMonthName = convertedPreview.monthName;
    }

    onAddEvent({
      id: `yz-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      title: trimmed,
      category,
      hebrewDay: finalDay,
      hebrewMonth: finalMonth,
      hebrewMonthName: finalMonthName,
      notes: notes.trim() || undefined,
    });

    setName('');
    setNotes('');
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Flame className="size-4 text-candle" />
          <h2 className="font-display text-base font-semibold">Yahrzeit Tracker</h2>
        </div>
        <span className="font-mono text-xs font-medium text-muted-foreground tabular-nums">
          {events.length} {events.length === 1 ? 'date' : 'dates'}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Enter names and Hebrew dates of passing to automatically mark them on your generated calendar.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground">
            Name (English or Hebrew)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Avraham ben Yitzchak"
            className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-muted-foreground">
              Commemoration Type
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PersonalHebrewEvent['category'])}
              className="mt-1 h-8 w-full rounded-lg border border-border bg-background px-2 text-xs font-medium outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="yahrzeit">🕯️ Yahrzeit (Passing)</option>
              <option value="birthday">🎉 Hebrew Birthday</option>
              <option value="anniversary">💍 Anniversary</option>
              <option value="community">📌 Community Event</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground">
              Date Input Method
            </label>
            <div className="mt-1 grid h-8 grid-cols-2 rounded-lg border border-border bg-muted/40 p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setMode('hebrew')}
                className={`cursor-pointer rounded-md font-medium transition-colors whitespace-nowrap shrink-0 ${
                  mode === 'hebrew'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Hebrew Date
              </button>
              <button
                type="button"
                onClick={() => setMode('gregorian')}
                className={`cursor-pointer rounded-md font-medium transition-colors whitespace-nowrap shrink-0 ${
                  mode === 'gregorian'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Civil Date
              </button>
            </div>
          </div>
        </div>

        {mode === 'hebrew' ? (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-muted-foreground">
                Hebrew Day
              </label>
              <select
                value={hebrewDay}
                onChange={(e) => setHebrewDay(Number(e.target.value))}
                className="mt-1 h-8 w-full rounded-lg border border-border bg-background px-2 text-xs font-medium outline-none focus:ring-2 focus:ring-ring"
              >
                {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {HEBREW_DAY_LABELS[d] ?? d}
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
                className="mt-1 h-8 w-full rounded-lg border border-border bg-background px-2 text-xs font-medium outline-none focus:ring-2 focus:ring-ring"
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
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/20 p-2.5">
            <div>
              <label className="block text-xs font-medium text-muted-foreground">
                Date of Passing (Gregorian)
              </label>
              <input
                type="date"
                value={gregDateStr}
                onChange={(e) => setGregDateStr(e.target.value)}
                className="mt-1 h-8 w-full rounded-lg border border-border bg-background px-2.5 text-xs outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={afterSunset}
                onChange={(e) => setAfterSunset(e.target.checked)}
                className="size-3.5 accent-primary"
              />
              <span>Passed away after sunset (next Hebrew day)</span>
            </label>
            {convertedPreview && (
              <div className="flex items-center justify-between border-t border-border/60 pt-1.5 text-[11px]">
                <span className="text-muted-foreground">Converted Hebrew Date:</span>
                <span className="font-semibold text-chabad">
                  {convertedPreview.day} {convertedPreview.monthName} ({convertedPreview.gematriya.split(' ').slice(0, 2).join(' ')})
                </span>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={!name.trim()}
          className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-95 disabled:opacity-40 whitespace-nowrap shrink-0"
        >
          <Plus className="size-3.5" />
          <span>Mark Date on Calendar</span>
        </button>
      </form>

      {/* Tracked Yahrzeit List */}
      <div className="mt-4 border-t border-border pt-3">
        <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
          <span>Marked on {calendar.year} Calendar</span>
          <span>Click to locate</span>
        </div>

        {events.length === 0 ? (
          <div className="mt-2.5 rounded-xl border border-dashed border-border bg-muted/15 p-3 text-center text-xs text-muted-foreground">
            <CalendarSearch className="mx-auto mb-1 size-4 opacity-60" />
            <p>No Yahrzeits added yet. Add a name and Hebrew date above to mark your calendar.</p>
          </div>
        ) : (
          <div className="mt-2.5 flex max-h-60 flex-col gap-2 overflow-y-auto pr-0.5">
            {events.map((ev) => {
              const matches = findYahrzeitOccurrencesInCalendar(ev, calendar);
              const firstMatch = matches[0];
              const gregLabel = firstMatch
                ? firstMatch.day.date.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Outside displayed range';

              return (
                <div
                  key={ev.id}
                  className="group flex items-center justify-between gap-2 rounded-xl border border-border bg-background p-2.5 text-xs transition-colors hover:border-candle/50"
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (firstMatch && onLocateDay) {
                        onLocateDay(firstMatch.day, firstMatch.monthIndex);
                      }
                    }}
                    className="flex min-w-0 flex-1 cursor-pointer flex-col text-left"
                  >
                    <div className="flex items-center gap-1.5">
                      <Flame className="size-3 shrink-0 text-candle" />
                      <span className="truncate font-semibold text-foreground">
                        {ev.title}
                      </span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[11px] text-muted-foreground">
                      <span className="font-medium text-chabad">
                        {ev.hebrewDay} {ev.hebrewMonthName}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{gregLabel}</span>
                      {firstMatch && (
                        <ArrowUpRight className="inline size-3 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    aria-label={`Remove ${ev.title}`}
                    onClick={() => onRemoveEvent(ev.id)}
                    className="cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-red-600"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
