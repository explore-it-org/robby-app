/**
 * useProgram Hook
 *
 * A custom hook that provides a simple way to load and update a program.
 * Handles loading state, error handling, program updates, and compilation.
 * 
 * MIGRATED to use new ProgramSource format with flat Statement arrays.
 */

import { compile } from '@/programs/compiler';
import { Program, CompiledProgram, FaultyProgram } from '@/programs/program';
import { loadProgramSource, saveProgramSource, ProgramSource } from '@/programs/source';
import { Statement, MoveStatement, SubroutineStatement } from '@/programs/statements';
import { updateSubroutineReferences } from '@/services/subroutine-reference-updater';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseProgramOptions {
  /**
   * The name of the program to load (name-based lookup in new format)
   */
  programName: string | undefined;

  /**
   * Whether to automatically reload the program when the name changes
   * @default true
   */
  autoLoad?: boolean;

  /**
   * Whether to compile the program with referenced programs
   * @default true (changed default - new compiler is fast and always validates)
   */
  compile?: boolean;
}

/**
 * Editor API for making specific edits to a program (NEW FORMAT - flat statements)
 */
export interface ProgramEditor {
  /**
   * Renames the program
   */
  rename: (name: string) => void;

  /**
   * Adds a new statement at the specified position (repetitions fixed at 1)
   */
  addStatement: (statement: Statement, position: number) => void;

  /**
   * Updates an existing statement at the specified position
   */
  updateStatement: (position: number, updates: Partial<Statement>) => void;

  /**
   * Deletes a statement at the specified position
   */
  deleteStatement: (position: number) => void;

  /**
   * Moves a statement from one position to another
   */
  moveStatement: (fromPosition: number, toPosition: number) => void;

  /**
   * Duplicates a statement at the specified position
   */
  duplicateStatement: (position: number) => void;
}

interface UseProgramResult {
  /**
   * The loaded program source, or null if not loaded or not found
   */
  source: ProgramSource | null;

  /**
   * The compiled program (CompiledProgram or FaultyProgram)
   */
  compiledProgram: Program | null;

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
 * Custom hook to load and manage a program with an editor API (NEW FORMAT)
 *
 * @example
 * ```tsx
 * // Simple usage
 * const { source, isLoading, editor } = useProgram({ programName: name });
 *
 * // With compilation
 * const { compiledProgram, isLoading, editor } = useProgram({
 *   programName: name,
 *   compile: true
 * });
 *
 * // Use editor API with flat statements (repetitions always 1)
 * editor.rename('New Name');
 * editor.addStatement({ type: 'move', leftMotorSpeed: 75, rightMotorSpeed: 75, repetitions: 1 }, 0);
 * editor.updateStatement(1, { leftMotorSpeed: 85 });
 * editor.deleteStatement(2);
 * ```
 */
export function useProgram(options: UseProgramOptions): UseProgramResult {
  const { programName, autoLoad = true, compile: shouldCompile = true } = options;

  const [source, setSource] = useState<ProgramSource | null>(null);
  const [compiledProgram, setCompiledProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Debounce state
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSaveRef = useRef<ProgramSource | null>(null);
  const isSavingRef = useRef(false);

  // Use ref to maintain latest program state for callbacks
  const sourceRef = useRef<ProgramSource | null>(null);
  useEffect(() => {
    sourceRef.current = source;
  }, [source]);

  /**
   * Debounced save function that ensures data is saved even if unmounting
   */
  const scheduleSave = useCallback(
    (updatedSource: ProgramSource) => {
      // Store pending save
      pendingSaveRef.current = updatedSource;

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Schedule new save
      saveTimeoutRef.current = setTimeout(() => {
        const sourceToSave = pendingSaveRef.current;
        if (!sourceToSave || isSavingRef.current) {
          return;
        }

        isSavingRef.current = true;
        pendingSaveRef.current = null;

        saveProgramSource(sourceToSave)
          .then((success) => {
            if (!success) {
              throw new Error('Failed to save program source');
            }
            // Recompile if needed
            if (shouldCompile) {
              return compile(sourceToSave);
            }
            return null;
          })
          .then((compiled) => {
            if (compiled) {
              setCompiledProgram(compiled);
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
    [shouldCompile]
  );

  // Cleanup on unmount - flush any pending saves
  useEffect(() => {
    return () => {
      // Use a promise to handle the async save on unmount
      if (pendingSaveRef.current) {
        const sourceToSave = pendingSaveRef.current;
        saveProgramSource(sourceToSave).catch((err) => {
          console.error('Error saving program on unmount:', err);
        });
      }
    };
  }, []);

  // Load program from storage
  const reload = useCallback(async () => {
    if (!programName) {
      setSource(null);
      setCompiledProgram(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const loadedSource = await loadProgramSource(programName);
      if (!loadedSource) {
        setSource(null);
        setCompiledProgram(null);
        return;
      }

      setSource(loadedSource);
      sourceRef.current = loadedSource;

      // Compile if requested
      if (shouldCompile) {
        const compiled = await compile(loadedSource);
        setCompiledProgram(compiled);
      } else {
        setCompiledProgram(null);
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to load program');
      setError(errorObj);
      console.error('Error loading program:', errorObj);
    } finally {
      setIsLoading(false);
    }
  }, [programName, shouldCompile]);

  // Auto-load program when name changes
  useEffect(() => {
    if (autoLoad) {
      reload();
    }
  }, [autoLoad, reload]);

  /**
   * Helper to update program state and schedule save
   */
  const updateSourceState = useCallback(
    (updater: (prev: ProgramSource) => ProgramSource) => {
      const currentSource = sourceRef.current;
      if (!currentSource) {
        console.warn('Cannot update program: no program loaded');
        return;
      }

      const updatedSource = updater(currentSource);
      setSource(updatedSource);
      sourceRef.current = updatedSource;
      scheduleSave(updatedSource);
    },
    [scheduleSave]
  );

  // Editor API - now works with flat Statement arrays
  const editor: ProgramEditor = {
    rename: useCallback(
      (name: string) => {
        const currentSource = sourceRef.current;
        if (!currentSource) {
          console.warn('Cannot rename program: no program loaded');
          return;
        }

        const oldName = currentSource.name;

        // Update the program name
        updateSourceState((prev) => ({
          ...prev,
          name,
        }));

        // Update all subroutine references to this program in other programs
        // This runs asynchronously in the background
        updateSubroutineReferences(oldName, name).catch((error) => {
          console.error('Failed to update subroutine references:', error);
        });
      },
      [updateSourceState]
    ),

    addStatement: useCallback(
      (statement: Statement, position: number) => {
        updateSourceState((prev) => {
          const newStatements = [...prev.statements];
          newStatements.splice(position, 0, statement);

          return {
            ...prev,
            statements: newStatements,
          };
        });
      },
      [updateSourceState]
    ),

    updateStatement: useCallback(
      (position: number, updates: Partial<Statement>) => {
        updateSourceState((prev) => {
          const newStatements = [...prev.statements];
          if (position < 0 || position >= newStatements.length) {
            console.warn(`Cannot update statement: invalid position ${position}`);
            return prev;
          }

          newStatements[position] = {
            ...newStatements[position],
            ...updates,
          } as Statement;

          return {
            ...prev,
            statements: newStatements,
          };
        });
      },
      [updateSourceState]
    ),

    deleteStatement: useCallback(
      (position: number) => {
        updateSourceState((prev) => {
          if (position < 0 || position >= prev.statements.length) {
            console.warn(`Cannot delete statement: invalid position ${position}`);
            return prev;
          }

          const newStatements = prev.statements.filter((_, i) => i !== position);

          return {
            ...prev,
            statements: newStatements,
          };
        });
      },
      [updateSourceState]
    ),

    moveStatement: useCallback(
      (fromPosition: number, toPosition: number) => {
        updateSourceState((prev) => {
          if (
            fromPosition < 0 ||
            fromPosition >= prev.statements.length ||
            toPosition < 0 ||
            toPosition >= prev.statements.length
          ) {
            console.warn(
              `Cannot move statement: invalid positions ${fromPosition} -> ${toPosition}`
            );
            return prev;
          }

          const newStatements = [...prev.statements];
          const [movedStatement] = newStatements.splice(fromPosition, 1);
          newStatements.splice(toPosition, 0, movedStatement);

          return {
            ...prev,
            statements: newStatements,
          };
        });
      },
      [updateSourceState]
    ),

    duplicateStatement: useCallback(
      (position: number) => {
        updateSourceState((prev) => {
          if (position < 0 || position >= prev.statements.length) {
            console.warn(`Cannot duplicate statement: invalid position ${position}`);
            return prev;
          }

          const statementToDuplicate = prev.statements[position];
          // Create a deep copy (statements don't have IDs, so simpler than old format)
          const newStatement = { ...statementToDuplicate };

          const newStatements = [...prev.statements];
          newStatements.splice(position + 1, 0, newStatement);

          return {
            ...prev,
            statements: newStatements,
          };
        });
      },
      [updateSourceState]
    ),
  };

  return {
    source,
    compiledProgram,
    isLoading,
    error,
    reload,
    editor,
  };
}
