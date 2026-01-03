/**
 * Subroutine Reference Updater Service
 *
 * Handles updating program name references in subroutine statements
 * when referenced programs are renamed.
 * 
 * MIGRATED to work with new ProgramSource format (name-based references).
 */

import { loadProgramSource, saveProgramSource, ProgramSource } from '@/programs/source';
import { loadAllPrograms } from './program-storage';

/**
 * Finds all subroutine statements that reference a specific program name
 */
function hasSubroutineReference(source: ProgramSource, targetProgramName: string): boolean {
  return source.statements.some(
    (statement) =>
      statement.type === 'subroutine' && statement.programReference === targetProgramName
  );
}

/**
 * Updates program name references in subroutine statements
 */
function updateSubroutineReferences_internal(
  source: ProgramSource,
  oldProgramName: string,
  newProgramName: string
): ProgramSource {
  return {
    ...source,
    statements: source.statements.map((statement) => {
      if (statement.type === 'subroutine' && statement.programReference === oldProgramName) {
        return {
          ...statement,
          programReference: newProgramName,
        };
      }
      return statement;
    }),
  };
}

/**
 * Updates all programs that reference the renamed program
 * This function finds all programs containing subroutine statements
 * that reference the given program name and updates their references
 *
 * @param oldProgramName - The old name of the program that was renamed
 * @param newProgramName - The new name of the program
 * @returns Promise that resolves to the number of programs updated
 */
export async function updateSubroutineReferences(
  oldProgramName: string,
  newProgramName: string
): Promise<number> {
  try {
    // Load all program metadata (lightweight)
    const allPrograms = await loadAllPrograms();

    // Track programs to update
    let updatedCount = 0;

    for (const program of allPrograms) {
      // Skip the renamed program itself
      if (program.name === oldProgramName || program.name === newProgramName) {
        continue;
      }

      // Load full program source
      const source = await loadProgramSource(program.name);
      if (!source) {
        continue;
      }

      // Check if this program has subroutines referencing the renamed program
      if (hasSubroutineReference(source, oldProgramName)) {
        // Update references
        const updatedSource = updateSubroutineReferences_internal(
          source,
          oldProgramName,
          newProgramName
        );

        // Save updated program
        const success = await saveProgramSource(updatedSource);
        if (success) {
          updatedCount++;
        }
      }
    }

    return updatedCount;
  } catch (error) {
    console.error('Error updating subroutine references:', error);
    throw error;
  }
}

