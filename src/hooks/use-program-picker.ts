/**
 * Custom hook for managing program picker state and available programs
 * Extracted from program-detail-content.tsx to reduce complexity
 * 
 * MIGRATED to use name-based program references.
 */

import { Program } from '@/types/program';
import { loadAllPrograms } from '@/services/program-storage';
import { useCallback, useEffect, useState } from 'react';

interface UseProgramPickerProps {
  currentProgramName?: string; // Changed from currentProgramId
}

export function useProgramPicker({ currentProgramName }: UseProgramPickerProps) {
  const [availablePrograms, setAvailablePrograms] = useState<Program[]>([]);

  const loadAvailablePrograms = useCallback(async () => {
    if (!currentProgramName) return;

    try {
      const allPrograms = await loadAllPrograms();
      // Filter out the current program (by name instead of ID)
      const filtered = allPrograms.filter((p) => p.name !== currentProgramName);
      setAvailablePrograms(filtered);
    } catch (error) {
      console.error('Error loading available programs:', error);
    }
  }, [currentProgramName]);

  // Load available programs when current program changes
  useEffect(() => {
    loadAvailablePrograms();
  }, [loadAvailablePrograms]);

  return {
    availablePrograms,
    reloadPrograms: loadAvailablePrograms,
  };
}
