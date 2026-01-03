/**
 * Buffer utilities for React Native
 *
 * Provides Buffer-like functionality without requiring Node.js Buffer polyfill
 */

/**
 * Convert Uint8Array to latin1 (ISO-8859-1) string
 * This is equivalent to Buffer.from(data).toString('latin1')
 */
export function uint8ArrayToLatin1(data: Uint8Array): string {
  let result = '';
  for (let i = 0; i < data.length; i++) {
    result += String.fromCharCode(data[i]);
  }
  return result;
}

/**
 * Convert latin1 (ISO-8859-1) string to Uint8Array
 * This is equivalent to Buffer.from(str, 'latin1')
 */
export function latin1ToUint8Array(str: string): Uint8Array {
  const arr = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    arr[i] = str.charCodeAt(i) & 0xff;
  }
  return arr;
}

/**
 * Convert Uint8Array to base64 string
 */
export function uint8ArrayToBase64(data: Uint8Array): string {
  const latin1 = uint8ArrayToLatin1(data);
  return btoa(latin1);
}

/**
 * Convert base64 string to Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  const latin1 = atob(base64);
  return latin1ToUint8Array(latin1);
}
