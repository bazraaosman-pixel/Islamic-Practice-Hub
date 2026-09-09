export type Prayer = {
  id: string;
  arabic: string;
  english: string;
  time: string;
  icon: 'sunrise' | 'sun' | 'cloud-sun' | 'sunset' | 'moon';
  accent: 'gold' | 'teal' | 'blue' | 'orange' | 'violet';
};

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

export function getTimeInMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function getNextPrayer(now = new Date()) {
  const current = now.getHours() * 60 + now.getMinutes();
  return prayers.find((prayer) => getTimeInMinutes(prayer.time) > current) ?? prayers[0];
}

export function getCountdown(time: string, now = new Date()) {
  const target = getTimeInMinutes(time);
  const current = now.getHours() * 60 + now.getMinutes();
  let difference = target - current;
  if (difference <= 0) difference += 24 * 60;
  const hours = Math.floor(difference / 60);
  const minutes = difference % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
}