import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { EmptyDataNote, PageHeader, ScreenShell, SectionHeading } from '@/components/NoorUI';
import { useColors } from '@/hooks/useColors';
import { surahs } from '@/lib/prayerData';

export default function QuranScreen() {
  const colors = useColors();
  const [search, setSearch] = useState('');
  const [bookmarked, setBookmarked] = useState<number[]>([36]);
  const visibleSurahs = useMemo(() => surahs.filter((surah) => `${surah.arabic} ${surah.english}`.toLowerCase().includes(search.toLowerCase())), [search]);

  return (
    <ScreenShell>
      <PageHeader eyebrow="وردك اليومي" title="القرآن الكريم" subtitle="اقرأ بتدبر، واحفظ ما يلامس قلبك" right={<View style={[styles.quranMark, { backgroundColor: colors.softGold }]}><Text style={[styles.quranMarkText, { color: colors.accentForeground }]}>۞</Text></View>} />
      <Pressable testID="continue-reading" style={({ pressed }) => [styles.continueCard, { backgroundColor: colors.hero }, pressed && { opacity: 0.84 }]}>
        <View style={styles.continueCopy}><Text style={[styles.continueEyebrow, { color: colors.heroMuted }]}>متابعة القراءة</Text><Text style={[styles.continueTitle, { color: colors.cream }]}>سورة يس</Text><Text style={[styles.continueMeta, { color: colors.heroMuted }]}>الآية 12 من 83  ·  ١٥٪ مكتمل</Text></View>
        <View style={[styles.playButton, { backgroundColor: colors.gold }]}><Feather name="play" size={16} color={colors.hero} /></View>
      </Pressable>
      <View style={styles.progressTrack}><View style={[styles.progressValue, { backgroundColor: colors.gold, width: '15%' }]} /></View>
      <View style={styles.searchWrap}><Feather name="search" size={18} color={colors.mutedForeground} /><TextInput testID="quran-search" value={search} onChangeText={setSearch} placeholder="ابحث عن سورة" placeholderTextColor={colors.mutedForeground} style={[styles.searchInput, { color: colors.foreground }]} textAlign="right" /><Feather name="sliders" size={17} color={colors.mutedForeground} /></View>
      <View style={styles.surahHeader}><SectionHeading title="السور" action={`${visibleSurahs.length} سورة`} /></View>
      <View style={styles.surahList}>{visibleSurahs.map((surah) => { const isBookmarked = bookmarked.includes(surah.number); return <View key={surah.number} style={[styles.surahRow, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.numberBadge, { backgroundColor: colors.softTeal }]}><Text style={[styles.numberText, { color: colors.primary }]}>{surah.number}</Text></View><View style={styles.surahCopy}><Text style={[styles.surahArabic, { color: colors.foreground }]}>{surah.arabic}</Text><Text style={[styles.surahEnglish, { color: colors.mutedForeground }]}>{surah.english}  ·  {surah.place}  ·  {surah.ayahs} آيات</Text></View><Pressable testID={`bookmark-${surah.number}`} onPress={() => setBookmarked((current) => isBookmarked ? current.filter((number) => number !== surah.number) : [...current, surah.number])} style={styles.bookmarkButton}><Feather name="bookmark" size={18} color={isBookmarked ? colors.gold : colors.mutedForeground} /></Pressable></View>; })}</View>
      <EmptyDataNote title="نص القرآن الموثق قادم" body="سيتم ربط السور بنسخة عربية موثوقة ومحفوظة للعمل دون اتصال في المرحلة التالية." icon="book-open-outline" />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  quranMark: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  quranMarkText: { fontSize: 27 },
  continueCard: { minHeight: 118, borderRadius: 24, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  continueCopy: { alignItems: 'flex-end', gap: 4 },
  continueEyebrow: { fontSize: 11 },
  continueTitle: { fontSize: 25, fontWeight: '700' },
  continueMeta: { fontSize: 11 },
  playButton: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  progressTrack: { height: 5, backgroundColor: 'rgba(22,121,106,0.14)', borderRadius: 4, overflow: 'hidden', marginTop: -14 },
  progressValue: { height: '100%', borderRadius: 4 },
  searchWrap: { minHeight: 50, borderRadius: 16, borderWidth: 1, borderColor: '#dce6df', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchInput: { flex: 1, fontSize: 14, minHeight: 48 },
  surahHeader: { marginTop: -3 },
  surahList: { gap: 8 },
  surahRow: { minHeight: 68, borderRadius: 18, borderWidth: 1, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 11 },
  numberBadge: { width: 36, height: 36, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  numberText: { fontSize: 12, fontWeight: '700' },
  surahCopy: { flex: 1, alignItems: 'flex-end' },
  surahArabic: { fontSize: 16, fontWeight: '700' },
  surahEnglish: { fontSize: 10, marginTop: 4 },
  bookmarkButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
});