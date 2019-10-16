import uuidv4 from 'uuid/v4';
import {RobbyDatabaseAction} from '../database/RobbyDatabaseActions';

export class Program {
    constructor(name, primitive, steps = [], blocks = [], id = uuidv4(), date = new Date(Date.now())) {

        this.id = id;
        this.name = name;
        this.primitive = primitive;
        this.date = date;
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

    length(mulitplier = 1) {
        switch (this.primitive) {
            case false:
                return this.steps.length * mulitplier;
            case true:
                return this.blocks.reduce((acc, b) => acc + RobbyDatabaseAction.findOneByPK(b.ref).length(b.rep), 0);
        }
    }

    static fromDatabase(program) {
        if (program === undefined) {
            return undefined;
        }
        return new Program(program.name, program.primitive, program.steps, program.blocks, program.id, program.date);
    }
}

export class Instruction {
    constructor(right, left) {
        this.right = right;
        this.left = left;
    }

    static fromDatabase(instruction) {
        return new Instruction(instruction.right, instruction.left);
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

