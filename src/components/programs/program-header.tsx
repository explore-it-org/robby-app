import { Pressable, StyleSheet, View, Text } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';
import { COLORS } from '@/constants/colors';

interface Props {
  programName: string;
  onMenuRequested: () => void;
}

export function ProgramHeader({ programName, onMenuRequested }: Props) {
  const borderColor = useThemeColor({}, 'border');

  return (
    <View style={[styles.container, { borderBottomColor: borderColor }]}>
      <ThemedText type="title" style={styles.nameText}>
        {programName}
      </ThemedText>
      <Pressable
        style={({ pressed }) => [styles.menuButton, pressed && styles.menuButtonPressed]}
        onPress={onMenuRequested}
        hitSlop={8}
      >
        <Text style={styles.menuIcon}>⋯</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  nameText: {
    flex: 1,
  },
  menuButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonPressed: {
    opacity: 0.5,
  },
  menuIcon: {
    fontSize: 28,
    color: COLORS.TEXT_SECONDARY,
  },
});
