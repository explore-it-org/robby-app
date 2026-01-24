/**
 * Program Editor Robot Header Component
 *
 * Compact single-line display for the program editor showing:
 * - Left: Gear icon + robot name
 * - Right: Actions (Upload, Run Stored) or Stop button when executing
 */

import { ThemedText } from '@/components/ui/themed-text';
import { GearIcon } from '@/components/icons/GearIcon';
import { PlayCodeIcon } from '@/components/icons/PlayCodeIcon';
import { StopIcon } from '@/components/icons/StopIcon';
import { UploadIcon } from '@/components/icons/UploadIcon';
import { COLORS } from '@/constants/colors';
import { Pressable, StyleSheet, View } from 'react-native';

interface ProgramEditorRobotHeaderProps {
  robotName: string;
  isExecuting: boolean;
  onUpload: () => void;
  onRunStoredInstructions: () => void;
  onStop: () => void;
}

export function ProgramEditorRobotHeader({
  robotName,
  isExecuting,
  onUpload,
  onRunStoredInstructions,
  onStop,
}: ProgramEditorRobotHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Left: Gear icon + Robot name */}
      <View style={styles.leftSection}>
        <GearIcon size={20} color={COLORS.PRIMARY} />
        <ThemedText style={styles.robotName} numberOfLines={1} ellipsizeMode="tail">
          {robotName}
        </ThemedText>
      </View>

      {/* Right: Actions */}
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
            <StopIcon size={20} color="#FFFFFF" />
          </Pressable>
        ) : (
          <>
            <Pressable
              onPress={onUpload}
              style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
            >
              <UploadIcon size={20} color={COLORS.PRIMARY} />
            </Pressable>
            <Pressable
              onPress={onRunStoredInstructions}
              style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
            >
              <PlayCodeIcon size={20} color={COLORS.PRIMARY} />
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
    backgroundColor: 'rgba(147, 112, 219, 0.15)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(147, 112, 219, 0.3)',
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
    color: COLORS.PRIMARY,
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  stopButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  actionButtonPressed: {
    opacity: 0.5,
  },
});
