import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  Clock,
  Flame,
  Sparkles,
  Eye,
  FileSpreadsheet,
  Sun,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  CalendarDay,
  CalendarLocation,
  DEFAULT_SETTINGS,
  PRESET_LOCATIONS,
  detectUserGeoLocation,
  formatAutoOrgName,
  formatZmanTime,
  generateCalendar,
} from '../lib/calendarEngine';
import { BUILTIN_THEMES } from '../lib/themes';
import { MonthCard } from './CalendarGrid';
import { DayModal } from './DayModal';
import { LanguageSwitcher } from './LogoMark';
import { useTranslation } from '../i18n/translations';

export function LandingView({
  onOpenStudio,
}: {
  onOpenStudio: () => void;
}) {
  const { t } = useTranslation();
  const [selectedSampleDay, setSelectedSampleDay] = useState<CalendarDay | null>(null);
  const [sampleLocation, setSampleLocation] = useState<CalendarLocation>(PRESET_LOCATIONS[0]);

  useEffect(() => {
    let cancelled = false;
    detectUserGeoLocation(true).then((geoLoc) => {
      if (!cancelled && geoLoc) {
        setSampleLocation(geoLoc);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);
  const sampleSettings = useMemo(
    () => ({
      ...DEFAULT_SETTINGS,
      year: new Date().getFullYear(),
    }),
    []
  );

  const sampleCalendar = useMemo(
    () => generateCalendar(sampleSettings.year, sampleLocation, sampleSettings),
    [sampleSettings, sampleLocation]
  );

  const currentMonthIdx = new Date().getMonth();
  const sampleMonth = sampleCalendar.months[currentMonthIdx] ?? sampleCalendar.months[0];

  const todayCell = useMemo(() => {
    for (const m of sampleCalendar.months) {
      for (const w of m.weeks) {
        for (const d of w) {
          if (d?.isToday) return d;
        }
      }
    }
    return sampleMonth.weeks.flat().find((d) => d !== null) ?? null;
  }, [sampleCalendar, sampleMonth]);

  const featureItems = [
    {
      icon: Calendar,
      title: t('features.hebrewDates.title'),
      body: t('features.hebrewDates.body'),
    },
    {
      icon: Clock,
      title: t('features.dailyZmanim.title'),
      body: t('features.dailyZmanim.body'),
    },
    {
      icon: Flame,
      title: t('features.candleLighting.title'),
      body: t('features.candleLighting.body'),
    },
    {
      icon: Sparkles,
      title: t('features.holidays.title'),
      body: t('features.holidays.body'),
    },
    {
      icon: Eye,
      title: t('features.livePreview.title'),
      body: t('features.livePreview.body'),
    },
    {
      icon: FileSpreadsheet,
      title: t('features.exports.title'),
      body: t('features.exports.body'),
    },
  ];

  const steps = [
    {
      title: t('how.step1.title'),
      body: t('how.step1.body'),
    },
    {
      title: t('how.step2.title'),
      body: t('how.step2.body'),
    },
    {
      title: t('how.step3.title'),
      body: t('how.step3.body'),
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:h-16 sm:gap-8 sm:px-6">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            className="font-display text-lg font-bold tracking-tight text-foreground whitespace-nowrap shrink-0"
          >
            Luach
          </a>

          {/* Zone 2: 4 concise single-line text navigation links */}
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <a
              href="#features"
              className="transition-colors hover:text-foreground hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              {t('nav.features')}
            </a>
            <a
              href="#how"
              className="transition-colors hover:text-foreground hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              {t('nav.how')}
            </a>
            <a
              href="#sample"
              className="transition-colors hover:text-foreground hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              {t('nav.sample')}
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenStudio}
              className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 whitespace-nowrap shrink-0"
            >
              <span>{t('nav.openStudio')}</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="top" className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(49,94,203,0.09),transparent_70%)]"
        />

        <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-12 lg:pt-20">
          {/* Language & Quick Mode Toolbar */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="font-semibold text-primary">{t('hero.badge')}</span>
              <span aria-hidden="true">·</span>
              <span>19 Community Presets</span>
              <span aria-hidden="true">·</span>
              <span>Tishrei–Elul &amp; Jan–Dec Cycles</span>
            </div>
            <LanguageSwitcher />
          </div>

          <div className="grid items-stretch gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col justify-center"
            >
              <h1
                style={{ textWrap: 'balance' }}
                className="font-display text-3xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.35rem]"
              >
                {t('hero.title1')}{' '}
                <span className="text-primary">{t('hero.title2')}</span>
              </h1>

              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
                {t('hero.desc')}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3 sm:mt-8">
                <button
                  type="button"
                  onClick={onOpenStudio}
                  className="inline-flex min-h-[46px] cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-95 whitespace-nowrap shrink-0"
                >
                  <span>{t('hero.start')}</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>

              {/* Clean unboxed metadata with typographic separators */}
              <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground sm:mt-10">
                <span className="font-medium text-foreground">{t('hero.zmanimPerDay')}</span>
                <span aria-hidden="true">·</span>
                <span>{t('hero.customsDefault')}</span>
                <span aria-hidden="true">·</span>
                <span>Chitas, Daf Yomi &amp; Rambam</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">PDF / CSV / ICS / Webcal</span>
              </div>
            </motion.div>

            {/* Interactive Sample Month Preview */}
            <motion.div
              id="sample"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="scroll-mt-24 flex flex-col justify-between rounded-2xl border border-border bg-card p-3.5 shadow-lg sm:p-4"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <span className="font-semibold text-foreground">
                    {formatAutoOrgName(sampleLocation.city)} · {sampleMonth.name} {sampleMonth.gregYear}
                  </span>
                  <span aria-hidden="true" className="text-muted-foreground">
                    ·
                  </span>
                  <span className="text-chabad">{sampleMonth.hebrewLabel}</span>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {sampleLocation.city} · Tap any day or switch Grid/Agenda
                </span>
              </div>

              <MonthCard
                month={sampleMonth}
                location={sampleLocation}
                settings={sampleSettings}
                onSelectDay={(d) => setSelectedSampleDay(d)}
              />

              {todayCell && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 rounded-xl bg-muted/60 px-3.5 py-2.5 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    Today · {todayCell.hebrewDate}, {todayCell.hebrewYear}
                  </span>
                  <div className="flex flex-wrap items-center gap-3 font-mono tabular-nums">
                    <span className="inline-flex items-center gap-1">
                      <Sun className="size-3.5 text-primary" />
                      <span>
                        {t('cal.sunrise')}{' '}
                        {formatZmanTime(todayCell.zmanim.sunrise, sampleLocation.tzid, true)}
                      </span>
                    </span>
                    <span>·</span>
                    <span>
                      {t('cal.sunset')}{' '}
                      {formatZmanTime(todayCell.zmanim.sunset, sampleLocation.tzid, true)}
                    </span>
                    {todayCell.zmanim.candleLighting && (
                      <>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1 font-semibold text-candle">
                          <Flame className="size-3.5" />
                          <span>
                            {t('cal.candle')}{' '}
                            {formatZmanTime(
                              todayCell.zmanim.candleLighting,
                              sampleLocation.tzid,
                              true
                            )}
                          </span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold text-primary">{t('features.heading')}</p>
            <h2
              style={{ textWrap: 'balance' }}
              className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-4xl"
            >
              {t('features.title')}
            </h2>
            <p className="mt-3 text-muted-foreground">{t('features.desc')}</p>
          </div>

          <div className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
            {featureItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
                >
                  <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="font-display text-base font-semibold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold text-primary">{t('how.heading')}</p>
            <h2
              style={{ textWrap: 'balance' }}
              className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-4xl"
            >
              {t('how.title')}
            </h2>
          </div>

          <div className="mt-10 grid gap-5 sm:mt-12 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-3xl border border-border bg-card p-6 sm:mt-16 sm:p-12">
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                  {t('cta.ready')}
                </h3>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
                  {t('cta.desc')}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onOpenStudio}
                  className="inline-flex min-h-[46px] cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-95 whitespace-nowrap shrink-0"
                >
                  <Sparkles className="size-4" />
                  <span>{t('cta.generate')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-xs text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-foreground">Luach</span>
            <span aria-hidden="true">·</span>
            <span>{t('footer.tagline')}</span>
          </div>
          <p>{t('footer.copy', { year: new Date().getFullYear() })}</p>
        </div>
      </footer>

      <DayModal
        day={selectedSampleDay}
        location={sampleLocation}
        settings={sampleSettings}
        theme={BUILTIN_THEMES[0]}
        onClose={() => setSelectedSampleDay(null)}
      />
    </div>
  );
}
