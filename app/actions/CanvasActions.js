import * as canvasUtils from '../utils/canvas-utils';

export const INIT_CONTEXT = 'INIT_CANVAS';
export const APPLY_FILTER = 'APPLY_FILTER';
export const APPLY_OPTION = 'APPLY_OPTION';
export const RENDER_LAYER = 'RENDER_LAYER';
export const RENDER_LAYERS = 'RENDER_LAYERS';

export function initContext(canvas, gl) {
  return (dispatch) =>
    dispatch({
      type: INIT_CONTEXT,
      payload: Object.assign({}, canvas, {
        context: canvasUtils.initContext(canvas, gl)
      })
    });
}

export function applyFilter(canvas, layer, filter) { 
  return (dispatch) => {
    let chain = function () {}
    const layers = canvas.layers.map((_layer, index) => {
      if (layer === _layer) {
        _layer = Object.assign({}, layer, {
          filters: Object.assign({}, layer.filters, {
            [filter.type]: filter
          })
        });
        chain = renderLayer(canvas, _layer, index);
      }
      return _layer;
    });
    dispatch({
      type: APPLY_FILTER,
      payload: Object.assign({}, canvas, {layers})
    });
    chain(dispatch);
  };
}

export function applyOption(canvas, option) {
  return (dispatch) => {
    dispatch({
      type: APPLY_OPTION,
      payload: Object.assign({}, canvas, {options: Object.assign({}, canvas.options, {
        [option.type]: option
      })})
    });
  }
}

export function renderLayer(canvas, layer, index) {
  return (dispatch) => {
    canvasUtils.renderLayer(canvas.context, layer, index);
    dispatch({
      type: RENDER_LAYER,
      payload: canvas
    });
  };
}

export function renderLayers(canvas) {
  return (dispatch) => {
    canvas.layers.forEach((layer, index) => {
      canvasUtils.renderLayer(canvas.context, layer, index);
    });
    dispatch({
      type: RENDER_LAYERS,
      payload: canvas
    });
  };
}