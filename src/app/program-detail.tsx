/**
 * Program Detail Screen (Placeholder)
 *
 * Full-screen placeholder for program details (used on phone layout).
 * Full implementation will be defined in a future specification.
 */

import { ProgramDetailContent } from '@/components/program-detail-content';
import { ThemedView } from '@/components/themed-view';
import { COLORS } from '@/constants/colors';
import { LAYOUT_SPACING } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

export default function ProgramDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
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
      <ProgramDetailContent programId={id} isEmbedded={false} />
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
