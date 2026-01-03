/**
 * Program Source Storage and Conversion
 *
 * Manages storage of ProgramSource objects and bidirectional conversion between:
 * - **ProgramSource** (high-level: Statements with repetitions field)
 * - **Program** (storage format: Instructions from old system)
 *
 * ## Architecture:
 *
 * This module bridges two program representations:
 *
 * ### New Format (ProgramSource):
 * - Used by compiler (compiler.ts)
 * - Simple Statement types: MoveStatement, SubroutineStatement
 * - Each statement has a `repetitions` field (1-100)
 * - Subroutines reference programs by NAME
 *
 * ### Old Format (Program):
 * - Used by storage system (program-storage.ts)
 * - Complex Instruction types: MoveInstruction, SubroutineInstruction, RepetitionInstruction, CommentInstruction
 * - Each instruction has unique ID
 * - Subroutines reference programs by ID (not name)
 * - RepetitionInstructions create nested hierarchies
 *
 * ## Conversion Flow:
 *
 * ### Loading (Program → ProgramSource):
 * 1. Find program by name (scan all program metadata)
 * 2. Load program from storage (by ID)
 * 3. Convert Instructions → Statements:
 *    - MoveInstruction → MoveStatement (repetitions: 1)
 *    - SubroutineInstruction → SubroutineStatement (resolve ID → name, repetitions: 1)
 *    - RepetitionInstruction → Flatten into multiple statements
 *    - CommentInstruction → Skip (not supported in Statement format)
 *
 * ### Saving (ProgramSource → Program):
 * 1. Check if program with this name exists (name-based lookup)
 * 2. Determine ID (use existing or generate new)
 * 3. Convert Statements → Instructions:
 *    - MoveStatement with repetitions=N → N MoveInstructions
 *    - SubroutineStatement with repetitions=N → N SubroutineInstructions (resolve name → ID)
 * 4. Generate unique IDs for all instructions
 * 5. Save to storage
 *
 * ## Key Differences:
 * - **Identification**: ProgramSource uses name, Program uses ID
 * - **Repetitions**: Statement field vs RepetitionInstruction wrapper
 * - **References**: Statement uses names, Instruction uses IDs
 * - **Comments**: Supported in Program, not in ProgramSource (information loss)
 * - **Duration**: Supported in Instruction, not in Statement (information loss)
 */

import { Statement, MoveStatement, SubroutineStatement } from './statements';
import {
  loadProgram,
  loadAllPrograms,
  saveProgram,
  generateProgramId,
} from '@/services/program-storage';
import { Program } from '@/types/program';
import {
  Instruction,
  MoveInstruction,
  SubroutineInstruction,
  RepetitionInstruction,
} from '@/types/instruction';

/**
 * Clamp a value between min and max (inclusive)
 * Used for defensive programming to handle invalid input values
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Program source - high-level program representation
 *
 * Used by the compiler. Simpler than storage Program format.
 */
export interface ProgramSource {
  name: string; // Program name (also used as unique identifier)
  statements: Statement[]; // Array of statements (no nesting, repetitions via field)
}

/**
 * Find program ID by name
 *
 * Searches all program metadata to find a program with matching name.
 * This enables name-based lookup even though storage is ID-based.
 *
 * @param name - Program name to search for
 * @returns Program ID if found, null otherwise
 *
 * ## Implementation:
 * - Loads all program metadata (fast - doesn't load full instructions)
 * - Searches linearly for matching name
 * - Returns first match (if multiple programs have same name)
 *
 * ## Performance:
 * O(n) where n = total number of programs
 * Acceptable for typical program counts (<100)
 * Could be optimized with caching if needed
 */
async function findProgramIdByName(name: string): Promise<string | null> {
  try {
    const allPrograms = await loadAllPrograms();
    const match = allPrograms.find((p) => p.name === name);
    return match ? match.id : null;
  } catch (error) {
    console.error('Error finding program by name:', error);
    return null;
  }
}

/**
 * Resolve program name to ID for subroutine references
 *
 * Used when converting SubroutineStatement (name-based) to SubroutineInstruction (ID-based).
 *
 * @param programName - Name of program to resolve
 * @returns Program ID if found, empty string if not found
 *
 * ## Graceful Degradation:
 * Returns empty string instead of throwing error when program not found.
 * This allows saving the program structure even with broken references.
 * The compiler will detect and report these as missing-reference errors.
 *
 * ## Warning:
 * Creates invalid subroutine instructions when references are missing.
 * This is acceptable because:
 * - The program is still saved (user doesn't lose work)
 * - Compiler will catch the error when program is compiled
 * - User can fix the reference and re-save
 */
async function resolveProgramNameToId(programName: string): Promise<string> {
  const id = await findProgramIdByName(programName);
  if (!id) {
    console.warn(`Program not found: ${programName}`);
    return ''; // Graceful degradation - creates invalid reference
  }
  return id;
}

/**
 * Flatten a RepetitionInstruction into an array of Statements
 *
 * Converts nested RepetitionInstruction hierarchy into flat statement array.
 * Statement format doesn't support nesting - uses repetitions field instead.
 *
 * @param repetition - RepetitionInstruction to flatten
 * @param programMap - Map of program IDs to Programs (for resolving subroutine names)
 * @returns Flat array of statements
 *
 * ## Example:
 * ```
 * Input: RepetitionInstruction {
 *   count: 3,
 *   instructions: [
 *     MoveInstruction { left: 100, right: 100 }
 *   ]
 * }
 *
 * Output: [
 *   MoveStatement { left: 100, right: 100, repetitions: 1 },
 *   MoveStatement { left: 100, right: 100, repetitions: 1 },
 *   MoveStatement { left: 100, right: 100, repetitions: 1 }
 * ]
 * ```
 *
 * ## Nested Repetitions:
 * Handled recursively. Counts multiply:
 * ```
 * RepetitionInstruction { count: 2,
 *   instructions: [
 *     RepetitionInstruction { count: 3,
 *       instructions: [Move(50,50)]
 *     }
 *   ]
 * }
 * → 2 × 3 = 6 MoveStatements
 * ```
 *
 * ## Information Loss:
 * - Comments are skipped (not supported in Statement format)
 * - Nested structure is flattened (repetitions field doesn't preserve hierarchy)
 * - Duration fields are lost
 */
function flattenRepetitionInstruction(
  repetition: RepetitionInstruction,
  programMap: Map<string, Program>
): Statement[] {
  const statements: Statement[] = [];

  // Process each instruction in the repetition block
  for (const instruction of repetition.instructions) {
    if (instruction.type === 'move') {
      // Create move statement, repeated count times
      // Each gets repetitions=1 (could optimize to group identical consecutive moves)
      for (let i = 0; i < repetition.count; i++) {
        statements.push({
          type: 'move',
          leftMotorSpeed: instruction.leftMotorSpeed,
          rightMotorSpeed: instruction.rightMotorSpeed,
          repetitions: 1,
        });
      }
    } else if (instruction.type === 'subroutine') {
      // Resolve program ID to name for subroutine reference
      const programName =
        instruction.programName || // Prefer cached name if available
        programMap.get(instruction.programId)?.name || // Look up by ID
        instruction.programId; // Fallback to ID as name

      // Create subroutine statement, repeated count times
      for (let i = 0; i < repetition.count; i++) {
        statements.push({
          type: 'subroutine',
          programReference: programName,
          repetitions: 1,
        });
      }
    } else if (instruction.type === 'repetition') {
      // Recursively flatten nested repetitions
      // This handles arbitrary nesting depth
      const nestedStatements = flattenRepetitionInstruction(instruction, programMap);

      // Repeat the flattened nested statements count times
      // Example: If nested has 3 statements and count=2, adds 6 statements total
      for (let i = 0; i < repetition.count; i++) {
        statements.push(...nestedStatements);
      }
    }
    // Note: CommentInstructions are silently skipped (not supported in Statement format)
  }

  return statements;
}

/**
 * Convert Instructions array to Statements array (Program → ProgramSource)
 *
 * Part of the loading pipeline: transforms storage format to compiler format.
 *
 * ## Conversion Rules:
 * - MoveInstruction → MoveStatement (repetitions: 1)
 * - SubroutineInstruction → SubroutineStatement (resolve ID→name, repetitions: 1)
 * - RepetitionInstruction → Flatten into multiple statements
 * - CommentInstruction → Skip (not supported)
 *
 * @param instructions - Instructions from storage
 * @returns Statements for compiler
 */
async function instructionsToStatements(instructions: Instruction[]): Promise<Statement[]> {
  const statements: Statement[] = [];

  // Load all programs for resolving subroutine names
  const allPrograms = await loadAllPrograms();
  const programMap = new Map(allPrograms.map((p) => [p.id, p]));

  for (const instruction of instructions) {
    if (instruction.type === 'move') {
      statements.push({
        type: 'move',
        leftMotorSpeed: instruction.leftMotorSpeed,
        rightMotorSpeed: instruction.rightMotorSpeed,
        repetitions: 1,
      });
    } else if (instruction.type === 'subroutine') {
      // Resolve program ID to name
      const programName =
        instruction.programName ||
        programMap.get(instruction.programId)?.name ||
        instruction.programId;

      statements.push({
        type: 'subroutine',
        programReference: programName,
        repetitions: 1,
      });
    } else if (instruction.type === 'repetition') {
      // Flatten repetition instructions
      const flattenedStatements = flattenRepetitionInstruction(instruction, programMap);
      statements.push(...flattenedStatements);
    }
    // Skip comment instructions
  }

  return statements;
}

/**
 * Convert Statements array to Instructions array (ProgramSource → Program)
 *
 * Part of the saving pipeline: transforms compiler format to storage format.
 *
 * ## Conversion Rules:
 * - MoveStatement with repetitions=N → N MoveInstructions
 * - SubroutineStatement with repetitions=N → N SubroutineInstructions (resolve name→ID)
 * - Each instruction gets unique ID: `${programId}-${index}`
 * - Values are clamped defensively to valid ranges
 *
 * @param statements - Statements from compiler
 * @param programId - ID for generating instruction IDs
 * @returns Instructions for storage
 */
async function statementsToInstructions(
  statements: Statement[],
  programId: string
): Promise<Instruction[]> {
  const instructions: Instruction[] = [];
  let instructionIndex = 0; // Sequential counter for generating unique IDs

  for (const statement of statements) {
    if (statement.type === 'move') {
      // Clamp values to valid ranges (defensive programming)
      const leftMotorSpeed = clamp(statement.leftMotorSpeed, 0, 100);
      const rightMotorSpeed = clamp(statement.rightMotorSpeed, 0, 100);
      const repetitions = clamp(statement.repetitions, 1, 100);

      // Expand: MoveStatement with repetitions=N → N MoveInstructions
      for (let i = 0; i < repetitions; i++) {
        instructions.push({
          id: `${programId}-${instructionIndex++}`, // Unique ID
          type: 'move',
          leftMotorSpeed,
          rightMotorSpeed,
          duration: undefined, // Statement format doesn't have duration
        });
      }
    } else if (statement.type === 'subroutine') {
      // Clamp repetitions to valid range
      const repetitions = clamp(statement.repetitions, 1, 100);

      // Resolve program name to ID (name-based → ID-based reference)
      const resolvedProgramId = await resolveProgramNameToId(statement.programReference);

      // Expand: SubroutineStatement with repetitions=N → N SubroutineInstructions
      for (let i = 0; i < repetitions; i++) {
        instructions.push({
          id: `${programId}-${instructionIndex++}`, // Unique ID
          type: 'subroutine',
          programId: resolvedProgramId, // ID for storage (may be empty if not found)
          programName: statement.programReference, // Cached name for display
        });
      }
    }
  }

  return instructions;
}

/**
 * Load program source by name (Program → ProgramSource conversion)
 *
 * Main entry point for loading programs from storage into compiler format.
 * Performs name-based lookup in ID-based storage system.
 *
 * @param name - Program name to load
 * @returns ProgramSource object if found and loaded successfully, null otherwise
 *
 * ## Loading Pipeline:
 * 1. Find program ID by name (searches all program metadata)
 * 2. Load program from storage by ID
 * 3. Convert Instructions → Statements
 * 4. Return { name, statements }
 *
 * ## Example:
 * ```typescript
 * const source = await loadProgramSource("MainProgram");
 * if (source) {
 *   // source.name = "MainProgram"
 *   // source.statements = [MoveStatement, SubroutineStatement, ...]
 * }
 * ```
 *
 * ## Returns null when:
 * - Program with this name doesn't exist
 * - Storage error occurs
 * - Conversion fails
 *
 * ## Performance:
 * O(n) where n = total programs (searches metadata for matching name)
 */
export async function loadProgramSource(name: string): Promise<ProgramSource | null> {
  try {
    // Find program ID by name
    const programId = await findProgramIdByName(name);
    if (!programId) {
      return null;
    }

    // Load program
    const program = await loadProgram(programId);
    if (!program) {
      return null;
    }

    // Convert instructions to statements
    const statements = await instructionsToStatements(program.instructions);

    return {
      name: program.name,
      statements,
    };
  } catch (error) {
    console.error('Error loading program source:', error);
    return null;
  }
}

/**
 * Save program source (ProgramSource → Program conversion)
 *
 * Main entry point for saving programs from compiler format into storage.
 * Creates new program or updates existing based on name match.
 *
 * @param source - Program source to save
 * @returns true if saved successfully, false if error occurs
 *
 * ## Saving Pipeline:
 * 1. Check if program with this name already exists (name-based lookup)
 * 2. Determine program ID:
 *    - Existing: Reuse existing ID and preserve metadata (createdDate, type)
 *    - New: Generate new human-readable ID (e.g., "purple-deer-invite")
 * 3. Convert Statements → Instructions
 * 4. Create Program object with all metadata
 * 5. Save to storage (atomic write via expo-file-system)
 *
 * ## Example:
 * ```typescript
 * const success = await saveProgramSource({
 *   name: "Forward",
 *   statements: [
 *     { type: 'move', leftMotorSpeed: 100, rightMotorSpeed: 100, repetitions: 3 }
 *   ]
 * });
 * ```
 *
 * ## Behavior:
 * - **Name collision**: Overwrites existing program (name is the unique identifier)
 * - **Missing subroutine references**: Saved with empty programId (graceful degradation)
 * - **Empty statements**: Valid, creates empty program
 * - **Metadata preservation**: Existing programs keep createdDate and type
 *
 * ## Returns false when:
 * - Storage error occurs
 * - Conversion fails
 * - File write fails
 */
export async function saveProgramSource(source: ProgramSource): Promise<boolean> {
  try {
    // Check if program with this name already exists
    const existingProgramId = await findProgramIdByName(source.name);
    let programId: string;
    let existingProgram: Program | null = null;

    if (existingProgramId) {
      // Update existing program
      programId = existingProgramId;
      existingProgram = await loadProgram(programId);
    } else {
      // Create new program
      programId = generateProgramId();
    }

    // Convert statements to instructions
    const instructions = await statementsToInstructions(source.statements, programId);

    // Create program object
    const program: Program = {
      id: programId,
      name: source.name,
      type: existingProgram?.type || 'step',
      instructionCount: instructions.length,
      createdDate: existingProgram?.createdDate || new Date(),
      lastModified: new Date(),
      instructions,
    };

    // Save program
    await saveProgram(program);
    return true;
  } catch (error) {
    console.error('Error saving program source:', error);
    return false;
  }
}
