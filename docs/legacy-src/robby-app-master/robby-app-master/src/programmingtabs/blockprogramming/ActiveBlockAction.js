import {
    ADD_NEW_BLOCK,
    CHANGE_BLOCK_INDEX,
    CHANGE_BLOCK_NAME,
    CLEAR_BLOCK,
    DELETE_BLOCK_INDEX,
    SET_ACTIVE_BLOCK,
    CHANGE_REPS,
    LOAD_BLOCK,
    CHANGE_BLOCK_SELECTED_ID, LOAD_POSSIBLE_CHILDREN, FORCE_RELOAD_BLOCK,
} from '../../GlobalActionTypes';

export const moveUpBlock = () => ({
    type: CHANGE_BLOCK_INDEX,
    move_down: false,
});
export const moveDownBlock = () => ({
    type: CHANGE_BLOCK_INDEX,
    move_down: true,

});
export const deleteBlock = () => ({
    type: DELETE_BLOCK_INDEX,
});

export const addBlock = () => ({
    type: ADD_NEW_BLOCK,
});

export const setActiveBlockIndex = (index) => ({
    type: SET_ACTIVE_BLOCK,
    index,
});
export const changeReps = (reps, index) => ({
    type: CHANGE_REPS,
    reps,
    index,
});
export const clearBlock = () => ({
    type: CLEAR_BLOCK,
});
export const setBlockName = (name) => ({
    type: CHANGE_BLOCK_NAME,
    name,
});
export const loadBlock = (name) => ({
    type: LOAD_BLOCK,
    name,
});
export const changeSelectedID = (id, index) => ({
    type: CHANGE_BLOCK_SELECTED_ID,
    id,
    index,
});
export const loadChildren = () => ({
    type: LOAD_POSSIBLE_CHILDREN,
});

export const forceReloadBlocks = () => ({
    type: FORCE_RELOAD_BLOCK,
});
