import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Editor from '../components/Editor';
import * as editorActions from '../actions/EditorActions';

function mapStateToProps(state) {
  return {
    canvases: state.canvases
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(editorActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Editor);