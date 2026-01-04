import { ThemedText } from '@/components/themed-text';
import { useProgram } from '@/hooks/use-program';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { ThemedView } from '../themed-view';
import { RobotControlHeader } from '../robots';
import { useRobotConnection } from '@/hooks/use-robot-connection';
import { useCallback } from 'react';
import { router } from 'expo-router';
import { ProgramHeader } from './program-header';
import { StatementList } from './statement-list';

interface Props {
  programName: string;
}

export function ProgramEditor({ programName }: Props) {
  const { t } = useTranslation();
  const program = useProgram(programName);
  const { connectedRobot } = useRobotConnection();

  const onConnectRobot = useCallback(() => {
    router.replace('/(tabs)/robots');
  }, []);

  const onUploadAndRun = useCallback(() => {
    console.log('Upload and run program');
  }, []);

  const onStop = useCallback(() => {
    console.log('Stop program');
  }, []);

  const onUpload = useCallback(() => {
    console.log('Upload program');
  }, []);

  const onMenuRequested = useCallback(() => {
    console.log('Menu requested');
  }, []);

  if (program === 'not-found') {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.emptyState}>
          <ThemedText type="title" style={styles.emptyTitle}>
            {t('programs.noProgramFound')}
          </ThemedText>
          <ThemedText style={styles.emptySubtitle}>{t('programs.selectProgram')}</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ThemedView style={styles.flex}>
        <RobotControlHeader
          connectedRobot={connectedRobot}
          onConnect={onConnectRobot}
          onUploadAndRun={onUploadAndRun}
          onStop={onStop}
          onUpload={onUpload}
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <ProgramHeader programName={programName} onMenuRequested={onMenuRequested} />
          <StatementList program={program} />
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  embedded: {
    backgroundColor: 'transparent',
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40, // Extra padding at bottom
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
