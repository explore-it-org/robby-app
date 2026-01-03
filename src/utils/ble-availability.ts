/**
 * BLE Availability Detection
 *
 * Detects whether BLE (react-native-ble-plx) is available at runtime.
 * BLE is not available in Expo Go, only in development builds and standalone apps.
 */

import Constants from 'expo-constants';

/**
 * Check if BLE is available in the current environment
 *
 * BLE is NOT available in:
 * - Expo Go app
 *
 * BLE IS available in:
 * - Development builds (created with `eas build --profile development`)
 * - Production builds
 * - Standalone apps
 *
 * @returns true if BLE is available, false otherwise
 */
export function isBLEAvailable(): boolean {
  // Check if running in Expo Go
  // In Expo Go, the app owner will be "expo" and execution environment will be "storeClient"
  const isExpoGo = Constants.executionEnvironment === 'storeClient';

  if (isExpoGo) {
    return false;
  }

  // Additional check: try to require the module
  // This is a fallback for other edge cases
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('react-native-ble-plx');
    return true;
  } catch {
    return false;
  }
}

/**
 * Get a human-readable explanation of BLE availability
 */
export function getBLEAvailabilityMessage(): string {
  if (isBLEAvailable()) {
    return 'BLE is available';
  }

  if (Constants.executionEnvironment === 'storeClient') {
    return 'BLE is not available in Expo Go. Please use a development build to access BLE features.';
  }

  return 'BLE is not available in this environment';
}
