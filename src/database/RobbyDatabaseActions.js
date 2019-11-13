import Realm from 'realm';
import {Block, Program} from '../model/DatabaseModels';
import {ProgramSchema, InstructionSchema, BlockSchema, SCHEMA_VERSION, migration} from './RobbyDatabaseSchema';
import uuidv4 from 'uuid/v4';

let repository = new Realm({
    path: 'robbyRealm.realm',
    schema: [ProgramSchema, InstructionSchema, BlockSchema],
    schemaVersion: SCHEMA_VERSION,
    migration: migration,
});


// Checks whether the given `program` has a direct reference to the program with the id `program_id`.
// This function is used to test whether the program `program_id` can be deleted.
function isUsed(program, program_id): boolean {
    return program.blocks.map(block => block.ref).includes(program_id);
}

// Checks whether the given `program` has an indirect reference to the program with the id `program_id`.
function isUsedRecursive(program, program_id): boolean {
    return program_id === program.id || isUsed(program, program_id) || program.blocks.reduce((acc, p) => acc || isUsedRecursive(RobbyDatabaseAction.findOneByPK(Block.fromDatabase(p).ref), program_id), false);
}

function nameIsUnused(name) {
    return (RobbyDatabaseAction.findOne(name) === undefined);
}

let RobbyDatabaseAction = {
    add: function (program): String {
        if (nameIsUnused(program.name)) {
            try {
                repository.write(() => {
                    repository.create('Program', program);
                });
                return 'Saved to Database';
            } catch (e) {
                return 'Error while saving: ' + e;
            }
        }
        return 'Name is already taken';
    },
    // returns all programs which can be added to the given program `program` without building a cycle
    findAllWhichCanBeAddedTo: function (program): Program[] {
        // console.log(program);
        return repository.objects('Program').map(elem => Program.fromDatabase(elem)).filter(p => !isUsedRecursive(p, program.id));
    },
    findAll: function (): Program[] {
        return repository.objects('Program').map(elem => Program.fromDatabase(elem));
    },
    findOne: function (name): Program {
        return Program.fromDatabase(repository.objects('Program').filtered('name = $0 LIMIT(1)', name)['0']);
    },
    findOneByPK: function (pk): Program {
        return Program.fromDatabase(repository.objectForPrimaryKey('Program', pk));
    },
    duplicate: function (program, newName = '') {
        const cloneProgram = JSON.parse(JSON.stringify(program));
        let i = 1;
        try {
            if (newName === '') {
                newName = cloneProgram.name;
            }
            cloneProgram.name = newName;
            cloneProgram.id = uuidv4();
            while (!nameIsUnused(cloneProgram.name)) {
                cloneProgram.name = newName + '(' + i + ')';
                i++;
            }
            return RobbyDatabaseAction.add(cloneProgram);
        } catch (e) {
            return e;
        }
    },
    save: function (program): string {
        var res = this.findOneByPK(program.id);
        if(res){
            try {
            repository.write(() => {
                repository.create('Program', program, true);
            });
            return 'Saved to Database';
        } catch (e) {
            alert(e); // TODO: remove?
            return 'Error while saving: ' + e;
        }
        }else{
            if (nameIsUnused(program.name)) {
                try {
                    repository.write(() => {
                        repository.create('Program', program);
                    });
                    return 'Saved to Database';
                } catch (e) {
                    return 'Error while saving: ' + e;
                }
            }
            return 'Name is already taken';
        }
        

    },
    canBeDeleted : function (program_id): Boolean {
        return false;
    },
    delete: function (program_id): String {
        if (!RobbyDatabaseAction.findAll().reduce((acc, p) => acc || isUsed(p, program_id), false)) {
            try {
                repository.write(() => {
                    repository.delete(repository.objectForPrimaryKey('Program', program_id));
                });
                return 'Deleted Object: ' + program_id;
            } catch (e) {
                return e;
            }
        }
        return 'Program is used by other program';
    },
    deleteAll: function () {
        try {
            repository.write(() => {
                repository.delete(repository.objects('Program'));
            });
            return true;
        } catch (e) {
            return false;
        }
    },
};


module.exports = RobbyDatabaseAction;
