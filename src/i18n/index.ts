/**
 * i18n Configuration
 *
 * Internationalization setup for the explore-it Robotics app.
 * Supports English, German, French, and Italian with automatic locale detection.
 */

import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import de from './locales/de.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import it from './locales/it.json';

// Get device locale
const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? 'en';

// eslint-disable-next-line import/no-named-as-default-member
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    de: { translation: de },
    fr: { translation: fr },
    it: { translation: it },
  },
  lng: deviceLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React already escapes values
  },
});

export default i18n;
