import {createStore, applyMiddleware} from 'redux';
import {ProgramsReducer} from '../database/DatabaseReducer';
import {ActiveInstructionsReducer} from '../programmingtabs/stepprogramming/ActiveInstructionsReducer';
import {BleConnectionReducer} from '../ble/BleReducer';
import {SettingsReducer} from '../settings/SettingsReducer';
import {combineReducers} from 'redux';
import thunk from 'redux-thunk';
import * as dbtest from '../database/DatabaseTest';
import {ActiveBlockReducer} from '../programmingtabs/blockprogramming/ActiveBlockReducer';


const rootReducer = combineReducers({
    Program: ProgramsReducer,
    BLEConnection: BleConnectionReducer,
    Settings: SettingsReducer,
    ActiveProgram: ActiveInstructionsReducer,
    ActiveBlock: ActiveBlockReducer,
});

let store = createStore(rootReducer, applyMiddleware(thunk));
let test = new dbtest.DatabaseTest(store);
test.clearDatabase();

export default store;
