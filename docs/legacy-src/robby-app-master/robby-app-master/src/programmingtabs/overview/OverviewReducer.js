import {Block, Program, ProgramType} from '../../model/DatabaseModels';
import * as ActionTypes from '../../GlobalActionTypes';
import Database from '../../database/RoboticsDatabase';

const default_state_overview = {
    lastUpdate: Date.now(),
    selectedProgramIndex: -1,
    selectedProgram: undefined,
};
export const OverviewReducer = (state = default_state_overview, action) => {
    switch (action.type) {
        case ActionTypes.SET_SELECTED_INDEX:
            if (action.index === state.selectedProgramIndex) {
                action.index = -1;
            }
            return Object.assign({}, state, {
                lastUpdate: Date.now(),
                selectedProgramIndex: action.index
            });
        case ActionTypes.SET_SELECTED_PROGRAM:
            if (action.index === state.selectedProgramIndex) {
                action.program = undefined;
            }
            return Object.assign({}, state, {
                lastUpdate: Date.now(),
                selectedProgram: action.program
            });
        default:
            return state;
    }

};