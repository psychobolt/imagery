import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Filters from '../components/filters/Filters';
import * as canvasActions from '../actions/CanvasActions';

function mapStateToProps(state) {
  return {
    canvases : state.canvases
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(canvasActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Filters);