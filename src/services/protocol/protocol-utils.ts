/**
 * Protocol Utilities
 *
 * Common utilities for protocol encoding and decoding.
 */

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
 * Calculate data length for upload command
 */
export function calculateDataLength(instructionCount: number): string {
  const byteCount = instructionCount * 2 - 1;
  return 'd' + byteCount.toString(16).toUpperCase().padStart(4, '0');
}
