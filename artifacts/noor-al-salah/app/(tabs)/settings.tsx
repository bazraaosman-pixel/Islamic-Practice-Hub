import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import * as DocumentPicker from 'expo-document-picker';
import { PageHeader, ScreenShell } from '@/components/NoorUI';
import { useColors } from '@/hooks/useColors';
import { ThemePreference, usePreferences } from '@/context/PreferencesContext';
import { ADHAN_AUDIO_ASSETS } from '@/lib/notifications';

function SettingRow({ icon, title, subtitle, children, onPress, language }: { icon: React.ComponentProps<typeof Feather>['name']; title: string; subtitle?: string; children?: React.ReactNode; onPress?: () => void; language: 'ar' | 'en' }) {
  const colors = useColors();
  return <Pressable accessibilityRole={onPress ? 'button' : undefined} accessibilityLabel={title} testID={`setting-${title}`} onPress={onPress} style={({ pressed }) => [styles.settingRow, { borderBottomColor: colors.border, flexDirection: language === 'ar' ? 'row-reverse' : 'row' }, pressed && { opacity: 0.7 }]}><View style={[styles.settingIcon, { backgroundColor: colors.softTeal }]}><Feather name={icon} size={17} color={colors.primary} /></View><View style={[styles.settingCopy, language === 'en' && styles.settingCopyEnglish]}><Text style={[styles.settingTitle, { color: colors.foreground }, language === 'en' && styles.englishText]}>{title}</Text>{subtitle ? <Text style={[styles.settingSubtitle, { color: colors.mutedForeground }, language === 'en' && styles.englishText]}>{subtitle}</Text> : null}</View>{children ?? <Feather name={language === 'ar' ? 'chevron-left' : 'chevron-right'} size={17} color={colors.mutedForeground} accessibilityLabel={language === 'ar' ? 'فتح' : 'Open'} />}</Pressable>;
}

export default function SettingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { theme, language, city, prayerNotifications, prayerNotificationsPending, prayerNotificationsError, prayerNotificationsSupported, setTheme, setLanguage, setPrayerNotifications, refreshLocation, locationError, calculationMethod, setCalculationMethod, madhab, setMadhab, adhan, setAdhan, customAdhan, setCustomAdhan } = usePreferences();
  const [previewError, setPreviewError] = useState<string | null>(null);
  const player = useAudioPlayer(adhan === 'custom' && customAdhan ? customAdhan.uri : ADHAN_AUDIO_ASSETS[adhan === 'custom' ? 'makkah' : adhan]);
  const playback = useAudioPlayerStatus(player);
  useEffect(() => {
    if (playback.error) setPreviewError(playback.error);
  }, [playback.error]);
  useEffect(() => () => {
    player.pause();
  }, [player]);
  const preview = () => {
    setPreviewError(null);
    void setAudioModeAsync({ playsInSilentMode: true }).catch((error) => setPreviewError(error instanceof Error ? error.message : 'Audio is unavailable'));
    try {
      if (playback.playing) player.pause();
      else {
        if (playback.didJustFinish) void player.seekTo(0);
        player.play();
      }
    } catch (error) { setPreviewError(error instanceof Error ? error.message : 'Audio is unavailable'); }
  };
  const chooseAdhan = (next: typeof adhan) => {
    player.pause();
    setAdhan(next);
  };
  const uploadCustomAdhan = async () => {
    setPreviewError(null);
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['audio/*', 'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-wav'], copyToCacheDirectory: true, multiple: false });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      const safeName = (asset.name || 'adhan-audio').replace(/[^a-zA-Z0-9._-]/g, '_');
      let persistentUri: string;
      if (Platform.OS === 'web') {
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        if (blob.size > 2_750_000) throw new Error(text('الحد الأقصى للملف ٢٫٧٥ ميجابايت على الويب', 'The web upload limit is 2.75 MB'));
        persistentUri = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('audio-read-failed'));
          reader.onerror = () => reject(reader.error ?? new Error('audio-read-failed'));
          reader.readAsDataURL(blob);
        });
      } else {
        const FileSystem = await import('expo-file-system/legacy');
        if (!FileSystem.documentDirectory) throw new Error(text('تعذر الوصول إلى مساحة تخزين التطبيق', 'App storage is unavailable'));
        persistentUri = `${FileSystem.documentDirectory}custom-adhan-${Date.now()}-${safeName}`;
        await FileSystem.copyAsync({ from: asset.uri, to: persistentUri });
      }
      const previousCustomAdhan = customAdhan;
      await setCustomAdhan({ uri: persistentUri, fileName: asset.name || safeName });
      if (previousCustomAdhan && !previousCustomAdhan.uri.startsWith('data:')) {
        const FileSystem = await import('expo-file-system/legacy');
        await FileSystem.deleteAsync(previousCustomAdhan.uri, { idempotent: true }).catch(() => undefined);
      }
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : text('تعذر استيراد الملف', 'Could not import audio'));
    }
  };
  const removeCustomAdhan = async () => {
    player.pause();
    const previousCustomAdhan = customAdhan;
    try {
      await setCustomAdhan(null);
      if (previousCustomAdhan && !previousCustomAdhan.uri.startsWith('data:')) {
        const FileSystem = await import('expo-file-system/legacy');
        await FileSystem.deleteAsync(previousCustomAdhan.uri, { idempotent: true }).catch(() => undefined);
      }
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : text('تعذر حذف الملف', 'Could not remove audio'));
    }
  };
  const isEnglish = language === 'en';
  const themeOptions: { key: ThemePreference; label: string }[] = [{ key: 'light', label: isEnglish ? 'Light' : 'فاتح' }, { key: 'dark', label: isEnglish ? 'Dark' : 'داكن' }, { key: 'system', label: isEnglish ? 'System' : 'النظام' }];
  const text = (ar: string, en: string) => isEnglish ? en : ar;
  const openCalculationMethodPicker = () => {
    Alert.alert(
      text('طريقة حساب مواقيت الصلاة', 'Prayer time calculation method'),
      text('اختر الطريقة التي تريد استخدامها لحساب مواقيت الصلاة.', 'Choose the method used to calculate prayer times.'),
      [
        { text: text('رابطة العالم الإسلامي', 'Muslim World League'), onPress: () => setCalculationMethod('muslimWorldLeague') },
        { text: text('الهيئة المصرية العامة للمساحة', 'Egyptian General Authority of Survey'), onPress: () => setCalculationMethod('egyptian') },
        { text: text('إلغاء', 'Cancel'), style: 'cancel' },
      ],
    );
  };
  const openMadhabPicker = () => {
    Alert.alert(
      text('المذهب لحساب صلاة العصر', 'Asr juristic method'),
      text('اختر طريقة حساب وقت صلاة العصر.', 'Choose the method used to calculate the Asr prayer time.'),
      [
        { text: text('الشافعي', 'Shafi'), onPress: () => setMadhab('shafi') },
        { text: text('الحنفي', 'Hanafi'), onPress: () => setMadhab('hanafi') },
        { text: text('إلغاء', 'Cancel'), style: 'cancel' },
      ],
    );
  };
  const openQiblaCalibration = () => {
    Alert.alert(
      text('معايرة القبلة', 'Qibla calibration'),
      text(
        'حرّك هاتفك على شكل الرقم ٨ بعيداً عن المعادن، ثم افتح بوصلة القبلة للتحقق من الاتجاه.',
        'Move your phone in a figure-eight away from metal objects, then open the Qibla compass to verify the direction.',
      ),
      [
        { text: text('فتح بوصلة القبلة', 'Open Qibla compass'), onPress: () => router.push('/qibla') },
        { text: text('إلغاء', 'Cancel'), style: 'cancel' },
      ],
    );
  };
  return (
    <ScreenShell>
      <PageHeader eyebrow={text('خصّص تجربتك', 'MAKE IT YOURS')} title={text('الإعدادات', 'Settings')} subtitle={text('كل ما تحتاجه لتجعل نور الصلاة أقرب إليك', 'Everything you need to make Noor Al-Salah yours')} right={<View style={[styles.headerIcon, { backgroundColor: colors.softGold }]}><Feather name="sliders" size={19} color={colors.accentForeground} /></View>} />
      <View style={[styles.profileCard, { backgroundColor: colors.hero, flexDirection: isEnglish ? 'row' : 'row-reverse' }]}><View style={[styles.profileIcon, { backgroundColor: colors.gold }]}><Feather name="moon" size={21} color={colors.hero} /></View><View style={[styles.profileCopy, isEnglish && styles.profileCopyEnglish]}><Text style={[styles.profileTitle, { color: colors.cream }]}>{text('أهلاً بك في نور الصلاة', 'Welcome to Noor Al-Salah')}</Text><Text style={[styles.profileSubtitle, { color: colors.heroMuted }]}>{text('رفيقك الهادئ لكل صلاة وذكر', 'Your calm companion for every prayer and remembrance')}</Text></View></View>
      <View style={[styles.settingGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
         <SettingRow language={language} icon="globe" title={text('اللغة', 'Language')} subtitle={language === 'ar' ? 'العربية' : 'English'}><View style={[styles.languagePill, { flexDirection: isEnglish ? 'row' : 'row-reverse' }]}><Pressable accessibilityLabel="العربية" testID="language-ar" onPress={() => setLanguage('ar')} style={[styles.languageOption, language === 'ar' && { backgroundColor: colors.primary }]}><Text style={[styles.languageText, { color: language === 'ar' ? colors.primaryForeground : colors.mutedForeground }]}>عربي</Text></Pressable><Pressable accessibilityLabel="English" testID="language-en" onPress={() => setLanguage('en')} style={[styles.languageOption, language === 'en' && { backgroundColor: colors.primary }]}><Text style={[styles.languageText, { color: language === 'en' ? colors.primaryForeground : colors.mutedForeground }]}>EN</Text></Pressable></View></SettingRow>
         <SettingRow language={language} icon="moon" title={text('المظهر', 'Appearance')} subtitle={theme === 'system' ? text('حسب إعدادات الجهاز', 'System default') : theme === 'dark' ? text('داكن', 'Dark') : text('فاتح', 'Light')}><View style={[styles.themePill, { flexDirection: isEnglish ? 'row' : 'row-reverse' }]}>{themeOptions.map((option) => <Pressable key={option.key} accessibilityLabel={option.label} testID={`theme-${option.key}`} onPress={() => setTheme(option.key)} style={[styles.themeOption, theme === option.key && { backgroundColor: colors.primary }]}><Text style={[styles.themeText, { color: theme === option.key ? colors.primaryForeground : colors.mutedForeground }]}>{option.label}</Text></Pressable>)}</View></SettingRow>
          <SettingRow language={language} icon="map-pin" title={text('الموقع', 'Location')} subtitle={locationError ? text('السماح بالموقع مطلوب', 'Location permission is required') : city} onPress={refreshLocation}><Feather name="refresh-cw" size={17} color={colors.mutedForeground} accessibilityLabel={text('تحديث الموقع', 'Refresh location')} /></SettingRow>
         <SettingRow language={language} icon="bell" title={text('تنبيهات الصلاة', 'Prayer notifications')} subtitle={!prayerNotificationsSupported ? text('غير متاحة داخل Expo Go', 'Unavailable in Expo Go') : prayerNotificationsPending ? text('جارٍ التفعيل…', 'Enabling…') : prayerNotificationsError ? text('تعذر جدولة التنبيهات', 'Could not schedule notifications') : prayerNotifications ? text('مفعّلة', 'Enabled') : text('غير مفعّلة', 'Disabled')}><Switch accessibilityLabel={text('تنبيهات الصلاة', 'Prayer notifications')} testID="prayer-notifications" disabled={!prayerNotificationsSupported || prayerNotificationsPending} value={prayerNotifications} onValueChange={setPrayerNotifications} trackColor={{ false: colors.muted, true: colors.primary }} thumbColor={colors.cream} /></SettingRow>
         {prayerNotificationsError ? <Text accessibilityRole="alert" style={[styles.notificationError, { color: colors.accentForeground, textAlign: isEnglish ? 'left' : 'right' }]}>{text('تعذر تفعيل تنبيهات الصلاة. حاول مرة أخرى.', 'Prayer notifications could not be enabled. Please try again.')}</Text> : null}
      </View>
      <View style={[styles.settingGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
           <SettingRow language={language} icon="clock" title={text('طريقة الحساب', 'Calculation method')} subtitle={calculationMethod === 'muslimWorldLeague' ? text('رابطة العالم الإسلامي', 'Muslim World League') : text('الهيئة المصرية العامة للمساحة', 'Egyptian General Authority of Survey')} onPress={openCalculationMethodPicker} />
           <SettingRow language={language} icon="sun" title={text('المذهب للعصر', 'Asr juristic method')} subtitle={madhab === 'shafi' ? text('الشافعي', 'Shafi') : text('الحنفي', 'Hanafi')} onPress={openMadhabPicker} />
          <SettingRow language={language} icon="compass" title={text('معايرة القبلة', 'Qibla calibration')} subtitle={text('مساعدة واتجاه الجهاز', 'Device guidance and direction')} onPress={openQiblaCalibration} />
           <View style={styles.adhanBlock}>
             <View style={[styles.adhanHeading, { flexDirection: isEnglish ? 'row' : 'row-reverse' }]}>
               <View style={[styles.settingIcon, { backgroundColor: colors.softTeal }]}><Feather name="volume-2" size={17} color={colors.primary} /></View>
               <View style={[styles.settingCopy, isEnglish && styles.settingCopyEnglish]}>
                 <Text style={[styles.settingTitle, { color: colors.foreground }, isEnglish && styles.englishText]}>{text('صوت الأذان', 'Adhan sound')}</Text>
                 <Text style={[styles.settingSubtitle, { color: colors.mutedForeground }, isEnglish && styles.englishText]}>{text('اختر المؤذن واستمع للمعاينة', 'Choose a Muezzin sound and preview it')}</Text>
               </View>
             </View>
             <View accessibilityRole="radiogroup" accessibilityLabel={text('اختيار صوت المؤذن', 'Muezzin sound selection')} style={[styles.adhanChoices, { flexDirection: isEnglish ? 'row' : 'row-reverse' }]}>
              {(['makkah', 'madinah', 'custom'] as const).map((choice) => (
                 <Pressable key={choice} accessibilityRole="radio" accessibilityState={{ selected: adhan === choice }} accessibilityLabel={choice === 'makkah' ? text('أذان الحرم المكي', 'Makkah Adhan') : choice === 'madinah' ? text('أذان الحرم المدني', 'Madinah Adhan') : text('ملف صوتي مخصص', 'Custom audio')} testID={`adhan-${choice}`} onPress={() => choice !== 'custom' || customAdhan ? chooseAdhan(choice) : uploadCustomAdhan()} style={[styles.adhanOption, adhan === choice && { backgroundColor: colors.primary }]}>
                    <Text numberOfLines={1} style={[styles.adhanText, { color: adhan === choice ? colors.primaryForeground : colors.mutedForeground }]}>{choice === 'makkah' ? text('الحرم المكي', 'Makkah') : choice === 'madinah' ? text('الحرم المدني', 'Madinah') : customAdhan?.fileName || text('رفع ملف', 'Upload')}</Text>
                </Pressable>
              ))}
             </View>
             <View style={[styles.adhanControls, { flexDirection: isEnglish ? 'row' : 'row-reverse' }]}>
               {customAdhan ? <View style={[styles.customActions, { flexDirection: isEnglish ? 'row' : 'row-reverse' }]}><Pressable accessibilityRole="button" accessibilityLabel={text('استبدال الملف', 'Replace file')} onPress={uploadCustomAdhan} style={styles.actionButton}><Text style={[styles.actionText, { color: colors.primary }]}>{text('استبدال', 'Replace')}</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={text('حذف الملف', 'Remove file')} onPress={removeCustomAdhan} style={styles.actionButton}><Text style={[styles.actionText, { color: colors.accentForeground }]}>{text('حذف', 'Remove')}</Text></Pressable></View> : <View />}
              <Pressable accessibilityRole="button" accessibilityLabel={playback.playing ? text('إيقاف المعاينة', 'Pause preview') : text('تشغيل المعاينة', 'Preview')} testID="adhan-preview" onPress={preview} style={[styles.previewButton, { borderColor: colors.border }]}>
               <Feather name={playback.playing ? 'pause' : 'play'} size={14} color={colors.primary} />
               <Text style={[styles.previewText, { color: colors.primary }]}>{playback.playing ? text('إيقاف', 'Pause') : text('معاينة', 'Preview')}</Text>
             </Pressable>
           </View>
             {adhan === 'custom' ? <Text style={[styles.customNote, { color: colors.mutedForeground, textAlign: isEnglish ? 'left' : 'right', writingDirection: isEnglish ? 'ltr' : 'rtl' }]}>{text('تستخدم المعاينة الملف المرفوع، أما إشعارات الصلاة فتستخدم أذان الحرم المكي المضمّن.', 'Preview uses your uploaded file. Prayer notifications use the bundled Makkah sound.')}</Text> : null}
             {previewError ? <Text accessibilityRole="alert" style={[styles.previewError, { color: colors.accentForeground, textAlign: isEnglish ? 'left' : 'right', writingDirection: isEnglish ? 'ltr' : 'rtl' }]}>{text('تعذر تشغيل المعاينة', 'Preview unavailable')}: {previewError}</Text> : null}
           </View>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={text('عن نور الصلاة', 'About Noor Al-Salah')} testID="about-app" onPress={() => router.push('/about')} style={({ pressed }) => [styles.aboutRow, { borderColor: colors.border, backgroundColor: colors.card, flexDirection: isEnglish ? 'row' : 'row-reverse' }, pressed && { opacity: 0.72 }]}><Feather name="info" size={17} color={colors.primary} /><Text style={[styles.aboutText, { color: colors.foreground }, isEnglish && styles.englishText]}>{text('عن نور الصلاة', 'About Noor Al-Salah')}</Text><Text style={[styles.version, { color: colors.mutedForeground }]}>v1.0.0</Text><Feather name={isEnglish ? 'chevron-right' : 'chevron-left'} size={17} color={colors.mutedForeground} /></Pressable>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  headerIcon: { width: 44, height: 44, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  profileCard: { minHeight: 102, borderRadius: 23, padding: 17, flexDirection: 'row', alignItems: 'center', gap: 13 },
  profileIcon: { width: 50, height: 50, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  profileCopy: { flex: 1, alignItems: 'flex-end', gap: 5 },
  profileCopyEnglish: { alignItems: 'flex-start' },
  profileTitle: { fontSize: 16, fontWeight: '700' },
  profileSubtitle: { fontSize: 11 },
  settingGroup: { borderRadius: 21, borderWidth: 1, paddingHorizontal: 14, overflow: 'hidden' },
  settingRow: { minHeight: 68, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 11 },
  settingIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  settingCopy: { flex: 1, alignItems: 'flex-end', gap: 3 },
  settingTitle: { fontSize: 14, fontWeight: '700', textAlign: 'right' },
  settingSubtitle: { fontSize: 11, textAlign: 'right' },
  settingCopyEnglish: { alignItems: 'flex-start' },
  englishText: { textAlign: 'left' },
  languagePill: { flexDirection: 'row', backgroundColor: '#edf2ed', borderRadius: 10, padding: 3, gap: 2 },
  languageOption: { minWidth: 35, paddingVertical: 5, paddingHorizontal: 7, borderRadius: 8, alignItems: 'center' },
  languageText: { fontSize: 10, fontWeight: '700' },
  themePill: { flexDirection: 'row', backgroundColor: '#edf2ed', borderRadius: 10, padding: 3, gap: 2 },
  themeOption: { paddingVertical: 5, paddingHorizontal: 7, borderRadius: 8 },
  themeText: { fontSize: 10, fontWeight: '700' },
  adhanBlock: { paddingVertical: 14, gap: 10 },
  adhanHeading: { alignItems: 'center', gap: 11 },
  adhanChoices: { flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  adhanOption: { minHeight: 44, minWidth: 88, maxWidth: '100%', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  adhanText: { maxWidth: 180, fontSize: 11, fontWeight: '700' },
  adhanControls: { alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  customActions: { flexDirection: 'row', gap: 7, alignItems: 'center' },
  actionButton: { minHeight: 44, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' },
  actionText: { fontSize: 9, fontWeight: '700' },
  customNote: { fontSize: 10, marginTop: 5, textAlign: 'right', maxWidth: 220 },
  previewButton: { minWidth: 72, height: 32, paddingHorizontal: 6, borderRadius: 9, borderWidth: 1, flexDirection: 'row', gap: 3, alignItems: 'center', justifyContent: 'center' },
  previewText: { fontSize: 8, fontWeight: '700' },
  previewError: { fontSize: 10, marginTop: 3, textAlign: 'right' },
  notificationError: { fontSize: 11, paddingHorizontal: 12, paddingBottom: 8, textAlign: 'right' },
  aboutRow: { minHeight: 55, borderWidth: 1, borderRadius: 17, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 11 },
  aboutText: { flex: 1, fontSize: 13, fontWeight: '700', textAlign: 'right' },
  version: { fontSize: 11 },
});