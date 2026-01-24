import { ConnectedDevice } from '@/services/ble/manager';
import { uint8ArrayToLatin1 } from './protocol-base';

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
   * Wait for a text response
   */
  async awaitTextResponse(timeoutMs = 5000): Promise<string> {
    const data = await this.awaitResponse(timeoutMs);
    return uint8ArrayToLatin1(data);
  }

  /**
   * Wait for a text response
   */
  async expectTextResponse(expected: string, timeoutMs = 5000): Promise<void> {
    const response = await this.awaitTextResponse(timeoutMs);
    if (response !== expected) {
      throw new Error(`Expected response "${expected}", got "${response}"`);
    }
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
   * Send a command and wait for a text response
   */
  async requestText(command: string | Uint8Array, timeoutMs = 5000): Promise<string> {
    const data = await this.request(command, timeoutMs);
    return uint8ArrayToLatin1(data);
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
