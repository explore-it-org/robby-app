/**
 * Program Compiler
 *
 * Compiles high-level ProgramSource (with Statements) into a CompiledProgram.
 * The result is always a CompiledProgram (discriminated union), which can be either:
 * - Successfully compiled (type='compiled') with executable instructions
 * - Faulty (type='faulty') with compilation errors
 *
 * ## Compilation Process:
 *
 * 1. **Statement Expansion**: Each Statement is compiled into one or more Instructions
 *    - MoveStatement with repetitions=N → N identical MoveInstructions
 *    - SubroutineStatement → Recursively compile referenced program and inline its instructions
 *
 * 2. **Subroutine Resolution**: Subroutines are expanded inline
 *    - Load referenced program by name
 *    - Recursively compile it
 *    - Insert all its instructions (repeated N times based on repetitions field)
 *
 * 3. **Cycle Detection**: Call stack prevents infinite recursion
 *    - Track program names in callStack during compilation
 *    - If a program references itself (directly or indirectly), return cyclic-reference error
 *
 * 4. **Complexity Limiting**: Total instruction count is capped at MAX_INSTRUCTIONS (1000)
 *    - After expanding all statements, check total instruction count
 *    - If exceeded, add complexity error to prevent memory/performance issues
 *
 * 5. **Validation**: Detect missing or faulty program references
 *    - missing-reference: Referenced program doesn't exist
 *    - faulty-reference: Referenced program exists but failed to compile
 *
 * ## Output (CompiledProgram):
 * Always returns a CompiledProgram discriminated union:
 * - **type='compiled'**: Successfully compiled, ready for execution (instructions array)
 * - **type='faulty'**: Has compilation errors (errors array), can be edited to fix
 */

import { ProgramError } from './errors';
import { Instruction } from './instructions';
import { CompiledProgram } from './program';
import { ProgramSource } from './source';
import { MoveStatement, Statement, SubroutineStatement } from './statements';
import { ProgramStorage } from './storage';

/**
 * Clamp a value between min and max (inclusive)
 * Used for defensive programming to handle invalid input values
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Compile a program source into a compiled program
 *
 * Entry point for compilation. Delegates to compileInternal with initial call stack.
 * Always returns a CompiledProgram (discriminated union) which can be either successfully
 * compiled (type='compiled') or faulty (type='faulty').
 *
 * @param source - High-level program source with statements
 * @returns Promise resolving to CompiledProgram (CorrectProgram | FaultyProgram)
 */
export function compile(source: ProgramSource, programStorage: ProgramStorage): CompiledProgram {
  return compileInternal(source, [source.name], programStorage);
}

/**
 * Internal compilation function with call stack tracking
 *
 * Recursively compiles programs while tracking the call chain to detect cycles.
 *
 * @param source - Program source to compile
 * @param callStack - Chain of program names in current compilation path (for cycle detection)
 *                    Example: ["MainProgram", "SubA", "SubB"] means MainProgram → SubA → SubB
 * @returns CompiledProgram (either type='compiled' with instructions, or type='faulty' with errors)
 *
 * ## Algorithm:
 * 1. Initialize empty instruction list and error list
 * 2. For each statement in source:
 *    a. Compile the statement (may expand to multiple instructions)
 *    b. If successful and within limits, add to instruction list
 *    c. If complexity limit exceeded, add complexity error
 *    d. If compilation failed, add error to error list
 * 3. Return CorrectProgram (type='compiled') if no errors, otherwise FaultyProgram (type='faulty')
 */
function compileInternal(
  source: ProgramSource,
  callStack: string[],
  programStorage: ProgramStorage
): CompiledProgram {
  const MAX_INSTRUCTIONS = 1000; // Maximum total instructions after expansion
  let instructions: Instruction[] = [];
  let errors: ProgramError[] = [];

  // Compile each statement sequentially
  for (let i = 0; i < source.statements.length; i++) {
    let statement = source.statements[i];
    let result = compileStatement(statement, i, callStack, programStorage);

    if (isSuccessful(result)) {
      // Result is an array of instructions
      // Check if adding these instructions would exceed the limit
      if (instructions.length + result.length > MAX_INSTRUCTIONS) {
        errors.push({
          type: 'complexity',
          maxInstructions: MAX_INSTRUCTIONS,
        });
        // Continue processing to find other potential errors
        // Note: This could generate multiple complexity errors if many statements exceed limit
      } else {
        instructions.push(...result);
      }
    } else {
      // Result is an error (missing-reference, cyclic-reference, or faulty-reference)
      errors.push(result);
    }
  }

  // Return based on whether any errors were encountered
  // Both return types are part of the CompiledProgram discriminated union
  if (errors.length > 0) {
    return {
      type: 'faulty',
      errors,
    };
  } else {
    return {
      type: 'compiled',
      instructions,
    };
  }
}

/**
 * Compile a single statement into instructions or error
 *
 * Dispatcher that delegates to specific compilers based on statement type.
 *
 * @param statement - Statement to compile
 * @param index - Position of this statement in the source (for error reporting)
 * @param callStack - Current program call chain (for cycle detection)
 * @returns Array of instructions (success) or ProgramError (failure)
 */
function compileStatement(
  statement: Statement,
  index: number,
  callStack: string[],
  programStorage: ProgramStorage
): CompilationResult {
  switch (statement.type) {
    case 'move':
      return compileMoveStatement(statement);
    case 'subroutine':
      return compileSubroutineStatement(statement, index, callStack, programStorage);
    default:
      throw new Error(`Unknown statement type: ${(statement as any).type}`);
  }
}

/**
 * Compile a move statement into move instructions
 *
 * Expands a single MoveStatement with repetitions into N identical MoveInstructions.
 *
 * @param statement - Move statement with motor speeds and repetitions
 * @returns Array of identical move instructions
 *
 * ## Example:
 * Input:  MoveStatement { leftMotorSpeed: 80, rightMotorSpeed: 50, repetitions: 3 }
 * Output: [
 *   { leftMotorSpeed: 80, rightMotorSpeed: 50 },
 *   { leftMotorSpeed: 80, rightMotorSpeed: 50 },
 *   { leftMotorSpeed: 80, rightMotorSpeed: 50 }
 * ]
 *
 * ## Optimization:
 * Uses Array.fill() to create array with shared object references.
 * This is safe because compiled instructions are immutable.
 */
function compileMoveStatement(statement: MoveStatement): CompilationResult {
  // Clamp motor speeds to valid range (0-100)
  // UI validation should prevent invalid values, but clamp for defensive programming
  const leftMotorSpeed = clamp(statement.leftMotorSpeed, 0, 100);
  const rightMotorSpeed = clamp(statement.rightMotorSpeed, 0, 100);

  // Clamp repetitions to valid range (1-100)
  const repetitions = clamp(statement.repetitions, 1, 100);

  // Create the instruction template
  let instruction: Instruction = {
    leftMotorSpeed,
    rightMotorSpeed,
  };

  // Fill array with references to the same instruction object
  // Safe because instructions are immutable after creation
  return Array(repetitions).fill(instruction);
}

/**
 * Compile a subroutine statement by inlining the referenced program
 *
 * This is the most complex compilation step. It:
 * 1. Loads the referenced program by name
 * 2. Recursively compiles it (expanding any nested subroutines)
 * 3. Inlines all its instructions, repeated N times
 *
 * @param statement - Subroutine statement with program name and repetitions
 * @param index - Position in source (for error reporting)
 * @param callStack - Current call chain (for cycle detection)
 * @returns Array of inlined instructions or error
 *
 * ## Example:
 * ```
 * Program "Main":
 *   SubroutineStatement { programReference: "Forward", repetitions: 2 }
 *
 * Program "Forward":
 *   MoveStatement { left: 100, right: 100, repetitions: 3 }
 *
 * Compilation result for "Main":
 *   [
 *     // First call to "Forward" (3 instructions)
 *     { left: 100, right: 100 },
 *     { left: 100, right: 100 },
 *     { left: 100, right: 100 },
 *     // Second call to "Forward" (3 instructions)
 *     { left: 100, right: 100 },
 *     { left: 100, right: 100 },
 *     { left: 100, right: 100 }
 *   ]
 * ```
 *
 * ## Cycle Detection:
 * Call stack tracks the chain: ["Main", "SubA", "SubB"]
 * If "SubB" tries to reference "Main" or "SubA", a cycle is detected and error returned.
 *
 * ## Error Cases:
 * - **cyclic-reference**: Infinite recursion (A → B → A)
 * - **missing-reference**: Referenced program doesn't exist
 * - **faulty-reference**: Referenced program exists but failed to compile
 */
function compileSubroutineStatement(
  statement: SubroutineStatement,
  index: number,
  callStack: string[],
  programStorage: ProgramStorage
): CompilationResult {
  // STEP 1: Detect circular references (cycle detection)
  // Check if this program is already in the call stack
  // Example: If callStack = ["Main", "SubA"] and statement.programReference = "Main"
  //          This creates cycle: Main → SubA → Main (infinite recursion)
  if (callStack.includes(statement.programReference)) {
    return {
      type: 'cyclic-reference',
      statementIndex: index,
      programReference: statement.programReference,
    };
  }

  // STEP 2: Load the referenced program from storage
  // Uses name-based lookup (see source.ts for implementation)
  let referencedProgramSource = programStorage.getProgramSource(statement.programReference);
  if (!referencedProgramSource) {
    // Program with this name doesn't exist in storage
    return {
      type: 'missing-reference',
      statementIndex: index,
      programReference: statement.programReference,
    };
  }

  // STEP 3: Recursively compile the referenced program
  // Add this program to call stack to detect cycles in nested calls
  // Example: callStack ["Main"] becomes ["Main", "SubA"]
  let compiledReferencedProgram = compileInternal(
    referencedProgramSource,
    [...callStack, statement.programReference],
    programStorage
  );

  // STEP 4: Check if referenced program compiled successfully
  // compiledReferencedProgram is a CompiledProgram, check if it's faulty
  if (compiledReferencedProgram.type === 'faulty') {
    // Referenced program has compilation errors
    // Don't inline it - report as faulty reference
    return {
      type: 'faulty-reference',
      statementIndex: index,
      programReference: statement.programReference,
    };
  }

  // STEP 5: Inline the compiled instructions, repeated N times
  // Clamp repetitions to valid range (1-100)
  const repetitions = clamp(statement.repetitions, 1, 100);
  let instructions: Instruction[] = [];

  // Repeat the entire instruction sequence N times
  for (let i = 0; i < repetitions; i++) {
    instructions.push(...compiledReferencedProgram.instructions);
  }

  return instructions;
}

/**
 * Result of compiling a single statement
 *
 * Either:
 * - Array of Instructions (success - statement was compiled)
 * - ProgramError (failure - validation error or reference issue)
 */
type CompilationResult = Instruction[] | ProgramError;

/**
 * Type guard to check if compilation result is successful
 *
 * @param result - Compilation result to check
 * @returns true if result is an instruction array, false if it's an error
 */
function isSuccessful(result: CompilationResult): result is Instruction[] {
  return Array.isArray(result);
}
