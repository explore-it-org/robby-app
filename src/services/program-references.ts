/**
 * Program References Service
 *
 * Utilities for finding and managing program references (subroutines).
 * 
 * MIGRATED to work with new ProgramSource format and name-based references.
 */

import { ProgramSource } from '@/programs/source';
import { Statement } from '@/programs/statements';
import { loadProgramSource } from '@/programs/source';
import { loadAllPrograms, Program } from '@/services/program-storage';

/**
 * Extracts all referenced program names from statements (flat array, no recursion needed)
 */
export function extractReferencedProgramNames(statements: Statement[]): Set<string> {
  const names = new Set<string>();

  for (const statement of statements) {
    if (statement.type === 'subroutine' && statement.programReference) {
      names.add(statement.programReference);
    }
  }

  return names;
}

/**
 * Finds all programs that reference the given program name
 *
 * @param programName - The name of the program to find references to
 * @returns Array of program metadata that reference the given program
 */
export async function findProgramsReferencingProgram(
  programName: string
): Promise<Program[]> {
  const referencingPrograms: Program[] = [];

  try {
    // Load all program metadata
    const allPrograms = await loadAllPrograms();

    // Check each program's statements for references
    for (const program of allPrograms) {
      // Skip the program itself
      if (program.name === programName) {
        continue;
      }

      // Load the full program source
      const source = await loadProgramSource(program.name);
      if (!source) {
        continue;
      }

      const referencedNames = extractReferencedProgramNames(source.statements);
      if (referencedNames.has(programName)) {
        referencingPrograms.push(program);
      }
    }
  } catch (error) {
    console.error('Error finding program references:', error);
  }

  return referencingPrograms;
}
