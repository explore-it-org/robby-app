/**
 * No Robot Connected Display Component
 *
 * Compact display shown in program detail view when no robot is connected.
 * Shows a light purple card with "No robot connected" message and connect button.
 */

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface NoRobotConnectedDisplayProps {
  onConnect: () => void;
}

export function NoRobotConnectedDisplay({
  onConnect,
}: NoRobotConnectedDisplayProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      {/* Message */}
      <ThemedText style={styles.message}>
        {t('controlBar.noRobotConnected')}
      </ThemedText>

      {/* Connect Button */}
      <Pressable
        onPress={onConnect}
        style={({ pressed }) => [
          styles.connectButton,
          pressed && styles.connectButtonPressed,
        ]}
      >
        <IconSymbol name="bolt.fill" size={16} color="#FFFFFF" />
        <ThemedText style={styles.connectButtonText}>
          {t('controlBar.connect')}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(147, 112, 219, 0.15)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(147, 112, 219, 0.3)',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#9370DB',
  },
  connectButton: {
    flexDirection: 'row',
    backgroundColor: '#9370DB',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    gap: 6,
  },
  connectButtonPressed: {
    opacity: 0.7,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
