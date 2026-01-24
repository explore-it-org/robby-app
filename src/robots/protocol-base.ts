/**
 * Encode motor speed from application domain (0-100) to wire protocol (0-255)
 */
export function encodeSpeed(percentage: number): number {
  if (percentage === 0) return 0;
  return Math.floor(percentage * 2.55 + 0.5);
}

/**
 * Decode motor speed from wire protocol (0-255) to application domain (0-100)
 */
export function decodeSpeed(wireValue: number): number {
  return Math.round(wireValue / 2.55);
}

/**
 * Calculate data length command for upload
 */
export function calculateDataLength(instructionCount: number): string {
  return hexNumber(instructionCount * 2 - 1);
}

/**
 * Convert Uint8Array to Latin-1 string
 */
export function uint8ArrayToLatin1(data: Uint8Array): string {
  return String.fromCharCode(...data);
}

/**
 * Format a number as a hexadecimal string with a leading 'd'
 */
export function hexNumber(value: number): string {
  return 'd' + value.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Format a number as a hexadecimal string with a leading 'd_' and trailing '_ok_'
 */
export function hexNumberConfirm(value: number): string {
  return 'd_' + value.toString(16).toUpperCase().padStart(4, '0') + '_ok_';
}
