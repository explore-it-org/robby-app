/**
 * Program Picker Modal Component
 *
 * Full-screen modal for selecting a program as a subroutine reference.
 * Features:
 * - Search bar for filtering programs
 * - Displays program metadata (same as program list)
 * - Shows program ID
 * - Cancel and select actions
 */

import { useState } from 'react';
import { StyleSheet, Modal, View, Pressable, Text, TextInput, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { Program } from '@/types/program';
import { formatProgramDate } from '@/utils/date-formatter';

interface ProgramPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectProgram: (program: Program) => void;
  availablePrograms: Program[];
  selectedProgramId?: string;
}

export function ProgramPicker({
  visible,
  onClose,
  onSelectProgram,
  availablePrograms,
  selectedProgramId,
}: ProgramPickerProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter programs based on search query
  const filteredPrograms = availablePrograms
    .filter((program) => {
      if (searchQuery.trim() === '') {
        return true;
      }

      const query = searchQuery.toLowerCase();
      return program.name.toLowerCase().includes(query) || program.id.toLowerCase().includes(query);
    })
    .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());

  const handleSelect = (program: Program) => {
    onSelectProgram(program);
    setSearchQuery(''); // Reset search on select
    onClose();
  };

  const handleCancel = () => {
    onClose();
    setSearchQuery(''); // Reset search on cancel
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('programPicker.title')}</Text>
          <Pressable
            style={({ pressed }) => [styles.cancelButton, pressed && styles.buttonPressed]}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            placeholder={t('programPicker.searchPlaceholder')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>

        {/* Program List */}
        <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
          {filteredPrograms.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {searchQuery.trim() === ''
                  ? t('programPicker.noPrograms')
                  : t('programPicker.noResults')}
              </Text>
            </View>
          ) : (
            filteredPrograms.map((program) => (
              <Pressable
                key={program.id}
                style={({ pressed }) => [styles.programItem, pressed && styles.programItemPressed]}
                onPress={() => handleSelect(program)}
              >
                <View style={styles.programItemContent}>
                  {/* Program Name */}
                  <Text style={styles.programName} numberOfLines={1}>
                    {program.name}
                  </Text>

                  {/* Program ID */}
                  <Text style={styles.programId} numberOfLines={1}>
                    {program.id}
                  </Text>

                  {/* Metadata */}
                  <View style={styles.metadata}>
                    <Text style={styles.metadataText}>
                      {t('programs.updated')}: {formatProgramDate(program.lastModified)}
                    </Text>
                    <Text style={styles.separator}>|</Text>
                    <Text style={styles.metadataText}>
                      {t('programs.instruction', { count: program.instructionCount })}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BEIGE_SOFT,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    backgroundColor: COLORS.PRIMARY_RED,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.WHITE,
  },
  cancelButton: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
  },
  cancelButtonText: {
    fontSize: 16,
    color: COLORS.WHITE,
    fontWeight: '500',
  },
  buttonPressed: {
    opacity: 0.5,
  },
  searchSection: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    backgroundColor: COLORS.PRIMARY_RED,
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    paddingHorizontal: SPACING.MD,
    fontSize: 16,
    backgroundColor: COLORS.WHITE,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: SPACING.LG,
    gap: SPACING.MD,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.XL * 2,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  programItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    padding: SPACING.LG,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  programItemPressed: {
    backgroundColor: COLORS.BEIGE_SOFT,
    borderColor: COLORS.PRIMARY_RED,
  },
  programItemContent: {
    flex: 1,
    gap: SPACING.XS,
  },
  programName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  programId: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
    marginTop: SPACING.XS,
  },
  metadataText: {
    fontSize: 14,
    color: COLORS.GRAY_MEDIUM,
  },
  separator: {
    fontSize: 14,
    color: COLORS.GRAY_MEDIUM,
    opacity: 0.5,
  },
});
