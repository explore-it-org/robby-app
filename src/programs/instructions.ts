/**
 * Compiled Instruction Type Definitions
 *
 * Represents low-level instructions that are sent to the robot.
 */

/**
 * Instruction - controls robot motor speeds
 * This is the compiled form sent over Bluetooth (2 bytes per instruction)
 */
export interface Instruction {
  leftMotorSpeed: number; // 0-100
  rightMotorSpeed: number; // 0-100
}
