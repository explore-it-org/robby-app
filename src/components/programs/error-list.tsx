import { EditableProgram } from '@/hooks/use-program';
import { Text } from 'react-native';

interface Props {
  program: EditableProgram;
}

export function ErrorList({ program }: Props) {
  if (program.compiled.type !== 'faulty') return null;
  return <Text>Errors</Text>;
}
