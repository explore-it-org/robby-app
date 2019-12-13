import Database from './RoboticsDatabase';
import *  as ActionTypes from '../GlobalActionTypes';


const default_state_Programs = {
    lastUpdate: Date.now(),
    Programs: Database.findAll(),
    lastChange: {
        status: 'success',
        operation: '',
        error: '',
    },

};

export const ProgramsReducer = (state = default_state_Programs, action) => {
    let change = {};
    switch (action.type) {
        case ActionTypes.ADD_PROGRAM:
            change = Database.add(action.program);
            return Object.assign({},
                state,
                {
                    lastUpdate: Date.now(),
                    Programs: Database.findAll(),
                    lastChange: change,
                });
        case ActionTypes.SAVE_PROGRAM:
            change = Database.save(action.program);
            return Object.assign({}, state,
                {
                    lastUpdate: Date.now(),
                    Programs: Database.findAll(),
                    lastChange: change,
                });
        case ActionTypes.DUPLICATE_PROGRAM:
            change = Database.duplicate(action.program, action.newName);
            return Object.assign({}, state,
                {
                    lastUpdate: Date.now(),
                    Programs: Database.findAll(),
                    lastChange: change,
                });
        case ActionTypes.DELETE_ALL:
            change = Database.deleteAll();
            return Object.assign({}, state,
                {
                    lastUpdate: Date.now(),
                    Programs: Database.findAll(),
                    lastChange: change,
                });
        case ActionTypes.DELETE_PROGRAM:
            change = Database.delete(action.program_id);
            return Object.assign({}, state,
                {
                    lastUpdate: Date.now(),
                    Programs: Database.findAll(),
                    lastChange: change,
                });
        default:
            return state;
    }
};



