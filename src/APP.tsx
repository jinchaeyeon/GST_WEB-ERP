import { createTheme } from "@mui/material";
import {
  IntlProvider,
  LocalizationProvider,
  load,
} from "@progress/kendo-react-intl";
import axios from "axios";
import currencyData from "cldr-core/supplemental/currencyData.json";
import likelySubtags from "cldr-core/supplemental/likelySubtags.json";
import weekData from "cldr-core/supplemental/weekData.json";
import caGregorianEn from "cldr-dates-full/main/en/ca-gregorian.json";
import dateFieldsEn from "cldr-dates-full/main/en/dateFields.json";
import timeZoneNamesEn from "cldr-dates-full/main/en/timeZoneNames.json";
import caGregorianJa from "cldr-dates-full/main/ja/ca-gregorian.json";
import dateFieldsJa from "cldr-dates-full/main/ja/dateFields.json";
import timeZoneNamesJa from "cldr-dates-full/main/ja/timeZoneNames.json";
import caGregorianKo from "cldr-dates-full/main/ko/ca-gregorian.json";
import dateFieldsKo from "cldr-dates-full/main/ko/dateFields.json";
import timeZoneNamesKo from "cldr-dates-full/main/ko/timeZoneNames.json";
import caGregorianZh from "cldr-dates-full/main/zh/ca-gregorian.json";
import dateFieldsZh from "cldr-dates-full/main/zh/dateFields.json";
import timeZoneNamesZh from "cldr-dates-full/main/zh/timeZoneNames.json";
import numbersEn from "cldr-numbers-full/main/en/numbers.json";
import numbersJa from "cldr-numbers-full/main/ja/numbers.json";
import numbersKo from "cldr-numbers-full/main/ko/numbers.json";
import numbersZh from "cldr-numbers-full/main/zh/numbers.json";
import React, { Suspense, lazy, useEffect, useState } from "react";
import { useThemeSwitcher } from "react-css-theme-switcher";
import { ErrorBoundary } from "react-error-boundary";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";
import { RecoilRoot, useRecoilState, useRecoilValue } from "recoil";
import styled, { createGlobalStyle } from "styled-components";
import AuthRoute from "./components/AuthRoute";
import {
  UseGetIp,
  UseGetValueFromSessionItem,
  UseParaPc,
} from "./components/CommonFunction";
import { DEFAULT_LANG_CODE } from "./components/CommonString";
import { default as PanelBarNavContainer } from "./components/Containers/PanelBarNavContainer";
import Loader from "./components/Loader";
import { useApi } from "./hooks/api";
import Login from "./routes/Login";
import LoginCRM from "./routes/LoginCRM";
import LoginFNF from "./routes/LoginFNF";
import LoginOLED from "./routes/LoginOLED";
import NotFound from "./routes/NotFound";
import {
  OSState,
  colors,
  isMobileMenuOpendState,
  linkState,
  loginResultState,
  sessionItemState,
} from "./store/atoms";
import { Iparameters } from "./store/types";
const AC_A0000W = lazy(() => import("./routes/AC_A0000W"));
const AC_A0020W = lazy(() => import("./routes/AC_A0020W"));
const AC_A0030W = lazy(() => import("./routes/AC_A0030W"));
const AC_A0050W = lazy(() => import("./routes/AC_A0050W"));
const AC_A0070W = lazy(() => import("./routes/AC_A0070W"));
const AC_A0090W = lazy(() => import("./routes/AC_A0090W"));
const AC_A1000W = lazy(() => import("./routes/AC_A1000W"));
const AC_A1010W = lazy(() => import("./routes/AC_A1010W"));
const AC_A1020W = lazy(() => import("./routes/AC_A1020W"));
const AC_A1040W = lazy(() => import("./routes/AC_A1040W"));
const AC_A1060W = lazy(() => import("./routes/AC_A1060W"));
const AC_A1070W = lazy(() => import("./routes/AC_A1070W"));
const AC_A1080W = lazy(() => import("./routes/AC_A1080W"));
const AC_A1100W = lazy(() => import("./routes/AC_A1100W"));
const AC_A1120W = lazy(() => import("./routes/AC_A1120W"));
const AC_A3000W = lazy(() => import("./routes/AC_A3000W"));
const AC_A3001W = lazy(() => import("./routes/AC_A3001W"));
const AC_A3100W = lazy(() => import("./routes/AC_A3100W"));
const AC_A5020W = lazy(() => import("./routes/AC_A5020W"));
const AC_A6000W = lazy(() => import("./routes/AC_A6000W"));
const AC_A9000W = lazy(() => import("./routes/AC_A9000W"));
const AC_B1100W = lazy(() => import("./routes/AC_B1100W"));
const AC_B1240W = lazy(() => import("./routes/AC_B1240W"));
const AC_B1260W = lazy(() => import("./routes/AC_B1260W"));
const AC_B1280W = lazy(() => import("./routes/AC_B1280W"));
const AC_B1300W = lazy(() => import("./routes/AC_B1300W"));
const AC_B1340W = lazy(() => import("./routes/AC_B1340W"));
const AC_B2000W = lazy(() => import("./routes/AC_B2000W"));
const AC_B2080W = lazy(() => import("./routes/AC_B2080W"));
const AC_B3000W = lazy(() => import("./routes/AC_B3000W"));
const AC_B5000W = lazy(() => import("./routes/AC_B5000W"));
const AC_B5040W = lazy(() => import("./routes/AC_B5040W"));
const AC_B5060W = lazy(() => import("./routes/AC_B5060W"));
const AC_B5080W = lazy(() => import("./routes/AC_B5080W"));
const AC_B6020W = lazy(() => import("./routes/AC_B6020W"));
const AC_B6040W = lazy(() => import("./routes/AC_B6040W"));
const AC_B6060W = lazy(() => import("./routes/AC_B6060W"));
const AC_B6080W = lazy(() => import("./routes/AC_B6080W"));
const AC_B6080W_628 = lazy(() => import("./routes/AC_B6080W_628"));
const AC_B8000W = lazy(() => import("./routes/AC_B8000W"));
const AC_B8030W = lazy(() => import("./routes/AC_B8030W"));
const AC_B8040W = lazy(() => import("./routes/AC_B8040W"));
const AC_B8080W = lazy(() => import("./routes/AC_B8080W"));
const AC_B8100W = lazy(() => import("./routes/AC_B8100W"));
const BA_A0020W = lazy(() => import("./routes/BA_A0020W"));
const BA_A0020W_603 = lazy(() => import("./routes/BA_A0020W_603"));
const BA_A0021W_603 = lazy(() => import("./routes/BA_A0021W_603"));
const BA_A0025W = lazy(() => import("./routes/BA_A0025W"));
const BA_A0040W = lazy(() => import("./routes/BA_A0040W"));
const BA_A0041W = lazy(() => import("./routes/BA_A0041W"));
const BA_A0044W = lazy(() => import("./routes/BA_A0044W"));
const BA_A0050W = lazy(() => import("./routes/BA_A0050W"));
const BA_A0060W = lazy(() => import("./routes/BA_A0060W"));
const BA_A0070W = lazy(() => import("./routes/BA_A0070W"));
const BA_A0080W = lazy(() => import("./routes/BA_A0080W"));
const BA_A0086W = lazy(() => import("./routes/BA_A0086W"));
const BA_A0100W = lazy(() => import("./routes/BA_A0100W"));
const BA_A0200W = lazy(() => import("./routes/BA_A0200W"));
const BA_A0500W = lazy(() => import("./routes/BA_A0500W"));
const BA_B0080W = lazy(() => import("./routes/BA_B0080W"));
const CHAT_A0001W = lazy(() => import("./routes/CHAT_A0001W"));
const CHAT_A0002W = lazy(() => import("./routes/CHAT_A0002W"));
const CM_A0000W = lazy(() => import("./routes/CM_A0000W"));
const CM_A1000W = lazy(() => import("./routes/CM_A1000W"));
const CM_A1000W_617 = lazy(() => import("./routes/CM_A1000W_617"));
const CM_A1600W = lazy(() => import("./routes/CM_A1600W"));
const CM_A1600W_603 = lazy(() => import("./routes/CM_A1600W_603"));
const CM_A1610W = lazy(() => import("./routes/CM_A1610W"));
const CM_A1710W = lazy(() => import("./routes/CM_A1710W"));
const CM_A2000W = lazy(() => import("./routes/CM_A2000W"));
const CM_A3000W = lazy(() => import("./routes/CM_A3000W"));
const CM_A3100W = lazy(() => import("./routes/CM_A3100W"));
const CM_A3220W = lazy(() => import("./routes/CM_A3220W"));
const CM_A4100W = lazy(() => import("./routes/CM_A4100W"));
const CM_A5000W = lazy(() => import("./routes/CM_A5000W"));
const CM_A7000W = lazy(() => import("./routes/CM_A7000W"));
const CM_A7010W = lazy(() => import("./routes/CM_A7010W"));
const CM_A8000W = lazy(() => import("./routes/CM_A8000W"));
const CM_A8210W = lazy(() => import("./routes/CM_A8210W"));
const CM_A8250W = lazy(() => import("./routes/CM_A8250W"));
const CM_B1000W = lazy(() => import("./routes/CM_B1000W"));
const CM_B1101W = lazy(() => import("./routes/CM_B1101W"));
const CM_B1104W = lazy(() => import("./routes/CM_B1104W"));
const CM_B1105W = lazy(() => import("./routes/CM_B1105W"));
const CM_B8100W = lazy(() => import("./routes/CM_B8100W"));
const CR_A0000W = lazy(() => import("./routes/CR_A0000W"));
const CR_A0010W = lazy(() => import("./routes/CR_A0010W"));
const CR_A0020W = lazy(() => import("./routes/CR_A0020W"));
const CR_A0040W = lazy(() => import("./routes/CR_A0040W"));
const CR_A1000W = lazy(() => import("./routes/CR_A1000W"));
const CR_A1001W = lazy(() => import("./routes/CR_A1001W"));
const CR_A1010W = lazy(() => import("./routes/CR_A1010W"));
const CR_A1020W = lazy(() => import("./routes/CR_A1020W"));
const CR_A1030W = lazy(() => import("./routes/CR_A1030W"));
const CR_A1040W = lazy(() => import("./routes/CR_A1040W"));
const CR_A1100W = lazy(() => import("./routes/CR_A1100W"));
const CR_A1101W = lazy(() => import("./routes/CR_A1101W"));
const CR_B1000W = lazy(() => import("./routes/CR_B1000W"));
const CT_A0111W = lazy(() => import("./routes/CT_A0111W"));
const CT_B0010W = lazy(() => import("./routes/CT_B0010W"));
const EA_A1000W = lazy(() => import("./routes/EA_A1000W"));
const EA_A2000W = lazy(() => import("./routes/EA_A2000W"));
const EA_A3000W = lazy(() => import("./routes/EA_A3000W"));
const HU_A1000W = lazy(() => import("./routes/HU_A1000W"));
const HU_A1060W = lazy(() => import("./routes/HU_A1060W"));
const HU_A2000W = lazy(() => import("./routes/HU_A2000W"));
const HU_A2040W = lazy(() => import("./routes/HU_A2040W"));
const HU_A2070W = lazy(() => import("./routes/HU_A2070W"));
const HU_A2100W = lazy(() => import("./routes/HU_A2100W"));
const HU_A2140W = lazy(() => import("./routes/HU_A2140W"));
const HU_A3020W = lazy(() => import("./routes/HU_A3020W"));
const HU_A3040W = lazy(() => import("./routes/HU_A3040W"));
const HU_A3060W = lazy(() => import("./routes/HU_A3060W"));
const HU_A3080W = lazy(() => import("./routes/HU_A3080W"));
const HU_A3200W = lazy(() => import("./routes/HU_A3200W"));
const HU_A4000W = lazy(() => import("./routes/HU_A4000W"));
const HU_A4100W = lazy(() => import("./routes/HU_A4100W"));
const HU_A4110W = lazy(() => import("./routes/HU_A4110W"));
const HU_A5020W = lazy(() => import("./routes/HU_A5020W"));
const HU_A6000W = lazy(() => import("./routes/HU_A6000W"));
const HU_A6020W = lazy(() => import("./routes/HU_A6020W"));
const HU_B1020W = lazy(() => import("./routes/HU_B1020W"));
const HU_B1040W = lazy(() => import("./routes/HU_B1040W"));
const HU_B2100W = lazy(() => import("./routes/HU_B2100W"));
const HU_B2120W = lazy(() => import("./routes/HU_B2120W"));
const HU_B2140W = lazy(() => import("./routes/HU_B2140W"));
const HU_B3120W = lazy(() => import("./routes/HU_B3120W"));
const HU_B3140W = lazy(() => import("./routes/HU_B3140W"));
const HU_B3160W = lazy(() => import("./routes/HU_B3160W"));
const HU_B3180W = lazy(() => import("./routes/HU_B3180W"));
const HU_B3220W = lazy(() => import("./routes/HU_B3220W"));
const HU_B4000W = lazy(() => import("./routes/HU_B4000W"));
const HU_B4001W = lazy(() => import("./routes/HU_B4001W"));
const HU_B4010W = lazy(() => import("./routes/HU_B4010W"));
const MA_A0010W = lazy(() => import("./routes/MA_A0010W"));
const MA_A1000W = lazy(() => import("./routes/MA_A1000W"));
const MA_A2000W = lazy(() => import("./routes/MA_A2000W"));
const MA_A2020W_628 = lazy(() => import("./routes/MA_A2020W_628"));
const MA_A2300W = lazy(() => import("./routes/MA_A2300W"));
const MA_A2300W_615 = lazy(() => import("./routes/MA_A2300W_615"));
const MA_A2310W_606 = lazy(() => import("./routes/MA_A2310W_606"));
const MA_A2400W = lazy(() => import("./routes/MA_A2400W"));
const MA_A2410W = lazy(() => import("./routes/MA_A2410W"));
const MA_A2500W = lazy(() => import("./routes/MA_A2500W"));
const MA_A2700W = lazy(() => import("./routes/MA_A2700W"));
const MA_A3000W = lazy(() => import("./routes/MA_A3000W"));
const MA_A3300W = lazy(() => import("./routes/MA_A3300W"));
const MA_A3400W = lazy(() => import("./routes/MA_A3400W"));
const MA_A3400W_606 = lazy(() => import("./routes/MA_A3400W_606"));
const MA_A3500W = lazy(() => import("./routes/MA_A3500W"));
const MA_A3500W_615 = lazy(() => import("./routes/MA_A3500W_615"));
const MA_A3600W = lazy(() => import("./routes/MA_A3600W"));
const MA_A7000W = lazy(() => import("./routes/MA_A7000W"));
const MA_A8000W = lazy(() => import("./routes/MA_A8000W"));
const MA_A9001W = lazy(() => import("./routes/MA_A9001W"));
const MA_B2000W = lazy(() => import("./routes/MA_B2000W"));
const MA_B2020W_628 = lazy(() => import("./routes/MA_B2020W_628"));
const MA_B2100W = lazy(() => import("./routes/MA_B2100W"));
const MA_B2101W = lazy(() => import("./routes/MA_B2101W"));
const MA_B2500W = lazy(() => import("./routes/MA_B2500W"));
const MA_B2500W_628 = lazy(() => import("./routes/MA_B2500W_628"));
const MA_B2700W = lazy(() => import("./routes/MA_B2700W"));
const MA_B2800W = lazy(() => import("./routes/MA_B2800W"));
const MA_B3000W = lazy(() => import("./routes/MA_B3000W"));
const MA_B3100W = lazy(() => import("./routes/MA_B3100W"));
const MA_B7000W = lazy(() => import("./routes/MA_B7000W"));
const MA_B7000W_606 = lazy(() => import("./routes/MA_B7000W_606"));
const MA_B7200W = lazy(() => import("./routes/MA_B7200W"));
const MA_B7201W = lazy(() => import("./routes/MA_B7201W"));
const MA_B7300W = lazy(() => import("./routes/MA_B7300W"));
const MA_B8000W = lazy(() => import("./routes/MA_B8000W"));
const PR_A0030W = lazy(() => import("./routes/PR_A0030W"));
const PR_A0040W = lazy(() => import("./routes/PR_A0040W"));
const PR_A0060W = lazy(() => import("./routes/PR_A0060W"));
const PR_A1100W = lazy(() => import("./routes/PR_A1100W"));
const PR_A2000W = lazy(() => import("./routes/PR_A2000W"));
const PR_A2200W = lazy(() => import("./routes/PR_A2200W"));
const PR_A3000W = lazy(() => import("./routes/PR_A3000W"));
const PR_A4000W = lazy(() => import("./routes/PR_A4000W"));
const PR_A4100W = lazy(() => import("./routes/PR_A4100W"));
const PR_A5000W = lazy(() => import("./routes/PR_A5000W"));
const PR_A6000W = lazy(() => import("./routes/PR_A6000W"));
const PR_A7000W = lazy(() => import("./routes/PR_A7000W"));
const PR_A9000W = lazy(() => import("./routes/PR_A9000W"));
const PR_A9100W = lazy(() => import("./routes/PR_A9100W"));
const PR_B0020W = lazy(() => import("./routes/PR_B0020W"));
const PR_B0020W_628 = lazy(() => import("./routes/PR_B0020W_628"));
const PR_B1103W = lazy(() => import("./routes/PR_B1103W"));
const PR_B1104W = lazy(() => import("./routes/PR_B1104W"));
const PR_B1500W = lazy(() => import("./routes/PR_B1500W"));
const PR_B3000W = lazy(() => import("./routes/PR_B3000W"));
const PS_A0060W_301 = lazy(() => import("./routes/PS_A0060W_301"));
const QC_A0060W = lazy(() => import("./routes/QC_A0060W"));
const QC_A0120W = lazy(() => import("./routes/QC_A0120W"));
const QC_A2000W = lazy(() => import("./routes/QC_A2000W"));
const QC_A2010W = lazy(() => import("./routes/QC_A2010W"));
const QC_A2500W = lazy(() => import("./routes/QC_A2500W"));
const QC_A2500W_603 = lazy(() => import("./routes/QC_A2500W_603"));
const QC_A3000W = lazy(() => import("./routes/QC_A3000W"));
const QC_A3400W = lazy(() => import("./routes/QC_A3400W"));
const QC_A6000W = lazy(() => import("./routes/QC_A6000W"));
const QC_A6010W = lazy(() => import("./routes/QC_A6010W"));
const QC_A6050W = lazy(() => import("./routes/QC_A6050W"));
const QC_B0020W = lazy(() => import("./routes/QC_B0020W"));
const QC_B0030W = lazy(() => import("./routes/QC_B0030W"));
const QC_B0040W = lazy(() => import("./routes/QC_B0040W"));
const QC_B0100W = lazy(() => import("./routes/QC_B0100W"));
const QC_B0200W = lazy(() => import("./routes/QC_B0200W"));
const QC_B0300W = lazy(() => import("./routes/QC_B0300W"));
const QC_B9020W_615 = lazy(() => import("./routes/QC_B9020W_615"));
const SA_A1000W_603 = lazy(() => import("./routes/SA_A1000W_603"));
const SA_A1001W_603 = lazy(() => import("./routes/SA_A1001W_603"));
const SA_A1100W_603 = lazy(() => import("./routes/SA_A1100W_603"));
const SA_A1200W_603 = lazy(() => import("./routes/SA_A1200W_603"));
const SA_A2000W = lazy(() => import("./routes/SA_A2000W"));
const SA_A2010W = lazy(() => import("./routes/SA_A2010W"));
const SA_A2100W = lazy(() => import("./routes/SA_A2100W"));
const SA_A2300W = lazy(() => import("./routes/SA_A2300W"));
const SA_A2300W_PDA = lazy(() => import("./routes/SA_A2300W_PDA"));
const SA_A3000W = lazy(() => import("./routes/SA_A3000W"));
const SA_A5000W = lazy(() => import("./routes/SA_A5000W"));
const SA_A5000W_615 = lazy(() => import("./routes/SA_A5000W_615"));
const SA_A5001W = lazy(() => import("./routes/SA_A5001W"));
const SA_A5010W = lazy(() => import("./routes/SA_A5010W"));
const SA_A6000W = lazy(() => import("./routes/SA_A6000W"));
const SA_A7900W = lazy(() => import("./routes/SA_A7900W"));
const SA_A8000W = lazy(() => import("./routes/SA_A8000W"));
const SA_A9001W = lazy(() => import("./routes/SA_A9001W"));
const SA_B1002W_603 = lazy(() => import("./routes/SA_B1002W_603"));
const SA_B1101W_603 = lazy(() => import("./routes/SA_B1101W_603"));
const SA_B2200W = lazy(() => import("./routes/SA_B2200W"));
const SA_B2200W_603 = lazy(() => import("./routes/SA_B2200W_603"));
const SA_B2201W_603 = lazy(() => import("./routes/SA_B2201W_603"));
const SA_B2211W = lazy(() => import("./routes/SA_B2211W"));
const SA_B2211W_603 = lazy(() => import("./routes/SA_B2211W_603"));
const SA_B2216W = lazy(() => import("./routes/SA_B2216W"));
const SA_B2220W = lazy(() => import("./routes/SA_B2220W"));
const SA_B2221W = lazy(() => import("./routes/SA_B2221W"));
const SA_B2221W_603 = lazy(() => import("./routes/SA_B2221W_603"));
const SA_B2226W = lazy(() => import("./routes/SA_B2226W"));
const SA_B2227W = lazy(() => import("./routes/SA_B2227W"));
const SA_B2410W = lazy(() => import("./routes/SA_B2410W"));
const SA_B2410W_290 = lazy(() => import("./routes/SA_B2410W_290"));
const SA_B2411W = lazy(() => import("./routes/SA_B2411W"));
const SA_B3000W = lazy(() => import("./routes/SA_B3000W"));
const SA_B3100W = lazy(() => import("./routes/SA_B3100W"));
const SA_B3101W = lazy(() => import("./routes/SA_B3101W"));
const SA_B3600W = lazy(() => import("./routes/SA_B3600W"));
const SA_B7000W = lazy(() => import("./routes/SA_B7000W"));
const SY_A0009W = lazy(() => import("./routes/SY_A0009W"));
const SY_A0010W = lazy(() => import("./routes/SY_A0010W"));
const SY_A0010W_301 = lazy(() => import("./routes/SY_A0010W_301"));
const SY_A0011W = lazy(() => import("./routes/SY_A0011W"));
const SY_A0012W = lazy(() => import("./routes/SY_A0012W"));
const SY_A0013W = lazy(() => import("./routes/SY_A0013W"));
const SY_A0020W = lazy(() => import("./routes/SY_A0020W"));
const SY_A0022W = lazy(() => import("./routes/SY_A0022W"));
const SY_A0025W = lazy(() => import("./routes/SY_A0025W"));
const SY_A0026W = lazy(() => import("./routes/SY_A0026W"));
const SY_A0060W = lazy(() => import("./routes/SY_A0060W"));
const SY_A0100W = lazy(() => import("./routes/SY_A0100W"));
const SY_A0110W = lazy(() => import("./routes/SY_A0110W"));
const SY_A0120W = lazy(() => import("./routes/SY_A0120W"));
const SY_A0125W = lazy(() => import("./routes/SY_A0125W"));
const SY_A0150W = lazy(() => import("./routes/SY_A0150W"));
const SY_A0430W = lazy(() => import("./routes/SY_A0430W"));
const SY_A0500W = lazy(() => import("./routes/SY_A0500W"));
const SY_B0001W = lazy(() => import("./routes/SY_B0001W"));
const SY_B0060W = lazy(() => import("./routes/SY_B0060W"));
const TO_B0011W = lazy(() => import("./routes/TO_B0011W"));
const Main = lazy(() => import("./routes/Main"));
const MainBIO = lazy(() => import("./routes/MainBIO"));
const MainNotApproval = lazy(() => import("./routes/MainNotApproval"));
const MainAdminCRM = lazy(() => import("./routes/MainAdminCRM"));
const MainFNF = lazy(() => import("./routes/MainFNF"));

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

// 전역 CSS
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

`;

const App: React.FC = () => {
  return (
    <RecoilRoot>
      <AppInner></AppInner>
    </RecoilRoot>
  );
};

const AppInner: React.FC = () => {
  const [loginResult] = useRecoilState(loginResultState);
  const role = loginResult ? loginResult.role : "";
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const [ip, setIp] = useState("");
  UseGetIp(setIp);
  const isAdmin = role == "ADMIN";
  const [color, setColor] = useRecoilState(colors);
  const [osstate, setOSState] = useRecoilState(OSState);
  const [themecolor, setThemeColor] = useState<string[]>([
    "#2196f3",
    "#1976d2",
    "#64b5f6",
    "#bbdefb",
  ]);
  const [Link, setLink] = useRecoilState(linkState);
  useEffect(() => {
    axios.get(`/apiserver.json`).then((res: any) => {
      setLink(res.data[0].url);
    });
  }, []);
  useEffect(() => {
    if (
      /SmartTV/i.test(navigator.userAgent) ||
      /SmartTV/i.test(navigator.platform)
    ) {
      setOSState(true);
    } else {
      setOSState(false);
    }
  }, [osstate]);

  useEffect(() => {
    setThemeColor(color);
  }, [color]);
  const [sessionItem, setSessionItem] = useRecoilState(sessionItemState);
  const token = localStorage.getItem("accessToken");
  const userId = loginResult ? loginResult.userId : "";
  const sessionUserId = UseGetValueFromSessionItem("user_id");
  useEffect(() => {
    if (token && userId != "" && (sessionUserId == "" || sessionUserId == null))
      fetchSessionItem();
  }, [userId, sessionUserId, token]);

  let sessionOrgdiv = sessionItem.find(
    (sessionItem) => sessionItem.code == "orgdiv"
  )!.value;
  let sessionLocation = sessionItem.find(
    (sessionItem) => sessionItem.code == "location"
  )!.value;

  if (sessionOrgdiv == "") sessionOrgdiv = "01";
  if (sessionLocation == "") sessionLocation = "01";
  const processApi = useApi();
  const fetchSessionItem = async () => {
    let data;
    try {
      const para: Iparameters = {
        procedureName: "sys_biz_configuration",
        pageNumber: 0,
        pageSize: 0,
        parameters: {
          "@p_user_id": userId,
        },
      };

      data = await processApi<any>("procedure", para);

      if (data.isSuccess == true) {
        const rows = data.tables[0].Rows;
        let array = rows
          .filter((item: any) => item.class == "Session")
          .map((item: any) => ({
            code: item.code,
            value: item.value,
          }))
          .concat([
            { code: "pc", value: pc },
            { code: "ip", value: ip },
            { code: "custcd", value: loginResult.custcd },
            { code: "custnm", value: loginResult.custnm },
          ]);
        setSessionItem(array);
      }
    } catch (e: any) {
      console.log("menus error", e);
    }
  };

  const theme = createTheme({
    palette: {
      primary: {
        main: `${color[0]}`,
        dark: `${color[1]}`,
        light: `${color[2]}`,
      },
      secondary: {
        main: `${color[3]}`,
      },
    },
  });

  const GlobalStyles = styled.div`
    @font-face {
      font-family: "TheJamsil5Bold";
      src: url("https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2302_01@1.0/TheJamsil5Bold.woff2")
        format("woff2");
      font-weight: 700;
      font-style: normal;
    }

    .p-button {
      background: ${theme.palette.primary.main};
      border: 1px solid ${theme.palette.primary.main};
      box-shadow: 0 0 0 0.2rem ${theme.palette.primary.main};
    }

    .p-button:hover {
      background: ${theme.palette.primary.dark};
      border: 1px solid ${theme.palette.primary.dark};
    }

    .p-inputtext:enabled:focus {
      border: 1px solid ${theme.palette.primary.main};
      box-shadow: 0 0 0 0.2rem ${theme.palette.primary.main};
    }

    .p-inputtext:enabled:hover {
      border: 1px solid ${theme.palette.primary.main};
      box-shadow: 0 0 0 0.2rem ${theme.palette.primary.main};
    }

    .p-dropdown:not(.p-disabled):hover,
    .p-dropdown:not(.p-disabled).p-focus {
      border: 1px solid ${theme.palette.primary.main};
      outline: 0.15rem solid ${theme.palette.primary.main};
      box-shadow: 0 0 0 0.2rem ${theme.palette.primary.main};
    }

    .p-datatable .p-datatable-tbody > tr.p-highlight {
      color: black;
      background-color: ${theme.palette.secondary.main};
    }

    .p-datatable.p-datatable-selectable
      .p-datatable-tbody
      > tr.p-selectable-row:focus {
      outline: 0.15rem solid ${theme.palette.primary.light};
    }

    .p-datatable .p-sortable-column.p-highlight {
      color: black;
      background-color: ${theme.palette.secondary.main};
    }

    .p-datatable
      .p-sortable-column.p-highlight:not(.p-sortable-disabled):hover {
      color: black;
      background-color: ${theme.palette.primary.light};
    }

    .p-datatable .p-sortable-column:focus {
      box-shadow: inset 0 0 0 0.15rem ${theme.palette.primary.light};
    }

    .p-datatable .p-sortable-column.p-highlight .p-sortable-column-icon,
    .p-datatable
      .p-sortable-column.p-highlight:not(.p-sortable-disabled):hover
      .p-sortable-column-icon {
      color: black;
    }

    .p-datatable.p-datatable-striped
      .p-datatable-tbody
      > tr.p-row-odd.p-highlight {
      color: black;
      background-color: ${theme.palette.secondary.main};
    }

    .p-paginator .p-paginator-pages .p-paginator-page.p-highlight {
      color: black;
      background-color: ${theme.palette.secondary.main};
      border-color: ${theme.palette.secondary.main};
    }

    .p-radiobutton .p-radiobutton-box.p-highlight {
      background-color: ${theme.palette.primary.main};
      border-color: ${theme.palette.primary.main};
    }
    .p-radiobutton .p-radiobutton-box.p-highlight:not(.p-disabled):hover {
      background-color: ${theme.palette.primary.dark};
      border-color: ${theme.palette.primary.dark};
    }
    .p-radiobutton .p-radiobutton-box:not(.p-disabled).p-focus {
      box-shadow: inset 0 0 0 0.15rem ${theme.palette.primary.light};
    }
    .p-radiobutton .p-radiobutton-box:not(.p-disabled):not(.p-highlight):hover {
      border-color: ${theme.palette.primary.main};
    }

    .p-progressbar .p-progressbar-value {
      background: ${theme.palette.primary.main};
    }
  `;

  const isMobileMenuOpend = useRecoilValue(isMobileMenuOpendState);
  const { switcher, themes, currentTheme = "" } = useThemeSwitcher();

  // useEffect(() => {
  //   switcher({ theme: "blue" });
  // }, []);

  function link(str: any) {
    if (str == "Home" || str == "" || str == undefined || str == null) {
      if (currentTheme == "yellow") {
        return MainAdminCRM;
      } else if (currentTheme == "navy") {
        return MainFNF;
      } else if (loginResult.companyCode == "2302BA03") {
        return MainBIO;
      } else if (
        loginResult.companyCode == "2301A110" ||
        loginResult.companyCode == "2207A046"
      ) {
        return Main;
      } else {
        return MainNotApproval;
      }
    } else if (str == "AC_A0000W") {
      return AC_A0000W;
    } else if (str == "AC_A0020W") {
      return AC_A0020W;
    } else if (str == "AC_A0030W") {
      return AC_A0030W;
    } else if (str == "AC_A0050W") {
      return AC_A0050W;
    } else if (str == "AC_A0070W") {
      return AC_A0070W;
    } else if (str == "AC_A0090W") {
      return AC_A0090W;
    } else if (str == "AC_A1000W") {
      return AC_A1000W;
    } else if (str == "AC_A1010W") {
      return AC_A1010W;
    } else if (str == "AC_A1020W") {
      return AC_A1020W;
    } else if (str == "AC_A1040W") {
      return AC_A1040W;
    } else if (str == "AC_A1060W") {
      return AC_A1060W;
    } else if (str == "AC_A1070W") {
      return AC_A1070W;
    } else if (str == "AC_A1080W") {
      return AC_A1080W;
    } else if (str == "AC_A1100W") {
      return AC_A1100W;
    } else if (str == "AC_A1120W") {
      return AC_A1120W;
    } else if (str == "AC_A3000W") {
      return AC_A3000W;
    } else if (str == "AC_A3001W") {
      return AC_A3001W;
    } else if (str == "AC_A3100W") {
      return AC_A3100W;
    } else if (str == "AC_A5020W") {
      return AC_A5020W;
    } else if (str == "AC_A6000W") {
      return AC_A6000W;
    } else if (str == "AC_A9000W") {
      return AC_A9000W;
    } else if (str == "AC_B1100W") {
      return AC_B1100W;
    } else if (str == "AC_B1240W") {
      return AC_B1240W;
    } else if (str == "AC_B1260W") {
      return AC_B1260W;
    } else if (str == "AC_B1280W") {
      return AC_B1280W;
    } else if (str == "AC_B1300W") {
      return AC_B1300W;
    } else if (str == "AC_B1340W") {
      return AC_B1340W;
    } else if (str == "AC_B2000W") {
      return AC_B2000W;
    } else if (str == "AC_B2080W") {
      return AC_B2080W;
    } else if (str == "AC_B3000W") {
      return AC_B3000W;
    } else if (str == "AC_B5000W") {
      return AC_B5000W;
    } else if (str == "AC_B5040W") {
      return AC_B5040W;
    } else if (str == "AC_B5060W") {
      return AC_B5060W;
    } else if (str == "AC_B5080W") {
      return AC_B5080W;
    } else if (str == "AC_B6020W") {
      return AC_B6020W;
    } else if (str == "AC_B6040W") {
      return AC_B6040W;
    } else if (str == "AC_B6060W") {
      return AC_B6060W;
    } else if (str == "AC_B6080W") {
      return AC_B6080W;
    } else if (str == "AC_B6080W_628") {
      return AC_B6080W_628;
    } else if (str == "AC_B8000W") {
      return AC_B8000W;
    } else if (str == "AC_B8030W") {
      return AC_B8030W;
    } else if (str == "AC_B8040W") {
      return AC_B8040W;
    } else if (str == "AC_B8080W") {
      return AC_B8080W;
    } else if (str == "AC_B8100W") {
      return AC_B8100W;
    } else if (str == "BA_A0020W") {
      return BA_A0020W;
    } else if (str == "BA_A0020W_603") {
      return BA_A0020W_603;
    } else if (str == "BA_A0021W_603") {
      return BA_A0021W_603;
    } else if (str == "BA_A0025W") {
      return BA_A0025W;
    } else if (str == "BA_A0040W") {
      return BA_A0040W;
    } else if (str == "BA_A0041W") {
      return BA_A0041W;
    } else if (str == "BA_A0044W") {
      return BA_A0044W;
    } else if (str == "BA_A0050W") {
      return BA_A0050W;
    } else if (str == "BA_A0060W") {
      return BA_A0060W;
    } else if (str == "BA_A0070W") {
      return BA_A0070W;
    } else if (str == "BA_A0080W") {
      return BA_A0080W;
    } else if (str == "BA_A0086W") {
      return BA_A0086W;
    } else if (str == "BA_A0100W") {
      return BA_A0100W;
    } else if (str == "BA_A0200W") {
      return BA_A0200W;
    } else if (str == "BA_A0500W") {
      return BA_A0500W;
    } else if (str == "BA_B0080W") {
      return BA_B0080W;
    } else if (str == "CHAT_A0001W") {
      return CHAT_A0001W;
    } else if (str == "CHAT_A0002W") {
      return CHAT_A0002W;
    } else if (str == "CM_A0000W") {
      return CM_A0000W;
    } else if (str == "CM_A1000W") {
      return CM_A1000W;
    } else if (str == "CM_A1000W_617") {
      return CM_A1000W_617;
    } else if (str == "CM_A1600W") {
      return CM_A1600W;
    } else if (str == "CM_A1600W_603") {
      return CM_A1600W_603;
    } else if (str == "CM_A1610W") {
      return CM_A1610W;
    } else if (str == "CM_A1710W") {
      return CM_A1710W;
    } else if (str == "CM_A2000W") {
      return CM_A2000W;
    } else if (str == "CM_A3000W") {
      return CM_A3000W;
    } else if (str == "CM_A3100W") {
      return CM_A3100W;
    } else if (str == "CM_A3220W") {
      return CM_A3220W;
    } else if (str == "CM_A4100W") {
      return CM_A4100W;
    } else if (str == "CM_A5000W") {
      return CM_A5000W;
    } else if (str == "CM_A7000W") {
      return CM_A7000W;
    } else if (str == "CM_A7010W") {
      return CM_A7010W;
    } else if (str == "CM_A8000W") {
      return CM_A8000W;
    } else if (str == "CM_A8210W") {
      return CM_A8210W;
    } else if (str == "CM_A8250W") {
      return CM_A8250W;
    } else if (str == "CM_B1000W") {
      return CM_B1000W;
    } else if (str == "CM_B1101W") {
      return CM_B1101W;
    } else if (str == "CM_B1104W") {
      return CM_B1104W;
    } else if (str == "CM_B1105W") {
      return CM_B1105W;
    } else if (str == "CM_B8100W") {
      return CM_B8100W;
    } else if (str == "CR_A0000W") {
      return CR_A0000W;
    } else if (str == "CR_A0010W") {
      return CR_A0010W;
    } else if (str == "CR_A0020W") {
      return CR_A0020W;
    } else if (str == "CR_A0040W") {
      return CR_A0040W;
    } else if (str == "CR_A1000W") {
      return CR_A1000W;
    } else if (str == "CR_A1001W") {
      return CR_A1001W;
    } else if (str == "CR_A1010W") {
      return CR_A1010W;
    } else if (str == "CR_A1020W") {
      return CR_A1020W;
    } else if (str == "CR_A1030W") {
      return CR_A1030W;
    } else if (str == "CR_A1040W") {
      return CR_A1040W;
    } else if (str == "CR_A1100W") {
      return CR_A1100W;
    } else if (str == "CR_A1101W") {
      return CR_A1101W;
    } else if (str == "CR_B1000W") {
      return CR_B1000W;
    } else if (str == "CT_A0111W") {
      return CT_A0111W;
    } else if (str == "CT_B0010W") {
      return CT_B0010W;
    } else if (str == "EA_A1000W") {
      return EA_A1000W;
    } else if (str == "EA_A2000W") {
      return EA_A2000W;
    } else if (str == "EA_A3000W") {
      return EA_A3000W;
    } else if (str == "HU_A1000W") {
      return HU_A1000W;
    } else if (str == "HU_A1060W") {
      return HU_A1060W;
    } else if (str == "HU_A2000W") {
      return HU_A2000W;
    } else if (str == "HU_A2040W") {
      return HU_A2040W;
    } else if (str == "HU_A2070W") {
      return HU_A2070W;
    } else if (str == "HU_A2100W") {
      return HU_A2100W;
    } else if (str == "HU_A2140W") {
      return HU_A2140W;
    } else if (str == "HU_A3020W") {
      return HU_A3020W;
    } else if (str == "HU_A3040W") {
      return HU_A3040W;
    } else if (str == "HU_A3060W") {
      return HU_A3060W;
    } else if (str == "HU_A3080W") {
      return HU_A3080W;
    } else if (str == "HU_A3200W") {
      return HU_A3200W;
    } else if (str == "HU_A4000W") {
      return HU_A4000W;
    } else if (str == "HU_A4100W") {
      return HU_A4100W;
    } else if (str == "HU_A4110W") {
      return HU_A4110W;
    } else if (str == "HU_A5020W") {
      return HU_A5020W;
    } else if (str == "HU_A6000W") {
      return HU_A6000W;
    } else if (str == "HU_A6020W") {
      return HU_A6020W;
    } else if (str == "HU_B1020W") {
      return HU_B1020W;
    } else if (str == "HU_B1040W") {
      return HU_B1040W;
    } else if (str == "HU_B2100W") {
      return HU_B2100W;
    } else if (str == "HU_B2120W") {
      return HU_B2120W;
    } else if (str == "HU_B2140W") {
      return HU_B2140W;
    } else if (str == "HU_B3120W") {
      return HU_B3120W;
    } else if (str == "HU_B3140W") {
      return HU_B3140W;
    } else if (str == "HU_B3160W") {
      return HU_B3160W;
    } else if (str == "HU_B3180W") {
      return HU_B3180W;
    } else if (str == "HU_B3220W") {
      return HU_B3220W;
    } else if (str == "HU_B4000W") {
      return HU_B4000W;
    } else if (str == "HU_B4001W") {
      return HU_B4001W;
    } else if (str == "HU_B4010W") {
      return HU_B4010W;
    } else if (str == "MA_A0010W") {
      return MA_A0010W;
    } else if (str == "MA_A1000W") {
      return MA_A1000W;
    } else if (str == "MA_A2000W") {
      return MA_A2000W;
    } else if (str == "MA_A2020W_628") {
      return MA_A2020W_628;
    } else if (str == "MA_A2300W") {
      return MA_A2300W;
    } else if (str == "MA_A2300W_615") {
      return MA_A2300W_615;
    } else if (str == "MA_A2310W_606") {
      return MA_A2310W_606;
    } else if (str == "MA_A2400W") {
      return MA_A2400W;
    } else if (str == "MA_A2410W") {
      return MA_A2410W;
    } else if (str == "MA_A2500W") {
      return MA_A2500W;
    } else if (str == "MA_A2700W") {
      return MA_A2700W;
    } else if (str == "MA_A3000W") {
      return MA_A3000W;
    } else if (str == "MA_A3300W") {
      return MA_A3300W;
    } else if (str == "MA_A3400W") {
      return MA_A3400W;
    } else if (str == "MA_A3400W_606") {
      return MA_A3400W_606;
    } else if (str == "MA_A3500W") {
      return MA_A3500W;
    } else if (str == "MA_A3500W_615") {
      return MA_A3500W_615;
    } else if (str == "MA_A3600W") {
      return MA_A3600W;
    } else if (str == "MA_A7000W") {
      return MA_A7000W;
    } else if (str == "MA_A8000W") {
      return MA_A8000W;
    } else if (str == "MA_A9001W") {
      return MA_A9001W;
    } else if (str == "MA_B2000W") {
      return MA_B2000W;
    } else if (str == "MA_B2020W_628") {
      return MA_B2020W_628;
    } else if (str == "MA_B2100W") {
      return MA_B2100W;
    } else if (str == "MA_B2101W") {
      return MA_B2101W;
    } else if (str == "MA_B2500W") {
      return MA_B2500W;
    } else if (str == "MA_B2500W_628") {
      return MA_B2500W_628;
    } else if (str == "MA_B2700W") {
      return MA_B2700W;
    } else if (str == "MA_B2800W") {
      return MA_B2800W;
    } else if (str == "MA_B3000W") {
      return MA_B3000W;
    } else if (str == "MA_B3100W") {
      return MA_B3100W;
    } else if (str == "MA_B7000W") {
      return MA_B7000W;
    } else if (str == "MA_B7000W_606") {
      return MA_B7000W_606;
    } else if (str == "MA_B7200W") {
      return MA_B7200W;
    } else if (str == "MA_B7201W") {
      return MA_B7201W;
    } else if (str == "MA_B7300W") {
      return MA_B7300W;
    } else if (str == "MA_B8000W") {
      return MA_B8000W;
    } else if (str == "PR_A2200W") {
      return PR_A2200W;
    } else if (str == "PR_A0030W") {
      return PR_A0030W;
    } else if (str == "PR_A0040W") {
      return PR_A0040W;
    } else if (str == "PR_A0060W") {
      return PR_A0060W;
    } else if (str == "PR_A1100W") {
      return PR_A1100W;
    } else if (str == "PR_A2000W") {
      return PR_A2000W;
    } else if (str == "PR_A3000W") {
      return PR_A3000W;
    } else if (str == "PR_A4000W") {
      return PR_A4000W;
    } else if (str == "PR_A4100W") {
      return PR_A4100W;
    } else if (str == "PR_A5000W") {
      return PR_A5000W;
    } else if (str == "PR_A6000W") {
      return PR_A6000W;
    } else if (str == "PR_A7000W") {
      return PR_A7000W;
    } else if (str == "PR_A9000W") {
      return PR_A9000W;
    } else if (str == "PR_A9100W") {
      return PR_A9100W;
    } else if (str == "PR_B0020W") {
      return PR_B0020W;
    } else if (str == "PR_B0020W_628") {
      return PR_B0020W_628;
    } else if (str == "PR_B1103W") {
      return PR_B1103W;
    } else if (str == "PR_B1104W") {
      return PR_B1104W;
    } else if (str == "PR_B1500W") {
      return PR_B1500W;
    } else if (str == "PR_B3000W") {
      return PR_B3000W;
    } else if (str == "PS_A0060W_301") {
      return PS_A0060W_301;
    } else if (str == "QC_A0060W") {
      return QC_A0060W;
    } else if (str == "QC_A0120W") {
      return QC_A0120W;
    } else if (str == "QC_A2000W") {
      return QC_A2000W;
    } else if (str == "QC_A2010W") {
      return QC_A2010W;
    } else if (str == "QC_A2500W") {
      return QC_A2500W;
    } else if (str == "QC_A2500W_603") {
      return QC_A2500W_603;
    } else if (str == "QC_A3000W") {
      return QC_A3000W;
    } else if (str == "QC_A3400W") {
      return QC_A3400W;
    } else if (str == "QC_A6000W") {
      return QC_A6000W;
    } else if (str == "QC_A6010W") {
      return QC_A6010W;
    } else if (str == "QC_A6050W") {
      return QC_A6050W;
    } else if (str == "QC_B0020W") {
      return QC_B0020W;
    } else if (str == "QC_B0030W") {
      return QC_B0030W;
    } else if (str == "QC_B0040W") {
      return QC_B0040W;
    } else if (str == "QC_B0100W") {
      return QC_B0100W;
    } else if (str == "QC_B0200W") {
      return QC_B0200W;
    } else if (str == "QC_B0300W") {
      return QC_B0300W;
    } else if (str == "QC_B9020W_615") {
      return QC_B9020W_615;
    } else if (str == "SA_A1000W_603") {
      return SA_A1000W_603;
    } else if (str == "SA_A1001W_603") {
      return SA_A1001W_603;
    } else if (str == "SA_A1100W_603") {
      return SA_A1100W_603;
    } else if (str == "SA_A1200W_603") {
      return SA_A1200W_603;
    } else if (str == "SA_A2000W") {
      return SA_A2000W;
    } else if (str == "SA_A2010W") {
      return SA_A2010W;
    } else if (str == "SA_A2100W") {
      return SA_A2100W;
    } else if (str == "SA_A2300W") {
      return SA_A2300W;
    } else if (str == "SA_A2300W_PDA") {
      return SA_A2300W_PDA;
    } else if (str == "SA_A3000W") {
      return SA_A3000W;
    } else if (str == "SA_A5000W") {
      return SA_A5000W;
    } else if (str == "SA_A5000W_615") {
      return SA_A5000W_615;
    } else if (str == "SA_A5001W") {
      return SA_A5001W;
    } else if (str == "SA_A5010W") {
      return SA_A5010W;
    } else if (str == "SA_A6000W") {
      return SA_A6000W;
    } else if (str == "SA_A7900W") {
      return SA_A7900W;
    } else if (str == "SA_A8000W") {
      return SA_A8000W;
    } else if (str == "SA_A9001W") {
      return SA_A9001W;
    } else if (str == "SA_B1002W_603") {
      return SA_B1002W_603;
    } else if (str == "SA_B1101W_603") {
      return SA_B1101W_603;
    } else if (str == "SA_B2200W") {
      return SA_B2200W;
    } else if (str == "SA_B2200W_603") {
      return SA_B2200W_603;
    } else if (str == "SA_B2201W_603") {
      return SA_B2201W_603;
    } else if (str == "SA_B2211W") {
      return SA_B2211W;
    } else if (str == "SA_B2211W_603") {
      return SA_B2211W_603;
    } else if (str == "SA_B2221W") {
      return SA_B2221W;
    } else if (str == "SA_B2221W_603") {
      return SA_B2221W_603;
    } else if (str == "SA_B2216W") {
      return SA_B2216W;
    } else if (str == "SA_B2220W") {
      return SA_B2220W;
    } else if (str == "SA_B2226W") {
      return SA_B2226W;
    } else if (str == "SA_B2227W") {
      return SA_B2227W;
    } else if (str == "SA_B2410W") {
      return SA_B2410W;
    } else if (str == "SA_B2410W_290") {
      return SA_B2410W_290;
    } else if (str == "SA_B2411W") {
      return SA_B2411W;
    } else if (str == "SA_B3000W") {
      return SA_B3000W;
    } else if (str == "SA_B3100W") {
      return SA_B3100W;
    } else if (str == "SA_B3101W") {
      return SA_B3101W;
    } else if (str == "SA_B3600W") {
      return SA_B3600W;
    } else if (str == "SA_B7000W") {
      return SA_B7000W;
    } else if (str == "SY_A0009W") {
      return SY_A0009W;
    } else if (str == "SY_A0010W") {
      return SY_A0010W;
    } else if (str == "SY_A0010W_301") {
      return SY_A0010W_301;
    } else if (str == "SY_A0011W") {
      return SY_A0011W;
    } else if (str == "SY_A0012W") {
      return SY_A0012W;
    } else if (str == "SY_A0013W") {
      return SY_A0013W;
    } else if (str == "SY_A0020W") {
      return SY_A0020W;
    } else if (str == "SY_A0022W") {
      return SY_A0022W;
    } else if (str == "SY_A0025W") {
      return SY_A0025W;
    } else if (str == "SY_A0026W") {
      return SY_A0026W;
    } else if (str == "SY_A0060W") {
      return SY_A0060W;
    } else if (str == "SY_A0100W") {
      return SY_A0100W;
    } else if (str == "SY_A0110W") {
      return SY_A0110W;
    } else if (str == "SY_A0120W") {
      return SY_A0120W;
    } else if (str == "SY_A0125W") {
      return SY_A0125W;
    } else if (str == "SY_A0150W") {
      return SY_A0150W;
    } else if (str == "SY_A0430W") {
      return SY_A0430W;
    } else if (str == "SY_A0500W") {
      return SY_A0500W;
    } else if (str == "SY_B0001W") {
      return SY_B0001W;
    } else if (str == "SY_B0060W") {
      return SY_B0060W;
    } else if (str == "TO_B0011W") {
      return TO_B0011W;
    }
  }

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
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <GlobalStyle isMobileMenuOpend={isMobileMenuOpend} />
            <Router>
              <Switch>
                {currentTheme == "yellow" ? (
                  <Route
                    sensitive={false}
                    path="/"
                    component={LoginCRM}
                    exact
                  />
                ) : currentTheme == "navy" ? (
                  <Route
                    sensitive={false}
                    path="/"
                    component={LoginFNF}
                    exact
                  />
                ) : currentTheme == "orange" ? (
                  <Route
                    sensitive={false}
                    path="/"
                    component={LoginOLED}
                    exact
                  />
                ) : (
                  <Route sensitive={false} path="/" component={Login} exact />
                )}

                <Route
                  sensitive={false}
                  path="/Error"
                  component={NotFound}
                  exact
                />
                <PanelBarNavContainer>
                  <Suspense fallback={<Loader />}>
                    {/* 메인 홈 */}
                    {loginResult ? (
                      <AuthRoute
                        path="/Home"
                        component={link(loginResult.homeMenuWeb)}
                        exact
                      />
                    ) : (
                      <AuthRoute path="/Home" component={Main} exact />
                    )}

                    <AuthRoute path="/AC_A0000W" component={AC_A0000W} exact />
                    <AuthRoute path="/AC_A0020W" component={AC_A0020W} exact />
                    <AuthRoute path="/AC_A0030W" component={AC_A0030W} exact />
                    <AuthRoute path="/AC_A0050W" component={AC_A0050W} exact />
                    <AuthRoute path="/AC_A0070W" component={AC_A0070W} exact />
                    <AuthRoute path="/AC_A0090W" component={AC_A0090W} exact />
                    <AuthRoute path="/AC_A1000W" component={AC_A1000W} exact />
                    <AuthRoute path="/AC_A1010W" component={AC_A1010W} exact />
                    <AuthRoute path="/AC_A1020W" component={AC_A1020W} exact />
                    <AuthRoute path="/AC_A1040W" component={AC_A1040W} exact />
                    <AuthRoute path="/AC_A1060W" component={AC_A1060W} exact />
                    <AuthRoute path="/AC_A1070W" component={AC_A1070W} exact />
                    <AuthRoute path="/AC_A1080W" component={AC_A1080W} exact />
                    <AuthRoute path="/AC_A1100W" component={AC_A1100W} exact />
                    <AuthRoute path="/AC_A1120W" component={AC_A1120W} exact />
                    <AuthRoute path="/AC_A3000W" component={AC_A3000W} exact />
                    <AuthRoute path="/AC_A3001W" component={AC_A3001W} exact />
                    <AuthRoute path="/AC_A3100W" component={AC_A3100W} exact />
                    <AuthRoute path="/AC_A5020W" component={AC_A5020W} exact />
                    <AuthRoute path="/AC_A6000W" component={AC_A6000W} exact />
                    <AuthRoute path="/AC_A9000W" component={AC_A9000W} exact />
                    <AuthRoute path="/AC_B1100W" component={AC_B1100W} exact />
                    <AuthRoute path="/AC_B1240W" component={AC_B1240W} exact />
                    <AuthRoute path="/AC_B1260W" component={AC_B1260W} exact />
                    <AuthRoute path="/AC_B1280W" component={AC_B1280W} exact />
                    <AuthRoute path="/AC_B1300W" component={AC_B1300W} exact />
                    <AuthRoute path="/AC_B1340W" component={AC_B1340W} exact />
                    <AuthRoute path="/AC_B2000W" component={AC_B2000W} exact />
                    <AuthRoute path="/AC_B2080W" component={AC_B2080W} exact />
                    <AuthRoute path="/AC_B3000W" component={AC_B3000W} exact />
                    <AuthRoute path="/AC_B5000W" component={AC_B5000W} exact />
                    <AuthRoute path="/AC_B5040W" component={AC_B5040W} exact />
                    <AuthRoute path="/AC_B5060W" component={AC_B5060W} exact />
                    <AuthRoute path="/AC_B5080W" component={AC_B5080W} exact />
                    <AuthRoute path="/AC_B6020W" component={AC_B6020W} exact />
                    <AuthRoute path="/AC_B6040W" component={AC_B6040W} exact />
                    <AuthRoute path="/AC_B6060W" component={AC_B6060W} exact />
                    <AuthRoute path="/AC_B6080W" component={AC_B6080W} exact />
                    <AuthRoute
                      path="/AC_B6080W_628"
                      component={AC_B6080W_628}
                      exact
                    />
                    <AuthRoute path="/AC_B8000W" component={AC_B8000W} exact />
                    <AuthRoute path="/AC_B8030W" component={AC_B8030W} exact />
                    <AuthRoute path="/AC_B8040W" component={AC_B8040W} exact />
                    <AuthRoute path="/AC_B8080W" component={AC_B8080W} exact />
                    <AuthRoute path="/AC_B8100W" component={AC_B8100W} exact />

                    <AuthRoute path="/BA_A0020W" component={BA_A0020W} exact />
                    <AuthRoute
                      path="/BA_A0020W_603"
                      component={BA_A0020W_603}
                      exact
                    />
                    <AuthRoute
                      path="/BA_A0021W_603"
                      component={BA_A0021W_603}
                      exact
                    />
                    <AuthRoute path="/BA_A0025W" component={BA_A0025W} exact />
                    <AuthRoute path="/BA_A0040W" component={BA_A0040W} exact />
                    <AuthRoute path="/BA_A0041W" component={BA_A0041W} exact />
                    <AuthRoute path="/BA_A0044W" component={BA_A0044W} exact />
                    <AuthRoute path="/BA_A0050W" component={BA_A0050W} exact />
                    <AuthRoute path="/BA_A0060W" component={BA_A0060W} exact />
                    <AuthRoute path="/BA_A0070W" component={BA_A0070W} exact />
                    <AuthRoute path="/BA_A0080W" component={BA_A0080W} exact />
                    <AuthRoute path="/BA_A0086W" component={BA_A0086W} exact />
                    <AuthRoute path="/BA_A0100W" component={BA_A0100W} exact />
                    <AuthRoute path="/BA_A0200W" component={BA_A0200W} exact />
                    <AuthRoute path="/BA_A0500W" component={BA_A0500W} exact />
                    <AuthRoute path="/BA_B0080W" component={BA_B0080W} exact />

                    <AuthRoute
                      path="/CHAT_A0001W"
                      component={CHAT_A0001W}
                      exact
                    />
                    <AuthRoute
                      path="/CHAT_A0002W"
                      component={CHAT_A0002W}
                      exact
                    />

                    <AuthRoute path="/CM_A0000W" component={CM_A0000W} exact />
                    <AuthRoute path="/CM_A1000W" component={CM_A1000W} exact />
                    <AuthRoute
                      path="/CM_A1000W_617"
                      component={CM_A1000W_617}
                      exact
                    />
                    <AuthRoute path="/CM_A1600W" component={CM_A1600W} exact />
                    <AuthRoute
                      path="/CM_A1600W_603"
                      component={CM_A1600W_603}
                      exact
                    />
                    <AuthRoute path="/CM_A1610W" component={CM_A1610W} exact />
                    <AuthRoute path="/CM_A1710W" component={CM_A1710W} exact />
                    <AuthRoute path="/CM_A2000W" component={CM_A2000W} exact />
                    <AuthRoute path="/CM_A3000W" component={CM_A3000W} exact />
                    <AuthRoute path="/CM_A3100W" component={CM_A3100W} exact />
                    <AuthRoute path="/CM_A3220W" component={CM_A3220W} exact />
                    <AuthRoute path="/CM_A4100W" component={CM_A4100W} exact />
                    <AuthRoute path="/CM_A5000W" component={CM_A5000W} exact />
                    <AuthRoute path="/CM_A7000W" component={CM_A7000W} exact />
                    <AuthRoute path="/CM_A7010W" component={CM_A7010W} exact />
                    <AuthRoute path="/CM_A8000W" component={CM_A8000W} exact />
                    <AuthRoute path="/CM_A8210W" component={CM_A8210W} exact />
                    <AuthRoute path="/CM_A8250W" component={CM_A8250W} exact />
                    <AuthRoute path="/CM_B1000W" component={CM_B1000W} exact />
                    <AuthRoute path="/CM_B1101W" component={CM_B1101W} exact />
                    <AuthRoute path="/CM_B1104W" component={CM_B1104W} exact />
                    <AuthRoute path="/CM_B1105W" component={CM_B1105W} exact />
                    <AuthRoute path="/CM_B8100W" component={CM_B8100W} exact />

                    <AuthRoute path="/CR_A0000W" component={CR_A0000W} exact />
                    <AuthRoute path="/CR_A0010W" component={CR_A0010W} exact />
                    <AuthRoute path="/CR_A0020W" component={CR_A0020W} exact />
                    <AuthRoute path="/CR_A0040W" component={CR_A0040W} exact />
                    <AuthRoute path="/CR_A1000W" component={CR_A1000W} exact />
                    <AuthRoute path="/CR_A1001W" component={CR_A1001W} exact />
                    <AuthRoute path="/CR_A1010W" component={CR_A1010W} exact />
                    <AuthRoute path="/CR_A1020W" component={CR_A1020W} exact />
                    <AuthRoute path="/CR_A1030W" component={CR_A1030W} exact />
                    <AuthRoute path="/CR_A1040W" component={CR_A1040W} exact />
                    <AuthRoute path="/CR_A1100W" component={CR_A1100W} exact />
                    <AuthRoute path="/CR_A1101W" component={CR_A1101W} exact />
                    <AuthRoute path="/CR_B1000W" component={CR_B1000W} exact />

                    <AuthRoute path="/CT_A0111W" component={CT_A0111W} exact />
                    <AuthRoute path="/CT_B0010W" component={CT_B0010W} exact />

                    <AuthRoute path="/EA_A1000W" component={EA_A1000W} exact />
                    <AuthRoute path="/EA_A2000W" component={EA_A2000W} exact />
                    <AuthRoute path="/EA_A3000W" component={EA_A3000W} exact />

                    <AuthRoute path="/HU_A1000W" component={HU_A1000W} exact />
                    <AuthRoute path="/HU_A1060W" component={HU_A1060W} exact />
                    <AuthRoute path="/HU_A2000W" component={HU_A2000W} exact />
                    <AuthRoute path="/HU_A2040W" component={HU_A2040W} exact />
                    <AuthRoute path="/HU_A2070W" component={HU_A2070W} exact />
                    <AuthRoute path="/HU_A2100W" component={HU_A2100W} exact />
                    <AuthRoute path="/HU_A2140W" component={HU_A2140W} exact />
                    <AuthRoute path="/HU_A3020W" component={HU_A3020W} exact />
                    <AuthRoute path="/HU_A3040W" component={HU_A3040W} exact />
                    <AuthRoute path="/HU_A3060W" component={HU_A3060W} exact />
                    <AuthRoute path="/HU_A3080W" component={HU_A3080W} exact />
                    <AuthRoute path="/HU_A3200W" component={HU_A3200W} exact />
                    <AuthRoute path="/HU_A4000W" component={HU_A4000W} exact />
                    <AuthRoute path="/HU_A4100W" component={HU_A4100W} exact />
                    <AuthRoute path="/HU_A4110W" component={HU_A4110W} exact />
                    <AuthRoute path="/HU_A5020W" component={HU_A5020W} exact />
                    <AuthRoute path="/HU_A6000W" component={HU_A6000W} exact />
                    <AuthRoute path="/HU_A6020W" component={HU_A6020W} exact />
                    <AuthRoute path="/HU_B1020W" component={HU_B1020W} exact />
                    <AuthRoute path="/HU_B1040W" component={HU_B1040W} exact />
                    <AuthRoute path="/HU_B2100W" component={HU_B2100W} exact />
                    <AuthRoute path="/HU_B2120W" component={HU_B2120W} exact />
                    <AuthRoute path="/HU_B2140W" component={HU_B2140W} exact />
                    <AuthRoute path="/HU_B3120W" component={HU_B3120W} exact />
                    <AuthRoute path="/HU_B3140W" component={HU_B3140W} exact />
                    <AuthRoute path="/HU_B3160W" component={HU_B3160W} exact />
                    <AuthRoute path="/HU_B3180W" component={HU_B3180W} exact />
                    <AuthRoute path="/HU_B3220W" component={HU_B3220W} exact />
                    <AuthRoute path="/HU_B4001W" component={HU_B4001W} exact />
                    <AuthRoute path="/HU_B4000W" component={HU_B4000W} exact />
                    <AuthRoute path="/HU_B4010W" component={HU_B4010W} exact />

                    <AuthRoute path="/MA_A0010W" component={MA_A0010W} exact />
                    <AuthRoute path="/MA_A1000W" component={MA_A1000W} exact />
                    <AuthRoute path="/MA_A2000W" component={MA_A2000W} exact />
                    <AuthRoute
                      path="/MA_A2020W_628"
                      component={MA_A2020W_628}
                      exact
                    />
                    <AuthRoute path="/MA_A2300W" component={MA_A2300W} exact />
                    <AuthRoute
                      path="/MA_A2300W_615"
                      component={MA_A2300W_615}
                      exact
                    />
                    <AuthRoute
                      path="/MA_A2310W_606"
                      component={MA_A2310W_606}
                      exact
                    />
                    <AuthRoute path="/MA_A2400W" component={MA_A2400W} exact />
                    <AuthRoute path="/MA_A2410W" component={MA_A2410W} exact />
                    <AuthRoute path="/MA_A2500W" component={MA_A2500W} exact />
                    <AuthRoute path="/MA_A2700W" component={MA_A2700W} exact />
                    <AuthRoute path="/MA_A3000W" component={MA_A3000W} exact />
                    <AuthRoute path="/MA_A3300W" component={MA_A3300W} exact />
                    <AuthRoute
                      path="/MA_A3400W_606"
                      component={MA_A3400W_606}
                      exact
                    />
                    <AuthRoute path="/MA_A3400W" component={MA_A3400W} exact />
                    <AuthRoute path="/MA_A3500W" component={MA_A3500W} exact />
                    <AuthRoute
                      path="/MA_A3500W_615"
                      component={MA_A3500W_615}
                      exact
                    />
                    <AuthRoute path="/MA_A3600W" component={MA_A3600W} exact />
                    <AuthRoute path="/MA_A7000W" component={MA_A7000W} exact />
                    <AuthRoute path="/MA_A8000W" component={MA_A8000W} exact />
                    <AuthRoute path="/MA_A9001W" component={MA_A9001W} exact />
                    <AuthRoute path="/MA_B2000W" component={MA_B2000W} exact />
                    <AuthRoute
                      path="/MA_B2020W_628"
                      component={MA_B2020W_628}
                      exact
                    />
                    <AuthRoute path="/MA_B2100W" component={MA_B2100W} exact />
                    <AuthRoute path="/MA_B2101W" component={MA_B2101W} exact />
                    <AuthRoute path="/MA_B2500W" component={MA_B2500W} exact />
                    <AuthRoute
                      path="/MA_B2500W_628"
                      component={MA_B2500W_628}
                      exact
                    />
                    <AuthRoute path="/MA_B2700W" component={MA_B2700W} exact />
                    <AuthRoute path="/MA_B2800W" component={MA_B2800W} exact />
                    <AuthRoute path="/MA_B3000W" component={MA_B3000W} exact />
                    <AuthRoute path="/MA_B3100W" component={MA_B3100W} exact />
                    <AuthRoute path="/MA_B7000W" component={MA_B7000W} exact />
                    <AuthRoute
                      path="/MA_B7000W_606"
                      component={MA_B7000W_606}
                      exact
                    />
                    <AuthRoute path="/MA_B7200W" component={MA_B7200W} exact />
                    <AuthRoute path="/MA_B7201W" component={MA_B7201W} exact />
                    <AuthRoute path="/MA_B7300W" component={MA_B7300W} exact />
                    <AuthRoute path="/MA_B8000W" component={MA_B8000W} exact />

                    <AuthRoute path="/PR_A0030W" component={PR_A0030W} exact />
                    <AuthRoute path="/PR_A0040W" component={PR_A0040W} exact />
                    <AuthRoute path="/PR_A0060W" component={PR_A0060W} exact />
                    <AuthRoute path="/PR_A1100W" component={PR_A1100W} exact />
                    <AuthRoute path="/PR_A2000W" component={PR_A2000W} exact />
                    <AuthRoute path="/PR_A2200W" component={PR_A2200W} exact />
                    <AuthRoute path="/PR_A3000W" component={PR_A3000W} exact />
                    <AuthRoute path="/PR_A4000W" component={PR_A4000W} exact />
                    <AuthRoute path="/PR_A4100W" component={PR_A4100W} exact />
                    <AuthRoute path="/PR_A5000W" component={PR_A5000W} exact />
                    <AuthRoute path="/PR_A6000W" component={PR_A6000W} exact />
                    <AuthRoute path="/PR_A7000W" component={PR_A7000W} exact />
                    <AuthRoute path="/PR_A9000W" component={PR_A9000W} exact />
                    <AuthRoute path="/PR_A9100W" component={PR_A9100W} exact />
                    <AuthRoute path="/PR_B0020W" component={PR_B0020W} exact />
                    <AuthRoute
                      path="/PR_B0020W_628"
                      component={PR_B0020W_628}
                      exact
                    />
                    <AuthRoute path="/PR_B1103W" component={PR_B1103W} exact />
                    <AuthRoute path="/PR_B1104W" component={PR_B1104W} exact />
                    <AuthRoute path="/PR_B1500W" component={PR_B1500W} exact />
                    <AuthRoute path="/PR_B3000W" component={PR_B3000W} exact />

                    <AuthRoute
                      path="/PS_A0060W_301"
                      component={PS_A0060W_301}
                      exact
                    />

                    <AuthRoute path="/QC_A0060W" component={QC_A0060W} exact />
                    <AuthRoute path="/QC_A0120W" component={QC_A0120W} exact />
                    <AuthRoute path="/QC_A2000W" component={QC_A2000W} exact />
                    <AuthRoute path="/QC_A2010W" component={QC_A2010W} exact />
                    <AuthRoute path="/QC_A2500W" component={QC_A2500W} exact />
                    <AuthRoute
                      path="/QC_A2500W_603"
                      component={QC_A2500W_603}
                      exact
                    />
                    <AuthRoute path="/QC_A3000W" component={QC_A3000W} exact />
                    <AuthRoute path="/QC_A3400W" component={QC_A3400W} exact />
                    <AuthRoute path="/QC_A6000W" component={QC_A6000W} exact />
                    <AuthRoute path="/QC_A6010W" component={QC_A6010W} exact />
                    <AuthRoute path="/QC_A6050W" component={QC_A6050W} exact />
                    <AuthRoute path="/QC_B0020W" component={QC_B0020W} exact />
                    <AuthRoute path="/QC_B0030W" component={QC_B0030W} exact />
                    <AuthRoute path="/QC_B0040W" component={QC_B0040W} exact />
                    <AuthRoute path="/QC_B0100W" component={QC_B0100W} exact />
                    <AuthRoute path="/QC_B0200W" component={QC_B0200W} exact />
                    <AuthRoute path="/QC_B0300W" component={QC_B0300W} exact />
                    <AuthRoute
                      path="/QC_B9020W_615"
                      component={QC_B9020W_615}
                      exact
                    />

                    <AuthRoute
                      path="/SA_A1000W_603"
                      component={SA_A1000W_603}
                      exact
                    />
                    <AuthRoute
                      path="/SA_A1001W_603"
                      component={SA_A1001W_603}
                      exact
                    />
                    <AuthRoute
                      path="/SA_A1100W_603"
                      component={SA_A1100W_603}
                      exact
                    />
                    <AuthRoute
                      path="/SA_A1200W_603"
                      component={SA_A1200W_603}
                      exact
                    />
                    <AuthRoute path="/SA_A2000W" component={SA_A2000W} exact />
                    <AuthRoute path="/SA_A2010W" component={SA_A2010W} exact />
                    <AuthRoute path="/SA_A2100W" component={SA_A2100W} exact />
                    <AuthRoute path="/SA_A2300W" component={SA_A2300W} exact />
                    <AuthRoute
                      path="/SA_A2300W_PDA"
                      component={SA_A2300W_PDA}
                      exact
                    />
                    <AuthRoute path="/SA_A3000W" component={SA_A3000W} exact />
                    <AuthRoute path="/SA_A5000W" component={SA_A5000W} exact />
                    <AuthRoute
                      path="/SA_A5000W_615"
                      component={SA_A5000W_615}
                      exact
                    />
                    <AuthRoute path="/SA_A5001W" component={SA_A5001W} exact />
                    <AuthRoute path="/SA_A5010W" component={SA_A5010W} exact />
                    <AuthRoute path="/SA_A6000W" component={SA_A6000W} exact />
                    <AuthRoute path="/SA_A7900W" component={SA_A7900W} exact />
                    <AuthRoute path="/SA_A8000W" component={SA_A8000W} exact />
                    <AuthRoute path="/SA_A9001W" component={SA_A9001W} exact />
                    <AuthRoute
                      path="/SA_B1002W_603"
                      component={SA_B1002W_603}
                      exact
                    />
                    <AuthRoute
                      path="/SA_B1101W_603"
                      component={SA_B1101W_603}
                      exact
                    />
                    <AuthRoute
                      path="/SA_B2200W_603"
                      component={SA_B2200W_603}
                      exact
                    />
                    <AuthRoute path="/SA_B2200W" component={SA_B2200W} exact />
                    <AuthRoute
                      path="/SA_B2201W_603"
                      component={SA_B2201W_603}
                      exact
                    />
                    <AuthRoute path="/SA_B2211W" component={SA_B2211W} exact />
                    <AuthRoute
                      path="/SA_B2211W_603"
                      component={SA_B2211W_603}
                      exact
                    />
                    <AuthRoute path="/SA_B2216W" component={SA_B2216W} exact />
                    <AuthRoute path="/SA_B2220W" component={SA_B2220W} exact />
                    <AuthRoute
                      path="/SA_B2221W_603"
                      component={SA_B2221W_603}
                      exact
                    />
                    <AuthRoute path="/SA_B2221W" component={SA_B2221W} exact />
                    <AuthRoute path="/SA_B2226W" component={SA_B2226W} exact />
                    <AuthRoute path="/SA_B2227W" component={SA_B2227W} exact />
                    <AuthRoute
                      path="/SA_B2410W_290"
                      component={SA_B2410W_290}
                      exact
                    />
                    <AuthRoute path="/SA_B2411W" component={SA_B2411W} exact />
                    <AuthRoute path="/SA_B2410W" component={SA_B2410W} exact />
                    <AuthRoute path="/SA_B3000W" component={SA_B3000W} exact />
                    <AuthRoute path="/SA_B3100W" component={SA_B3100W} exact />
                    <AuthRoute path="/SA_B3101W" component={SA_B3101W} exact />
                    <AuthRoute path="/SA_B3600W" component={SA_B3600W} exact />
                    <AuthRoute path="/SA_B7000W" component={SA_B7000W} exact />

                    <AuthRoute path="/SY_A0009W" component={SY_A0009W} exact />
                    <AuthRoute path="/SY_A0010W" component={SY_A0010W} exact />
                    <AuthRoute
                      path="/SY_A0010W_301"
                      component={SY_A0010W_301}
                      exact
                    />
                    <AuthRoute path="/SY_A0011W" component={SY_A0011W} exact />
                    <AuthRoute path="/SY_A0012W" component={SY_A0012W} exact />
                    <AuthRoute path="/SY_A0013W" component={SY_A0013W} exact />
                    <AuthRoute path="/SY_A0020W" component={SY_A0020W} exact />
                    <AuthRoute path="/SY_A0022W" component={SY_A0022W} exact />
                    <AuthRoute path="/SY_A0025W" component={SY_A0025W} exact />
                    <AuthRoute path="/SY_A0026W" component={SY_A0026W} exact />
                    <AuthRoute path="/SY_A0060W" component={SY_A0060W} exact />
                    <AuthRoute path="/SY_A0100W" component={SY_A0100W} exact />
                    <AuthRoute path="/SY_A0110W" component={SY_A0110W} exact />
                    <AuthRoute path="/SY_A0120W" component={SY_A0120W} exact />
                    <AuthRoute path="/SY_A0125W" component={SY_A0125W} exact />
                    <AuthRoute path="/SY_A0150W" component={SY_A0150W} exact />
                    <AuthRoute path="/SY_A0430W" component={SY_A0430W} exact />
                    <AuthRoute path="/SY_A0500W" component={SY_A0500W} exact />
                    <AuthRoute path="/SY_B0001W" component={SY_B0001W} exact />
                    <AuthRoute path="/SY_B0060W" component={SY_B0060W} exact />

                    <AuthRoute path="/TO_B0011W" component={TO_B0011W} exact />
                  </Suspense>
                </PanelBarNavContainer>
              </Switch>
            </Router>
          </ErrorBoundary>
        </IntlProvider>
      </LocalizationProvider>
    </>
  );
  //}
};

interface ErrorFallbackProps {
  error: Error;
}

const ErrorFallback = ({ error }: ErrorFallbackProps) => {
  useEffect(() => {
    const chunkFailedMessage = "ChunkLoadError";
    const reloadMessage = "InvalidValueError";
    const tokenMessage = "Unexpected token '<'";
    // props로 받은 error 확인하여 chunk error 발생 시 새로고침
    if (
      error?.message &&
      (chunkFailedMessage.includes(error.message) ||
        reloadMessage.includes(error.message) ||
        tokenMessage.includes(error.message))
    ) {
      window.location.reload();
    }
  }, [error]);

  // chunk error 아니라면 에러 페이지 출력
  return <NotFound />;
};

export default App;
