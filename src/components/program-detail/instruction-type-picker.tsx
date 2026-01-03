/**
 * Instruction Type Picker Modal
 *
 * Modal that allows users to select which type of instruction to add.
 */

import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface InstructionTypePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectType: (type: 'move' | 'comment' | 'subroutine' | 'repetition') => void;
  maxNestingReached?: boolean;
}

export function InstructionTypePicker({
  visible,
  onClose,
  onSelectType,
  maxNestingReached = false,
}: InstructionTypePickerProps) {
  const { t } = useTranslation();

  const handleSelect = (type: 'move' | 'comment' | 'subroutine' | 'repetition') => {
    onSelectType(type);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.modalContainer}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.modal}>
              <Text style={styles.title}>{t('instructionPicker.title')}</Text>

              <View style={styles.optionsContainer}>
                {/* Move */}
                <Pressable
                  style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                  onPress={() => handleSelect('move')}
                >
                  <Text style={styles.optionIcon}>🚗</Text>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>{t('instructionPicker.move.title')}</Text>
                    <Text style={styles.optionDescription}>
                      {t('instructionPicker.move.description')}
                    </Text>
                  </View>
                </Pressable>

                {/* Comment */}
                <Pressable
                  style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                  onPress={() => handleSelect('comment')}
                >
                  <Text style={styles.optionIcon}>💭</Text>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>{t('instructionPicker.comment.title')}</Text>
                    <Text style={styles.optionDescription}>
                      {t('instructionPicker.comment.description')}
                    </Text>
                  </View>
                </Pressable>

                {/* Subroutine */}
                <Pressable
                  style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                  onPress={() => handleSelect('subroutine')}
                >
                  <Text style={styles.optionIcon}>🔗</Text>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>
                      {t('instructionPicker.subroutine.title')}
                    </Text>
                    <Text style={styles.optionDescription}>
                      {t('instructionPicker.subroutine.description')}
                    </Text>
                  </View>
                </Pressable>

                {/* Repetition */}
                <Pressable
                  style={({ pressed }) => [
                    styles.option,
                    maxNestingReached && styles.optionDisabled,
                    pressed && !maxNestingReached && styles.optionPressed,
                  ]}
                  onPress={() => !maxNestingReached && handleSelect('repetition')}
                  disabled={maxNestingReached}
                >
                  <Text style={styles.optionIcon}>🔁</Text>
                  <View style={styles.optionTextContainer}>
                    <Text
                      style={[styles.optionTitle, maxNestingReached && styles.optionTextDisabled]}
                    >
                      {t('instructionPicker.repetition.title')}
                    </Text>
                    <Text
                      style={[
                        styles.optionDescription,
                        maxNestingReached && styles.optionTextDisabled,
                      ]}
                    >
                      {maxNestingReached
                        ? t('instructionPicker.repetition.maxNesting')
                        : t('instructionPicker.repetition.description')}
                    </Text>
                  </View>
                </Pressable>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.cancelButtonPressed,
                ]}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>{t('instructionPicker.cancel')}</Text>
              </Pressable>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
  },
  modal: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.XL,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.LG,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: SPACING.SM,
    marginBottom: SPACING.LG,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.LG,
    backgroundColor: COLORS.BEIGE_SOFT,
    borderRadius: 8,
    gap: SPACING.MD,
  },
  optionPressed: {
    backgroundColor: '#F0EDE6',
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionIcon: {
    fontSize: 32,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  optionTextDisabled: {
    opacity: 0.7,
  },
  cancelButton: {
    padding: SPACING.MD,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonPressed: {
    backgroundColor: COLORS.BEIGE_SOFT,
  },
  cancelButtonText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
});
