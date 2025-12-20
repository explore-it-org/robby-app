/**
 * Motor Strength Indicator Component
 *
 * Displays two colored bars that stretch from the center towards
 * the left and right sides, representing motor strength (0-100%).
 */

import { COLORS } from '@/constants/colors';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface MotorStrengthIndicatorProps {
  leftStrength: number; // 0-100
  rightStrength: number; // 0-100
  containerStyle?: ViewStyle;
  showLabels?: boolean; // Show percentage labels overlaid on bars
}

export function MotorStrengthIndicator({
  leftStrength,
  rightStrength,
  containerStyle,
  showLabels = false,
}: MotorStrengthIndicatorProps) {
  // Clamp values between 0 and 100
  const leftPercent = Math.max(0, Math.min(100, leftStrength));
  const rightPercent = Math.max(0, Math.min(100, rightStrength));

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Left bar - grows from center to left */}
      <View style={styles.leftContainer}>
        {/* Filled portion */}
        <View
          style={[
            styles.bar,
            styles.leftBarFilled,
            { width: `${leftPercent}%` },
          ]}
        />
        {/* Outlined portion */}
        <View
          style={[
            styles.bar,
            styles.leftBarOutline,
            { width: `${100 - leftPercent}%` },
          ]}
        />
      </View>

      {/* Right bar - grows from center to right */}
      <View style={styles.rightContainer}>
        {/* Filled portion */}
        <View
          style={[
            styles.bar,
            styles.rightBarFilled,
            { width: `${rightPercent}%` },
          ]}
        />
        {/* Outlined portion */}
        <View
          style={[
            styles.bar,
            styles.rightBarOutline,
            { width: `${100 - rightPercent}%` },
          ]}
        />
      </View>

      {/* Labels - rendered last so they appear on top */}
      {showLabels && (
        <>
          <Text style={[styles.label, styles.leftLabel]}>{leftPercent}%</Text>
          <Text style={[styles.label, styles.rightLabel]}>{rightPercent}%</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    position: 'relative',
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row-reverse', // Reverse to have filled portion grow from right (center) to left
    alignItems: 'center',
  },
  rightContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bar: {
    height: 24,
  },
  leftBarFilled: {
    backgroundColor: '#D6F5EE',
  },
  leftBarOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D6F5EE',
  },
  rightBarFilled: {
    backgroundColor: '#CEE0F4',
  },
  rightBarOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#CEE0F4',
  },
  label: {
    position: 'absolute',
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    zIndex: 2,
  },
  leftLabel: {
    left: '50%',
    marginLeft: -38, // Half width + 8px offset towards center
  },
  rightLabel: {
    left: '50%',
    marginLeft: 8, // 8px offset from center
  },
});
