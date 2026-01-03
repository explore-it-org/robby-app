/**
 * Compiled Program Type Definitions
 *
 * Represents a program that has been compiled and validated for execution.
 */

import { Instruction } from './instruction';

/**
 * Compilation error associated with a specific instruction or program-level error
 */
export interface CompilationError {
  /**
   * ID of the instruction that caused the error
   * Undefined for program-level errors not tied to a specific instruction
   */
  instructionId?: string;

  /**
   * Index of the instruction in the source instructions array (deprecated, use instructionId)
   * Set to -1 for program-level errors not tied to a specific instruction
   */
  instructionIndex: number;

  /**
   * The instruction that caused the error (undefined for program-level errors)
   */
  instruction?: Instruction;

  /**
   * Error message describing the issue
   */
  message: string;

  /**
   * Type of error
   */
  type:
    | 'missing-reference'
    | 'cyclic-dependency'
    | 'invalid-instruction'
    | 'instruction-limit-exceeded';

  /**
   * Optional explanation key for translation (e.g., 'cyclicDependencyExplanation')
   * If present, a detailed explanation will be shown below the error message
   */
  explanationKey?: string;

  /**
   * ID of the parent instruction that caused this error transitively
   * For example, if a subroutine calls a program with errors, this will be the subroutine's ID
   * This allows displaying transitive errors on the parent instruction card
   */
  parentInstructionId?: string;
}

/**
 * Base annotation interface
 */
interface BaseAnnotation {
  nestingLevel: number;
}

/**
 * Comment annotation
 */
export interface CommentAnnotation extends BaseAnnotation {
  type: 'comment';
  text: string;
  /**
   * Sequential index in the compiled output (1-indexed)
   */
  index: number;
}

/**
 * Subroutine start annotation
 */
export interface SubroutineStartAnnotation extends BaseAnnotation {
  type: 'subroutine-start';
  subroutineName: string;
  /**
   * Sequential index in the compiled output (1-indexed)
   */
  index: number;
}

/**
 * Subroutine end annotation
 */
export interface SubroutineEndAnnotation extends BaseAnnotation {
  type: 'subroutine-end';
  subroutineName: string;
  /**
   * Sequential index in the compiled output (1-indexed)
   */
  index: number;
}

/**
 * Repetition iteration start annotation
 */
export interface RepetitionIterationAnnotation extends BaseAnnotation {
  type: 'repetition-iteration';
  iterationNumber: number;
  totalIterations: number;
  /**
   * Sequential index in the compiled output (1-indexed)
   */
  index: number;
}

/**
 * Repetition end annotation
 */
export interface RepetitionEndAnnotation extends BaseAnnotation {
  type: 'repetition-end';
  totalIterations: number;
  /**
   * Sequential index in the compiled output (1-indexed)
   */
  index: number;
}

/**
 * Union type for all annotation types
 */
export type Annotation =
  | CommentAnnotation
  | SubroutineStartAnnotation
  | SubroutineEndAnnotation
  | RepetitionIterationAnnotation
  | RepetitionEndAnnotation;

/**
 * A compiled move instruction with its source information
 */
export interface CompiledMoveInstruction {
  /**
   * Sequential index in the compiled output (1-indexed)
   */
  index: number;

  /**
   * Index of the source instruction that generated this move
   */
  sourceInstructionIndex: number;

  /**
   * Left motor speed (0-100)
   */
  leftMotorSpeed: number;

  /**
   * Right motor speed (0-100)
   */
  rightMotorSpeed: number;

  /**
   * Optional duration in seconds
   */
  duration?: number;

  /**
   * Nesting level for indentation (0 = top level)
   */
  nestingLevel: number;
}

/**
 * Annotated instruction - either an annotation label or a move instruction
 */
export type AnnotatedInstruction = Annotation | CompiledMoveInstruction;

/**
 * A compiled program with validation and lowered instructions
 */
export interface CompiledProgram {
  /**
   * Unique identifier (same as source program)
   */
  id: string;

  /**
   * Program name (same as source program)
   */
  name: string;

  /**
   * Program type (same as source program)
   */
  type: 'step' | 'block';

  /**
   * Creation date (same as source program)
   */
  createdDate: Date;

  /**
   * Last modified date (same as source program)
   */
  lastModified: Date;

  /**
   * Total instruction count (same as source program)
   */
  instructionCount: number;

  /**
   * Original source instructions
   */
  sourceInstructions: Instruction[];

  /**
   * Whether the program is valid and can be executed
   */
  isValid: boolean;

  /**
   * Compilation errors (present if isValid is false)
   */
  errors?: CompilationError[];

  /**
   * Annotated compiled instructions (present if isValid is true)
   * Includes move instructions and annotation labels
   */
  compiledInstructions?: AnnotatedInstruction[];
}

/**
 * Helper to check if an annotated instruction is a move instruction
 */
export function isMoveInstruction(
  instruction: AnnotatedInstruction
): instruction is CompiledMoveInstruction {
  return 'leftMotorSpeed' in instruction;
}

/**
 * Helper to check if an annotated instruction is an annotation
 */
export function isAnnotation(instruction: AnnotatedInstruction): instruction is Annotation {
  return !isMoveInstruction(instruction);
}
