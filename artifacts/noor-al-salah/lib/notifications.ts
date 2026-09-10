import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPrayerTimes, type CalculationMethodKey, type LocationData } from './prayerData';
import type { Language } from '@/context/PreferencesContext';

const IDS_KEY = '@noor-al-salah/prayer-notification-ids';
export type BuiltInAdhan = 'makkah' | 'madinah';
export type AdhanChoice = BuiltInAdhan | 'custom';
export type SchedulablePrayer = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
export type PrayerAlertSound = BuiltInAdhan | 'silent';
export type PrayerAlertConfig = { enabled: boolean; sound: PrayerAlertSound; offsetMinutes: number };
export type PrayerAlertSettings = Record<SchedulablePrayer, PrayerAlertConfig>;
export type CustomAdhan = { uri: string; fileName: string };
export const ADHAN_SOUNDS: Record<BuiltInAdhan, string> = {
  makkah: 'makkah-adhan.wav',
  madinah: 'madinah-adhan.wav',
};
export const ADHAN_AUDIO_ASSETS: Record<BuiltInAdhan, number> = {
  makkah: require('../assets/audio/makkah-adhan.wav'),
  madinah: require('../assets/audio/madinah-adhan.wav'),
};
const CHANNEL_IDS: Record<BuiltInAdhan, string> = {
  makkah: 'prayer-adhan-makkah-v2',
  madinah: 'prayer-adhan-madinah-v2',
};
const SILENT_CHANNEL_ID = 'prayer-adhan-silent-v1';

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
    handleNotification: async (notification) => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: notification.request.content.data?.silent !== true, shouldSetBadge: false }),
  });
}

void configureNotificationHandler();

export function schedulePrayerNotifications(location: LocationData, method: CalculationMethodKey, madhab: 'shafi' | 'hanafi', adhan: AdhanChoice = 'makkah', language: Language = 'ar', settings?: PrayerAlertSettings, requestPermission = true): Promise<boolean> {
  const operation = schedulingQueue.then(() => schedulePrayerNotificationsUnsafe(location, method, madhab, adhan, language, settings, requestPermission));
  schedulingQueue = operation.catch(() => undefined);
  return operation;
}

async function schedulePrayerNotificationsUnsafe(location: LocationData, method: CalculationMethodKey, madhab: 'shafi' | 'hanafi', adhan: AdhanChoice, language: Language, settings: PrayerAlertSettings | undefined, requestPermission: boolean): Promise<boolean> {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return false;
  await cancelPrayerNotificationsUnsafe();
  const permission = requestPermission
    ? await Notifications.requestPermissionsAsync()
    : await Notifications.getPermissionsAsync();
  if (!permission.granted) throw new Error('notifications-denied');
  // Native notifications cannot read user document files. Always use the
  // bundled Makkah sound/channel for the custom choice.
  const notificationAdhan: BuiltInAdhan = adhan === 'custom' ? 'makkah' : adhan;
  if (Platform.OS === 'android') {
    await Promise.all((['makkah', 'madinah'] as const).map((sound) =>
      Notifications.setNotificationChannelAsync(CHANNEL_IDS[sound], {
        name: language === 'ar'
          ? (sound === 'makkah' ? 'أذان الحرم المكي' : 'أذان الحرم المدني')
          : (sound === 'makkah' ? 'Makkah Adhan' : 'Madinah Adhan'),
        importance: Notifications.AndroidImportance.HIGH,
        sound: ADHAN_SOUNDS[sound],
        audioAttributes: {
          usage: Notifications.AndroidAudioUsage.ALARM,
          contentType: Notifications.AndroidAudioContentType.SONIFICATION,
        },
        enableVibrate: true,
        vibrationPattern: [0, 250, 250, 250],
      }),
    ));
    await Notifications.setNotificationChannelAsync(SILENT_CHANNEL_ID, {
      name: language === 'ar' ? 'صامت' : 'Silent',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: null,
      enableVibrate: false,
    });
  }
  const now = new Date();
  const ids: string[] = [];
  for (let offset = 0; offset < 7; offset += 1) {
    const date = new Date(now);
    date.setDate(now.getDate() + offset);
    const prayers = getPrayerTimes(location, date, method, madhab).filter((prayer) => prayer.id !== 'sunrise' && (settings?.[prayer.id as SchedulablePrayer]?.enabled ?? true));
    for (const prayer of prayers) {
      const config = settings?.[prayer.id as SchedulablePrayer];
      const sound = config?.sound ?? notificationAdhan;
      const timestamp = (prayer.timestamp ?? 0) + (config?.offsetMinutes ?? 0) * 60 * 1000;
      if (timestamp <= now.getTime()) continue;
      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: { title: language === 'ar' ? `حان وقت صلاة ${prayer.arabic}` : `Prayer time: ${prayer.english}`, body: language === 'ar' ? `${prayer.english} · ${prayer.time}` : `${prayer.english} prayer · ${prayer.time}`, ...(sound !== 'silent' ? { sound: ADHAN_SOUNDS[sound] } : {}), data: { kind: 'prayer', prayer: prayer.id, silent: sound === 'silent' } },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(timestamp), ...(Platform.OS === 'android' ? { channelId: sound === 'silent' ? SILENT_CHANNEL_ID : CHANNEL_IDS[sound] } : {}) },
        });
        ids.push(id);
      } catch (error) {
        await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));
        throw error;
      }
    }
  }
  try {
    await AsyncStorage.setItem(IDS_KEY, JSON.stringify(ids));
  } catch (error) {
    await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));
    throw error;
  }
  return true;
}

export async function cancelPrayerNotifications() {
  const operation = schedulingQueue.then(() => cancelPrayerNotificationsUnsafe());
  schedulingQueue = operation.catch(() => undefined);
  return operation;
}

async function cancelPrayerNotificationsUnsafe() {
  const stored = await AsyncStorage.getItem(IDS_KEY);
  let ids: string[] = [];
  try {
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    if (Array.isArray(parsed)) ids = parsed.filter((id): id is string => typeof id === 'string');
  } catch {
    ids = [];
  }
  const Notifications = await getNotificationsModule();
  if (Notifications) {
    await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));
  }
  await AsyncStorage.removeItem(IDS_KEY);
}