import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { DragSource } from 'react-dnd';
import Canvas from '../components/Canvas';
import * as canvasActions from '../actions/CanvasActions';
import ItemTypes from './ItemTypes';

const canvasSource = {
  beginDrag(props, monitor, component) {
    const { canvas } = props;
    const rect = component.refs.canvas.getBoundingClientRect();
    return Object.assign({}, canvas, {
      left: rect.left,
      top: rect.top - 50
    });
  }
}

function collect(connect, monitor) {
  return { 
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  };
}

function mapStateToProps(state) {
  return {};
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(canvasActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(
  DragSource(ItemTypes.CANVAS, canvasSource, collect)(Canvas)
 );