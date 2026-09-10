import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PageHeader, ScreenShell, SectionHeading } from '@/components/NoorUI';
import { useColors } from '@/hooks/useColors';

function AboutInfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  value: string;
}) {
  const colors = useColors();

  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <View style={[styles.infoIcon, { backgroundColor: colors.softTeal }]}>
        <Feather name={icon} size={17} color={colors.primary} />
      </View>
      <View style={styles.infoCopy}>
        <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.foreground }]}>{value}</Text>
      </View>
    </View>
  );
}

export default function AboutScreen() {
  const colors = useColors();
  const router = useRouter();

  return (
    <ScreenShell>
      <PageHeader
        eyebrow="نور الصلاة"
        title="عن التطبيق"
        subtitle="تعرّف على التطبيق ومن يقف خلف تطويره وتصميمه"
        right={
          <Pressable
            testID="about-back"
            accessibilityRole="button"
            accessibilityLabel="العودة"
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && { opacity: 0.72 },
            ]}
          >
            <Feather name="arrow-right" size={19} color={colors.foreground} />
          </Pressable>
        }
      />

      <View style={[styles.brandCard, { backgroundColor: colors.hero }]}>
        <View style={[styles.brandMark, { backgroundColor: colors.gold }]}>
          <Feather name="moon" size={25} color={colors.hero} />
        </View>
        <Text style={[styles.brandArabic, { color: colors.cream }]}>نور الصلاة</Text>
        <Text style={[styles.brandEnglish, { color: colors.heroMuted }]}>Noor Al-Salah</Text>
        <Text style={[styles.brandDescription, { color: colors.heroMuted }]}>
          رفيقك الهادئ للصلاة والذكر، بتجربة عربية بسيطة وقريبة من القلب.
        </Text>
      </View>

      <View style={styles.sectionBlock}>
        <SectionHeading title="حقوق التطبيق" />
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <AboutInfoRow icon="code" label="التطوير والتصميم" value="المهندس والمطور/ بازرعه عثمان محمد علي" />
          <AboutInfoRow icon="shield" label="الإصدار" value="نور الصلاة · 1.0.0" />
          <View style={styles.infoFooter}>
            <Feather name="heart" size={15} color={colors.gold} />
            <Text style={[styles.infoFooterText, { color: colors.mutedForeground }]}>صُمّم بعناية ليكون قريباً من يومك</Text>
          </View>
        </View>
      </View>

      <View style={[styles.noteCard, { backgroundColor: colors.softGold, borderColor: colors.accent }]}>
        <View style={[styles.noteIcon, { backgroundColor: colors.card }]}>
          <Feather name="star" size={17} color={colors.accentForeground} />
        </View>
        <Text style={[styles.noteText, { color: colors.accentForeground }]}>
          نسأل الله أن يجعل نور الصلاة عوناً لك على المحافظة على صلاتك وذكرك.
        </Text>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  backButton: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  brandCard: { minHeight: 236, borderRadius: 27, padding: 24, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  brandMark: { width: 58, height: 58, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  brandArabic: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  brandEnglish: { fontSize: 13, fontWeight: '600', letterSpacing: 1.2, marginTop: 4 },
  brandDescription: { maxWidth: 280, fontSize: 13, lineHeight: 21, textAlign: 'center', marginTop: 16 },
  sectionBlock: { gap: 12 },
  infoCard: { borderRadius: 22, borderWidth: 1, paddingHorizontal: 15, overflow: 'hidden' },
  infoRow: { minHeight: 76, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoIcon: { width: 37, height: 37, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  infoCopy: { flex: 1, alignItems: 'flex-end', gap: 4 },
  infoLabel: { fontSize: 11, textAlign: 'right' },
  infoValue: { fontSize: 14, fontWeight: '700', textAlign: 'right', lineHeight: 21 },
  infoFooter: { minHeight: 51, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  infoFooterText: { fontSize: 11, textAlign: 'center' },
  noteCard: { borderRadius: 20, borderWidth: 1, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 11 },
  noteIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  noteText: { flex: 1, fontSize: 12, lineHeight: 20, textAlign: 'right' },
});