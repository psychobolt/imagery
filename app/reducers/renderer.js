import { ADD_CANVAS, REMOVE_CANVAS, MOVE_CANVAS, SELECT_CANVAS } from '../actions/WorkspaceActions';
import { INIT_CONTEXT, APPLY_OPTION, APPLY_FILTER } from '../actions/CanvasActions';
import * as canvasUtils from '../utils/canvas-utils';
import { canvasProps } from '../components/Canvas';

function canvasRenderer(state, action) {
    if (!state.id || action.payload.id !== state.id) {
        return state;
    }
    if (action.type === INIT_CONTEXT && !state.context) {
        return action.payload;
    }
    if (action.type === APPLY_OPTION) {
        return action.payload;
    }
    if (action.type === APPLY_FILTER) {
        return action.payload;
    }
    return state;
}

export default function renderer(state = [Object.assign({}, canvasProps, {selected: true})], action) {
    state = state.map((canvas) => {
        return canvasRenderer(canvas, action);
    });
    if (action.type === ADD_CANVAS) {
        return [
          ...state.map((canvas) => Object.assign({}, canvas, {selected: false})), 
          Object.assign({}, action.payload, {selected: true})
        ];
    }
    if (action.type === REMOVE_CANVAS) {
        return state.filter((canvas) => {
            return canvas !== action.payload;
        });
    }
    if (action.type === MOVE_CANVAS) {
        return state.map((canvas) => {
           if (action.payload.id === canvas.id) {
               return Object.assign({}, canvas, action.payload);
           }
           return canvas; 
        });
    }
    if (action.type === SELECT_CANVAS) {
        return state.map((canvas) => {
           if (action.payload.id === canvas.id) {
               return Object.assign({}, canvas, {selected: true});
           }
           return Object.assign({}, canvas, {selected: false});
        });
    }
    return state;
}