/**
 * InputLabel Component
 *
 * Reusable label component for input fields.
 * Supports different text alignments.
 */

import { COLORS } from '@/constants/colors';
import { StyleSheet, Text, TextStyle } from 'react-native';

interface InputLabelProps {
  text: string;
  alignment?: 'left' | 'right' | 'center';
  style?: TextStyle;
}

export function InputLabel({ text, alignment = 'left', style }: InputLabelProps) {
  const labelStyle = [
    styles.label,
    alignment === 'right' && styles.labelRight,
    alignment === 'center' && styles.labelCenter,
    style,
  ];

  return <Text style={labelStyle}>{text}</Text>;
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  labelRight: {
    textAlign: 'right',
    alignSelf: 'flex-end',
  },
  labelCenter: {
    textAlign: 'center',
    alignSelf: 'center',
  },
});
