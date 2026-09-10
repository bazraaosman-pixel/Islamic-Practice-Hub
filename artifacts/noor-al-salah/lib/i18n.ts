import { usePreferences } from '@/context/PreferencesContext';
import type { Language } from '@/context/PreferencesContext';

export const catalog = {
  appName: { ar: 'نور الصلاة', en: 'Noor Al-Salah' },
  home: { ar: 'الرئيسية', en: 'Home' },
  prayer: { ar: 'الصلاة', en: 'Prayer' },
  quran: { ar: 'القرآن', en: 'Quran' },
  adhkar: { ar: 'الأذكار', en: 'Adhkar' },
  settings: { ar: 'الإعدادات', en: 'Settings' },
  about: { ar: 'عن التطبيق', en: 'About' },
  morning: { ar: 'أذكار الصباح', en: 'Morning Adhkar' },
  evening: { ar: 'أذكار المساء', en: 'Evening Adhkar' },
  afterPrayer: { ar: 'بعد الصلاة', en: 'After Prayer' },
  sleep: { ar: 'أذكار النوم', en: 'Before Sleep' },
  development: { ar: 'التطوير والتصميم', en: 'Development & Design' },
  developer: { ar: 'م / بازرعه عثمان محمد علي', en: 'Eng. Bazraa Osman Muhammad Ali' },
  back: { ar: 'العودة', en: 'Back' },
  next: { ar: 'التالي', en: 'Next' },
  previous: { ar: 'السابق', en: 'Previous' },
  repeat: { ar: 'التكرار', en: 'Repeat' },
  source: { ar: 'المصدر', en: 'Source' },
  read: { ar: 'اقرأ', en: 'Read' },
  location: { ar: 'الموقع', en: 'Location' },
  qibla: { ar: 'القبلة', en: 'Qibla' },
  tasbeeh: { ar: 'التسبيح', en: 'Tasbeeh' },
  current: { ar: 'القادم', en: 'Next' },
  loading: { ar: 'جارٍ التحميل…', en: 'Loading…' },
  error: { ar: 'حدث خطأ', en: 'Something went wrong' },
  retry: { ar: 'إعادة المحاولة', en: 'Try again' },
  attribution: { ar: 'المصدر', en: 'Attribution' },
  noData: { ar: 'لا توجد بيانات', en: 'No data available' },
  morningCount: { ar: '24 ذكراً', en: '24 supplications' },
  eveningCount: { ar: '24 ذكراً', en: '24 supplications' },
  prayerCount: { ar: '8 أذكار', en: '8 supplications' },
  sleepCount: { ar: '13 ذكراً', en: '13 supplications' },
  qiblaDescription: { ar: 'اعرف اتجاه القبلة من موقعك الحالي', en: 'Find the Qibla direction from your current location' },
  tasbeehDescription: { ar: 'سبّح واذكر الله', en: 'Remember Allah with every count' },
} as const;

export type TranslationKey = keyof typeof catalog;
export function t(key: TranslationKey, language: Language): string {
  return catalog[key][language];
}

/** Central localized string hook. Supports interpolation without introducing
 * translated content into Quran or other source corpora. */
export function useI18n() {
  const { language } = usePreferences();
  return {
    language,
    isArabic: language === 'ar',
    t: (key: TranslationKey) => t(key, language),
    text: (ar: string, en: string) => language === 'ar' ? ar : en,
  };
}