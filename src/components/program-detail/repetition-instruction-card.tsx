/**
 * Repetition Instruction Card Component
 *
 * Card for editing a Repetition instruction with nested instructions.
 * Features color-coded nesting levels (max 3 deep) with visual structure.
 */

import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { CompilationError } from '@/types/compiled-program';
import { Instruction, RepetitionInstruction } from '@/types/instruction';
import { SubroutineCallbacks } from '@/types/instruction-callbacks';
import { findAllErrorsForInstruction, hasNestedError } from '@/utils/instruction-errors';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

// Import other instruction cards
import { InputLabel } from '../ui/input-label';
import { NumberInput } from '../ui/number-input';
import { AddInstructionButton } from './add-instruction-button';
import { BaseInstructionCard } from './base-instruction-card';
import { CommentInstructionCard } from './comment-instruction-card';
import { ErrorListView } from './error-list-view';
import { InstructionOptionsMenu } from './instruction-options-menu';
import { InstructionTypePicker } from './instruction-type-picker';
import { MoveInstructionCard } from './move-instruction-card';
import { SubroutineInstructionCard } from './subroutine-instruction-card';

interface RepetitionInstructionCardProps extends SubroutineCallbacks {
  instruction: RepetitionInstruction;
  onUpdate: (instruction: RepetitionInstruction) => void;
  onDelete: () => void;
  onOptions: () => void;
  nestingLevel?: number; // 1, 2, or 3
  onAddInstruction: (position: number) => void;
  onAddMove: (position: number) => void;
  onUpdateNested: (index: number, updated: Instruction) => void;
  onDeleteNested: (index: number) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  expandedNestedId?: string | null;
  onToggleNestedExpand?: (instructionId: string) => void;
  onConfirmDeleteNested?: (index: number) => void;
  showDeleteConfirmation?: (onConfirm: () => void) => void;
  errors?: CompilationError[];
}

// Level colors based on nesting depth - lighter versions for headers
const LEVEL_HEADER_COLORS = [
  COLORS.CURIOUS_BLUE_LIGHT, // Level 1
  COLORS.CREATIVE_ORANGE_LIGHT, // Level 2
  COLORS.PLAYFUL_PURPLE_LIGHT, // Level 3
];

// Border colors - use the original darker colors
const LEVEL_BORDER_COLORS = [
  COLORS.CURIOUS_BLUE, // Level 1
  COLORS.CREATIVE_ORANGE, // Level 2
  COLORS.PLAYFUL_PURPLE, // Level 3
];

export function RepetitionInstructionCard({
  instruction,
  onUpdate,
  onDelete,
  onOptions,
  nestingLevel = 1,
  onAddInstruction,
  onAddMove,
  onUpdateNested,
  onDeleteNested,
  isExpanded: controlledExpanded,
  onToggleExpand,
  expandedNestedId,
  onToggleNestedExpand,
  onConfirmDeleteNested,
  showDeleteConfirmation,
  errors = [],
  onSelectSubroutineProgram,
  onSelectSubroutineProgramById,
  onPreviewSubroutineProgram,
  onPreviewSubroutineProgramById,
}: RepetitionInstructionCardProps) {
  // Auto-expand if this instruction was just created (has empty instructions array)
  const [internalExpanded, setInternalExpanded] = useState(instruction.instructions.length === 0);
  const [showNestedInstructionPicker, setShowNestedInstructionPicker] = useState(false);
  const [nestedInsertPosition, setNestedInsertPosition] = useState<number>(0);
  const [showNestedOptionsMenu, setShowNestedOptionsMenu] = useState(false);
  const [selectedNestedIndex, setSelectedNestedIndex] = useState<number>(0);

  // Check if any nested instruction has an error (direct or transitive)
  const hasChildError = instruction.instructions.some((nestedInstr) =>
    hasNestedError(nestedInstr, errors)
  );

  // Find all errors for this instruction (both direct and transitive)
  const instructionErrors = findAllErrorsForInstruction(errors, instruction.id);

  // Use controlled state if provided, otherwise use internal state
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const handleToggle = onToggleExpand || (() => setInternalExpanded(!internalExpanded));

  const levelHeaderColor = LEVEL_HEADER_COLORS[nestingLevel - 1] || COLORS.CURIOUS_BLUE_LIGHT;
  const levelBorderColor = LEVEL_BORDER_COLORS[nestingLevel - 1] || COLORS.CURIOUS_BLUE;

  const handleCountChange = (value: number) => {
    onUpdate({ ...instruction, count: value });
  };

  const handleNestedAddInstruction = (position: number) => {
    setNestedInsertPosition(position);
    setShowNestedInstructionPicker(true);
  };

  const handleNestedSelectInstructionType = (
    type: 'move' | 'comment' | 'subroutine' | 'repetition'
  ) => {
    const newId = `${instruction.id}-${Date.now()}`;
    let newInstruction: Instruction;

    switch (type) {
      case 'move':
        newInstruction = {
          id: newId,
          type: 'move',
          leftMotorSpeed: 50,
          rightMotorSpeed: 50,
        };
        break;
      case 'comment':
        newInstruction = {
          id: newId,
          type: 'comment',
          text: '',
        };
        break;
      case 'subroutine':
        newInstruction = {
          id: newId,
          type: 'subroutine',
          programId: '',
        };
        break;
      case 'repetition':
        newInstruction = {
          id: newId,
          type: 'repetition',
          count: 2,
          instructions: [],
        };
        break;
    }

    const newInstructions = [...instruction.instructions];
    newInstructions.splice(nestedInsertPosition, 0, newInstruction);
    onUpdate({ ...instruction, instructions: newInstructions });
    setShowNestedInstructionPicker(false);

    // Auto-expand the newly created instruction
    if (onToggleNestedExpand) {
      onToggleNestedExpand(newId);
    }

    // For subroutines, automatically open the program picker
    if (type === 'subroutine' && onSelectSubroutineProgramById) {
      // Use setTimeout to ensure the instruction is rendered before opening the picker
      setTimeout(() => {
        onSelectSubroutineProgramById(newId);
      }, 100);
    }
  };

  const handleNestedInstructionOptions = (index: number) => {
    setSelectedNestedIndex(index);
    setShowNestedOptionsMenu(true);
  };

  const handleNestedMoveInstruction = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    const newInstructions = [...instruction.instructions];
    const [movedInstruction] = newInstructions.splice(fromIndex, 1);
    newInstructions.splice(toIndex, 0, movedInstruction);

    onUpdate({ ...instruction, instructions: newInstructions });
  };

  const handleNestedAddBefore = () => {
    setNestedInsertPosition(selectedNestedIndex);
    setShowNestedInstructionPicker(true);
  };

  const handleNestedAddAfter = () => {
    setNestedInsertPosition(selectedNestedIndex + 1);
    setShowNestedInstructionPicker(true);
  };

  const handleNestedMoveUp = () => {
    if (selectedNestedIndex > 0) {
      handleNestedMoveInstruction(selectedNestedIndex, selectedNestedIndex - 1);
    }
  };

  const handleNestedMoveDown = () => {
    if (selectedNestedIndex < instruction.instructions.length - 1) {
      handleNestedMoveInstruction(selectedNestedIndex, selectedNestedIndex + 1);
    }
  };

  const handleNestedDeleteFromMenu = () => {
    if (onConfirmDeleteNested) {
      onConfirmDeleteNested(selectedNestedIndex);
    } else {
      onDeleteNested(selectedNestedIndex);
    }
  };

  const renderNestedInstruction = (nestedInstruction: Instruction, index: number) => {
    // Find all errors for this nested instruction (both direct and transitive)
    const nestedErrors = findAllErrorsForInstruction(errors, nestedInstruction.id);

    const commonProps = {
      onDelete: onConfirmDeleteNested
        ? () => onConfirmDeleteNested(index)
        : () => onDeleteNested(index),
      onOptions: () => handleNestedInstructionOptions(index),
      isExpanded: expandedNestedId === nestedInstruction.id,
      onToggleExpand: onToggleNestedExpand
        ? () => onToggleNestedExpand(nestedInstruction.id)
        : undefined,
      errors: nestedErrors,
    };

    switch (nestedInstruction.type) {
      case 'move':
        return (
          <MoveInstructionCard
            key={nestedInstruction.id}
            instruction={nestedInstruction}
            onUpdate={(updated) => onUpdateNested(index, updated)}
            {...commonProps}
          />
        );
      case 'comment':
        return (
          <CommentInstructionCard
            key={nestedInstruction.id}
            instruction={nestedInstruction}
            onUpdate={(updated) => onUpdateNested(index, updated)}
            {...commonProps}
          />
        );
      case 'subroutine':
        return (
          <SubroutineInstructionCard
            key={nestedInstruction.id}
            instruction={nestedInstruction}
            onUpdate={(updated) => onUpdateNested(index, updated)}
            onSelectProgram={() => onSelectSubroutineProgramById?.(nestedInstruction.id)}
            onPreviewProgram={() => onPreviewSubroutineProgramById?.(nestedInstruction.id)}
            {...commonProps}
          />
        );
      case 'repetition':
        // Nested repetition - increment nesting level
        if (nestingLevel < 3) {
          return (
            <RepetitionInstructionCard
              key={nestedInstruction.id}
              instruction={nestedInstruction}
              onUpdate={(updated) => onUpdateNested(index, updated)}
              onDelete={commonProps.onDelete}
              onOptions={commonProps.onOptions}
              // Nested repetitions manage their own expansion state internally
              nestingLevel={nestingLevel + 1}
              onAddInstruction={(pos) => {
                // This is not used - nested repetitions use their own handleNestedAddInstruction
                console.warn(
                  'onAddInstruction called on nested repetition - should use own picker'
                );
              }}
              onAddMove={(pos) => {
                // Add move instruction inside nested repetition
                const newId = `${nestedInstruction.id}-${Date.now()}`;
                const newInstruction: Instruction = {
                  id: newId,
                  type: 'move',
                  leftMotorSpeed: 50,
                  rightMotorSpeed: 50,
                };
                const updatedInstructions = [...nestedInstruction.instructions];
                updatedInstructions.splice(pos, 0, newInstruction);
                onUpdateNested(index, {
                  ...nestedInstruction,
                  instructions: updatedInstructions,
                });
                // Auto-expand the newly created instruction
                if (onToggleNestedExpand) {
                  onToggleNestedExpand(newId);
                }
              }}
              onUpdateNested={(i, upd) => {
                // Update deeply nested instruction
                const updatedInstructions = [...nestedInstruction.instructions];
                updatedInstructions[i] = upd;
                onUpdateNested(index, {
                  ...nestedInstruction,
                  instructions: updatedInstructions,
                });
              }}
              onDeleteNested={(i) => {
                // Delete deeply nested instruction
                const updatedInstructions = nestedInstruction.instructions.filter(
                  (_, idx) => idx !== i
                );
                onUpdateNested(index, {
                  ...nestedInstruction,
                  instructions: updatedInstructions,
                });
              }}
              onConfirmDeleteNested={
                showDeleteConfirmation
                  ? (i) => {
                      // Show confirmation before deleting deeply nested instruction
                      showDeleteConfirmation(() => {
                        const updatedInstructions = nestedInstruction.instructions.filter(
                          (_, idx) => idx !== i
                        );
                        onUpdateNested(index, {
                          ...nestedInstruction,
                          instructions: updatedInstructions,
                        });
                      });
                    }
                  : undefined
              }
              showDeleteConfirmation={showDeleteConfirmation}
              expandedNestedId={expandedNestedId}
              onToggleNestedExpand={onToggleNestedExpand}
              errors={errors}
              onSelectSubroutineProgram={onSelectSubroutineProgram}
              onSelectSubroutineProgramById={onSelectSubroutineProgramById}
              onPreviewSubroutineProgram={onPreviewSubroutineProgram}
              onPreviewSubroutineProgramById={onPreviewSubroutineProgramById}
            />
          );
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <>
      <BaseInstructionCard
        icon="🔁"
        title={`Repeat ${instruction.count}x${!isExpanded ? ` (${instruction.instructions.length} instructions)` : ''}`}
        backgroundColor={levelHeaderColor}
        borderColor={levelBorderColor}
        contentBackgroundColor={COLORS.BEIGE_SOFT}
        contentPaddingHorizontal={SPACING.SM}
        hasErrors={instructionErrors.length > 0 || hasChildError}
        onOptions={onOptions}
        isExpanded={isExpanded}
        onToggleExpand={handleToggle}
      >
        {/* Error Messages */}
        <ErrorListView errors={instructionErrors} instructionId={instruction.id} />

        {/* Repetition Count Editor - shown when expanded for better discoverability */}
        <View style={styles.countEditorSection}>
          <InputLabel text="Repetitions" alignment="left" />
          <NumberInput
            value={instruction.count}
            onValueChange={handleCountChange}
            min={1}
            max={100}
            borderColor={levelBorderColor}
            containerStyle={styles.countEditorContainer}
          />
        </View>

        <View style={styles.nestedArea}>
          {/* Nested Instructions */}
          {instruction.instructions.map((nested, index) => (
            <View key={nested.id}>{renderNestedInstruction(nested, index)}</View>
          ))}

          {/* Prominent Add button at bottom */}
          <View style={styles.nestedBottomAddButtonContainer}>
            <AddInstructionButton
              onAddMove={() => onAddMove(instruction.instructions.length)}
              onOpenMenu={() => handleNestedAddInstruction(instruction.instructions.length)}
            />
          </View>
        </View>
      </BaseInstructionCard>

      {/* Nested Instruction Type Picker */}
      <InstructionTypePicker
        visible={showNestedInstructionPicker}
        onClose={() => setShowNestedInstructionPicker(false)}
        onSelectType={handleNestedSelectInstructionType}
        maxNestingReached={nestingLevel >= 3}
      />

      {/* Nested Instruction Options Menu */}
      <InstructionOptionsMenu
        visible={showNestedOptionsMenu}
        onClose={() => setShowNestedOptionsMenu(false)}
        onAddBefore={handleNestedAddBefore}
        onAddAfter={handleNestedAddAfter}
        onMoveUp={handleNestedMoveUp}
        onMoveDown={handleNestedMoveDown}
        onDelete={handleNestedDeleteFromMenu}
        canMoveUp={selectedNestedIndex > 0}
        canMoveDown={selectedNestedIndex < instruction.instructions.length - 1}
      />
    </>
  );
}

const styles = StyleSheet.create({
  countEditorSection: {
    marginLeft: 0, // Align with nested area
    marginRight: -SPACING.SM, // Extend to right edge
    paddingLeft: SPACING.SM, // Match nested area indent
    paddingRight: SPACING.MD,
    paddingVertical: SPACING.SM,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    gap: SPACING.SM, // Add gap between label and input
  },
  countEditorContainer: {
    alignSelf: 'flex-start',
  },
  nestedArea: {
    paddingLeft: SPACING.SM, // Indent for nested instructions
    paddingRight: 0,
  },
  nestedBottomAddButtonContainer: {
    marginTop: SPACING.SM,
    paddingVertical: SPACING.XS,
  },
  emptyState: {
    padding: SPACING.LG,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
