# Feature Specification: Robot Management

## Overview

The Robot Management screen is one of the two main tabs on the Home Screen, dedicated to discovering, connecting, and managing Bluetooth connections with EXPLORE-IT robots. This screen handles all robot-related operations including scanning for available devices, establishing BLE connections, displaying connection status, and providing disconnect capabilities. It serves as the device management hub, separating robot connectivity concerns from program management.

## Goals

- Enable quick and reliable discovery of EXPLORE-IT robots via Bluetooth Low Energy
- Provide clear visual feedback on connection states (disconnected, scanning, connecting, connected, error)
- Display helpful information to aid robot selection (device name, signal strength, firmware version)
- Support easy switching between robots without navigating away from the screen
- Handle Bluetooth permission requests and error states gracefully

## Screen States

The Robot Management screen has four primary states based on connection status:

### Disconnected State

```txt
┌─────────────────────────────────────┐
│  Robot Connection                   │
│                                     │
│  ┌────────────────────────────┐    │
│  │                            │    │
│  │    [Bluetooth Icon]        │    │
│  │                            │    │
│  │    No Robot Connected      │    │
│  │                            │    │
│  │  [ Scan for Robots ]       │    │
│  │                            │    │
│  └────────────────────────────┘    │
│                                     │
│  • Make sure your robot is         │
│    powered on and nearby            │
│                                     │
└─────────────────────────────────────┘
```

### Scanning State

```txt
┌─────────────────────────────────────┐
│  Scanning for robots...             │
│                                     │
│  ┌────────────────────────────┐    │
│  │ EXPLORE-IT #12345          ⋮  │
│  │ AA:BB:CC:DD:EE:FF          │    │
│  │ ▂▃▅▇ Excellent Signal      │    │
│  └────────────────────────────┘    │
│                                     │
│  ┌────────────────────────────┐    │
│  │ EXPLORE-IT #67890          ⋮  │
│  │ 11:22:33:44:55:66          │    │
│  │ ▂▃▅▁ Good Signal           │    │
│  └────────────────────────────┘    │
│                                     │
│  ┌────────────────────────────┐    │
│  │ EXPLORE-IT #24680          ⋮  │
│  │ FF:EE:DD:CC:BB:AA          │    │
│  │ ▂▃▁▁ Fair Signal           │    │
│  └────────────────────────────┘    │
│                                     │
│         [ Stop Scan ]               │
│                                     │
└─────────────────────────────────────┘
```

Each robot card displays:
- **Robot Name:** The device name of the robot
- **Bluetooth Address:** The Bluetooth MAC address or device identifier
- **Signal Strength:** Visual indicator using bars (▂▃▅▇) with text label (Excellent/Good/Fair/Weak)
- **Menu Button (⋮):** Three-dot vertical menu button on the right side

The menu button opens a popup menu with the following options:
- **Edit:** Opens dialog to edit robot settings (currently a placeholder)
- **Delete:** Removes the robot from the list (currently a placeholder)

Note: For physical robots, no additional identifier is shown beyond the robot name and Bluetooth address, as physical devices don't have application-specific IDs.

### Connecting State

```txt
┌─────────────────────────────────────┐
│  Connecting...                      │
│                                     │
│  ┌────────────────────────────┐    │
│  │                            │    │
│  │    [Spinner Animation]     │    │
│  │                            │    │
│  │  Connecting to             │    │
│  │  EXPLORE-IT #12345         │    │
│  │                            │    │
│  └────────────────────────────┘    │
│                                     │
│                                     │
│         [ Cancel ]                  │
│                                     │
└─────────────────────────────────────┘
```

### Connected State

```txt
┌─────────────────────────────────────┐
│  Connected Robot                    │
│                                     │
│  ┌────────────────────────────┐    │
│  │                            │    │
│  │  [Checkmark Icon]          │    │
│  │                            │    │
│  │  EXPLORE-IT #12345         │    │
│  │                            │    │
│  │  • Firmware: v10           │    │
│  │  • Signal: Strong          │    │
│  │  • Battery: 85%            │    │
│  │                            │    │
│  │  [ Disconnect ]            │    │
│  │                            │    │
│  │  [ Switch Robot ]          │    │
│  │                            │    │
│  └────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

### Error State

```txt
┌─────────────────────────────────────┐
│  Connection Error                   │
│                                     │
│  ┌────────────────────────────┐    │
│  │                            │    │
│  │    [Error Icon]            │    │
│  │                            │    │
│  │  Connection Failed         │    │
│  │                            │    │
│  │  Could not connect to      │    │
│  │  EXPLORE-IT #12345         │    │
│  │                            │    │
│  │  • Check robot is on       │    │
│  │  • Move closer to robot    │    │
│  │  • Try again               │    │
│  │                            │    │
│  │  [ Try Again ]             │    │
│  │  [ Scan for Other Robots ] │    │
│  │                            │    │
│  └────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

## User Interactions

### Robot Selection Flow

1. User opens app or navigates to Robot tab → Shows Disconnected State
2. User taps "Scan for Robots" → Transitions to Scanning State
3. App scans for BLE devices matching EXPLORE-IT pattern → Displays found robots in list
4. User taps a robot from the list → Transitions to Connecting State
5. Connection established → Transitions to Connected State
6. Connection fails → Transitions to Error State with retry options

### Automatic Behaviors

**Auto-scan on First Launch:**

- On first app launch, automatically start scanning for robots
- Helps new users discover their robot without explicit action

**Auto-reconnect on App Resume:**

- When app resumes from background, attempt to reconnect to last connected robot
- If reconnection fails after 10 seconds, show Disconnected State
- User preference can disable auto-reconnect if manually disconnected

**Connection Timeout:**

- Connection attempts timeout after 10 seconds
- Show Error State with helpful troubleshooting tips

### Robot List Details

Each robot item in the scanning list displays:

- **Device Name:** The robot's device name (e.g., "EXPLORE-IT #12345")
- **Bluetooth Address:** The Bluetooth MAC address or device identifier
- **Signal Strength:** Visual indicator using bars (▂▃▅▇) with descriptive label:
  - Excellent Signal: All 4 bars (▂▃▅▇) - RSSI ≥ -50 dBm
  - Good Signal: 3 bars (▂▃▅▁) - RSSI ≥ -70 dBm
  - Fair Signal: 2 bars (▂▃▁▁) - RSSI ≥ -85 dBm
  - Weak Signal: 1 bar (▂▁▁▁) - RSSI < -85 dBm
- **Menu Button (⋮):** Three vertical dots on the right side for accessing robot options
- **Tap Target:** Entire card is tappable for connection

**Robot Options Menu:**

When the menu button (⋮) is tapped, a popup menu appears with:
- **Edit:** Opens dialog to edit robot configuration (future feature, currently shows alert placeholder)
- **Delete:** Removes robot from the discovered list (future feature, currently shows alert placeholder)

Both menu options are localized and currently implemented as dummy actions that display alerts.

**Sorting:**

Robots ordered by signal strength (strongest first)

### Permission Handling

**Bluetooth Permission Required:**

- If Bluetooth permission not granted, show permission request dialog
- Explain why permission is needed: "Required to discover and connect to robots"
- Provide "Open Settings" button if permission permanently denied

**Location Permission (Android):**

- Android requires location permission for BLE scanning
- Show clear explanation: "Android requires location access for Bluetooth scanning"
- No actual location data is collected or stored

**Bluetooth Disabled:**

- Detect when device Bluetooth is off
- Show alert: "Bluetooth is disabled. Please enable Bluetooth in device settings."
- Provide "Open Settings" button to deep-link to Bluetooth settings

## Connection Status Indicators

### Visual Status Indicators

- **Disconnected:** Gray Bluetooth icon with slash
- **Scanning:** Animated blue Bluetooth icon (pulsing)
- **Connecting:** Blue Bluetooth icon with spinner
- **Connected:** Green Bluetooth icon with checkmark
- **Error:** Red Bluetooth icon with exclamation mark

### Connection Information Display

When connected, display:

- Robot device name (full name or last 5 digits)
- Firmware version number
- Signal strength indicator (real-time updates)
- Battery level (if supported by firmware version)
- Connection duration timer (optional)

## Edge Cases

### No Robots Found

```txt
┌─────────────────────────────────────┐
│  No Robots Found                    │
│                                     │
│  ┌────────────────────────────┐     │
│  │                            │     │
│  │    [Search Icon]           │     │
│  │                            │     │
│  │  No robots detected        │     │
│  │                            │     │
│  │  • Make sure robot is on   │     │
│  │  • Check robot is nearby   │     │
│  │  • Try scanning again      │     │
│  │                            │     │
│  │  [ Scan Again ]            │     │
│  │  [ Troubleshooting Guide ] │     │
│  │                            │     │
│  └────────────────────────────┘     │
│                                     │
└─────────────────────────────────────┘
```

### Unexpected Disconnection

- Show toast notification: "Robot disconnected"
- Automatically transition to Disconnected State
- Offer "Reconnect" quick action in toast
- Do NOT auto-reconnect (may be intentional)

### Multiple Robots with Same Name

- Display full device ID/MAC address (last 8 characters) to differentiate
- Highlight previously connected robot with "Last connected" badge

### Connection During Program Execution

- If user disconnects while program is running on robot, show warning
- "Robot is currently running a program. Disconnect anyway?"
- Confirm before disconnecting

## Settings Integration

From this screen, users can access:

- Bluetooth troubleshooting guide (info icon in app bar)
- Connection preferences (auto-reconnect toggle)
- Robot firmware update instructions (from Connected State)
