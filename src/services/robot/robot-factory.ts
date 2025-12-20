/**
 * Robot Factory
 *
 * Creates Robot instances with appropriate hardware and protocol handlers.
 */

import { IHardwareLayer } from '@/types/hardware';
import { IRobot } from '@/types/robot';
import { createProtocolHandler } from '../protocol/protocol-factory';
import { Robot } from './robot';

/**
 * Create a robot instance after version detection
 */
export async function createRobot(
  deviceId: string,
  deviceName: string,
  hardware: IHardwareLayer
): Promise<IRobot> {
  // Connect to the device
  await hardware.connect(deviceId);

  // Detect firmware version
  const firmwareVersion = await detectFirmwareVersion(hardware);

  // Create protocol handler
  const protocolHandler = createProtocolHandler(firmwareVersion, hardware);

  // Create and return robot instance
  return new Robot(deviceId, deviceName, firmwareVersion, hardware, protocolHandler);
}

/**
 * Detect firmware version by sending 'Z' command
 */
async function detectFirmwareVersion(hardware: IHardwareLayer): Promise<number> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Version detection timeout'));
    }, 5000);

    // Set up notification handler
    const cleanup = hardware.onNotification((data) => {
      const response = Buffer.from(data).toString('latin1');

      if (response.startsWith('VER')) {
        clearTimeout(timeout);
        cleanup();
        // Parse "VER X" format
        const versionStr = response.substring(4).trim();
        const version = parseInt(versionStr, 10);

        if (isNaN(version)) {
          reject(new Error(`Invalid version response: ${response}`));
        } else {
          resolve(version);
        }
      }
    });

    // Send version query command
    hardware.write('Z').catch((error) => {
      clearTimeout(timeout);
      cleanup();
      reject(error);
    });
  });
}
