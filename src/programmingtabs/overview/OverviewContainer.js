import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {add, save, duplicate, remove, removeProgram} from '../../database/DatabaseAction';
import {loadBlock} from '../blockprogramming/ActiveBlockAction';
import OverviewComponent from './OverviewComponent';
import {loadInstruction} from '../stepprogramming/ActiveInstructionAction';

const mapStateToProps = state => ({
    Settings: state.Settings,
    Program: state.Program,
});

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            add,
            save,
            duplicate,
            remove: removeProgram,
            loadBlock,
            loadInstruction,
        }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(OverviewComponent);
