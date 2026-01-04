// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { MoveStatement, Statement, SubroutineStatement } from '@/programs/statements';
import { Text } from 'react-native';

interface MoveStatementProps {
  statement: MoveStatement;
}

export function MoveStatementItem({ statement }: MoveStatementProps) {
  return <Text>Placeholder</Text>;
}

interface SubroutineStatementProps {
  statement: SubroutineStatement;
}

export function SubroutineStatementItem({ statement }: SubroutineStatementProps) {
  return <Text>Placeholder</Text>;
}
