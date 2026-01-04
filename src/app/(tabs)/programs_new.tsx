import { useCallback, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedView } from '@/components/themed-view';
import { ProgramList } from '@/components/programs';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useProgramStorage } from '@/hooks/use-program-storage';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ProgramsScreen() {
  const { t } = useTranslation();
  const { isTablet } = useResponsiveLayout();
  const borderColor = useThemeColor({}, 'border');

  const programStorage = useProgramStorage();
  const availablePrograms = programStorage.availablePrograms;

  const [selectedProgramName, setSelectedProgramName] = useState<string | null>(
    availablePrograms[0]?.name ?? null
  );

  // const handleProgramPress = (program: Program) => {
  //   if (isTablet) {
  //     // On tablet, update selection to show in detail pane
  //     setSelectedProgram(program);
  //   } else {
  //     // On phone, navigate to full-screen detail view
  //     router.push(`/program-detail?id=${program.id}`);
  //   }
  // };

  const onNewProgramRequested = useCallback(() => {
    // Find the next available program number
    const existingNames = availablePrograms.map((p) => p.name);
    let number = 1;
    let newName: string;

    do {
      newName = t('programs.defaultName', { number });
      number += 1;
    } while (existingNames.includes(newName));

    // Create new program source
    const newSource = {
      name: newName,
      lastModified: new Date(),
      statements: [],
    };

    // Save to storage
    programStorage.saveProgramSource(newSource);

    // Select the new program
    setSelectedProgramName(newName);
  }, [availablePrograms, programStorage, t]);

  if (isTablet) {
    return (
      <ThemedView style={styles.tabletContainer}>
        {/* Left pane: Program list */}
        <ThemedView style={[styles.listPane, { borderRightColor: borderColor }]}>
          <ProgramList
            programs={availablePrograms}
            selectedProgramName={selectedProgramName}
            onProgramSelected={setSelectedProgramName}
            onNewProgramRequested={onNewProgramRequested}
          />
        </ThemedView>

        {/* Right pane: Program detail */}
        <ThemedView style={styles.detailPane}>
          <Text>Placeholder</Text>
        </ThemedView>
      </ThemedView>
    );
  } else {
    return (
      <ThemedView style={styles.container}>
        <ProgramList
          programs={availablePrograms}
          selectedProgramName={selectedProgramName}
          onProgramSelected={setSelectedProgramName}
          onNewProgramRequested={onNewProgramRequested}
        />
      </ThemedView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabletContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  listPane: {
    flex: 0.4, // Style guide: 40% for list pane
    minWidth: 320, // Style guide: minimum list pane width
    maxWidth: 500,
    borderRightWidth: 1,
  },
  detailPane: {
    flex: 0.6, // Style guide: 60% for detail pane
    minWidth: 400, // Style guide: minimum detail pane width
  },
});
