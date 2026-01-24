/**
 * Program Storage Context Hook
 *
 * Provides access to the ProgramStorage instance throughout the application.
 * The storage is initialized on app startup and loads all programs from disk.
 *
 * ## Usage:
 * ```tsx
 * function MyComponent() {
 *   const storage = useProgramStorage();
 *
 *   const programs = storage.getAvailablePrograms();
 *   const program = storage.getProgramSource('MyProgram');
 * }
 * ```
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import { FileProgramStorage, ProgramStorage } from '@/services/programs/storage';
import { ProgramSource } from '@/services/programs/source';

interface ProgramStorageContextValue {
  storage: FileProgramStorage;
  version: number;
  notifyChanged: () => void;
}

const ProgramStorageContext = createContext<ProgramStorageContextValue | null>(null);

interface Props {
  children: ReactNode;
}

/**
 * Program Storage Provider
 *
 * Wraps the application and provides a ProgramStorage instance.
 * Automatically loads all programs from disk on mount.
 */
export function ProgramStorageProvider({ children }: Props) {
  const storage = useMemo(() => new FileProgramStorage(), []);
  const [version, setVersion] = useState(0);

  const notifyChanged = useCallback(async () => {
    setVersion((prevVersion) => prevVersion + 1);
    await storage.saveToDisk();
  }, [storage]);

  useEffect(() => {
    let isMounted = true;

    async function loadPrograms() {
      try {
        await storage.reloadFromDisk();

        if (isMounted) {
          notifyChanged();
        }
      } catch (err) {
        console.error('Failed to load programs from disk:', err);
        if (isMounted) {
          notifyChanged();
        }
      }
    }

    loadPrograms();

    return () => {
      isMounted = false;
    };
  }, [storage, notifyChanged]);

  return (
    <ProgramStorageContext.Provider value={{ storage, version, notifyChanged }}>
      {children}
    </ProgramStorageContext.Provider>
  );
}

/**
 * Hook to access the ProgramStorage instance
 *
 * @returns ProgramStorage instance with loading state
 * @throws Error if used outside ProgramStorageProvider
 */
export function useProgramStorage(): ProgramStorage {
  const context = useContext(ProgramStorageContext);

  if (!context) {
    throw new Error('useProgramStorage must be used within a ProgramStorageProvider');
  }

  const { storage, version, notifyChanged } = context;

  // Compute programs directly based on version
  const availablePrograms = useMemo(() => {
    void version; // Mark version as used
    return storage.availablePrograms;
  }, [storage, version]);

  const getProgramSource = useCallback(
    (name: string) => {
      return storage.getProgramSource(name);
    },
    [storage]
  );

  const saveProgramSource = useCallback(
    (source: ProgramSource) => {
      storage.saveProgramSource(source);
      notifyChanged();
    },
    [storage, notifyChanged]
  );

  const deleteProgramSource = useCallback(
    (name: string) => {
      storage.deleteProgramSource(name);
      notifyChanged();
    },
    [storage, notifyChanged]
  );

  return {
    availablePrograms,
    getProgramSource,
    saveProgramSource,
    deleteProgramSource,
  };
}
