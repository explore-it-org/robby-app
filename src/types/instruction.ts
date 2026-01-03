/**
 * Instruction Type Definitions
 *
 * Represents different types of instructions that can be part of a robot program.
 */

/**
 * Base instruction interface
 */
export interface BaseInstruction {
  id: string;
  type: 'move' | 'comment' | 'subroutine' | 'repetition';
}

/**
 * Move instruction - controls robot motor speeds
 */
export interface MoveInstruction extends BaseInstruction {
  type: 'move';
  leftMotorSpeed: number; // 0-100
  rightMotorSpeed: number; // 0-100
  duration?: number; // Optional duration in seconds
}

/**
 * Comment instruction - documentation/notes
 */
export interface CommentInstruction extends BaseInstruction {
  type: 'comment';
  text: string; // Max 500 characters
}

/**
 * Subroutine instruction - calls another program
 */
export interface SubroutineInstruction extends BaseInstruction {
  type: 'subroutine';
  programId: string; // ID of program to call
  programName?: string; // Cached name for display
}

/**
 * Repetition instruction - repeats nested instructions
 */
export interface RepetitionInstruction extends BaseInstruction {
  type: 'repetition';
  count: number; // 1-100
  instructions: Instruction[]; // Nested instructions (max 3 levels)
}

/**
 * Union type for all instruction types
 */
export type Instruction =
  | MoveInstruction
  | CommentInstruction
  | SubroutineInstruction
  | RepetitionInstruction;
