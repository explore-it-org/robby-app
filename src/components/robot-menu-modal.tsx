/**
 * Robot Menu Modal Component
 *
 * Modal dialog for robot actions: disconnect and delete
 */

import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface RobotMenuModalProps {
  visible: boolean;
  robotName: string;
  isConnected: boolean;
  onClose: () => void;
  onRename: () => void;
  onDisconnect: () => void;
  onDelete: () => void;
}

export function RobotMenuModal({
  visible,
  robotName,
  isConnected,
  onClose,
  onRename,
  onDisconnect,
  onDelete,
}: RobotMenuModalProps) {
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
            <Text style={styles.title}>{robotName}</Text>

            <View style={styles.optionsContainer}>
              {/* Rename */}
              <Pressable
                style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                onPress={() => handleAction(onRename)}
              >
                <Text style={styles.optionIcon}>✏️</Text>
                <Text style={styles.optionText}>{t('robotOptionsMenu.rename')}</Text>
              </Pressable>

              {/* Disconnect */}
              <Pressable
                style={({ pressed }) => [
                  styles.option,
                  !isConnected && styles.optionDisabled,
                  pressed && isConnected && styles.optionPressed,
                ]}
                onPress={() => isConnected && handleAction(onDisconnect)}
                disabled={!isConnected}
              >
                <Text style={[styles.optionIcon, !isConnected && styles.disabledIcon]}>🔌</Text>
                <Text style={[styles.optionText, !isConnected && styles.disabledText]}>
                  {t('robotOptionsMenu.disconnect')}
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
                  {t('robotOptionsMenu.delete')}
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
    backgroundColor: '#F5F5F5',
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
  disabledIcon: {
    opacity: 0.4,
  },
  disabledText: {
    opacity: 0.4,
  },
  deleteOption: {
    backgroundColor: '#FFE5E5',
  },
  deleteText: {
    color: COLORS.PRIMARY_RED,
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
