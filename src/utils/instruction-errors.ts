/**
 * Utility functions for checking instruction errors
 * Extracted from repetition-instruction-card.tsx to reduce complexity and improve reusability
 */

import { CompilationError } from '@/types/compiled-program';
import { Instruction } from '@/types/instruction';

/**
 * Helper function to find all errors for an instruction (both direct and transitive)
 */
export function findAllErrorsForInstruction(
  errors: CompilationError[],
  instructionId: string
): CompilationError[] {
  return errors.filter(
    (e) => e.instructionId === instructionId || e.parentInstructionId === instructionId
  );
}

/**
 * Helper function to check if any nested instruction has an error
 * Recursively checks all nested instructions at any level
 */
export function hasNestedError(instruction: Instruction, errors: CompilationError[]): boolean {
  // Check if this instruction itself has an error (direct or transitive)
  if (findAllErrorsForInstruction(errors, instruction.id).length > 0) {
    return true;
  }

  // If this is a repetition, check all nested instructions
  if (instruction.type === 'repetition') {
    return instruction.instructions.some((nestedInstr) => hasNestedError(nestedInstr, errors));
  }

  return false;
}
