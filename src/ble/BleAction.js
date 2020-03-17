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
import { loadBlock, loadChildren } from '../programmingtabs/blockprogramming/ActiveBlockAction';
import * as NavigationService from '../utillity/NavigationService';
import Database from '../database/RoboticsDatabase';
import uuidv4 from 'uuid/v4';

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
 * When the download finished, it checks for a matching program
 * If there is a match, the program will be loaded and the view navigates to the corresponding programming view 
 * otherwise it will try to create a program from the stored programs
 */
export const finishedDownloading = () => {
    return (dispatch, getState) => {
        dispatch(successDownloading());
        
        let receivedInstuctions = getState().BLEConnection.receivedDownloads;
        var result = searchStructure(receivedInstuctions, Database.findAll(), 0);
        
        if(result.length == 1 && result[0].rep == 1){
            program = Database.findOneByPK(result[0].ref);
        }else{
            program = new Program('MasterDownload', ProgramType.BLOCKS, [], result);
            program = saveProgram(program);
        }

        dispatch(loadChildren());
        dispatch(loadBlock(program.name));
        NavigationService.navigate('Blockprogramming');

        if(program.programType == ProgramType.BLOCKS){
            console.log(program);
            // dispatch(loadBlock(savedProgram.name));
            // NavigationService.navigate('Blockprogramming');
        }else{
            dispatch(loadInstruction(program.name));
            NavigationService.navigate('Stepprogramming');
        }
        
    };
};

/**
 * Searches for a list of patterns in a list of instructions
 * slice includes first and excludes the last
 * @param {Instruction[]} toSearchIn 
 * @param {Program[]} patterns 
 * @returns {Block[]}
 */
function searchStructure(toSearchIn, patterns, n){
    console.log(n);
    console.log(toSearchIn," ||||| ", patterns);
    if(toSearchIn.length == 0){
        return [];
    }
    else if(patterns.length == 0){
        let id = saveProgram(new Program('Download',ProgramType.STEPS,toSearchIn, [])).id;
        return [new Block(id,1)];
    }

    let pattern = Program.flatten(patterns[0]);
    let foundAt = instructionsContain(toSearchIn, pattern);
    // console.log(foundAt);
    // console.log(toSearchIn, " |||||| " ,pattern)
    // console.log(patterns);
    if(foundAt == -1){
        return searchStructure(toSearchIn, patterns.slice(1, patterns.length), n + 1);
    }else if(foundAt > 0){    
        let before = toSearchIn.slice(0, foundAt);
        let after = toSearchIn.slice(foundAt+pattern.length,toSearchIn.length);
        //console.log(after);
        return [...searchStructure(before, patterns.slice(1, patterns.length), n + 1), new Block(patterns[0].id,1), ...searchStructure(after, patterns, n + 1)];
    }else{
        let after = toSearchIn.slice(pattern.length,toSearchIn.length);
        //console.log(after);
        return [new Block(patterns[0].id,1),...searchStructure(after, patterns, n + 1)];
    }
}
/**
 * Save program and add an incremental number to the end of it if it already exists
 * @param {Program} program 
 */
function saveProgram(program){
    let i = 1;
    let newName = program.name;
    while (!Database.nameIsUnused(program.name)) {
        program.name = newName + '(' + i + ')';
        i++;
    }
    program.id = uuidv4();
    Database.add(program, 'new');
    return program;
}

/**
 * returns the index of a pattern in a instruction collection or -1 if it doesn't contain the pattern
 * @param {Instruction[]} instructions 
 * @param {Instruction[]} pattern 
 */
function instructionsContain(instructions, pattern){
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
