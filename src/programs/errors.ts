export type ProgramError = ComplexityError | MissingReferenceError;

// The program exceeds the maximum allowed instruction count (maybe because of subroutine calls and repetitions)
export interface ComplexityError {
  type: 'complexity';
  statementIndex: number;
  maxInstructions: number;
  actualInstructions: number | null;
}

// The referred program does not exist
export interface MissingReferenceError {
  type: 'missing-reference';
  statementIndex: number;
  programReference: string;
}

// The referred program exists but does not compile
export interface FaultyReferenceError {
  type: 'faulty-reference';
  statementIndex: number;
  programReference: string;
}
