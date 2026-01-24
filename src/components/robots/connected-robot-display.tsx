/**
 * Connected Robot Display Component
 *
 * Compact display of a connected robot showing:
 * - Robot name, firmware version, and protocol version
 * - Ready state: Drive Mode (Play) and Record Mode (Record) buttons
 * - Executing state: Stop button
 */

import { ThemedText } from '@/components/ui/themed-text';
import { PlayIcon } from '@/components/icons/PlayIcon';
import { RecordIcon } from '@/components/icons/RecordIcon';
import { RunStoredIcon } from '@/components/icons/RunStoredIcon';
import { StopIcon } from '@/components/icons/StopIcon';
import { WheelIcon } from '@/components/icons/WheelIcon';
import { Pressable, StyleSheet, View } from 'react-native';

interface ConnectedRobotDisplayProps {
  robotName: string;
  firmwareVersion: number;
  protocolVersion: string;
  isExecuting: boolean;
  onDriveMode: () => void;
  onRecordMode: () => void;
  onRunStoredInstructions: () => void;
  onStop: () => void;
}

export function ConnectedRobotDisplay({
  robotName,
  firmwareVersion,
  protocolVersion,
  isExecuting,
  onDriveMode,
  onRecordMode,
  onRunStoredInstructions,
  onStop,
}: ConnectedRobotDisplayProps) {
  return (
    <View style={styles.card}>
      {/* Robot info */}
      <View style={styles.robotInfo}>
        <View style={styles.iconContainer}>
          <WheelIcon size={32} color="#FFFFFF" />
        </View>
        <View style={styles.textContainer}>
          <ThemedText style={styles.robotName} numberOfLines={1} ellipsizeMode="tail">
            {robotName}
          </ThemedText>
          <ThemedText style={styles.versionInfo}>
            Firmware v{firmwareVersion} • Protocol {protocolVersion}
          </ThemedText>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actionRow}>
        {isExecuting ? (
          <Pressable
            onPress={onStop}
            style={({ pressed }) => [
              styles.actionButton,
              styles.stopButton,
              pressed && styles.actionButtonPressed,
            ]}
          >
            <StopIcon size={24} color="#FFFFFF" />
          </Pressable>
        ) : (
          <>
            <Pressable
              onPress={onDriveMode}
              style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
            >
              <PlayIcon size={24} color="#FFFFFF" />
            </Pressable>
            <Pressable
              onPress={onRecordMode}
              style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
            >
              <RecordIcon size={24} color="#FFFFFF" />
            </Pressable>
            <Pressable
              onPress={onRunStoredInstructions}
              style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
            >
              <RunStoredIcon size={24} color="#FFFFFF" />
            </Pressable>
          </>
        )}
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  robotName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  versionInfo: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    flexShrink: 0,
  },
  actionButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  actionButtonPressed: {
    opacity: 0.5,
  },
});
