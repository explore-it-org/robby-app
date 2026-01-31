/**
 * Connected Robot Display Component
 *
 * Spacious display of a connected robot showing:
 * - Line 1: Robot name with icon
 * - Line 2: Action buttons (Drive Mode, Record Mode, Run Stored, or Stop)
 * - Line 3: Extended info (firmware and protocol version)
 * - Line 4: Disconnect button
 */

import { ThemedText } from '@/components/ui/themed-text';
import { DownloadIcon } from '@/components/icons/DownloadIcon';
import { PlayIcon } from '@/components/icons/PlayIcon';
import { RecordIcon } from '@/components/icons/RecordIcon';
import { RunStoredIcon } from '@/components/icons/RunStoredIcon';
import { StopIcon } from '@/components/icons/StopIcon';
import { WheelIcon } from '@/components/icons/WheelIcon';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

interface ConnectedRobotDisplayProps {
  robotName: string;
  firmwareVersion: number;
  protocolVersion: string;
  isExecuting: boolean;
  isDownloading: boolean;
  showExtendedInfo: boolean;
  onDriveMode: () => void;
  onRecordMode: () => void;
  onRunStoredInstructions: () => void;
  onDownloadInstructions: () => void;
  onStop: () => void;
  onDisconnect: () => void;
}

export function ConnectedRobotDisplay({
  robotName,
  firmwareVersion,
  protocolVersion,
  isExecuting,
  isDownloading,
  showExtendedInfo,
  onDriveMode,
  onRecordMode,
  onRunStoredInstructions,
  onDownloadInstructions,
  onStop,
  onDisconnect,
}: ConnectedRobotDisplayProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      {/* Line 1: Robot name */}
      <View style={styles.nameRow}>
        <View style={styles.iconContainer}>
          <WheelIcon size={32} color="#FFFFFF" />
        </View>
        <ThemedText style={styles.robotName} numberOfLines={1} ellipsizeMode="tail">
          {robotName}
        </ThemedText>
      </View>

      {/* Line 2: Action buttons */}
      <View style={styles.actionRow}>
        {isDownloading ? (
          <View style={styles.spinnerContainer}>
            <ActivityIndicator size="small" color="#FFFFFF" />
          </View>
        ) : isExecuting ? (
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
            <Pressable
              onPress={onDownloadInstructions}
              style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
            >
              <DownloadIcon size={24} color="#FFFFFF" />
            </Pressable>
          </>
        )}
      </View>

      {/* Line 3: Extended info (conditional) */}
      {showExtendedInfo && (
        <View style={styles.infoRow}>
          <ThemedText style={styles.versionInfo}>
            {t('robot.overview.firmwareVersion', { version: firmwareVersion })} •{' '}
            {t('robot.overview.protocolVersion', { version: protocolVersion })}
          </ThemedText>
        </View>
      )}

      {/* Line 4: Disconnect button */}
      <Pressable
        onPress={onDisconnect}
        style={({ pressed }) => [styles.disconnectButton, pressed && styles.disconnectButtonPressed]}
      >
        <ThemedText style={styles.disconnectButtonText}>
          {t('robotOptionsMenu.disconnect')}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#9370DB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#9370DB',
    padding: 16,
    gap: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  robotName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
  },
  spinnerContainer: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  actionButtonPressed: {
    opacity: 0.5,
  },
  infoRow: {
    alignItems: 'center',
  },
  versionInfo: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  disconnectButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  disconnectButtonPressed: {
    opacity: 0.5,
  },
  disconnectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
