import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
    moveDown,
    moveUp,
    addInstruction,
    deleteInstruction,
    setActiveIndex,
    changeLeftSpeed,
    changeRightSpeed,
    setName
} from './ActiveInstructionAction';
import StepProgrammingComponent from './StepProgrammingComponent';

const mapStateToProps = state => ({
    Settings: state.Settings,
    Program: state.Program,
    Instruction: state.ActiveProgram,
});

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            moveUp,
            moveDown,
            addInstruction,
            deleteInstruction,
            setActiveIndex,
            changeLeftSpeed,
            changeRightSpeed,
            setName,
        }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(StepProgrammingComponent);
