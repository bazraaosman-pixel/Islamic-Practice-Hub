import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ScreenShell } from '@/components/NoorUI';
import { useColors } from '@/hooks/useColors';

function localDayKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function TasbihScreen() {
  const colors = useColors();
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [dhikr, setDhikr] = useState('سبحان الله');
  const [daily, setDaily] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const countRef = useRef(0);
  const dailyRef = useRef(0);
  const writeQueue = useRef(Promise.resolve());
  useEffect(() => { const day = localDayKey(); AsyncStorage.multiGet(['@noor-al-salah/tasbih', '@noor-al-salah/tasbih-target', '@noor-al-salah/tasbih-dhikr', `@noor-al-salah/tasbih-day-${day}`]).then((values) => { const map = Object.fromEntries(values); const savedCount = Math.max(0, Number(map['@noor-al-salah/tasbih']) || 0); const savedTarget = Number(map['@noor-al-salah/tasbih-target']) === 99 ? 99 : 33; const savedDaily = Math.max(0, Number(map[`@noor-al-salah/tasbih-day-${day}`]) || 0); countRef.current = Math.min(savedCount, savedTarget); dailyRef.current = savedDaily; setCount(countRef.current); setTarget(savedTarget); setDaily(savedDaily); if (map['@noor-al-salah/tasbih-dhikr']) setDhikr(map['@noor-al-salah/tasbih-dhikr']); }).catch(() => undefined).finally(() => setHydrated(true)); }, []);
  const increment = () => { if (!hydrated) return; const next = countRef.current >= target ? 0 : countRef.current + 1; const nextDaily = dailyRef.current + 1; countRef.current = next; dailyRef.current = nextDaily; setCount(next); setDaily(nextDaily); const day = localDayKey(); writeQueue.current = writeQueue.current.then(() => AsyncStorage.multiSet([['@noor-al-salah/tasbih', String(next)], [`@noor-al-salah/tasbih-day-${day}`, String(nextDaily)]])).catch(() => undefined); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined); };
  const reset = () => { countRef.current = 0; setCount(0); writeQueue.current = writeQueue.current.then(() => AsyncStorage.setItem('@noor-al-salah/tasbih', '0')).catch(() => undefined); };
  return (
    <ScreenShell scroll={false} style={styles.screen}>
      <View style={styles.topBar}><Pressable testID="tasbih-back" onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.card, borderColor: colors.border }]}><Feather name="arrow-right" size={19} color={colors.foreground} /></Pressable><View style={styles.titleCopy}><Text style={[styles.eyebrow, { color: colors.primary }]}>ذكرٌ يطمئن القلب</Text><Text style={[styles.title, { color: colors.foreground }]}>المسبحة</Text></View><View style={{ width: 42 }} /></View>
       <View style={styles.counterArea}><View style={[styles.outerCircle, { borderColor: colors.border }]}><View style={[styles.innerCircle, { backgroundColor: colors.softTeal, borderColor: colors.primary }]}><Text style={[styles.count, { color: colors.primary }]}>{count}</Text><Text style={[styles.target, { color: colors.mutedForeground }]}>من {target}</Text></View></View><Pressable onPress={() => { const next = dhikr === 'سبحان الله' ? 'الحمد لله' : 'سبحان الله'; setDhikr(next); AsyncStorage.setItem('@noor-al-salah/tasbih-dhikr', next); }}><Text style={[styles.dhikrLabel, { color: colors.foreground }]}>{dhikr}</Text></Pressable><Text style={[styles.instruction, { color: colors.mutedForeground }]}>اضغط للعد · جلسات اليوم: {daily}</Text></View>
       <View style={styles.controls}><Pressable testID="tasbih-reset" onPress={reset} style={[styles.resetButton, { borderColor: colors.border, backgroundColor: colors.card }]}><Feather name="rotate-ccw" size={17} color={colors.mutedForeground} /><Text style={[styles.resetText, { color: colors.foreground }]}>إعادة</Text></Pressable><Pressable testID="tasbih-increment" onPress={increment} style={({ pressed }) => [styles.addButton, { backgroundColor: colors.primary }, pressed && { transform: [{ scale: 0.97 }] }]}><Feather name="plus" size={29} color={colors.primaryForeground} /></Pressable><Pressable testID="tasbih-target" onPress={() => { const next = target === 33 ? 99 : 33; setTarget(next); AsyncStorage.setItem('@noor-al-salah/tasbih-target', String(next)); }} style={[styles.targetButton, { borderColor: colors.border, backgroundColor: colors.card }]}><Feather name="hash" size={17} color={colors.mutedForeground} /><Text style={[styles.resetText, { color: colors.foreground }]}>{target}</Text></Pressable></View>
       <View style={[styles.savedNote, { backgroundColor: colors.softGold }]}><Feather name="check-circle" size={16} color={colors.accentForeground} /><Text style={[styles.savedText, { color: colors.accentForeground }]}>يتم حفظ تقدمك تلقائياً على جهازك</Text></View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 20, justifyContent: 'flex-start' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 15 },
  backButton: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  titleCopy: { alignItems: 'flex-end', flex: 1, gap: 4 },
  eyebrow: { fontSize: 11, fontWeight: '700' },
  title: { fontSize: 26, fontWeight: '700' },
  counterArea: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  outerCircle: { width: 292, height: 292, borderRadius: 146, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  innerCircle: { width: 242, height: 242, borderRadius: 121, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  count: { fontSize: 67, fontWeight: '700', letterSpacing: -2 },
  target: { fontSize: 13, marginTop: -3 },
  dhikrLabel: { fontSize: 21, fontWeight: '700' },
  instruction: { fontSize: 12 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingBottom: 25 },
  resetButton: { minWidth: 78, height: 44, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 },
  targetButton: { minWidth: 78, height: 44, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 },
  resetText: { fontSize: 12, fontWeight: '700' },
  addButton: { width: 74, height: 74, borderRadius: 37, alignItems: 'center', justifyContent: 'center' },
  savedNote: { position: 'absolute', bottom: 20, alignSelf: 'center', borderRadius: 15, paddingHorizontal: 13, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 7 },
  savedText: { fontSize: 11, fontWeight: '600' },
});