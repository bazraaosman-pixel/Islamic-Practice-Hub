export type SudaneseQari = {
  id: 'alzain' | 'noreen' | 'fateh';
  name: string;
  riwaya: string;
  server: string;
};

export const sudaneseQaris: SudaneseQari[] = [
  {
    id: 'alzain',
    name: 'الشيخ الزين محمد أحمد',
    riwaya: 'حفص عن عاصم',
    server: 'https://server9.mp3quran.net/alzain/',
  },
  {
    id: 'noreen',
    name: 'الشيخ نورين محمد صديق',
    riwaya: 'الدوري عن أبي عمرو',
    server: 'https://server16.mp3quran.net/nourin_siddig/Rewayat-Aldori-A-n-Abi-Amr/',
  },
  {
    id: 'fateh',
    name: 'الشيخ الفاتح محمد الزبير',
    riwaya: 'الدوري عن أبي عمرو',
    server: 'https://server6.mp3quran.net/fateh/',
  },
];

export function getSurahAudioUrl(qari: SudaneseQari, surahNumber: number) {
  return `${qari.server}${String(surahNumber).padStart(3, '0')}.mp3`;
}