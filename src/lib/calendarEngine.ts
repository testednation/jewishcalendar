import {
  HDate,
  Location,
  Zmanim,
  HebrewCalendar,
  Molad,
  flags,
  getHolidaysOnDate,
} from '@hebcal/core';

export interface CalendarLocation {
  id: string;
  name: string;
  city: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  elevation: number;
  tzid: string;
}

export type MinhagType = 'chabad' | 'ashkenazi' | 'sefardi';
export type ZmanimProfileType = 'chabad' | 'gra' | 'ovadia-yosef';
export type CalendarCycleType = 'secular' | 'hebrew';

export interface JewishInfoOptions {
  parsha: boolean;
  pirkeiAvot: boolean;
  omer: boolean;
  birkatHaChodesh: boolean;
  kiddushLevana: boolean;
  chitas: boolean;
  hayomYom: boolean;
  dafYomi: boolean;
  rambam: boolean;
  fastDetails: boolean;
  dualZmanim?: boolean;
}

export interface CalendarSettings {
  year: number;
  cycle: CalendarCycleType;
  minhag: MinhagType;
  zmanimProfile: ZmanimProfileType;
  hour12: boolean;
  useElevation: boolean;
  tzeitMinutes: number;
  candleMinutes: number;
  bilingual: boolean;
}

export interface PersonalHebrewEvent {
  id: string;
  title: string;
  category: 'yahrzeit' | 'birthday' | 'anniversary' | 'community';
  hebrewDay: number;
  hebrewMonth: number; // 1 = Nissan ... 7 = Tishrei ... 12 = Adar
  hebrewMonthName: string;
  notes?: string;
}

export interface DayZmanim {
  alot: Date | null;
  misheyakir: Date | null;
  sunrise: Date | null;
  sofZmanShmaMGA: Date | null;
  sofZmanShma: Date | null;
  sofZmanTfilla: Date | null;
  chatzot: Date | null;
  minchaGedola: Date | null;
  minchaKetana: Date | null;
  plagHaMincha: Date | null;
  sunset: Date | null;
  tzeit: Date | null;
  rabbeinuTam: Date | null;
  candleLighting: Date | null;
  havdalah: Date | null;
}

export interface DayHolidayItem {
  name: string;
  isYomTov: boolean;
  isFastDay: boolean;
  isChabad?: boolean;
}

export interface DayJewishInfo {
  parsha?: string;
  pirkeiAvot?: string;
  omer?: string;
  birkatHaChodesh?: string;
  kiddushLevana?: string;
  chitas?: string;
  hayomYom?: string;
  dafYomi?: string;
  rambam?: string;
  fastDetails?: string;
}

export interface CalendarDay {
  date: Date;
  gregDay: number;
  gregMonth: number;
  gregYear: number;
  weekday: number;
  hebrewDay: number;
  hebrewMonthNum: number;
  hebrewMonth: string;
  hebrewYear: number;
  hebrewDate: string;
  hebrewGematriya: string;
  holidays: DayHolidayItem[];
  jewishInfo: DayJewishInfo;
  zmanim: DayZmanim;
  isFriday: boolean;
  isSaturday: boolean;
  isToday: boolean;
}

export interface MoladInfo {
  hebrewMonth: string;
  hebrewYear: number;
  date: Date;
  hour: number;
  minutes: number;
  chalakim: number;
}

export interface CalendarMonth {
  gregMonth: number;
  gregYear: number;
  name: string;
  hebrewLabel: string;
  molads: MoladInfo[];
  weeks: (CalendarDay | null)[][];
}

export interface GeneratedCalendar {
  year: number;
  cycle: CalendarCycleType;
  location: CalendarLocation;
  months: CalendarMonth[];
  hebrewYearLabel: string;
}

export const PRESET_LOCATIONS: CalendarLocation[] = [
  {
    id: 'crown-heights',
    name: 'Crown Heights, Brooklyn, NY',
    city: 'Crown Heights',
    countryCode: 'US',
    latitude: 40.668,
    longitude: -73.9453,
    elevation: 15,
    tzid: 'America/New_York',
  },
  {
    id: 'new-york',
    name: 'New York, NY',
    city: 'New York',
    countryCode: 'US',
    latitude: 40.7128,
    longitude: -74.006,
    elevation: 10,
    tzid: 'America/New_York',
  },
  {
    id: 'los-angeles',
    name: 'Los Angeles, CA',
    city: 'Los Angeles',
    countryCode: 'US',
    latitude: 34.0522,
    longitude: -118.2437,
    elevation: 71,
    tzid: 'America/Los_Angeles',
  },
  {
    id: 'miami',
    name: 'Miami Beach, FL',
    city: 'Miami Beach',
    countryCode: 'US',
    latitude: 25.7907,
    longitude: -80.13,
    elevation: 1,
    tzid: 'America/New_York',
  },
  {
    id: 'chicago',
    name: 'Chicago, IL',
    city: 'Chicago',
    countryCode: 'US',
    latitude: 41.8781,
    longitude: -87.6298,
    elevation: 181,
    tzid: 'America/Chicago',
  },
  {
    id: 'baltimore',
    name: 'Baltimore, MD',
    city: 'Baltimore',
    countryCode: 'US',
    latitude: 39.2904,
    longitude: -76.6122,
    elevation: 10,
    tzid: 'America/New_York',
  },
  {
    id: 'boston',
    name: 'Boston, MA',
    city: 'Boston',
    countryCode: 'US',
    latitude: 42.3601,
    longitude: -71.0589,
    elevation: 14,
    tzid: 'America/New_York',
  },
  {
    id: 'philadelphia',
    name: 'Philadelphia, PA',
    city: 'Philadelphia',
    countryCode: 'US',
    latitude: 39.9526,
    longitude: -75.1652,
    elevation: 12,
    tzid: 'America/New_York',
  },
  {
    id: 'san-diego',
    name: 'San Diego, CA',
    city: 'San Diego',
    countryCode: 'US',
    latitude: 32.7157,
    longitude: -117.1611,
    elevation: 19,
    tzid: 'America/Los_Angeles',
  },
  {
    id: 'toronto',
    name: 'Toronto, ON, Canada',
    city: 'Toronto',
    countryCode: 'CA',
    latitude: 43.6532,
    longitude: -79.3832,
    elevation: 76,
    tzid: 'America/Toronto',
  },
  {
    id: 'montreal',
    name: 'Montreal, QC, Canada',
    city: 'Montreal',
    countryCode: 'CA',
    latitude: 45.5017,
    longitude: -73.5673,
    elevation: 36,
    tzid: 'America/Toronto',
  },
  {
    id: 'london',
    name: 'London, UK',
    city: 'London',
    countryCode: 'GB',
    latitude: 51.5074,
    longitude: -0.1278,
    elevation: 11,
    tzid: 'Europe/London',
  },
  {
    id: 'paris',
    name: 'Paris, France',
    city: 'Paris',
    countryCode: 'FR',
    latitude: 48.8566,
    longitude: 2.3522,
    elevation: 35,
    tzid: 'Europe/Paris',
  },
  {
    id: 'jerusalem',
    name: 'Jerusalem, Israel',
    city: 'Jerusalem',
    countryCode: 'IL',
    latitude: 31.7683,
    longitude: 35.2137,
    elevation: 754,
    tzid: 'Asia/Jerusalem',
  },
  {
    id: 'tel-aviv',
    name: 'Tel Aviv, Israel',
    city: 'Tel Aviv',
    countryCode: 'IL',
    latitude: 32.0853,
    longitude: 34.7818,
    elevation: 5,
    tzid: 'Asia/Jerusalem',
  },
  {
    id: 'sao-paulo',
    name: 'São Paulo, Brazil',
    city: 'São Paulo',
    countryCode: 'BR',
    latitude: -23.5505,
    longitude: -46.6333,
    elevation: 760,
    tzid: 'America/Sao_Paulo',
  },
  {
    id: 'melbourne',
    name: 'Melbourne, Australia',
    city: 'Melbourne',
    countryCode: 'AU',
    latitude: -37.8136,
    longitude: 144.9631,
    elevation: 31,
    tzid: 'Australia/Melbourne',
  },
  {
    id: 'buenos-aires',
    name: 'Buenos Aires, Argentina',
    city: 'Buenos Aires',
    countryCode: 'AR',
    latitude: -34.6037,
    longitude: -58.3816,
    elevation: 25,
    tzid: 'America/Argentina/Buenos_Aires',
  },
  {
    id: 'johannesburg',
    name: 'Johannesburg, South Africa',
    city: 'Johannesburg',
    countryCode: 'ZA',
    latitude: -26.2041,
    longitude: 28.0473,
    elevation: 1753,
    tzid: 'Africa/Johannesburg',
  },
];

export function getPresetLocation(id: string): CalendarLocation | undefined {
  return PRESET_LOCATIONS.find((loc) => loc.id === id);
}

export const DEFAULT_SETTINGS: CalendarSettings = {
  year: new Date().getFullYear(),
  cycle: 'secular',
  minhag: 'chabad',
  zmanimProfile: 'chabad',
  hour12: true,
  useElevation: false,
  tzeitMinutes: 50,
  candleMinutes: 18,
  bilingual: false,
};

export const CHABAD_SPECIAL_DATES: {
  day: number;
  month: number;
  name: string;
  type: 'yahrzeit' | 'anniversary' | 'chag' | 'birthday';
}[] = [
  { day: 6, month: 7, name: 'Vav Tishrei · Yahrzeit of Rebbetzin Chana', type: 'yahrzeit' },
  { day: 13, month: 7, name: 'Yud Gimmel Tishrei · Yahrzeit of the Rebbe Maharash', type: 'yahrzeit' },
  { day: 14, month: 9, name: 'Yud Daled Kislev · Wedding Anniversary of the Rebbe', type: 'anniversary' },
  { day: 19, month: 9, name: 'Yud Tes Kislev · Chag HaGeulah of the Alter Rebbe', type: 'chag' },
  { day: 5, month: 10, name: 'Hei Tevet · Didan Notzach (Victory of the Seforim)', type: 'chag' },
  { day: 24, month: 10, name: 'Chof Daled Tevet · Yahrzeit of the Alter Rebbe', type: 'yahrzeit' },
  { day: 10, month: 11, name: 'Yud Shvat · Histalkus of the Previous Rebbe & Kabbalas HaNesius', type: 'chag' },
  { day: 22, month: 11, name: 'Chof Beis Shvat · Yahrzeit of Rebbetzin Chaya Mushka', type: 'yahrzeit' },
  { day: 11, month: 1, name: 'Yud Alef Nissan · Birthday of the Rebbe', type: 'birthday' },
  { day: 18, month: 2, name: 'Lag BaOmer · Hillula of Rabbi Shimon bar Yochai', type: 'chag' },
  { day: 3, month: 4, name: 'Gimmel Tammuz · Yom HaHilula of the Rebbe', type: 'yahrzeit' },
  { day: 12, month: 4, name: 'Yud Beis Tammuz · Liberation of the Previous Rebbe', type: 'chag' },
  { day: 13, month: 4, name: 'Yud Gimmel Tammuz · Second Day of Redemption', type: 'chag' },
  { day: 20, month: 5, name: 'Chof Av · Yahrzeit of Rabbi Levi Yitzchak of Schneersohn', type: 'yahrzeit' },
  { day: 18, month: 6, name: 'Chai Elul · Birthday of the Baal Shem Tov & Alter Rebbe', type: 'birthday' },
];

export const GREGORIAN_MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const SHORT_MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const HEBREW_WEEKDAY_LETTERS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

export const ZMANIM_LIST: { key: keyof DayZmanim; label: string; heLabel: string }[] = [
  { key: 'alot', label: 'Alot HaShachar (Dawn)', heLabel: 'עלות השחר' },
  { key: 'misheyakir', label: 'Misheyakir (Earliest Tallit)', heLabel: 'משיכיר' },
  { key: 'sunrise', label: 'Sunrise (Netz HaChama)', heLabel: 'נץ החמה' },
  { key: 'sofZmanShmaMGA', label: 'Sof Zman Krias Shema (MGA)', heLabel: 'סוף זמן ק״ש (מג״א)' },
  { key: 'sofZmanShma', label: 'Sof Zman Krias Shema (Baal HaTanya / GRA)', heLabel: 'סוף זמן ק״ש (אדה״ז / גר״א)' },
  { key: 'sofZmanTfilla', label: 'Sof Zman Tefillah', heLabel: 'סוף זמן תפילה' },
  { key: 'chatzot', label: 'Chatzot (Midday)', heLabel: 'חצות היום' },
  { key: 'minchaGedola', label: 'Mincha Gedolah', heLabel: 'מנחה גדולה' },
  { key: 'minchaKetana', label: 'Mincha Ketana', heLabel: 'מנחה קטנה' },
  { key: 'plagHaMincha', label: 'Plag HaMincha', heLabel: 'פלג המנחה' },
  { key: 'sunset', label: 'Sunset (Shkiah)', heLabel: 'שקיעה' },
  { key: 'tzeit', label: 'Tzeit HaKochavim (Nightfall)', heLabel: 'צאת הכוכבים' },
  { key: 'rabbeinuTam', label: 'Tzeit Rabbeinu Tam (72 min)', heLabel: 'צאת רבינו תם (72 דק׳)' },
];

export const HEBREW_MONTH_OPTIONS: { num: number; name: string }[] = [
  { num: 7, name: 'Tishrei' },
  { num: 8, name: 'Cheshvan' },
  { num: 9, name: 'Kislev' },
  { num: 10, name: 'Tevet' },
  { num: 11, name: 'Shvat' },
  { num: 12, name: 'Adar' },
  { num: 1, name: 'Nisan' },
  { num: 2, name: 'Iyyar' },
  { num: 3, name: 'Sivan' },
  { num: 4, name: 'Tamuz' },
  { num: 5, name: 'Av' },
  { num: 6, name: 'Elul' },
];

const ROMAN_MAP: Record<string, string> = {
  I: '1',
  II: '2',
  III: '3',
  IV: '4',
  V: '5',
  VI: '6',
  VII: '7',
  VIII: '8',
  IX: '9',
  X: '10',
};

const ADAR_MAP: Record<string, string> = {
  'Adar I': 'Adar 1',
  'Adar II': 'Adar 2',
  'Adar III': 'Adar 3',
};

export function normalizeHebrewName(str: string): string {
  let out = str;
  for (const [k, v] of Object.entries(ADAR_MAP)) {
    out = out.replace(new RegExp(`\\b${k}\\b`, 'g'), v);
  }
  return out.replace(/\s+([IVX]+)(?=\b|[^A-Za-z]|$)/g, (full, rom) => {
    const mapped = ROMAN_MAP[rom];
    return mapped ? ` ${mapped}` : full;
  });
}

function isValidDate(d: Date | null | undefined): d is Date {
  return !!d && !Number.isNaN(d.getTime());
}

export function formatZmanTime(date: Date | null | undefined, tzid: string, hour12: boolean, stripAmPm = false): string {
  if (!isValidDate(date)) return '—';
  try {
    const formatted = new Intl.DateTimeFormat('en-US', {
      timeZone: tzid,
      hour: 'numeric',
      minute: '2-digit',
      hour12,
    }).format(date);
    return stripAmPm ? formatted.replace(/\s*(AM|PM)$/i, '') : formatted;
  } catch {
    const formatted = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12,
    }).format(date);
    return stripAmPm ? formatted.replace(/\s*(AM|PM)$/i, '') : formatted;
  }
}

export function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function computeDayZmanim(
  loc: Location,
  date: Date,
  settings: CalendarSettings,
  isYomTovToday: boolean,
  isYomTovTomorrow: boolean
): DayZmanim {
  const z = new Zmanim(loc, date, settings.useElevation);
  const safe = (d: Date | null | undefined) => (isValidDate(d) ? d : null);
  const weekday = date.getDay();
  const isFriday = weekday === 5;
  const isSaturday = weekday === 6;

  const isBaalHaTanya = settings.zmanimProfile === 'chabad';

  const alot = safe(isBaalHaTanya ? z.alosBaalHatanya() : z.alotHaShachar72());
  const misheyakir = safe(z.misheyakir());
  const sunrise = safe(z.sunrise());
  const sofZmanShmaMGA = safe(z.sofZmanShmaMGA());
  const sofZmanShma = safe(isBaalHaTanya ? z.sofZmanShmaBaalHatanya() : z.sofZmanShma());
  const sofZmanTfilla = safe(isBaalHaTanya ? z.sofZmanTfilaBaalHatanya() : z.sofZmanTfilla());
  const chatzot = safe(z.chatzot());
  const minchaGedola = safe(isBaalHaTanya ? z.minchaGedolaBaalHatanya() : z.minchaGedola());
  const minchaKetana = safe(isBaalHaTanya ? z.minchaKetanaBaalHatanya() : z.minchaKetana());
  const plagHaMincha = safe(isBaalHaTanya ? z.plagHaminchaBaalHatanya() : z.plagHaMincha());
  const sunset = safe(z.sunset());
  const tzeit = safe(z.sunsetOffset(settings.tzeitMinutes));
  const rabbeinuTam = safe(z.sunsetOffset(72));

  const candleMins =
    loc.getIsrael() && (loc.getShortName() ?? '').toLowerCase().includes('jerusalem') && settings.candleMinutes === 18
      ? 40
      : settings.candleMinutes;

  const candleLighting =
    isFriday || (isYomTovTomorrow && !isYomTovToday && !isSaturday)
      ? safe(z.sunsetOffset(-candleMins))
      : null;

  const havdalah =
    isSaturday || (isYomTovToday && !isYomTovTomorrow)
      ? safe(z.sunsetOffset(settings.tzeitMinutes))
      : null;

  return {
    alot,
    misheyakir,
    sunrise,
    sofZmanShmaMGA,
    sofZmanShma,
    sofZmanTfilla,
    chatzot,
    minchaGedola,
    minchaKetana,
    plagHaMincha,
    sunset,
    tzeit,
    rabbeinuTam,
    candleLighting,
    havdalah,
  };
}

const TEHILLIM_MONTHLY_RANGES: Record<number, string> = {
  1: 'Psalms 1–9',
  2: 'Psalms 10–17',
  3: 'Psalms 18–22',
  4: 'Psalms 23–28',
  5: 'Psalms 29–34',
  6: 'Psalms 35–38',
  7: 'Psalms 39–43',
  8: 'Psalms 44–48',
  9: 'Psalms 49–54',
  10: 'Psalms 55–59',
  11: 'Psalms 60–65',
  12: 'Psalms 66–68',
  13: 'Psalms 69–71',
  14: 'Psalms 72–76',
  15: 'Psalms 77–78',
  16: 'Psalms 79–82',
  17: 'Psalms 83–87',
  18: 'Psalms 88–89',
  19: 'Psalms 90–96',
  20: 'Psalms 97–103',
  21: 'Psalms 104–105',
  22: 'Psalms 106–107',
  23: 'Psalms 108–112',
  24: 'Psalms 113–118',
  25: 'Psalms 119:1–96',
  26: 'Psalms 119:97–176',
  27: 'Psalms 120–134',
  28: 'Psalms 135–139',
  29: 'Psalms 140–144',
  30: 'Psalms 145–150',
};

const ALIYAH_NAMES = ['Rishon', 'Sheni', 'Shlishi', 'Revii', 'Chamishi', 'Shishi', 'Shvii'];

const BAVLI_TRACTATES = [
  'Berakhot',
  'Shabbat',
  'Eruvin',
  'Pesachim',
  'Shekalim',
  'Yoma',
  'Sukkah',
  'Beitzah',
  'Rosh Hashanah',
  'Taanit',
  'Megillah',
  'Moed Katan',
  'Chagigah',
  'Yevamot',
  'Ketubot',
  'Nedarim',
  'Nazir',
  'Sotah',
  'Gittin',
  'Kiddushin',
  'Bava Kamma',
  'Bava Metzia',
  'Bava Batra',
  'Sanhedrin',
  'Makkot',
  'Shevuot',
  'Avodah Zarah',
  'Horayot',
  'Zevachim',
  'Menachot',
  'Chullin',
  'Bekhorot',
  'Arakhin',
  'Temurah',
  'Keritot',
  'Meilah',
  'Niddah',
];

const RAMBAM_BOOKS = [
  'Sefer HaMada',
  'Sefer Ahavah',
  'Sefer Zemanim',
  'Sefer Nashim',
  'Sefer Kedushah',
  'Sefer Haflaah',
  'Sefer Zeraim',
  'Sefer Avodah',
  'Sefer Korbanot',
  'Sefer Taharah',
  'Sefer Nezikim',
  'Sefer Kinyan',
  'Sefer Mishpatim',
  'Sefer Shoftim',
];

function computeDayJewishInfo(
  date: Date,
  hd: HDate,
  isIsrael: boolean,
  settings: CalendarSettings,
  zmanim: DayZmanim,
  holidays: DayHolidayItem[]
): DayJewishInfo {
  const info: DayJewishInfo = {};
  const yearEvents = HebrewCalendar.calendar({
    start: hd,
    end: hd,
    il: isIsrael,
    sedrot: true,
    omer: true,
  });

  for (const ev of yearEvents) {
    const desc = ev.render('en');
    if (ev.getFlags() & flags.PARSHA_HASHAVUA) {
      info.parsha = settings.minhag === 'sefardi' ? `${desc} (Sephardi Haftarah)` : desc;
    }
    if (ev.getFlags() & flags.OMER_COUNT) {
      info.omer = desc;
    }
  }

  // Pirkei Avot on Shabbat between Pesach and Rosh Hashanah
  const hMonth = hd.getMonth();
  if (hMonth >= 1 && hMonth <= 6 && date.getDay() === 6) {
    let firstShabbatAfterPesach = new HDate(isIsrael ? 22 : 23, 1, hd.getFullYear());
    while (firstShabbatAfterPesach.getDay() !== 6) {
      firstShabbatAfterPesach = firstShabbatAfterPesach.next();
    }
    if (hd.abs() >= firstShabbatAfterPesach.abs()) {
      const weeksDiff = Math.max(0, Math.floor((hd.abs() - firstShabbatAfterPesach.abs()) / 7));
      info.pirkeiAvot = `Pirkei Avot · Chapter ${(weeksDiff % 6) + 1}`;
    }
  }

  if (date.getDay() === 6 && hd.getDate() >= 23 && hd.getDate() <= 29 && hMonth !== 6) {
    info.birkatHaChodesh = 'Shabbat Mevarchim · Birkat HaChodesh';
  }

  if (hd.getDate() >= 3 && hd.getDate() <= 14 && hMonth !== 7) {
    info.kiddushLevana = 'Kiddush Levana window (Days 3–14)';
  }

  if (settings.minhag === 'sefardi' && hMonth === 6 && hd.getDate() >= 2) {
    info.kiddushLevana = info.kiddushLevana
      ? `${info.kiddushLevana} · Selichot season`
      : 'Selichot season (Sephardi)';
  }

  // Daily study tracks: Chitas, Hayom Yom, Daf Yomi, Rambam, Fast Details
  const hDay = hd.getDate();
  const aliyah = ALIYAH_NAMES[date.getDay()] ?? 'Rishon';
  const tehillim = TEHILLIM_MONTHLY_RANGES[hDay] ?? 'Psalms 145–150';
  info.chitas = `Chumash (${aliyah}) · ${tehillim} · Tanya Daily Portion`;
  info.hayomYom = `Hayom Yom for ${hDay} ${normalizeHebrewName(hd.getMonthName())}`;

  const absDay = hd.abs();
  const dafCycleOffset = ((absDay - 737425) % 2711 + 2711) % 2711;
  const tractate = BAVLI_TRACTATES[dafCycleOffset % BAVLI_TRACTATES.length];
  const dafPage = (dafCycleOffset % 62) + 2;
  info.dafYomi = `Daf Yomi: ${tractate} ${dafPage}`;

  const rambamBook = RAMBAM_BOOKS[Math.floor((absDay % 339) / 25) % RAMBAM_BOOKS.length];
  const rambamCh = ((absDay * 3) % 24) + 1;
  info.rambam = `Rambam: ${rambamBook}, Ch. ${rambamCh}–${rambamCh + 2}`;

  const isFast = holidays.some((h) => h.isFastDay);
  if (isFast) {
    const isMajorFast = holidays.some(
      (h) => h.name.includes('Yom Kippur') || h.name.includes("Tish'a B'Av") || h.name.includes('Tisha B')
    );
    const startStr = isMajorFast
      ? 'Previous evening at sunset'
      : formatZmanTime(zmanim.alot, 'UTC', settings.hour12);
    const endStr = formatZmanTime(zmanim.tzeit, 'UTC', settings.hour12);
    info.fastDetails = isMajorFast ? `Fast ends: ${endStr}` : `Fast: Dawn (${startStr}) – Nightfall (${endStr})`;
  }

  return info;
}

function getHolidaysForDay(
  date: Date,
  hd: HDate,
  isIsrael: boolean,
  minhag: MinhagType
): DayHolidayItem[] {
  const list: DayHolidayItem[] = [];

  if (minhag === 'chabad') {
    for (const special of CHABAD_SPECIAL_DATES) {
      if (special.day === hd.getDate() && special.month === hd.getMonth()) {
        list.push({
          name: special.name,
          isYomTov: false,
          isFastDay: false,
          isChabad: true,
        });
      }
    }
  }

  const hebHolidays = getHolidaysOnDate(hd, isIsrael) ?? [];
  for (const ev of hebHolidays) {
    const f = ev.getFlags();
    if (f & flags.MODERN_HOLIDAY) continue;
    let rendered = normalizeHebrewName(ev.render('en'));
    if (minhag === 'sefardi') {
      rendered = rendered.replace(/Rosh Hashana/g, 'Rosh HaShanah');
    }
    list.push({
      name: rendered,
      isYomTov: (f & flags.CHAG) !== 0,
      isFastDay: (f & (flags.MAJOR_FAST | flags.MINOR_FAST)) !== 0,
    });
  }

  return list;
}

function buildMoladInfo(hYear: number, hMonth: number): MoladInfo {
  const m = new Molad(hYear, hMonth);
  return {
    hebrewMonth: normalizeHebrewName(m.getMonthName()),
    hebrewYear: hYear,
    date: m.getMoladDate().greg(),
    hour: m.getHour(),
    minutes: m.getMinutes(),
    chalakim: m.getChalakim(),
  };
}

export function formatMoladAnnouncement(molad: MoladInfo, hour12: boolean): string {
  const timeStr = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12,
  }).format(new Date(2000, 0, 1, molad.hour, molad.minutes));

  const dateStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(molad.date);

  const chalakimPart = molad.chalakim === 0 ? '' : ` and ${molad.chalakim} chalakim`;
  return `Molad ${molad.hebrewMonth} ${molad.hebrewYear}: ${dateStr}, ${timeStr}${chalakimPart}`;
}

export function generateCalendar(
  year: number,
  location: CalendarLocation,
  settings: CalendarSettings
): GeneratedCalendar {
  const isIsrael = location.countryCode === 'IL';
  const hebcalLoc = new Location(
    location.latitude,
    location.longitude,
    isIsrael,
    location.tzid,
    location.name,
    location.countryCode,
    location.elevation,
    location.elevation
  );

  const today = new Date();
  const months: CalendarMonth[] = [];
  const hebrewYearsSet = new Set<number>();

  // If cycle is 'hebrew' (Tishrei–Elul), start in September of (year - 1) through August of (year)
  // so the 12 months cover the full Jewish year starting with Rosh Hashanah (Tishrei)!
  const monthSequence: { gYear: number; gMonth: number }[] = [];
  if (settings.cycle === 'hebrew') {
    for (let i = 0; i < 12; i++) {
      const m = (8 + i) % 12; // starts at September (index 8)
      const y = m >= 8 ? year : year + 1;
      monthSequence.push({ gYear: y, gMonth: m });
    }
  } else {
    for (let m = 0; m < 12; m++) {
      monthSequence.push({ gYear: year, gMonth: m });
    }
  }

  for (const { gYear, gMonth } of monthSequence) {
    const firstDay = new Date(gYear, gMonth, 1);
    const lastDay = new Date(gYear, gMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startWeekday = firstDay.getDay();

    const weeks: (CalendarDay | null)[][] = [];
    const roshChodeshList: { hyear: number; hmonth: number }[] = [];

    let currentWeek: (CalendarDay | null)[] = new Array(7).fill(null);
    let col = startWeekday;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(gYear, gMonth, d, 12, 0, 0);
      const hd = new HDate(dateObj);
      hebrewYearsSet.add(hd.getFullYear());

      const holidaysToday = getHolidaysForDay(dateObj, hd, isIsrael, settings.minhag);
      const nextDateObj = new Date(gYear, gMonth, d + 1, 12, 0, 0);
      const holidaysTomorrow = getHolidaysForDay(nextDateObj, new HDate(nextDateObj), isIsrael, settings.minhag);

      const isYomTovToday = holidaysToday.some((h) => h.isYomTov);
      const isYomTovTomorrow = holidaysTomorrow.some((h) => h.isYomTov);

      const prevHd = new HDate(new Date(gYear, gMonth, d - 1, 12, 0, 0));
      if (hd.getDate() === 1 && prevHd.getDate() !== 1) {
        roshChodeshList.push({ hyear: hd.getFullYear(), hmonth: hd.getMonth() });
      }

      const zmanim = computeDayZmanim(hebcalLoc, dateObj, settings, isYomTovToday, isYomTovTomorrow);
      const jewishInfo = computeDayJewishInfo(dateObj, hd, isIsrael, settings, zmanim, holidaysToday);

      const dayItem: CalendarDay = {
        date: dateObj,
        gregDay: d,
        gregMonth: gMonth,
        gregYear: gYear,
        weekday: dateObj.getDay(),
        hebrewDay: hd.getDate(),
        hebrewMonthNum: hd.getMonth(),
        hebrewMonth: normalizeHebrewName(hd.getMonthName()),
        hebrewYear: hd.getFullYear(),
        hebrewDate: `${hd.getDate()} ${normalizeHebrewName(hd.getMonthName())}`,
        hebrewGematriya: hd.renderGematriya(),
        holidays: holidaysToday,
        jewishInfo,
        zmanim,
        isFriday: dateObj.getDay() === 5,
        isSaturday: dateObj.getDay() === 6,
        isToday: isSameCalendarDay(dateObj, today),
      };

      currentWeek[col] = dayItem;
      if (col === 6) {
        weeks.push(currentWeek);
        currentWeek = new Array(7).fill(null);
        col = 0;
      } else {
        col++;
      }
    }

    if (currentWeek.some(Boolean)) {
      weeks.push(currentWeek);
    }

    const startHd = new HDate(firstDay);
    const endHd = new HDate(lastDay);
    const startM = normalizeHebrewName(startHd.getMonthName());
    const endM = normalizeHebrewName(endHd.getMonthName());
    const startY = startHd.getFullYear();
    const endY = endHd.getFullYear();

    const hebrewLabel =
      startM === endM
        ? `${startM} ${startY}`
        : startY === endY
        ? `${startM}–${endM} ${startY}`
        : `${startM} ${startY} – ${endM} ${endY}`;

    let molads = roshChodeshList.map(({ hyear, hmonth }) => buildMoladInfo(hyear, hmonth));
    if (molads.length === 0) {
      let probe = new HDate(lastDay).next();
      while (probe.getDate() !== 1) {
        probe = probe.next();
      }
      molads = [buildMoladInfo(probe.getFullYear(), probe.getMonth())];
    }

    months.push({
      gregMonth: gMonth,
      gregYear: gYear,
      name: GREGORIAN_MONTH_NAMES[gMonth],
      hebrewLabel,
      molads,
      weeks,
    });
  }

  const sortedHebYears = [...hebrewYearsSet].sort((a, b) => a - b);
  return {
    year,
    cycle: settings.cycle,
    location,
    months,
    hebrewYearLabel: sortedHebYears.join('/'),
  };
}

export function doesHebrewEventMatchDay(
  ev: PersonalHebrewEvent,
  day: CalendarDay
): boolean {
  if (ev.hebrewDay !== day.hebrewDay) return false;
  // Adar (12) matches Adar in regular years and Adar I (12) or Adar II (13) in leap years
  if (ev.hebrewMonth === 12 && (day.hebrewMonthNum === 12 || day.hebrewMonthNum === 13)) {
    return true;
  }
  return ev.hebrewMonth === day.hebrewMonthNum;
}

export function getYahrzeitsForDay(
  day: CalendarDay,
  personalHebrewEvents: PersonalHebrewEvent[] = []
): PersonalHebrewEvent[] {
  return personalHebrewEvents.filter((ev) => doesHebrewEventMatchDay(ev, day));
}

export function findYahrzeitOccurrencesInCalendar(
  ev: PersonalHebrewEvent,
  calendar: GeneratedCalendar
): { day: CalendarDay; monthIndex: number; monthName: string }[] {
  const matches: { day: CalendarDay; monthIndex: number; monthName: string }[] = [];
  calendar.months.forEach((month, mIdx) => {
    for (const week of month.weeks) {
      for (const day of week) {
        if (day && doesHebrewEventMatchDay(ev, day)) {
          matches.push({ day, monthIndex: mIdx, monthName: month.name });
        }
      }
    }
  });
  return matches;
}

export function getEventsForDay(
  day: CalendarDay,
  specialEvents: Record<string, string[]>,
  personalHebrewEvents: PersonalHebrewEvent[] = []
): string[] {
  const key = formatDateKey(day.date);
  const direct = specialEvents[key] ?? [];
  const recurring = personalHebrewEvents
    .filter((ev) => doesHebrewEventMatchDay(ev, day))
    .map((ev) => {
      const prefix =
        ev.category === 'yahrzeit'
          ? '🕯️ Yahrzeit:'
          : ev.category === 'birthday'
          ? '🎉 Birthday:'
          : ev.category === 'anniversary'
          ? '💍 Anniversary:'
          : '📌';
      return `${prefix} ${ev.title}`;
    });
  return [...recurring, ...direct];
}

// Geocoding & Timezone Utilities
export interface CitySearchResult {
  name: string;
  latitude: number;
  longitude: number;
  countryCode: string;
}

export async function searchCities(query: string): Promise<CitySearchResult[]> {
  try {
    const url = new URL('https://photon.komoot.io/api/');
    url.searchParams.set('q', query);
    url.searchParams.set('limit', '8');
    url.searchParams.set('lang', 'en');
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('City search unavailable');
    const data = await res.json();
    const out: CitySearchResult[] = [];
    for (const f of data.features ?? []) {
      const props = f.properties ?? {};
      const coords = f.geometry?.coordinates;
      if (!Array.isArray(coords) || coords.length < 2) continue;
      const [lon, lat] = coords;
      const city = props.city ?? props.name;
      if (!city) continue;
      const parts = [props.name && props.name !== city ? `${props.name}, ${city}` : city, props.state, props.country]
        .filter(Boolean)
        .join(', ');
      out.push({
        name: parts,
        latitude: lat,
        longitude: lon,
        countryCode: (props.countrycode ?? 'US').toUpperCase(),
      });
    }
    return out.slice(0, 8);
  } catch {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('limit', '8');
    url.searchParams.set('addressdetails', '1');
    const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('City search unavailable');
    const list = await res.json();
    const out: CitySearchResult[] = [];
    for (const item of list ?? []) {
      const lat = parseFloat(item.lat ?? '');
      const lon = parseFloat(item.lon ?? '');
      if (Number.isNaN(lat) || Number.isNaN(lon)) continue;
      out.push({
        name: item.display_name ?? item.name ?? 'Custom City',
        latitude: lat,
        longitude: lon,
        countryCode: (item.address?.country_code ?? 'US').toUpperCase(),
      });
    }
    return out.slice(0, 8);
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<CitySearchResult> {
  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lon));
  url.searchParams.set('format', 'jsonv2');
  const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('Location lookup unavailable');
  const data = await res.json();
  const addr = data.address;
  const city = addr?.city ?? addr?.town ?? addr?.village ?? data.name ?? 'Detected Location';
  const name = [city, addr?.state, addr?.country].filter(Boolean).join(', ');
  return {
    name,
    latitude: lat,
    longitude: lon,
    countryCode: (addr?.country_code ?? 'US').toUpperCase(),
  };
}

export async function resolveTimezone(lat: number, lon: number): Promise<string> {
  try {
    const url = new URL('https://timeapi.io/api/Time/current/coordinate');
    url.searchParams.set('latitude', String(lat));
    url.searchParams.set('longitude', String(lon));
    const res = await fetch(url.toString());
    if (res.ok) {
      const data = await res.json();
      if (data.timeZone) return data.timeZone;
    }
  } catch {
    // Fallback to nearest preset or browser timezone
  }
  let closest = PRESET_LOCATIONS[0];
  let bestDist = Infinity;
  for (const loc of PRESET_LOCATIONS) {
    const d = Math.hypot(loc.latitude - lat, loc.longitude - lon);
    if (d < bestDist) {
      bestDist = d;
      closest = loc;
    }
  }
  if (bestDist < 12) return closest.tzid;
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';
}

export function isValidTimezone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

// Export Functions: CSV, ICS, Print, PDF
const CSV_HEADERS = [
  'Date',
  'Weekday',
  'Hebrew Date',
  'Hebrew Year',
  'Holiday',
  'Parsha / Omer',
  'Alot HaShachar',
  'Misheyakir',
  'Sunrise',
  'Sof Zman Shma (MGA)',
  'Sof Zman Shma (GRA/Baal HaTanya)',
  'Sof Zman Tefillah',
  'Chatzot',
  'Mincha Gedolah',
  'Mincha Ketana',
  'Plag HaMincha',
  'Sunset',
  'Candle Lighting',
  'Havdalah',
  'Tzeit',
  'Special Events',
];

function escapeCsvCell(val: string): string {
  return /[",\n]/.test(val) ? `"${val.replace(/"/g, '""')}"` : val;
}

export function generateCsvContent(
  calendar: GeneratedCalendar,
  settings: CalendarSettings,
  specialEvents: Record<string, string[]>,
  personalHebrewEvents: PersonalHebrewEvent[] = []
): string {
  const fmt = (d: Date | null) => formatZmanTime(d, calendar.location.tzid, settings.hour12);
  const rows: string[][] = [CSV_HEADERS];

  for (const month of calendar.months) {
    for (const week of month.weeks) {
      for (const day of week) {
        if (!day) continue;
        const dayEvents = getEventsForDay(day, specialEvents, personalHebrewEvents);
        rows.push([
          formatDateKey(day.date),
          WEEKDAY_NAMES[day.weekday],
          day.hebrewDate,
          String(day.hebrewYear),
          day.holidays.map((h) => h.name).join('; '),
          [day.jewishInfo.parsha, day.jewishInfo.omer].filter(Boolean).join('; '),
          fmt(day.zmanim.alot),
          fmt(day.zmanim.misheyakir),
          fmt(day.zmanim.sunrise),
          fmt(day.zmanim.sofZmanShmaMGA),
          fmt(day.zmanim.sofZmanShma),
          fmt(day.zmanim.sofZmanTfilla),
          fmt(day.zmanim.chatzot),
          fmt(day.zmanim.minchaGedola),
          fmt(day.zmanim.minchaKetana),
          fmt(day.zmanim.plagHaMincha),
          fmt(day.zmanim.sunset),
          fmt(day.zmanim.candleLighting),
          fmt(day.zmanim.havdalah),
          fmt(day.zmanim.tzeit),
          dayEvents.join('; '),
        ]);
      }
    }
  }

  return '\uFEFF' + rows.map((r) => r.map(escapeCsvCell).join(',')).join('\n');
}

function formatIcsLocalDateTime(date: Date, tzid: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tzid,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, p) => {
      if (p.type !== 'literal') acc[p.type] = p.value;
      return acc;
    }, {});
  return `${parts.year}${parts.month}${parts.day}T${parts.hour}${parts.minute}${parts.second}`;
}

function formatIcsDateOnly(date: Date): string {
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
}

export function generateIcsContent(
  calendar: GeneratedCalendar,
  specialEvents: Record<string, string[]>,
  personalHebrewEvents: PersonalHebrewEvent[] = []
): string {
  const tzid = calendar.location.tzid;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Luach//Year Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Luach ${calendar.year} (${calendar.location.city})`,
  ];
  let uidCounter = 0;
  const dtstamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const pushTimed = (dt: Date, summary: string) => {
    lines.push(
      'BEGIN:VEVENT',
      `UID:luach-${formatIcsDateOnly(dt)}-${uidCounter++}@luach.app`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;TZID=${tzid}:${formatIcsLocalDateTime(dt, tzid)}`,
      `SUMMARY:${summary}`,
      'END:VEVENT'
    );
  };

  const pushAllDay = (dt: Date, summary: string) => {
    lines.push(
      'BEGIN:VEVENT',
      `UID:luach-${formatIcsDateOnly(dt)}-${uidCounter++}@luach.app`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${formatIcsDateOnly(dt)}`,
      `SUMMARY:${summary}`,
      'TRANSP:TRANSPARENT',
      'END:VEVENT'
    );
  };

  for (const month of calendar.months) {
    for (const week of month.weeks) {
      for (const day of week) {
        if (!day) continue;
        for (const h of day.holidays) {
          pushAllDay(day.date, h.name);
        }
        if (day.zmanim.candleLighting) {
          pushTimed(day.zmanim.candleLighting, `Candle Lighting (${calendar.location.city})`);
        }
        if (day.zmanim.havdalah) {
          pushTimed(day.zmanim.havdalah, `Havdalah (${calendar.location.city})`);
        }
        for (const ev of getEventsForDay(day, specialEvents, personalHebrewEvents)) {
          pushAllDay(day.date, ev);
        }
      }
    }
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function triggerFileDownload(filename: string, content: string, mime = 'text/plain'): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function slugify(text: string): string {
  return text
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

export async function exportCalendarToPdf(
  element: HTMLElement,
  filename: string,
  options: {
    paperSize: 'letter' | 'legal';
    orientation: 'portrait' | 'landscape';
    fitToPage: boolean;
    monthsPerPage: 1 | 4;
  }
): Promise<void> {
  const [{ jsPDF }, html2canvasModule] = await Promise.all([
    import('jspdf'),
    import('html2canvas-pro'),
  ]);
  const html2canvas = html2canvasModule.default;

  const clone = element.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('.print\\:hidden').forEach((el) => el.remove());
  clone.style.cssText = `${element.getAttribute('style') ?? ''}; width: 100%; max-width: none; margin: 0; padding: 24px;`;

  const holder = document.createElement('div');
  holder.style.cssText =
    'position: fixed; left: -100000px; top: 0; width: 1120px; background: white; z-index: 9999; opacity: 1;';
  holder.appendChild(clone);
  document.body.appendChild(holder);

  try {
    const pdf = new jsPDF({
      orientation: options.orientation,
      unit: 'pt',
      format: options.paperSize,
      compress: true,
    });

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 28;
    const availW = pageW - margin * 2;
    const availH = pageH - margin * 2;

    const monthNodes = Array.from(clone.querySelectorAll('.print-month')) as HTMLElement[];
    if (monthNodes.length === 0) {
      const canvas = await html2canvas(clone, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgH = (canvas.height * availW) / canvas.width;
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.94), 'JPEG', margin, margin, availW, Math.min(imgH, availH));
      pdf.save(filename);
      return;
    }

    const step = options.monthsPerPage === 4 ? 4 : 1;
    for (let i = 0; i < monthNodes.length; i += step) {
      if (i > 0) pdf.addPage();
      const targetNode = monthNodes[i];
      const canvas = await html2canvas(targetNode, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const ratio = canvas.height / canvas.width;
      const drawW = availW;
      const drawH = Math.min(availH, drawW * ratio);
      const yOffset = options.fitToPage ? margin + Math.max(0, (availH - drawH) / 2) : margin;
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.94), 'JPEG', margin, yOffset, drawW, drawH);
    }

    pdf.save(filename);
  } finally {
    holder.remove();
  }
}
