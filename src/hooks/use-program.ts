/**
 * useProgram Hook
 *
 * A custom hook that provides a simple way to load and update a program.
 * Handles loading state, error handling, program updates, and compilation.
 */

import { compileProgram } from '@/services/program-compilation';
import { loadProgram, saveProgram } from '@/services/program-storage';
import { syncSubroutineNames, updateSubroutineReferences } from '@/services/subroutine-reference-updater';
import { CompiledProgram } from '@/types/compiled-program';
import { Instruction } from '@/types/instruction';
import { Program } from '@/types/program';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseProgramOptions {
  /**
   * The ID of the program to load
   */
  programId: string | undefined;

  /**
   * Whether to automatically reload the program when the ID changes
   * @default true
   */
  autoLoad?: boolean;

  /**
   * Whether to compile the program with referenced programs
   * @default false
   */
  compile?: boolean;
}

/**
 * Editor API for making specific edits to a program
 */
export interface ProgramEditor {
  /**
   * Renames the program
   */
  rename: (name: string) => void;

  /**
   * Adds a new instruction at the specified position
   */
  addInstruction: (instruction: Instruction, position: number) => void;

  /**
   * Updates an existing instruction at the specified position
   */
  updateInstruction: (position: number, updates: Partial<Instruction>) => void;

  /**
   * Deletes an instruction at the specified position
   */
  deleteInstruction: (position: number) => void;

  /**
   * Moves an instruction from one position to another
   */
  moveInstruction: (fromPosition: number, toPosition: number) => void;

  /**
   * Duplicates an instruction at the specified position
   */
  duplicateInstruction: (position: number) => void;
}

interface UseProgramResult {
  /**
   * The loaded program, or null if not loaded or not found
   */
  program: Program | null;

  /**
   * The compiled program (if compile is true)
   */
  compiledProgram: CompiledProgram | null;

  /**
   * Whether the program is currently being loaded
   */
  isLoading: boolean;

  /**
   * Any error that occurred during loading
   */
  error: Error | null;

  /**
   * Reloads the program from storage
   */
  reload: () => Promise<void>;

  /**
   * Editor API for making specific edits to a program
   */
  editor: ProgramEditor;
}

/**
 * Extracts all referenced program IDs from instructions recursively
 */
function extractReferencedProgramIds(instructions: Instruction[]): Set<string> {
  const ids = new Set<string>();

  function processInstructions(instrs: Instruction[]): void {
    for (const instruction of instrs) {
      if (instruction.type === 'subroutine') {
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
 * Compiles a program with its referenced programs (optimized to only load what's needed)
 * Also returns the synced program if any subroutine names were updated
 */
async function compileProgramWithReferences(
  program: Program
): Promise<{ compiled: CompiledProgram; syncedProgram: Program | null }> {
  // Extract all referenced program IDs recursively
  const referencedIds = extractReferencedProgramIds(program.instructions);
  const allPrograms = new Map<string, Program>();
  const loadedIds = new Set<string>();

  // Load referenced programs recursively
  async function loadProgramAndReferences(id: string): Promise<void> {
    if (loadedIds.has(id)) {
      return; // Already loaded
    }

    try {
      const fullProgram = await loadProgram(id);
      if (fullProgram) {
        loadedIds.add(id);
        allPrograms.set(id, fullProgram);

        // Extract and load nested references
        const nestedIds = extractReferencedProgramIds(fullProgram.instructions);
        for (const nestedId of nestedIds) {
          await loadProgramAndReferences(nestedId);
        }
      }
    } catch (error) {
      console.warn(`Failed to load referenced program ${id}:`, error);
      // Continue loading other programs - compilation will catch missing references
    }
  }

  // Load all referenced programs and their dependencies
  for (const id of referencedIds) {
    await loadProgramAndReferences(id);
  }

  // Sync subroutine names with current program names before compilation
  // This ensures the display names are always up-to-date
  const syncedInstructions = syncSubroutineNames(program.instructions, allPrograms);
  const programToCompile =
    syncedInstructions !== program.instructions
      ? { ...program, instructions: syncedInstructions }
      : program;

  // Compile the program
  const compiled = compileProgram(programToCompile, allPrograms);

  // Return both the compiled program and the synced program (if changed)
  return {
    compiled,
    syncedProgram: programToCompile !== program ? programToCompile : null,
  };
}

/**
 * Custom hook to load and manage a program with an editor API
 *
 * @example
 * ```tsx
 * // Simple usage
 * const { program, isLoading, editor } = useProgram({ programId: id });
 *
 * // With compilation
 * const { compiledProgram, isLoading, editor } = useProgram({
 *   programId: id,
 *   compile: true
 * });
 *
 * // Use editor API
 * editor.rename('New Name');
 * editor.addInstruction(newInstruction, 0);
 * editor.updateInstruction(1, { leftMotorSpeed: 75 });
 * editor.deleteInstruction(2);
 * ```
 */
export function useProgram(options: UseProgramOptions): UseProgramResult {
  const { programId, autoLoad = true, compile = false } = options;

  const [program, setProgram] = useState<Program | null>(null);
  const [compiledProgram, setCompiledProgram] = useState<CompiledProgram | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Debounce state
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSaveRef = useRef<Program | null>(null);
  const isSavingRef = useRef(false);

  // Use ref to maintain latest program state for callbacks
  const programRef = useRef<Program | null>(null);
  useEffect(() => {
    programRef.current = program;
  }, [program]);

  /**
   * Debounced save function that ensures data is saved even if unmounting
   */
  const scheduleSave = useCallback(
    (updatedProgram: Program) => {
      // Store pending save
      pendingSaveRef.current = updatedProgram;

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Schedule new save
      saveTimeoutRef.current = setTimeout(() => {
        const programToSave = pendingSaveRef.current;
        if (!programToSave || isSavingRef.current) {
          return;
        }

        isSavingRef.current = true;
        pendingSaveRef.current = null;

        saveProgram(programToSave)
          .then(() => {
            // Recompile if needed
            if (compile) {
              return compileProgramWithReferences(programToSave);
            }
            return null;
          })
          .then((result) => {
            if (result) {
              setCompiledProgram(result.compiled);
              // If names were synced, update the program state and save it
              if (result.syncedProgram) {
                setProgram(result.syncedProgram);
                programRef.current = result.syncedProgram;
                saveProgram(result.syncedProgram).catch((err) => {
                  console.error('Error saving synced program:', err);
                });
              }
            }
          })
          .catch((err) => {
            const errorObj = err instanceof Error ? err : new Error('Failed to save program');
            setError(errorObj);
            console.error('Error saving program:', errorObj);
          })
          .finally(() => {
            isSavingRef.current = false;
          });
      }, 200);
    },
    [compile]
  );

  /**
   * Flush any pending saves immediately
   * Currently unused but kept for potential future use
   */
  // const flushSave = useCallback(async () => {
  //   if (saveTimeoutRef.current) {
  //     clearTimeout(saveTimeoutRef.current);
  //     saveTimeoutRef.current = null;
  //   }

  //   const programToSave = pendingSaveRef.current;
  //   if (!programToSave || isSavingRef.current) {
  //     return;
  //   }

  //   isSavingRef.current = true;
  //   pendingSaveRef.current = null;

  //   try {
  //     await saveProgram(programToSave);

  //     // Recompile if needed
  //     if (compile) {
  //       const result = await compileProgramWithReferences(programToSave);
  //       setCompiledProgram(result.compiled);
  //       // If names were synced, update the program state and save it
  //       if (result.syncedProgram) {
  //         setProgram(result.syncedProgram);
  //         programRef.current = result.syncedProgram;
  //         await saveProgram(result.syncedProgram);
  //       }
  //     }
  //   } catch (err) {
  //     const errorObj = err instanceof Error ? err : new Error('Failed to save program');
  //     setError(errorObj);
  //     console.error('Error saving program:', errorObj);
  //   } finally {
  //     isSavingRef.current = false;
  //   }
  // }, [compile]);

  // Cleanup on unmount - flush any pending saves
  useEffect(() => {
    return () => {
      // Use a promise to handle the async save on unmount
      if (pendingSaveRef.current) {
        const programToSave = pendingSaveRef.current;
        saveProgram(programToSave).catch((err) => {
          console.error('Error saving program on unmount:', err);
        });
      }
    };
  }, []);

  // Load program from storage
  const reload = useCallback(async () => {
    if (!programId) {
      setProgram(null);
      setCompiledProgram(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const loadedProg = await loadProgram(programId);
      if (!loadedProg) {
        setProgram(null);
        setCompiledProgram(null);
        return;
      }

      // Compile if requested
      if (compile) {
        const result = await compileProgramWithReferences(loadedProg);
        setCompiledProgram(result.compiled);

        // If names were synced during compilation, use the synced version
        const finalProgram = result.syncedProgram || loadedProg;
        setProgram(finalProgram);
        programRef.current = finalProgram;

        // Save the synced version if it changed
        if (result.syncedProgram) {
          await saveProgram(result.syncedProgram);
        }
      } else {
        setProgram(loadedProg);
        programRef.current = loadedProg;
        setCompiledProgram(null);
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to load program');
      setError(errorObj);
      console.error('Error loading program:', errorObj);
    } finally {
      setIsLoading(false);
    }
  }, [programId, compile]);

  // Auto-load program when ID changes
  useEffect(() => {
    if (autoLoad) {
      reload();
    }
  }, [autoLoad, reload]);

  /**
   * Helper to update program state and schedule save
   */
  const updateProgramState = useCallback(
    (updater: (prev: Program) => Program) => {
      const currentProgram = programRef.current;
      if (!currentProgram) {
        console.warn('Cannot update program: no program loaded');
        return;
      }

      const updatedProgram = updater(currentProgram);
      setProgram(updatedProgram);
      programRef.current = updatedProgram;
      scheduleSave(updatedProgram);
    },
    [scheduleSave]
  );

  /**
   * Helper to reload subroutine programs when instructions change
   */
  const reloadSubroutinesIfNeeded = useCallback(
    async (oldInstructions: Instruction[], newInstructions: Instruction[]) => {
      if (!compile) return;

      const oldIds = extractReferencedProgramIds(oldInstructions);
      const newIds = extractReferencedProgramIds(newInstructions);

      // Check if referenced programs changed
      const changed =
        oldIds.size !== newIds.size ||
        [...oldIds].some((id) => !newIds.has(id)) ||
        [...newIds].some((id) => !oldIds.has(id));

      if (changed && programRef.current) {
        // Recompile will happen during save
      }
    },
    [compile]
  );

  // Editor API
  const editor: ProgramEditor = {
    rename: useCallback(
      (name: string) => {
        const currentProgram = programRef.current;
        if (!currentProgram) {
          console.warn('Cannot rename program: no program loaded');
          return;
        }

        // Update the program name
        updateProgramState((prev) => ({
          ...prev,
          name,
          lastModified: new Date(),
        }));

        // Update all subroutine references to this program in other programs
        // This runs asynchronously in the background
        updateSubroutineReferences(currentProgram.id, name).catch((error) => {
          console.error('Failed to update subroutine references:', error);
        });
      },
      [updateProgramState]
    ),

    addInstruction: useCallback(
      (instruction: Instruction, position: number) => {
        updateProgramState((prev) => {
          const newInstructions = [...prev.instructions];
          newInstructions.splice(position, 0, instruction);

          reloadSubroutinesIfNeeded(prev.instructions, newInstructions);

          return {
            ...prev,
            instructions: newInstructions,
            instructionCount: newInstructions.length,
            lastModified: new Date(),
          };
        });
      },
      [updateProgramState, reloadSubroutinesIfNeeded]
    ),

    updateInstruction: useCallback(
      (position: number, updates: Partial<Instruction>) => {
        updateProgramState((prev) => {
          const newInstructions = [...prev.instructions];
          if (position < 0 || position >= newInstructions.length) {
            console.warn(`Cannot update instruction: invalid position ${position}`);
            return prev;
          }

          newInstructions[position] = {
            ...newInstructions[position],
            ...updates,
          } as Instruction;

          reloadSubroutinesIfNeeded(prev.instructions, newInstructions);

          return {
            ...prev,
            instructions: newInstructions,
            lastModified: new Date(),
          };
        });
      },
      [updateProgramState, reloadSubroutinesIfNeeded]
    ),

    deleteInstruction: useCallback(
      (position: number) => {
        updateProgramState((prev) => {
          if (position < 0 || position >= prev.instructions.length) {
            console.warn(`Cannot delete instruction: invalid position ${position}`);
            return prev;
          }

          const newInstructions = prev.instructions.filter((_, i) => i !== position);

          reloadSubroutinesIfNeeded(prev.instructions, newInstructions);

          return {
            ...prev,
            instructions: newInstructions,
            instructionCount: newInstructions.length,
            lastModified: new Date(),
          };
        });
      },
      [updateProgramState, reloadSubroutinesIfNeeded]
    ),

    moveInstruction: useCallback(
      (fromPosition: number, toPosition: number) => {
        updateProgramState((prev) => {
          if (
            fromPosition < 0 ||
            fromPosition >= prev.instructions.length ||
            toPosition < 0 ||
            toPosition >= prev.instructions.length
          ) {
            console.warn(
              `Cannot move instruction: invalid positions ${fromPosition} -> ${toPosition}`
            );
            return prev;
          }

          const newInstructions = [...prev.instructions];
          const [movedInstruction] = newInstructions.splice(fromPosition, 1);
          newInstructions.splice(toPosition, 0, movedInstruction);

          return {
            ...prev,
            instructions: newInstructions,
            lastModified: new Date(),
          };
        });
      },
      [updateProgramState]
    ),

    duplicateInstruction: useCallback(
      (position: number) => {
        updateProgramState((prev) => {
          if (position < 0 || position >= prev.instructions.length) {
            console.warn(`Cannot duplicate instruction: invalid position ${position}`);
            return prev;
          }

          const instructionToDuplicate = prev.instructions[position];
          // Create a deep copy with a new ID
          const newInstruction = {
            ...instructionToDuplicate,
            id: `${prev.id}-${Date.now()}`,
            // For repetition instructions, also copy the nested instructions array
            ...(instructionToDuplicate.type === 'repetition'
              ? {
                  instructions: [...instructionToDuplicate.instructions],
                }
              : {}),
          } as Instruction;

          const newInstructions = [...prev.instructions];
          newInstructions.splice(position + 1, 0, newInstruction);

          reloadSubroutinesIfNeeded(prev.instructions, newInstructions);

          return {
            ...prev,
            instructions: newInstructions,
            instructionCount: newInstructions.length,
            lastModified: new Date(),
          };
        });
      },
      [updateProgramState, reloadSubroutinesIfNeeded]
    ),
  };

  return {
    program,
    compiledProgram,
    isLoading,
    error,
    reload,
    editor,
  };
}
