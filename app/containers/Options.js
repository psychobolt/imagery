import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Options from '../components/options/Options';
import * as canvasActions from '../actions/CanvasActions';

function mapStateToProps(state) {
  return {
    canvases : state.canvases
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(canvasActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Options);