/**
 * SortHeader Component
 *
 * A reusable component for displaying and toggling sort order.
 * Used in program lists to switch between alphabetical and recent sorting.
 */

import { Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/ui/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { SPACING } from '@/constants/spacing';

export type SortOrder = 'recent' | 'alphabetical';

interface Props {
  sortOrder: SortOrder;
  onToggle: () => void;
}

export function SortHeader({ sortOrder, onToggle }: Props) {
  const { t } = useTranslation();
  const tintColor = useThemeColor({}, 'tint');

  return (
    <Pressable onPress={onToggle} style={styles.container}>
      <ThemedText style={[styles.label, { color: tintColor }]}>
        {t('programs.sortedBy', {
          order:
            sortOrder === 'recent'
              ? t('programs.sortRecent')
              : t('programs.sortAlphabetically'),
        })}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.XS,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});
