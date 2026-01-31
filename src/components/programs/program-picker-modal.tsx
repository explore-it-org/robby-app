import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { ProgramInfo } from '@/services/programs/storage';
import { ProgramEntryView } from './program-entry-view';
import { SortHeader, SortOrder } from './sort-header';

interface ProgramPickerModalProps {
  visible: boolean;
  onClose: () => void;
  programs: ProgramInfo[];
  onSelectProgram: (programName: string) => void;
}

export function ProgramPickerModal({
  visible,
  onClose,
  programs,
  onSelectProgram,
}: ProgramPickerModalProps) {
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.pickerContainer} edges={['top', 'bottom']}>
        <View style={styles.pickerHeader}>
          <Text style={styles.pickerTitle}>{t('programPicker.title')}</Text>
          <Pressable onPress={onClose}>
            <Text style={styles.cancelButton}>{t('common.cancel')}</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.pickerList} contentContainerStyle={styles.pickerListContent}>
          {programs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{t('programPicker.noPrograms')}</Text>
            </View>
          ) : (
            <>
              <View style={styles.sortHeaderContainer}>
                <SortHeader sortOrder={sortOrder} onToggle={toggleSortOrder} />
              </View>
              {sortedPrograms.map((programInfo) => (
                <ProgramEntryView
                  key={programInfo.name}
                  program={programInfo}
                  onPress={() => onSelectProgram(programInfo.name)}
                />
              ))}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  pickerContainer: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    backgroundColor: COLORS.PRIMARY,
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.WHITE,
  },
  cancelButton: {
    fontSize: 16,
    color: COLORS.WHITE,
    fontWeight: '500',
  },
  pickerList: {
    flex: 1,
    backgroundColor: COLORS.BEIGE_SOFT,
  },
  pickerListContent: {},
  sortHeaderContainer: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM,
    backgroundColor: COLORS.BEIGE_SOFT,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.XL * 2,
    paddingHorizontal: SPACING.LG,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
});
