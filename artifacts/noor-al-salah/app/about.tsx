import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PageHeader, ScreenShell, SectionHeading } from '@/components/NoorUI';
import { useColors } from '@/hooks/useColors';
import { useI18n } from '@/lib/i18n';

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
  const { isArabic } = useI18n();

  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <View style={[styles.infoIcon, { backgroundColor: colors.softTeal }]}>
        <Feather name={icon} size={17} color={colors.primary} />
      </View>
      <View style={[styles.infoCopy, { alignItems: isArabic ? 'flex-end' : 'flex-start' }]}>
        <Text style={[styles.infoLabel, { color: colors.mutedForeground, textAlign: isArabic ? 'right' : 'left' }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.foreground, textAlign: isArabic ? 'right' : 'left' }]}>{value}</Text>
      </View>
    </View>
  );
}

export default function AboutScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t, text, isArabic } = useI18n();

  return (
    <ScreenShell>
      <PageHeader
        eyebrow={t('appName')}
        title={t('about')}
        subtitle={text('تعرّف على التطبيق ومن يقف خلف تطويره وتصميمه', 'Learn about the app and the people behind its development and design')}
        right={
          <Pressable
            testID="about-back"
            accessibilityRole="button"
            accessibilityLabel={t('back')}
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && { opacity: 0.72 },
            ]}
          >
             <Feather name={isArabic ? 'arrow-right' : 'arrow-left'} size={19} color={colors.foreground} />
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
          {text('رفيقك الهادئ للصلاة والذكر، بتجربة عربية بسيطة وقريبة من القلب.', 'Your calm companion for prayer and remembrance, with a simple experience close to the heart.')}
        </Text>
      </View>

      <View style={styles.sectionBlock}>
        <SectionHeading title={text('حقوق التطبيق', 'App information')} />
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <AboutInfoRow icon="code" label={t('development')} value={t('developer')} />
          <AboutInfoRow icon="shield" label={text('الإصدار', 'Version')} value={`${t('appName')} · 1.0.0`} />
          <View style={styles.infoFooter}>
            <Feather name="heart" size={15} color={colors.gold} />
            <Text style={[styles.infoFooterText, { color: colors.mutedForeground }]}>{text('صُمّم بعناية ليكون قريباً من يومك', 'Designed with care to fit naturally into your day')}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.noteCard, { backgroundColor: colors.softGold, borderColor: colors.accent }]}>
        <View style={[styles.noteIcon, { backgroundColor: colors.card }]}>
          <Feather name="star" size={17} color={colors.accentForeground} />
        </View>
        <Text style={[styles.noteText, { color: colors.accentForeground, textAlign: isArabic ? 'right' : 'left' }]}>
          {text('نسأل الله أن يجعل نور الصلاة عوناً لك على المحافظة على صلاتك وذكرك.', 'May Noor Al-Salah help you keep your prayer and remembrance.')}
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