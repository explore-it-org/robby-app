/**
 * Readonly Instruction List Component
 *
 * Displays a list of instructions in readonly mode (no editing).
 * Used for viewing downloaded instructions from a robot.
 */

import { Instruction } from '@/programs/instructions';
import { StyleSheet, View } from 'react-native';
import { StatementListHeader } from './statement-list-header';
import { ReadonlyInstructionItem } from './readonly-instruction-item';

interface Props {
  instructions: Instruction[];
}

export function ReadonlyInstructionList({ instructions }: Props) {
  return (
    <View style={styles.container}>
      {instructions.length > 0 && <StatementListHeader />}

      {instructions.map((instruction, index) => (
        <ReadonlyInstructionItem key={`instruction-${index}`} instruction={instruction} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 6,
  },
});
