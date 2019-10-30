import Database from './RoboticsDatabase';
import {ADD_PROGRAM, SAVE_PROGRAM, DUPLICATE_PROGRAM, DELETE_ALL, DELETE_PROGRAM} from '../GlobalActionTypes';

export const ProgramsReducer = (state = {lastUpdate: Date.now(), Programs: Database.findAll()}, action) => {
    switch (action.typeof) {
        case ADD_PROGRAM:
            // {type: 'ADD_ITEM, Programm}
            Database.add(action.program);
            return {lastUpdate: Date.now(), Programs: Database.findAll()};
        case SAVE_PROGRAM:
            // do something
            Database.save(action.program);
            return {lastUpdate: Date.now(), Programs: Database.findAll()};
        case DUPLICATE_PROGRAM:
            Database.duplicate(action.program, action.newName);
            return {lastUpdate: Date.now(), Programs: Database.findAll()};
        case DELETE_ALL:
            Database.deleteAll();
            return {lastUpdate: Date.now(), Programs: Database.findAll()};
        case DELETE_PROGRAM:
            Database.delete(action.program_id);
            return {lastUpdate: Date.now(), Programs: Database.findAll()};
        default:
            return state;
    }
};

export const ActiveProgramReducer = (state = {lastUpdate: Date.now(), Program: {}, PossibleProgram: []}, action) => {

};
