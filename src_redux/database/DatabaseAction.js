import {ADD_PROGRAM, SAVE_PROGRAM, DUPLICATE_PROGRAM, DELETE_PROGRAM, DELETE_ALL} from '../GlobalActionTypes';

export const add = (program) => ({
    type: ADD_PROGRAM,
    program: program,
}), save = (program) => ({
    type: SAVE_PROGRAM,
    program: program,
}), duplicate = (program, newName = '') => ({
    type: DUPLICATE_PROGRAM,
    program: program,
    newName: newName,
}), deletee = (program_id) => ({
    type: DELETE_PROGRAM,
    program_id: program_id,
}), delete_all = () => ({
    type: DELETE_ALL,
});




