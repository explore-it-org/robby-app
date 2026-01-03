# Feature Specification: Robot Communication Stack

## Overview

The Robot Communication Stack provides a layered architecture for communicating with EXPLORE-IT robots via Bluetooth Low Energy (BLE). This feature description defines the architectural design for implementing a flexible, extensible, and testable communication system that abstracts the complexity of BLE operations, protocol versioning, and hardware differences. The stack enables the UI to interact with physical robots using high-level application domain commands (upload programs, run programs, query robot state) while internally managing protocol translation, BLE operations, and device discovery.

The communication stack is designed to support multiple robot firmware versions (V3, V6, V10), enable easy addition of new protocols, and provide both real BLE hardware implementation and emulated robots for development and testing without physical devices.

## Goals

- Provide a clean, high-level API for the UI to communicate with robots using application domain commands
- Abstract protocol complexity through a layered architecture that separates concerns
- Support multiple robot firmware versions (V3, V6, V10) with a unified interface
- Enable addition of new protocols with minimal code changes to existing layers
- Support both real BLE hardware and emulated robots through hardware abstraction
- Provide robust error handling and connection state management
- Enable comprehensive testing through dependency injection and interface-based design
- Follow SOLID principles and maintain clear separation between layers

## Architectural Overview

The communication stack is organized into four distinct layers, each with well-defined responsibilities:

```txt
┌─────────────────────────────────────────────────────────────┐
│                        UI LAYER                             │
│   (Components, Screens, React Hooks)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Application Domain Commands
                     │ (uploadProgram, run, stop, etc.)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              TOP LEVEL COMMAND INTERFACE                    │
│                   (Robot Class)                             │
│                                                             │
│  - Exposes high-level commands in application domain        │
│  - Manages connection lifecycle                             │
│  - Maintains robot state (connected, running, etc.)         │
│  - Delegates to protocol layer                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Protocol-Independent Commands
                     │ (translated to protocol-specific)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  PROTOCOL LAYER                             │
│        (Protocol Handlers: V3, V6, V10)                     │
│                                                             │
│  - Translates high-level commands to protocol commands     │
│  - Implements protocol-specific encoding/decoding          │
│  - Handles protocol version differences                    │
│  - Manages command sequencing per protocol                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ BLE Operations
                     │ (read, write, notify)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  HARDWARE LAYER                             │
│         (BLE Implementation / Emulator)                     │
│                                                             │
│  - Abstracts BLE hardware operations                       │
│  - Provides device discovery                               │
│  - Manages BLE characteristic read/write/notify            │
│  - Implements either real BLE or emulated robots           │
└─────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  PHYSICAL ROBOT                             │
│              (or Emulated Robot)                            │
└─────────────────────────────────────────────────────────────┘
```

## Layer 1: Top Level Command Interface (Robot Class)

### Purpose

The top-level command interface provides a domain-specific API that the UI uses to interact with robots. This layer abstracts away all protocol and BLE complexity, presenting commands in terms that match the application domain (programs, execution, recording).

### Responsibilities

- Expose high-level commands: `uploadProgram()`, `run()`, `stop()`, `downloadProgram()`, etc.
- Manage robot connection lifecycle (connect, disconnect, reconnect)
- Maintain and expose robot state (connection state, operational state, firmware version)
- Handle cross-cutting concerns (error handling, state validation, event emission)
- Delegate protocol-specific operations to the Protocol Layer
- Provide observable state for UI components (connection status, operation progress)

### Interface Definition

```typescript
interface IRobot {
  // Identity and capabilities
  readonly id: string;
  readonly name: string;
  readonly firmwareVersion: number;
  readonly protocolVersion: 'V3' | 'V6' | 'V10';

  // Connection state
  readonly isConnected: boolean;
  readonly connectionState: RobotConnectionState;
  readonly operationalState: RobotOperationalState;

  // Connection management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  onConnectionStateChange(callback: (state: RobotConnectionState) => void): void;
  onOperationalStateChange(callback: (state: RobotOperationalState) => void): void;

  // Program operations
  uploadProgram(program: RobotProgram): Promise<void>;
  downloadProgram(): Promise<RobotProgram>;
  onUploadProgress(callback: (progress: number) => void): void;
  onDownloadProgress(callback: (progress: number) => void): void;

  // Control commands
  run(): Promise<void>;
  go(): Promise<void>;
  stop(): Promise<void>;

  // Configuration
  getInterval(): Promise<number>;
  setInterval(deciseconds: number): Promise<void>;

  // Recording
  startRecording(durationSeconds: number): Promise<void>;
  stopRecording(): Promise<RobotProgram>;
  onRecordingProgress(callback: (progress: number) => void): void;

  // Error handling
  onError(callback: (error: RobotError) => void): void;
}

type RobotConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

type RobotOperationalState =
  | 'idle'
  | 'running'
  | 'going'
  | 'uploading'
  | 'downloading'
  | 'recording';

interface RobotProgram {
  instructions: RobotInstruction[];
}

interface RobotInstruction {
  leftMotorSpeed: number; // 0-100
  rightMotorSpeed: number; // 0-100
}

interface RobotError {
  code: string;
  message: string;
  details?: unknown;
}
```

### Implementation Notes

**State Management:**

- Robot class maintains internal state machine
- State transitions follow protocol requirements (e.g., must flush before upload)
- Invalid state transitions throw descriptive errors

**Error Handling:**

- Wrap protocol and hardware errors in `RobotError` interface
- Provide user-friendly error messages
- Emit errors through `onError()` callback for UI handling

**Connection Management:**

- Handle connection timeouts (configurable, default 10 seconds)
- Implement reconnection logic with exponential backoff
- Notify connection state changes through callbacks

**Program Validation:**

- Validate program size limits based on protocol version (V3: 100, V6: 2400, V10: 4096)
- Validate instruction values (motor speeds 0-100)
- Throw descriptive errors for validation failures

## Layer 2: Protocol Layer

### Purpose

The Protocol Layer translates high-level commands from the Robot class into protocol-specific command sequences. This layer encapsulates all protocol version differences (V3, V6, V10) and provides a consistent interface for command execution.

### Responsibilities

- Translate high-level commands to protocol-specific command sequences
- Implement protocol-specific data encoding/decoding
- Handle protocol version differences (text vs binary, chunking, etc.)
- Manage command sequencing requirements (flush → data length → enter → upload)
- Parse and interpret protocol responses
- Provide progress callbacks during multi-step operations

### Architecture

```txt
┌──────────────────────────────────────────────────────────┐
│              IProtocolHandler (Interface)                │
│                                                          │
│  + uploadProgram(program)                                │
│  + downloadProgram()                                     │
│  + run()                                                 │
│  + stop()                                                │
│  + getInterval()                                         │
│  + setInterval(value)                                    │
│  + startRecording(duration)                              │
└─────────────────┬────────────────────────────────────────┘
                  │
                  │ Implemented by
                  │
      ┌───────────┴───────────┬─────────────────────┐
      │                       │                     │
      ▼                       ▼                     ▼
┌──────────┐          ┌──────────┐          ┌──────────┐
│ V3Handler│          │ V6Handler│          │V10Handler│
│          │          │          │          │          │
│ - Text   │          │ - Binary │          │ - Binary │
│ - Single │          │ - Packets│          │ - Chunks │
│ - ASCII  │          │ - Seq#   │          │ - 256/ch │
└──────────┘          └──────────┘          └──────────┘
```

### Interface Definition

```typescript
interface IProtocolHandler {
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

type ProtocolVersion = 'V3' | 'V6' | 'V10';

interface ProtocolConfig {
  maxInstructions: number;
  supportsChunking: boolean;
  supportsBinary: boolean;
  chunkSize?: number; // Instructions per chunk (V10)
  packetSize?: number; // Instructions per packet (V6/V10 download)
}
```

### Protocol Handler Implementations

#### V3 Protocol Handler

**Characteristics:**

- Text-based ASCII protocol
- Upload: One instruction per write operation
- Download: Comma-delimited text responses
- Maximum ~100 instructions (MTU limited)
- End marker: `"end"` for upload, `",,,,"` for download

**Upload Sequence:**

```txt
1. Write 'F'              (Flush)
2. Write 'd0003'          (Data length: 2 instructions = 4 bytes - 1)
3. Write 'E'              (Enter upload mode)
4. Write '255,128xx'      (Instruction 0)
5. Write '064,191xx'      (Instruction 1)
6. Write 'end'            (End marker)
7. Wait for 'FULL'        (Completion response)
```

**Download Sequence:**

```txt
1. Write 'B'              (Begin download)
2. Read '255,128'         (Instruction 0)
3. Read '064,191'         (Instruction 1)
4. Read ',,,,'            (End marker)
```

**Speed Encoding:**

- Left/Right: 3 decimal digits, zero-padded (000-255)
- Upload format: `"LLL,RRRxx"` (xx suffix ignored by robot)
- Download format: `"LLL,RRR"` (no xx suffix)

#### V6 Protocol Handler

**Characteristics:**

- Binary protocol
- Upload: All instructions in single write (or multiple if needed)
- Download: Packeted with sequence numbers
- Maximum ~2400 instructions
- Packet loss detection (but no recovery)

**Upload Sequence:**

```txt
1. Write 'F'                    (Flush)
2. Write 'd0003'                (Data length)
3. Write 'E'                    (Enter upload mode)
4. Write [0xFF,0x80,0x40,0xBF]  (Binary instruction data)
5. Wait for 'FULL'              (Completion response)
```

**Download Sequence:**

```txt
1. Write 'B'                         (Begin download)
2. Read [0x00,0x00,0x00,0x04]        (Packet 0: Total byte count)
3. Read [0x00,0xFF,0x80,0x40,0xBF]   (Packet 1: Seq# + data)
4. Continue reading packets until complete
```

**Packet Structure:**

- Packet 0: Total byte count (big-endian multi-byte integer)
- Data packets: [Sequence#][Left0][Right0][Left1][Right1]...
- Sequence# wraps at 256 (limitation for large programs)
- Up to 18 data bytes per packet (9 instructions)

**Known Limitations:**

- Sequence number wrap causes issues beyond 2400 instructions
- Packet loss detection exists but no retransmission mechanism

#### V10 Protocol Handler

**Characteristics:**

- Binary protocol with chunked uploads
- Upload: Data sent in chunks of 256 instructions
- Download: Same as V6 (packeted)
- Maximum 4096 instructions
- Better support for large programs

**Upload Sequence:**

```txt
1. Write 'F'                    (Flush)
2. Write 'd1FFF'                (Data length: 4096 instructions)
3. Write 'E'                    (Enter upload mode)
4. Write [chunk 0: 512 bytes]   (Instructions 0-255)
5. Write [chunk 1: 512 bytes]   (Instructions 256-511)
6. ... (continue for all chunks)
7. Wait for 'FULL'              (Completion response)
```

**Chunking Algorithm:**

```typescript
const CHUNK_SIZE = 256; // instructions per chunk

function createChunks(instructions: RobotInstruction[]): Uint8Array[] {
  const chunks: Uint8Array[] = [];

  for (let offset = 0; offset < instructions.length; offset += CHUNK_SIZE) {
    const chunkLength = Math.min(CHUNK_SIZE, instructions.length - offset);
    const bytes = new Uint8Array(chunkLength * 2);

    for (let i = 0; i < chunkLength; i++) {
      const inst = instructions[offset + i];
      bytes[i * 2] = encodeSpeed(inst.leftMotorSpeed);
      bytes[i * 2 + 1] = encodeSpeed(inst.rightMotorSpeed);
    }

    chunks.push(bytes);
  }

  return chunks;
}
```

### Protocol Selection Strategy

**Version Detection:**

1. During connection, Robot class sends 'Z' command
2. Robot responds with 'VER <number>'
3. Parse firmware version from response
4. Create appropriate protocol handler based on version mapping:

```typescript
const PROTOCOL_VERSION_MAP: Record<number, ProtocolVersion> = {
  2: 'V3',
  3: 'V3',
  4: 'V3',
  9: 'V6',
  10: 'V10',
};

function createProtocolHandler(
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
  }
}
```

### Data Encoding

**Speed Conversion (Application ↔ Wire):**

```typescript
// Application domain: 0-100 (percentage)
// Wire protocol: 0-255 (8-bit value)

function encodeSpeed(percentage: number): number {
  if (percentage === 0) return 0;
  return Math.floor(percentage * 2.55 + 0.5);
}

function decodeSpeed(wireValue: number): number {
  return Math.trunc(wireValue / 2.55 + 0.5);
}
```

**Data Length Calculation:**

```typescript
function calculateDataLength(instructionCount: number): string {
  const byteCount = instructionCount * 2 - 1;
  return 'd' + byteCount.toString(16).toUpperCase().padStart(4, '0');
}

// Examples:
// 2 instructions → (2 × 2) - 1 = 3 → 'd0003'
// 1024 instructions → (1024 × 2) - 1 = 2047 → 'd07FF'
// 4096 instructions → (4096 × 2) - 1 = 8191 → 'd1FFF'
```

## Layer 3: Hardware Layer

### Purpose

The Hardware Layer abstracts BLE operations and provides a consistent interface for protocol handlers to communicate with robots. This layer has two implementations: real BLE hardware and emulated robots.

### Responsibilities

- Abstract BLE GATT operations (read, write, notify)
- Provide device discovery and filtering
- Manage BLE connection lifecycle
- Handle BLE-specific errors and state
- Provide emulated robot implementations for testing
- Support development without physical hardware

### Architecture

```txt
┌──────────────────────────────────────────────────────────┐
│             IHardwareLayer (Interface)                   │
│                                                          │
│  + discoverDevices()                                     │
│  + connect(deviceId)                                     │
│  + disconnect()                                          │
│  + write(data)                                           │
│  + onNotification(callback)                              │
└─────────────────┬────────────────────────────────────────┘
                  │
                  │ Implemented by
                  │
          ┌───────┴────────┐
          │                │
          ▼                ▼
   ┌────────────┐   ┌─────────────┐
   │ BLE Layer  │   │  Emulator   │
   │            │   │   Layer     │
   │ - Real BLE │   │ - Mock BLE  │
   │ - Physical │   │ - Simulated │
   │ - Devices  │   │ - Robots    │
   └────────────┘   └─────────────┘
```

### Interface Definition

```typescript
interface IHardwareLayer {
  // Discovery
  startDiscovery(callback: (device: DiscoveredDevice) => void): Promise<void>;
  stopDiscovery(): Promise<void>;
  getDiscoveredDevices(): DiscoveredDevice[];

  // Connection
  connect(deviceId: string): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  // Communication
  write(data: string | Uint8Array): Promise<void>;
  onNotification(callback: (data: Uint8Array) => void): void;

  // State
  getState(): HardwareState;
  onStateChange(callback: (state: HardwareState) => void): void;
}

interface DiscoveredDevice {
  id: string;
  name: string;
  rssi: number; // Signal strength
}

type HardwareState = 'idle' | 'discovering' | 'connecting' | 'connected' | 'disconnected';
```

### BLE Implementation

**BLE Service and Characteristic:**

```typescript
const BLE_SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
const BLE_CHAR_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';
const TRANSACTION_ID = 'exploreit';
```

**Device Filtering:**

```typescript
function isExploreitRobot(device: Device): boolean {
  return device.name?.startsWith('EXPLORE-IT') ?? false;
}
```

**Connection Flow:**

```typescript
async connect(deviceId: string): Promise<void> {
  const device = await this.bleManager.connectToDevice(deviceId);
  await device.discoverAllServicesAndCharacteristics();

  // Subscribe to notifications
  await device.monitorCharacteristicForService(
    BLE_SERVICE_UUID,
    BLE_CHAR_UUID,
    (error, characteristic) => {
      if (error) {
        this.handleError(error);
        return;
      }

      if (characteristic?.value) {
        const data = Buffer.from(characteristic.value, 'base64');
        this.notificationCallback?.(new Uint8Array(data));
      }
    },
    TRANSACTION_ID
  );

  this.setState('connected');
}
```

**Write Operation:**

```typescript
async write(data: string | Uint8Array): Promise<void> {
  if (!this.connectedDevice) {
    throw new Error('Not connected to any device');
  }

  // Convert to base64 for BLE
  const buffer = typeof data === 'string'
    ? Buffer.from(data, 'latin1')
    : Buffer.from(data);
  const base64 = buffer.toString('base64');

  await this.connectedDevice.writeCharacteristicWithResponseForService(
    BLE_SERVICE_UUID,
    BLE_CHAR_UUID,
    base64
  );
}
```

### Emulator Implementation

The emulator provides simulated robots that respond to protocol commands without requiring physical hardware. This enables:

- Development on platforms without BLE (web, Expo Go)
- Automated testing without physical robots
- UI development and iteration
- Protocol handler testing

**Emulator Features:**

1. **Simulated Discovery:**
   - Emit virtual robots with configurable firmware versions
   - One emulated robot per supported protocol (V3, V6, V10)
   - Simulated RSSI values

2. **Protocol Response Simulation:**
   - Parse incoming commands
   - Generate appropriate responses per protocol version
   - Simulate response timing with delays

3. **State Simulation:**
   - Track uploaded programs in memory
   - Simulate program execution with timing
   - Generate synthetic download data

**Example Emulated Robot:**

```typescript
class EmulatedRobot {
  private firmwareVersion: number;
  private name: string;
  private program: RobotInstruction[] = [];
  private interval: number = 2;

  constructor(firmwareVersion: number, name: string) {
    this.firmwareVersion = firmwareVersion;
    this.name = name;
  }

  async handleCommand(data: string | Uint8Array): Promise<Uint8Array | null> {
    const command = this.parseCommand(data);

    switch (command.type) {
      case 'VERSION':
        return this.encodeResponse(`VER ${this.firmwareVersion}`);

      case 'INTERVAL_QUERY':
        return this.encodeResponse(`I=${this.interval.toString().padStart(2, '0')}`);

      case 'FLUSH':
        this.program = [];
        return null; // No response

      case 'RUN':
        await this.simulateExecution();
        return this.encodeResponse('_END');

      case 'STOP':
        return this.encodeResponse('_SR_');

      // ... other commands
    }
  }

  private async simulateExecution(): Promise<void> {
    const duration = this.program.length * this.interval * 100; // ms
    await new Promise((resolve) => setTimeout(resolve, duration));
  }
}
```

**Emulator Configuration:**

```typescript
interface EmulatorConfig {
  robots: Array<{
    firmwareVersion: number;
    name: string;
    signalStrength: number; // RSSI
  }>;
  responseDelay: number; // Simulated network latency (ms)
}

const DEFAULT_EMULATOR_CONFIG: EmulatorConfig = {
  robots: [
    { firmwareVersion: 10, name: 'EXPLORE-IT EMU:V10', signalStrength: -45 },
    { firmwareVersion: 9, name: 'EXPLORE-IT EMU:V6', signalStrength: -55 },
    { firmwareVersion: 3, name: 'EXPLORE-IT EMU:V3', signalStrength: -65 },
  ],
  responseDelay: 100,
};
```

## Layer 4: Discovery Mechanism

### Purpose

The Discovery mechanism finds available robots and initializes the appropriate protocol handler for each discovered device. It coordinates between the Hardware Layer and the top-level Robot class.

### Responsibilities

- Scan for available robots using Hardware Layer
- Filter discovered devices to match EXPLORE-IT robots
- Establish connections and perform version detection
- Create Robot instances with appropriate protocol handlers
- Maintain a registry of discovered robots
- Handle discovery lifecycle (start, stop, clear)

### Architecture

```txt
┌──────────────────────────────────────────────────────────┐
│                  RobotDiscoveryManager                   │
│                                                          │
│  Coordinates:                                            │
│  1. Hardware Layer for device scanning                   │
│  2. Connection establishment                             │
│  3. Version detection ('Z' command)                      │
│  4. Protocol handler selection                           │
│  5. Robot instance creation                              │
└──────────────────────────────────────────────────────────┘
```

### Interface Definition

```typescript
interface IRobotDiscoveryManager {
  // Discovery control
  startDiscovery(): Promise<void>;
  stopDiscovery(): Promise<void>;
  clearDiscoveredRobots(): void;

  // Discovery status
  getDiscoveryStatus(): DiscoveryStatus;
  getDiscoveredRobots(): DiscoveredRobotInfo[];

  // Robot creation
  createRobot(robotId: string): Promise<IRobot>;

  // Events
  onRobotDiscovered(callback: (robot: DiscoveredRobotInfo) => void): void;
  onDiscoveryStatusChange(callback: (status: DiscoveryStatus) => void): void;
}

interface DiscoveredRobotInfo {
  id: string;
  name: string;
  signalStrength: number;
  // Firmware version and protocol determined after connection
  firmwareVersion?: number;
  protocolVersion?: ProtocolVersion;
}

type DiscoveryStatus = 'idle' | 'scanning' | 'stopped' | 'error';
```

### Discovery Flow

```txt
┌────────────┐
│ Start      │
│ Discovery  │
└──────┬─────┘
       │
       ▼
┌────────────────────────┐
│ Hardware Layer:        │
│ startDiscovery()       │
└──────┬─────────────────┘
       │
       │ Device found
       ▼
┌────────────────────────┐
│ Filter: Is EXPLORE-IT? │
└──────┬─────────────────┘
       │ Yes
       ▼
┌────────────────────────┐
│ Add to discovered list │
│ Emit discovery event   │
└────────────────────────┘
```

### Robot Creation Flow

```txt
┌────────────┐
│ UI selects │
│ robot      │
└──────┬─────┘
       │
       ▼
┌────────────────────────┐
│ createRobot(robotId)   │
└──────┬─────────────────┘
       │
       ▼
┌────────────────────────┐
│ Hardware Layer:        │
│ connect(robotId)       │
└──────┬─────────────────┘
       │
       ▼
┌────────────────────────┐
│ Send 'Z' command       │
│ (version request)      │
└──────┬─────────────────┘
       │
       ▼
┌────────────────────────┐
│ Parse 'VER X' response │
│ Determine firmware ver │
└──────┬─────────────────┘
       │
       ▼
┌────────────────────────┐
│ Create protocol handler│
│ based on version       │
└──────┬─────────────────┘
       │
       ▼
┌────────────────────────┐
│ Create Robot instance  │
│ with handler           │
└──────┬─────────────────┘
       │
       ▼
┌────────────────────────┐
│ Return IRobot to UI    │
└────────────────────────┘
```

### Implementation Example

```typescript
class RobotDiscoveryManager implements IRobotDiscoveryManager {
  private hardwareLayer: IHardwareLayer;
  private discoveredRobots: Map<string, DiscoveredRobotInfo> = new Map();
  private status: DiscoveryStatus = 'idle';

  constructor(hardwareLayer: IHardwareLayer) {
    this.hardwareLayer = hardwareLayer;
  }

  async startDiscovery(): Promise<void> {
    this.status = 'scanning';
    this.discoveredRobots.clear();

    await this.hardwareLayer.startDiscovery((device) => {
      if (this.isExploreitRobot(device)) {
        const robotInfo: DiscoveredRobotInfo = {
          id: device.id,
          name: device.name,
          signalStrength: device.rssi,
        };

        this.discoveredRobots.set(device.id, robotInfo);
        this.emitRobotDiscovered(robotInfo);
      }
    });
  }

  async createRobot(robotId: string): Promise<IRobot> {
    const robotInfo = this.discoveredRobots.get(robotId);
    if (!robotInfo) {
      throw new Error(`Robot not found: ${robotId}`);
    }

    // Connect to robot
    await this.hardwareLayer.connect(robotId);

    // Perform version detection
    const firmwareVersion = await this.detectVersion();

    // Create protocol handler
    const protocolHandler = this.createProtocolHandler(firmwareVersion, this.hardwareLayer);

    // Create and return Robot instance
    return new Robot(robotInfo.id, robotInfo.name, firmwareVersion, protocolHandler);
  }

  private async detectVersion(): Promise<number> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Version detection timeout'));
      }, 5000);

      this.hardwareLayer.onNotification((data) => {
        const response = Buffer.from(data).toString('latin1');
        if (response.startsWith('VER')) {
          clearTimeout(timeout);
          const version = parseInt(response.substring(4));
          resolve(version);
        }
      });

      this.hardwareLayer.write('Z');
    });
  }

  private isExploreitRobot(device: DiscoveredDevice): boolean {
    return device.name.startsWith('EXPLORE-IT');
  }
}
```

## Error Handling Strategy

### Error Categories

1. **Connection Errors:**
   - Bluetooth disabled
   - Permissions denied
   - Connection timeout
   - Device out of range
   - Unexpected disconnection

2. **Protocol Errors:**
   - Unsupported firmware version
   - Invalid response format
   - Command sequence violation
   - Timeout waiting for response

3. **Data Errors:**
   - Program too large
   - Invalid instruction values
   - Packet loss during download
   - Data corruption

4. **Operational Errors:**
   - Command rejected (invalid state)
   - Robot busy with another operation
   - Operation timeout

### Error Handling Approach

**Layer-Specific Handling:**

- **Hardware Layer:** Catch BLE errors, convert to `HardwareError`
- **Protocol Layer:** Catch protocol errors, convert to `ProtocolError`
- **Robot Class:** Catch all errors, convert to user-friendly `RobotError`

**Error Propagation:**

```typescript
class RobotError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'RobotError';
  }
}

// Usage in Robot class
async uploadProgram(program: RobotProgram): Promise<void> {
  try {
    // Validate program
    this.validateProgram(program);

    // Update state
    this.operationalState = 'uploading';

    // Delegate to protocol handler
    await this.protocolHandler.uploadProgram(program, (progress) => {
      this.emitUploadProgress(progress);
    });

    // Update state
    this.operationalState = 'idle';
  } catch (error) {
    this.operationalState = 'idle';

    if (error instanceof ProtocolError) {
      throw new RobotError(
        'UPLOAD_FAILED',
        'Failed to upload program to robot',
        error
      );
    } else if (error instanceof HardwareError) {
      throw new RobotError(
        'CONNECTION_ERROR',
        'Lost connection to robot during upload',
        error
      );
    } else {
      throw new RobotError(
        'UNKNOWN_ERROR',
        'An unexpected error occurred',
        error
      );
    }
  }
}
```

**User-Facing Error Messages:**

```typescript
const ERROR_MESSAGES: Record<string, string> = {
  UPLOAD_FAILED: 'Could not upload program to robot. Try again.',
  CONNECTION_ERROR: 'Lost connection to robot. Check robot is on and nearby.',
  PROGRAM_TOO_LARGE: 'Program is too large for this robot firmware version.',
  INVALID_STATE: 'Robot is busy. Stop current operation first.',
  UNSUPPORTED_VERSION: 'Robot firmware is not supported. Update robot or app.',
  BLUETOOTH_DISABLED: 'Bluetooth is disabled. Enable Bluetooth and try again.',
  PERMISSION_DENIED: 'Bluetooth permission required to connect to robot.',
};
```

## Testing Strategy

### Unit Testing

**Protocol Handlers:**

- Test each protocol handler with mock hardware layer
- Verify correct command sequences
- Verify data encoding/decoding
- Test error conditions

**Robot Class:**

- Test state management
- Test command delegation
- Test error handling and transformation
- Mock protocol handler for isolation

**Hardware Layer:**

- Test BLE implementation with mock BLE manager
- Test emulator implementation
- Verify discovery filtering
- Test connection lifecycle

### Integration Testing

**Protocol → Hardware Integration:**

- Test protocol handlers with emulator
- Verify complete command/response cycles
- Test all protocol versions

**Robot → Protocol Integration:**

- Test Robot class with each protocol handler
- Verify state transitions
- Test multi-step operations (upload, download)

**End-to-End Testing:**

- Test complete flow from UI to emulated robot
- Test discovery → connection → operation cycle
- Test error scenarios

### Testing with Emulator

Benefits:

- No physical hardware required
- Fast test execution
- Consistent, repeatable results
- Easy to simulate error conditions

Example test:

```typescript
describe('Robot Upload', () => {
  it('should upload program successfully with V10 protocol', async () => {
    const emulator = new EmulatorHardwareLayer();
    const discovery = new RobotDiscoveryManager(emulator);

    await discovery.startDiscovery();
    const robots = discovery.getDiscoveredRobots();
    const v10Robot = robots.find((r) => r.name.includes('V10'));

    const robot = await discovery.createRobot(v10Robot.id);

    const program: RobotProgram = {
      instructions: [
        { leftMotorSpeed: 100, rightMotorSpeed: 100 },
        { leftMotorSpeed: 0, rightMotorSpeed: 0 },
      ],
    };

    await robot.uploadProgram(program);

    expect(robot.operationalState).toBe('idle');
  });
});
```

## Implementation Guidelines

### Dependency Injection

Use dependency injection throughout the stack to enable testing and flexibility:

```typescript
// Robot class accepts protocol handler
class Robot implements IRobot {
  constructor(
    private id: string,
    private name: string,
    private firmwareVersion: number,
    private protocolHandler: IProtocolHandler
  ) {}
}

// Protocol handler accepts hardware layer
class V10ProtocolHandler implements IProtocolHandler {
  constructor(private hardware: IHardwareLayer) {}
}

// Discovery manager accepts hardware layer
class RobotDiscoveryManager implements IRobotDiscoveryManager {
  constructor(private hardwareLayer: IHardwareLayer) {}
}
```

### Factory Pattern

Use factories to create instances with correct dependencies:

```typescript
class RobotFactory {
  static createWithBLE(): IRobotDiscoveryManager {
    const hardware = new BLEHardwareLayer();
    return new RobotDiscoveryManager(hardware);
  }

  static createWithEmulator(config?: EmulatorConfig): IRobotDiscoveryManager {
    const hardware = new EmulatorHardwareLayer(config);
    return new RobotDiscoveryManager(hardware);
  }
}

// Usage
const discovery =
  Platform.OS === 'web' ? RobotFactory.createWithEmulator() : RobotFactory.createWithBLE();
```

### State Management

Keep state management within each layer:

- **Robot Class:** Connection state, operational state
- **Protocol Handler:** Operation-specific state (upload progress, download buffer)
- **Hardware Layer:** Connection state, discovered devices

Expose state through getters and events, not by exposing internal state objects.

### Async Operations

Use async/await consistently for all asynchronous operations. Provide cancellation where appropriate:

```typescript
interface IProtocolHandler {
  uploadProgram(
    program: RobotProgram,
    options?: {
      onProgress?: (progress: number) => void;
      signal?: AbortSignal; // For cancellation
    }
  ): Promise<void>;
}
```

### Logging and Debugging

Add structured logging at each layer:

```typescript
class Robot implements IRobot {
  private logger: ILogger;

  async uploadProgram(program: RobotProgram): Promise<void> {
    this.logger.info('Upload started', {
      instructionCount: program.instructions.length,
    });

    try {
      await this.protocolHandler.uploadProgram(program);
      this.logger.info('Upload completed');
    } catch (error) {
      this.logger.error('Upload failed', error);
      throw error;
    }
  }
}
```

### Performance Considerations

- **Upload/Download:** Show progress for operations >1 second
- **Discovery:** Limit scan duration (default 10 seconds)
- **Timeouts:** Configurable timeouts for all operations
- **Memory:** Clear buffers after operations complete

## Future Enhancements

### Potential Extensions

1. **Firmware Update:**
   - Add firmware update capability through communication stack
   - Protocol handler for bootloader mode

2. **Diagnostic Commands:**
   - Battery level query
   - Motor diagnostics
   - Sensor readings

3. **Advanced Recording:**
   - Real-time recording with live preview
   - Sensor-triggered recording

4. **Multi-Robot Support:**
   - Simultaneous connection to multiple robots
   - Synchronized program execution

5. **Protocol Retransmission:**
   - Implement packet retransmission for V6/V10
   - Improve reliability for large programs

6. **Connection Pool:**
   - Maintain pool of connected robots
   - Quick switching between robots

7. **Offline Mode:**
   - Cache robot programs
   - Queue operations for later execution

## Summary

The Robot Communication Stack provides a well-architected, layered approach to robot communication that:

- **Separates Concerns:** Each layer has clear, focused responsibilities
- **Enables Extension:** New protocols can be added without modifying existing code
- **Supports Testing:** Emulator enables development and testing without hardware
- **Provides Flexibility:** Interface-based design allows implementation swapping
- **Handles Complexity:** Protocol differences abstracted behind clean interfaces
- **Maintains Simplicity:** UI uses simple, domain-specific commands

The stack follows SOLID principles and provides a solid foundation for reliable, maintainable robot communication in the EXPLORE-IT robotics application.
