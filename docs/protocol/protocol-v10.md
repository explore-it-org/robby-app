# Robot Bluetooth Protocol v10

## Overview

Protocol v10 is a binary communication protocol for controlling a two-wheeled robot over Bluetooth Low Energy (BLE). It supports uploading motor control programs, downloading recorded movements, and real-time control commands.

**Key Features:**

- Binary data format for efficient transmission
- Chunked uploads supporting up to 4096 instructions
- Packetized downloads with sequence numbers for error detection
- Bidirectional communication

## Connection & Version Negotiation

### Initial Handshake

```
App → Robot: 'Z'
Robot → App: 'VERxx' (ASCII)
```

**Example:**

- `'VER10'` - Robot reports protocol version 10

The app checks if the version is supported. If not, it displays an error and disconnects.

### Query Interval Setting

```
App → Robot: 'I?'
Robot → App: 'I=xx' (ASCII)
```

**Example:**

- `'I=02'` - Interval is set to 2 (unit: 100ms, so 200ms)

---

## Command Reference

All commands are case-sensitive ASCII characters unless specified as binary.

| Command | Description               | Parameters        | Response             |
| ------- | ------------------------- | ----------------- | -------------------- |
| `Z`     | Request protocol version  | None              | `'VERxx'` (ASCII)    |
| `F`     | Initialize buffer (flush) | None              | Ack                  |
| `dXXXX` | Set buffer size           | 4-char hex string | Ack                  |
| `E`     | Enter edit/upload mode    | None              | Ack                  |
| `L`     | Start learning/recording  | None              | Records movements    |
| `G`     | Go - Start execution      | None              | Executes program     |
| `R`     | Run - Execute program     | None              | Executes program     |
| `S`     | Stop robot                | None              | `'_sr_'` or `'_end'` |
| `B`     | Begin download (beam)     | None              | Binary data stream   |
| `I?`    | Query interval            | None              | `'I=xx'`             |
| `Ixx`   | Set interval (0-50)       | 2-digit value     | Ack then `'I=xx'`    |
| `end`   | End upload sequence       | None              | `'full'` on success  |

---

## Data Format

### Instruction Structure

An **instruction** represents motor speeds for both wheels at a single time step:

```
Instruction = [left_speed, right_speed]
```

- **left_speed**: Left motor speed (0-255 as byte, represents 0-100%)
- **right_speed**: Right motor speed (0-255 as byte, represents 0-100%)

### Speed Encoding

Motor speeds are stored in the app as percentages (0-100) and converted to bytes (0-255):

```javascript
byte_value = Math.floor(percentage * 2.55 + 0.5);
percentage = Math.trunc(byte_value / 2.55 + 0.5);
```

**Examples:**

- 0% → 0
- 50% → 128
- 100% → 255

### Buffer Size Calculation

The buffer size represents the total number of **bytes** needed:

```
buffer_size = (num_instructions × 2) - 1
```

Encoded as 4-character uppercase hexadecimal string.

**Example:**

- 100 instructions → `(100 × 2) - 1 = 199` → `'00C7'`
- 256 instructions → `(256 × 2) - 1 = 511` → `'01FF'`
- 4096 instructions → `(4096 × 2) - 1 = 8191` → `'1FFF'`

---

## Upload Sequence (App → Robot)

Upload a program of motor instructions to the robot's memory.

### Sequence Diagram

```
App                          Robot
 |                             |
 |--- 'F' -------------------->|  (Flush/Initialize)
 |<----------------------- Ack |
 |                             |
 |--- 'dXXXX' --------------->|  (Set buffer size)
 |<----------------------- Ack |
 |                             |
 |--- 'E' -------------------->|  (Enter edit mode)
 |<----------------------- Ack |
 |                             |
 |--- Binary Chunk 1 --------->|  (≤256 instructions)
 |<----------------------- Ack |
 |                             |
 |--- Binary Chunk 2 --------->|  (≤256 instructions)
 |<----------------------- Ack |
 |                             |
 |    ... more chunks ...      |
 |                             |
 |--- Binary Chunk N --------->|  (Final chunk)
 |<----------------------- Ack |
 |                             |
 |--- 'end' ------------------>|  (Complete upload)
 |<------------------- 'full' |  (Success)
```

### Detailed Steps

#### 1. Initialize Buffer

```
Send: 'F'
```

#### 2. Set Buffer Size

```
Send: 'd' + XXXX
```

Where `XXXX` is 4-character hex: `(instructions.length × 2 - 1).toString(16).toUpperCase()`

#### 3. Enter Edit Mode

```
Send: 'E'
```

#### 4. Send Instruction Chunks

Instructions are sent in chunks of up to **256 instructions** (512 bytes) each.

**Chunk Format:**

```
[left₀, right₀, left₁, right₁, ..., leftₙ, rightₙ]
```

Each chunk is a `Uint8Array` of length `chunkSize × 2`.

**Example (3 instructions):**

```
Instruction 0: left=100%, right=50%  → [255, 128]
Instruction 1: left=0%, right=100%   → [0, 255]
Instruction 2: left=75%, right=25%   → [191, 64]

Binary chunk: [255, 128, 0, 255, 191, 64]
```

#### 5. End Upload

```
Send: 'end'
Receive: 'full'
```

### Constraints

- **Minimum instructions:** 1
- **Maximum instructions:** 4096
- **Maximum chunk size:** 256 instructions (512 bytes)

---

## Download Sequence (Robot → App)

Download recorded movements from the robot to the app.

### Sequence Diagram

```
App                          Robot
 |                             |
 |--- 'B' -------------------->|  (Begin download)
 |                             |
 |<------- Size Header --------|  (4 bytes: total size)
 |                             |
 |<------- Packet 0 ----------|  (Seq 0 + 18 instructions)
 |                             |
 |<------- Packet 1 ----------|  (Seq 1 + 18 instructions)
 |                             |
 |    ... more packets ...     |
 |                             |
 |<------- Packet N ----------|  (Seq N + remaining)
 |                             |
 |  (Download complete)        |
```

### Detailed Steps

#### 1. Request Download

```
Send: 'B'
```

#### 2. Receive Size Header

First response is a **4-byte header** containing the total buffer size:

```
[byte₀, byte₁, byte₂, byte₃]
```

**Parse as:**

```javascript
totalSize = parseInt('0x' + toHexString([byte₀, byte₁, byte₂, byte₃]))
numPackets = Math.ceil((totalSize + 1) / 18)
```

#### 3. Receive Data Packets

Each packet contains:

- **1 byte:** Sequence number (0-255, wraps around)
- **N bytes:** Instruction data (up to 36 bytes = 18 instructions)

**Packet Format:**

```
[seq, left₀, right₀, left₁, right₁, ..., leftₙ, rightₙ]
```

**Parsing:**

```javascript
sequence = buffer[0];
buffer.shift(); // Remove sequence byte

for (let i = 0; i < buffer.length / 2; i++) {
  left = buffer[i * 2];
  right = buffer[i * 2 + 1];
  // Convert to percentage
  leftPercent = Math.trunc(left / 2.55 + 0.5);
  rightPercent = Math.trunc(right / 2.55 + 0.5);
}
```

#### 4. Error Detection

Track expected sequence numbers (with wraparound):

```javascript
expectedSequence = (previousSequence + 1) % 256;
```

If `receivedSequence !== expectedSequence`, packet loss has occurred.

**Note:** Current implementation logs lost packets but does not request retransmission.

---

## Recording Sequence

Record robot movements while manually controlling it.

### Sequence Diagram

```
App                          Robot
 |                             |
 |--- 'F' -------------------->|  (Initialize)
 |<----------------------- Ack |
 |                             |
 |--- 'd' + size ------------->|  (Set recording buffer)
 |<----------------------- Ack |
 |                             |
 |--- 'L' -------------------->|  (Start learning mode)
 |                             |
 |  (User controls robot)      |
 |  (Robot records movements)  |
 |                             |
 |--- 'S' -------------------->|  (Stop recording)
 |<------------------- '_sr_' |
```

### Recording Duration

The buffer size determines recording duration:

```
buffer_size = (interval × duration × 2) - 1
```

- **interval**: Time between samples (in 100ms units)
- **duration**: Total recording time (in seconds)

**Example:**

- Interval = 2 (200ms)
- Duration = 10 seconds
- Buffer size = `(2 × 10 × 2) - 1 = 39` → `'0027'`

### Commands

```
Send: 'F'
Send: 'dXXXX'  (calculated buffer size)
Send: 'L'      (robot now recording)
... user controls robot ...
Send: 'S'      (stop recording)
Receive: '_sr_'
```

---

## Execution Commands

### Run Program

```
Send: 'R'
```

Executes the program stored in robot memory once.

### Go (Start)

```
Send: 'G'
```

Starts program execution.

### Stop

```
Send: 'S'
```

Stops the robot immediately.

**Response:**

- `'_sr_'` - Stop confirmed during recording/execution
- `'_end'` - Execution completed naturally

---

## Error Handling

### Upload Errors

**Invalid Instruction Count:**

```javascript
if (instructions.length == 0 || instructions.length > 4096) {
  throw Error('More than 0 and less than 4096 instructions allowed.');
}
```

### Download Errors

**Packet Loss:**

- Detected via sequence number gaps
- Currently logs error but does not recover
- Lost packets tracked in `_lostLines` array

### Version Mismatch

If unsupported version is detected:

- Alert shown to user
- Connection terminated
- Error depends on whether app or robot is outdated

---

## Complete Example: Upload 3 Instructions

### Program

```javascript
instructions = [
  { left: 100, right: 50 }, // Forward-right curve
  { left: 0, right: 100 }, // Sharp left turn
  { left: 100, right: 100 }, // Forward
];
```

### Transmitted Data

```
1. Send: 'F'
2. Send: 'd0005'  // (3 × 2) - 1 = 5 → '0005'
3. Send: 'E'
4. Send: [255, 128, 0, 255, 255, 255]  // Binary chunk
5. Send: 'end'
6. Receive: 'full'
```

### Byte Breakdown

```
Position 0-1: [255, 128] → left=100%, right=50%
Position 2-3: [0, 255]   → left=0%, right=100%
Position 4-5: [255, 255] → left=100%, right=100%
```

---

## Protocol Versions

| Version | Key Differences                                                            |
| ------- | -------------------------------------------------------------------------- |
| **v3**  | Text-based protocol, single instruction per message                        |
| **v6**  | Binary protocol, 18 instructions per packet                                |
| **v10** | Chunked uploads (256 instructions/chunk), supports up to 4096 instructions |

Version 10 is backward compatible with v6 download protocol but enhances upload efficiency with larger chunks.
