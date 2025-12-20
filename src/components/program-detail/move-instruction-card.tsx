/**
 * Move Instruction Card Component
 *
 * Card for editing a Move instruction with motor speed inputs.
 * Can be expanded/collapsed to show/hide detailed controls.
 */

import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { CompilationError } from '@/types/compiled-program';
import { MoveInstruction } from '@/types/instruction';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { InputLabel } from '../ui/input-label';
import { MotorStrengthIndicator } from '../ui/motor-strength-indicator';
import { NumberInput } from '../ui/number-input';
import { BaseInstructionCard } from './base-instruction-card';
import { ErrorListView } from './error-list-view';

interface MoveInstructionCardProps {
  instruction: MoveInstruction;
  onUpdate: (instruction: MoveInstruction) => void;
  onDelete: () => void;
  onOptions: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  errors?: CompilationError[];
}

export function MoveInstructionCard({
  instruction,
  onUpdate,
  onOptions,
  isExpanded,
  onToggleExpand,
  errors = [],
}: MoveInstructionCardProps) {
  const { t } = useTranslation();
  const hasErrors = errors.length > 0;

  const handleLeftSpeedChange = (value: number) => {
    onUpdate({ ...instruction, leftMotorSpeed: value });
  };

  const handleRightSpeedChange = (value: number) => {
    onUpdate({ ...instruction, rightMotorSpeed: value });
  };

  return (
    <BaseInstructionCard
      icon="🚗"
      title={
        <MotorStrengthIndicator
          leftStrength={instruction.leftMotorSpeed}
          rightStrength={instruction.rightMotorSpeed}
          showLabels={true}
        />
      }
      backgroundColor={COLORS.WHITE}
      borderColor={COLORS.BORDER}
      hasErrors={hasErrors}
      onOptions={onOptions}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      {/* Error Messages */}
      <ErrorListView errors={errors} instructionId={instruction.id} />

      {/* Wheel Speed Controls */}
      <View style={styles.controlsContainer}>
        {/* Labels Row */}
        <View style={styles.labelsRow}>
          <InputLabel
            text={t('instruction.move.leftWheel')}
            alignment="left"
            style={styles.leftLabel}
          />
          <View style={styles.centerSpacer} />
          <InputLabel
            text={t('instruction.move.rightWheel')}
            alignment="right"
            style={styles.rightLabel}
          />
        </View>

        {/* Inputs Row */}
        <View style={styles.inputsRow}>
          {/* Left Wheel */}
          <NumberInput
            value={instruction.leftMotorSpeed}
            onValueChange={handleLeftSpeedChange}
            min={0}
            max={100}
            unit="%"
            alignment="left"
            containerStyle={styles.wheelInputContainer}
          />

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* Right Wheel */}
          <NumberInput
            value={instruction.rightMotorSpeed}
            onValueChange={handleRightSpeedChange}
            min={0}
            max={100}
            unit="%"
            alignment="right"
            containerStyle={styles.wheelInputContainer}
          />
        </View>
      </View>
    </BaseInstructionCard>
  );
}

const styles = StyleSheet.create({
  controlsContainer: {
    paddingVertical: SPACING.SM,
    gap: SPACING.SM,
  },
  labelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.XS,
  },
  leftLabel: {
    flex: 1,
  },
  centerSpacer: {
    flex: 1,
  },
  rightLabel: {
    flex: 1,
  },
  inputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wheelInputContainer: {
    // Fixed width to comfortably fit "100%"
    width: 70,
  },
  spacer: {
    flex: 1,
  },
});
