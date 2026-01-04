/**
 * Statement Type Picker Modal
 *
 * Modal that allows users to select which type of statement to add:
 * - Move statement
 * - Subroutine statement
 */

import { StyleSheet, Modal, View, Pressable, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeColor } from '@/hooks/use-theme-color';

interface StatementTypePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectMove: () => void;
  onSelectSubroutine: () => void;
}

export function StatementTypePicker({
  visible,
  onClose,
  onSelectMove,
  onSelectSubroutine,
}: StatementTypePickerProps) {
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
            <Text style={[styles.title, { color: textColor }]}>{t('instructionPicker.title')}</Text>

            <View style={styles.optionsContainer}>
              {/* Move Statement */}
              <Pressable
                style={({ pressed }) => [
                  styles.option,
                  { backgroundColor: tintColor + '20' },
                  pressed && styles.optionPressed,
                ]}
                onPress={() => handleAction(onSelectMove)}
              >
                <Text style={styles.optionIcon}>➡️</Text>
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionTitle, { color: textColor }]}>
                    {t('instructionPicker.move.title')}
                  </Text>
                  <Text style={[styles.optionDescription, { color: textColor, opacity: 0.7 }]}>
                    {t('instructionPicker.move.description')}
                  </Text>
                </View>
              </Pressable>

              {/* Subroutine Statement */}
              <Pressable
                style={({ pressed }) => [
                  styles.option,
                  { backgroundColor: tintColor + '20' },
                  pressed && styles.optionPressed,
                ]}
                onPress={() => handleAction(onSelectSubroutine)}
              >
                <Text style={styles.optionIcon}>🔁</Text>
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionTitle, { color: textColor }]}>
                    {t('instructionPicker.subroutine.title')}
                  </Text>
                  <Text style={[styles.optionDescription, { color: textColor, opacity: 0.7 }]}>
                    {t('instructionPicker.subroutine.description')}
                  </Text>
                </View>
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
                {t('common.cancel')}
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
    fontSize: 24,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
  },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
