/**
 * explore-it Robotics App Theme
 * Colors and typography based on the explore-it style guide
 * See docs/spec/Style.md for complete style documentation
 */

import { Platform } from 'react-native';

// Primary brand color - Teal/Dark Blue from legacy app
const primaryTeal = '#2E5266';

// Secondary and accent colors
const curiousBlue = '#457B9D';
const creativeOrange = '#F4A261';
const playfulPurple = '#9D4EDD';

// Semantic colors
const successGreen = '#2A9D8F';
const errorCoral = '#E76F51';

// Background colors
const softBeige = '#FAF7F0';
const white = '#FFFFFF';
const surfaceVariant = '#F5F5F5';

// Text colors
const textPrimary = '#000000';
const textSecondary = '#666666';

export const Colors = {
  light: {
    // Primary
    primary: primaryTeal,

    // Secondary/Accent
    secondary: curiousBlue,
    accent: creativeOrange,
    accentPurple: playfulPurple,

    // Semantic
    success: successGreen,
    warning: creativeOrange,
    error: errorCoral,
    info: curiousBlue,

    // Text
    text: textPrimary,
    textSecondary: textSecondary,

    // Background
    background: softBeige,
    surface: white,
    surfaceVariant: surfaceVariant,

    // UI elements
    tint: primaryTeal,
    icon: textPrimary,
    tabIconDefault: curiousBlue,
    tabIconSelected: primaryTeal,

    // Borders
    border: '#E0E0E0',
  },
  // Dark mode disabled - app uses light mode only
  dark: {
    primary: primaryTeal,
    secondary: curiousBlue,
    accent: creativeOrange,
    accentPurple: playfulPurple,
    success: successGreen,
    warning: creativeOrange,
    error: errorCoral,
    info: curiousBlue,
    text: textPrimary,
    textSecondary: textSecondary,
    background: softBeige,
    surface: white,
    surfaceVariant: surfaceVariant,
    tint: primaryTeal,
    icon: textPrimary,
    tabIconDefault: curiousBlue,
    tabIconSelected: primaryTeal,
    border: '#E0E0E0',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
