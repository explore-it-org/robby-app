/**
 * Protocol Factory
 *
 * Creates appropriate protocol handler based on firmware version.
 */

import { IHardwareLayer } from '@/types/hardware';
import { IProtocolHandler, ProtocolVersion, PROTOCOL_VERSION_MAP } from '@/types/protocol';
import { V3ProtocolHandler } from './v3-protocol-handler';
import { V6ProtocolHandler } from './v6-protocol-handler';
import { V10ProtocolHandler } from './v10-protocol-handler';

/**
 * Create protocol handler based on firmware version
 */
export function createProtocolHandler(
  firmwareVersion: number,
  hardware: IHardwareLayer
): IProtocolHandler {
  const protocolVersion = PROTOCOL_VERSION_MAP[firmwareVersion];

  if (!protocolVersion) {
    throw new Error(`Unsupported firmware version: ${firmwareVersion}`);
  }

  switch (protocolVersion) {
    case 'V3':
      return new V3ProtocolHandler(hardware);
    case 'V6':
      return new V6ProtocolHandler(hardware);
    case 'V10':
      return new V10ProtocolHandler(hardware);
    default:
      throw new Error(`Unsupported protocol version: ${protocolVersion}`);
  }
}

/**
 * Get protocol version from firmware version
 */
export function getProtocolVersion(firmwareVersion: number): ProtocolVersion {
  const protocolVersion = PROTOCOL_VERSION_MAP[firmwareVersion];

  if (!protocolVersion) {
    throw new Error(`Unsupported firmware version: ${firmwareVersion}`);
  }

  return protocolVersion;
}
