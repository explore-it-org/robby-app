# Feature Specification: Program List

## Overview

The Program List provides users with a structured view of all available robot programs. Displayed in the second tab of the Home Screen, it presents programs in a table format showing key metadata such as program name, last update date, and number of instructions/steps. This allows users to quickly browse their program collection and select one to view or edit. At this stage, programs are mocked data only, with actual storage mechanisms to be defined in future specifications.

## Implementation Status

✅ **Fully Implemented** - All core features described in this specification are implemented and functional.

## Goals

- Display all available programs in an organized, scannable table view
- Show essential program metadata (name, last update, instruction count) for quick identification
- Enable users to navigate to program details by tapping any entry
- Provide clear visual hierarchy and readable information density
- Support the workflow: browse programs → select program → view/edit details
- Adapt layout for tablets and large screens with side-by-side list and detail view

## Responsive Layout

The Program List adapts its layout based on screen size to provide an optimal experience on both phones and tablets.

### Phone Layout (Portrait)

On phones and narrow screens (width < 768px), the list takes up the full screen. Tapping an entry navigates to a full-screen detail view.

```txt
┌─────────────────────────────────────┐
│    explore-it Robotics              │ ← App Bar
├─────────────────────────────────────┤
│ Programs                            │ ← Section Header
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Forward March                   │ │
│ │ Updated: 2025-01-15  |  8 steps │ │
│ └─────────────────────────────────┘ │ ← Tappable Row
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Obstacle Course                 │ │
│ │ Updated: 2025-01-10  |  15 steps│ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Light Seeker                    │ │
│ │ Updated: 2024-12-28  |  12 steps│ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Dance Routine                   │ │
│ │ Updated: 2024-12-20  |  20 steps│ │
│ └─────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│   [Robot]  [Programs]               │ ← Bottom Tab Bar
└─────────────────────────────────────┘
```

### Tablet Layout (Landscape / Large Screen)

On tablets and wide screens (width ≥ 768px), the interface displays a master-detail layout with the program list on the left (40% width) and detail view on the right (60% width).

```txt
┌───────────────────────────────────────────────────────────────────────────┐
│    explore-it Robotics                                                    │
├──────────────────────────┬────────────────────────────────────────────────┤
│ Programs                 │ Forward March                                  │
├──────────────────────────┤                                                │
│ ┌──────────────────────┐ │ Type: step                                     │
│ │■Forward March        │ │ Instructions: 8 steps                          │
│ │ Updated: 2025-01-15  │ │ Created: 2025-01-10                            │
│ │ 8 steps              │ │ Last Modified: 2025-01-15                      │
│ └──────────────────────┘ │                                                │
│                          │ ┌────────────────────────────────────────────┐ │
│ ┌──────────────────────┐ │ │ Program Details                            │ │
│ │ Obstacle Course      │ │ │                                            │ │
│ │ Updated: 2025-01-10  │ │ │ This is a placeholder screen for program   │ │
│ │ 15 steps             │ │ │ details.                                   │ │
│ └──────────────────────┘ │ │                                            │ │
│                          │ │ Future features will include:              │ │
│ ┌──────────────────────┐ │ │ • Program editing                          │ │
│ │ Light Seeker         │ │ │ • Duplicate program                        │ │
│ │ Updated: 2024-12-28  │ │ │ • Delete program                           │ │
│ │ 12 steps             │ │ │ • Program execution controls               │ │
│ └──────────────────────┘ │ │ • Debugging tools                          │ │
│                          │ └────────────────────────────────────────────┘ │
│ ┌──────────────────────┐ │                                                │
│ │ Dance Routine        │ │                                                │
│ │ Updated: 2024-12-20  │ │                                                │
│ │ 20 steps             │ │                                                │
│ └──────────────────────┘ │                                                │
│                          │                                                │
├──────────────────────────┴────────────────────────────────────────────────┤
│   [Robot]  [Programs]                                                     │
└───────────────────────────────────────────────────────────────────────────┘
```

**Selected state:** The currently selected program in the list is highlighted (indicated by ■ marker in the diagram) to show which program's details are being displayed.

### Tablet Empty State

When no programs are available on tablet layout, both panes show appropriate empty state content:

```txt
┌───────────────────────────────────────────────────────────────────────────┐
│    explore-it Robotics                                                    │
├──────────────────────────┬────────────────────────────────────────────────┤
│ Programs                 │                                                │
├──────────────────────────┤                                                │
│                          │                                                │
│                          │                                                │
│                          │                                                │
│     No Programs          │          No program selected                   │
│                          │                                                │
│  Start by creating a new │      Select a program from the list to view    │
│  program                 │      its details here                          │
│                          │                                                │
│                          │                                                │
│                          │                                                │
│                          │                                                │
│                          │                                                │
│                          │                                                │
├──────────────────────────┴────────────────────────────────────────────────┤
│   [Robot]  [Programs]                                                     │
└───────────────────────────────────────────────────────────────────────────┘
```

When programs exist but none is selected, the detail pane shows "No program selected" message.

### List Entry Structure

Each program entry displays:

- **Program Name**: Primary identifier, prominently displayed
- **Last Update Date**: Shows when the program was last modified (localized short format)
- **Step Count**: Number of instructions/steps in the program, helps users understand program complexity

Entries are arranged chronologically with most recently updated programs at the top. Each row is tappable and provides visual feedback (e.g., highlight or ripple effect) on interaction.

### Empty State

```txt
┌─────────────────────────────────────┐
│    explore-it Robotics              │
├─────────────────────────────────────┤
│ Programs                            │
├─────────────────────────────────────┤
│                                     │
│                                     │
│           No Programs               │
│                                     │
│     Start by creating a new         │
│     program or importing one        │
│                                     │
│                                     │
│                                     │
├─────────────────────────────────────┤
│   [Robot]  [Programs]               │
└─────────────────────────────────────┘
```

When no programs are available, the list displays a centered empty state message indicating that users can create programs.

## Interactions

### Phone Layout Behavior

**Tap on Program Entry:**

When a user taps on any program entry on a phone/narrow screen, the app navigates to a full-screen Program Detail View (placeholder for future specification). This view will provide:

- Full program information and metadata
- Options to edit, duplicate, or delete the program
- Program execution and debugging controls
- Back button to return to the program list

The detail view specification will be defined separately and is out of scope for this document.

### Tablet Layout Behavior

**Initial State:**

When the Programs tab is first opened on a tablet, the first program in the list is automatically selected and its details are displayed in the right pane. If no programs exist, an empty state is shown in both panes.

**Tap on Program Entry:**

When a user taps on any program entry on a tablet/wide screen:

1. The tapped program becomes selected (highlighted with visual indicator)
2. The detail pane on the right immediately updates to show the selected program's details
3. No navigation occurs - both list and detail remain visible
4. Previously selected program is deselected

**Visual Feedback:**

- Selected program has distinct styling (e.g., different background color, border, or marker)
- Tapping maintains the same touch feedback (highlight/ripple) as phone layout
- Smooth transition when detail content updates

## Data Storage and Management

### Implementation Status: ✅ Fully Implemented

The program list uses a **file system-based storage** mechanism implemented via `expo-file-system`. Programs are persisted locally on the device with the following structure:

**Storage Location:** `<Documents>/Programs/<program-id>.prog/`

Each program directory contains:
- `manifest.json` - Program metadata (id, name, type, dates, instruction count)
- `instructions.json` - Ordered list of program instructions

**Program ID Format:** Human-readable IDs using the `human-id` library (e.g., "purple-deer-invite", "green-fish-dance")

### Data Structure

```typescript
interface ProgramManifest {
  id: string;
  name: string;
  type: 'step' | 'block';
  createdDate: string;      // ISO 8601 timestamp
  lastUpdate: string;       // ISO 8601 timestamp
  totalInstructionCount: number;
}

interface Program {
  id: string;
  name: string;
  type: 'step' | 'block';
  instructionCount: number;
  createdDate: Date;
  lastModified: Date;
  instructions: Instruction[];
}
```

### Loading Behavior

**List View Optimization:** When loading the program list, only metadata from `manifest.json` is loaded. Full instruction data is loaded on-demand when a program is opened for viewing/editing. This improves performance when displaying many programs.

**Sorting:** Programs are automatically sorted by `lastModified` date, with most recently modified programs appearing first.

### Implementation Files

- **Storage Service:** `src/services/program-storage.ts`
  - `loadAllPrograms()` - Loads all program metadata
  - `loadProgram(id)` - Loads full program with instructions
  - `saveProgram(program)` - Persists program to disk
  - `deleteProgram(id)` - Removes program directory
  - `createNewProgram(name)` - Creates new program with unique ID

- **List Component:** `src/components/program-list.tsx`
  - Handles both phone and tablet layouts
  - Manages program sorting and empty states
  - Integrates with program storage service

- **List Item Component:** `src/components/program-list-item.tsx`
  - Displays individual program cards
  - Shows name, last modified date, and instruction count
  - Handles selection state for tablet layout

### Known Limitations

1. **No Cloud Sync:** Programs are stored locally only. No cloud backup or cross-device synchronization.
2. **No Import/Export:** Cannot import or export programs (planned feature).
3. **No Search/Filter:** No built-in search or filtering capabilities in the list view.
4. **No Sorting Options:** Programs are always sorted by last modified date; no user-configurable sorting.
5. **Migration Path:** Storage uses legacy `expo-file-system` API. Migration to modern API (v19+) is planned but not critical.
6. **No Undo:** Deleting a program is permanent with confirmation only.

## Technical Notes

### General

- List should be scrollable when content exceeds viewport height
- Consider implementing pull-to-refresh for future sync capabilities
- Ensure adequate touch target sizes for accessibility (minimum 44x44 pts)
- Support both light and dark color schemes

### Responsive Behavior

- Use 768px as the breakpoint for switching between phone and tablet layouts
- Detect screen width changes (e.g., device rotation) and adapt layout accordingly
- On tablets, list pane should have a minimum width to ensure readability
- Detail pane should scroll independently from the list pane on tablets

### Layout Proportions (Tablet)

- Recommended split: 40% list / 60% detail (or 35% / 65% for very wide screens)
- Consider using a draggable divider in future iterations to let users customize the split
- Minimum list pane width: 320px
- Minimum detail pane width: 400px

### State Management

- Maintain selected program state when switching between tabs
- On tablets, remember which program was selected when user returns to Programs tab
- Clear selection state appropriately (e.g., if selected program is deleted)

## Current UX Behaviors

### Program Creation

**Floating Action Button (FAB):**
- Located in bottom-right corner (all platforms)
- On iOS: FAB is always visible
- On Android/Web: FAB respects bottom tab bar spacing
- Tapping FAB creates a new program with:
  - Auto-generated human-readable ID
  - Default name (e.g., "New Program")
  - Empty instruction list
  - Current timestamp for creation and modification dates

### Program Selection

**Phone Layout:**
- Tapping a program navigates to full-screen detail view
- Uses React Navigation stack navigation
- Back button returns to program list
- Navigation preserves program list scroll position

**Tablet Layout:**
- First program auto-selected on tab open (if programs exist)
- Tapping any program updates detail pane immediately
- Selected program highlighted with visual indicator
- No navigation; both panes remain visible
- Detail pane updates smoothly with transition
- Selection state persists when switching tabs

### Program Deletion

**From List (Tablet Only):**
- Programs can be deleted while viewing in detail pane
- When deleted program is selected:
  - Selection automatically moves to first available program
  - If no programs remain, shows empty state in both panes
  - List updates immediately to reflect deletion

**From Detail View (Phone):**
- Delete option available in program header menu
- Shows confirmation dialog before deletion
- After deletion, navigates back to program list
- List refreshes to reflect deleted program

### Date Formatting

**Last Modified Display:**
- Uses localized relative time format via `date-fns`
- Examples: "2 hours ago", "Yesterday", "3 days ago"
- Supports all app languages (EN, DE, FR, IT)
- Updates automatically but not in real-time (requires screen refresh)

### Edge Cases

**Concurrent Modifications:**
- No conflict resolution for concurrent edits
- Last write wins (programs are single-user on device)

**Storage Errors:**
- Failed saves show error message to user
- Corrupted program manifests are skipped during load
- Error logged to console for debugging

**Empty Program Name:**
- Program name cannot be empty
- Empty input defaults to "New Program" or preserves previous name

**Very Long Program Names:**
- Names are truncated with ellipsis in list view
- Full name visible in detail view and on hover (web)

**Large Program Lists:**
- No pagination; all programs loaded at once
- Performance may degrade with 100+ programs (not typical for educational use)
- Consider virtualized list for future optimization
