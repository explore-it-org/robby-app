import { ProtocolHandler } from './protocol';
import { ProtocolV3 } from './protocol-v3';
import { ProtocolV6 } from './protocol-v6';
import { ProtocolV10 } from './protocol-v10';

export type ProtocolVersion = 'V3' | 'V6' | 'V10';

/**
 * Get the protocol version for a given firmware version
 */
export function getProtocolVersion(firmwareVersion: number): ProtocolVersion {
  if (firmwareVersion >= 2 && firmwareVersion <= 4) {
    return 'V3';
  }
  if (firmwareVersion === 9) {
    return 'V6';
  }
  if (firmwareVersion >= 10) {
    return 'V10';
  }
  throw new Error(`Unsupported firmware version: ${firmwareVersion}`);
}

/**
 * Create a protocol handler for the given protocol version
 */
export function createProtocolHandler(version: ProtocolVersion): ProtocolHandler {
  switch (version) {
    case 'V3':
      return new ProtocolV3();
    case 'V6':
      return new ProtocolV6();
    case 'V10':
      return new ProtocolV10();
    default:
      throw new Error(`Unknown protocol version: ${version}`);
  }
}
