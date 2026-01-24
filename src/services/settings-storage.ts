/**
 * Settings Storage Service
 *
 * Provides AsyncStorage wrapper for persisting app settings.
 * Handles reading and writing settings to device storage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  RECORDING_DURATION: '@settings/recordingDuration',
  LANGUAGE: '@settings/language',
  SHOW_EXTENDED_ROBOT_INFO: '@settings/showExtendedRobotInfo',
} as const;

export type Language = 'device' | 'en' | 'de' | 'fr' | 'it';

export interface Settings {
  recordingDuration: number;
  language: Language;
  showExtendedRobotInfo: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  recordingDuration: 15,
  language: 'device',
  showExtendedRobotInfo: false,
};

/**
 * Load recording duration from storage
 */
export async function loadRecordingDuration(): Promise<number> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.RECORDING_DURATION);
    if (value !== null) {
      const duration = parseInt(value, 10);
      if (!isNaN(duration) && duration >= 0 && duration <= 80) {
        return duration;
      }
    }
  } catch (error) {
    console.error('Error loading recording duration:', error);
  }
  return DEFAULT_SETTINGS.recordingDuration;
}

/**
 * Save recording duration to storage
 */
export async function saveRecordingDuration(duration: number): Promise<void> {
  // Validate range
  if (isNaN(duration) || duration < 0 || duration > 80) {
    throw new Error('Recording duration must be between 0 and 80 seconds');
  }
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.RECORDING_DURATION, duration.toString());
  } catch (error) {
    console.error('Error saving recording duration:', error);
    throw error;
  }
}

/**
 * Load language from storage
 */
export async function loadLanguage(): Promise<Language> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
    if (value !== null && ['device', 'en', 'de', 'fr', 'it'].includes(value)) {
      return value as Language;
    }
  } catch (error) {
    console.error('Error loading language:', error);
  }
  return DEFAULT_SETTINGS.language;
}

/**
 * Save language to storage
 */
export async function saveLanguage(language: Language): Promise<void> {
  // Validate language value
  if (!['device', 'en', 'de', 'fr', 'it'].includes(language)) {
    throw new Error('Invalid language. Must be one of: device, en, de, fr, it');
  }
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  } catch (error) {
    console.error('Error saving language:', error);
    throw error;
  }
}

/**
 * Load extended robot info setting from storage
 */
export async function loadShowExtendedRobotInfo(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.SHOW_EXTENDED_ROBOT_INFO);
    if (value !== null) {
      return value === 'true';
    }
  } catch (error) {
    console.error('Error loading extended robot info setting:', error);
  }
  return DEFAULT_SETTINGS.showExtendedRobotInfo;
}

/**
 * Save extended robot info setting to storage
 */
export async function saveShowExtendedRobotInfo(show: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SHOW_EXTENDED_ROBOT_INFO, show.toString());
  } catch (error) {
    console.error('Error saving extended robot info setting:', error);
    throw error;
  }
}

/**
 * Load all settings from storage
 */
export async function loadSettings(): Promise<Settings> {
  const [recordingDuration, language, showExtendedRobotInfo] = await Promise.all([
    loadRecordingDuration(),
    loadLanguage(),
    loadShowExtendedRobotInfo(),
  ]);

  return {
    recordingDuration,
    language,
    showExtendedRobotInfo,
  };
}
