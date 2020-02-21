// Database Reducer Action Types
export const ADD_PROGRAM = 'ADD_PROGRAM';
export const SAVE_PROGRAM = 'SAVE_PROGRAM';
export const DUPLICATE_PROGRAM = 'DUPLICATE_PROGRAM';
export const DELETE_PROGRAM = 'DELETE_PROGRAM';


// Ble Reducer Action Types
export const SET_BLE_DEVICE = 'SET_BLE_DEVICE';
export const IS_CONNECTED = 'IS_CONNECTED';

export const START_SCANNING = 'START_SCANNING';
export const SUCCESS_SCANNING = 'SUCCESS_SCANNING';
export const FAILURE_SCANNING = 'FAILURE_SCANNING';
export const STOP_SCANNING = 'STOP_SCANNING';
export const ENABLED_SCANNING = 'ENABLED_SCANNING';

export const START_CONNECTING = 'START_CONNECTING';
export const SUCCESS_CONNECTING = 'SUCCESS_CONNECTING';
export const FAILURE_CONNECTING = 'FAILURE_CONNECTING';
export const LOST_CONNECTION = 'LOST_CONNECTION';

export const DISCONNECT = 'DISCONNECT';

export const START_UPLOADING = 'START_UPLOADING';
export const SUCCESS_UPLOADING = 'SUCCESS_UPLOADING';
export const FAILURE_UPLOADING = 'FAILURE_UPLOADING';

export const START_DOWNLOADING = 'START_DOWNLOADING';
export const SUCCESS_DOWNLOADING = 'SUCCESS_DOWNLOADING';
export const FAILURE_DOWNLOADING = 'FAILURE_DOWNLOADING';
export const RECEIVED_CHUNK = 'RECEIVED_CHUNK';

export const START_RECORDING = 'START_RECORDING';
export const SUCCESS_RECORDING = 'SUCCESS_RECORDING';
export const FAILURE_RECORDING = 'FAILURE_RECORDING';

export const START_SENDING = 'START_SENDING';
export const SUCCESS_SENDING = 'SUCCESS_SENDING';
export const FAILURE_SENDING = 'FAILURE_SENDING';

export const STOP_ROBOT = 'STOP_ROBOT';

export const RUN_ROBOT = 'RUN_ROBOT';

export const GO_ROBOT = 'GO_ROBOT';

export const UPDATE_DEVICE_VERSION = 'UPDATE_DEVICE_VERSION';
export const BLE_RESPONSE = 'BLE_RESPONSE';

export const BLE_ERROR = 'BLE_ERROR';

// Active Instruction  Action Types
export const CLEAR_PROGRAM = 'CLEAR_PROGRAM';
export const ADD_NEW_INSTRUCTION = 'ADD_NEW_INSTRUCTION';
export const CHANGE_INSTRUCTION_NAME = 'CHANGE_INSTRUCTION_NAME';
export const DELETE_INSTRUCITON_INDEX = 'DELETE_INSTRUCITON_INDEX';
export const CHANGE_INSTRUCTION_INDEX = 'CHANGE_INSTRUCTION_INDEX';
export const SET_ACTIVE_INDEX = 'SET_ACTIVE_INDEX';
export const CHANGE_RIGHT_SPEED = 'CHANGE_RIGHT_SPEED';
export const CHANGE_LEFT_SPEED = 'CHANGE_LEFT_SPEED';
export const SET_PROGRAM_NAME = 'SET_PROGRAM_NAME';
export const LOAD_INSTRUCTION = 'LOAD_INSTRUCTION';
export const RECEIVED_DOWNLOAD = 'RECEIVED_DOWNLOAD';
export const EMPTY_INSTRUCTION_LIST = 'EMPTY_INSTRUCTION_LIST';

// Active Block Action Types
export const CLEAR_BLOCK = 'CLEAR_BLOCK';
export const ADD_NEW_BLOCK = 'ADD_NEW_BLOCK';
export const CHANGE_BLOCK_NAME = 'CHANGE_BLOCK_NAME';
export const DELETE_BLOCK_INDEX = 'DELETE_BLOCK_INDEX';
export const CHANGE_BLOCK_INDEX = 'CHANGE_BLOCK_INDEX';
export const SET_ACTIVE_BLOCK = 'SET_ACTIVE_BLOCK';
export const CHANGE_REPS = 'CHANGE_REPS';
export const LOAD_BLOCK = 'LOAD_BLOCK';
export const CHANGE_BLOCK_SELECTED_ID = 'CHANGE_BLOCK_SELECTED_ID';
export const LOAD_POSSIBLE_CHILDREN = 'LOAD_POSSIBLE_CHILDREN';
export let FORCE_RELOAD_BLOCK = 'FORCE_RELOAD_BLOCK';

// Settings Action Types
export const SET_INTERVALL = 'SET_INTERVALL';
export const SET_DURATION = 'SET_DURATION';
export const GRANT_LOCATION = 'GRANT_LOCATION';
export const SET_LANGUAGE = 'SET_LANGUAGE';
export const BLE_STATE = 'BLE_STATE';
export const TOGGLE_SETTINGS = 'TOGGLE_SETTINGS';

// Overview Action Types
export const SET_SELECTED_INDEX = 'SET_SELECTED_INDEX';
export const SET_SELECTED_PROGRAM = 'SET_SELECTED_PROGRAM';
