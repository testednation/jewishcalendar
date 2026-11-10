import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  HeartHandshake,
  Image as ImageIcon,
  Layers,
  Loader2,
  LocateFixed,
  MapPin,
  Maximize2,
  Minimize2,
  Palette,
  Plus,
  Printer,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  ZoomIn,
  ZoomOut,
  ArrowLeft,
} from 'lucide-react';
import {
  CalendarCycleType,
  CalendarDay,
  CalendarLocation,
  CalendarSettings,
  CitySearchResult,
  DEFAULT_SETTINGS,
  JewishInfoOptions,
  MinhagType,
  PersonalHebrewEvent,
  PRESET_LOCATIONS,
  SHORT_MONTH_NAMES,
  ZmanimProfileType,
  exportCalendarToPdf,
  formatDateKey,
  generateCalendar,
  generateCsvContent,
  generateIcsContent,
  getPresetLocation,
  isValidTimezone,
  resolveTimezone,
  reverseGeocode,
  searchCities,
  slugify,
  triggerFileDownload,
} from '../lib/calendarEngine';
import {
  BUILTIN_THEMES,
  CustomThemeDraft,
  HEX_COLOR_REGEX,
  buildCustomTheme,
  getThemeStyleVars,
  resolveTheme,
} from '../lib/themes';
import {
  BlankCellPhotoConfig,
  CalendarLegend,
  CalendarMasthead,
  FullCalendarView,
  InterMonthPageConfig,
  InterMonthSeparatorPage,
  MonthCard,
} from './CalendarGrid';
import { DayModal } from './DayModal';
import { SuggestedFeaturesModal } from './SuggestedFeaturesModal';
import { YahrzeitTracker } from './YahrzeitTracker';
import { LanguageSwitcher, LogoMark } from './LogoMark';
import { useTranslation } from '../i18n/translations';

const SETTINGS_STORAGE_KEY = 'luach:studio:settings:v2';

const PRESET_COVER_PHOTOS = [
  {
    id: 'jerusalem',
    label: 'Jerusalem Golden Hour',
    src: '/src/assets/images/calendar_cover_jerusalem_1794327537791.jpg',
  },
  {
    id: 'shabbat',
    label: 'Shabbat Candles & Siddur',
    src: '/src/assets/images/shabbat_candles_heritage_1794327538495.jpg',
  },
];

const AVAILABLE_YEARS = Array.from({ length: 10 }, (_, i) => 2024 + i);

function ThemeColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-xs text-muted-foreground">{label}</span>
      <input
        type="color"
        value={HEX_COLOR_REGEX.test(value) ? value : '#3a5bd9'}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-10 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 flex-1 rounded-md border border-border bg-background px-2 font-mono text-xs"
      />
    </div>
  );
}

export function StudioView({
  onBackToLanding,
  initialShowSuggestions = false,
}: {
  onBackToLanding: () => void;
  initialShowSuggestions?: boolean;
}) {
  const { t } = useTranslation();

  // Load saved state from localStorage
  const savedState = useMemo(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const defaultLoc = savedState?.location ?? getPresetLocation('crown-heights') ?? PRESET_LOCATIONS[0];
  const defaultOrgName = `Jewish Calendar of ${defaultLoc.city}`;

  const [orgName, setOrgName] = useState<string>(savedState?.orgName ?? defaultOrgName);
  const [hasCustomOrgName, setHasCustomOrgName] = useState<boolean>(
    Boolean(savedState?.orgName && savedState.orgName !== defaultOrgName)
  );
  const [year, setYear] = useState<number>(savedState?.year ?? DEFAULT_SETTINGS.year);
  const [cycle, setCycle] = useState<CalendarCycleType>(savedState?.cycle ?? 'secular');
  const [paperSize, setPaperSize] = useState<'letter' | 'legal'>(savedState?.paperSize ?? 'letter');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    savedState?.orientation ?? 'portrait'
  );
  const [fitToPage, setFitToPage] = useState<boolean>(savedState?.fitToPage ?? true);
  const [monthsPerPage, setMonthsPerPage] = useState<1 | 4>(savedState?.monthsPerPage ?? 1);
  const [startFromCurrent, setStartFromCurrent] = useState<boolean>(
    savedState?.startFromCurrent ?? false
  );

  // Photo & Page states
  const [photoCalendar, setPhotoCalendar] = useState<boolean>(
    savedState?.photoCalendar ?? true
  );
  const [customPhoto, setCustomPhoto] = useState<string>(
    savedState?.customPhoto ?? PRESET_COVER_PHOTOS[0].src
  );
  const [monthPhotos, setMonthPhotos] = useState<Record<string, string>>(
    savedState?.monthPhotos ?? {}
  );
  const [blankCellPhotos, setBlankCellPhotos] = useState<
    Record<string, Record<string, BlankCellPhotoConfig>>
  >(savedState?.blankCellPhotos ?? {});
  const [weekPhotos, setWeekPhotos] = useState<Record<string, string>>(
    savedState?.weekPhotos ?? {}
  );
  const [dayPhotos, setDayPhotos] = useState<Record<string, string>>(savedState?.dayPhotos ?? {});
  const [specialEvents, setSpecialEvents] = useState<Record<string, string[]>>(
    savedState?.specialEvents ?? {}
  );
  const [personalHebrewEvents, setPersonalHebrewEvents] = useState<PersonalHebrewEvent[]>(
    savedState?.personalHebrewEvents ?? [
      {
        id: 'sample-yahrzeit-1',
        title: 'Alter Rebbe (Baal HaTanya)',
        category: 'yahrzeit',
        hebrewDay: 24,
        hebrewMonth: 10,
        hebrewMonthName: 'Tevet',
      },
      {
        id: 'sample-1',
        title: 'Lubavitcher Rebbe Birthday (11 Nissan)',
        category: 'birthday',
        hebrewDay: 11,
        hebrewMonth: 1,
        hebrewMonthName: 'Nisan',
      },
    ]
  );
  const [interMonthPages, setInterMonthPages] = useState<Record<string, InterMonthPageConfig>>(
    savedState?.interMonthPages ?? {}
  );

  // Preview modes
  const [previewMode, setPreviewMode] = useState<'continuous' | 'pages'>(
    savedState?.previewMode ?? 'continuous'
  );
  const [zoom, setZoom] = useState<number>(1);
  const [previewMpp, setPreviewMpp] = useState<1 | 4 | null>(null);
  const [fullscreen, setFullscreen] = useState<boolean>(false);

  // Halachic & Zmanim settings
  const [hour12, setHour12] = useState<boolean>(savedState?.hour12 ?? DEFAULT_SETTINGS.hour12);
  const [useElevation, setUseElevation] = useState<boolean>(
    savedState?.useElevation ?? DEFAULT_SETTINGS.useElevation
  );
  const [minhag, setMinhag] = useState<MinhagType>(savedState?.minhag ?? 'chabad');
  const [zmanimProfile, setZmanimProfile] = useState<ZmanimProfileType>(
    savedState?.zmanimProfile ?? 'chabad'
  );
  const [bilingual, setBilingual] = useState<boolean>(
    savedState?.bilingual ?? DEFAULT_SETTINGS.bilingual
  );
  const [tzeitMinutes, setTzeitMinutes] = useState<number>(
    savedState?.tzeitMinutes ?? DEFAULT_SETTINGS.tzeitMinutes
  );
  const [candleMinutes, setCandleMinutes] = useState<number>(
    savedState?.candleMinutes ?? DEFAULT_SETTINGS.candleMinutes
  );

  // Themes
  const [themeId, setThemeId] = useState<string>(savedState?.themeId ?? 'modern');
  const [customThemes, setCustomThemes] = useState<CustomThemeDraft[]>(
    savedState?.customThemes ?? []
  );
  const [editingTheme, setEditingTheme] = useState<CustomThemeDraft | null>(null);

  // Jewish info toggles
  const [jewishOptions, setJewishOptions] = useState<JewishInfoOptions>(
    savedState?.jewishOptions ?? {
      parsha: true,
      pirkeiAvot: true,
      omer: true,
      birkatHaChodesh: true,
      kiddushLevana: true,
      chitas: true,
      hayomYom: false,
      dafYomi: false,
      rambam: false,
      fastDetails: true,
      dualZmanim: false,
    }
  );

  const [location, setLocation] = useState<CalendarLocation>(defaultLoc);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(true);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState<boolean>(initialShowSuggestions);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Location search & manual coords state
  const [cityQuery, setCityQuery] = useState('');
  const [cityResults, setCityResults] = useState<CitySearchResult[] | null>(null);
  const [searchingCities, setSearchingCities] = useState(false);
  const [detectingGeo, setDetectingGeo] = useState(false);
  const [showManualCoords, setShowManualCoords] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualLat, setManualLat] = useState('');
  const [manualLon, setManualLon] = useState('');
  const [manualTz, setManualTz] = useState('');
  const [detectingTz, setDetectingTz] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const printContainerRef = useRef<HTMLDivElement>(null);

  const notify = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => {
      setStatusMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({
          orgName,
          year,
          cycle,
          hour12,
          useElevation,
          tzeitMinutes,
          candleMinutes,
          minhag,
          zmanimProfile,
          bilingual,
          location,
          themeId,
          customThemes,
          jewishOptions,
          paperSize,
          orientation,
          fitToPage,
          monthsPerPage,
          photoCalendar,
          customPhoto,
          monthPhotos,
          blankCellPhotos,
          weekPhotos,
          dayPhotos,
          specialEvents,
          personalHebrewEvents,
          startFromCurrent,
          interMonthPages,
          previewMode,
        })
      );
    } catch {
      // ignore storage quota errors
    }
  }, [
    orgName,
    year,
    cycle,
    hour12,
    useElevation,
    tzeitMinutes,
    candleMinutes,
    minhag,
    zmanimProfile,
    bilingual,
    location,
    themeId,
    customThemes,
    jewishOptions,
    paperSize,
    orientation,
    fitToPage,
    monthsPerPage,
    photoCalendar,
    customPhoto,
    monthPhotos,
    blankCellPhotos,
    weekPhotos,
    dayPhotos,
    specialEvents,
    personalHebrewEvents,
    startFromCurrent,
    interMonthPages,
    previewMode,
  ]);

  const settings = useMemo<CalendarSettings>(
    () => ({
      year,
      cycle,
      hour12,
      useElevation,
      tzeitMinutes,
      candleMinutes,
      minhag,
      zmanimProfile,
      bilingual,
    }),
    [year, cycle, hour12, useElevation, tzeitMinutes, candleMinutes, minhag, zmanimProfile, bilingual]
  );

  const calendar = useMemo(
    () => generateCalendar(year, location, settings),
    [year, location, settings]
  );

  const activeTheme = useMemo(
    () => resolveTheme(themeId, customThemes),
    [themeId, customThemes]
  );

  const allThemes = useMemo(
    () => [...BUILTIN_THEMES, ...customThemes.map(buildCustomTheme)],
    [customThemes]
  );

  const startMonthIndex = useMemo(() => {
    if (!startFromCurrent) return 0;
    const now = new Date();
    const idx = calendar.months.findIndex(
      (m) =>
        m.gregYear > now.getFullYear() ||
        (m.gregYear === now.getFullYear() && m.gregMonth >= now.getMonth())
    );
    return idx === -1 ? 0 : idx;
  }, [startFromCurrent, calendar]);

  // Handlers for Location
  const handleSelectPreset = (id: string) => {
    const preset = getPresetLocation(id);
    if (!preset) return;
    setLocation(preset);
    if (!hasCustomOrgName) {
      setOrgName(`Jewish Calendar of ${preset.city}`);
    }
    notify(`Location set to ${preset.name}`);
  };

  const handleCitySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityQuery.trim()) return;
    setSearchingCities(true);
    try {
      const results = await searchCities(cityQuery.trim());
      setCityResults(results);
    } catch {
      setCityResults([]);
    } finally {
      setSearchingCities(false);
    }
  };

  const handlePickSearchResult = async (res: CitySearchResult) => {
    const tz = await resolveTimezone(res.latitude, res.longitude);
    const shortCity = res.name.split(',')[0].trim();
    const nextLoc: CalendarLocation = {
      id: 'custom',
      name: res.name,
      city: shortCity,
      countryCode: res.countryCode,
      latitude: res.latitude,
      longitude: res.longitude,
      elevation: 0,
      tzid: tz,
    };
    setLocation(nextLoc);
    if (!hasCustomOrgName) {
      setOrgName(`Jewish Calendar of ${shortCity}`);
    }
    setCityResults(null);
    setCityQuery('');
    notify(`Location set to ${res.name}`);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      notify('Geolocation is not supported by this browser.');
      return;
    }
    setDetectingGeo(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const rev = await reverseGeocode(coords.latitude, coords.longitude);
          const tz = await resolveTimezone(coords.latitude, coords.longitude);
          const shortCity = rev.name.split(',')[0].trim();
          const nextLoc: CalendarLocation = {
            id: 'custom',
            name: rev.name,
            city: shortCity,
            countryCode: rev.countryCode,
            latitude: coords.latitude,
            longitude: coords.longitude,
            elevation: 0,
            tzid: tz,
          };
          setLocation(nextLoc);
          if (!hasCustomOrgName) setOrgName(`Jewish Calendar of ${shortCity}`);
          notify(`Location detected: ${shortCity}`);
        } catch {
          notify('Could not resolve city name — try searching by city.');
        } finally {
          setDetectingGeo(false);
        }
      },
      () => {
        setDetectingGeo(false);
        notify('Location permission denied — use city search or presets.');
      },
      { timeout: 8000 }
    );
  };

  const handleDetectManualTimezone = async () => {
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      notify('Enter valid latitude and longitude first.');
      return;
    }
    setDetectingTz(true);
    try {
      const tz = await resolveTimezone(lat, lon);
      setManualTz(tz);
      notify(`Detected timezone: ${tz}`);
    } finally {
      setDetectingTz(false);
    }
  };

  const handleApplyManualLocation = () => {
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      notify('Please enter valid latitude and longitude.');
      return;
    }
    const tz = manualTz.trim() || 'America/New_York';
    if (!isValidTimezone(tz)) {
      notify('Enter a valid IANA timezone, e.g. America/New_York.');
      return;
    }
    const label = manualName.trim() || `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    setLocation({
      id: 'custom',
      name: label,
      city: label,
      countryCode: 'US',
      latitude: lat,
      longitude: lon,
      elevation: 0,
      tzid: tz,
    });
    if (!hasCustomOrgName) setOrgName(`Jewish Calendar of ${label}`);
    notify(`Applied custom location: ${label}`);
  };

  // Export Handlers
  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = async () => {
    if (!printContainerRef.current) return;
    setExportingPdf(true);
    try {
      await exportCalendarToPdf(
        printContainerRef.current,
        `luach-${slugify(location.city)}-${year}.pdf`,
        {
          paperSize,
          orientation,
          fitToPage,
          monthsPerPage,
        }
      );
      notify('PDF downloaded');
    } catch {
      notify('PDF generation completed via browser print.');
      window.print();
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportCsv = () => {
    const csv = generateCsvContent(calendar, settings, specialEvents, personalHebrewEvents);
    triggerFileDownload(`luach-${slugify(location.city)}-${year}.csv`, csv, 'text/csv');
    notify('CSV spreadsheet downloaded');
  };

  const handleExportIcs = () => {
    const ics = generateIcsContent(calendar, specialEvents, personalHebrewEvents);
    triggerFileDownload(`luach-${slugify(location.city)}-${year}.ics`, ics, 'text/calendar');
    notify('ICS calendar file downloaded');
  };

  const handleExportOfflineHtml = () => {
    if (!printContainerRef.current) return;
    const clone = printContainerRef.current.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('input, .print\\:hidden').forEach((n) => n.remove());
    const styles = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules)
            .map((r) => r.cssText)
            .join('\n');
        } catch {
          return '';
        }
      })
      .join('\n');

    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${orgName} — ${year}</title><style>${styles}</style><style>body{margin:0;padding:24px;background:#fff;}</style></head><body>${clone.outerHTML}</body></html>`;
    triggerFileDownload(
      `luach-${slugify(location.city)}-${year}-offline.html`,
      html,
      'text/html'
    );
    notify('Offline HTML calendar downloaded');
  };

  // Theme Builder Handlers
  const handleSaveCustomTheme = () => {
    if (!editingTheme) return;
    if (!editingTheme.name.trim()) {
      notify('Please give your theme a name.');
      return;
    }
    setCustomThemes((prev) =>
      prev.some((t) => t.id === editingTheme.id)
        ? prev.map((t) => (t.id === editingTheme.id ? editingTheme : t))
        : [...prev, editingTheme]
    );
    setThemeId(editingTheme.id);
    setEditingTheme(null);
    notify('Custom theme saved');
  };

  const handleDeleteCustomTheme = (id: string) => {
    setCustomThemes((prev) => prev.filter((t) => t.id !== id));
    if (themeId === id) setThemeId('modern');
    setEditingTheme(null);
    notify('Custom theme deleted');
  };

  const effectiveMpp = previewMpp ?? monthsPerPage;

  // Build Page Preview pages when previewMode === 'pages'
  const pageGroups = useMemo(() => {
    const activeIndices = Array.from(
      { length: Math.max(0, calendar.months.length - startMonthIndex) },
      (_, i) => i + startMonthIndex
    );
    const groups: {
      kind: 'months' | 'inter';
      monthIndexes: number[];
      interIndex?: number;
    }[] = [];

    if (effectiveMpp === 4) {
      for (let i = 0; i < activeIndices.length; i += 4) {
        const chunk = activeIndices.slice(i, i + 4);
        groups.push({ kind: 'months', monthIndexes: chunk });
        for (const mIdx of chunk) {
          if (mIdx < calendar.months.length - 1 && interMonthPages[String(mIdx)]?.enabled) {
            groups.push({ kind: 'inter', monthIndexes: [], interIndex: mIdx });
          }
        }
      }
    } else {
      for (const mIdx of activeIndices) {
        groups.push({ kind: 'months', monthIndexes: [mIdx] });
        if (mIdx < calendar.months.length - 1 && interMonthPages[String(mIdx)]?.enabled) {
          groups.push({ kind: 'inter', monthIndexes: [], interIndex: mIdx });
        }
      }
    }
    return groups;
  }, [calendar.months.length, startMonthIndex, effectiveMpp, interMonthPages]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Studio Top Bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md print:hidden">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToLanding}
              className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-foreground hover:text-primary whitespace-nowrap shrink-0"
            >
              <LogoMark className="size-7 rounded-lg" iconClassName="size-3.5" />
              <span className="font-display text-base font-bold tracking-tight">Luach</span>
            </button>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
              {t('dash.header.studio')}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {statusMessage && (
              <span className="hidden rounded-lg bg-primary/10 px-3 py-1 text-xs font-medium text-primary md:inline-block">
                {statusMessage}
              </span>
            )}
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => setShowSuggestionsModal(true)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/15 whitespace-nowrap shrink-0"
            >
              <Sparkles className="size-3.5" />
              <span>Suggested Features &amp; Tools</span>
            </button>
            <button
              type="button"
              onClick={onBackToLanding}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="size-3.5" />
              <span className="hidden sm:inline">Overview</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Grid */}
      <main className="mx-auto grid max-w-[1440px] gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[380px_1fr]">
        {/* Left Sidebar Controls */}
        <aside className="flex flex-col gap-5 print:hidden">
          {/* Card 1: Calendar & Year Cycle */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-primary" />
              <h2 className="font-display text-base font-semibold">
                {t('dash.calendar.title')}
              </h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{t('dash.calendar.desc')}</p>

            <div className="mt-4 flex flex-col gap-3.5">
              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  {t('dash.calendar.name')}
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => {
                    setOrgName(e.target.value);
                    setHasCustomOrgName(true);
                  }}
                  placeholder={t('dash.calendar.namePlaceholder')}
                  className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    {t('dash.calendar.year')}
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-ring"
                  >
                    {AVAILABLE_YEARS.map((y) => (
                      <option key={y} value={y}>
                        {cycle === 'hebrew' ? `${y}–${y + 1} (${y - 1 + 3761})` : y}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    {t('dash.calendar.cycle')}
                  </label>
                  <select
                    value={cycle}
                    onChange={(e) => setCycle(e.target.value as CalendarCycleType)}
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="secular">Jan – Dec (Secular)</option>
                    <option value="hebrew">Tishrei – Elul (Jewish Year)</option>
                  </select>
                </div>
              </div>

              {/* Quick Power Tools Row */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSuggestionsModal(true)}
                  className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2.5 py-2 text-xs font-medium hover:bg-accent whitespace-nowrap shrink-0"
                >
                  <HeartHandshake className="size-3.5 text-chabad" />
                  <span>Yahrzeits ({personalHebrewEvents.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSuggestionsModal(true)}
                  className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2.5 py-2 text-xs font-medium hover:bg-accent whitespace-nowrap shrink-0"
                >
                  <FileText className="size-3.5 text-candle" />
                  <span>Shabbat Flyer</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Location */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              <h2 className="font-display text-base font-semibold">
                {t('dash.location.title')}
              </h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{t('dash.location.desc')}</p>

            <div className="mt-4 flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  {t('dash.location.of')}
                </label>
                <select
                  value={
                    PRESET_LOCATIONS.some((p) => p.id === location.id)
                      ? location.id
                      : 'custom'
                  }
                  onChange={(e) => handleSelectPreset(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-ring"
                >
                  {PRESET_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                  {!PRESET_LOCATIONS.some((p) => p.id === location.id) && (
                    <option value="custom">Custom: {location.name}</option>
                  )}
                </select>
              </div>

              {/* City search */}
              <form onSubmit={handleCitySearch} className="flex gap-1.5">
                <input
                  type="text"
                  value={cityQuery}
                  onChange={(e) => setCityQuery(e.target.value)}
                  placeholder={t('dash.location.searchPlaceholder')}
                  className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="submit"
                  disabled={searchingCities || !cityQuery.trim()}
                  className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-lg border border-border bg-muted/50 px-3 text-xs font-medium hover:bg-accent disabled:opacity-50"
                >
                  {searchingCities ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Search className="size-3.5" />
                  )}
                </button>
              </form>

              {cityResults && (
                <div className="max-h-44 overflow-y-auto rounded-lg border border-border bg-background p-1 text-xs">
                  {cityResults.length === 0 ? (
                    <p className="p-2 text-muted-foreground">
                      No cities found — try manual coordinates.
                    </p>
                  ) : (
                    cityResults.map((res, idx) => (
                      <button
                        key={`${res.name}-${idx}`}
                        type="button"
                        onClick={() => handlePickSearchResult(res)}
                        className="flex w-full cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-left hover:bg-accent"
                      >
                        <span className="truncate">{res.name}</span>
                        <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                          {res.countryCode}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={detectingGeo}
                className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border bg-muted/30 text-xs font-medium hover:bg-accent disabled:opacity-50"
              >
                {detectingGeo ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <LocateFixed className="size-3.5 text-primary" />
                )}
                <span>
                  {detectingGeo
                    ? t('dash.location.detecting')
                    : t('dash.location.useCurrent')}
                </span>
              </button>

              {/* Manual Coordinates Accordion */}
              <div className="border-t border-border pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualCoords((v) => !v)}
                  className="flex w-full cursor-pointer items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <span>{t('dash.location.manualCoords')}</span>
                  {showManualCoords ? (
                    <ChevronUp className="size-3.5" />
                  ) : (
                    <ChevronDown className="size-3.5" />
                  )}
                </button>

                {showManualCoords && (
                  <div className="mt-3 flex flex-col gap-2.5 rounded-xl border border-border bg-muted/20 p-3">
                    <input
                      type="text"
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      placeholder="Location Name (e.g. Safed, Israel)"
                      className="h-8 rounded-md border border-border bg-background px-2.5 text-xs"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="any"
                        value={manualLat}
                        onChange={(e) => setManualLat(e.target.value)}
                        placeholder="Lat (40.668)"
                        className="h-8 rounded-md border border-border bg-background px-2.5 font-mono text-xs"
                      />
                      <input
                        type="number"
                        step="any"
                        value={manualLon}
                        onChange={(e) => setManualLon(e.target.value)}
                        placeholder="Lon (-73.945)"
                        className="h-8 rounded-md border border-border bg-background px-2.5 font-mono text-xs"
                      />
                    </div>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={manualTz}
                        onChange={(e) => setManualTz(e.target.value)}
                        placeholder="America/New_York"
                        className="h-8 flex-1 rounded-md border border-border bg-background px-2.5 font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleDetectManualTimezone}
                        disabled={detectingTz}
                        className="cursor-pointer rounded-md border border-border bg-card px-2.5 text-xs font-medium hover:bg-accent"
                      >
                        {t('dash.location.detect')}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyManualLocation}
                      className="h-8 cursor-pointer rounded-md bg-primary text-xs font-semibold text-primary-foreground"
                    >
                      {t('dash.location.applyCustom')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dedicated Yahrzeit Tracker Component */}
          <YahrzeitTracker
            calendar={calendar}
            events={personalHebrewEvents}
            onAddEvent={(ev) => {
              setPersonalHebrewEvents((prev) => [ev, ...prev]);
              notify(`Marked ${ev.title} (${ev.hebrewDay} ${ev.hebrewMonthName}) on calendar`);
            }}
            onRemoveEvent={(id) => {
              setPersonalHebrewEvents((prev) => prev.filter((item) => item.id !== id));
              notify('Removed date from calendar');
            }}
            onLocateDay={(day, mIdx) => {
              setPreviewMode('continuous');
              setTimeout(() => {
                document
                  .getElementById(`month-${mIdx}`)
                  ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setSelectedDay(day);
              }, 80);
            }}
          />

          {/* Card 3: Print & Export */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center gap-2">
              <Download className="size-4 text-primary" />
              <h2 className="font-display text-base font-semibold">
                {t('dash.export.title')}
              </h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{t('dash.export.desc')}</p>

            <div className="mt-4 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    Paper size
                  </label>
                  <select
                    value={paperSize}
                    onChange={(e) => setPaperSize(e.target.value as 'letter' | 'legal')}
                    className="mt-1 h-8 w-full rounded-lg border border-border bg-background px-2 text-xs font-medium"
                  >
                    <option value="letter">Letter (8.5 × 11 in)</option>
                    <option value="legal">Legal (8.5 × 14 in)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    Orientation
                  </label>
                  <select
                    value={orientation}
                    onChange={(e) =>
                      setOrientation(e.target.value as 'portrait' | 'landscape')
                    }
                    className="mt-1 h-8 w-full rounded-lg border border-border bg-background px-2 text-xs font-medium"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="block text-xs font-medium">Months per page</span>
                  <span className="text-[11px] text-muted-foreground">
                    Fit 1 or 4 months on each page
                  </span>
                </div>
                <select
                  value={monthsPerPage}
                  onChange={(e) => setMonthsPerPage(Number(e.target.value) as 1 | 4)}
                  className="h-8 w-28 rounded-lg border border-border bg-background px-2 text-xs font-medium"
                >
                  <option value={1}>1 month</option>
                  <option value={4}>4 months</option>
                </select>
              </div>

              <label className="flex cursor-pointer items-center justify-between gap-3 text-xs">
                <div>
                  <span className="block font-medium">Stretch to fill page</span>
                  <span className="text-[11px] text-muted-foreground">
                    Use all available page space
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={fitToPage}
                  onChange={(e) => setFitToPage(e.target.checked)}
                  className="size-4 accent-primary"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between gap-3 text-xs">
                <div>
                  <span className="block font-medium">Start from current month</span>
                  <span className="text-[11px] text-muted-foreground">
                    Show only remaining months of the year
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={startFromCurrent}
                  onChange={(e) => setStartFromCurrent(e.target.checked)}
                  className="size-4 accent-primary"
                />
              </label>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-primary text-xs font-semibold text-primary-foreground hover:opacity-95 whitespace-nowrap shrink-0"
                >
                  <Printer className="size-3.5" />
                  <span>{t('dash.export.print')}</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportPdf}
                  disabled={exportingPdf}
                  className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border bg-background text-xs font-semibold hover:bg-accent disabled:opacity-50 whitespace-nowrap shrink-0"
                >
                  {exportingPdf ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Download className="size-3.5" />
                  )}
                  <span>{t('dash.export.pdf')}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border bg-background text-xs font-medium hover:bg-accent whitespace-nowrap shrink-0"
                >
                  <FileSpreadsheet className="size-3.5 text-primary" />
                  <span>{t('dash.export.csv')}</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportIcs}
                  className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border bg-background text-xs font-medium hover:bg-accent whitespace-nowrap shrink-0"
                >
                  <Calendar className="size-3.5 text-primary" />
                  <span>{t('dash.export.ics')}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleExportOfflineHtml}
                className="inline-flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border bg-muted/30 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Download className="size-3.5" />
                <span>Download Standalone Offline HTML</span>
              </button>
            </div>
          </div>

          {/* Toggle Advanced Settings */}
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-primary/25 bg-primary/[0.04] px-4 py-2.5 text-left text-xs font-semibold text-foreground transition-colors hover:bg-primary/[0.08]"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-primary" />
              <span>{t('dash.advanced')}</span>
            </span>
            <span className="text-primary">
              {showAdvanced ? t('dash.advanced.hide') : t('dash.advanced.show')}
            </span>
          </button>

          {showAdvanced && (
            <div className="flex flex-col gap-5">
              {/* Card 4: Zmanim & Jewish Info */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  <h2 className="font-display text-base font-semibold">
                    Zmanim &amp; Jewish Info
                  </h2>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Choose daily study tracks, minhag, and halachic calculation method.
                </p>

                <div className="mt-4 flex flex-col gap-3.5">
                  <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-muted/25 p-3">
                    {(
                      [
                        ['parsha', 'Parsha & Haftarah'],
                        ['pirkeiAvot', 'Pirkei Avot'],
                        ['omer', 'Sefirat HaOmer'],
                        ['birkatHaChodesh', 'Birkat HaChodesh'],
                        ['kiddushLevana', 'Kiddush Levana'],
                        ['chitas', 'Chitas'],
                        ['hayomYom', 'Hayom Yom'],
                        ['dafYomi', 'Daf Yomi'],
                        ['rambam', 'Rambam'],
                        ['fastDetails', 'Fast details'],
                        ['dualZmanim', 'Dual Shema (MGA/GRA)'],
                      ] as [keyof JewishInfoOptions, string][]
                    ).map(([key, label]) => (
                      <label
                        key={key}
                        className="flex cursor-pointer items-center gap-2 text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(jewishOptions[key])}
                          onChange={(e) =>
                            setJewishOptions((prev) => ({
                              ...prev,
                              [key]: e.target.checked,
                            }))
                          }
                          className="size-3.5 accent-primary"
                        />
                        <span className="truncate">{label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="block text-xs font-medium">Minhag</span>
                      <span className="text-[11px] text-muted-foreground">
                        Holiday names and customs
                      </span>
                    </div>
                    <select
                      value={minhag}
                      onChange={(e) => setMinhag(e.target.value as MinhagType)}
                      className="h-8 w-32 rounded-lg border border-border bg-background px-2 text-xs font-medium"
                    >
                      <option value="chabad">Chabad</option>
                      <option value="ashkenazi">Ashkenazi</option>
                      <option value="sefardi">Sephardi</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="block text-xs font-medium">Zmanim method</span>
                      <span className="text-[11px] text-muted-foreground">
                        Halachic calculation profile
                      </span>
                    </div>
                    <select
                      value={zmanimProfile}
                      onChange={(e) =>
                        setZmanimProfile(e.target.value as ZmanimProfileType)
                      }
                      className="h-8 w-32 rounded-lg border border-border bg-background px-2 text-xs font-medium"
                    >
                      <option value="chabad">Chabad (Alter Rebbe)</option>
                      <option value="gra">Vilna Gaon (GRA)</option>
                      <option value="ovadia-yosef">Ovadia Yosef</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="block text-xs font-medium">Time format</span>
                      <span className="text-[11px] text-muted-foreground">
                        12-hour or 24-hour clock
                      </span>
                    </div>
                    <select
                      value={hour12 ? '12' : '24'}
                      onChange={(e) => setHour12(e.target.value === '12')}
                      className="h-8 w-28 rounded-lg border border-border bg-background px-2 text-xs font-medium"
                    >
                      <option value="12">12-hour</option>
                      <option value="24">24-hour</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="block text-xs font-medium">Tzeit / Havdalah</span>
                      <span className="text-[11px] text-muted-foreground">
                        Minutes after sunset
                      </span>
                    </div>
                    <select
                      value={tzeitMinutes}
                      onChange={(e) => setTzeitMinutes(Number(e.target.value))}
                      className="h-8 w-28 rounded-lg border border-border bg-background px-2 text-xs font-medium"
                    >
                      <option value={42}>42 min</option>
                      <option value={50}>50 min (Chabad)</option>
                      <option value={72}>72 min (R. Tam)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="block text-xs font-medium">Candle lighting</span>
                      <span className="text-[11px] text-muted-foreground">
                        Minutes before sunset
                      </span>
                    </div>
                    <select
                      value={candleMinutes}
                      onChange={(e) => setCandleMinutes(Number(e.target.value))}
                      className="h-8 w-28 rounded-lg border border-border bg-background px-2 text-xs font-medium"
                    >
                      <option value={18}>18 min (Standard)</option>
                      <option value={30}>30 min (Haifa)</option>
                      <option value={40}>40 min (Jerusalem)</option>
                    </select>
                  </div>

                  <label className="flex cursor-pointer items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="block font-medium">Bilingual print (EN / HE)</span>
                      <span className="text-[11px] text-muted-foreground">
                        Show Hebrew labels alongside English
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={bilingual}
                      onChange={(e) => setBilingual(e.target.checked)}
                      className="size-4 accent-primary"
                    />
                  </label>

                  <label className="flex cursor-pointer items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="block font-medium">Use elevation</span>
                      <span className="text-[11px] text-muted-foreground">
                        Adjust sunrise/sunset for altitude
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={useElevation}
                      onChange={(e) => setUseElevation(e.target.checked)}
                      className="size-4 accent-primary"
                    />
                  </label>
                </div>
              </div>

              {/* Card 5: Calendar Theme */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                <div className="flex items-center gap-2">
                  <Palette className="size-4 text-primary" />
                  <h2 className="font-display text-base font-semibold">Calendar Theme</h2>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Colors and typography for the calendar and its printed PDF.
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {allThemes.map((th) => (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setThemeId(th.id)}
                      className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border p-2 transition-colors hover:bg-accent/60 ${
                        themeId === th.id
                          ? 'border-primary ring-1 ring-primary/40 bg-accent/30'
                          : 'border-border bg-card'
                      }`}
                    >
                      <span className="flex h-7 w-full overflow-hidden rounded-md border border-border">
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
                      </span>
                      <span className="w-full truncate text-center text-[11px] font-medium">
                        {th.name}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-4 border-t border-border pt-3">
                  {editingTheme ? (
                    <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-muted/25 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">Custom Theme Editor</span>
                        <button
                          type="button"
                          onClick={() => setEditingTheme(null)}
                          className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                      <input
                        type="text"
                        value={editingTheme.name}
                        onChange={(e) =>
                          setEditingTheme({ ...editingTheme, name: e.target.value })
                        }
                        placeholder="Theme name"
                        className="h-8 rounded-md border border-border bg-background px-2.5 text-xs"
                      />
                      <ThemeColorInput
                        label="Paper"
                        value={editingTheme.paper}
                        onChange={(v) => setEditingTheme({ ...editingTheme, paper: v })}
                      />
                      <ThemeColorInput
                        label="Card"
                        value={editingTheme.card}
                        onChange={(v) => setEditingTheme({ ...editingTheme, card: v })}
                      />
                      <ThemeColorInput
                        label="Accent"
                        value={editingTheme.accent}
                        onChange={(v) => setEditingTheme({ ...editingTheme, accent: v })}
                      />
                      <ThemeColorInput
                        label="Chabad"
                        value={editingTheme.chabad}
                        onChange={(v) => setEditingTheme({ ...editingTheme, chabad: v })}
                      />
                      <ThemeColorInput
                        label="Candle"
                        value={editingTheme.candle}
                        onChange={(v) => setEditingTheme({ ...editingTheme, candle: v })}
                      />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Typography</span>
                        <select
                          value={editingTheme.font}
                          onChange={(e) =>
                            setEditingTheme({
                              ...editingTheme,
                              font: e.target.value as 'sans' | 'serif',
                            })
                          }
                          className="h-8 rounded-md border border-border bg-background px-2 text-xs"
                        >
                          <option value="sans">Sans-serif (Plus Jakarta)</option>
                          <option value="serif">Editorial Serif (Fraunces)</option>
                        </select>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleSaveCustomTheme}
                          className="h-8 flex-1 cursor-pointer rounded-md bg-primary text-xs font-semibold text-primary-foreground"
                        >
                          Save Theme
                        </button>
                        {customThemes.some((t) => t.id === editingTheme.id) && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomTheme(editingTheme.id)}
                            className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-md border border-border px-2.5 text-xs text-red-600 hover:bg-accent"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">
                        Design your own paper &amp; ink palette
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingTheme({
                            id: `custom-${Date.now().toString(36)}`,
                            name: 'My Community Theme',
                            paper: '#fafbfd',
                            card: '#ffffff',
                            accent: '#3a5bd9',
                            chabad: '#9a6a12',
                            candle: '#b0671a',
                            font: 'sans',
                          })
                        }
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-accent whitespace-nowrap shrink-0"
                      >
                        <Plus className="size-3.5" />
                        <span>New theme</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 6: Photo Calendar Cover */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                <div className="flex items-center gap-2">
                  <ImageIcon className="size-4 text-primary" />
                  <h2 className="font-display text-base font-semibold">Photo Calendar</h2>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Display a header cover photo above the year calendar.
                </p>

                <div className="mt-4 flex flex-col gap-3">
                  <label className="flex cursor-pointer items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="block font-medium">Use cover photo layout</span>
                      <span className="text-[11px] text-muted-foreground">
                        Show banner photo at the top of the masthead
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={photoCalendar}
                      onChange={(e) => setPhotoCalendar(e.target.checked)}
                      className="size-4 accent-primary"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_COVER_PHOTOS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setCustomPhoto(preset.src);
                          setPhotoCalendar(true);
                          notify(`Selected cover: ${preset.label}`);
                        }}
                        className={`group relative overflow-hidden rounded-lg border text-left ${
                          customPhoto === preset.src && photoCalendar
                            ? 'border-primary ring-2 ring-primary/40'
                            : 'border-border'
                        }`}
                      >
                        <img
                          src={preset.src}
                          alt={preset.label}
                          referrerPolicy="no-referrer"
                          className="h-16 w-full object-cover transition-transform group-hover:scale-105"
                        />
                        <span className="block truncate bg-card px-2 py-1 text-[10px] font-medium">
                          {preset.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  <label className="flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-muted/20 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
                    <Plus className="size-3.5" />
                    <span>Upload Custom Cover Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file || file.size > 5_000_000) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (typeof reader.result === 'string') {
                            setCustomPhoto(reader.result);
                            setPhotoCalendar(true);
                            notify('Custom cover photo uploaded');
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Card 7: Pages Between Months */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                <div className="flex items-center gap-2">
                  <Layers className="size-4 text-primary" />
                  <h2 className="font-display text-base font-semibold">
                    Pages Between Months
                  </h2>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Insert a full-page photo and community dedication after any month.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  {calendar.months.slice(0, 11).map((m, idx) => {
                    const enabled = Boolean(interMonthPages[String(idx)]?.enabled);
                    return (
                      <label
                        key={`${m.gregYear}-${m.gregMonth}`}
                        className="flex cursor-pointer items-center justify-between rounded-lg border border-border px-2.5 py-1.5 text-xs"
                      >
                        <span className="truncate">After {m.name.slice(0, 3)}</span>
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setInterMonthPages((prev) => ({
                              ...prev,
                              [String(idx)]: checked
                                ? prev[String(idx)] ?? {
                                    enabled: true,
                                    title: `${m.name} Community Dedication`,
                                    text: 'Dedicated in honor of our community members and supporters.',
                                  }
                                : {
                                    ...(prev[String(idx)] ?? { title: '', text: '' }),
                                    enabled: false,
                                  },
                            }));
                          }}
                          className="size-3.5 accent-primary"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Right Live Calendar Canvas */}
        <section className="min-w-0">
          {/* Preview Toolbar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs print:hidden">
            <div>
              <h1 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
                {cycle === 'hebrew' ? `${year}–${year + 1} Jewish Year` : `${year} Year Calendar`}
              </h1>
              <p className="text-xs text-muted-foreground">
                {previewMode === 'pages'
                  ? `Page Preview · ${paperSize === 'letter' ? 'Letter' : 'Legal'} · ${
                      orientation === 'portrait' ? 'Portrait' : 'Landscape'
                    } · ${effectiveMpp} mo/page`
                  : `Live Continuous Preview · ${location.name} · Hebrew Year ${calendar.hebrewYearLabel}`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Continuous vs Pages Switch */}
              <div className="inline-flex items-center rounded-lg border border-border bg-muted/50 p-0.5">
                <button
                  type="button"
                  onClick={() => setPreviewMode('continuous')}
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    previewMode === 'continuous'
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>Continuous</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('pages')}
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    previewMode === 'pages'
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <BookOpen className="size-3.5" />
                  <span>Pages</span>
                </button>
              </div>

              {previewMode === 'pages' && (
                <>
                  <div className="inline-flex items-center rounded-lg border border-border bg-muted/50 p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setPreviewMpp(null)}
                      className={`cursor-pointer rounded-md px-2 py-1 font-medium ${
                        previewMpp === null
                          ? 'bg-card text-foreground shadow-xs'
                          : 'text-muted-foreground'
                      }`}
                    >
                      Auto
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMpp(1)}
                      className={`cursor-pointer rounded-md px-2 py-1 font-medium ${
                        previewMpp === 1
                          ? 'bg-card text-foreground shadow-xs'
                          : 'text-muted-foreground'
                      }`}
                    >
                      1/p
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMpp(4)}
                      className={`cursor-pointer rounded-md px-2 py-1 font-medium ${
                        previewMpp === 4
                          ? 'bg-card text-foreground shadow-xs'
                          : 'text-muted-foreground'
                      }`}
                    >
                      4/p
                    </button>
                  </div>

                  <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-0.5">
                    <button
                      type="button"
                      aria-label="Zoom out"
                      onClick={() =>
                        setZoom((z) => Math.max(0.5, Math.round((z - 0.25) * 100) / 100))
                      }
                      className="cursor-pointer rounded-md p-1.5 text-muted-foreground hover:text-foreground"
                    >
                      <ZoomOut className="size-3.5" />
                    </button>
                    <span className="min-w-11 text-center font-mono text-xs font-semibold tabular-nums">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      type="button"
                      aria-label="Zoom in"
                      onClick={() =>
                        setZoom((z) => Math.min(1.5, Math.round((z + 0.25) * 100) / 100))
                      }
                      className="cursor-pointer rounded-md p-1.5 text-muted-foreground hover:text-foreground"
                    >
                      <ZoomIn className="size-3.5" />
                    </button>
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={() => setFullscreen((f) => !f)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground whitespace-nowrap shrink-0"
              >
                {fullscreen ? (
                  <Minimize2 className="size-3.5" />
                ) : (
                  <Maximize2 className="size-3.5" />
                )}
                <span>{fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
              </button>
            </div>

            {/* Quick Month Jump Bar */}
            {previewMode === 'continuous' && (
              <div className="mt-3 flex w-full flex-wrap gap-1 border-t border-border pt-3">
                {calendar.months.map((m, idx) => (
                  <button
                    key={`${m.gregYear}-${m.gregMonth}`}
                    type="button"
                    onClick={() =>
                      document
                        .getElementById(`month-${idx}`)
                        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                    className="cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground whitespace-nowrap shrink-0"
                  >
                    {SHORT_MONTH_NAMES[m.gregMonth]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Calendar Surface */}
          <div
            className={
              fullscreen
                ? 'fixed inset-0 z-50 overflow-y-auto bg-background p-6'
                : 'min-w-0'
            }
          >
            {fullscreen && (
              <div className="mx-auto mb-6 flex max-w-[1100px] items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
                <span className="font-display text-base font-semibold">
                  Fullscreen Preview · {orgName}
                </span>
                <button
                  type="button"
                  onClick={() => setFullscreen(false)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                >
                  <Minimize2 className="size-3.5" />
                  <span>Close Fullscreen</span>
                </button>
              </div>
            )}

            <div
              ref={printContainerRef}
              style={getThemeStyleVars(activeTheme)}
              className="rounded-3xl border border-border bg-background p-5 shadow-sm sm:p-8"
            >
              {previewMode === 'continuous' ? (
                <FullCalendarView
                  calendar={calendar}
                  settings={settings}
                  orgName={orgName}
                  onSelectDay={(d) => setSelectedDay(d)}
                  jewishOptions={jewishOptions}
                  monthsPerPage={effectiveMpp}
                  photoCalendar={photoCalendar}
                  customPhoto={customPhoto}
                  monthPhotos={monthPhotos}
                  onMonthPhotoChange={(mIdx, src) =>
                    setMonthPhotos((prev) => {
                      const next = { ...prev };
                      if (src) next[String(mIdx)] = src;
                      else delete next[String(mIdx)];
                      return next;
                    })
                  }
                  blankCellPhotos={blankCellPhotos}
                  onBlankCellPhotoChange={(mIdx, cellKey, nextCfg) =>
                    setBlankCellPhotos((prev) => {
                      const mKey = String(mIdx);
                      const mMap = { ...(prev[mKey] ?? {}) };
                      if (nextCfg) mMap[cellKey] = nextCfg;
                      else delete mMap[cellKey];
                      return { ...prev, [mKey]: mMap };
                    })
                  }
                  weekPhotos={weekPhotos}
                  onWeekPhotoChange={(wKey, src) =>
                    setWeekPhotos((prev) => {
                      const next = { ...prev };
                      if (src) next[wKey] = src;
                      else delete next[wKey];
                      return next;
                    })
                  }
                  dayPhotos={dayPhotos}
                  specialEvents={specialEvents}
                  personalHebrewEvents={personalHebrewEvents}
                  startMonthIndex={startMonthIndex}
                  interMonthPages={interMonthPages}
                  onInterMonthPageChange={(mIdx, nextCfg) =>
                    setInterMonthPages((prev) => {
                      const next = { ...prev };
                      if (nextCfg) next[String(mIdx)] = nextCfg;
                      else delete next[String(mIdx)];
                      return next;
                    })
                  }
                />
              ) : (
                <div
                  className="flex flex-col gap-10"
                  style={{ zoom: zoom !== 1 ? zoom : undefined }}
                >
                  {pageGroups.map((group, pIdx) => (
                    <div
                      key={pIdx}
                      className="rounded-2xl border border-border bg-card p-6 shadow-md"
                    >
                      <div className="mb-4 flex items-center justify-between border-b border-border pb-2 text-xs text-muted-foreground">
                        <span>Page {pIdx + 1}</span>
                        <span>
                          {paperSize.toUpperCase()} · {orientation.toUpperCase()}
                        </span>
                      </div>

                      {group.kind === 'inter' && group.interIndex !== undefined ? (
                        <InterMonthSeparatorPage
                          page={
                            interMonthPages[String(group.interIndex)] ?? {
                              enabled: true,
                              title: '',
                              text: '',
                            }
                          }
                          onChange={(nextCfg) =>
                            setInterMonthPages((prev) => {
                              const next = { ...prev };
                              if (nextCfg) next[String(group.interIndex)] = nextCfg;
                              else delete next[String(group.interIndex)];
                              return next;
                            })
                          }
                        />
                      ) : (
                        <div className="flex flex-col gap-6">
                          {pIdx === 0 && (
                            <CalendarMasthead
                              calendar={calendar}
                              settings={settings}
                              orgName={orgName}
                              photoCalendar={photoCalendar}
                              customPhoto={customPhoto}
                            />
                          )}
                          <div
                            className={
                              effectiveMpp === 4
                                ? 'grid grid-cols-1 gap-4 md:grid-cols-2'
                                : 'flex flex-col gap-4'
                            }
                          >
                            {group.monthIndexes.map((mIdx) => (
                              <MonthCard
                                key={mIdx}
                                month={calendar.months[mIdx]}
                                location={calendar.location}
                                settings={settings}
                                onSelectDay={(d) => setSelectedDay(d)}
                                jewishOptions={jewishOptions}
                                photo={monthPhotos[String(mIdx)]}
                                dayPhotos={dayPhotos}
                                specialEvents={specialEvents}
                                personalHebrewEvents={personalHebrewEvents}
                                monthIndex={mIdx}
                              />
                            ))}
                          </div>
                          {pIdx === pageGroups.length - 1 && (
                            <CalendarLegend calendar={calendar} />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Day Inspector Modal */}
      <DayModal
        day={selectedDay}
        location={location}
        settings={settings}
        theme={activeTheme}
        photo={selectedDay ? dayPhotos[formatDateKey(selectedDay.date)] : undefined}
        onPhotoChange={
          selectedDay
            ? (src) => {
                const k = formatDateKey(selectedDay.date);
                setDayPhotos((prev) => {
                  const next = { ...prev };
                  if (src) next[k] = src;
                  else delete next[k];
                  return next;
                });
              }
            : undefined
        }
        events={selectedDay ? specialEvents[formatDateKey(selectedDay.date)] : undefined}
        personalHebrewEvents={personalHebrewEvents}
        onAddEvent={
          selectedDay
            ? (txt) => {
                const k = formatDateKey(selectedDay.date);
                setSpecialEvents((prev) => ({
                  ...prev,
                  [k]: [...(prev[k] ?? []), txt],
                }));
              }
            : undefined
        }
        onRemoveEvent={
          selectedDay
            ? (idx) => {
                const k = formatDateKey(selectedDay.date);
                setSpecialEvents((prev) => {
                  const filtered = (prev[k] ?? []).filter((_, i) => i !== idx);
                  const next = { ...prev };
                  if (filtered.length > 0) next[k] = filtered;
                  else delete next[k];
                  return next;
                });
              }
            : undefined
        }
        onClose={() => setSelectedDay(null)}
      />

      {/* Suggested Features & Power Tools Modal */}
      <SuggestedFeaturesModal
        open={showSuggestionsModal}
        onClose={() => setShowSuggestionsModal(false)}
        calendar={calendar}
        settings={settings}
        onUpdateSettings={(partial) => {
          if (partial.cycle !== undefined) setCycle(partial.cycle);
          if (partial.year !== undefined) setYear(partial.year);
        }}
        jewishOptions={jewishOptions}
        onUpdateJewishOptions={(partial) =>
          setJewishOptions((prev) => ({ ...prev, ...partial }))
        }
        personalHebrewEvents={personalHebrewEvents}
        onAddPersonalEvent={(ev) =>
          setPersonalHebrewEvents((prev) => [...prev, ev])
        }
        onRemovePersonalEvent={(id) =>
          setPersonalHebrewEvents((prev) => prev.filter((item) => item.id !== id))
        }
      />
    </div>
  );
}
