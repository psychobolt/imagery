export const ADD_CANVAS = 'ADD_CANVAS';
export const REMOVE_CANVAS = 'REMOVE_CANVAS';
export const MOVE_CANVAS = 'MOVE_CANVAS';
export const SELECT_CANVAS = 'SELECT_CANVAS';

export function addCanvas(canvas) {
  return (dispatch) =>
    dispatch({
      type: ADD_CANVAS,
      payload: canvas
    });
}

export function removeCanvas(canvas) {
  return (dispatch) => 
    dispatch({
      type: REMOVE_CANVAS,
      payload: canvas
    });
}

export function moveCanvas(canvas) {
  return (dispatch) =>
    dispatch({
      type: MOVE_CANVAS,
      payload: canvas
    });
}

export function selectCanvas(canvas) {
  return (dispatch) => 
    dispatch({
      type: SELECT_CANVAS,
      payload: canvas
    })
}