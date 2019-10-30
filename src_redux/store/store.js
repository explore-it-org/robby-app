import {createStore, applyMiddleware} from 'redux';
import {ProgramsReducer} from '../database/DatabaseReducer';
import {combineReducers} from 'redux';
import thunk from 'redux-thunk';


const rootReducer = combineReducers({Program: ProgramsReducer});

let store = createStore(rootReducer);
export default store;
