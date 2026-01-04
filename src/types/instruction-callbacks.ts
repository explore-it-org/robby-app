/**
 * Instruction Callbacks Type Definitions
 *
 * Shared callback interfaces for instruction operations across components.
 * These interfaces group related callbacks to reduce prop drilling and improve maintainability.
 */

/**
 * Callbacks for subroutine instruction operations
 */
export interface SubroutineCallbacks {
  /**
   * Select a program for a subroutine instruction
   */
  onSelectSubroutineProgram?: (index: number) => void;

  /**
   * Preview/navigate to a subroutine program
   */
  onPreviewSubroutineProgram?: (index: number) => void;
}

/**
 * Callbacks for instruction CRUD operations
 */
export interface InstructionOperationCallbacks {
  /**
   * Add a new instruction at the specified position
   */
  onAddInstruction: (position: number) => void;

  /**
   * Add a move instruction at the specified position (quick action)
   */
  onAddMove: (position: number) => void;

  /**
   * Update an instruction at the specified index
   */
  onUpdateInstruction: (index: number, instruction: any) => void;

  /**
   * Delete an instruction at the specified index
   */
  onDeleteInstruction: (index: number) => void;

  /**
   * Move an instruction from one position to another
   */
  onMoveInstruction: (fromIndex: number, toIndex: number) => void;

  /**
   * Show options menu for an instruction
   */
  onInstructionOptions: (index: number) => void;
}

/**
 * Callbacks for instruction UI state management
 */
export interface InstructionUICallbacks {
  /**
   * Toggle expand/collapse state for an instruction
   */
  onToggleExpand: (instructionId: string) => void;

  /**
   * Show delete confirmation dialog before deleting
   */
  showDeleteConfirmation?: (onConfirm: () => void) => void;
}
