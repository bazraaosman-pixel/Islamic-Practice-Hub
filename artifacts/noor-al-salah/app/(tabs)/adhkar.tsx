import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PageHeader, QuickAction, ScreenShell, SectionHeading } from '@/components/NoorUI';
import { useColors } from '@/hooks/useColors';
import { adhkarCategories, adhkarSets, AdhkarPeriod } from '@/lib/adhkarData';
import { router } from 'expo-router';
import { useI18n } from '@/lib/i18n';
import { adhkarCategoryCopy } from '@/lib/adhkarData';

export default function AdhkarScreen() {
  const colors = useColors();
  const { t, text, isArabic } = useI18n();
  const [selected, setSelected] = useState<AdhkarPeriod>('morning');
  const selectedCategory = adhkarCategories.find((category) => category.id === selected) ?? adhkarCategories[0];
  const completed = 0;
  return (
    <ScreenShell>
      <PageHeader eyebrow={text('لحظات من السكينة', 'Moments of serenity')} title={t('adhkar')} subtitle={text('اجعل لسانك رطباً بذكر الله', 'Keep your tongue moist with the remembrance of Allah')} right={<View style={[styles.headerIcon, { backgroundColor: colors.softGold }]}><Feather name="heart" size={19} color={colors.accentForeground} /></View>} />
      <View style={[styles.todayCard, { backgroundColor: colors.softTeal, borderColor: colors.border }]}>
        <View style={[styles.todayCopy, { alignItems: isArabic ? 'flex-end' : 'flex-start' }]}><Text style={[styles.todayEyebrow, { color: colors.primary, textAlign: isArabic ? 'right' : 'left' }]}>{text('ورد اليوم', "Today's wird")}</Text><Text style={[styles.todayTitle, { color: colors.foreground, textAlign: isArabic ? 'right' : 'left' }]}>{text('خطوات صغيرة، أثر كبير', 'Small steps, lasting impact')}</Text><Text style={[styles.todaySubtitle, { color: colors.mutedForeground, textAlign: isArabic ? 'right' : 'left' }]}>{text(`أكملت ${completed} من 10 أذكار`, `${completed} of 10 supplications completed`)}</Text></View>
        <View style={[styles.progressCircle, { borderColor: colors.primary }]}><Text style={[styles.progressNumber, { color: colors.primary }]}>{completed * 10}%</Text></View>
      </View>
        <View style={styles.categoryGrid}>{adhkarCategories.map((category, index) => <Pressable key={category.id} testID={`adhkar-${category.id}`} accessibilityLabel={isArabic ? category.arabic : adhkarCategoryCopy[category.id].en} onPress={() => { setSelected(category.id); router.push({ pathname: '/adhkar-detail', params: { period: category.id } }); }} style={({ pressed }) => [styles.categoryCard, { backgroundColor: selected === category.id ? colors.primary : colors.card, borderColor: selected === category.id ? colors.primary : colors.border, alignItems: isArabic ? 'flex-end' : 'flex-start' }, pressed && { opacity: 0.78 }]}><View style={[styles.categoryIcon, { backgroundColor: selected === category.id ? 'rgba(255,255,255,0.14)' : colors.muted }]}><Feather name={category.icon === 'heart' ? 'heart' : category.icon === 'sunrise' ? 'sunrise' : 'moon'} size={17} color={selected === category.id ? colors.cream : [colors.primary, colors.gold, '#a05e57', '#7d78a5'][index]} /></View><Text style={[styles.categoryArabic, { color: selected === category.id ? colors.cream : colors.foreground, textAlign: isArabic ? 'right' : 'left' }]}>{isArabic ? category.arabic : adhkarCategoryCopy[category.id].en}</Text><Text style={[styles.categoryEnglish, { color: selected === category.id ? colors.heroMuted : colors.mutedForeground, textAlign: isArabic ? 'right' : 'left' }]}>{isArabic ? category.count : adhkarCategoryCopy[category.id].countEn} · {adhkarSets[category.id].length}</Text></Pressable>)}</View>
        <View style={styles.sectionBlock}><SectionHeading title={isArabic ? selectedCategory.arabic : adhkarCategoryCopy[selected].en} action={text('فتح الورد', 'Open wird')} /><Pressable testID="open-selected-adhkar" onPress={() => router.push({ pathname: '/adhkar-detail', params: { period: selected } })} style={[styles.reminderCard, { backgroundColor: colors.card, borderColor: colors.border, flexDirection: isArabic ? 'row' : 'row-reverse' }]}><View style={[styles.reminderQuote, { backgroundColor: colors.softGold }]}><Text style={[styles.quoteMark, { color: colors.gold }]}>“</Text></View><View style={[styles.reminderCopy, { alignItems: isArabic ? 'flex-end' : 'flex-start' }]}><Text style={[styles.reminderTitle, { color: colors.foreground, textAlign: isArabic ? 'right' : 'left' }]}>{isArabic ? selectedCategory.arabic : adhkarCategoryCopy[selected].en}</Text><Text style={[styles.reminderBody, { color: colors.mutedForeground, textAlign: isArabic ? 'right' : 'left' }]}>{text('افتح صفحة الورد وابدأ التكرار بهدوء، مع حفظ تقدمك على جهازك.', 'Open the wird and begin calmly; your progress is saved on this device.')}</Text></View><View style={[styles.completeButton, { backgroundColor: colors.primary }]}><Feather name={isArabic ? 'arrow-left' : 'arrow-right'} size={17} color={colors.primaryForeground} /></View></Pressable></View>
       <View style={styles.quickRow}><QuickAction icon="repeat" label={t('tasbeeh')} subtitle={text('عدادك الخاص', 'Your personal counter')} tone="blue" onPress={() => router.push('/tasbih')} /><View style={{ flex: 1 }} /></View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  headerIcon: { width: 44, height: 44, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  todayCard: { borderRadius: 24, borderWidth: 1, minHeight: 128, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  todayCopy: { alignItems: 'flex-end', gap: 5 },
  todayEyebrow: { fontSize: 11, fontWeight: '700' },
  todayTitle: { fontSize: 19, fontWeight: '700' },
  todaySubtitle: { fontSize: 11 },
  progressCircle: { width: 72, height: 72, borderRadius: 36, borderWidth: 5, alignItems: 'center', justifyContent: 'center' },
  progressNumber: { fontSize: 16, fontWeight: '700' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, justifyContent: 'space-between' },
  categoryCard: { width: '48%', minHeight: 112, borderRadius: 20, borderWidth: 1, padding: 13, gap: 6, alignItems: 'flex-end' },
  categoryIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  categoryArabic: { fontSize: 14, fontWeight: '700' },
  categoryEnglish: { fontSize: 10 },
  sectionBlock: { gap: 14 },
  reminderCard: { borderWidth: 1, borderRadius: 21, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12 },
  reminderQuote: { width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  quoteMark: { fontSize: 28, fontWeight: '700', lineHeight: 32 },
  reminderCopy: { flex: 1, alignItems: 'flex-end', gap: 4 },
  reminderTitle: { fontSize: 14, fontWeight: '700', textAlign: 'right' },
  reminderBody: { fontSize: 11, lineHeight: 17, textAlign: 'right' },
  completeButton: { width: 36, height: 36, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  quickRow: { flexDirection: 'row' },
});