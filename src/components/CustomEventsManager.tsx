import React, { useState } from 'react';
import {
  CalendarPlus,
  CalendarRange,
  Clock,
  MapPin,
  Plus,
  Repeat,
  Trash2,
} from 'lucide-react';
import {
  CalendarDay,
  CustomCalendarEvent,
  CustomEventRecurrence,
  GREGORIAN_MONTH_NAMES,
  GeneratedCalendar,
  HEBREW_MONTH_OPTIONS,
  SHORT_MONTH_NAMES,
  WEEKDAY_NAMES,
  findCustomEventOccurrencesInCalendar,
} from '../lib/calendarEngine';

export const DEFAULT_CUSTOM_EVENTS: CustomCalendarEvent[] = [
  {
    id: 'default-custom-1',
    title: 'Weekly Parsha & Chassidus Shiur',
    timeLabel: '8:00 PM',
    category: 'shiur',
    recurrence: 'weekly',
    weekday: 2, // Tuesday
  },
  {
    id: 'default-custom-2',
    title: "Rosh Chodesh Women's Circle",
    timeLabel: '7:30 PM',
    category: 'community',
    recurrence: 'monthly-hebrew',
    hebrewDay: 1,
  },
];

function formatRecurrenceSummary(ev: CustomCalendarEvent): string {
  switch (ev.recurrence) {
    case 'one-time':
      return `One-time · ${ev.dateKey ?? ''}`;
    case 'weekly':
      return `Every ${WEEKDAY_NAMES[ev.weekday ?? 0]}`;
    case 'monthly-gregorian':
      return `Monthly · Day ${ev.gregDay ?? 1}`;
    case 'monthly-hebrew':
      return `Every Hebrew Month · Day ${ev.hebrewDay ?? 1}`;
    case 'yearly-gregorian':
      return `Annually · ${SHORT_MONTH_NAMES[ev.gregMonth ?? 0]} ${ev.gregDay ?? 1}`;
    case 'yearly-hebrew':
      return `Annually · ${ev.hebrewDay ?? 1} ${ev.hebrewMonthName ?? 'Tishrei'}`;
    default:
      return 'Custom schedule';
  }
}

export function CustomEventsManager({
  calendar,
  customEvents,
  onAddCustomEvent,
  onRemoveCustomEvent,
  onLocateDay,
}: {
  calendar: GeneratedCalendar;
  customEvents: CustomCalendarEvent[];
  onAddCustomEvent: (ev: CustomCalendarEvent) => void;
  onRemoveCustomEvent: (id: string) => void;
  onLocateDay: (day: CalendarDay, monthIndex: number) => void;
}) {
  const defaultDateStr = `${calendar.year}-${String(
    (calendar.months[0]?.gregMonth ?? 0) + 1
  ).padStart(2, '0')}-15`;

  const [title, setTitle] = useState('');
  const [timeLabel, setTimeLabel] = useState('');
  const [category, setCategory] =
    useState<CustomCalendarEvent['category']>('community');
  const [recurrence, setRecurrence] = useState<CustomEventRecurrence>('one-time');
  const [dateKey, setDateKey] = useState(defaultDateStr);
  const [weekday, setWeekday] = useState<number>(2); // Tuesday
  const [gregMonth, setGregMonth] = useState<number>(0);
  const [gregDay, setGregDay] = useState<number>(1);
  const [hebrewMonth, setHebrewMonth] = useState<number>(7); // Tishrei
  const [hebrewDay, setHebrewDay] = useState<number>(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    const hebMonthName =
      HEBREW_MONTH_OPTIONS.find((m) => m.num === hebrewMonth)?.name ?? 'Tishrei';

    const nextEvent: CustomCalendarEvent = {
      id: `custom-ev-${Date.now().toString(36)}`,
      title: cleanTitle,
      timeLabel: timeLabel.trim() || undefined,
      category,
      recurrence,
      dateKey: recurrence === 'one-time' ? dateKey : undefined,
      weekday: recurrence === 'weekly' ? weekday : undefined,
      gregMonth: recurrence === 'yearly-gregorian' ? gregMonth : undefined,
      gregDay:
        recurrence === 'monthly-gregorian' || recurrence === 'yearly-gregorian'
          ? gregDay
          : undefined,
      hebrewMonth: recurrence === 'yearly-hebrew' ? hebrewMonth : undefined,
      hebrewMonthName: recurrence === 'yearly-hebrew' ? hebMonthName : undefined,
      hebrewDay:
        recurrence === 'monthly-hebrew' || recurrence === 'yearly-hebrew'
          ? hebrewDay
          : undefined,
    };

    onAddCustomEvent(nextEvent);
    setTitle('');
    setTimeLabel('');
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <CalendarPlus className="size-4 text-primary" />
            <h2 className="font-display text-base font-semibold">
              Add Custom Events
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Schedule one-time or recurring community programs, shiurim, and reminders directly onto the calendar grids.
          </p>
        </div>
        <span className="font-mono text-xs font-semibold tabular-nums text-primary">
          {customEvents.length} active
        </span>
      </div>

      {/* Add Custom Event Form */}
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2.5">
        <div>
          <label className="block text-xs font-medium text-muted-foreground">
            Event title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Weekly Torah Class, Community Shabbat Dinner…"
            className="mt-1 min-h-[40px] w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-muted-foreground">
              Frequency / Recurrence
            </label>
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as CustomEventRecurrence)}
              className="mt-1 min-h-[40px] w-full rounded-lg border border-border bg-background px-2 text-xs font-medium outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="one-time">One-Time Date</option>
              <option value="weekly">Weekly (Every Week)</option>
              <option value="monthly-hebrew">Monthly (Hebrew Day)</option>
              <option value="monthly-gregorian">Monthly (Secular Day)</option>
              <option value="yearly-hebrew">Yearly (Hebrew Date)</option>
              <option value="yearly-gregorian">Yearly (Secular Date)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground">
              Time (optional)
            </label>
            <div className="relative mt-1">
              <Clock className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={timeLabel}
                onChange={(e) => setTimeLabel(e.target.value)}
                placeholder="e.g. 7:30 PM"
                className="min-h-[40px] w-full rounded-lg border border-border bg-background pl-8 pr-2.5 font-mono text-xs outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Recurrence Schedule Fields */}
        {recurrence === 'one-time' && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-muted-foreground">
                Event Date
              </label>
              <input
                type="date"
                value={dateKey}
                onChange={(e) => setDateKey(e.target.value)}
                className="mt-1 min-h-[40px] w-full rounded-lg border border-border bg-background px-2.5 font-mono text-xs outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground">
                Category
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as CustomCalendarEvent['category'])
                }
                className="mt-1 min-h-[40px] w-full rounded-lg border border-border bg-background px-2 text-xs font-medium"
              >
                <option value="community">Community Event</option>
                <option value="shiur">Torah Class / Shiur</option>
                <option value="simcha">Simcha / Celebration</option>
                <option value="holiday-program">Holiday Program</option>
                <option value="reminder">Reminder</option>
              </select>
            </div>
          </div>
        )}

        {recurrence === 'weekly' && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-muted-foreground">
                Day of the Week
              </label>
              <select
                value={weekday}
                onChange={(e) => setWeekday(Number(e.target.value))}
                className="mt-1 min-h-[40px] w-full rounded-lg border border-border bg-background px-2.5 text-xs font-medium"
              >
                {WEEKDAY_NAMES.map((name, idx) => (
                  <option key={name} value={idx}>
                    Every {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground">
                Category
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as CustomCalendarEvent['category'])
                }
                className="mt-1 min-h-[40px] w-full rounded-lg border border-border bg-background px-2 text-xs font-medium"
              >
                <option value="shiur">Torah Class / Shiur</option>
                <option value="community">Community Event</option>
                <option value="simcha">Simcha / Celebration</option>
                <option value="holiday-program">Holiday Program</option>
                <option value="reminder">Reminder</option>
              </select>
            </div>
          </div>
        )}

        {recurrence === 'monthly-gregorian' && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-muted-foreground">
                Day of Month (1–31)
              </label>
              <select
                value={gregDay}
                onChange={(e) => setGregDay(Number(e.target.value))}
                className="mt-1 min-h-[40px] w-full rounded-lg border border-border bg-background px-2.5 font-mono text-xs font-medium"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    Day {d} of every month
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground">
                Category
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as CustomCalendarEvent['category'])
                }
                className="mt-1 min-h-[40px] w-full rounded-lg border border-border bg-background px-2 text-xs font-medium"
              >
                <option value="community">Community Event</option>
                <option value="shiur">Torah Class / Shiur</option>
                <option value="reminder">Reminder</option>
              </select>
            </div>
          </div>
        )}

        {recurrence === 'monthly-hebrew' && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-muted-foreground">
                Hebrew Day of Month (1–30)
              </label>
              <select
                value={hebrewDay}
                onChange={(e) => setHebrewDay(Number(e.target.value))}
                className="mt-1 min-h-[40px] w-full rounded-lg border border-border bg-background px-2.5 font-mono text-xs font-medium"
              >
                {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d === 1 ? '1st (Rosh Chodesh)' : `Hebrew Day ${d}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground">
                Category
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as CustomCalendarEvent['category'])
                }
                className="mt-1 min-h-[40px] w-full rounded-lg border border-border bg-background px-2 text-xs font-medium"
              >
                <option value="community">Community Event</option>
                <option value="shiur">Torah Class / Shiur</option>
                <option value="holiday-program">Holiday Program</option>
              </select>
            </div>
          </div>
        )}

        {recurrence === 'yearly-gregorian' && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-muted-foreground">
                Secular Month
              </label>
              <select
                value={gregMonth}
                onChange={(e) => setGregMonth(Number(e.target.value))}
                className="mt-1 min-h-[40px] w-full rounded-lg border border-border bg-background px-2.5 text-xs font-medium"
              >
                {GREGORIAN_MONTH_NAMES.map((mName, idx) => (
                  <option key={mName} value={idx}>
                    {mName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground">
                Day of Month
              </label>
              <select
                value={gregDay}
                onChange={(e) => setGregDay(Number(e.target.value))}
                className="mt-1 min-h-[40px] w-full rounded-lg border border-border bg-background px-2.5 font-mono text-xs font-medium"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    Day {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {recurrence === 'yearly-hebrew' && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-muted-foreground">
                Hebrew Day
              </label>
              <select
                value={hebrewDay}
                onChange={(e) => setHebrewDay(Number(e.target.value))}
                className="mt-1 min-h-[40px] w-full rounded-lg border border-border bg-background px-2.5 font-mono text-xs font-medium"
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
                className="mt-1 min-h-[40px] w-full rounded-lg border border-border bg-background px-2.5 text-xs font-medium"
              >
                {HEBREW_MONTH_OPTIONS.map((m) => (
                  <option key={m.num} value={m.num}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!title.trim()}
          className="mt-1 inline-flex min-h-[40px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-95 disabled:opacity-50"
        >
          <Plus className="size-3.5" />
          <span>
            {recurrence === 'one-time'
              ? 'Add One-Time Event to Calendar'
              : 'Add Recurring Event to Calendar'}
          </span>
        </button>
      </form>

      {/* Active Custom Events List */}
      <div className="mt-4 border-t border-border pt-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Scheduled Custom Events</span>
          <span>Click date to view in grid</span>
        </div>

        {customEvents.length === 0 ? (
          <p className="mt-2 rounded-xl border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
            No custom events yet. Add a one-time date or recurring weekly/monthly schedule above.
          </p>
        ) : (
          <div className="mt-2 flex max-h-60 flex-col gap-2 overflow-y-auto pr-0.5">
            {customEvents.map((ev) => {
              const matches = findCustomEventOccurrencesInCalendar(ev, calendar);
              const firstMatch = matches[0];

              return (
                <div
                  key={ev.id}
                  className="flex items-start justify-between gap-2 rounded-xl border border-border bg-muted/20 p-2.5 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {ev.recurrence === 'one-time' ? (
                        <CalendarRange className="size-3.5 shrink-0 text-primary" />
                      ) : (
                        <Repeat className="size-3.5 shrink-0 text-chabad" />
                      )}
                      <span className="truncate font-semibold text-foreground">
                        {ev.title}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                      <span>{formatRecurrenceSummary(ev)}</span>
                      {ev.timeLabel && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-candle">{ev.timeLabel}</span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums text-primary">
                        {matches.length} {matches.length === 1 ? 'date' : 'dates'}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {firstMatch && (
                      <button
                        type="button"
                        onClick={() => onLocateDay(firstMatch.day, firstMatch.monthIndex)}
                        title="Jump to first occurrence on calendar"
                        className="inline-flex min-h-[30px] cursor-pointer items-center gap-1 rounded-md border border-border bg-background px-2 py-1 font-mono text-[10px] font-medium text-foreground hover:bg-accent"
                      >
                        <MapPin className="size-2.5 text-primary" />
                        <span>
                          {SHORT_MONTH_NAMES[firstMatch.day.gregMonth]}{' '}
                          {firstMatch.day.gregDay}
                        </span>
                      </button>
                    )}
                    <button
                      type="button"
                      aria-label={`Remove ${ev.title}`}
                      onClick={() => onRemoveCustomEvent(ev.id)}
                      className="inline-flex min-h-[30px] cursor-pointer items-center justify-center rounded-md border border-border bg-background px-1.5 text-muted-foreground hover:bg-accent hover:text-red-600"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
