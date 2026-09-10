import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { quranSurahs } from '@/lib/quranData';

export default function QuranReader() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const index = Math.max(1, Math.min(114, Number(id) || 1));
  const surah = quranSurahs[index - 1];
  useEffect(() => { AsyncStorage.setItem('@noor/quran/last', String(index)).catch(() => undefined); }, [index]);
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
  basmala: { padding: 16, borderRadius: 18, alignItems: 'center' },
  basmalaText: { fontFamily: 'AmiriQuran_400Regular', fontSize: 22 },
  verse: { borderBottomWidth: 1, paddingVertical: 12 },
  verseText: { fontFamily: 'AmiriQuran_400Regular', fontSize: 24, lineHeight: 48, textAlign: 'right' },
  number: { fontSize: 14 },
});