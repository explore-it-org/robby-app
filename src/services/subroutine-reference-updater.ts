/* eslint-disable */
// @ts-nocheck
/**
 * DEPRECATED - This file is no longer used.
 *
 * Subroutine Reference Updater Service
 *
 * Handles updating cached program names in subroutine instructions
 * when referenced programs are renamed.
 */

import { Instruction, RepetitionInstruction, SubroutineInstruction } from '@/types/instruction';
import { Program } from '@/types/program';
import { loadAllPrograms, saveProgram } from './program-storage';

/**
 * Recursively finds all subroutine instructions that reference a specific program ID
 */
function findSubroutineReferences(
  instructions: Instruction[],
  targetProgramId: string
): SubroutineInstruction[] {
  const references: SubroutineInstruction[] = [];

  function processInstructions(instrs: Instruction[]): void {
    for (const instruction of instrs) {
      if (instruction.type === 'subroutine' && instruction.programId === targetProgramId) {
        references.push(instruction);
      } else if (instruction.type === 'repetition') {
        processInstructions(instruction.instructions);
      }
    }
  }

  processInstructions(instructions);
  return references;
}

/**
 * Updates cached program names in subroutine instructions
 */
function updateSubroutineNames(
  instructions: Instruction[],
  targetProgramId: string,
  newProgramName: string
): { instructions: Instruction[]; updated: boolean } {
  let hasChanges = false;

  function processInstructions(instrs: Instruction[]): Instruction[] {
    return instrs.map((instruction) => {
      if (instruction.type === 'subroutine' && instruction.programId === targetProgramId) {
        // Only update if the name is different
        if (instruction.programName !== newProgramName) {
          hasChanges = true;
          return {
            ...instruction,
            programName: newProgramName,
          };
        }
      } else if (instruction.type === 'repetition') {
        const result = processInstructions(instruction.instructions);
        if (hasChanges) {
          return {
            ...instruction,
            instructions: result,
          } as RepetitionInstruction;
        }
      }
      return instruction;
    });
  }

  const updatedInstructions = processInstructions(instructions);
  return { instructions: updatedInstructions, updated: hasChanges };
}

/**
 * Syncs all cached program names in subroutine instructions with current program names
 * This function ensures that all subroutine references display the latest program names
 *
 * @param instructions - The instructions to sync
 * @param programMap - Map of program ID to program for looking up current names
 * @returns Updated instructions with synced names, or original if no changes needed
 */
export function syncSubroutineNames(
  instructions: Instruction[],
  programMap: Map<string, Program>
): Instruction[] {
  function processInstructions(instrs: Instruction[]): Instruction[] {
    return instrs.map((instruction) => {
      if (instruction.type === 'subroutine') {
        const referencedProgram = programMap.get(instruction.programId);
        if (referencedProgram && instruction.programName !== referencedProgram.name) {
          // Update cached name to match current program name
          return {
            ...instruction,
            programName: referencedProgram.name,
          };
        }
      } else if (instruction.type === 'repetition') {
        const updatedNested = processInstructions(instruction.instructions);
        return {
          ...instruction,
          instructions: updatedNested,
        } as RepetitionInstruction;
      }
      return instruction;
    });
  }

  return processInstructions(instructions);
}

/**
 * Updates all programs that reference the renamed program
 * This function finds all programs containing subroutine instructions
 * that reference the given program ID and updates their cached names
 *
 * @param renamedProgramId - The ID of the program that was renamed
 * @param newProgramName - The new name of the program
 * @returns Promise that resolves to the number of programs updated
 */
export async function updateSubroutineReferences(
  renamedProgramId: string,
  newProgramName: string
): Promise<number> {
  try {
    // Load all programs
    const allPrograms = await loadAllPrograms();

    // Find programs that reference the renamed program
    const programsToUpdate: Program[] = [];

    for (const program of allPrograms) {
      // Skip the renamed program itself
      if (program.id === renamedProgramId) {
        continue;
      }

      // Check if this program has subroutines referencing the renamed program
      const references = findSubroutineReferences(program.instructions, renamedProgramId);
      if (references.length > 0) {
        programsToUpdate.push(program);
      }
    }

    // Update each program's subroutine references
    let updatedCount = 0;
    for (const program of programsToUpdate) {
      const { instructions, updated } = updateSubroutineNames(
        program.instructions,
        renamedProgramId,
        newProgramName
      );

      if (updated) {
        const updatedProgram: Program = {
          ...program,
          instructions,
          lastModified: new Date(),
        };

        await saveProgram(updatedProgram);
        updatedCount++;
      }
    }

    return updatedCount;
  } catch (error) {
    console.error('Error updating subroutine references:', error);
    throw error;
  }
}
