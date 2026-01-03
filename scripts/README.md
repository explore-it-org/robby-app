# Translation Audit Script

## Overview

The `audit-translations.js` script provides automated auditing of translation keys across the explore-it Robotics application. It helps maintain translation consistency by identifying missing and unused keys.

## Features

- **Comprehensive Scanning**: Scans all TypeScript/TSX source files for translation key usage
- **Multi-Language Support**: Checks all 4 supported locales (en, de, fr, it)
- **Dynamic Key Detection**: Correctly handles dynamic translation keys using template literals
- **Detailed Reporting**: Generates a comprehensive markdown report with findings
- **Missing Key Detection**: Identifies keys used in code but missing from locale files
- **Unused Key Detection**: Identifies keys in locale files that are no longer used

## Usage

Run the script from the project root:

```bash
node scripts/audit-translations.js
```

## Output

The script provides two types of output:

### Console Output

Shows a summary of findings:
- Number of source files scanned
- Number of unique translation keys found
- Missing keys per locale
- Unused keys per locale
- Summary statistics

### Markdown Report

Generates `TRANSLATION_AUDIT.md` in the project root with:
- Complete list of all missing keys
- Complete list of all unused keys
- All translation keys used in code
- Translation keys organized by file
- Dynamic key patterns detected

## Translation Key Patterns

The script detects these translation key usage patterns:

1. **Standard keys**: `t('key.name')`
2. **With parameters**: `t('key.name', { count: 5 })`
3. **i18next calls**: `i18n.t('key.name')`
4. **Dynamic keys**: `` t(`compilationErrors.${error.explanationKey}`) ``

## Dynamic Keys

The script correctly handles dynamic translation keys constructed at runtime. For example:

```typescript
t(`compilationErrors.${error.explanationKey}`)
```

This pattern is recognized, and keys matching the prefix (e.g., `compilationErrors.cyclicDependencyExplanation`) are not marked as unused.

## Maintenance

Run this script:
- Before releases to ensure translation completeness
- After adding new features that introduce translation keys
- When cleaning up deprecated features
- As part of CI/CD pipelines (optional)

## Exit Codes

- `0`: Success (with or without findings)

The script reports issues but does not fail to allow for review before taking action.

## Related Files

- `src/i18n/locales/*.json` - Translation files
- `TRANSLATION_AUDIT.md` - Generated audit report
- `CLEANUP_TODO.md` - Cleanup tasks related to translations

## Example Output

```
🔍 Auditing Translation Keys...

📁 Scanning source files...
   Found 65 source files

🔑 Extracting translation keys from code...
   Found 109 unique keys used in code
   Found 1 dynamic key patterns

🌍 Loading locale files...
   en.json: 113 keys
   de.json: 113 keys
   fr.json: 113 keys
   it.json: 113 keys

❌ Missing Keys (used in code but not in locale files):
  ✅ No missing keys found!

♻️  Unused Keys (in locale files but not used in code):
  ✅ No unused keys found!

📊 Summary:
  Total unique keys used in code: 109
  en.json: 113 total, 0 missing, 0 unused
  de.json: 113 total, 0 missing, 0 unused
  fr.json: 113 total, 0 missing, 0 unused
  it.json: 113 total, 0 missing, 0 unused

✅ Translation audit completed successfully - no issues found!
```

## History

- **2025-11-11**: Initial version - Performed comprehensive audit and removed 36 unused keys per locale (144 total)
