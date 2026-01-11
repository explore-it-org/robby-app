import { StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { WheelIcon } from '@/components/icons/WheelIcon';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';

export function StatementListHeader() {
  const { t } = useTranslation();

  return (
    <View style={styles.headerContainer}>
      {/* Spacer for repetition box */}
      <View style={styles.headerRepetitionSpacer} />

      {/* Left Wheel */}
      <View style={styles.headerWheelContainerLeft}>
        <WheelIcon size={20} color={COLORS.TEXT_SECONDARY} />
        <Text style={styles.headerLabel}>{t('instruction.move.leftWheel')[0]}</Text>
      </View>

      {/* Spacer for visualization bar */}
      <View style={styles.headerVisualizationSpacer} />

      {/* Right Wheel */}
      <View style={styles.headerWheelContainerRight}>
        <Text style={styles.headerLabel}>{t('instruction.move.rightWheel')[0]}</Text>
        <WheelIcon size={20} color={COLORS.TEXT_SECONDARY} />
      </View>

      {/* Spacer for menu button */}
      <View style={styles.headerMenuSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.XS,
    paddingVertical: SPACING.SM,
    paddingRight: SPACING.SM,
    paddingLeft: 0,
    marginBottom: SPACING.XS,
  },
  headerRepetitionSpacer: {
    width: 48, // Approximate width of repetition box
  },
  headerWheelContainerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.XS,
    minWidth: 70, // Width to match motorSpeedBox
  },
  headerWheelContainerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.XS,
    minWidth: 70, // Width to match motorSpeedBox
  },
  headerVisualizationSpacer: {
    flex: 1,
  },
  headerMenuSpacer: {
    width: 32, // Approximate width of menu button
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
    textTransform: 'uppercase',
  },
});
