import {createStore, applyMiddleware} from 'redux';
import {ProgramsReducer} from '../database/DatabaseReducer';
import {BleConnectionReducer} from '../ble/BleReducer';
import {SettingsReducer} from '../settings/SettingsReducer';
import {combineReducers} from 'redux';
import thunk from 'redux-thunk';


const rootReducer = combineReducers({
    Program: ProgramsReducer,
    BLEConnection: BleConnectionReducer,
    Settings: SettingsReducer,
});

let store = createStore(rootReducer, applyMiddleware(thunk));
export default store;
