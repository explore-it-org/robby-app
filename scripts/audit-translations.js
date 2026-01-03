#!/usr/bin/env node

/**
 * Translation Audit Script
 * 
 * This script:
 * 1. Scans all TypeScript/TSX files for translation key usage
 * 2. Loads all locale JSON files
 * 3. Identifies missing keys (used in code but not in locale files)
 * 4. Identifies unused keys (in locale files but not used in code)
 * 5. Reports the results
 * 
 * Usage:
 *   node scripts/audit-translations.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const LOCALE_DIR = path.join(ROOT_DIR, 'src/i18n/locales');

// Supported languages
const LANGUAGES = ['en', 'de', 'fr', 'it'];

/**
 * Recursively find all files matching a pattern
 */
function findFiles(dir, pattern, excludePattern = null) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      // Skip node_modules and .git
      if (file === 'node_modules' || file === '.git' || file === 'docs') {
        return;
      }
      results = results.concat(findFiles(filePath, pattern, excludePattern));
    } else {
      if (pattern.test(file) && (!excludePattern || !excludePattern.test(filePath))) {
        results.push(filePath);
      }
    }
  });
  
  return results;
}

/**
 * Extract translation keys from a file
 * Matches patterns like:
 * - t('key')
 * - t("key")
 * - t('key', {})
 * - i18n.t('key')
 * - t(`key`)
 * - t(`prefix.${variable}`) - extracts dynamic keys
 */
function extractKeysFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const keys = new Set();
  const dynamicKeys = new Set();
  
  // Pattern 1: t('key') or t("key")
  const pattern1 = /\bt\s*\(\s*['"`]([^'"`]+)['"`]/g;
  let match;
  while ((match = pattern1.exec(content)) !== null) {
    keys.add(match[1]);
  }
  
  // Pattern 2: i18n.t('key') or i18n.t("key")
  const pattern2 = /i18n\.t\s*\(\s*['"`]([^'"`]+)['"`]/g;
  while ((match = pattern2.exec(content)) !== null) {
    keys.add(match[1]);
  }
  
  // Pattern 3: t(`prefix.${variable}`) - extract base prefix and mark as dynamic
  const pattern3 = /\bt\s*\(\s*`([^`]*)\$\{[^}]+\}([^`]*)`/g;
  while ((match = pattern3.exec(content)) !== null) {
    // Mark this as a dynamic key pattern for special handling
    dynamicKeys.add(match[1] + match[2]);
  }
  
  return {
    keys: Array.from(keys),
    dynamicKeys: Array.from(dynamicKeys)
  };
}

/**
 * Flatten nested JSON object to dot notation keys
 */
function flattenKeys(obj, prefix = '') {
  const keys = [];
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        keys.push(...flattenKeys(value, fullKey));
      } else {
        keys.push(fullKey);
      }
    }
  }
  
  return keys;
}

/**
 * Load locale file and get all keys
 */
function loadLocaleKeys(lang) {
  const filePath = path.join(LOCALE_DIR, `${lang}.json`);
  const content = fs.readFileSync(filePath, 'utf-8');
  const json = JSON.parse(content);
  return flattenKeys(json);
}

/**
 * Main audit function
 */
function auditTranslations() {
  console.log('🔍 Auditing Translation Keys...\n');
  
  // Step 1: Find all source files
  console.log('📁 Scanning source files...');
  const sourceFiles = findFiles(SRC_DIR, /\.(ts|tsx)$/);
  console.log(`   Found ${sourceFiles.length} source files\n`);
  
  // Step 2: Extract all keys used in code
  console.log('🔑 Extracting translation keys from code...');
  const usedKeys = new Set();
  const dynamicKeyPrefixes = new Set();
  const keysByFile = new Map();
  
  sourceFiles.forEach(file => {
    const result = extractKeysFromFile(file);
    if (result.keys.length > 0 || result.dynamicKeys.length > 0) {
      const relativePath = path.relative(ROOT_DIR, file);
      keysByFile.set(relativePath, result.keys);
      result.keys.forEach(key => usedKeys.add(key));
      result.dynamicKeys.forEach(prefix => dynamicKeyPrefixes.add(prefix));
    }
  });
  
  console.log(`   Found ${usedKeys.size} unique keys used in code`);
  console.log(`   Found ${dynamicKeyPrefixes.size} dynamic key patterns\n`);
  
  // Step 3: Load locale files
  console.log('🌍 Loading locale files...');
  const localeKeys = {};
  LANGUAGES.forEach(lang => {
    localeKeys[lang] = loadLocaleKeys(lang);
    console.log(`   ${lang}.json: ${localeKeys[lang].length} keys`);
  });
  console.log();
  
  // Step 4: Find missing keys (used in code but not in locale files)
  console.log('❌ Missing Keys (used in code but not in locale files):\n');
  const missingKeys = {};
  let hasMissing = false;
  
  LANGUAGES.forEach(lang => {
    const localeKeySet = new Set(localeKeys[lang]);
    const missing = Array.from(usedKeys).filter(key => {
      // Skip dynamic key patterns (they're not actual keys)
      if (key.includes('${')) return false;
      
      // Check for exact match or pluralization keys
      if (localeKeySet.has(key)) return false;
      // Check for plural forms (key_one, key_other)
      if (localeKeySet.has(`${key}_one`) || localeKeySet.has(`${key}_other`)) return false;
      return true;
    });
    
    if (missing.length > 0) {
      hasMissing = true;
      missingKeys[lang] = missing;
      console.log(`  ${lang}.json (${missing.length} missing):`);
      missing.forEach(key => console.log(`    - ${key}`));
      console.log();
    }
  });
  
  if (!hasMissing) {
    console.log('  ✅ No missing keys found!\n');
  }
  
  // Step 5: Find unused keys (in locale files but not used in code)
  console.log('♻️  Unused Keys (in locale files but not used in code):\n');
  const unusedKeys = {};
  let hasUnused = false;
  
  LANGUAGES.forEach(lang => {
    const unused = localeKeys[lang].filter(key => {
      // Skip plural suffix keys as they're used implicitly
      if (key.endsWith('_one') || key.endsWith('_other')) {
        const baseKey = key.replace(/_(one|other)$/, '');
        return !usedKeys.has(baseKey);
      }
      
      // Check if this key matches any dynamic key prefix pattern
      // e.g., compilationErrors.cyclicDependencyExplanation matches compilationErrors.
      for (const prefix of dynamicKeyPrefixes) {
        if (key.startsWith(prefix)) {
          return false; // Don't mark as unused - it's used dynamically
        }
      }
      
      return !usedKeys.has(key);
    });
    
    if (unused.length > 0) {
      hasUnused = true;
      unusedKeys[lang] = unused;
      console.log(`  ${lang}.json (${unused.length} unused):`);
      unused.forEach(key => console.log(`    - ${key}`));
      console.log();
    }
  });
  
  if (!hasUnused) {
    console.log('  ✅ No unused keys found!\n');
  }
  
  // Step 6: Summary
  console.log('📊 Summary:\n');
  console.log(`  Total unique keys used in code: ${usedKeys.size}`);
  LANGUAGES.forEach(lang => {
    const missing = missingKeys[lang] ? missingKeys[lang].length : 0;
    const unused = unusedKeys[lang] ? unusedKeys[lang].length : 0;
    console.log(`  ${lang}.json: ${localeKeys[lang].length} total, ${missing} missing, ${unused} unused`);
  });
  console.log();
  
  // Step 7: Write detailed report
  const reportPath = path.join(ROOT_DIR, 'TRANSLATION_AUDIT.md');
  writeReport(reportPath, {
    usedKeys: Array.from(usedKeys).sort(),
    dynamicKeyPrefixes: Array.from(dynamicKeyPrefixes).sort(),
    localeKeys,
    missingKeys,
    unusedKeys,
    keysByFile,
  });
  
  console.log(`📄 Detailed report written to: TRANSLATION_AUDIT.md\n`);
  
  return {
    hasMissing,
    hasUnused,
    missingKeys,
    unusedKeys,
  };
}

/**
 * Write detailed markdown report
 */
function writeReport(filePath, data) {
  const { usedKeys, dynamicKeyPrefixes, localeKeys, missingKeys, unusedKeys, keysByFile } = data;
  
  let report = '# Translation Audit Report\n\n';
  report += `**Generated:** ${new Date().toISOString()}\n\n`;
  report += '---\n\n';
  
  // Summary
  report += '## Summary\n\n';
  report += `- **Total unique keys used in code:** ${usedKeys.length}\n`;
  report += `- **Dynamic key patterns:** ${dynamicKeyPrefixes.length}\n`;
  LANGUAGES.forEach(lang => {
    const missing = missingKeys[lang] ? missingKeys[lang].length : 0;
    const unused = unusedKeys[lang] ? unusedKeys[lang].length : 0;
    report += `- **${lang}.json:** ${localeKeys[lang].length} total keys, ${missing} missing, ${unused} unused\n`;
  });
  report += '\n';
  
  // Dynamic key prefixes
  if (dynamicKeyPrefixes.length > 0) {
    report += '### Dynamic Key Patterns\n\n';
    report += 'These are translation keys constructed at runtime using template literals:\n\n';
    dynamicKeyPrefixes.forEach(prefix => {
      report += `- \`${prefix}\` (e.g., \`compilationErrors.\${error.explanationKey}\`)\n`;
    });
    report += '\n';
  }
  
  report += '---\n\n';
  
  // Missing Keys
  report += '## Missing Keys\n\n';
  report += 'Keys that are used in the codebase but missing from locale files.\n\n';
  
  let hasMissing = false;
  LANGUAGES.forEach(lang => {
    if (missingKeys[lang] && missingKeys[lang].length > 0) {
      hasMissing = true;
      report += `### ${lang}.json (${missingKeys[lang].length} missing)\n\n`;
      missingKeys[lang].forEach(key => {
        report += `- \`${key}\`\n`;
      });
      report += '\n';
    }
  });
  
  if (!hasMissing) {
    report += '✅ **No missing keys found!**\n\n';
  }
  
  report += '---\n\n';
  
  // Unused Keys
  report += '## Unused Keys\n\n';
  report += 'Keys that exist in locale files but are not used anywhere in the codebase.\n\n';
  
  let hasUnused = false;
  LANGUAGES.forEach(lang => {
    if (unusedKeys[lang] && unusedKeys[lang].length > 0) {
      hasUnused = true;
      report += `### ${lang}.json (${unusedKeys[lang].length} unused)\n\n`;
      unusedKeys[lang].forEach(key => {
        report += `- \`${key}\`\n`;
      });
      report += '\n';
    }
  });
  
  if (!hasUnused) {
    report += '✅ **No unused keys found!**\n\n';
  }
  
  report += '---\n\n';
  
  // All Used Keys
  report += '## All Translation Keys Used in Code\n\n';
  report += `Total: ${usedKeys.length} unique keys\n\n`;
  usedKeys.forEach(key => {
    report += `- \`${key}\`\n`;
  });
  report += '\n---\n\n';
  
  // Keys by File
  report += '## Translation Keys by File\n\n';
  Array.from(keysByFile.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([file, keys]) => {
      report += `### ${file}\n\n`;
      keys.sort().forEach(key => {
        report += `- \`${key}\`\n`;
      });
      report += '\n';
    });
  
  fs.writeFileSync(filePath, report, 'utf-8');
}

// Run the audit
const result = auditTranslations();

// Exit with error code if there are issues
if (result.hasMissing || result.hasUnused) {
  console.log('⚠️  Translation audit found issues that need attention.\n');
  process.exit(0); // Don't fail, just report
} else {
  console.log('✅ Translation audit completed successfully - no issues found!\n');
  process.exit(0);
}
