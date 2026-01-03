/**
 * Program Type Definitions
 *
 * Represents programs in their compiled or faulty states after compilation.
 *
 * ## Program States:
 *
 * A program can be in one of two states after compilation:
 * 1. **CompiledProgram**: Successfully compiled to executable instructions
 * 2. **FaultyProgram**: Compilation failed with one or more errors
 *
 * ## State Flow:
 * ```
 * ProgramSource (source.ts)
 *      ↓
 *  compile() (compiler.ts)
 *      ↓
 *  ┌─────────────┐
 *  │   Program   │  (discriminated union)
 *  └─────────────┘
 *      ↓
 * ┌────┴────┐
 * ↓         ↓
 * CompiledProgram  FaultyProgram
 * (ready to run)   (has errors)
 * ```
 *
 * ## Type Discrimination:
 * Use the `type` field to discriminate between states:
 * ```typescript
 * const program = await compile(source);
 * if (program.type === 'compiled') {
 *   // program.instructions is available
 *   executeProgram(program.instructions);
 * } else {
 *   // program.errors is available
 *   displayErrors(program.errors);
 * }
 * ```
 */

import { ProgramError } from './errors';
import { Instruction } from './instructions';
import { ProgramSource } from './source';

/**
 * Compiled program - successfully compiled to executable instructions
 *
 * Represents a program that passed all validation and is ready for execution.
 * All subroutines have been inlined, repetitions expanded, and no errors detected.
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
 * // Compiled:
 * {
 *   type: 'compiled',
 *   source: { ... },
 *   instructions: [
 *     { leftMotorSpeed: 100, rightMotorSpeed: 100 },
 *     { leftMotorSpeed: 100, rightMotorSpeed: 100 }
 *   ]
 * }
 * ```
 *
 * @property type - Discriminant: 'compiled' indicates success
 * @property source - Original ProgramSource that was compiled
 * @property instructions - Fully expanded, executable instruction array
 */
export interface CompiledProgram {
  type: 'compiled';
  source: ProgramSource;
  instructions: Instruction[];
}

/**
 * Faulty program - compilation failed with one or more errors
 *
 * Represents a program that failed validation during compilation.
 * Contains the original source and an array of errors explaining what went wrong.
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
 * // Compiled result:
 * {
 *   type: 'faulty',
 *   source: { ... },
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
 * if (program.type === 'faulty') {
 *   for (const error of program.errors) {
 *     console.error(`Error in statement ${error.statementIndex}: ${error.type}`);
 *   }
 * }
 * ```
 *
 * @property type - Discriminant: 'faulty' indicates compilation failure
 * @property source - Original ProgramSource that failed compilation
 * @property errors - Array of errors detected during compilation (non-empty)
 */
export interface FaultyProgram {
  type: 'faulty';
  source: ProgramSource;
  errors: ProgramError[];
}

/**
 * Union type for all program states
 */
export type Program = CompiledProgram | FaultyProgram;
