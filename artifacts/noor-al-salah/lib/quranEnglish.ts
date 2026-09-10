/**
 * English translation distributed by quran-json 3.1.2 (CC BY 4.0), authored
 * from the Noble Qur'an Encyclopedia source. Chapters are bundled in the
 * installed package, so this remains available offline.
 */
export const quranEnglishAttribution = 'English translation: quran-json 3.1.2, CC BY 4.0; source: The Noble Qur’an Encyclopedia.';

import { quranEnglishTranslations } from '@/lib/quranEnglishData';

export function getEnglishVerse(surah: number, verse: number): string | undefined {
  return quranEnglishTranslations[surah]?.[verse - 1];
}