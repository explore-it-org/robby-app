/**
 * Program Type Definitions
 *
 * Represents programs in their compiled or faulty states.
 */

import { ProgramError } from './errors';
import { Instruction } from './instructions';
import { ProgramSource } from './source';

/**
 * Compiled program - successfully compiled to executable instructions
 */
export interface CompiledProgram {
  type: 'compiled';
  source: ProgramSource;
  instructions: Instruction[];
}

/**
 * Faulty program - compilation failed with errors
 */
export interface FaultyProgram {
  type: 'faulty';
  source: ProgramSource;
  errors: ProgramError[];
}

/**
 * Union type for all program states
 */
export type Program = CompiledProgram | FaultyProgram;
