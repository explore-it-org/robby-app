/**
 * Robot Card Component
 *
 * Displays a robot in a large purple card with name and bluetooth ID
 */

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PlayIcon } from '@/components/icons/PlayIcon';
import { StopIcon } from '@/components/icons/StopIcon';
import { RecordIcon } from '@/components/icons/RecordIcon';
import { DownloadIcon } from '@/components/icons/DownloadIcon';
import { WheelIcon } from '@/components/icons/WheelIcon';
import { Pressable, StyleSheet, View } from 'react-native';
import { StoredRobot } from '@/services/known-robots-storage';
import { useTranslation } from 'react-i18next';

interface RobotCardProps {
  robot: StoredRobot;
  isConnected?: boolean;
  onMenuPress?: () => void;
  onConnect?: () => void;
  onPlay?: () => void;
  onStop?: () => void;
  onRecord?: () => void;
  onDownload?: () => void;
}

export function RobotCard({
  robot,
  isConnected = false,
  onMenuPress,
  onConnect,
  onPlay,
  onStop,
  onRecord,
  onDownload,
}: RobotCardProps) {
  const { t } = useTranslation();

  return (
    <View
      style={[
        styles.card,
        robot.isVirtual && styles.virtualCard,
        isConnected && styles.connectedCard,
      ]}
    >
      {/* Header with robot info and menu button */}
      <View style={styles.header}>
        <View style={styles.robotInfoContainer}>
          <View style={styles.robotIconContainer}>
            <WheelIcon size={48} color={isConnected ? '#FFFFFF' : '#9370DB'} />
          </View>
          <View style={styles.robotInfo}>
            <ThemedText style={[styles.robotName, isConnected && styles.whiteText]}>
              {robot.robotName}
            </ThemedText>
            <ThemedText style={[styles.robotId, isConnected && styles.whiteText]}>
              {robot.isVirtual ? 'Virtual Robot' : `ID: ${robot.robotId}`}
            </ThemedText>
          </View>
        </View>
        <Pressable
          onPress={onMenuPress}
          style={({ pressed }) => [styles.menuButton, pressed && styles.menuButtonPressed]}
        >
          <IconSymbol
            name="ellipsis.circle"
            size={24}
            color={isConnected ? '#FFFFFF' : '#9370DB'}
          />
        </Pressable>
      </View>

      {/* Action buttons row */}
      <View style={styles.actionRow}>
        {isConnected ? (
          <>
            <Pressable
              onPress={onPlay}
              style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
            >
              <PlayIcon size={24} color="#FFFFFF" />
            </Pressable>
            <Pressable
              onPress={onStop}
              style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
            >
              <StopIcon size={24} color="#FFFFFF" />
            </Pressable>
            <Pressable
              onPress={onRecord}
              style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
            >
              <RecordIcon size={24} color="#FFFFFF" />
            </Pressable>
            <Pressable
              onPress={onDownload}
              style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
            >
              <DownloadIcon size={24} color="#FFFFFF" />
            </Pressable>
          </>
        ) : (
          <Pressable
            onPress={onConnect}
            style={({ pressed }) => [styles.connectButton, pressed && styles.connectButtonPressed]}
          >
            <IconSymbol name="bolt.fill" size={18} color="#FFFFFF" />
            <ThemedText style={styles.connectButtonText}>{t('controlBar.connect')}</ThemedText>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(147, 112, 219, 0.15)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(147, 112, 219, 0.4)',
    padding: 20,
    marginBottom: 12,
    gap: 16,
  },
  virtualCard: {
    backgroundColor: 'rgba(147, 112, 219, 0.2)',
    borderColor: 'rgba(147, 112, 219, 0.5)',
  },
  connectedCard: {
    backgroundColor: '#9370DB',
    borderColor: '#9370DB',
  },
  whiteText: {
    color: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  robotInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  robotIconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  robotInfo: {
    flex: 1,
    gap: 6,
  },
  robotName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#9370DB',
  },
  robotId: {
    fontSize: 14,
    opacity: 0.7,
    fontWeight: '500',
  },
  menuButton: {
    padding: 4,
    marginTop: -4,
    marginRight: -4,
  },
  menuButtonPressed: {
    opacity: 0.5,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonPressed: {
    opacity: 0.5,
  },
  connectButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#9370DB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  connectButtonPressed: {
    opacity: 0.7,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
