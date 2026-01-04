/**
 * Program Instruction Type Definitions
 *
 * Represents different types of instructions that can be part of a program.
 */

/**
 * Move instruction - controls robot motor speeds with repetitions
 */
export interface MoveStatement {
  type: 'move';
  leftMotorSpeed: number; // 0-100
  rightMotorSpeed: number; // 0-100
  repetitions: number; // 1-100
}

/**
 * Subroutine instruction - calls another program with repetitions
 */
export interface SubroutineStatement {
  type: 'subroutine';
  programReference: string; // Name of program to call
  repetitions: number; // 1-100
}

/**
 * Union type for all instruction types
 */
export type Statement = MoveStatement | SubroutineStatement;

/**
 * Creates a default move statement with standard values
 */
export function createMoveStatement(): MoveStatement {
  return {
    type: 'move',
    leftMotorSpeed: 50,
    rightMotorSpeed: 50,
    repetitions: 1,
  };
}

/**
 * Creates a default subroutine statement
 */
export function createSubroutineStatement(programReference: string): SubroutineStatement {
  return {
    type: 'subroutine',
    programReference,
    repetitions: 1,
  };
}
