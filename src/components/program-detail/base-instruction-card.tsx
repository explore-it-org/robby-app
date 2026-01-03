/**
 * Base Instruction Card Component
 *
 * Reusable base component for all instruction cards.
 * Manages common functionality like expansion state, header, and menu options.
 */

import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface BaseInstructionCardProps {
  /** Icon emoji to display in the header */
  icon: string;
  /** Title text or component to display in the header */
  title: string | ReactNode;
  /** Background color for the header */
  backgroundColor: string;
  /** Border color for the card (optional, no border if not provided) */
  borderColor?: string;
  /** Background color for the content area (optional, defaults to white) */
  contentBackgroundColor?: string;
  /** Horizontal padding for content area (optional, defaults to SPACING.LG) */
  contentPaddingHorizontal?: number;
  /** Whether to show the error warning icon */
  hasErrors?: boolean;
  /** Called when the options menu (•••) is pressed */
  onOptions: () => void;
  /** Content to display when expanded */
  children: ReactNode;
  /** Controlled expansion state (optional) */
  isExpanded?: boolean;
  /** Called when expansion state should change (optional) */
  onToggleExpand?: () => void;
}

export function BaseInstructionCard({
  icon,
  title,
  backgroundColor,
  borderColor,
  contentBackgroundColor,
  contentPaddingHorizontal,
  hasErrors = false,
  onOptions,
  children,
  isExpanded: controlledExpanded,
  onToggleExpand,
}: BaseInstructionCardProps) {
  const { t } = useTranslation();
  const [internalExpanded, setInternalExpanded] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const handleToggle = onToggleExpand || (() => setInternalExpanded(!internalExpanded));

  return (
    <View style={[styles.container, borderColor && { borderWidth: 1, borderColor }]}>
      {/* Header */}
      <Pressable
        style={[styles.header, { backgroundColor }, !isExpanded && styles.headerCollapsed]}
        onPress={handleToggle}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.icon}>{icon}</Text>
          <View style={styles.titleContainer}>
            {typeof title === 'string' ? (
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
            ) : (
              title
            )}
          </View>
        </View>
        <View style={styles.headerRight}>
          {hasErrors && <Text style={styles.errorIcon}>⚠️</Text>}
          <Pressable
            style={({ pressed }) => [styles.iconButton, pressed && styles.buttonPressed]}
            onPress={onOptions}
          >
            <Text style={styles.optionsIcon}>•••</Text>
          </Pressable>
        </View>
      </Pressable>

      {/* Expanded Content */}
      {isExpanded && (
        <View
          style={[
            styles.expandedContent,
            contentBackgroundColor && { backgroundColor: contentBackgroundColor },
            contentPaddingHorizontal !== undefined && {
              paddingHorizontal: contentPaddingHorizontal,
            },
          ]}
        >
          {children}

          {/* Collapse Button */}
          <Pressable style={styles.collapseButton} onPress={() => handleToggle()}>
            <Text style={styles.collapseButtonText}>{t('instructionCard.collapse')}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    marginVertical: SPACING.XS,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.MD,
    minHeight: 56,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  headerCollapsed: {
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
    flex: 1,
  },
  icon: {
    fontSize: 20,
    lineHeight: 20,
    textAlignVertical: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
  },
  headerRight: {
    flexDirection: 'row',
    gap: SPACING.XS,
    alignItems: 'center',
  },
  iconButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsIcon: {
    fontSize: 20,
    color: COLORS.TEXT_SECONDARY,
  },
  buttonPressed: {
    opacity: 0.5,
  },
  errorIcon: {
    fontSize: 20,
  },
  expandedContent: {
    paddingTop: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    paddingBottom: SPACING.MD,
    gap: SPACING.MD,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  collapseButton: {
    alignSelf: 'center',
    paddingVertical: SPACING.SM,
  },
  collapseButtonText: {
    fontSize: 14,
    color: COLORS.CURIOUS_BLUE,
    fontWeight: '500',
  },
});
