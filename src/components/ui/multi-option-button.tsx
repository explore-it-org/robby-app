/**
 * Multi-Option Button Component
 *
 * A split button with a main action and a secondary menu button.
 * Main button performs the primary action directly.
 * Secondary button (dropdown arrow) opens a menu for additional options.
 */

import { StyleSheet, Pressable, Text, View } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface MultiOptionButtonProps {
  /** Icon shown on the main button (e.g., "+") */
  icon: string;
  /** Label text for the main button */
  label: string;
  /** Callback when the main button is pressed */
  onMainPress: () => void;
  /** Callback when the menu button is pressed */
  onMenuPress: () => void;
}

export function MultiOptionButton({
  icon,
  label,
  onMainPress,
  onMenuPress,
}: MultiOptionButtonProps) {
  const tintColor = useThemeColor({}, 'tint');

  return (
    <View style={styles.container}>
      {/* Main button - Primary action */}
      <Pressable
        style={({ pressed }) => [
          styles.mainButton,
          { backgroundColor: tintColor, borderColor: tintColor },
          pressed && styles.pressed,
        ]}
        onPress={onMainPress}
      >
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label}>{label}</Text>
      </Pressable>

      {/* Secondary button - Open menu for other options */}
      <Pressable
        style={({ pressed }) => [
          styles.menuButton,
          { backgroundColor: tintColor, borderColor: tintColor },
          pressed && styles.pressed,
        ]}
        onPress={onMenuPress}
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
    paddingVertical: 12,
    gap: 0,
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    minHeight: 44,
    gap: 8,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderWidth: 1,
    borderRightWidth: 0,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 44,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.3)',
  },
  icon: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  menuIcon: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  pressed: {
    opacity: 0.5,
  },
});
