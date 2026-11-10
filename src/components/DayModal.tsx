import React, { useState, useRef } from 'react';
import { Flame, ImagePlus, Sparkles, X, BookOpen, Clock } from 'lucide-react';
import {
  CalendarDay,
  CalendarLocation,
  CalendarSettings,
  PersonalHebrewEvent,
  ZMANIM_LIST,
  doesHebrewEventMatchDay,
  formatZmanTime,
} from '../lib/calendarEngine';
import { CalendarTheme, getThemeStyleVars } from '../lib/themes';
import { useTranslation } from '../i18n/translations';

function ZmanRow({
  label,
  heLabel,
  value,
  highlight = false,
  bilingual = false,
}: {
  label: string;
  heLabel?: string;
  value: string;
  highlight?: boolean;
  bilingual?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 border-b border-border/60 py-2.5 text-xs last:border-b-0 ${
        highlight ? 'font-semibold text-candle' : ''
      }`}
    >
      <span className="flex items-center gap-2 text-muted-foreground">
        <span>{label}</span>
        {bilingual && heLabel && (
          <span dir="rtl" className="text-[11px] opacity-80">
            · {heLabel}
          </span>
        )}
      </span>
      <span className="font-mono font-medium tabular-nums text-foreground">{value}</span>
    </div>
  );
}

export function DayModal({
  day,
  location,
  settings,
  theme,
  photo,
  onPhotoChange,
  events,
  personalHebrewEvents = [],
  onAddEvent,
  onRemoveEvent,
  onClose,
}: {
  day: CalendarDay | null;
  location: CalendarLocation;
  settings: CalendarSettings;
  theme: CalendarTheme;
  photo?: string;
  onPhotoChange?: (src: string | undefined) => void;
  events?: string[];
  personalHebrewEvents?: PersonalHebrewEvent[];
  onAddEvent?: (text: string) => void;
  onRemoveEvent?: (idx: number) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [newEventText, setNewEventText] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  if (!day) return null;

  const fullGregDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(day.date);

  const matchingHebrewEvents = personalHebrewEvents.filter((ev) =>
    doesHebrewEventMatchDay(ev, day)
  );

  const handlePhotoUpload = (file?: File) => {
    if (!file || !file.type.startsWith('image/') || file.size > 5_000_000 || !onPhotoChange) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onPhotoChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newEventText.trim();
    if (!trimmed || !onAddEvent) return;
    onAddEvent(trimmed);
    setNewEventText('');
  };

  const hasLearningInfo =
    day.jewishInfo.parsha ||
    day.jewishInfo.pirkeiAvot ||
    day.jewishInfo.omer ||
    day.jewishInfo.birkatHaChodesh ||
    day.jewishInfo.kiddushLevana ||
    day.jewishInfo.chitas ||
    day.jewishInfo.dafYomi ||
    day.jewishInfo.rambam ||
    day.jewishInfo.fastDetails;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-0 backdrop-blur-xs sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        style={getThemeStyleVars(theme)}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-border bg-card p-5 pb-8 text-foreground shadow-2xl sm:max-h-[90vh] sm:rounded-2xl sm:p-6"
      >
        {/* Mobile Bottom-Sheet Drag Handle */}
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-border sm:hidden" />

        <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{fullGregDate}</p>
            <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight text-chabad">
              {day.hebrewDate}, {day.hebrewYear}
            </h3>
            <p dir="rtl" className="mt-0.5 text-xs font-medium text-muted-foreground">
              {day.hebrewGematriya}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close day details"
            className="inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          {/* Day Photo */}
          {onPhotoChange && (
            <div>
              {photo ? (
                <div className="relative overflow-hidden rounded-xl border border-border">
                  <img
                    src={photo}
                    alt="Day background"
                    referrerPolicy="no-referrer"
                    className="h-36 w-full object-cover"
                  />
                  <div className="absolute right-2 top-2 flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="min-h-[36px] cursor-pointer rounded-lg bg-black/65 px-3 py-1.5 text-xs font-medium text-white hover:bg-black/80"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => onPhotoChange(undefined)}
                      className="min-h-[36px] cursor-pointer rounded-lg bg-black/65 px-3 py-1.5 text-xs font-medium text-white hover:bg-black/80"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:w-auto"
                >
                  <ImagePlus className="size-4" />
                  <span>Add photo to this date</span>
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePhotoUpload(e.target.files?.[0])}
              />
            </div>
          )}

          {/* Holidays & Chabad Dates */}
          {day.holidays.length > 0 && (
            <div className="rounded-xl border border-border bg-muted/35 p-3.5">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Sparkles className="size-3.5" />
                <span>Holidays &amp; Commemorations</span>
              </p>
              <div className="flex flex-col gap-1.5 text-xs">
                {day.holidays.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 font-medium text-foreground"
                  >
                    <span>{h.name}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {h.isYomTov
                        ? 'Yom Tov'
                        : h.isChabad
                        ? 'Chabad Date'
                        : h.isFastDay
                        ? 'Fast Day'
                        : 'Observance'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Torah Portions & Daily Study */}
          {hasLearningInfo && (
            <div className="rounded-xl border border-border bg-muted/25 p-3.5 text-xs leading-relaxed">
              <p className="mb-2 flex items-center gap-1.5 font-semibold text-foreground">
                <BookOpen className="size-3.5 text-primary" />
                <span>Torah &amp; Daily Study Schedule</span>
              </p>
              <div className="flex flex-col gap-1 text-muted-foreground">
                {day.jewishInfo.parsha && (
                  <p>
                    <strong className="text-foreground">{t('day.parsha')}:</strong>{' '}
                    {day.jewishInfo.parsha}
                  </p>
                )}
                {day.jewishInfo.omer && (
                  <p>
                    <strong className="text-foreground">{t('day.omer')}:</strong>{' '}
                    {day.jewishInfo.omer}
                  </p>
                )}
                {day.jewishInfo.pirkeiAvot && (
                  <p>
                    <strong className="text-foreground">{t('day.learning')}:</strong>{' '}
                    {day.jewishInfo.pirkeiAvot}
                  </p>
                )}
                {day.jewishInfo.birkatHaChodesh && (
                  <p className="font-medium text-primary">{day.jewishInfo.birkatHaChodesh}</p>
                )}
                {day.jewishInfo.kiddushLevana && (
                  <p className="font-medium text-chabad">{day.jewishInfo.kiddushLevana}</p>
                )}
                {day.jewishInfo.chitas && (
                  <p>
                    <strong className="text-foreground">Chitas:</strong> {day.jewishInfo.chitas}
                  </p>
                )}
                {day.jewishInfo.dafYomi && (
                  <p>
                    <strong className="text-foreground">Talmud:</strong> {day.jewishInfo.dafYomi}
                  </p>
                )}
                {day.jewishInfo.rambam && (
                  <p>
                    <strong className="text-foreground">Daily Rambam:</strong>{' '}
                    {day.jewishInfo.rambam}
                  </p>
                )}
                {day.jewishInfo.fastDetails && (
                  <p className="font-medium text-candle">{day.jewishInfo.fastDetails}</p>
                )}
              </div>
            </div>
          )}

          {/* Special Events & Recurring Yahrzeits */}
          <div className="flex flex-col gap-2.5 rounded-xl border border-border p-3.5">
            <p className="text-xs font-semibold text-foreground">{t('cal.specialEvents')}</p>

            {matchingHebrewEvents.length > 0 && (
              <div className="flex flex-col gap-1.5 text-xs text-chabad">
                {matchingHebrewEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-candle/25 bg-candle/10 px-2.5 py-1.5"
                  >
                    <div>
                      <span>
                        {ev.category === 'yahrzeit'
                          ? '🕯️ Yahrzeit:'
                          : ev.category === 'birthday'
                          ? '🎉 Hebrew Birthday:'
                          : ev.category === 'anniversary'
                          ? '💍 Anniversary:'
                          : '📌 Commemoration:'}{' '}
                        <strong className="text-foreground">{ev.title}</strong>
                      </span>
                      {ev.notes && (
                        <p dir="rtl" className="mt-0.5 text-[11px] font-medium text-chabad">
                          {ev.notes}
                        </p>
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                      ({ev.hebrewDay} {ev.hebrewMonthName})
                    </span>
                  </div>
                ))}
              </div>
            )}

            {(events?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-2">
                {events!.map((evText, idx) => (
                  <span
                    key={`${evText}-${idx}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-2.5 py-1.5 text-xs font-medium text-foreground"
                  >
                    <span>{evText}</span>
                    {onRemoveEvent && (
                      <button
                        type="button"
                        onClick={() => onRemoveEvent(idx)}
                        className="cursor-pointer p-0.5 text-muted-foreground hover:text-red-600"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}

            {onAddEvent && (
              <form onSubmit={handleAddEvent} className="flex gap-2">
                <input
                  type="text"
                  value={newEventText}
                  onChange={(e) => setNewEventText(e.target.value)}
                  placeholder={t('cal.eventPlaceholder')}
                  className="min-h-[44px] flex-1 rounded-xl border border-border bg-background px-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="submit"
                  disabled={!newEventText.trim()}
                  className="min-h-[44px] cursor-pointer rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground transition-opacity disabled:opacity-40 whitespace-nowrap shrink-0"
                >
                  {t('cal.addEvent')}
                </button>
              </form>
            )}
          </div>

          {/* 13 Halachic Zmanim */}
          <div className="rounded-xl border border-border bg-card p-3.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Clock className="size-3.5 text-primary" />
                <span>Halachic Zmanim ({location.city})</span>
              </span>
              <span className="text-[11px] text-muted-foreground">
                {location.tzid.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="divide-y divide-border/50">
              {ZMANIM_LIST.map(({ key, label, heLabel }) => (
                <ZmanRow
                  key={key}
                  label={label}
                  heLabel={heLabel}
                  value={formatZmanTime(day.zmanim[key], location.tzid, settings.hour12)}
                  bilingual={settings.bilingual}
                />
              ))}

              {day.zmanim.candleLighting && (
                <ZmanRow
                  label={
                    day.zmanim.candleLightingType === 'after-nightfall'
                      ? `${t('day.candleLighting')} (After Nightfall / Yom Tov)`
                      : t('day.candleLighting')
                  }
                  heLabel="הדלקת נרות"
                  value={formatZmanTime(day.zmanim.candleLighting, location.tzid, settings.hour12)}
                  highlight
                  bilingual={settings.bilingual}
                />
              )}

              {day.zmanim.havdalah && (
                <ZmanRow
                  label={
                    day.zmanim.havdalahType === 'yom-tov'
                      ? 'Yom Tov Havdalah (Motzei Yom Tov)'
                      : day.zmanim.havdalahType === 'yaknahaz'
                      ? 'Havdalah · Yaknahaz (Kiddush & Havdalah)'
                      : t('day.havdalahLabel')
                  }
                  heLabel={
                    day.zmanim.havdalahType === 'yom-tov'
                      ? 'הבדלה למוצאי יו״ט'
                      : day.zmanim.havdalahType === 'yaknahaz'
                      ? 'הבדלה (יקנה״ז)'
                      : 'הבדלה'
                  }
                  value={formatZmanTime(day.zmanim.havdalah, location.tzid, settings.hour12)}
                  highlight
                  bilingual={settings.bilingual}
                />
              )}
            </div>

            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Flame className="size-3.5 shrink-0 text-candle" />
              <span>
                Candle lighting {settings.candleMinutes} min before sunset · Tzeit{' '}
                {settings.tzeitMinutes} min after sunset
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
