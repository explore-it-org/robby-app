/**
 * Connected Robot Display Component
 *
 * Compact display of a connected robot for the program detail view.
 * Shows robot name with play and stop buttons in a purple card.
 */

import { ThemedText } from '@/components/ui/themed-text';
import { PlayCodeIcon } from '@/components/icons/PlayCodeIcon';
import { StopIcon } from '@/components/icons/StopIcon';
import { UploadIcon } from '@/components/icons/UploadIcon';
import { WheelIcon } from '@/components/icons/WheelIcon';
import { Pressable, StyleSheet, View } from 'react-native';
import { StoredRobot } from '@/services/known-robots-storage';

interface ConnectedRobotDisplayProps {
  robot: StoredRobot;
  onUploadAndRun?: () => void;
  onStop?: () => void;
  onUpload?: () => void;
}

export function ConnectedRobotDisplay({
  robot,
  onUploadAndRun,
  onStop,
  onUpload,
}: ConnectedRobotDisplayProps) {
  return (
    <View style={styles.card}>
      {/* Robot info */}
      <View style={styles.robotInfo}>
        <View style={styles.iconContainer}>
          <WheelIcon size={32} color="#FFFFFF" />
        </View>
        <ThemedText style={styles.robotName} numberOfLines={1} ellipsizeMode="tail">
          {robot.robotName}
        </ThemedText>
      </View>

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <Pressable
          onPress={onUploadAndRun}
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
        >
          <PlayCodeIcon size={24} color="#FFFFFF" />
        </Pressable>
        <Pressable
          onPress={onStop}
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
        >
          <StopIcon size={24} color="#FFFFFF" />
        </Pressable>
        <Pressable
          onPress={onUpload}
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
        >
          <UploadIcon size={24} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#9370DB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#9370DB',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  robotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 1,
    minWidth: 0, // Allow text to shrink
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  robotName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    flexShrink: 0, // Prevent buttons from shrinking
  },
  actionButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonPressed: {
    opacity: 0.5,
  },
});
