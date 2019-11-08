import {Instruction, Program, ProgramType} from '../../model/DatabaseModels';
import * as ActionTypes from '../../GlobalActionTypes';
import Database from '../../database/RoboticsDatabase';

const default_state_Active_Instruction = {
    lastUpdate: Date.now(),
    ActiveProgram: new Program('', ProgramType.STEPS),
    possibleChildren: [],
    selectedIndex: -1,
};
export const ActiveInstructionsReducer = (state = default_state_Active_Instruction, action) => {

    switch (action.type) {
        case ActionTypes.ADD_NEW_INSTRUCTION:
            let index = state.ActiveProgram.steps.length;
            if (state.selectedIndex !== -1) {
                index = state.selectedIndex;
            }
            return Object.assign({}, state, {
                lastUpdate: Date.now(),
                ActiveProgram: Object.assign(new Program(), state.ActiveProgram,
                    {
                        steps: [...state.ActiveProgram.steps.slice(0, index),
                            new Instruction(0, 0),
                            ...state.ActiveProgram.steps.slice(index, state.ActiveProgram.steps.length),
                        ],
                    }),
            });
        case ActionTypes.CHANGE_INSTRUCTION_INDEX:

            console.log(state.selectedIndex);
            console.log(state.ActiveProgram.steps);

            console.log(state.ActiveProgram.steps[state.selectedIndex]);
            if (!action.move_down) {
                if (state.selectedIndex === 0) {
                    return state;
                }
                console.log('moving down');
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
                console.log('moving up');
                if (state.selectedIndex >= state.ActiveProgram.steps.length - 1) {
                    return state;
                }

                let a = [...state.ActiveProgram.steps.slice(0, state.selectedIndex),
                    state.ActiveProgram.steps[state.selectedIndex + 1],
                    state.ActiveProgram.steps[state.selectedIndex],
                    ...state.ActiveProgram.steps.slice(state.selectedIndex + 2, state.ActiveProgram.steps.length)];
                console.log(a);
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
        case ActionTypes.CLEAR_PROGRAM:
            return default_state_Active_Instruction;
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
            console.log('i am called with index: ' + action.index);
            return Object.assign({}, state, {selectedIndex: action.index});
        case ActionTypes.CHANGE_LEFT_SPEED:
            let oldInstruction = state.ActiveProgram.steps[state.selectedIndex];
            let newInstruction = new Instruction(oldInstruction.right, action.speed);
            return Object.assign({}, state, {
                lastUpdate: Date.now(),
                ActiveProgram: Object.assign(new Program(), state.ActiveProgram,
                    {
                        steps: [...state.ActiveProgram.steps.slice(0, state.selectedIndex),
                            newInstruction,
                            ...state.ActiveProgram.steps.slice(state.selectedIndex + 1, state.ActiveProgram.steps.length),
                        ],
                    }),
            });
        case ActionTypes.CHANGE_RIGHT_SPEED:
            let os = state.ActiveProgram.steps[state.selectedIndex];
            console.log(os + ' ' + state.selectedIndex);
            let ns = new Instruction(action.speed, os.left);
            return Object.assign({}, state, {
                lastUpdate: Date.now(),
                ActiveProgram: Object.assign(new Program(), state.ActiveProgram,
                    {
                        steps: [...state.ActiveProgram.steps.slice(0, state.selectedIndex),
                            ns,
                            ...state.ActiveProgram.steps.slice(state.selectedIndex + 1, state.ActiveProgram.steps.length),
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
            });
        default:
            return state;


    }

//{device: {...state.device, version: action.version}});
};
