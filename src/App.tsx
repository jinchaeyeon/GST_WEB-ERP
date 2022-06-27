import { RecoilRoot } from "recoil";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  withRouter,
} from "react-router-dom";
import React, { Component } from "react";
import "@progress/kendo-theme-default/dist/all.css";
import "./App.css";
import Login from "./routes/Login";
import Main from "./routes/Main";
import MA_B7000 from "./routes/MA_B7000";
import SA_B2000 from "./routes/SA_B2000";
import PanelBarNavContainer from "./components/PanelBarNavContainer";
import styled, { createGlobalStyle } from "styled-components";
import AuthRoute from "./components/AuthRoute";
import UserEffect from "./components/UserEffect";

const GlobalStyle = createGlobalStyle`
@import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400&display=swap');
html, body, div, span, applet, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, img, ins, kbd, q, s, samp,
small, strike, strong, sub, sup, tt, var,
b, u, i, center,
dl, dt, dd, menu, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td,
article, aside, canvas, details, embed,
figure, figcaption, footer, header, hgroup,
main, menu, nav, output, ruby, section, summary,
time, mark, audio, video {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;
  font: inherit;
  vertical-align: baseline;
}
/* HTML5 display-role reset for older browsers */
article, aside, details, figcaption, figure,
footer, header, hgroup, main, menu, nav, section {
  display: block;
}
/* HTML5 hidden-attribute fix for newer browsers */
*[hidden] {
    display: none;
}
body {
  line-height: 1;
}
menu, ol, ul {
  list-style: none;
}
blockquote, q {
  quotes: none;
}
blockquote:before, blockquote:after,
q:before, q:after {
  content: '';
  content: none;
}
table {
  border-collapse: collapse;
  border-spacing: 0;
}
* {
  box-sizing: border-box;
}
body {
  font-family: 'Source Sans Pro', sans-serif;
}
a {
  text-decoration:none;
}
`;

class App extends Component {
  render() {
    return (
      <RecoilRoot>
        <GlobalStyle />
        <Router>
          <Switch>
            <Route path="/Login" component={Login} />
            <PanelBarNavContainer>
              <UserEffect />
              <AuthRoute path="/" component={Main} exact />
              <AuthRoute path="/MA_B7000" component={MA_B7000} exact />
              <AuthRoute path="/SA_B2000" component={SA_B2000} exact />
            </PanelBarNavContainer>
          </Switch>
        </Router>
      </RecoilRoot>
    );
  }
}
export default App;
