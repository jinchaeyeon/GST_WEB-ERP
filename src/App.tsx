import { RecoilRoot, useRecoilState, useRecoilValue } from "recoil";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import React, { Component, useEffect } from "react";
import "@progress/kendo-theme-default/dist/all.css";
import PanelBarNavContainer from "./components/PanelBarNavContainer";
import { createGlobalStyle } from "styled-components";
import AuthRoute from "./components/AuthRoute";
//import "./App.css";
import Login from "./routes/Login";
import Main from "./routes/Main";
import MA_B2000W from "./routes/MA_B2000W";
import MA_B2100W from "./routes/MA_B2100W";
import MA_B7000W from "./routes/MA_B7000W";
import SA_A2000W from "./routes/SA_A2000W";
import SA_B2205W from "./routes/SA_B2205W";
import SA_B2410W from "./routes/SA_B2410W";
import SA_B2410_290W from "./routes/SA_B2410_290W";
import SA_B3000W from "./routes/SA_B3000W";
import SA_B3100W from "./routes/SA_B3100W";
import PR_A1100W from "./routes/PR_A1100W";
import QC_A0120W from "./routes/QC_A0120W";
import SY_A0120W from "./routes/SY_A0120W";
import SY_A0110W from "./routes/SY_A0110W";
import SY_A0010W from "./routes/SY_A0010W";
import SY_A0012W from "./routes/SY_A0012W";
import SY_A0013W from "./routes/SY_A0013W";
import SY_A0011W from "./routes/SY_A0011W";
import CM_A1600W from "./routes/CM_A1600W";
import EA_A2000W from "./routes/EA_A2000W";
import PR_A9100W from "./routes/PR_A9100W";
import PR_B3000W from "./routes/PR_B3000W";
import PR_A3000W from "./routes/PR_A3000W";
import CT_A0111W from "./routes/CT_A0111W";
import CM_A0000W from "./routes/CM_A0000W";
import CHAT_A0001 from "./routes/CHAT_A0001";
import CHAT_A0002 from "./routes/CHAT_A0002";
import CHAT_TEST_TRAVEL_BOT from "./routes/CHAT_TEST_TRAVEL_BOT";
import WORD_EDITOR from "./routes/WORD_EDITOR";
import GANTT from "./routes/GANTT";
import SY_A0100W from "./routes/SY_A0100W";
import { isMenuOpendState } from "./store/atoms";

type TGlobalStyle = {
  isMenuOpend: boolean;
};
const GlobalStyle = createGlobalStyle<TGlobalStyle>`
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
  overflow: ${(props) => (props.isMenuOpend ? "hidden" : "auto")};
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

.k-grid .k-grid-header .k-header .k-cell-inner > .k-link {
  justify-content: center; /*공통설정 : 그리드 헤더 텍스트 중앙정렬*/
}

`;

const App: React.FC = () => {
  return (
    <RecoilRoot>
      <AppInner></AppInner>
    </RecoilRoot>
  );
  //}
};
const AppInner: React.FC = () => {
  const isMenuOpend = useRecoilValue(isMenuOpendState);

  return (
    <>
      <GlobalStyle isMenuOpend={isMenuOpend} />
      <Router>
        <Switch>
          <Route path="/" component={Login} exact />
          <PanelBarNavContainer>
            {/* 메인 홈 */}
            <AuthRoute path="/Home" component={Main} exact />
            {/* 물류관리 */}
            <AuthRoute path="/MA_B2000W" component={MA_B2000W} exact />
            <AuthRoute path="/MA_B2100W" component={MA_B2100W} exact />
            <AuthRoute path="/MA_B7000W" component={MA_B7000W} exact />
            {/* 영업관리 */}
            <AuthRoute path="/SA_A2000W" component={SA_A2000W} exact />
            <AuthRoute path="/SA_B2205W" component={SA_B2205W} exact />
            <AuthRoute path="/SA_B2410W" component={SA_B2410W} exact />
            <AuthRoute path="/SA_B2410_290W" component={SA_B2410_290W} exact />
            <AuthRoute path="/SA_B3000W" component={SA_B3000W} exact />
            <AuthRoute path="/SA_B3100W" component={SA_B3100W} exact />
            {/* 생산관리 */}
            <AuthRoute path="/PR_A1100W" component={PR_A1100W} exact />
            <AuthRoute path="/PR_A9100W" component={PR_A9100W} exact />
            <AuthRoute path="/PR_B3000W" component={PR_B3000W} exact />
            <AuthRoute path="/PR_A3000W" component={PR_A3000W} exact />
            {/* 품질관리 */}
            <AuthRoute path="/QC_A0120W" component={QC_A0120W} exact />
            {/* 시스템 */}
            <AuthRoute path="/SY_A0120W" component={SY_A0120W} exact />
            <AuthRoute path="/SY_A0110W" component={SY_A0110W} exact />
            <AuthRoute path="/SY_A0010W" component={SY_A0010W} exact />
            <AuthRoute path="/SY_A0012W" component={SY_A0012W} exact />
            <AuthRoute path="/SY_A0013W" component={SY_A0013W} exact />
            <AuthRoute path="/SY_A0011W" component={SY_A0011W} exact />
            <AuthRoute path="/SY_A0100W" component={SY_A0100W} exact />
            {/* 전사관리 */}
            <AuthRoute path="/CM_A0000W" component={CM_A0000W} exact />
            <AuthRoute path="/CM_A1600W" component={CM_A1600W} exact />
            {/* 전자결재 */}
            <AuthRoute path="/EA_A2000W" component={EA_A2000W} exact />
            {/* 원가관리 */}
            <AuthRoute path="/CT_A0111W" component={CT_A0111W} exact />
            {/* CHAT BOT */}
            <AuthRoute path="/CHAT_A0001" component={CHAT_A0001} exact />
            <AuthRoute path="/CHAT_A0002" component={CHAT_A0002} exact />
            <AuthRoute
              path="/CHAT_TEST_TRAVEL_BOT"
              component={CHAT_TEST_TRAVEL_BOT}
              exact
            />
            {/* 연구개발 */}
            <AuthRoute path="/WORD_EDITOR" component={WORD_EDITOR} exact />
            <AuthRoute path="/GANTT" component={GANTT} exact />
          </PanelBarNavContainer>
        </Switch>
      </Router>
    </>
  );
  //}
};
export default App;
