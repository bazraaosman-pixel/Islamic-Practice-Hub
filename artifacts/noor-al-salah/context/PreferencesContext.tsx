import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LOCATION, getCachedLocation, requestCurrentLocation } from '@/lib/location';
import type { CalculationMethodKey, LocationData } from '@/lib/prayerData';
import { cancelPrayerNotifications, prayerNotificationsSupported, schedulePrayerNotifications } from '@/lib/notifications';

export type ThemePreference = 'light' | 'dark' | 'system';
export type Language = 'ar' | 'en';

type PreferencesContextValue = {
  theme: ThemePreference;
  language: Language;
  city: string;
  prayerNotifications: boolean;
  prayerNotificationsSupported: boolean;
  setTheme: (theme: ThemePreference) => void;
  setLanguage: (language: Language) => void;
  setCity: (city: string) => void;
  setPrayerNotifications: (enabled: boolean) => void;
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
  prayerNotificationsSupported,
  setTheme: () => undefined,
  setLanguage: () => undefined,
  setCity: () => undefined,
  setPrayerNotifications: () => undefined,
  location: DEFAULT_LOCATION,
  locationError: null,
  refreshLocation: async () => undefined,
  calculationMethod: 'muslimWorldLeague',
  madhab: 'shafi',
  setCalculationMethod: () => undefined,
  setMadhab: () => undefined,
});

const STORAGE_KEY = '@noor-al-salah/preferences';

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>('system');
  const [language, setLanguageState] = useState<Language>('ar');
  const [city, setCityState] = useState('Nairobi, Kenya');
  const [prayerNotifications, setPrayerNotificationsState] = useState(false);
  const [location, setLocation] = useState<LocationData>(DEFAULT_LOCATION);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [calculationMethod, setCalculationMethodState] = useState<CalculationMethodKey>('muslimWorldLeague');
  const [madhab, setMadhabState] = useState<'shafi' | 'hanafi'>('shafi');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(STORAGE_KEY), getCachedLocation()])
      .then(async ([stored, cached]) => {
        if (stored) {
          const parsed = JSON.parse(stored) as Partial<{
            theme: ThemePreference;
            language: Language;
            city: string;
            prayerNotifications: boolean; calculationMethod: CalculationMethodKey; madhab: 'shafi' | 'hanafi';
          }>;
          if (parsed.theme) setThemeState(parsed.theme);
          if (parsed.language) setLanguageState(parsed.language);
          if (parsed.city) setCityState(parsed.city);
          if (typeof parsed.prayerNotifications === 'boolean') {
            setPrayerNotificationsState(parsed.prayerNotifications && prayerNotificationsSupported);
          }
          if (parsed.calculationMethod) setCalculationMethodState(parsed.calculationMethod);
          if (parsed.madhab) setMadhabState(parsed.madhab);
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
    schedulePrayerNotifications(location, calculationMethod, madhab).catch(() => undefined);
  }, [hydrated, prayerNotifications, location, calculationMethod, madhab]);

  const persist = (next: Partial<{
    theme: ThemePreference;
    language: Language;
    city: string; calculationMethod: CalculationMethodKey; madhab: 'shafi' | 'hanafi';
    prayerNotifications: boolean;
  }>) => {
    AsyncStorage.mergeItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
  };

  const value = useMemo<PreferencesContextValue>(
    () => ({
      theme,
      language,
      city,
      prayerNotifications,
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
          persist({ prayerNotifications: false });
          cancelPrayerNotifications().catch(() => undefined);
          return;
        }
        if (!prayerNotificationsSupported) {
          setPrayerNotificationsState(false);
          persist({ prayerNotifications: false });
          return;
        }
        schedulePrayerNotifications(location, calculationMethod, madhab)
          .then((scheduled) => { setPrayerNotificationsState(scheduled); persist({ prayerNotifications: scheduled }); })
          .catch(() => { setPrayerNotificationsState(false); persist({ prayerNotifications: false }); });
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
    [theme, language, city, prayerNotifications, location, locationError, calculationMethod, madhab],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  return useContext(PreferencesContext);
}