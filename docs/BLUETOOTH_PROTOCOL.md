# EXPLORE-IT Robotics Bluetooth Protocol Documentation

**Version:** 1.0
**Generated:** 2025-11-06
**Author:** Reverse-engineered from legacy app source code
**Last Updated:** 2025-11-06

---

## Table of Contents

1. [Overview](#1-overview)
2. [BLE Connection Details](#2-ble-connection-details)
3. [Protocol Versions](#3-protocol-versions)
4. [Connection Establishment](#4-connection-establishment)
5. [Command Reference](#5-command-reference)
6. [Response Reference](#6-response-reference)
7. [Data Encoding](#7-data-encoding)
8. [Protocol Version Handlers](#8-protocol-version-handlers)
9. [Operation Sequences](#9-operation-sequences)
10. [Error Handling](#10-error-handling)
11. [Implementation Notes](#11-implementation-notes)
12. [Examples](#12-examples)

---

## 1. Overview

The EXPLORE-IT robotics system uses Bluetooth Low Energy (BLE) for communication between a mobile app and the robot. The protocol supports:

- **Device discovery and connection**
- **Version negotiation** (supports robot firmware v1-v10)
- **Program upload** (up to 4,096 instructions)
- **Program download** (beam from robot to app)
- **Live recording** (learn mode)
- **Real-time execution** (run and go commands)
- **Configuration** (interval timing)

### Key Characteristics

- **Transport:** BLE GATT (Generic Attribute Profile)
- **Encoding:** ASCII text (v1-v4) and binary (v6+)
- **Command Format:** Single-character or short string commands
- **Response Format:** Text strings or binary data
- **Data Model:** Differential drive motor speeds (left/right wheels, 0-100%)
- **Speed Resolution:** 8-bit (0-255 internally, scaled from 0-100%)

---

## 2. BLE Connection Details

### 2.1 GATT Service and Characteristics

```
Service UUID:        0000ffe0-0000-1000-8000-00805f9b34fb
Characteristic UUID: 0000ffe1-0000-1000-8000-00805f9b34fb
Transaction ID:      "exploreit"
```

**Characteristic Properties:**
- Read ✓
- Write with response ✓
- Notify ✓

### 2.2 Device Discovery

**Device Name Filter:** Device names must start with `"EXPLORE-IT"`

**Example Device Names:**
```
EXPLORE-IT 70:AB
EXPLORE-IT 80:CD
EXPLORE-IT 90:EF
```

The suffix typically represents the last bytes of the device's MAC address.

### 2.3 Platform-Specific Requirements

**Android:**
- Requires `ACCESS_FINE_LOCATION` permission (for BLE scanning)
- Android 12+: Requires `BLUETOOTH_SCAN` and `BLUETOOTH_CONNECT` permissions
- Location services must be enabled

**iOS:**
- Requires `NSBluetoothAlwaysUsageDescription` in Info.plist
- No location permission required

---

## 3. Protocol Versions

The robot firmware has evolved through multiple versions, each with slight protocol variations. The app supports versions 1-10 with backward compatibility.

### 3.1 Version Mapping

| Firmware Version | Handler Class             | Protocol Style   | Notes                  |
| ---------------- | ------------------------- | ---------------- | ---------------------- |
| 1                | `BootstrapHandler`        | Bootstrap only   | Version detection only |
| 2-4              | `CommunicationHandlerV3`  | Text-based       | ASCII speed data       |
| 5-8              | (Not implemented)         | -                | Unsupported range      |
| 9                | `CommunicationHandlerV6`  | Binary           | Packeted downloads     |
| 10               | `CommunicationHandlerV10` | Binary + Chunked | Chunked uploads        |

### 3.2 Key Differences by Version

**V3 (Firmware 2-4):**
- Speed data as ASCII text: `"255,128xx"`
- Each instruction sent separately
- Download uses comma-delimited format
- End marker: `",,,,"`

**V6 (Firmware 9):**
- Binary speed data (2 bytes per instruction)
- Packeted downloads with sequence numbers
- First packet contains total instruction count
- Packet loss detection (incomplete)

**V10 (Firmware 10):**
- Binary uploads in chunks (max 256 instructions/chunk)
- Same binary download as V6
- Supports up to 4,096 instructions
- Better handling of large programs

---

## 4. Connection Establishment

### 4.1 Connection Sequence

```
1. App: Scan for devices starting with "EXPLORE-IT"
2. App: Connect to selected device
3. App: Discover services and characteristics
4. App: Subscribe to characteristic notifications
5. App → Robot: 'Z' (version request)
6. Robot → App: 'VER 10' (or other version number)
7. App: Select appropriate protocol handler
8. App → Robot: 'I?' (query interval)
9. Robot → App: 'I=02' (current interval value)
10. Connection established, ready for commands
```

### 4.2 Version Detection

**Command:** `Z`
**Response:** `VER<space><number>`

**Examples:**
```
Robot Response: "VER 3"  → Use V3 handler
Robot Response: "VER 9"  → Use V6 handler
Robot Response: "VER 10" → Use V10 handler
```

**Version Compatibility Check:**
- If robot version > max supported app version → Alert: "Update app"
- If robot version < min supported app version → Alert: "Update robot firmware"
- Disconnect if incompatible

---

## 5. Command Reference

### 5.1 Control Commands

| Command | Name                | Description                           | Versions | Parameters     |
| ------- | ------------------- | ------------------------------------- | -------- | -------------- |
| `Z`     | Version Request     | Query robot firmware version          | All      | None           |
| `R`     | Run                 | Execute stored program from beginning | All      | None           |
| `G`     | Go                  | Start robot movement (drive mode)     | All      | None           |
| `S`     | Stop                | Emergency stop all operations         | All      | None           |
| `B`     | Beam/Begin Download | Download program from robot           | All      | None           |
| `I?`    | Interval Query      | Get current interval setting          | All      | None           |
| `I<nn>` | Interval Set        | Set interval (0-50)                   | All      | Interval value |

### 5.2 Programming Commands

| Command   | Name        | Description                      | Versions | Parameters   |
| --------- | ----------- | -------------------------------- | -------- | ------------ |
| `F`       | Flush       | Prepare robot memory for writing | All      | None         |
| `d<hhhh>` | Data Length | Specify program length in bytes  | All      | 4 hex digits |
| `E`       | Enter/Edit  | Begin upload mode                | All      | None         |
| `L`       | Learn       | Start recording mode             | All      | None         |
| `end`     | End         | Terminate upload sequence        | V3       | None         |

### 5.3 Command Details

#### Version Request: `Z`
```
Purpose: Query robot firmware version
App → Robot: 'Z'
Robot → App: 'VER 10'
Notes: Always sent immediately after connection
```

#### Run Program: `R`
```
Purpose: Execute the stored program from start
App → Robot: 'R'
Robot → App: '_END' (when finished)
Notes: Robot executes all instructions in sequence
```

#### Go (Drive): `G`
```
Purpose: Start continuous movement
App → Robot: 'G'
Notes: Robot enters drive mode, awaits speed commands
```

#### Stop: `S`
```
Purpose: Emergency stop
App → Robot: 'S'
Robot → App: '_SR_'
Notes: Stops all motors immediately, cancels any operation
```

#### Beam/Download: `B`
```
Purpose: Download program from robot to app
App → Robot: 'B'
Robot → App: [Multiple packets with speed data]
Robot → App: ',,,,' (V3) or final packet (V6/V10)
Notes: Protocol differs by version (see section 8)
```

#### Interval Query: `I?`
```
Purpose: Get current interval setting
App → Robot: 'I?'
Robot → App: 'I=02'
Notes: Interval range 0-50, affects instruction timing
```

#### Interval Set: `I<nn>`
```
Purpose: Set interval (instruction duration)
App → Robot: 'I25'
Robot → App: (Confirmation)
App → Robot: 'I?' (App re-queries to confirm)
Robot → App: 'I=25'
Notes: Valid range 0-50, robot validates and clamps
```

#### Flush: `F`
```
Purpose: Clear robot memory, prepare for new program
App → Robot: 'F'
Notes: Always first command in upload/record sequence
```

#### Data Length: `d<hhhh>`
```
Purpose: Tell robot how many bytes to expect
App → Robot: 'd07FF'
Calculation: (num_instructions × 2 - 1) in hex
Example: 1024 instructions = 2048 bytes - 1 = 2047 = 0x07FF
Notes: 4 hex digits, uppercase, zero-padded
```

#### Enter Upload Mode: `E`
```
Purpose: Begin upload sequence
App → Robot: 'E'
Notes: Must follow 'F' and 'd<hhhh>' commands
```

#### Learn/Record: `L`
```
Purpose: Start recording robot movements
App → Robot: 'L'
Notes: Must follow 'F' and 'd<hhhh>' commands
       Robot records sensor data at specified interval
```

#### End Upload: `end`
```
Purpose: Signal end of upload (V3 only)
App → Robot: 'end'
Robot → App: 'FULL'
Notes: V6/V10 don't use this (binary end-of-data)
```

---

## 6. Response Reference

### 6.1 Text Responses

| Response        | Meaning            | When Received        | Action                     |
| --------------- | ------------------ | -------------------- | -------------------------- |
| `VER<space><n>` | Version info       | After 'Z' command    | Select protocol handler    |
| `I=<nn>`        | Interval value     | After 'I?' command   | Update interval display    |
| `_SR_`          | Stop received      | After 'S' command    | Update UI to stopped state |
| `_END`          | Execution complete | After 'R' or 'G'     | Robot finished program     |
| `FULL`          | Operation complete | After upload/record  | Success confirmation       |
| `,,,,`          | Download complete  | End of 'B' (V3 only) | Stop receiving data        |

### 6.2 Binary Responses (V6/V10)

**Download Format:**
```
Packet 0: [Total byte count as multi-byte integer]
Packet 1: [Seq#][Left0][Right0][Left1][Right1]...[Left8][Right8]
Packet 2: [Seq#][Left9][Right9]...
...
```

- **Sequence Number:** 1 byte (0-255, wraps around)
- **Speed Data:** Pairs of bytes (left, right)
- **Packet Size:** Up to 19 bytes (1 seq# + 18 data bytes = 9 instructions)

### 6.3 Response Timing

- Most commands respond immediately (<100ms)
- Download can take seconds for large programs
- Record operation duration is specified by app
- Run operation duration depends on program length

---

## 7. Data Encoding

### 7.1 Speed Values

The app stores speeds as **percentages (0-100)**, while the robot uses **8-bit values (0-255)**.

**App to Robot Conversion:**
```javascript
robotSpeed = Math.floor(appSpeed * 2.55 + 0.5);  // Round to nearest
if (appSpeed === 0) robotSpeed = 0;              // Special case for zero
```

**Robot to App Conversion:**
```javascript
appSpeed = Math.trunc(robotSpeed / 2.55 + 0.5);  // Truncate after rounding
```

**Examples:**
| App Speed (%) | Robot Speed (0-255) | Actual % |
| ------------- | ------------------- | -------- |
| 0             | 0                   | 0%       |
| 50            | 128                 | 50.2%    |
| 100           | 255                 | 100%     |
| 25            | 64                  | 25.1%    |
| 75            | 191                 | 74.9%    |

### 7.2 Instruction Format

An **Instruction** consists of two speed values:
- **Left wheel speed** (0-100%)
- **Right wheel speed** (0-100%)

**Behaviors:**
- `{left: 100, right: 100}` → Forward
- `{left: 0, right: 0}` → Stop
- `{left: 100, right: 0}` → Turn right
- `{left: 0, right: 100}` → Turn left
- `{left: 100, right: -100}` → Spin (if negative supported)

### 7.3 Program Structure

A **Program** is a sequence of instructions:
```javascript
{
  id: "uuid-v4",
  name: "Forward and Turn",
  programType: 0, // 0 = STEPS, 1 = BLOCKS
  steps: [
    {left: 100, right: 100},  // Forward
    {left: 100, right: 100},  // Forward
    {left: 100, right: 0},    // Turn right
    {left: 0, right: 0}       // Stop
  ],
  blocks: [],
  date: "2025-11-06T..."
}
```

**Program Types:**
- **STEPS (0):** Direct instruction list
- **BLOCKS (1):** References to other programs with repetition counts

---

## 8. Protocol Version Handlers

### 8.1 V3 Handler (Firmware 2-4)

#### Upload Sequence
```
1. App → Robot: 'F'                           // Flush
2. App → Robot: 'd0003'                       // 2 instructions = 4 bytes - 1 = 3
3. App → Robot: 'E'                           // Enter edit mode
4. App → Robot: '255,128xx'                   // First instruction (text)
5. App → Robot: '064,191xx'                   // Second instruction (text)
6. App → Robot: 'end'                         // End marker
7. Robot → App: 'FULL'                        // Confirmation
```

**Speed Format:** `"LLL,RRRxx"`
- 3 digits for left (zero-padded)
- Comma separator
- 3 digits for right (zero-padded)
- Two 'x' characters (ignored)

**Example:**
```
Left: 50% → 128 → "128"
Right: 100% → 255 → "255"
Command: "128,255xx"
```

#### Download Sequence
```
1. App → Robot: 'B'                           // Begin download
2. Robot → App: '255,128'                     // First instruction
3. Robot → App: '064,191'                     // Second instruction
4. Robot → App: ',,,,'                        // End marker
5. App: Parse instructions, display to user
```

**Speed Format:** `"LLL,RRR"`
- 3 digits for left
- Comma separator
- 3 digits for right
- No 'xx' suffix on download

#### Record Sequence
```
1. App → Robot: 'F'                           // Flush
2. App → Robot: 'd00C7'                       // Duration: 100 intervals = 200 bytes - 1
3. App → Robot: 'L'                           // Learn mode
4. Robot: Records sensor data for specified duration
5. Robot → App: 'FULL'                        // Recording complete
```

**Duration Calculation (V3):**
```javascript
duration = 100;  // seconds
byteCount = duration * 2 - 1;  // Each instruction = 2 bytes
hex = byteCount.toString(16).toUpperCase();
hex = hex.padStart(4, '0');
// Result: 'd00C7'
```

---

### 8.2 V6 Handler (Firmware 9)

#### Upload Sequence
```
1. App → Robot: 'F'                           // Flush
2. App → Robot: 'd0003'                       // 2 instructions = 4 bytes - 1
3. App → Robot: 'E'                           // Enter edit mode
4. App → Robot: [0xFF, 0x80, 0x40, 0xBF]      // Binary data (2 instructions)
5. App → Robot: 'end'                         // End marker (might not be needed)
6. Robot → App: 'FULL'                        // Confirmation
```

**Binary Format:**
```
Byte stream: [Left0, Right0, Left1, Right1, ...]
Example: [255, 128, 64, 191]
  Instruction 0: left=255 (100%), right=128 (50%)
  Instruction 1: left=64 (25%), right=191 (75%)
```

#### Download Sequence
```
1. App → Robot: 'B'                           // Begin download
2. Robot → App: [0x00, 0x00, 0x00, 0x04]      // Packet 0: Total bytes (4 = 2 instructions)
3. Robot → App: [0x01, 0xFF, 0x80, 0x40, 0xBF] // Packet 1: Seq# + data
4. App: Parse binary data, handle packet loss
```

**Packet Structure:**
- **Packet 0:** Total byte count (multi-byte integer, big-endian)
- **Subsequent Packets:** [Sequence#][Data bytes...]
  - Sequence# increments 0→1→2→...→255→0 (wraps)
  - Up to 18 data bytes per packet (9 instructions)

**Packet Loss Handling (INCOMPLETE IN CODE):**
```javascript
// Current implementation tracks lost packets but doesn't request retransmission
if (expectedSeq !== actualSeq) {
  lostLines.push(actualSeq - 1);  // BUG: Should be expectedSeq
}
// TODO: Request retransmission of lost packets
```

**Known Limitation:**
- Programs >256 packets (~2,400 instructions) have sequence number wrap issues
- Packet loss recovery not implemented

#### Record Sequence
```
1. App → Robot: 'F'                           // Flush
2. App → Robot: 'd00C7'                       // Duration × interval × 2 - 1
3. App → Robot: 'L'                           // Learn mode
4. Robot: Records at specified interval
5. Robot → App: 'FULL'                        // Recording complete
```

**Duration Calculation (V6):**
```javascript
duration = 100;   // seconds
interval = 1;     // interval setting
byteCount = interval * duration * 2 - 1;
hex = byteCount.toString(16).toUpperCase().padStart(4, '0');
// Result: 'd00C7'
```

---

### 8.3 V10 Handler (Firmware 10)

V10 is identical to V6 except for **upload**, which now supports chunking for large programs.

#### Chunked Upload Sequence
```
1. App → Robot: 'F'                           // Flush
2. App → Robot: 'd1FFF'                       // 4096 instructions = 8192 bytes - 1
3. App → Robot: 'E'                           // Enter edit mode
4. App → Robot: [Chunk 1: 512 bytes]          // First 256 instructions
5. App → Robot: [Chunk 2: 512 bytes]          // Next 256 instructions
6. ...
7. App → Robot: [Chunk 16: 512 bytes]         // Last 256 instructions
8. Robot → App: 'FULL'                        // Upload complete
```

**Chunking Logic:**
```javascript
maxChunkSize = 256;  // instructions per chunk
chunks = [];
for (let offset = 0; offset < instructions.length; offset += maxChunkSize) {
  let chunkSize = Math.min(maxChunkSize, instructions.length - offset);
  let bytes = new Uint8Array(chunkSize * 2);

  for (let i = 0; i < chunkSize; i++) {
    bytes[i * 2] = instructions[offset + i].left * 2.55;
    bytes[i * 2 + 1] = instructions[offset + i].right * 2.55;
  }

  chunks.push(bytes);
}

// Send chunks sequentially
for (chunk of chunks) {
  await sendCommandToActDevice(chunk);
}
```

**Maximum Program Size:**
- **V3:** Limited by BLE packet size (~100 instructions practical limit)
- **V6:** Limited by memory (~2,400 instructions before seq# wrap)
- **V10:** 4,096 instructions (enforced by app)

---

## 9. Operation Sequences

### 9.1 Upload Program to Robot

**High-Level Steps:**
1. Flatten program (resolve nested blocks)
2. Validate length (0 < instructions ≤ 4096)
3. Convert speeds from % to 0-255
4. Send upload sequence based on protocol version
5. Wait for FULL confirmation

**V10 Upload Flow:**
```javascript
async function uploadProgram(instructions, version) {
  // 1. Validation
  if (instructions.length === 0 || instructions.length > 4096) {
    throw new Error("Invalid program length");
  }

  // 2. Flush memory
  await sendCommand('F');

  // 3. Send data length
  let byteCount = instructions.length * 2 - 1;
  let hex = byteCount.toString(16).toUpperCase().padStart(4, '0');
  await sendCommand('d' + hex);

  // 4. Enter edit mode
  await sendCommand('E');

  // 5. Send data in chunks (V10)
  let chunks = chunkInstructions(instructions, 256);
  for (let chunk of chunks) {
    await sendCommand(chunk);  // Binary data
  }

  // 6. Wait for FULL response
  // (Handled by response listener)
}
```

### 9.2 Download Program from Robot

**High-Level Steps:**
1. Send 'B' command
2. Receive packets (format depends on version)
3. Parse speed data
4. Convert 0-255 to percentages
5. Display to user

**V10 Download Flow:**
```javascript
async function downloadProgram() {
  downloading = true;
  receivedInstructions = [];

  // 1. Request download
  await sendCommand('B');

  // 2. Handle responses (in notification listener)
  // First packet: total byte count
  // Subsequent packets: [seq#][data...]

  // Notification handler:
  function onNotification(data) {
    if (packetCount === -1) {
      // First packet: parse total count
      totalBytes = parseMultiByteInt(data);
      packetCount = Math.ceil((totalBytes + 1) / 18);
    } else {
      // Data packet
      let seq = data[0];
      let instructions = parseInstructions(data.slice(1));
      receivedInstructions.push(...instructions);

      packetCount--;
      if (packetCount === 0) {
        downloading = false;
        displayProgram(receivedInstructions);
      }
    }
  }
}
```

### 9.3 Record Mode (Learn)

**High-Level Steps:**
1. User sets duration and interval in settings
2. Send recording sequence
3. Robot records sensor data
4. Wait for FULL confirmation
5. Download recorded program

**Recording Flow:**
```javascript
async function startRecording(duration, interval) {
  // 1. Flush memory
  await sendCommand('F');

  // 2. Calculate byte count
  let byteCount = interval * duration * 2 - 1;
  let hex = byteCount.toString(16).toUpperCase().padStart(4, '0');
  await sendCommand('d' + hex);

  // 3. Start learning
  await sendCommand('L');

  // 4. Robot now records for specified duration
  // App shows recording indicator

  // 5. Wait for FULL response (duration × interval seconds)
  // Then automatically download recorded program
}
```

### 9.4 Run Program

**High-Level Steps:**
1. Ensure program is uploaded to robot
2. Send 'R' command
3. Robot executes program
4. Wait for '_END' response

**Run Flow:**
```javascript
async function runProgram() {
  // 1. Send run command
  await sendCommand('R');

  // 2. Update UI (show running indicator)
  setRobotState('running');

  // 3. Wait for _END response
  // (Handled by notification listener)
}
```

### 9.5 Emergency Stop

**High-Level Steps:**
1. Send 'S' command (highest priority)
2. Robot stops immediately
3. Wait for '_SR_' confirmation

**Stop Flow:**
```javascript
async function stopRobot() {
  // Send stop command
  await sendCommand('S');

  // Update UI immediately (don't wait for confirmation)
  setRobotState('stopped');

  // Confirmation will arrive via '_SR_' response
}
```

---

## 10. Error Handling

### 10.1 Connection Errors

**No devices found:**
- Check Bluetooth is enabled
- Check location permissions (Android)
- Ensure robot is powered on
- Verify robot is in range

**Connection failed:**
- Robot may be connected to another device
- Try power cycling robot
- Clear Bluetooth cache (Android)

**Connection lost during operation:**
- App saves state via redux-persist
- Attempt reconnection
- Warn user of incomplete operation

### 10.2 Protocol Errors

**Version mismatch:**
```javascript
if (robotVersion > maxSupportedVersion) {
  alert("Update App", "Robot firmware is newer. Update app.");
  disconnect();
} else if (robotVersion < minSupportedVersion) {
  alert("Update Robot", "Robot firmware is outdated. Update firmware.");
  disconnect();
}
```

**Invalid response:**
- Log error for debugging
- Display user-friendly message
- Allow retry

**Timeout:**
- Operations have implicit timeouts (BLE layer)
- No explicit timeout handling in app
- User can manually stop/disconnect

### 10.3 Data Errors

**Packet loss (V6/V10):**
```javascript
// Current implementation detects but doesn't recover
if (lostPackets.length > 0) {
  // TODO: Request retransmission
  alert("Packet loss detected");  // BUG: Never shown (code has typo)
}
```

**Recommendation:** Implement retransmission request:
```javascript
if (lostPackets.length > 0) {
  for (let packetNum of lostPackets) {
    await sendCommand('RETRANSMIT:' + packetNum);
  }
}
```

**Program too large:**
```javascript
if (instructions.length > 4096) {
  alert("Program Too Long", "Max 4096 instructions. Currently: " + instructions.length);
  return;
}
```

---

## 11. Implementation Notes

### 11.1 Code Issues Found

**1. Variable Name Typo (Lines 258, 380 of CommunicationManager.js):**
```javascript
alert("lost lines: ", lostLines);  // ❌ WRONG: lostLines is undefined
alert("lost lines: ", this._lostLines);  // ✅ CORRECT
```

**Impact:** If packet loss occurs, app will crash with ReferenceError.

**2. Incomplete Packet Loss Recovery:**
```javascript
// TODO comment in code:
// "hier werden nicht alle verlorenen Linien aufgenommen"
// Translation: "Not all lost lines are captured here"
```

**Impact:** Multi-packet loss in sequence not fully tracked.

**3. Sequence Number Wrap (>256 packets):**
```javascript
// TODO comment in code:
// "bei mehr als 256 Paketen stimmen die Zeilennummern nicht mehr"
// Translation: "Line numbers don't work correctly beyond 256 packets"
```

**Impact:** Programs >2,400 instructions may have corrupted downloads.

### 11.2 BLE Library Details

The app uses `react-native-ble-plx` v1.1.1:

**Key Methods:**
```javascript
// Scanning
manager.startDeviceScan(serviceUUIDs, options, callback);
manager.stopDeviceScan();

// Connection
device.connect();
device.discoverAllServicesAndCharacteristics();
device.onDisconnected(errorCallback);

// Communication
device.monitorCharacteristicForService(serviceUUID, charUUID, callback);
device.writeCharacteristicWithResponseForService(serviceUUID, charUUID, base64Data);

// Cleanup
device.cancelConnection();
manager.cancelTransaction(transactionId);
```

**Data Encoding:**
```javascript
// Writing (string)
let command = 'Z';
let base64 = Buffer.from(command).toString('base64');
await device.writeCharacteristic(..., base64);

// Writing (binary)
let bytes = new Uint8Array([255, 128, 64, 191]);
let base64 = Buffer.from(bytes).toString('base64');
await device.writeCharacteristic(..., base64);

// Reading
function onNotification(error, characteristic) {
  let response = Buffer.from(characteristic.value, 'base64');
  // response is now a Buffer (Uint8Array)
}
```

### 11.3 State Management

**BLE State (Redux):**
```javascript
{
  isConnecting: boolean,
  isConnected: boolean,
  isScanning: boolean,
  device: {
    name: string,
    version: number,
    isRecording: boolean,
    isRunning: boolean,
    isUploading: boolean,
    isDownloading: boolean,
    isGoing: boolean
  },
  scannedDevices: string[],
  receivedDownloads: Instruction[],
  error: string
}
```

**Response Handling:**
All robot responses are dispatched through Redux actions:
```javascript
function handleResponse(response) {
  let handler = communicationManager.getHandler(version);
  let action = handler.handleResponse(response);
  dispatch(action);
}
```

### 11.4 Permissions Flow

**Android Bluetooth Permissions (API 31+):**
```javascript
async function requestBluetoothPermissions() {
  // 1. BLUETOOTH_SCAN
  await PermissionsAndroid.request('android.permission.BLUETOOTH_SCAN');

  // 2. BLUETOOTH_CONNECT
  await PermissionsAndroid.request('android.permission.BLUETOOTH_CONNECT');

  // 3. NEARBY_WIFI_DEVICES (Android 13+)
  await PermissionsAndroid.request('android.permission.NEARBY_WIFI_DEVICES');

  // Then proceed with scanning
}
```

**Android Location Permission:**
```javascript
// Required for BLE scan on Android <12
await PermissionsAndroid.request(
  PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
);
```

---

## 12. Examples

### 12.1 Complete Connection Example

```javascript
import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

const manager = new BleManager();
const SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
const CHAR_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';

async function connectToRobot() {
  // 1. Scan for devices
  const devices = [];

  manager.startDeviceScan(null, null, (error, device) => {
    if (error) {
      console.error('Scan error:', error);
      return;
    }

    if (device.name && device.name.startsWith('EXPLORE-IT')) {
      console.log('Found robot:', device.name);
      devices.push(device);
    }
  });

  // Stop scan after 5 seconds
  setTimeout(() => manager.stopDeviceScan(), 5000);

  // 2. Connect to first device found
  if (devices.length === 0) {
    throw new Error('No robots found');
  }

  const robot = devices[0];
  await robot.connect();
  await robot.discoverAllServicesAndCharacteristics();

  // 3. Subscribe to notifications
  robot.monitorCharacteristicForService(
    SERVICE_UUID,
    CHAR_UUID,
    (error, characteristic) => {
      if (error) {
        console.error('Notification error:', error);
        return;
      }

      const response = Buffer.from(characteristic.value, 'base64');
      console.log('Received:', response.toString('latin1'));
      handleResponse(response);
    }
  );

  // 4. Request version
  await sendCommand(robot, 'Z');

  // 5. Wait for version response (handled in notification listener)

  // 6. Query interval
  await sendCommand(robot, 'I?');

  console.log('Connected to robot:', robot.name);
  return robot;
}

async function sendCommand(device, command) {
  const buffer = Buffer.from(command);
  const base64 = buffer.toString('base64');

  await device.writeCharacteristicWithResponseForService(
    SERVICE_UUID,
    CHAR_UUID,
    base64
  );
}

function handleResponse(response) {
  const text = response.toString('latin1');

  if (text.startsWith('VER')) {
    const version = parseInt(text.substring(4));
    console.log('Robot version:', version);
    // Select appropriate handler
  } else if (text.startsWith('I=')) {
    const interval = parseInt(text.substring(2));
    console.log('Interval:', interval);
  } else if (text === '_SR_') {
    console.log('Robot stopped');
  } else if (text === 'FULL') {
    console.log('Operation complete');
  } else if (text === '_END') {
    console.log('Execution complete');
  }
}
```

### 12.2 Upload Program Example (V10)

```javascript
async function uploadProgram(device, instructions) {
  const version = 10;  // Assume V10 firmware

  // 1. Validate
  if (instructions.length === 0 || instructions.length > 4096) {
    throw new Error('Invalid program length');
  }

  console.log(`Uploading ${instructions.length} instructions`);

  // 2. Flush
  await sendCommand(device, 'F');

  // 3. Send data length
  const byteCount = instructions.length * 2 - 1;
  const hex = byteCount.toString(16).toUpperCase().padStart(4, '0');
  await sendCommand(device, 'd' + hex);
  console.log('Data length:', hex);

  // 4. Enter edit mode
  await sendCommand(device, 'E');

  // 5. Send data in chunks
  const maxChunkSize = 256;
  for (let offset = 0; offset < instructions.length; offset += maxChunkSize) {
    const chunkSize = Math.min(maxChunkSize, instructions.length - offset);
    const bytes = new Uint8Array(chunkSize * 2);

    for (let i = 0; i < chunkSize; i++) {
      const instruction = instructions[offset + i];
      bytes[i * 2] = Math.floor(instruction.left * 2.55 + 0.5);
      bytes[i * 2 + 1] = Math.floor(instruction.right * 2.55 + 0.5);
    }

    // Send chunk
    const base64 = Buffer.from(bytes).toString('base64');
    await device.writeCharacteristicWithResponseForService(
      SERVICE_UUID,
      CHAR_UUID,
      base64
    );

    console.log(`Sent chunk ${Math.floor(offset / maxChunkSize) + 1}`);
  }

  console.log('Upload complete, waiting for FULL response');
  // FULL response will be received via notification listener
}

// Example usage
const program = [
  { left: 100, right: 100 },  // Forward
  { left: 100, right: 100 },  // Forward
  { left: 100, right: 0 },    // Turn right
  { left: 0, right: 0 }       // Stop
];

await uploadProgram(robot, program);
```

### 12.3 Download Program Example (V6/V10)

```javascript
class DownloadHandler {
  constructor(device) {
    this.device = device;
    this.downloading = false;
    this.expectedLine = 0;
    this.linecounter = -1;
    this.instructions = [];
  }

  async startDownload() {
    this.downloading = true;
    this.linecounter = -1;
    this.expectedLine = 0;
    this.instructions = [];

    await sendCommand(this.device, 'B');
    console.log('Download started');
  }

  handlePacket(data) {
    const buffer = [...data];

    if (this.linecounter === -1) {
      // First packet: total instruction count
      const hex = buffer.map(b => b.toString(16).padStart(2, '0')).join('');
      const totalBytes = parseInt('0x' + hex);
      this.linecounter = Math.ceil((totalBytes + 1) / 18);
      console.log(`Expecting ${this.linecounter} packets`);
      return;
    }

    // Data packet
    const seq = buffer.shift();
    console.log(`Packet ${seq} (expected ${this.expectedLine})`);

    if (this.expectedLine !== seq) {
      console.warn('Packet loss detected!');
      // TODO: Request retransmission
    }

    this.expectedLine = (seq + 1) % 256;

    // Parse instructions
    for (let i = 0; i < buffer.length / 2; i++) {
      const left = buffer[i * 2];
      const right = buffer[i * 2 + 1];

      this.instructions.push({
        left: Math.trunc(left / 2.55 + 0.5),
        right: Math.trunc(right / 2.55 + 0.5)
      });
    }

    this.linecounter--;

    if (this.linecounter === 0) {
      this.downloading = false;
      console.log(`Download complete: ${this.instructions.length} instructions`);
      return this.instructions;
    }
  }
}

// Usage
const handler = new DownloadHandler(robot);
await handler.startDownload();

// In notification listener:
function onNotification(error, characteristic) {
  if (handler.downloading) {
    const data = Buffer.from(characteristic.value, 'base64');
    const result = handler.handlePacket(data);

    if (result) {
      console.log('Downloaded program:', result);
    }
  }
}
```

---

## Appendix A: Command Quick Reference

```
┌─────────┬──────────────────┬─────────────────────────────────┐
│ Command │ Description      │ Example                         │
├─────────┼──────────────────┼─────────────────────────────────┤
│ Z       │ Version request  │ 'Z' → 'VER 10'                  │
│ I?      │ Query interval   │ 'I?' → 'I=02'                   │
│ I<n>    │ Set interval     │ 'I25' → (confirmed by I? query) │
│ R       │ Run program      │ 'R' → ... → '_END'              │
│ G       │ Go (drive mode)  │ 'G' → (robot moves)             │
│ S       │ Stop             │ 'S' → '_SR_'                    │
│ B       │ Beam (download)  │ 'B' → [packets] → ',,,,'/done   │
│ F       │ Flush memory     │ 'F' → (ready for data)          │
│ d<hex>  │ Data length      │ 'd07FF' (2048 bytes)            │
│ E       │ Enter upload     │ 'E' → (ready for program data)  │
│ L       │ Learn (record)   │ 'L' → ... → 'FULL'              │
│ end     │ End upload (V3)  │ 'end' → 'FULL'                  │
└─────────┴──────────────────┴─────────────────────────────────┘
```

---

## Appendix B: Response Quick Reference

```
┌──────────┬─────────────────────┬──────────────────────────┐
│ Response │ Meaning             │ Context                  │
├──────────┼─────────────────────┼──────────────────────────┤
│ VER <n>  │ Version number      │ After 'Z' command        │
│ I=<n>    │ Interval value      │ After 'I?' query         │
│ _SR_     │ Stop received       │ After 'S' command        │
│ _END     │ Execution complete  │ After 'R' or 'G'         │
│ FULL     │ Operation complete  │ After upload/record      │
│ ,,,,     │ Download end (V3)   │ End of 'B' download      │
│ [binary] │ Data packet         │ During download (V6/V10) │
└──────────┴─────────────────────┴──────────────────────────┘
```

---

## Appendix C: Version Comparison Table

```
┌──────────┬─────┬─────┬──────┬────────────────────────────┐
│ Feature  │ V3  │ V6  │ V10  │ Notes                      │
├──────────┼─────┼─────┼──────┼────────────────────────────┤
│ Upload   │ Text│ Bin │ Chunk│ V10 supports 4096 inst.    │
│ Download │ Text│ Pack│ Pack │ V6/V10 use packet protocol │
│ Record   │ Yes │ Yes │ Yes  │ Duration calc different    │
│ Max Size │ ~100│~2400│ 4096 │ Instructions per program   │
│ Reliable │ Low │ Med │ Med  │ Packet loss handling       │
└──────────┴─────┴─────┴──────┴────────────────────────────┘
```

---

## Appendix D: Troubleshooting

### Problem: Robot not found during scan
**Solutions:**
- Verify robot is powered on (LED indicator)
- Check Bluetooth is enabled on phone
- Android: Enable location services
- Android 12+: Grant BLUETOOTH_SCAN permission
- Move closer to robot (within 10 meters)
- Restart app and try again
- Power cycle robot

### Problem: Connection fails
**Solutions:**
- Robot may be connected to another device → disconnect other device
- Bluetooth cache issue (Android) → clear Bluetooth cache in system settings
- Restart phone Bluetooth
- Restart robot
- Check robot battery level

### Problem: Upload fails or times out
**Solutions:**
- Check connection is stable
- Reduce program size (<1000 instructions to test)
- V3 firmware: Avoid very large programs
- Ensure robot has sufficient memory
- Retry operation

### Problem: Download produces corrupted data
**Solutions:**
- V6/V10: Packet loss may have occurred
- Move closer to robot to improve signal
- Retry download
- Check for interference (Wi-Fi, other Bluetooth devices)
- Known issue: Programs >2400 instructions may corrupt (firmware limitation)

### Problem: Robot doesn't respond to commands
**Solutions:**
- Verify connection is established (check connection state)
- Send 'Z' command to verify communication
- Robot may be executing a program → send 'S' to stop
- Restart connection
- Check robot isn't in error state (power cycle)

---

## Document Version History

- **v1.0 (2025-11-06):** Initial documentation reverse-engineered from legacy app source code

---

## References

- Legacy app source: `/legacy/robby-app-master/robby-app-master/src/ble/`
- BLE Library: `react-native-ble-plx` v1.1.1 - https://github.com/Polidea/react-native-ble-plx
- Bluetooth SIG GATT Specifications: https://www.bluetooth.com/specifications/gatt/

---

**End of Document**
