# Feature Specification: Virtual Robots

## Overview

Virtual Robots are simulated robots that can be added on demand and used as targets for uploading programs. Unlike emulators (which route through the normal communication stack), virtual robots bypass the communication layer entirely and receive the complete compiled program directly. This enables a richer debugging experience with visual feedback and execution control.

## Goals

- Provide a way to test programs without requiring physical robot hardware
- Enable on-demand creation of virtual robots with configurable parameters
- Replace the current standalone debug view with an integrated virtual robot experience
- Support program upload and execution visualization similar to physical robots
- Distinguish virtual robots from physical robots in the UI
- Allow configuration of robot behavior parameters (wheel spacing, motor speed)

## Differences from Emulators

| Aspect | Emulators | Virtual Robot |
|--------|----------|---------------|
| **Communication** | Routes through BLE stack | Direct program injection |
| **Protocol** | Uses Explore-It protocol | Bypasses protocol layer |
| **Discovery** | Appears in BLE scan | Created on demand |
| **Connection** | Requires connection handshake | Instantly available |
| **Debug View** | No debug view (same as physical robot) | Integrated visual debugger |
| **Configuration** | Fixed firmware behavior | Configurable parameters |

## Virtual Robot Types

Virtual robots come in different configurations to support different use cases:

### Standard Virtual Robot
- Default configuration matching typical physical robot
- Wheel spacing: 100mm
- Max motor speed: 100 units/sec
- Rotation rate: 90°/sec at full differential

### Configurable Parameters

Each virtual robot instance can be configured with:

1. **Wheel Spacing** (mm)
   - Range: 50-200mm
   - Default: 100mm
   - Affects turn radius

2. **Motor Speed** (cm/second)
   - Range: 5-50 cm/s
   - Default: 20 cm/s
   - Controls how fast the robot moves in simulation
   - UI displays as a scale from turtle (slow) to rocket (fast)

3. **Name**
   - User-customizable name
   - Default: "Virtual Robot 1", "Virtual Robot 2", etc.

## Architecture

### Type Definitions

**Virtual Robot Configuration** (`src/types/virtual-robot.ts`):

```typescript
export interface VirtualRobotConfig {
  wheelSpacing: number;      // 50-200mm, affects turn radius
  motorSpeed: number;        // 5-50 cm/s, controls movement speed
}

export interface VirtualRobotMetadata {
  id: string;
  name: string;
  config: VirtualRobotConfig;
  createdAt: Date;
}
```

**Extended Robot Discovery** (`src/types/robot-discovery.ts`):

```typescript
export interface DiscoveredRobot {
  id: string;
  name: string;
  signalStrength?: number;
  firmwareVersion?: number;
  protocolVersion?: 'V3' | 'V6' | 'V10';
  metadata?: Record<string, unknown>;
  
  // New field to distinguish virtual robots
  isVirtual?: boolean;
  virtualConfig?: VirtualRobotConfig;
}
```

### Service Layer

**Virtual Robot Manager** (`src/services/virtual-robot-manager.ts`):

Implements `IRobotManager` interface to provide virtual robots in the discovery flow:

- `startDiscovery()`: Returns existing virtual robots immediately
- `stopDiscovery()`: No-op for virtual robots
- `createRobot()`: Creates a virtual robot instance
- `addVirtualRobot(config)`: Add a new virtual robot to the list
- `removeVirtualRobot(id)`: Remove a virtual robot
- `updateVirtualRobot(id, config)`: Update virtual robot configuration

**Virtual Robot Implementation** (`src/services/robot/virtual-robot.ts`):

Implements `IRobot` interface:

- Maintains internal state (position, orientation, program)
- Processes uploaded programs directly (no protocol encoding)
- Provides execution state for debug view
- Supports all standard robot operations (run, stop, upload, download)
- Emits state changes for UI updates

### Integration Points

**Robot Manager Factory** (`src/services/robot-manager-factory.tsx`):

- Add "virtual" as a new manager type
- Support combined discovery (BLE + Virtual)
- Default to showing virtual robots when BLE unavailable

**Robot Discovery UI** (Robot tab):

- Show virtual robots in discovery list
- Visual distinction (icon, badge, or different color)
- "Add Virtual Robot" button to create new virtual robots
- Configuration dialog for new virtual robots

**Program Detail Screen** (`src/components/program-detail-content.tsx`):

- Support virtual robots as upload targets
- Show virtual robot connection state
- Upload to virtual robot triggers integrated debug view

## User Interface

### Robot Discovery Screen

```
┌────────────────────────────────────────────────────┐
│  Robots                                    [Add ▼] │
│                                                    │
│  [+ Add Virtual Robot]                             │
│                                                    │
│  Virtual Robots                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │ 🤖 Virtual Robot 1          [⚙️] [×] [○]     │ │
│  │    Wheel spacing: 100mm • Speed: 20 cm/s     │ │
│  └──────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────┐ │
│  │ 🤖 Speed Test Bot           [⚙️] [×] [○]     │ │
│  │    Wheel spacing: 80mm • Speed: 35 cm/s      │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  Physical Robots (Scanning...)                     │
│  ┌──────────────────────────────────────────────┐ │
│  │ 📡 Robby-4A2F              -65dBm      [○]   │ │
│  └──────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘

Legend:
[⚙️] Configure  [×] Delete  [○] Connect
🤖 Virtual robot icon
📡 Physical robot icon
```

**Virtual Robot Card Elements:**

- **Icon**: Robot emoji (🤖) or special icon to distinguish from physical robots
- **Name**: Editable robot name
- **Configuration Summary**: Shows key parameters (wheel spacing, speed)
- **Configure Button**: Opens configuration dialog
- **Delete Button**: Removes virtual robot (with confirmation)
- **Connect Button**: Connects to virtual robot (instant)

### Add Virtual Robot Dialog

```
┌────────────────────────────────────────────────────┐
│  Add Virtual Robot                          [×]    │
├────────────────────────────────────────────────────┤
│                                                    │
│  Robot Name                                        │
│  [Virtual Robot 3                              ]   │
│                                                    │
│  Configuration                                     │
│                                                    │
│  Wheel Spacing: 100 mm                             │
│  [────────●────────]                               │
│  50              150              200              │
│                                                    │
│  Motor Speed: 20 cm/s                              │
│  [────────●────────]                               │
│  🐢               🚀                                │
│  5 cm/s         50 cm/s                            │
│                                                    │
│  [Cancel]                           [Add Robot]    │
└────────────────────────────────────────────────────┘
```

**Configuration Dialog Elements:**

- **Name Input**: Text field for robot name
- **Wheel Spacing Slider**: Range 50-200mm
- **Motor Speed Slider**: Range 5-50 cm/s, displays turtle-to-rocket icons for visual feedback
- **Visual Preview**: Optional preview showing robot dimensions
- **Add Button**: Creates the virtual robot with specified configuration

### Configure Virtual Robot Dialog

Same layout as Add dialog, but:
- Title: "Configure Virtual Robot"
- Pre-filled with current values
- "Save" button instead of "Add Robot"
- Shows creation date and usage stats (optional)

### Visual Distinction in UI

Virtual robots are distinguished from physical robots through:

1. **Icon**: Robot emoji (🤖) vs. Bluetooth icon (📡)
2. **Badge**: "Virtual" badge on robot card
3. **Color Accent**: Subtle purple tint for virtual robot cards
4. **Connection State**: Shows "Ready" instead of signal strength

### Program Detail Integration

When connected to a virtual robot:

```
┌────────────────────────────────────────────────────┐
│  [Debug]  | [Upload & Run] [Run] [Upload]          │
│            (works with virtual robot)               │
└────────────────────────────────────────────────────┘
```

**Behavior Changes:**

- **Upload Button**: Uploads program to virtual robot's memory
- **Run Button**: Opens integrated debug view (replaces old debug screen)
- **Upload & Run**: Combines upload + opens debug view in running state
- **Connection State**: "Connected to Virtual Robot 1" with robot icon

## Debug View Integration

The existing Debug View (Feature 005) becomes the **Virtual Robot Execution View**:

### Conceptual Change

**Before:** 
- Standalone debug screen
- Accessed via Debug button (always available)
- Independent of robot connection

**After:**
- Debug view is the virtual robot's execution interface
- Accessed when running program on virtual robot
- Tied to specific virtual robot instance
- Shows virtual robot configuration

### Updated Debug View Header

```
┌────────────────────────────────────────────────────┐
│  [←] Virtual Robot 1: My Obstacle Course   [•••]   │
│      Wheel spacing: 100mm • Speed: 20 cm/s         │
└────────────────────────────────────────────────────┘
```

**Changes from current debug view:**
- Shows virtual robot name in title
- Displays robot configuration parameters
- Menu includes "Configure Robot" option
- Back button returns to Program Detail screen

### Navigation Flow

**Old Flow:**
```
Program Detail → [Debug] → Debug Screen (standalone simulation)
```

**New Flow:**
```
Program Detail → [Connect to Virtual Robot] → Program Detail (connected)
Program Detail (connected) → [Run] → Virtual Robot Execution View
Virtual Robot Execution View → [←] → Program Detail (connected)
```

The debug view is now exclusively used as the execution interface for virtual robots. There is no standalone debug mode.

## Implementation Strategy

### Phase 1: Core Infrastructure
1. Create type definitions for virtual robots
2. Implement VirtualRobot class (IRobot interface)
3. Implement VirtualRobotManager (IRobotManager interface)
4. Add virtual robot storage (persist virtual robots between sessions)

### Phase 2: UI Integration
1. Add "Add Virtual Robot" button to robot discovery screen
2. Create virtual robot configuration dialog
3. Update robot cards to show virtual robot distinction
4. Handle virtual robot connection flow

### Phase 3: Debug View Integration
1. Update debug view to accept virtual robot context
2. Modify program detail to upload to virtual robot
3. Connect "Run" button to debug view when virtual robot connected
4. Update navigation flow

### Phase 4: Polish & Testing
1. Add all translations (en, de, fr, it)
2. Add visual polish (icons, animations)
3. Test all user flows
4. Update documentation

## Translation Keys

New translation keys needed (add to all language files):

```json
{
  "virtualRobot": {
    "title": "Virtual Robot",
    "addButton": "Add Virtual Robot",
    "addTitle": "Add Virtual Robot",
    "configureTitle": "Configure Virtual Robot",
    "name": "Robot Name",
    "wheelSpacing": "Wheel Spacing",
    "motorSpeed": "Motor Speed",
    "configuration": "Configuration",
    "deleteConfirm": "Delete this virtual robot?",
    "deleteMessage": "This will remove the virtual robot. Programs uploaded to it will be lost.",
    "ready": "Ready",
    "connectedTo": "Connected to {name}",
    "executionView": "{name}: {program}",
    "configureRobot": "Configure Robot"
  }
}
```

## File Changes Summary

### New Files
- `docs/spec/features/007-VirtualRobots.md` - This specification
- `src/types/virtual-robot.ts` - Virtual robot types
- `src/services/virtual-robot-manager.ts` - Virtual robot manager
- `src/services/robot/virtual-robot.ts` - Virtual robot implementation
- `src/components/virtual-robot-config-dialog.tsx` - Configuration UI

### Modified Files
- `src/types/robot-discovery.ts` - Add isVirtual field
- `src/services/robot-manager-factory.tsx` - Add virtual robot manager
- `src/app/debug-program.tsx` - Accept virtual robot context
- `src/components/program-detail-content.tsx` - Support virtual robot upload
- `src/i18n/locales/*.json` - Add translations
- `docs/spec/features/005-DebuggingView.md` - Update to reference virtual robots

## Open Questions

1. **Persistence**: Should virtual robots persist between app sessions?
   - **Recommendation**: Yes, store in same storage as programs
   
2. **Limits**: Should there be a limit on number of virtual robots?
   - **Recommendation**: No hard limit, but suggest 5-10 for UX

3. **Default Creation**: Should app create a default virtual robot on first launch?
   - **Recommendation**: Yes, create "My First Robot" on first launch

4. **Configuration Presets**: Should we offer preset configurations?
   - **Recommendation**: Future enhancement, not MVP

5. **Sharing**: Can virtual robots be shared between users?
   - **Recommendation**: No, local only for MVP

## Success Criteria

- ✅ Users can create virtual robots on demand
- ✅ Virtual robots can be configured with custom parameters
- ✅ Virtual robots are visually distinct from physical robots
- ✅ Programs can be uploaded to virtual robots
- ✅ Running program on virtual robot opens debug view
- ✅ Debug view shows virtual robot configuration
- ✅ All features are fully localized
- ✅ Virtual robots persist between sessions
- ✅ No regression in existing robot or debug functionality

## Related Specifications

- [Feature 002: Robot Management](./002-RobotManagement.md)
- [Feature 004: Program Detail Screen](./004-ProgramDetail.md)
- [Feature 005: Debugging View](./005-DebuggingView.md)
