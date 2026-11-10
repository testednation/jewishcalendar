import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

export type LanguageCode = 'en' | 'he';

export const LANGUAGES: { code: LanguageCode; label: string; short: string }[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'he', label: 'עברית', short: 'עב' },
];

const STORAGE_KEY = 'luach:lang:v1';

const en: Record<string, string> = {
  'calendar.title': 'Jewish Calendar',
  'calendar.subtitle': 'Year Calendar',
  'calendar.of': 'of',
  'nav.features': 'Features',
  'nav.how': 'How it works',
  'nav.sample': 'Sample',
  'nav.suggestions': 'Suggested Features',
  'nav.openStudio': 'Open Studio',
  'hero.badge': 'Chabad & Halachic Year Calendar Studio',
  'hero.title1': 'The yearly Jewish calendar,',
  'hero.title2': 'designed well.',
  'hero.desc': 'Luach generates a complete Jewish Calendar year calendar — Hebrew dates, 13 daily zmanim, candle lighting, molad, daily study tracks, and holidays — with a live preview and print-ready PDF, CSV and ICS export.',
  'hero.start': 'Start your calendar',
  'hero.seeSample': 'See live sample',
  'hero.zmanimPerDay': '13 zmanim per day',
  'hero.customsDefault': 'Built for the Jewish nation',
  'features.heading': 'Everything a yearly calendar needs',
  'features.title': 'One generator, the whole Jewish year',
  'features.desc': 'From Tishrei to Elul or January to December, every day is computed with the precision your community deserves.',
  'features.hebrewDates.title': 'Hebrew dates, every day',
  'features.hebrewDates.body': 'Each cell carries its Hebrew date and month, so you always know where you are in the Jewish year.',
  'features.dailyZmanim.title': '13 Daily zmanim',
  'features.dailyZmanim.body': 'Alot HaShachar through Tzeit HaKochavim — sunrise, sof zman, chatzot, mincha and more, per Chabad, Ashkenazi, or Sephardi custom.',
  'features.candleLighting.title': 'Candle lighting & Havdalah',
  'features.candleLighting.body': 'Friday & Erev Yom Tov candle lighting and Motzei Shabbat Havdalah computed from sunset for your exact coordinates.',
  'features.holidays.title': 'Holidays, Chabad dates & Molad',
  'features.holidays.body': 'Yom Tov, Rosh Chodesh, Chabad Yomim Tovim (19 Kislev, 10 Shvat, 11 Nissan), Molad times, and fast days are highlighted automatically.',
  'features.livePreview.title': 'Live preview & photo layouts',
  'features.livePreview.body': 'What you see is what prints. Customize themes, cover photos, monthly banners, yahrzeits, and separator pages.',
  'features.exports.title': 'PDF, CSV, ICS & Weekly Flyers',
  'features.exports.body': 'Print a multi-page PDF, export the full zmanim spreadsheet to CSV, sync holidays to your calendar app, or generate a Shabbat announcement card.',
  'how.heading': 'How it works',
  'how.title': 'From blank page to printed calendar in minutes',
  'how.step1.title': '01. Pick your location',
  'how.step1.body': 'Choose from 19 curated Jewish community centers, search any city worldwide, or enter manual coordinates with timezone detection.',
  'how.step2.title': '02. Set the year, cycle & customs',
  'how.step2.body': 'Select Secular (Jan–Dec) or Hebrew Year (Tishrei–Elul), minhag, zmanim calculation profile, study tracks, and family yahrzeits.',
  'how.step3.title': '03. Customize & export',
  'how.step3.body': 'Print to PDF with 1 or 4 months per page, download the full CSV table, sync via ICS, or save an offline HTML copy.',
  'cta.ready': "Ready for this year's community calendar?",
  'cta.desc': 'Generate your yearly calendar with live preview, custom themes, yahrzeit tracking, and print-ready exports.',
  'cta.generate': 'Open Calendar Studio',
  'cta.exploreFeatures': 'Explore New Features',
  'footer.tagline': 'Jewish year calendars with zmanim — built for the Jewish nation',
  'footer.copy': '© {year} Luach Studio — Halachic Calendar & Zmanim Generator.',
  'dash.header.studio': 'Year Calendar Studio',
  'dash.calendar.title': 'Calendar & Year Cycle',
  'dash.calendar.desc': 'What goes on the masthead and how months are ordered.',
  'dash.calendar.name': 'Calendar name',
  'dash.calendar.namePlaceholder': 'Jewish Calendar of …',
  'dash.calendar.year': 'Year',
  'dash.calendar.cycle': 'Calendar cycle',
  'dash.location.title': 'Calendar location',
  'dash.location.desc': 'Zmanim are calculated for this latitude, longitude and timezone.',
  'dash.location.of': 'Jewish Calendar of',
  'dash.location.searchPlaceholder': 'e.g. Brighton Beach, Safed, Antwerp…',
  'dash.location.searchCity': 'Search any city',
  'dash.location.useCurrent': 'Use my current location',
  'dash.location.detecting': 'Detecting location…',
  'dash.location.manualCoords': 'Manual coordinates',
  'dash.location.name': 'Name',
  'dash.location.latitude': 'Latitude',
  'dash.location.longitude': 'Longitude',
  'dash.location.timezone': 'Timezone (IANA)',
  'dash.location.detect': 'Detect',
  'dash.location.applyCustom': 'Apply custom location',
  'dash.advanced': 'Advanced customization & Jewish info',
  'dash.advanced.hide': 'Hide',
  'dash.advanced.show': 'Show',
  'dash.export.title': 'Print & Export',
  'dash.export.desc': 'Choose paper size, orientation, and export format.',
  'dash.export.print': 'Print',
  'dash.export.pdf': 'PDF',
  'dash.export.csv': 'Export CSV',
  'dash.export.ics': 'Export ICS',
  'cal.hebrewYear': 'Hebrew year',
  'cal.legend.timesLocal': 'All times local to',
  'cal.candle': 'Candle',
  'cal.havdalah': 'Havdalah',
  'cal.sunrise': 'Sunrise',
  'cal.sunset': 'Sunset',
  'cal.specialEvents': 'Special events & Yahrzeits',
  'cal.eventPlaceholder': 'Add custom event or note…',
  'cal.addEvent': 'Add',
  'day.parsha': 'Parsha',
  'day.learning': 'Pirkei Avot',
  'day.omer': 'Sefirat HaOmer',
  'day.candleLighting': 'Candle Lighting',
  'day.havdalahLabel': 'Havdalah',
};

const he: Record<string, string> = {
  'calendar.title': 'לוח שנה יהודי',
  'calendar.subtitle': 'לוח שנתי',
  'calendar.of': 'של',
  'nav.features': 'אפשרויות',
  'nav.how': 'איך זה עובד',
  'nav.sample': 'דוגמה חיה',
  'nav.suggestions': 'חידושים מומלצים',
  'nav.openStudio': 'פתיחת הסטודיו',
  'hero.badge': 'סטודיו לוח שנה חב״ד וזמני הלכה',
  'hero.title1': 'לוח השנה היהודי,',
  'hero.title2': 'בעיצוב מוקפד.',
  'hero.desc': 'לוך מייצר לוח שנה יהודי שלם — תאריכים עבריים, 13 זמני היום בהלכה, הדלקת נרות, מולד, שיעורי חת״ת ורמב״ם וחגים — עם תצוגה מקדימה חיה וייצוא ל-PDF, CSV ו-ICS.',
  'hero.start': 'צרו את הלוח שלכם',
  'hero.seeSample': 'צפו בדוגמה',
  'hero.zmanimPerDay': '13 זמני הלכה ביום',
  'hero.customsDefault': 'נבנה עבור קהילות ישראל',
  'features.heading': 'כל מה שלוח שנתי צריך',
  'features.title': 'מחולל אחד לכל השנה היהודית',
  'features.desc': 'מתשרי עד אלול או מינואר עד דצמבר — כל יום מחושב בדיוק הלכתי מלא.',
  'features.hebrewDates.title': 'תאריך עברי בכל יום',
  'features.hebrewDates.body': 'כל משבצת מציגה את התאריך העברי והלועזי בצורה ברורה ונוחה לקריאה.',
  'features.dailyZmanim.title': '13 זמני היום בהלכה',
  'features.dailyZmanim.body': 'מעלות השחר ועד צאת הכוכבים — נץ החמה, סוף זמן קריאת שמע, חצות, מנחה ועוד.',
  'features.candleLighting.title': 'הדלקת נרות והבדלה',
  'features.candleLighting.body': 'זמני הדלקת נרות בערב שבת ויום טוב וזמני הבדלה מחושבים לפי המיקום המדויק שלכם.',
  'features.holidays.title': 'חגים, תאריכי חב״ד והמולד',
  'features.holidays.body': 'ימים טובים, ראש חודש, ימי דפגרא חב״דיים (י״ט כסלו, י׳ שבט, י״א ניסן), מולד הלבנה וצומות.',
  'features.livePreview.title': 'תצוגה חיה ולוח תמונות',
  'features.livePreview.body': 'התאימו ערכות צבעים, תמונות שער, תמונות חודשיות, יארצייטים ודפי הפרדה בין חודשים.',
  'features.exports.title': 'PDF, CSV, ICS ועלון שבת',
  'features.exports.body': 'הדפיסו PDF מרובה עמודים, ייצאו טבלת זמנים ל-CSV, סנכרנו ליומן או הפיקו כרטיס זמני שבת לבית הכנסת.',
  'how.heading': 'איך זה עובד',
  'how.title': 'מדף ריק ללוח מודפס תוך דקות',
  'how.step1.title': '01. בחרו את המיקום שלכם',
  'how.step1.body': 'בחרו מתוך ערים יהודיות מרכזיות, חפשו כל עיר בעולם או הזינו קואורדינטות ידניות.',
  'how.step2.title': '02. קבעו שנה, מחזור ומנהג',
  'how.step2.body': 'בחרו שנה לועזית או עברית (תשרי–אלול), מנהג, שיטת חישוב זמנים, חת״ת, רמב״ם ויארצייטים.',
  'how.step3.title': '03. עצבו וייצאו להדפסה',
  'how.step3.body': 'הדפיסו ל-PDF עם חודש אחד או 4 חודשים בעמוד, הורידו CSV או סנכרנו ליומן.',
  'cta.ready': 'מוכנים ללוח השנה של הקהילה שלכם?',
  'cta.desc': 'צרו את הלוח השנתי עם תצוגה מקדימה חיה, יארצייטים וייצוא מלא להדפסה.',
  'cta.generate': 'פתיחת סטודיו לוח שנה',
  'cta.exploreFeatures': 'גלו חידושים מומלצים',
  'footer.tagline': 'לוחות שנה יהודיים עם זמני הלכה — נבנה עבור קהילות ישראל',
  'footer.copy': '© {year} לוך סטודיו — מחולל לוחות שנה וזמני הלכה.',
  'dash.header.studio': 'סטודיו לוח שנה',
  'dash.calendar.title': 'לוח שנה ומחזור שנתי',
  'dash.calendar.desc': 'מה מופיע בכותרת הלוח וכיצד מסודרים החודשים.',
  'dash.calendar.name': 'שם לוח השנה',
  'dash.calendar.namePlaceholder': 'לוח שנה יהודי של …',
  'dash.calendar.year': 'שנה',
  'dash.calendar.cycle': 'סדר חודשים',
  'dash.location.title': 'מיקום לוח השנה',
  'dash.location.desc': 'הזמנים מחושבים עבור קו רוחב, קו אורך ואזור זמן אלו.',
  'dash.location.of': 'לוח שנה יהודי של',
  'dash.location.searchPlaceholder': 'לדוגמה: קראון הייטס, צפת, פריז…',
  'dash.location.searchCity': 'חיפוש עיר בעולם',
  'dash.location.useCurrent': 'השתמש במיקום הנוכחי שלי',
  'dash.location.detecting': 'מזהה מיקום…',
  'dash.location.manualCoords': 'קואורדינטות ידניות',
  'dash.location.name': 'שם',
  'dash.location.latitude': 'קו רוחב',
  'dash.location.longitude': 'קו אורך',
  'dash.location.timezone': 'אזור זמן (IANA)',
  'dash.location.detect': 'זהה',
  'dash.location.applyCustom': 'החל מיקום מותאם אישית',
  'dash.advanced': 'הגדרות מתקדמות, זמנים וערכות נושא',
  'dash.advanced.hide': 'הסתר',
  'dash.advanced.show': 'הצג',
  'dash.export.title': 'הדפסה וייצוא',
  'dash.export.desc': 'בחרו גודל נייר, כיוון ופורמט ייצוא.',
  'dash.export.print': 'הדפסה',
  'dash.export.pdf': 'PDF',
  'dash.export.csv': 'ייצוא CSV',
  'dash.export.ics': 'ייצוא ICS',
  'cal.hebrewYear': 'שנה עברית',
  'cal.legend.timesLocal': 'כל הזמנים מקומיים ל-',
  'cal.candle': 'נרות',
  'cal.havdalah': 'הבדלה',
  'cal.sunrise': 'נץ',
  'cal.sunset': 'שקיעה',
  'cal.specialEvents': 'אירועים מיוחדים ויארצייטים',
  'cal.eventPlaceholder': 'הוסף אירוע או הערה…',
  'cal.addEvent': 'הוסף',
  'day.parsha': 'פרשה',
  'day.learning': 'פרקי אבות',
  'day.omer': 'ספירת העומר',
  'day.candleLighting': 'הדלקת נרות',
  'day.havdalahLabel': 'הבדלה',
};

interface LanguageContextValue {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in params ? String(params[k]) : `{${k}}`));
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'he') return saved;
    } catch {
      // ignore
    }
    return 'en';
  });

  const setLang = useCallback((next: LanguageCode) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const dict = lang === 'he' ? he : en;

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const raw = dict[key] ?? en[key] ?? key;
      return interpolate(raw, params);
    },
    [dict]
  );

  const dir: 'ltr' | 'rtl' = lang === 'he' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [dir, lang]);

  const value = useMemo(() => ({ lang, setLang, t, dir }), [lang, setLang, t, dir]);

  return React.createElement(LanguageContext.Provider, { value }, children);
}

export function useTranslation(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      lang: 'en',
      setLang: () => {},
      t: (key, params) => interpolate(en[key] ?? key, params),
      dir: 'ltr',
    };
  }
  return ctx;
}
