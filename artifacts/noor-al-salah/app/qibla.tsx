import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenShell } from '@/components/NoorUI';
import { useColors } from '@/hooks/useColors';

export default function QiblaScreen() {
  const colors = useColors();
  return (
    <ScreenShell>
      <View style={styles.topBar}><Pressable testID="qibla-back" onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.card, borderColor: colors.border }]}><Feather name="arrow-right" size={19} color={colors.foreground} /></Pressable><View style={styles.titleCopy}><Text style={[styles.eyebrow, { color: colors.primary }]}>وجهتك أينما كنت</Text><Text style={[styles.title, { color: colors.foreground }]}>اتجاه القبلة</Text></View><View style={{ width: 42 }} /></View>
      <LinearGradient colors={[colors.hero, colors.primary]} start={{ x: 0.2, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.compassCard}>
        <View style={styles.compassGlow} />
        <Text style={[styles.compassEyebrow, { color: colors.heroMuted }]}>اتجاه مكة المكرمة</Text>
        <View style={styles.compass}><View style={[styles.ring, { borderColor: 'rgba(248,244,233,0.24)' }]} /><View style={[styles.ringSmall, { borderColor: 'rgba(248,244,233,0.18)' }]} /><Text style={[styles.north, { color: colors.gold }]}>N</Text><View style={[styles.needle, { backgroundColor: colors.gold }]} /><View style={[styles.needleTail, { backgroundColor: colors.cream }]} /><View style={[styles.centerDot, { backgroundColor: colors.cream, borderColor: colors.gold }]} /><Feather name="navigation" size={18} color={colors.cream} style={styles.navigationMark} /></View>
        <Text style={[styles.degree, { color: colors.cream }]}>136°</Text><Text style={[styles.degreeLabel, { color: colors.heroMuted }]}>جنوب شرق · من موقعك الحالي</Text>
      </LinearGradient>
      <View style={[styles.instructionCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.instructionIcon, { backgroundColor: colors.softGold }]}><Feather name="rotate-ccw" size={19} color={colors.accentForeground} /></View><View style={styles.instructionCopy}><Text style={[styles.instructionTitle, { color: colors.foreground }]}>للحصول على دقة أفضل</Text><Text style={[styles.instructionBody, { color: colors.mutedForeground }]}>حرّك هاتفك على شكل رقم ٨ لمعايرة البوصلة، وابتعد عن الأجهزة المعدنية.</Text></View></View>
      <View style={styles.footerNote}><Feather name="info" size={15} color={colors.mutedForeground} /><Text style={[styles.footerText, { color: colors.mutedForeground }]}>تحتاج البوصلة إلى الوصول لمستشعر الحركة في جهازك. سيتم تفعيل القراءة الحية في المرحلة التالية.</Text></View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  backButton: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  titleCopy: { alignItems: 'flex-end', flex: 1, gap: 4 },
  eyebrow: { fontSize: 11, fontWeight: '700' },
  title: { fontSize: 26, fontWeight: '700' },
  compassCard: { minHeight: 440, borderRadius: 30, alignItems: 'center', paddingTop: 24, overflow: 'hidden' },
  compassGlow: { position: 'absolute', width: 340, height: 340, borderRadius: 170, borderWidth: 1, borderColor: 'rgba(248,244,233,0.10)', top: 54 },
  compassEyebrow: { fontSize: 12, fontWeight: '600' },
  compass: { width: 285, height: 285, borderRadius: 150, borderWidth: 1, borderColor: 'rgba(248,244,233,0.25)', marginTop: 26, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 226, height: 226, borderRadius: 113, borderWidth: 1 },
  ringSmall: { position: 'absolute', width: 170, height: 170, borderRadius: 85, borderWidth: 1 },
  north: { position: 'absolute', top: 20, fontSize: 13, fontWeight: '700' },
  needle: { position: 'absolute', width: 3, height: 104, top: 39, borderRadius: 3, transform: [{ rotate: '43deg' }] },
  needleTail: { position: 'absolute', width: 3, height: 84, bottom: 49, borderRadius: 3, transform: [{ rotate: '43deg' }] },
  centerDot: { width: 19, height: 19, borderRadius: 10, borderWidth: 3, zIndex: 2 },
  navigationMark: { position: 'absolute', bottom: 30, right: 42, transform: [{ rotate: '43deg' }] },
  degree: { fontSize: 30, fontWeight: '700', marginTop: -8 },
  degreeLabel: { fontSize: 11, marginTop: 3 },
  instructionCard: { borderRadius: 21, borderWidth: 1, padding: 15, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  instructionIcon: { width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  instructionCopy: { flex: 1, gap: 4, alignItems: 'flex-end' },
  instructionTitle: { fontSize: 14, fontWeight: '700' },
  instructionBody: { fontSize: 11, lineHeight: 17, textAlign: 'right' },
  footerNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingHorizontal: 5 },
  footerText: { flex: 1, fontSize: 11, lineHeight: 17, textAlign: 'right' },
});