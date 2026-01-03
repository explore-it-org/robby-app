/**
 * Spacing Constants
 *
 * Centralized spacing values for consistent layout and padding across the app.
 * All values are in pixels and follow the style guide specifications.
 */

/**
 * Component-specific spacing values
 */
export const COMPONENT_SPACING = {
  /** Floating Action Button (FAB) dimensions and spacing */
  FAB_HEIGHT: 56,
  FAB_WIDTH: 56,
  FAB_MARGIN_RIGHT: 16,
  FAB_MARGIN_BOTTOM: 16,
  /** Total bottom padding needed to avoid FAB overlap (56 + 16 + 16) */
  FAB_BOTTOM_PADDING: 88,

  /** Program list item spacing */
  LIST_ITEM_MARGIN_BOTTOM: 12,
  LIST_ITEM_PADDING: 16,
  LIST_ITEM_BORDER_RADIUS: 12,
  LIST_ITEM_GAP: 8,

  /** Card and container spacing */
  CARD_PADDING: 16,
  CARD_BORDER_RADIUS: 12,
} as const;

/**
 * Standard spacing scale (based on 4px grid)
 */
export const SPACING = {
  /** Extra small: 4px */
  XS: 4,
  /** Small: 8px */
  SM: 8,
  /** Medium: 12px */
  MD: 12,
  /** Large: 16px */
  LG: 16,
  /** Extra large: 20px */
  XL: 20,
  /** 2X large: 24px */
  XXL: 24,
  /** 3X large: 32px */
  XXXL: 32,
  /** 4X large: 40px */
  XXXXL: 40,
} as const;

/**
 * Layout spacing
 */
export const LAYOUT_SPACING = {
  /** Standard screen padding for phone */
  SCREEN_PADDING: 20,
  /** Standard gap between elements */
  ELEMENT_GAP: 16,
  /** Padding for empty states */
  EMPTY_STATE_PADDING: 40,
} as const;

/**
 * Shadow/elevation spacing
 */
export const SHADOW_SPACING = {
  /** Default shadow offset */
  DEFAULT_OFFSET: { width: 0, height: 2 },
  /** Selected/elevated shadow offset */
  ELEVATED_OFFSET: { width: 0, height: 4 },
} as const;

/**
 * All spacing values combined for convenient access
 */
export const ALL_SPACING = {
  ...COMPONENT_SPACING,
  ...SPACING,
  ...LAYOUT_SPACING,
  ...SHADOW_SPACING,
} as const;
