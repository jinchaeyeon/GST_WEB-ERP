import {
  BrowserRouter as Router,
  Switch,
  Route,
  BrowserRouter,
} from "react-router-dom";
import React, { Component } from "react";
import "@progress/kendo-theme-default/dist/all.css";
import "./App.css";
import Main from "./routes/Main";
import MA_B7000 from "./routes/MA_B7000";
import Home from "./routes/Main";
import Products from "./routes/MA_B7000";
import About from "./routes/MA_B7000";
import Team from "./routes/MA_B7000";
import PanelBarNavContainer from "./components/PanelBarNavContainer";

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Router>
          <PanelBarNavContainer>
            <Switch>
              <Route exact={true} path="/" component={Home} />
              <Route exact={true} path="/MA_B7000" component={MA_B7000} />
              <Route exact={true} path="/about" component={About} />
              <Route exact={true} path="/about/team" component={Team} />
            </Switch>
          </PanelBarNavContainer>
        </Router>
      </BrowserRouter>
    );
  }
}
export default App;
