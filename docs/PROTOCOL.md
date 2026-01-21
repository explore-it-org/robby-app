# EXPLORE-IT Robotics Bluetooth Protocol Specification

**Version:** 1.0
**Status:** Informational
**Category:** Educational Robotics
**Last Updated:** 2025-11-06
**Authors:** Reverse-engineered from legacy app source code

---

## Abstract

This document specifies the Bluetooth Low Energy (BLE) communication protocol used between EXPLORE-IT educational robotics devices and their control applications. The protocol enables device discovery, connection establishment, program transfer, real-time control, and configuration management. This specification defines three protocol versions (V3, V6, and V10) to support multiple robot firmware generations.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Conventions and Definitions](#2-conventions-and-definitions)
3. [Architecture](#3-architecture)
4. [Transport Layer (BLE)](#4-transport-layer-ble)
5. [Protocol Versions](#5-protocol-versions)
6. [Connection Establishment](#6-connection-establishment)
7. [Command Reference](#7-command-reference)
8. [Response Reference](#8-response-reference)
9. [Data Encoding](#9-data-encoding)
10. [Protocol Operations](#10-protocol-operations)
11. [State Machine](#11-state-machine)
12. [Error Handling](#12-error-handling)
13. [Security Considerations](#13-security-considerations)
14. [Implementation Notes](#14-implementation-notes)
15. [Examples](#15-examples)
16. [Troubleshooting](#16-troubleshooting)
17. [References](#17-references)
18. [Appendix A: ABNF Grammar](#appendix-a-abnf-grammar)
19. [Appendix B: Packet Diagrams](#appendix-b-packet-diagrams)
20. [Appendix C: Test Vectors](#appendix-c-test-vectors)
21. [Appendix D: Quick Reference](#appendix-d-quick-reference)

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

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in RFC 2119.

### 1.4 Terminology

- **Client:** The mobile application initiating communication
- **Server:** The robot device responding to commands
- **Instruction:** A single motor speed command consisting of left and right wheel speeds
- **Program:** An ordered sequence of instructions
- **Block:** A reference to a program with a repetition count
- **Interval:** The duration (in deciseconds) for which each instruction executes

### 1.5 Key Characteristics

- **Transport:** BLE GATT (Generic Attribute Profile)
- **Encoding:** ASCII text (v1-v4) and binary (v6+)
- **Command Format:** Single-character or short string commands
- **Response Format:** Text strings or binary data
- **Data Model:** Differential drive motor speeds (left/right wheels, 0-100%)
- **Speed Resolution:** 8-bit (0-255 internally, scaled from 0-100%)
- **Communication Model:** Client-server with asynchronous responses

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

---

## 3. Architecture

### 3.1 Protocol Stack

```
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

**Important:** This is NOT a state publishing protocol. The robot does not continuously broadcast its state. All communication is client-initiated (request-response model).

### 3.3 Connection Lifecycle

```
[DISCONNECTED] → scan → [SCANNING]
[SCANNING] → found device → [CONNECTING]
[CONNECTING] → connected → [VERSION_NEGOTIATION]
[VERSION_NEGOTIATION] → version ok → [READY]
[READY] → command → [OPERATING]
[OPERATING] → operation complete → [READY]
[READY] → disconnect → [DISCONNECTED]
```

---

## 4. Transport Layer (BLE)

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
```
EXPLORE-IT <suffix>
```

Where `<suffix>` is implementation-specific (commonly the last octets of the MAC address in hexadecimal).

**Examples:**
- `EXPLORE-IT 70:AB`
- `EXPLORE-IT 80:CD`
- `EXPLORE-IT 90:EF`

### 4.4 Data Transfer

**Client to Server:**
Commands MUST be written to the characteristic using Write With Response operation. Each write MUST contain a complete command or data packet.

**Server to Client:**
Responses MUST be sent via characteristic notifications. The client MUST enable notifications before sending commands.

**MTU Considerations:**
- Minimum supported MTU: 23 octets (20 octets data payload)
- Implementations SHOULD negotiate the maximum MTU supported by both devices
- Larger MTUs MAY be used if negotiated (recommended: 512 octets)

**Transaction Identifier:**
Implementations MAY use the string `"exploreit"` as a transaction identifier for BLE operations.

### 4.5 Platform-Specific Requirements

**Android:**
- Requires `ACCESS_FINE_LOCATION` permission (for BLE scanning on Android <12)
- Android 12+: Requires `BLUETOOTH_SCAN` and `BLUETOOTH_CONNECT` permissions
- Android 13+: May require `NEARBY_WIFI_DEVICES` permission
- Location services must be enabled (Android <12)

**iOS:**
- Requires `NSBluetoothAlwaysUsageDescription` in Info.plist
- No location permission required

---

## 5. Protocol Versions

### 5.1 Version Mapping

The robot firmware has evolved through multiple versions. The app supports versions 1-10 with backward compatibility.

| Firmware Version | Protocol Version | Handler Identifier      | Protocol Style   | Notes                        |
|------------------|------------------|-------------------------|------------------|------------------------------|
| 1                | Bootstrap        | `BootstrapHandler`      | Bootstrap only   | Version detection only       |
| 2, 3, 4          | V3               | `CommunicationHandlerV3`| Text-based       | ASCII speed data             |
| 5, 6, 7, 8       | (Unsupported)    | -                       | -                | Unsupported range            |
| 9                | V6               | `CommunicationHandlerV6`| Binary           | Packeted downloads           |
| 10               | V10              | `CommunicationHandlerV10`| Binary + Chunked| Chunked uploads              |

### 5.2 Version Compatibility

Clients MUST support all defined protocol versions. If a client encounters an unsupported version, it MUST:

1. Display an error message to the user
2. Disconnect from the device
3. NOT attempt any operations

**If firmware version > maximum supported version:**
- Error: "Robot firmware is newer than application. Please update the application."

**If firmware version < minimum supported version:**
- Error: "Robot firmware is outdated. Please update robot firmware."

### 5.3 Key Differences by Version

**V3 (Firmware 2-4):**
- ASCII text commands and responses
- Speed data as ASCII text: `"255,128xx"`
- Each instruction sent separately
- Download uses comma-delimited format
- End marker: `",,,,"`
- Sequential instruction upload (one instruction per write)
- Maximum ~100 instructions (MTU limited)

**V6 (Firmware 9):**
- Binary data encoding
- Binary speed data (2 bytes per instruction)
- Packeted downloads with sequence numbers
- First packet contains total instruction count
- Packet loss detection (incomplete)
- Maximum ~2400 instructions

**V10 (Firmware 10):**
- All V6 features
- Binary uploads in chunks (max 256 instructions/chunk)
- Same binary download as V6
- Supports up to 4,096 instructions
- Better handling of large programs
- Improved large program handling

---

## 6. Connection Establishment

### 6.1 Connection Sequence

The connection sequence MUST proceed in the following order:

```
Client                          Server
  |                               |
  |-------- [BLE Connect] ------->|
  |                               |
  |<-- [Service Discovery] ------>|
  |                               |
  |---- [Enable Notifications] -->|
  |                               |
  |-------- VERSION_REQ --------->|  'Z'
  |                               |
  |<------- VERSION_RESP ---------|  'VER 10'
  |                               |
  |---- [Select Protocol Ver] ----|
  |                               |
  |------- INTERVAL_QUERY ------->|  'I?'
  |                               |
  |<----- INTERVAL_RESPONSE ------|  'I=02'
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

```
VER<space><number>
```

**ABNF:**
```abnf
version-response = "VER" SP 1*2DIGIT
```

**Examples:**
- `VER 3` (firmware version 3, use V3 protocol)
- `VER 9` (firmware version 9, use V6 protocol)
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

```
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

## 7. Command Reference

### 7.1 Command Format

Commands consist of a command identifier followed by optional parameters. Commands MUST NOT exceed the negotiated MTU size.

### 7.2 Command Categories

- **Control Commands:** Robot operation control (run, stop, etc.)
- **Query Commands:** Information retrieval
- **Configuration Commands:** Parameter modification
- **Transfer Commands:** Program upload/download

### 7.3 Control Commands

#### 7.3.1 VERSION_REQ (Z)

| Property | Value |
|----------|-------|
| **Identifier** | `Z` (0x5A) |
| **Parameters** | None |
| **Length** | 1 octet |
| **Description** | Request firmware version |
| **Response** | VERSION_RESP |
| **Versions** | All |

**Example:**
```
App → Robot: 'Z'
Robot → App: 'VER 10'
```

#### 7.3.2 RUN (R)

| Property | Value |
|----------|-------|
| **Identifier** | `R` (0x52) |
| **Parameters** | None |
| **Length** | 1 octet |
| **Description** | Execute the program stored in robot memory from beginning to end |
| **Response** | EXECUTION_COMPLETE when finished |
| **Versions** | All |

**Behavior:**
1. Server MUST begin executing instructions from index 0
2. Server MUST execute instructions sequentially
3. Server MUST apply each instruction for the configured interval duration
4. Server MUST send EXECUTION_COMPLETE when all instructions have been executed
5. Server MUST stop motors after the final instruction

**Example:**
```
App → Robot: 'R'
Robot: [Executes all instructions]
Robot → App: '_END'
```

#### 7.3.3 GO (G)

| Property | Value |
|----------|-------|
| **Identifier** | `G` (0x47) |
| **Parameters** | None |
| **Length** | 1 octet |
| **Description** | Enter drive mode and begin moving |
| **Response** | EXECUTION_COMPLETE when stopped |
| **Versions** | All |

**Behavior:**
Server MUST enter a continuous motion state. The exact behavior is implementation-defined but typically involves executing a stored program or entering manual control mode.

**Example:**
```
App → Robot: 'G'
Robot: [Starts continuous movement]
```

#### 7.3.4 STOP (S)

| Property | Value |
|----------|-------|
| **Identifier** | `S` (0x53) |
| **Parameters** | None |
| **Length** | 1 octet |
| **Description** | Emergency stop - immediately halt all operations |
| **Response** | STOP_CONFIRM |
| **Versions** | All |
| **Priority** | Highest - MUST interrupt any operation |

**Behavior:**
1. Server MUST immediately set all motor speeds to 0
2. Server MUST cancel any in-progress operation (upload, download, recording, execution)
3. Server MUST send STOP_CONFIRM response
4. Server MUST transition to READY state

**Example:**
```
App → Robot: 'S'
Robot → App: '_SR_'
```

#### 7.3.5 DOWNLOAD_REQ (B)

| Property | Value |
|----------|-------|
| **Identifier** | `B` (0x42) |
| **Parameters** | None |
| **Length** | 1 octet |
| **Description** | Request download (beam) of program from robot to client |
| **Response** | Download packet sequence (protocol version dependent) |
| **Versions** | All |

**Behavior:**
Server MUST transmit its currently stored program to the client. The format depends on protocol version (see Section 10).

**Example:**
```
App → Robot: 'B'
Robot → App: [Multiple packets with speed data]
Robot → App: ',,,,' (V3) or final packet (V6/V10)
```

### 7.4 Configuration Commands

#### 7.4.1 INTERVAL_QUERY (I?)

| Property | Value |
|----------|-------|
| **Identifier** | `I?` (0x49, 0x3F) |
| **Parameters** | None |
| **Length** | 2 octets |
| **Description** | Query current interval setting |
| **Response** | INTERVAL_RESPONSE |
| **Versions** | All |

**Example:**
```
App → Robot: 'I?'
Robot → App: 'I=02'
```

#### 7.4.2 INTERVAL_SET (I<nn>)

| Property | Value |
|----------|-------|
| **Identifier** | `I` followed by decimal digits |
| **Parameters** | Interval value (0-50) |
| **Length** | 2-3 octets |
| **Description** | Set the interval (instruction duration) |
| **Response** | None (client SHOULD re-query with INTERVAL_QUERY to confirm) |
| **Versions** | All |

**Format:** `I<value>`

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

**Best Practice:**
```
App → Robot: 'I25'
App → Robot: 'I?'
Robot → App: 'I=25'  [Confirmed]
```

Server MUST validate the value. If the value is out of range, the server SHOULD clamp it to the valid range.

### 7.5 Transfer Commands

#### 7.5.1 FLUSH (F)

| Property | Value |
|----------|-------|
| **Identifier** | `F` (0x46) |
| **Parameters** | None |
| **Length** | 1 octet |
| **Description** | Flush robot memory, preparing for new program |
| **Response** | None (implicit acknowledgment) |
| **Versions** | All |

**Behavior:**
Server MUST clear its program memory and prepare to receive a new program. This command MUST be sent before any upload or recording operation.

**Example:**
```
App → Robot: 'F'
```

#### 7.5.2 DATA_LENGTH (d<hhhh>)

| Property | Value |
|----------|-------|
| **Identifier** | `d` followed by 4 hexadecimal digits |
| **Parameters** | Data length in bytes |
| **Length** | 5 octets |
| **Description** | Specify the length of data to be uploaded or recorded |
| **Response** | None (implicit acknowledgment) |
| **Versions** | All |

**Format:** `d<hex4>`

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
```
data_length = (num_instructions × 2) - 1
hex_string = uppercase_hex(data_length).padStart(4, '0')
```

**Value Constraints:**
- Minimum: 0x0001 (1 byte, representing 1 instruction)
- Maximum: 0x1FFF (8191 bytes, representing 4096 instructions)

**Example:**
```
For 1024 instructions:
  (1024 × 2) - 1 = 2047 = 0x07FF
App → Robot: 'd07FF'
```

#### 7.5.3 ENTER_UPLOAD (E)

| Property | Value |
|----------|-------|
| **Identifier** | `E` (0x45) |
| **Parameters** | None |
| **Length** | 1 octet |
| **Description** | Enter upload mode, ready to receive program data |
| **Response** | None (implicit acknowledgment) |
| **Versions** | All |

**Behavior:**
Server MUST transition to upload mode. Subsequent writes MUST be interpreted as program data according to the protocol version.

**Prerequisites:**
1. FLUSH command MUST have been sent
2. DATA_LENGTH command MUST have been sent

**Example:**
```
App → Robot: 'F'
App → Robot: 'd07FF'
App → Robot: 'E'
```

#### 7.5.4 LEARN (L)

| Property | Value |
|----------|-------|
| **Identifier** | `L` (0x4C) |
| **Parameters** | None |
| **Length** | 1 octet |
| **Description** | Enter learn mode, recording robot movements |
| **Response** | OPERATION_COMPLETE when recording finishes |
| **Versions** | All |

**Behavior:**
1. Server MUST begin recording motor speeds at the configured interval
2. Server MUST record for the duration specified in the preceding DATA_LENGTH command
3. Server MUST store recorded data in program memory
4. Server MUST send OPERATION_COMPLETE when recording completes

**Prerequisites:**
1. FLUSH command MUST have been sent
2. DATA_LENGTH command MUST have been sent with duration calculation:
   - **V3:** `(duration_seconds × 2) - 1`
   - **V6/V10:** `(interval × duration_seconds × 2) - 1`

**Example:**
```
App → Robot: 'F'
App → Robot: 'd00EF'  [60 sec recording, interval=2]
App → Robot: 'L'
Robot: [Records for 60 seconds]
Robot → App: 'FULL'
```

#### 7.5.5 END_UPLOAD (end) - V3 Only

| Property | Value |
|----------|-------|
| **Identifier** | `end` (0x65, 0x6E, 0x64) |
| **Parameters** | None |
| **Length** | 3 octets |
| **Description** | Signal end of program upload |
| **Response** | OPERATION_COMPLETE |
| **Versions** | V3 only |

**Behavior:**
Server MUST finalize the uploaded program and send OPERATION_COMPLETE.

**Note:** V6 and V10 do not use this command. Upload completion is implicit when all data has been received.

**Example:**
```
App → Robot: '255,128xx'
App → Robot: '064,191xx'
App → Robot: 'end'
Robot → App: 'FULL'
```

---

## 8. Response Reference

### 8.1 Response Format

Responses are sent via characteristic notifications. A response may be:

- A single notification packet (most responses)
- Multiple notification packets (download operations)

### 8.2 Text Responses

#### 8.2.1 VERSION_RESP

**Format:** `VER<space><number>`
**Encoding:** ASCII/Latin-1
**Example:** `VER 10`
**When:** After VERSION_REQ command

#### 8.2.2 INTERVAL_RESPONSE

**Format:** `I=<number>`
**Encoding:** ASCII/Latin-1
**Example:** `I=02`
**When:** After INTERVAL_QUERY command

#### 8.2.3 STOP_CONFIRM

**Format:** `_SR_` (0x5F, 0x53, 0x52, 0x5F)
**Length:** 4 octets
**Encoding:** ASCII/Latin-1
**Description:** Confirmation that STOP command was received and executed
**When:** After STOP command

#### 8.2.4 EXECUTION_COMPLETE

**Format:** `_END` (0x5F, 0x45, 0x4E, 0x44)
**Length:** 4 octets
**Encoding:** ASCII/Latin-1
**Description:** Indicates that RUN or GO operation has completed
**When:** After RUN or GO completes

#### 8.2.5 OPERATION_COMPLETE

**Format:** `FULL` (0x46, 0x55, 0x4C, 0x4C)
**Length:** 4 octets
**Encoding:** ASCII/Latin-1
**Description:** Indicates that upload or recording operation has completed successfully
**When:** After upload/record completes

### 8.3 V3 Binary Responses

#### 8.3.1 DOWNLOAD_DATA (V3)

**Format:** Comma-delimited ASCII speed values

**Single Instruction:**
```
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
```
[0x00, 0x00, 0x00, 0x04]  → 4 bytes (2 instructions)
[0x00, 0x00, 0x07, 0xFF]  → 2047 bytes (1023 instructions)
```

**Interpretation:**
```
total_bytes = big_endian_to_int(packet_data)
total_instructions = (total_bytes + 1) / 2
expected_packets = ceil(total_instructions / 9)
```

#### 8.4.2 DOWNLOAD_DATA (V6/V10)

Subsequent packets contain a sequence number followed by instruction data.

**Format:**
```
[sequence_number, data_bytes...]
```

**Packet Structure:**
```
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
```
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

```javascript
wire_value = Math.floor(app_value * 2.55 + 0.5);

// Special case:
if (app_value === 0) {
  wire_value = 0;
}
```

**Examples:**

| App Speed (%) | Calculation | Robot Speed (0-255) |
|---------------|-------------|---------------------|
| 0 | floor(0.0 × 2.55 + 0.5) | 0 |
| 25 | floor(25.0 × 2.55 + 0.5) | 64 |
| 50 | floor(50.0 × 2.55 + 0.5) | 128 |
| 75 | floor(75.0 × 2.55 + 0.5) | 191 |
| 100 | floor(100.0 × 2.55 + 0.5) | 255 |

### 9.3 Decoding Formula (Wire → Application)

```javascript
app_value = Math.trunc(wire_value / 2.55 + 0.5);
```

**Examples:**

| Robot Speed | Calculation | App Speed (%) |
|-------------|-------------|---------------|
| 0 | trunc(0 / 2.55 + 0.5) | 0 |
| 64 | trunc(64 / 2.55 + 0.5) | 25 |
| 128 | trunc(128 / 2.55 + 0.5) | 50 |
| 191 | trunc(191 / 2.55 + 0.5) | 75 |
| 255 | trunc(255 / 2.55 + 0.5) | 100 |

### 9.4 Instruction Structure

An instruction is an ordered pair of speed values.

**Structure:**
```typescript
Instruction {
  left_speed: uint8    // Left motor speed (0-255)
  right_speed: uint8   // Right motor speed (0-255)
}
```

**Behaviors:**
- `{left: 100, right: 100}` → Forward
- `{left: 0, right: 0}` → Stop
- `{left: 100, right: 0}` → Turn right
- `{left: 0, right: 100}` → Turn left
- `{left: 100, right: -100}` → Spin (if negative supported)

### 9.5 V3 Instruction Encoding

**Upload Format:**
```
<left>,<right>xx
```

**Components:**
- `<left>`: 3 decimal digits, zero-padded (000-255)
- `,`: Literal comma character (0x2C)
- `<right>`: 3 decimal digits, zero-padded (000-255)
- `xx`: Literal string "xx" (0x78, 0x78) - ignored by server

**Examples:**
```
255,128xx  → left=255, right=128
064,191xx  → left=64, right=191
000,000xx  → left=0, right=0
```

**Download Format:**
```
<left>,<right>
```

Same as upload but without the `xx` suffix.

### 9.6 V6/V10 Instruction Encoding

**Format:** 2 octets in sequence [left, right]

**Examples:**
```
[0xFF, 0x80] → left=255, right=128
[0x40, 0xBF] → left=64, right=191
[0x00, 0x00] → left=0, right=0
```

### 9.7 Program Structure

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

## 10. Protocol Operations

### 10.1 Upload Operation (V3)

**Objective:** Transfer a program from client to server

**Sequence:**
```
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
```
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
```
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
```
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
```
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
```javascript
const maxChunkSize = 256;  // instructions per chunk

for (let offset = 0; offset < instructions.length; offset += maxChunkSize) {
  const chunkSize = Math.min(maxChunkSize, instructions.length - offset);
  const bytes = new Uint8Array(chunkSize * 2);

  for (let i = 0; i < chunkSize; i++) {
    bytes[i * 2] = Math.floor(instructions[offset + i].left * 2.55 + 0.5);
    bytes[i * 2 + 1] = Math.floor(instructions[offset + i].right * 2.55 + 0.5);
  }

  await sendCommand(bytes);
}
```

**Example (512 instructions in 2 chunks):**
```
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
```
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
```javascript
const instructions = [];

while (true) {
  const response = await awaitNotification();
  const text = response.toString('latin1');

  if (text === ",,,,") {
    break;  // End of download
  }

  if (text.match(/^\d{3},\d{3}$/)) {
    const parts = text.split(',');
    const left = parseInt(parts[0]);
    const right = parseInt(parts[1]);
    instructions.push({ left, right });
  }
}

return instructions;
```

### 10.5 Download Operation (V6/V10)

**Objective:** Transfer program from server to client using binary protocol

**Sequence:**
```
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
```javascript
let linecounter = -1;
let expectedSeq = 0;
const instructions = [];

while (true) {
  const packet = await awaitNotification();

  if (linecounter === -1) {
    // Header packet
    const totalBytes = bigEndianDecode(packet);
    linecounter = Math.ceil((totalBytes + 1) / 18);
    continue;
  }

  // Data packet
  const seq = packet[0];
  const data = packet.slice(1);

  // Check sequence
  if (seq !== expectedSeq) {
    // Packet loss detected
    console.error("Packet loss: expected", expectedSeq, "got", seq);
    // TODO: Request retransmission (not currently implemented)
  }

  expectedSeq = (seq + 1) % 256;

  // Parse instructions
  for (let i = 0; i < data.length; i += 2) {
    const left = data[i];
    const right = data[i + 1];
    instructions.push({ left, right });
  }

  linecounter--;
  if (linecounter === 0) {
    break;  // Download complete
  }
}

return instructions;
```

**Packet Loss:**
Current protocol does NOT define retransmission mechanism. Implementations MAY detect packet loss via sequence number gaps but MUST NOT assume complete delivery.

**Known Limitations:**
- Sequence number wraps at 256, causing ambiguity for programs >2304 instructions
- No acknowledgment or retransmission mechanism

### 10.6 Record Operation

**Objective:** Record robot movements into program memory

**Sequence:**
```
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
```javascript
const durationSeconds = <user input>;
const byteCount = (durationSeconds × 2) - 1;
```

**V6/V10:**
```javascript
const durationSeconds = <user input>;
const interval = <current interval setting>;
const byteCount = (interval × durationSeconds × 2) - 1;
```

**Example (V10, 60 second recording, interval=2):**
```
Client writes: 'F'

byteCount = 2 × 60 × 2 - 1 = 239 = 0xEF
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
```
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
```
total_duration = num_instructions × interval
```

### 10.8 Stop Operation

**Objective:** Emergency halt

**Sequence:**
```
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

```
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

**Known Issue:**
```javascript
// Current implementation has a typo in packet loss detection
// Line 258, 380 of CommunicationManager.js:
alert("lost lines: ", lostLines);  // ❌ WRONG: lostLines is undefined
// Should be:
alert("lost lines: ", this._lostLines);  // ✅ CORRECT
```

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
- **V3:** 100 instructions
- **V6:** 2400 instructions
- **V10:** 4096 instructions

### 14.5 BLE Library Details

The reference implementation uses `react-native-ble-plx` v1.1.1:

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
const command = 'Z';
const base64 = Buffer.from(command).toString('base64');
await device.writeCharacteristic(..., base64);

// Writing (binary)
const bytes = new Uint8Array([255, 128, 64, 191]);
const base64 = Buffer.from(bytes).toString('base64');
await device.writeCharacteristic(..., base64);

// Reading
function onNotification(error, characteristic) {
  const response = Buffer.from(characteristic.value, 'base64');
  // response is now a Buffer (Uint8Array)
}
```

### 14.6 Testing

Implementations SHOULD test:

- All command/response pairs
- Upload/download round-trips
- Packet loss scenarios (V6/V10)
- Boundary conditions (0%, 100% speeds, maximum program size)
- State transitions
- Timeout handling
- Disconnection during operations

---

## 15. Examples

### 15.1 Complete Connection Example

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

### 15.2 Upload Program Example (V10)

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

### 15.3 Download Program Example (V6/V10)

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

## 16. Troubleshooting

### 16.1 Robot Not Found During Scan

**Symptoms:**
- No devices appear in scan results
- Scan completes with empty list

**Solutions:**
1. Verify robot is powered on (LED indicator)
2. Check Bluetooth is enabled on phone
3. Android: Enable location services (required for BLE scanning on Android <12)
4. Android 12+: Grant `BLUETOOTH_SCAN` permission
5. Move closer to robot (within 10 meters)
6. Restart app and try again
7. Power cycle robot
8. Check for BLE interference (other devices, Wi-Fi)

### 16.2 Connection Fails

**Symptoms:**
- Connection times out
- "Failed to connect" error

**Solutions:**
1. Robot may be connected to another device → disconnect other device first
2. Bluetooth cache issue (Android) → clear Bluetooth cache in system settings
3. Restart phone Bluetooth
4. Restart robot
5. Check robot battery level
6. Try connecting to a different robot to isolate issue

### 16.3 Upload Fails or Times Out

**Symptoms:**
- Upload never completes
- No FULL response received
- Connection drops during upload

**Solutions:**
1. Check connection is stable
2. Reduce program size (<1000 instructions to test)
3. V3 firmware: Avoid very large programs (limit to ~50 instructions)
4. Ensure robot has sufficient memory
5. Retry operation
6. Check MTU negotiation succeeded
7. Verify correct protocol version is being used

### 16.4 Download Produces Corrupted Data

**Symptoms:**
- Downloaded program doesn't match uploaded program
- Instructions have incorrect values
- Packet loss warnings in logs

**Solutions:**
1. V6/V10: Packet loss may have occurred → check logs
2. Move closer to robot to improve signal strength
3. Retry download
4. Check for RF interference (Wi-Fi, other Bluetooth devices, microwave ovens)
5. Known issue: Programs >2400 instructions may have corruption (firmware limitation)
6. Verify correct encoding/decoding formulas are used

### 16.5 Robot Doesn't Respond to Commands

**Symptoms:**
- Commands sent but no response
- Robot appears connected but inactive

**Solutions:**
1. Verify connection is established (check connection state)
2. Send 'Z' command to verify communication
3. Robot may be executing a program → send 'S' to stop
4. Check notifications are enabled on characteristic
5. Restart connection
6. Robot may be in error state → power cycle
7. Verify correct characteristic UUID is being used

### 16.6 Version Mismatch Errors

**Symptoms:**
- "Update app" or "Update robot" alerts
- Unsupported version warnings

**Solutions:**
1. If robot version > app version: Update the mobile app
2. If robot version < app version: Update robot firmware
3. Check firmware version with 'Z' command
4. Verify version compatibility table (Section 5.1)
5. Contact support if version is in unsupported range (5-8)

### 16.7 Permission Errors (Android)

**Symptoms:**
- "Permission denied" errors
- Scan fails to start
- Connection fails with security error

**Solutions:**
1. Android <12: Grant `ACCESS_FINE_LOCATION` permission
2. Android 12+: Grant `BLUETOOTH_SCAN` and `BLUETOOTH_CONNECT` permissions
3. Android 13+: Grant `NEARBY_WIFI_DEVICES` permission if required
4. Enable location services (Settings → Location)
5. Check app permissions in Settings → Apps → [App Name] → Permissions
6. Restart app after granting permissions

---

## 17. References

### 17.1 Normative References

**[RFC2119]** Bradner, S., "Key words for use in RFCs to Indicate Requirement Levels", BCP 14, RFC 2119, March 1997.

**[BLE]** Bluetooth SIG, "Bluetooth Core Specification Version 5.3", July 2021.
https://www.bluetooth.com/specifications/bluetooth-core-specification/

**[GATT]** Bluetooth SIG, "Generic Attribute Profile (GATT)", 2010.
https://www.bluetooth.com/specifications/gatt/

### 17.2 Informative References

**[ISO-8859-1]** ISO/IEC, "Information technology — 8-bit single-byte coded graphic character sets — Part 1: Latin alphabet No. 1", ISO/IEC 8859-1:1998.

**[react-native-ble-plx]** Polidea, "React Native BLE PLX", GitHub repository.
https://github.com/Polidea/react-native-ble-plx

### 17.3 Source Material

- Legacy app source: `/docs/legacy-src/robby-app-master/robby-app-master/src/ble/`
- Reference implementation reverse-engineered from legacy app codebase

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

```
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

```
 0                   1
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Left Speed   | Right Speed   |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

Example: [0xFF, 0x80] (left=255, right=128)
Total length: 2 octets
```

### B.3 V6/V10 Download Header

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                     Total Byte Count (big-endian)             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

Example: [0x00, 0x00, 0x00, 0x04] = 4 bytes (2 instructions)
Length: Variable (typically 2-4 octets)
```

### B.4 V6/V10 Download Data Packet

```
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
```
Instruction 0: left=100%, right=50%
Instruction 1: left=25%, right=75%
```

**Encoding:**
```
Instruction 0: [255, 128]
Instruction 1: [64, 191]
```

**Command Sequence:**
```
1. 'F'                    [0x46]
2. 'd0003'                [0x64, 0x30, 0x30, 0x30, 0x33]
3. 'E'                    [0x45]
4. Binary data            [0xFF, 0x80, 0x40, 0xBF]
```

**Expected Response:**
```
'FULL'                     [0x46, 0x55, 0x4C, 0x4C]
```

### C.4 Complete Download Sequence (V10, 2 instructions)

**Request:**
```
'B'                        [0x42]
```

**Response Packet 1 (Header):**
```
[0x00, 0x00, 0x00, 0x04]   (4 bytes total)
```

**Response Packet 2 (Data):**
```
[0x00, 0xFF, 0x80, 0x40, 0xBF]
 │     └─────────┴─────────┘
 │            Data
 Seq=0
```

**Decoded Program:**
```
Instruction 0: left=255 (100%), right=128 (50%)
Instruction 1: left=64 (25%), right=191 (75%)
```

---

## Appendix D: Quick Reference

### D.1 Command Quick Reference

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

### D.2 Response Quick Reference

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

### D.3 Version Comparison Table

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

## Document Version History

- **v1.0 (2025-11-06):** Initial merged specification combining BLUETOOTH_PROTOCOL.md and RFC_EXPLORE_IT_PROTOCOL.md

---

**End of Document**
