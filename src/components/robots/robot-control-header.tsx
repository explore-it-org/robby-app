/**
 * Fixed Control Bar Component
 *
 * Persistent control bar at the top of the program detail screen.
 * Provides access to robot execution controls and displays connected robot.
 */

import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { StoredRobot } from '@/services/known-robots-storage';
import { StyleSheet, View } from 'react-native';
import { ConnectedRobotDisplay } from './connected-robot-display';
import { NoRobotConnectedDisplay } from './no-robot-connected-display';

interface Props {
  connectedRobot: StoredRobot | null;
  onConnect: () => void;
  onUploadAndRun?: () => void;
  onStop?: () => void;
  onUpload?: () => void;
}

export function RobotControlHeader({
  connectedRobot,
  onConnect,
  onUploadAndRun,
  onStop,
  onUpload,
}: Props) {
  return (
    <View style={styles.container}>
      {connectedRobot ? (
        <ConnectedRobotDisplay
          robot={connectedRobot}
          onUploadAndRun={onUploadAndRun}
          onStop={onStop}
          onUpload={onUpload}
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
