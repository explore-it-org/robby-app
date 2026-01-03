/**
 * Compilation Errors View Component
 *
 * Displays compilation errors below the program header.
 * Shows the number of errors and lists them with their messages.
 */

import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { CompilationError } from '@/types/compiled-program';
import { formatErrorMessage } from '@/utils/error-message-formatter';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

interface CompilationErrorsViewProps {
  errors: CompilationError[];
}

export function CompilationErrorsView({ errors }: CompilationErrorsViewProps) {
  const { t } = useTranslation();

  if (errors.length === 0) {
    return null;
  }

  const getErrorIcon = (type: CompilationError['type']) => {
    switch (type) {
      case 'missing-reference':
        return '🔗';
      case 'cyclic-dependency':
        return '🔄';
      case 'invalid-instruction':
        return '⚠️';
      case 'instruction-limit-exceeded':
        return '🤯';
      default:
        return '⚠️';
    }
  };

  // Parse error message and render with red highlights and translation
  const renderErrorMessage = (error: CompilationError) => {
    // Format the error message (handles transitive errors)
    let message = formatErrorMessage(error);

    // Handle translation marker for cyclic dependency
    let processedMessage = message;
    if (message.startsWith('[[CYCLIC_DEPENDENCY]]')) {
      const pathPart = message.replace('[[CYCLIC_DEPENDENCY]]\n', '');
      processedMessage = `${t('compilationErrors.cyclicDependency')}\n${pathPart}`;
    }

    const parts = processedMessage.split(/(\[\[RED\]\].*?\[\[\/RED\]\])/g);

    return (
      <Text style={styles.errorMessage}>
        {parts.map((part, index) => {
          if (part.startsWith('[[RED]]') && part.endsWith('[[/RED]]')) {
            const text = part.replace('[[RED]]', '').replace('[[/RED]]', '');
            return (
              <Text key={index} style={styles.redText}>
                {text}
              </Text>
            );
          }
          return part;
        })}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.headerText}>
          {t('compilationErrors.errorsFound', { count: errors.length })}
        </Text>
      </View>

      <View style={styles.errorsList}>
        {errors.map((error, index) => (
          <View key={index} style={styles.errorItem}>
            <Text style={styles.errorItemIcon}>{getErrorIcon(error.type)}</Text>
            <View style={styles.errorContent}>
              {renderErrorMessage(error)}
              {error.explanationKey && (
                <Text style={styles.explanationText}>
                  {t(`compilationErrors.${error.explanationKey}`)}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.helpText}>{t('compilationErrors.helpText')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF5F5', // Light red background
    borderWidth: 1,
    borderColor: '#FFCCCC',
    borderRadius: 8,
    padding: SPACING.LG,
    marginHorizontal: SPACING.LG,
    marginTop: SPACING.MD,
    marginBottom: SPACING.MD,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.MD,
    gap: SPACING.SM,
  },
  errorIcon: {
    fontSize: 20,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.ERROR_CORAL,
  },
  errorsList: {
    gap: SPACING.SM,
    marginBottom: SPACING.MD,
  },
  errorItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.WHITE,
    padding: SPACING.MD,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.ERROR_CORAL,
    gap: SPACING.SM,
  },
  errorItemIcon: {
    fontSize: 16,
  },
  errorContent: {
    flex: 1,
    gap: SPACING.XS,
  },
  errorMessage: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 20,
  },
  redText: {
    color: COLORS.ERROR_CORAL,
    fontWeight: '700',
  },
  explanationText: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    fontStyle: 'italic',
    marginTop: SPACING.XS,
    lineHeight: 18,
  },
  helpText: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
