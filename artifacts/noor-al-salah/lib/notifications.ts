import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPrayerTimes, type CalculationMethodKey, type LocationData } from './prayerData';

const IDS_KEY = '@noor-al-salah/prayer-notification-ids';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
  });
}

export async function schedulePrayerNotifications(location: LocationData, method: CalculationMethodKey, madhab: 'shafi' | 'hanafi') {
  if (Platform.OS === 'web') return;
  await cancelPrayerNotifications();
  const permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) throw new Error('notifications-denied');
  if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('prayer', { name: 'تنبيهات الصلاة', importance: Notifications.AndroidImportance.HIGH, sound: 'default' });
  const now = new Date();
  const ids: string[] = [];
  for (let offset = 0; offset < 7; offset += 1) {
    const date = new Date(now);
    date.setDate(now.getDate() + offset);
    const prayers = getPrayerTimes(location, date, method, madhab).filter((prayer) => prayer.id !== 'sunrise' && (prayer.timestamp ?? 0) > now.getTime());
    for (const prayer of prayers) {
      const id = await Notifications.scheduleNotificationAsync({
        content: { title: `حان وقت صلاة ${prayer.arabic}`, body: `${prayer.english} · ${prayer.time}`, sound: 'default', data: { kind: 'prayer', prayer: prayer.id } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(prayer.timestamp!), ...(Platform.OS === 'android' ? { channelId: 'prayer' } : {}) },
      });
      ids.push(id);
    }
  }
  await AsyncStorage.setItem(IDS_KEY, JSON.stringify(ids));
}
export async function cancelPrayerNotifications() {
  if (Platform.OS === 'web') return;
  const stored = await AsyncStorage.getItem(IDS_KEY);
  const ids = stored ? JSON.parse(stored) as string[] : [];
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));
  await AsyncStorage.removeItem(IDS_KEY);
}