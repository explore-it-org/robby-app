import { CompiledProgram } from '@/programs/program';
import { ProgramSource } from '@/programs/source';
import { Statement } from '@/programs/statements';

export type UseProgramHook = EditableProgram | ProgramLoading | ProgramNotFound;

export interface ProgramEditor {
  renameProgram(newName: string): void;
  deleteProgram(): void;

  addStatement(statement: Statement, index: number): void;
  replaceStatement(index: number, statement: Statement): void;
  deleteStatement(index: number): void;
  moveStatementUp(index: number): void;
  moveStatementDown(index: number): void;
}

export interface EditableProgram {
  source: ProgramSource;
  compiled: CompiledProgram;
  editor: ProgramEditor;
}

export type ProgramLoading = 'loading';
export type ProgramNotFound = 'not-found';

export function useProgram(name: string): UseProgramHook {
  // TODO
  //
  // Should load the program by name from the program store.
  // If the program is found, it should return the compiled program and an editor.
  // If the program is still loading, it should return 'loading'.
  // If the program is not found, it should return 'not-found'.
  // The program should be memoized to avoid unnecessary reloads and recompilations.
  //
  // The editor should provide methods to modify the program, which should update the program store accordingly.
  // All operations in the editor return immediately and optimistically update the program state in the UI.
  // Saves are writen in a background queue.

  throw new Error('Not implemented');
}
