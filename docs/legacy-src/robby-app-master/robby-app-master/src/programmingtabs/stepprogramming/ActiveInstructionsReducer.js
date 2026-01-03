import {Instruction, Program, ProgramType} from '../../model/DatabaseModels';
import * as ActionTypes from '../../GlobalActionTypes';
import Database from '../../database/RoboticsDatabase';

const default_state_Active_Instruction = {
    lastUpdate: Date.now(),
    ActiveProgram: new Program('', ProgramType.STEPS, [new Instruction(0, 0)]),
    possibleChildren: [],
    selectedIndex: -1,
};
export const ActiveInstructionsReducer = (state = default_state_Active_Instruction, action) => {

    switch (action.type) {
        case ActionTypes.ADD_NEW_INSTRUCTION:
            let index = state.ActiveProgram.steps.length - 1;
            if (state.selectedIndex !== -1) {
                index = state.selectedIndex;
            }
            return Object.assign({}, state, {
                lastUpdate: Date.now(),
                ActiveProgram: Object.assign(new Program(), state.ActiveProgram,
                    {
                        steps: [...state.ActiveProgram.steps.slice(0, index + 1),
                            new Instruction(0, 0),
                            ...state.ActiveProgram.steps.slice(index + 1, state.ActiveProgram.steps.length),
                        ],
                    }),
            });
        case ActionTypes.CHANGE_INSTRUCTION_INDEX:
            if (!action.move_down) {
                if (state.selectedIndex === 0) {
                    return state;
                }
                return Object.assign({}, state, {

                    lastUpdate: Date.now(),
                    ActiveProgram: Object.assign(new Program(), state.ActiveProgram,
                        {
                            steps: [...state.ActiveProgram.steps.slice(0, state.selectedIndex - 1),
                                state.ActiveProgram.steps[state.selectedIndex],
                                state.ActiveProgram.steps[state.selectedIndex - 1],
                                ...state.ActiveProgram.steps.slice(state.selectedIndex + 1, state.ActiveProgram.steps.length)],
                        }),
                    selectedIndex: state.selectedIndex - 1,
                });
            } else {
                if (state.selectedIndex >= state.ActiveProgram.steps.length - 1) {
                    return state;
                }

                let a = [...state.ActiveProgram.steps.slice(0, state.selectedIndex),
                    state.ActiveProgram.steps[state.selectedIndex + 1],
                    state.ActiveProgram.steps[state.selectedIndex],
                    ...state.ActiveProgram.steps.slice(state.selectedIndex + 2, state.ActiveProgram.steps.length)];
                return Object.assign({}, state, {

                    lastUpdate: Date.now(),
                    ActiveProgram: Object.assign(new Program(), state.ActiveProgram,
                        {
                            steps: [...state.ActiveProgram.steps.slice(0, state.selectedIndex),
                                state.ActiveProgram.steps[state.selectedIndex + 1],
                                state.ActiveProgram.steps[state.selectedIndex],
                                ...state.ActiveProgram.steps.slice(state.selectedIndex + 2, state.ActiveProgram.steps.length)],
                        }),
                    selectedIndex: state.selectedIndex + 1,
                });
            }
        case ActionTypes.CHANGE_INSTRUCTION_NAME:
            return state;

        case ActionTypes.DELETE_INSTRUCITON_INDEX:
            return Object.assign({}, state, {
                lastUpdate: Date.now(),
                selectedIndex: -1,
                ActiveProgram: Object.assign(new Program(), state.ActiveProgram,
                    {
                        steps: [...state.ActiveProgram.steps.slice(0, state.selectedIndex),
                            ...state.ActiveProgram.steps.slice(state.selectedIndex + 1, state.ActiveProgram.steps.length),
                        ],
                    }),
            });
        case ActionTypes.SET_ACTIVE_INDEX:
            if (action.index === state.selectedIndex) {
                action.index = -1;
            }
            return Object.assign({}, state, {
                selectedIndex: action.index,
                // dirty hack to force update
                ActiveProgram: Object.assign(new Program(), state.ActiveProgram, {steps: [...state.ActiveProgram.steps]}),
            });
        case ActionTypes.CHANGE_LEFT_SPEED:
            let oldInstruction = state.ActiveProgram.steps[action.index];
            let newInstruction = new Instruction(action.speed, oldInstruction.right);
            return Object.assign({}, state, {
                lastUpdate: Date.now(),
                ActiveProgram: Object.assign(new Program(), state.ActiveProgram,
                    {
                        steps: [...state.ActiveProgram.steps.slice(0, action.index),
                            newInstruction,
                            ...state.ActiveProgram.steps.slice(action.index + 1, state.ActiveProgram.steps.length),
                        ],
                    }),
            });
        case ActionTypes.CHANGE_RIGHT_SPEED:
            let os = state.ActiveProgram.steps[action.index];
            let ns = new Instruction(os.left, action.speed);
            return Object.assign({}, state, {
                lastUpdate: Date.now(),
                ActiveProgram: Object.assign(new Program(), state.ActiveProgram,
                    {
                        steps: [...state.ActiveProgram.steps.slice(0, action.index),
                            ns,
                            ...state.ActiveProgram.steps.slice(action.index + 1, state.ActiveProgram.steps.length),
                        ],
                    }),
            });
        case ActionTypes.SET_PROGRAM_NAME:
            return Object.assign({}, state, {
                lastUpdate: Date.now(),
                ActiveProgram: Object.assign(new Program(), state.ActiveProgram, {name: action.name}),
            });
        case ActionTypes.LOAD_INSTRUCTION:
            let a = Database.findOne(action.name);
            return Object.assign({}, state, {
                ActiveProgram: a,
                selectedIndex: -1,
            });
        case ActionTypes.RECEIVED_DOWNLOAD:
            return Object.assign({}, state, {
                ActiveProgram: action.program,
            });
        case ActionTypes.CLEAR_PROGRAM:
            return Object.assign({}, state, {
                lastUpdate: Date.now(),
                ActiveProgram: new Program('', ProgramType.STEPS, [new Instruction(0, 0)]),
                selectedIndex: -1,
            });
        case ActionTypes.EMPTY_INSTRUCTION_LIST:
            return Object.assign({}, state, {
                lastUpdate: Date.now(),
                ActiveProgram: new Program('', ProgramType.STEPS, []),
                selectedIndex: -1,
            });
        default:
            return state;


    }

//{device: {...state.device, version: action.version}});
};
