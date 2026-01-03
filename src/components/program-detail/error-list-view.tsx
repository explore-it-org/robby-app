/**
 * Error List View Component
 *
 * Reusable component for displaying compilation errors in instruction cards.
 * Shows multiple errors in a consistent format with proper spacing.
 */

import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { CompilationError } from '@/types/compiled-program';
import { formatErrorMessage } from '@/utils/error-message-formatter';
import { StyleSheet, Text, View } from 'react-native';

interface ErrorListViewProps {
  /**
   * Array of compilation errors to display
   */
  errors: CompilationError[];

  /**
   * Optional instruction ID to determine if errors are transitive
   * If provided, errors that have this as parentInstructionId are considered transitive
   */
  instructionId?: string;
}

export function ErrorListView({ errors, instructionId }: ErrorListViewProps) {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {errors.map((error, index) => (
        <View key={index} style={styles.errorItem}>
          <Text style={styles.errorText}>⚠️ {formatErrorMessage(error, instructionId)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.SM,
  },
  errorItem: {
    padding: SPACING.MD,
    backgroundColor: '#FFF0F0',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.ERROR_CORAL,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.ERROR_CORAL,
  },
});
