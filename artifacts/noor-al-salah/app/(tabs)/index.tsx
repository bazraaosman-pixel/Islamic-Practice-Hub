import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PageHeader, PrayerRow, QuickAction, ScreenShell, SectionHeading } from '@/components/NoorUI';
import { useColors } from '@/hooks/useColors';
import { getCountdown, getNextPrayer, getPrayerTimes } from '@/lib/prayerData';
import { usePreferences } from '@/context/PreferencesContext';
import { useI18n } from '@/lib/i18n';

function getDateCopy() {
  const now = new Date();
  const gregorian = new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' }).format(now);
  const hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' }).format(now);
  return { gregorian, hijri };
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { city, location, calculationMethod, madhab, refreshLocation } = usePreferences();
  const { text, isArabic, t } = useI18n();
  const [now, setNow] = useState(new Date());
  const prayers = useMemo(() => getPrayerTimes(location, now, calculationMethod, madhab), [location, calculationMethod, madhab, now.toDateString()]);
  const tomorrowPrayers = useMemo(() => { const date = new Date(now); date.setDate(date.getDate() + 1); return getPrayerTimes(location, date, calculationMethod, madhab); }, [location, calculationMethod, madhab, now.toDateString()]);
  const nextPrayer = useMemo(() => getNextPrayer(now, prayers, tomorrowPrayers), [now, prayers, tomorrowPrayers]);
  const dates = useMemo(() => {
    const date = new Intl.DateTimeFormat(isArabic ? 'ar-EG' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' }).format(now);
    const hijri = new Intl.DateTimeFormat(isArabic ? 'ar-SA-u-ca-islamic-umalqura' : 'en-US-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' }).format(now);
    return { gregorian: date, hijri };
  }, [now.getDate(), isArabic]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <ScreenShell style={{ paddingTop: Math.max(insets.top, 10) }}>
      <PageHeader
        eyebrow={text('السلام عليكم', 'Peace be upon you')}
        title={t('appName')}
        subtitle={`${dates.gregorian}  ·  ${dates.hijri}`}
        right={<Pressable testID="location-selector" accessibilityLabel={text('تحديث الموقع', 'Refresh location')} style={[styles.locationButton, { alignItems: isArabic ? 'flex-end' : 'flex-start' }]} onPress={refreshLocation}><Feather name="map-pin" size={14} color={colors.primary} /><Text style={[styles.locationText, { color: colors.primary, textAlign: isArabic ? 'right' : 'left' }]}>{city}</Text></Pressable>}
      />

      <LinearGradient colors={[colors.hero, colors.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
        <View style={styles.heroOrb} />
        <View style={styles.heroTop}>
          <View>
            <Text style={[styles.heroOverline, { color: colors.heroMuted, textAlign: isArabic ? 'right' : 'left' }]}>{text('الصلاة القادمة', 'Next prayer')}</Text>
            <Text style={[styles.heroPrayer, { color: colors.cream, textAlign: isArabic ? 'right' : 'left' }]}>{isArabic ? nextPrayer.arabic : nextPrayer.english}</Text>
            <Text style={[styles.heroEnglish, { color: colors.heroMuted, textAlign: isArabic ? 'right' : 'left' }]}>{nextPrayer.time}</Text>
          </View>
          <View style={styles.moonMark}><Feather name="moon" size={21} color={colors.gold} /></View>
        </View>
        <View style={styles.heroBottom}>
          <Text style={[styles.heroCountdown, { color: colors.cream, textAlign: isArabic ? 'right' : 'left' }]}>{getCountdown(nextPrayer, now)}</Text>
          <View style={[styles.heroCaptionRow, { flexDirection: isArabic ? 'row' : 'row-reverse' }]}><View style={[styles.liveDot, { backgroundColor: colors.gold }]} /><Text style={[styles.heroCaption, { color: colors.heroMuted, textAlign: isArabic ? 'right' : 'left' }]}>{text('متبقي على الأذان', 'Time until adhan')}</Text></View>
        </View>
      </LinearGradient>

      <View style={styles.quickSection}>
        <SectionHeading title={text('الوصول السريع', 'Quick access')} action={text('كل الأدوات', 'All tools')} />
        <View style={styles.quickGrid}>
          <QuickAction icon="book-open" label={t('quran')} subtitle={text('تابع وردك', 'Continue your reading')} tone="teal" onPress={() => router.push('/quran')} />
          <QuickAction icon="compass" label={t('qibla')} subtitle={text('اتجاه الكعبة', 'Kaaba direction')} tone="gold" onPress={() => router.push('/qibla')} />
          <QuickAction icon="heart" label={t('adhkar')} subtitle={text('لحظتك اليومية', 'Your daily moment')} tone="rose" onPress={() => router.push('/adhkar')} />
          <QuickAction icon="repeat" label={t('tasbeeh')} subtitle={text('سبّح واطمئن', 'Remember and find peace')} tone="blue" onPress={() => router.push('/tasbih')} />
        </View>
      </View>

      <View style={styles.prayerSection}>
        <SectionHeading title={text('مواقيت الصلاة', 'Prayer times')} action={text('عرض الكل', 'View all')} />
        <View style={styles.prayerList}>
          {prayers.filter((prayer) => prayer.id !== 'sunrise').map((prayer) => (
            <PrayerRow key={prayer.id} prayer={prayer} active={prayer.id === nextPrayer.id} onPress={() => router.push('/prayer')} />
          ))}
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  locationButton: { alignItems: 'flex-end', gap: 4, maxWidth: 100, paddingTop: 3 },
  locationText: { fontSize: 10, fontWeight: '700', textAlign: 'right' },
  heroCard: { minHeight: 198, borderRadius: 28, padding: 22, overflow: 'hidden', justifyContent: 'space-between' },
  heroOrb: { position: 'absolute', width: 190, height: 190, borderRadius: 95, borderWidth: 1, borderColor: 'rgba(231,213,165,0.16)', right: -44, top: -46 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroOverline: { fontSize: 12, fontWeight: '600', textAlign: 'right', marginBottom: 8 },
  heroPrayer: { fontSize: 32, fontWeight: '700', textAlign: 'right', letterSpacing: -0.5 },
  heroEnglish: { fontSize: 12, textAlign: 'right', marginTop: 5 },
  moonMark: { width: 44, height: 44, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.10)', justifyContent: 'center', alignItems: 'center' },
  heroBottom: { alignItems: 'flex-end', gap: 4 },
  heroCountdown: { fontSize: 29, fontWeight: '700', letterSpacing: 1.2 },
  heroCaptionRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  heroCaption: { fontSize: 11 },
  quickSection: { gap: 14 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  prayerSection: { gap: 14 },
  prayerList: { gap: 9 },
});