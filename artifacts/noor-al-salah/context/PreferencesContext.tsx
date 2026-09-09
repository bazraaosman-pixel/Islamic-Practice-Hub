import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';
export type Language = 'ar' | 'en';

type PreferencesContextValue = {
  theme: ThemePreference;
  language: Language;
  city: string;
  prayerNotifications: boolean;
  setTheme: (theme: ThemePreference) => void;
  setLanguage: (language: Language) => void;
  setCity: (city: string) => void;
  setPrayerNotifications: (enabled: boolean) => void;
};

const PreferencesContext = createContext<PreferencesContextValue>({
  theme: 'system',
  language: 'ar',
  city: 'Nairobi, Kenya',
  prayerNotifications: false,
  setTheme: () => undefined,
  setLanguage: () => undefined,
  setCity: () => undefined,
  setPrayerNotifications: () => undefined,
});

const STORAGE_KEY = '@noor-al-salah/preferences';

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>('system');
  const [language, setLanguageState] = useState<Language>('ar');
  const [city, setCityState] = useState('Nairobi, Kenya');
  const [prayerNotifications, setPrayerNotificationsState] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!stored) return;
        const parsed = JSON.parse(stored) as Partial<{
          theme: ThemePreference;
          language: Language;
          city: string;
          prayerNotifications: boolean;
        }>;
        if (parsed.theme) setThemeState(parsed.theme);
        if (parsed.language) setLanguageState(parsed.language);
        if (parsed.city) setCityState(parsed.city);
        if (typeof parsed.prayerNotifications === 'boolean') {
          setPrayerNotificationsState(parsed.prayerNotifications);
        }
      })
      .catch(() => undefined);
  }, []);

  const persist = (next: Partial<{
    theme: ThemePreference;
    language: Language;
    city: string;
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
        setPrayerNotificationsState(next);
        persist({ prayerNotifications: next });
      },
    }),
    [theme, language, city, prayerNotifications],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  return useContext(PreferencesContext);
}