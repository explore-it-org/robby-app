/**
 * Program Error Type Definitions
 *
 * Represents different types of errors that can occur during program compilation.
 *
 * ## Error Categories:
 *
 * ### Complexity Errors
 * - **ComplexityError**: Program exceeds maximum instruction limit after expansion
 * - Applies to entire program, not a specific statement
 * - Caused by deep subroutine nesting or high repetition counts
 *
 * ### Reference Errors
 * - **MissingReferenceError**: Subroutine references non-existent program
 * - **FaultyReferenceError**: Subroutine references program with compilation errors
 * - **CyclicReferenceError**: Circular dependency detected (A → B → A)
 * - All reference errors include statementIndex to identify problematic statement
 *
 * ## Error Detection:
 * Errors are detected during compilation (compiler.ts):
 * - Complexity: After expanding all statements
 * - Missing reference: When loading referenced program fails
 * - Faulty reference: When referenced program compilation returns errors
 * - Cyclic reference: When call stack contains duplicate program name
 */

/**
 * Complexity error - program exceeds the maximum allowed instruction count
 *
 * Occurs when the total instruction count after expanding all statements
 * (including subroutines and repetitions) exceeds MAX_INSTRUCTIONS (1000).
 *
 * ## Why no statementIndex?
 * This error applies to the **entire program**, not a specific statement.
 * The complexity is cumulative - it's the sum of all expansions that matters.
 *
 * ## Example causes:
 * - Deep subroutine nesting: MainProgram → SubA → SubB → ... (each with instructions)
 * - High repetition counts: 100 statements × 100 repetitions = 10,000 instructions
 * - Combination: Subroutine with 50 instructions called 50 times = 2,500 instructions
 *
 * @property type - Discriminant for union type
 * @property maxInstructions - Maximum allowed instructions (1000)
 */
export interface ComplexityError {
  type: 'complexity';
  maxInstructions: number;
}

/**
 * Missing reference error - the referred program does not exist
 *
 * Occurs when a SubroutineStatement references a program name that cannot be found in storage.
 *
 * ## Example:
 * ```typescript
 * // Program "Main" contains:
 * SubroutineStatement { programReference: "Forward", repetitions: 1 }
 * // But program "Forward" doesn't exist in storage
 * // → MissingReferenceError { statementIndex: 0, programReference: "Forward" }
 * ```
 *
 * ## Detection:
 * Checked in compiler.ts:compileSubroutineStatement() when loadProgramSource() returns null
 *
 * @property type - Discriminant for union type
 * @property statementIndex - Position of the problematic SubroutineStatement in source
 * @property programReference - Name of the missing program
 */
export interface MissingReferenceError {
  type: 'missing-reference';
  statementIndex: number;
  programReference: string;
}

/**
 * Faulty reference error - the referred program exists but has compilation errors
 *
 * Occurs when a SubroutineStatement references a program that exists but fails to compile.
 * The referenced program itself has errors (missing references, cycles, or complexity issues).
 *
 * ## Example:
 * ```typescript
 * // Program "Main" contains:
 * SubroutineStatement { programReference: "BrokenProgram", repetitions: 1 }
 * // Program "BrokenProgram" exists but contains a cyclic reference
 * // → FaultyReferenceError { statementIndex: 0, programReference: "BrokenProgram" }
 * ```
 *
 * ## Detection:
 * Checked in compiler.ts:compileSubroutineStatement() when recursive compilation
 * returns a FaultyProgram instead of CompiledProgram
 *
 * ## Error Propagation:
 * This prevents cascading errors - we don't inline instructions from broken programs
 *
 * @property type - Discriminant for union type
 * @property statementIndex - Position of the problematic SubroutineStatement in source
 * @property programReference - Name of the faulty program
 */
export interface FaultyReferenceError {
  type: 'faulty-reference';
  statementIndex: number;
  programReference: string;
}

/**
 * Cyclic reference error - the referred program creates a circular dependency
 *
 * Occurs when a program references itself directly or indirectly through a chain of subroutines.
 * Without this check, compilation would recurse infinitely.
 *
 * ## Examples:
 *
 * ### Direct cycle (A → A):
 * ```typescript
 * // Program "Main" contains:
 * SubroutineStatement { programReference: "Main", repetitions: 1 }
 * // → CyclicReferenceError (self-reference)
 * ```
 *
 * ### Indirect cycle (A → B → A):
 * ```typescript
 * // Program "Main" contains:
 * SubroutineStatement { programReference: "SubA" }
 * // Program "SubA" contains:
 * SubroutineStatement { programReference: "Main" }
 * // → CyclicReferenceError when compiling "SubA"
 * ```
 *
 * ### Multi-level cycle (A → B → C → A):
 * ```typescript
 * // Main → SubA → SubB → Main
 * // → CyclicReferenceError when compiling "SubB"
 * ```
 *
 * ## Detection:
 * Checked in compiler.ts:compileSubroutineStatement() by examining call stack.
 * If programReference is already in callStack, a cycle exists.
 *
 * ## Call Stack Example:
 * Compiling Main → SubA → SubB:
 * - callStack = ["Main", "SubA", "SubB"]
 * - If SubB references "Main" or "SubA", cycle detected
 *
 * @property type - Discriminant for union type
 * @property statementIndex - Position of the problematic SubroutineStatement in source
 * @property programReference - Name of the program that creates the cycle
 */
export interface CyclicReferenceError {
  type: 'cyclic-reference';
  statementIndex: number;
  programReference: string;
}

/**
 * Union type for all program error types
 */
export type ProgramError =
  | ComplexityError
  | MissingReferenceError
  | FaultyReferenceError
  | CyclicReferenceError;
