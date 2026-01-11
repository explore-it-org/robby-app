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

import { ConnectedRobotDisplay } from '@/components/connected-robot-display';
import { WheelIcon } from '@/components/icons/WheelIcon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { COLORS } from '@/constants/colors';
import { StoredRobot } from '@/services/known-robots-storage';
import { useRobotManager } from '@/services/robot-manager-factory';
import { IRobot } from '@/types/robot';
import { DiscoveredRobot, DiscoveryStatus } from '@/types/robot-discovery';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';

export default function RobotScreen() {
  const { t } = useTranslation();
  const { getRobotManager } = useRobotManager();
  const [discoveredRobots, setDiscoveredRobots] = useState<DiscoveredRobot[]>([]);
  const [connectedRobot, setConnectedRobot] = useState<IRobot | null>(null);
  const [connectedRobotDisplay, setConnectedRobotDisplay] = useState<StoredRobot | null>(null);
  const [status, setStatus] = useState<DiscoveryStatus>('idle');

  const robotManager = getRobotManager();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (connectedRobot) {
        connectedRobot.disconnect().catch(console.error);
      }
      if (status === 'scanning') {
        robotManager.stopDiscovery().catch(console.error);
      }
    };
  }, [connectedRobot, robotManager, status]);

  const handleStartScan = async () => {
    try {
      setDiscoveredRobots([]);
      await robotManager.startDiscovery(
        (robot) => {
          // Robot discovered callback
          setDiscoveredRobots((prev) => {
            // Avoid duplicates
            if (prev.some((r) => r.id === robot.id)) {
              return prev;
            }
            return [...prev, robot];
          });
        },
        (newStatus, error) => {
          // Status change callback
          setStatus(newStatus);
          if (error) {
            Alert.alert(t('alerts.error.title'), error.message || 'Scanning error');
          }
        }
      );
    } catch (error) {
      Alert.alert(
        t('alerts.error.title'),
        error instanceof Error ? error.message : 'Failed to start scanning'
      );
    }
  };

  const handleStopScan = async () => {
    try {
      await robotManager.stopDiscovery();
      setStatus('idle');
    } catch (error) {
      Alert.alert(
        t('alerts.error.title'),
        error instanceof Error ? error.message : 'Failed to stop scanning'
      );
    }
  };

  const handleSelectRobot = async (discoveredRobot: DiscoveredRobot) => {
    try {
      // Disconnect current robot if any
      if (connectedRobot) {
        await connectedRobot.disconnect();
        setConnectedRobot(null);
        setConnectedRobotDisplay(null);
      }

      // Stop scanning
      if (status === 'scanning') {
        await robotManager.stopDiscovery();
        setStatus('idle');
      }

      // Create and connect to the robot
      const robot = await robotManager.createRobot(discoveredRobot.id);
      await robot.connect();

      // Create a stored robot object for display
      const robotDisplay: StoredRobot = {
        robotId: robot.id,
        robotName: robot.name || discoveredRobot.name || robot.id,
        addedAt: new Date().toISOString(),
        isVirtual: discoveredRobot.isVirtual || false,
      };

      setConnectedRobot(robot);
      setConnectedRobotDisplay(robotDisplay);
      setDiscoveredRobots([]);
    } catch (error) {
      Alert.alert(
        t('alerts.error.title'),
        error instanceof Error ? error.message : 'Failed to connect to robot'
      );
    }
  };

  const handleScanWhileConnected = () => {
    // Don't disconnect, just start scanning
    handleStartScan();
  };

  const handleUploadAndRun = () => {
    // TODO: Implement upload and run
    Alert.alert('Upload & Run', 'This feature will upload and run the program on the robot');
  };

  const handleStop = async () => {
    if (connectedRobot) {
      try {
        await connectedRobot.stop();
      } catch (error) {
        Alert.alert(
          t('alerts.error.title'),
          error instanceof Error ? error.message : 'Failed to stop robot'
        );
      }
    }
  };

  const handleUpload = () => {
    // TODO: Implement upload
    Alert.alert('Upload', 'This feature will upload the program to the robot');
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
        <ThemedText style={styles.robotItemId}>ID: {item.id}</ThemedText>
      </View>
    </Pressable>
  );

  const isScanning = status === 'scanning';
  const isConnected = connectedRobot !== null && connectedRobot.isConnected;

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
        {isConnected && !isScanning && connectedRobotDisplay ? (
          /* Connected State */
          <View style={styles.connectedContainer}>
            <ConnectedRobotDisplay
              robot={connectedRobotDisplay}
              onUploadAndRun={handleUploadAndRun}
              onStop={handleStop}
              onUpload={handleUpload}
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
        ) : null}
      </View>

      {/* Action Button */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={({ pressed }) => [styles.scanButton, pressed && styles.scanButtonPressed]}
          onPress={
            isScanning ? handleStopScan : isConnected ? handleScanWhileConnected : handleStartScan
          }
        >
          <ThemedText style={styles.scanButtonText}>
            {isScanning ? t('robot.overview.cancelScanning') : t('robot.overview.scanForRobots')}
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  connectedContainer: {
    marginBottom: 20,
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
