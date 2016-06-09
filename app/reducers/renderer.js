import { ADD_CANVAS, REMOVE_CANVAS, MOVE_CANVAS, SELECT_CANVAS } from '../actions/WorkspaceActions';
import { INIT_CONTEXT, APPLY_OPTION, APPLY_FILTER, RENDER_LAYER, RENDER_LAYERS } from '../actions/CanvasActions';
import * as canvasUtils from '../utils/canvas-utils';

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
        return Object.assign({}, action.payload, {status: 'rendering'});
    }
    if (action.type === RENDER_LAYER) {
        return Object.assign({}, state, action.payload, {status: 'ready'});
    }
    if (action.type === RENDER_LAYERS) {
        return Object.assign({}, state, action.payload, {status: 'ready'});
    }
    return state;
}

export default function renderer(state, action) {
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