import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { ProgramInfo } from '@/services/programs/storage';

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
            programs.map((programInfo) => (
              <Pressable
                key={programInfo.name}
                style={({ pressed }) => [styles.programItem, pressed && styles.programItemPressed]}
                onPress={() => onSelectProgram(programInfo.name)}
              >
                <Text style={styles.programName}>{programInfo.name}</Text>
                <Text style={styles.programMeta}>
                  {t('programs.instruction', { count: programInfo.statementCount })}
                </Text>
              </Pressable>
            ))
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
  pickerListContent: {
    padding: SPACING.LG,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.XL * 2,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  programItem: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    padding: SPACING.LG,
    marginBottom: SPACING.MD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  programItemPressed: {
    backgroundColor: COLORS.BEIGE_SOFT,
    borderColor: COLORS.PRIMARY,
  },
  programName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
  },
  programMeta: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
});
