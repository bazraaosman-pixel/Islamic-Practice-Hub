import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPrayerTimes, type CalculationMethodKey, type LocationData } from './prayerData';
import type { Language } from '@/context/PreferencesContext';

const IDS_KEY = '@noor-al-salah/prayer-notification-ids';
export type AdhanChoice = 'makkah' | 'madinah';
export const ADHAN_SOUNDS: Record<AdhanChoice, string> = {
  makkah: 'makkah-adhan.wav',
  madinah: 'madinah-adhan.wav',
};
export const ADHAN_AUDIO_ASSETS: Record<AdhanChoice, number> = {
  makkah: require('../assets/audio/makkah-adhan.wav'),
  madinah: require('../assets/audio/madinah-adhan.wav'),
};
const CHANNEL_IDS: Record<AdhanChoice, string> = {
  makkah: 'prayer-adhan-makkah-v1',
  madinah: 'prayer-adhan-madinah-v1',
};

export const prayerNotificationsSupported =
  Platform.OS !== 'web' &&
  Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

type NotificationsModule = typeof import('expo-notifications');
let notificationsModulePromise: Promise<NotificationsModule | null> | null = null;
let schedulingQueue: Promise<unknown> = Promise.resolve();

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

export function schedulePrayerNotifications(location: LocationData, method: CalculationMethodKey, madhab: 'shafi' | 'hanafi', adhan: AdhanChoice = 'makkah', language: Language = 'ar'): Promise<boolean> {
  const operation = schedulingQueue.then(() => schedulePrayerNotificationsUnsafe(location, method, madhab, adhan, language));
  schedulingQueue = operation.catch(() => undefined);
  return operation;
}

async function schedulePrayerNotificationsUnsafe(location: LocationData, method: CalculationMethodKey, madhab: 'shafi' | 'hanafi', adhan: AdhanChoice, language: Language): Promise<boolean> {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return false;
  await cancelPrayerNotificationsUnsafe();
  const permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) throw new Error('notifications-denied');
  if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync(CHANNEL_IDS[adhan], { name: language === 'ar' ? (adhan === 'makkah' ? 'أذان مكة' : 'أذان المدينة') : (adhan === 'makkah' ? 'Makkah Adhan' : 'Madinah Adhan'), importance: Notifications.AndroidImportance.HIGH, sound: ADHAN_SOUNDS[adhan] });
  const now = new Date();
  const ids: string[] = [];
  for (let offset = 0; offset < 7; offset += 1) {
    const date = new Date(now);
    date.setDate(now.getDate() + offset);
    const prayers = getPrayerTimes(location, date, method, madhab).filter((prayer) => prayer.id !== 'sunrise' && (prayer.timestamp ?? 0) > now.getTime());
    for (const prayer of prayers) {
      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: { title: language === 'ar' ? `حان وقت صلاة ${prayer.arabic}` : `Prayer time: ${prayer.english}`, body: language === 'ar' ? `${prayer.english} · ${prayer.time}` : `${prayer.english} prayer · ${prayer.time}`, sound: ADHAN_SOUNDS[adhan], data: { kind: 'prayer', prayer: prayer.id } },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(prayer.timestamp!), ...(Platform.OS === 'android' ? { channelId: CHANNEL_IDS[adhan] } : {}) },
        });
        ids.push(id);
      } catch (error) {
        await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));
        throw error;
      }
    }
  }
  await AsyncStorage.setItem(IDS_KEY, JSON.stringify(ids));
  return true;
}

export async function cancelPrayerNotifications() {
  const operation = schedulingQueue.then(() => cancelPrayerNotificationsUnsafe());
  schedulingQueue = operation.catch(() => undefined);
  return operation;
}

async function cancelPrayerNotificationsUnsafe() {
  const stored = await AsyncStorage.getItem(IDS_KEY);
  const ids = stored ? JSON.parse(stored) as string[] : [];
  const Notifications = await getNotificationsModule();
  if (Notifications) {
    await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));
  }
  await AsyncStorage.removeItem(IDS_KEY);
}