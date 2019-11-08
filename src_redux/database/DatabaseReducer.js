import Database from './RoboticsDatabase';
import *  as ActionTypes from '../GlobalActionTypes';
import {Instruction, Program, ProgramType} from '../model/DatabaseModels';


const default_state_Programs = {
    lastUpdate: Date.now(),
    Programs: Database.findAll(),
    status: 'success',
    operation: '',
    errorMessage: '',
};

export const ProgramsReducer = (state = default_state_Programs, action) => {
    switch (action.type) {
        case ActionTypes.ADD_PROGRAM:
            let a = Database.add(action.program);
            return Object.assign({}, state, {lastUpdate: Date.now(), Programs: Database.findAll(), ...a});
        case ActionTypes.SAVE_PROGRAM:
            Database.save(action.program);
            return Object.assign({}, state, {lastUpdate: Date.now(), Programs: Database.findAll()});
        case ActionTypes.DUPLICATE_PROGRAM:
            Database.duplicate(action.program, action.newName);
            return Object.assign({}, state, {lastUpdate: Date.now(), Programs: Database.findAll()});
        case ActionTypes.DELETE_ALL:
            Database.deleteAll();
            return Object.assign({}, state, {lastUpdate: Date.now(), Programs: Database.findAll()});
        case ActionTypes.DELETE_PROGRAM:
            Database.delete(action.program_id);
            return Object.assign({}, state, {lastUpdate: Date.now(), Programs: Database.findAll()});
        default:
            return state;
    }
};



