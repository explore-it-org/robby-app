/**
 * BLE Permissions Utility
 *
 * Handles runtime permission requests for Bluetooth on Android and iOS.
 * For Android 12+ (API 31+), BLUETOOTH_SCAN and BLUETOOTH_CONNECT permissions are required.
 * For Android < 12, ACCESS_FINE_LOCATION is required.
 */

import { Platform, PermissionsAndroid, Alert } from 'react-native';

/**
 * Request all necessary Bluetooth permissions based on platform and Android version
 * @returns true if all permissions are granted, false otherwise
 */
export async function requestBluetoothPermissions(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    // iOS permissions are handled automatically via Info.plist
    return true;
  }

  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const androidVersion = Platform.Version;

    if (androidVersion >= 31) {
      // Android 12+ (API 31+): Request new Bluetooth permissions
      const permissions = [
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ];

      const results = await PermissionsAndroid.requestMultiple(permissions);

      const allGranted =
        results['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
        results['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED;

      if (!allGranted) {
        console.log('Bluetooth permissions denied');
        Alert.alert(
          'Bluetooth Permission Required',
          'This app needs Bluetooth permissions to scan for and connect to robots. Please grant the permissions in your device settings.',
          [{ text: 'OK' }]
        );
        return false;
      }

      return true;
    } else {
      // Android < 12: Request location permission (required for BLE scanning)
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message:
            'Bluetooth scanning requires location permission on Android. ' +
            'This app needs it to discover nearby robots.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission denied');
        Alert.alert(
          'Permission Required',
          'Location permission is required to scan for Bluetooth devices on Android.',
          [{ text: 'OK' }]
        );
        return false;
      }

      return true;
    }
  } catch (error) {
    console.error('Error requesting Bluetooth permissions:', error);
    return false;
  }
}

/**
 * Check if all necessary Bluetooth permissions are granted
 * @returns true if all permissions are granted, false otherwise
 */
export async function checkBluetoothPermissions(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    return true;
  }

  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const androidVersion = Platform.Version;

    if (androidVersion >= 31) {
      // Android 12+: Check new Bluetooth permissions
      const scanGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
      );
      const connectGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
      );

      return scanGranted && connectGranted;
    } else {
      // Android < 12: Check location permission
      const locationGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );

      return locationGranted;
    }
  } catch (error) {
    console.error('Error checking Bluetooth permissions:', error);
    return false;
  }
}
