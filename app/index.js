import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import routes from './routes';
import configureStore from './store/configureStore';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import injectTapEventPlugin from 'react-tap-event-plugin';
import './app.global.css';

const store = configureStore();
const history = syncHistoryWithStore(hashHistory, store);

injectTapEventPlugin();

render(
  <MuiThemeProvider muiTheme={getMuiTheme()}>
    <Provider store={store}>
      <Router history={history} routes={routes} />
    </Provider>
  </MuiThemeProvider>,
  document.getElementById('root')
);
