/**
 * FloatingActionButton Component
 *
 * Material Design floating action button.
 * Used consistently across both iOS and Android platforms.
 */

import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol';
import { COLORS } from '@/constants/colors';
import { COMPONENT_SPACING, SHADOW_SPACING } from '@/constants/spacing';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Pressable, StyleSheet } from 'react-native';
import { ReactElement } from 'react';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: IconSymbolName;
  customIcon?: ReactElement;
  position?: 'left' | 'right';
  backgroundColor?: string;
}

export function FloatingActionButton({
  onPress,
  icon = 'plus',
  customIcon,
  position = 'right',
  backgroundColor,
}: FloatingActionButtonProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const fabBackgroundColor = backgroundColor || primaryColor;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.fab,
        position === 'left' ? styles.fabLeft : styles.fabRight,
        { backgroundColor: fabBackgroundColor },
        pressed && styles.fabPressed,
      ]}
    >
      {customIcon || <IconSymbol name={icon} size={24} color={COLORS.WHITE} weight="semibold" />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: COMPONENT_SPACING.FAB_MARGIN_BOTTOM,
    width: COMPONENT_SPACING.FAB_WIDTH,
    height: COMPONENT_SPACING.FAB_HEIGHT,
    borderRadius: COMPONENT_SPACING.FAB_HEIGHT / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.BLACK,
    shadowOffset: SHADOW_SPACING.ELEVATED_OFFSET,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabRight: {
    right: COMPONENT_SPACING.FAB_MARGIN_RIGHT,
  },
  fabLeft: {
    left: COMPONENT_SPACING.FAB_MARGIN_RIGHT,
  },
  fabPressed: {
    opacity: 0.8,
    elevation: 8,
  },
});
