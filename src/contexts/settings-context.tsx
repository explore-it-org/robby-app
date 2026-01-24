/**
 * Settings Context
 *
 * Provides global settings management with persistence.
 * Manages recording duration, language, and extended robot info preferences.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import i18n from '@/i18n';
import {
  Language,
  loadSettings,
  saveLanguage,
  saveRecordingDuration,
  saveShowExtendedRobotInfo,
  DEFAULT_SETTINGS,
} from '@/services/settings-storage';

interface SettingsContextValue {
  recordingDuration: number;
  language: Language;
  showExtendedRobotInfo: boolean;
  isLoading: boolean;
  setRecordingDuration: (duration: number) => Promise<void>;
  setLanguage: (lang: Language) => Promise<void>;
  setShowExtendedRobotInfo: (show: boolean) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

interface SettingsProviderProps {
  children: React.ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [recordingDuration, setRecordingDurationState] = useState<number>(
    DEFAULT_SETTINGS.recordingDuration
  );
  const [language, setLanguageState] = useState<Language>(DEFAULT_SETTINGS.language);
  const [showExtendedRobotInfo, setShowExtendedRobotInfoState] = useState<boolean>(
    DEFAULT_SETTINGS.showExtendedRobotInfo
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load settings on mount
  useEffect(() => {
    loadSettings()
      .then((settings) => {
        setRecordingDurationState(settings.recordingDuration);
        setLanguageState(settings.language);
        setShowExtendedRobotInfoState(settings.showExtendedRobotInfo);
        // Set i18n language
        i18n.changeLanguage(settings.language).catch(console.error);
      })
      .catch(console.error)
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleSetRecordingDuration = async (duration: number): Promise<void> => {
    // Validate range
    if (duration < 0 || duration > 80) {
      throw new Error('Recording duration must be between 0 and 80 seconds');
    }
    await saveRecordingDuration(duration);
    setRecordingDurationState(duration);
  };

  const handleSetLanguage = async (lang: Language): Promise<void> => {
    await saveLanguage(lang);
    setLanguageState(lang);
    // Update i18n language
    await i18n.changeLanguage(lang);
  };

  const handleSetShowExtendedRobotInfo = async (show: boolean): Promise<void> => {
    await saveShowExtendedRobotInfo(show);
    setShowExtendedRobotInfoState(show);
  };

  const value: SettingsContextValue = {
    recordingDuration,
    language,
    showExtendedRobotInfo,
    isLoading,
    setRecordingDuration: handleSetRecordingDuration,
    setLanguage: handleSetLanguage,
    setShowExtendedRobotInfo: handleSetShowExtendedRobotInfo,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

/**
 * Hook to access settings context
 */
export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
