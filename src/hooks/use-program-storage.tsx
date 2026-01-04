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
import { FileProgramStorage, ProgramStorage } from '@/programs/storage';
import { ProgramSource } from '@/programs/source';

interface ProgramStorageContextValue {
  storage: ProgramStorage;
  version: number;
  increaseVersion: () => void;
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

  const increaseVersion = useCallback(() => {
    setVersion((prevVersion) => prevVersion + 1);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadPrograms() {
      try {
        await storage.reloadFromDisk();

        if (isMounted) {
          increaseVersion();
        }
      } catch (err) {
        console.error('Failed to load programs from disk:', err);
        if (isMounted) {
          increaseVersion();
        }
      }
    }

    loadPrograms();

    return () => {
      isMounted = false;
    };
  }, [storage, increaseVersion]);

  return (
    <ProgramStorageContext.Provider value={{ storage, version, increaseVersion }}>
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

  const { storage, increaseVersion } = context;

  const saveProgramSource = useCallback(
    (source: ProgramSource) => {
      storage.saveProgramSource(source);
      increaseVersion();
    },
    [storage, increaseVersion]
  );

  return {
    getAvailablePrograms: storage.getAvailablePrograms,
    getProgramSource: storage.getProgramSource,
    saveProgramSource,
  };
}
