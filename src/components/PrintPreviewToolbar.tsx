import React, { useState } from 'react';
import {
  Check,
  CheckSquare,
  Download,
  Eye,
  EyeOff,
  FileText,
  Layers,
  Loader2,
  Maximize2,
  Printer,
  Ruler,
  Scissors,
  ShieldCheck,
  SlidersHorizontal,
  Square,
} from 'lucide-react';
import {
  PRINT_MARGIN_PRESETS,
  PrintMarginPreset,
  parsePageRangeString,
} from '../lib/calendarEngine';

export type PageRangeMode = 'all' | 'range' | 'custom';

export interface PageDescriptor {
  index: number; // 0-based
  pageNumber: number; // 1-based
  shortLabel: string; // e.g. "Jan" or "Jan–Apr" or "Dedication"
  fullLabel: string; // e.g. "Page 1 · January 2026"
}

export interface PrintPreviewToolbarProps {
  previewMode: 'continuous' | 'pages';
  onChangePreviewMode: (mode: 'continuous' | 'pages') => void;
  printSafeMode: boolean;
  onTogglePrintSafeMode: (next: boolean) => void;
  marginPreset: PrintMarginPreset;
  onChangeMarginPreset: (preset: PrintMarginPreset) => void;
  customMarginInches: number | null;
  onChangeCustomMarginInches: (inches: number | null) => void;
  pageRangeMode: PageRangeMode;
  onChangePageRangeMode: (mode: PageRangeMode) => void;
  rangeStartPage: number;
  rangeEndPage: number;
  onChangeRangeStartEnd: (start: number, end: number) => void;
  customRangeInput: string;
  onChangeCustomRangeInput: (val: string) => void;
  selectedPageIndices: number[];
  onToggleSinglePage: (pageIndex: number) => void;
  onSelectPageIndices: (indices: number[]) => void;
  hideUnselectedPages: boolean;
  onToggleHideUnselectedPages: (hide: boolean) => void;
  pages: PageDescriptor[];
  paperSize: 'letter' | 'legal';
  onChangePaperSize: (size: 'letter' | 'legal') => void;
  orientation: 'portrait' | 'landscape';
  onChangeOrientation: (orientation: 'portrait' | 'landscape') => void;
  showCropMarks: boolean;
  onToggleCropMarks: (show: boolean) => void;
  pdfResolution: 'high' | 'standard';
  onChangePdfResolution: (res: 'high' | 'standard') => void;
  exportingPdf: boolean;
  pdfProgress: { current: number; total: number; label: string } | null;
  onExportPdf: () => void;
  onPrint: () => void;
}

export function PrintPreviewToolbar({
  previewMode,
  onChangePreviewMode,
  printSafeMode,
  onTogglePrintSafeMode,
  marginPreset,
  onChangeMarginPreset,
  customMarginInches,
  onChangeCustomMarginInches,
  pageRangeMode,
  onChangePageRangeMode,
  rangeStartPage,
  rangeEndPage,
  onChangeRangeStartEnd,
  customRangeInput,
  onChangeCustomRangeInput,
  selectedPageIndices,
  onToggleSinglePage,
  onSelectPageIndices,
  hideUnselectedPages,
  onToggleHideUnselectedPages,
  pages,
  paperSize,
  onChangePaperSize,
  orientation,
  onChangeOrientation,
  showCropMarks,
  onToggleCropMarks,
  pdfResolution,
  onChangePdfResolution,
  exportingPdf,
  pdfProgress,
  onExportPdf,
  onPrint,
}: PrintPreviewToolbarProps) {
  const [showPagePickerGrid, setShowPagePickerGrid] = useState(false);

  const totalPages = pages.length;
  const selectedCount = selectedPageIndices.length;

  const activePresetObj =
    PRINT_MARGIN_PRESETS.find((p) => p.id === marginPreset) ?? PRINT_MARGIN_PRESETS[2];
  const effectiveMarginInches =
    customMarginInches !== null ? customMarginInches : activePresetObj.inches;
  const effectiveMarginMm = Math.round(effectiveMarginInches * 25.4 * 10) / 10;

  return (
    <section
      aria-label="Print-Preview & PDF Export Toolbar"
      className="mb-5 rounded-2xl border border-primary/30 bg-card p-3.5 shadow-sm print:hidden sm:mb-6 sm:p-4"
    >
      {/* Top Row: Toolbar Title, Print-Safe Toggle, and Primary Download PDF Action */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Printer className="size-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-sm font-semibold text-foreground sm:text-base">
                Print-Preview &amp; PDF Export Toolbar
              </h2>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-primary tabular-nums">
                {selectedCount} of {totalPages} {totalPages === 1 ? 'Page' : 'Pages'} Selected
              </span>
              {previewMode !== 'pages' && (
                <button
                  type="button"
                  onClick={() => onChangePreviewMode('pages')}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-accent px-2 py-0.5 text-[11px] font-semibold text-primary hover:bg-primary/15"
                >
                  <Eye className="size-3" />
                  <span>Switch to Sheet View</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Toggle print-safe ink mode, adjust page margins ({effectiveMarginInches.toFixed(2)}&quot; /{' '}
              {effectiveMarginMm} mm), and choose exact pages before downloading your PDF.
            </p>
          </div>
        </div>

        {/* Right Actions: Print-Safe Mode Toggle + Resolution + Download PDF */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. Print-Safe Mode Toggle */}
          <button
            type="button"
            onClick={() => onTogglePrintSafeMode(!printSafeMode)}
            aria-pressed={printSafeMode}
            title="Print-Safe Mode forces a pure #FFFFFF paper background and crisp 1.5px dark borders to save printer toner and maximize legibility"
            className={`inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
              printSafeMode
                ? 'border-emerald-600/50 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500/30 shadow-2xs'
                : 'border-border bg-muted/40 text-foreground hover:border-primary/40 hover:bg-accent'
            }`}
          >
            <ShieldCheck
              className={`size-4 shrink-0 ${
                printSafeMode ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
              }`}
            />
            <span>Print-Safe Mode: {printSafeMode ? 'ON' : 'Off'}</span>
          </button>

          {/* DPI Quality Switch */}
          <div
            className="hidden items-center rounded-xl border border-border bg-muted/40 p-0.5 text-[11px] sm:inline-flex"
            title="Select PDF export resolution"
          >
            <button
              type="button"
              onClick={() => onChangePdfResolution('high')}
              className={`cursor-pointer rounded-lg px-2 py-1 font-semibold transition-colors ${
                pdfResolution === 'high'
                  ? 'bg-card text-primary shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              300 DPI
            </button>
            <button
              type="button"
              onClick={() => onChangePdfResolution('standard')}
              className={`cursor-pointer rounded-lg px-2 py-1 font-semibold transition-colors ${
                pdfResolution === 'standard'
                  ? 'bg-card text-primary shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              150 DPI
            </button>
          </div>

          {/* Browser Print Button */}
          <button
            type="button"
            onClick={onPrint}
            title="Open system print dialog"
            className="inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent whitespace-nowrap shrink-0"
          >
            <Printer className="size-3.5 text-primary" />
            <span className="hidden sm:inline">Print</span>
          </button>

          {/* Primary Download PDF Button */}
          <button
            type="button"
            disabled={exportingPdf || selectedCount === 0}
            onClick={onExportPdf}
            className="inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs transition-opacity hover:opacity-95 disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            {exportingPdf ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Download className="size-3.5" />
            )}
            <span>
              {exportingPdf && pdfProgress
                ? `Exporting (${pdfProgress.current}/${pdfProgress.total})…`
                : selectedCount === totalPages
                ? `Download PDF (All ${totalPages} Pages)`
                : `Download PDF (${selectedCount} ${selectedCount === 1 ? 'Page' : 'Pages'})`}
            </span>
          </button>
        </div>
      </div>

      {/* Live PDF Progress Bar when exporting */}
      {exportingPdf && pdfProgress && (
        <div className="mt-3 rounded-xl border border-primary/30 bg-primary/[0.06] px-3 py-2 text-xs">
          <div className="flex items-center justify-between font-medium text-primary">
            <span>{pdfProgress.label}</span>
            <span className="font-mono tabular-nums">
              Page {pdfProgress.current} of {pdfProgress.total}
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

      {/* Second Row: Margin Controls + Page Range Controls + Paper/Bleed Quick Controls */}
      <div className="mt-3 grid gap-3 lg:grid-cols-12">
        {/* Column 1: Margin Adjustment (5 cols on lg) */}
        <div className="flex flex-col justify-between gap-2 rounded-xl border border-border bg-muted/25 p-2.5 lg:col-span-5">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Ruler className="size-3.5 text-primary" />
              <span>Page Margins</span>
            </span>
            <span className="font-mono text-[11px] font-semibold text-primary tabular-nums">
              {effectiveMarginInches.toFixed(2)} in ({effectiveMarginMm} mm)
            </span>
          </div>

          {/* 4 Margin Presets */}
          <div className="grid grid-cols-4 gap-1 rounded-lg border border-border bg-background p-0.5">
            {PRINT_MARGIN_PRESETS.map((preset) => {
              const isSelected = customMarginInches === null && marginPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    onChangeCustomMarginInches(null);
                    onChangeMarginPreset(preset.id);
                  }}
                  title={`${preset.label} — ${preset.description}`}
                  className={`cursor-pointer rounded-md px-1.5 py-1 text-[11px] font-medium transition-colors truncate ${
                    isSelected
                      ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  {preset.shortLabel}
                </button>
              );
            })}
          </div>

          {/* Fine-Tune Custom Margin Slider + Crop Marks Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-[11px]">
            <label className="flex flex-1 items-center gap-2 text-muted-foreground">
              <span className="shrink-0">Fine-tune:</span>
              <input
                type="range"
                min={0.15}
                max={1.0}
                step={0.05}
                aria-label="Custom page margin in inches"
                value={effectiveMarginInches}
                onChange={(e) => onChangeCustomMarginInches(parseFloat(e.target.value))}
                className="h-1.5 flex-1 cursor-pointer accent-primary"
              />
            </label>

            <button
              type="button"
              onClick={() => onToggleCropMarks(!showCropMarks)}
              aria-pressed={showCropMarks}
              title="Toggle 0.125 inch printer trim & bleed crop marks"
              className={`inline-flex cursor-pointer items-center gap-1 rounded-md border px-2 py-0.5 text-[10.5px] font-medium transition-colors ${
                showCropMarks
                  ? 'border-primary/40 bg-primary/10 text-primary font-semibold'
                  : 'border-border bg-background text-muted-foreground hover:text-foreground'
              }`}
            >
              <Scissors className="size-3" />
              <span>0.125&quot; Bleed Marks</span>
            </button>
          </div>
        </div>

        {/* Column 2: Page Range Selector for Export (7 cols on lg) */}
        <div className="flex flex-col justify-between gap-2 rounded-xl border border-border bg-muted/25 p-2.5 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Layers className="size-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">
                Pages to Export in PDF
              </span>
            </div>

            {/* Range Mode Selector Pills */}
            <div className="inline-flex items-center rounded-lg border border-border bg-background p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => onChangePageRangeMode('all')}
                className={`cursor-pointer rounded-md px-2.5 py-0.5 font-medium transition-colors ${
                  pageRangeMode === 'all'
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All ({totalPages})
              </button>
              <button
                type="button"
                onClick={() => onChangePageRangeMode('range')}
                className={`cursor-pointer rounded-md px-2.5 py-0.5 font-medium transition-colors ${
                  pageRangeMode === 'range'
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Page Range
              </button>
              <button
                type="button"
                onClick={() => {
                  onChangePageRangeMode('custom');
                  setShowPagePickerGrid(true);
                }}
                className={`cursor-pointer rounded-md px-2.5 py-0.5 font-medium transition-colors ${
                  pageRangeMode === 'custom'
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Pick Specific Pages
              </button>
            </div>
          </div>

          {/* Mode-Specific Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {pageRangeMode === 'all' && (
              <div className="flex flex-wrap items-center justify-between gap-2 w-full text-xs text-muted-foreground">
                <span>
                  Exporting all <strong>{totalPages} pages</strong> ({pages[0]?.shortLabel ?? 'Page 1'} –{' '}
                  {pages[totalPages - 1]?.shortLabel ?? `Page ${totalPages}`}) in{' '}
                  <strong className="text-foreground uppercase">{paperSize}</strong>{' '}
                  <strong className="text-foreground capitalize">{orientation}</strong>.
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      onChangePaperSize(paperSize === 'letter' ? 'legal' : 'letter')
                    }
                    className="cursor-pointer rounded-md border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-foreground hover:bg-accent"
                  >
                    Paper: {paperSize === 'letter' ? 'Letter (8.5×11)' : 'Legal (8.5×14)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onChangePageRangeMode('custom');
                      setShowPagePickerGrid((v) => !v);
                    }}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary hover:bg-primary/15"
                  >
                    <CheckSquare className="size-3" />
                    <span>Choose Months/Pages</span>
                  </button>
                </div>
              </div>
            )}

            {pageRangeMode === 'range' && (
              <div className="flex flex-wrap items-center justify-between gap-2 w-full text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-1.5">
                    <span className="text-muted-foreground">From:</span>
                    <select
                      aria-label="Start page"
                      value={rangeStartPage}
                      onChange={(e) => {
                        const nextStart = parseInt(e.target.value, 10);
                        onChangeRangeStartEnd(nextStart, Math.max(nextStart, rangeEndPage));
                      }}
                      className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-semibold text-foreground"
                    >
                      {pages.map((p) => (
                        <option key={p.pageNumber} value={p.pageNumber}>
                          {p.fullLabel}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="inline-flex items-center gap-1.5">
                    <span className="text-muted-foreground">To:</span>
                    <select
                      aria-label="End page"
                      value={rangeEndPage}
                      onChange={(e) => {
                        const nextEnd = parseInt(e.target.value, 10);
                        onChangeRangeStartEnd(Math.min(rangeStartPage, nextEnd), nextEnd);
                      }}
                      className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-semibold text-foreground"
                    >
                      {pages.map((p) => (
                        <option key={p.pageNumber} value={p.pageNumber}>
                          {p.fullLabel}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Quick Range Presets */}
                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => onChangeRangeStartEnd(1, Math.min(totalPages, Math.ceil(totalPages / 2)))}
                    className="cursor-pointer rounded-md border border-border bg-background px-2 py-0.5 font-medium text-muted-foreground hover:text-foreground"
                  >
                    1st Half
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onChangeRangeStartEnd(Math.max(1, Math.floor(totalPages / 2) + 1), totalPages)
                    }
                    className="cursor-pointer rounded-md border border-border bg-background px-2 py-0.5 font-medium text-muted-foreground hover:text-foreground"
                  >
                    2nd Half
                  </button>
                </div>
              </div>
            )}

            {pageRangeMode === 'custom' && (
              <div className="flex flex-wrap items-center justify-between gap-2 w-full text-xs">
                <div className="flex flex-1 items-center gap-1.5 min-w-[200px]">
                  <span className="shrink-0 text-[11px] text-muted-foreground">Pages:</span>
                  <input
                    type="text"
                    value={customRangeInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      onChangeCustomRangeInput(val);
                      const parsed = parsePageRangeString(val, totalPages);
                      onSelectPageIndices(parsed);
                    }}
                    placeholder={`e.g. 1-3, 5, ${totalPages}`}
                    aria-label="Custom page range string"
                    className="h-7 flex-1 rounded-lg border border-border bg-background px-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowPagePickerGrid((v) => !v)}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-foreground hover:bg-accent"
                  >
                    <CheckSquare className="size-3 text-primary" />
                    <span>{showPagePickerGrid ? 'Hide Page Buttons' : 'Pick Pages'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const all = pages.map((p) => p.index);
                      onSelectPageIndices(all);
                      onChangeCustomRangeInput(`1-${totalPages}`);
                    }}
                    className="cursor-pointer rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectPageIndices([0]);
                      onChangeCustomRangeInput('1');
                    }}
                    className="cursor-pointer rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                  >
                    Page 1 Only
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Page Pills Grid (when in Custom mode or toggled open) */}
          {(pageRangeMode === 'custom' || showPagePickerGrid) && (
            <div className="mt-1.5 border-t border-border/70 pt-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {pages.map((p) => {
                  const isChecked = selectedPageIndices.includes(p.index);
                  return (
                    <button
                      key={p.index}
                      type="button"
                      onClick={() => onToggleSinglePage(p.index)}
                      aria-pressed={isChecked}
                      title={`${p.fullLabel} — Click to ${isChecked ? 'exclude from' : 'include in'} PDF export`}
                      className={`inline-flex cursor-pointer items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium transition-all ${
                        isChecked
                          ? 'border-primary bg-primary/12 text-primary font-semibold shadow-2xs'
                          : 'border-border bg-background/60 text-muted-foreground opacity-65 hover:opacity-100'
                      }`}
                    >
                      {isChecked ? (
                        <Check className="size-3 stroke-[2.5] text-primary" />
                      ) : (
                        <Square className="size-3 text-muted-foreground" />
                      )}
                      <span className="font-mono text-[10px]">P{p.pageNumber}:</span>
                      <span>{p.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer info row inside Page Range Box: Preview Filter Toggle */}
          {selectedCount < totalPages && (
            <div className="mt-1 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-1.5 text-[11px]">
              <span className="text-primary font-medium">
                Only the {selectedCount} selected {selectedCount === 1 ? 'page' : 'pages'} will be exported to your PDF.
              </span>
              <button
                type="button"
                onClick={() => onToggleHideUnselectedPages(!hideUnselectedPages)}
                className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-foreground hover:text-primary"
              >
                {hideUnselectedPages ? (
                  <>
                    <Eye className="size-3 text-primary" />
                    <span>Show dimmed unselected pages</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="size-3 text-primary" />
                    <span>Hide unselected pages in preview</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
