# RFC: EXPLORE-IT Robotics Bluetooth Communication Protocol

**Status:** Informational
**Category:** Educational Robotics
**Version:** 1.0
**Date:** November 2025

---

## Abstract

This document specifies the Bluetooth Low Energy (BLE) communication protocol used between EXPLORE-IT educational robotics devices and their control applications. The protocol enables device discovery, connection establishment, program transfer, real-time control, and configuration management. This specification defines three protocol versions (V3, V6, and V10) to support multiple robot firmware generations.

---

## Status of This Memo

This document provides information for the educational robotics community. It does not specify an Internet standard of any kind. Distribution of this memo is unlimited.

---

## Copyright Notice

Copyright (c) 2025 EXPLORE-IT Robotics. All rights reserved.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Conventions and Definitions](#2-conventions-and-definitions)
3. [Architecture](#3-architecture)
4. [Transport Layer](#4-transport-layer)
5. [Protocol Versions](#5-protocol-versions)
6. [Connection Establishment](#6-connection-establishment)
7. [Command Specification](#7-command-specification)
8. [Response Specification](#8-response-specification)
9. [Data Encoding](#9-data-encoding)
10. [Protocol Operations](#10-protocol-operations)
11. [State Machine](#11-state-machine)
12. [Error Handling](#12-error-handling)
13. [Security Considerations](#13-security-considerations)
14. [Implementation Notes](#14-implementation-notes)
15. [References](#15-references)
16. [Appendix A: ABNF Grammar](#appendix-a-abnf-grammar)
17. [Appendix B: Packet Diagrams](#appendix-b-packet-diagrams)
18. [Appendix C: Test Vectors](#appendix-c-test-vectors)

---

## 1. Introduction

### 1.1 Purpose

The EXPLORE-IT Robotics protocol provides a standardized method for mobile applications to communicate with differential-drive robots over Bluetooth Low Energy. The protocol supports:

- Bidirectional program transfer
- Real-time motor control
- Learn-by-demonstration recording
- Device configuration
- Multi-version firmware compatibility

### 1.2 Scope

This specification defines the application-layer protocol operating over BLE GATT. It does not define:

- BLE device pairing mechanisms
- Robot mechanical specifications
- Motor control algorithms
- Power management
- Sensor data formats beyond motor speeds

### 1.3 Requirements Language

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in RFC 2119 [RFC2119].

### 1.4 Terminology

**Client:** The mobile application initiating communication.
**Server:** The robot device responding to commands.
**Instruction:** A single motor speed command consisting of left and right wheel speeds.
**Program:** An ordered sequence of instructions.
**Block:** A reference to a program with a repetition count.
**Interval:** The duration (in deciseconds) for which each instruction executes.

---

## 2. Conventions and Definitions

### 2.1 Numeric Representations

Unless otherwise specified:

- Decimal numbers are written without prefix: `255`
- Hexadecimal numbers are written with `0x` prefix: `0xFF`
- Binary numbers are written with `0b` prefix: `0b11111111`
- Byte arrays are written in bracket notation: `[0xFF, 0x80]`

### 2.2 String Encoding

All text strings MUST be encoded in Latin-1 (ISO-8859-1) unless explicitly stated otherwise.

### 2.3 Byte Order

Multi-byte integers MUST be transmitted in big-endian (network) byte order unless explicitly stated otherwise.

### 2.4 Protocol Versions

This specification defines three protocol versions:

- **V3:** Text-based protocol (firmware versions 2-4)
- **V6:** Binary protocol with packeted downloads (firmware version 9)
- **V10:** Binary protocol with chunked uploads (firmware version 10)

Version 1 is a bootstrap-only protocol used exclusively for version negotiation.

---

## 3. Architecture

### 3.1 Protocol Stack

```txt
┌─────────────────────────────────────┐
│   Application Layer (Programs)     │
├─────────────────────────────────────┤
│   EXPLORE-IT Protocol (This Spec)  │
├─────────────────────────────────────┤
│   BLE GATT (Characteristic R/W/N)  │
├─────────────────────────────────────┤
│   BLE Link Layer                   │
└─────────────────────────────────────┘
```

### 3.2 Communication Model

The protocol follows a client-server model with asynchronous responses:

1. Client sends command via characteristic write
2. Server processes command
3. Server sends response(s) via characteristic notification
4. Responses may be immediate or delayed based on operation

### 3.3 Connection Lifecycle

```txt
[DISCONNECTED] → scan → [SCANNING]
[SCANNING] → found device → [CONNECTING]
[CONNECTING] → connected → [VERSION_NEGOTIATION]
[VERSION_NEGOTIATION] → version ok → [READY]
[READY] → command → [OPERATING]
[OPERATING] → operation complete → [READY]
[READY] → disconnect → [DISCONNECTED]
```

---

## 4. Transport Layer

### 4.1 BLE Service

The protocol operates over a custom BLE GATT service:

**Service UUID:** `0000ffe0-0000-1000-8000-00805f9b34fb`

This service MUST contain exactly one characteristic.

### 4.2 BLE Characteristic

**Characteristic UUID:** `0000ffe1-0000-1000-8000-00805f9b34fb`

**Properties:**

- Read: REQUIRED
- Write With Response: REQUIRED
- Notify: REQUIRED

**Security:** No encryption or authentication required at GATT level.

### 4.3 Device Advertisement

Devices MUST advertise with:

- Device name starting with the string `"EXPLORE-IT"`
- Service UUID `0000ffe0-0000-1000-8000-00805f9b34fb` in service list

**Device Name Format:**

```txt
EXPLORE-IT <suffix>
```

Where `<suffix>` is implementation-specific (commonly the last octets of the MAC address in hexadecimal).

**Examples:**

- `EXPLORE-IT 70:AB`
- `EXPLORE-IT 80:CD`

### 4.4 Data Transfer

**Client to Server:**
Commands MUST be written to the characteristic using Write With Response operation. Each write MUST contain a complete command or data packet.

**Server to Client:**
Responses MUST be sent via characteristic notifications. The client MUST enable notifications before sending commands.

**MTU Considerations:**
Implementations SHOULD negotiate the maximum MTU supported by both devices. The minimum supported MTU is 23 octets (20 octets data payload). Larger MTUs MAY be used if negotiated.

**Transaction Identifier:**
Implementations MAY use the string `"exploreit"` as a transaction identifier for BLE operations.

---

## 5. Protocol Versions

### 5.1 Version Numbering

Protocol version is determined by robot firmware version reported in the VERSION_RESPONSE. The mapping is:

| Firmware Version | Protocol Version | Handler Identifier      |
|------------------|------------------|-------------------------|
| 1                | Bootstrap        | N/A                     |
| 2, 3, 4          | V3               | CommunicationHandlerV3  |
| 5, 6, 7, 8       | (Unsupported)    | N/A                     |
| 9                | V6               | CommunicationHandlerV6  |
| 10               | V10              | CommunicationHandlerV10 |

### 5.2 Version Compatibility

Clients MUST support all defined protocol versions. If a client encounters an unsupported version, it MUST:

1. Display an error message to the user
2. Disconnect from the device
3. NOT attempt any operations

If firmware version > maximum supported version:

- Error: "Robot firmware is newer than application. Please update the application."

If firmware version < minimum supported version:

- Error: "Robot firmware is outdated. Please update robot firmware."

### 5.3 Version Differences

**V3 Features:**

- ASCII text commands and responses
- Sequential instruction upload (one instruction per write)
- Text-delimited download responses
- Maximum ~100 instructions (MTU limited)

**V6 Features:**

- Binary data encoding
- Packeted downloads with sequence numbers
- Packet loss detection
- Maximum ~2400 instructions

**V10 Features:**

- All V6 features
- Chunked uploads (256 instructions per chunk)
- Maximum 4096 instructions
- Improved large program handling

---

## 6. Connection Establishment

### 6.1 Connection Sequence

The connection sequence MUST proceed in the following order:

```txt
Client                          Server
  |                               |
  |-------- [BLE Connect] ------->|
  |                               |
  |<-- [Service Discovery] ------>|
  |                               |
  |---- [Enable Notifications] -->|
  |                               |
  |-------- VERSION_REQ --------->|
  |                               |
  |<------- VERSION_RESP ---------|
  |                               |
  |---- [Select Protocol Ver] ----|
  |                               |
  |------- INTERVAL_QUERY ------->|
  |                               |
  |<----- INTERVAL_RESPONSE ------|
  |                               |
  |---- [Ready for Commands] -----|
```

### 6.2 VERSION_REQ Command

Immediately after enabling notifications, the client MUST send a VERSION_REQ command.

**Format:** Single ASCII character `Z` (0x5A)

**Encoding:** UTF-8 or Latin-1
**Length:** 1 octet

### 6.3 VERSION_RESP Response

The server MUST respond with a VERSION_RESP in the following format:

```txt
VER<space><number>
```

**ABNF:**

```abnf
version-response = "VER" SP 1*2DIGIT
```

**Examples:**

- `VER 3` (firmware version 3, use V3 protocol)
- `VER 10` (firmware version 10, use V10 protocol)

**Encoding:** ASCII string, Latin-1 encoded
**Termination:** No explicit terminator (end of notification packet)

### 6.4 Version Selection

Upon receiving VERSION_RESP, the client MUST:

1. Parse the firmware version number
2. Select the appropriate protocol handler per Section 5.1
3. If version is unsupported, disconnect per Section 5.2
4. Proceed with INTERVAL_QUERY

### 6.5 INTERVAL_QUERY Command

After version negotiation, the client SHOULD send an INTERVAL_QUERY to retrieve the current interval setting.

**Format:** ASCII string `I?` (0x49, 0x3F)

**Encoding:** ASCII/Latin-1
**Length:** 2 octets

### 6.6 INTERVAL_RESPONSE

The server MUST respond with the current interval value:

```txt
I=<value>
```

**ABNF:**

```abnf
interval-response = "I=" 1*2DIGIT
```

**Examples:**

- `I=2` (interval is 2)
- `I=25` (interval is 25)

**Value Range:** 0-50 (inclusive)
**Units:** Deciseconds (tenths of a second)

**Encoding:** ASCII string, Latin-1 encoded

---

## 7. Command Specification

### 7.1 Command Format

Commands consist of a command identifier followed by optional parameters. Commands MUST NOT exceed the negotiated MTU size.

### 7.2 Command Types

Commands are categorized as:

- **Control Commands:** Robot operation control (run, stop, etc.)
- **Query Commands:** Information retrieval
- **Configuration Commands:** Parameter modification
- **Transfer Commands:** Program upload/download

### 7.3 Control Commands

#### 7.3.1 VERSION_REQ

**Identifier:** `Z` (0x5A)
**Parameters:** None
**Length:** 1 octet
**Description:** Request firmware version
**Response:** VERSION_RESP (Section 6.3)
**Protocol Versions:** All

#### 7.3.2 RUN

**Identifier:** `R` (0x52)
**Parameters:** None
**Length:** 1 octet
**Description:** Execute the program stored in robot memory from beginning to end
**Response:** EXECUTION_COMPLETE when finished
**Protocol Versions:** All

**Behavior:**

1. Server MUST begin executing instructions from index 0
2. Server MUST execute instructions sequentially
3. Server MUST apply each instruction for the configured interval duration
4. Server MUST send EXECUTION_COMPLETE when all instructions have been executed
5. Server MUST stop motors after the final instruction

#### 7.3.3 GO

**Identifier:** `G` (0x47)
**Parameters:** None
**Length:** 1 octet
**Description:** Enter drive mode and begin moving
**Response:** EXECUTION_COMPLETE when stopped
**Protocol Versions:** All

**Behavior:**
Server MUST enter a continuous motion state. The exact behavior is implementation-defined but typically involves executing a stored program or entering manual control mode.

#### 7.3.4 STOP

**Identifier:** `S` (0x53)
**Parameters:** None
**Length:** 1 octet
**Description:** Emergency stop - immediately halt all operations
**Response:** STOP_CONFIRM
**Protocol Versions:** All

**Behavior:**

1. Server MUST immediately set all motor speeds to 0
2. Server MUST cancel any in-progress operation (upload, download, recording, execution)
3. Server MUST send STOP_CONFIRM response
4. Server MUST transition to READY state

**Priority:** STOP has the highest priority and MUST interrupt any operation.

#### 7.3.5 DOWNLOAD_REQ

**Identifier:** `B` (0x42)
**Parameters:** None
**Length:** 1 octet
**Description:** Request download (beam) of program from robot to client
**Response:** Download packet sequence (protocol version dependent)
**Protocol Versions:** All

**Behavior:**
Server MUST transmit its currently stored program to the client. The format depends on protocol version (see Sections 10.4, 10.5, 10.6).

### 7.4 Configuration Commands

#### 7.4.1 INTERVAL_QUERY

**Identifier:** `I?` (0x49, 0x3F)
**Parameters:** None
**Length:** 2 octets
**Description:** Query current interval setting
**Response:** INTERVAL_RESPONSE
**Protocol Versions:** All

#### 7.4.2 INTERVAL_SET

**Identifier:** `I` followed by decimal digits
**Parameters:** Interval value (0-50)
**Length:** 2-3 octets
**Description:** Set the interval (instruction duration)
**Response:** None (client SHOULD re-query with INTERVAL_QUERY to confirm)
**Protocol Versions:** All

**Format:**

```txt
I<value>
```

**ABNF:**

```abnf
interval-set = "I" 1*2DIGIT
```

**Examples:**

- `I0` (set interval to 0)
- `I25` (set interval to 25)
- `I50` (set interval to 50)

**Value Constraints:**

- Minimum: 0
- Maximum: 50
- Units: Deciseconds

Server MUST validate the value. If the value is out of range, the server SHOULD clamp it to the valid range.

### 7.5 Transfer Commands

#### 7.5.1 FLUSH

**Identifier:** `F` (0x46)
**Parameters:** None
**Length:** 1 octet
**Description:** Flush robot memory, preparing for new program
**Response:** None (implicit acknowledgment)
**Protocol Versions:** All

**Behavior:**
Server MUST clear its program memory and prepare to receive a new program. This command MUST be sent before any upload or recording operation.

#### 7.5.2 DATA_LENGTH

**Identifier:** `d` followed by 4 hexadecimal digits
**Parameters:** Data length in bytes
**Length:** 5 octets
**Description:** Specify the length of data to be uploaded or recorded
**Response:** None (implicit acknowledgment)
**Protocol Versions:** All

**Format:**

```txt
d<hex4>
```

**ABNF:**

```abnf
data-length = "d" 4HEXDIG
hex4        = HEXDIG HEXDIG HEXDIG HEXDIG
```

**Examples:**

- `d0003` (4 bytes - 1, representing 2 instructions)
- `d07FF` (2048 bytes - 1, representing 1024 instructions)
- `d1FFF` (8192 bytes - 1, representing 4096 instructions)

**Calculation:**

```txt
data_length = (num_instructions × 2) - 1
hex_string = uppercase_hex(data_length).padStart(4, '0')
```

**Value Constraints:**

- Minimum: 0x0001 (1 byte, representing 1 instruction)
- Maximum: 0x1FFF (8191 bytes, representing 4096 instructions)

#### 7.5.3 ENTER_UPLOAD

**Identifier:** `E` (0x45)
**Parameters:** None
**Length:** 1 octet
**Description:** Enter upload mode, ready to receive program data
**Response:** None (implicit acknowledgment)
**Protocol Versions:** All

**Behavior:**
Server MUST transition to upload mode. Subsequent writes MUST be interpreted as program data according to the protocol version.

**Prerequisites:**

1. FLUSH command MUST have been sent
2. DATA_LENGTH command MUST have been sent

#### 7.5.4 LEARN

**Identifier:** `L` (0x4C)
**Parameters:** None
**Length:** 1 octet
**Description:** Enter learn mode, recording robot movements
**Response:** OPERATION_COMPLETE when recording finishes
**Protocol Versions:** All

**Behavior:**

1. Server MUST begin recording motor speeds at the configured interval
2. Server MUST record for the duration specified in the preceding DATA_LENGTH command
3. Server MUST store recorded data in program memory
4. Server MUST send OPERATION_COMPLETE when recording completes

**Prerequisites:**

1. FLUSH command MUST have been sent
2. DATA_LENGTH command MUST have been sent with duration calculation:
   - V3: `(duration_seconds × 2) - 1`
   - V6/V10: `(interval × duration_seconds × 2) - 1`

#### 7.5.5 END_UPLOAD (V3 Only)

**Identifier:** `end` (0x65, 0x6E, 0x64)
**Parameters:** None
**Length:** 3 octets
**Description:** Signal end of program upload
**Response:** OPERATION_COMPLETE
**Protocol Versions:** V3 only

**Behavior:**
Server MUST finalize the uploaded program and send OPERATION_COMPLETE.

**Note:** V6 and V10 do not use this command. Upload completion is implicit when all data has been received.

---

## 8. Response Specification

### 8.1 Response Format

Responses are sent via characteristic notifications. A response may be:

- A single notification packet (most responses)
- Multiple notification packets (download operations)

### 8.2 Text Responses (All Versions)

#### 8.2.1 VERSION_RESP

**Format:** `VER<space><number>`
**Encoding:** ASCII/Latin-1
**Specification:** See Section 6.3

#### 8.2.2 INTERVAL_RESPONSE

**Format:** `I=<number>`
**Encoding:** ASCII/Latin-1
**Specification:** See Section 6.6

#### 8.2.3 STOP_CONFIRM

**Format:** `_SR_` (0x5F, 0x53, 0x52, 0x5F)
**Length:** 4 octets
**Encoding:** ASCII/Latin-1
**Description:** Confirmation that STOP command was received and executed

#### 8.2.4 EXECUTION_COMPLETE

**Format:** `_END` (0x5F, 0x45, 0x4E, 0x44)
**Length:** 4 octets
**Encoding:** ASCII/Latin-1
**Description:** Indicates that RUN or GO operation has completed

#### 8.2.5 OPERATION_COMPLETE

**Format:** `FULL` (0x46, 0x55, 0x4C, 0x4C)
**Length:** 4 octets
**Encoding:** ASCII/Latin-1
**Description:** Indicates that upload or recording operation has completed successfully

### 8.3 V3 Responses

#### 8.3.1 DOWNLOAD_DATA (V3)

**Format:** Comma-delimited ASCII speed values

**Single Instruction:**

```txt
<left>,<right>
```

**ABNF:**

```abnf
download-instruction = 3DIGIT "," 3DIGIT
```

**Example:** `255,128` (left=255, right=128)

**Speed Value Format:**

- 3 decimal digits
- Zero-padded
- Range: 000-255

#### 8.3.2 DOWNLOAD_END (V3)

**Format:** `,,,,` (0x2C, 0x2C, 0x2C, 0x2C)
**Length:** 4 octets
**Description:** Marks the end of a download sequence

### 8.4 V6/V10 Binary Responses

#### 8.4.1 DOWNLOAD_HEADER (V6/V10)

The first packet in a download sequence contains the total byte count.

**Format:** Multi-byte big-endian integer

**Length:** Variable (typically 2-4 octets)

**Example:**

```txt
[0x00, 0x00, 0x00, 0x04]  → 4 bytes (2 instructions)
[0x00, 0x00, 0x07, 0xFF]  → 2047 bytes (1023 instructions)
```

**Interpretation:**

```txt
total_bytes = big_endian_to_int(packet_data)
total_instructions = (total_bytes + 1) / 2
expected_packets = ceil(total_instructions / 9)
```

#### 8.4.2 DOWNLOAD_DATA (V6/V10)

Subsequent packets contain a sequence number followed by instruction data.

**Format:**

```txt
[sequence_number, data_bytes...]
```

**Packet Structure:**

```txt
Octet 0: Sequence number (0-255)
Octets 1-n: Instruction data (pairs of bytes)
```

**Sequence Number:**

- 1 octet
- Range: 0-255
- Increments by 1 for each packet
- Wraps to 0 after 255
- First data packet has sequence number 0

**Data Bytes:**

- Maximum 18 octets per packet (9 instructions)
- Each instruction = 2 octets (left speed, right speed)
- Octets are in order: [left0, right0, left1, right1, ...]

**Example Packet:**

```txt
[0x01, 0xFF, 0x80, 0x40, 0xBF, 0x00, 0x00]
│     └─────┬─────┘ └────┬────┘ └───┬───┘
│           │            │           │
│      Inst 0       Inst 1      Inst 2
│      L=255        L=64        L=0
│      R=128        R=191       R=0
│
Sequence = 1
```

---

## 9. Data Encoding

### 9.1 Speed Values

Speed values represent motor speeds as a percentage of maximum power.

**Application Domain:** 0-100 (integer percentage)
**Wire Protocol Domain:** 0-255 (8-bit unsigned integer)

### 9.2 Encoding Formula (Application → Wire)

```txt
wire_value = floor(app_value × 2.55 + 0.5)

Special case:
if app_value = 0 then wire_value = 0
```

**Examples:**

```txt
 0% → floor(0.0 × 2.55 + 0.5)   = floor(0.5)   = 0
25% → floor(25.0 × 2.55 + 0.5)  = floor(64.25) = 64
50% → floor(50.0 × 2.55 + 0.5)  = floor(128.0) = 128
75% → floor(75.0 × 2.55 + 0.5)  = floor(191.75)= 191
100%→ floor(100.0 × 2.55 + 0.5) = floor(255.5) = 255
```

### 9.3 Decoding Formula (Wire → Application)

```txt
app_value = trunc(wire_value / 2.55 + 0.5)
```

**Examples:**

```txt
  0 → trunc(0 / 2.55 + 0.5)   = trunc(0.5)   = 0
 64 → trunc(64 / 2.55 + 0.5)  = trunc(25.6)  = 25
128 → trunc(128 / 2.55 + 0.5) = trunc(50.69) = 50
191 → trunc(191 / 2.55 + 0.5) = trunc(75.42) = 75
255 → trunc(255 / 2.55 + 0.5) = trunc(100.5) = 100
```

### 9.4 Instruction Structure

An instruction is an ordered pair of speed values.

**Structure:**

```ts
Instruction {
  left_speed: uint8    // Left motor speed (0-255)
  right_speed: uint8   // Right motor speed (0-255)
}
```

### 9.5 V3 Instruction Encoding

**Upload Format:**

```txt
<left>,<right>xx
```

**Components:**

- `<left>`: 3 decimal digits, zero-padded (000-255)
- `,`: Literal comma character (0x2C)
- `<right>`: 3 decimal digits, zero-padded (000-255)
- `xx`: Literal string "xx" (0x78, 0x78) - ignored by server

**Examples:**

```txt
255,128xx  → left=255, right=128
064,191xx  → left=64, right=191
000,000xx  → left=0, right=0
```

**Download Format:**

```txt
<left>,<right>
```

Same as upload but without the `xx` suffix.

### 9.6 V6/V10 Instruction Encoding

**Format:** 2 octets in sequence [left, right]

**Examples:**

```txt
[0xFF, 0x80] → left=255, right=128
[0x40, 0xBF] → left=64, right=191
[0x00, 0x00] → left=0, right=0
```

---

## 10. Protocol Operations

### 10.1 Upload Operation (V3)

**Objective:** Transfer a program from client to server

**Sequence:**

```txt
Client                      Server
  |                           |
  |-------- FLUSH ----------->|
  |                           |
  |------ DATA_LENGTH ------->| (num_inst × 2 - 1)
  |                           |
  |------ ENTER_UPLOAD ------>|
  |                           |
  |---- INSTRUCTION[0] ------>| ("255,128xx")
  |                           |
  |---- INSTRUCTION[1] ------>| ("064,191xx")
  |                           |
  |         ...               |
  |                           |
  |---- INSTRUCTION[n] ------>|
  |                           |
  |------- END_UPLOAD ------->|
  |                           |
  |<-- OPERATION_COMPLETE ----|
```

**Constraints:**

- Each instruction MUST be sent as a separate write operation
- Instructions MUST be sent in order (index 0 to n-1)
- Practical limit: ~100 instructions (MTU constrained)

**Example (2 instructions):**

```txt
Client writes: 'F'
Client writes: 'd0003'  // (2 × 2) - 1 = 3
Client writes: 'E'
Client writes: '255,128xx'
Client writes: '064,191xx'
Client writes: 'end'
Server notifies: 'FULL'
```

### 10.2 Upload Operation (V6)

**Objective:** Transfer a program from client to server using binary encoding

**Sequence:**

```txt
Client                      Server
  |                           |
  |-------- FLUSH ----------->|
  |                           |
  |------ DATA_LENGTH ------->|
  |                           |
  |------ ENTER_UPLOAD ------>|
  |                           |
  |------ BINARY_DATA ------->| [left0,right0,left1,right1,...]
  |                           |
  |<-- OPERATION_COMPLETE ----|
```

**Binary Data Format:**

- All instructions concatenated into a single byte array
- Sent in one write operation (if MTU allows) or multiple writes
- Format: [left0, right0, left1, right1, ..., left_n, right_n]

**Example (2 instructions):**

```txt
Client writes: 'F'
Client writes: 'd0003'  // (2 × 2) - 1 = 3
Client writes: 'E'
Client writes: [0xFF, 0x80, 0x40, 0xBF]
Server notifies: 'FULL'
```

**Constraints:**

- Maximum ~1200 instructions (limited by single-write MTU and server buffer)

### 10.3 Upload Operation (V10)

**Objective:** Transfer a program from client to server using chunked binary encoding

**Sequence:**

```txt
Client                      Server
  |                           |
  |-------- FLUSH ----------->|
  |                           |
  |------ DATA_LENGTH ------->|
  |                           |
  |------ ENTER_UPLOAD ------>|
  |                           |
  |------ CHUNK[0] ---------->| (max 256 instructions)
  |                           |
  |------ CHUNK[1] ---------->|
  |                           |
  |         ...               |
  |                           |
  |------ CHUNK[n] ---------->|
  |                           |
  |<-- OPERATION_COMPLETE ----|
```

**Chunk Format:**

- Each chunk contains up to 256 instructions
- Chunk = [left0, right0, left1, right1, ..., left_m, right_m]
- Chunks MUST be sent sequentially
- Maximum chunk size: 512 octets (256 instructions × 2)

**Chunking Algorithm:**

```txt
chunk_size = 256  // instructions per chunk
offset = 0

while offset < total_instructions:
    chunk_length = min(chunk_size, total_instructions - offset)
    chunk_data = []

    for i in range(chunk_length):
        inst = instructions[offset + i]
        chunk_data.append(inst.left)
        chunk_data.append(inst.right)

    send_write(chunk_data)
    offset += chunk_length

// Wait for OPERATION_COMPLETE
```

**Example (512 instructions in 2 chunks):**

```txt
Client writes: 'F'
Client writes: 'd03FF'  // (512 × 2) - 1 = 1023 = 0x3FF
Client writes: 'E'
Client writes: [chunk0: 512 bytes]  // Instructions 0-255
Client writes: [chunk1: 512 bytes]  // Instructions 256-511
Server notifies: 'FULL'
```

**Constraints:**

- Maximum 4096 instructions (enforced by client and server)
- Client MUST NOT send more than 4096 instructions
- Server SHOULD reject programs exceeding this limit

### 10.4 Download Operation (V3)

**Objective:** Transfer program from server to client

**Sequence:**

```txt
Client                      Server
  |                           |
  |---- DOWNLOAD_REQ -------->|
  |                           |
  |<--- INSTRUCTION[0] -------|  "255,128"
  |                           |
  |<--- INSTRUCTION[1] -------|  "064,191"
  |                           |
  |         ...               |
  |                           |
  |<--- INSTRUCTION[n] -------|
  |                           |
  |<---- DOWNLOAD_END --------|  ",,,,"
```

**Response Format:**

- Each instruction sent as separate notification
- Format: `<left>,<right>` (no `xx` suffix)
- Terminated by `,,,,` marker

**Parsing Algorithm:**

```txt
instructions = []

while true:
    response = await_notification()
    text = response.decode('latin-1')

    if text == ",,,,":
        break  // End of download

    if text.matches(/^\d{3},\d{3}$/):
        parts = text.split(',')
        left = int(parts[0])
        right = int(parts[1])
        instructions.append(Instruction(left, right))

return instructions
```

### 10.5 Download Operation (V6/V10)

**Objective:** Transfer program from server to client using binary protocol

**Sequence:**

```txt
Client                      Server
  |                           |
  |---- DOWNLOAD_REQ -------->|
  |                           |
  |<--- DOWNLOAD_HEADER ------|  [0x00, 0x00, 0x00, 0x12]
  |                           |
  |<---- DATA_PACKET[0] ------|  [0x00, data...]
  |                           |
  |<---- DATA_PACKET[1] ------|  [0x01, data...]
  |                           |
  |         ...               |
  |                           |
  |<---- DATA_PACKET[n] ------|  [seq, data...]
```

**Header Packet:**

- Contains total byte count as big-endian integer
- Variable length (typically 2-4 octets)
- Always sent first

**Data Packets:**

- Octet 0: Sequence number (0-255, wraps)
- Octets 1-n: Instruction data (up to 18 octets = 9 instructions)
- Sequence number increments by 1 for each packet
- First data packet has sequence 0

**Parsing Algorithm:**

```txt
linecounter = -1
expected_seq = 0
instructions = []

while true:
    packet = await_notification()

    if linecounter == -1:
        // Header packet
        total_bytes = big_endian_decode(packet)
        linecounter = ceil((total_bytes + 1) / 18)
        continue

    // Data packet
    seq = packet[0]
    data = packet[1:]

    // Check sequence
    if seq != expected_seq:
        // Packet loss detected
        log_error("Packet loss: expected", expected_seq, "got", seq)
        // TODO: Request retransmission (not currently implemented)

    expected_seq = (seq + 1) % 256

    // Parse instructions
    for i in range(0, len(data), 2):
        left = data[i]
        right = data[i+1]
        instructions.append(Instruction(left, right))

    linecounter -= 1
    if linecounter == 0:
        break  // Download complete

return instructions
```

**Packet Loss:**
Current protocol does NOT define retransmission mechanism. Implementations MAY detect packet loss via sequence number gaps but MUST NOT assume complete delivery.

**Known Limitations:**

- Sequence number wraps at 256, causing ambiguity for programs >2304 instructions
- No acknowledgment or retransmission mechanism

### 10.6 Record Operation

**Objective:** Record robot movements into program memory

**Sequence:**

```txt
Client                      Server
  |                           |
  |-------- FLUSH ----------->|
  |                           |
  |------ DATA_LENGTH ------->| (duration-based calculation)
  |                           |
  |--------- LEARN ---------->|
  |                           |
  |    [Server records]       |
  |    [Duration: config]     |
  |                           |
  |<-- OPERATION_COMPLETE ----|
```

**Duration Calculation:**

**V3:**

```txt
duration_seconds = <user input>
byte_count = (duration_seconds × 2) - 1
```

**V6/V10:**

```txt
duration_seconds = <user input>
interval = <current interval setting>
byte_count = (interval × duration_seconds × 2) - 1
```

**Example (V10, 60 second recording, interval=2):**

```txt
Client writes: 'F'

byte_count = 2 × 60 × 2 - 1 = 239 = 0xEF
Client writes: 'd00EF'

Client writes: 'L'

[Server records for 60 seconds at interval=2]
[Approximately 30 instructions recorded]

Server notifies: 'FULL'

[Client may now issue DOWNLOAD_REQ to retrieve recording]
```

**Recording Behavior:**

1. Server MUST sample motor speeds at the configured interval
2. Server MUST store each sample as an instruction
3. Server MUST continue recording until the calculated number of instructions is reached
4. Server MUST send OPERATION_COMPLETE when finished

### 10.7 Run Operation

**Objective:** Execute stored program

**Sequence:**

```txt
Client                      Server
  |                           |
  |---------- RUN ----------->|
  |                           |
  |   [Server executes]       |
  |   [Duration: varies]      |
  |                           |
  |<-- EXECUTION_COMPLETE ----|
```

**Execution Behavior:**

1. Server MUST execute instructions sequentially from index 0
2. Server MUST apply each instruction for the configured interval duration
3. Server MUST send EXECUTION_COMPLETE upon completion
4. Server MUST stop all motors after completion

**Duration:**

```txt
total_duration = num_instructions × interval
```

### 10.8 Stop Operation

**Objective:** Emergency halt

**Sequence:**

```txt
Client                      Server
  |                           |
  |---------- STOP ---------->|
  |                           |
  |<----- STOP_CONFIRM -------|
```

**Behavior:**

1. Server MUST immediately halt all motors (set speeds to 0)
2. Server MUST cancel any in-progress operation
3. Server MUST send STOP_CONFIRM
4. Server MUST transition to READY state

**Timing:**

- STOP MUST be processed with highest priority
- Response SHOULD be sent within 100ms

---

## 11. State Machine

### 11.1 Server States

```txt
┌─────────────┐
│ DISCONNECTED│
└──────┬──────┘
       │ BLE connect
       ▼
┌─────────────┐
│  CONNECTED  │
└──────┬──────┘
       │ VERSION_REQ received
       ▼
┌─────────────┐
│VERSION_SENT │
└──────┬──────┘
       │ (automatic)
       ▼
┌─────────────┐
│    READY    │◄───────────────┐
└──────┬──────┘                │
       │                       │
       │ FLUSH received        │
       ▼                       │
┌─────────────┐                │
│  FLUSHED    │                │
└──────┬──────┘                │
       │                       │
       │ DATA_LENGTH received  │
       ▼                       │
┌─────────────┐                │
│LENGTH_SET   │                │
└──────┬──────┘                │
       │                       │
       ├──ENTER_UPLOAD────►┌───────────┐
       │                   │ UPLOADING │──COMPLETE──┐
       │                   └───────────┘            │
       │                                            │
       ├──LEARN───────────►┌───────────┐           │
       │                   │ RECORDING │──COMPLETE──┤
       │                   └───────────┘            │
       │                                            │
       │ RUN received                               │
       ├──────────────────►┌───────────┐           │
       │                   │ EXECUTING │──COMPLETE──┤
       │                   └───────────┘            │
       │                                            │
       │ DOWNLOAD_REQ                               │
       ├──────────────────►┌─────────────┐         │
       │                   │DOWNLOADING  │─COMPLETE─┤
       │                   └─────────────┘         │
       │                                            │
       │ STOP (from any state)                     │
       └────────────────────────────────────────────┘
```

### 11.2 State Transitions

| Current State | Event | Next State | Action |
|---------------|-------|------------|--------|
| DISCONNECTED | BLE connect | CONNECTED | Initialize |
| CONNECTED | VERSION_REQ | VERSION_SENT | Send VERSION_RESP |
| VERSION_SENT | (automatic) | READY | Ready for commands |
| READY | FLUSH | FLUSHED | Clear memory |
| FLUSHED | DATA_LENGTH | LENGTH_SET | Store length |
| LENGTH_SET | ENTER_UPLOAD | UPLOADING | Accept program data |
| LENGTH_SET | LEARN | RECORDING | Start recording |
| READY | RUN | EXECUTING | Execute program |
| READY | DOWNLOAD_REQ | DOWNLOADING | Send program |
| UPLOADING | (data complete) | READY | Send OPERATION_COMPLETE |
| RECORDING | (duration complete) | READY | Send OPERATION_COMPLETE |
| EXECUTING | (program complete) | READY | Send EXECUTION_COMPLETE |
| DOWNLOADING | (data sent) | READY | (automatic) |
| Any | STOP | READY | Halt motors, send STOP_CONFIRM |
| Any | BLE disconnect | DISCONNECTED | Cleanup |

### 11.3 Illegal Transitions

The following transitions are prohibited:

- READY → UPLOADING (must go through FLUSHED and LENGTH_SET)
- READY → RECORDING (must go through FLUSHED and LENGTH_SET)
- CONNECTED → READY (must send VERSION_REQ first)
- LENGTH_SET → READY (must complete upload/recording operation)

If a client sends a command that would trigger an illegal transition, the server behavior is undefined. Implementations MAY:

- Ignore the command
- Send an error response (not defined in this specification)
- Disconnect

Clients MUST follow the state machine strictly.

---

## 12. Error Handling

### 12.1 Error Categories

Errors are classified as:

- **Connection Errors:** BLE-layer failures
- **Protocol Errors:** Invalid command sequences
- **Data Errors:** Malformed or out-of-range data
- **Timeout Errors:** Operations exceeding expected duration

### 12.2 Connection Error Handling

**No Response:**
If the server does not respond to a command within a reasonable timeout (RECOMMENDED: 5 seconds), the client SHOULD:

1. Log the timeout
2. Retry the command once
3. If retry fails, disconnect and alert the user

**Disconnection:**
If the BLE connection is lost during an operation:

1. Client MUST assume operation did not complete
2. Client MUST NOT assume partial data is valid
3. Client SHOULD attempt reconnection
4. Client MUST restart the operation from the beginning after reconnection

### 12.3 Protocol Error Handling

**Invalid Command Sequence:**
If a client sends commands in an invalid order (e.g., ENTER_UPLOAD without prior FLUSH), server behavior is undefined. Clients MUST follow the state machine.

**Unsupported Version:**
If the server reports an unsupported firmware version, the client MUST disconnect and alert the user. See Section 5.2.

### 12.4 Data Error Handling

**Packet Loss (V6/V10):**
The current protocol detects but does not recover from packet loss during download. If packet loss is detected:

1. Client SHOULD log the packet numbers that were lost
2. Client MAY alert the user
3. Client SHOULD retry the download operation

Future protocol versions MAY define retransmission mechanisms.

**Malformed Data:**
If a client receives a response that does not conform to the expected format:

1. Client SHOULD log the malformed data
2. Client MAY ignore the packet and continue
3. Client MAY abort the operation and alert the user

### 12.5 Timeout Values

| Operation | Recommended Timeout |
|-----------|---------------------|
| Command response | 5 seconds |
| Upload (per chunk) | 2 seconds |
| Download (per packet) | 2 seconds |
| Recording | (duration + 5) seconds |
| Execution | (num_inst × interval + 5) seconds |

---

## 13. Security Considerations

### 13.1 Authentication

The protocol does NOT provide authentication. Any client within BLE range can connect to and control a robot.

**Risk:** Unauthorized control of robots in shared environments.

**Mitigation:** Implementations MAY add authentication mechanisms at the application layer (not defined in this specification).

### 13.2 Authorization

The protocol does NOT provide authorization. All connected clients have full control.

**Risk:** Malicious commands could damage the robot or cause unsafe behavior.

**Mitigation:** Robots SHOULD implement safety limits (e.g., speed clamping, collision detection) independent of protocol commands.

### 13.3 Encryption

The protocol does NOT require encryption at the GATT layer.

**Risk:** Commands and programs can be intercepted or modified in transit.

**Mitigation:** Sensitive deployments SHOULD use BLE pairing with encryption. The protocol itself remains compatible with encrypted BLE connections.

### 13.4 Integrity

The protocol does NOT provide data integrity checks (e.g., checksums, CRCs).

**Risk:** Corrupted data due to RF interference or software bugs may not be detected.

**Mitigation:**

- BLE link layer provides basic error detection
- Applications MAY implement additional integrity checks
- Packet loss detection in V6/V10 provides partial integrity validation

### 13.5 Privacy

Device names and programs are transmitted in clear text.

**Risk:** Observers can identify devices and infer user behavior.

**Mitigation:** Use generic device names and/or encrypted BLE connections if privacy is required.

### 13.6 Denial of Service

A malicious client could:

- Send continuous STOP commands, preventing normal operation
- Upload excessively large programs to exhaust memory
- Rapidly connect/disconnect to drain battery

**Mitigation:**

- Robots SHOULD implement rate limiting
- Robots SHOULD validate program sizes against available memory
- BLE stack SHOULD have connection rate limits

---

## 14. Implementation Notes

### 14.1 MTU Negotiation

Implementations SHOULD negotiate the maximum MTU during connection establishment. Larger MTUs improve upload/download performance for V6/V10.

**Minimum MTU:** 23 octets (20 octets payload)
**Recommended MTU:** 512 octets

### 14.2 Timing Considerations

**Command Execution:**
Servers SHOULD respond to commands within 100ms unless the command initiates a long-running operation.

**Interval Precision:**
The interval setting affects instruction duration. Implementations SHOULD aim for ±10% accuracy but MAY vary based on timer precision.

### 14.3 Buffer Management

**Upload Operations:**
V6 implementations MUST buffer the entire program before writing to memory. V10 implementations MAY process chunks as they arrive.

**Download Operations:**
Clients MUST buffer received packets and reassemble them after the download completes.

### 14.4 Memory Constraints

Robots have limited memory. Implementations SHOULD:

- Validate program size before upload
- Reject programs exceeding available memory
- Implement memory management to prevent fragmentation

**Recommended Limits:**

- V3: 100 instructions
- V6: 2400 instructions
- V10: 4096 instructions

### 14.5 Testing

Implementations SHOULD test:

- All command/response pairs
- Upload/download round-trips
- Packet loss scenarios (V6/V10)
- Boundary conditions (0%, 100% speeds, maximum program size)
- State transitions
- Timeout handling
- Disconnection during operations

---

## 15. References

### 15.1 Normative References

[RFC2119] Bradner, S., "Key words for use in RFCs to Indicate Requirement Levels", BCP 14, RFC 2119, March 1997.

[BLE] Bluetooth SIG, "Bluetooth Core Specification Version 5.3", July 2021.
<https://www.bluetooth.com/specifications/bluetooth-core-specification/>

[GATT] Bluetooth SIG, "Generic Attribute Profile (GATT)", 2010.
<https://www.bluetooth.com/specifications/gatt/>

### 15.2 Informative References

[ISO-8859-1] ISO/IEC, "Information technology — 8-bit single-byte coded graphic character sets — Part 1: Latin alphabet No. 1", ISO/IEC 8859-1:1998.

[react-native-ble-plx] Polidea, "React Native BLE PLX", GitHub repository.
<https://github.com/Polidea/react-native-ble-plx>

---

## Appendix A: ABNF Grammar

This appendix provides formal grammar for protocol elements using Augmented Backus-Naur Form (ABNF) as defined in RFC 5234.

```abnf
; Core Rules (from RFC 5234)
DIGIT  = %x30-39              ; 0-9
HEXDIG = DIGIT / "A" / "B" / "C" / "D" / "E" / "F"
SP     = %x20                 ; space

; Commands
version-req      = %x5A                       ; 'Z'
run-cmd          = %x52                       ; 'R'
go-cmd           = %x47                       ; 'G'
stop-cmd         = %x53                       ; 'S'
download-req     = %x42                       ; 'B'
interval-query   = %x49 %x3F                  ; 'I?'
interval-set     = %x49 1*2DIGIT              ; 'I' <value>
flush-cmd        = %x46                       ; 'F'
data-length      = %x64 4HEXDIG               ; 'd' <hex>
enter-upload     = %x45                       ; 'E'
learn-cmd        = %x4C                       ; 'L'
end-upload       = %x65 %x6E %x64             ; 'end'

; Responses
version-response = %x56 %x45 %x52 SP 1*2DIGIT ; 'VER' <num>
interval-response= %x49 %x3D 1*2DIGIT         ; 'I=' <value>
stop-confirm     = %x5F %x53 %x52 %x5F        ; '_SR_'
exec-complete    = %x5F %x45 %x4E %x44        ; '_END'
oper-complete    = %x46 %x55 %x4C %x4C        ; 'FULL'
download-end-v3  = %x2C %x2C %x2C %x2C        ; ',,,,'

; V3 Data
v3-speed-value   = 3DIGIT                     ; 000-255
v3-instruction   = v3-speed-value %x2C v3-speed-value
v3-upload-instr  = v3-instruction %x78 %x78   ; <L>,<R>xx
v3-download-instr= v3-instruction             ; <L>,<R>

; Binary Data
octet            = %x00-FF
binary-data      = 1*octet
```

---

## Appendix B: Packet Diagrams

### B.1 V3 Upload Instruction

```txt
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|      '2'      |      '5'      |      '5'      |      ','      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|      '1'      |      '2'      |      '8'      |      'x'      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|      'x'      |
+-+-+-+-+-+-+-+-+

Example: "255,128xx" (left=255, right=128)
Total length: 9 octets
```

### B.2 V6/V10 Binary Instruction

```txt
 0                   1
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Left Speed   | Right Speed   |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

Example: [0xFF, 0x80] (left=255, right=128)
Total length: 2 octets
```

### B.3 V6/V10 Download Header

```txt
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                     Total Byte Count (big-endian)             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

Example: [0x00, 0x00, 0x00, 0x04] = 4 bytes (2 instructions)
Length: Variable (typically 2-4 octets)
```

### B.4 V6/V10 Download Data Packet

```txt
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Sequence Num |     Left0     |    Right0     |     Left1     |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|    Right1     |     Left2     |    Right2     |      ...      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|      ...      |     LeftN     |    RightN     |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

Example: [0x00, 0xFF, 0x80, 0x40, 0xBF]
  Sequence: 0
  Instruction 0: left=255, right=128
  Instruction 1: left=64, right=191

Maximum length: 19 octets (1 seq + 18 data = 9 instructions)
Typical length: Variable based on remaining instructions
```

---

## Appendix C: Test Vectors

### C.1 Speed Encoding

**Application to Wire:**

| Input (%) | Formula | Result |
|-----------|---------|--------|
| 0 | floor(0 × 2.55 + 0.5) | 0 |
| 1 | floor(1 × 2.55 + 0.5) | 3 |
| 25 | floor(25 × 2.55 + 0.5) | 64 |
| 50 | floor(50 × 2.55 + 0.5) | 128 |
| 75 | floor(75 × 2.55 + 0.5) | 191 |
| 99 | floor(99 × 2.55 + 0.5) | 253 |
| 100 | floor(100 × 2.55 + 0.5) | 255 |

**Wire to Application:**

| Input | Formula | Result (%) |
|-------|---------|------------|
| 0 | trunc(0 / 2.55 + 0.5) | 0 |
| 3 | trunc(3 / 2.55 + 0.5) | 1 |
| 64 | trunc(64 / 2.55 + 0.5) | 25 |
| 128 | trunc(128 / 2.55 + 0.5) | 50 |
| 191 | trunc(191 / 2.55 + 0.5) | 75 |
| 253 | trunc(253 / 2.55 + 0.5) | 99 |
| 255 | trunc(255 / 2.55 + 0.5) | 100 |

### C.2 DATA_LENGTH Calculation

**Upload:**

| Instructions | Calculation | Hex | Command |
|--------------|-------------|-----|---------|
| 1 | (1 × 2) - 1 = 1 | 0x0001 | `d0001` |
| 2 | (2 × 2) - 1 = 3 | 0x0003 | `d0003` |
| 100 | (100 × 2) - 1 = 199 | 0x00C7 | `d00C7` |
| 1024 | (1024 × 2) - 1 = 2047 | 0x07FF | `d07FF` |
| 4096 | (4096 × 2) - 1 = 8191 | 0x1FFF | `d1FFF` |

**Recording (V10, interval=2):**

| Duration (s) | Interval | Calculation | Hex | Command |
|--------------|----------|-------------|-----|---------|
| 10 | 2 | (2 × 10 × 2) - 1 = 39 | 0x0027 | `d0027` |
| 60 | 2 | (2 × 60 × 2) - 1 = 239 | 0x00EF | `d00EF` |
| 100 | 1 | (1 × 100 × 2) - 1 = 199 | 0x00C7 | `d00C7` |

### C.3 Complete Upload Sequence (V10, 2 instructions)

**Program:**

```txt
Instruction 0: left=100%, right=50%
Instruction 1: left=25%, right=75%
```

**Encoding:**

```txt
Instruction 0: [255, 128]
Instruction 1: [64, 191]
```

**Command Sequence:**

```txt
1. 'F'                    [0x46]
2. 'd0003'                [0x64, 0x30, 0x30, 0x30, 0x33]
3. 'E'                    [0x45]
4. Binary data            [0xFF, 0x80, 0x40, 0xBF]
```

**Expected Response:**

```txt
'FULL'                     [0x46, 0x55, 0x4C, 0x4C]
```

### C.4 Complete Download Sequence (V10, 2 instructions)

**Request:**

```txt
'B'                        [0x42]
```

**Response Packet 1 (Header):**

```txt
[0x00, 0x00, 0x00, 0x04]   (4 bytes total)
```

**Response Packet 2 (Data):**

```txt
[0x00, 0xFF, 0x80, 0x40, 0xBF]
 │     └─────────┴─────────┘
 │            Data
 Seq=0
```

**Decoded Program:**

```txt
Instruction 0: left=255 (100%), right=128 (50%)
Instruction 1: left=64 (25%), right=191 (75%)
```
