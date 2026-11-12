import React, { useEffect, useRef, useState } from 'react';
import {
  Calendar,
  ChevronDown,
  Download,
  FileCode2,
  FileJson,
  FileSpreadsheet,
  FileText,
  Loader2,
  Monitor,
  Printer,
  Scissors,
  Settings,
  Sparkles,
} from 'lucide-react';

export interface ExportMenuProps {
  orgName: string;
  locationName: string;
  year: number;
  cycle: 'secular' | 'hebrew';
  themeName: string;
  paperSize: 'letter' | 'legal';
  orientation: 'portrait' | 'landscape';
  monthsPerPage: 1 | 4;
  showCropMarks: boolean;
  yahrzeitsCount: number;
  exportingPdf: boolean;
  pdfProgress: { current: number; total: number; label: string } | null;
  pdfResolution: 'high' | 'standard';
  onChangePdfResolution: (res: 'high' | 'standard') => void;
  onExportPdf: (res?: 'high' | 'standard') => void;
  onExportCsv: () => void;
  onExportIcs: () => void;
  onPrint: () => void;
  onExportOfflineHtml: () => void;
  onExportSettings?: () => void;
  onOpenSettingsBackup?: () => void;
  align?: 'left' | 'right';
}

export function ExportMenu({
  orgName,
  locationName,
  year,
  cycle,
  themeName,
  paperSize,
  orientation,
  monthsPerPage,
  showCropMarks,
  yahrzeitsCount,
  exportingPdf,
  pdfProgress,
  pdfResolution,
  onChangePdfResolution,
  onExportPdf,
  onExportCsv,
  onExportIcs,
  onPrint,
  onExportOfflineHtml,
  onExportSettings,
  onOpenSettingsBackup,
  align = 'right',
}: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const cycleLabel = cycle === 'hebrew' ? `${year}–${year + 1} (Jewish Year)` : `${year}`;

  return (
    <div ref={menuRef} className="relative inline-block text-left">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs transition-opacity hover:opacity-95 whitespace-nowrap shrink-0"
      >
        {exportingPdf ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Download className="size-3.5" />
        )}
        <span>
          {exportingPdf && pdfProgress
            ? `Exporting (${pdfProgress.current}/${pdfProgress.total})`
            : 'Export'}
        </span>
        <ChevronDown
          className={`size-3.5 transition-transform duration-150 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Export calendar configuration"
          className={`absolute z-50 mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-card p-4 text-foreground shadow-xl ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {/* Current Configuration Summary */}
          <div className="border-b border-border pb-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-display text-sm font-semibold text-foreground">
                Export Calendar Configuration
              </span>
              <span className="font-mono text-[10px] font-semibold uppercase tabular-nums text-primary">
                {paperSize} · {orientation}
              </span>
            </div>
            <p className="mt-1 truncate text-xs font-medium text-muted-foreground">
              {orgName} · {cycleLabel}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
              <span>{locationName}</span>
              <span aria-hidden="true">·</span>
              <span>Theme: {themeName}</span>
              <span aria-hidden="true">·</span>
              <span>{monthsPerPage} mo/page</span>
              {showCropMarks && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-0.5 text-primary">
                    <Scissors className="size-2.5" />
                    <span>0.125&quot; Bleed</span>
                  </span>
                </>
              )}
              {yahrzeitsCount > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{yahrzeitsCount} Yahrzeits</span>
                </>
              )}
            </div>
          </div>

          {/* Beginner-Friendly Desktop Printing Disclaimer */}
          <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-500/35 bg-amber-500/[0.08] px-3 py-2.5 text-left">
            <Monitor className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="text-[11px] leading-relaxed text-foreground">
              <span className="font-semibold text-amber-700 dark:text-amber-300">
                Friendly Tip — Print on a Computer:
              </span>{' '}
              Mobile printing is a bit too complex for full 12-month calendars right now. For the easiest experience and best page fit, please use a <strong>desktop or laptop computer</strong> to print or save your PDF!
            </div>
          </div>

          {/* PDF Resolution Selector */}
          <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-border bg-muted/35 px-3 py-2 text-xs">
            <span className="font-medium text-foreground">PDF Print Quality</span>
            <div className="inline-flex items-center rounded-lg border border-border bg-background p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => onChangePdfResolution('high')}
                className={`cursor-pointer rounded-md px-2 py-0.5 font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  pdfResolution === 'high'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                300 DPI Hi-Res
              </button>
              <button
                type="button"
                onClick={() => onChangePdfResolution('standard')}
                className={`cursor-pointer rounded-md px-2 py-0.5 font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  pdfResolution === 'standard'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Standard
              </button>
            </div>
          </div>

          {/* Live PDF Progress Bar */}
          {exportingPdf && pdfProgress && (
            <div className="mt-3 rounded-xl border border-primary/30 bg-primary/[0.06] px-3 py-2 text-xs">
              <div className="flex items-center justify-between font-medium text-primary">
                <span>{pdfProgress.label}</span>
                <span className="font-mono tabular-nums">
                  {pdfProgress.current} / {pdfProgress.total}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-primary/15">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-200"
                  style={{
                    width: `${Math.round(
                      (pdfProgress.current / Math.max(1, pdfProgress.total)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Primary 3 Export Actions: High-Res PDF, CSV of Dates, ICS Calendar Integration */}
          <div className="mt-3 flex flex-col gap-2">
            {/* 1. High-Resolution PDF */}
            <button
              type="button"
              role="menuitem"
              disabled={exportingPdf}
              onClick={() => {
                onExportPdf(pdfResolution);
              }}
              className="group flex w-full cursor-pointer items-start gap-3 rounded-xl border border-primary/30 bg-primary/[0.05] p-3 text-left transition-colors hover:bg-primary/[0.1] disabled:opacity-50"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                {exportingPdf ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileText className="size-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-foreground">
                    High-Resolution Print PDF (.pdf)
                  </span>
                  <span className="font-mono text-[10px] font-semibold text-primary">
                    {pdfResolution === 'high' ? '300 DPI' : '150 DPI'}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                  Print-ready {paperSize.toUpperCase()} {orientation} calendar with your active{' '}
                  {themeName} palette, masthead, and zmanim.
                </p>
              </div>
            </button>

            {/* 2. CSV File of Dates */}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onExportCsv();
                setOpen(false);
              }}
              className="group flex w-full cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-3 text-left transition-colors hover:border-primary/40 hover:bg-accent/50"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-primary">
                <FileSpreadsheet className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-foreground">
                    CSV Spreadsheet of Dates (.csv)
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    EXCEL / SHEETS
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                  All 365+ secular &amp; Hebrew dates, holidays, Parsha, Yahrzeits, candle lighting, and Havdalah times.
                </p>
              </div>
            </button>

            {/* 3. ICS Calendar Integration */}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onExportIcs();
                setOpen(false);
              }}
              className="group flex w-full cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-3 text-left transition-colors hover:border-primary/40 hover:bg-accent/50"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-primary">
                <Calendar className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-foreground">
                    ICS Calendar Integration (.ics)
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    ICAL / G-CAL
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                  Import holidays, Shabbat &amp; Yom Tov candle lighting, Havdalah, and Yahrzeits into Google, Apple, or Outlook.
                </p>
              </div>
            </button>

            {/* 4. Calendar Settings Backup (.json) */}
            {onExportSettings && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onExportSettings();
                  setOpen(false);
                }}
                className="group flex w-full cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-3 text-left transition-colors hover:border-primary/40 hover:bg-accent/50"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-primary">
                  <FileJson className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-foreground">
                      Calendar Settings Backup (.json)
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      BACKUP
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                    Export full calendar configuration, custom events, yahrzeits, and theme overrides.
                  </p>
                </div>
              </button>
            )}
          </div>

          {/* Secondary Print, Offline HTML, and Settings Center Footer Row */}
          <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onPrint();
                }}
                className="inline-flex min-h-[36px] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent whitespace-nowrap shrink-0"
              >
                <Printer className="size-3.5 text-primary" />
                <span>Print Dialog</span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onExportOfflineHtml();
                  setOpen(false);
                }}
                className="inline-flex min-h-[36px] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent whitespace-nowrap shrink-0"
              >
                <FileCode2 className="size-3.5 text-primary" />
                <span>Offline HTML</span>
              </button>
            </div>

            {onOpenSettingsBackup && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onOpenSettingsBackup();
                }}
                className="inline-flex min-h-[32px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-muted/40 px-2 py-1 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <Settings className="size-3.5" />
                <span>Auto-Save &amp; Settings Backup Center</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
