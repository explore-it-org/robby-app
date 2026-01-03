# Feature Specification: Robot Management

## Overview

The Robot Management screen is one of the two main tabs on the Home Screen, dedicated to discovering and connecting to EXPLORE-IT robots via Bluetooth. This screen provides a simplified interface for scanning, connecting, and managing a single robot connection at a time. No robot history or previously connected robots are stored - the focus is on current connection status only.

## Goals

- Enable quick and reliable discovery of EXPLORE-IT robots via Bluetooth Low Energy
- Provide clear visual feedback on connection states (idle, scanning, connected)
- Support easy robot selection from scanned devices
- Handle Bluetooth permission requests and error states gracefully
- Maintain simplicity by managing only one robot connection at a time

## Screen States

The Robot Management screen has three primary states:

### Empty State (No Robot Connected)

When no robot is connected and not scanning:

```txt
┌─────────────────────────────────────┐
│  Robot                              │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│  ┌───────────────────────────────┐ │
│  │   Scan for Robots             │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**Display:**
- Title: "Robot"
- Large button: "Scan for Robots"
- No additional instructions or empty state messages

### Scanning State

When actively scanning for robots:

```txt
┌─────────────────────────────────────┐
│  Robot                              │
│                                     │
│  ⊙ Scanning for robots...           │
│                                     │
│  Select a robot to connect          │
│                                     │
│  ┌────────────────────────────┐    │
│  │ [Robot Icon]               │    │
│  │ EXPLORE-IT #12345          │    │
│  │ ID: AA:BB:CC:DD:EE:FF      │    │
│  └────────────────────────────┘    │
│                                     │
│  ┌────────────────────────────┐    │
│  │ [Robot Icon]               │    │
│  │ EXPLORE-IT #67890          │    │
│  │ ID: 11:22:33:44:55:66      │    │
│  └────────────────────────────┘    │
│                                     │
│  ┌───────────────────────────────┐ │
│  │   Cancel Scanning             │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**Display:**
- Title: "Robot"
- Loading indicator with text: "Scanning for robots..."
- Help text: "Select a robot to connect"
- List of discovered robots (if any)
- Large button: "Cancel Scanning"

**Robot List Items:**
Each robot in the list displays:
- Robot icon (gear/wheel)
- Robot name (e.g., "EXPLORE-IT #12345" or the device ID)
- Robot ID: Bluetooth device ID
- Entire card is tappable to connect

**No Robots Found:**
If no robots are discovered after scanning starts:
- Shows "No robots found yet"
- Shows "Keep your robot nearby and turned on"
- Scan continues until user cancels

### Connected State

When a robot is connected:

```txt
┌─────────────────────────────────────┐
│  Robot                              │
│                                     │
│  ┌────────────────────────────┐    │
│  │ [Robot Icon] EXPLORE-IT... │    │
│  │ [Play] [Stop] [Upload]     │    │
│  └────────────────────────────┘    │
│                                     │
│                                     │
│  ┌───────────────────────────────┐ │
│  │   Scan for Robots             │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**Display:**
- Title: "Robot"
- Connected robot widget showing:
  - Robot icon
  - Robot name
  - Action buttons: Play, Stop, Upload
- Large button: "Scan for Robots"

## User Interactions

### Initial Connection Flow

1. User opens Robot tab → Shows Empty State
2. User taps "Scan for Robots" → Transitions to Scanning State
3. App discovers robots → Displays robots in scrollable list
4. User taps a robot from the list → Connects to robot
5. Connection established → Transitions to Connected State, shows robot widget

### Scanning While Connected

1. User has a robot connected → Shows Connected State
2. User taps "Scan for Robots" → Transitions to Scanning State
3. Connected robot widget is hidden but robot remains connected
4. User taps a different robot → Disconnects current robot, connects to new robot
5. User taps "Cancel Scanning" → Returns to Connected State with previous robot

### Changing Robots

1. User is connected to Robot A → Shows Connected State
2. User taps "Scan for Robots" → Transitions to Scanning State (Robot A still connected)
3. User selects Robot B from list → Disconnects Robot A automatically, connects to Robot B
4. Connection to Robot B established → Shows Connected State with Robot B

### Canceling Scan

**From Empty State:**
1. User in Empty State → Taps "Scan for Robots"
2. Scanning State shown → User taps "Cancel Scanning"
3. Returns to Empty State

**From Connected State:**
1. User in Connected State → Taps "Scan for Robots"
2. Scanning State shown (robot still connected) → User taps "Cancel Scanning"
3. Returns to Connected State with same robot

## Key Behaviors

### No Robot History

- The app does NOT store previously connected robots
- No "known robots" list or saved robots
- Each session starts fresh - user must scan to find robots
- Robot connection state is only maintained while the app is active

### Single Robot Connection

- Only one robot can be connected at a time
- Selecting a new robot automatically disconnects the current robot
- No need for explicit "disconnect" button - just scan and select a different robot

### Persistent Scanning

- When scanning starts, discovered robots appear in a list
- List grows as more robots are discovered
- Tapping any robot in the list connects to it
- Scanning can be canceled at any time

### Connection Behavior

- Connecting to a robot automatically stops scanning
- When connected, the robot widget appears
- Robot widget reuses the existing ConnectedRobotDisplay component
- Shows robot name and action buttons (Play, Stop, Upload)

## Permission Handling

**Bluetooth Permission Required:**

- If Bluetooth permission not granted, show permission request dialog
- Explain why permission is needed: "Required to discover and connect to robots"
- Handle permission denial gracefully with clear error message

**Location Permission (Android):**

- Android requires location permission for BLE scanning
- Show clear explanation: "Android requires location access for Bluetooth scanning"
- No actual location data is collected or stored

**Bluetooth Disabled:**

- Detect when device Bluetooth is off
- Show error alert: "Bluetooth is not powered on"
- Provide guidance to enable Bluetooth in device settings

## Error Handling

### Connection Failures

If connection fails:
- Show alert with error message
- Return to previous state (Empty or Connected)
- User can try again by scanning

### Unexpected Disconnection

If robot disconnects unexpectedly:
- App should detect disconnection
- Transition back to Empty State
- No automatic reconnection attempts

### Scan Failures

If scanning fails to start:
- Show alert with error message
- Remain in current state
- User can try again

## Translation Support

All text on this screen is translated using the i18n system:

- `robot.overview.title` - "Robot"
- `robot.overview.scanForRobots` - "Scan for Robots"
- `robot.overview.cancelScanning` - "Cancel Scanning"
- `robot.overview.scanning` - "Scanning for robots..."
- `robot.overview.selectRobotToConnect` - "Select a robot to connect"
- `robotScanner.noRobotsFound` - "No robots found yet"
- `robotScanner.waitingForRobots` - "Keep your robot nearby and turned on"

Supported languages: English, German, French, Italian

## Technical Implementation

### State Management

- Uses local component state (useState) for:
  - `discoveredRobots` - List of robots found during scanning
  - `connectedRobot` - Currently connected robot (null if none)
  - `status` - Robot manager status (idle, scanning, connected)

### Robot Manager Integration

- Uses `useRobotManager` hook to access robot manager
- Subscribes to robot manager events:
  - `onStatusChange` - Updates UI when status changes
  - `onRobotDiscovered` - Adds robots to list as they're discovered

### BLE Implementation

- Uses `react-native-ble-plx` for Bluetooth Low Energy communication
- Scans for devices with name pattern "EXPLORE-IT"
- Automatically falls back to mock robots in development (Expo Go)

## Future Enhancements

Potential future improvements (not currently implemented):

- Display signal strength indicators for discovered robots
- Show connection status indicator in tab bar
- Add firmware version display when connected
- Support for multiple simultaneous robot connections (advanced mode)
- Robot naming/renaming capabilities
- Favorite/starred robots for quick access
