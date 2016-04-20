export const INIT_CONTEXT = 'INIT_CANVAS';
export const RENDER_LAYERS = 'RENDER_LAYERS';
import * as canvasUtils from '../utils/canvas-utils';

export function initContext(canvas, gl) {
  return (dispatch) => {
    dispatch({
      type: INIT_CONTEXT,
      payload: Object.assign({}, canvas, {
        context: canvasUtils.initContext(canvas, gl)
      })
    });
  };
}