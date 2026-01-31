/**
 * ProgramListItem Component
 *
 * Displays a single program entry in the program list.
 * Shows program name, last modified date, and instruction count.
 */

import { StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { COLORS } from '@/constants/colors';
import { COMPONENT_SPACING } from '@/constants/spacing';
import { formatProgramDate } from '@/utils/date-formatter';
import { ProgramInfo } from '@/services/programs';

interface Props {
  program: ProgramInfo;
  onSelected: (name: string) => void;
  isSelected: boolean;
}

export function ProgramListItem({ program, onSelected: onPress, isSelected }: Props) {
  const { t } = useTranslation();
  const surfaceColor = useThemeColor({}, 'surface');
  const primaryColor = useThemeColor({}, 'primary');

  const selectedBackgroundColor = primaryColor;
  const selectedTextColor = COLORS.TEXT_INVERTED;
  // Pressed state: same style as selected
  const pressedBackgroundColor = primaryColor;

  return (
    <Pressable onPress={() => onPress(program.name)} style={styles.container}>
      {({ pressed }) => (
        <ThemedView
          style={[
            styles.content,
            isSelected ? styles.selectedContent : styles.defaultContent,
            {
              backgroundColor: isSelected
                ? selectedBackgroundColor
                : pressed
                  ? pressedBackgroundColor
                  : surfaceColor,
            },
          ]}
        >
          <ThemedText
            type="defaultSemiBold"
            style={[styles.programName, (isSelected || pressed) && { color: selectedTextColor }]}
          >
            {program.name}
          </ThemedText>
          <ThemedView style={styles.metadata} lightColor="transparent" darkColor="transparent">
            <ThemedText
              style={[
                styles.metadataText,
                (isSelected || pressed) && { color: selectedTextColor, opacity: 0.9 },
              ]}
            >
              {t('programs.updated')}: {formatProgramDate(program.lastModified)}
            </ThemedText>
            <ThemedText
              style={[
                styles.separator,
                (isSelected || pressed) && { color: selectedTextColor, opacity: 0.7 },
              ]}
            >
              |
            </ThemedText>
            <ThemedText
              style={[
                styles.metadataText,
                (isSelected || pressed) && { color: selectedTextColor, opacity: 0.9 },
              ]}
            >
              {t('programs.instruction', { count: program.statementCount })}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT,
  },
  content: {
    padding: COMPONENT_SPACING.LIST_ITEM_PADDING,
    gap: COMPONENT_SPACING.LIST_ITEM_GAP,
  },
  defaultContent: {},
  selectedContent: {},
  programName: {
    fontSize: 18, // Style guide: 18px for program names
    fontWeight: '600', // Semibold
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COMPONENT_SPACING.LIST_ITEM_GAP,
  },
  metadataText: {
    fontSize: 14, // Style guide: 14px for metadata
    color: COLORS.GRAY_MEDIUM,
  },
  separator: {
    fontSize: 14,
    color: COLORS.GRAY_MEDIUM,
    opacity: 0.5,
  },
});
