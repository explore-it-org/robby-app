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

    length() {
        switch (this.programType === ProgramType.STEPS) {
            case false:
                return this.steps.length;
            case true:
                return this.blocks.reduce((acc, b) => acc + b.rep * Database.findOneByPK(b.ref).length(), 0);
        }
    }

    delete(){
        return Database.delete(this.id);
    }

    duplicate(){
        return Database.duplicate(this);
    }

    flatten(rep = 1){
        var result = [];
        if(this.programType === ProgramType.BLOCKS){
            this.blocks.forEach((block) => { 
                var prg = Database.findOneByPK(block.ref);
               
                if(rep){
                    for(var i = 0; i < rep; i++){
                        result.push(...prg.flatten(block.rep));
                    }
                }
            });
        }else{        
            for(i = 0; i < rep; i++){
                result.push(...this.steps);
            }
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

export const ProgramType = {
    STEPS: 0,
    BLOCKS: 1,
};
