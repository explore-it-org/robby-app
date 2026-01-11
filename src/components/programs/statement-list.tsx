import { EditableProgram } from '@/hooks/use-program';
import { StyleSheet, View, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useCallback, useState } from 'react';
import { MoveStatementItem, SubroutineStatementItem } from './statement-list-item';
import { MultiOptionButton } from '@/components/ui/multi-option-button';
import { StatementTypePicker } from './statement-type-picker';
import { ProgramPickerModal } from './program-picker-modal';
import { createMoveStatement, createSubroutineStatement, Statement } from '@/programs/statements';
import { useProgramStorage } from '@/hooks/use-program-storage';
import { router } from 'expo-router';

interface Props {
  program: EditableProgram;
}

export function StatementList({ program }: Props) {
  const { t } = useTranslation();
  const statements = program.source.statements;
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showProgramPicker, setShowProgramPicker] = useState(false);
  const [editingSubroutineIndex, setEditingSubroutineIndex] = useState<number | null>(null);
  const [insertAtIndex, setInsertAtIndex] = useState<number | null>(null);
  const programStorage = useProgramStorage();

  // Get compilation errors if program is faulty
  const errors = program.compiled.type === 'faulty' ? program.compiled.errors : [];

  // Helper to check if a statement at a given index has errors
  const hasErrorAtIndex = (index: number): boolean => {
    return errors.some((error) => {
      if (error.type === 'complexity') {
        return false; // Complexity errors are program-level, not statement-level
      }
      return error.statementIndex === index;
    });
  };

  // Get all available programs except the current one
  const availablePrograms = programStorage.availablePrograms.filter(
    (p) => p.name !== program.source.name
  );

  const handleAddMove = useCallback(() => {
    const targetIndex = insertAtIndex !== null ? insertAtIndex : statements.length;
    program.editor.addStatement(createMoveStatement(), targetIndex);
    setInsertAtIndex(null);
  }, [program.editor, statements.length, insertAtIndex]);

  const handleAddSubroutine = useCallback(() => {
    setEditingSubroutineIndex(null);
    setShowProgramPicker(true);
  }, []);

  const handleSelectProgram = useCallback(
    (programName: string) => {
      if (editingSubroutineIndex !== null) {
        // Editing existing subroutine
        const statement = statements[editingSubroutineIndex];
        if (statement.type === 'subroutine') {
          program.editor.replaceStatement(editingSubroutineIndex, {
            ...statement,
            programReference: programName,
          });
        }
      } else {
        // Adding new subroutine
        const targetIndex = insertAtIndex !== null ? insertAtIndex : statements.length;
        program.editor.addStatement(createSubroutineStatement(programName), targetIndex);
        setInsertAtIndex(null);
      }
      setShowProgramPicker(false);
      setEditingSubroutineIndex(null);
    },
    [program.editor, statements, editingSubroutineIndex, insertAtIndex]
  );

  const handleEditSubroutine = useCallback((index: number) => {
    setEditingSubroutineIndex(index);
    setShowProgramPicker(true);
  }, []);

  const handleOpenProgram = useCallback((programName: string) => {
    router.push(`/program-edit?name=${encodeURIComponent(programName)}`);
  }, []);

  const handleOpenStatementPicker = useCallback(() => {
    setShowTypePicker(true);
  }, []);

  const handleCloseTypePicker = useCallback(() => {
    setShowTypePicker(false);
  }, []);

  const handleCloseProgramPicker = useCallback(() => {
    setShowProgramPicker(false);
  }, []);

  const handleChangeStatement = useCallback(
    (index: number, updatedStatement: Statement) => {
      program.editor.replaceStatement(index, updatedStatement);
    },
    [program.editor]
  );

  const handleDeleteStatement = useCallback(
    (index: number) => {
      Alert.alert(
        t('statementOptionsMenu.deleteConfirmTitle'),
        t('statementOptionsMenu.deleteConfirmMessage'),
        [
          {
            text: t('common.cancel'),
            style: 'cancel',
          },
          {
            text: t('statementOptionsMenu.delete'),
            style: 'destructive',
            onPress: () => program.editor.deleteStatement(index),
          },
        ]
      );
    },
    [program.editor, t]
  );

  const handleMoveUp = useCallback(
    (index: number) => {
      program.editor.moveStatementUp(index);
    },
    [program.editor]
  );

  const handleMoveDown = useCallback(
    (index: number) => {
      program.editor.moveStatementDown(index);
    },
    [program.editor]
  );

  const handleInsertBefore = useCallback((index: number) => {
    setInsertAtIndex(index);
    setEditingSubroutineIndex(null);
    setShowTypePicker(true);
  }, []);

  const handleInsertAfter = useCallback((index: number) => {
    setInsertAtIndex(index + 1);
    setEditingSubroutineIndex(null);
    setShowTypePicker(true);
  }, []);

  return (
    <>
      <View style={styles.container}>
        {statements.map((statement, index) => {
          const key = `statement-${index}`;

          switch (statement.type) {
            case 'move':
              return (
                <MoveStatementItem
                  key={key}
                  statement={statement}
                  index={index}
                  onChange={(updatedStatement) => handleChangeStatement(index, updatedStatement)}
                  onDelete={handleDeleteStatement}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onInsertBefore={handleInsertBefore}
                  onInsertAfter={handleInsertAfter}
                  canMoveUp={index > 0}
                  canMoveDown={index < statements.length - 1}
                />
              );
            case 'subroutine':
              return (
                <SubroutineStatementItem
                  key={key}
                  statement={statement}
                  index={index}
                  onChange={(updatedStatement) => handleChangeStatement(index, updatedStatement)}
                  onProgramSelect={() => handleEditSubroutine(index)}
                  onOpenProgram={() => handleOpenProgram(statement.programReference)}
                  onDelete={handleDeleteStatement}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onInsertBefore={handleInsertBefore}
                  onInsertAfter={handleInsertAfter}
                  canMoveUp={index > 0}
                  canMoveDown={index < statements.length - 1}
                  hasError={hasErrorAtIndex(index)}
                />
              );
            default:
              return null;
          }
        })}

        {/* Add Statement Button */}
        <MultiOptionButton
          icon="+"
          label={t('instructionPicker.addMove')}
          onMainPress={handleAddMove}
          onMenuPress={handleOpenStatementPicker}
        />
      </View>

      {/* Statement Type Picker Modal */}
      <StatementTypePicker
        visible={showTypePicker}
        onClose={handleCloseTypePicker}
        onSelectMove={handleAddMove}
        onSelectSubroutine={handleAddSubroutine}
      />

      {/* Program Picker Modal */}
      <ProgramPickerModal
        visible={showProgramPicker}
        onClose={handleCloseProgramPicker}
        programs={availablePrograms}
        onSelectProgram={handleSelectProgram}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 6,
  },
});
