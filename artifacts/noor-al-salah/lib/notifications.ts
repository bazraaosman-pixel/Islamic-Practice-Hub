import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPrayerTimes, type CalculationMethodKey, type LocationData } from './prayerData';

const IDS_KEY = '@noor-al-salah/prayer-notification-ids';

export const prayerNotificationsSupported =
  Platform.OS !== 'web' &&
  Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

type NotificationsModule = typeof import('expo-notifications');
let notificationsModulePromise: Promise<NotificationsModule | null> | null = null;

async function getNotificationsModule(): Promise<NotificationsModule | null> {
  if (!prayerNotificationsSupported) return null;
  if (!notificationsModulePromise) {
    notificationsModulePromise = import('expo-notifications').catch(() => null);
  }
  return notificationsModulePromise;
}

async function configureNotificationHandler() {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
  });
}

void configureNotificationHandler();

export async function schedulePrayerNotifications(location: LocationData, method: CalculationMethodKey, madhab: 'shafi' | 'hanafi'): Promise<boolean> {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return false;
  await cancelPrayerNotifications();
  const permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) throw new Error('notifications-denied');
  if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('prayer-adhan-v1', { name: 'تنبيهات الصلاة بالأذان', importance: Notifications.AndroidImportance.HIGH, sound: 'traditional-adhan.wav' });
  const now = new Date();
  const ids: string[] = [];
  for (let offset = 0; offset < 7; offset += 1) {
    const date = new Date(now);
    date.setDate(now.getDate() + offset);
    const prayers = getPrayerTimes(location, date, method, madhab).filter((prayer) => prayer.id !== 'sunrise' && (prayer.timestamp ?? 0) > now.getTime());
    for (const prayer of prayers) {
      const id = await Notifications.scheduleNotificationAsync({
        content: { title: `حان وقت صلاة ${prayer.arabic}`, body: `${prayer.english} · ${prayer.time}`, sound: 'traditional-adhan.wav', data: { kind: 'prayer', prayer: prayer.id } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(prayer.timestamp!), ...(Platform.OS === 'android' ? { channelId: 'prayer-adhan-v1' } : {}) },
      });
      ids.push(id);
    }
  }
  await AsyncStorage.setItem(IDS_KEY, JSON.stringify(ids));
  return true;
}

export async function cancelPrayerNotifications() {
  const stored = await AsyncStorage.getItem(IDS_KEY);
  const ids = stored ? JSON.parse(stored) as string[] : [];
  const Notifications = await getNotificationsModule();
  if (Notifications) {
    await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));
  }
  await AsyncStorage.removeItem(IDS_KEY);
}