//import * as RNLocalize from "react-native-localize";
import i18n from 'i18n-js';

import de from './de.json';
import en from './en.json';
import it from './it.json';
import fr from './fr.json';

i18n.translations = { de, en, it, fr };
i18n.fallbacks = false;


export default i18n;
