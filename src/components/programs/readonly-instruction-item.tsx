/**
 * Readonly Instruction Item Component
 *
 * Displays a single instruction in readonly mode.
 * Shows motor speeds with visualization bar, no editing controls.
 */

import { Instruction } from '@/services/programs/instructions';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';

interface Props {
  instruction: Instruction;
}

export function ReadonlyInstructionItem({ instruction }: Props) {
  const leftSpeed = instruction.leftMotorSpeed;
  const rightSpeed = instruction.rightMotorSpeed;

  return (
    <View style={styles.container}>
      {/* Left Motor Speed */}
      <View style={styles.motorSpeedBox}>
        <Text style={styles.motorSpeedText}>{leftSpeed}</Text>
      </View>

      {/* Movement Visualization Bar */}
      <View style={styles.visualizationBar}>
        <View style={styles.visualizationColumn}>
          <View style={[styles.visualizationLeft, { width: `${leftSpeed}%` }]} />
        </View>
        <View style={styles.visualizationColumn}>
          <View style={[styles.visualizationRight, { width: `${rightSpeed}%` }]} />
        </View>
      </View>

      {/* Right Motor Speed */}
      <View style={styles.motorSpeedBox}>
        <Text style={styles.motorSpeedText}>{rightSpeed}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.SM,
    gap: SPACING.XS,
  },
  motorSpeedBox: {
    backgroundColor: COLORS.WHITE,
    borderWidth: 2,
    borderColor: COLORS.GRAY_LIGHT,
    borderRadius: 8,
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
    minWidth: 56,
    alignItems: 'center',
  },
  motorSpeedText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  visualizationBar: {
    flex: 1,
    height: 40,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  visualizationColumn: {
    flex: 1,
    flexDirection: 'row',
  },
  visualizationLeft: {
    backgroundColor: '#A2E2BD',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    alignSelf: 'stretch',
    marginLeft: 'auto',
  },
  visualizationRight: {
    backgroundColor: '#B8D4E8',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    alignSelf: 'stretch',
  },
});
