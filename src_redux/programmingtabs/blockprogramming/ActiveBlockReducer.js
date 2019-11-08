import {Block, Instruction, Program, ProgramType} from '../../model/DatabaseModels';
import * as ActionTypes from '../../GlobalActionTypes';

const default_state_block = {
    lastUpdate: Date.now(),
    Active_Block: new Program('', ProgramType.BLOCKS),
    possibleChildren: [],
    selectedBlockIndex: -1,
};
export const ActiveBlockReducer = (state = default_state_block, action) => {
    switch (action.type) {
        case ActionTypes.CLEAR_BLOCK:
            return Object.assign({}, state, {
                lastUpdate: Date.now(),
                selectedBlockIndex: -1,
                Active_Block: new Program('', ProgramType.BLOCKS),
            });
        case ActionTypes.CHANGE_BLOCK_NAME:
            return Object.assign({}, state, {
                lastUpdate: Date.now(),
                Active_Block: Object.assign(new Program(), state.Active_Block, {name: action.name}),
            });
        case ActionTypes.CHANGE_REPS:
            let oldBlock = state.Active_Block.blocks[state.selectedBlockIndex];
            let newBlock = Object.assign(new Block(), oldBlock, {rep: action.reps});
            return Object.assign({}, state, {
                lastUpdate: Date.now(),
                Active_Block: Object.assign(new Program(), state.Active_Block, {
                    blocks: [
                        ...state.Active_Block.blocks.slice(0, state.selectedBlockIndex),
                        newBlock,
                        ...state.Active_Block.blocks.slice(state.selectedBlockIndex + 1),
                    ],
                }),
            });
        case ActionTypes.SET_ACTIVE_BLOCK:
            return Object.assign({}, state, {selectedBlockIndex: action.index});
        case ActionTypes.ADD_NEW_BLOCK:
            return Object.assign({}, state, {
                lastUpdate: Date.now(),
                Active_Block: Object.assign(new Program(), state.Active_Block, {
                    blocks: [
                        ...state.Active_Block.blocks.slice(0, state.selectedBlockIndex),
                        new Block('', 0),
                        ...state.Active_Block.blocks.slice(state.selectedBlockIndex, state.Active_Block.blocks.length),
                    ],
                }),
            });
        case ActionTypes.DELETE_BLOCK_INDEX:
            return Object.assign({}, state, {
                Active_Block: Object.assign(new Program(), state.Active_Block, {
                    lastUpdate: Date.now(),
                    selectedBlockIndex: -1,
                    blocks: [
                        ...state.Active_Block.blocks.slice(0, state.selectedBlockIndex),
                        ...state.Active_Block.blocks.slice(state.selectedBlockIndex + 1, state.Active_Block.blocks.length),
                    ],
                }),
            });
        case ActionTypes.CHANGE_BLOCK_INDEX:
            if (!action.move_down) {
                if (state.selectedBlockIndex === 0) {
                    return state;
                }
                return Object.assign({}, state, {
                    lastUpdate: Date.now(),
                    selectedBlockIndex: state.selectedBlockIndex - 1,
                    Active_Block: Object.assign(new Program(), state.Active_Block, {
                        blocks: [
                            ...state.Active_Block.blocks.slice(0, state.selectedBlockIndex - 1),
                            state.Active_Block.blocks[state.selectedBlockIndex],
                            state.Active_Block.blocks[state.selectedBlockIndex - 1],
                            ...state.Active_Block.blocks.slice(state.selectedIndex + 1, state.Active_Block.blocks.length),
                        ],
                    }),

                });
            } else {
                if (state.selectedBlockIndex >= state.Active_Block.blocks.length - 1) {
                    return state;
                }
                return Object.assign({}, state, {
                    Active_Block: Object.assign(new Program(), state.Active_Block, {
                        blocks: [
                            ...state.Active_Block.blocks.slice(0, state.selectedBlockIndex),
                            state.Active_Block.blocks[state.selectedBlockIndex + 1],
                            state.Active_Block.blocks[state.selectedBlockIndex],
                            ...state.Active_Block.blocks.slice(state.selectedBlockIndex + 2, state.Active_Block.blocks.length),
                        ],
                    }),

                });
            }
        default:
            return state;


    }

};
