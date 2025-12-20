# Feature Specification: Debugging View

## Overview

The Debugging View provides a visual simulation environment for testing and understanding robot programs. It serves as the execution interface for Virtual Robots (see [Feature 007: Virtual Robots](./007-VirtualRobots.md)). When a program is run on a virtual robot, this view displays the execution with the virtual robot's configuration applied. It allows students to step through program instructions, observe simulated robot movements on a grid-based canvas, and understand program execution flow through a detailed instruction list.

## Goals

- Serve as the execution interface for Virtual Robots
- Enable program simulation and visualization with virtual robot configuration
- Provide step-by-step execution control for detailed program inspection
- Show robot movement and orientation changes in a clear, top-down view
- Display compiled instructions with clear markers for program structure (subroutines, repetitions)
- Support learning by allowing users to jump to specific instructions and observe their effects
- Help users identify logic errors and unexpected behavior

## Screen Layout

The Debugging View is organized into three main sections arranged vertically:

```txt
┌────────────────────────────────────────────────────┐
│  [←] Debugging: My Obstacle Course        [•••]    │ ← Header
├────────────────────────────────────────────────────┤
│                                                    │
│              Robot Canvas (Grid View)              │
│                                                    │
│                  ┌─────────┐                       │
│                  │    ↑    │                       │
│                  │  Robot  │                       │
│                  └─────────┘                       │
│                                                    │
│          (Grid moves, robot stays centered)        │
│                                                    │
├────────────────────────────────────────────────────┤
│  [▶/⏸] [►►]  |  [Speed ▼]                         │ ← Control Bar
├────────────────────────────────────────────────────┤
│  Instruction List                                  │
│  ┌──────────────────────────────────────────────┐ │
│  │ ► [1] Move: L:100% R:100%                    │ │ ← Current
│  └──────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────┐ │
│  │   [2] Comment: Turn right                    │ │
│  └──────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────┐ │
│  │   [3] ⟳ Repeat 3x (Iteration 1)              │ │ ← Marker
│  └──────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────┐ │
│  │     [4] Move: L:50% R:100%                   │ │ ← Nested
│  └──────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────┐ │
│  │   [5] ⟳ Repeat 3x (Iteration 2)              │ │ ← Marker
│  └──────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────┐ │
│  │     [6] Move: L:50% R:100%                   │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  (Scrollable list)                                 │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Design Decisions

* **Fixed Canvas Position**: Canvas remains at the top for consistent visual reference
* **Centered Robot**: Robot stays in the center of canvas, grid moves to show lateral movement
* **Persistent Controls**: Control bar remains visible between canvas and instruction list
* **Scrollable Instructions**: Instruction list scrolls to show all compiled instructions
* **Current Instruction Highlight**: Visually distinct marker shows currently executing instruction
* **Tappable Instructions**: Any instruction can be tapped to jump directly to that point in execution

---

## Header

### Purpose

Provides context about the debugging session and navigation controls.

### Layout

```txt
┌────────────────────────────────────────────────────┐
│  [←] Debugging: My Obstacle Course        [•••]    │
└────────────────────────────────────────────────────┘
```

### Elements

**Back Button**

* Standard navigation back button
* Returns to Program Detail view
* Position: Far left

**Session Title**

* Format: "Debugging: [Program Name]"
* Font: Heading 2 (20px, semibold)
* Color: Primary text
* Clearly indicates this is a simulation session

**Menu Button (•••)**

* Standard three-dot menu icon
* Position: Far right
* Opens action sheet with:
  * Reset Simulation (restart from beginning)
  * Adjust Canvas Settings (grid size, zoom level)
  * Export Debug Session (future feature)
  * Help / Tutorial

---

## Robot Canvas

### Purpose

Provides a top-down visual representation of the robot on a grid, showing position and orientation as the program executes.

### Visual Structure

```txt
┌────────────────────────────────────────────────────┐
│  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·   │ ← Grid dots
│  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·   │
│  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·   │
│  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·   │
│  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·   │
│  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·   │
│  ·  ·  ·  ·  ·  ┌─────────┐  ·  ·  ·  ·  ·  ·  ·   │
│  ·  ·  ·  ·  ·  │    ↑    │  ·  ·  ·  ·  ·  ·  ·   │ ← Robot
│  ·  ·  ·  ·  ·  │  Robot  │  ·  ·  ·  ·  ·  ·  ·   │   (centered)
│  ·  ·  ·  ·  ·  └─────────┘  ·  ·  ·  ·  ·  ·  ·   │
│  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·   │
│  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·   │
│  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·   │
│  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·   │
│  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·   │
│  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·   │
└────────────────────────────────────────────────────┘
```

### Elements

**Grid**

* Displays a regular grid pattern using dots or light lines
* Grid spacing represents consistent distance units
* Grid extends beyond visible area and scrolls during movement
* Background color: Light neutral (matches app surface color)
* Grid color: Subtle gray, low contrast to not distract

**Robot Representation**

* Blue sports car viewed from above
* Clear directional indicator showing which way the car is facing
* Size: Proportional to grid spacing, approximately 2x2 grid units
* Position: Always centered in the canvas viewport

**Movement Behavior**

* **Lateral Movement**: Grid translates to show robot moving relative to environment
* **Rotational Movement**: Robot shape rotates in place to show orientation changes
* **Combined Movement**: Grid translates while robot rotates for curved paths
* **Animation**: Smooth transitions between positions at current step speed

**Trail (Optional Enhancement)**

* Faint line showing robot's path history
* Helps visualize complete movement pattern
* Can be toggled on/off via settings
* Fades over time or limited to recent movements

### Interaction

* **Pan/Drag**: Optional ability to pan the grid view manually while paused
* **Zoom**: Pinch to zoom or zoom controls for different detail levels
* **Reset View**: Button to re-center robot and reset zoom

### Visual Feedback

* Current position highlight or glow around robot
* Smooth animations matching step duration
* Clear visual distinction between stationary and moving states

---

## Control Bar

### Purpose

Provides playback controls for program execution and step duration configuration.

### Layout

```txt
┌────────────────────────────────────────────────────┐
│  [▶/⏸] [►►]  |  [Speed ▼]                         │
└────────────────────────────────────────────────────┘
```

### Elements

**Playback Controls (Left Side)**

* **Play/Pause [▶/⏸]**
  * Icon: Play triangle when paused, pause bars when playing
  * Action: Toggle continuous execution
  * Primary control button (larger, emphasized)
  * When playing: Automatically advances through instructions at step speed

* **Next Step [►►]**
  * Icon: Double right arrow or skip-forward icon
  * Action: Execute next instruction and pause
  * Enabled: When not at last instruction
  * Only available while paused

**Speed Control (Right Side)**

* **Speed Button [Speed ▼]**
  * Tap to toggle visibility of speed control slider
  * Shows current speed setting when collapsed
  * Icon indicates expandable control
  
* **Speed Slider (Expandable)**
  * Appears in a new row below the control bar when speed button is tapped
  * Visually connected to the speed button
  * Slider control for adjusting step duration
  * Range: 0.1 to 5.0 seconds in 0.1-second increments
  * Current value displayed to the right of slider (e.g., "2.5s")
  * Tap speed button again to hide the slider row

### Interaction Notes

* **Button States**:
  * Next disabled at program end
  * Play button transitions smoothly to Pause icon
  * All buttons provide haptic feedback on interaction
  * Speed button indicates when slider is expanded

* **Keyboard Shortcuts** (if applicable):
  * Space: Play/Pause
  * Right Arrow: Next Step
  * S: Toggle Speed Control

* **Visual Feedback**:
  * Active button states clearly indicated
  * Speed slider smoothly expands/collapses
  * Speed changes show immediate visual feedback in slider value
  * Smooth icon transitions for Play/Pause toggle

---

## Instruction List

### Purpose

Displays the compiled, flattened list of instructions that will execute on the robot, with structural markers and current execution highlighting.

### Compilation and Display

**From High-Level to Flat List**

Programs contain high-level constructs (subroutines, repetitions) but the instruction list shows a flat compilation:

* **Subroutines**: Expanded inline with start/end markers
* **Repetitions**: Unrolled with iteration markers showing loop progress
* **Comments**: Preserved in the compiled list
* **Move Instructions**: Shown as individual executable commands

### Visual Structure

```txt
┌──────────────────────────────────────────────┐
│ ► [1] Move: L:100% R:100%                    │ ← Currently executing
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│   [2] Comment: Turn right after wall         │ ← Comment (non-executable)
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│   [3] ▷ Subroutine: Forward March (start)    │ ← Subroutine marker
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│     [4] Move: L:80% R:80%                    │ ← From subroutine
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│     [5] Move: L:80% R:80%                    │
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│   [6] ◁ Subroutine: Forward March (end)      │ ← Subroutine end
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│   [7] ⟳ Repeat 3x (Iteration 1)              │ ← Repetition start
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│     [8] Move: L:50% R:100%                   │ ← First iteration
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│   [9] ⟳ Repeat 3x (Iteration 2)              │ ← Iteration marker
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│     [10] Move: L:50% R:100%                  │ ← Second iteration
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│   [11] ⟳ Repeat 3x (Iteration 3)             │ ← Iteration marker
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│     [12] Move: L:50% R:100%                  │ ← Third iteration
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│   [13] ⟲ Repeat 3x (end)                     │ ← Repetition end
└──────────────────────────────────────────────┘
```

### Instruction Card Elements

**Instruction Number**

* Sequential number in square brackets [N]
* Numbers the flat, compiled instruction list
* Helps users reference specific steps

**Current Instruction Indicator**

* Play triangle marker (►) on the left for currently executing instruction
* Highlighted background color (subtle tint)
* Automatically scrolls into view when advancing
* Clear visual distinction from other instructions

**Instruction Type and Details**

* **Move**: Shows wheel speeds (e.g., "Move: L:100% R:100%")
* **Comment**: Shows comment text with visual distinction (different style/color)
* **Markers**: Show structural information (subroutine/repetition boundaries)

**Indentation**

* Instructions inside subroutines: Indented one level
* Instructions inside repetitions: Indented one level
* Nested structures: Additional indentation per level
* Visual hierarchy matches program structure

### Markers

**Subroutine Markers**

* **Start**: `▷ Subroutine: [Name] (start)`
  * Triangle icon pointing right
  * Shows subroutine name
  * Indicates beginning of inlined code
  
* **End**: `◁ Subroutine: [Name] (end)`
  * Triangle icon pointing left
  * Marks end of subroutine instructions
  * Non-executable marker

**Repetition Markers**

* **Iteration Markers**: `⟳ Repeat Nx (Iteration N)`
  * Circular arrow icon
  * Shows total repetition count and current iteration number
  * Appears before each iteration of the loop
  * First marker shows "Iteration 1", second shows "Iteration 2", etc.
  * Helps track loop progress through iterations
  
* **End**: `⟲ Repeat Nx (end)`
  * Circular arrow icon (different direction)
  * Marks completion of all iterations
  * Non-executable marker

### Interaction

**Tap to Jump**

* Tap any instruction to jump execution to that point
* Confirmation prompt if jumping would skip significant program sections
* Updates canvas immediately to show simulated state at selected instruction
* Current instruction marker moves to tapped instruction

**Scroll Behavior**

* List automatically scrolls to keep current instruction visible
* User can manually scroll to view upcoming/previous instructions
* Auto-scroll resumes when playback continues
* Smooth scrolling animations

**Visual States**

* **Current**: Highlighted with play indicator (►) and background tint
* **Executed**: Slightly dimmed or different text color to show completion
* **Upcoming**: Normal appearance
* **Markers**: Distinct styling (italics, different color) to show non-executable nature

### Empty State

If a program has no instructions (edge case):

```txt
┌────────────────────────────────────────────────────┐
│                                                    │
│              No Instructions to Debug              │
│                                                    │
│     Add instructions to your program to see        │
│     them execute here                              │
│                                                    │
│              [Return to Editor]                    │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## Execution Flow

### Starting Debug Session

1. User enters Debugging View from Program Detail screen
2. Canvas initializes with robot at center, grid at origin
3. Instruction list compiles and displays all flattened instructions
4. First instruction is highlighted as current
5. Playback is paused by default

### Playing Program

1. User presses Play button
2. Current instruction executes with visual animation on canvas
3. After step duration elapses, next instruction becomes current
4. Process repeats until program completes or user pauses

### Stepping Through

1. While paused, user presses Next Step button
2. Current instruction executes immediately
3. Next instruction becomes current
4. Playback remains paused

### Jumping to Instruction

1. User taps an instruction in the list
2. Simulation state updates to reflect execution up to that point
3. Canvas shows robot position/orientation after selected instruction
4. Selected instruction becomes current
5. Playback remains paused (or continues if was playing)

### Program Completion

1. Last instruction completes execution
2. Playback automatically pauses
3. Visual indication that program has finished
4. Play button disabled, Previous/Reset still available

---

## Technical Notes

### Component Structure

```
DebuggingViewScreen
├─ DebugHeader
│  ├─ BackButton
│  ├─ SessionTitle
│  └─ MenuButton
├─ RobotCanvas
│  ├─ Grid
│  ├─ RobotRepresentation
│  └─ MovementTrail (optional)
├─ ControlBar
│  ├─ PreviousButton
│  ├─ PlayPauseButton
│  ├─ NextButton
│  └─ StepDurationControl
└─ InstructionList
   ├─ InstructionCard (repeating)
   │  ├─ MoveInstruction
   │  ├─ CommentInstruction
   │  └─ StructuralMarker
   └─ CurrentIndicator
```

### Program Compilation

* Parse high-level program structure
* Expand subroutines inline (prevent circular references)
* Unroll repetitions to flat sequence
* Insert structural markers
* Preserve comments in correct positions
* Generate sequential instruction numbers

### Simulation Engine

* Track robot position (x, y coordinates)
* Track robot orientation (angle in degrees)
* Calculate movement based on wheel speeds
* Update canvas with smooth animations
* Handle timing based on step duration
* Support pause/resume state

---

## Virtual Robot Configuration

This debugging view applies the virtual robot's configuration during execution:

* **Wheel Spacing**: Affects turn radius calculations based on the robot's configured spacing (50-200mm)
* **Motor Speed**: Controls movement speed based on the robot's configured speed (5-50 cm/s)
* **Robot Identity**: Header shows which virtual robot is executing the program

### Header Display

The header shows the virtual robot context:

```txt
┌────────────────────────────────────────────────────┐
│  [←] Virtual Robot 1: My Obstacle Course   [•••]   │
│      Wheel spacing: 100mm • Speed: 20 cm/s         │
└────────────────────────────────────────────────────┘
```

Shows:
- Virtual robot name
- Program name
- Configuration parameters (wheel spacing, speed)

### Navigation Flow

```
Program Detail (connected to virtual robot)
  → [Run] button
  → Debug View (with virtual robot context)
  → [←] back to Program Detail
```

---

## Related Specifications

* [Feature 004: Program Detail Screen](./004-ProgramDetail.md) - Entry point to debugging
* [Feature 003: Program List](./003-ProgramList.md) - Program selection
* [Feature 007: Virtual Robots](./007-VirtualRobots.md) - Virtual robot system
* Robot Execution Engine (TBD) - Actual robot control for comparison
