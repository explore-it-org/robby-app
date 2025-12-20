# explore-it Robotics 🤖

An educational mobile app for teaching robotics programming to children ages 8-14. Students create visual programs using drag-and-drop instruction blocks, then upload and run them on physical robots via Bluetooth.

Built with React Native, Expo, and TypeScript.

## Features

- **Visual Programming:** Intuitive block-based interface with 4 instruction types:
  - Move (motor control)
  - Comment (documentation)
  - Subroutine (program reuse)
  - Repetition (loops with nesting)

- **Robot Connection:** Bluetooth Low Energy (BLE) connection to explore-it robots
- **Program Simulation:** Debug mode with visual robot simulator
- **Multi-Language Support:** English, German, French, Italian
- **Responsive Design:** Optimized for phones and tablets
- **Local Storage:** Programs saved to device file system

See [FEATURES.md](./docs/FEATURES.md) for detailed feature documentation.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Expo CLI
- For iOS development: Xcode and iOS Simulator
- For Android development: Android Studio and Android Emulator

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/frenetisch-applaudierend/explore-it-robotics.git
   cd explore-it-robotics
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npx expo start
   ```

4. Run on your platform:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app for physical device testing

### Development Scripts

```bash
npm start        # Start Expo development server
npm run android  # Run on Android emulator
npm run ios      # Run on iOS simulator
npm run lint     # Run ESLint
```

## Project Structure

```
explore-it-robotics/
├── src/
│   ├── app/              # Expo Router screens and navigation
│   ├── components/       # React components
│   │   ├── program-detail/  # Program editing UI
│   │   ├── debug/           # Debugging/simulation UI
│   │   └── ui/              # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # Business logic and services
│   │   ├── program-storage.ts      # File system persistence
│   │   ├── program-compilation.ts  # Program validation
│   │   ├── program-references.ts   # Dependency tracking
│   │   └── robot-manager-*.ts      # Robot connection
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── constants/        # App-wide constants (colors, spacing)
│   └── i18n/             # Internationalization
│       └── locales/      # Translation files (en, de, fr, it)
├── docs/                 # Documentation
│   ├── spec/features/    # Feature specifications
│   ├── FEATURES.md       # Feature overview
│   └── ARCHITECTURE.md   # System architecture
├── assets/               # Images, fonts, icons
└── scripts/              # Build and utility scripts
```

## Architecture

The app uses a layered architecture:

- **UI Layer:** React components with React Navigation and Expo Router
- **State Management:** React hooks and context (no Redux)
- **Services Layer:** Business logic for storage, compilation, and robot communication
- **Storage:** Local file system using expo-file-system

Key services:

- `program-storage.ts`: Manages program persistence (CRUD operations)
- `program-compilation.ts`: Validates programs and detects errors
- `program-references.ts`: Tracks subroutine dependencies
- `robot-manager-ble.ts`: Handles Bluetooth robot communication
- `simulation-engine.ts`: Simulates program execution for debugging

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed architecture documentation.

## Localization

All user-facing strings must be localized using the i18n system.

### Adding Translations

1. Add translation keys to all language files in `src/i18n/locales/`:
   - `en.json` (English)
   - `de.json` (German)
   - `fr.json` (French)
   - `it.json` (Italian)

2. Use translations in components:

   ```typescript
   import { useTranslation } from 'react-i18next';

   function MyComponent() {
     const { t } = useTranslation();
     return <Text>{t('myFeature.title')}</Text>;
   }
   ```

### Translation Guidelines

**Target Audience:** Children ages 8-14

**Tone:** Friendly, encouraging, informal

- German: Use "du" (not "Sie")
- French: Use "tu" (not "vous")
- Italian: Use "tu" (not "Lei")
- English: Direct, friendly language

**Example:**

- ✅ "Your program is too large. Try reducing the number of repetitions!"
- ❌ "The compilation process has encountered an error."

See [CLEANUP_TODO.md](./CLEANUP_TODO.md) for more localization guidelines.

## Contributing

### Code Style

- TypeScript for all source files
- ESLint for code quality (run `npm run lint`)
- Component files use kebab-case naming
- Follow existing patterns for consistency

### Adding Features

1. Review existing feature specs in `docs/spec/features/`
2. Create new components in appropriate `src/components/` subdirectory
3. Add translations for all user-facing strings
4. Update feature documentation
5. Test on both phone and tablet layouts
6. Ensure dark mode compatibility

### Known Issues

See [CLEANUP_TODO.md](./CLEANUP_TODO.md) for a comprehensive list of known issues, technical debt, and planned improvements.

## Testing

Currently, the project has no automated tests. Testing is manual:

1. **Program Creation:** Create programs with all instruction types
2. **Program Editing:** Test add, edit, delete, reorder operations
3. **Compilation:** Verify error detection (cyclic deps, instruction limits)
4. **Robot Connection:** Test BLE scanning and connection (requires physical robot)
5. **Debugging:** Run programs in debug simulator
6. **Responsive Design:** Test on phone and tablet screen sizes
7. **Localization:** Verify all languages display correctly

## Dependencies

Key dependencies:

- **expo**: Cross-platform app framework
- **react-native**: Mobile UI framework
- **react-navigation**: Navigation and routing
- **expo-file-system**: Local file storage
- **react-native-ble-plx**: Bluetooth Low Energy communication
- **react-i18next**: Internationalization
- **date-fns**: Date formatting and localization
- **human-id**: Human-readable ID generation

## Platform Support

- **iOS:** 13.0+
- **Android:** 5.0+ (API level 21)
- **Web:** Limited support (no BLE, reduced features)

## License

[License information to be added]

## Contact

For questions or support, please contact the explore-it team.

---

**Documentation:** See `docs/` directory for detailed feature specifications and architecture documentation.

**Feature Overview:** See [FEATURES.md](./docs/FEATURES.md) for comprehensive feature documentation.
