import { useState, useEffect, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ThemedView } from '@/components/themed-view';
import { ProgramList } from '@/components/program-list';
import { Program } from '@/types/program';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { loadAllPrograms, saveProgram, generateProgramId } from '@/services/program-storage';

export default function ProgramsScreen() {
  const { t } = useTranslation();
  const { isTablet } = useResponsiveLayout();
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);

  // Load programs from storage
  const loadPrograms = useCallback(async () => {
    try {
      const loadedPrograms = await loadAllPrograms();
      setPrograms(loadedPrograms);
    } catch (error) {
      console.error('Error loading programs:', error);
    }
  }, []);

  // Reload programs when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadPrograms();
    }, [loadPrograms])
  );

  // Auto-select first program on tablet when programs are available
  useEffect(() => {
    if (isTablet && programs.length > 0 && !selectedProgram) {
      setSelectedProgram(programs[0]);
    }
  }, [isTablet, selectedProgram, programs]);

  // Handle program changes from detail view
  const handleProgramChanged = useCallback(
    (updatedProgram: Program) => {
      setPrograms((prevPrograms) => {
        const index = prevPrograms.findIndex((p) => p.id === updatedProgram.id);
        if (index === -1) {
          // Program not found, shouldn't happen but handle gracefully
          return prevPrograms;
        }

        // Create new array with updated program
        const newPrograms = [...prevPrograms];
        newPrograms[index] = updatedProgram;

        // Re-sort by last modified
        newPrograms.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());

        return newPrograms;
      });

      // Update selected program if it's the one that changed
      if (selectedProgram?.id === updatedProgram.id) {
        setSelectedProgram(updatedProgram);
      }
    },
    [selectedProgram]
  );

  // Handle program deletion from detail view
  const handleProgramDeleted = useCallback(
    async (deletedProgramId: string) => {
      // Remove from list
      setPrograms((prevPrograms) => prevPrograms.filter((p) => p.id !== deletedProgramId));

      // Clear selection if the deleted program was selected
      if (selectedProgram?.id === deletedProgramId) {
        setSelectedProgram(null);
      }

      // Reload programs to ensure consistency
      await loadPrograms();
    },
    [selectedProgram, loadPrograms]
  );

  const handleProgramPress = (program: Program) => {
    if (isTablet) {
      // On tablet, update selection to show in detail pane
      setSelectedProgram(program);
    } else {
      // On phone, navigate to full-screen detail view
      router.push(`/program-detail?id=${program.id}`);
    }
  };

  const handleAddProgram = async () => {
    const now = new Date();
    // Default name: "Program YYYY-MM-DD"
    const newProgram: Program = {
      id: generateProgramId(),
      name: t('programs.newProgram', { number: programs.length + 1 }),
      type: 'step',
      instructionCount: 0,
      createdDate: now,
      lastModified: now,
      instructions: [],
    };

    try {
      await saveProgram(newProgram);
      const reloadedPrograms = await loadAllPrograms();
      setPrograms(reloadedPrograms);

      // Find the newly created program in the reloaded list
      const freshProgram = reloadedPrograms.find((p) => p.id === newProgram.id);

      // Navigate to the new program or select it
      if (isTablet && freshProgram) {
        setSelectedProgram(freshProgram);
      } else if (!isTablet) {
        router.push(`/program-detail?id=${newProgram.id}`);
      }
    } catch (error) {
      console.error('Error creating program:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ProgramList
        programs={programs}
        onProgramPress={handleProgramPress}
        isTabletLayout={isTablet}
        selectedProgram={selectedProgram}
        onProgramChanged={handleProgramChanged}
        onProgramDeleted={handleProgramDeleted}
        onAddProgram={isTablet ? handleAddProgram : undefined}
      />

      {/* FAB - only in phone mode (tablet mode FAB is in ProgramList) */}
      {!isTablet && <FloatingActionButton onPress={handleAddProgram} />}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
