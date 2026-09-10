import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { PageHeader, ScreenShell, SectionHeading } from '@/components/NoorUI';
import { useColors } from '@/hooks/useColors';
import { quranAttribution, quranSurahs } from '@/lib/quranData';
import { useI18n } from '@/lib/i18n';
import { quranEnglishAttribution } from '@/lib/quranEnglish';

export default function QuranScreen() {
  const colors = useColors();
  const { text, isArabic } = useI18n();
  const [search, setSearch] = useState('');
  const [bookmarked, setBookmarked] = useState<number[]>([]);
  const [lastRead, setLastRead] = useState(1);
  useEffect(() => { AsyncStorage.multiGet(['@noor/quran/bookmarks', '@noor/quran/last']).then(([b, l]) => { if (b[1]) setBookmarked(JSON.parse(b[1])); if (l[1]) setLastRead(Number(l[1])); }).catch(() => undefined); }, []);
  const visible = useMemo(() => quranSurahs.filter((s) => `${s.arabic} ${s.english}`.toLowerCase().includes(search.toLowerCase())), [search]);
  const last = quranSurahs[lastRead - 1] ?? quranSurahs[0];
  return <ScreenShell>
    <PageHeader eyebrow={text('وردك اليومي', 'Your daily reading')} title={text('القرآن الكريم', 'The Holy Quran')} subtitle={text('النص العربي الكامل، محفوظ للعمل دون اتصال', 'Complete Arabic text, available offline')} right={<View style={[styles.mark, { backgroundColor: colors.softGold }]}><Text style={{ color: colors.accentForeground, fontSize: 27 }}>۞</Text></View>} />
    <Pressable testID="continue-reading" onPress={() => router.push(`/quran/${last.number}` as any)} style={[styles.continue, { backgroundColor: colors.hero, flexDirection: isArabic ? 'row-reverse' : 'row' }]}><View style={[styles.copy, { alignItems: isArabic ? 'flex-end' : 'flex-start' }]}><Text style={{ color: colors.heroMuted, fontSize: 11, textAlign: isArabic ? 'right' : 'left' }}>{text('متابعة القراءة', 'Continue reading')}</Text><Text style={{ color: colors.cream, fontSize: 24, fontWeight: '700', textAlign: isArabic ? 'right' : 'left' }}>{isArabic ? last.arabic : last.english}</Text><Text style={{ color: colors.heroMuted, fontSize: 11, textAlign: isArabic ? 'right' : 'left' }}>{isArabic ? `السورة رقم ${last.number} · ${last.totalVerses} آية` : `Surah ${last.number} · ${last.totalVerses} verses`}</Text></View><View style={[styles.play, { backgroundColor: colors.gold }]}><Feather name="play" size={16} color={colors.hero} /></View></Pressable>
    <View style={styles.search}><Feather name="search" size={18} color={colors.mutedForeground} /><TextInput testID="quran-search" value={search} onChangeText={setSearch} placeholder={text('ابحث عن سورة', 'Search surahs')} placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground }]} textAlign={isArabic ? 'right' : 'left'} /></View>
    <SectionHeading title={text('السور', 'Surahs')} action={isArabic ? `${visible.length} سورة` : `${visible.length} surahs`} />
    <View style={styles.list}>{visible.map((s) => <Pressable key={s.number} accessibilityLabel={`${s.english}, ${s.totalVerses} verses`} onPress={() => router.push(`/quran/${s.number}` as any)} style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border, flexDirection: isArabic ? 'row' : 'row-reverse' }]}><View style={[styles.badge, { backgroundColor: colors.softTeal }]}><Text style={{ color: colors.primary }}>{s.number}</Text></View><View style={[styles.copy, { alignItems: isArabic ? 'flex-end' : 'flex-start' }]}><Text style={[styles.arabic, { color: colors.foreground, textAlign: isArabic ? 'right' : 'left' }]}>{isArabic ? s.arabic : s.english}</Text><Text style={{ color: colors.mutedForeground, fontSize: 10, textAlign: isArabic ? 'right' : 'left' }}>{isArabic ? `${s.english} · ${s.type === 'meccan' ? 'مكية' : 'مدنية'} · ${s.totalVerses} آيات` : `${s.type === 'meccan' ? 'Meccan' : 'Medinan'} · ${s.totalVerses} verses`}</Text></View><Pressable testID={`bookmark-${s.number}`} accessibilityLabel={text('حفظ السورة', 'Bookmark surah')} onPress={(e) => { e.stopPropagation(); const next = bookmarked.includes(s.number) ? bookmarked.filter((n) => n !== s.number) : [...bookmarked, s.number]; setBookmarked(next); AsyncStorage.setItem('@noor/quran/bookmarks', JSON.stringify(next)).catch(() => undefined); }}><Feather name="bookmark" size={18} color={bookmarked.includes(s.number) ? colors.gold : colors.mutedForeground} /></Pressable></Pressable>)}</View>
     <Text style={[styles.attribution, { color: colors.mutedForeground }]}>{isArabic ? quranAttribution : quranEnglishAttribution}</Text>
  </ScreenShell>;
}
const styles = StyleSheet.create({ mark: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }, continue: { minHeight: 112, borderRadius: 24, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, copy: { flex: 1, alignItems: 'flex-end', gap: 5 }, play: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' }, search: { minHeight: 50, borderRadius: 16, borderWidth: 1, borderColor: '#dce6df', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }, input: { flex: 1, minHeight: 48, fontSize: 14 }, list: { gap: 8 }, row: { minHeight: 68, borderRadius: 18, borderWidth: 1, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 11 }, badge: { width: 36, height: 36, borderRadius: 13, justifyContent: 'center', alignItems: 'center' }, arabic: { fontSize: 16, fontWeight: '700' }, attribution: { fontSize: 9, lineHeight: 14, textAlign: 'right' } });