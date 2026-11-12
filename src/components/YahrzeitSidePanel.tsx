import React, { useState, useMemo } from 'react';
import {
  Flame,
  Plus,
  Trash2,
  CalendarSearch,
  ArrowUpRight,
  Sparkles,
  Calendar as CalendarIcon,
  Search,
  Heart,
  BookOpen,
  Info,
  Clock,
  X,
  Maximize2,
  Minimize2,
  Check,
  Eye,
  EyeOff,
  Share2,
} from 'lucide-react';
import {
  CalendarDay,
  GeneratedCalendar,
  HEBREW_MONTH_OPTIONS,
  PersonalHebrewEvent,
  WEEKDAY_NAMES,
  calculateHebrewDateOfPassing,
  calculateYahrzeitOccurrenceForYear,
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

const RELATIONSHIP_OPTIONS = [
  { id: 'father', label: 'Father (אבא)', badge: 'Father' },
  { id: 'mother', label: 'Mother (אמא)', badge: 'Mother' },
  { id: 'grandfather', label: 'Grandfather (סבא)', badge: 'Grandfather' },
  { id: 'grandmother', label: 'Grandmother (סבתא)', badge: 'Grandmother' },
  { id: 'spouse', label: 'Spouse (בן/בת זוג)', badge: 'Spouse' },
  { id: 'husband', label: 'Husband (בעל)', badge: 'Husband' },
  { id: 'wife', label: 'Wife (אישה)', badge: 'Wife' },
  { id: 'son', label: 'Son (בן)', badge: 'Son' },
  { id: 'daughter', label: 'Daughter (בת)', badge: 'Daughter' },
  { id: 'brother', label: 'Brother (אח)', badge: 'Brother' },
  { id: 'sister', label: 'Sister (אחות)', badge: 'Sister' },
  { id: 'rebbe', label: 'Rebbe / Rabbi (רב/רבי)', badge: 'Rabbi' },
  { id: 'friend', label: 'Friend (חבר/ידיד)', badge: 'Friend' },
  { id: 'other', label: 'Loved One (קרוב/יקיר)', badge: 'Loved One' },
];

const MEMORIAL_CUSTOMS = [
  { id: 'candle', label: 'Light 24-hr Memorial Candle at sunset' },
  { id: 'kaddish', label: 'Recite Mourner’s Kaddish at services' },
  { id: 'mishnayot', label: 'Learn Mishnayot for the Neshamah' },
  { id: 'tzedakah', label: 'Give Tzedakah (Charity) in memory' },
  { id: 'kiddush', label: 'Sponsor Shabbat Kiddush / Farbrengen' },
  { id: 'kever', label: 'Visit Cemetery / Gravesite (Kever)' },
];

export interface YahrzeitSidePanelProps {
  calendar: GeneratedCalendar;
  events: PersonalHebrewEvent[];
  onAddEvent: (ev: PersonalHebrewEvent) => void;
  onRemoveEvent: (id: string) => void;
  onUpdateEvent?: (ev: PersonalHebrewEvent) => void;
  onLocateDay?: (day: CalendarDay, monthIndex: number) => void;
  variant?: 'sidebar' | 'drawer';
  isOpen?: boolean;
  onClose?: () => void;
  onOpenDrawer?: () => void;
}

export function YahrzeitSidePanel({
  calendar,
  events,
  onAddEvent,
  onRemoveEvent,
  onUpdateEvent,
  onLocateDay,
  variant = 'sidebar',
  isOpen = true,
  onClose,
  onOpenDrawer,
}: YahrzeitSidePanelProps) {
  const [activeTab, setActiveTab] = useState<'add' | 'list' | 'kaddish'>('add');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [hebrewName, setHebrewName] = useState('');
  const [relationship, setRelationship] = useState('father');
  const [inputMode, setInputMode] = useState<'civil' | 'hebrew'>('civil');
  const [gregDateStr, setGregDateStr] = useState('1998-11-14');
  const [afterSunset, setAfterSunset] = useState(false);
  const [hebrewDay, setHebrewDay] = useState(24);
  const [hebrewMonth, setHebrewMonth] = useState(10); // Tevet
  const [hebrewYearInput, setHebrewYearInput] = useState('');
  const [observances, setObservances] = useState<string[]>(['candle', 'kaddish', 'tzedakah']);
  const [notes, setNotes] = useState('');

  // Auto-calculated passing date from Gregorian date
  const convertedPassing = useMemo(() => {
    if (inputMode !== 'civil' || !gregDateStr) return null;
    return calculateHebrewDateOfPassing(gregDateStr, afterSunset);
  }, [inputMode, gregDateStr, afterSunset]);

  // Selected or derived Hebrew day & month
  const effectiveHebrewDay = inputMode === 'civil' ? (convertedPassing?.hebrewDay ?? 24) : hebrewDay;
  const effectiveHebrewMonth = inputMode === 'civil' ? (convertedPassing?.hebrewMonth ?? 10) : hebrewMonth;
  const effectiveHebrewYear = inputMode === 'civil' ? convertedPassing?.hebrewYear : (hebrewYearInput ? Number(hebrewYearInput) : undefined);

  // Auto-calculated occurrence in the current calendar year
  const calculatedCurrentOccurrence = useMemo(() => {
    return calculateYahrzeitOccurrenceForYear(
      effectiveHebrewDay,
      effectiveHebrewMonth,
      calendar.year,
      effectiveHebrewYear
    );
  }, [effectiveHebrewDay, effectiveHebrewMonth, calendar.year, effectiveHebrewYear]);

  const toggleCustomObservance = (id: string) => {
    setObservances((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleEventEnabled = (ev: PersonalHebrewEvent) => {
    if (!onUpdateEvent) return;
    onUpdateEvent({
      ...ev,
      enabled: !(ev.enabled ?? true),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    let finalDay = hebrewDay;
    let finalMonth = hebrewMonth;
    let finalMonthName =
      HEBREW_MONTH_OPTIONS.find((m) => m.num === hebrewMonth)?.name ?? 'Tishrei';
    let finalHebrewYear = hebrewYearInput ? Number(hebrewYearInput) : undefined;

    if (inputMode === 'civil' && convertedPassing) {
      finalDay = convertedPassing.hebrewDay;
      finalMonth = convertedPassing.hebrewMonth;
      finalMonthName = convertedPassing.hebrewMonthName;
      finalHebrewYear = convertedPassing.hebrewYear;
    }

    const relObj = RELATIONSHIP_OPTIONS.find((r) => r.id === relationship);

    onAddEvent({
      id: `yz-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      title: trimmed,
      category: 'yahrzeit',
      hebrewDay: finalDay,
      hebrewMonth: finalMonth,
      hebrewMonthName: finalMonthName,
      relationship: relObj?.badge ?? 'Loved One',
      hebrewName: hebrewName.trim() || undefined,
      dateOfPassing: inputMode === 'civil' ? gregDateStr : undefined,
      afterSunset: inputMode === 'civil' ? afterSunset : undefined,
      hebrewYearOfPassing: finalHebrewYear,
      observances,
      notes: notes.trim() || undefined,
      enabled: true,
    });

    setName('');
    setHebrewName('');
    setNotes('');
    setActiveTab('list');
  };

  const loadSampleLovedOnes = () => {
    const samples: PersonalHebrewEvent[] = [
      {
        id: 'sample-loved-1',
        title: 'Rabbi Menachem Mendel Schneerson',
        relationship: 'Rabbi',
        hebrewName: 'רבי מנחם מענדל בן רבי לוי יצחק',
        category: 'yahrzeit',
        hebrewDay: 3,
        hebrewMonth: 4, // Tammuz
        hebrewMonthName: 'Tammuz',
        dateOfPassing: '1994-06-12',
        afterSunset: false,
        hebrewYearOfPassing: 5754,
        observances: ['candle', 'kaddish', 'mishnayot', 'tzedakah', 'kiddush'],
        notes: 'Gimmel Tammuz - Yahrzeit of the Lubavitcher Rebbe',
        enabled: true,
      },
      {
        id: 'sample-loved-2',
        title: 'Shimon ben Yaakov (Beloved Father)',
        relationship: 'Father',
        hebrewName: 'שמעון בן יעקב',
        category: 'yahrzeit',
        hebrewDay: 18,
        hebrewMonth: 8, // Cheshvan
        hebrewMonthName: 'Cheshvan',
        dateOfPassing: '2016-11-19',
        afterSunset: true,
        hebrewYearOfPassing: 5777,
        observances: ['candle', 'kaddish', 'tzedakah'],
        notes: 'Memorial candle at home and lead services',
        enabled: true,
      },
      {
        id: 'sample-loved-3',
        title: 'Chaya bat Avraham (Beloved Mother)',
        relationship: 'Mother',
        hebrewName: 'חיה בת אברהם',
        category: 'yahrzeit',
        hebrewDay: 22,
        hebrewMonth: 11, // Shevat
        hebrewMonthName: 'Shevat',
        dateOfPassing: '2020-02-17',
        afterSunset: false,
        hebrewYearOfPassing: 5780,
        observances: ['candle', 'tzedakah', 'kiddush'],
        notes: 'Sponsor Shabbat morning Kiddush in shul',
        enabled: true,
      },
    ];

    samples.forEach((s) => onAddEvent(s));
    setActiveTab('list');
  };

  // Filtered loved ones list
  const filteredEvents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return events;
    return events.filter(
      (ev) =>
        ev.title.toLowerCase().includes(q) ||
        (ev.relationship && ev.relationship.toLowerCase().includes(q)) ||
        (ev.hebrewName && ev.hebrewName.toLowerCase().includes(q)) ||
        ev.hebrewMonthName.toLowerCase().includes(q)
    );
  }, [events, searchQuery]);

  const activeYahrzeitsCount = events.filter((e) => e.enabled !== false).length;

  if (variant === 'drawer' && !isOpen) return null;

  const content = (
    <div className="flex flex-col gap-4">
      {/* Panel Top Heading */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-candle/15 text-candle">
            <Flame className="size-4" />
          </div>
          <div>
            <h2 className="font-display text-base font-semibold leading-tight text-foreground">
              Yahrzeit & Memorial Registry
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Automatic Hebrew date calculation for {calendar.year}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-candle/12 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-candle tabular-nums">
            {activeYahrzeitsCount} on {calendar.year}
          </span>
          {variant === 'sidebar' && onOpenDrawer && (
            <button
              type="button"
              onClick={onOpenDrawer}
              title="Open full-screen side drawer"
              className="cursor-pointer rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Maximize2 className="size-3.5" />
            </button>
          )}
          {variant === 'drawer' && onClose && (
            <button
              type="button"
              onClick={onClose}
              title="Close Yahrzeit Side-Panel"
              className="cursor-pointer rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl border border-border bg-muted/40 p-0.5 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('add')}
          className={`flex-1 cursor-pointer rounded-lg py-1.5 font-semibold transition-all ${
            activeTab === 'add'
              ? 'bg-card text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          + Add Loved One
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('list')}
          className={`flex-1 cursor-pointer rounded-lg py-1.5 font-semibold transition-all ${
            activeTab === 'list'
              ? 'bg-card text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Registry ({events.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('kaddish')}
          className={`flex-1 cursor-pointer rounded-lg py-1.5 font-semibold transition-all ${
            activeTab === 'kaddish'
              ? 'bg-card text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Observance Guide
        </button>
      </div>

      {/* TAB 1: ADD LOVED ONE WITH AUTOMATIC CALCULATOR */}
      {activeTab === 'add' && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Loved one's name & relationship */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-foreground">
                Loved One’s Name <span className="text-candle">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Abraham Cohen or Sarah Klein"
                className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">
                Relationship
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-ring"
              >
                {RELATIONSHIP_OPTIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground">
              Hebrew Name & Patronymic (Optional)
            </label>
            <input
              type="text"
              dir="auto"
              value={hebrewName}
              onChange={(e) => setHebrewName(e.target.value)}
              placeholder="e.g. אברהם בן יצחק or שרה בת אליהו"
              className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring font-sans"
            />
          </div>

          {/* Date Input Method Selector */}
          <div className="rounded-xl border border-border bg-muted/25 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                Date of Passing Input Method
              </span>
              <div className="inline-flex rounded-lg border border-border bg-card p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setInputMode('civil')}
                  className={`cursor-pointer rounded-md px-2.5 py-1 font-semibold transition-colors ${
                    inputMode === 'civil'
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Civil / Gregorian
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('hebrew')}
                  className={`cursor-pointer rounded-md px-2.5 py-1 font-semibold transition-colors ${
                    inputMode === 'hebrew'
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Hebrew Date
                </button>
              </div>
            </div>

            {/* Mode A: Civil Gregorian Date with automatic Hebrew conversion */}
            {inputMode === 'civil' ? (
              <div className="mt-3 flex flex-col gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    Exact Date of Passing (Civil)
                  </label>
                  <input
                    type="date"
                    value={gregDateStr}
                    onChange={(e) => setGregDateStr(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <label className="flex cursor-pointer items-start gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={afterSunset}
                    onChange={(e) => setAfterSunset(e.target.checked)}
                    className="mt-0.5 size-4 accent-primary"
                  />
                  <span>
                    <strong className="text-foreground">Passed away after sunset:</strong> In Jewish law, the new Hebrew day begins at sundown. Checking this automatically rolls the date forward to the next Hebrew calendar day.
                  </span>
                </label>

                {/* Live Automatic Conversion Result Box */}
                {convertedPassing && (
                  <div className="rounded-lg border border-candle/30 bg-candle/[0.08] p-2.5 text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-candle">
                      <Sparkles className="size-3.5" />
                      <span>Calculated Hebrew Date of Passing:</span>
                    </div>
                    <p className="mt-0.5 font-bold text-foreground text-sm">
                      {convertedPassing.hebrewDay} {convertedPassing.hebrewMonthName} {convertedPassing.hebrewYear}
                      <span className="ml-2 font-normal text-muted-foreground text-xs">
                        ({convertedPassing.hebrewGematriya})
                      </span>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Mode B: Direct Hebrew Date Selection */
              <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    Hebrew Day
                  </label>
                  <select
                    value={hebrewDay}
                    onChange={(e) => setHebrewDay(Number(e.target.value))}
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-xs font-medium outline-none focus:ring-2 focus:ring-ring"
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
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-xs font-medium outline-none focus:ring-2 focus:ring-ring"
                  >
                    {HEBREW_MONTH_OPTIONS.map((m) => (
                      <option key={m.num} value={m.num}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    Hebrew Year (Optional)
                  </label>
                  <input
                    type="number"
                    value={hebrewYearInput}
                    onChange={(e) => setHebrewYearInput(e.target.value)}
                    placeholder="e.g. 5760"
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            )}

            {/* Live Occurrence for Current Calendar Year Box */}
            {calculatedCurrentOccurrence && (
              <div className="mt-3 rounded-lg border border-border bg-background p-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-primary inline-flex items-center gap-1">
                    <CalendarIcon className="size-3.5" />
                    <span>Occurrence in {calendar.year} Calendar:</span>
                  </span>
                  {calculatedCurrentOccurrence.ordinalYearsString && (
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 font-semibold text-[11px] text-primary">
                      {calculatedCurrentOccurrence.ordinalYearsString}
                    </span>
                  )}
                </div>
                <p className="mt-1 font-bold text-foreground text-xs sm:text-sm">
                  {calculatedCurrentOccurrence.formattedDate}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  🕯️ Memorial candle lighting begins sunset on <strong className="text-foreground">{calculatedCurrentOccurrence.eveFormattedDate}</strong>; Kaddish observed through nightfall of <strong className="text-foreground">{calculatedCurrentOccurrence.weekdayName}</strong>.
                </p>
              </div>
            )}
          </div>

          {/* Memorial Customs Checklist */}
          <div>
            <label className="block text-xs font-semibold text-foreground">
              Memorial Observances to Track
            </label>
            <div className="mt-1.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {MEMORIAL_CUSTOMS.map((custom) => {
                const isChecked = observances.includes(custom.id);
                return (
                  <button
                    key={custom.id}
                    type="button"
                    onClick={() => toggleCustomObservance(custom.id)}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-left text-xs transition-colors ${
                      isChecked
                        ? 'border-candle/40 bg-candle/[0.08] text-foreground font-medium'
                        : 'border-border bg-background text-muted-foreground hover:border-border/80'
                    }`}
                  >
                    <span
                      className={`flex size-4 shrink-0 items-center justify-center rounded border ${
                        isChecked
                          ? 'border-candle bg-candle text-white'
                          : 'border-muted-foreground/40 bg-card'
                      }`}
                    >
                      {isChecked && <Check className="size-3" />}
                    </span>
                    <span className="truncate">{custom.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground">
              Personal Notes or Memorial Inscriptions
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Lead morning Shacharit, cemetery visit at Mount Hebron, sponsor kiddush in memory."
              className="mt-1 w-full rounded-lg border border-border bg-background p-2 text-xs outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={!name.trim()}
            className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-candle font-semibold text-white shadow-xs transition-opacity hover:opacity-95 disabled:opacity-40 text-xs sm:text-sm"
          >
            <Flame className="size-4" />
            <span>Save & Display Yahrzeit on Calendar</span>
          </button>
        </form>
      )}

      {/* TAB 2: REGISTRY & LIST */}
      {activeTab === 'list' && (
        <div className="flex flex-col gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by loved one's name or relationship..."
              className="h-9 w-full rounded-lg border border-border bg-background pl-8 pr-3 text-xs outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {filteredEvents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/15 p-5 text-center text-xs text-muted-foreground">
              <CalendarSearch className="mx-auto mb-2 size-6 opacity-60 text-candle" />
              <p className="font-semibold text-foreground">No Yahrzeits found in Registry</p>
              <p className="mt-1">Add loved ones above to calculate and mark their dates on your {calendar.year} calendar.</p>
              <button
                type="button"
                onClick={loadSampleLovedOnes}
                className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-primary hover:bg-accent"
              >
                <Sparkles className="size-3.5 text-candle" />
                <span>Load Sample Loved Ones</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 max-h-[460px] overflow-y-auto pr-0.5">
              {filteredEvents.map((ev) => {
                const matches = findYahrzeitOccurrencesInCalendar(ev, calendar);
                const firstMatch = matches[0];
                const occurrenceDetails = calculateYahrzeitOccurrenceForYear(
                  ev.hebrewDay,
                  ev.hebrewMonth,
                  calendar.year,
                  ev.hebrewYearOfPassing
                );
                const isEnabled = ev.enabled !== false;

                return (
                  <div
                    key={ev.id}
                    className={`group relative flex flex-col gap-2 rounded-xl border p-3 text-xs transition-all ${
                      isEnabled
                        ? 'border-border bg-background hover:border-candle/50'
                        : 'border-border/60 bg-muted/20 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Flame className="size-3.5 text-candle shrink-0" />
                          <span className="font-bold text-foreground text-xs sm:text-sm truncate">
                            {ev.title}
                          </span>
                          {ev.relationship && (
                            <span className="rounded bg-candle/15 px-1.5 py-0.5 text-[10px] font-semibold text-candle">
                              {ev.relationship}
                            </span>
                          )}
                          {occurrenceDetails?.ordinalYearsString && (
                            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                              {occurrenceDetails.ordinalYearsString}
                            </span>
                          )}
                        </div>

                        {ev.hebrewName && (
                          <p dir="auto" className="mt-0.5 text-[11px] font-sans text-muted-foreground">
                            {ev.hebrewName}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {onUpdateEvent && (
                          <button
                            type="button"
                            onClick={() => handleToggleEventEnabled(ev)}
                            title={isEnabled ? 'Hide on calendar' : 'Show on calendar'}
                            className="cursor-pointer rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                          >
                            {isEnabled ? <Eye className="size-3.5 text-candle" /> : <EyeOff className="size-3.5" />}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onRemoveEvent(ev.id)}
                          title={`Delete ${ev.title}`}
                          className="cursor-pointer rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-red-600"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Calculated Dates in this Calendar Year */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1.5 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-chabad">
                          {ev.hebrewDay} {ev.hebrewMonthName}
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span className="font-medium text-foreground">
                          {occurrenceDetails?.formattedDate ?? (firstMatch?.day.date.toLocaleDateString() || 'Outside year range')}
                        </span>
                      </div>

                      {firstMatch && onLocateDay && (
                        <button
                          type="button"
                          onClick={() => onLocateDay(firstMatch.day, firstMatch.monthIndex)}
                          className="inline-flex cursor-pointer items-center gap-1 font-semibold text-primary hover:underline"
                        >
                          <span>Locate on Grid</span>
                          <ArrowUpRight className="size-3" />
                        </button>
                      )}
                    </div>

                    {/* Observances and Notes */}
                    {ev.notes && (
                      <p className="text-[11px] text-muted-foreground italic">
                        "{ev.notes}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: OBSERVANCE & KADDISH GUIDE */}
      {activeTab === 'kaddish' && (
        <div className="flex flex-col gap-3 text-xs text-muted-foreground">
          <div className="rounded-xl border border-candle/30 bg-candle/[0.06] p-3.5">
            <div className="flex items-center gap-1.5 font-bold text-candle text-xs sm:text-sm">
              <Flame className="size-4" />
              <span>Yahrzeit Memorial Customs (הלכות ומנהגים)</span>
            </div>
            <ul className="mt-2 flex flex-col gap-2 text-[11px] leading-relaxed text-foreground/90">
              <li>
                🕯️ <strong>24-Hour Candle:</strong> Lit on the evening before the Yahrzeit at sunset. It is customary to let it burn continuously for 24 hours without extinguishing.
              </li>
              <li>
                📖 <strong>Mourner’s Kaddish:</strong> Recited at all three prayer services (Maariv, Shacharit, and Mincha) on the day of the Yahrzeit.
              </li>
              <li>
                📜 <strong>Mishnayot Study:</strong> The word <em>Mishnah</em> (משנה) has the same Hebrew letters as <em>Neshamah</em> (נשמה - soul). It is customary to study chapters of Mishnayot corresponding to the deceased person's Hebrew name.
              </li>
              <li>
                🪙 <strong>Tzedakah:</strong> Giving charity elevates the departed soul in the Heavenly realm.
              </li>
              <li>
                🍷 <strong>Kiddush / L’Chaim:</strong> Sponsoring a Kiddush on Shabbat enables the community to say a blessing and “L’Chaim” for the Aliyah of the Neshamah.
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-3.5">
            <span className="font-bold text-foreground text-xs">
              Mourner’s Kaddish (קדיש יתום)
            </span>
            <p dir="rtl" className="mt-2 font-serif text-xs leading-loose text-foreground/90">
              יִתְגַּדַּל וְיִתְקַדַּשׁ שְׁמֵהּ רַבָּא. בְּעָלְמָא דִּי בְרָא כִרְעוּתֵהּ, וְיַמְלִיךְ מַלְכוּתֵהּ, בְּחַיֵּיכוֹן וּבְיוֹמֵיכוֹן וּבְחַיֵּי דְכָל בֵּית יִשְׂרָאֵל, בַּעֲגָלָא וּבִזְמַן קָרִיב, וְאִמְרוּ אָמֵן.
            </p>
            <p className="mt-2 text-[11px] leading-relaxed italic text-muted-foreground">
              "Yitgadal v’yitkadash shmeh raba, b’alma di vra chir’uteh, v’yamlich malchuteh..."
            </p>
          </div>
        </div>
      )}
    </div>
  );

  if (variant === 'drawer') {
    return (
      <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in">
        <div
          role="dialog"
          aria-modal="true"
          className="relative flex h-full w-full max-w-lg flex-col bg-card p-6 shadow-2xl overflow-y-auto"
        >
          {content}
        </div>
      </div>
    );
  }

  // Variant === 'sidebar'
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
      {content}
    </div>
  );
}
