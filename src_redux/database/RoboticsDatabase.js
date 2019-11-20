import Realm from 'realm';
import {Block, Program} from '../model/DatabaseModels';
import {ProgramSchema, InstructionSchema, BlockSchema, SCHEMA_VERSION, migration} from './RoboticsSchema';
import uuidv4 from 'uuid/v4';


class RoboticsDatabase {
    constructor() {
        this.repository = new Realm({
            path: 'robbyRealm.realm',
            schema: [ProgramSchema, InstructionSchema, BlockSchema],
            schemaVersion: SCHEMA_VERSION,
            migration: migration,
        });

    }

    add(program, operation = 'add', update = false, noNameChange = true): String {
        if (program.name === '') {
            return {operation: operation, status: 'failure', error: 'No empty name'};
        }
        if ((update && noNameChange) || this.nameIsUnused(program.name)) {

            try {
                this.repository.write(() => {
                    this.repository.create('Program', program, update);
                });
                return {operation: operation, status: 'success', error: ''};
            } catch (e) {
                return {operation: operation, status: 'failure', error: e.message};
            }
        }
        return {operation: operation, status: 'failure', error: 'Name is already taken'};
    }

    findAllWhichCanBeAddedTo(program): Program[] {
        return this.repository.objects('Program').map(elem => Program.fromDatabase(elem)).filter(p => !this.isUsedRecursive(p, program.id));
    }

    findAll(): Program[] {
        return this.repository.objects('Program').map(elem => Program.fromDatabase(elem)).sort((a, b) => a.name.toUpperCase() < b.name.toUpperCase() ? -1 : 1);
    }

    findOne(name): Program {
        return Program.fromDatabase(this.repository.objects('Program').filtered('name = $0 LIMIT(1)', name)['0']);
    }

    findOneByPK(pk): Program {
        return Program.fromDatabase(this.repository.objectForPrimaryKey('Program', pk));
    }

    duplicate(program, newName = '') {
        const cloneProgram = JSON.parse(JSON.stringify(program));
        let i = 1;
        try {
            if (newName === '') {
                newName = cloneProgram.name;
            }
            cloneProgram.name = newName;
            cloneProgram.id = uuidv4();
            while (!this.nameIsUnused(cloneProgram.name)) {
                cloneProgram.name = newName + '(' + i + ')';
                i++;
            }
            return this.add(cloneProgram, 'duplicate');
        } catch (e) {
            return {operation: 'duplicate', status: 'failure', error: e};
        }
    }

    save(program): boolean {

        let old = this.findOneByPK(program.id);
        if (old === undefined) {
            return this.add(program);
        } else {
            return this.add(program, 'save', true, old.name === program.name);
        }

        /*
                try {
                    this.repository.write(() => {
                        this.repository.create('Program', program, true);
                    });
                    return {operation: 'save', status: 'success', error: ''};
                } catch (e) {
                    return {operation: 'save', status: 'failure', error: e};
                }
        */
    }

    canBeDeleted(program_id): Boolean {
        return false;
    }

    delete(program_id): String {
        if (!this.findAll().reduce((acc, p) => acc || this.isUsed(p, program_id), false)) {
            try {
                this.repository.write(() => {
                    this.repository.delete(this.repository.objectForPrimaryKey('Program', program_id));
                });
                return {operation: 'delete', status: 'success', error: ''};
            } catch (e) {
                return {operation: 'delete', status: 'failure', error: e};
            }
        }
        return {operation: 'delete', status: 'failure', error: 'Program is used by other program'};

    }

    deleteAll() {
        try {
            this.repository.write(() => {
                this.repository.delete(this.repository.objects('Program'));
            });
            return {operation: 'deleteAll', status: 'success', error: ''};
        } catch (e) {
            return {operation: 'deleteAll', status: 'failure', error: e};
        }
    }

    // Checks whether the given `program` has a direct reference to the program with the id `program_id`.
    // This function is used to test whether the program `program_id` can be deleted.
    isUsed(program, program_id): boolean {
        return program.blocks.map(block => block.ref).includes(program_id);
    }

    // Checks whether the given `program` has an indirect reference to the program with the id `program_id`.
    isUsedRecursive(program, program_id): boolean {
        return program_id === program.id || this.isUsed(program, program_id) || program.blocks.reduce((acc, p) => acc || this.isUsedRecursive(this.findOneByPK(Block.fromDatabase(p).ref), program_id), false);
    }

    nameIsUnused(name) {
        return (this.findOne(name) === undefined);
    }


}

let Database = new RoboticsDatabase();
export default Database;
