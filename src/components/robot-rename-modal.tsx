/**
 * Robot Rename Modal Component
 *
 * Cross-platform modal dialog for renaming robots
 */

import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface RobotRenameModalProps {
  visible: boolean;
  robotName: string;
  onClose: () => void;
  onRename: (newName: string) => void;
}

export function RobotRenameModal({ visible, robotName, onClose, onRename }: RobotRenameModalProps) {
  const { t } = useTranslation();
  const [newName, setNewName] = useState(robotName);

  const handleRename = () => {
    if (newName && newName.trim()) {
      onRename(newName.trim());
      onClose();
    }
  };

  const handleClose = () => {
    setNewName(robotName); // Reset to original name
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <View style={styles.modalContainer} onStartShouldSetResponder={() => true}>
          <View style={styles.modal}>
            <Text style={styles.title}>{t('robotRenameModal.title')}</Text>
            <Text style={styles.description}>{t('robotRenameModal.description')}</Text>

            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder={t('robotRenameModal.placeholder')}
              autoFocus
              selectTextOnFocus
            />

            <View style={styles.buttonRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.cancelButton,
                  pressed && styles.cancelButtonPressed,
                ]}
                onPress={handleClose}
              >
                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.renameButton,
                  pressed && styles.renameButtonPressed,
                ]}
                onPress={handleRename}
              >
                <Text style={styles.renameButtonText}>{t('robotRenameModal.rename')}</Text>
              </Pressable>
            </View>
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
    marginBottom: SPACING.SM,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.LG,
    textAlign: 'center',
  },
  input: {
    backgroundColor: COLORS.BEIGE_SOFT,
    borderRadius: 8,
    padding: SPACING.MD,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.LG,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.MD,
  },
  button: {
    flex: 1,
    padding: SPACING.MD,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.BEIGE_SOFT,
  },
  cancelButtonPressed: {
    backgroundColor: '#E5E5E5',
  },
  cancelButtonText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
  renameButton: {
    backgroundColor: '#9370DB',
  },
  renameButtonPressed: {
    backgroundColor: '#7B5BB8',
  },
  renameButtonText: {
    fontSize: 16,
    color: COLORS.WHITE,
    fontWeight: '600',
  },
});
