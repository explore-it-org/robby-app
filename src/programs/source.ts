/**
 * Program Source Type Definitions
 *
 * Represents the source code structure of a program.
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
 * Program source - contains program name and instruction sequence
 */
export interface ProgramSource {
  name: string;
  statements: Statement[];
}

/**
 * Find program ID by name
 * Searches all programs and returns the ID of the first program with matching name
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
 * Resolve program name to ID
 * Returns empty string if program not found (graceful degradation)
 */
async function resolveProgramNameToId(programName: string): Promise<string> {
  const id = await findProgramIdByName(programName);
  if (!id) {
    console.warn(`Program not found: ${programName}`);
    return '';
  }
  return id;
}

/**
 * Flatten repetition instruction into statements
 * Recursively processes nested instructions and multiplies by repetition count
 */
function flattenRepetitionInstruction(
  repetition: RepetitionInstruction,
  programMap: Map<string, Program>
): Statement[] {
  const statements: Statement[] = [];

  for (const instruction of repetition.instructions) {
    if (instruction.type === 'move') {
      // Create move statement, repeated count times
      for (let i = 0; i < repetition.count; i++) {
        statements.push({
          type: 'move',
          leftMotorSpeed: instruction.leftMotorSpeed,
          rightMotorSpeed: instruction.rightMotorSpeed,
          repetitions: 1,
        });
      }
    } else if (instruction.type === 'subroutine') {
      // Create subroutine statement, repeated count times
      const programName =
        instruction.programName ||
        programMap.get(instruction.programId)?.name ||
        instruction.programId;

      for (let i = 0; i < repetition.count; i++) {
        statements.push({
          type: 'subroutine',
          programReference: programName,
          repetitions: 1,
        });
      }
    } else if (instruction.type === 'repetition') {
      // Recursively flatten nested repetitions
      const nestedStatements = flattenRepetitionInstruction(instruction, programMap);
      // Multiply by parent repetition count
      for (let i = 0; i < repetition.count; i++) {
        statements.push(...nestedStatements);
      }
    }
    // Skip comment instructions
  }

  return statements;
}

/**
 * Convert Instructions to Statements
 * Maps from old Program format to new ProgramSource format
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
 * Convert Statements to Instructions
 * Maps from new ProgramSource format to old Program format
 */
async function statementsToInstructions(
  statements: Statement[],
  programId: string
): Promise<Instruction[]> {
  const instructions: Instruction[] = [];
  let instructionIndex = 0;

  for (const statement of statements) {
    if (statement.type === 'move') {
      // Expand move statement into N instructions based on repetitions
      for (let i = 0; i < statement.repetitions; i++) {
        instructions.push({
          id: `${programId}-${instructionIndex++}`,
          type: 'move',
          leftMotorSpeed: statement.leftMotorSpeed,
          rightMotorSpeed: statement.rightMotorSpeed,
          duration: undefined,
        });
      }
    } else if (statement.type === 'subroutine') {
      // Resolve program name to ID
      const resolvedProgramId = await resolveProgramNameToId(statement.programReference);

      // Expand subroutine statement into N instructions based on repetitions
      for (let i = 0; i < statement.repetitions; i++) {
        instructions.push({
          id: `${programId}-${instructionIndex++}`,
          type: 'subroutine',
          programId: resolvedProgramId,
          programName: statement.programReference,
        });
      }
    }
  }

  return instructions;
}

/**
 * Load program source by name
 * Returns null if program not found or error occurs
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
 * Save program source
 * Creates new program if name doesn't exist, updates existing program otherwise
 * Returns true on success, false on failure
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
