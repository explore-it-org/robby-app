/**
 * Program Header Menu Modal
 *
 * Modal that allows users to perform actions on a program:
 * - Rename program
 * - Delete program
 */

import { StyleSheet, Modal, View, Pressable, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeColor } from '@/hooks/use-theme-color';

interface ProgramHeaderMenuProps {
  visible: boolean;
  programName: string;
  onClose: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export function ProgramHeaderMenu({
  visible,
  programName,
  onClose,
  onRename,
  onDelete,
}: ProgramHeaderMenuProps) {
  const { t } = useTranslation();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.modalContainer}>
          <View style={[styles.modal, { backgroundColor }]}>
            <Text style={[styles.title, { color: textColor }]}>
              {programName}
            </Text>

            <View style={styles.optionsContainer}>
              {/* Rename Program */}
              <Pressable
                style={({ pressed }) => [
                  styles.option,
                  { backgroundColor: tintColor + '20' },
                  pressed && styles.optionPressed,
                ]}
                onPress={() => handleAction(onRename)}
              >
                <Text style={styles.optionIcon}>✏️</Text>
                <Text style={[styles.optionText, { color: textColor }]}>
                  {t('programOptionsMenu.rename')}
                </Text>
              </Pressable>

              {/* Delete Program */}
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
                  {t('programOptionsMenu.delete')}
                </Text>
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && { backgroundColor: tintColor + '10' },
              ]}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: textColor }]}>
                {t('common.cancel', 'Cancel')}
              </Text>
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
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  optionPressed: {
    opacity: 0.7,
  },
  optionIcon: {
    fontSize: 20,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  deleteOption: {
    backgroundColor: '#FFE5E5',
  },
  deleteText: {
    color: '#DC3545',
  },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.7,
  },
});
