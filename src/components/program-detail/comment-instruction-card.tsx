/**
 * Comment Instruction Card Component
 *
 * Card for editing a Comment instruction with multi-line text input.
 * Can be expanded/collapsed to show/hide full text.
 */

import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { CompilationError } from '@/types/compiled-program';
import { CommentInstruction } from '@/types/instruction';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TextInput } from 'react-native';
import { BaseInstructionCard } from './base-instruction-card';
import { ErrorListView } from './error-list-view';

interface CommentInstructionCardProps {
  instruction: CommentInstruction;
  onUpdate: (instruction: CommentInstruction) => void;
  onDelete: () => void;
  onOptions: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  errors?: CompilationError[];
}

export function CommentInstructionCard({
  instruction,
  onUpdate,
  onOptions,
  isExpanded,
  onToggleExpand,
  errors = [],
}: CommentInstructionCardProps) {
  const { t } = useTranslation();
  const hasErrors = errors.length > 0;

  // Local state for immediate visual feedback
  const [localText, setLocalText] = useState(instruction.text);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local state when instruction prop changes from external source
  useEffect(() => {
    setLocalText(instruction.text);
  }, [instruction.text]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleTextChange = (text: string) => {
    if (text.length > 500) {
      return;
    }

    // Update local state immediately for responsive UI
    setLocalText(text);

    // Clear existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce the onUpdate callback
    debounceTimeoutRef.current = setTimeout(() => {
      onUpdate({ ...instruction, text });
      debounceTimeoutRef.current = null;
    }, 300);
  };

  const handleBlur = () => {
    // Clear any pending debounce
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }

    // Ensure the current text is saved immediately on blur
    if (localText !== instruction.text) {
      onUpdate({ ...instruction, text: localText });
    }
  };

  const getPreviewText = () => {
    if (localText.length <= 40) {
      return localText;
    }
    return localText.substring(0, 40) + '...';
  };

  return (
    <BaseInstructionCard
      icon="💭"
      title={getPreviewText() || ''}
      backgroundColor="#F0F8FF"
      borderColor={COLORS.BORDER}
      hasErrors={hasErrors}
      onOptions={onOptions}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      {/* Error Messages */}
      <ErrorListView errors={errors} instructionId={instruction.id} />

      <TextInput
        style={styles.textInput}
        value={localText}
        onChangeText={handleTextChange}
        onBlur={handleBlur}
        placeholder={t('instructionPicker.comment.placeholder')}
        multiline
        numberOfLines={4}
        maxLength={500}
        textAlignVertical="top"
      />
      <Text style={styles.charCount}>
        {t('common.characters', { count: localText.length, max: 500 })}
      </Text>
    </BaseInstructionCard>
  );
}

const styles = StyleSheet.create({
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 4,
    padding: SPACING.MD,
    fontSize: 14,
    minHeight: 100,
    backgroundColor: COLORS.WHITE,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'right',
  },
});
