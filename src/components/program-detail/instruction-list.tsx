/**
 * Instruction List Component
 *
 * Displays and manages a list of instructions with add/edit/delete capabilities.
 * TODO: Add drag-and-drop reordering in future iteration.
 */

import { SPACING } from '@/constants/spacing';
import { CompilationError } from '@/types/compiled-program';
import { Instruction } from '@/types/instruction';
import {
  InstructionOperationCallbacks,
  InstructionUICallbacks,
  SubroutineCallbacks,
} from '@/types/instruction-callbacks';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';
import { AddInstructionButton } from './add-instruction-button';
import { MoveInstructionCard } from './move-instruction-card';
import { SubroutineInstructionCard } from './subroutine-instruction-card';

/**
 * Helper function to find all errors for an instruction (both direct and transitive)
 * Returns errors where this instruction is either the direct cause or a parent instruction
 */
function findAllErrorsForInstruction(
  errors: CompilationError[],
  instructionId: string
): CompilationError[] {
  return errors.filter(
    (e) => e.instructionId === instructionId || e.parentInstructionId === instructionId
  );
}

interface InstructionListProps
  extends InstructionOperationCallbacks, InstructionUICallbacks, SubroutineCallbacks {
  instructions: Instruction[];
  expandedInstructionId: string | null;
  errors?: CompilationError[];
}

export function InstructionList({
  instructions,
  onAddInstruction,
  onAddMove,
  onUpdateInstruction,
  onDeleteInstruction,
  onMoveInstruction,
  onInstructionOptions,
  expandedInstructionId,
  onToggleExpand,
  showDeleteConfirmation,
  errors = [],
  onSelectSubroutineProgram,
  onPreviewSubroutineProgram,
}: InstructionListProps) {
  const renderInstruction = (instruction: Instruction, index: number) => {
    // Find all errors for this instruction (both direct and transitive)
    const instructionErrors = findAllErrorsForInstruction(errors, instruction.id);

    const commonProps = {
      onDelete: () => onDeleteInstruction(index),
      onOptions: () => onInstructionOptions(index),
      isExpanded: expandedInstructionId === instruction.id,
      onToggleExpand: () => onToggleExpand(instruction.id),
      errors: instructionErrors,
    };

    switch (instruction.type) {
      case 'move':
        return (
          <MoveInstructionCard
            key={instruction.id}
            instruction={instruction}
            onUpdate={(updated) => onUpdateInstruction(index, updated)}
            {...commonProps}
          />
        );
      case 'subroutine':
        return (
          <SubroutineInstructionCard
            key={instruction.id}
            instruction={instruction}
            onUpdate={(updated) => onUpdateInstruction(index, updated)}
            onSelectProgram={() => onSelectSubroutineProgram?.(index)}
            onPreviewProgram={() => onPreviewSubroutineProgram?.(index)}
            {...commonProps}
          />
        );
      default:
        return null;
    }
  };

  // Empty state
  if (instructions.length === 0) {
    return (
      <ThemedView style={styles.emptyState}>
        <ThemedText type="title" style={styles.emptyTitle}>
          No Instructions Yet
        </ThemedText>
        <ThemedText style={styles.emptySubtitle}>
          Your program is empty. Add instructions to tell the robot what to do!
        </ThemedText>
        <AddInstructionButton
          onAddMove={() => onAddMove(0)}
          onOpenMenu={() => onAddInstruction(0)}
        />
      </ThemedView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Instructions */}
      {instructions.map((instruction, index) => (
        <View key={instruction.id}>{renderInstruction(instruction, index)}</View>
      ))}

      {/* Prominent Add button at bottom */}
      <View style={styles.bottomAddButtonContainer}>
        <AddInstructionButton
          onAddMove={() => onAddMove(instructions.length)}
          onOpenMenu={() => onAddInstruction(instructions.length)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.LG,
    paddingBottom: SPACING.XXL,
  },
  bottomAddButtonContainer: {
    marginTop: SPACING.LG,
    paddingVertical: SPACING.MD,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.XXXXL,
    gap: SPACING.LG,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
});
