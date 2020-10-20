import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import Reqeusts from './containers/Reqeusts';
import NotFound from './components/errors/Notfound';
import './i18n';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/requests/:id">
          <Reqeusts />
        </Route>
        <Route path='*' exact={true} component={NotFound} />
      </Switch>
    </Router>
  );
}

export default App;
