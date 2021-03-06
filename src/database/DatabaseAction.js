import {ADD_PROGRAM, SAVE_PROGRAM, DUPLICATE_PROGRAM, DELETE_PROGRAM} from '../GlobalActionTypes';
import {loadChildren} from '../programmingtabs/blockprogramming/ActiveBlockAction';
import {Program} from '../model/DatabaseModels';
import Database from '../database/RoboticsDatabase';
import {Alert} from 'react-native';
import i18n from '../../resources/locales/i18n';

export const add = (program) => ({
    type: ADD_PROGRAM,
    program: program,
});
export const save = (program) => ({
    type: SAVE_PROGRAM,
    program: program,
});

export const saveProgram = (ActiveProgram) => {
    return (dispatch, getState) => {
        let program = null;
        if (ActiveProgram === 'Stepprogramming') {
            program = getState().ActiveProgram.ActiveProgram;
        } else {
            let a = getState().ActiveBlock.Active_Block;
            program = Object.assign(new Program(), a, {blocks: a.blocks.filter(b => b.ref !== '' && b.ref !== 0)});
        }
        dispatch(save(program));
    };
};

export const duplicate = (program, newName = '') => {
    return (dispatch, getState) => {
        dispatch(_duplicate(program, newName));
    };
};

export const _duplicate = (program, newName = '') => ({
    type: DUPLICATE_PROGRAM,
    program: program,
    newName: newName,
});

export const remove = (program_id) => ({
    type: DELETE_PROGRAM,
    program_id: program_id,
});

export const removeProgram = (program_id) => {
    return (dispatch, getState) => {
        let program = getState().ActiveBlock.Active_Block;
        if (Database.isUsed(program, program_id)) {
            Alert.alert(i18n.t('RoboticsDatabase.programUsedByActiveProgramTitle'), i18n.t('RoboticsDatabase.programUsedByActiveProgramMessage'));
        } else {
            dispatch(remove(program_id));
        }
    };
};
