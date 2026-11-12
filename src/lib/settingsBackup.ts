import {
  CalendarCycleType,
  CalendarLocation,
  CalendarSettings,
  CustomCalendarEvent,
  JewishInfoOptions,
  MinhagType,
  PersonalHebrewEvent,
  ZmanimProfileType,
  slugify,
  triggerFileDownload,
} from './calendarEngine';
import { CustomThemeDraft, PaletteOverrides } from './themes';
import { BlankCellPhotoConfig, InterMonthPageConfig } from '../components/CalendarGrid';
import { CommunitySponsor } from '../components/SponsorGridManager';

export interface LuachSettingsBackup {
  format: 'luach-calendar-backup';
  version: 3;
  exportedAt: string;
  calendar: {
    orgName: string;
    year: number;
    cycle: CalendarCycleType;
    location: CalendarLocation;
    settings: {
      hour12: boolean;
      useElevation: boolean;
      tzeitMinutes: number;
      candleMinutes: number;
      minhag: MinhagType;
      zmanimProfile: ZmanimProfileType;
      bilingual: boolean;
    };
  };
  theme: {
    themeId: string;
    paletteOverrides: PaletteOverrides;
    customThemes: CustomThemeDraft[];
  };
  displayFilters: JewishInfoOptions;
  printLayout: {
    paperSize: 'letter' | 'legal';
    orientation: 'portrait' | 'landscape';
    fitToPage: boolean;
    monthsPerPage: 1 | 4;
    showCropMarks: boolean;
    previewMode: 'continuous' | 'pages';
    startFromCurrent: boolean;
  };
  personalEvents: {
    personalHebrewEvents: PersonalHebrewEvent[];
    customEvents: CustomCalendarEvent[];
    dayEventOrder: Record<string, string[]>;
    specialEvents: Record<string, string[]>;
  };
  sponsors: {
    enabled: boolean;
    list: CommunitySponsor[];
  };
  photos?: {
    photoCalendar: boolean;
    customPhoto: string;
    monthPhotos?: Record<string, string>;
    blankCellPhotos?: Record<string, Record<string, BlankCellPhotoConfig>>;
    weekPhotos?: Record<string, string>;
    dayPhotos?: Record<string, string>;
    interMonthPages?: Record<string, InterMonthPageConfig>;
  };
}

export function buildSettingsBackup(state: {
  orgName: string;
  year: number;
  cycle: CalendarCycleType;
  location: CalendarLocation;
  hour12: boolean;
  useElevation: boolean;
  tzeitMinutes: number;
  candleMinutes: number;
  minhag: MinhagType;
  zmanimProfile: ZmanimProfileType;
  bilingual: boolean;
  themeId: string;
  paletteOverrides: PaletteOverrides;
  customThemes: CustomThemeDraft[];
  jewishOptions: JewishInfoOptions;
  paperSize: 'letter' | 'legal';
  orientation: 'portrait' | 'landscape';
  fitToPage: boolean;
  monthsPerPage: 1 | 4;
  showCropMarks: boolean;
  previewMode: 'continuous' | 'pages';
  startFromCurrent: boolean;
  personalHebrewEvents: PersonalHebrewEvent[];
  customEvents: CustomCalendarEvent[];
  dayEventOrder: Record<string, string[]>;
  specialEvents: Record<string, string[]>;
  sponsors: CommunitySponsor[];
  sponsorsEnabled: boolean;
  photoCalendar?: boolean;
  customPhoto?: string;
  monthPhotos?: Record<string, string>;
  blankCellPhotos?: Record<string, Record<string, BlankCellPhotoConfig>>;
  weekPhotos?: Record<string, string>;
  dayPhotos?: Record<string, string>;
  interMonthPages?: Record<string, InterMonthPageConfig>;
}): LuachSettingsBackup {
  return {
    format: 'luach-calendar-backup',
    version: 3,
    exportedAt: new Date().toISOString(),
    calendar: {
      orgName: state.orgName,
      year: state.year,
      cycle: state.cycle,
      location: state.location,
      settings: {
        hour12: state.hour12,
        useElevation: state.useElevation,
        tzeitMinutes: state.tzeitMinutes,
        candleMinutes: state.candleMinutes,
        minhag: state.minhag,
        zmanimProfile: state.zmanimProfile,
        bilingual: state.bilingual,
      },
    },
    theme: {
      themeId: state.themeId,
      paletteOverrides: state.paletteOverrides,
      customThemes: state.customThemes,
    },
    displayFilters: state.jewishOptions,
    printLayout: {
      paperSize: state.paperSize,
      orientation: state.orientation,
      fitToPage: state.fitToPage,
      monthsPerPage: state.monthsPerPage,
      showCropMarks: state.showCropMarks,
      previewMode: state.previewMode,
      startFromCurrent: state.startFromCurrent,
    },
    personalEvents: {
      personalHebrewEvents: state.personalHebrewEvents,
      customEvents: state.customEvents,
      dayEventOrder: state.dayEventOrder,
      specialEvents: state.specialEvents,
    },
    sponsors: {
      enabled: state.sponsorsEnabled,
      list: state.sponsors,
    },
    photos: {
      photoCalendar: state.photoCalendar ?? true,
      customPhoto: state.customPhoto ?? '',
      monthPhotos: state.monthPhotos,
      blankCellPhotos: state.blankCellPhotos,
      weekPhotos: state.weekPhotos,
      dayPhotos: state.dayPhotos,
      interMonthPages: state.interMonthPages,
    },
  };
}

export function downloadSettingsBackupFile(
  backup: LuachSettingsBackup,
  customName?: string
): string {
  const dateStr = new Date().toISOString().slice(0, 10);
  const orgSlug = slugify(backup.calendar.orgName || 'jewish-calendar');
  const filename =
    customName ||
    `luach-settings-${orgSlug}-${backup.calendar.year}-${dateStr}.json`;

  const jsonString = JSON.stringify(backup, null, 2);
  triggerFileDownload(filename, jsonString, 'application/json');
  return filename;
}

export function validateAndParseSettingsBackup(
  rawText: string
): { success: boolean; data?: LuachSettingsBackup; error?: string } {
  try {
    const parsed = JSON.parse(rawText);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'File is not a valid JSON object.' };
    }

    // Support both format: 'luach-calendar-backup' and legacy localStorage payloads
    if (parsed.format === 'luach-calendar-backup' && parsed.calendar) {
      return { success: true, data: parsed as LuachSettingsBackup };
    }

    // Adapt flat legacy localStorage structure if imported
    if (parsed.year && (parsed.location || parsed.themeId || parsed.jewishOptions)) {
      const adapted: LuachSettingsBackup = {
        format: 'luach-calendar-backup',
        version: 3,
        exportedAt: new Date().toISOString(),
        calendar: {
          orgName: parsed.orgName ?? 'Jewish Calendar',
          year: parsed.year,
          cycle: parsed.cycle ?? 'secular',
          location: parsed.location ?? {
            id: 'custom',
            name: 'Custom Location',
            city: 'Custom',
            countryCode: 'US',
            latitude: 40.669,
            longitude: -73.945,
            elevation: 25,
            tzid: 'America/New_York',
          },
          settings: {
            hour12: parsed.hour12 ?? true,
            useElevation: parsed.useElevation ?? true,
            tzeitMinutes: parsed.tzeitMinutes ?? 42,
            candleMinutes: parsed.candleMinutes ?? 18,
            minhag: parsed.minhag ?? 'chabad',
            zmanimProfile: parsed.zmanimProfile ?? 'chabad',
            bilingual: parsed.bilingual ?? true,
          },
        },
        theme: {
          themeId: parsed.themeId ?? 'sapphire',
          paletteOverrides: parsed.paletteOverrides ?? {},
          customThemes: parsed.customThemes ?? [],
        },
        displayFilters: parsed.jewishOptions ?? {},
        printLayout: {
          paperSize: parsed.paperSize ?? 'letter',
          orientation: parsed.orientation ?? 'portrait',
          fitToPage: parsed.fitToPage ?? true,
          monthsPerPage: parsed.monthsPerPage ?? 1,
          showCropMarks: parsed.showCropMarks ?? false,
          previewMode: parsed.previewMode ?? 'continuous',
          startFromCurrent: parsed.startFromCurrent ?? false,
        },
        personalEvents: {
          personalHebrewEvents: parsed.personalHebrewEvents ?? [],
          customEvents: parsed.customEvents ?? [],
          dayEventOrder: parsed.dayEventOrder ?? {},
          specialEvents: parsed.specialEvents ?? {},
        },
        sponsors: {
          enabled: parsed.sponsorsEnabled ?? true,
          list: parsed.sponsors ?? [],
        },
        photos: {
          photoCalendar: parsed.photoCalendar ?? true,
          customPhoto: parsed.customPhoto ?? '',
          monthPhotos: parsed.monthPhotos ?? {},
          blankCellPhotos: parsed.blankCellPhotos ?? {},
          weekPhotos: parsed.weekPhotos ?? {},
          dayPhotos: parsed.dayPhotos ?? {},
          interMonthPages: parsed.interMonthPages ?? {},
        },
      };
      return { success: true, data: adapted };
    }

    return {
      success: false,
      error: 'Unrecognized calendar settings format. Please select a valid Luach settings backup JSON file.',
    };
  } catch (err) {
    return {
      success: false,
      error: `JSON parse error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
