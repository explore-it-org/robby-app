# explore-it Robotics App - Specification Overview

**Version:** 3.0.0
**Platform:** React Native (Modern)
**Target Audience:** Educational robotics users, students, educators
**Last Updated:** 2025-11-06

---

## 1. Vision and Goals

The explore-it Robotics app is a modern, intuitive mobile application that enables users to program and control small educational robots through visual programming interfaces. The app makes robotics accessible to learners of all ages by providing progressive learning from simple commands to complex program composition.

### Primary Goals

- **Accessibility**: Intuitive interface requiring no prior programming experience
- **Reliability**: Stable Bluetooth connectivity and robust error handling
- **Extensibility**: Support multiple robot firmware versions and future hardware
- **Educational Value**: Enable progressive learning from simple to complex programming
- **Modern Experience**: Contemporary mobile app performance and UX standards
- **Localization**: Multi-language support to reach a global audience of learners

---

## 2. Core Features

### 2.1 Robot Connectivity

**Bluetooth Low Energy Management** - Automatic scanning and connection to EXPLORE-IT robots with persistent preferences, version detection (v1-v10+), and graceful error handling. Runtime permission management for Bluetooth and location with clear user explanations.

### 2.2 Programming Modes

The app provides three complementary programming interfaces:

#### Step Programming (Direct Control)

Direct, instruction-level robot control with visual speed controls for left/right wheels (0-100%), drag-and-drop instruction reordering, timing controls, and an instruction library. Includes program naming, undo/redo, and execution time estimates.

#### Block Programming (Composition)

Higher-level programming by composing saved programs as reusable blocks with repetition counts. Features nested composition, circular reference detection, flattened instruction preview, and upload size validation (4,096 instruction limit).

#### Overview & Management

Central hub for browsing and managing all saved programs. List/grid views with sorting, filtering, search, and bulk operations. Program cards display metadata including instruction count, dates, and program type. Supports import/export in JSON format.

### 2.3 Robot Control Operations

**Core Commands:**

- **Upload**: Transfer programs to robot memory with progress tracking and retry logic
- **Download**: Retrieve programs from robot with packet loss recovery
- **Record**: Learn mode for recording manual robot movements
- **Execute**: Run programs with real-time status and emergency stop
- **Direct Control**: Manual Go/Stop commands and speed adjustments

**Safety**: Emergency stop always available, automatic timeouts, battery monitoring, and safe defaults on connection loss.

### 2.4 Data Management

Local database (SQLite or Realm) storing user programs, metadata, execution history, and settings. Auto-save every 30 seconds, crash recovery, automatic backups, and JSON import/export capabilities. Redux state persistence across app lifecycle.

### 2.5 User Interface

Modern Material Design 3 / iOS Human Interface Guidelines with dark mode support, WCAG 2.1 AA accessibility compliance, responsive layouts for tablets and phones. Bottom tab navigation with persistent robot control bar and contextual help. Toast notifications, progress indicators, and haptic feedback.

### 2.6 Internationalization & Localization

**Critical for Global Educational Impact**: Localization is essential for making robotics education accessible worldwide. The app supports multiple languages to ensure students can learn programming in their native language, reducing cognitive load and improving comprehension.

**Implementation**: Multi-language support (English, German initially, extensible to additional languages) with automatic locale detection based on device settings and in-app language switching. Localized date/time formatting, number formatting, and error messages. All UI text, instructions, and help content are translatable.

**Why Localization Matters**:
- Removes language barriers in STEM education
- Enables deployment in international schools and markets
- Demonstrates inclusive design principles
- Supports diverse learning communities

---

## 3. Technical Stack

### Platform Support

- **React Native**: 0.73+ (latest stable)
- **Minimum OS**: iOS 14.0+, Android 6.0+ (API 23)
- **Target OS**: iOS 17+, Android 13+
- **Requirements**: BLE 4.0, 2GB RAM, 100MB storage

### Core Technologies

- **Framework**: React Native 0.73+, React 18+, TypeScript 5+
- **State**: Redux Toolkit with RTK Query and Redux Persist
- **Database**: SQLite, Realm, or WatermelonDB
- **Navigation**: React Navigation 6+ with type-safe routing
- **UI**: React Native Paper (Material Design 3) + custom components
- **Bluetooth**: react-native-ble-plx 3+
- **Testing**: Jest (unit), Detox (E2E)
- **CI/CD**: Fastlane, GitHub Actions/GitLab CI

### Architecture

**Component Layer**: Functional components with hooks, compound patterns for complex UI, custom hooks for business logic.

**State Layer**: Redux slices for bluetooth, programs, database, settings, and robot state. Normalized state with selectors.

**Communication Layer**:

- `BluetoothService` - Low-level BLE operations
- `RobotController` - High-level robot API
- `ProtocolHandler` - Version-aware communication
- `PacketManager` - Packet assembly and error recovery

**Data Layer**: Repository pattern with DAOs, migration scripts, and automatic backups.

---

## 4. Key Requirements

### Security

- Minimum necessary permissions with runtime requests
- No background location tracking
- Sandboxed app storage

### Error Handling

- Connection timeout with exponential backoff reconnection
- Mid-transfer disconnection recovery
- Database corruption detection and recovery
- State preservation during backgrounding
- Clear error messages with recovery suggestions

### Accessibility

- VoiceOver/TalkBack support
- Minimum touch targets: 44x44pt (iOS) / 48x48dp (Android)
- WCAG AA color contrast
- Screen reader announcements
- Keyboard navigation support

### Quality Assurance

- >80% unit test coverage for business logic
- Integration tests for BLE communication
- E2E tests for critical user flows
- Automated regression testing
- Crash reporting and performance monitoring

---

## 5. User Workflows

### First-Time Experience

Welcome screen → permission requests → robot connection tutorial → quick start tutorial → feature discovery

### Typical Session

Open app → auto-connect to robot → choose programming mode → create/edit program → save → upload → execute → iterate

### Advanced Usage

Create reusable building blocks in Step mode, compose complex behaviors in Block mode, manage program library in Overview mode.

---

## 6. Scope Boundaries

### Out of Scope (v3.0)

Web/desktop versions, account system, cloud storage, social features, in-app purchases, text-based programming, multi-robot simultaneous control, custom firmware uploads

### Migration from Legacy App

Automatic detection and one-click import of legacy app data with format mapping and verification. Support for all robot firmware versions (v1-v10+). Migration guide and deprecation timeline communication.

---

## 7. References

- Legacy App Analysis: `docs/LEGACY_APP_ANALYSIS.md`
- React Native: <https://reactnative.dev>
- BLE Specification: <https://www.bluetooth.com/specifications/specs/>
- Material Design 3: <https://m3.material.io>
- iOS HIG: <https://developer.apple.com/design/>
