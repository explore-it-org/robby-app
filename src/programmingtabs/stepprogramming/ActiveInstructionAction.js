import {
    DELETE_INSTRUCITON_INDEX,
    CHANGE_INSTRUCTION_NAME,
    ADD_NEW_INSTRUCTION,
    CHANGE_INSTRUCTION_INDEX,
    SET_ACTIVE_INDEX,
    CHANGE_LEFT_SPEED,
    CHANGE_RIGHT_SPEED,
    SET_PROGRAM_NAME,
    LOAD_INSTRUCTION,
    RECEIVED_DOWNLOAD,
    CLEAR_PROGRAM, EMPTY_INSTRUCTION_LIST,
} from '../../GlobalActionTypes';

export const moveUp = () => ({
    type: CHANGE_INSTRUCTION_INDEX,
    move_down: false,
});
export const moveDown = () => ({
    type: CHANGE_INSTRUCTION_INDEX,
    move_down: true,

});
export const deleteInstruction = () => ({
    type: DELETE_INSTRUCITON_INDEX,
});
export const addInstruction = () => ({
    type: ADD_NEW_INSTRUCTION,
});
export const setActiveIndex = (index) => ({
    type: SET_ACTIVE_INDEX,
    index,
});
export const changeRightSpeed = (speed, index) => ({
    type: CHANGE_RIGHT_SPEED,
    speed,
    index,
});
export const changeLeftSpeed = (speed, index) => ({
    type: CHANGE_LEFT_SPEED,
    speed,
    index,
});
export const setName = (name) => ({
    type: SET_PROGRAM_NAME,
    name,
});

export const loadInstruction = (name) => ({
    type: LOAD_INSTRUCTION,
    name,
});

export const clearProgram = () => ({
    type: CLEAR_PROGRAM,
});
export const receiveDownload = (program) => ({
    type: RECEIVED_DOWNLOAD,
    program,
});

export const emptyInstructionList = () => ({
    type: EMPTY_INSTRUCTION_LIST,
})
