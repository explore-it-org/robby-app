/**
 * Signal Strength Indicator Utility
 *
 * Converts RSSI (Received Signal Strength Indicator) values to visual indicators
 * without showing technical information like dBm.
 */

/**
 * Convert RSSI value to a visual signal strength indicator
 *
 * RSSI ranges (approximate for BLE):
 * - Excellent: -50 dBm or higher
 * - Good: -70 to -50 dBm (exclusive)
 * - Fair: -85 to -70 dBm (exclusive)
 * - Weak: below -85 dBm
 *
 * @param rssi - RSSI value in dBm (typically negative, e.g., -65)
 * @returns Visual indicator string using signal bars (▂▃▅▇)
 */
export function getSignalStrengthIndicator(rssi: number | undefined): string {
  if (rssi === undefined) {
    return '▂▁▁▁'; // Unknown signal
  }

  if (rssi >= -50) {
    return '▂▃▅▇'; // Excellent signal - all 4 bars
  } else if (rssi >= -70) {
    return '▂▃▅▁'; // Good signal - 3 bars
  } else if (rssi >= -85) {
    return '▂▃▁▁'; // Fair signal - 2 bars
  } else {
    return '▂▁▁▁'; // Weak signal - 1 bar
  }
}

/**
 * Get signal strength level as a string for accessibility
 *
 * @param rssi - RSSI value in dBm
 * @returns Signal strength level (excellent, good, fair, weak)
 */
export function getSignalStrengthLevel(
  rssi: number | undefined
): 'excellent' | 'good' | 'fair' | 'weak' {
  if (rssi === undefined) {
    return 'weak';
  }

  if (rssi >= -50) {
    return 'excellent';
  } else if (rssi >= -70) {
    return 'good';
  } else if (rssi >= -85) {
    return 'fair';
  } else {
    return 'weak';
  }
}
