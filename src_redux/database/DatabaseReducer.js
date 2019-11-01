import db from './RoboticsDatabase';
import *  as ActionTypes from '../GlobalActionTypes';
import {Instruction, Program, ProgramType} from '../model/DatabaseModels';


const default_state_Programs = {
    lastUpdate: Date.now(),
    Programs: db.findAll(),
};

export const ProgramsReducer = (state = default_state_Programs, action) => {
    switch (action.typeof) {
        case ActionTypes.ADD_PROGRAM:
            db.add(action.program);
            return {lastUpdate: Date.now(), Programs: db.findAll()};
        case ActionTypes.SAVE_PROGRAM:
            db.save(action.program);
            return {lastUpdate: Date.now(), Programs: db.findAll()};
        case ActionTypes.DUPLICATE_PROGRAM:
            db.duplicate(action.program, action.newName);
            return {lastUpdate: Date.now(), Programs: db.findAll()};
        case ActionTypes.DELETE_ALL:
            db.deleteAll();
            return {lastUpdate: Date.now(), Programs: db.findAll()};
        case ActionTypes.DELETE_PROGRAM:
            db.delete(action.program_id);
            return {lastUpdate: Date.now(), Programs: db.findAll()};
        default:
            return state;
    }
};


const default_state_Active_Instruction = {lastUpdate: Date.now(), Program: new Program('', ProgramType.STEPS)};
export const ActiveInstructionsReducer = (state = default_state_Active_Instruction, action) => {
    switch (action.typeof) {
        case ActionTypes.ADD_NEW_INSTRUCTION:
            return Object.assign({}, state, {Program: Object.assign(new Program(), state.Program, {steps: [...b.Program.steps, new Instruction(0, 0)]})});
        case ActionTypes.CHANGE_INSTRUCTION_INDEX:
        case ActionTypes.CHANGE_INSTRUCTION_NAME:
        case ActionTypes.CLEAR_PROGRAM:
            return default_state_Active_Instruction;
        case ActionTypes.DELETE_INSTRUCITON_INDEX:


    }


};
