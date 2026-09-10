import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { PageHeader, ScreenShell, SectionHeading } from '@/components/NoorUI';
import { useColors } from '@/hooks/useColors';
import { quranAttribution, quranSurahs } from '@/lib/quranData';

export default function QuranScreen() {
  const colors = useColors();
  const [search, setSearch] = useState('');
  const [bookmarked, setBookmarked] = useState<number[]>([]);
  const [lastRead, setLastRead] = useState(1);
  useEffect(() => { AsyncStorage.multiGet(['@noor/quran/bookmarks', '@noor/quran/last']).then(([b, l]) => { if (b[1]) setBookmarked(JSON.parse(b[1])); if (l[1]) setLastRead(Number(l[1])); }).catch(() => undefined); }, []);
  const visible = useMemo(() => quranSurahs.filter((s) => `${s.arabic} ${s.english}`.toLowerCase().includes(search.toLowerCase())), [search]);
  const last = quranSurahs[lastRead - 1] ?? quranSurahs[0];
  return <ScreenShell>
    <PageHeader eyebrow="وردك اليومي" title="القرآن الكريم" subtitle="النص العربي الكامل، محفوظ للعمل دون اتصال" right={<View style={[styles.mark, { backgroundColor: colors.softGold }]}><Text style={{ color: colors.accentForeground, fontSize: 27 }}>۞</Text></View>} />
    <Pressable testID="continue-reading" onPress={() => router.push(`/quran/${last.number}` as any)} style={[styles.continue, { backgroundColor: colors.hero }]}><View style={styles.copy}><Text style={{ color: colors.heroMuted, fontSize: 11 }}>متابعة القراءة</Text><Text style={{ color: colors.cream, fontSize: 24, fontWeight: '700' }}>{last.arabic}</Text><Text style={{ color: colors.heroMuted, fontSize: 11 }}>السورة رقم {last.number} · {last.totalVerses} آية</Text></View><View style={[styles.play, { backgroundColor: colors.gold }]}><Feather name="play" size={16} color={colors.hero} /></View></Pressable>
    <View style={styles.search}><Feather name="search" size={18} color={colors.mutedForeground} /><TextInput testID="quran-search" value={search} onChangeText={setSearch} placeholder="ابحث عن سورة" placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground }]} textAlign="right" /></View>
    <SectionHeading title="السور" action={`${visible.length} سورة`} />
    <View style={styles.list}>{visible.map((s) => <Pressable key={s.number} onPress={() => router.push(`/quran/${s.number}` as any)} style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.badge, { backgroundColor: colors.softTeal }]}><Text style={{ color: colors.primary }}>{s.number}</Text></View><View style={styles.copy}><Text style={[styles.arabic, { color: colors.foreground }]}>{s.arabic}</Text><Text style={{ color: colors.mutedForeground, fontSize: 10 }}>{s.english} · {s.type === 'meccan' ? 'مكية' : 'مدنية'} · {s.totalVerses} آيات</Text></View><Pressable testID={`bookmark-${s.number}`} onPress={(e) => { e.stopPropagation(); const next = bookmarked.includes(s.number) ? bookmarked.filter((n) => n !== s.number) : [...bookmarked, s.number]; setBookmarked(next); AsyncStorage.setItem('@noor/quran/bookmarks', JSON.stringify(next)).catch(() => undefined); }}><Feather name="bookmark" size={18} color={bookmarked.includes(s.number) ? colors.gold : colors.mutedForeground} /></Pressable></Pressable>)}</View>
    <Text style={[styles.attribution, { color: colors.mutedForeground }]}>{quranAttribution}</Text>
  </ScreenShell>;
}
const styles = StyleSheet.create({ mark: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }, continue: { minHeight: 112, borderRadius: 24, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, copy: { flex: 1, alignItems: 'flex-end', gap: 5 }, play: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' }, search: { minHeight: 50, borderRadius: 16, borderWidth: 1, borderColor: '#dce6df', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }, input: { flex: 1, minHeight: 48, fontSize: 14 }, list: { gap: 8 }, row: { minHeight: 68, borderRadius: 18, borderWidth: 1, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 11 }, badge: { width: 36, height: 36, borderRadius: 13, justifyContent: 'center', alignItems: 'center' }, arabic: { fontSize: 16, fontWeight: '700' }, attribution: { fontSize: 9, lineHeight: 14, textAlign: 'right' } });