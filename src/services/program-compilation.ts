/* eslint-disable */
// @ts-nocheck
/**
 * DEPRECATED - This file is no longer used.
 * Use src/programs/compiler.ts instead.
 *
 * Program Compilation Service
 *
 * Handles compilation of programs into executable format with validation.
 * Compiles high-level instructions into annotated move instructions with labels.
 */

import {
  AnnotatedInstruction,
  CompilationError,
  CompiledMoveInstruction,
  CompiledProgram,
} from '@/types/compiled-program';
import {
  CommentInstruction,
  Instruction,
  MoveInstruction,
  RepetitionInstruction,
  SubroutineInstruction,
} from '@/types/instruction';
import { Program } from '@/types/program';

/**
 * Validates program and collects errors
 */
function validateProgram(
  program: Program,
  allPrograms: Map<string, Program>,
  visitedIds: Set<string> = new Set(),
  programPath: string[] = [],
  parentInstructionId?: string
): CompilationError[] {
  const errors: CompilationError[] = [];
  visitedIds.add(program.id);
  const currentPath = [...programPath, program.name];

  function validateInstructions(instructions: Instruction[], baseIndex: number = 0): void {
    instructions.forEach((instruction, idx) => {
      const instructionIndex = baseIndex + idx;

      if (instruction.type === 'subroutine') {
        const subInstruction = instruction as SubroutineInstruction;

        // Check for missing reference
        if (!allPrograms.has(subInstruction.programId)) {
          errors.push({
            instructionId: instruction.id,
            instructionIndex,
            instruction,
            message: `Referenced program "${subInstruction.programName || subInstruction.programId}" not found`,
            type: 'missing-reference',
            parentInstructionId,
          });
        } else if (visitedIds.has(subInstruction.programId)) {
          // Check for cyclic dependency - show the cycle path
          const referencedProgram = allPrograms.get(subInstruction.programId)!;
          // Mark both occurrences of the cyclic program with special markers for red highlighting
          const cyclicName = referencedProgram.name;
          const pathWithMarkers = currentPath.map((name) =>
            name === cyclicName ? `[[RED]]${name}[[/RED]]` : name
          );
          const cyclePath = [...pathWithMarkers, `[[RED]]${cyclicName}[[/RED]]`].join(' ▸ ');
          errors.push({
            instructionId: instruction.id,
            instructionIndex,
            instruction,
            message: `[[CYCLIC_DEPENDENCY]]\n${cyclePath}`,
            type: 'cyclic-dependency',
            explanationKey: 'cyclicDependencyExplanation',
            parentInstructionId,
          });
        } else {
          // Recursively validate referenced program
          // Pass this instruction's ID as the parent for any nested errors
          const refProgram = allPrograms.get(subInstruction.programId)!;
          const nestedErrors = validateProgram(
            refProgram,
            allPrograms,
            new Set(visitedIds),
            currentPath,
            instruction.id // This subroutine instruction becomes the parent for nested errors
          );
          errors.push(...nestedErrors);
        }
      } else if (instruction.type === 'repetition') {
        const repInstruction = instruction as RepetitionInstruction;
        // Validate nested instructions recursively
        validateInstructions(repInstruction.instructions, baseIndex);
      }
    });
  }

  validateInstructions(program.instructions);
  return errors;
}

/**
 * Maximum number of compiled instructions allowed
 */
const MAX_COMPILED_INSTRUCTIONS = 4096;

/**
 * Compiles instructions into annotated move instructions with labels
 * Returns the compiled instructions or throws an error if limit is exceeded
 */
function compileInstructions(
  instructions: Instruction[],
  allPrograms: Map<string, Program>,
  nestingLevel: number = 0,
  visitedIds: Set<string> = new Set()
): AnnotatedInstruction[] | { error: CompilationError } {
  const result: AnnotatedInstruction[] = [];
  let globalIndex = 1; // Shared index for all instructions and annotations

  function compile(instrs: Instruction[], level: number, sourceIndexOffset: number = 0): boolean {
    for (let idx = 0; idx < instrs.length; idx++) {
      const instruction = instrs[idx];
      const sourceIndex = sourceIndexOffset + idx;

      // Check instruction limit before adding more
      if (result.length >= MAX_COMPILED_INSTRUCTIONS) {
        return false; // Signal to stop compilation
      }

      switch (instruction.type) {
        case 'move': {
          const moveInstr = instruction as MoveInstruction;
          result.push({
            index: globalIndex++,
            sourceInstructionIndex: sourceIndex,
            leftMotorSpeed: moveInstr.leftMotorSpeed,
            rightMotorSpeed: moveInstr.rightMotorSpeed,
            duration: moveInstr.duration,
            nestingLevel: level,
          });
          break;
        }

        case 'comment': {
          const commentInstr = instruction as CommentInstruction;
          result.push({
            type: 'comment',
            text: commentInstr.text || '',
            nestingLevel: level,
            index: globalIndex++,
          });
          break;
        }

        case 'subroutine': {
          const subInstr = instruction as SubroutineInstruction;
          const subName = subInstr.programName || subInstr.programId;

          // Add subroutine start annotation
          result.push({
            type: 'subroutine-start',
            subroutineName: subName,
            nestingLevel: level,
            index: globalIndex++,
          });

          if (result.length >= MAX_COMPILED_INSTRUCTIONS) {
            return false;
          }

          // Compile subroutine if available and not visited
          const subProgram = allPrograms.get(subInstr.programId);
          if (subProgram && !visitedIds.has(subProgram.id)) {
            visitedIds.add(subProgram.id);
            const success = compile(subProgram.instructions, level + 1, 0);
            visitedIds.delete(subProgram.id);
            if (!success) return false;
          }

          // Add subroutine end annotation
          result.push({
            type: 'subroutine-end',
            subroutineName: subName,
            nestingLevel: level,
            index: globalIndex++,
          });

          if (result.length >= MAX_COMPILED_INSTRUCTIONS) {
            return false;
          }
          break;
        }

        case 'repetition': {
          const repInstr = instruction as RepetitionInstruction;

          for (let i = 1; i <= repInstr.count; i++) {
            // Add iteration start annotation
            result.push({
              type: 'repetition-iteration',
              iterationNumber: i,
              totalIterations: repInstr.count,
              nestingLevel: level,
              index: globalIndex++,
            });

            if (result.length >= MAX_COMPILED_INSTRUCTIONS) {
              return false;
            }

            // Compile nested instructions
            const success = compile(repInstr.instructions, level + 1, sourceIndex);
            if (!success) return false;
          }

          // Add repetition end annotation after all iterations
          result.push({
            type: 'repetition-end',
            totalIterations: repInstr.count,
            nestingLevel: level,
            index: globalIndex++,
          });

          if (result.length >= MAX_COMPILED_INSTRUCTIONS) {
            return false;
          }
          break;
        }
      }
    }
    return true; // Successfully compiled all instructions
  }

  const success = compile(instructions, nestingLevel, 0);

  // Check if compilation was stopped due to limit
  if (!success || result.length > MAX_COMPILED_INSTRUCTIONS) {
    return {
      error: {
        instructionIndex: -1,
        message:
          'Program is too large and complex to execute. Try reducing the number of repetitions or simplifying nested structures.',
        type: 'instruction-limit-exceeded',
        explanationKey: 'instructionLimitExplanation',
      },
    };
  }

  return result;
}

/**
 * Compiles a program into an executable format with validation
 *
 * @param program - The program to compile
 * @param allPrograms - Map of all available programs (for subroutine resolution)
 * @returns CompiledProgram with either errors or compiled instructions
 */
export function compileProgram(
  program: Program,
  allPrograms: Map<string, Program>
): CompiledProgram {
  // Validate the program first
  const errors = validateProgram(program, allPrograms);

  const baseCompiledProgram: Omit<CompiledProgram, 'isValid' | 'errors' | 'compiledInstructions'> =
    {
      id: program.id,
      name: program.name,
      type: program.type,
      createdDate: program.createdDate,
      lastModified: program.lastModified,
      instructionCount: program.instructionCount,
      sourceInstructions: program.instructions,
    };

  // If there are errors, return invalid program with errors
  if (errors.length > 0) {
    // Still attempt compilation to check for instruction limit errors
    const visitedIds = new Set<string>([program.id]);
    const compilationResult = compileInstructions(program.instructions, allPrograms, 0, visitedIds);

    // If compilation also failed, add that error too
    if ('error' in compilationResult) {
      return {
        ...baseCompiledProgram,
        isValid: false,
        errors: [...errors, compilationResult.error],
      };
    }

    // Return with validation errors only
    return {
      ...baseCompiledProgram,
      isValid: false,
      errors,
    };
  }

  // Otherwise, compile the instructions
  const visitedIds = new Set<string>([program.id]);
  const compilationResult = compileInstructions(program.instructions, allPrograms, 0, visitedIds);

  // Check if compilation failed due to instruction limit
  if ('error' in compilationResult) {
    return {
      ...baseCompiledProgram,
      isValid: false,
      errors: [compilationResult.error],
    };
  }

  return {
    ...baseCompiledProgram,
    isValid: true,
    compiledInstructions: compilationResult,
  };
}

/**
 * Checks if a compiled program can be executed
 */
export function canExecute(compiledProgram: CompiledProgram): boolean {
  return compiledProgram.isValid && (compiledProgram.compiledInstructions?.length ?? 0) > 0;
}

/**
 * Gets only the move instructions from compiled program (for execution)
 */
export function getMoveInstructions(compiledProgram: CompiledProgram): CompiledMoveInstruction[] {
  if (!compiledProgram.isValid || !compiledProgram.compiledInstructions) {
    return [];
  }

  return compiledProgram.compiledInstructions.filter(
    (instr): instr is CompiledMoveInstruction => 'leftMotorSpeed' in instr
  );
}

/**
 * Checks if an annotated instruction is executable (not just an annotation)
 */
export function isExecutable(instruction: AnnotatedInstruction): boolean {
  // Move instructions have leftMotorSpeed, annotations don't
  return 'leftMotorSpeed' in instruction;
}

/**
 * Gets the next executable instruction index from a list of annotated instructions
 */
export function getNextExecutableIndex(
  instructions: AnnotatedInstruction[],
  currentIndex: number
): number {
  for (let i = currentIndex + 1; i < instructions.length; i++) {
    if (isExecutable(instructions[i])) {
      return i;
    }
  }
  return currentIndex; // No more executable instructions
}

/**
 * Gets the previous executable instruction index from a list of annotated instructions
 */
export function getPreviousExecutableIndex(
  instructions: AnnotatedInstruction[],
  currentIndex: number
): number {
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (isExecutable(instructions[i])) {
      return i;
    }
  }
  return currentIndex; // No previous executable instructions
}
