/**
 * Program Storage Manager
 *
 * High-level manager for loading and storing program sources in memory.
 * Designed for use in React context to provide centralized program state.
 *
 * ## Features:
 * - Load all programs from file system into memory
 * - Provide list of loaded programs (metadata only)
 * - Update/overwrite programs (saves to disk)
 * - Lazy loading of program instructions
 *
 * ## Usage:
 * ```typescript
 * const storage = new ProgramStorage();
 * await storage.loadAll(); // Load all programs from disk
 * const programs = storage.getPrograms(); // Get program list
 * await storage.saveProgram(programSource); // Save/update program
 * const program = await storage.getProgram('ProgramName'); // Load full program
 * ```
 */

import { ProgramSource } from './source';

/**
 * ProgramStorage class - manages program sources in memory
 *
 * Maintains an in-memory cache of program metadata and provides
 * methods for loading, saving, and accessing programs.
 */
export class ProgramStorage {
  private loadedPrograms: Map<string, ProgramSource> = new Map();

  async reloadFromDisk(): Promise<void> {
    // TODO: Reload all programs from disk and update in-memory cache
    throw new Error('Not implemented');
  }

  async saveToDisk(): Promise<void> {
    // TODO: Save all programs from the in-memory cache to disk
    throw new Error('Not implemented');
  }

  getAvailablePrograms(): ProgramInfo[] {
    // Get the programs from the cache and create ProgramInfo objects
    // Order the returned programs by name alphabetically
    throw new Error('Not implemented');
  }

  getProgramSource(name: string): ProgramSource | null {
    // Retrieve a program source by name from the in-memory cache
    throw new Error('Not implemented');
  }
}

export interface ProgramInfo {
  name: string;
  lastModified: Date;
  statementCount: number;
}
