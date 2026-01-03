/**
 * Custom hook for managing statement CRUD operations (NEW FORMAT)
 * Extracted from program-detail-content.tsx to reduce complexity
 * 
 * MIGRATED to work with flat Statement arrays (no nesting, no IDs)
 */

import { Statement, MoveStatement, SubroutineStatement } from '@/programs/statements';
import { ProgramSource } from '@/programs/source';
import { ProgramEditor } from '@/hooks/use-program';
import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

interface UseStatementOperationsProps {
  source: ProgramSource | null;
  editor: ProgramEditor;
}

/**
 * Hook for managing statement operations in the new flat format
 */
export function useStatementOperations({ source, editor }: UseStatementOperationsProps) {
  const { t } = useTranslation();

  const [showStatementPicker, setShowStatementPicker] = useState(false);
  const insertPositionRef = useRef(0);
  const [expandedStatementIndex, setExpandedStatementIndex] = useState<number | null>(null);
  const [showProgramPicker, setShowProgramPicker] = useState(false);
  const [programPickerStatementIndex, setProgramPickerStatementIndex] = useState<number>(-1);

  // Track pending subroutine creation (waiting for program selection)
  const [pendingSubroutine, setPendingSubroutine] = useState<{
    position: number;
  } | null>(null);

  const handleAddStatement = useCallback((position: number) => {
    insertPositionRef.current = position;
    setShowStatementPicker(true);
  }, []);

  const handleAddMove = useCallback(
    (position: number) => {
      if (!source) return;

      const newStatement: MoveStatement = {
        type: 'move',
        leftMotorSpeed: 50,
        rightMotorSpeed: 50,
        repetitions: 1, // Fixed at 1 for initial migration
      };

      editor.addStatement(newStatement, position);
      setExpandedStatementIndex(position); // Auto-expand the new statement
    },
    [source, editor]
  );

  const handleSelectStatementType = useCallback(
    (type: 'move' | 'subroutine') => {
  const handleSelectStatementType = useCallback(
    (type: 'move' | 'subroutine') => {
      if (!source) return;

      const position = insertPositionRef.current;

      // For subroutine, show program picker first
      if (type === 'subroutine') {
        setPendingSubroutine({ position });
        setProgramPickerStatementIndex(-1); // -1 indicates new statement
        setShowProgramPicker(true);
        return;
      }

      // For move, create statement directly
      if (type === 'move') {
        const newStatement: MoveStatement = {
          type: 'move',
          leftMotorSpeed: 50,
          rightMotorSpeed: 50,
          repetitions: 1, // Fixed at 1 for initial migration
        };
        editor.addStatement(newStatement, position);
        setExpandedStatementIndex(position); // Auto-expand the new statement
      }
    },
    [source, editor]
  );

  const handleUpdateStatement = useCallback(
    (index: number, updated: Statement) => {
      editor.updateStatement(index, updated);
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

  const handleDeleteStatement = useCallback(
    (index: number) => {
      showDeleteConfirmation(() => {
        editor.deleteStatement(index);
      });
    },
    [showDeleteConfirmation, editor]
  );

  const handleMoveStatement = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;

      try {
        editor.moveStatement(fromIndex, toIndex);
      } catch (err) {
        console.warn('Failed to move statement:', err);
      }
    },
    [editor]
  );

  const handleToggleExpand = useCallback((statementIndex: number) => {
    setExpandedStatementIndex((prev) => (prev === statementIndex ? null : statementIndex));
  }, []);

  const handleSelectSubroutineProgram = useCallback((index: number) => {
    setProgramPickerStatementIndex(index);
    setShowProgramPicker(true);
  }, []);

  const handleProgramSelected = useCallback(
    (selectedProgramName: string) => {
      // Case 1: Creating a new subroutine statement
      if (pendingSubroutine) {
        const newStatement: SubroutineStatement = {
          type: 'subroutine',
          programReference: selectedProgramName, // Name-based reference
          repetitions: 1, // Fixed at 1 for initial migration
        };
        editor.addStatement(newStatement, pendingSubroutine.position);
        setExpandedStatementIndex(pendingSubroutine.position);
        setPendingSubroutine(null);
        setShowProgramPicker(false);
        return;
      }

      // Case 2: Updating an existing statement by index
      if (programPickerStatementIndex >= 0 && source) {
        const statement = source.statements[programPickerStatementIndex];
        if (statement?.type === 'subroutine') {
          const updatedStatement: SubroutineStatement = {
            ...statement,
            programReference: selectedProgramName, // Update to new name
          };
          editor.updateStatement(programPickerStatementIndex, updatedStatement);
          setShowProgramPicker(false);
        }
      }
    },
    [pendingSubroutine, programPickerStatementIndex, source, editor]
  );

  return {
    // State (read-only)
    showStatementPicker,
    expandedStatementIndex,
    showProgramPicker,
    programPickerStatementIndex,

    // Handlers for internal state management
    closeStatementPicker: () => setShowStatementPicker(false),
    closeProgramPicker: () => {
      setShowProgramPicker(false);
      setPendingSubroutine(null);
    },

    // Main handlers
    handleAddStatement,
    handleAddMove,
    handleSelectStatementType,
    handleUpdateStatement,
    handleDeleteStatement,
    showDeleteConfirmation,
    handleMoveStatement,
    handleToggleExpand,
    handleSelectSubroutineProgram,
    handleProgramSelected,
  };
}
