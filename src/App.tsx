import { RecoilRoot, useRecoilValue } from "recoil";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import React from "react";
import "./index.scss";
import { createGlobalStyle } from "styled-components";
import PanelBarNavContainer from "./components/PanelBarNavContainer";
import AuthRoute from "./components/AuthRoute";
import Login from "./routes/Login";
import Main from "./routes/Main";
import AC_B1100W from "./routes/AC_B1100W";
import AC_B1280W from "./routes/AC_B1280W";
import AC_B1300W from "./routes/AC_B1300W";
import AC_B5000W from "./routes/AC_B5000W";
import AC_B8030W from "./routes/AC_B8030W";
import BA_A0020W from "./routes/BA_A0020W";
import BA_A0040W from "./routes/BA_A0040W";
import BA_A0050W from "./routes/BA_A0050W";
import BA_A0080W from "./routes/BA_A0080W";
import MA_A0010W from "./routes/MA_A0010W";
import MA_A2000W from "./routes/MA_A2000W";
import MA_A2300W from "./routes/MA_A2300W";
import MA_A2400W from "./routes/MA_A2400W";
import MA_A2500W from "./routes/MA_A2500W";
import MA_A2700W from "./routes/MA_A2700W";
import MA_A7000W from "./routes/MA_A7000W";
import MA_B2800W from "./routes/MA_B2800W";
import MA_A3300W from "./routes/MA_A3300W";
import MA_A3400W from "./routes/MA_A3400W";
import MA_A3500W from "./routes/MA_A3500W";
import MA_B2000W from "./routes/MA_B2000W";
import MA_B2100W from "./routes/MA_B2100W";
import MA_B3000W from "./routes/MA_B3000W";
import MA_B3100W from "./routes/MA_B3100W";
import MA_B7000W from "./routes/MA_B7000W";
import MA_B7200W from "./routes/MA_B7200W";
import MA_B7201W from "./routes/MA_B7201W";
import SA_A2000W from "./routes/SA_A2000W";
import SA_A2010W from "./routes/SA_A2010W";
import SA_A2300W from "./routes/SA_A2300W";
import SA_A3000W from "./routes/SA_A3000W";
import SA_A5000W from "./routes/SA_A5000W";
import SA_A5010W from "./routes/SA_A5010W";
import SA_B2205W from "./routes/SA_B2205W";
import SA_B2211W from "./routes/SA_B2211W";
import SA_B2221W from "./routes/SA_B2221W";
import SA_B2410W from "./routes/SA_B2410W";
import SA_B2410_290W from "./routes/SA_B2410_290W";
import SA_B3000W from "./routes/SA_B3000W";
import SA_B3100W from "./routes/SA_B3100W";
import QC_A0060W from "./routes/QC_A0060W";
import QC_A0120W from "./routes/QC_A0120W";
import QC_A2000W from "./routes/QC_A2000W";
import QC_A2500W from "./routes/QC_A2500W";
import QC_A3000W from "./routes/QC_A3000W";
import QC_A6000W from "./routes/QC_A6000W";
import SY_A0120W from "./routes/SY_A0120W";
import SY_A0110W from "./routes/SY_A0110W";
import SY_A0010W from "./routes/SY_A0010W";
import SY_A0012W from "./routes/SY_A0012W";
import SY_A0013W from "./routes/SY_A0013W";
import SY_A0125W from "./routes/SY_A0125W";
import SY_A0011W from "./routes/SY_A0011W";
import CM_A1600W from "./routes/CM_A1600W";
import CM_A1710W from "./routes/CM_A1710W";
import EA_A1000W from "./routes/EA_A1000W";
import EA_A2000W from "./routes/EA_A2000W";
import PR_A0060W from "./routes/PR_A0060W";
import PR_A1100W from "./routes/PR_A1100W";
import PR_A5000W from "./routes/PR_A5000W";
import PR_A6000W from "./routes/PR_A6000W";
import PR_A9100W from "./routes/PR_A9100W";
import PR_B3000W from "./routes/PR_B3000W";
import PR_A3000W from "./routes/PR_A3000W";
import CT_A0111W from "./routes/CT_A0111W";
import CM_A0000W from "./routes/CM_A0000W";
import CM_A4100W from "./routes/CM_A4100W";
import CM_B1101W from "./routes/CM_B1101W";
import HU_A2070W from "./routes/HU_A2070W";
import HU_A2100W from "./routes/HU_A2100W";
import HU_A3020W from "./routes/HU_A3020W";
import HU_A4100W from "./routes/HU_A4100W";
import HU_A5020W from "./routes/HU_A5020W";
import HU_B2100W from "./routes/HU_B2100W";
import HU_B3140W from "./routes/HU_B3140W";
import HU_B3160W from "./routes/HU_B3160W";
import TO_B0011W from "./routes/TO_B0011W";
import CHAT_A0001W from "./routes/CHAT_A0001W";
import CHAT_A0002W from "./routes/CHAT_A0002W";
import CHAT_TEST_TRAVEL_BOT from "./routes/CHAT_TEST_TRAVEL_BOT";
import WORD_EDITOR from "./routes/WORD_EDITOR";
import GANTT from "./routes/GANTT";
import SY_A0100W from "./routes/SY_A0100W";
import { isMobileMenuOpendState, loginResultState } from "./store/atoms";
import {
  IntlProvider,
  LocalizationProvider,
  load,
} from "@progress/kendo-react-intl";

import likelySubtags from "cldr-core/supplemental/likelySubtags.json";
import currencyData from "cldr-core/supplemental/currencyData.json";
import weekData from "cldr-core/supplemental/weekData.json";

import numbersKo from "cldr-numbers-full/main/ko/numbers.json";
import caGregorianKo from "cldr-dates-full/main/ko/ca-gregorian.json";
import dateFieldsKo from "cldr-dates-full/main/ko/dateFields.json";
import timeZoneNamesKo from "cldr-dates-full/main/ko/timeZoneNames.json";

import numbersEn from "cldr-numbers-full/main/en/numbers.json";
import caGregorianEn from "cldr-dates-full/main/en/ca-gregorian.json";
import dateFieldsEn from "cldr-dates-full/main/en/dateFields.json";
import timeZoneNamesEn from "cldr-dates-full/main/en/timeZoneNames.json";

import numbersJa from "cldr-numbers-full/main/ja/numbers.json";
import caGregorianJa from "cldr-dates-full/main/ja/ca-gregorian.json";
import dateFieldsJa from "cldr-dates-full/main/ja/dateFields.json";
import timeZoneNamesJa from "cldr-dates-full/main/ja/timeZoneNames.json";

import numbersZh from "cldr-numbers-full/main/zh/numbers.json";
import caGregorianZh from "cldr-dates-full/main/zh/ca-gregorian.json";
import dateFieldsZh from "cldr-dates-full/main/zh/dateFields.json";
import timeZoneNamesZh from "cldr-dates-full/main/zh/timeZoneNames.json";

import { DEFAULT_LANG_CODE } from "./components/CommonString";

load(
  likelySubtags,
  currencyData,
  weekData,
  numbersKo,
  caGregorianKo,
  dateFieldsKo,
  timeZoneNamesKo,
  numbersEn,
  caGregorianEn,
  dateFieldsEn,
  timeZoneNamesEn,
  numbersJa,
  caGregorianJa,
  dateFieldsJa,
  timeZoneNamesJa,
  numbersZh,
  caGregorianZh,
  dateFieldsZh,
  timeZoneNamesZh
);

type TGlobalStyle = {
  isMobileMenuOpend: boolean;
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
  overflow: ${(props) => (props.isMobileMenuOpend ? "hidden" : "auto")};
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

.k-window{
  z-index: 10100 !important; /* 버그 : 메뉴바가 window 위로 올라오는 현상 수정  */
}

ul.required,
ul.required:hover,
ul.required.k-hover,
span.required,
span.required:hover,
span.required.k-hover,
input.required,
input.required:hover,
input.required.k-hover {
  background-color: #fff0ef;
}
ul.readonly,
span.readonly,
input.readonly {
  background-color: #efefef;
}
.k-radio-label{
  font-size:14px;
  line-height: 1.4285714286; 
}

// 그리드 행높이 조절 
.k-grid tbody tr,
.k-grid tbody tr td,
.k-grid td.k-state-selected, 
.k-grid td.k-selected, 
.k-grid tr.k-state-selected > td, 
.k-grid tr.k-selected > td{
  height: 34px;
  padding-top: 0;
  padding-bottom: 0;
}

.k-tabstrip > .k-content.k-active,
.k-tabstrip > .k-content.k-active > div.k-animation-container{
  width: inherit;
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
  const isMobileMenuOpend = useRecoilValue(isMobileMenuOpendState);
  const loginResult = useRecoilValue(loginResultState);

  return (
    <>
      <LocalizationProvider
        language={
          loginResult && loginResult.langCode
            ? loginResult.langCode.slice(0, 2)
            : DEFAULT_LANG_CODE.code
        }
      >
        <IntlProvider
          locale={
            loginResult && loginResult.langCode
              ? loginResult.langCode.slice(0, 2)
              : DEFAULT_LANG_CODE.code
          }
        >
          <GlobalStyle isMobileMenuOpend={isMobileMenuOpend} />
          <Router>
            <Switch>
              <Route path="/" component={Login} exact />
              <PanelBarNavContainer>
                {/* 메인 홈 */}
                <AuthRoute path="/Home" component={Main} exact />
                {/* 기준정보 */}
                <AuthRoute path="/BA_A0020W" component={BA_A0020W} exact />
                <AuthRoute path="/BA_A0040W" component={BA_A0040W} exact />
                <AuthRoute path="/BA_A0050W" component={BA_A0050W} exact />
                <AuthRoute path="/BA_A0080W" component={BA_A0080W} exact />
                <AuthRoute path="/SY_A0125W" component={SY_A0125W} exact />
                {/* 물류관리 */}
                <AuthRoute path="/MA_A0010W" component={MA_A0010W} exact />
                <AuthRoute path="/MA_A2000W" component={MA_A2000W} exact />
                <AuthRoute path="/MA_A2300W" component={MA_A2300W} exact />
                <AuthRoute path="/MA_A2400W" component={MA_A2400W} exact />
                <AuthRoute path="/MA_A2500W" component={MA_A2500W} exact />
                <AuthRoute path="/MA_A2700W" component={MA_A2700W} exact />
                <AuthRoute path="/MA_A7000W" component={MA_A7000W} exact />
                <AuthRoute path="/MA_B2800W" component={MA_B2800W} exact />
                <AuthRoute path="/MA_A3300W" component={MA_A3300W} exact />
                <AuthRoute path="/MA_A3400W" component={MA_A3400W} exact />
                <AuthRoute path="/MA_A3500W" component={MA_A3500W} exact />
                <AuthRoute path="/MA_B2000W" component={MA_B2000W} exact />
                <AuthRoute path="/MA_B2100W" component={MA_B2100W} exact />
                <AuthRoute path="/MA_B3000W" component={MA_B3000W} exact />
                <AuthRoute path="/MA_B3100W" component={MA_B3100W} exact />
                <AuthRoute path="/MA_B7000W" component={MA_B7000W} exact />
                <AuthRoute path="/MA_B7200W" component={MA_B7200W} exact />
                <AuthRoute path="/MA_B7201W" component={MA_B7201W} exact />
                {/* 영업관리 */}
                <AuthRoute path="/SA_A2000W" component={SA_A2000W} exact />
                <AuthRoute path="/SA_A2010W" component={SA_A2010W} exact />
                <AuthRoute path="/SA_A2300W" component={SA_A2300W} exact />
                <AuthRoute path="/SA_A3000W" component={SA_A3000W} exact />
                <AuthRoute path="/SA_A5000W" component={SA_A5000W} exact />
                <AuthRoute path="/SA_A5010W" component={SA_A5010W} exact />
                <AuthRoute path="/SA_B2205W" component={SA_B2205W} exact />
                <AuthRoute path="/SA_B2211W" component={SA_B2211W} exact />
                <AuthRoute path="/SA_B2221W" component={SA_B2221W} exact />
                <AuthRoute path="/SA_B2410W" component={SA_B2410W} exact />
                <AuthRoute
                  path="/SA_B2410_290W"
                  component={SA_B2410_290W}
                  exact
                />
                <AuthRoute path="/SA_B3000W" component={SA_B3000W} exact />
                <AuthRoute path="/SA_B3100W" component={SA_B3100W} exact />
                {/* 생산관리 */}
                <AuthRoute path="/PR_A0060W" component={PR_A0060W} exact />
                <AuthRoute path="/PR_A5000W" component={PR_A5000W} exact />
                <AuthRoute path="/PR_A1100W" component={PR_A1100W} exact />
                <AuthRoute path="/PR_A9100W" component={PR_A9100W} exact />
                <AuthRoute path="/PR_B3000W" component={PR_B3000W} exact />
                <AuthRoute path="/PR_A3000W" component={PR_A3000W} exact />
                <AuthRoute path="/PR_A6000W" component={PR_A6000W} exact />
                {/* 품질관리 */}
                <AuthRoute path="/QC_A0060W" component={QC_A0060W} exact />
                <AuthRoute path="/QC_A0120W" component={QC_A0120W} exact />
                <AuthRoute path="/QC_A2000W" component={QC_A2000W} exact />
                <AuthRoute path="/QC_A2500W" component={QC_A2500W} exact />
                <AuthRoute path="/QC_A3000W" component={QC_A3000W} exact />
                <AuthRoute path="/QC_A6000W" component={QC_A6000W} exact />
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
                <AuthRoute path="/CM_A1710W" component={CM_A1710W} exact />
                <AuthRoute path="/CM_A4100W" component={CM_A4100W} exact />
                <AuthRoute path="/CM_B1101W" component={CM_B1101W} exact />
                {/* 전자결재 */}
                <AuthRoute path="/EA_A1000W" component={EA_A1000W} exact />
                <AuthRoute path="/EA_A2000W" component={EA_A2000W} exact />
                {/* 원가관리 */}
                <AuthRoute path="/CT_A0111W" component={CT_A0111W} exact />
                {/* 인사관리 */}
                <AuthRoute path="/HU_A2070W" component={HU_A2070W} exact />
                <AuthRoute path="/HU_A2100W" component={HU_A2100W} exact />
                <AuthRoute path="/HU_A3020W" component={HU_A3020W} exact />
                <AuthRoute path="/HU_A4100W" component={HU_A4100W} exact />
                <AuthRoute path="/HU_A5020W" component={HU_A5020W} exact />
                <AuthRoute path="/HU_B2100W" component={HU_B2100W} exact />
                <AuthRoute path="/HU_B3140W" component={HU_B3140W} exact />
                <AuthRoute path="/HU_B3160W" component={HU_B3160W} exact />
                {/* 회계관리 */}
                <AuthRoute path="/AC_B1100W" component={AC_B1100W} exact />
                <AuthRoute path="/AC_B1280W" component={AC_B1280W} exact />
                <AuthRoute path="/AC_B1300W" component={AC_B1300W} exact />  
                <AuthRoute path="/AC_B5000W" component={AC_B5000W} exact />  
                <AuthRoute path="/AC_B8030W" component={AC_B8030W} exact /> 
                {/* 목형관리 */}
                <AuthRoute path="/TO_B0011W" component={TO_B0011W} exact /> 
                {/* CHAT BOT */}
                <AuthRoute path="/CHAT_A0001W" component={CHAT_A0001W} exact />
                <AuthRoute path="/CHAT_A0002W" component={CHAT_A0002W} exact />
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
        </IntlProvider>
      </LocalizationProvider>
    </>
  );
  //}
};
export default App;
