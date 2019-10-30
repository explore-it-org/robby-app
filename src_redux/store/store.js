import {createStore} from 'redux';
import {ProgramsReducer} from '../database/DatabaseReducer';
import {combineReducers} from 'redux';


const rootReducer = combineReducers({Program: ProgramsReducer});

export default store = createStore(rootReducer());
