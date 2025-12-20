import Realm from 'realm';
import {Block, Program} from '../model/DatabaseModels';
import {ProgramSchema, InstructionSchema, BlockSchema, SCHEMA_VERSION, migration} from './RoboticsSchema';
import uuidv4 from 'uuid/v4';
import i18n from '../../resources/locales/i18n';


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
            return {operation: operation, status: "failure", error: i18n.t('RoboticsDatabase.emptyNameMessage')};
        }
        if ((update && noNameChange) || this.nameIsUnused(program.name)) {

            try {
                this.repository.write(() => {
                    this.repository.create('Program', program, update);
                });
                return {operation: operation, status: "success", error: '', message: i18n.t('RoboticsDatabase.saveSuccessMessage')};
            } catch (e) {
                return {operation: operation, status: "failure", error: i18n.t('RoboticsDatabase.addFailedMessage')};
            }
        }
        return {operation: operation, status: "failure", error: i18n.t('RoboticsDatabase.nameTakenMessage')};
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
            let res = this.add(cloneProgram, 'duplicate');
            if(res.error){
                return res;
            } else {
                return {operation: 'duplicate', status: "success", message: i18n.t('RoboticsDatabase.duplicateSuccessMessage')};
            }
        } catch (e) {
            return {operation: 'duplicate', status: "failure", error: i18n.t('RoboticsDatabase.duplicateFailedMessage')};
        }
    }

    save(program): boolean {

        let old = this.findOneByPK(program.id);
        if (old === undefined) {
            return this.add(program);
        } else {
            return this.add(program, 'save', true, old.name === program.name);
        }
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
                return {operation: 'delete', status: "success", error: '', message: i18n.t('RoboticsDatabase.deleteSuccessMessage')};
            } catch (e) {
                return {operation: 'delete', status: "failure", error: i18n.t('RoboticsDatabase.deleteFailedMessage')};
            }
        }
        return {operation: 'delete', status: "failure", error: i18n.t('RoboticsDatabase.programUsedMessage')};

    }

    // Checks whether the given `program` has a direct reference to the program with the id `program_id`.
    // This function is used to test whether the program `program_id` can be deleted.
    isUsed(program, program_id): boolean {
        return program.blocks.map(block => block.ref).includes(program_id);
    }

    // Checks whether the given `program` has an indirect reference to the program with the id `program_id`.
    // TODO reduce to list of programs which us certain programs
    isUsedRecursive(program, program_id): boolean {
        return program_id === program.id || this.isUsed(program, program_id) || program.blocks.reduce((acc, p) => acc || this.isUsedRecursive(this.findOneByPK(Block.fromDatabase(p).ref), program_id), false);
    }

    nameIsUnused(name) {
        return (this.findOne(name) === undefined);
    }


}

let Database = new RoboticsDatabase();
export default Database;

