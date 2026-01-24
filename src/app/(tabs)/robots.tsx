/**
 * Robot Screen - Simplified
 *
 * Displays robot connection interface with three states:
 * 1. Empty (no robot connected): Shows title and "Scan for Robots" button
 * 2. Scanning: Shows title, "Cancel Scanning" button, and list of discovered robots
 * 3. Connected: Shows title, connected robot widget, and "Scan for Robots" button
 *
 * Only one robot can be connected at a time. No robot history is stored.
 */

import { ConnectedRobotDisplay } from '@/components/robots/connected-robot-display';
import { WheelIcon } from '@/components/icons/WheelIcon';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { COLORS } from '@/constants/colors';
import { useConnectedRobot } from '@/contexts/connected-robot-context';
import {
  ConnectedRobotState,
  DiscoveredRobot,
  useRobotDiscovery,
} from '@/hooks/use-robot-discovery';
import { useSettings } from '@/hooks/use-settings';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';

export default function RobotScreen() {
  const { t } = useTranslation();
  const { recordingDuration, showExtendedRobotInfo } = useSettings();
  const { state, discoveredRobots, startDiscovery, stopDiscovery } = useRobotDiscovery();
  const { robot, setRobot } = useConnectedRobot();
  const [connectedRobotName, setConnectedRobotName] = useState<string | null>(null);
  const [firmwareVersion, setFirmwareVersion] = useState<number>(0);
  const [protocolVersion, setProtocolVersion] = useState<string>('');
  const [robotState, setRobotState] = useState<ConnectedRobotState>('ready');

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state === 'running') {
        stopDiscovery().catch(console.error);
      }
    };
  }, [state, stopDiscovery]);

  const handleStartScan = async () => {
    try {
      await startDiscovery();
    } catch (error) {
      Alert.alert(
        t('alerts.error.title'),
        error instanceof Error ? error.message : t('alerts.error.startScanFailed')
      );
    }
  };

  const handleStopScan = async () => {
    try {
      await stopDiscovery();
    } catch (error) {
      Alert.alert(
        t('alerts.error.title'),
        error instanceof Error ? error.message : t('alerts.error.stopScanFailed')
      );
    }
  };

  const handleSelectRobot = async (discoveredRobot: DiscoveredRobot) => {
    try {
      await stopDiscovery();
      const connectedRobot = await discoveredRobot.connect();
      setRobot(connectedRobot);
      setConnectedRobotName(connectedRobot.name);
      setFirmwareVersion(connectedRobot.firmwareVersion);
      setProtocolVersion(connectedRobot.protocolVersion);
      setRobotState(connectedRobot.state);

      // Listen for state changes
      connectedRobot.onStateChange((newState) => {
        setRobotState(newState);
      });

      // Listen for disconnection
      connectedRobot.onDisconnect(() => {
        setRobot(null);
        setConnectedRobotName(null);
        setFirmwareVersion(0);
        setProtocolVersion('');
        setRobotState('ready');
      });
    } catch (error) {
      Alert.alert(
        t('alerts.error.title'),
        error instanceof Error ? error.message : t('alerts.error.connectFailed')
      );
    }
  };

  const handleDriveMode = async () => {
    if (!robot) {
      Alert.alert(t('alerts.error.title'), t('controlBar.noRobotConnected'));
      return;
    }
    try {
      await robot.startDriveMode();
    } catch (error) {
      Alert.alert(
        t('alerts.error.title'),
        error instanceof Error ? error.message : t('alerts.error.driveModeFailed')
      );
    }
  };

  const handleRecordMode = async () => {
    if (!robot) {
      Alert.alert(t('alerts.error.title'), t('controlBar.noRobotConnected'));
      return;
    }
    try {
      const interval = 2;
      await robot.recordInstructions(recordingDuration, interval);
    } catch (error) {
      Alert.alert(
        t('alerts.error.title'),
        error instanceof Error ? error.message : t('alerts.error.recordModeFailed')
      );
    }
  };

  const handleRunStoredInstructions = async () => {
    if (!robot) {
      Alert.alert(t('alerts.error.title'), t('controlBar.noRobotConnected'));
      return;
    }
    try {
      await robot.runStoredInstructions();
    } catch (error) {
      Alert.alert(
        t('alerts.error.title'),
        error instanceof Error ? error.message : t('alerts.error.runStoredFailed')
      );
    }
  };

  const handleStop = async () => {
    if (!robot) {
      Alert.alert(t('alerts.error.title'), t('controlBar.noRobotConnected'));
      return;
    }
    try {
      await robot.stop();
    } catch (error) {
      Alert.alert(
        t('alerts.error.title'),
        error instanceof Error ? error.message : t('alerts.error.stopFailed')
      );
    }
  };

  const handleDisconnect = async () => {
    if (!robot) {
      return;
    }
    try {
      await robot.disconnect();
      setRobot(null);
      setConnectedRobotName(null);
      setFirmwareVersion(0);
      setProtocolVersion('');
      setRobotState('ready');
    } catch (error) {
      Alert.alert(
        t('alerts.error.title'),
        error instanceof Error ? error.message : t('alerts.error.disconnectFailed')
      );
    }
  };

  const renderRobotItem = ({ item }: { item: DiscoveredRobot }) => (
    <Pressable
      style={({ pressed }) => [styles.robotItem, pressed && styles.robotItemPressed]}
      onPress={() => handleSelectRobot(item)}
    >
      <View style={styles.robotItemIcon}>
        <WheelIcon size={32} color={COLORS.PRIMARY} />
      </View>
      <View style={styles.robotItemInfo}>
        <ThemedText style={styles.robotItemName}>{item.name || item.id}</ThemedText>
        <ThemedText style={styles.robotItemId}>{t('robot.overview.robotId', { id: item.id })}</ThemedText>
      </View>
    </Pressable>
  );

  const isScanning = state === 'running';
  const isConnected = connectedRobotName !== null;
  const isExecuting = robotState === 'executing' || robotState === 'stopping';

  return (
    <ThemedView style={styles.container}>
      {/* Title */}
      <View style={styles.titleContainer}>
        <ThemedText type="title" style={styles.title}>
          {t('robot.overview.title')}
        </ThemedText>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {isConnected && !isScanning && connectedRobotName ? (
          /* Connected State */
          <View style={styles.connectedContainer}>
            <ConnectedRobotDisplay
              robotName={connectedRobotName}
              firmwareVersion={firmwareVersion}
              protocolVersion={protocolVersion}
              isExecuting={isExecuting}
              showExtendedInfo={showExtendedRobotInfo}
              onDriveMode={handleDriveMode}
              onRecordMode={handleRecordMode}
              onRunStoredInstructions={handleRunStoredInstructions}
              onStop={handleStop}
              onDisconnect={handleDisconnect}
            />
          </View>
        ) : null}

        {isScanning ? (
          /* Scanning State */
          <View style={styles.scanningContainer}>
            <View style={styles.scanningHeader}>
              <ActivityIndicator size="small" color={COLORS.PRIMARY} />
              <ThemedText style={styles.scanningText}>{t('robot.overview.scanning')}</ThemedText>
            </View>

            {discoveredRobots.length > 0 ? (
              <>
                <ThemedText style={styles.selectRobotText}>
                  {t('robot.overview.selectRobotToConnect')}
                </ThemedText>
                <FlatList
                  data={discoveredRobots}
                  renderItem={renderRobotItem}
                  keyExtractor={(item) => item.id}
                  style={styles.robotList}
                  contentContainerStyle={styles.robotListContent}
                />
              </>
            ) : (
              <View style={styles.noRobotsContainer}>
                <ThemedText style={styles.noRobotsText}>
                  {t('robotScanner.noRobotsFound')}
                </ThemedText>
                <ThemedText style={styles.waitingText}>
                  {t('robotScanner.waitingForRobots')}
                </ThemedText>
              </View>
            )}
          </View>
        ) : !isConnected ? (
          /* Empty State */
          <View style={styles.emptyStateContainer}>
            <ThemedText style={styles.emptyStateText}>
              {t('controlBar.noRobotConnected')}
            </ThemedText>
          </View>
        ) : null}
      </View>

      {/* Action Button - hidden when connected */}
      {!isConnected || isScanning ? (
        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [styles.scanButton, pressed && styles.scanButtonPressed]}
            onPress={isScanning ? handleStopScan : handleStartScan}
          >
            <ThemedText style={styles.scanButtonText}>
              {isScanning ? t('robot.overview.cancelScanning') : t('robot.overview.scanForRobots')}
            </ThemedText>
          </Pressable>
        </View>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 32,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 56,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  connectedContainer: {
    marginBottom: 20,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    opacity: 0.5,
  },
  scanningContainer: {
    flex: 1,
  },
  scanningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  scanningText: {
    fontSize: 16,
    opacity: 0.7,
  },
  selectRobotText: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 12,
  },
  robotList: {
    flex: 1,
  },
  robotListContent: {
    gap: 8,
  },
  robotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    padding: 16,
    gap: 16,
  },
  robotItemPressed: {
    opacity: 0.7,
    backgroundColor: COLORS.SELECTED_ITEM_BACKGROUND,
  },
  robotItemIcon: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  robotItemInfo: {
    flex: 1,
  },
  robotItemName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  robotItemId: {
    fontSize: 14,
    opacity: 0.6,
  },
  noRobotsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noRobotsText: {
    fontSize: 16,
    opacity: 0.6,
    marginBottom: 8,
    textAlign: 'center',
  },
  waitingText: {
    fontSize: 14,
    opacity: 0.4,
    textAlign: 'center',
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  scanButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonPressed: {
    opacity: 0.7,
  },
  scanButtonText: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: '600',
  },
});
