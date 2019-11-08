import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {add, save, delete_all, duplicate, remove} from '../../database/DatabaseAction';
import OverviewComponent from './OverviewComponent';

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
            remove,
        }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(OverviewComponent);
