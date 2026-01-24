/**
 * Program View Screen
 *
 * Displays downloaded instructions from a robot in readonly mode.
 * Instructions are passed via the InstructionViewerContext.
 */

import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { ReadonlyInstructionList } from '@/components/programs/readonly-instruction-list';
import { COLORS } from '@/constants/colors';
import { Colors } from '@/constants/theme';
import { useInstructionViewer } from '@/contexts/instruction-viewer-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';

export default function ProgramViewScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const { instructions } = useInstructionViewer();

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: t('programs.downloadedInstructions'),
          headerBackTitle: t('common.back'),
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].primary,
          },
          headerTintColor: COLORS.WHITE,
          headerTitleStyle: {
            color: COLORS.WHITE,
            fontWeight: '600',
          },
        }}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {instructions && instructions.length > 0 ? (
          <ReadonlyInstructionList instructions={instructions} />
        ) : (
          <ThemedView style={styles.emptyState}>
            <ThemedText type="title" style={styles.emptyTitle}>
              {t('programs.noInstructions')}
            </ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              {t('programs.noInstructionsDescription')}
            </ThemedText>
          </ThemedView>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
});
