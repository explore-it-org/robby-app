import {
    DELETE_INSTRUCITON_INDEX,
    CHANGE_INSTRUCTION_NAME,
    ADD_NEW_INSTRUCTION,
    CHANGE_INSTRUCTION_INDEX,
    SET_ACTIVE_INDEX,
    CHANGE_LEFT_SPEED,
    CHANGE_RIGHT_SPEED, SET_PROGRAM_NAME,
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
export const changeRightSpeed = (speed) => ({
    type: CHANGE_RIGHT_SPEED,
    speed,
});
export const changeLeftSpeed = (speed) => ({
    type: CHANGE_LEFT_SPEED,
    speed,
});
export const setName = (name) => ({
    type: SET_PROGRAM_NAME,
    name,
});


