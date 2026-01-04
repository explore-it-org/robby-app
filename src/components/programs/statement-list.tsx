import { EditableProgram } from '@/hooks/use-program';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useCallback, useState } from 'react';
import { MoveStatementItem, SubroutineStatementItem } from './statement-list-item';
import { MultiOptionButton } from '@/components/ui/multi-option-button';
import { StatementTypePicker } from './statement-type-picker';
import { createMoveStatement } from '@/programs/statements';

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

  return (
    <>
      <View style={styles.container}>
        {statements.map((statement, index) => {
          const key = `statement-${index}`;

          switch (statement.type) {
            case 'move':
              return <MoveStatementItem key={key} statement={statement} />;
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
    gap: 12,
  },
});
