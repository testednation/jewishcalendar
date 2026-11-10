import React, { useRef } from 'react';
import {
  Flame,
  Sun,
  Sunset,
  Sparkles,
  Moon,
  ImagePlus,
  X,
} from 'lucide-react';
import {
  CalendarDay,
  CalendarLocation,
  CalendarMonth,
  CalendarSettings,
  GeneratedCalendar,
  HEBREW_WEEKDAY_LETTERS,
  JewishInfoOptions,
  PersonalHebrewEvent,
  WEEKDAY_NAMES,
  formatDateKey,
  formatMoladAnnouncement,
  formatZmanTime,
  getEventsForDay,
  getYahrzeitsForDay,
} from '../lib/calendarEngine';
import { useTranslation } from '../i18n/translations';

export interface BlankCellPhotoConfig {
  src: string;
  size: 'small' | 'medium' | 'large';
  fit: 'cover' | 'contain';
}

export interface InterMonthPageConfig {
  enabled: boolean;
  title: string;
  text: string;
  photo?: string;
}

function BlankCellDecoration({
  cellKey,
  photo,
  onPhotoChange,
}: {
  cellKey: string;
  photo?: BlankCellPhotoConfig;
  onPhotoChange?: (key: string, next: BlankCellPhotoConfig | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  if (!onPhotoChange) {
    return <div className="min-h-[100px] bg-muted/15" />;
  }

  const handleFile = (file?: File) => {
    if (!file || !file.type.startsWith('image/') || file.size > 5_000_000) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onPhotoChange(cellKey, {
          src: reader.result,
          size: photo?.size ?? 'medium',
          fit: photo?.fit ?? 'cover',
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const cycleSize = () => {
    if (!photo) return;
    const sizes: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large'];
    const nextSize = sizes[(sizes.indexOf(photo.size) + 1) % sizes.length];
    onPhotoChange(cellKey, { ...photo, size: nextSize });
  };

  const toggleFit = () => {
    if (!photo) return;
    onPhotoChange(cellKey, {
      ...photo,
      fit: photo.fit === 'cover' ? 'contain' : 'cover',
    });
  };

  if (photo?.src) {
    return (
      <div className="group relative min-h-[100px] bg-muted/20 print:bg-transparent">
        <img
          src={photo.src}
          alt="Calendar decoration"
          referrerPolicy="no-referrer"
          className={`w-full ${
            photo.size === 'small'
              ? 'h-20'
              : photo.size === 'medium'
              ? 'h-28'
              : 'h-full min-h-[100px]'
          } ${photo.fit === 'cover' ? 'object-cover' : 'object-contain'}`}
        />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-gradient-to-t from-black/50 to-transparent py-1 opacity-0 transition-opacity group-hover:opacity-100 print:hidden">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="cursor-pointer rounded bg-black/60 px-1.5 py-0.5 text-[9px] text-white"
          >
            Change
          </button>
          <button
            type="button"
            onClick={cycleSize}
            className="cursor-pointer rounded bg-black/60 px-1.5 py-0.5 text-[9px] text-white"
          >
            {photo.size}
          </button>
          <button
            type="button"
            onClick={toggleFit}
            className="cursor-pointer rounded bg-black/60 px-1.5 py-0.5 text-[9px] text-white"
          >
            {photo.fit}
          </button>
          <button
            type="button"
            onClick={() => onPhotoChange(cellKey, null)}
            className="cursor-pointer rounded bg-black/60 p-0.5 text-white"
          >
            <X className="size-3" />
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    );
  }

  return (
    <div className="group relative flex min-h-[100px] items-center justify-center bg-muted/15">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="cursor-pointer rounded-md px-2 py-1 text-[10px] font-medium text-muted-foreground/0 transition-all group-hover:text-muted-foreground/70 hover:bg-accent/50 print:hidden"
      >
        + Photo
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

function WeeklyBannerStrip({
  weekKey,
  photo,
  onPhotoChange,
}: {
  weekKey: string;
  photo?: string;
  onPhotoChange?: (key: string, src: string | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  if (!onPhotoChange) return null;

  const handleFile = (file?: File) => {
    if (!file || !file.type.startsWith('image/') || file.size > 5_000_000) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onPhotoChange(weekKey, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!photo) {
    return null;
  }

  return (
    <div className="group relative col-span-7 bg-muted/30">
      <img
        src={photo}
        alt="Weekly banner"
        referrerPolicy="no-referrer"
        className="h-14 w-full object-cover sm:h-16"
      />
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-gradient-to-t from-black/50 to-transparent py-1.5 opacity-0 transition-opacity group-hover:opacity-100 print:hidden">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="cursor-pointer rounded bg-black/60 px-2 py-0.5 text-[10px] text-white"
        >
          Change banner
        </button>
        <button
          type="button"
          onClick={() => onPhotoChange(weekKey, null)}
          className="cursor-pointer rounded bg-black/60 p-0.5 text-white"
        >
          <X className="size-3" />
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

export function DayCell({
  day,
  location,
  settings,
  onSelectDay,
  jewishOptions,
  photo,
  events,
  hasYahrzeit = false,
}: {
  day: CalendarDay;
  location: CalendarLocation;
  settings: CalendarSettings;
  onSelectDay?: (day: CalendarDay) => void;
  jewishOptions?: JewishInfoOptions;
  photo?: string;
  events?: string[];
  hasYahrzeit?: boolean;
}) {
  const isYomTov = day.holidays.some((h) => h.isYomTov);
  const isChabad = day.holidays.some((h) => h.isChabad);
  const holidayLine = day.holidays
    .slice(0, 2)
    .map((h) => h.name)
    .join(' · ');

  const infoParts = [
    (jewishOptions?.parsha ?? true) && day.jewishInfo.parsha,
    (jewishOptions?.pirkeiAvot ?? true) && day.jewishInfo.pirkeiAvot,
    (jewishOptions?.omer ?? true) && day.jewishInfo.omer,
    jewishOptions?.birkatHaChodesh && day.jewishInfo.birkatHaChodesh,
    jewishOptions?.dafYomi && day.jewishInfo.dafYomi,
    jewishOptions?.rambam && day.jewishInfo.rambam,
    jewishOptions?.chitas && day.jewishInfo.chitas,
  ]
    .filter(Boolean)
    .join(' · ');

  const candleStr = formatZmanTime(day.zmanim.candleLighting, location.tzid, settings.hour12, true);
  const havdalahStr = formatZmanTime(day.zmanim.havdalah, location.tzid, settings.hour12, true);
  const sunriseStr = formatZmanTime(day.zmanim.sunrise, location.tzid, settings.hour12, true);
  const sunsetStr = formatZmanTime(day.zmanim.sunset, location.tzid, settings.hour12, true);

  return (
    <button
      type="button"
      onClick={() => onSelectDay?.(day)}
      className={`group relative flex min-h-[100px] cursor-pointer flex-col gap-0.5 bg-card p-2 text-left transition-colors hover:bg-accent/50 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${
        day.isSaturday ? 'bg-muted/45' : ''
      } ${isYomTov ? 'bg-primary/[0.05]' : ''} ${
        hasYahrzeit ? 'bg-candle/[0.06] ring-1 ring-inset ring-candle/40' : ''
      } ${day.isToday ? 'ring-2 ring-inset ring-primary/60' : ''}`}
    >
      {photo && (
        <>
          <img
            src={photo}
            alt=""
            referrerPolicy="no-referrer"
            className="pointer-events-none absolute inset-0 size-full object-cover opacity-25"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-card/75 to-card/40" />
        </>
      )}

      <div className="relative flex items-baseline justify-between">
        <span
          className={`font-mono text-[11px] font-semibold tabular-nums text-primary ${
            day.isToday ? 'underline decoration-2 underline-offset-2' : ''
          }`}
        >
          {day.gregDay}
        </span>
        <span className="inline-flex items-center gap-1 text-[9.5px] font-medium text-muted-foreground tabular-nums">
          {hasYahrzeit && <Flame className="size-2.5 text-candle" />}
          <span>
            {settings.bilingual ? day.hebrewGematriya.split(' ')[0] : WEEKDAY_NAMES[day.weekday].slice(0, 1)}
          </span>
        </span>
      </div>

      <span className="relative text-[12px] font-semibold leading-tight tracking-tight text-chabad">
        {day.hebrewDate}
      </span>

      <div className="relative min-h-[14px]">
        {holidayLine && (
          <span
            className={`block truncate text-[10px] font-semibold leading-tight ${
              isYomTov ? 'text-primary' : isChabad ? 'text-chabad' : 'text-primary/75'
            }`}
          >
            {holidayLine}
          </span>
        )}
      </div>

      {infoParts && (
        <span className="relative block truncate text-[9.5px] font-medium leading-tight text-muted-foreground">
          {infoParts}
        </span>
      )}

      {jewishOptions?.dualZmanim && (
        <span className="relative block truncate font-mono text-[8.5px] tabular-nums text-muted-foreground/85">
          Shema: {formatZmanTime(day.zmanim.sofZmanShmaMGA, location.tzid, settings.hour12, true)} /{' '}
          {formatZmanTime(day.zmanim.sofZmanShma, location.tzid, settings.hour12, true)}
        </span>
      )}

      {(events?.length ?? 0) > 0 && (
        <span className="relative block truncate text-[9.5px] font-semibold leading-tight text-candle">
          {events![0]}
          {events!.length > 1 && (
            <span className="font-medium text-muted-foreground"> +{events!.length - 1}</span>
          )}
        </span>
      )}

      <div className="relative mt-auto flex items-center justify-between gap-1 pt-1">
        {day.zmanim.candleLighting ? (
          <span className="inline-flex max-w-full items-center gap-1 truncate font-mono text-[10px] font-medium leading-none tabular-nums text-candle">
            <Flame className="size-3 shrink-0" />
            <span>Candle {candleStr}</span>
            {settings.bilingual && (
              <span dir="rtl" className="shrink-0 font-sans text-[9px]">
                הדלקת נרות
              </span>
            )}
          </span>
        ) : day.zmanim.havdalah ? (
          <span className="inline-flex max-w-full items-center gap-1 truncate font-mono text-[10px] font-medium leading-none tabular-nums text-candle">
            <Flame className="size-3 shrink-0" />
            <span>Havdalah {havdalahStr}</span>
            {settings.bilingual && (
              <span dir="rtl" className="shrink-0 font-sans text-[9px]">
                הבדלה
              </span>
            )}
          </span>
        ) : (
          <span className="inline-flex max-w-full items-center gap-1 truncate font-mono text-[9.5px] font-medium leading-none tabular-nums text-muted-foreground">
            <Sun className="size-2.5 shrink-0" />
            <span>{sunriseStr}</span>
            <span>·</span>
            <span>↓ {sunsetStr}</span>
          </span>
        )}
      </div>
    </button>
  );
}

export function MonthCard({
  id,
  month,
  location,
  settings,
  onSelectDay,
  jewishOptions,
  photo,
  onPhotoChange,
  blankCellPhotos,
  onBlankCellPhotoChange,
  weekPhotos,
  onWeekPhotoChange,
  dayPhotos,
  specialEvents,
  personalHebrewEvents,
  monthIndex,
}: {
  id?: string;
  month: CalendarMonth;
  location: CalendarLocation;
  settings: CalendarSettings;
  onSelectDay?: (day: CalendarDay) => void;
  jewishOptions?: JewishInfoOptions;
  photo?: string;
  onPhotoChange?: (src: string) => void;
  blankCellPhotos?: Record<string, BlankCellPhotoConfig>;
  onBlankCellPhotoChange?: (cellKey: string, next: BlankCellPhotoConfig | null) => void;
  weekPhotos?: Record<string, string>;
  onWeekPhotoChange?: (weekKey: string, src: string | null) => void;
  dayPhotos?: Record<string, string>;
  specialEvents?: Record<string, string[]>;
  personalHebrewEvents?: PersonalHebrewEvent[];
  monthIndex?: number;
}) {
  const handleMonthPhotoUpload = (file?: File) => {
    if (!file || !onPhotoChange || !file.type.startsWith('image/') || file.size > 5_000_000) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onPhotoChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <section id={id} className="print-month scroll-mt-24">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h3 className="font-display text-xl font-semibold tracking-tight text-primary">
              {month.name}{' '}
              <span className="font-medium text-primary/75 tabular-nums">{month.gregYear}</span>
            </h3>
            <p className="mt-0.5 text-xs font-medium text-chabad">{month.hebrewLabel}</p>
          </div>

          {photo && (
            <img
              src={photo}
              alt={month.name}
              referrerPolicy="no-referrer"
              className="h-16 w-28 rounded-lg object-cover border border-border"
            />
          )}

          <div className="hidden items-center gap-4 text-[10px] font-medium text-muted-foreground sm:flex">
            <span className="inline-flex items-center gap-1">
              <Sun className="size-3.5" />
              <span>Sunrise</span>
              {settings.bilingual && <span dir="rtl">נץ החמה</span>}
            </span>
            <span className="inline-flex items-center gap-1">
              <Sunset className="size-3.5" />
              <span>Sunset</span>
              {settings.bilingual && <span dir="rtl">שקיעה</span>}
            </span>
            <span className="inline-flex items-center gap-1 text-candle">
              <Flame className="size-3.5" />
              <span>Candle</span>
              {settings.bilingual && <span dir="rtl">הדלקת נרות</span>}
            </span>
            <span className="inline-flex items-center gap-1 text-chabad">
              <Sparkles className="size-3.5" />
              <span>Chabad date</span>
              {settings.bilingual && <span dir="rtl">חב״ד</span>}
            </span>
          </div>
        </header>

        {onPhotoChange && (
          <div className="flex items-center justify-end gap-3 border-b border-border px-5 py-1.5 print:hidden">
            <label className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground">
              <ImagePlus className="size-3" />
              <span>{photo ? 'Change month photo' : 'Add month photo'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleMonthPhotoUpload(e.target.files?.[0])}
              />
            </label>
            {photo && (
              <button
                type="button"
                onClick={() => onPhotoChange('')}
                className="cursor-pointer text-[11px] text-red-600 hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        )}

        {month.molads.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border bg-muted/40 px-5 py-2 text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold text-chabad">
              <Moon className="size-3.5 text-primary" />
              <span>New Moon / Molad</span>
              {settings.bilingual && <span dir="rtl">המולד</span>}
            </span>
            {month.molads.map((m, idx) => (
              <span key={`${m.hebrewMonth}-${m.hebrewYear}`} className="text-muted-foreground">
                {idx > 0 && <span className="mr-3 text-muted-foreground/40">·</span>}
                {formatMoladAnnouncement(m, settings.hour12)}
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-7 gap-px bg-border">
          {WEEKDAY_NAMES.map((dayName, idx) => (
            <div
              key={dayName}
              className={`bg-muted/60 py-2 text-center text-[11px] font-semibold text-muted-foreground ${
                dayName === 'Sat' ? 'bg-muted' : ''
              }`}
            >
              {settings.bilingual ? `${dayName} · ${HEBREW_WEEKDAY_LETTERS[idx]}` : dayName}
            </div>
          ))}

          {month.weeks.flatMap((week, wIdx) => {
            const cells = week.map((day, dIdx) => {
              const cellKey = `${wIdx}-${dIdx}`;
              if (day) {
                const dateKey = formatDateKey(day.date);
                const mergedEvents = getEventsForDay(day, specialEvents ?? {}, personalHebrewEvents ?? []);
                const dayYahrzeits = getYahrzeitsForDay(day, personalHebrewEvents ?? []);
                return (
                  <DayCell
                    key={cellKey}
                    day={day}
                    location={location}
                    settings={settings}
                    onSelectDay={onSelectDay}
                    jewishOptions={jewishOptions}
                    photo={dayPhotos?.[dateKey]}
                    events={mergedEvents}
                    hasYahrzeit={dayYahrzeits.length > 0}
                  />
                );
              }
              return (
                <BlankCellDecoration
                  key={cellKey}
                  cellKey={cellKey}
                  photo={blankCellPhotos?.[cellKey]}
                  onPhotoChange={onBlankCellPhotoChange}
                />
              );
            });

            if (onWeekPhotoChange) {
              const weekKey = `${monthIndex ?? 0}:${wIdx}`;
              cells.push(
                <WeeklyBannerStrip
                  key={`week-banner-${weekKey}`}
                  weekKey={weekKey}
                  photo={weekPhotos?.[weekKey]}
                  onPhotoChange={onWeekPhotoChange}
                />
              );
            }
            return cells;
          })}
        </div>
      </div>
    </section>
  );
}

export function InterMonthSeparatorPage({
  page,
  onChange,
  className = '',
}: {
  page: InterMonthPageConfig;
  onChange?: (next: InterMonthPageConfig | null) => void;
  className?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (file?: File) => {
    if (!file || !file.type.startsWith('image/') || file.size > 5_000_000 || !onChange) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange({ ...page, photo: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <section
      className={`inter-month-page flex min-h-[380px] flex-col justify-center overflow-hidden rounded-2xl border border-border bg-card p-8 text-center shadow-xs ${className}`}
    >
      {page.photo && (
        <div className="mb-6 overflow-hidden rounded-xl border border-border">
          <img
            src={page.photo}
            alt="Separator page"
            referrerPolicy="no-referrer"
            className="max-h-72 w-full object-cover"
          />
        </div>
      )}
      <div className="mx-auto w-full max-w-2xl">
        <p className="text-xs font-semibold text-primary">Jewish Calendar Dedication</p>
        <input
          aria-label="Inter-month page title"
          value={page.title}
          onChange={(e) => onChange?.({ ...page, title: e.target.value })}
          placeholder="Community Dedication or Message Title"
          className="mt-2 w-full border-0 bg-transparent text-center font-display text-2xl font-semibold text-foreground outline-none placeholder:text-muted-foreground/50 sm:text-3xl"
        />
        <textarea
          aria-label="Inter-month page text"
          value={page.text}
          onChange={(e) => onChange?.({ ...page, text: e.target.value })}
          placeholder="Add a blessing, Torah thought, community announcement, or sponsor dedication..."
          className="mt-3 min-h-24 w-full resize-y border-0 bg-transparent text-center text-sm leading-relaxed text-muted-foreground outline-none placeholder:text-muted-foreground/50 sm:text-base"
        />
      </div>

      {onChange && (
        <div className="mt-6 flex items-center justify-center gap-2 print:hidden">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent"
          >
            <ImagePlus className="size-3.5" />
            <span>{page.photo ? 'Change photo' : 'Add photo'}</span>
          </button>
          {page.photo && (
            <button
              type="button"
              onClick={() => onChange({ ...page, photo: undefined })}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-red-600 hover:bg-accent"
            >
              <X className="size-3.5" />
              <span>Remove photo</span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handlePhoto(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs text-red-600 hover:bg-accent"
          >
            Remove page
          </button>
        </div>
      )}
    </section>
  );
}

export function CalendarMasthead({
  calendar,
  settings,
  orgName,
  photoCalendar = false,
  customPhoto,
}: {
  calendar: GeneratedCalendar;
  settings: CalendarSettings;
  orgName: string;
  photoCalendar?: boolean;
  customPhoto?: string;
}) {
  const { t } = useTranslation();

  return (
    <header className="mb-8 border-b border-border pb-7">
      {photoCalendar && customPhoto && (
        <div className="mb-6 overflow-hidden rounded-2xl border border-border">
          <img
            src={customPhoto}
            alt="Calendar cover"
            referrerPolicy="no-referrer"
            className="max-h-72 w-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-primary">
            {t('calendar.title')} · {t('calendar.subtitle')}
            {settings.cycle === 'hebrew' ? ' · Tishrei–Elul Cycle' : ''}
          </p>
          <h2 className="mt-1.5 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {orgName.trim() || `Jewish Calendar of ${calendar.location.city}`}
          </h2>
        </div>
        <div className="text-sm text-muted-foreground sm:text-right">
          <p className="font-display text-lg font-semibold tabular-nums text-primary">
            {settings.cycle === 'hebrew' ? `${calendar.year}–${calendar.year + 1}` : calendar.year}
          </p>
          <p className="font-medium text-chabad">
            {t('cal.hebrewYear')} {calendar.hebrewYearLabel}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
        <span className="font-medium text-primary">{calendar.location.name}</span>
        <span aria-hidden="true">·</span>
        <span>{calendar.location.tzid.replace(/_/g, ' ')}</span>
        <span aria-hidden="true">·</span>
        <span className="font-mono text-xs tabular-nums">
          {calendar.location.latitude.toFixed(3)}°N, {calendar.location.longitude.toFixed(3)}°E
        </span>
      </div>

      <p className="mt-3 max-w-2xl text-xs leading-relaxed text-muted-foreground">
        Candle lighting {settings.candleMinutes} min before sunset · Havdalah and Tzeit HaKochavim{' '}
        {settings.tzeitMinutes} min after sunset
        {settings.useElevation ? ' · Elevation-adjusted times' : ''} · Zmanim follow{' '}
        {settings.zmanimProfile === 'chabad'
          ? 'Chabad / Baal HaTanya custom'
          : settings.zmanimProfile === 'ovadia-yosef'
          ? 'Sephardi /Harav Ovadia Yosef custom'
          : 'Vilna Gaon (GRA) custom'}
        .
      </p>
    </header>
  );
}

export function CalendarLegend({ calendar }: { calendar: GeneratedCalendar }) {
  const { t } = useTranslation();
  return (
    <footer className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-5 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <span className="size-3 rounded-xs bg-primary/[0.08] ring-1 ring-inset ring-primary/40" />
        <span>Major Holiday / Yom Tov</span>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Flame className="size-3.5 text-candle" />
        <span>Candle Lighting / Havdalah</span>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Sun className="size-3.5" />
        <span>Sunrise · Sunset</span>
      </span>
      <span className="ml-auto hidden sm:inline">
        {t('cal.legend.timesLocal')} {calendar.location.name}
      </span>
    </footer>
  );
}

export function FullCalendarView({
  calendar,
  settings,
  orgName,
  onSelectDay,
  jewishOptions,
  monthsPerPage = 1,
  className = '',
  style,
  photoCalendar = false,
  customPhoto,
  monthPhotos,
  onMonthPhotoChange,
  blankCellPhotos,
  onBlankCellPhotoChange,
  weekPhotos,
  onWeekPhotoChange,
  dayPhotos,
  specialEvents,
  personalHebrewEvents,
  startMonthIndex = 0,
  interMonthPages,
  onInterMonthPageChange,
}: {
  calendar: GeneratedCalendar;
  settings: CalendarSettings;
  orgName: string;
  onSelectDay?: (day: CalendarDay) => void;
  jewishOptions?: JewishInfoOptions;
  monthsPerPage?: 1 | 4;
  className?: string;
  style?: React.CSSProperties;
  photoCalendar?: boolean;
  customPhoto?: string;
  monthPhotos?: Record<string, string>;
  onMonthPhotoChange?: (mIdx: number, src: string) => void;
  blankCellPhotos?: Record<string, Record<string, BlankCellPhotoConfig>>;
  onBlankCellPhotoChange?: (mIdx: number, cellKey: string, next: BlankCellPhotoConfig | null) => void;
  weekPhotos?: Record<string, string>;
  onWeekPhotoChange?: (weekKey: string, src: string | null) => void;
  dayPhotos?: Record<string, string>;
  specialEvents?: Record<string, string[]>;
  personalHebrewEvents?: PersonalHebrewEvent[];
  startMonthIndex?: number;
  interMonthPages?: Record<string, InterMonthPageConfig>;
  onInterMonthPageChange?: (mIdx: number, next: InterMonthPageConfig | null) => void;
}) {
  return (
    <div
      className={`calendar-print print-area mx-auto w-full max-w-[960px] ${className}`}
      style={style}
      data-months-per-page={monthsPerPage}
    >
      <CalendarMasthead
        calendar={calendar}
        settings={settings}
        orgName={orgName}
        photoCalendar={photoCalendar}
        customPhoto={customPhoto}
      />

      <div
        className={
          monthsPerPage === 4
            ? 'grid grid-cols-1 gap-6 xl:grid-cols-2'
            : 'flex flex-col gap-8'
        }
      >
        {calendar.months.slice(startMonthIndex).map((month, idx) => {
          const actualIdx = idx + startMonthIndex;
          const interPage = interMonthPages?.[String(actualIdx)];
          return (
            <React.Fragment key={`${month.gregYear}-${month.gregMonth}`}>
              <MonthCard
                id={`month-${actualIdx}`}
                month={month}
                location={calendar.location}
                settings={settings}
                onSelectDay={onSelectDay}
                jewishOptions={jewishOptions}
                photo={monthPhotos?.[String(actualIdx)]}
                onPhotoChange={
                  onMonthPhotoChange ? (src) => onMonthPhotoChange(actualIdx, src) : undefined
                }
                blankCellPhotos={blankCellPhotos?.[String(actualIdx)]}
                onBlankCellPhotoChange={
                  onBlankCellPhotoChange
                    ? (cellKey, next) => onBlankCellPhotoChange(actualIdx, cellKey, next)
                    : undefined
                }
                weekPhotos={weekPhotos}
                onWeekPhotoChange={onWeekPhotoChange}
                dayPhotos={dayPhotos}
                specialEvents={specialEvents}
                personalHebrewEvents={personalHebrewEvents}
                monthIndex={actualIdx}
              />

              {actualIdx < calendar.months.length - 1 && interPage?.enabled && (
                <div className={monthsPerPage === 4 ? 'xl:col-span-2' : ''}>
                  <InterMonthSeparatorPage
                    page={interPage}
                    onChange={
                      onInterMonthPageChange
                        ? (next) => onInterMonthPageChange(actualIdx, next)
                        : undefined
                    }
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <CalendarLegend calendar={calendar} />
    </div>
  );
}
