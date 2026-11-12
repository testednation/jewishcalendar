import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Palette, ChevronLeft, ChevronRight, ChevronDown, Check, Shuffle, Search } from 'lucide-react';
import { CalendarTheme, ThemeCategory } from '../lib/themes';

export interface CalendarThemeToggleProps {
  themes: CalendarTheme[];
  currentThemeId: string;
  onSelectTheme: (id: string) => void;
  onHoverTheme?: (id: string | null) => void;
  activeTheme?: CalendarTheme;
  className?: string;
  variant?: 'toolbar' | 'header' | 'compact';
}

export function CalendarThemeToggle({
  themes,
  currentThemeId,
  onSelectTheme,
  onHoverTheme,
  activeTheme,
  className = '',
  variant = 'toolbar',
}: CalendarThemeToggleProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const containerRef = useRef<HTMLDivElement>(null);

  const resolvedActiveTheme = useMemo(() => {
    if (activeTheme && activeTheme.id === currentThemeId) return activeTheme;
    return themes.find((t) => t.id === currentThemeId) || themes[0];
  }, [themes, currentThemeId, activeTheme]);

  const currentIndex = useMemo(() => {
    const idx = themes.findIndex((t) => t.id === currentThemeId);
    return idx >= 0 ? idx : 0;
  }, [themes, currentThemeId]);

  // Cycle to next theme
  const handleNextTheme = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (themes.length === 0) return;
    const nextIdx = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIdx];
    onSelectTheme(nextTheme.id);
  };

  // Cycle to previous theme
  const handlePrevTheme = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (themes.length === 0) return;
    const prevIdx = (currentIndex - 1 + themes.length) % themes.length;
    const prevTheme = themes[prevIdx];
    onSelectTheme(prevTheme.id);
  };

  // Pick a random theme
  const handleRandomTheme = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (themes.length <= 1) return;
    let randomIdx = Math.floor(Math.random() * themes.length);
    if (randomIdx === currentIndex) {
      randomIdx = (randomIdx + 1) % themes.length;
    }
    onSelectTheme(themes[randomIdx].id);
  };

  // Close popover when clicking outside
  useEffect(() => {
    if (!popoverOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setPopoverOpen(false);
        onHoverTheme?.(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [popoverOpen, onHoverTheme]);

  const categories = useMemo(() => {
    const cats: { id: string; label: string }[] = [{ id: 'all', label: 'All Themes' }];
    const unique = Array.from(new Set(themes.map((t) => t.category).filter(Boolean))) as ThemeCategory[];
    unique.forEach((cat) => {
      const label =
        cat === 'traditional'
          ? 'Traditional'
          : cat === 'minimalist'
            ? 'Minimalist'
            : cat === 'seasonal'
              ? 'Seasonal'
              : cat === 'high-contrast'
                ? 'High Contrast'
                : cat === 'dark'
                  ? 'Dark & Jewel'
                  : 'Custom';
      cats.push({ id: cat, label });
    });
    return cats;
  }, [themes]);

  const filteredThemes = useMemo(() => {
    if (selectedCategory === 'all') return themes;
    return themes.filter((t) => t.category === selectedCategory);
  }, [themes, selectedCategory]);

  if (variant === 'compact') {
    return (
      <div ref={containerRef} className={`relative inline-flex items-center ${className}`}>
        <button
          type="button"
          onClick={handleNextTheme}
          title={`Calendar Theme: ${resolvedActiveTheme?.name || 'Default'}. Click to toggle next theme.`}
          className="group inline-flex min-h-[34px] cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-1 text-xs font-medium text-foreground transition-all hover:border-primary/40 hover:bg-accent whitespace-nowrap shrink-0"
        >
          <span className="flex items-center gap-0.5">
            <span
              className="size-3 rounded-full border border-black/20 shadow-2xs transition-transform group-hover:scale-110"
              style={{ background: resolvedActiveTheme?.tokens.primary || '#1e3a8a' }}
            />
            <span
              className="size-2 rounded-full border border-black/20 shadow-2xs"
              style={{ background: resolvedActiveTheme?.tokens.chabad || '#d97706' }}
            />
          </span>
          <span className="font-semibold">{resolvedActiveTheme?.name || 'Theme'}</span>
        </button>

        <button
          type="button"
          onClick={() => setPopoverOpen((v) => !v)}
          title="Browse all calendar themes"
          className="ml-0.5 inline-flex min-h-[34px] cursor-pointer items-center justify-center rounded-lg border border-border bg-card px-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ChevronDown className="size-3" />
        </button>

        {/* Dropdown Popover */}
        {popoverOpen && (
          <ThemePopoverContent
            themes={filteredThemes}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            currentThemeId={currentThemeId}
            onSelectTheme={(id) => {
              onSelectTheme(id);
              setPopoverOpen(false);
            }}
            onHoverTheme={onHoverTheme}
            onRandomTheme={handleRandomTheme}
            totalThemesCount={themes.length}
          />
        )}
      </div>
    );
  }

  // Header variant
  if (variant === 'header') {
    return (
      <div ref={containerRef} className={`relative hidden sm:inline-flex items-center gap-1 ${className}`}>
        <div className="inline-flex items-center rounded-lg border border-border bg-muted/40 p-0.5">
          <button
            type="button"
            onClick={handlePrevTheme}
            title="Previous calendar theme"
            className="cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            <ChevronLeft className="size-3.5" />
          </button>

          <button
            type="button"
            onClick={handleNextTheme}
            title={`Active: ${resolvedActiveTheme?.name}. 1-click to toggle next calendar theme.`}
            className="group flex min-h-[30px] cursor-pointer items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium text-foreground transition-colors hover:bg-card whitespace-nowrap"
          >
            <Palette className="size-3 text-primary transition-transform group-hover:rotate-12" />
            <span className="flex items-center gap-0.5">
              <span
                className="size-2.5 rounded-full border border-black/20"
                style={{ background: resolvedActiveTheme?.tokens.primary || '#1e3a8a' }}
              />
              <span
                className="size-2 rounded-full border border-black/20"
                style={{ background: resolvedActiveTheme?.tokens.chabad || '#d97706' }}
              />
            </span>
            <span className="max-w-[110px] truncate font-semibold">
              {resolvedActiveTheme?.name || 'Theme'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleNextTheme}
            title="Next calendar theme"
            className="cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            <ChevronRight className="size-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setPopoverOpen((v) => !v)}
            title="Open calendar themes palette"
            className="cursor-pointer rounded-md border-l border-border/60 p-1.5 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            <ChevronDown className="size-3" />
          </button>
        </div>

        {popoverOpen && (
          <ThemePopoverContent
            themes={filteredThemes}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            currentThemeId={currentThemeId}
            onSelectTheme={(id) => {
              onSelectTheme(id);
              setPopoverOpen(false);
            }}
            onHoverTheme={onHoverTheme}
            onRandomTheme={handleRandomTheme}
            totalThemesCount={themes.length}
          />
        )}
      </div>
    );
  }

  // Full 'toolbar' variant for preview bar
  return (
    <div ref={containerRef} className={`relative inline-flex items-center ${className}`}>
      <div className="inline-flex items-center rounded-lg border border-border bg-card p-0.5 shadow-2xs">
        {/* Previous theme stepper button */}
        <button
          type="button"
          onClick={handlePrevTheme}
          title="Previous calendar theme"
          aria-label="Previous calendar theme"
          className="inline-flex min-h-[34px] cursor-pointer items-center justify-center rounded-md px-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" />
        </button>

        {/* 1-Click Main Toggle Button (cycles next theme on click) */}
        <button
          type="button"
          onClick={handleNextTheme}
          title={`Calendar Theme: ${resolvedActiveTheme?.name} (${resolvedActiveTheme?.category}). 1-click to cycle to next theme.`}
          className="group inline-flex min-h-[34px] cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-foreground transition-all hover:bg-accent whitespace-nowrap shrink-0"
        >
          <Palette className="size-3.5 text-primary transition-transform group-hover:rotate-12" />
          {/* Swatch dots */}
          <span className="flex items-center gap-0.5">
            <span
              className="size-3 rounded-full border border-black/20 shadow-2xs transition-transform group-hover:scale-110"
              style={{ background: resolvedActiveTheme?.tokens.primary || '#1e3a8a' }}
            />
            <span
              className="size-2 rounded-full border border-black/20 shadow-2xs"
              style={{ background: resolvedActiveTheme?.tokens.chabad || '#d97706' }}
            />
          </span>

          <span className="font-semibold text-foreground">
            {resolvedActiveTheme?.name || 'Theme'}
          </span>

          {resolvedActiveTheme?.badgeLabel && (
            <span className="hidden rounded-full bg-primary/10 px-1.5 py-0.2 text-[10px] font-medium text-primary sm:inline-block">
              {resolvedActiveTheme.badgeLabel}
            </span>
          )}

          <span className="text-[10px] text-muted-foreground">
            ({currentIndex + 1}/{themes.length})
          </span>
        </button>

        {/* Next theme stepper button */}
        <button
          type="button"
          onClick={handleNextTheme}
          title="Next calendar theme"
          aria-label="Next calendar theme"
          className="inline-flex min-h-[34px] cursor-pointer items-center justify-center rounded-md px-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ChevronRight className="size-3.5" />
        </button>

        {/* Direct Menu / Popover Picker Button */}
        <button
          type="button"
          onClick={() => setPopoverOpen((v) => !v)}
          title="Browse all calendar themes in a grid"
          aria-label="Browse calendar themes"
          aria-expanded={popoverOpen}
          className={`inline-flex min-h-[34px] cursor-pointer items-center justify-center rounded-md border-l border-border px-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground ${
            popoverOpen ? 'bg-accent text-foreground' : ''
          }`}
        >
          <ChevronDown className="size-3.5" />
        </button>
      </div>

      {/* Popover Grid of Themes */}
      {popoverOpen && (
        <ThemePopoverContent
          themes={filteredThemes}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          currentThemeId={currentThemeId}
          onSelectTheme={(id) => {
            onSelectTheme(id);
            setPopoverOpen(false);
          }}
          onHoverTheme={onHoverTheme}
          onRandomTheme={handleRandomTheme}
          totalThemesCount={themes.length}
        />
      )}
    </div>
  );
}

interface ThemePopoverContentProps {
  themes: CalendarTheme[];
  categories: { id: string; label: string }[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  currentThemeId: string;
  onSelectTheme: (id: string) => void;
  onHoverTheme?: (id: string | null) => void;
  onRandomTheme: (e: React.MouseEvent) => void;
  totalThemesCount: number;
}

function ThemePopoverContent({
  themes,
  categories,
  selectedCategory,
  onSelectCategory,
  currentThemeId,
  onSelectTheme,
  onHoverTheme,
  onRandomTheme,
  totalThemesCount,
}: ThemePopoverContentProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const visibleThemes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return themes;
    return themes.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        t.category.toLowerCase().includes(q)
    );
  }, [themes, searchQuery]);

  return (
    <div
      role="dialog"
      aria-label="Calendar Themes"
      className="absolute right-0 top-full z-50 mt-1.5 w-[340px] sm:w-[440px] rounded-2xl border border-border bg-card p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      onMouseLeave={() => onHoverTheme?.(null)}
    >
      {/* Popover Header */}
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <div className="flex items-center gap-1.5">
          <Palette className="size-4 text-primary" />
          <h4 className="text-xs font-bold text-foreground">Calendar Color Themes</h4>
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
            {totalThemesCount} themes
          </span>
        </div>

        <button
          type="button"
          onClick={onRandomTheme}
          title="Pick a random theme"
          className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/10"
        >
          <Shuffle className="size-3" />
          <span>Random</span>
        </button>
      </div>

      {/* Quick Search Input */}
      <div className="relative mt-2">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search 68+ themes (e.g. Jerusalem, Gold, Bauhaus, Pesach)…"
          className="h-8 w-full rounded-lg border border-border bg-background pl-8 pr-2.5 text-[11px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      </div>

      {/* Category Tabs */}
      <div className="mt-2 flex gap-1 overflow-x-auto pb-1.5">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={`cursor-pointer rounded-lg px-2 py-1 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-primary text-primary-foreground shadow-2xs font-semibold'
                : 'bg-muted/50 text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Themes Grid */}
      <div className="mt-2 grid max-h-[320px] grid-cols-1 sm:grid-cols-2 gap-1.5 overflow-y-auto pr-1">
        {visibleThemes.map((th) => {
          const isActive = th.id === currentThemeId;
          return (
            <button
              key={th.id}
              type="button"
              onMouseEnter={() => onHoverTheme?.(th.id)}
              onClick={() => onSelectTheme(th.id)}
              className={`group flex cursor-pointer items-center justify-between rounded-xl border p-2 text-left transition-all ${
                isActive
                  ? 'border-primary bg-primary/[0.08] ring-1 ring-primary/40 shadow-xs'
                  : 'border-border/70 bg-card hover:border-primary/40 hover:bg-accent/60'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {/* Visual Swatch Pill */}
                <div className="flex items-center gap-0.5 shrink-0 rounded-full border border-border bg-background p-1 shadow-2xs">
                  <span
                    className="size-3.5 rounded-full border border-black/15 shadow-2xs"
                    style={{ background: th.tokens.primary }}
                  />
                  <span
                    className="size-2.5 rounded-full border border-black/15 shadow-2xs"
                    style={{ background: th.tokens.chabad }}
                  />
                  <span
                    className="size-2 rounded-full border border-black/15 shadow-2xs"
                    style={{ background: th.tokens.candle }}
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-xs font-semibold text-foreground">
                      {th.name}
                    </span>
                  </div>
                  <span className="block truncate text-[10px] text-muted-foreground">
                    {th.badgeLabel || th.category}
                  </span>
                </div>
              </div>

              {isActive ? (
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3 stroke-[2.5]" />
                </div>
              ) : (
                <span className="text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  Select
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-2.5 flex items-center justify-between border-t border-border pt-2 text-[10px] text-muted-foreground">
        <span>Tip: Click the toggle button anytime to step to the next theme</span>
        <span className="font-medium text-foreground">1-Click Live Preview</span>
      </div>
    </div>
  );
}
