import { Pressable, StyleSheet, View } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';

interface Props {
  programName: string;
  onMenuRequested: () => void;
}

export function ProgramHeader({ programName, onMenuRequested }: Props) {
  const borderColor = useThemeColor({}, 'border');
  const iconColor = useThemeColor({}, 'icon');

  return (
    <View style={[styles.container, { borderBottomColor: borderColor }]}>
      <ThemedText type="title" style={styles.nameText}>
        {programName}
      </ThemedText>
      <Pressable
        style={({ pressed }) => [styles.menuButton, pressed && styles.menuButtonPressed]}
        onPress={onMenuRequested}
      >
        <IconSymbol name="ellipsis.circle" size={28} color={iconColor} />
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
});
