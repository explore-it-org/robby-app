/* eslint-disable */
// @ts-nocheck
/**
 * DEPRECATED - This file is no longer used.
 *
 * Custom hook for managing instruction CRUD operations
 * Extracted from program-detail-content.tsx to reduce complexity
 */

import { ProgramEditor } from '@/hooks/use-program-legacy';
import { Instruction, SubroutineInstruction } from '@/types/instruction';
import { Program } from '@/types/program';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

interface UseInstructionOperationsProps {
  program: Program | null;
  editor: ProgramEditor;
}

export function useInstructionOperations({ program, editor }: UseInstructionOperationsProps) {
  const { t } = useTranslation();

  const [showInstructionPicker, setShowInstructionPicker] = useState(false);
  const insertPositionRef = useRef(0);
  const [expandedInstructionId, setExpandedInstructionId] = useState<string | null>(null);
  const [showProgramPicker, setShowProgramPicker] = useState(false);
  const [programPickerInstructionIndex, setProgramPickerInstructionIndex] = useState<number>(-1);

  // Track pending subroutine creation (waiting for program selection)
  const [pendingSubroutine, setPendingSubroutine] = useState<{
    id: string;
    position: number;
  } | null>(null);

  const handleAddInstruction = useCallback((position: number) => {
    insertPositionRef.current = position;
    setShowInstructionPicker(true);
  }, []);

  const handleAddMove = useCallback(
    (position: number) => {
      if (!program) return;

      const newId = `${program.id}-${Date.now()}`;
      const newInstruction: Instruction = {
        id: newId,
        type: 'move',
        leftMotorSpeed: 50,
        rightMotorSpeed: 50,
      };

      editor.addInstruction(newInstruction, position);
      setExpandedInstructionId(newId); // Auto-expand the new instruction
    },
    [program, editor]
  );

  const handleSelectInstructionType = useCallback(
    (type: 'move' | 'subroutine') => {
      if (!program) return;

      const position = insertPositionRef.current;
      const newId = `${program.id}-${Date.now()}`;

      // For subroutine, show program picker first
      if (type === 'subroutine') {
        setPendingSubroutine({ id: newId, position });
        setProgramPickerInstructionIndex(-1); // -1 indicates new instruction
        setShowProgramPicker(true);
        return;
      }

      // Only move type remains
      const newInstruction: Instruction = {
        id: newId,
        type: 'move',
        leftMotorSpeed: 50,
        rightMotorSpeed: 50,
      };

      editor.addInstruction(newInstruction, position);
      setExpandedInstructionId(newId); // Auto-expand the new instruction
    },
    [program, editor]
  );

  const handleUpdateInstruction = useCallback(
    (index: number, updated: Instruction) => {
      editor.updateInstruction(index, updated);
    },
    [editor]
  );

  const showDeleteConfirmation = useCallback(
    (onConfirm: () => void) => {
      Alert.alert(t('alerts.deleteInstruction.title'), t('alerts.deleteInstruction.message'), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('alerts.deleteInstruction.confirm'),
          style: 'destructive',
          onPress: onConfirm,
        },
      ]);
    },
    [t]
  );

  const handleDeleteInstruction = useCallback(
    (index: number) => {
      showDeleteConfirmation(() => {
        editor.deleteInstruction(index);
      });
    },
    [showDeleteConfirmation, editor]
  );

  const handleMoveInstruction = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;

      try {
        editor.moveInstruction(fromIndex, toIndex);
      } catch (err) {
        console.warn('Failed to move instruction:', err);
      }
    },
    [editor]
  );

  const handleToggleExpand = useCallback((instructionId: string) => {
    setExpandedInstructionId((prev) => (prev === instructionId ? null : instructionId));
  }, []);

  const handleSelectSubroutineProgram = useCallback((index: number) => {
    setProgramPickerInstructionIndex(index);
    setShowProgramPicker(true);
  }, []);

  const handleProgramSelected = useCallback(
    (selectedProgram: Program) => {
      // Case 1: Creating a new subroutine instruction
      if (pendingSubroutine) {
        const newInstruction: SubroutineInstruction = {
          id: pendingSubroutine.id,
          type: 'subroutine',
          programId: selectedProgram.id,
          programName: selectedProgram.name,
        };
        editor.addInstruction(newInstruction, pendingSubroutine.position);
        setExpandedInstructionId(pendingSubroutine.id);
        setPendingSubroutine(null);
        setShowProgramPicker(false);
        return;
      }

      // Case 2: Updating existing subroutine instruction
      if (programPickerInstructionIndex >= 0 && program) {
        const instruction = program.instructions[programPickerInstructionIndex];
        if (instruction?.type === 'subroutine') {
          const updatedInstruction: SubroutineInstruction = {
            ...instruction,
            programId: selectedProgram.id,
            programName: selectedProgram.name,
          };
          editor.updateInstruction(programPickerInstructionIndex, updatedInstruction);
          setShowProgramPicker(false);
        }
      }
    },
    [pendingSubroutine, programPickerInstructionIndex, program, editor]
  );

  return {
    // State (read-only)
    showInstructionPicker,
    expandedInstructionId,
    showProgramPicker,
    programPickerInstructionIndex,

    // Handlers for internal state management
    closeInstructionPicker: () => setShowInstructionPicker(false),
    closeProgramPicker: () => {
      setShowProgramPicker(false);
      setPendingSubroutine(null);
    },

    // Main handlers
    handleAddInstruction,
    handleAddMove,
    handleSelectInstructionType,
    handleUpdateInstruction,
    handleDeleteInstruction,
    showDeleteConfirmation,
    handleMoveInstruction,
    handleToggleExpand,
    handleSelectSubroutineProgram,
    handleProgramSelected,
  };
}
