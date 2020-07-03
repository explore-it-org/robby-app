import uuidv4 from 'uuid/v4';
import Database from '../database/RoboticsDatabase';

export class Program {
    constructor(name, programType, steps = [], blocks = [], id = uuidv4(), date = new Date(Date.now())) {

        this.id = id;
        this.name = name;
        this.date = date;
        this.programType = programType;
        if (steps instanceof Array) {
            this.steps = steps;
        } else {
            let temp_step = [];
            Object.keys(steps).forEach(key => temp_step.push(Instruction.fromDatabase(steps[key])));
            this.steps = temp_step;
        }
        if (blocks instanceof Array) {
            this.blocks = blocks;
        } else {
            let temp_block = [];
            Object.keys(blocks).forEach(key => temp_block.push(Block.fromDatabase(blocks[key])));
            this.blocks = temp_block;
        }
    }

    static length(program) {
        switch (program.programType === ProgramType.STEPS) {
            case false:
                return program.steps.length;
            case true:
                return program.blocks.reduce((acc, b) => acc + b.rep * Program.length(Database.findOneByPK(b.ref)), 0);
        }
    }

    static delete(program) {
        return Database.delete(program.id);
    }

    static duplicate(program) {
        return Database.duplicate(program);
    }

    static flatten(program) {
        var result = [];
        if (program.programType === ProgramType.BLOCKS) {

            program.blocks.forEach((block) => {
                if (block.ref) {
                    var prg = Database.findOneByPK(block.ref);
                    let prgFlat = Program.flatten(prg);
                    for (let i = 0; i < block.rep; i++) {
                        result.push(...prgFlat);
                    }
                }
            });
        } else {
            result.push(...program.steps);
        }
        return result;
    }

    static flattenSimpleBlocks(program) {
        var result = [];
        if (program.programType === ProgramType.BLOCKS) {
            program.blocks.forEach((block) => {
                if (block.ref) {
                    var prg = Database.findOneByPK(block.ref);
                    let prgFlat = Program.flattenSimpleBlocks(prg);
                    result.push(...prgFlat);
                }
            });
        } else {
            result.push(new Block(program.id, 1));
        }
        return result;
    }

    static fromDatabase(program) {
        if (program === undefined) {
            return undefined;
        }
        return new Program(program.name, program.programType, program.steps, program.blocks, program.id, program.date);
    }
}

export class Instruction {
    constructor(left, right) {
        this.right = right;
        this.left = left;
    }

    static fromDatabase(instruction) {
        return new Instruction(instruction.left, instruction.right);
    }
}

export class Block {
    constructor(ref, rep) {
        this.ref = ref;
        this.rep = rep;
    }

    static fromDatabase(block) {
        return new Block(block.ref, block.rep);
    }
}

export const ProgramType = {
    STEPS: 0,
    BLOCKS: 1,
};
