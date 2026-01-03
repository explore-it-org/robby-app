/**
 * Program Type Definition
 *
 * Represents a robot program in the explore-it Robotics app.
 */

import { Instruction } from './instruction';

export interface Program {
  /**
   * Unique identifier for the program
   */
  id: string;

  /**
   * Human-readable name of the program
   */
  name: string;

  /**
   * Type of program (step-based or block-based)
   */
  type: 'step' | 'block';

  /**
   * Number of instructions/steps in the program
   */
  instructionCount: number;

  /**
   * Date when the program was created
   */
  createdDate: Date;

  /**
   * Date when the program was last modified
   */
  lastModified: Date;

  /**
   * Array of instructions that make up the program
   */
  instructions: Instruction[];
}
