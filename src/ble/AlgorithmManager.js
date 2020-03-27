import { Block, Program, ProgramType } from '../model/DatabaseModels';
import Database from '../database/RoboticsDatabase';
import uuidv4 from 'uuid/v4';
import { add } from '../database/DatabaseAction';
import { loadChildren, loadBlock } from '../programmingtabs/blockprogramming/ActiveBlockAction';
import { loadInstruction } from '../programmingtabs/stepprogramming/ActiveInstructionAction';
import * as NavigationService from '../utillity/NavigationService';

export class AlgorithmManager {
    constructor() {
        if (!AlgorithmManager.instance) {
            this._handlers = {
                0: new DefaultAlgorithmHandler(),
                1: new AlgorithmHandler1(),
                2: new AlgorithmHandler2(),
                3: new AlgorithmHandler3(),
                4: new AlgorithmHandler4(),
                5: new AlgorithmHandler5(),
                6: new AlgorithmHandler6(),
            };
            AlgorithmManager.instance = this;
        }

        return AlgorithmManager.instance;
    }

    getHandler(index) {
        return this._handlers[index] || new DefaultAlgorithmHandler();
    }

    getBootstrapHandler() {
        return this._handlers[0];
    }

    getAllAlgorithms() {
        return this._handlers;
    }
}

export const AlgorithmVersion = {
    V1: 1,
    V2: 2,
};

export class AlgorithmHandler {
    constructor(displayName) {
        this._displayName = displayName;
    }

    get displayName() {
        return this._displayName;
    }

    handle(version, input, dispatch, sortByDepth, sortByLength, inverseSorting) {
        let programs = Database.findAll().filter(program => {
            return Program.flatten(program).length < input.length;
        });

        if (sortByDepth) {
            programs.sort((a, b) => {
                return Program.depth(a) - Program.depth(b);
            });
        } else if (sortByLength) {
            programs.sort((a, b) => {
                return Program.length(a) - Program.length(b);
            });
        }

        if (inverseSorting) {
            programs.reverse();
        }
        let result;
        if (version == AlgorithmVersion.V1) {
            result = this.searchStructureFromDb(input, programs, dispatch);
        } else {
            result = this.searchStructure(input, programs, dispatch);
        }

        if (result.length == 1 && result[0].rep == 1) {
            program = Database.findOneByPK(result[0].ref);
        } else {
            program = new Program('MasterDownload', ProgramType.BLOCKS, [], result);
            program = this.saveProgram(program, dispatch);
        }

        if (program.programType == ProgramType.BLOCKS) {
            dispatch(loadChildren());
            dispatch(loadBlock(program.name));
            NavigationService.navigate('Blockprogramming');
        } else {
            dispatch(loadInstruction(program.name));
            NavigationService.navigate('Stepprogramming');
        }
    }

    /**
     * Searches in the given list `toSearchIn` of instructions for programs passed with the parameter `patterns`
     * and returns a list of blocks which were found. The patterns are searched in the order they appear
     * in the given list `patterns`. Instructions between two matching patterns are saved to the Database and returned as a Block.
     * @param {Instruction[]} toSearchIn
     * @param {Program[]} patterns
     * @param {Function} dispatch reference to the redux dispatch function, used in the saveProgram method to dispatch the add(program) redux action
     * @returns {Block[]}
     */
    searchStructureFromDb(toSearchIn, patterns, dispatch) {
        if (toSearchIn.length == 0) {
            return [];
        } else if (patterns.length == 0) {
            let id = this.saveProgram(
                new Program('Download', ProgramType.BLOCKS, toSearchIn, []),
                dispatch,
            ).id;
            return [new Block(id, 1)];
        }

        let pattern = Program.flatten(patterns[0]);
        let foundAt = this.instructionsContain(toSearchIn, pattern);

        if (foundAt == -1) {
            return this.searchStructureFromDb(
                toSearchIn,
                patterns.slice(1, patterns.length),
                dispatch,
            );
        } else if (foundAt > 0) {
            let before = toSearchIn.slice(0, foundAt);

            let after = toSearchIn.slice(foundAt + pattern.length, toSearchIn.length);
            let currentBlock = new Block(patterns[0].id, 1);
            let blocksBefore = this.searchStructureFromDb(
                before,
                patterns.slice(1, patterns.length),
                dispatch,
            );
            let blocksAfter = this.searchStructureFromDb(after, patterns, dispatch);

            if (
                blocksBefore &&
                blocksBefore.length > 0 &&
                blocksBefore[blocksBefore.length - 1].ref == currentBlock.ref
            ) {
                currentBlock.rep += blocksBefore[0].rep;
                blocksBefore = blocksBefore.slice(0, blocksBefore.length - 1);
            }

            if (
                blocksAfter &&
                blocksAfter.length > 0 &&
                blocksAfter[0].ref == currentBlock.ref
            ) {
                currentBlock.rep += blocksAfter[0].rep;
                blocksAfter = blocksAfter.slice(1, blocksAfter.length);
            }

            return [...blocksBefore, currentBlock, ...blocksAfter];
        } else {
            let currentBlock = new Block(patterns[0].id, 1);
            let after = toSearchIn.slice(pattern.length, toSearchIn.length);
            let blocksAfter = this.searchStructureFromDb(after, patterns, dispatch);

            if (
                blocksAfter &&
                blocksAfter.length > 0 &&
                blocksAfter[0].ref == currentBlock.ref
            ) {
                currentBlock.rep += blocksAfter[0].rep;
                blocksAfter = blocksAfter.slice(1, blocksAfter.length);
            }

            return [currentBlock, ...blocksAfter];
        }
    }

    /**
     * Searches in the given list `toSearchIn` of instructions for patterns startign with the largest possible pattern having half the length of `toSearchIn`
     * and returns a list of blocks. Patterns are saved to the Database and returned as a Block.
     * @param {Instruction[]} toSearchIn
     * @param {Function} dispatch reference to the redux dispatch function, used in the saveProgram method to dispatch the add(program) redux action
     * @returns {Block[]}
     */
    searchStructure(toSearchIn, dbPrograms, dispatch, minPatternLength) {
        let steps = toSearchIn;
        if (toSearchIn.length == 0) {
            return [];
        }

        const dbPrg = this.findProgramByPattern(toSearchIn, dbPrograms);
        if (dbPrg) {
            return [new Block(dbPrg.id, 1)];
        }

        let patlen = toSearchIn.length / 2;
        let blocks = [];
        while (patlen > minPatternLength) {
            for (let i = 0; i <= steps.length - 2 * patlen; i++) {
                let pattern = toSearchIn.slice(i, i + patlen);
                let remainder = toSearchIn.slice(i + patlen, toSearchIn.length);

                let foundAt = this.instructionsContain(remainder, pattern);
                if (foundAt > -1) {
                    let ref = this.findProgramByPattern(pattern, dbPrograms);
                    if (!ref) {
                        let toSave = this.searchStructure(pattern, dispatch);
                        let prg;
                        if (toSave.length == 1 && toSave[0].rep == 1) {
                            ref = Database.findOneByPK(toSave[0].ref);
                        } else {
                            prg = new Program('Download', ProgramType.BLOCKS, [], toSave);
                            ref = this.saveProgram(prg, dispatch);
                        }
                    }

                    while (toSearchIn.length > 0) {
                        foundAt = this.instructionsContain(toSearchIn, pattern);
                        if (foundAt > 0) {
                            let before = toSearchIn.slice(0, foundAt);
                            if (before.length) {
                                let blocksBefore = this.searchStructure(blocksBefore, dispatch);
                                blocks.concat(blocksBefore);
                                toSearchIn = toSearchIn.slice(foundAt);
                            }
                        } else if (foundAt == 0) {
                            let rep = 0;
                            while (this.instructionsContain(toSearchIn, pattern) == 0) {
                                rep++;
                                toSearchIn = toSearchIn.slice(patlen);
                            }
                            blocks.push(new Block(ref.id, rep));
                        } else {
                            let remainingBlocks = this.searchStructure(toSearchIn, dispatch);
                            blocks.concat(remainingBlocks);
                            toSearchIn = [];
                        }
                    }
                    return blocks;
                }
            }
            patlen--;
        }
        if (blocks.length > 0) {
            return blocks;
        }
        if (steps.length > 0) {
            let sequenceProgram = new Program(
                'Download',
                ProgramType.STEPS,
                steps,
                [],
            );
            return [new Block(this.saveProgram(sequenceProgram, dispatch).id, 1)];
        } else {
            return [];
        }
    }

    /**
     * Returns null or a program from the DB that matches the supplied pattern.
     * @param {Instruction[]} pattern
     */
    findProgramByPattern(pattern, dbPrograms) {
        for (let i = 0; i < dbPrograms.length; i++) {
            if (this.compareInstructions(Program.flatten(dbPrograms[i]), pattern)) {
                return dbPrograms[i];
            }
        }
        return null;
    }

    /**
     * Save program and add an incremental number to the end of it if it already exists
     * @param {Program} program
     * @param {Function} dispatch Refference to the redux dispatch function
     */
    saveProgram(program, dispatch) {
        let i = 1;
        let newName = program.name;
        while (!Database.nameIsUnused(program.name)) {
            program.name = newName + '(' + i + ')';
            i++;
        }
        program.id = uuidv4();
        dispatch(add(program));
        return program;
    }

    /**
     * returns the index of a pattern in a instruction collection or -1 if it doesn't contain the pattern
     * @param {Instruction[]} instructions
     * @param {Instruction[]} pattern
     */
    instructionsContain(instructions, pattern) {
        if (
            instructions.length < pattern.length ||
            !instructions ||
            !pattern ||
            instructions.length == 0 ||
            pattern.length == 0
        ) {
            return -1;
        }
        for (let i = 0; i <= instructions.length - pattern.length; i++) {
            let found = true;
            for (let j = 0; found && j < pattern.length; j++) {
                found = instructions[i + j].equals(pattern[j]);
            }
            if (found) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Goes through all programs and sorts them by complexity.
     * After sorting it converts all programs in to instructions and compares them.
     * The first match will be returned.
     * @param {Instruction[]} instructions
     * @param {Program[]} programs
     */
    recreateProgramFromInstructions(instructions) {
        const programs = Database.findAll();
        let sorted = programs.sort((a, b) => Program.depth(a) - Program.depth(b));
        for (let i = 0; i < sorted.length; i++) {
            let prg = sorted[i];
            let flat = Program.flatten(prg);
            if (this.compareInstructions(flat, instructions)) {
                return prg;
            }
        }
        return null;
    }

    /**
     * Compares two lists of instructions
     * Saving some time by first comparing the length of the lists before comparing every single one
     * @param {Instruction[]} instructions1
     * @param {Instruction[]} instructions2
     */
    compareInstructions(instructions1, instructions2) {
        if (instructions1.length != instructions2.length) {
            return false;
        }
        for (let i = 0; i < instructions1.length; i++) {
            if (!instructions1[i].equals(instructions2[i])) {
                return false;
            }
        }
        return true;
    }
}

export class DefaultAlgorithmHandler extends AlgorithmHandler {
    constructor() {
        super('Default Handler');
    }

    handleInput(input, dispatch) {
        return [];
    }
}

export class AlgorithmHandler1 extends AlgorithmHandler {
    constructor() {
        super('V1 | SortedByDepth');
    }
    handleInput(input, dispatch) {
        return super.handle(
            AlgorithmVersion.V1,
            input,
            dispatch,
            true,
            false,
            false,
        );
    }
}

export class AlgorithmHandler2 extends AlgorithmHandler {
    constructor() {
        super('V1 | SortedByLength');
    }
    handleInput(input, dispatch) {
        return super.handle(
            AlgorithmVersion.V1,
            input,
            dispatch,
            true,
            false,
            false,
        );
    }
}

export class AlgorithmHandler3 extends AlgorithmHandler {
    constructor() {
        super('V1 | Not Sorted');
    }
    handleInput(input, dispatch) {
        return super.handle(
            AlgorithmVersion.V1,
            input,
            dispatch,
            false,
            false,
            false,
        );
    }
}

export class AlgorithmHandler4 extends AlgorithmHandler {
    constructor() {
        super('V2 | SortedByDepth');
    }
    handleInput(input, dispatch) {
        return super.handle(
            AlgorithmVersion.V2,
            input,
            dispatch,
            true,
            false,
            false,
        );
    }
}

export class AlgorithmHandler5 extends AlgorithmHandler {
    constructor() {
        super('V2 | SortedByLength');
    }
    handleInput(input, dispatch) {
        super.handle(
            AlgorithmVersion.V2,
            input,
            dispatch,
            false,
            true,
            false,
        );
    }
}

export class AlgorithmHandler6 extends AlgorithmHandler {
    constructor() {
        super('V2 | Not Sorted');
    }
    handleInput(input, dispatch) {
        return super.handle(
            AlgorithmVersion.V2,
            input,
            dispatch,
            false,
            false,
            false,
        );
    }
}
