import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Requests from './containers/Requests';
import NotFound from './components/errors/Notfound';
import './i18n';
import EthAddress from './containers/EthAddress';
import './fonts/font.css';
import ServerError from './components/errors/ServerError';
function App() {
  return (
    <Router>
      <Switch>
        <Route path="/requests/:productid/:valueto/:type/:contractaddress/:useraddress/:userlanguage">
          <Requests />
        </Route>
        <Route path="/ethAddress/:id">
          <EthAddress />
        </Route>
        <Route path="/serverError" exact={true} component={ServerError} />
        <Route path="*" exact={true} component={NotFound} />
      </Switch>
    </Router>
  );
}

export default App;
