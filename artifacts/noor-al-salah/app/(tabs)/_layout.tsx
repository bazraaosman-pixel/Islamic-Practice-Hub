import React from 'react';
import { Platform, StyleSheet, useColorScheme, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Tabs } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useI18n } from '@/lib/i18n';

const tabMeta = [
  { name: 'index', key: 'home', icon: 'home' as const, sf: 'house' },
  { name: 'prayer', key: 'prayer', icon: 'clock' as const, sf: 'clock' },
  { name: 'quran', key: 'quran', icon: 'book-open' as const, sf: 'book' },
  { name: 'adhkar', key: 'adhkar', icon: 'heart' as const, sf: 'heart' },
  { name: 'settings', key: 'settings', icon: 'settings' as const, sf: 'gearshape' },
] as const;

function NativeTabLayout({ labels, tabs }: { labels: Record<string, string>; tabs: readonly typeof tabMeta[number][] }) {
  return (
    <NativeTabs>
      {tabs.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <NativeTabs.Trigger.Icon sf={{ default: tab.sf as any, selected: `${tab.sf}.fill` as any }} />
          <NativeTabs.Trigger.Label>{labels[tab.key]}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}

function ClassicTabLayout({ labels, tabs }: { labels: Record<string, string>; tabs: readonly typeof tabMeta[number][] }) {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isIOS = Platform.OS === 'ios';
  const isWeb = Platform.OS === 'web';
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: isIOS ? 'transparent' : colors.card,
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: colors.border,
          elevation: 0,
          height: isWeb ? 84 : 70,
          paddingTop: 7,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={100} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />
          ) : null,
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: labels[tab.key],
            tabBarIcon: ({ color, size }) => <Feather name={tab.icon} size={size ?? 21} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}

export default function TabLayout() {
  const { t, isArabic } = useI18n();
  const labels = { home: t('home'), prayer: t('prayer'), quran: t('quran'), adhkar: t('adhkar'), settings: t('settings') };
  const tabs = isArabic ? [...tabMeta].reverse() : tabMeta;
  return isLiquidGlassAvailable() ? <NativeTabLayout labels={labels} tabs={tabs} /> : <ClassicTabLayout labels={labels} tabs={tabs} />;
}