/**
 * ProgramList Component
 *
 * Displays a list of all available programs.
 * Shows empty state when no programs are available.
 * Supports both phone (full-screen) and tablet (master-detail) layouts.
 */

import { ProgramListItem } from './program-list-item';
import { SortHeader, SortOrder } from './sort-header';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { COMPONENT_SPACING, LAYOUT_SPACING, SPACING } from '@/constants/spacing';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ProgramInfo } from '@/services/programs';
import { useMemo, useState } from 'react';

interface Props {
  programs: ProgramInfo[];
  selectedProgramName: string | null;
  onProgramSelected: (name: string) => void;
  onNewProgramRequested: () => void;
}

export function ProgramList({
  programs,
  selectedProgramName,
  onProgramSelected,
  onNewProgramRequested,
}: Props) {
  const { t } = useTranslation();
  const [sortOrder, setSortOrder] = useState<SortOrder>('recent');

  const sortedPrograms = useMemo(() => {
    const sorted = [...programs];
    if (sortOrder === 'alphabetical') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      sorted.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
    }
    return sorted;
  }, [programs, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder((current) => (current === 'recent' ? 'alphabetical' : 'recent'));
  };

  if (programs.length === 0) {
    return (
      <>
        <ThemedView style={styles.emptyContainer}>
          <ThemedText type="title" style={styles.emptyTitle}>
            {t('programs.noPrograms')}
          </ThemedText>
          <ThemedText style={styles.emptySubtitle}>{t('programs.noProgramsMessage')}</ThemedText>
        </ThemedView>
        <FloatingActionButton onPress={onNewProgramRequested} />
      </>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          // Add bottom padding on Android/web for FAB
          Platform.OS !== 'ios' && styles.scrollContentWithFAB,
        ]}
        showsVerticalScrollIndicator={true}
      >
        <ThemedView style={styles.container}>
          <ThemedView style={styles.headerContainer}>
            <ThemedText type="subtitle" style={styles.header}>
              {t('programs.title')}
            </ThemedText>
            <SortHeader sortOrder={sortOrder} onToggle={toggleSortOrder} />
          </ThemedView>
          <ThemedView style={styles.listContainer}>
            {sortedPrograms.map((program) => (
              <ProgramListItem
                key={program.name}
                program={program}
                onSelected={onProgramSelected}
                isSelected={program.name === selectedProgramName}
              />
            ))}
          </ThemedView>
        </ThemedView>
      </ScrollView>

      <FloatingActionButton onPress={onNewProgramRequested} />
    </>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  scrollContentWithFAB: {
    paddingBottom: COMPONENT_SPACING.FAB_BOTTOM_PADDING,
  },
  container: {
    flex: 1,
    paddingVertical: LAYOUT_SPACING.SCREEN_PADDING,
    gap: LAYOUT_SPACING.ELEMENT_GAP,
  },
  headerContainer: {
    paddingHorizontal: LAYOUT_SPACING.SCREEN_PADDING,
    gap: SPACING.XS,
  },
  header: {
    fontSize: 20,
    fontWeight: '600',
  },
  listContainer: {},
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: LAYOUT_SPACING.EMPTY_STATE_PADDING,
  },
  emptyTitle: {
    marginBottom: SPACING.MD,
  },
  emptySubtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  // Tablet layout styles
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
  detailHeader: {
    padding: LAYOUT_SPACING.SCREEN_PADDING,
    paddingBottom: 0,
  },
  tabletEmptyState: {
    paddingVertical: LAYOUT_SPACING.EMPTY_STATE_PADDING,
    alignItems: 'center',
    gap: SPACING.SM,
  },
});
