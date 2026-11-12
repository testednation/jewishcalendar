import React, { useRef, useState } from 'react';
import {
  Download,
  Upload,
  Settings,
  Check,
  Copy,
  RotateCcw,
  X,
  FileJson,
  AlertTriangle,
  HardDrive,
  Calendar,
  Sparkles,
  MapPin,
  Flame,
  ShieldCheck,
} from 'lucide-react';
import {
  LuachSettingsBackup,
  downloadSettingsBackupFile,
  validateAndParseSettingsBackup,
} from '../lib/settingsBackup';

export interface SettingsBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBackup: LuachSettingsBackup;
  onRestoreBackup: (backup: LuachSettingsBackup) => void;
  onResetToDefaults?: () => void;
  autoSaveEnabled: boolean;
  onToggleAutoSave: (enabled: boolean) => void;
  lastSavedAt?: Date | null;
  onNotify: (msg: string) => void;
}

export function SettingsBackupModal({
  isOpen,
  onClose,
  currentBackup,
  onRestoreBackup,
  onResetToDefaults,
  autoSaveEnabled,
  onToggleAutoSave,
  lastSavedAt,
  onNotify,
}: SettingsBackupModalProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'autosave'>('export');
  const [copied, setCopied] = useState(false);
  const [importPreview, setImportPreview] = useState<LuachSettingsBackup | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const filename = downloadSettingsBackupFile(currentBackup);
    onNotify(`Exported settings backup file: ${filename}`);
  };

  const handleCopyJson = async () => {
    try {
      const json = JSON.stringify(currentBackup, null, 2);
      await navigator.clipboard.writeText(json);
      setCopied(true);
      onNotify('Copied calendar settings JSON to clipboard');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      onNotify('Failed to copy settings to clipboard');
    }
  };

  const handleFileSelected = (file?: File) => {
    if (!file) return;
    setImportError(null);
    setImportPreview(null);

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const res = validateAndParseSettingsBackup(text);
      if (res.success && res.data) {
        setImportPreview(res.data);
      } else {
        setImportError(res.error || 'Failed to parse JSON file.');
      }
    };
    reader.onerror = () => {
      setImportError('Failed to read file.');
    };
    reader.readAsText(file);
  };

  const handleConfirmRestore = () => {
    if (!importPreview) return;
    onRestoreBackup(importPreview);
    onNotify(`Successfully restored calendar settings from backup!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="backup-modal-title"
        className="relative flex w-full max-w-xl flex-col rounded-2xl border border-border bg-card p-5 shadow-2xl text-foreground"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3.5">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileJson className="size-4" />
            </div>
            <div>
              <h2 id="backup-modal-title" className="font-display text-base font-semibold">
                Calendar Settings &amp; Backup
              </h2>
              <p className="text-xs text-muted-foreground">
                Auto-save options, export portable JSON backups, or restore past configurations.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="mt-3.5 flex rounded-xl border border-border bg-muted/40 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`flex-1 cursor-pointer rounded-lg py-1.5 font-semibold transition-all ${
              activeTab === 'export'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Export Settings (.json)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`flex-1 cursor-pointer rounded-lg py-1.5 font-semibold transition-all ${
              activeTab === 'import'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Import &amp; Restore
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('autosave')}
            className={`flex-1 cursor-pointer rounded-lg py-1.5 font-semibold transition-all ${
              activeTab === 'autosave'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Auto-Save Options
          </button>
        </div>

        {/* TAB 1: EXPORT SETTINGS */}
        {activeTab === 'export' && (
          <div className="mt-4 flex flex-col gap-3.5">
            <div className="rounded-xl border border-border bg-muted/20 p-3.5 text-xs">
              <span className="font-semibold text-foreground">What’s included in this export:</span>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-3 text-primary" />
                  <span>{currentBackup.calendar.location.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-3 text-primary" />
                  <span>Year {currentBackup.calendar.year} ({currentBackup.calendar.cycle})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="size-3 text-primary" />
                  <span>Theme: {currentBackup.theme.themeId}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Flame className="size-3 text-candle" />
                  <span>{currentBackup.personalEvents.personalHebrewEvents.length} Yahrzeits</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>📌 {currentBackup.personalEvents.customEvents.length} Custom Events</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>🏷️ {currentBackup.sponsors.list.length} Sponsor Ads</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex min-h-[42px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-95"
              >
                <Download className="size-4" />
                <span>Download Settings JSON File</span>
              </button>

              <button
                type="button"
                onClick={handleCopyJson}
                className="inline-flex min-h-[38px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-background text-xs font-medium text-foreground hover:bg-accent"
              >
                {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Settings to Clipboard'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: IMPORT SETTINGS */}
        {activeTab === 'import' && (
          <div className="mt-4 flex flex-col gap-3.5">
            <p className="text-xs text-muted-foreground">
              Select a previously exported <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">.json</code> settings file to restore your calendar layout, custom events, yahrzeits, and theme overrides.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => handleFileSelected(e.target.files?.[0])}
            />

            {!importPreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileSelected(e.dataTransfer.files?.[0]);
                }}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/15 p-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/30"
              >
                <Upload className="size-6 text-primary mb-2 opacity-80" />
                <span className="font-semibold text-xs text-foreground">
                  Click or drag &amp; drop a settings JSON file
                </span>
                <span className="mt-1 text-[11px] text-muted-foreground">
                  Supported format: luach-settings-*.json
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/[0.04] p-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-primary inline-flex items-center gap-1.5">
                    <ShieldCheck className="size-4" />
                    <span>Valid Backup Verified</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setImportPreview(null)}
                    className="cursor-pointer text-[11px] text-muted-foreground hover:underline"
                  >
                    Choose another file
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><strong>Organization:</strong> {importPreview.calendar.orgName}</div>
                  <div><strong>Location:</strong> {importPreview.calendar.location.city}</div>
                  <div><strong>Year / Cycle:</strong> {importPreview.calendar.year} ({importPreview.calendar.cycle})</div>
                  <div><strong>Theme:</strong> {importPreview.theme.themeId}</div>
                  <div><strong>Yahrzeits:</strong> {importPreview.personalEvents.personalHebrewEvents.length} dates</div>
                  <div><strong>Custom Events:</strong> {importPreview.personalEvents.customEvents.length} events</div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmRestore}
                  className="mt-1 inline-flex min-h-[38px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-95"
                >
                  <Check className="size-3.5" />
                  <span>Confirm &amp; Restore These Settings</span>
                </button>
              </div>
            )}

            {importError && (
              <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <span>{importError}</span>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AUTO-SAVE OPTIONS */}
        {activeTab === 'autosave' && (
          <div className="mt-4 flex flex-col gap-3.5">
            <div className="flex items-center justify-between rounded-xl border border-border bg-background p-3.5">
              <div className="flex items-start gap-2.5">
                <HardDrive className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-xs text-foreground">
                    Auto-Save to Local Storage
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Automatically saves all calendar custom edits, events, and filters in your browser as you type.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoSaveEnabled}
                onChange={(e) => {
                  onToggleAutoSave(e.target.checked);
                  onNotify(e.target.checked ? 'Auto-save enabled' : 'Auto-save paused');
                }}
                className="size-4.5 accent-primary cursor-pointer"
              />
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Auto-save Status:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{autoSaveEnabled ? 'Active & Synced' : 'Paused'}</span>
                </span>
              </div>
              {lastSavedAt && (
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Last saved:</span>
                  <span className="font-mono tabular-nums">
                    {lastSavedAt.toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>

            {onResetToDefaults && (
              <div className="mt-2 border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block font-semibold text-xs text-foreground">Reset to Factory Defaults</span>
                    <span className="text-[11px] text-muted-foreground">Restores default location, theme, and options.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to reset all calendar settings to default?')) {
                        onResetToDefaults();
                        onNotify('Reset all settings to default');
                        onClose();
                      }
                    }}
                    className="cursor-pointer rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-500/10"
                  >
                    Reset Defaults
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
