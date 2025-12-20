# Feature 004: Program Detail Screen

## Implementation Status

✅ **Fully Implemented** - All core features described in this specification are implemented and functional.

### Current Implementation Highlights

- ✅ Fixed control bar with debug and robot control buttons
- ✅ Editable program name with inline editing
- ✅ Four instruction types: Move, Comment, Subroutine, Repetition
- ✅ Drag-and-drop reordering (via long-press)
- ✅ Insertion buttons between all instructions
- ✅ Visual feedback and animations
- ✅ Nested repetitions (up to 3 levels) with color coding
- ✅ Expand/collapse instruction cards
- ✅ Program compilation and error detection
- ✅ Responsive layout (embedded in tablet view or full-screen on phone)

### Implementation Files

**Core Components:**
- `src/components/program-detail-content.tsx` (616 lines) - Main detail view logic
- `src/app/program-detail.tsx` - Full-screen wrapper for phone layout

**Subcomponents:**
- `src/components/program-detail/fixed-control-bar.tsx` - Top control bar
- `src/components/program-detail/program-header.tsx` - Editable name header
- `src/components/program-detail/program-header-options-menu.tsx` - Duplicate/delete menu
- `src/components/program-detail/instruction-list.tsx` - Scrollable instruction list
- `src/components/program-detail/instruction-type-picker.tsx` - Modal for selecting instruction type
- `src/components/program-detail/instruction-options-menu.tsx` - Per-instruction actions
- `src/components/program-detail/program-picker.tsx` - Subroutine selection modal
- `src/components/program-detail/compilation-errors-view.tsx` - Error display

**Instruction Cards:**
- `src/components/program-detail/base-instruction-card.tsx` - Shared card UI
- `src/components/program-detail/move-instruction-card.tsx` - Motor control
- `src/components/program-detail/comment-instruction-card.tsx` - Text notes
- `src/components/program-detail/subroutine-instruction-card.tsx` - Program calls
- `src/components/program-detail/repetition-instruction-card.tsx` - Loop structures

**Services:**
- `src/services/program-compilation.ts` - Validates and compiles programs
- `src/services/program-references.ts` - Tracks subroutine dependencies
- `src/services/program-storage.ts` - Persistence layer

**Hooks:**
- `src/hooks/use-program.tsx` - Program loading, editing, and compilation state

## Overview

The Program Detail screen provides a comprehensive interface for viewing, editing, and running robot programs. It features a fixed control bar at the top for quick access to debugging and robot control functions, followed by an editable program name and a scrollable list of program instructions. The interface supports four types of instructions (Move, Comment, Subroutine, Repetition) with intuitive drag-and-drop reordering and easy insertion at any position.

## Screen Organization

### Layout Structure

The Program Detail screen uses a **single-screen layout** with a fixed control bar at the top and scrollable content below:

```diagram
┌────────────────────────────────────────────────────┐
│  [Debug]    | [Upload & Run] [Run] [Upload] [Stop] │ ← Fixed Control Bar
│                                      (robot btns)   │   (Always visible)
├────────────────────────────────────────────────────┤
│  [←] My Obstacle Course Program            [•••]   │ ← Header
│      (tap to edit name)                            │
├────────────────────────────────────────────────────┤
│                                                    │
│  [+ Add Instruction]                               │ ← Add at top
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │ [≡] Move: L:80% R:80%              [×] [⋮]  │ │ ← Instruction 1
│  └──────────────────────────────────────────────┘ │
│  [+ Add Instruction]                               │ ← Add between
│  ┌──────────────────────────────────────────────┐ │
│  │ [≡] Comment: Turn right after...   [×] [⋮]  │ │ ← Instruction 2
│  └──────────────────────────────────────────────┘ │
│  [+ Add Instruction]                               │
│  ┌──────────────────────────────────────────────┐ │
│  │ [≡] Subroutine: Forward March      [×] [⋮]  │ │ ← Instruction 3
│  └──────────────────────────────────────────────┘ │
│  [+ Add Instruction]                               │
│  ┌──────────────────────────────────────────────┐ │
│  │ [≡] 🔁 Repeat 3x ──────────────┐   [×] [⋮]  │ │ ← Repetition header
│  │ │                               │            │ │
│  │ │  ┌────────────────────────┐   │            │ │
│  │ │  │ [≡] Move: L:50% R:50%  │   │   [×] [⋮] │ │ ← Nested instruction
│  │ │  └────────────────────────┘   │            │ │
│  │ │  [+ Add Instruction]          │            │ │
│  │ │  ┌────────────────────────┐   │            │ │
│  │ │  │ [≡] Move: L:100% R:0%  │   │   [×] [⋮] │ │
│  │ │  └────────────────────────┘   │            │ │
│  │ │                               │            │ │
│  │ └───────────────────────────────┘            │ │ ← Repetition footer
│  └──────────────────────────────────────────────┘ │
│  [+ Add Instruction]                               │ ← Add at end
│                                                    │
│  (Scrollable content)                              │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Design Decisions

* **Fixed Control Bar**: Stays at the top while scrolling, providing constant access to execution controls
* **Editable Program Name**: Directly in the header for quick renaming
* **Inline Add Buttons**: Add instructions at any position without modal dialogs
* **Drag Handles**: Visual [≡] indicator for drag-and-drop reordering
* **Repetition Visual Structure**: Color-coded header/footer with connecting line to show nesting depth (max 3 levels)

## Fixed Control Bar

### Purpose

The control bar provides persistent access to debugging and robot execution controls throughout the editing session. It remains fixed at the top of the screen and does not scroll away with the program content.

### Layout

```diagram
┌────────────────────────────────────────────────────┐
│  [Debug]    | [Upload & Run] [Run] [Upload] [Stop] │
│  Always     │  Robot Interaction Group              │
│  visible    │  (always visible)                     │
└────────────────────────────────────────────────────┘
```

### Elements

**Debug Button (Left Side)**

* Label: "Debug" with bug icon 🐛
* Background: Playful Purple (#9D4EDD)
* Always visible regardless of robot connection
* Action: Opens debug session for program simulation
* Position: Left side of control bar
* Style: Secondary button style with icon

**Robot Interaction Group (Right Side)**

* **Visual Distinction**: Grouped together with subtle background or border to show they're related
* **Visibility**: Always visible
* **Buttons:**
  * **Connect**: Primary action button (explore-it Red), jumps to Robot tab to connect when no robot connected
  * **Upload & Run**: Primary action button (explore-it Red), combines upload + immediate execution (visible when robot connected)
  * **Run**: Secondary button (Curious Blue), runs currently uploaded program (visible when robot connected)
  * **Upload**: Secondary button (Curious Blue), uploads program without running (visible when robot connected)
  * **Stop**: Warning/error button (Error Coral), emergency stop for running program (visible when program is running)
  * **Disabled States**: Run button disabled if no program uploaded; Stop button disabled if not running

**No Robot Connected:**

```diagram
┌────────────────────────────────────────────────────┐
│  [Debug]  | [Connect Robot]                        │
│                                                    │
└────────────────────────────────────────────────────┘
```

Shows Debug button and Connect button. The Connect button navigates to the Robot tab for Bluetooth connection.

**Robot Connected (Not Running):**

```diagram
┌────────────────────────────────────────────────────┐
│  [Debug]  | [Upload & Run] [Run] [Upload]          │
│                                                    │
└────────────────────────────────────────────────────┘
```

Shows all control buttons. The available actions indicate the robot is connected and ready.

**Program Running:**

```diagram
┌────────────────────────────────────────────────────┐
│  [Debug]  | [Stop]                                 │
│                                                    │
└────────────────────────────────────────────────────┘
```

Shows Debug and Stop buttons. The presence of Stop indicates program execution in progress.

### Interaction Notes

* **Fixed Position**: Uses sticky positioning or similar technique to remain visible during scroll
* **Z-Index**: Appears above scrollable content
* **Responsive Behavior**: On narrow screens, buttons may show icons only or wrap to two rows
* **Button States**:
  * Connect: Visible only when no robot connected, navigates to Robot tab
  * Upload & Run: Visible when robot connected, enabled when program has changes
  * Run: Visible when robot connected, enabled when program already uploaded
  * Upload: Visible when robot connected, always enabled
  * Stop: Visible only when program is currently running on robot
  * Debug: Always visible and enabled
* **Connection State**: Implicit from button availability - no explicit connection indicator needed

### Visual Design

* **Background**: Slightly darker than main background (Surface variant #F5F5F5) to distinguish from content
* **Border**: Subtle bottom border to separate from content below
* **Height**: Adequate for touch targets (minimum 56px)
* **Padding**: 12px horizontal, 8px vertical
* **Shadow**: Subtle shadow to create elevation (Level 1: 0 1px 3px rgba(29, 53, 87, 0.08))

---

## Program Header

### Purpose

Displays the program name with inline editing capability and provides access to additional program actions.

### Layout

```diagram
┌────────────────────────────────────────────────────┐
│  [←] My Obstacle Course Program            [•••]   │
│      (tap to edit name)                            │
│      12 instructions • Last modified: 2h ago       │
└────────────────────────────────────────────────────┘
```

### Elements

**Back Button**

* Standard navigation back button
* Returns to program list
* Position: Far left

**Program Name**

* Font: Heading 1 (24px, bold)
* Color: Primary text
* Editable: Tap to enter edit mode
* Edit Mode:
  * Text becomes editable input field
  * Show cursor and keyboard
  * Save on Enter or blur
  * Cancel on Esc
  * Validation: Name required, max 100 characters

**Program Metadata (Subtitle)**

* Font: Caption (14px)
* Color: Secondary text
* Content: "X instructions • Last modified: [relative time]"
* Updates automatically as program changes

**Menu Button (•••)**

* Standard three-dot menu icon
* Position: Far right
* Opens action sheet with:
  * Duplicate Program
  * Share/Export Program
  * Delete Program
  * Program Information (metadata)

### Interaction Notes

* **Name Editing**:
  * Single tap on name to edit
  * Show placeholder if name is empty
  * Auto-save on blur or Enter
  * Show validation errors inline
* **Metadata**:
  * Non-editable
  * Updates in real-time as instructions are added/removed/modified
  * Relative timestamps (e.g., "2 hours ago", "Yesterday")

## Instruction List

### Purpose

The core editing area where users build their program by adding, editing, reordering, and removing instructions.

### Layout Structure

```
┌────────────────────────────────────────────────────┐
│  [+ Add Instruction]                    ← Top      │
│  ┌──────────────────────────────────────────────┐ │
│  │ [≡] Instruction 1 details         [×] [⋮]   │ │
│  └──────────────────────────────────────────────┘ │
│  [+ Add Instruction]                    ← Between │
│  ┌──────────────────────────────────────────────┐ │
│  │ [≡] Instruction 2 details         [×] [⋮]   │ │
│  └──────────────────────────────────────────────┘ │
│  [+ Add Instruction]                    ← Between │
│  ┌──────────────────────────────────────────────┐ │
│  │ [≡] Instruction 3 details         [×] [⋮]   │ │
│  └──────────────────────────────────────────────┘ │
│  [+ Add Instruction]                    ← End     │
└────────────────────────────────────────────────────┘
```

### Add Instruction Buttons

**Appearance:**

* Label: "+ Add Instruction"
* Style: Subtle, secondary appearance (not primary action)
* Color: Curious Blue text with transparent background
* Position: Between every instruction and at the beginning/end
* Size: Full-width, minimum touch target 44px height
* Icon: Plus icon (+) before text

**Behavior:**

* Tap to show instruction type selector
* Selector appears as a modal or bottom sheet with four options:
  * Move (motor icon)
  * Comment (text/note icon)
  * Subroutine (link/chain icon)
  * Repetition (loop/repeat icon)
* After selecting type, appropriate editor appears
* New instruction inserted at the position of the tapped button
* List automatically scrolls to show new instruction

**Visual Feedback:**

* Hover/touch feedback on button
* Smooth animation when new instruction appears
* Clear visual connection between button and resulting instruction

### Instruction Card Common Elements

Each instruction appears in a card with consistent structure:

```
┌──────────────────────────────────────────────┐
│ [≡] Instruction Type & Details    [×] [⋮]   │
│     Additional parameters/content            │
└──────────────────────────────────────────────┘
```

**Left Side:**

* **Drag Handle [≡]**: Visible drag handle icon for reordering
  * Icon: Three horizontal lines (hamburger menu style)
  * Color: Secondary text
  * Touch target: 44x44px minimum
  * Long press or drag to reorder

**Center:**

* **Instruction Content**: Type-specific display and editing controls
* **Type Indicator**: Visual distinction for each instruction type (icon + label)

**Right Side:**

* **Delete Button [×]**:
  * Icon: X or trash icon
  * Color: Error color on hover
  * Action: Remove instruction (with confirmation for complex instructions)
  * Touch target: 44x44px minimum
* **More Options [⋮]**:
  * Icon: Three vertical dots
  * Opens context menu with:
    * Duplicate
    * Copy
    * Cut
    * Advanced settings (if applicable)

### Drag and Drop Reordering

**Interaction:**

1. Long press on drag handle [≡] to enter drag mode
2. Instruction card lifts up with elevated shadow
3. Drag vertically to reorder
4. Other instructions shift to make space
5. Drop zone indicated with highlighted area or insertion line
6. Release to drop in new position
7. Smooth animation to final position

**Visual Feedback:**

* **Dragging Card**: Elevated shadow (Level 3), slightly larger scale (1.05x)
* **Other Cards**: Animate smoothly to make space
* **Drop Zone**: Highlighted with explore-it Red border or background tint
* **Placeholder**: Ghost/outline showing original position

**Mobile Considerations:**

* Adequate drag handle size for finger touch
* Clear visual feedback during drag
* Haptic feedback on lift and drop
* Auto-scroll when dragging near screen edges

### Empty State

When no instructions exist:

```
┌────────────────────────────────────────────────────┐
│                                                    │
│              No Instructions Yet                   │
│                                                    │
│     Your program is empty. Add instructions        │
│     to tell the robot what to do!                  │
│                                                    │
│              [+ Add First Instruction]             │
│                                                    │
└────────────────────────────────────────────────────┘
```

* Centered content
* Friendly, encouraging message
* Large "Add First Instruction" button
* Icon illustration (robot waiting)

---

## Instruction Type: Move

### Purpose

Controls the robot's wheel motors, allowing movement forward, backward, turning, and curved paths.

### Display (Collapsed)

```
┌──────────────────────────────────────────────┐
│ [≡] 🚗 Move: L:80% R:80%         [×] [⋮]    │
└──────────────────────────────────────────────┘
```

### Display (Expanded)

```
┌──────────────────────────────────────────────┐
│ [≡] 🚗 Move                      [×] [⋮]    │
│                                              │
│    Left Wheel Speed                          │
│    [────●────────────] 80%                   │
│    0%                           100%         │
│                                              │
│    Right Wheel Speed                         │
│    [────●────────────] 80%                   │
│    0%                           100%         │
│                                              │
│    Duration (optional)                       │
│    [2.5] seconds                             │
│                                              │
│    [Collapse ▲]                              │
└──────────────────────────────────────────────┘
```

### Elements

**Left Wheel Speed Slider**

* Range: 0-100%
* Default: 50%
* Negative values for backward (or separate direction toggle)
* Visual indicator showing direction (forward/backward)
* Live preview of resulting movement (animation or diagram)

**Right Wheel Speed Slider**

* Range: 0-100%
* Default: 50%
* Independent from left wheel
* Same visual treatment as left slider

**Duration (Optional)**

* Number input field
* Unit: Seconds
* Optional: If not set, movement is continuous until next instruction
* Validation: Positive numbers only, max reasonable duration

**Movement Preview**

* Small diagram showing robot direction based on wheel speeds
* Examples:
  * Both 80%: Forward arrow
  * Left 0%, Right 80%: Curved right arrow
  * Left 80%, Right 0%: Curved left arrow
  * Left 80%, Right -80%: Spin right indicator

### Interaction

* Tap instruction to expand/collapse
* Drag sliders to adjust speeds
* Numeric input option for precise values
* Sliders provide haptic feedback at 0%, 50%, 100%
* Real-time validation and feedback

### Presets (Optional Enhancement)

* Forward: L:100%, R:100%
* Turn Right: L:100%, R:0%
* Turn Left: L:0%, R:100%
* Spin Right: L:100%, R:-100%
* Spin Left: L:-100%, R:100%

---

## Instruction Type: Comment

### Purpose

Allows students to add notes and explanations within their program for documentation and learning.

### Display (Collapsed)

```
┌──────────────────────────────────────────────┐
│ [≡] 💭 Comment: Turn right after...  [×] [⋮]│
└──────────────────────────────────────────────┘
```

### Display (Expanded)

```
┌──────────────────────────────────────────────┐
│ [≡] 💭 Comment                   [×] [⋮]    │
│                                              │
│    ┌────────────────────────────────────┐   │
│    │ Turn right after detecting the     │   │
│    │ wall. This helps the robot avoid   │   │
│    │ obstacles.                         │   │
│    │                                    │   │
│    └────────────────────────────────────┘   │
│                                              │
│    [Collapse ▲]                              │
└──────────────────────────────────────────────┘
```

### Elements

**Comment Text**

* Multi-line text input
* Placeholder: "Add a note about this step..."
* Character limit: 500 characters
* Formatting: Plain text (no rich text in v1)
* Visual style: Slightly different background to distinguish from code

**Collapsed View**

* Shows first ~40 characters with ellipsis (...)
* Tap to expand
* Icon: Comment/note icon 💭

**Expanded View**

* Full text visible
* Auto-expanding text area
* Collapse button to return to compact view

### Interaction

* Tap to expand/edit
* Type directly in expanded view
* Auto-save on blur
* No validation beyond character limit
* Can be empty (acts as visual separator)

### Visual Design

* Lighter background than executable instructions (to show it's non-code)
* Italicized or different font style
* Comment icon clearly visible
* Distinct color scheme (Info blue tint)

---

## Instruction Type: Subroutine

### Purpose

Calls another program saved on the device, enabling code reuse and modular program design.

### Display (Collapsed)

```
┌──────────────────────────────────────────────┐
│ [≡] 🔗 Subroutine: Forward March  [×] [⋮]   │
└──────────────────────────────────────────────┘
```

### Display (Expanded)

```
┌──────────────────────────────────────────────┐
│ [≡] 🔗 Subroutine                [×] [⋮]    │
│                                              │
│    Select Program:                           │
│    [Forward March            ▼]              │
│                                              │
│    This program contains:                    │
│    • 8 instructions                          │
│    • Estimated duration: ~12 seconds         │
│                                              │
│    [Preview Program →]                       │
│                                              │
│    [Collapse ▲]                              │
└──────────────────────────────────────────────┘
```

### Elements

**Program Selector**

* Dropdown/picker showing all saved programs
* Excludes:
  * Current program (prevent self-reference)
  * Programs that would create circular references
* Shows program name and metadata
* Search/filter for large program lists

**Program Information**

* Instruction count
* Estimated duration
* Last modified date
* Brief description (if available)

**Preview Button**

* Opens read-only view of selected program
* Helps students understand what will execute
* Shows full instruction list
* Modal or side panel presentation

### Interaction

* Tap to expand
* Select program from dropdown
* Preview selected program before committing
* Validation:
  * Must select a valid program
  * Detect circular references
  * Warn if selected program was deleted or modified

### Error Handling

**Selected Program Deleted:**

```
┌──────────────────────────────────────────────┐
│ [≡] 🔗 Subroutine: [Missing]     [×] [⋮]    │
│     ⚠️ This program no longer exists         │
└──────────────────────────────────────────────┘
```

**Circular Reference Detected:**

* Prevent selection of programs that would create loops
* Show helpful message: "Cannot call this program - it would create a circular reference"

---

## Instruction Type: Repetition

### Purpose

Repeats a sequence of instructions multiple times, supporting nested repetitions up to 3 levels deep. Repetitions use a distinct visual structure with a colored header/footer and connecting line to clearly show the nesting level and boundaries.

### Visual Structure

Repetitions are displayed with:

* **Header**: Shows repetition count and drag/delete controls
* **Connecting Line**: Vertical colored line on the left connecting header to footer
* **Nested Instructions**: Slightly indented instruction list within the repetition
* **Footer**: Closing line at the bottom
* **Color Coding**: Each nesting level has a distinct color to make structure clear

**Nesting Levels & Colors:**

* **Level 1** (outermost): Curious Blue (#457B9D)
* **Level 2** (nested once): Creative Orange (#F4A261)
* **Level 3** (nested twice): Playful Purple (#9D4EDD)
* **Maximum nesting depth**: 3 levels

### Display (Collapsed)

```
┌──────────────────────────────────────────────┐
│ [≡] 🔁 Repeat 3x (2 instructions) [×] [⋮]   │
└──────────────────────────────────────────────┘
```

Shows the repetition count and number of nested instructions. Can be expanded to see/edit contents.

### Display (Expanded - Single Level)

```
┌──────────────────────────────────────────────┐
│ [≡] 🔁 Repeat 3x ──────────────┐   [×] [⋮]  │ ← Header (Blue)
│ │                               │            │
│ │  [+ Add Instruction]          │            │
│ │                               │            │
│ │  ┌────────────────────────┐   │            │
│ │  │ [≡] Move: L:50% R:50%  │   │   [×] [⋮] │ ← Nested instruction
│ │  └────────────────────────┘   │            │
│ │  [+ Add Instruction]          │            │
│ │                               │            │
│ │  ┌────────────────────────┐   │            │
│ │  │ [≡] Move: L:100% R:0%  │   │   [×] [⋮] │ ← Nested instruction
│ │  └────────────────────────┘   │            │
│ │  [+ Add Instruction]          │            │
│ │                               │            │
│ └───────────────────────────────┘            │ ← Footer (Blue)
└──────────────────────────────────────────────┘
```

The vertical line `│` connects the header to the footer. All instructions inside are slightly indented to show they're part of the repetition.

### Display (Nested Repetitions - 2 Levels)

```
┌──────────────────────────────────────────────┐
│ [≡] 🔁 Repeat 2x ──────────────┐   [×] [⋮]  │ ← Level 1 Header (Blue)
│ │                               │            │
│ │  ┌────────────────────────┐   │            │
│ │  │ [≡] Move: L:100% R:100%│   │   [×] [⋮] │
│ │  └────────────────────────┘   │            │
│ │  [+ Add Instruction]          │            │
│ │                               │            │
│ │  [≡] 🔁 Repeat 3x ────────┐   │   [×] [⋮]  │ ← Level 2 Header (Orange)
│ │  │                         │   │            │
│ │  │  ┌──────────────────┐   │   │            │
│ │  │  │ [≡] Move: L:50%  │   │   │   [×] [⋮] │
│ │  │  │      R:-50%      │   │   │            │
│ │  │  └──────────────────┘   │   │            │
│ │  │  [+ Add Instruction]    │   │            │
│ │  │                         │   │            │
│ │  └─────────────────────────┘   │            │ ← Level 2 Footer (Orange)
│ │                               │            │
│ │  [+ Add Instruction]          │            │
│ │                               │            │
│ └───────────────────────────────┘            │ ← Level 1 Footer (Blue)
└──────────────────────────────────────────────┘
```

Each nesting level uses a different color for its header, footer, and connecting line. The indentation increases with each level.

### Display (Maximum Nesting - 3 Levels)

```
┌──────────────────────────────────────────────┐
│ [≡] 🔁 Repeat 2x ──────────────┐   [×] [⋮]  │ ← Level 1 (Blue)
│ │                               │            │
│ │  [≡] 🔁 Repeat 3x ────────┐   │   [×] [⋮]  │ ← Level 2 (Orange)
│ │  │                         │   │            │
│ │  │  [≡] 🔁 Repeat 4x ──┐   │   │   [×] [⋮]  │ ← Level 3 (Purple)
│ │  │  │                  │   │   │            │
│ │  │  │  ┌────────────┐  │   │   │            │
│ │  │  │  │ [≡] Move   │  │   │   │   [×] [⋮] │
│ │  │  │  └────────────┘  │   │   │            │
│ │  │  │                  │   │   │            │
│ │  │  └──────────────────┘   │   │            │ ← Level 3 (Purple)
│ │  │                         │   │            │
│ │  └─────────────────────────┘   │            │ ← Level 2 (Orange)
│ │                               │            │
│ └───────────────────────────────┘            │ ← Level 1 (Blue)
└──────────────────────────────────────────────┘
```

Maximum nesting is 3 levels. Attempting to add a 4th level repetition shows an error message.

### Elements

**Repetition Header**

* Drag handle [≡] for reordering the entire repetition block
* Repetition icon 🔁
* Editable count: "Repeat [3]x"
* Delete [×] and more options [⋮] buttons
* Right-side border/line in nesting level color

**Repetition Count Input**

* Inline editable number
* Range: 1-100 (reasonable limit)
* Default: 2
* Validation: Positive integers only
* Shows warning for very high counts (>50)

**Connecting Line**

* Vertical line connecting header to footer
* Color matches nesting level
* Width: 2-3px
* Positioned on left side of nested content area

**Nested Instructions Area**

* Slightly indented (8-12px) from parent level
* Contains full instruction list with same capabilities:
  * [+ Add Instruction] buttons at all positions
  * Reorderable instructions via drag handles
  * All instruction types supported (Move, Comment, Subroutine, Repetition)
* Lighter background tint to distinguish from parent level

**Repetition Footer**

* Horizontal line closing the repetition block
* Same color as header and connecting line
* Connects to vertical line
* No interactive elements (purely visual closure)

### Color Palette

```
Level 1 (Blue):   #457B9D (Curious Blue)
Level 2 (Orange): #F4A261 (Creative Orange)
Level 3 (Purple): #9D4EDD (Playful Purple)
```

These colors are from the app's defined color palette and provide good contrast while being visually distinct.

### Interaction

**Expand/Collapse:**

* Tap on repetition header to toggle between collapsed and expanded
* Collapsed view shows count and number of nested instructions
* Expanded view shows full instruction list for editing

**Edit Repetition Count:**

* Click/tap on the count number in header
* Becomes editable input field
* Save on Enter or blur
* Validate and show error for invalid values

**Add Instructions:**

* Same [+ Add Instruction] buttons as main program
* Scoped to this repetition's instruction list
* Shows instruction type selector modal

**Reorder Instructions:**

* Use drag handles [≡] to reorder within repetition
* Can drag instructions in/out of repetition blocks
* Visual feedback shows valid drop zones

**Drag Entire Repetition:**

* Grab repetition header's drag handle [≡]
* Moves entire block with all nested content
* Shows size indicator during drag

**Delete Repetition:**

* Click delete button [×] in header
* Shows confirmation: "Delete repetition with X instructions?"
* Removes entire block including nested content

**Nesting Limit:**

* When at level 3, "Repetition" option is disabled in instruction type selector
* Show message: "Maximum nesting depth (3) reached"
* Existing level 3 repetitions remain editable

### Collapsed State Summary

Shows: "Repeat Nx (Y instructions)" where:

* N = repetition count
* Y = total number of nested instructions (not counting sub-nested)

Example: `🔁 Repeat 3x (5 instructions)`

### Visual Design Notes

**Header Styling:**

* Background: Subtle tint of level color (10% opacity)
* Border: 2px solid level color on right side
* Font weight: 600 (semibold) for "Repeat Nx"
* Icon: 24px repetition icon in level color

**Connecting Line:**

* Solid line, 3px width
* Color: Full opacity of level color
* Margin: 8px from nested content

**Footer Styling:**

* Height: 3px solid line
* Color: Same as connecting line
* Connects flush with vertical line
* Extends partially to the right (not full width)

**Nested Content Area:**

* Background: Level color at 3% opacity
* Padding: 8px
* Border radius: 0px (square corners for cleaner lines)

**Indentation:**

* Level 1: 12px inset
* Level 2: 24px inset (12px additional)
* Level 3: 36px inset (12px additional)

### Accessibility

* Screen readers announce: "Repetition block, repeat N times, contains Y instructions, nesting level L"
* Keyboard navigation: Tab to repetition header, Enter to expand/collapse
* Focus indicators visible on all interactive elements
* Color not sole indicator - line structure also conveys nesting
* High contrast mode: Lines become thicker and higher contrast

### Error Handling

**Empty Repetition:**

* Allowed but shows warning: "Empty repetition - add instructions or delete"
* Warning icon in header

**Nesting Limit Reached:**

* Disable "Repetition" in type selector at level 3
* Show tooltip: "Maximum nesting depth reached"

**Very High Count:**

* Warning for counts >50: "High repetition count may cause long execution time"
* Allow but highlight in warning color

**Circular References via Subroutines:**

* Validate when adding subroutine inside repetition
* Prevent infinite loops through subroutine calls

---

## Technical Notes

### Component Structure

```
ProgramDetailScreen
├─ FixedControlBar
│  ├─ DebugButton
│  └─ RobotControlGroup
│     ├─ UploadAndRunButton
│     ├─ RunButton
│     ├─ UploadButton
│     └─ StopButton
├─ ProgramHeader
│  ├─ BackButton
│  ├─ EditableProgramName
│  └─ MenuButton
├─ InstructionList
│  ├─ AddInstructionButton (multiple)
│  └─ InstructionCard (repeating)
│     ├─ MoveInstruction
│     ├─ CommentInstruction
│     ├─ SubroutineInstruction
│     └─ RepetitionInstruction
│        └─ InstructionList (nested)
└─ ActionSheet (menu)
```

---

## Program Compilation and Validation

### Compilation Process

**When Compilation Runs:**
- Automatically when program is loaded
- After any instruction changes (add, delete, modify, reorder)
- Before program upload to robot
- Uses `useProgram` hook with `compile: true` option

**Compilation Service:** `src/services/program-compilation.ts`

**Validation Checks:**
1. **Instruction Limit:** Maximum 100 instructions (including nested)
2. **Nesting Depth:** Maximum 3 levels of repetitions
3. **Cyclic Dependencies:** Detects circular subroutine references
4. **Program References:** Validates subroutine targets exist
5. **Empty Repetitions:** Warns about repetitions with no instructions

### Error Display

**Compilation Errors View:** `src/components/program-detail/compilation-errors-view.tsx`

**Error Types:**
- **Instruction Limit Exceeded:** Program has more than 100 total instructions
- **Cyclic Dependency:** Subroutine call creates infinite loop
- **Missing Program:** Subroutine references deleted program
- **Transitive Errors:** Referenced program has compilation errors

**Error Presentation:**
- Red error banner at top of instruction list
- Shows count of errors found
- Lists all errors with clear descriptions
- Errors update in real-time as program is edited
- Prevents program upload when errors exist

**Example Error Messages:**
- "Your program is too large. Try reducing the number of repetitions!"
- "These programs would never stop calling each other."
- "The referenced program has errors: Program 'Forward March' not found"

### Program Reference Tracking

**Service:** `src/services/program-references.ts`

**Capabilities:**
- Tracks which programs are used as subroutines
- Finds all programs referencing a specific program
- Prevents deletion of referenced programs (shows warning)
- Detects circular dependencies across multiple programs

**Deletion Protection:**
When attempting to delete a program that is referenced by others:
1. System finds all referencing programs
2. Shows alert: "This program is used by X other program(s)"
3. Lists the referencing programs by name
4. Requires user confirmation to proceed
5. Deleting proceeds but may cause compilation errors in referencing programs

---

## Current UX Behaviors

### Program Name Editing

**Inline Editing:**
- Tap program name in header to edit
- Shows text input with current name
- Save on blur or Enter key
- Cancel on Escape key
- Auto-saves when user navigates away
- Name cannot be empty (defaults to "New Program")
- Maximum length: 100 characters
- Updates lastModified timestamp on save

### Instruction Management

**Adding Instructions:**
1. Tap [+ Add Instruction] button at desired position
2. Modal appears with 4 instruction type options:
   - Move (motor control icon)
   - Comment (text note icon)
   - Subroutine (link icon)
   - Repetition (loop icon)
3. Select type → appropriate editor appears
4. For subroutines: additional step to select target program
5. New instruction inserted at tapped position
6. List scrolls to show new instruction
7. New instruction auto-expands for immediate editing

**Deleting Instructions:**
- Tap [×] button on instruction card
- Simple instructions: delete immediately
- Repetitions: shows confirmation dialog with count of nested instructions
- Subroutines: checks if deletion would impact program compilation
- Updates instruction count and lastModified timestamp
- Re-compiles program automatically

**Reordering Instructions:**
1. Long press on drag handle [≡]
2. Card lifts with elevation shadow
3. Drag vertically to new position
4. Drop zones highlighted in explore-it Red
5. Other instructions animate to make space
6. Release to drop in new position
7. Haptic feedback on lift and drop (mobile)
8. Auto-saves new order
9. Re-compiles program

**Current Limitations:**
- No multi-select for batch operations
- No copy/paste between programs
- No keyboard shortcuts for common operations
- Drag-and-drop only works vertically (no reordering into/out of repetitions via drag)
- No undo/redo functionality

### Instruction Expansion

**Expandable Cards:**
- Tap anywhere on card to expand/collapse
- Collapsed: Shows summary (e.g., "Move: L:80% R:80%")
- Expanded: Shows full editing controls (sliders, inputs, etc.)
- Only one instruction expanded at a time (accordion behavior)
- Expansion state resets when leaving/returning to program
- Not persisted between sessions

### Control Bar Buttons

**Debug Button:**
- Always visible and enabled
- Opens debug session in new screen
- Simulates program execution with visual robot
- Independent of robot connection status

**Robot Control Buttons:**
- Visibility depends on robot connection state
- **No Robot Connected:** Shows "Connect" button only
  - Tapping navigates to Robot tab for Bluetooth pairing
- **Robot Connected:** Shows Upload & Run, Run, Upload buttons
  - Upload & Run: Uploads program and starts execution immediately
  - Run: Runs currently uploaded program
  - Upload: Uploads program without running
  - Run button disabled if no program uploaded to robot
- **Program Running:** Shows "Stop" button only
  - Emergency stop for active program execution

**Button States:**
- Disabled buttons are grayed out and non-interactive
- Tooltips not implemented (mobile limitation)
- Visual feedback (press animation) on all active buttons

### Program Options Menu

**Accessed via [•••] in header:**
- **Duplicate Program:** Creates copy with "(Copy)" suffix
- **Delete Program:** Shows confirmation, especially if referenced by other programs
- **Future:** Share/Export, Program Information

**Current Limitations:**
- No share/export functionality (planned)
- No program information modal (metadata view)
- Duplicate only creates shallow copy (no recursive duplication of subroutines)

---

## Known Limitations and Edge Cases

### Instruction Limits

**Maximum Instructions:**
- Hard limit: 100 total instructions (including nested)
- Enforced during compilation
- Error shown if limit exceeded
- No warning as limit is approached (could be improved)

**Maximum Nesting:**
- Repetitions can nest up to 3 levels deep
- Level 4 repetition option disabled in instruction picker
- Error shown if attempting to add at level 4

**Performance:**
- Program with 100 instructions may feel sluggish on older devices
- No virtualization for instruction list
- All instructions rendered even if off-screen

### Drag and Drop

**Implementation Notes:**
- Uses React Native Gesture Handler for drag detection
- Long press required to activate drag (prevents accidental reordering)
- Haptic feedback on iOS and Android
- Web support functional but may not match native feel

**Limitations:**
- Cannot drag instruction into/out of repetition blocks (must use cut/paste workaround)
- Cannot drag multiple instructions at once
- Cannot drag repetition to become nested inside another repetition
- Dragging very long distances may feel awkward (auto-scroll at edges helps)

### Subroutine References

**Circular Dependency Detection:**
- Detects direct cycles (A → B → A)
- Detects indirect cycles (A → B → C → A)
- Does NOT detect cycles through multiple instruction paths
- False positives possible in complex scenarios (overly conservative)

**Deletion Handling:**
- Deleting referenced program shows warning but allows deletion
- Referencing programs will show compilation error
- No automatic update or repair of broken references
- User must manually remove or replace broken subroutine calls

**Missing Programs:**
- Subroutine card shows error state if target program deleted
- Program can still be edited (but not uploaded to robot)
- No automatic cleanup of orphaned references

### Auto-Save Behavior

**What Auto-Saves:**
- Program name changes (on blur/navigation)
- Instruction additions/deletions/modifications
- Instruction reordering
- All changes to instruction parameters

**Timing:**
- Saves immediately after each change
- No debouncing or batching
- Could cause performance issues with rapid edits
- No save indicators (assumes instant success)

**Error Handling:**
- Save errors logged to console
- User not notified of save failures
- No retry mechanism
- Could result in data loss if storage full or permissions denied

### Compilation Performance

**Compilation Timing:**
- Runs synchronously on every change
- No debouncing or throttling
- With 100 instructions and multiple subroutines, could cause UI lag
- Particularly slow when checking cyclic dependencies

**Optimization Opportunities:**
- Cache compilation results
- Debounce compilation during rapid edits
- Move compilation to background worker
- Only recompile changed subtrees

### Mobile Keyboard Issues

**Known Issues:**
- Keyboard may obscure input fields on small screens
- KeyboardAvoidingView used but may not work perfectly on all devices
- No scroll-to-input on focus
- May require manual scrolling to see what you're typing

**Workarounds:**
- Use landscape orientation for more space
- Collapse other instructions to free up screen space
- Tap outside keyboard to dismiss and see result

### Tablet Layout Edge Cases

**Embedded Mode:**
- When embedded in tablet layout, back button is hidden
- Header options menu remains available
- Deletion in embedded mode updates parent list immediately
- If deleted program was selected, parent list handles selection change

**Shared State:**
- Tablet and phone modes share same data
- No special handling for concurrent edits (single device only)
- State management is straightforward due to local-only storage

---

## Related Specifications

* [Feature 003: Program List](./003-ProgramList.md)
* [Feature 002: Robot Management](./002-RobotManagement.md)
* [Feature 005: Debugging View](./005-DebuggingView.md)
* Feature TBD: Program Sharing and Export
