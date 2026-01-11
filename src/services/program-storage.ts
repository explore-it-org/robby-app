/* eslint-disable */
// @ts-nocheck
/**
 * DEPRECATED - This file is no longer used.
 * Use src/programs/storage.ts instead.
 *
 * Program Storage Service
 *
 * Manages persistence of user programs using expo-file-system.
 * Programs are stored in <Documents>/Programs/<human-id>.prog/ directories with:
 * - manifest.json: Program metadata (id, name, lastUpdate, totalInstructionCount)
 * - instructions.json: Ordered list of instructions
 *
 * Program IDs are human-readable (e.g., "purple-deer-invite")
 */

import 'react-native-get-random-values';
import { humanId } from 'human-id';
import { Paths, File, Directory } from 'expo-file-system';
import { Instruction } from '@/types/instruction';
import { Program } from '@/types/program';

// Lock to prevent concurrent saves to the same program
const saveLocks = new Map<string, Promise<void>>();

// Program metadata structure (stored in manifest.json)
export interface ProgramManifest {
  id: string;
  name: string;
  type: 'step' | 'block';
  createdDate: string; // ISO 8601 timestamp
  lastUpdate: string; // ISO 8601 timestamp
  totalInstructionCount: number;
}

/**
 * Gets the Programs directory
 */
function getProgramsDirectory(): Directory {
  return new Directory(Paths.document, 'Programs');
}

/**
 * Ensures the Programs directory exists
 */
async function ensureProgramsDirectory(): Promise<void> {
  const programsDir = getProgramsDirectory();
  if (!programsDir.exists) {
    programsDir.create();
  }
}

/**
 * Gets the directory for a specific program
 */
function getProgramDirectory(programId: string): Directory {
  return new Directory(getProgramsDirectory(), `${programId}.prog`);
}

/**
 * Gets the manifest file for a program
 */
function getManifestFile(programId: string): File {
  return new File(getProgramDirectory(programId), 'manifest.json');
}

/**
 * Gets the instructions file for a program
 */
function getInstructionsFile(programId: string): File {
  return new File(getProgramDirectory(programId), 'instructions.json');
}

/**
 * Loads all program metadata from manifest.json files
 * @returns Array of programs with metadata only (no instructions)
 */
export async function loadAllPrograms(): Promise<Program[]> {
  try {
    await ensureProgramsDirectory();

    const programsDir = getProgramsDirectory();
    const dirContents = programsDir.list();
    const programDirs = dirContents.filter(
      (item) => item instanceof Directory && item.name.endsWith('.prog')
    ) as Directory[];

    const programs: Program[] = [];

    for (const dir of programDirs) {
      const programId = dir.name.replace('.prog', '');
      try {
        const manifestFile = getManifestFile(programId);

        // Check if manifest file exists before trying to read it
        if (!manifestFile.exists) {
          // Skip - this can happen temporarily when a program is being created
          continue;
        }

        const manifestContent = await manifestFile.text();
        const manifest: ProgramManifest = JSON.parse(manifestContent);

        programs.push({
          id: manifest.id,
          name: manifest.name,
          type: manifest.type,
          instructionCount: manifest.totalInstructionCount,
          createdDate: new Date(manifest.createdDate),
          lastModified: new Date(manifest.lastUpdate),
          instructions: [], // Don't load instructions for list view
        });
      } catch (error) {
        console.error(`Error loading manifest for program ${programId}:`, error);
        // Skip this program if manifest is corrupted
      }
    }

    // Sort by last modified (most recent first)
    programs.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());

    return programs;
  } catch (error) {
    console.error('Error loading programs:', error);
    return [];
  }
}

/**
 * Loads a single program with its full instructions
 * @param programId - The ID of the program to load
 * @returns The complete program or null if not found
 */
export async function loadProgram(programId: string): Promise<Program | null> {
  try {
    const manifestFile = getManifestFile(programId);
    const instructionsFile = getInstructionsFile(programId);

    // Check if files exist
    if (!manifestFile.exists || !instructionsFile.exists) {
      return null;
    }

    // Load manifest
    const manifestContent = await manifestFile.text();
    const manifest: ProgramManifest = JSON.parse(manifestContent);

    // Load instructions
    const instructionsContent = await instructionsFile.text();
    const instructions: Instruction[] = JSON.parse(instructionsContent);

    return {
      id: manifest.id,
      name: manifest.name,
      type: manifest.type,
      instructionCount: manifest.totalInstructionCount,
      createdDate: new Date(manifest.createdDate),
      lastModified: new Date(manifest.lastUpdate),
      instructions,
    };
  } catch (error) {
    console.error(`Error loading program ${programId}:`, error);
    return null;
  }
}

/**
 * Saves or updates a program
 * @param program - The program to save
 */
export async function saveProgram(program: Program): Promise<void> {
  // Wait for any existing save operation for this program to complete
  const existingLock = saveLocks.get(program.id);
  if (existingLock) {
    await existingLock;
  }

  // Create a new lock for this save operation
  const saveLock = (async () => {
    try {
      await ensureProgramsDirectory();

      const programDir = getProgramDirectory(program.id);

      // Check if this is a new program or an update
      const isNewProgram = !programDir.exists;

      // Create program directory if it doesn't exist
      if (isNewProgram) {
        programDir.create();
      }

      // Load existing manifest to preserve createdDate
      let createdDate = program.createdDate.toISOString();
      if (!isNewProgram) {
        try {
          const manifestFile = getManifestFile(program.id);
          if (manifestFile.exists) {
            const existingManifestContent = await manifestFile.text();
            const existingManifest: ProgramManifest = JSON.parse(existingManifestContent);
            createdDate = existingManifest.createdDate;
          }
        } catch {
          // If we can't read existing manifest, use the program's createdDate
          console.warn(
            `Could not read existing manifest for ${program.id}, using program createdDate`
          );
        }
      }

      // Create manifest
      const manifest: ProgramManifest = {
        id: program.id,
        name: program.name,
        type: program.type,
        createdDate,
        lastUpdate: new Date().toISOString(),
        totalInstructionCount: program.instructions.length,
      };

      // Write to temporary files first for atomic operation
      const manifestFile = getManifestFile(program.id);
      const instructionsFile = getInstructionsFile(program.id);
      const tempManifestFile = new File(programDir, 'manifest.json.tmp');
      const tempInstructionsFile = new File(programDir, 'instructions.json.tmp');

      // Clean up any existing temp files from previous failed saves
      if (tempManifestFile.exists) {
        tempManifestFile.delete();
      }
      if (tempInstructionsFile.exists) {
        tempInstructionsFile.delete();
      }

      // Write to temp files
      tempManifestFile.create();
      tempManifestFile.write(JSON.stringify(manifest, null, 2));
      tempInstructionsFile.create();
      tempInstructionsFile.write(JSON.stringify(program.instructions, null, 2));

      // On Android, move with existing destination can fail, so we delete first
      // and add a small delay to ensure file system sync
      const manifestExists = manifestFile.exists;
      const instructionsExist = instructionsFile.exists;

      if (manifestExists) {
        manifestFile.delete();
      }
      if (instructionsExist) {
        instructionsFile.delete();
      }

      // Small delay to ensure file system has processed deletes (Android issue)
      if (manifestExists || instructionsExist) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      // Move temp files to final location
      tempManifestFile.move(manifestFile);
      tempInstructionsFile.move(instructionsFile);
    } catch (error) {
      console.error(`Error saving program ${program.id}:`, error);
      throw error;
    } finally {
      // Remove the lock when done
      saveLocks.delete(program.id);
    }
  })();

  // Store the lock promise
  saveLocks.set(program.id, saveLock);

  // Wait for the save to complete
  await saveLock;
}

/**
 * Deletes a program and its directory
 * @param programId - The ID of the program to delete
 */
export async function deleteProgram(programId: string): Promise<void> {
  try {
    const programDir = getProgramDirectory(programId);

    if (programDir.exists) {
      programDir.delete();
    }
  } catch (error) {
    console.error(`Error deleting program ${programId}:`, error);
    throw error;
  }
}

/**
 * Generates a new unique program ID using human-readable format
 * Format: adjective-noun-number (e.g., "happy-robot-42")
 */
export function generateProgramId(): string {
  return humanId({
    separator: '-',
    capitalize: false,
  });
}
