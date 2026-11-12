import React, { useRef, useState } from 'react';
import {
  Flame,
  Sun,
  Sunset,
  Sparkles,
  Moon,
  ImagePlus,
  X,
  LayoutGrid,
  List,
  Award,
  ChevronRight,
  GripVertical,
  ArrowUp,
} from 'lucide-react';
import {
  CalendarDay,
  CalendarLocation,
  CalendarMonth,
  CalendarSettings,
  CustomCalendarEvent,
  DayEventItem,
  GeneratedCalendar,
  HEBREW_WEEKDAY_LETTERS,
  JewishInfoOptions,
  LunarPhaseInfo,
  PersonalHebrewEvent,
  WEEKDAY_NAMES,
  formatDateKey,
  formatMoladAnnouncement,
  formatZmanTime,
  getEventsForDay,
  getStructuredEventsForDay,
  getYahrzeitsForDay,
  isHolidayVisible,
} from '../lib/calendarEngine';
import { CommunitySponsor } from './SponsorGridManager';
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

export function CropMarksOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -inset-3 z-20"
    >
      {/* Top-Left Crop Mark */}
      <span className="absolute left-0 top-3 h-px w-2.5 bg-foreground/60" />
      <span className="absolute left-3 top-0 h-2.5 w-px bg-foreground/60" />
      {/* Top-Right Crop Mark */}
      <span className="absolute right-0 top-3 h-px w-2.5 bg-foreground/60" />
      <span className="absolute right-3 top-0 h-2.5 w-px bg-foreground/60" />
      {/* Bottom-Left Crop Mark */}
      <span className="absolute bottom-3 left-0 h-px w-2.5 bg-foreground/60" />
      <span className="absolute bottom-0 left-3 h-2.5 w-px bg-foreground/60" />
      {/* Bottom-Right Crop Mark */}
      <span className="absolute bottom-3 right-0 h-px w-2.5 bg-foreground/60" />
      <span className="absolute bottom-0 right-3 h-2.5 w-px bg-foreground/60" />
      {/* Subtle 0.125" Bleed Dashed Guide */}
      <div className="absolute inset-1.5 rounded-xs border border-dashed border-primary/25 print:border-black/20" />
    </div>
  );
}

export function MoonPhaseDisc({
  phase,
  className = 'size-3',
}: {
  phase: LunarPhaseInfo;
  className?: string;
}) {
  const r = 4.6;
  const cx = 6;
  const cy = 6;
  const topY = cy - r;
  const botY = cy + r;

  const isWaxing = phase.ageFraction <= 0.5;
  const cosPhase = Math.cos(phase.ageFraction * 2 * Math.PI);
  const rx = Math.max(0.05, Math.abs(cosPhase) * r);

  // Outer semicircle sweep: 1 = right limb (waxing), 0 = left limb (waning)
  const outerSweep = isWaxing ? 1 : 0;
  // Terminator elliptical arc sweep from bottom back to top
  const termSweep = isWaxing
    ? phase.ageFraction < 0.25
      ? 0
      : 1
    : phase.ageFraction < 0.75
    ? 0
    : 1;

  const litPath = `M ${cx} ${topY} A ${r} ${r} 0 0 ${outerSweep} ${cx} ${botY} A ${rx.toFixed(
    2
  )} ${r} 0 0 ${termSweep} ${cx} ${topY} Z`;

  return (
    <svg
      viewBox="0 0 12 12"
      aria-label={`${phase.label} (${phase.illuminationPct}% illuminated)`}
      className={`shrink-0 ${className}`}
    >
      <title>{`${phase.label} · ${phase.illuminationPct}% illuminated`}</title>
      {/* Shadowed lunar base */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="currentColor"
        className=" opacity-15"
      />
      {/* Illuminated lunar hemisphere */}
      {phase.kind === 'full' ? (
        <circle cx={cx} cy={cy} r={r} fill="currentColor" />
      ) : phase.kind !== 'new' ? (
        <path d={litPath} fill="currentColor" />
      ) : null}
      {/* Crisp outer lunar rim */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.95"
        className="opacity-75"
      />
    </svg>
  );
}

function BlankCellDecoration({
  cellKey,
  photo,
  onPhotoChange,
  sponsorAd,
  cellHeightClass = 'min-h-[72px] sm:min-h-[100px]',
}: {
  cellKey: string;
  photo?: BlankCellPhotoConfig;
  onPhotoChange?: (key: string, next: BlankCellPhotoConfig | null) => void;
  sponsorAd?: CommunitySponsor;
  cellHeightClass?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file?: File) => {
    if (!file || !file.type.startsWith('image/') || file.size > 5_000_000 || !onPhotoChange) return;
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
    if (!photo || !onPhotoChange) return;
    const sizes: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large'];
    const nextSize = sizes[(sizes.indexOf(photo.size) + 1) % sizes.length];
    onPhotoChange(cellKey, { ...photo, size: nextSize });
  };

  const toggleFit = () => {
    if (!photo || !onPhotoChange) return;
    onPhotoChange(cellKey, {
      ...photo,
      fit: photo.fit === 'cover' ? 'contain' : 'cover',
    });
  };

  if (photo?.src) {
    return (
      <div className={`group relative ${cellHeightClass} bg-muted/20 print:bg-transparent`}>
        <img
          src={photo.src}
          alt="Calendar decoration"
          referrerPolicy="no-referrer"
          className={`w-full ${
            photo.size === 'small'
              ? 'h-16 sm:h-20'
              : photo.size === 'medium'
              ? 'h-20 sm:h-28'
              : `h-full ${cellHeightClass}`
          } ${photo.fit === 'cover' ? 'object-cover' : 'object-contain'}`}
        />
        {onPhotoChange && (
          <>
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
          </>
        )}
      </div>
    );
  }

  if (sponsorAd) {
    return (
      <div className={`group relative flex ${cellHeightClass} flex-col justify-between bg-muted/25 p-1.5 text-center sm:p-2`}>
        <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-chabad/35 bg-card/75 px-1.5 py-1">
          <span className="text-[8px] font-semibold uppercase tracking-wider text-chabad">
            Community Sponsor
          </span>
          <p className="mt-0.5 line-clamp-1 text-[10px] font-bold leading-tight text-foreground sm:text-[11px]">
            {sponsorAd.businessName}
          </p>
          <p className="mt-0.5 hidden line-clamp-2 text-[9px] leading-tight text-muted-foreground sm:block">
            {sponsorAd.tagline}
          </p>
          {sponsorAd.contact && (
            <p className="mt-0.5 truncate font-mono text-[8.5px] font-medium text-primary">
              {sponsorAd.contact}
            </p>
          )}
        </div>
        {onPhotoChange && (
          <>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute right-1 top-1 cursor-pointer rounded bg-card/90 px-1.5 py-0.5 text-[8px] font-medium text-muted-foreground opacity-0 shadow-xs transition-opacity group-hover:opacity-100 print:hidden"
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
          </>
        )}
      </div>
    );
  }

  if (!onPhotoChange) {
    return <div className={`${cellHeightClass} bg-muted/15`} />;
  }

  return (
    <div className={`group relative flex ${cellHeightClass} items-center justify-center bg-muted/15`}>
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
  if (!onPhotoChange || !photo) return null;

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
  eventItems = [],
  onReorderDayEvents,
  onMoveCustomEventToDate,
  hasYahrzeit = false,
  cellHeightClass = 'min-h-[74px] sm:min-h-[104px]',
}: {
  day: CalendarDay;
  location: CalendarLocation;
  settings: CalendarSettings;
  onSelectDay?: (day: CalendarDay) => void;
  jewishOptions?: JewishInfoOptions;
  photo?: string;
  events?: string[];
  eventItems?: DayEventItem[];
  onReorderDayEvents?: (
    day: CalendarDay,
    orderedIds: string[],
    draggedCustomId?: string,
    targetCustomId?: string
  ) => void;
  onMoveCustomEventToDate?: (customEventId: string, targetDateKey: string) => void;
  hasYahrzeit?: boolean;
  cellHeightClass?: string;
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [cellDropActive, setCellDropActive] = useState<boolean>(false);

  const dateKey = formatDateKey(day.date);
  const showYahrzeits = jewishOptions?.showYahrzeits ?? true;
  const showCustomEvents = jewishOptions?.showCustomEvents ?? true;
  const effectiveHasYahrzeit = hasYahrzeit && showYahrzeits;

  const visibleHolidays = day.holidays.filter((h) => isHolidayVisible(h, jewishOptions));
  const isYomTov = visibleHolidays.some((h) => h.isYomTov);
  const isChabad = visibleHolidays.some((h) => h.isChabad);
  const holidayLine = visibleHolidays
    .slice(0, 2)
    .map((h) => h.name)
    .join(' · ');

  const infoParts = [
    (jewishOptions?.parsha ?? true) && day.jewishInfo.parsha,
    (jewishOptions?.pirkeiAvot ?? true) && day.jewishInfo.pirkeiAvot,
    (jewishOptions?.omer ?? true) && day.jewishInfo.omer,
    (jewishOptions?.birkatHaChodesh ?? true) && day.jewishInfo.birkatHaChodesh,
    jewishOptions?.dafYomi && day.jewishInfo.dafYomi,
    jewishOptions?.rambam && day.jewishInfo.rambam,
    jewishOptions?.chitas && day.jewishInfo.chitas,
  ]
    .filter(Boolean)
    .join(' · ');

  const showDailyZmanim = jewishOptions?.showDailyZmanim ?? true;
  const showCandleLighting = (jewishOptions?.showCandleLighting ?? true) && Boolean(day.zmanim.candleLighting);
  const showHavdalah = (jewishOptions?.showHavdalah ?? true) && Boolean(day.zmanim.havdalah);
  const showSunTimes = (jewishOptions?.showSunTimes ?? true) && (!day.zmanim.candleLighting && !day.zmanim.havdalah);

  const candleStr = formatZmanTime(day.zmanim.candleLighting, location.tzid, settings.hour12, true);
  const havdalahStr = formatZmanTime(day.zmanim.havdalah, location.tzid, settings.hour12, true);
  const sunriseStr = formatZmanTime(day.zmanim.sunrise, location.tzid, settings.hour12, true);
  const sunsetStr = formatZmanTime(day.zmanim.sunset, location.tzid, settings.hour12, true);

  const rawItems: DayEventItem[] =
    eventItems.length > 0
      ? eventItems
      : (events ?? []).map((label, idx) => ({
          id: `legacy:${idx}:${label}`,
          kind: 'custom',
          label,
        }));

  const resolvedItems: DayEventItem[] = rawItems.filter((item) => {
    if (item.kind === 'hebrew' && item.category === 'yahrzeit' && !showYahrzeits) return false;
    if (item.kind === 'custom' && !showCustomEvents) return false;
    return true;
  });

  const canReorderInCell = Boolean(onReorderDayEvents && resolvedItems.length > 1);

  const handleReorder = (fromIndex: number, toIndex: number) => {
    if (!onReorderDayEvents || fromIndex === toIndex) return;
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= resolvedItems.length || toIndex >= resolvedItems.length) {
      return;
    }
    const next = [...resolvedItems];
    const [moved] = next.splice(fromIndex, 1);
    const target = resolvedItems[toIndex];
    next.splice(toIndex, 0, moved);
    onReorderDayEvents(
      day,
      next.map((item) => item.id),
      moved.customEventId,
      target?.customEventId
    );
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelectDay?.(day)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectDay?.(day);
        }
      }}
      onDragOver={(e) => {
        if (!onMoveCustomEventToDate) return;
        if (e.dataTransfer.types.includes('application/x-luach-event')) {
          e.preventDefault();
          setCellDropActive(true);
        }
      }}
      onDragLeave={() => setCellDropActive(false)}
      onDrop={(e) => {
        setCellDropActive(false);
        const raw = e.dataTransfer.getData('application/x-luach-event');
        if (!raw) return;
        try {
          const payload = JSON.parse(raw) as {
            eventId: string;
            sourceDateKey: string;
            customEventId?: string;
            isOneTimeCustom?: boolean;
          };
          if (
            payload.sourceDateKey !== dateKey &&
            payload.customEventId &&
            payload.isOneTimeCustom &&
            onMoveCustomEventToDate
          ) {
            e.preventDefault();
            e.stopPropagation();
            onMoveCustomEventToDate(payload.customEventId, dateKey);
          }
        } catch {
          // ignore invalid drag payload
        }
      }}
      className={`group relative flex ${cellHeightClass} cursor-pointer flex-col gap-0.5 bg-card p-1.5 text-left transition-colors hover:bg-accent/50 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:p-2 ${
        day.isSaturday ? 'bg-muted/45' : ''
      } ${isYomTov ? 'bg-primary/[0.05]' : ''} ${
        effectiveHasYahrzeit ? 'bg-candle/[0.06] ring-1 ring-inset ring-candle/40' : ''
      } ${day.isToday ? 'ring-2 ring-inset ring-primary/60' : ''} ${
        cellDropActive ? 'ring-2 ring-inset ring-primary bg-primary/10' : ''
      }`}
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

      <div className="relative flex items-center justify-between gap-1">
        <span
          className={`font-mono text-[10.5px] font-semibold tabular-nums text-primary sm:text-[11px] ${
            day.isToday ? 'underline decoration-2 underline-offset-2' : ''
          }`}
        >
          {day.gregDay}
        </span>
        <span className="inline-flex items-center gap-1 text-[8.5px] font-medium text-muted-foreground tabular-nums sm:text-[9.5px]">
          {effectiveHasYahrzeit && <Flame className="size-2.5 text-candle" />}
          {(jewishOptions?.moonPhase ?? true) && (
            <span
              className={`inline-flex items-center gap-0.5 ${
                day.lunarPhase.isKeyPhase ? 'text-chabad font-semibold' : 'text-muted-foreground/85'
              }`}
              title={`${day.lunarPhase.label} (${day.lunarPhase.illuminationPct}% lit)`}
            >
              <MoonPhaseDisc
                phase={day.lunarPhase}
                className="size-2.5 sm:size-3"
              />
              {day.lunarPhase.isKeyPhase && (
                <span className="hidden text-[8px] leading-none lg:inline">
                  {day.lunarPhase.shortLabel}
                </span>
              )}
            </span>
          )}
          <span>
            {settings.bilingual ? day.hebrewGematriya.split(' ')[0] : WEEKDAY_NAMES[day.weekday].slice(0, 1)}
          </span>
        </span>
      </div>

      <span className="relative truncate text-[10px] font-semibold leading-tight tracking-tight text-chabad sm:text-[12px]">
        {day.hebrewDate}
      </span>

      <div className="relative min-h-[12px] sm:min-h-[14px]">
        {holidayLine && (
          <span
            className={`block truncate text-[9px] font-semibold leading-tight sm:text-[10px] ${
              isYomTov ? 'text-primary' : isChabad ? 'text-chabad' : 'text-primary/75'
            }`}
          >
            {holidayLine}
          </span>
        )}
      </div>

      {infoParts && (
        <span className="relative hidden truncate text-[9.5px] font-medium leading-tight text-muted-foreground sm:block">
          {infoParts}
        </span>
      )}

      {jewishOptions?.dualZmanim && (
        <span className="relative hidden truncate font-mono text-[8.5px] tabular-nums text-muted-foreground/85 sm:block">
          Shema: {formatZmanTime(day.zmanim.sofZmanShmaMGA, location.tzid, settings.hour12, true)} /{' '}
          {formatZmanTime(day.zmanim.sofZmanShma, location.tzid, settings.hour12, true)}
        </span>
      )}

      {resolvedItems.length > 0 && (
        <div
          className="relative z-10 mt-0.5 flex flex-col gap-0.5"
          onClick={(e) => {
            if (canReorderInCell) {
              e.stopPropagation();
            }
          }}
        >
          {resolvedItems.slice(0, 3).map((item, idx) => {
            const isTopPriority = idx === 0;
            const isDraggingThis = draggedId === item.id;
            const isDragTarget = dragOverId === item.id && draggedId !== item.id;

            return (
              <div
                key={item.id}
                draggable={canReorderInCell || Boolean(item.isOneTimeCustom && onMoveCustomEventToDate)}
                onDragStart={(e) => {
                  e.stopPropagation();
                  setDraggedId(item.id);
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData(
                    'application/x-luach-event',
                    JSON.stringify({
                      eventId: item.id,
                      index: idx,
                      sourceDateKey: dateKey,
                      customEventId: item.customEventId,
                      isOneTimeCustom: item.isOneTimeCustom,
                    })
                  );
                }}
                onDragOver={(e) => {
                  if (!canReorderInCell) return;
                  e.preventDefault();
                  e.stopPropagation();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverId !== item.id) {
                    setDragOverId(item.id);
                  }
                }}
                onDragLeave={(e) => {
                  e.stopPropagation();
                  if (dragOverId === item.id) {
                    setDragOverId(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOverId(null);
                  setDraggedId(null);
                  const raw = e.dataTransfer.getData('application/x-luach-event');
                  if (!raw) return;
                  try {
                    const payload = JSON.parse(raw) as {
                      eventId: string;
                      index: number;
                      sourceDateKey: string;
                      customEventId?: string;
                      isOneTimeCustom?: boolean;
                    };
                    if (payload.sourceDateKey === dateKey) {
                      const fromIdx = resolvedItems.findIndex((x) => x.id === payload.eventId);
                      if (fromIdx !== -1 && fromIdx !== idx) {
                        handleReorder(fromIdx, idx);
                      }
                    } else if (
                      payload.customEventId &&
                      payload.isOneTimeCustom &&
                      onMoveCustomEventToDate
                    ) {
                      onMoveCustomEventToDate(payload.customEventId, dateKey);
                    }
                  } catch {
                    // ignore invalid drag data
                  }
                }}
                onDragEnd={(e) => {
                  e.stopPropagation();
                  setDraggedId(null);
                  setDragOverId(null);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectDay?.(day);
                }}
                title={
                  canReorderInCell
                    ? `${item.label} — Drag up/down to change display priority in this day cell`
                    : item.label
                }
                className={`group/ev flex items-center justify-between gap-0.5 rounded px-1 py-0.5 text-[8px] leading-tight transition-all sm:text-[9px] ${
                  isTopPriority
                    ? 'bg-candle/12 font-semibold text-candle ring-1 ring-inset ring-candle/25'
                    : 'bg-muted/70 font-medium text-foreground/85'
                } ${
                  canReorderInCell
                    ? 'cursor-grab active:cursor-grabbing hover:ring-1 hover:ring-primary/50'
                    : ''
                } ${isDraggingThis ? 'opacity-40' : ''} ${
                  isDragTarget ? 'ring-2 ring-primary bg-primary/15' : ''
                }`}
              >
                <span className="flex min-w-0 items-center gap-0.5">
                  {canReorderInCell && (
                    <GripVertical className="size-2.5 shrink-0 text-muted-foreground/70 transition-opacity group-hover/ev:text-primary print:hidden" />
                  )}
                  <span className="truncate">{item.label}</span>
                </span>

                {canReorderInCell && idx > 0 && (
                  <button
                    type="button"
                    aria-label={`Move ${item.label} to top priority`}
                    title="Promote to #1 top priority"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReorder(idx, 0);
                    }}
                    className="hidden shrink-0 cursor-pointer rounded p-0.5 text-muted-foreground hover:bg-primary/15 hover:text-primary group-hover/ev:inline-flex print:hidden"
                  >
                    <ArrowUp className="size-2.5" />
                  </button>
                )}
              </div>
            );
          })}
          {resolvedItems.length > 3 && (
            <span className="px-1 text-[8px] font-medium text-muted-foreground">
              +{resolvedItems.length - 3} more (click to reorder)
            </span>
          )}
        </div>
      )}

      {showDailyZmanim && (showCandleLighting || showHavdalah || showSunTimes) && (
        <div className="relative mt-auto flex flex-col gap-0.5 pt-0.5 sm:pt-1">
          {showCandleLighting && (
            <span className="inline-flex max-w-full items-center gap-0.5 truncate font-mono text-[8.5px] font-medium leading-none tabular-nums text-candle sm:gap-1 sm:text-[10px]">
              <Flame className="size-2.5 shrink-0 sm:size-3" />
              <span className="hidden sm:inline">
                {day.zmanim.candleLightingType === 'after-nightfall' ? 'YT Candle' : 'Candle'}
              </span>
              <span>{candleStr}</span>
              {settings.bilingual && (
                <span dir="rtl" className="hidden shrink-0 font-sans text-[9px] sm:inline">
                  הדלקת נרות
                </span>
              )}
            </span>
          )}
          {showHavdalah && (
            <span className="inline-flex max-w-full items-center gap-0.5 truncate font-mono text-[8.5px] font-medium leading-none tabular-nums text-candle sm:gap-1 sm:text-[10px]">
              <Sparkles className="size-2.5 shrink-0 sm:size-3" />
              <span className="hidden sm:inline">
                {day.zmanim.havdalahType === 'yom-tov'
                  ? 'Yom Tov Havdalah'
                  : day.zmanim.havdalahType === 'yaknahaz'
                  ? 'Yaknahaz'
                  : 'Havdalah'}
              </span>
              <span className="sm:hidden">
                {day.zmanim.havdalahType === 'yom-tov' ? 'YT Hav' : 'Hav'}
              </span>
              <span>{havdalahStr}</span>
              {settings.bilingual && (
                <span dir="rtl" className="hidden shrink-0 font-sans text-[9px] sm:inline">
                  {day.zmanim.havdalahType === 'yom-tov' ? 'הבדלה יו״ט' : 'הבדלה'}
                </span>
              )}
            </span>
          )}
          {showSunTimes && (
            <span className="inline-flex max-w-full items-center gap-0.5 truncate font-mono text-[8px] font-medium leading-none tabular-nums text-muted-foreground sm:gap-1 sm:text-[9.5px]">
              <Sun className="size-2 shrink-0 sm:size-2.5" />
              <span>{sunriseStr}</span>
              <span className="hidden sm:inline">· ↓ {sunsetStr}</span>
            </span>
          )}
        </div>
      )}
    </div>
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
  customEvents,
  dayEventOrder,
  onReorderDayEvents,
  onMoveCustomEventToDate,
  monthIndex = 0,
  sponsors = [],
  sponsorsEnabled = false,
  showCropMarks = false,
  orientation = 'portrait',
  fitToPage = true,
  monthsPerPage = 1,
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
  customEvents?: CustomCalendarEvent[];
  dayEventOrder?: Record<string, string[]>;
  onReorderDayEvents?: (
    day: CalendarDay,
    orderedIds: string[],
    draggedCustomId?: string,
    targetCustomId?: string
  ) => void;
  onMoveCustomEventToDate?: (customEventId: string, targetDateKey: string) => void;
  monthIndex?: number;
  sponsors?: CommunitySponsor[];
  sponsorsEnabled?: boolean;
  showCropMarks?: boolean;
  orientation?: 'portrait' | 'landscape';
  fitToPage?: boolean;
  monthsPerPage?: 1 | 4;
}) {
  const [mobileLayout, setMobileLayout] = useState<'grid' | 'agenda'>('grid');

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

  // Sponsors matching this month
  const cellSponsors = sponsorsEnabled
    ? sponsors.filter(
        (sp) =>
          (sp.tier === 'cell' || sp.tier === 'patron') &&
          (sp.monthIndex === 'all' || sp.monthIndex === month.gregMonth)
      )
    : [];

  const bannerSponsors = sponsorsEnabled
    ? sponsors.filter(
        (sp) =>
          (sp.tier === 'banner' || sp.tier === 'patron') &&
          (sp.monthIndex === 'all' || sp.monthIndex === month.gregMonth)
      )
    : [];

  let blankCounter = 0;

  const monthDaysList = month.weeks
    .flat()
    .filter((d): d is CalendarDay => d !== null);

  const cellHeightClass =
    monthsPerPage === 4
      ? fitToPage
        ? 'h-full min-h-[68px] sm:min-h-[84px]'
        : 'min-h-[64px] sm:min-h-[76px]'
      : fitToPage
      ? orientation === 'portrait'
        ? 'h-full min-h-[86px] sm:min-h-[126px] lg:min-h-[144px]'
        : 'h-full min-h-[80px] sm:min-h-[108px] lg:min-h-[120px]'
      : 'min-h-[74px] sm:min-h-[104px]';

  return (
    <section
      id={id}
      className={`print-month relative scroll-mt-20 ${
        fitToPage ? 'flex h-full flex-1 flex-col' : ''
      }`}
    >
      {showCropMarks && <CropMarksOverlay />}

      <div
        className={`overflow-hidden rounded-2xl border border-border bg-card shadow-xs ${
          fitToPage ? 'flex h-full flex-1 flex-col' : ''
        }`}
      >
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3.5 sm:items-end sm:px-5 sm:py-4">
          <div>
            <h3 className="font-display text-lg font-semibold tracking-tight text-primary sm:text-xl">
              {month.name}{' '}
              <span className="font-medium text-primary/75 tabular-nums">{month.gregYear}</span>
            </h3>
            <p className="mt-0.5 text-xs font-medium text-chabad">{month.hebrewLabel}</p>
          </div>

          {/* Mobile Grid vs Agenda View Toggle */}
          <div className="inline-flex items-center rounded-lg border border-border bg-muted/50 p-0.5 sm:hidden print:hidden">
            <button
              type="button"
              onClick={() => setMobileLayout('grid')}
              className={`inline-flex min-h-[34px] items-center gap-1 rounded-md px-2.5 text-xs font-medium ${
                mobileLayout === 'grid'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground'
              }`}
            >
              <LayoutGrid className="size-3.5" />
              <span>Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileLayout('agenda')}
              className={`inline-flex min-h-[34px] items-center gap-1 rounded-md px-2.5 text-xs font-medium ${
                mobileLayout === 'agenda'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground'
              }`}
            >
              <List className="size-3.5" />
              <span>Agenda</span>
            </button>
          </div>

          {photo && (
            <img
              src={photo}
              alt={month.name}
              referrerPolicy="no-referrer"
              className="h-14 w-24 rounded-lg border border-border object-cover sm:h-16 sm:w-28"
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
          <div className="flex items-center justify-end gap-3 border-b border-border px-4 py-1.5 sm:px-5 print:hidden">
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
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border bg-muted/40 px-4 py-2 text-[11px] sm:px-5 sm:text-xs">
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

        {/* Mobile Agenda List View (only visible on <640px when Agenda mode selected) */}
        {mobileLayout === 'agenda' && (
          <div className="print-agenda-view divide-y divide-border sm:hidden print:hidden">
            {monthDaysList.map((day) => {
              const mergedEvents = getEventsForDay(
                day,
                specialEvents ?? {},
                personalHebrewEvents ?? [],
                customEvents ?? [],
                dayEventOrder
              );
              const showYahrzeits = jewishOptions?.showYahrzeits ?? true;
              const rawYahrzeits = getYahrzeitsForDay(day, personalHebrewEvents ?? []);
              const dayYahrzeits = showYahrzeits ? rawYahrzeits : [];
              const visibleHolidays = day.holidays.filter((h) => isHolidayVisible(h, jewishOptions));
              const isYomTov = visibleHolidays.some((h) => h.isYomTov);

              return (
                <button
                  key={day.gregDay}
                  type="button"
                  onClick={() => onSelectDay?.(day)}
                  className={`flex min-h-[60px] w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50 ${
                    day.isSaturday ? 'bg-muted/35' : ''
                  } ${isYomTov ? 'bg-primary/[0.05]' : ''} ${
                    dayYahrzeits.length > 0 ? 'bg-candle/[0.06]' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-10 shrink-0 flex-col items-center justify-center rounded-xl border border-border bg-background">
                      <span className="text-[9px] font-semibold uppercase text-muted-foreground">
                        {WEEKDAY_NAMES[day.weekday]}
                      </span>
                      <span className="font-mono text-xs font-bold tabular-nums text-primary">
                        {day.gregDay}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-chabad">
                          {day.hebrewDate}
                        </span>
                        {(jewishOptions?.moonPhase ?? true) && (
                          <span
                            className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground"
                            title={`${day.lunarPhase.label} (${day.lunarPhase.illuminationPct}%)`}
                          >
                            <MoonPhaseDisc phase={day.lunarPhase} className="size-3 text-chabad" />
                            <span>{day.lunarPhase.illuminationPct}%</span>
                          </span>
                        )}
                        {visibleHolidays.length > 0 && (
                          <span className="truncate text-xs font-semibold text-primary">
                            · {visibleHolidays[0].name}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {[
                          day.jewishInfo.parsha,
                          day.jewishInfo.omer,
                          ...mergedEvents,
                        ]
                          .filter(Boolean)
                          .join(' · ') ||
                          `Sunrise ${formatZmanTime(day.zmanim.sunrise, location.tzid, settings.hour12, true)} · Sunset ${formatZmanTime(day.zmanim.sunset, location.tzid, settings.hour12, true)}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <div className="flex flex-col items-end gap-0.5">
                      {day.zmanim.candleLighting && (
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold tabular-nums text-candle">
                          <Flame className="size-3.5" />
                          <span>
                            Candle{' '}
                            {formatZmanTime(
                              day.zmanim.candleLighting,
                              location.tzid,
                              settings.hour12,
                              true
                            )}
                          </span>
                        </span>
                      )}
                      {day.zmanim.havdalah && (
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold tabular-nums text-candle">
                          <Sparkles className="size-3.5" />
                          <span>
                            {day.zmanim.havdalahType === 'yom-tov'
                              ? 'Yom Tov Havdalah'
                              : day.zmanim.havdalahType === 'yaknahaz'
                              ? 'Yaknahaz'
                              : 'Havdalah'}{' '}
                            {formatZmanTime(
                              day.zmanim.havdalah,
                              location.tzid,
                              settings.hour12,
                              true
                            )}
                          </span>
                        </span>
                      )}
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* 7-Column Calendar Grid (Auto-Stretches to Fit Portrait & Landscape) */}
        <div
          className={`print-grid-view flex flex-col bg-border ${
            fitToPage ? 'flex-1' : ''
          } ${mobileLayout === 'agenda' ? 'hidden sm:flex print:flex' : ''}`}
        >
          {/* Weekday Header Row */}
          <div className="grid grid-cols-7 gap-px border-b border-border bg-border">
            {WEEKDAY_NAMES.map((dayName, idx) => (
              <div
                key={dayName}
                className={`bg-muted/60 py-1.5 text-center text-[10px] font-semibold text-muted-foreground sm:py-2 sm:text-[11px] ${
                  dayName === 'Sat' ? 'bg-muted' : ''
                }`}
              >
                {settings.bilingual ? `${dayName} · ${HEBREW_WEEKDAY_LETTERS[idx]}` : dayName}
              </div>
            ))}
          </div>

          {/* Week Rows Grid (auto-rows-fr stretches weeks equally to fill Portrait or Landscape page) */}
          <div
            className={`print-days-grid grid grid-cols-7 gap-px bg-border ${
              fitToPage ? 'flex-1 auto-rows-fr' : ''
            }`}
          >
            {month.weeks.flatMap((week, wIdx) => {
              const cells = week.map((day, dIdx) => {
                const cellKey = `${wIdx}-${dIdx}`;
                if (day) {
                  const dateKey = formatDateKey(day.date);
                  const structuredEvents = getStructuredEventsForDay(
                    day,
                    specialEvents ?? {},
                    personalHebrewEvents ?? [],
                    customEvents ?? [],
                    dayEventOrder
                  );
                  const mergedEvents = structuredEvents.map((item) => item.label);
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
                      eventItems={structuredEvents}
                      onReorderDayEvents={onReorderDayEvents}
                      onMoveCustomEventToDate={onMoveCustomEventToDate}
                      hasYahrzeit={dayYahrzeits.length > 0}
                      cellHeightClass={cellHeightClass}
                    />
                  );
                }

                const sponsorForBlank =
                  cellSponsors.length > 0
                    ? cellSponsors[(monthIndex + blankCounter++) % cellSponsors.length]
                    : undefined;

                return (
                  <BlankCellDecoration
                    key={cellKey}
                    cellKey={cellKey}
                    photo={blankCellPhotos?.[cellKey]}
                    onPhotoChange={onBlankCellPhotoChange}
                    sponsorAd={sponsorForBlank}
                    cellHeightClass={cellHeightClass}
                  />
                );
              });

              if (onWeekPhotoChange) {
                const weekKey = `${monthIndex}:${wIdx}`;
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

        {/* Monthly Sponsor Footer Banner */}
        {bannerSponsors.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/35 px-4 py-2.5 text-xs sm:px-5">
            {bannerSponsors.slice(0, 2).map((sp) => (
              <div key={sp.id} className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="inline-flex items-center gap-1 font-semibold text-chabad">
                  <Award className="size-3.5" />
                  <span>{sp.businessName}</span>
                </span>
                <span aria-hidden="true" className="text-muted-foreground">
                  ·
                </span>
                <span className="text-muted-foreground">{sp.tagline}</span>
                {sp.contact && (
                  <>
                    <span aria-hidden="true" className="text-muted-foreground">
                      ·
                    </span>
                    <span className="font-mono font-medium text-primary">{sp.contact}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
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
      className={`inter-month-page flex min-h-[380px] flex-col justify-center overflow-hidden rounded-2xl border border-border bg-card p-6 text-center shadow-xs sm:p-8 ${className}`}
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
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 print:hidden">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent"
          >
            <ImagePlus className="size-3.5" />
            <span>{page.photo ? 'Change photo' : 'Add photo'}</span>
          </button>
          {page.photo && (
            <button
              type="button"
              onClick={() => onChange({ ...page, photo: undefined })}
              className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-red-600 hover:bg-accent"
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
            className="min-h-[40px] cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs text-red-600 hover:bg-accent"
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
    <header className="print-masthead mb-8 border-b border-border pb-7">
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
          <h2 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">
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

      <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground sm:text-sm">
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
          ? 'Sephardi / Harav Ovadia Yosef custom'
          : 'Vilna Gaon (GRA) custom'}
        .
      </p>
    </header>
  );
}

export function CalendarLegend({ calendar }: { calendar: GeneratedCalendar }) {
  const { t } = useTranslation();
  return (
    <footer className="print-legend mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-5 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <span className="size-3 rounded-xs bg-primary/[0.08] ring-1 ring-inset ring-primary/40" />
        <span>Major Holiday / Yom Tov</span>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="size-3 rounded-xs bg-candle/[0.1] ring-1 ring-inset ring-candle/50" />
        <span>Yahrzeit / Commemoration</span>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Flame className="size-3.5 text-candle" />
        <span>Candle Lighting / Havdalah</span>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Sun className="size-3.5" />
        <span>Sunrise · Sunset</span>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Moon className="size-3.5 text-chabad" />
        <span>Lunar Cycle / Moon Phase</span>
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
  customEvents,
  dayEventOrder,
  onReorderDayEvents,
  onMoveCustomEventToDate,
  startMonthIndex = 0,
  interMonthPages,
  onInterMonthPageChange,
  sponsors = [],
  sponsorsEnabled = false,
  showCropMarks = false,
  orientation = 'portrait',
  fitToPage = true,
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
  customEvents?: CustomCalendarEvent[];
  dayEventOrder?: Record<string, string[]>;
  onReorderDayEvents?: (
    day: CalendarDay,
    orderedIds: string[],
    draggedCustomId?: string,
    targetCustomId?: string
  ) => void;
  onMoveCustomEventToDate?: (customEventId: string, targetDateKey: string) => void;
  startMonthIndex?: number;
  interMonthPages?: Record<string, InterMonthPageConfig>;
  onInterMonthPageChange?: (mIdx: number, next: InterMonthPageConfig | null) => void;
  sponsors?: CommunitySponsor[];
  sponsorsEnabled?: boolean;
  showCropMarks?: boolean;
  orientation?: 'portrait' | 'landscape';
  fitToPage?: boolean;
}) {
  return (
    <div
      className={`calendar-print print-area mx-auto w-full transition-all duration-200 ${
        orientation === 'landscape'
          ? 'max-w-none'
          : fitToPage
          ? 'max-w-[980px]'
          : 'max-w-[900px]'
      } ${className}`}
      style={style}
      data-months-per-page={monthsPerPage}
      data-orientation={orientation}
      data-fit-to-page={fitToPage ? 'true' : 'false'}
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
            ? 'grid grid-cols-1 gap-6 xl:grid-cols-2 auto-rows-fr'
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
                customEvents={customEvents}
                dayEventOrder={dayEventOrder}
                onReorderDayEvents={onReorderDayEvents}
                onMoveCustomEventToDate={onMoveCustomEventToDate}
                monthIndex={actualIdx}
                sponsors={sponsors}
                sponsorsEnabled={sponsorsEnabled}
                showCropMarks={showCropMarks}
                orientation={orientation}
                fitToPage={fitToPage}
                monthsPerPage={monthsPerPage}
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
