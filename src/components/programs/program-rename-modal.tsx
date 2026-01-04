/**
 * Program Rename Modal Component
 *
 * Modal dialog for renaming programs with validation
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface ProgramRenameModalProps {
  visible: boolean;
  programName: string;
  existingNames: string[];
  onClose: () => void;
  onRename: (newName: string) => void;
}

export function ProgramRenameModal({
  visible,
  programName,
  existingNames,
  onClose,
  onRename,
}: ProgramRenameModalProps) {
  const { t } = useTranslation();
  const [newName, setNewName] = useState(programName);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  // Reset state and focus input when modal opens
  useEffect(() => {
    if (visible) {
      setNewName(programName);
      setErrorMessage(null);

      // Delay focus slightly to ensure modal is fully rendered
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [visible, programName]);

  const handleRename = () => {
    const trimmedName = newName.trim();

    // Validate: name must not be empty
    if (!trimmedName) {
      setErrorMessage(t('programs.renameError.empty', 'Name cannot be empty'));
      setNewName(trimmedName);
      return;
    }

    // Validate: name must not already exist (case-insensitive)
    const nameExists = existingNames.some(
      (name) => name.toLowerCase() === trimmedName.toLowerCase() && name !== programName
    );

    if (nameExists) {
      setErrorMessage(
        t('programs.renameError.exists', 'A program with this name already exists')
      );
      setNewName(trimmedName);
      return;
    }

    // All checks passed - rename
    onRename(trimmedName);
    onClose();
  };

  const handleClose = () => {
    setNewName(programName); // Reset to original name
    setErrorMessage(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <View style={styles.modalContainer} onStartShouldSetResponder={() => true}>
          <View style={[styles.modal, { backgroundColor }]}>
            <Text style={[styles.title, { color: textColor }]}>
              {t('programs.renameTitle', 'Rename Program')}
            </Text>
            <Text style={[styles.description, { color: textColor, opacity: 0.7 }]}>
              {t('programs.renameDescription', 'Enter a new name for the program')}
            </Text>

            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                { backgroundColor: tintColor + '20', color: textColor },
                errorMessage && styles.inputError,
              ]}
              value={newName}
              onChangeText={(text) => {
                setNewName(text);
                setErrorMessage(null); // Clear error when user types
              }}
              placeholder={t('programs.renamePlaceholder', 'Program name')}
              placeholderTextColor={textColor + '80'}
              selectTextOnFocus
              onSubmitEditing={handleRename}
            />

            {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

            <View style={styles.buttonRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  { backgroundColor: tintColor + '20' },
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleClose}
              >
                <Text style={[styles.cancelButtonText, { color: textColor }]}>
                  {t('common.cancel')}
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  { backgroundColor: tintColor },
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleRename}
              >
                <Text style={styles.renameButtonText}>
                  {t('programs.renameButton', 'Rename')}
                </Text>
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
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#DC3545',
  },
  errorText: {
    fontSize: 14,
    color: '#DC3545',
    marginBottom: 12,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  renameButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
