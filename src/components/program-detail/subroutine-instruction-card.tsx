/**
 * Subroutine Instruction Card Component
 *
 * Card for editing a Subroutine instruction - calling another program.
 * Can be expanded/collapsed to show/hide program selector and info.
 */

import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { CompilationError } from '@/types/compiled-program';
import { SubroutineInstruction } from '@/types/instruction';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BaseInstructionCard } from './base-instruction-card';
import { ErrorListView } from './error-list-view';

interface SubroutineInstructionCardProps {
  instruction: SubroutineInstruction;
  onUpdate: (instruction: SubroutineInstruction) => void;
  onDelete: () => void;
  onOptions: () => void;
  onSelectProgram: () => void; // Opens program picker
  onPreviewProgram: () => void; // Opens program preview
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  errors?: CompilationError[];
}

export function SubroutineInstructionCard({
  instruction,
  onOptions,
  onSelectProgram,
  onPreviewProgram,
  isExpanded,
  onToggleExpand,
  errors = [],
}: SubroutineInstructionCardProps) {
  const { t } = useTranslation();

  const displayName = instruction.programName || instruction.programId;
  const hasErrors = errors.length > 0;

  return (
    <BaseInstructionCard
      icon="🔗"
      title={displayName}
      backgroundColor={COLORS.SUBROUTINE_TEAL_LIGHT}
      hasErrors={hasErrors}
      onOptions={onOptions}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      {/* Error Messages */}
      <ErrorListView errors={errors} instructionId={instruction.id} />

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{t('subroutineCard.selectProgram')}</Text>
        <Pressable
          style={({ pressed }) => [styles.selectButton, pressed && styles.buttonPressed]}
          onPress={onSelectProgram}
        >
          <Text style={styles.selectButtonText}>{displayName}</Text>
          <Text style={styles.selectButtonIcon}>▼</Text>
        </Pressable>
      </View>

      {instruction.programName && !hasErrors && (
        <Pressable
          style={({ pressed }) => [styles.previewButton, pressed && styles.buttonPressed]}
          onPress={onPreviewProgram}
        >
          <Text style={styles.previewButtonText}>{t('subroutineCard.openProgram')}</Text>
        </Pressable>
      )}
    </BaseInstructionCard>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: SPACING.SM,
    marginTop: SPACING.MD,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 4,
    padding: SPACING.MD,
    backgroundColor: COLORS.WHITE,
  },
  selectButtonText: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
  },
  selectButtonIcon: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  buttonPressed: {
    opacity: 0.5,
  },
  previewButton: {
    alignSelf: 'flex-start',
    paddingVertical: SPACING.SM,
  },
  previewButtonText: {
    fontSize: 14,
    color: COLORS.CURIOUS_BLUE,
    fontWeight: '500',
  },
});
