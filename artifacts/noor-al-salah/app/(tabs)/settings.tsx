import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PageHeader, ScreenShell } from '@/components/NoorUI';
import { useColors } from '@/hooks/useColors';
import { ThemePreference, usePreferences } from '@/context/PreferencesContext';

function SettingRow({ icon, title, subtitle, children, onPress }: { icon: React.ComponentProps<typeof Feather>['name']; title: string; subtitle?: string; children?: React.ReactNode; onPress?: () => void }) {
  const colors = useColors();
  return <Pressable testID={`setting-${title}`} onPress={onPress} style={({ pressed }) => [styles.settingRow, { borderBottomColor: colors.border }, pressed && { opacity: 0.7 }]}><View style={[styles.settingIcon, { backgroundColor: colors.softTeal }]}><Feather name={icon} size={17} color={colors.primary} /></View><View style={styles.settingCopy}><Text style={[styles.settingTitle, { color: colors.foreground }]}>{title}</Text>{subtitle ? <Text style={[styles.settingSubtitle, { color: colors.mutedForeground }]}>{subtitle}</Text> : null}</View>{children ?? <Feather name="chevron-left" size={17} color={colors.mutedForeground} />}</Pressable>;
}

export default function SettingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { theme, language, city, prayerNotifications, prayerNotificationsSupported, setTheme, setLanguage, setPrayerNotifications, refreshLocation, locationError, calculationMethod, setCalculationMethod, madhab, setMadhab } = usePreferences();
  const themeOptions: { key: ThemePreference; label: string }[] = [{ key: 'light', label: 'فاتح' }, { key: 'dark', label: 'داكن' }, { key: 'system', label: 'النظام' }];
  return (
    <ScreenShell>
      <PageHeader eyebrow="خصّص تجربتك" title="الإعدادات" subtitle="كل ما تحتاجه لتجعل نور الصلاة أقرب إليك" right={<View style={[styles.headerIcon, { backgroundColor: colors.softGold }]}><Feather name="sliders" size={19} color={colors.accentForeground} /></View>} />
      <View style={[styles.profileCard, { backgroundColor: colors.hero }]}><View style={[styles.profileIcon, { backgroundColor: colors.gold }]}><Feather name="moon" size={21} color={colors.hero} /></View><View style={styles.profileCopy}><Text style={[styles.profileTitle, { color: colors.cream }]}>أهلاً بك في نور الصلاة</Text><Text style={[styles.profileSubtitle, { color: colors.heroMuted }]}>رفيقك الهادئ لكل صلاة وذكر</Text></View></View>
      <View style={[styles.settingGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SettingRow icon="globe" title="اللغة" subtitle={language === 'ar' ? 'العربية' : 'English'}><View style={styles.languagePill}><Pressable testID="language-ar" onPress={() => setLanguage('ar')} style={[styles.languageOption, language === 'ar' && { backgroundColor: colors.primary }]}><Text style={[styles.languageText, { color: language === 'ar' ? colors.primaryForeground : colors.mutedForeground }]}>عربي</Text></Pressable><Pressable testID="language-en" onPress={() => setLanguage('en')} style={[styles.languageOption, language === 'en' && { backgroundColor: colors.primary }]}><Text style={[styles.languageText, { color: language === 'en' ? colors.primaryForeground : colors.mutedForeground }]}>EN</Text></Pressable></View></SettingRow>
        <SettingRow icon="moon" title="المظهر" subtitle={theme === 'system' ? 'حسب إعدادات الجهاز' : theme === 'dark' ? 'داكن' : 'فاتح'}><View style={styles.themePill}>{themeOptions.map((option) => <Pressable key={option.key} testID={`theme-${option.key}`} onPress={() => setTheme(option.key)} style={[styles.themeOption, theme === option.key && { backgroundColor: colors.primary }]}><Text style={[styles.themeText, { color: theme === option.key ? colors.primaryForeground : colors.mutedForeground }]}>{option.label}</Text></Pressable>)}</View></SettingRow>
         <SettingRow icon="map-pin" title="الموقع" subtitle={locationError ? 'السماح بالموقع مطلوب' : city} onPress={refreshLocation}><Feather name="refresh-cw" size={17} color={colors.mutedForeground} /></SettingRow>
        <SettingRow icon="bell" title="تنبيهات الصلاة" subtitle={!prayerNotificationsSupported ? 'غير متاحة داخل Expo Go' : prayerNotifications ? 'مفعّلة' : 'غير مفعّلة'}><Switch testID="prayer-notifications" disabled={!prayerNotificationsSupported} value={prayerNotifications} onValueChange={setPrayerNotifications} trackColor={{ false: colors.muted, true: colors.primary }} thumbColor={colors.cream} /></SettingRow>
      </View>
      <View style={[styles.settingGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
         <SettingRow icon="clock" title="طريقة الحساب" subtitle={calculationMethod === 'muslimWorldLeague' ? 'رابطة العالم الإسلامي' : calculationMethod} onPress={() => setCalculationMethod(calculationMethod === 'muslimWorldLeague' ? 'egyptian' : 'muslimWorldLeague')} />
         <SettingRow icon="sun" title="المذهب للعصر" subtitle={madhab === 'shafi' ? 'الشافعي' : 'الحنفي'} onPress={() => setMadhab(madhab === 'shafi' ? 'hanafi' : 'shafi')} />
        <SettingRow icon="compass" title="معايرة القبلة" subtitle="مساعدة واتجاه الجهاز" />
        <SettingRow icon="volume-2" title="صوت تنبيه الأذان" subtitle="أذان تقليدي مضمّن · يعمل في النسخة المثبّتة" />
      </View>
      <Pressable testID="about-app" onPress={() => router.push('/about')} style={({ pressed }) => [styles.aboutRow, { borderColor: colors.border, backgroundColor: colors.card }, pressed && { opacity: 0.72 }]}><Feather name="info" size={17} color={colors.primary} /><Text style={[styles.aboutText, { color: colors.foreground }]}>عن نور الصلاة</Text><Text style={[styles.version, { color: colors.mutedForeground }]}>v1.0.0</Text><Feather name="chevron-left" size={17} color={colors.mutedForeground} /></Pressable>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  headerIcon: { width: 44, height: 44, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  profileCard: { minHeight: 102, borderRadius: 23, padding: 17, flexDirection: 'row', alignItems: 'center', gap: 13 },
  profileIcon: { width: 50, height: 50, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  profileCopy: { flex: 1, alignItems: 'flex-end', gap: 5 },
  profileTitle: { fontSize: 16, fontWeight: '700' },
  profileSubtitle: { fontSize: 11 },
  settingGroup: { borderRadius: 21, borderWidth: 1, paddingHorizontal: 14, overflow: 'hidden' },
  settingRow: { minHeight: 68, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 11 },
  settingIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  settingCopy: { flex: 1, alignItems: 'flex-end', gap: 3 },
  settingTitle: { fontSize: 14, fontWeight: '700', textAlign: 'right' },
  settingSubtitle: { fontSize: 11, textAlign: 'right' },
  languagePill: { flexDirection: 'row', backgroundColor: '#edf2ed', borderRadius: 10, padding: 3, gap: 2 },
  languageOption: { minWidth: 35, paddingVertical: 5, paddingHorizontal: 7, borderRadius: 8, alignItems: 'center' },
  languageText: { fontSize: 10, fontWeight: '700' },
  themePill: { flexDirection: 'row', backgroundColor: '#edf2ed', borderRadius: 10, padding: 3, gap: 2 },
  themeOption: { paddingVertical: 5, paddingHorizontal: 7, borderRadius: 8 },
  themeText: { fontSize: 10, fontWeight: '700' },
  aboutRow: { minHeight: 55, borderWidth: 1, borderRadius: 17, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 11 },
  aboutText: { flex: 1, fontSize: 13, fontWeight: '700', textAlign: 'right' },
  version: { fontSize: 11 },
});