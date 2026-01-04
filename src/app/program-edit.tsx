import { ProgramEditor } from '@/components/programs';
import { ThemedView } from '@/components/themed-view';
import { COLORS } from '@/constants/colors';
import { LAYOUT_SPACING } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

export default function ProgramEditScreen() {
  const { name: initialName } = useLocalSearchParams<{ name: string }>();
  const [name, setName] = useState(initialName);

  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: t('tabs.programs'),
          headerBackTitle: t('tabs.programs'),
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].primary,
          },
          headerTintColor: COLORS.WHITE,
          headerTitleStyle: {
            color: COLORS.WHITE,
            fontWeight: '600',
          },
        }}
      />
      <ProgramEditor programName={name} onProgramRenamed={setName} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: LAYOUT_SPACING.SCREEN_PADDING,
    gap: LAYOUT_SPACING.ELEMENT_GAP,
  },
  subtitle: {
    opacity: 0.7,
  },
});
