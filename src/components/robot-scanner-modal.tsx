/**
 * Robot Scanner Modal
 *
 * Modal dialog for scanning and selecting robots.
 * Automatically starts scanning when opened and stops when closed or a robot is selected.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { DiscoveredRobot, DiscoveryStatus } from '@/types/robot-discovery';
import { useRobotManager } from '@/services/robot-manager-factory';
import { WheelIcon } from '@/components/icons/WheelIcon';

interface RobotScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectRobot: (robot: DiscoveredRobot) => void;
  knownRobotIds?: string[];
}

export function RobotScannerModal({ visible, onClose, onSelectRobot, knownRobotIds = [] }: RobotScannerModalProps) {
  const { t } = useTranslation();
  const { getRobotManager } = useRobotManager();
  const [discoveryStatus, setDiscoveryStatus] = useState<DiscoveryStatus>('idle');
  const [discoveredRobots, setDiscoveredRobots] = useState<DiscoveredRobot[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  // Auto-start scanning when modal opens
  useEffect(() => {
    if (!visible) {
      return;
    }

    isMountedRef.current = true; // Reset on modal open

    const startScanning = async () => {
      const manager = getRobotManager();
      setDiscoveredRobots([]);
      setErrorMessage(null);

      await manager.startDiscovery(
        (robot) => {
          if (isMountedRef.current) {
            setDiscoveredRobots((prev) => {
              // Avoid duplicates
              const exists = prev.some((r) => r.id === robot.id);
              if (exists) {
                return prev;
              }
              return [...prev, robot];
            });
          }
        },
        (status, error) => {
          if (isMountedRef.current) {
            setDiscoveryStatus(status);
            if (error) {
              setErrorMessage(error.message);
            }
          }
        }
      );
    };

    startScanning();

    // Cleanup: stop scanning when modal closes
    return () => {
      (async () => {
        const manager = getRobotManager();
        if (manager.getStatus() === 'scanning') {
          await manager.stopDiscovery();
        }
      })();
    };
  }, [visible, getRobotManager]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleSelectRobot = async (robot: DiscoveredRobot) => {
    // Stop scanning
    const manager = getRobotManager();
    if (manager.getStatus() === 'scanning') {
      await manager.stopDiscovery();
    }

    // Notify parent
    onSelectRobot(robot);
    onClose();
  };

  const handleClose = async () => {
    // Stop scanning
    const manager = getRobotManager();
    if (manager.getStatus() === 'scanning') {
      await manager.stopDiscovery();
    }
    onClose();
  };

  const isScanning = discoveryStatus === 'scanning';

  const getStatusText = () => {
    switch (discoveryStatus) {
      case 'scanning':
        return t('robot.discovery.scanning');
      case 'stopped':
        return t('robot.discovery.stopped');
      case 'error':
        return errorMessage || t('robot.discovery.error');
      case 'idle':
      default:
        return t('robot.discovery.idle');
    }
  };

  // Separate robots into virtual and physical, excluding known robots
  const unknownRobots = discoveredRobots.filter((r) => !knownRobotIds.includes(r.id));
  const virtualRobots = unknownRobots.filter((r) => r.isVirtual);
  const physicalRobots = unknownRobots.filter((r) => !r.isVirtual);
  const allRobots = [...physicalRobots, ...virtualRobots];

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('robotScanner.title')}</Text>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              accessibilityLabel={t('common.close')}
              accessibilityRole="button"
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Status */}
          <View style={styles.statusBar}>
            {isScanning && <ActivityIndicator size="small" color="#007AFF" />}
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            {allRobots.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>{t('robotScanner.noRobotsFound')}</Text>
                <Text style={styles.emptyStateHint}>{t('robotScanner.waitingForRobots')}</Text>
              </View>
            ) : (
              <>
                {allRobots.map((robot) => (
                  <Pressable
                    key={robot.id}
                    onPress={() => handleSelectRobot(robot)}
                    accessibilityLabel={`${t('robot.selectedRobot.selectRobot')} ${robot.name}`}
                    accessibilityRole="button"
                    accessibilityHint={robot.isVirtual ? t('virtualRobot.virtualBadge') : undefined}
                    style={({ pressed }) => [
                      styles.robotCard,
                      robot.isVirtual && styles.virtualRobotCard,
                      pressed && styles.robotCardPressed,
                    ]}
                  >
                    <View style={styles.robotIconContainer}>
                      <WheelIcon size={48} color="#9370DB" />
                    </View>
                    <View style={styles.robotInfo}>
                      <Text style={styles.robotId}>
                        {robot.isVirtual ? t('virtualRobot.virtualBadge') : robot.id}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  dialog: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: 400,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#8E8E93',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
    backgroundColor: '#F2F2F7',
  },
  statusText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  emptyStateHint: {
    fontSize: 14,
    color: '#C7C7CC',
  },
  robotCard: {
    backgroundColor: 'rgba(147, 112, 219, 0.15)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(147, 112, 219, 0.4)',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  robotCardPressed: {
    backgroundColor: 'rgba(147, 112, 219, 0.25)',
    borderColor: '#9370DB',
  },
  virtualRobotCard: {
    backgroundColor: 'rgba(147, 112, 219, 0.2)',
    borderColor: 'rgba(147, 112, 219, 0.5)',
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
  robotId: {
    fontSize: 20,
    fontWeight: '700',
    color: '#9370DB',
  },
});
