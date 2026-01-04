import { EditableProgram } from '@/hooks/use-program';
import { StyleSheet, View, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useCallback, useState } from 'react';
import { MoveStatementItem, SubroutineStatementItem } from './statement-list-item';
import { MultiOptionButton } from '@/components/ui/multi-option-button';
import { StatementTypePicker } from './statement-type-picker';
import { createMoveStatement, Statement } from '@/programs/statements';

interface Props {
  program: EditableProgram;
}

export function StatementList({ program }: Props) {
  const { t } = useTranslation();
  const statements = program.source.statements;
  const [showTypePicker, setShowTypePicker] = useState(false);

  const handleAddMove = useCallback(() => {
    program.editor.addStatement(createMoveStatement(), statements.length);
  }, [program.editor, statements.length]);

  const handleAddSubroutine = useCallback(() => {
    console.log('Add subroutine statement');
  }, []);

  const handleOpenStatementPicker = useCallback(() => {
    setShowTypePicker(true);
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
                />
              );
            case 'subroutine':
              return <SubroutineStatementItem key={key} statement={statement} />;
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
        onClose={() => setShowTypePicker(false)}
        onSelectMove={handleAddMove}
        onSelectSubroutine={handleAddSubroutine}
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
