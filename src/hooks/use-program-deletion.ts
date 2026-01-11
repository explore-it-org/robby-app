/* eslint-disable */
// @ts-nocheck
/**
 * DEPRECATED - This file is no longer used.
 *
 * Custom hook for managing program deletion with reference checking
 * Extracted from program-detail-content.tsx to reduce complexity
 */

import { Program } from '@/types/program';
import { findProgramsReferencingProgram } from '@/services/program-references';
import { deleteProgram, loadAllPrograms } from '@/services/program-storage';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

interface UseProgramDeletionProps {
  onDeleteSuccess?: (programId: string) => void;
  onDeleteError?: (error: Error) => void;
}

export function useProgramDeletion({
  onDeleteSuccess,
  onDeleteError,
}: UseProgramDeletionProps = {}) {
  const { t } = useTranslation();

  const performDeletion = useCallback(
    async (programIdToDelete: string) => {
      try {
        await deleteProgram(programIdToDelete);
        onDeleteSuccess?.(programIdToDelete);
      } catch (error) {
        console.error('Error deleting program:', error);
        Alert.alert(t('alerts.error.title'), t('alerts.error.deleteFailed'));
        onDeleteError?.(error instanceof Error ? error : new Error('Unknown error'));
      }
    },
    [t, onDeleteSuccess, onDeleteError]
  );

  const confirmAndDelete = useCallback(
    async (program: Program) => {
      try {
        // Load all programs to check for references
        const allPrograms = await loadAllPrograms();
        const referencingPrograms = findProgramsReferencingProgram(program.id, allPrograms);

        let message = t('alerts.deleteProgram.message', { name: program.name });

        if (referencingPrograms.length > 0) {
          const programNames = referencingPrograms.map((p) => `• ${p.name}`).join('\n');
          message = t('alerts.deleteProgram.messageWithReferences', {
            name: program.name,
            count: referencingPrograms.length,
            programs: programNames,
          });
        }

        Alert.alert(t('alerts.deleteProgram.title'), message, [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('alerts.deleteProgram.confirm'),
            style: 'destructive',
            onPress: () => performDeletion(program.id),
          },
        ]);
      } catch (error) {
        console.error('Error checking program references:', error);
        // Fall back to simple delete confirmation
        Alert.alert(
          t('alerts.deleteProgram.title'),
          t('alerts.deleteProgram.message', { name: program.name }),
          [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('alerts.deleteProgram.confirm'),
              style: 'destructive',
              onPress: () => performDeletion(program.id),
            },
          ]
        );
      }
    },
    [t, performDeletion]
  );

  return {
    confirmAndDelete,
  };
}
