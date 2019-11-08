import * as DBAction from './DatabaseAction';
import {Block, Program, ProgramType, Instruction} from '../model/DatabaseModels';
import uuidv4 from 'uuid/v4';


export class DatabaseTest {

    basename = 'Modeddl';
    amount = 10;

    constructor(store) {
        this.store = store;

    }

    clearDatabase() {
        DBAction.delete_all();
    }

    createDatabaseEntries() {
        console.log('creating entries');
        for (var i = 1; i <= this.amount; i++) {
            this.store.dispatch(DBAction.add(new Program(this.basename + i, ProgramType.STEPS)));
        }
    }

    /*
        creatingDatabaseEntriesWithDependencies() {
            console.log('creating entries');
            let amountOfExisitingEntries = RobbyDatabaseAction.findAll().length;
            let firstProgram = new Program('Model64', ProgramType.BLOCKS);
            RobbyDatabaseAction.add(firstProgram);
            let amount = 10;
            let i;
            for (i = 0; i < this.amount; i++) {
                var result = RobbyDatabaseAction.add(new Program(this.basename + i, ProgramType.BLOCKS, [], [new Block(firstProgram.id, 17)]));
            }
            let l = RobbyDatabaseAction.findAll().length;
            console.log('Database has this amount of entries: ' + l);
            let a = RobbyDatabaseAction.delete(firstProgram.id);
            console.log(a);
        }

        updatingEntries() {
            this.createDatabaseEntries();
            RobbyDatabaseAction.findAll().forEach(elem => {
                elem.name = elem.name + 'updated';
                elem.blocks.push(new Block(elem.id, 1));
                RobbyDatabaseAction.save(elem);
            });
            console.log(RobbyDatabaseAction.findAll());

        }

        findOne() {
            this.createDatabaseEntries();
            let a = RobbyDatabaseAction.findOne(this.basename + '1');
            console.log(a);
            // findOneconsole.log(a.length === 0);
        }

        duplicate() {
            let f = new Program(this.basename, ProgramType.BLOCKS, [], [new Block(uuidv4(), 3)]);
            RobbyDatabaseAction.add(f);
            let i;
            for (i = 0; i < this.amount; i++) {
                RobbyDatabaseAction.duplicate(f);
            }
            console.log(RobbyDatabaseAction.findAll());
        }

        recurive() {
            this.creatingDatabaseEntriesWithDependencies();
            let a = RobbyDatabaseAction.findOne(this.basename + 64);
            RobbyDatabaseAction.add(new Program('you can use me', ProgramType.STEPS, [new Instruction(50, 50), new Instruction(20, 90)]));
            console.log('Ready');
            console.log(a);
            console.log(RobbyDatabaseAction.findAllWhichCanBeAddedTo(a));
        }

        findOneByPK() {
            this.creatingDatabaseEntriesWithDependencies();
            let pk = RobbyDatabaseAction.findAll()[0].id;
            //console.log(pk);
            //console.log(RobbyDatabaseAction.findOneByPK(pk));
        }*/
}
