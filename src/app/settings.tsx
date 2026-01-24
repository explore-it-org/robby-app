/**
 * Settings Screen
 *
 * Comprehensive settings screen for configuring app preferences:
 * - Recording duration (0-80 seconds)
 * - Language selection (en, de, fr, it)
 * - Extended robot information toggle
 * - App info (logo, website link, version)
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Switch, Pressable, Alert, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NumberInput } from '@/components/ui/number-input';
import * as Linking from 'expo-linking';
import { Stack } from 'expo-router';
import { ThemedView } from '@/components/ui/themed-view';
import { ThemedText } from '@/components/ui/themed-text';
import { useConnectedRobot } from '@/contexts/connected-robot-context';
import { useSettings } from '@/hooks/use-settings';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { Language } from '@/services/settings-storage';

const packageJson = require('../../package.json');

export default function SettingsScreen() {
  const { t } = useTranslation();
  const {
    recordingDuration,
    language,
    showExtendedRobotInfo,
    setRecordingDuration,
    setLanguage,
    setShowExtendedRobotInfo,
  } = useSettings();
  const { robot } = useConnectedRobot();
  const [instructionInterval, setInstructionInterval] = useState<number>(10);

  // Sync interval from robot when connected
  useEffect(() => {
    if (robot) {
      setInstructionInterval(robot.interval);
    }
  }, [robot]);

  const handleDurationChange = async (value: number) => {
    try {
      await setRecordingDuration(value);
    } catch (error) {
      Alert.alert(
        t('alerts.error.title'),
        error instanceof Error ? error.message : 'Failed to save recording duration'
      );
    }
  };

  const handleIntervalChange = async (value: number) => {
    if (!robot) return;
    try {
      await robot.setInterval(value);
      setInstructionInterval(value);
    } catch (error) {
      Alert.alert(
        t('alerts.error.title'),
        error instanceof Error ? error.message : t('alerts.error.setIntervalFailed')
      );
    }
  };

  const handleLanguageChange = async (newLanguage: Language) => {
    try {
      await setLanguage(newLanguage);
    } catch (error) {
      Alert.alert(
        t('alerts.error.title'),
        error instanceof Error ? error.message : 'Failed to change language'
      );
    }
  };

  const handleExtendedInfoToggle = async (value: boolean) => {
    try {
      await setShowExtendedRobotInfo(value);
    } catch (error) {
      Alert.alert(
        t('alerts.error.title'),
        error instanceof Error ? error.message : 'Failed to save setting'
      );
    }
  };

  const handleVisitWebsite = () => {
    Linking.openURL('https://www.explore-it.org').catch((error) => {
      Alert.alert(t('alerts.error.title'), 'Could not open website');
      console.error('Failed to open URL:', error);
    });
  };

  const languages: { value: Language; label: string }[] = [
    { value: 'en', label: 'English' },
    { value: 'de', label: 'Deutsch' },
    { value: 'fr', label: 'Français' },
    { value: 'it', label: 'Italiano' },
  ];

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: t('settings.title'),
          headerBackTitle: t('common.back'),
        }}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Robot Settings Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('settings.robotSettings')}</ThemedText>

          <View style={styles.settingItem}>
            <View style={styles.durationRow}>
              <ThemedText style={styles.settingLabel}>{t('settings.recordingDuration')}</ThemedText>
              <NumberInput
                value={recordingDuration}
                onValueChange={handleDurationChange}
                min={1}
                max={80}
                unit="s"
                large
              />
            </View>
          </View>

          {/* Program Lines Per Second - only shown when robot is connected */}
          {robot && (
            <View style={styles.settingItem}>
              <View style={styles.durationRow}>
                <ThemedText style={styles.settingLabel}>{t('settings.programLinesPerSecond')}</ThemedText>
                <NumberInput
                  value={instructionInterval}
                  onValueChange={handleIntervalChange}
                  min={1}
                  max={50}
                  large
                />
              </View>
            </View>
          )}
        </View>

        {/* App Settings Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('settings.appSettings')}</ThemedText>

          {/* Language Selection */}
          <View style={styles.settingItem}>
            <ThemedText style={styles.settingLabel}>{t('settings.language')}</ThemedText>
            <View style={styles.languageContainer}>
              {languages.map((lang) => (
                <Pressable
                  key={lang.value}
                  style={[
                    styles.languageButton,
                    language === lang.value && styles.languageButtonActive,
                  ]}
                  onPress={() => handleLanguageChange(lang.value)}
                >
                  <ThemedText
                    style={[
                      styles.languageButtonText,
                      language === lang.value && styles.languageButtonTextActive,
                    ]}
                  >
                    {lang.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Extended Robot Info Toggle */}
          <View style={styles.settingItem}>
            <View style={styles.toggleRow}>
              <ThemedText style={styles.settingLabel}>
                {t('settings.extendedRobotInfo')}
              </ThemedText>
              <Switch
                value={showExtendedRobotInfo}
                onValueChange={handleExtendedInfoToggle}
                trackColor={{ false: COLORS.GRAY_LIGHT, true: COLORS.CURIOUS_BLUE }}
                thumbColor={COLORS.WHITE}
                ios_backgroundColor={COLORS.GRAY_LIGHT}
              />
            </View>
          </View>
        </View>

        {/* Footer Section */}
        <View style={styles.footer}>
          {/* Logo */}
          <Image
            source={require('../../assets/images/explore-it-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Website Link */}
          <Pressable style={styles.websiteButton} onPress={handleVisitWebsite}>
            <ThemedText style={styles.websiteButtonText}>
              {t('settings.visitWebsite')}
            </ThemedText>
          </Pressable>

          {/* Version */}
          <ThemedText style={styles.version}>
            {t('settings.version')} {packageJson.version}
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.LG,
    paddingBottom: SPACING.XXXL,
  },
  section: {
    marginBottom: SPACING.XXL,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: SPACING.LG,
    color: COLORS.PRIMARY,
  },
  settingItem: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    padding: SPACING.LG,
    marginBottom: SPACING.MD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
  },
  languageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM,
    marginTop: SPACING.SM,
  },
  languageButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.SURFACE,
    alignItems: 'center',
  },
  languageButtonActive: {
    borderColor: COLORS.CURIOUS_BLUE,
    backgroundColor: COLORS.CURIOUS_BLUE,
  },
  languageButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
  },
  languageButtonTextActive: {
    color: COLORS.TEXT_INVERTED,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.XXL,
    marginTop: SPACING.LG,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: SPACING.LG,
  },
  websiteButton: {
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.XL,
    backgroundColor: COLORS.CURIOUS_BLUE,
    borderRadius: 8,
    marginBottom: SPACING.LG,
  },
  websiteButtonText: {
    color: COLORS.TEXT_INVERTED,
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
});
