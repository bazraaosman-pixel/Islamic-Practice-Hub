import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { quranSurahs } from '@/lib/quranData';
import { getSurahAudioUrl, sudaneseQaris } from '@/lib/quranAudio';

function formatTime(value: number) {
  const seconds = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export default function QuranReader() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const index = Math.max(1, Math.min(114, Number(id) || 1));
  const surah = quranSurahs[index - 1];
  const [qariId, setQariId] = useState(sudaneseQaris[0].id);
  const qari = sudaneseQaris.find((item) => item.id === qariId) ?? sudaneseQaris[0];
  const audioUrl = getSurahAudioUrl(qari, index);
  const player = useAudioPlayer(audioUrl, { updateInterval: 500 });
  const status = useAudioPlayerStatus(player);

  useEffect(() => { AsyncStorage.setItem('@noor/quran/last', String(index)).catch(() => undefined); }, [index]);
  useEffect(() => {
    AsyncStorage.getItem('@noor/quran/qari').then((stored) => {
      if (sudaneseQaris.some((item) => item.id === stored)) setQariId(stored as typeof qariId);
    }).catch(() => undefined);
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true }).catch(() => undefined);
  }, []);
  useEffect(() => {
    player.pause();
    player.replace(audioUrl);
  }, [audioUrl, player]);

  const selectQari = (nextId: typeof qariId) => {
    setQariId(nextId);
    AsyncStorage.setItem('@noor/quran/qari', nextId).catch(() => undefined);
  };

  const togglePlayback = () => {
    try {
      if (status.playing) {
        player.pause();
      } else {
        if (status.didJustFinish) player.seekTo(0).catch(() => undefined);
        player.play();
      }
    } catch {
      // Keep the reader usable if the stream is unavailable.
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 18) }]}>
      <FlatList
        data={surah.verses}
        keyExtractor={(verse) => String(verse.number)}
        initialNumToRender={10}
        maxToRenderPerBatch={12}
        windowSize={7}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.top}>
              <Pressable testID="quran-reader-back" onPress={() => router.back()} style={[styles.backButton, { borderColor: colors.border, backgroundColor: colors.card }]}>
                <Feather name="arrow-right" size={21} color={colors.foreground} />
              </Pressable>
              <View style={styles.heading}>
                <Text style={[styles.name, { color: colors.foreground }]}>{surah.arabic}</Text>
                <Text style={{ color: colors.mutedForeground }}>{surah.english} · {surah.totalVerses} آية</Text>
              </View>
            </View>
            <View style={[styles.audioCard, { backgroundColor: colors.hero }]}>
              <View style={styles.audioTitleRow}>
                <View style={styles.audioCopy}>
                  <Text style={[styles.audioTitle, { color: colors.cream }]}>استمع للسورة</Text>
                  <Text style={[styles.audioSubtitle, { color: colors.heroMuted }]}>{qari.name} · {qari.riwaya}</Text>
                </View>
                <Pressable testID="quran-audio-toggle" accessibilityRole="button" accessibilityLabel={status.playing ? 'إيقاف التلاوة مؤقتاً' : 'تشغيل التلاوة'} onPress={togglePlayback} style={[styles.playButton, { backgroundColor: colors.gold }]}>
                  <Feather name={status.playing ? 'pause' : 'play'} size={22} color={colors.hero} />
                </Pressable>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: colors.heroMuted }]}>
                <View style={[styles.progressFill, { backgroundColor: colors.gold, width: `${status.duration > 0 ? Math.min(100, (status.currentTime / status.duration) * 100) : 0}%` }]} />
              </View>
              <View style={styles.timeRow}>
                <Text style={[styles.timeText, { color: colors.heroMuted }]}>{formatTime(status.duration)}</Text>
                <Text style={[styles.timeText, { color: colors.heroMuted }]}>{status.isBuffering ? 'جارٍ التحميل…' : formatTime(status.currentTime)}</Text>
              </View>
              <View style={styles.qariList}>
                {sudaneseQaris.map((item) => (
                  <Pressable key={item.id} testID={`qari-${item.id}`} onPress={() => selectQari(item.id)} style={[styles.qariButton, { borderColor: qariId === item.id ? colors.gold : colors.heroMuted }, qariId === item.id && { backgroundColor: colors.softTeal }]}>
                    <Text numberOfLines={1} style={[styles.qariText, { color: qariId === item.id ? colors.cream : colors.heroMuted }]}>{item.name.replace('الشيخ ', '')}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={[styles.streamNote, { color: colors.heroMuted }]}>البث عبر MP3Quran · يحتاج اتصالاً بالإنترنت</Text>
            </View>
            {index !== 1 && index !== 9 ? <View style={[styles.basmala, { backgroundColor: colors.softGold }]}><Text style={[styles.basmalaText, { color: colors.accentForeground }]}>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</Text></View> : null}
          </View>
        }
        renderItem={({ item: verse }) => (
          <View style={[styles.verse, { borderColor: colors.border }]}>
            <Text style={[styles.verseText, { color: colors.foreground }]}>{verse.text} <Text style={[styles.number, { color: colors.primary }]}>﴿{verse.number}﴾</Text></Text>
          </View>
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 60 },
  header: { gap: 18, paddingBottom: 18 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  backButton: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  heading: { flex: 1, alignItems: 'flex-end', gap: 4 },
  name: { fontSize: 27, fontWeight: '700' },
  audioCard: { borderRadius: 22, padding: 16, gap: 10 },
  audioTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  audioCopy: { flex: 1, alignItems: 'flex-end', gap: 3 },
  audioTitle: { fontSize: 16, fontWeight: '700' },
  audioSubtitle: { fontSize: 10, textAlign: 'right' },
  playButton: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  progressTrack: { height: 4, borderRadius: 2, overflow: 'hidden', opacity: 0.55 },
  progressFill: { height: 4, borderRadius: 2 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  timeText: { fontSize: 9 },
  qariList: { flexDirection: 'row', gap: 5 },
  qariButton: { flex: 1, minWidth: 0, borderWidth: 1, borderRadius: 10, paddingHorizontal: 5, paddingVertical: 7, alignItems: 'center' },
  qariText: { fontSize: 8, fontWeight: '600' },
  streamNote: { fontSize: 9, textAlign: 'right' },
  basmala: { padding: 16, borderRadius: 18, alignItems: 'center' },
  basmalaText: { fontFamily: 'AmiriQuran_400Regular', fontSize: 22 },
  verse: { borderBottomWidth: 1, paddingVertical: 12 },
  verseText: { fontFamily: 'AmiriQuran_400Regular', fontSize: 24, lineHeight: 48, textAlign: 'right' },
  number: { fontSize: 14 },
});