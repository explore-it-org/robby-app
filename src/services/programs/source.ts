import { Statement } from './statements';

/**
 * Program source - source program representation
 *
 * Can be edited and stored to disk. A compiler can convert this to a instruction list
 * for sending to a robot.
 */
export interface ProgramSource {
  name: string; // Program name (also used as unique identifier)
  lastModified: Date; // Last modified date
  statements: Statement[]; // Array of statements (no nesting, repetitions via field)
}
