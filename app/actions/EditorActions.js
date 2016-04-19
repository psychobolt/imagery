export const ADD_CANVAS = 'ADD_CANVAS';
export const REMOVE_CANVAS = 'REMOVE_CANVAS';

export function addCanvas(canvas) {
  return (dispatch) => {
    dispatch({
      type: ADD_CANVAS,
      payload: canvas
    });
  };
}

export function removeCanvas(canvas) {
  return (dispatch) => {
    dispatch({
      type: REMOVE_CANVAS,
      payload: canvas
    });
  };
}