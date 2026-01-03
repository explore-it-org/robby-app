/**
 * NumberInput Component
 *
 * Reusable numeric input field with validation.
 * Used for motor speeds, repetition counts, and other numeric values.
 */

import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';

interface NumberInputProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  unit?: string;
  containerStyle?: ViewStyle;
  alignment?: 'left' | 'right' | 'center';
  borderColor?: string;
  large?: boolean;
}

export function NumberInput({
  value,
  onValueChange,
  min = 0,
  max = 100,
  unit,
  containerStyle,
  alignment = 'left',
  borderColor = COLORS.CURIOUS_BLUE,
  large = false,
}: NumberInputProps) {
  const [inputValue, setInputValue] = useState(value.toString());
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update local state when prop value changes (only if not currently typing)
  useEffect(() => {
    // Don't update input value if user is actively typing
    if (!debounceTimeoutRef.current) {
      setInputValue(value.toString());
    }
  }, [value]);

  const handleChange = (text: string) => {
    // Update local state immediately for responsive typing
    setInputValue(text);

    // Clear existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce the onValueChange callback
    debounceTimeoutRef.current = setTimeout(() => {
      const numValue = parseInt(text, 10);
      if (!isNaN(numValue) && numValue >= min && numValue <= max) {
        onValueChange(numValue);
      }
      debounceTimeoutRef.current = null;
    }, 300);
  };

  const handleBlur = () => {
    // Clear any pending debounce
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }

    // Validate and update immediately on blur
    const numValue = parseInt(inputValue, 10);
    if (isNaN(numValue) || numValue < min || numValue > max) {
      setInputValue(value.toString());
    } else {
      // Ensure the value is saved even if it was still in debounce
      onValueChange(numValue);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const inputContainerAlignment =
    alignment === 'left'
      ? styles.inputContainerAlignLeft
      : alignment === 'right'
        ? styles.inputContainerAlignRight
        : styles.inputContainerAlignCenter;

  return (
    <View
      style={[
        large ? styles.inputContainerLarge : styles.inputContainer,
        inputContainerAlignment,
        { borderColor },
        containerStyle,
      ]}
    >
      <TextInput
        style={large ? styles.inputLarge : styles.input}
        value={inputValue}
        onChangeText={handleChange}
        onBlur={handleBlur}
        keyboardType="number-pad"
        maxLength={max.toString().length}
        selectTextOnFocus
      />
      {unit && <Text style={styles.unit}>{unit}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: SPACING.XS,
    paddingHorizontal: SPACING.SM,
    gap: SPACING.XS,
  },
  inputContainerLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    gap: SPACING.SM,
  },
  inputContainerAlignLeft: {
    alignSelf: 'flex-start',
  },
  inputContainerAlignRight: {
    alignSelf: 'flex-end',
  },
  inputContainerAlignCenter: {
    alignSelf: 'center',
  },
  input: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'center',
    color: COLORS.TEXT_PRIMARY,
    padding: 0,
  },
  inputLarge: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    minWidth: 60,
    padding: 0,
  },
  unit: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.TEXT_SECONDARY,
  },
});
