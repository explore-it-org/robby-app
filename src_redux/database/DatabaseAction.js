import {ADD_PROGRAM, SAVE_PROGRAM, DUPLICATE_PROGRAM, DELETE_PROGRAM, DELETE_ALL} from '../GlobalActionTypes';

export const add = (program) => ({
    type: ADD_PROGRAM,
    program: program,
});
export const save = (program) => ({
    type: SAVE_PROGRAM,
    program: program,
});
export const duplicate = (program, newName = '') => ({
    type: DUPLICATE_PROGRAM,
    program: program,
    newName: newName,
});
export const remove = (program_id) => ({
    type: DELETE_PROGRAM,
    program_id: program_id,
});
export const delete_all = () => ({
    type: DELETE_ALL,
});




