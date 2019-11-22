import {Block, Instruction, Program, ProgramType} from '../../model/DatabaseModels';
import * as ActionTypes from '../../GlobalActionTypes';
import Database from '../../database/RoboticsDatabase';
import {LOAD_POSSIBLE_CHILDREN} from '../../GlobalActionTypes';

const default_state_block = {
    lastUpdate: Date.now(),
    Active_Block: new Program('', ProgramType.BLOCKS, [], [new Block('', 1)]),
    possibleChildren: Database.findAll(),
    selectedBlockIndex: -1,
};
export const ActiveBlockReducer = (state = default_state_block, action) => {
    switch (action.type) {
        case ActionTypes.CLEAR_BLOCK:
            return Object.assign({}, state, {
                lastUpdate: Date.now(),
                selectedBlockIndex: -1,
                possibleChildren: Database.findAll(),
                Active_Block: new Program('', ProgramType.BLOCKS, [], [new Block(0, 0)]),
            });
        case ActionTypes.CHANGE_BLOCK_NAME:
            return Object.assign({}, state, {
                lastUpdate: Date.now(),
                Active_Block: Object.assign(new Program(), state.Active_Block, {name: action.name}),
            });
        case ActionTypes.CHANGE_REPS:
            let oldBlock = state.Active_Block.blocks[action.index];
            let newBlock = Object.assign(new Block(), oldBlock, {rep: action.reps});
            return Object.assign({}, state, {
                lastUpdate: Date.now(),
                selectedBlockIndex: action.index,
                Active_Block: Object.assign(new Program(), state.Active_Block, {
                    blocks: [
                        ...state.Active_Block.blocks.slice(0, action.index),
                        newBlock,
                        ...state.Active_Block.blocks.slice(action.index + 1),
                    ],
                }),
            });
        case ActionTypes.CHANGE_BLOCK_SELECTED_ID:
            let oldIDBlock = state.Active_Block.blocks[action.index];
            let newIDBLock = Object.assign(new Block(), oldIDBlock, {ref: action.id});
            let activeMainProgram = Object.assign(new Program(), state.Active_Block, {
                blocks: [
                    ...state.Active_Block.blocks.slice(0, action.index),
                    newIDBLock,
                    ...state.Active_Block.blocks.slice(action.index + 1, state.Active_Block.blocks.length),
                ],
            });
            return Object.assign({}, state, {
                lastUpdate: Date.now(),
                Active_Block: activeMainProgram,
                selectedBlockIndex: action.index,
                possibleChildren: Database.findAllWhichCanBeAddedTo(activeMainProgram),
            });

        case ActionTypes.SET_ACTIVE_BLOCK:
            return Object.assign({}, state, {
                lastUpdate: Date.now(),
                selectedBlockIndex: action.index,
                // dirty hack to force update
                Active_Block: Object.assign(new Program(), state.Active_Block, {blocks: [...state.Active_Block.blocks]}),
            });


        case ActionTypes.ADD_NEW_BLOCK:
            let index = state.Active_Block.blocks.length;
            if (state.selectedBlockIndex !== -1) {
                index = state.selectedBlockIndex;
            }
            console.log(index);
            return Object.assign({}, state, {
                lastUpdate: Date.now(),
                Active_Block: Object.assign(new Program(), state.Active_Block, {
                    blocks: [
                        ...state.Active_Block.blocks.slice(0, index),
                        new Block('', 0),
                        ...state.Active_Block.blocks.slice(index, state.Active_Block.blocks.length),
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
                    Active_Block: Object.assign(new Program(),
                        state.Active_Block, {
                            blocks: [
                                ...state.Active_Block.blocks.slice(0, state.selectedBlockIndex - 1),
                                state.Active_Block.blocks[state.selectedBlockIndex],
                                state.Active_Block.blocks[state.selectedBlockIndex - 1],
                                ...state.Active_Block.blocks.slice(state.selectedBlockIndex + 1, state.Active_Block.blocks.length),
                            ],
                        }),

                });
            } else {
                if (state.selectedBlockIndex >= state.Active_Block.blocks.length - 1) {
                    return state;
                }
                return Object.assign({}, state, {
                    lastUpdate: Date.now(),
                    selectedBlockIndex: state.selectedBlockIndex + 1,
                    Active_Block: Object.assign(new Program(),
                        state.Active_Block, {
                            blocks: [
                                ...state.Active_Block.blocks.slice(0, state.selectedBlockIndex),
                                state.Active_Block.blocks[state.selectedBlockIndex + 1],
                                state.Active_Block.blocks[state.selectedBlockIndex],
                                ...state.Active_Block.blocks.slice(state.selectedBlockIndex + 2, state.Active_Block.blocks.length),
                            ],
                        }),

                });
            }
        case ActionTypes.LOAD_BLOCK:
            let a = Database.findOne(action.name);
            let b = Database.findAllWhichCanBeAddedTo(a);
            return Object.assign({}, state, {
                Active_Block: a,
                possibleChildren: b,
            });
        case ActionTypes.LOAD_POSSIBLE_CHILDREN:
            let z = Database.findAllWhichCanBeAddedTo(state.Active_Block);
            return Object.assign({}, state, {
                // Dirty hack to force update
                Active_Block: Object.assign(new Program(), state.Active_Block, {blocks: [...state.Active_Block.blocks]}),
                possibleChildren: z,
            });
        default:
            return state;
    }

};
