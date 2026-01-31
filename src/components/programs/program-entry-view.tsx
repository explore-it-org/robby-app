/**
 * ProgramEntryView Component
 *
 * A reusable component for displaying a program entry in lists.
 * Used in both the program list and the program picker modal.
 */

import { StyleSheet, Pressable, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeColor } from '@/hooks/use-theme-color';
import { COLORS } from '@/constants/colors';
import { COMPONENT_SPACING } from '@/constants/spacing';
import { formatProgramDate } from '@/utils/date-formatter';
import { ProgramInfo } from '@/services/programs';

interface Props {
  program: ProgramInfo;
  onPress: () => void;
  isSelected?: boolean;
}

export function ProgramEntryView({
  program,
  onPress,
  isSelected = false,
}: Props) {
  const { t } = useTranslation();
  const surfaceColor = useThemeColor({}, 'surface');
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');

  const selectedBackgroundColor = primaryColor;
  const selectedTextColor = COLORS.TEXT_INVERTED;
  const pressedBackgroundColor = primaryColor;

  return (
    <Pressable onPress={onPress} style={styles.container}>
      {({ pressed }) => (
        <View
          style={[
            styles.content,
            {
              backgroundColor: isSelected
                ? selectedBackgroundColor
                : pressed
                  ? pressedBackgroundColor
                  : surfaceColor,
            },
          ]}
        >
          <Text
            style={[
              styles.programName,
              { color: isSelected || pressed ? selectedTextColor : textColor },
            ]}
          >
            {program.name}
          </Text>
          <View style={styles.metadata}>
            <Text
              style={[
                styles.metadataText,
                (isSelected || pressed) && { color: selectedTextColor, opacity: 0.9 },
              ]}
            >
              {t('programs.updated')}: {formatProgramDate(program.lastModified)}
            </Text>
            <Text
              style={[
                styles.separator,
                (isSelected || pressed) && { color: selectedTextColor, opacity: 0.7 },
              ]}
            >
              |
            </Text>
            <Text
              style={[
                styles.metadataText,
                (isSelected || pressed) && { color: selectedTextColor, opacity: 0.9 },
              ]}
            >
              {t('programs.instruction', { count: program.statementCount })}
            </Text>
          </View>
        </View>
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
  programName: {
    fontSize: 18,
    fontWeight: '600',
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COMPONENT_SPACING.LIST_ITEM_GAP,
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
