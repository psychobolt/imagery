import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Canvas from '../components/Canvas';
import * as canvasActions from '../actions/CanvasActions';

function mapStateToProps(state) {
  return {};
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(canvasActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Canvas);