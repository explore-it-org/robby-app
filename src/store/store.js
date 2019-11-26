import {createStore, applyMiddleware} from 'redux';
import {ProgramsReducer} from '../database/DatabaseReducer';
import {ActiveInstructionsReducer} from '../programmingtabs/stepprogramming/ActiveInstructionsReducer';
import {BleConnectionReducer} from '../ble/BleReducer';
import {SettingsReducer} from '../settings/SettingsReducer';
import {combineReducers} from 'redux';
import thunk from 'redux-thunk';
import * as dbtest from '../database/DatabaseTest';
import {ActiveBlockReducer} from '../programmingtabs/blockprogramming/ActiveBlockReducer';
import { persistReducer, persistStore } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import AsyncStorage from '@react-native-community/async-storage';



const persistConfig = {
 key: 'root',
 storage: AsyncStorage,
 autoMergeLevel2,
 blacklist: ['BLEConnection', 'Program']
};

const activeBlockPersistConfig = {
    key: 'activeBlock',
    storage: AsyncStorage,
    stateReconciler: autoMergeLevel2,
    blacklist: ['possibleChildren', 'selectedBlockIndex']
}

const rootReducer = combineReducers({
    Program: ProgramsReducer,
    BLEConnection: BleConnectionReducer,
    Settings: SettingsReducer,
    ActiveProgram: ActiveInstructionsReducer,
    ActiveBlock: persistReducer(activeBlockPersistConfig, ActiveBlockReducer),
});

const pReducer = persistReducer(persistConfig, rootReducer);

let store = createStore(pReducer, applyMiddleware(thunk));
let test = new dbtest.DatabaseTest(store);
test.createDatabaseEntries();

export const persistor = persistStore(store);
export default store;
