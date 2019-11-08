import {createStore, applyMiddleware} from 'redux';
import {ProgramsReducer} from '../database/DatabaseReducer';
import {ActiveInstructionsReducer} from '../database/ActiveInstructionsReducer';
import {BleConnectionReducer} from '../ble/BleReducer';
import {SettingsReducer} from '../settings/SettingsReducer';
import {combineReducers} from 'redux';
import thunk from 'redux-thunk';
import * as dbtest from '../database/DatabaseTest';


const rootReducer = combineReducers({
    Program: ProgramsReducer,
    BLEConnection: BleConnectionReducer,
    Settings: SettingsReducer,
    ActiveProgram: ActiveInstructionsReducer,
});

let store = createStore(rootReducer, applyMiddleware(thunk));
let test = new dbtest.DatabaseTest(store);
test.clearDatabase();
test.createDatabaseEntries();
export default store;
