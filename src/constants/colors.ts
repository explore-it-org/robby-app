/**
 * Color Constants
 *
 * Centralized color definitions for the explore-it Robotics app.
 * These colors align with the explore-it brand guidelines and style guide.
 */

/**
 * Brand Colors
 */
export const BRAND_COLORS = {
  /** Primary brand color - explore-it Red */
  PRIMARY_RED: '#E63946',
  /** Soft beige background */
  BEIGE_SOFT: '#FAF7F0',
} as const;

/**
 * Neutral Colors
 */
export const NEUTRAL_COLORS = {
  /** Pure white */
  WHITE: '#FFFFFF',
  /** Pure black */
  BLACK: '#000000',
  /** Medium gray for secondary text */
  GRAY_MEDIUM: '#666666',
  /** Light gray for borders */
  GRAY_LIGHT: '#E0E0E0',
} as const;

/**
 * Accent Colors
 */
export const ACCENT_COLORS = {
  /** Curious Blue - used for primary accents and Level 1 repetitions */
  CURIOUS_BLUE: '#457B9D',
  /** Creative Orange - used for Level 2 repetitions */
  CREATIVE_ORANGE: '#F4A261',
  /** Playful Purple - used for Level 3 repetitions and Debug button */
  PLAYFUL_PURPLE: '#9D4EDD',
  /** Error Coral - used for stop button and errors */
  ERROR_CORAL: '#E63946',
  /** Subroutine Teal - used for subroutine instruction blocks */
  SUBROUTINE_TEAL: '#06A77D',
  /** Light Curious Blue - used for Level 1 repetition headers */
  CURIOUS_BLUE_LIGHT: '#D6E8F0',
  /** Light Creative Orange - used for Level 2 repetition headers */
  CREATIVE_ORANGE_LIGHT: '#FDE8D7',
  /** Light Playful Purple - used for Level 3 repetition headers */
  PLAYFUL_PURPLE_LIGHT: '#EFE0F7',
} as const;

/**
 * Semantic Colors
 */
export const SEMANTIC_COLORS = {
  /** Surface/card background */
  SURFACE: NEUTRAL_COLORS.WHITE,
  /** Primary text color */
  TEXT_PRIMARY: NEUTRAL_COLORS.BLACK,
  /** Secondary text color */
  TEXT_SECONDARY: NEUTRAL_COLORS.GRAY_MEDIUM,
  /** Inverted text (on colored backgrounds) */
  TEXT_INVERTED: NEUTRAL_COLORS.WHITE,
  /** Border color */
  BORDER: NEUTRAL_COLORS.GRAY_LIGHT,
  /** Modal overlay background */
  MODAL_OVERLAY: 'rgba(0, 0, 0, 0.5)',
  /** Light teal background for subroutine headers */
  SUBROUTINE_TEAL_LIGHT: '#E6F7F3',
  /** Light blue background for selected items */
  SELECTED_ITEM_BACKGROUND: '#F0F8FF',
} as const;

/**
 * All colors combined for convenient access
 */
export const COLORS = {
  ...BRAND_COLORS,
  ...NEUTRAL_COLORS,
  ...ACCENT_COLORS,
  ...SEMANTIC_COLORS,
} as const;
