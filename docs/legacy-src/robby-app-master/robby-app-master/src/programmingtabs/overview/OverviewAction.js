import { SET_SELECTED_INDEX, SET_SELECTED_PROGRAM } from "../../GlobalActionTypes";

export const setSelectedProgramIndex = (index) => ({
    type: SET_SELECTED_INDEX,
    index,
});

export const setSelectedProgram = (program) => ({
    type: SET_SELECTED_PROGRAM,
    program,
});
