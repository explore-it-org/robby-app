/**
 * ProgramDetailContent Component
 *
 * Reusable content component for program details.
 * Can be embedded in tablet layout or used in full-screen navigation.
 * 
 * MIGRATED to use new ProgramSource format with flat Statement arrays.
 */

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useProgram } from '@/hooks/use-program';
import { useProgramPicker } from '@/hooks/use-program-picker';
import { useProgramDeletion } from '@/hooks/use-program-deletion';
import { useStatementOperations } from '@/hooks/use-instruction-operations';
import { useRobotConnection } from '@/hooks/use-robot-connection';
import { ProgramSource } from '@/programs/source';
import type { Locale } from 'date-fns';
import { formatDistanceToNow } from 'date-fns';
import { de, enUS, fr, it } from 'date-fns/locale';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { CompilationErrorsView } from './program-detail/compilation-errors-view';
import { FixedControlBar } from './program-detail/fixed-control-bar';
import { InstructionList } from './program-detail/instruction-list';
import { InstructionOptionsMenu } from './program-detail/instruction-options-menu';
import { InstructionTypePicker } from './program-detail/instruction-type-picker';
import { ProgramHeader, ProgramHeaderRef } from './program-detail/program-header';
import { ProgramHeaderOptionsMenu } from './program-detail/program-header-options-menu';
import { ProgramPicker } from './program-detail/program-picker';

interface ProgramDetailContentProps {
  programName: string | null; // Changed from programId to programName
  isEmbedded?: boolean;
  onProgramChanged?: (source: ProgramSource) => void;
  onProgramDeleted?: (programName: string) => void;
}

export function ProgramDetailContent({
  programName,
  isEmbedded = false,
  onProgramChanged,
  onProgramDeleted,
}: ProgramDetailContentProps) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { source, compiledProgram, editor, reload } = useProgram({
    programName: programName || undefined,
    compile: true,
  });
  const { connectedRobot, isConnected } = useRobotConnection();
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [selectedStatementIndex, setSelectedStatementIndex] = useState<number>(0); // Changed from Instruction to Statement
  const [showProgramHeaderMenu, setShowProgramHeaderMenu] = useState(false);
  const programHeaderRef = useRef<ProgramHeaderRef>(null);

  // Track the previous program to detect changes
  const prevSourceRef = useRef<ProgramSource | null>(null);

  // Reload program data when screen comes into focus (e.g., when navigating back from a subroutine)
  useFocusEffect(
    useCallback(() => {
      // Only reload if we have a programName
      if (programName) {
        reload().catch((error) => {
          // Silently handle errors - the useProgram hook already logs them
          console.debug('Failed to reload program on focus:', error);
        });
      }
    }, [programName, reload])
  );

  // Use custom hooks for program picker and deletion
  const { availablePrograms } = useProgramPicker({ currentProgramName: source?.name });
  const { confirmAndDelete } = useProgramDeletion({
    onDeleteSuccess: (deletedProgramName) => {
      if (isEmbedded && onProgramDeleted) {
        onProgramDeleted(deletedProgramName);
      } else {
        router.back();
      }
    },
  });

  // Use custom hook for statement operations (renamed from instruction operations)
  const {
    showStatementPicker,
    expandedStatementIndex,
    showProgramPicker,
    programPickerStatementIndex,
    closeStatementPicker,
    closeProgramPicker,
    handleAddStatement,
    handleAddMove,
    handleSelectStatementType,
    handleUpdateStatement,
    handleDeleteStatement,
    showDeleteConfirmation,
    handleMoveStatement,
    handleToggleExpand,
    handleSelectSubroutineProgram,
    handleProgramSelected,
  } = useStatementOperations({ source, editor });

  // Notify parent when program changes
  useEffect(() => {
    if (source && onProgramChanged) {
      const prev = prevSourceRef.current;

      // Check if program has changed (name or statements length)
      if (
        !prev ||
        prev.name !== source.name ||
        prev.statements.length !== source.statements.length
      ) {
        onProgramChanged(source);
      }

      prevSourceRef.current = source;
    }
  }, [source, onProgramChanged]);

  // Helper function for alerts (mobile-only now)
  const showAlert = (
    title: string,
    message: string,
    buttons?: { text: string; onPress?: () => void; style?: string }[]
  ) => {
    if (buttons) {
      Alert.alert(title, message, buttons as any);
    } else {
      Alert.alert(title, message);
    }
  };

  // Empty state when no program is selected
  if (!source) {
    return (
      <ThemedView style={[styles.container, isEmbedded && styles.embedded]}>
        <ThemedView style={styles.emptyState}>
          <ThemedText type="title" style={styles.emptyTitle}>
            {t('programs.noProgramSelected')}
          </ThemedText>
          <ThemedText style={styles.emptySubtitle}>{t('programs.selectProgram')}</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  // Robot control handlers
  const handleConnect = () => {
    try {
      // Navigate to the robot tab (index 0)
      router.push('/(tabs)');
    } catch (error) {
      console.warn('Navigation to robot tab failed:', error);
      // In embedded mode, we might already be on the tabs screen
      if (isEmbedded) {
        showAlert(t('alerts.connectRobot.title'), t('alerts.connectRobot.message'));
      }
    }
  };

  const handleUploadAndRun = () => {
    // TODO: Implement upload and run logic
    showAlert(t('alerts.uploadAndRun.title'), t('alerts.uploadAndRun.message'));
  };

  const handleStop = () => {
    // TODO: Implement stop logic
    showAlert(t('alerts.stop.title'), t('alerts.stop.message'));
  };

  const handleUpload = () => {
    // TODO: Implement upload logic
    showAlert(t('alerts.upload.title'), t('alerts.upload.message'));
  };

  // Program header handlers
  const handleNameChange = (newName: string) => {
    editor.rename(newName);
  };

  const handleMenuPress = () => {
    setShowProgramHeaderMenu(true);
  };

  const handleRenameProgram = () => {
    programHeaderRef.current?.startRename();
  };

  const handleDeleteProgram = async () => {
    if (!source) return;
    // Pass the program name for deletion
    await confirmAndDelete(source.name);
  };

  // Statement handlers for options menu (renamed from Instruction)
  const handleAddStatementBefore = () => {
    handleAddStatement(selectedStatementIndex);
  };

  const handleAddStatementAfter = () => {
    handleAddStatement(selectedStatementIndex + 1);
  };

  const handleMoveStatementUp = () => {
    if (selectedStatementIndex > 0) {
      handleMoveStatement(selectedStatementIndex, selectedStatementIndex - 1);
    }
  };

  const handleMoveStatementDown = () => {
    if (source && selectedStatementIndex < source.statements.length - 1) {
      handleMoveStatement(selectedStatementIndex, selectedStatementIndex + 1);
    }
  };

  const handleDeleteFromMenu = () => {
    handleDeleteStatement(selectedStatementIndex);
  };

  const handleStatementOptions = (index: number) => {
    setSelectedStatementIndex(index);
    setShowOptionsMenu(true);
  };

  const handlePreviewSubroutineProgram = (index: number) => {
    const statement = source?.statements[index];
    if (statement?.type === 'subroutine' && statement.programReference) {
      try {
        // Navigate using program name instead of ID
        router.push(`/program-detail?name=${encodeURIComponent(statement.programReference)}`);
      } catch (error) {
        console.warn('Navigation to program preview failed:', error);
      }
    }
  };

  const getRelativeTime = (date: Date) => {
    // Map i18n language codes to date-fns locales
    const localeMap: Record<string, Locale> = {
      en: enUS,
      de: de,
      fr: fr,
      it: it,
    };

    const locale = localeMap[i18n.language] || enUS;

    // Use date-fns for relative time formatting
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale,
    });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, isEmbedded && styles.embedded]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ThemedView style={styles.flex}>
        {/* Fixed Control Bar */}
        <FixedControlBar
          connectedRobot={connectedRobot}
          onConnect={handleConnect}
          onUploadAndRun={handleUploadAndRun}
          onStop={handleStop}
          onUpload={handleUpload}
          isConnected={isConnected}
        />

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Program Header */}
          <ProgramHeader
            programName={source.name}
            statementCount={source.statements.length} // Changed from instructionCount
            onNameChange={handleNameChange}
            onMenuPress={handleMenuPress}
            autoFocusName={false}
            headerRef={programHeaderRef as React.RefObject<ProgramHeaderRef>}
          />

          {/* Compilation Errors */}
          {compiledProgram && compiledProgram.type === 'faulty' && (
            <CompilationErrorsView errors={compiledProgram.errors} />
          )}

          {/* Statement List (renamed from Instruction List) */}
          <InstructionList
            statements={source.statements}
            onAddStatement={handleAddStatement}
            onAddMove={handleAddMove}
            onUpdateStatement={handleUpdateStatement}
            onDeleteStatement={handleDeleteStatement}
            onMoveStatement={handleMoveStatement}
            onStatementOptions={handleStatementOptions}
            expandedStatementIndex={expandedStatementIndex}
            onToggleExpand={handleToggleExpand}
            showDeleteConfirmation={showDeleteConfirmation}
            errors={compiledProgram?.type === 'faulty' ? compiledProgram.errors : undefined}
            onSelectSubroutineProgram={handleSelectSubroutineProgram}
            onPreviewSubroutineProgram={handlePreviewSubroutineProgram}
          />
        </ScrollView>

        {/* Statement Type Picker Modal (renamed from Instruction) */}
        <InstructionTypePicker
          visible={showStatementPicker}
          onClose={closeStatementPicker}
          onSelectType={handleSelectStatementType}
        />

        {/* Statement Options Menu Modal (renamed from Instruction) */}
        <InstructionOptionsMenu
          visible={showOptionsMenu}
          onClose={() => setShowOptionsMenu(false)}
          onAddBefore={handleAddStatementBefore}
          onAddAfter={handleAddStatementAfter}
          onMoveUp={handleMoveStatementUp}
          onMoveDown={handleMoveStatementDown}
          onDelete={handleDeleteFromMenu}
          canMoveUp={selectedStatementIndex > 0}
          canMoveDown={source ? selectedStatementIndex < source.statements.length - 1 : false}
        />

        {/* Program Header Options Menu Modal */}
        <ProgramHeaderOptionsMenu
          visible={showProgramHeaderMenu}
          onClose={() => setShowProgramHeaderMenu(false)}
          onRename={handleRenameProgram}
          onDelete={handleDeleteProgram}
        />

        {/* Program Picker Modal for Subroutines */}
        <ProgramPicker
          visible={showProgramPicker}
          onClose={closeProgramPicker}
          onSelectProgram={handleProgramSelected}
          availablePrograms={availablePrograms}
          selectedProgramName={
            programPickerStatementIndex >= 0 && source
              ? (() => {
                  const stmt = source.statements[programPickerStatementIndex];
                  return stmt?.type === 'subroutine' ? stmt.programReference : undefined;
                })()
              : undefined
          }
        />
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
