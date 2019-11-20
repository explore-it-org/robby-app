import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {add, save, delete_all, duplicate, remove, removeProgram} from '../../database/DatabaseAction';
import {loadBlock} from '../blockprogramming/ActiveBlockAction';
import OverviewComponent from './OverviewComponent';
import {loadInstruction} from '../stepprogramming/ActiveProgramAction';

const mapStateToProps = state => ({
    Settings: state.Settings,
    Program: state.Program,
});

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            add,
            save,
            delete_all,
            duplicate,
            remove: removeProgram,
            loadBlock,
            loadInstruction,
        }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(OverviewComponent);
