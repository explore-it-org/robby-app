/**
 * Protocol Layer Types
 *
 * Defines interfaces for protocol handlers that translate high-level
 * commands to protocol-specific command sequences.
 */

import { RobotProgram } from './robot';

/**
 * Protocol version
 */
export type ProtocolVersion = 'V3' | 'V6' | 'V10';

/**
 * Protocol handler interface
 *
 * Translates high-level commands to protocol-specific command sequences
 * and handles protocol-specific encoding/decoding.
 */
export interface IProtocolHandler {
  // Protocol identification
  readonly version: ProtocolVersion;
  readonly maxInstructions: number;

  // Program operations
  uploadProgram(program: RobotProgram, onProgress?: (progress: number) => void): Promise<void>;
  downloadProgram(onProgress?: (progress: number) => void): Promise<RobotProgram>;

  // Control commands
  run(): Promise<void>;
  go(): Promise<void>;
  stop(): Promise<void>;

  // Configuration
  getInterval(): Promise<number>;
  setInterval(value: number): Promise<void>;

  // Recording
  startRecording(durationSeconds: number): Promise<void>;
  downloadRecording(onProgress?: (progress: number) => void): Promise<RobotProgram>;
}

/**
 * Protocol configuration
 */
export interface ProtocolConfig {
  maxInstructions: number;
  supportsChunking: boolean;
  supportsBinary: boolean;
  chunkSize?: number; // Instructions per chunk (V10)
  packetSize?: number; // Instructions per packet (V6/V10 download)
}

/**
 * Mapping from firmware version to protocol version
 */
export const PROTOCOL_VERSION_MAP: Record<number, ProtocolVersion> = {
  2: 'V3',
  3: 'V3',
  4: 'V3',
  9: 'V6',
  10: 'V10',
};
