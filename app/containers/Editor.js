import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Editor from '../components/Editor';

function mapStateToProps(state) {
  return {
    canvases: state.canvases
  };
}

export default connect(mapStateToProps)(Editor);