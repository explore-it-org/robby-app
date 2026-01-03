/**
 * Add Instruction Button Component
 *
 * Split button to add a new instruction at a specific position in the program.
 * Main button adds a Move instruction directly.
 * Secondary button (dropdown arrow) opens menu to select other instruction types.
 */

import { StyleSheet, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';

interface AddInstructionButtonProps {
  onAddMove: () => void;
  onOpenMenu: () => void;
}

export function AddInstructionButton({ onAddMove, onOpenMenu }: AddInstructionButtonProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* Main button - Add Move instruction */}
      <Pressable
        style={({ pressed }) => [styles.mainButton, pressed && styles.pressed]}
        onPress={onAddMove}
      >
        <Text style={styles.icon}>+</Text>
        <Text style={styles.label}>{t('instructionPicker.addMove')}</Text>
      </Pressable>

      {/* Secondary button - Open menu for other types */}
      <Pressable
        style={({ pressed }) => [styles.menuButton, pressed && styles.pressed]}
        onPress={onOpenMenu}
      >
        <Text style={styles.menuIcon}>▼</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.MD,
    gap: 0,
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.LG,
    minHeight: 44,
    gap: SPACING.SM,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    backgroundColor: COLORS.CURIOUS_BLUE,
    borderWidth: 1,
    borderColor: COLORS.CURIOUS_BLUE,
    borderRightWidth: 0,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
    minHeight: 44,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: COLORS.CURIOUS_BLUE,
    borderWidth: 1,
    borderColor: COLORS.CURIOUS_BLUE,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.3)',
  },
  icon: {
    fontSize: 18,
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    color: COLORS.WHITE,
    fontWeight: '600',
  },
  menuIcon: {
    fontSize: 12,
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
  pressed: {
    opacity: 0.5,
  },
});
