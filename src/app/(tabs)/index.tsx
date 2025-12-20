import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { RobotScannerModal } from '@/components/robot-scanner-modal';
import { RobotMenuModal } from '@/components/robot-menu-modal';
import { RobotRenameModal } from '@/components/robot-rename-modal';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { RobotCard } from '@/components/robot-card';
import { WheelIcon } from '@/components/icons/WheelIcon';
import { BluetoothIcon } from '@/components/icons/BluetoothIcon';
import { DiscoveredRobot } from '@/types/robot-discovery';
import {
  loadKnownRobots,
  addKnownRobot,
  removeKnownRobot,
  renameKnownRobot,
  StoredRobot,
} from '@/services/known-robots-storage';
import {
  isRobotConnected,
  setRobotConnected,
  setRobotDisconnected,
  updateConnectedRobotName,
} from '@/services/robot-connection-state';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

export default function RobotScreen() {
  const { t } = useTranslation();
  const [knownRobots, setKnownRobots] = useState<StoredRobot[]>([]);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showRobotMenu, setShowRobotMenu] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [selectedRobotForMenu, setSelectedRobotForMenu] = useState<StoredRobot | null>(null);
  const [, forceUpdate] = useState(0); // Used to trigger re-renders when connection state changes

  // Load known robots on mount
  useEffect(() => {
    const loadRobots = async () => {
      const robots = await loadKnownRobots();
      setKnownRobots(robots);
    };
    loadRobots();
  }, []);

  const handleSelectRobot = async (robot: DiscoveredRobot) => {
    try {
      const wasAdded = await addKnownRobot(robot);
      if (wasAdded) {
        // Disconnect any previously connected robot
        const connectedRobotIds = knownRobots
          .map(r => r.robotId)
          .filter(id => isRobotConnected(id));

        connectedRobotIds.forEach(id => setRobotDisconnected(id));

        // Reload the list to get the newly added robot with full data
        const robots = await loadKnownRobots();
        setKnownRobots(robots);

        // Find the newly added robot and connect it with full data
        const addedRobot = robots.find(r => r.robotId === robot.id);
        if (addedRobot) {
          setRobotConnected(robot.id, addedRobot);
        }

        forceUpdate((n) => n + 1); // Trigger re-render
      } else {
        Alert.alert(
          t('alerts.info.title') || 'Info',
          'This robot has already been added to your list.'
        );
      }
    } catch (error) {
      Alert.alert(
        t('alerts.error.title'),
        error instanceof Error ? error.message : t('alerts.error.saveRobotFailed')
      );
    }
  };

  const handleRemoveRobot = async (robotId: string) => {
    try {
      await removeKnownRobot(robotId);
      // Reload the list
      const robots = await loadKnownRobots();
      setKnownRobots(robots);
    } catch (error) {
      Alert.alert(
        t('alerts.error.title'),
        error instanceof Error ? error.message : 'Failed to remove robot'
      );
    }
  };

  // Robot menu handlers
  const handleOpenRobotMenu = (robot: StoredRobot) => {
    setSelectedRobotForMenu(robot);
    setShowRobotMenu(true);
  };

  const handleConnect = (robot: StoredRobot) => {
    // TODO: Implement actual BLE connection logic
    // Disconnect any previously connected robot
    const connectedRobotIds = knownRobots
      .map(r => r.robotId)
      .filter(id => isRobotConnected(id));

    connectedRobotIds.forEach(id => setRobotDisconnected(id));

    // Connect the new robot with full data
    setRobotConnected(robot.robotId, robot);
    forceUpdate((n) => n + 1); // Trigger re-render
  };

  const handleRename = () => {
    setShowRenameModal(true);
  };

  const handleRenameConfirm = async (newName: string) => {
    if (selectedRobotForMenu) {
      try {
        await renameKnownRobot(selectedRobotForMenu.robotId, newName);

        // Update the connected robot name if this robot is connected
        if (isRobotConnected(selectedRobotForMenu.robotId)) {
          updateConnectedRobotName(selectedRobotForMenu.robotId, newName);
        }

        // Reload the list
        const robots = await loadKnownRobots();
        setKnownRobots(robots);
        forceUpdate((n) => n + 1); // Trigger re-render
      } catch (error) {
        Alert.alert(
          'Error',
          error instanceof Error ? error.message : 'Failed to rename robot'
        );
      }
    }
  };

  const handleDisconnect = () => {
    if (selectedRobotForMenu) {
      setRobotDisconnected(selectedRobotForMenu.robotId);
      forceUpdate((n) => n + 1); // Trigger re-render
    }
  };

  const handleDelete = () => {
    if (selectedRobotForMenu) {
      Alert.alert(
        t('robot.overview.deleteConfirm.title'),
        t('robot.overview.deleteConfirm.message', { name: selectedRobotForMenu.robotName }),
        [
          {
            text: t('common.cancel'),
            style: 'cancel',
          },
          {
            text: t('alerts.deleteProgram.confirm'),
            style: 'destructive',
            onPress: () => {
              setRobotDisconnected(selectedRobotForMenu.robotId);
              handleRemoveRobot(selectedRobotForMenu.robotId);
            },
          },
        ]
      );
    }
  };


  // Find connected robot
  const connectedRobot = knownRobots.find((robot) => isRobotConnected(robot.robotId));

  return (
    <ThemedView style={styles.container}>
      {knownRobots.length > 0 ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Connected Robot Section */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t('robot.overview.connectedRobot')}
            </ThemedText>
            {connectedRobot ? (
              <RobotCard
                robot={connectedRobot}
                isConnected={true}
                onMenuPress={() => handleOpenRobotMenu(connectedRobot)}
                onConnect={() => handleConnect(connectedRobot)}
                onPlay={() => {
                  // TODO: Implement play logic
                  Alert.alert('Play', `Playing program on ${connectedRobot.robotName}`);
                }}
                onStop={() => {
                  // TODO: Implement stop logic
                  Alert.alert('Stop', `Stopping ${connectedRobot.robotName}`);
                }}
                onRecord={() => {
                  // TODO: Implement record logic
                  Alert.alert('Record', `Recording from ${connectedRobot.robotName}`);
                }}
                onDownload={() => {
                  // TODO: Implement download logic
                  Alert.alert('Download', `Downloading from ${connectedRobot.robotName}`);
                }}
              />
            ) : (
              <View style={styles.placeholderCard}>
                <WheelIcon size={48} color="#9370DB" />
                <ThemedText style={styles.placeholderText}>
                  {t('robot.overview.noRobotConnected')}
                </ThemedText>
              </View>
            )}
          </View>

          {/* Known Robots Section */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t('robot.overview.knownRobots')}
            </ThemedText>
            {knownRobots.filter((item) => !isRobotConnected(item.robotId)).length === 0 ? (
              <View style={styles.placeholderCard}>
                <ThemedText style={styles.placeholderText}>
                  {t('robot.overview.noOtherRobots')}
                </ThemedText>
              </View>
            ) : (
              knownRobots
                .filter((item) => !isRobotConnected(item.robotId))
                .map((item) => (
                  <RobotCard
                    key={item.robotId}
                    robot={item}
                    isConnected={false}
                    onMenuPress={() => handleOpenRobotMenu(item)}
                    onConnect={() => handleConnect(item)}
                    onPlay={() => {
                      // TODO: Implement play logic
                      Alert.alert('Play', `Playing program on ${item.robotName}`);
                    }}
                    onStop={() => {
                      // TODO: Implement stop logic
                      Alert.alert('Stop', `Stopping ${item.robotName}`);
                    }}
                    onRecord={() => {
                      // TODO: Implement record logic
                      Alert.alert('Record', `Recording from ${item.robotName}`);
                    }}
                    onDownload={() => {
                      // TODO: Implement download logic
                      Alert.alert('Download', `Downloading from ${item.robotName}`);
                    }}
                  />
                ))
            )}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateContent}>
            <ThemedText type="title" style={styles.emptyStateTitle}>
              {t('robot.overview.title')}
            </ThemedText>
            <ThemedText style={styles.emptyStateMessage}>
              {t('robot.overview.emptyState.message')}
            </ThemedText>
            <ThemedText style={styles.emptyStateInstructions}>
              {t('robot.overview.emptyState.instructions')}
            </ThemedText>
          </View>
        </View>
      )}

      {/* Floating Action Button */}
      <FloatingActionButton
        customIcon={<BluetoothIcon size={24} color="#FFFFFF" />}
        onPress={() => setShowScannerModal(true)}
        backgroundColor="#9370DB"
      />

      {/* Robot Scanner Modal */}
      <RobotScannerModal
        visible={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onSelectRobot={handleSelectRobot}
        knownRobotIds={knownRobots.map(robot => robot.robotId)}
      />

      {/* Robot Menu Modal */}
      {selectedRobotForMenu && (
        <RobotMenuModal
          visible={showRobotMenu}
          robotName={selectedRobotForMenu.robotName}
          isConnected={isRobotConnected(selectedRobotForMenu.robotId)}
          onClose={() => setShowRobotMenu(false)}
          onRename={handleRename}
          onDisconnect={handleDisconnect}
          onDelete={handleDelete}
        />
      )}

      {/* Robot Rename Modal */}
      {selectedRobotForMenu && (
        <RobotRenameModal
          visible={showRenameModal}
          robotName={selectedRobotForMenu.robotName}
          onClose={() => setShowRenameModal(false)}
          onRename={handleRenameConfirm}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  placeholderCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  placeholderText: {
    fontSize: 16,
    opacity: 0.5,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateContent: {
    alignItems: 'center',
    gap: 16,
    maxWidth: 400,
  },
  emptyStateTitle: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 60,
    paddingVertical: 8,
  },
  emptyStateMessage: {
    fontSize: 18,
    opacity: 0.7,
    textAlign: 'center',
  },
  emptyStateInstructions: {
    fontSize: 16,
    opacity: 0.5,
    textAlign: 'center',
    marginTop: 8,
  },
});
