import { ProgramError } from './errors';
import { Instruction } from './instructions';
import { ProgramSource } from './source';

export type Program = CompiledProgram | FaultyProgram;

export interface CompiledProgram {
  type: 'compiled';
  source: ProgramSource;
  instructions: Instruction[];
}

export interface FaultyProgram {
  type: 'faulty';
  source: ProgramSource;
  errors: ProgramError[];
}
