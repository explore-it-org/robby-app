/**
 * ProgramDetailContent Component
 *
 * Reusable content component for program details.
 * Can be embedded in tablet layout or used in full-screen navigation.
 */

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useInstructionOperations } from '@/hooks/use-instruction-operations';
import { useProgramDeletion } from '@/hooks/use-program-deletion';
import { useProgram } from '@/hooks/use-program-legacy';
import { useProgramPicker } from '@/hooks/use-program-picker';
import { useRobotConnection } from '@/hooks/use-robot-connection';
import { Instruction } from '@/types/instruction';
import { Program } from '@/types/program';
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
  programId: string | null;
  isEmbedded?: boolean;
  onProgramChanged?: (program: Program) => void;
  onProgramDeleted?: (programId: string) => void;
}

export function ProgramDetailContent({
  programId,
  isEmbedded = false,
  onProgramChanged,
  onProgramDeleted,
}: ProgramDetailContentProps) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { program, compiledProgram, editor, reload } = useProgram({
    programId: programId || undefined,
    compile: true,
  });
  const { connectedRobot, isConnected } = useRobotConnection();
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [selectedInstructionIndex, setSelectedInstructionIndex] = useState<number>(0);
  const [showProgramHeaderMenu, setShowProgramHeaderMenu] = useState(false);
  const programHeaderRef = useRef<ProgramHeaderRef>(null);

  // Track the previous program to detect changes
  const prevProgramRef = useRef<Program | null>(null);

  // Reload program data when screen comes into focus (e.g., when navigating back from a subroutine)
  useFocusEffect(
    useCallback(() => {
      // Only reload if we have a programId
      if (programId) {
        reload().catch((error) => {
          // Silently handle errors - the useProgram hook already logs them
          console.debug('Failed to reload program on focus:', error);
        });
      }
    }, [programId, reload])
  );

  // Use custom hooks for program picker and deletion
  const { availablePrograms } = useProgramPicker({ currentProgramId: program?.id });
  const { confirmAndDelete } = useProgramDeletion({
    onDeleteSuccess: (programIdToDelete) => {
      if (isEmbedded && onProgramDeleted) {
        onProgramDeleted(programIdToDelete);
      } else {
        router.back();
      }
    },
  });

  // Use custom hook for instruction operations
  const {
    showInstructionPicker,
    expandedInstructionId,
    showProgramPicker,
    programPickerInstructionIndex,
    closeInstructionPicker,
    closeProgramPicker,
    handleAddInstruction,
    handleAddMove,
    handleSelectInstructionType,
    handleUpdateInstruction,
    handleDeleteInstruction,
    showDeleteConfirmation,
    handleMoveInstruction,
    handleToggleExpand,
    handleSelectSubroutineProgram,
    handleProgramSelected,
  } = useInstructionOperations({ program, editor });

  // Notify parent when program changes
  useEffect(() => {
    if (program && onProgramChanged) {
      const prev = prevProgramRef.current;

      // Check if program has changed (name, instruction count, or lastModified)
      if (
        !prev ||
        prev.name !== program.name ||
        prev.instructionCount !== program.instructionCount ||
        prev.lastModified.getTime() !== program.lastModified.getTime()
      ) {
        onProgramChanged(program);
      }

      prevProgramRef.current = program;
    }
  }, [program, onProgramChanged]);

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
  if (!program) {
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
    if (!program) return;
    await confirmAndDelete(program);
  };

  // Instruction handlers for options menu
  const handleAddInstructionBefore = () => {
    handleAddInstruction(selectedInstructionIndex);
  };

  const handleAddInstructionAfter = () => {
    handleAddInstruction(selectedInstructionIndex + 1);
  };

  const handleMoveInstructionUp = () => {
    if (selectedInstructionIndex > 0) {
      handleMoveInstruction(selectedInstructionIndex, selectedInstructionIndex - 1);
    }
  };

  const handleMoveInstructionDown = () => {
    if (program && selectedInstructionIndex < program.instructions.length - 1) {
      handleMoveInstruction(selectedInstructionIndex, selectedInstructionIndex + 1);
    }
  };

  const handleDeleteFromMenu = () => {
    handleDeleteInstruction(selectedInstructionIndex);
  };

  const handleInstructionOptions = (index: number) => {
    setSelectedInstructionIndex(index);
    setShowOptionsMenu(true);
  };

  const handlePreviewSubroutineProgram = (index: number) => {
    const instruction = program?.instructions[index];
    if (instruction?.type === 'subroutine' && instruction.programId) {
      try {
        router.push(`/program-detail?id=${instruction.programId}`);
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
            programName={program.name}
            programId={program.id}
            instructionCount={program.instructions.length}
            lastModified={getRelativeTime(program.lastModified)}
            onNameChange={handleNameChange}
            onMenuPress={handleMenuPress}
            autoFocusName={false}
            headerRef={programHeaderRef as React.RefObject<ProgramHeaderRef>}
          />

          {/* Compilation Errors */}
          {compiledProgram && !compiledProgram.isValid && compiledProgram.errors && (
            <CompilationErrorsView errors={compiledProgram.errors} />
          )}

          {/* Instruction List */}
          <InstructionList
            instructions={program.instructions}
            onAddInstruction={handleAddInstruction}
            onAddMove={handleAddMove}
            onUpdateInstruction={handleUpdateInstruction}
            onDeleteInstruction={handleDeleteInstruction}
            onMoveInstruction={handleMoveInstruction}
            onInstructionOptions={handleInstructionOptions}
            expandedInstructionId={expandedInstructionId}
            onToggleExpand={handleToggleExpand}
            showDeleteConfirmation={showDeleteConfirmation}
            errors={compiledProgram?.errors}
            onSelectSubroutineProgram={handleSelectSubroutineProgram}
            onPreviewSubroutineProgram={handlePreviewSubroutineProgram}
          />
        </ScrollView>

        {/* Instruction Type Picker Modal */}
        <InstructionTypePicker
          visible={showInstructionPicker}
          onClose={closeInstructionPicker}
          onSelectType={handleSelectInstructionType}
        />

        {/* Instruction Options Menu Modal */}
        <InstructionOptionsMenu
          visible={showOptionsMenu}
          onClose={() => setShowOptionsMenu(false)}
          onAddBefore={handleAddInstructionBefore}
          onAddAfter={handleAddInstructionAfter}
          onMoveUp={handleMoveInstructionUp}
          onMoveDown={handleMoveInstructionDown}
          onDelete={handleDeleteFromMenu}
          canMoveUp={selectedInstructionIndex > 0}
          canMoveDown={program ? selectedInstructionIndex < program.instructions.length - 1 : false}
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
          selectedProgramId={
            programPickerInstructionIndex >= 0 && program
              ? (() => {
                const instr = program.instructions[programPickerInstructionIndex];
                return instr?.type === 'subroutine' ? instr.programId : undefined;
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
