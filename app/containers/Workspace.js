import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { DragDropContext, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Workspace from '../components/Workspace';
import ItemTypes from './ItemTypes';
import * as workspaceActions from '../actions/WorkspaceActions';

const editorTarget = {
  drop (props, monitor, component) {
    const { moveCanvas, sidebarOpen } = props;
    const item = monitor.getItem();
    const delta = monitor.getDifferenceFromInitialOffset();
    const left = Math.round(item.left + delta.x) - (sidebarOpen ? 256 : 0);
    const top = Math.round(item.top + delta.y);
    moveCanvas(Object.assign({}, item, {left, top}));
  }
}

function collect(connect) {
  return {
    connectDropTarget : connect.dropTarget()
  };
}

function mapStateToProps(state) {
  return {
    canvases: state.canvases
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(workspaceActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(
  DragDropContext(HTML5Backend)(DropTarget(ItemTypes.CANVAS, editorTarget, collect)(Workspace))
);