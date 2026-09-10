import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from 'adhan';

export type Prayer = {
  id: string;
  arabic: string;
  english: string;
  time: string;
  icon: 'sunrise' | 'sun' | 'cloud-sun' | 'sunset' | 'moon';
  accent: 'gold' | 'teal' | 'blue' | 'orange' | 'violet';
  timestamp?: number;
};

export type CalculationMethodKey = 'muslimWorldLeague' | 'egyptian' | 'karachi' | 'ummAlQura' | 'northAmerica' | 'singapore';
export type LocationData = { latitude: number; longitude: number; city?: string };

const methods: Record<CalculationMethodKey, () => ReturnType<typeof CalculationMethod.MuslimWorldLeague>> = {
  muslimWorldLeague: CalculationMethod.MuslimWorldLeague,
  egyptian: CalculationMethod.Egyptian,
  karachi: CalculationMethod.Karachi,
  ummAlQura: CalculationMethod.UmmAlQura,
  northAmerica: CalculationMethod.NorthAmerica,
  singapore: CalculationMethod.Singapore,
};

export function getPrayerTimes(location: LocationData, date = new Date(), method: CalculationMethodKey = 'muslimWorldLeague', madhab: 'shafi' | 'hanafi' = 'shafi'): Prayer[] {
  const params = methods[method]?.() ?? CalculationMethod.MuslimWorldLeague();
  params.madhab = madhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  const times = new PrayerTimes(new Coordinates(location.latitude, location.longitude), date, params);
  const entries: Array<[string, string, Date, Prayer['icon'], Prayer['accent']]> = [
    ['fajr', 'الفجر', times.fajr, 'moon', 'violet'],
    ['sunrise', 'الشروق', times.sunrise, 'sunrise', 'gold'],
    ['dhuhr', 'الظهر', times.dhuhr, 'sun', 'gold'],
    ['asr', 'العصر', times.asr, 'cloud-sun', 'blue'],
    ['maghrib', 'المغرب', times.maghrib, 'sunset', 'orange'],
    ['isha', 'العشاء', times.isha, 'moon', 'violet'],
  ];
  return entries.map(([id, arabic, value, icon, accent]) => ({
    id, arabic, english: ({ fajr: 'Fajr', sunrise: 'Sunrise', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' } as Record<string, string>)[id],
    time: `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`, icon, accent, timestamp: value.getTime(),
  }));
}

export const prayers: Prayer[] = [
  { id: 'fajr', arabic: 'الفجر', english: 'Fajr', time: '05:16', icon: 'moon', accent: 'violet' },
  { id: 'sunrise', arabic: 'الشروق', english: 'Sunrise', time: '06:29', icon: 'sunrise', accent: 'gold' },
  { id: 'dhuhr', arabic: 'الظهر', english: 'Dhuhr', time: '12:19', icon: 'sun', accent: 'gold' },
  { id: 'asr', arabic: 'العصر', english: 'Asr', time: '15:38', icon: 'cloud-sun', accent: 'blue' },
  { id: 'maghrib', arabic: 'المغرب', english: 'Maghrib', time: '18:24', icon: 'sunset', accent: 'orange' },
  { id: 'isha', arabic: 'العشاء', english: 'Isha', time: '19:36', icon: 'moon', accent: 'violet' },
];

export const surahs = [
  { number: 1, arabic: 'الفاتحة', english: 'Al-Fatihah', ayahs: 7, place: 'مكية' },
  { number: 2, arabic: 'البقرة', english: 'Al-Baqarah', ayahs: 286, place: 'مدنية' },
  { number: 18, arabic: 'الكهف', english: 'Al-Kahf', ayahs: 110, place: 'مكية' },
  { number: 36, arabic: 'يس', english: 'Ya-Sin', ayahs: 83, place: 'مكية' },
  { number: 55, arabic: 'الرحمن', english: 'Ar-Rahman', ayahs: 78, place: 'مدنية' },
  { number: 67, arabic: 'الملك', english: 'Al-Mulk', ayahs: 30, place: 'مكية' },
  { number: 112, arabic: 'الإخلاص', english: 'Al-Ikhlas', ayahs: 4, place: 'مكية' },
];

export const remembranceCategories = [
  { id: 'morning', arabic: 'أذكار الصباح', english: 'Morning Adhkar', icon: 'sunrise', count: '24 أذكار' },
  { id: 'evening', arabic: 'أذكار المساء', english: 'Evening Adhkar', icon: 'moon', count: '24 أذكار' },
  { id: 'prayer', arabic: 'بعد الصلاة', english: 'After Prayer', icon: 'heart', count: '12 أذكار' },
  { id: 'sleep', arabic: 'أذكار النوم', english: 'Before Sleep', icon: 'moon', count: '8 أذكار' },
];

export type AdhkarPeriod = 'morning' | 'evening';

export type DhikrEntry = {
  id: string;
  arabic: string;
  translation: string;
  repeat: number;
};

export const adhkarSets: Record<AdhkarPeriod, DhikrEntry[]> = {
  morning: [
    {
      id: 'morning-praise',
      arabic: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ',
      translation: 'تنزيه الله وحمده',
      repeat: 100,
    },
    {
      id: 'morning-contentment',
      arabic: 'رَضِيتُ بِاللهِ رَبًّا، وَبِالإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا',
      translation: 'تجديد الرضا بالله والإسلام ورسوله',
      repeat: 3,
    },
    {
      id: 'morning-wellbeing',
      arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ العَفْوَ وَالعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ',
      translation: 'دعاء بالعفو والعافية في الدنيا والآخرة',
      repeat: 1,
    },
    {
      id: 'morning-protection',
      arabic: 'أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
      translation: 'الاستعاذة بكلمات الله التامات',
      repeat: 3,
    },
  ],
  evening: [
    {
      id: 'evening-praise',
      arabic: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ',
      translation: 'تنزيه الله وحمده',
      repeat: 100,
    },
    {
      id: 'evening-contentment',
      arabic: 'رَضِيتُ بِاللهِ رَبًّا، وَبِالإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا',
      translation: 'تجديد الرضا بالله والإسلام ورسوله',
      repeat: 3,
    },
    {
      id: 'evening-protection',
      arabic: 'أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
      translation: 'الاستعاذة بكلمات الله التامات',
      repeat: 3,
    },
    {
      id: 'evening-wellbeing',
      arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ العَفْوَ وَالعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ',
      translation: 'دعاء بالعفو والعافية في الدنيا والآخرة',
      repeat: 1,
    },
  ],
};

export function getTimeInMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function getNextPrayer(now = new Date(), prayerList: Prayer[] = prayers, tomorrowList: Prayer[] = []) {
  const current = now.getTime();
  const todayNext = prayerList.find((prayer) => prayer.id !== 'sunrise' && (prayer.timestamp ?? 0) > current);
  return todayNext ?? tomorrowList.find((prayer) => prayer.id === 'fajr') ?? prayerList.find((prayer) => prayer.id === 'fajr') ?? prayerList[0];
}

export function getCountdown(prayer: Prayer, now = new Date()) {
  const fallback = new Date(now);
  const [hours, minutes] = prayer.time.split(':').map(Number);
  fallback.setHours(hours, minutes, 0, 0);
  if (fallback <= now) fallback.setDate(fallback.getDate() + 1);
  const difference = Math.max(0, (prayer.timestamp ?? fallback.getTime()) - now.getTime());
  const totalSeconds = Math.floor(difference / 1000);
  const remainingHours = Math.floor(totalSeconds / 3600);
  const remainingMinutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${String(remainingHours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}