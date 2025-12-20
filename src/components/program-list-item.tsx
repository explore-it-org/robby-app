/**
 * ProgramListItem Component
 *
 * Displays a single program entry in the program list.
 * Shows program name, last modified date, and instruction count.
 */

import { StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Program } from '@/types/program';
import { COLORS } from '@/constants/colors';
import { COMPONENT_SPACING, SHADOW_SPACING } from '@/constants/spacing';
import { formatProgramDate } from '@/utils/date-formatter';

interface ProgramListItemProps {
  program: Program;
  onPress: (program: Program) => void;
  isSelected?: boolean;
}

export function ProgramListItem({ program, onPress, isSelected = false }: ProgramListItemProps) {
  const { t } = useTranslation();
  const surfaceColor = useThemeColor({}, 'surface');
  const primaryColor = useThemeColor({}, 'primary');

  // Selected state: explore-it Red background
  const selectedBackgroundColor = primaryColor;
  const selectedTextColor = COLORS.TEXT_INVERTED;
  // Pressed state: same style as selected
  const pressedBackgroundColor = primaryColor;

  return (
    <Pressable onPress={() => onPress(program)} style={styles.container}>
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
              {t('programs.instruction', { count: program.instructionCount })}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: COMPONENT_SPACING.LIST_ITEM_MARGIN_BOTTOM,
  },
  content: {
    padding: COMPONENT_SPACING.LIST_ITEM_PADDING,
    borderRadius: COMPONENT_SPACING.LIST_ITEM_BORDER_RADIUS,
    gap: COMPONENT_SPACING.LIST_ITEM_GAP,
  },
  defaultContent: {
    shadowColor: COLORS.BLACK,
    shadowOffset: SHADOW_SPACING.DEFAULT_OFFSET,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3, // Android shadow
  },
  selectedContent: {
    shadowColor: COLORS.PRIMARY_RED,
    shadowOffset: SHADOW_SPACING.ELEVATED_OFFSET,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6, // Android shadow
  },
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
