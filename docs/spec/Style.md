# explore-it Robotics App - Style Guide

## Overview

The explore-it Robotics app is designed for school children (ages 10+) learning their first steps in programming. The visual design should be **engaging, playful, and encouraging** while maintaining **clarity and professionalism** to support focused learning.

**Design Philosophy:**

- Make technology approachable and fun
- Reduce cognitive load through clear visual hierarchy
- Use color strategically to guide attention and convey meaning
- Support both focus (for programming tasks) and exploration (for learning)
- Ensure accessibility for diverse learners

## Color Palette

### Primary Colors

**explore-it Red (Primary/Focus Color)**

- Color: `#E63946` (vibrant red)
- **Usage:** Primary actions, selected states, important highlights, brand elements
- **Symbolizes:** Energy, creativity, action, discovery

**Supporting Primary**

- Color: `#FAF7F0` (soft beige background)
- **Usage:** Main background color, creates calm, warm learning environment

### Secondary/Accent Colors

**Curious Blue (Secondary)**

- Color: `#457B9D` (medium blue)
- **Usage:** Secondary actions, informational elements, links
- **Symbolizes:** Logic, structure, reliability

**Creative Orange (Accent)**

- Color: `#F4A261` (warm orange)
- **Usage:** Success states, achievements, highlights
- **Symbolizes:** Achievement, warmth, encouragement

**Playful Purple (Accent)**

- Color: `#9D4EDD` (vibrant purple)
- **Usage:** Special features, advanced options, "magic" moments
- **Symbolizes:** Imagination, creativity, exploration

### Neutral Colors

**Text Colors**

- Primary text: `#000000` (black)
- Secondary text: `#666666` (medium gray)
- Inverted text (on red): `#FFFFFF` (white)

**Background Colors**

- Primary: `#FAF7F0` (soft beige)
- Surface: `#FFFFFF` (white)
- Surface variant: `#F5F5F5` (light gray)

**Border & Divider Colors**

- Border/Divider: `#E0E0E0` (light gray)
- Subtle border: `rgba(0, 0, 0, 0.08)` (very light shadow effect)

### Semantic Colors

**Success**

- Color: `#2A9D8F` (teal green)
- **Usage:** Successful program execution, correct steps, completed tasks

**Warning**

- Color: `#F4A261` (orange, same as Creative Orange)
- **Usage:** Attention needed, review required, learning moments

**Error**

- Color: `#E76F51` (coral red, softer than primary red)
- **Usage:** Errors, invalid states, problems to fix

**Info**

- Color: `#457B9D` (blue, same as Curious Blue)
- **Usage:** Tips, hints, educational information

## Typography

### Font Family

**Primary Font: System Rounded**

- iOS: `SF Pro Rounded`
- Android: `Google Sans` or `Roboto Rounded`
- Web: `Rounded sans-serif stack`
- **Rationale:** Friendly, approachable, modern while maintaining readability

**Monospace Font (for code)**

- All platforms: System monospace stack
- **Usage:** Program instructions, step counts, technical details

### Type Scale

**Display (App Title, Welcome screens)**

- Size: 32px / 2rem
- Weight: 700 (Bold)
- Line height: 1.2
- Letter spacing: -0.5px

**Heading 1 (Screen titles)**

- Size: 24px / 1.5rem
- Weight: 700 (Bold)
- Line height: 1.3
- Letter spacing: -0.3px

**Heading 2 (Section headers)**

- Size: 20px / 1.25rem
- Weight: 600 (Semibold)
- Line height: 1.4
- Letter spacing: -0.2px

**Heading 3 (Subsections)**

- Size: 18px / 1.125rem
- Weight: 600 (Semibold)
- Line height: 1.4
- Letter spacing: 0px

**Body (Regular text)**

- Size: 16px / 1rem
- Weight: 400 (Regular)
- Line height: 1.5
- Letter spacing: 0px

**Body Emphasis (Important text)**

- Size: 16px / 1rem
- Weight: 600 (Semibold)
- Line height: 1.5
- Letter spacing: 0px

**Caption (Metadata, hints)**

- Size: 14px / 0.875rem
- Weight: 400 (Regular)
- Line height: 1.4
- Letter spacing: 0.1px
- Opacity: 0.7

**Small (Fine print)**

- Size: 12px / 0.75rem
- Weight: 400 (Regular)
- Line height: 1.4
- Letter spacing: 0.2px
- Opacity: 0.6

### Text Styles

**Program Name**

- Font: Primary (Rounded)
- Size: 18px
- Weight: 600 (Semibold)
- Color: Primary text color

**Step Count / Metadata**

- Font: Primary (Rounded)
- Size: 14px
- Weight: 400 (Regular)
- Color: Secondary text color

**Code / Instructions**

- Font: Monospace
- Size: 14px
- Weight: 400 (Regular)
- Color: Primary text with 90% opacity

## Spacing & Layout

### Spacing Scale (8px base unit)

- **xs:** 4px (0.25rem) - Tight spacing within elements
- **sm:** 8px (0.5rem) - Element padding, small gaps
- **md:** 16px (1rem) - Standard spacing between elements
- **lg:** 24px (1.5rem) - Section spacing
- **xl:** 32px (2rem) - Large section breaks
- **2xl:** 48px (3rem) - Major layout divisions
- **3xl:** 64px (4rem) - Screen-level spacing

### Layout Principles

**Card/Surface Padding**

- Standard: 16px (md)
- Compact: 12px
- Spacious: 20px

**Element Gaps**

- List items: 12px
- Grouped elements: 8px (sm)
- Sections: 24px (lg)

**Screen Margins**

- Phone: 20px
- Tablet: 32px

### Border Radius

**Rounded Corners (playful but not childish)**

- Small elements (buttons, badges): 8px
- Cards, list items: 12px
- Large surfaces: 16px
- Full rounded (pills): 999px

## Interactive Elements

### Buttons

**Primary Button (Call to Action)**

- Background: explore-it Red
- Text: White
- Padding: 12px horizontal, 16px vertical
- Border radius: 8px
- Font weight: 600 (Semibold)
- Shadow: Subtle (0 2px 4px rgba(0,0,0,0.1))
- Hover/Press: Darken 10%
- **Usage:** Main actions like "Start Program", "Save", "Run"

**Secondary Button**

- Background: Transparent
- Border: 2px solid Curious Blue
- Text: Curious Blue
- Padding: 12px horizontal, 16px vertical
- Border radius: 8px
- Font weight: 600 (Semibold)
- Hover/Press: Background Curious Blue with 10% opacity

**Icon Button**

- Size: 44x44px minimum (accessibility)
- Background: Transparent or Surface variant
- Border radius: 8px
- Icon size: 24px
- Hover/Press: Background with subtle color

### Program List Items

**Default State**

- Background: White
- Border: None
- Padding: 16px
- Border radius: 12px
- Shadow: 0 2px 8px rgba(0, 0, 0, 0.1)

**Hover State (tablet/web)**

- Background: White
- Shadow: 0 4px 12px rgba(0, 0, 0, 0.15)
- Cursor: Pointer

**Selected State (tablet)**

- Background: explore-it Red (#E63946)
- Text color: White
- Border: None
- Shadow: 0 4px 12px rgba(230, 57, 70, 0.3)

**Pressed State**

- Scale: 0.98
- Opacity: 0.8

### Empty States

**Visual Style**

- Icon: 64px, Curious Blue with 40% opacity
- Title: Heading 2 style, primary text
- Description: Body style, secondary text
- Padding: 48px vertical, 32px horizontal
- Centered alignment

## Icons & Illustrations

### Icon Style

**Icon Set:** Material Symbols (Rounded variant)

- **Rationale:** Matches rounded typography, playful but clear

**Icon Sizes**

- Small: 16px (inline with text)
- Regular: 24px (buttons, list items)
- Large: 32px (headers, empty states)
- Extra large: 48px+ (feature illustrations)

**Icon Colors**

- Primary: Icon color from theme
- Accent: Use semantic colors for specific meanings
  - Success: Success color
  - Warning: Warning color
  - Error: Error color
  - Info: Info color

### Illustration Style

**Approach:** Simple, geometric, friendly

- Use rounded shapes
- Limited color palette (2-3 colors max per illustration)
- Avoid excessive detail
- Focus on recognizability

**Robot Illustrations**

- Simple geometric shapes
- Rounded corners throughout
- Friendly appearance (avoid intimidating designs)
- Use primary color palette

## Effects & Elevation

### Shadows (Elevation)

**Level 1 (Cards, list items)**

- Shadow: `0 1px 3px rgba(29, 53, 87, 0.08)`

**Level 2 (Floating elements, modals)**

- Shadow: `0 4px 12px rgba(29, 53, 87, 0.12)`

**Level 3 (Dialogs, popovers)**

- Shadow: `0 8px 24px rgba(29, 53, 87, 0.15)`

### Transitions

**Duration**

- Quick: 150ms (hover effects, simple state changes)
- Standard: 250ms (most transitions)
- Slow: 350ms (complex animations, large movements)

**Easing**

- Standard: `cubic-bezier(0.4, 0.0, 0.2, 1)` (ease in-out)
- Enter: `cubic-bezier(0.0, 0.0, 0.2, 1)` (ease out)
- Exit: `cubic-bezier(0.4, 0.0, 1, 1)` (ease in)

### Animation Principles

**Keep it Playful but Purposeful**

- Use animation to guide attention
- Celebrate achievements with subtle animations
- Smooth transitions between states
- Avoid excessive or distracting motion

**Examples:**

- Button press: Subtle scale (0.98) + opacity
- Success state: Gentle bounce or check mark draw
- List item selection: Smooth color transition
- Screen transition: Slide or fade (250ms)

## Accessibility

### Contrast Ratios

**Minimum Requirements (WCAG AA)**

- Normal text: 4.5:1
- Large text (18px+ or 14px+ bold): 3:1
- Interactive elements: 3:1

All colors in this palette meet WCAG AA standards for light mode.

### Touch Targets

**Minimum size: 44x44px** (iOS/Android guidelines)

- Applies to all interactive elements
- Add padding around smaller visual elements if needed

### Focus States

**Keyboard navigation support**

- Focus ring: 2px solid explore-it Red
- Offset: 2px from element
- Clear visual indication on all interactive elements

## Special Considerations for Children

### Visual Clarity

- **High contrast** between elements
- **Clear boundaries** (visible borders, spacing)
- **Consistent patterns** (same actions look the same)

### Encouraging Feedback

- **Positive reinforcement** through color (Success green for completed programs)
- **Gentle error handling** (warm orange for warnings, not harsh red)
- **Progressive disclosure** (don't overwhelm with too much at once)

### Engagement Without Distraction

- **Purposeful color use** (not random or excessive)
- **Focused animations** (celebrate success, guide attention)
- **Calm backgrounds** (not overstimulating)

## Implementation Notes

### For Developers

1. **Update theme.ts** with new color palette
2. **Create reusable components** for buttons, cards, etc.
3. **Use spacing constants** from the 8px scale
4. **Test accessibility** with contrast checkers

### For Designers

1. Colors should be **used consistently** across all screens
2. explore-it Red is the **hero color** - use sparingly for maximum impact
3. Maintain **visual hierarchy** through size, weight, and color

## Examples

### Program List Item Styling

**Colors:**

- Background: White
- Text: Black
- Metadata: Medium gray (#666666)
- Shadow: 0 2px 8px rgba(0, 0, 0, 0.1)
- Selected background: explore-it Red (#E63946)
- Selected text: White
- Selected shadow: 0 4px 12px rgba(230, 57, 70, 0.3)

**Spacing:**

- Padding: 16px
- Gap between name and metadata: 8px
- Margin between items: 12px
- Border radius: 12px

### Primary Action Button

**Colors:**

- Background: explore-it Red (#E63946)
- Text: White
- Hover: Darken 10% (#D02E3C)
- Pressed: Darken 15% (#C0293A)

**Typography:**

- Font: Primary (Rounded)
- Size: 16px
- Weight: 600 (Semibold)

**Spacing:**

- Padding: 16px horizontal, 12px vertical
- Border radius: 8px
- Minimum width: 120px
- Minimum height: 44px

## Color Palette Summary (Quick Reference)

```text
Primary Red:     #E63946
Secondary Blue:  #457B9D
Accent Orange:   #F4A261
Accent Purple:   #9D4EDD
Success Green:   #2A9D8F
Warning Orange:  #F4A261
Error Coral:     #E76F51

Background:      #FAF7F0 (soft beige)
Surface:         #FFFFFF (white)
Surface Variant: #F5F5F5 (light gray)
Text Primary:    #000000 (black)
Text Secondary:  #666666 (medium gray)
Border/Divider:  #E0E0E0 (light gray)
```

## Brand Voice (Visual Language)

- **Friendly** - Rounded shapes, warm colors, approachable typography
- **Energetic** - Bold red accent, dynamic layouts, purposeful animation
- **Clear** - High contrast, simple hierarchy, consistent patterns
- **Encouraging** - Positive colors, success celebrations, gentle errors
- **Exploratory** - Playful accents, discovery moments, room to experiment

---

*This style guide should evolve as the app grows. Always prioritize clarity and learning effectiveness over pure aesthetics.*
