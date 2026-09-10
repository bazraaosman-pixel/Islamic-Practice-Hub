import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { DEFAULT_LOCATION, getCachedLocation, requestCurrentLocation } from '@/lib/location';
import type { CalculationMethodKey, LocationData } from '@/lib/prayerData';
import { cancelPrayerNotifications, prayerNotificationsSupported, schedulePrayerNotifications } from '@/lib/notifications';
import type { AdhanChoice, CustomAdhan, PrayerAlertSettings, SchedulablePrayer } from '@/lib/notifications';
import { registerPrayerBackgroundTask, unregisterPrayerBackgroundTask } from '@/lib/prayerBackgroundTask';

export type ThemePreference = 'light' | 'dark' | 'system';
export type Language = 'ar' | 'en';

type PreferencesContextValue = {
  theme: ThemePreference;
  language: Language;
  city: string;
  prayerNotifications: boolean;
  prayerNotificationsPending: boolean;
  prayerNotificationsError: string | null;
  adhan: AdhanChoice;
  customAdhan: CustomAdhan | null;
  prayerNotificationsSupported: boolean;
  setTheme: (theme: ThemePreference) => void;
  setLanguage: (language: Language) => void;
  setCity: (city: string) => void;
  setPrayerNotifications: (enabled: boolean) => void;
  setAdhan: (adhan: AdhanChoice) => void;
  setCustomAdhan: (custom: CustomAdhan | null) => Promise<void>;
  prayerAlertSettings: PrayerAlertSettings;
  setPrayerAlertSettings: (settings: PrayerAlertSettings) => void;
  updatePrayerAlert: (prayer: SchedulablePrayer, config: PrayerAlertSettings[SchedulablePrayer]) => void;
  location: LocationData;
  locationError: string | null;
  refreshLocation: () => Promise<void>;
  calculationMethod: CalculationMethodKey;
  madhab: 'shafi' | 'hanafi';
  setCalculationMethod: (method: CalculationMethodKey) => void;
  setMadhab: (madhab: 'shafi' | 'hanafi') => void;
};

const PreferencesContext = createContext<PreferencesContextValue>({
  theme: 'system',
  language: 'ar',
  city: 'Nairobi, Kenya',
  prayerNotifications: false,
  prayerNotificationsPending: false,
  prayerNotificationsError: null,
  adhan: 'makkah',
  customAdhan: null,
  prayerNotificationsSupported,
  setTheme: () => undefined,
  setLanguage: () => undefined,
  setCity: () => undefined,
  setPrayerNotifications: () => undefined,
  setAdhan: () => undefined,
  setCustomAdhan: async () => undefined,
  prayerAlertSettings: {} as PrayerAlertSettings,
  setPrayerAlertSettings: () => undefined,
  updatePrayerAlert: () => undefined,
  location: DEFAULT_LOCATION,
  locationError: null,
  refreshLocation: async () => undefined,
  calculationMethod: 'egyptian',
  madhab: 'shafi',
  setCalculationMethod: () => undefined,
  setMadhab: () => undefined,
});

const STORAGE_KEY = '@noor-al-salah/preferences';
const PRAYERS: SchedulablePrayer[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const defaultPrayerAlertSettings = (sound: 'makkah' | 'madinah' = 'makkah'): PrayerAlertSettings =>
  Object.fromEntries(PRAYERS.map((id) => [id, { enabled: true, sound, offsetMinutes: 0 }])) as PrayerAlertSettings;

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>('system');
  const [language, setLanguageState] = useState<Language>('ar');
  const [city, setCityState] = useState('Nairobi, Kenya');
  const [prayerNotifications, setPrayerNotificationsState] = useState(false);
  const [prayerNotificationsPending, setPrayerNotificationsPending] = useState(false);
  const [prayerNotificationsError, setPrayerNotificationsError] = useState<string | null>(null);
  const [adhan, setAdhanState] = useState<AdhanChoice>('makkah');
  const [customAdhan, setCustomAdhanState] = useState<CustomAdhan | null>(null);
  const [prayerAlertSettings, setPrayerAlertSettingsState] = useState<PrayerAlertSettings>(defaultPrayerAlertSettings());
  const [location, setLocation] = useState<LocationData>(DEFAULT_LOCATION);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [calculationMethod, setCalculationMethodState] = useState<CalculationMethodKey>('egyptian');
  const [madhab, setMadhabState] = useState<'shafi' | 'hanafi'>('shafi');
  const [hydrated, setHydrated] = useState(false);
  // Every schedule attempt owns a generation. Older promise callbacks are
  // deliberately ignored so they cannot undo the state of a newer attempt.
  const scheduleGeneration = useRef(0);

  const runSchedule = () => {
    const generation = ++scheduleGeneration.current;
    setPrayerNotificationsPending(true);
    setPrayerNotificationsError(null);
    schedulePrayerNotifications(location, calculationMethod, madhab, adhan, language, prayerAlertSettings)
      .then((scheduled) => {
        if (generation !== scheduleGeneration.current) return;
        if (!scheduled) throw new Error('notifications-unavailable');
        setPrayerNotificationsState(true);
        persist({ prayerNotifications: true });
      })
      .catch((error) => {
        if (generation !== scheduleGeneration.current) return;
        setPrayerNotificationsState(false);
        persist({ prayerNotifications: false });
        setPrayerNotificationsError(error instanceof Error ? error.message : 'notifications-schedule-failed');
      })
      .finally(() => {
        if (generation === scheduleGeneration.current) setPrayerNotificationsPending(false);
      });
  };

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(STORAGE_KEY), getCachedLocation()])
      .then(async ([stored, cached]) => {
        if (stored) {
          const parsed = JSON.parse(stored) as Partial<{
            theme: ThemePreference;
             language: Language; prayerAlertSettings?: Partial<PrayerAlertSettings>;
            city: string;
             prayerNotifications: boolean; adhan: AdhanChoice; customAdhan: CustomAdhan | null; calculationMethod: CalculationMethodKey; madhab: 'shafi' | 'hanafi';
          }>;
          if (parsed.theme) setThemeState(parsed.theme);
          if (parsed.language) setLanguageState(parsed.language);
          if (parsed.city) setCityState(parsed.city);
          if (typeof parsed.prayerNotifications === 'boolean') {
            setPrayerNotificationsState(parsed.prayerNotifications && prayerNotificationsSupported);
          }
           if (parsed.adhan === 'makkah' || parsed.adhan === 'madinah' || parsed.adhan === 'custom') setAdhanState(parsed.adhan);
            if (parsed.customAdhan?.uri && parsed.customAdhan.fileName) {
             try {
                const exists = parsed.customAdhan.uri.startsWith('data:') || (
                  Platform.OS !== 'web' &&
                  (await (await import('expo-file-system/legacy')).getInfoAsync(parsed.customAdhan.uri)).exists
                );
                if (exists) setCustomAdhanState(parsed.customAdhan);
               else setAdhanState('makkah');
             } catch { setAdhanState('makkah'); }
           } else if (parsed.adhan === 'custom') setAdhanState('makkah');
          if (parsed.calculationMethod) setCalculationMethodState(parsed.calculationMethod);
          if (parsed.madhab) setMadhabState(parsed.madhab);
            const migratedSound = parsed.adhan === 'madinah' ? 'madinah' : 'makkah';
            const storedAlerts = parsed.prayerAlertSettings;
            setPrayerAlertSettingsState(PRAYERS.reduce((all, id) => {
              const item = storedAlerts?.[id];
              all[id] = {
                enabled: typeof item?.enabled === 'boolean' ? item.enabled : true,
                sound: item?.sound === 'madinah' || item?.sound === 'silent' || item?.sound === 'makkah' ? item.sound : migratedSound,
                offsetMinutes: typeof item?.offsetMinutes === 'number' ? Math.max(-30, Math.min(30, Math.round(item.offsetMinutes))) : 0,
              };
              return all;
            }, {} as PrayerAlertSettings));
        }
        if (cached) {
          setLocation(cached);
          if (cached.city) setCityState(cached.city);
        } else {
          try {
            const current = await requestCurrentLocation();
            setLocation(current);
            if (current.city) setCityState(current.city);
          } catch {
            // Keep the clearly identified fallback location until the user grants access.
          }
        }
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated || !prayerNotifications) return;
    runSchedule();
    void registerPrayerBackgroundTask();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') runSchedule();
    });
    return () => subscription.remove();
    }, [hydrated, prayerNotifications, location, calculationMethod, madhab, adhan, language, prayerAlertSettings]);

  useEffect(() => {
    if (hydrated && !prayerNotifications) void unregisterPrayerBackgroundTask();
  }, [hydrated, prayerNotifications]);

  const persistOrThrow = (next: Partial<{
    theme: ThemePreference;
    language: Language;
    city: string; calculationMethod: CalculationMethodKey; madhab: 'shafi' | 'hanafi';
      prayerNotifications: boolean; adhan: AdhanChoice; customAdhan: CustomAdhan | null; prayerAlertSettings: PrayerAlertSettings;
  }>) => {
    return AsyncStorage.mergeItem(STORAGE_KEY, JSON.stringify(next));
  };
  const persist = (next: Parameters<typeof persistOrThrow>[0]) => {
    void persistOrThrow(next).catch(() => undefined);
  };

  const value = useMemo<PreferencesContextValue>(
    () => ({
      theme,
      language,
      city,
      prayerNotifications,
      prayerNotificationsPending,
      prayerNotificationsError,
      prayerNotificationsSupported,
      setTheme: (next) => {
        setThemeState(next);
        persist({ theme: next });
      },
      setLanguage: (next) => {
        setLanguageState(next);
        persist({ language: next });
      },
      setCity: (next) => {
        setCityState(next);
        persist({ city: next });
      },
      setPrayerNotifications: (next) => {
        if (!next) {
          setPrayerNotificationsState(false);
          scheduleGeneration.current += 1;
          setPrayerNotificationsPending(false);
          setPrayerNotificationsError(null);
          persist({ prayerNotifications: false });
          const cancelGeneration = scheduleGeneration.current;
          cancelPrayerNotifications().catch((error) => {
            if (cancelGeneration === scheduleGeneration.current) {
              setPrayerNotificationsError(error instanceof Error ? error.message : 'notifications-cancel-failed');
            }
          });
          return;
        }
        if (!prayerNotificationsSupported) {
          setPrayerNotificationsState(false);
          setPrayerNotificationsError('notifications-unavailable');
          persist({ prayerNotifications: false });
          return;
        }
        runSchedule();
      },
       adhan,
       customAdhan,
      setAdhan: (next) => { setAdhanState(next); persist({ adhan: next }); },
       setCustomAdhan: async (next) => {
         const nextAdhan: AdhanChoice = next ? 'custom' : 'makkah';
         await persistOrThrow({ customAdhan: next, adhan: nextAdhan });
         setCustomAdhanState(next);
         setAdhanState(nextAdhan);
       },
      prayerAlertSettings,
      setPrayerAlertSettings: (next) => { setPrayerAlertSettingsState(next); persist({ prayerAlertSettings: next }); },
      updatePrayerAlert: (prayer, config) => {
        const next = { ...prayerAlertSettings, [prayer]: { ...config, offsetMinutes: Math.max(-30, Math.min(30, Math.round(config.offsetMinutes))) } };
        setPrayerAlertSettingsState(next);
        persist({ prayerAlertSettings: next });
      },
      location,
      locationError,
      refreshLocation: async () => {
        try {
          const next = await requestCurrentLocation();
          setLocation(next); setLocationError(null);
          if (next.city) setCityState(next.city);
          persist({ city: next.city ?? city });
        } catch (error) { setLocationError(error instanceof Error ? error.message : 'location-denied'); }
      },
      calculationMethod,
      madhab,
      setCalculationMethod: (next) => { setCalculationMethodState(next); persist({ calculationMethod: next }); },
      setMadhab: (next) => { setMadhabState(next); persist({ madhab: next }); },
    }),
     [theme, language, city, prayerNotifications, prayerNotificationsPending, prayerNotificationsError, adhan, customAdhan, prayerAlertSettings, location, locationError, calculationMethod, madhab],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  return useContext(PreferencesContext);
}