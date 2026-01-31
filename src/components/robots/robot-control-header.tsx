/**
 * Fixed Control Bar Component
 *
 * Persistent control bar at the top of the program detail screen.
 * Provides access to robot execution controls and displays connected robot.
 */

import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { ConnectedRobot } from '@/hooks/use-robot-discovery';
import { StyleSheet, View } from 'react-native';
import { ConnectedRobotDisplay } from './connected-robot-display';
import { NoRobotConnectedDisplay } from './no-robot-connected-display';

interface Props {
  connectedRobot: ConnectedRobot | null;
  showExtendedInfo: boolean;
  isDownloading?: boolean;
  onConnect: () => void;
  onDriveMode: () => void;
  onRecordMode: () => void;
  onRunStoredInstructions: () => void;
  onDownloadInstructions: () => void;
  onStop: () => void;
  onDisconnect: () => void;
}

export function RobotControlHeader({
  connectedRobot,
  showExtendedInfo,
  isDownloading = false,
  onConnect,
  onDriveMode,
  onRecordMode,
  onRunStoredInstructions,
  onDownloadInstructions,
  onStop,
  onDisconnect,
}: Props) {
  return (
    <View style={styles.container}>
      {connectedRobot ? (
        <ConnectedRobotDisplay
          robotName={connectedRobot.name}
          firmwareVersion={connectedRobot.firmwareVersion}
          protocolVersion={connectedRobot.protocolVersion}
          isExecuting={connectedRobot.state === 'executing'}
          isDownloading={isDownloading}
          showExtendedInfo={showExtendedInfo}
          onDriveMode={onDriveMode}
          onRecordMode={onRecordMode}
          onRunStoredInstructions={onRunStoredInstructions}
          onDownloadInstructions={onDownloadInstructions}
          onStop={onStop}
          onDisconnect={onDisconnect}
        />
      ) : (
        <NoRobotConnectedDisplay onConnect={onConnect} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    backgroundColor: '#F5F5F5', // Surface variant
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    shadowColor: '#1D3557',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
});
