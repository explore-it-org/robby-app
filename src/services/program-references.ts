/**
 * Program References Service
 *
 * Utilities for finding and managing program references (subroutines).
 */

import { Instruction } from '@/types/instruction';
import { Program } from '@/types/program';

/**
 * Extracts all referenced program IDs from instructions recursively
 */
export function extractReferencedProgramIds(instructions: Instruction[]): Set<string> {
  const ids = new Set<string>();

  function processInstructions(instrs: Instruction[]): void {
    for (const instruction of instrs) {
      if (instruction.type === 'subroutine' && instruction.programId) {
        ids.add(instruction.programId);
      } else if (instruction.type === 'repetition') {
        processInstructions(instruction.instructions);
      }
    }
  }

  processInstructions(instructions);
  return ids;
}

/**
 * Finds all programs that reference the given program ID
 *
 * @param programId - The ID of the program to find references to
 * @param allPrograms - All available programs to search through
 * @returns Array of programs that reference the given program
 */
export function findProgramsReferencingProgram(
  programId: string,
  allPrograms: Program[]
): Program[] {
  const referencingPrograms: Program[] = [];

  for (const program of allPrograms) {
    // Skip the program itself
    if (program.id === programId) {
      continue;
    }

    const referencedIds = extractReferencedProgramIds(program.instructions);
    if (referencedIds.has(programId)) {
      referencingPrograms.push(program);
    }
  }

  return referencingPrograms;
}
