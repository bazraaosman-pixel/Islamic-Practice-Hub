import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PageHeader, PrayerRow, ScreenShell, SectionHeading, StatChip } from '@/components/NoorUI';
import { useColors } from '@/hooks/useColors';
import { getNextPrayer, getPrayerTimes } from '@/lib/prayerData';
import { usePreferences } from '@/context/PreferencesContext';

export default function PrayerScreen() {
  const colors = useColors();
  const { city, location, calculationMethod, madhab } = usePreferences();
  const [selectedDay, setSelectedDay] = useState(0);
  const selectedDate = useMemo(() => { const date = new Date(); date.setDate(date.getDate() + selectedDay); return date; }, [selectedDay]);
  const prayers = useMemo(() => getPrayerTimes(location, selectedDate, calculationMethod, madhab), [location, calculationMethod, madhab, selectedDate]);
  const days = useMemo(() => [0, 1, 2].map((offset) => offset === 0 ? 'اليوم' : offset === 1 ? 'غداً' : new Intl.DateTimeFormat('ar-EG', { weekday: 'long' }).format(new Date(Date.now() + offset * 86400000))), []);
  const formattedDate = useMemo(() => new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long' }).format(selectedDate), [selectedDate]);
  const nextPrayer = selectedDay === 0 ? getNextPrayer(new Date(), prayers) : null;
  const methodLabel = calculationMethod === 'muslimWorldLeague' ? 'رابطة العالم الإسلامي' : calculationMethod === 'egyptian' ? 'الهيئة المصرية' : calculationMethod;

  return (
    <ScreenShell>
      <PageHeader eyebrow="مواقيت اليوم" title="الصلاة" subtitle={`${city}  ·  ${formattedDate}`} right={<Pressable testID="prayer-settings" onPress={() => router.push('/settings')} style={[styles.settingsCircle, { backgroundColor: colors.softTeal }]}><Feather name="sliders" size={18} color={colors.primary} /></Pressable>} />
      <View style={[styles.dayPicker, { backgroundColor: colors.muted }]}>
        {days.map((day, index) => <Pressable key={day} testID={`day-${index}`} onPress={() => setSelectedDay(index)} style={[styles.dayButton, selectedDay === index && { backgroundColor: colors.card }]}><Text style={[styles.dayText, { color: selectedDay === index ? colors.primary : colors.mutedForeground }]}>{day}</Text></Pressable>)}
      </View>
      <View style={styles.statsRow}>
         <StatChip icon="sunrise" value={prayers.find((p) => p.id === 'sunrise')?.time ?? '--:--'} label="الشروق" />
         <StatChip icon="sunset" value={prayers.find((p) => p.id === 'maghrib')?.time ?? '--:--'} label="الغروب" />
      </View>
      <View style={styles.listWrap}>
        <SectionHeading title="المواقيت" action="طريقة الحساب" />
        <View style={styles.methodLine}><View style={[styles.methodDot, { backgroundColor: colors.primary }]} /><Text style={[styles.methodText, { color: colors.mutedForeground }]}>{methodLabel} · العصر: {madhab === 'hanafi' ? 'الحنفي' : 'الشافعي'}</Text><Feather name="chevron-left" size={15} color={colors.mutedForeground} /></View>
         <View style={styles.prayerList}>{prayers.map((prayer) => <PrayerRow key={prayer.id} prayer={prayer} active={prayer.id === nextPrayer?.id} />)}</View>
      </View>
      <Pressable testID="open-qibla" onPress={() => router.push('/qibla')} style={({ pressed }) => [styles.qiblaBanner, { backgroundColor: colors.hero }, pressed && { opacity: 0.8 }]}>
        <View style={[styles.qiblaIcon, { backgroundColor: 'rgba(255,255,255,0.12)' }]}><Feather name="compass" size={20} color={colors.gold} /></View>
        <View style={styles.qiblaCopy}><Text style={[styles.qiblaTitle, { color: colors.cream }]}>تحقق من اتجاه القبلة</Text><Text style={[styles.qiblaSubtitle, { color: colors.heroMuted }]}>بوصلة دقيقة تساعدك أينما كنت</Text></View>
        <Feather name="arrow-left" size={18} color={colors.cream} />
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