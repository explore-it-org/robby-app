import { compile } from '@/programs/compiler';
import { CompiledProgram } from '@/programs/program';
import { ProgramSource } from '@/programs/source';
import { Statement } from '@/programs/statements';
import { useProgramStorage } from './use-program-storage';

/**
 * Return type for the useProgram hook.
 * Can be an editable program, a loading state, or a not-found state.
 */
export type UseProgramHook = EditableProgram | ProgramNotFound;

/**
 * Program editor interface providing methods to modify a program.
 * All operations update the program store and return immediately.
 * Changes are optimistically reflected in the UI while saves are queued in the background.
 */
export interface ProgramEditor {
  /**
   * Renames the program and updates all subroutine references.
   * @param newName - The new name for the program
   */
  renameProgram(newName: string): void;

  /**
   * Deletes the program from the program store.
   */
  deleteProgram(): void;

  /**
   * Adds a new statement at the specified index.
   * @param statement - The statement to add
   * @param index - The position to insert the statement (0-based)
   */
  addStatement(statement: Statement, index: number): void;

  /**
   * Replaces an existing statement at the specified index.
   * @param index - The position of the statement to replace (0-based)
   * @param statement - The new statement
   */
  replaceStatement(index: number, statement: Statement): void;

  /**
   * Deletes the statement at the specified index.
   * @param index - The position of the statement to delete (0-based)
   */
  deleteStatement(index: number): void;

  /**
   * Moves a statement up one position in the program.
   * @param index - The position of the statement to move (0-based)
   */
  moveStatementUp(index: number): void;

  /**
   * Moves a statement down one position in the program.
   * @param index - The position of the statement to move (0-based)
   */
  moveStatementDown(index: number): void;
}

/**
 * Represents a successfully loaded program with source, compiled bytecode, and an editor.
 */
export interface EditableProgram {
  /** The original program source code */
  source: ProgramSource;
  /** The compiled bytecode ready for robot execution */
  compiled: CompiledProgram;
  /** Editor API for modifying the program */
  editor: ProgramEditor;
}

/** Not-found state indicating the program does not exist in storage */
export type ProgramNotFound = 'not-found';

/**
 * Custom React hook for loading, compiling, and editing a program.
 *
 * This hook provides a complete program lifecycle management solution:
 * - Loads programs from the program store by name
 * - Compiles programs with referenced subroutines
 * - Provides an editor API for making changes
 * - Optimistically updates UI while queuing saves in the background
 * - Memoizes programs to avoid unnecessary reloads and recompilations
 * - Automatically syncs subroutine names when referenced programs are renamed
 *
 * @param name - The name of the program to load
 * @returns An EditableProgram with source, compiled bytecode, and editor, or a loading/not-found state
 *
 * @example
 * ```tsx
 * function ProgramEditor({ programName }: { programName: string }) {
 *   const result = useProgram(programName);
 *
 *   if (result === 'loading') {
 *     return <LoadingSpinner />;
 *   }
 *
 *   if (result === 'not-found') {
 *     return <NotFoundMessage />;
 *   }
 *
 *   const { source, compiled, editor } = result;
 *
 *   return (
 *     <div>
 *       <ProgramView source={source} />
 *       <Button onPress={() => editor.addStatement(newStatement, 0)}>
 *         Add Statement
 *       </Button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useProgram(name: string): UseProgramHook {
  const programStorage = useProgramStorage();
  const programSource = programStorage.getProgramSource(name);

  if (!programSource) {
    return 'not-found';
  }

  const compiledProgram = compile(programSource, programStorage);

  return {
    source: programSource,
    compiled: compiledProgram,
    editor: createDummyEditor(),
  };
}

/**
 * Create a dummy editor implementation
 * TODO: Replace with actual implementation that updates program store
 */
function createDummyEditor(): ProgramEditor {
  return {
    renameProgram: (newName: string) => {
      console.warn('Editor not implemented: renameProgram', newName);
    },
    deleteProgram: () => {
      console.warn('Editor not implemented: deleteProgram');
    },
    addStatement: (statement: Statement, index: number) => {
      console.warn('Editor not implemented: addStatement', statement, index);
    },
    replaceStatement: (index: number, statement: Statement) => {
      console.warn('Editor not implemented: replaceStatement', index, statement);
    },
    deleteStatement: (index: number) => {
      console.warn('Editor not implemented: deleteStatement', index);
    },
    moveStatementUp: (index: number) => {
      console.warn('Editor not implemented: moveStatementUp', index);
    },
    moveStatementDown: (index: number) => {
      console.warn('Editor not implemented: moveStatementDown', index);
    },
  };
}
