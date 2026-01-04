import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { EditableProgram } from '@/hooks/use-program';
import { ProgramError } from '@/programs/errors';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  program: EditableProgram;
}

export function ErrorList({ program }: Props) {
  const { t } = useTranslation();

  if (program.compiled.type !== 'faulty') {
    return null;
  }

  const errors = program.compiled.errors;

  if (errors.length === 0) {
    return null;
  }

  const getErrorMessage = (error: ProgramError): string => {
    switch (error.type) {
      case 'complexity':
        return t('errors.complexity', {
          maxInstructions: error.maxInstructions,
        });
      case 'missing-reference':
        return t('errors.missingReference', {
          programName: error.programReference,
        });
      case 'faulty-reference':
        return t('errors.faultyReference', {
          programName: error.programReference,
        });
      case 'cyclic-reference':
        return t('errors.cyclicReference', {
          programName: error.programReference,
          cycle: error.cycle.join(' ➞ '),
        });
      default:
        return t('errors.unknown');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>
        {t('compilationErrors.errorsFound', { count: errors.length })}
      </Text>

      {errors.map((error, index) => (
        <Text key={index} style={styles.errorItem}>
          • {getErrorMessage(error)}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: COLORS.ERROR_CORAL,
    borderRadius: 8,
    padding: SPACING.MD,
    marginHorizontal: SPACING.LG,
    marginTop: SPACING.MD,
    marginBottom: SPACING.MD,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.ERROR_CORAL,
    marginBottom: SPACING.SM,
  },
  errorItem: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 20,
    marginBottom: SPACING.XS,
  },
});
