import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
    deleteBlock,
    addBlock,
    clearBlock,
    moveDownBlock,
    moveUpBlock,
    setActiveBlockIndex,
    setBlockName,
    changeReps,
} from './ActiveBlockAction';
import BlockProgrammingComponent from './BlockProgrammingComponent';

const mapStateToProps = state => ({
    Settings: state.Settings,
    Program: state.Program,
    Block: state.ActiveBlock,
});

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            deleteBlock,
            addBlock,
            clearBlock,
            moveUpBlock,
            moveDownBlock,
            setBlockName,
            setActiveBlockIndex,
            changeReps,
        }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(BlockProgrammingComponent);
