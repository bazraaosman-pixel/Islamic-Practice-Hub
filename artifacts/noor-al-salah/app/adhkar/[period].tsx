import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ScreenShell } from '@/components/NoorUI';
import { useColors } from '@/hooks/useColors';
import { AdhkarPeriod, adhkarSets, DhikrEntry, adhkarAttribution, adhkarCategoryCopy } from '@/lib/adhkarData';
import { useI18n } from '@/lib/i18n';
import { adhkarEnglishAttribution, adhkarEnglishByReference } from '@/lib/adhkarEnglishData';

type Counts = Record<string, number>;

function localDayKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const periodCopy: Record<AdhkarPeriod, { eyebrow: string; title: string; subtitle: string; icon: 'sunrise' | 'moon' }> = {
  morning: {
    eyebrow: 'بداية مباركة',
    title: 'أذكار الصباح',
    subtitle: 'ابدأ يومك بقلب حاضر ولسان ذاكر',
    icon: 'sunrise',
  },
  evening: {
    eyebrow: 'ختام هادئ',
    title: 'أذكار المساء',
    subtitle: 'اختم يومك بالسكينة والطمأنينة',
    icon: 'moon',
  },
  prayer: { eyebrow: 'بعد الفريضة', title: 'أذكار بعد الصلاة', subtitle: 'اذكر الله عقب كل فريضة', icon: 'moon' },
  sleep: { eyebrow: 'قبل النوم', title: 'أذكار النوم', subtitle: 'اختم يومك بذكر الله', icon: 'moon' },
};

export default function AdhkarDetailScreen() {
  const colors = useColors();
  const { text, isArabic } = useI18n();
  const params = useLocalSearchParams<{ period?: string }>();
  const period: AdhkarPeriod = params.period === 'evening' || params.period === 'prayer' || params.period === 'sleep' ? params.period : 'morning';
  const copy = periodCopy[period];
  const localizedCopy = {
    eyebrow: isArabic ? copy.eyebrow : (period === 'morning' ? 'A blessed beginning' : period === 'evening' ? 'A peaceful close' : period === 'prayer' ? 'After the obligatory prayer' : 'Before sleep'),
    title: isArabic ? copy.title : adhkarCategoryCopy[period].en,
    subtitle: isArabic ? copy.subtitle : (period === 'morning' ? 'Begin your day with a present heart' : period === 'evening' ? 'Close your day with peace and tranquility' : period === 'prayer' ? 'Remember Allah after every prayer' : 'End your day remembering Allah'),
  };
  const englishMeaning = (entry: DhikrEntry) => {
    const reference = Number(entry.source.match(/\((\d+)\)\s*$/)?.[1]);
    return adhkarEnglishByReference[reference]?.[0];
  };
  const entries = adhkarSets[period];
  const storageKey = `@noor-al-salah/adhkar/${period}`;
  const [counts, setCounts] = useState<Counts>({});
  const [dayKey, setDayKey] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const countsRef = useRef<Counts>({});
  const writeQueue = useRef(Promise.resolve());

  useEffect(() => {
    const today = localDayKey();
    setHydrated(false);
    countsRef.current = {};
    setCounts({});
    setDayKey(today);
    AsyncStorage.getItem(storageKey)
      .then((stored) => {
        if (!stored) return;
        const parsed = JSON.parse(stored) as { day?: string; counts?: Counts };
        if (parsed.day === today) {
          countsRef.current = parsed.counts ?? {};
          setCounts(countsRef.current);
        }
        else AsyncStorage.setItem(storageKey, JSON.stringify({ day: today, counts: {} })).catch(() => undefined);
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, [storageKey]);

  const totalDone = useMemo(
    () => entries.reduce((total, entry) => total + Math.min(counts[entry.id] ?? 0, entry.repeat), 0),
    [counts, entries],
  );
  const totalRepeats = useMemo(() => entries.reduce((total, entry) => total + entry.repeat, 0), [entries]);
  const progress = totalRepeats === 0 ? 0 : Math.round((totalDone / totalRepeats) * 100);

  const increment = (entry: DhikrEntry) => {
    if (!hydrated) return;
    const current = countsRef.current[entry.id] ?? 0;
    if (current >= entry.repeat) return;
    const nextCounts = { ...countsRef.current, [entry.id]: current + 1 };
    countsRef.current = nextCounts;
    setCounts(nextCounts);
    writeQueue.current = writeQueue.current.then(() => AsyncStorage.setItem(storageKey, JSON.stringify({ day: dayKey, counts: nextCounts }))).catch(() => undefined);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  };

  const switchPeriod = (next: AdhkarPeriod) => {
    router.replace({ pathname: '/adhkar-detail', params: { period: next } });
  };

  return (
    <ScreenShell>
      <View style={styles.topBar}>
        <Pressable testID="adhkar-detail-back" onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name={isArabic ? 'arrow-right' : 'arrow-left'} size={19} color={colors.foreground} />
        </Pressable>
         <View style={[styles.titleCopy, { alignItems: isArabic ? 'flex-end' : 'flex-start' }]}>
           <Text style={[styles.eyebrow, { color: colors.primary, textAlign: isArabic ? 'right' : 'left' }]}>{localizedCopy.eyebrow}</Text>
           <Text style={[styles.title, { color: colors.foreground, textAlign: isArabic ? 'right' : 'left' }]}>{localizedCopy.title}</Text>
        </View>
        <View style={[styles.headerIcon, { backgroundColor: colors.softGold }]}>
          <Feather name={copy.icon} size={19} color={colors.accentForeground} />
        </View>
      </View>

      <View style={[styles.switcher, { backgroundColor: colors.muted }]}>
        {(['morning', 'evening', 'prayer', 'sleep'] as AdhkarPeriod[]).map((item) => (
          <Pressable
            key={item}
            testID={`switch-${item}`}
            onPress={() => switchPeriod(item)}
            style={[styles.switchButton, period === item && { backgroundColor: colors.card }]}
          >
            <Feather name={item === 'morning' ? 'sunrise' : 'moon'} size={15} color={period === item ? colors.primary : colors.mutedForeground} />
             <Text style={[styles.switchText, { color: period === item ? colors.primary : colors.mutedForeground }]}>{isArabic ? (item === 'morning' ? 'الصباح' : item === 'evening' ? 'المساء' : item === 'prayer' ? 'بعد الصلاة' : 'النوم') : adhkarCategoryCopy[item].en}</Text>
          </Pressable>
        ))}
      </View>

      <LinearGradient colors={[colors.hero, colors.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
        <View style={styles.heroCircle} />
         <View style={[styles.heroCopy, { alignItems: isArabic ? 'flex-end' : 'flex-start' }]}>
           <Text style={[styles.heroLabel, { color: colors.heroMuted, textAlign: isArabic ? 'right' : 'left' }]}>{text('ورد اليوم', "Today's wird")}</Text>
           <Text style={[styles.heroTitle, { color: colors.cream, textAlign: isArabic ? 'right' : 'left' }]}>{localizedCopy.subtitle}</Text>
           <Text style={[styles.heroProgress, { color: colors.heroMuted }]}>{isArabic ? `${totalDone} من ${totalRepeats} تكراراً مكتمل` : `${totalDone} of ${totalRepeats} repetitions complete`}</Text>
        </View>
        <View style={[styles.progressCircle, { borderColor: colors.gold }]}>
          <Text style={[styles.progressValue, { color: colors.cream }]}>{progress}%</Text>
        </View>
      </LinearGradient>

      <View style={styles.sectionHeader}>
         <Text style={[styles.sectionTitle, { color: colors.foreground, textAlign: isArabic ? 'right' : 'left' }]}>{localizedCopy.title}</Text>
         <Text style={[styles.sectionCount, { color: colors.primary }]}>{isArabic ? `${entries.length} أذكار` : `${entries.length} supplications`}</Text>
      </View>

      <View style={styles.entries}>
        {entries.map((entry, index) => {
          const done = counts[entry.id] ?? 0;
          const isComplete = done >= entry.repeat;
          return (
            <Pressable
              key={entry.id}
              testID={`dhikr-${entry.id}`}
              onPress={() => increment(entry)}
              style={({ pressed }) => [
                styles.entryCard,
                { backgroundColor: colors.card, borderColor: isComplete ? colors.primary : colors.border },
                pressed && { opacity: 0.78, transform: [{ scale: 0.99 }] },
              ]}
            >
              <View style={[styles.entryNumber, { backgroundColor: isComplete ? colors.primary : colors.softTeal }]}>
                {isComplete ? <Feather name="check" size={15} color={colors.primaryForeground} /> : <Text style={[styles.entryNumberText, { color: colors.primary }]}>{index + 1}</Text>}
              </View>
              <View style={styles.entryCopy}>
                <Text style={[styles.entryArabic, { color: colors.foreground }]}>{entry.arabic}</Text>
                 <Text style={[styles.entryTranslation, { color: colors.mutedForeground, textAlign: isArabic ? 'right' : 'left', writingDirection: isArabic ? 'rtl' : 'ltr' }]}>{isArabic ? entry.translation : englishMeaning(entry)}</Text>
                  <Text style={[styles.sourceText, { color: colors.mutedForeground, textAlign: isArabic ? 'right' : 'left', writingDirection: isArabic ? 'rtl' : 'ltr' }]}>{isArabic ? entry.source : `Hisn al-Muslim · ${entry.source.match(/\((\d+)\)\s*$/)?.[1] ?? ''}`}</Text>
                <View style={styles.entryMeta}>
                   <Text style={[styles.tapHint, { color: colors.primary }]}>{isComplete ? text('تم بحمد الله', 'Completed, praise be to Allah') : text('اضغط للتكرار', 'Tap to repeat')}</Text>
                  <Text style={[styles.repeatText, { color: colors.mutedForeground }]}>{done} / {entry.repeat}</Text>
                </View>
              </View>
              <View style={[styles.repeatDot, { borderColor: isComplete ? colors.primary : colors.border }]}>
                <Text style={[styles.repeatDotText, { color: isComplete ? colors.primary : colors.mutedForeground }]}>{entry.repeat}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      <Pressable testID="reset-adhkar" onPress={() => { countsRef.current = {}; setCounts({}); writeQueue.current = writeQueue.current.then(() => AsyncStorage.setItem(storageKey, JSON.stringify({ day: dayKey, counts: {} }))).catch(() => undefined); }} style={[styles.resetButton, { borderColor: colors.border }]}>
         <Feather name="refresh-cw" size={14} color={colors.primary} /><Text style={[styles.resetText, { color: colors.primary }]}>{text('تصفير ورد اليوم', 'Reset today’s wird')}</Text>
      </Pressable>
       <Text style={[styles.attribution, { color: colors.mutedForeground, textAlign: isArabic ? 'right' : 'left' }]}>{isArabic ? adhkarAttribution : adhkarEnglishAttribution}</Text>

      <View style={[styles.footerNote, { backgroundColor: colors.softGold }]}>
        <Feather name="heart" size={15} color={colors.accentForeground} />
         <Text style={[styles.footerText, { color: colors.accentForeground, textAlign: isArabic ? 'right' : 'left' }]}>{text('اضغط على بطاقة الذكر لزيادة العداد، وسيُحفظ تقدمك تلقائياً على جهازك.', 'Tap a supplication card to increase the counter. Your progress is saved automatically.')}</Text>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  backButton: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  titleCopy: { alignItems: 'flex-end', flex: 1, gap: 4 },
  eyebrow: { fontSize: 11, fontWeight: '700' },
  title: { fontSize: 27, fontWeight: '700', letterSpacing: -0.5 },
  headerIcon: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  switcher: { borderRadius: 16, padding: 4, flexDirection: 'row', gap: 4 },
  switchButton: { flex: 1, minHeight: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 },
  switchText: { fontSize: 12, fontWeight: '700' },
  heroCard: { minHeight: 153, borderRadius: 25, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden' },
  heroCircle: { position: 'absolute', width: 200, height: 200, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(231,213,165,0.16)', right: -50, top: -66 },
  heroCopy: { flex: 1, alignItems: 'flex-end', gap: 5 },
  heroLabel: { fontSize: 11, fontWeight: '700' },
  heroTitle: { fontSize: 18, lineHeight: 27, fontWeight: '700', textAlign: 'right' },
  heroProgress: { fontSize: 11 },
  progressCircle: { width: 73, height: 73, borderRadius: 37, borderWidth: 4, alignItems: 'center', justifyContent: 'center' },
  progressValue: { fontSize: 17, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 19, fontWeight: '700', textAlign: 'right' },
  sectionCount: { fontSize: 12, fontWeight: '700' },
  entries: { gap: 10 },
  entryCard: { borderWidth: 1, borderRadius: 21, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  entryNumber: { width: 31, height: 31, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  entryNumberText: { fontSize: 12, fontWeight: '700' },
  entryCopy: { flex: 1, alignItems: 'flex-end', gap: 7 },
  entryArabic: { fontFamily: 'AmiriQuran_400Regular', fontSize: 20, lineHeight: 34, textAlign: 'right' },
  entryTranslation: { fontSize: 11, textAlign: 'right' },
  sourceText: { fontSize: 10, textAlign: 'right' },
  entryMeta: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tapHint: { fontSize: 10, fontWeight: '700' },
  repeatText: { fontSize: 11, fontWeight: '600' },
  repeatDot: { minWidth: 34, height: 34, borderRadius: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  repeatDotText: { fontSize: 11, fontWeight: '700' },
  footerNote: { borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  footerText: { flex: 1, fontSize: 11, lineHeight: 17, textAlign: 'right' },
  resetButton: { borderWidth: 1, borderRadius: 14, padding: 11, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 },
  resetText: { fontSize: 11, fontWeight: '700' },
  attribution: { fontSize: 9, lineHeight: 14, textAlign: 'right' },
});