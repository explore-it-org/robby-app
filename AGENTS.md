# Agent Instructions

## Localization Requirements

**IMPORTANT**: All features must be localized.

- All user-facing strings must use the i18n translation system
- Never hard-code strings in components - always use translation keys
- Add translations for all supported languages: English (en), German (de), French (fr), and Italian (it)
- Translation files are located in `src/i18n/locales/`
- Use the `useTranslation()` hook from `react-i18next` to access translations

### Example

```tsx
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t } = useTranslation();

  return <Text>{t('myFeature.title')}</Text>;
}
```

Make sure to add the corresponding keys to all language files before considering a feature complete.

## Tone and Voice Guidelines

**Target Audience**: School children (ages 8-14)

**Conversational Tone**: The app uses a friendly, encouraging tone when communicating with users.

Use as little text as possible. Make sure the UI is intuitive and self-explanatory.

### Language-Specific Guidelines

- **German (de)**: Use informal pronouns ("du", "dein", "dich") instead of formal ("Sie", "Ihr", "Ihnen")
- **French (fr)**: Use informal pronouns ("tu", "ton", "te") instead of formal ("vous", "votre")
- **Italian (it)**: Use informal pronouns ("tu", "tuo", "ti") instead of formal ("Lei", "voi")
- **English (en)**: Use direct, friendly language ("you", "your")

### Tone Examples

✅ **Good** (Friendly, encouraging):

- "Your program is too large. Try reducing the number of repetitions!"
- "These programs would never stop calling each other."
- "Great! Your robot is ready to go."

❌ **Avoid** (Too formal or technical):

- "The compilation process has encountered an error."
- "Please be advised that the storage capacity has been exceeded."
- "Kindly reduce the complexity of your algorithm."

### Writing Guidelines

1. **Be clear and simple**: Use language that children can understand
2. **Be encouraging**: Frame errors as learning opportunities
3. **Be direct**: Get to the point quickly
4. **Use active voice**: "Your program does X" not "X is done by your program"
5. **Avoid jargon**: Explain technical concepts in simple terms

## Bluetooth Protocol

The Bluetooth Protocol documentation can be found in the [Bluetooth Protocol Specification](docs/BLUETOOTH_PROTOCOL.md) file.
