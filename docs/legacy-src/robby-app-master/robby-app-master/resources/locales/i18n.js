//import * as RNLocalize from "react-native-localize";
import i18n from 'i18n-js';

import de from './de.json';
import en from './en.json';
import it from './it.json';
import fr from './fr.json';

i18n.translations = { de, en, it, fr };
i18n.fallbacks = false;

i18n.format = function() {
    var args = Object.values(arguments);
    var str = args.shift();
    return str.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[parseInt(number)]
        : match
      ;
    });
  };

export default i18n;
