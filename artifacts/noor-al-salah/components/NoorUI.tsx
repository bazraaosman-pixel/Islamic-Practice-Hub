import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useColors } from '@/hooks/useColors';
import type { Prayer } from '@/lib/prayerData';

type IconName = React.ComponentProps<typeof Feather>['name'];

export function ScreenShell({
  children,
  scroll = true,
  style,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useColors();
  return scroll ? (
    <ScrollView
      style={[styles.shell, { backgroundColor: colors.background }, style]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.shell, { backgroundColor: colors.background }, style]}>{children}</View>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  right,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={styles.pageHeader}>
      <View style={styles.pageHeaderCopy}>
        {eyebrow ? <Text style={[styles.eyebrow, { color: colors.primary }]}>{eyebrow}</Text> : null}
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>{title}</Text>
        {subtitle ? <Text style={[styles.pageSubtitle, { color: colors.mutedForeground }]}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  light = false,
}: {
  icon: IconName;
  onPress?: () => void;
  accessibilityLabel: string;
  light?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      testID={accessibilityLabel}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor: light ? 'rgba(255,255,255,0.12)' : colors.card, borderColor: light ? 'rgba(255,255,255,0.16)' : colors.border },
        pressed && styles.pressed,
      ]}
    >
      <Feather name={icon} size={19} color={light ? colors.cream : colors.foreground} />
    </Pressable>
  );
}

export function SectionHeading({ title, action }: { title: string; action?: string }) {
  const colors = useColors();
  return (
    <View style={styles.sectionHeading}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      {action ? <Text style={[styles.sectionAction, { color: colors.primary }]}>{action}</Text> : null}
    </View>
  );
}

export function PrayerRow({ prayer, active = false, onPress }: { prayer: Prayer; active?: boolean; onPress?: () => void }) {
  const colors = useColors();
  const iconColors: Record<Prayer['accent'], string> = {
    gold: colors.gold,
    teal: colors.primary,
    blue: '#6299bd',
    orange: '#d27d59',
    violet: '#8e87ba',
  };
  const iconNames: Record<Prayer['icon'], IconName> = {
    sunrise: 'sunrise',
    sun: 'sun',
    'cloud-sun': 'cloud',
    sunset: 'sunset',
    moon: 'moon',
  };
  return (
    <Pressable
      testID={`prayer-${prayer.id}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.prayerRow,
        { backgroundColor: active ? colors.softTeal : colors.card, borderColor: active ? colors.primary : colors.border },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.prayerIcon, { backgroundColor: active ? colors.primary : colors.muted }]}>
        <Feather name={iconNames[prayer.icon]} size={17} color={active ? colors.primaryForeground : iconColors[prayer.accent]} />
      </View>
      <View style={styles.prayerNames}>
        <Text style={[styles.prayerArabic, { color: colors.foreground }]}>{prayer.arabic}</Text>
        <Text style={[styles.prayerEnglish, { color: colors.mutedForeground }]}>{prayer.english}</Text>
      </View>
      {active ? <View style={[styles.nowPill, { backgroundColor: colors.primary }]}><Text style={[styles.nowPillText, { color: colors.primaryForeground }]}>القادم</Text></View> : null}
      <Text style={[styles.prayerTime, { color: colors.foreground }]}>{prayer.time}</Text>
      <Feather name="chevron-left" size={17} color={colors.mutedForeground} />
    </Pressable>
  );
}

export function QuickAction({
  icon,
  label,
  subtitle,
  onPress,
  tone = 'teal',
}: {
  icon: 'book-open' | 'compass' | 'heart' | 'repeat';
  label: string;
  subtitle: string;
  onPress: () => void;
  tone?: 'teal' | 'gold' | 'blue' | 'rose';
}) {
  const colors = useColors();
  const backgrounds = { teal: colors.softTeal, gold: colors.softGold, blue: '#e4eef3', rose: '#f3e5e2' };
  const foregrounds = { teal: colors.primary, gold: colors.accentForeground, blue: '#4d7892', rose: '#9e5e58' };
  return (
    <Pressable
      testID={`quick-${label}`}
      onPress={onPress}
      style={({ pressed }) => [styles.quickAction, { backgroundColor: backgrounds[tone] }, pressed && styles.pressed]}
    >
      <View style={[styles.quickIcon, { backgroundColor: colors.card }]}>
        <Feather name={icon} size={18} color={foregrounds[tone]} />
      </View>
      <Text style={[styles.quickLabel, { color: colors.foreground }]}>{label}</Text>
      <Text style={[styles.quickSubtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>
    </Pressable>
  );
}

export function StatChip({ icon, value, label }: { icon: IconName; value: string; label: string }) {
  const colors = useColors();
  return (
    <View style={[styles.statChip, { borderColor: colors.border, backgroundColor: colors.card }]}>
      <Feather name={icon} size={15} color={colors.primary} />
      <View>
        <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
      </View>
    </View>
  );
}

export function EmptyDataNote({ title, body, icon = 'info' }: { title: string; body: string; icon?: IconName | 'book-open-outline' }) {
  const colors = useColors();
  return (
    <View style={[styles.emptyNote, { backgroundColor: colors.softGold, borderColor: colors.accent }]}>
      <MaterialCommunityIcons name={icon === 'info' ? 'information-outline' : 'book-open-outline'} size={22} color={colors.accentForeground} />
      <View style={styles.emptyNoteCopy}>
        <Text style={[styles.emptyNoteTitle, { color: colors.accentForeground }]}>{title}</Text>
        <Text style={[styles.emptyNoteBody, { color: colors.accentForeground }]}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 120, gap: 22 },
  pageHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 },
  pageHeaderCopy: { flex: 1 },
  eyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 1.2, marginBottom: 7, textAlign: 'right' },
  pageTitle: { fontSize: 30, fontWeight: '700', letterSpacing: -0.7, textAlign: 'right' },
  pageSubtitle: { fontSize: 14, lineHeight: 21, marginTop: 8, textAlign: 'right' },
  iconButton: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 19, fontWeight: '700', textAlign: 'right' },
  sectionAction: { fontSize: 13, fontWeight: '600' },
  prayerRow: { minHeight: 70, paddingHorizontal: 13, borderWidth: 1, borderRadius: 18, flexDirection: 'row', alignItems: 'center', gap: 12 },
  prayerIcon: { width: 37, height: 37, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  prayerNames: { flex: 1, alignItems: 'flex-start' },
  prayerArabic: { fontSize: 16, fontWeight: '700' },
  prayerEnglish: { fontSize: 11, marginTop: 2 },
  prayerTime: { fontSize: 17, fontWeight: '700', letterSpacing: 0.2 },
  nowPill: { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 4 },
  nowPillText: { fontSize: 10, fontWeight: '700' },
  quickAction: { width: 142, minHeight: 116, borderRadius: 20, padding: 13, gap: 5 },
  quickIcon: { width: 34, height: 34, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  quickLabel: { fontSize: 15, fontWeight: '700', textAlign: 'right' },
  quickSubtitle: { fontSize: 11, textAlign: 'right' },
  statChip: { flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, flex: 1 },
  statValue: { fontSize: 15, fontWeight: '700' },
  statLabel: { fontSize: 10, marginTop: 2 },
  emptyNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 11, padding: 14, borderWidth: 1, borderRadius: 18 },
  emptyNoteCopy: { flex: 1, gap: 4 },
  emptyNoteTitle: { fontSize: 13, fontWeight: '700', textAlign: 'right' },
  emptyNoteBody: { fontSize: 12, lineHeight: 18, textAlign: 'right' },
});