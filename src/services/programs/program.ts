/**
 * Program Type Definitions
 *
 * Represents compiled programs after compilation. A compiled program can be either
 * successfully compiled (ready to run) or faulty (has compilation errors).
 *
 * ## Compiled Program States:
 *
 * A compiled program (CompiledProgram) is a discriminated union with two possible states:
 * 1. **type: 'compiled'**: Successfully compiled to executable instructions (CorrectProgram)
 * 2. **type: 'faulty'**: Compilation completed but with one or more errors (FaultyProgram)
 *
 * ## State Flow:
 * ```
 * ProgramSource (source.ts)
 *      ↓
 *  compile() (compiler.ts)
 *      ↓
 *  ┌──────────────────┐
 *  │ CompiledProgram  │  (discriminated union - always returned)
 *  └──────────────────┘
 *      ↓
 * ┌────┴────┐
 * ↓         ↓
 * type='compiled'   type='faulty'
 * (ready to run)    (has errors, can be edited to fix)
 * ```
 *
 * ## Type Discrimination:
 * Use the `type` field to discriminate between states:
 * ```typescript
 * const compiledProgram = await compile(source);
 * if (compiledProgram.type === 'compiled') {
 *   // Success - compiledProgram.instructions is available
 *   executeProgram(compiledProgram.instructions);
 * } else {
 *   // Has errors - compiledProgram.errors is available
 *   // Program can still be edited to fix the errors
 *   displayErrors(compiledProgram.errors);
 * }
 * ```
 */

import { ProgramError } from './errors';
import { Instruction } from './instructions';

/**
 * Successfully compiled program - ready for execution
 *
 * Represents a program that passed all validation and is ready for execution.
 * All subroutines have been inlined, repetitions expanded, and no errors detected.
 * This is one variant of the CompiledProgram discriminated union.
 *
 * ## Characteristics:
 * - No cyclic references
 * - All subroutine references resolved
 * - All referenced programs compiled successfully
 * - Total instruction count ≤ MAX_INSTRUCTIONS (1000)
 *
 * ## Instruction Array:
 * The instructions array contains the fully expanded, executable program:
 * - All SubroutineStatements expanded inline
 * - All repetitions expanded (N repetitions → N instructions)
 * - No nesting (flat array)
 * - Ready to send to robot via Bluetooth
 *
 * ## Example:
 * ```typescript
 * // Source:
 * {
 *   name: "Test",
 *   statements: [
 *     { type: 'move', left: 100, right: 100, repetitions: 2 }
 *   ]
 * }
 *
 * // Compiled result:
 * {
 *   type: 'compiled',
 *   instructions: [
 *     { leftMotorSpeed: 100, rightMotorSpeed: 100 },
 *     { leftMotorSpeed: 100, rightMotorSpeed: 100 }
 *   ]
 * }
 * ```
 *
 * @property type - Discriminant: 'compiled' indicates successful compilation
 * @property instructions - Fully expanded, executable instruction array
 */
export interface CorrectProgram {
  type: 'compiled';
  instructions: Instruction[];
}

/**
 * Faulty program - compiled with one or more errors
 *
 * Represents a program that completed compilation but has validation errors.
 * This is one variant of the CompiledProgram discriminated union.
 * Even though it has errors, the program can still be edited to fix them.
 *
 * ## Error Types:
 * - **ComplexityError**: Total instructions exceed limit (1000)
 * - **MissingReferenceError**: Subroutine references non-existent program
 * - **FaultyReferenceError**: Subroutine references program with compilation errors
 * - **CyclicReferenceError**: Circular dependency detected
 *
 * ## Multiple Errors:
 * The errors array can contain multiple errors if compilation continues after
 * detecting non-fatal issues (e.g., multiple missing references).
 *
 * ## Example:
 * ```typescript
 * // Source with missing reference:
 * {
 *   name: "Main",
 *   statements: [
 *     { type: 'subroutine', programReference: 'NonExistent', repetitions: 1 }
 *   ]
 * }
 *
 * // Compiled result (faulty):
 * {
 *   type: 'faulty',
 *   errors: [
 *     {
 *       type: 'missing-reference',
 *       statementIndex: 0,
 *       programReference: 'NonExistent'
 *     }
 *   ]
 * }
 * ```
 *
 * ## Usage:
 * ```typescript
 * const compiledProgram = await compile(source);
 * if (compiledProgram.type === 'faulty') {
 *   // Display errors to user, but they can still edit the program to fix them
 *   for (const error of compiledProgram.errors) {
 *     console.error(`Error in statement ${error.statementIndex}: ${error.type}`);
 *   }
 * }
 * ```
 *
 * @property type - Discriminant: 'faulty' indicates compilation found errors
 * @property errors - Array of errors detected during compilation (non-empty)
 */
export interface FaultyProgram {
  type: 'faulty';
  errors: ProgramError[];
}

/**
 * Compiled Program - discriminated union of compilation results
 *
 * A compiled program is the result of running the compile() function on a ProgramSource.
 * It can be in one of two states:
 * - **CorrectProgram** (type='compiled'): Successfully compiled, ready to execute
 * - **FaultyProgram** (type='faulty'): Has compilation errors, can be edited to fix
 *
 * Both states are considered "compiled" because compilation has completed.
 * Use the `type` field to discriminate between success and error states.
 */
export type CompiledProgram = CorrectProgram | FaultyProgram;
