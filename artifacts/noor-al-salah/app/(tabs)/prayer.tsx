import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { PageHeader, PrayerRow, ScreenShell, SectionHeading, StatChip } from '@/components/NoorUI';
import { useColors } from '@/hooks/useColors';
import { getNextPrayer, getPrayerTimes } from '@/lib/prayerData';
import { usePreferences } from '@/context/PreferencesContext';
import { useI18n } from '@/lib/i18n';
import type { PrayerAlertConfig, SchedulablePrayer } from '@/lib/notifications';

export default function PrayerScreen() {
  const colors = useColors();
  const { city, location, calculationMethod, madhab, prayerAlertSettings, updatePrayerAlert } = usePreferences();
  const { text, isArabic, t } = useI18n();
  const [selectedDay, setSelectedDay] = useState(0);
  const [editingPrayer, setEditingPrayer] = useState<SchedulablePrayer | null>(null);
  const [draft, setDraft] = useState<PrayerAlertConfig | null>(null);
  const selectedDate = useMemo(() => { const date = new Date(); date.setDate(date.getDate() + selectedDay); return date; }, [selectedDay]);
  const prayers = useMemo(() => getPrayerTimes(location, selectedDate, calculationMethod, madhab), [location, calculationMethod, madhab, selectedDate]);
  const days = useMemo(() => [0, 1, 2].map((offset) => offset === 0 ? text('اليوم', 'Today') : offset === 1 ? text('غداً', 'Tomorrow') : new Intl.DateTimeFormat(isArabic ? 'ar-EG' : 'en-US', { weekday: 'long' }).format(new Date(Date.now() + offset * 86400000))), [isArabic]);
  const formattedDate = useMemo(() => new Intl.DateTimeFormat(isArabic ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'long' }).format(selectedDate), [selectedDate, isArabic]);
  const nextPrayer = selectedDay === 0 ? getNextPrayer(new Date(), prayers) : null;
  const methodLabel = calculationMethod === 'muslimWorldLeague' ? text('رابطة العالم الإسلامي', 'Muslim World League') : calculationMethod === 'egyptian' ? text('مجمع الفقه الإسلامي (السودان)', 'Islamic Fiqh Academy (Sudan)') : calculationMethod;
  const openAlert = (id: string) => {
    if (!(id in prayerAlertSettings)) return;
    const prayer = id as SchedulablePrayer;
    setEditingPrayer(prayer);
    setDraft({ ...prayerAlertSettings[prayer] });
  };
  const editingData = editingPrayer ? prayers.find((p) => p.id === editingPrayer) : null;

  return (
    <ScreenShell>
      <PageHeader eyebrow={text('مواقيت اليوم', "Today's times")} title={t('prayer')} subtitle={`${city}  ·  ${formattedDate}`} right={<Pressable testID="prayer-settings" accessibilityLabel={text('إعدادات الصلاة', 'Prayer settings')} onPress={() => router.push('/settings')} style={[styles.settingsCircle, { backgroundColor: colors.softTeal }]}><Feather name="sliders" size={18} color={colors.primary} /></Pressable>} />
       <View style={[styles.dayPicker, { backgroundColor: colors.muted, flexDirection: isArabic ? 'row-reverse' : 'row' }]}>
        {days.map((day, index) => <Pressable key={day} testID={`day-${index}`} onPress={() => setSelectedDay(index)} style={[styles.dayButton, selectedDay === index && { backgroundColor: colors.card }]}><Text style={[styles.dayText, { color: selectedDay === index ? colors.primary : colors.mutedForeground }]}>{day}</Text></Pressable>)}
      </View>
       <View style={[styles.statsRow, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}>
         <StatChip icon="sunrise" value={prayers.find((p) => p.id === 'sunrise')?.time ?? '--:--'} label={text('الشروق', 'Sunrise')} />
         <StatChip icon="sunset" value={prayers.find((p) => p.id === 'maghrib')?.time ?? '--:--'} label={text('الغروب', 'Sunset')} />
      </View>
      <View style={styles.listWrap}>
         <SectionHeading title={text('المواقيت', 'Times')} action={text('طريقة الحساب', 'Calculation method')} />
          <View style={[styles.methodLine, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}><View style={[styles.methodDot, { backgroundColor: colors.primary }]} /><Text style={[styles.methodText, { color: colors.mutedForeground, textAlign: isArabic ? 'right' : 'left', writingDirection: isArabic ? 'rtl' : 'ltr' }]}>{methodLabel} · {text('العصر', 'Asr')}: {madhab === 'hanafi' ? text('الحنفي', 'Hanafi') : text('الشافعي', 'Shafi')}</Text><Feather name={isArabic ? 'chevron-left' : 'chevron-right'} size={15} color={colors.mutedForeground} /></View>
           <View style={styles.prayerList}>{prayers.map((prayer) => <PrayerRow key={prayer.id} prayer={prayer} active={prayer.id === nextPrayer?.id} accessibilityLabel={text(`${prayer.arabic}، ${prayerAlertSettings[prayer.id as SchedulablePrayer]?.enabled ? 'التنبيه مفعّل' : 'التنبيه متوقف'}`, `${prayer.english}, alerts ${prayerAlertSettings[prayer.id as SchedulablePrayer]?.enabled ? 'on' : 'off'}`)} accessibilityHint={prayer.id === 'sunrise' ? undefined : text('اضغط لفتح إعدادات التنبيه', 'Double tap to open alert settings')} onPress={prayer.id === 'sunrise' ? undefined : () => openAlert(prayer.id)} />)}</View>
      </View>
       <Pressable testID="open-qibla" onPress={() => router.push('/qibla')} style={({ pressed }) => [styles.qiblaBanner, { backgroundColor: colors.hero, flexDirection: isArabic ? 'row-reverse' : 'row' }, pressed && { opacity: 0.8 }]}>
        <View style={[styles.qiblaIcon, { backgroundColor: 'rgba(255,255,255,0.12)' }]}><Feather name="compass" size={20} color={colors.gold} /></View>
          <View style={styles.qiblaCopy}><Text style={[styles.qiblaTitle, { color: colors.cream, textAlign: isArabic ? 'right' : 'left', writingDirection: isArabic ? 'rtl' : 'ltr' }]}>{text('تحقق من اتجاه القبلة', 'Check the Qibla direction')}</Text><Text style={[styles.qiblaSubtitle, { color: colors.heroMuted, textAlign: isArabic ? 'right' : 'left', writingDirection: isArabic ? 'rtl' : 'ltr' }]}>{text('بوصلة دقيقة تساعدك أينما كنت', 'An accurate compass to guide you anywhere')}</Text></View>
         <Feather name={isArabic ? 'arrow-left' : 'arrow-right'} size={18} color={colors.cream} />
      </Pressable>
     <Modal visible={editingPrayer !== null} transparent animationType="slide" accessibilityViewIsModal onRequestClose={() => setEditingPrayer(null)}>
       <View style={styles.modalBackdrop}><ScrollView contentContainerStyle={styles.sheet} style={{ backgroundColor: colors.card }} accessibilityLabel={text('إعدادات تنبيه الصلاة', 'Prayer alert settings')}>
         {editingData && draft ? <>
            <View style={[styles.sheetHeader, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}><Text style={[styles.sheetTitle, { color: colors.foreground, textAlign: isArabic ? 'right' : 'left', writingDirection: isArabic ? 'rtl' : 'ltr' }]}>{isArabic ? editingData.arabic : editingData.english}</Text><Pressable accessibilityRole="button" accessibilityLabel={text('إغلاق', 'Close')} onPress={() => setEditingPrayer(null)}><Feather name="x" size={20} color={colors.mutedForeground} /></Pressable></View>
            <View style={[styles.settingLine, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}><Text style={[styles.settingLabel, { color: colors.foreground, textAlign: isArabic ? 'right' : 'left', writingDirection: isArabic ? 'rtl' : 'ltr' }]}>{text('تفعيل التنبيه', 'Enable alert')}</Text><Switch accessibilityRole="switch" accessibilityLabel={text(`تنبيه صلاة ${editingData.arabic}`, `${editingData.english} alert`)} value={draft.enabled} onValueChange={(enabled) => setDraft({ ...draft, enabled })} /></View>
            <Text style={[styles.optionHeading, { color: colors.mutedForeground, textAlign: isArabic ? 'right' : 'left', writingDirection: isArabic ? 'rtl' : 'ltr' }]}>{text('صوت الأذان', 'Adhan sound')}</Text>
           <View accessibilityRole="radiogroup" accessibilityLabel={text('اختيار صوت الأذان', 'Choose adhan sound')}>{(['makkah', 'madinah', 'silent'] as const).map((sound) => { const labels = { makkah: ['أذان الحرم المكي', 'Makkah Adhan'], madinah: ['أذان الحرم المدني', 'Madinah Adhan'], silent: ['صامت', 'Silent'] }[sound]; return <Pressable key={sound} accessibilityRole="radio" accessibilityState={{ selected: draft.sound === sound }} accessibilityLabel={`${labels[0]} / ${labels[1]}`} onPress={() => setDraft({ ...draft, sound })} style={[styles.soundOption, { flexDirection: isArabic ? 'row-reverse' : 'row', borderColor: draft.sound === sound ? colors.primary : colors.border }]}><View style={[styles.radio, { borderColor: colors.primary }]}>{draft.sound === sound ? <View style={[styles.radioDot, { backgroundColor: colors.primary }]} /> : null}</View><Text style={[styles.soundText, { color: colors.foreground }]}>{text(labels[0], labels[1])}</Text></Pressable>; })}</View>
            <Text style={[styles.optionHeading, { color: colors.mutedForeground, textAlign: isArabic ? 'right' : 'left', writingDirection: isArabic ? 'rtl' : 'ltr' }]}>{text('التقديم أو التأخير بالدقائق', 'Adjust by minutes')}</Text>
           <View style={[styles.offsetRow, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}><Pressable accessibilityRole="button" accessibilityLabel={text('زيادة دقيقة', 'Increase one minute')} disabled={draft.offsetMinutes >= 30} onPress={() => setDraft({ ...draft, offsetMinutes: draft.offsetMinutes + 1 })} style={styles.stepButton}><Feather name="plus" size={18} color={colors.foreground} /></Pressable><Text style={[styles.offsetValue, { color: colors.foreground }]}>{draft.offsetMinutes > 0 ? '+' : ''}{draft.offsetMinutes} {text('دقيقة', 'min')}</Text><Pressable accessibilityRole="button" accessibilityLabel={text('إنقاص دقيقة', 'Decrease one minute')} disabled={draft.offsetMinutes <= -30} onPress={() => setDraft({ ...draft, offsetMinutes: draft.offsetMinutes - 1 })} style={styles.stepButton}><Feather name="minus" size={18} color={colors.foreground} /></Pressable></View>
           <Pressable accessibilityRole="button" accessibilityLabel={text('تم', 'Done')} onPress={() => { if (editingPrayer) updatePrayerAlert(editingPrayer, draft); setEditingPrayer(null); }} style={[styles.doneButton, { backgroundColor: colors.primary }]}><Text style={{ color: colors.primaryForeground, fontWeight: '700' }}>{text('تم', 'Done')}</Text></Pressable>
         </> : null}
       </ScrollView></View>
     </Modal>
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
   modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
   sheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 22, paddingBottom: 34, gap: 12 },
   sheetHeader: { alignItems: 'center', justifyContent: 'space-between' },
   sheetTitle: { fontSize: 22, fontWeight: '700' },
   settingLine: { alignItems: 'center', justifyContent: 'space-between', minHeight: 48 },
   settingLabel: { fontSize: 15, fontWeight: '600' },
   optionHeading: { fontSize: 12, fontWeight: '600', marginTop: 6 },
   soundOption: { minHeight: 48, borderWidth: 1, borderRadius: 14, alignItems: 'center', paddingHorizontal: 14, gap: 11 },
   soundText: { fontSize: 14, fontWeight: '600', flex: 1 },
   radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
   radioDot: { width: 10, height: 10, borderRadius: 5 },
   offsetRow: { alignItems: 'center', justifyContent: 'space-between', paddingVertical: 2 },
   stepButton: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
   offsetValue: { fontSize: 17, fontWeight: '700', writingDirection: 'ltr' },
   doneButton: { minHeight: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
});