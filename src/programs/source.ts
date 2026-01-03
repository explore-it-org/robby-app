/**
 * Program Source Type Definitions
 *
 * Represents the source code structure of a program.
 */

import { Statement } from './statements';

/**
 * Program source - contains program name and instruction sequence
 */
export interface ProgramSource {
  name: string;
  statements: Statement[];
}
