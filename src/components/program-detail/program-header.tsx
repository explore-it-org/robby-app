/**
 * Program Header Component
 *
 * Displays program name with inline editing and metadata.
 * Includes menu options.
 */

import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export interface ProgramHeaderRef {
  startRename: () => void;
}

interface ProgramHeaderProps {
  programName: string;
  programId: string;
  instructionCount: number;
  lastModified: string; // Relative time string (e.g., "2h ago")
  onNameChange: (newName: string) => void;
  onMenuPress: () => void;
  autoFocusName?: boolean; // Whether to auto-focus the name field
  headerRef?: React.RefObject<ProgramHeaderRef>;
}

export function ProgramHeader({
  programName,
  programId,
  instructionCount,
  lastModified,
  onNameChange,
  onMenuPress,
  autoFocusName = false,
  headerRef,
}: ProgramHeaderProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(autoFocusName);
  const [editedName, setEditedName] = useState(programName);
  const inputRef = useRef<TextInput>(null);

  const handleStartEdit = () => {
    setEditedName(programName);
    setIsEditing(true);
    // Focus after state update
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // Expose rename functionality via ref
  useImperativeHandle(headerRef, () => ({
    startRename: handleStartEdit,
  }));

  // Auto-focus when autoFocusName is true
  useEffect(() => {
    if (autoFocusName && inputRef.current) {
      // Small delay to ensure the component is mounted
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [autoFocusName]);

  // Update edited name when program name changes externally
  useEffect(() => {
    if (!isEditing) {
      setEditedName(programName);
    }
  }, [programName, isEditing]);

  const handleSave = () => {
    const trimmedName = editedName.trim();
    if (trimmedName.length > 0 && trimmedName !== programName) {
      onNameChange(trimmedName);
    } else if (trimmedName.length === 0) {
      // Revert to original name if empty
      setEditedName(programName);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(programName);
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {isEditing ? (
          <TextInput
            ref={inputRef}
            style={styles.nameInput}
            value={editedName}
            onChangeText={setEditedName}
            maxLength={100}
            selectTextOnFocus
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
        ) : (
          <>
            <View style={styles.nameContainer}>
              <Text style={styles.nameText}>{programName}</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.menuButton, pressed && styles.buttonPressed]}
              onPress={onMenuPress}
            >
              <Text style={styles.menuButtonText}>•••</Text>
            </Pressable>
          </>
        )}
      </View>

      {isEditing ? (
        <View style={styles.editButtonsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.editButton,
              styles.saveButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>{t('common.save')}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.editButton,
              styles.cancelButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.metadataRow}>
          <Text style={styles.metadataText}>
            <Text style={styles.idText}>{programId}</Text>
          </Text>
          <Text style={styles.metadataText}>
            {t('programs.instruction', { count: instructionCount })} •{' '}
            {t('programs.lastModified', { time: lastModified })}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    marginBottom: SPACING.XL,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.MD,
  },
  nameContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  nameInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.PRIMARY_RED,
    paddingVertical: 4,
  },
  editButtonsContainer: {
    flexDirection: 'row',
    gap: SPACING.SM,
    marginTop: SPACING.MD,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: COLORS.PRIMARY_RED,
  },
  saveButtonText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: COLORS.BORDER,
  },
  cancelButtonText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '600',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonText: {
    fontSize: 24,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
  },
  metadataRow: {
    marginTop: SPACING.SM,
    gap: SPACING.XS,
  },
  metadataText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  idText: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
  buttonPressed: {
    opacity: 0.5,
  },
});
