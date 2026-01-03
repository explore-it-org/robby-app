/**
 * Custom hook for managing program deletion with reference checking
 * Extracted from program-detail-content.tsx to reduce complexity
 * 
 * MIGRATED to use name-based program references.
 */

import { findProgramsReferencingProgram } from '@/services/program-references';
import { deleteProgram, loadAllPrograms } from '@/services/program-storage';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

interface UseProgramDeletionProps {
  onDeleteSuccess?: (programName: string) => void; // Changed from programId
  onDeleteError?: (error: Error) => void;
}

export function useProgramDeletion({
  onDeleteSuccess,
  onDeleteError,
}: UseProgramDeletionProps = {}) {
  const { t } = useTranslation();

  const performDeletion = useCallback(
    async (programNameToDelete: string) => {
      try {
        // Find program ID by name for deletion (storage still uses IDs)
        const allPrograms = await loadAllPrograms();
        const program = allPrograms.find((p) => p.name === programNameToDelete);
        
        if (!program) {
          throw new Error(`Program not found: ${programNameToDelete}`);
        }

        await deleteProgram(program.id);
        onDeleteSuccess?.(programNameToDelete);
      } catch (error) {
        console.error('Error deleting program:', error);
        Alert.alert(t('alerts.error.title'), t('alerts.error.deleteFailed'));
        onDeleteError?.(error instanceof Error ? error : new Error('Unknown error'));
      }
    },
    [t, onDeleteSuccess, onDeleteError]
  );

  const confirmAndDelete = useCallback(
    async (programName: string) => {
      try {
        // Check for programs referencing this one (by name)
        const referencingPrograms = await findProgramsReferencingProgram(programName);

        let message = t('alerts.deleteProgram.message', { name: programName });

        if (referencingPrograms.length > 0) {
          const programNames = referencingPrograms.map((p) => `• ${p.name}`).join('\n');
          message = t('alerts.deleteProgram.messageWithReferences', {
            name: programName,
            count: referencingPrograms.length,
            programs: programNames,
          });
        }

        Alert.alert(t('alerts.deleteProgram.title'), message, [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('alerts.deleteProgram.confirm'),
            style: 'destructive',
            onPress: () => performDeletion(programName),
          },
        ]);
      } catch (error) {
        console.error('Error checking program references:', error);
        // Fall back to simple delete confirmation
        Alert.alert(
          t('alerts.deleteProgram.title'),
          t('alerts.deleteProgram.message', { name: programName }),
          [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('alerts.deleteProgram.confirm'),
              style: 'destructive',
              onPress: () => performDeletion(programName),
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
