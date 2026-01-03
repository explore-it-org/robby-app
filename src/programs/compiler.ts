import { ProgramError } from './errors';
import { Instruction } from './instructions';
import { Program } from './program';
import { loadProgramSource, ProgramSource } from './source';
import { MoveStatement, Statement, SubroutineStatement } from './statements';

export async function compile(source: ProgramSource): Promise<Program> {
  return await compileInternal(source, [source.name]);
}

async function compileInternal(source: ProgramSource, callStack: string[]): Promise<Program> {
  const MAX_INSTRUCTIONS = 1000;
  let instructions: Instruction[] = [];
  let errors: ProgramError[] = [];

  for (let i = 0; i < source.statements.length; i++) {
    let statement = source.statements[i];
    let result = await compileStatement(statement, i, callStack);

    if (isSuccessful(result)) {
      if (instructions.length + result.length > MAX_INSTRUCTIONS) {
        errors.push({
          type: 'complexity',
          maxInstructions: MAX_INSTRUCTIONS,
        });
      } else {
        instructions.push(...result);
      }
    } else {
      errors.push(result);
    }
  }

  if (errors.length > 0) {
    return {
      type: 'faulty',
      source,
      errors,
    };
  } else {
    return {
      type: 'compiled',
      source,
      instructions,
    };
  }
}

async function compileStatement(
  statement: Statement,
  index: number,
  callStack: string[]
): Promise<CompilationResult> {
  switch (statement.type) {
    case 'move':
      return compileMoveStatement(statement);
    case 'subroutine':
      return await compileSubroutineStatement(statement, index, callStack);
    default:
      throw new Error(`Unknown statement type: ${(statement as any).type}`);
  }
}

function compileMoveStatement(statement: MoveStatement): CompilationResult {
  let instruction: Instruction = {
    leftMotorSpeed: statement.leftMotorSpeed,
    rightMotorSpeed: statement.rightMotorSpeed,
  };

  return Array(statement.repetitions).fill(instruction);
}

async function compileSubroutineStatement(
  statement: SubroutineStatement,
  index: number,
  callStack: string[]
): Promise<CompilationResult> {
  // Detect circular references
  if (callStack.includes(statement.programReference)) {
    return {
      type: 'cyclic-reference',
      statementIndex: index,
      programReference: statement.programReference,
    };
  }

  // Check if the referenced program exists
  let referencedProgramSource = await loadProgramSource(statement.programReference);
  if (!referencedProgramSource) {
    return {
      type: 'missing-reference',
      statementIndex: index,
      programReference: statement.programReference,
    };
  }

  // Check if the referenced program compiled successfully
  let compiledReferencedProgram = await compileInternal(referencedProgramSource, [
    ...callStack,
    statement.programReference,
  ]);
  if (compiledReferencedProgram.type === 'faulty') {
    return {
      type: 'faulty-reference',
      statementIndex: index,
      programReference: statement.programReference,
    };
  }

  // Expand the instructions based on repetitions
  let instructions: Instruction[] = [];
  for (let i = 0; i < statement.repetitions; i++) {
    instructions.push(...compiledReferencedProgram.instructions);
  }

  return instructions;
}
type CompilationResult = Instruction[] | ProgramError;

function isSuccessful(result: CompilationResult): result is Instruction[] {
  return Array.isArray(result);
}
