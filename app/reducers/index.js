import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
//import counter from './counter';
import renderer from './renderer';

const rootReducer = combineReducers({
  //counter,
  canvases: renderer,
  routing
});

export default rootReducer;
