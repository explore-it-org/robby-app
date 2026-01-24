import { ThemedText } from '@/components/ui/themed-text';
import { useProgram } from '@/hooks/use-program';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ui/themed-view';
import { RobotControlHeader } from '../robots';
import { ConnectedRobot } from '@/hooks/use-robot-discovery';
import { useProgramStorage } from '@/hooks/use-program-storage';
import { useCallback, useState } from 'react';
import { router } from 'expo-router';
import { ProgramHeader } from './program-header';
import { StatementList } from './statement-list';
import { ProgramHeaderMenu } from './program-header-menu';
import { ProgramRenameModal } from './program-rename-modal';
import { showDeleteProgramConfirmation } from '@/utils/alerts';
import { ErrorList } from './error-list';

interface Props {
  programName: string;
  onProgramRenamed: (newName: string) => void;
  connectedRobot: ConnectedRobot | null;
}

export function ProgramEditor({ programName, onProgramRenamed, connectedRobot }: Props) {
  const { t } = useTranslation();
  const program = useProgram(programName);
  const programStorage = useProgramStorage();
  const [showMenu, setShowMenu] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);

  const existingProgramNames = programStorage.availablePrograms.map((p) => p.name);

  const handleConnectRobot = useCallback(() => {
    router.replace('/(tabs)/robots');
  }, []);

  const handleDriveMode = useCallback(() => {
    connectedRobot?.startDriveMode();
  }, [connectedRobot]);

  const handleRecordMode = useCallback(() => {
    // TODO: Configure duration and interval
    connectedRobot?.recordInstructions(5, 1);
  }, [connectedRobot]);

  const handleRunStoredInstructions = useCallback(() => {
    connectedRobot?.runStoredInstructions();
  }, [connectedRobot]);

  const handleStop = useCallback(() => {
    connectedRobot?.stop();
  }, [connectedRobot]);

  const handleMenuRequested = useCallback(() => {
    setShowMenu(true);
  }, []);

  const handleRenameProgram = useCallback(() => {
    setShowRenameModal(true);
  }, []);

  const handleRename = useCallback(
    (newName: string) => {
      if (program === 'not-found') return;

      program.editor.renameProgram(newName);

      // Notify parent about the rename so it can update the selected program name
      onProgramRenamed(newName);
    },
    [program, onProgramRenamed]
  );

  const handleDeleteProgram = useCallback(() => {
    if (program === 'not-found') return;

    showDeleteProgramConfirmation(programName, t, () => {
      program.editor.deleteProgram();
      router.back();
    });
  }, [program, programName, t]);

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
    <>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ThemedView style={styles.flex}>
          <RobotControlHeader
            connectedRobot={connectedRobot}
            onConnect={handleConnectRobot}
            onDriveMode={handleDriveMode}
            onRecordMode={handleRecordMode}
            onRunStoredInstructions={handleRunStoredInstructions}
            onStop={handleStop}
          />

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <ProgramHeader programName={programName} onMenuRequested={handleMenuRequested} />
            <ErrorList program={program} />
            <StatementList program={program} />
          </ScrollView>
        </ThemedView>
      </KeyboardAvoidingView>

      {/* Program Header Menu Modal */}
      <ProgramHeaderMenu
        programName={programName}
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        onRename={handleRenameProgram}
        onDelete={handleDeleteProgram}
      />

      {/* Program Rename Modal */}
      <ProgramRenameModal
        visible={showRenameModal}
        programName={programName}
        existingNames={existingProgramNames}
        onClose={() => setShowRenameModal(false)}
        onRename={handleRename}
      />
    </>
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
