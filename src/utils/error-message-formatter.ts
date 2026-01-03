/**
 * Error Message Formatter Utility
 *
 * Provides consistent error message formatting for both compilation errors view
 * and individual instruction card error displays.
 */

import { CompilationError } from '@/types/compiled-program';

/**
 * Formats an error message, adjusting it for transitive errors
 *
 * When used in instruction cards:
 * @param error - The compilation error to format
 * @param displayingInstructionId - The ID of the instruction displaying this error
 * @returns The formatted error message
 *
 * When used in the compilation errors overview:
 * @param error - The compilation error to format
 * @param displayingInstructionId - Omit this parameter (undefined)
 * @returns The formatted error message
 */
export function formatErrorMessage(
  error: CompilationError,
  displayingInstructionId?: string
): string {
  // Determine if this is a transitive error:
  // 1. In instruction cards: error.parentInstructionId === displayingInstructionId
  // 2. In overview (no displayingInstructionId): error.parentInstructionId exists
  const isTransitive = displayingInstructionId
    ? error.parentInstructionId === displayingInstructionId
    : !!error.parentInstructionId;

  if (!isTransitive) {
    return error.message;
  }

  // For transitive errors, modify the message to indicate the referenced program has errors
  if (error.type === 'missing-reference') {
    // Extract the program name from the original message
    const match = error.message.match(/Referenced program "([^"]+)" not found/);
    if (match) {
      return `The referenced program has errors: Program "${match[1]}" not found`;
    }
  } else if (error.type === 'cyclic-dependency') {
    return `The referenced program has errors: ${error.message}`;
  } else if (error.type === 'instruction-limit-exceeded') {
    return `The referenced program has errors: Too many instructions`;
  }

  // Default: prefix the error message
  return `The referenced program has errors: ${error.message}`;
}

/**
 * Checks if an error is transitive (caused by a referenced program)
 *
 * @param error - The compilation error to check
 * @param displayingInstructionId - The ID of the instruction displaying this error (optional)
 * @returns True if the error is transitive
 */
export function isTransitiveError(
  error: CompilationError,
  displayingInstructionId?: string
): boolean {
  return displayingInstructionId
    ? !!(error.parentInstructionId && error.parentInstructionId === displayingInstructionId)
    : !!error.parentInstructionId;
}
