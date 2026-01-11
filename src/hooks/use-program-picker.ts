/* eslint-disable */
// @ts-nocheck
/**
 * DEPRECATED - This file is no longer used.
 *
 * Custom hook for managing program picker state and available programs
 * Extracted from program-detail-content.tsx to reduce complexity
 */

import { Program } from '@/types/program';
import { loadAllPrograms } from '@/services/program-storage';
import { useCallback, useEffect, useState } from 'react';

interface UseProgramPickerProps {
  currentProgramId?: string;
}

export function useProgramPicker({ currentProgramId }: UseProgramPickerProps) {
  const [availablePrograms, setAvailablePrograms] = useState<Program[]>([]);

  const loadAvailablePrograms = useCallback(async () => {
    if (!currentProgramId) return;

    try {
      const allPrograms = await loadAllPrograms();
      // Filter out the current program
      const filtered = allPrograms.filter((p) => p.id !== currentProgramId);
      setAvailablePrograms(filtered);
    } catch (error) {
      console.error('Error loading available programs:', error);
    }
  }, [currentProgramId]);

  // Load available programs when current program changes
  useEffect(() => {
    loadAvailablePrograms();
  }, [loadAvailablePrograms]);

  return {
    availablePrograms,
    reloadPrograms: loadAvailablePrograms,
  };
}
