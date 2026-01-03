/**
 * Program Error Type Definitions
 *
 * Represents different types of errors that can occur during program compilation.
 */

/**
 * Complexity error - program exceeds the maximum allowed instruction count
 * (may be caused by subroutine calls and repetitions)
 */
export interface ComplexityError {
  type: 'complexity';
  maxInstructions: number;
}

/**
 * Missing reference error - the referred program does not exist
 */
export interface MissingReferenceError {
  type: 'missing-reference';
  statementIndex: number;
  programReference: string;
}

/**
 * Faulty reference error - the referred program exists but does not compile
 */
export interface FaultyReferenceError {
  type: 'faulty-reference';
  statementIndex: number;
  programReference: string;
}

/** Cyclic reference error - the referred program creates a circular reference
 */
export interface CyclicReferenceError {
  type: 'cyclic-reference';
  statementIndex: number;
  programReference: string;
}

/**
 * Union type for all program error types
 */
export type ProgramError =
  | ComplexityError
  | MissingReferenceError
  | FaultyReferenceError
  | CyclicReferenceError;
