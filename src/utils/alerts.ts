/**
 * Alert Utilities
 *
 * Centralized alert dialogs for common user confirmations.
 */

import { Alert } from 'react-native';
import { TFunction } from 'i18next';

/**
 * Shows a confirmation dialog before deleting a program
 *
 * @param programName - The name of the program to delete
 * @param t - Translation function from i18next
 * @param onConfirm - Callback to execute when deletion is confirmed
 */
export function showDeleteProgramConfirmation(
  programName: string,
  t: TFunction,
  onConfirm: () => void
): void {
  Alert.alert(
    t('alerts.deleteProgram.title'),
    t('alerts.deleteProgram.message', { name: programName }),
    [
      {
        text: t('common.cancel'),
        style: 'cancel',
      },
      {
        text: t('alerts.deleteProgram.confirm'),
        style: 'destructive',
        onPress: onConfirm,
      },
    ]
  );
}
