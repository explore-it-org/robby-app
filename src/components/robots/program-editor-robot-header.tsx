/**
 * Program Editor Robot Header Component
 *
 * Compact single-line display for the program editor showing:
 * - Left: Gear icon + robot name
 * - Right: Actions (Upload, Run Stored) or Stop button when executing
 */

import { ThemedText } from '@/components/ui/themed-text';
import { RunStoredIcon } from '@/components/icons/RunStoredIcon';
import { StopIcon } from '@/components/icons/StopIcon';
import { UploadIcon } from '@/components/icons/UploadIcon';
import { WheelIcon } from '@/components/icons/WheelIcon';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

interface ProgramEditorRobotHeaderProps {
  robotName: string;
  isExecuting: boolean;
  isUploading: boolean;
  onUpload: () => void;
  onRunStoredInstructions: () => void;
  onStop: () => void;
}

export function ProgramEditorRobotHeader({
  robotName,
  isExecuting,
  isUploading,
  onUpload,
  onRunStoredInstructions,
  onStop,
}: ProgramEditorRobotHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Left: Gear icon + Robot name */}
      <View style={styles.leftSection}>
        <WheelIcon size={20} color="#FFFFFF" />
        <ThemedText style={styles.robotName} numberOfLines={1} ellipsizeMode="tail">
          {robotName}
        </ThemedText>
      </View>

      {/* Right: Actions */}
      <View style={styles.actionRow}>
        {isUploading ? (
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
            <StopIcon size={20} color="#FFFFFF" />
          </Pressable>
        ) : (
          <>
            <Pressable
              onPress={onUpload}
              style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
            >
              <UploadIcon size={20} color="#FFFFFF" />
            </Pressable>
            <Pressable
              onPress={onRunStoredInstructions}
              style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
            >
              <RunStoredIcon size={20} color="#FFFFFF" />
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#9370DB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#9370DB',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  robotName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
  },
  stopButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  spinnerContainer: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonPressed: {
    opacity: 0.5,
  },
});
