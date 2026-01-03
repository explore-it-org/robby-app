/**
 * Instruction Options Menu Modal
 *
 * Modal that allows users to perform actions on an instruction:
 * - Add instruction before
 * - Add instruction after
 * - Move up
 * - Move down
 * - Delete
 */

import { StyleSheet, Modal, View, Pressable, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';

interface InstructionOptionsMenuProps {
  visible: boolean;
  onClose: () => void;
  onAddBefore: () => void;
  onAddAfter: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function InstructionOptionsMenu({
  visible,
  onClose,
  onAddBefore,
  onAddAfter,
  onMoveUp,
  onMoveDown,
  onDelete,
  canMoveUp,
  canMoveDown,
}: InstructionOptionsMenuProps) {
  const { t } = useTranslation();

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            <Text style={styles.title}>{t('instructionOptionsMenu.title')}</Text>

            <View style={styles.optionsContainer}>
              {/* Add Before */}
              <Pressable
                style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                onPress={() => handleAction(onAddBefore)}
              >
                <Text style={styles.optionIcon}>⬆️</Text>
                <Text style={styles.optionText}>{t('instructionOptionsMenu.addBefore')}</Text>
              </Pressable>

              {/* Add After */}
              <Pressable
                style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                onPress={() => handleAction(onAddAfter)}
              >
                <Text style={styles.optionIcon}>⬇️</Text>
                <Text style={styles.optionText}>{t('instructionOptionsMenu.addAfter')}</Text>
              </Pressable>

              {/* Move Up */}
              <Pressable
                style={({ pressed }) => [
                  styles.option,
                  !canMoveUp && styles.optionDisabled,
                  pressed && canMoveUp && styles.optionPressed,
                ]}
                onPress={() => canMoveUp && handleAction(onMoveUp)}
                disabled={!canMoveUp}
              >
                <Text style={[styles.optionIcon, !canMoveUp && styles.disabledText]}>↑</Text>
                <Text style={[styles.optionText, !canMoveUp && styles.disabledText]}>
                  {t('instructionOptionsMenu.moveUp')}
                </Text>
              </Pressable>

              {/* Move Down */}
              <Pressable
                style={({ pressed }) => [
                  styles.option,
                  !canMoveDown && styles.optionDisabled,
                  pressed && canMoveDown && styles.optionPressed,
                ]}
                onPress={() => canMoveDown && handleAction(onMoveDown)}
                disabled={!canMoveDown}
              >
                <Text style={[styles.optionIcon, !canMoveDown && styles.disabledText]}>↓</Text>
                <Text style={[styles.optionText, !canMoveDown && styles.disabledText]}>
                  {t('instructionOptionsMenu.moveDown')}
                </Text>
              </Pressable>

              {/* Delete */}
              <Pressable
                style={({ pressed }) => [
                  styles.option,
                  styles.deleteOption,
                  pressed && styles.optionPressed,
                ]}
                onPress={() => handleAction(onDelete)}
              >
                <Text style={styles.optionIcon}>🗑️</Text>
                <Text style={[styles.optionText, styles.deleteText]}>
                  {t('instructionOptionsMenu.delete')}
                </Text>
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [styles.cancelButton, pressed && styles.cancelButtonPressed]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
            </Pressable>
          </View>
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
    fontSize: 20,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  deleteOption: {
    backgroundColor: '#FFE5E5',
  },
  deleteText: {
    color: COLORS.PRIMARY_RED,
  },
  disabledText: {
    opacity: 0.5,
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
