import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PageHeader, PrayerRow, ScreenShell, SectionHeading, StatChip } from '@/components/NoorUI';
import { useColors } from '@/hooks/useColors';
import { getNextPrayer, getPrayerTimes } from '@/lib/prayerData';
import { usePreferences } from '@/context/PreferencesContext';
import { useI18n } from '@/lib/i18n';

export default function PrayerScreen() {
  const colors = useColors();
  const { city, location, calculationMethod, madhab } = usePreferences();
  const { text, isArabic, t } = useI18n();
  const [selectedDay, setSelectedDay] = useState(0);
  const selectedDate = useMemo(() => { const date = new Date(); date.setDate(date.getDate() + selectedDay); return date; }, [selectedDay]);
  const prayers = useMemo(() => getPrayerTimes(location, selectedDate, calculationMethod, madhab), [location, calculationMethod, madhab, selectedDate]);
  const days = useMemo(() => [0, 1, 2].map((offset) => offset === 0 ? text('اليوم', 'Today') : offset === 1 ? text('غداً', 'Tomorrow') : new Intl.DateTimeFormat(isArabic ? 'ar-EG' : 'en-US', { weekday: 'long' }).format(new Date(Date.now() + offset * 86400000))), [isArabic]);
  const formattedDate = useMemo(() => new Intl.DateTimeFormat(isArabic ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'long' }).format(selectedDate), [selectedDate, isArabic]);
  const nextPrayer = selectedDay === 0 ? getNextPrayer(new Date(), prayers) : null;
  const methodLabel = calculationMethod === 'muslimWorldLeague' ? text('رابطة العالم الإسلامي', 'Muslim World League') : calculationMethod === 'egyptian' ? text('الهيئة المصرية', 'Egyptian General Authority') : calculationMethod;

  return (
    <ScreenShell>
      <PageHeader eyebrow={text('مواقيت اليوم', "Today's times")} title={t('prayer')} subtitle={`${city}  ·  ${formattedDate}`} right={<Pressable testID="prayer-settings" accessibilityLabel={text('إعدادات الصلاة', 'Prayer settings')} onPress={() => router.push('/settings')} style={[styles.settingsCircle, { backgroundColor: colors.softTeal }]}><Feather name="sliders" size={18} color={colors.primary} /></Pressable>} />
      <View style={[styles.dayPicker, { backgroundColor: colors.muted }]}>
        {days.map((day, index) => <Pressable key={day} testID={`day-${index}`} onPress={() => setSelectedDay(index)} style={[styles.dayButton, selectedDay === index && { backgroundColor: colors.card }]}><Text style={[styles.dayText, { color: selectedDay === index ? colors.primary : colors.mutedForeground }]}>{day}</Text></Pressable>)}
      </View>
      <View style={styles.statsRow}>
         <StatChip icon="sunrise" value={prayers.find((p) => p.id === 'sunrise')?.time ?? '--:--'} label={text('الشروق', 'Sunrise')} />
         <StatChip icon="sunset" value={prayers.find((p) => p.id === 'maghrib')?.time ?? '--:--'} label={text('الغروب', 'Sunset')} />
      </View>
      <View style={styles.listWrap}>
         <SectionHeading title={text('المواقيت', 'Times')} action={text('طريقة الحساب', 'Calculation method')} />
         <View style={styles.methodLine}><View style={[styles.methodDot, { backgroundColor: colors.primary }]} /><Text style={[styles.methodText, { color: colors.mutedForeground, textAlign: isArabic ? 'right' : 'left' }]}>{methodLabel} · {text('العصر', 'Asr')}: {madhab === 'hanafi' ? text('الحنفي', 'Hanafi') : text('الشافعي', 'Shafi')}</Text><Feather name={isArabic ? 'chevron-left' : 'chevron-right'} size={15} color={colors.mutedForeground} /></View>
         <View style={styles.prayerList}>{prayers.map((prayer) => <PrayerRow key={prayer.id} prayer={prayer} active={prayer.id === nextPrayer?.id} />)}</View>
      </View>
      <Pressable testID="open-qibla" onPress={() => router.push('/qibla')} style={({ pressed }) => [styles.qiblaBanner, { backgroundColor: colors.hero }, pressed && { opacity: 0.8 }]}>
        <View style={[styles.qiblaIcon, { backgroundColor: 'rgba(255,255,255,0.12)' }]}><Feather name="compass" size={20} color={colors.gold} /></View>
         <View style={styles.qiblaCopy}><Text style={[styles.qiblaTitle, { color: colors.cream }]}>{text('تحقق من اتجاه القبلة', 'Check the Qibla direction')}</Text><Text style={[styles.qiblaSubtitle, { color: colors.heroMuted }]}>{text('بوصلة دقيقة تساعدك أينما كنت', 'An accurate compass to guide you anywhere')}</Text></View>
         <Feather name={isArabic ? 'arrow-left' : 'arrow-right'} size={18} color={colors.cream} />
      </Pressable>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  settingsCircle: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  dayPicker: { flexDirection: 'row', borderRadius: 16, padding: 4, gap: 4 },
  dayButton: { flex: 1, borderRadius: 12, alignItems: 'center', paddingVertical: 11 },
  dayText: { fontSize: 12, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 10 },
  listWrap: { gap: 14 },
  methodLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  methodDot: { width: 7, height: 7, borderRadius: 4 },
  methodText: { flex: 1, fontSize: 11, textAlign: 'right' },
  prayerList: { gap: 9 },
  qiblaBanner: { borderRadius: 22, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  qiblaIcon: { width: 42, height: 42, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  qiblaCopy: { flex: 1, gap: 3 },
  qiblaTitle: { fontSize: 14, fontWeight: '700', textAlign: 'right' },
  qiblaSubtitle: { fontSize: 11, textAlign: 'right' },
});