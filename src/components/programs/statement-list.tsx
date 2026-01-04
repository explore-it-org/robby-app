import { EditableProgram } from '@/hooks/use-program';
import { StyleSheet, View } from 'react-native';
import { MoveStatementItem, SubroutineStatementItem } from './statement-list-item';

interface Props {
  program: EditableProgram;
}

export function StatementList({ program }: Props) {
  const statements = program.source.statements;

  return (
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
});
