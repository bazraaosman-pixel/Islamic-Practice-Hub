import AsyncStorage from '@react-native-async-storage/async-storage';
import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { getCachedLocation } from './location';
import { schedulePrayerNotifications, type PrayerAlertSettings, type AdhanChoice } from './notifications';
import type { CalculationMethodKey } from './prayerData';

const TASK_NAME = 'noor-prayer-notification-refresh';
const STORAGE_KEY = '@noor-al-salah/preferences';
const defaults: PrayerAlertSettings = Object.fromEntries(
  ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map((id) => [id, { enabled: true, sound: 'makkah', offsetMinutes: 0 }]),
) as PrayerAlertSettings;
const prayerIds = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

async function readPreferences() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const p = raw ? JSON.parse(raw) as Record<string, unknown> : {};
    if (p.prayerNotifications !== true) return null;
    const location = await getCachedLocation();
    if (!location) return null;
    const storedSettings = p.prayerAlertSettings && typeof p.prayerAlertSettings === 'object'
      ? p.prayerAlertSettings as Partial<PrayerAlertSettings>
      : {};
    const settings = prayerIds.reduce((result, id) => {
      const stored = storedSettings[id];
      result[id] = {
        enabled: typeof stored?.enabled === 'boolean' ? stored.enabled : defaults[id].enabled,
        sound: stored?.sound === 'makkah' || stored?.sound === 'madinah' || stored?.sound === 'silent'
          ? stored.sound
          : defaults[id].sound,
        offsetMinutes: typeof stored?.offsetMinutes === 'number' && Number.isFinite(stored.offsetMinutes)
          ? Math.max(-30, Math.min(30, Math.round(stored.offsetMinutes)))
          : defaults[id].offsetMinutes,
      };
      return result;
    }, {} as PrayerAlertSettings);
    return { location, method: (p.calculationMethod as CalculationMethodKey) || 'egyptian', madhab: p.madhab === 'hanafi' ? 'hanafi' as const : 'shafi' as const, adhan: (p.adhan === 'madinah' ? 'madinah' : 'makkah') as AdhanChoice, language: p.language === 'en' ? 'en' as const : 'ar' as const, settings };
  } catch {
    return null;
  }
}

TaskManager.defineTask(TASK_NAME, async () => {
  const preferences = await readPreferences();
  if (!preferences) return BackgroundTask.BackgroundTaskResult.Success;
  try {
    const Notifications = await import('expo-notifications');
    const permission = await Notifications.getPermissionsAsync();
    if (!permission.granted) return BackgroundTask.BackgroundTaskResult.Failed;
    await schedulePrayerNotifications(preferences.location, preferences.method, preferences.madhab, preferences.adhan, preferences.language, preferences.settings, false);
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch {
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export async function registerPrayerBackgroundTask() {
  try {
    await BackgroundTask.registerTaskAsync(TASK_NAME, { minimumInterval: 12 * 60 });
  } catch {
    // Registration can fail on unsupported platforms; foreground scheduling remains active.
  }
}

export async function unregisterPrayerBackgroundTask() {
  try { await BackgroundTask.unregisterTaskAsync(TASK_NAME); } catch { /* already unregistered */ }
}