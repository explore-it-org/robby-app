import { ProgramList } from '@/components/programs';
import { ProgramEditor } from '@/components/programs/program-editor';
import { ThemedView } from '@/components/themed-view';
import { useProgramStorage } from '@/hooks/use-program-storage';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

export default function ProgramsScreen() {
  const { t } = useTranslation();
  const { isTablet } = useResponsiveLayout();
  const borderColor = useThemeColor({}, 'border');

  const programStorage = useProgramStorage();
  const availablePrograms = programStorage.availablePrograms;

  const [selectedProgramName, setSelectedProgramName] = useState<string | null>(
    availablePrograms[0]?.name ?? null
  );

  const onProgramSelected = useCallback(
    (name: string) => {
      if (isTablet) {
        setSelectedProgramName(name);
      } else {
        router.push(`/program-edit?name=${name}`);
      }
    },
    [isTablet]
  );

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
    onProgramSelected(newName);
  }, [availablePrograms, onProgramSelected, programStorage, t]);

  if (isTablet) {
    return (
      <ThemedView style={styles.tabletContainer}>
        {/* Left pane: Program list */}
        <ThemedView style={[styles.listPane, { borderRightColor: borderColor }]}>
          <ProgramList
            programs={availablePrograms}
            selectedProgramName={selectedProgramName}
            onProgramSelected={onProgramSelected}
            onNewProgramRequested={onNewProgramRequested}
          />
        </ThemedView>

        {/* Right pane: Program detail */}
        <ThemedView style={styles.detailPane}>
          {selectedProgramName ? <ProgramEditor programName={selectedProgramName} /> : null}
        </ThemedView>
      </ThemedView>
    );
  } else {
    return (
      <ThemedView style={styles.container}>
        <ProgramList
          programs={availablePrograms}
          selectedProgramName={selectedProgramName}
          onProgramSelected={onProgramSelected}
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
