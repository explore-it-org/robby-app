import Realm from 'realm';

// Update Schmea_Version when you do any changes to the schema
const SCHEMA_VERSION = 13;


class InstructionSchema extends Realm.Object {
}

InstructionSchema = {
    name: 'Instruction',
    properties: {
        left: 'int',
        right: 'int',
    },
};

class BlockSchema extends Realm.Object {
}

BlockSchema = {
    name: 'Block',
    properties: {
        ref: 'string', // reference to a program
        rep: {type: 'int', default: 1},
    },
};

class ProgramSchema extends Realm.Object {
}

ProgramSchema = {
    name: 'Program',
    primaryKey: 'id',
    properties: {
        id: 'string',
        name: {type: 'string', indexed: true},
        programType: 'int',              // true => NumberSequence, false => BlockSequence
        date: 'date',			// Creation-Date
        steps: 'Instruction[]',  	//  either steps or blocks is empty.
        blocks: 'Block[]',
    },
};


const migration = (oldRealm, newRealm) => {
    if (oldRealm.schemaVersion < SCHEMA_VERSION) {
        const oldObjects = oldRealm.objects('Program');
        const newObjects = newRealm.objects('Program');
        for (let i = 0; i < oldObjects.length; i++) {
            newObjects[i].name = oldObjects[i].name;
            newObjects[i].elements = [];
            newObjects[i].programs = [];
        }
    }
};

module.exports = {
    ProgramSchema: ProgramSchema,
    BlockSchema: BlockSchema,
    InstructionSchema: InstructionSchema,
    SCHEMA_VERSION,
    migration,
};
