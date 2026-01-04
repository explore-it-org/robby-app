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

import { Paths, File, Directory } from 'expo-file-system';
import { ProgramSource } from './source';

export interface ProgramStorage {
  getAvailablePrograms(): ProgramInfo[];
  getProgramSource(name: string): ProgramSource | null;
  saveProgramSource(source: ProgramSource): void;
  deleteProgramSource(name: string): void;
}

/**
 * FileProgramStorage class - manages program sources in the file system
 *
 * Maintains an in-memory cache of program metadata and provides
 * methods for loading, saving, and accessing programs.
 */
export class FileProgramStorage implements ProgramStorage {
  private loadedPrograms: Map<string, ProgramSource> = new Map();

  getAvailablePrograms(): ProgramInfo[] {
    const programs = Array.from(this.loadedPrograms.values()).map((source) => ({
      name: source.name,
      lastModified: source.lastModified,
      statementCount: source.statements.length,
    }));
    return programs.sort((a, b) => a.name.localeCompare(b.name));
  }

  getProgramSource(name: string): ProgramSource | null {
    return this.loadedPrograms.get(name) ?? null;
  }

  saveProgramSource(source: ProgramSource) {
    this.loadedPrograms.set(source.name, {
      ...source,
      lastModified: new Date(),
    });
  }

  deleteProgramSource(name: string) {
    this.loadedPrograms.delete(name);
  }

  async reloadFromDisk(): Promise<void> {
    this.loadedPrograms.clear();

    const programsDir = this.getProgramsDirectory();
    if (!programsDir.exists) {
      return;
    }

    const dirContents = programsDir.list();
    const files = dirContents.filter(
      (item) => item instanceof File && item.name.endsWith('.json')
    ) as File[];

    for (const file of files) {
      try {
        const content = await file.text();
        const source: ProgramSource = JSON.parse(content);
        source.lastModified = new Date(source.lastModified);
        this.loadedPrograms.set(source.name, source);
      } catch (error) {
        console.error(`Error loading program from ${file.name}:`, error);
      }
    }
  }

  async saveToDisk(): Promise<void> {
    const programsDir = this.getProgramsDirectory();
    if (!programsDir.exists) {
      programsDir.create();
    }

    // Get all existing files in the directory
    const dirContents = programsDir.list();
    const existingFiles = dirContents.filter((item) => item instanceof File) as File[];
    
    // Track which files should exist based on current cache
    const expectedFileNames = new Set(
      Array.from(this.loadedPrograms.keys()).map((name) => `${this.encodeFileName(name)}.json`)
    );

    // Delete files that are no longer in the cache
    for (const file of existingFiles) {
      if (file.name.endsWith('.json') && !expectedFileNames.has(file.name)) {
        try {
          file.delete();
        } catch (error) {
          console.error(`Error deleting file ${file.name}:`, error);
        }
      }
    }

    // Save all programs in the cache
    for (const source of this.loadedPrograms.values()) {
      const fileName = this.encodeFileName(source.name);
      const file = new File(programsDir, `${fileName}.json`);

      try {
        if (file.exists) {
          file.delete();
        }
        file.create();
        file.write(JSON.stringify(source, null, 2));
      } catch (error) {
        console.error(`Error saving program ${source.name}:`, error);
        throw error;
      }
    }
  }

  private getProgramsDirectory(): Directory {
    return new Directory(Paths.document, 'ProgramSources');
  }

  private encodeFileName(name: string): string {
    return Buffer.from(name).toString('base64');
  }
}

export interface ProgramInfo {
  name: string;
  lastModified: Date;
  statementCount: number;
}
