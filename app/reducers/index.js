import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import { canvasProps } from '../components/Canvas';
import {COMPRESS_IMAGE, SAVE_IMAGE} from '../actions/WorkspaceActions';
import counter from './counter';
import renderer from './renderer';

function workspaceReducer(state = [Object.assign({}, canvasProps, {selected: true})], action) {
  state = renderer(state, action);
  let status;
  if (action.type === COMPRESS_IMAGE || action.type === SAVE_IMAGE) {
    return state.map((canvas) => {
      if (canvas.id === action.payload.id) {
        return action.payload;
      }
      return canvas;
    });
  }
  return state;
}

const rootReducer = combineReducers({
  //counter,
  canvases: workspaceReducer,
  routing
});

export default rootReducer;
