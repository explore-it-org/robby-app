//import * as RNLocalize from "react-native-localize";
import i18n from 'i18n-js';

import de from './de.json';
import en from './en.json';
import { Platform, NativeModules } from 'react-native';

i18n.translations = { de, en };
i18n.fallbacks = false;

if(Platform.OS === "ios"){
    // iOS:
    i18n.defaultLocale = NativeModules.SettingsManager.settings.AppleLocale.split('_')[0];
}else{
    // Android:
    i18n.defaultLocale = NativeModules.I18nManager.localeIdentifier.split('_')[0];
}

export default i18n;
