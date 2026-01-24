import { ConnectedDevice } from '@/ble/manager';

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
  const byteCount = instructionCount * 2 - 1;
  return 'd' + byteCount.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Convert Uint8Array to Latin-1 string
 */
export function uint8ArrayToLatin1(data: Uint8Array): string {
  return String.fromCharCode(...data);
}

/**
 * Request/Response handler for cleaner protocol communication
 */
export class DeviceChannel {
  private device: ConnectedDevice;
  private responseResolve: ((data: Uint8Array) => void) | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor(device: ConnectedDevice) {
    this.device = device;
    this.unsubscribe = device.onDataReceived((data) => {
      if (this.responseResolve) {
        const resolve = this.responseResolve;
        this.responseResolve = null;
        resolve(data);
      }
    });
  }

  /**
   * Send a command and wait for a response
   */
  async request(command: string | Uint8Array, timeoutMs = 5000): Promise<Uint8Array> {
    const responsePromise = this.awaitResponse(timeoutMs);
    await this.device.writeData(command);
    return responsePromise;
  }

  /**
   * Send a command and wait for a text response matching a pattern
   */
  async requestText(
    command: string | Uint8Array,
    matcher: string | ((text: string) => boolean),
    timeoutMs = 5000
  ): Promise<string> {
    const data = await this.request(command, timeoutMs);
    const text = uint8ArrayToLatin1(data);

    const matches = typeof matcher === 'string' ? text.includes(matcher) : matcher(text);
    if (!matches) {
      throw new Error(`Unexpected response: ${text}`);
    }

    return text;
  }

  /**
   * Send a command without waiting for response
   */
  async send(command: string | Uint8Array): Promise<void> {
    await this.device.writeData(command);
  }

  /**
   * Wait for a response without sending a command
   */
  awaitResponse(timeoutMs = 5000): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.responseResolve = null;
        reject(new Error('Response timeout'));
      }, timeoutMs);

      this.responseResolve = (data) => {
        clearTimeout(timeout);
        resolve(data);
      };
    });
  }

  /**
   * Wait for a text response matching a pattern
   */
  async awaitTextResponse(
    matcher: string | ((text: string) => boolean),
    timeoutMs = 5000
  ): Promise<string> {
    const data = await this.awaitResponse(timeoutMs);
    const text = uint8ArrayToLatin1(data);

    const matches = typeof matcher === 'string' ? text.includes(matcher) : matcher(text);
    if (!matches) {
      throw new Error(`Unexpected response: ${text}`);
    }

    return text;
  }

  /**
   * Collect multiple responses until a condition is met
   */
  async collectResponses(
    shouldStop: (responses: Uint8Array[]) => boolean,
    timeoutMs = 5000
  ): Promise<Uint8Array[]> {
    const responses: Uint8Array[] = [];

    while (!shouldStop(responses)) {
      const response = await this.awaitResponse(timeoutMs);
      responses.push(response);
    }

    return responses;
  }

  dispose(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}
