import db from './RoboticsDatabase';
import {ADD_PROGRAM, SAVE_PROGRAM, DUPLICATE_PROGRAM, DELETE_ALL, DELETE_PROGRAM} from '../GlobalActionTypes';

export const ProgramsReducer = (state = {lastUpdate: Date.now(), Programs: db.findAll()}, action) => {
    switch (action.typeof) {
        case ADD_PROGRAM:
            db.add(action.program);
            return {lastUpdate: Date.now(), Programs: db.findAll()};
        case SAVE_PROGRAM:
            db.save(action.program);
            return {lastUpdate: Date.now(), Programs: db.findAll()};
        case DUPLICATE_PROGRAM:
            db.duplicate(action.program, action.newName);
            return {lastUpdate: Date.now(), Programs: db.findAll()};
        case DELETE_ALL:
            db.deleteAll();
            return {lastUpdate: Date.now(), Programs: db.findAll()};
        case DELETE_PROGRAM:
            db.delete(action.program_id);
            return {lastUpdate: Date.now(), Programs: db.findAll()};
        default:
            return state;
    }
};

export const ActiveProgramReducer = (state = {lastUpdate: Date.now(), Program: {}, PossibleProgram: []}, action) => {

};
