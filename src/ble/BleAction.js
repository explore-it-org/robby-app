import * as ActionTypes from '../GlobalActionTypes';
import RobotProxy from './RobotProxy';
import {
    clearProgram,
    emptyInstructionList,
    receiveDownload,
    loadInstruction,
} from '../programmingtabs/stepprogramming/ActiveInstructionAction';

import {Program, ProgramType, Block} from '../model/DatabaseModels';
import {Alert} from 'react-native';
import { CommunicationManager } from './CommunicationManager';
import { loadBlock, loadChildren, forceReloadBlocks } from '../programmingtabs/blockprogramming/ActiveBlockAction';
import * as NavigationService from '../utillity/NavigationService';
import Database from '../database/RoboticsDatabase';
import uuidv4 from 'uuid/v4';
import { add, removeProgram } from '../database/DatabaseAction';

export const connectToBle = () => ({
    type: ActionTypes.START_CONNECTING,
});
export const connectedToBle = (robot) => ({
    type: ActionTypes.IS_CONNECTED,
    robot,
});
export const connectionFailed = (error) => ({
    type: ActionTypes.FAILURE_CONNECTING,
});
export const connectionLost = (error) => ({
    type: ActionTypes.LOST_CONNECTION
})
export const disconnect = () => ({
    type: ActionTypes.DISCONNECT,
});
export const bleResponse = (response) => ({
    type: ActionTypes.BLE_RESPONSE,
    response: response,
});
export const updateDeviceVersion = (version) => ({
    type: ActionTypes.UPDATE_DEVICE_VERSION,
    version: version,
});
export const startScanning = () => ({
    type: ActionTypes.START_SCANNING,
});
export const failedScanning = (error) => ({
    type: ActionTypes.FAILURE_SCANNING,
    error,
});
export const succesScanning = (robot) => ({
    type: ActionTypes.SUCCESS_SCANNING,
    robot,
});
export const scanningEnabled = (error) => ({
    type: ActionTypes.ENABLED_SCANNING,
    error,
});
export const stopScanning = () => ({
    type: ActionTypes.STOP_SCANNING,
});

export const setDevice = (device) => ({
    type: ActionTypes.SET_BLE_DEVICE,
    device,
});

export const stoppedRobot = () => ({
    type: ActionTypes.STOP_ROBOT,
});

export const ranRobot = () => ({
    type: ActionTypes.RUN_ROBOT,
});

export const bleError = (error) => ({
    type: ActionTypes.BLE_ERROR,
    error,
});


export const runRobot = () => {
    return (dispatch, getState) => {
        RobotProxy.run().then(res => {
            dispatch(ranRobot());
        }).catch(error => {
            dispatch(bleError(error));
        });

    };
};

export const didGoRobot = () => ({
    type: ActionTypes.GO_ROBOT,
});

export const goRobot = () => {
    return (dispatch, getState) => {
        RobotProxy.go().then(res => {
            dispatch(didGoRobot());
        }).catch(error => {
            dispatch(bleError(error));
        });
    };
};


export const stopRobot = () => {
    return (dispatch, getState) => {
        RobotProxy.stop().then(res => {
            dispatch(stoppedRobot());
        }).catch(error => {
            dispatch(bleError(error));
        });
    };
};

export const tryRecording = () => ({
    type: ActionTypes.START_RECORDING,
});
export const successRecording = () => ({
    type: ActionTypes.SUCCESS_RECORDING,
});
export const errorRecording = (error) => ({
    type: ActionTypes.FAILURE_RECORDING,
    error,
});

export const startRecording = () => {
    return (dispatch, getState) => {
        let duration = getState().Settings.duration;
        if (!duration && duration !== 0) {
            duration = 1;
        }
        let interval = getState().Settings.interval;
        if (!interval && interval !== 0) {
            interval = 1;
        }
        let version = getState().BLEConnection.device.version;
        RobotProxy.record(duration, interval, version).then(res => {
            dispatch(tryRecording());
        }).catch(error => {
            dispatch(errorRecording(error));
        });
    };
};
export const scanningForDevices = () => {
    return (dispatch, getState) => {
        dispatch(startScanning());
        RobotProxy.scanningForRobots((error) => {
            dispatch(failedScanning(error));
            Alert.alert('ble error', error);
        }, (robot) => {
            dispatch(succesScanning(robot));
        });
    };
};

export const scanStatus = () => {
    return (dispatch, getState) => {
        RobotProxy.testScan((error) => {
            RobotProxy.stopScanning();
            dispatch(failedScanning(error));
        }, (success) => {
            RobotProxy.stopScanning();
            dispatch(scanningEnabled());
        });
    };
};
export const connectToDevice = () => {
    return (dispatch, getState) => {
        dispatch(connectToBle());
        RobotProxy.connect2((response) => {
            var handler = new CommunicationManager().getHandler(getState().BLEConnection.device.version);
            dispatch(handler.handleResponse(response));
        }, (robot) => {
            dispatch(connectedToBle(robot));
        }, (error) => {
            dispatch(connectionFailed(error));
        }, (error) => {
            dispatch(connectionLost(error));
        });
    };
};
export const startUpload = () => ({
    type: ActionTypes.START_UPLOADING,
});

export const successUplaod = () => ({
    type: ActionTypes.SUCCESS_UPLOADING,
});

export const failedUplaod = (error) => ({
    type: ActionTypes.FAILURE_UPLOADING,
    error,
});

export const uploadToRobot = (ActiveTab) => {
    return (dispatch, getState) => {
        let a = null;
        if (ActiveTab === 'Stepprogramming') {
            a = Program.flatten(getState().ActiveProgram.ActiveProgram);
        } else if(ActiveTab === 'Blockprogramming') {
            a = Program.flatten(getState().ActiveBlock.Active_Block);
        }else {
            a = Program.flatten(getState().Overview.selectedProgram);
        }
        dispatch(startUpload());
        RobotProxy.upload(a, getState().BLEConnection.device.version).then(res => {

        }).catch(error => {
            dispatch(failedUplaod());
        });
    };
};

export const startDownloading = () => ({
    type: ActionTypes.START_DOWNLOADING,
});
export const errorDownloading = (error) => ({
    type: ActionTypes.FAILURE_DOWNLOADING,
    error,
});
export const successDownloading = () => ({
    type: ActionTypes.SUCCESS_DOWNLOADING,
});



/**
 * When the download finishes, it will create a block program from the downloaded programs
 * but if the first block contains only a single program with 1 rep, than that program will be loaded instead
 */
export const finishedDownloading = () => {
    return (dispatch, getState) => {
        dispatch(successDownloading());
        
        let receivedInstuctions = getState().BLEConnection.receivedDownloads;
        var result = searchStructure(receivedInstuctions, dispatch);
        if(result.length == 1 && result[0].rep == 1){
            program = Database.findOneByPK(result[0].ref);
        }else{
            program = new Program('MasterDownload', ProgramType.BLOCKS, [], result);
            program = saveProgram(program, dispatch);
        }

        if(program.programType == ProgramType.BLOCKS){
            dispatch(loadChildren());
            dispatch(loadBlock(program.name));
            NavigationService.navigate('Blockprogramming');
        }else{
            dispatch(loadInstruction(program.name));
            NavigationService.navigate('Stepprogramming');
        }
    };
};

/**
 * Searches in the given list `toSearchIn` of instructions for patterns startign with the largest possible pattern having half the length of `toSearchIn`
 * and returns a list of blocks. Patterns are saved to the Database and returned as a Block.
 * @param {Instruction[]} toSearchIn 
 * @param {Function} dispatch reference to the redux dispatch function, used in the saveProgram method to dispatch the add(program) redux action
 * @returns {Block[]}
 */
function searchStructure(toSearchIn, dispatch){
    let steps = toSearchIn;
    if(toSearchIn.length == 0){
        return [];
    }

    const dbPrg = findProgramByPattern(toSearchIn);
    if(dbPrg){
        return [new Block(dbPrg.id, 1)];
    }

    let patlen = toSearchIn.length / 2;
    let blocks = [];
    while(patlen > 1){
        for(let i = 0; i <= steps.length - 2 * patlen;i++){
            let pattern = toSearchIn.slice(i, i + patlen);
            let remainder = toSearchIn.slice(i + patlen, toSearchIn.length);
            
            let foundAt = instructionsContain(remainder, pattern);
            if(foundAt > -1){
                let ref = findProgramByPattern(pattern);
                if(!ref){
                    let toSave = searchStructure(pattern, dispatch);
                    let prg;
                    if(toSave.length == 1 && toSave[0].rep == 1){
                        ref = Database.findOneByPK(toSave[0].ref);
                    }else{
                        prg = new Program('Download', ProgramType.BLOCKS, [], toSave);
                        ref = saveProgram(prg, dispatch);
                    }
                }
                
                while(toSearchIn.length > 0){
                    foundAt = instructionsContain(toSearchIn, pattern);
                    if(foundAt > 0){
                        let before = toSearchIn.slice(0, foundAt);
                        if(before.length){
                            let blocksBefore = searchStructure(blocksBefore, dispatch);
                            blocks.concat(blocksBefore);
                            toSearchIn = toSearchIn.slice(foundAt);
                        }
                    }else if(foundAt == 0){
                        blocks.push(new Block(ref.id, 1));
                        toSearchIn = toSearchIn.slice(patlen);
                    }else{
                        let remainingBlocks = searchStructure(toSearchIn);
                        blocks.concat(remainingBlocks);
                        toSearchIn = [];
                    }
                }
                return blocks;
            }
        }
        patlen--;
    }
    if(blocks.length > 0){
        return blocks;
    }
    if(steps.length > 0){
        let sequenceProgram = new Program("Download", ProgramType.STEPS, steps, []);
        return [new Block(saveProgram(sequenceProgram, dispatch).id, 1)];
    } else{
        return [];
    }
}

/**
 * Returns null or a program from the DB that matches the supplied pattern.
 * @param {Instruction[]} pattern 
 */
function findProgramByPattern(pattern){
    let dbPrograms = Database.findAll();
    for(let i = 0; i < dbPrograms.length; i++){
        if(compareInstructions(Program.flatten(dbPrograms[i]), pattern)){
            return dbPrograms[i];
        }
    }
    return null;
}

/**
 * Save program and add an incremental number to the end of it if it already exists
 * @param {Program} program 
 * @param {Function} dispatch Refference to the redux dispatch function
 */
function saveProgram(program, dispatch){
    let i = 1;
    let newName = program.name;
    while (!Database.nameIsUnused(program.name)) {
        program.name = newName + '(' + i + ')';
        i++;
    }
    program.id = uuidv4();
    dispatch(add(program));
    return program;
}

/**
 * returns the index of a pattern in a instruction collection or -1 if it doesn't contain the pattern
 * @param {Instruction[]} instructions 
 * @param {Instruction[]} pattern 
 */
function instructionsContain(instructions, pattern){
    if(instructions.length < pattern.length || !instructions || !pattern || instructions.length == 0 || pattern.length == 0){
        return -1;
    }
    for(let i = 0; i <= instructions.length - pattern.length; i++){
        let found = true;
        for(let j = 0; found && (j < pattern.length); j++){
            found = instructions[i+j].equals(pattern[j]);
        }
        if(found){
            return i;
        }
    }
    return -1;
}

/**
 * Goes through all programs and sorts them by complexity. 
 * After sorting it converts all programs in to instructions and compares them. 
 * The first match will be returned.
 * @param {Instruction[]} instructions
 * @param {Program[]} programs
 */
function recreateProgramFromInstructions(instructions){
    const programs = Database.findAll();
    let sorted = programs.sort((a, b) => Program.depth(a) - Program.depth(b));
    for(let i = 0; i < sorted.length; i++){
        let prg = sorted[i];
        let flat = Program.flatten(prg);
        if(compareInstructions(flat, instructions)){
            return prg;
        }
    }
    return null;
}

/**
 * Compares two lists of instructions
 * Saving some time by first comparing the length of the lists before comparing every single one
 * @param {Instruction[]} instructions1 
 * @param {Instruction[]} instructions2 
 */
function compareInstructions(instructions1, instructions2){
    if(instructions1.length != instructions2.length){
        return false;
    }
    for(let i = 0; i < instructions1.length; i++){
        if(!instructions1[i].equals(instructions2[i])){
            return false;
        }
    }
    return true;
}

export const appendChunk = (chunk) => ({
    type: ActionTypes.APPEND_CHUNK,
    chunk
})

export const receivedChunk = (chunk, isLastPackage) => {
    return (dispatch, getState) => {
        dispatch(appendChunk(chunk))
        if(isLastPackage){
            dispatch(finishedDownloading());
        }
    };
};


export const downloadToDevice = () => {
    return (dispatch, getState) => {
        new CommunicationManager().getHandler(getState().BLEConnection.device.version).startDownloading();
        dispatch(startDownloading());
        dispatch(emptyInstructionList());     
    };
};
