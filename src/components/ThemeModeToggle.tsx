import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, ChevronDown, Check } from 'lucide-react';
import { useThemeMode, ThemeMode } from '../context/ThemeModeContext';

export interface ThemeModeToggleProps {
  className?: string;
  showDropdown?: boolean;
}

export function ThemeModeToggle({
  className = '',
  showDropdown = false,
}: ThemeModeToggleProps) {
  const { mode, isDark, setMode, toggleTheme } = useThemeMode();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // If simple switch format is preferred
  return (
    <div ref={dropdownRef} className={`relative inline-flex items-center ${className}`}>
      {/* Interactive Toggle Switch Button */}
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Dark mode active · Click to switch to light mode' : 'Light mode active · Click to switch to dark mode'}
        onClick={toggleTheme}
        className="group relative inline-flex h-8 w-14 cursor-pointer items-center rounded-full border border-border bg-muted/60 p-1 shadow-inner transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring whitespace-nowrap shrink-0"
      >
        <span className="sr-only">Toggle dark/light theme</span>

        {/* Sliding Indicator Knob */}
        <span
          className={`pointer-events-none flex size-6 items-center justify-center rounded-full bg-card shadow-md ring-1 ring-black/5 transition-transform duration-200 ease-out ${
            isDark ? 'translate-x-6 bg-slate-900 text-amber-300' : 'translate-x-0 bg-white text-amber-500'
          }`}
        >
          {isDark ? (
            <Moon className="size-3.5 fill-amber-300/20 text-amber-300 transition-transform group-hover:-rotate-12" />
          ) : (
            <Sun className="size-3.5 fill-amber-500/20 text-amber-500 transition-transform group-hover:rotate-45" />
          )}
        </span>

        {/* Background Icons */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-between px-1.5 text-muted-foreground/60"
        >
          <Sun className="size-3 text-amber-500/60" />
          <Moon className="size-3 text-indigo-400/60" />
        </span>
      </button>

      {/* Optional dropdown trigger arrow to choose System preference */}
      {showDropdown && (
        <>
          <button
            type="button"
            aria-label="Theme mode options"
            aria-expanded={dropdownOpen}
            onClick={() => setDropdownOpen((v) => !v)}
            className="ml-1 cursor-pointer rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <ChevronDown className="size-3" />
          </button>

          {dropdownOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-50 mt-1.5 w-36 rounded-xl border border-border bg-card p-1 text-xs shadow-xl animate-in fade-in"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMode('light');
                  setDropdownOpen(false);
                }}
                className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 transition-colors ${
                  mode === 'light'
                    ? 'bg-primary/10 font-semibold text-primary'
                    : 'text-foreground hover:bg-accent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sun className="size-3.5 text-amber-500" />
                  <span>Light</span>
                </div>
                {mode === 'light' && <Check className="size-3 text-primary" />}
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMode('dark');
                  setDropdownOpen(false);
                }}
                className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 transition-colors ${
                  mode === 'dark'
                    ? 'bg-primary/10 font-semibold text-primary'
                    : 'text-foreground hover:bg-accent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Moon className="size-3.5 text-indigo-400" />
                  <span>Dark</span>
                </div>
                {mode === 'dark' && <Check className="size-3 text-primary" />}
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMode('system');
                  setDropdownOpen(false);
                }}
                className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 transition-colors ${
                  mode === 'system'
                    ? 'bg-primary/10 font-semibold text-primary'
                    : 'text-foreground hover:bg-accent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Laptop className="size-3.5 text-muted-foreground" />
                  <span>System</span>
                </div>
                {mode === 'system' && <Check className="size-3 text-primary" />}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
