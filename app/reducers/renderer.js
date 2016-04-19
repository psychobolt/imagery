import { ADD_CANVAS, REMOVE_CANVAS } from '../actions/EditorActions';
import { INIT_CONTEXT, RENDER_LAYERS } from '../actions/CanvasActions';
import * as canvasUtils from '../utils/canvas-utils';

function canvasRenderer(state, action) {
    if (!state.id || action.payload.id !== state.id) {
        return state;
    }
    if (action.type === INIT_CONTEXT && !state.context) {
        return state = action.payload;
    }
    return state;
}

export default function renderer(state = [{width: 800, height: 600}], action) {
    state = state.map((canvas) => {
        return canvasRenderer(canvas, action);
    });
    if (action.type === ADD_CANVAS) {
        return [...state, action.payload];
    }
    if (action.type === REMOVE_CANVAS) {
        return state.filter((canvas) => {
            return canvas !== action.payload;
        });
    }
    return state;
}