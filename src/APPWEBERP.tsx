import { createTheme } from "@mui/material";
import {
  IntlProvider,
  LocalizationProvider,
  load,
} from "@progress/kendo-react-intl";
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
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";
import { RecoilRoot, useRecoilState, useRecoilValue } from "recoil";
import styled, { createGlobalStyle } from "styled-components";
import AuthRoute from "./components/AuthRoute";
import { DEFAULT_LANG_CODE } from "./components/CommonString";
import { default as PanelBarNavContainerWEBERP } from "./components/Containers/PanelBarNavContainerWEBERP";
import AC_A0000W from "./routes/AC_A0000W";
import AC_A0020W from "./routes/AC_A0020W";
import AC_A0030W from "./routes/AC_A0030W";
import AC_A0070W from "./routes/AC_A0070W";
import AC_A1000W from "./routes/AC_A1000W";
import AC_B1100W from "./routes/AC_B1100W";
import AC_B1240W from "./routes/AC_B1240W";
import AC_B1280W from "./routes/AC_B1280W";
import AC_B1300W from "./routes/AC_B1300W";
import AC_B1340W from "./routes/AC_B1340W";
import AC_B2080W from "./routes/AC_B2080W";
import AC_B3000W from "./routes/AC_B3000W";
import AC_B5000W from "./routes/AC_B5000W";
import AC_B5080W from "./routes/AC_B5080W";
import AC_B6020W from "./routes/AC_B6020W";
import AC_B6060W from "./routes/AC_B6060W";
import AC_B6080W from "./routes/AC_B6080W";
import AC_B8030W from "./routes/AC_B8030W";
import AC_B8040W from "./routes/AC_B8040W";
import AC_B8080W from "./routes/AC_B8080W";
import AC_B8100W from "./routes/AC_B8100W";
import BA_A0020W from "./routes/BA_A0020W";
import BA_A0020W_603 from "./routes/BA_A0020W_603";
import BA_A0040W from "./routes/BA_A0040W";
import BA_A0041W from "./routes/BA_A0041W";
import BA_A0050W from "./routes/BA_A0050W";
import BA_A0070W from "./routes/BA_A0070W";
import BA_A0080W from "./routes/BA_A0080W";
import BA_A0100W from "./routes/BA_A0100W";
import BA_B0080W from "./routes/BA_B0080W";
import CHAT_A0001W from "./routes/CHAT_A0001W";
import CHAT_A0002W from "./routes/CHAT_A0002W";
import CHAT_TEST_TRAVEL_BOT from "./routes/CHAT_TEST_TRAVEL_BOT";
import CM_A0000W from "./routes/CM_A0000W";
import CM_A1000W from "./routes/CM_A1000W";
import CM_A1600W from "./routes/CM_A1600W";
import CM_A1710W from "./routes/CM_A1710W";
import CM_A2000W from "./routes/CM_A2000W";
import CM_A3000W from "./routes/CM_A3000W";
import CM_A4100W from "./routes/CM_A4100W";
import CM_A5000W from "./routes/CM_A5000W";
import CM_A5001W from "./routes/CM_A5001W";
import CM_A7000W from "./routes/CM_A7000W";
import CM_A8000W from "./routes/CM_A8000W";
import CM_A8210W from "./routes/CM_A8210W";
import CM_A8250W from "./routes/CM_A8250W";
import CM_B1000W from "./routes/CM_B1000W";
import CM_B1101W from "./routes/CM_B1101W";
import CM_B8100W from "./routes/CM_B8100W";
import CR_A0000W from "./routes/CR_A0000W";
import CR_A0010W from "./routes/CR_A0010W";
import CR_A0020W from "./routes/CR_A0020W";
import CR_A0040W from "./routes/CR_A0040W";
import CR_A1001W from "./routes/CR_A1001W";
import CR_A1100W from "./routes/CR_A1100W";
import CR_A1101W from "./routes/CR_A1101W";
import CT_A0111W from "./routes/CT_A0111W";
import EA_A1000W from "./routes/EA_A1000W";
import EA_A2000W from "./routes/EA_A2000W";
import GANTT from "./routes/GANTT";
import HU_A1000W from "./routes/HU_A1000W";
import HU_A2070W from "./routes/HU_A2070W";
import HU_A2100W from "./routes/HU_A2100W";
import HU_A2140W from "./routes/HU_A2140W";
import HU_A3020W from "./routes/HU_A3020W";
import HU_A4100W from "./routes/HU_A4100W";
import HU_A5020W from "./routes/HU_A5020W";
import HU_B1020W from "./routes/HU_B1020W";
import HU_B1040W from "./routes/HU_B1040W";
import HU_B2100W from "./routes/HU_B2100W";
import HU_B2120W from "./routes/HU_B2120W";
import HU_B2140W from "./routes/HU_B2140W";
import HU_B3140W from "./routes/HU_B3140W";
import HU_B3160W from "./routes/HU_B3160W";
import HU_B3180W from "./routes/HU_B3180W";
import HU_B3220W from "./routes/HU_B3220W";
import HU_B4000W from "./routes/HU_B4000W";
import HU_B4001W from "./routes/HU_B4001W";
import HU_B4010W from "./routes/HU_B4010W";
import MA_A0010W from "./routes/MA_A0010W";
import MA_A1000W from "./routes/MA_A1000W";
import MA_A2000W from "./routes/MA_A2000W";
import MA_A2300W from "./routes/MA_A2300W";
import MA_A2310_606W from "./routes/MA_A2310_606W";
import MA_A2400W from "./routes/MA_A2400W";
import MA_A2410W from "./routes/MA_A2410W";
import MA_A2500W from "./routes/MA_A2500W";
import MA_A2700W from "./routes/MA_A2700W";
import MA_A3000W from "./routes/MA_A3000W";
import MA_A3300W from "./routes/MA_A3300W";
import MA_A3400W from "./routes/MA_A3400W";
import MA_A3500W from "./routes/MA_A3500W";
import MA_A7000W from "./routes/MA_A7000W";
import MA_A9001W from "./routes/MA_A9001W";
import MA_B2000W from "./routes/MA_B2000W";
import MA_B2100W from "./routes/MA_B2100W";
import MA_B2500W from "./routes/MA_B2500W";
import MA_B2700W from "./routes/MA_B2700W";
import MA_B2800W from "./routes/MA_B2800W";
import MA_B3000W from "./routes/MA_B3000W";
import MA_B3100W from "./routes/MA_B3100W";
import MA_B7000W from "./routes/MA_B7000W";
import MA_B7000_606W from "./routes/MA_B7000_606W";
import MA_B7200W from "./routes/MA_B7200W";
import MA_B7201W from "./routes/MA_B7201W";
import MainBIO from "./routes/MainBIO";
import NotFound from "./routes/NotFound";
import PR_A0030W from "./routes/PR_A0030W";
import PR_A0040W from "./routes/PR_A0040W";
import PR_A0060W from "./routes/PR_A0060W";
import PR_A1100W from "./routes/PR_A1100W";
import PR_A2000W from "./routes/PR_A2000W";
import PR_A3000W from "./routes/PR_A3000W";
import PR_A4000W from "./routes/PR_A4000W";
import PR_A4100W from "./routes/PR_A4100W";
import PR_A5000W from "./routes/PR_A5000W";
import PR_A6000W from "./routes/PR_A6000W";
import PR_A7000W from "./routes/PR_A7000W";
import PR_A9000W from "./routes/PR_A9000W";
import PR_A9100W from "./routes/PR_A9100W";
import PR_B0020W from "./routes/PR_B0020W";
import PR_B1103W from "./routes/PR_B1103W";
import PR_B1104W from "./routes/PR_B1104W";
import PR_B3000W from "./routes/PR_B3000W";
import PS_A0060_301W from "./routes/PS_A0060_301W";
import QC_A0060W from "./routes/QC_A0060W";
import QC_A0120W from "./routes/QC_A0120W";
import QC_A2000W from "./routes/QC_A2000W";
import QC_A2500W from "./routes/QC_A2500W";
import QC_A2500_603W from "./routes/QC_A2500_603W";
import QC_A3000W from "./routes/QC_A3000W";
import QC_A6000W from "./routes/QC_A6000W";
import QC_B0030W from "./routes/QC_B0030W";
import QC_B0040W from "./routes/QC_B0040W";
import QC_B0100W from "./routes/QC_B0100W";
import QC_B0200W from "./routes/QC_B0200W";
import QC_B0300W from "./routes/QC_B0300W";
import SA_A1000_603W from "./routes/SA_A1000_603W";
import SA_A1001_603W from "./routes/SA_A1001_603W";
import SA_A1100_603W from "./routes/SA_A1100_603W";
import SA_A2000W from "./routes/SA_A2000W";
import SA_A2010W from "./routes/SA_A2010W";
import SA_A2300W from "./routes/SA_A2300W";
import SA_A2300W_PDA from "./routes/SA_A2300W_PDA";
import SA_A3000W from "./routes/SA_A3000W";
import SA_A5000W from "./routes/SA_A5000W";
import SA_A5001W from "./routes/SA_A5001W";
import SA_A5010W from "./routes/SA_A5010W";
import SA_B1000W_603 from "./routes/SA_B1000W_603";
import SA_B2200W from "./routes/SA_B2200W";
import SA_B2211W from "./routes/SA_B2211W";
import SA_B2216W from "./routes/SA_B2216W";
import SA_B2221W from "./routes/SA_B2221W";
import SA_B2226W from "./routes/SA_B2226W";
import SA_B2410W from "./routes/SA_B2410W";
import SA_B2410_290W from "./routes/SA_B2410_290W";
import SA_B3000W from "./routes/SA_B3000W";
import SA_B3100W from "./routes/SA_B3100W";
import SA_B3101W from "./routes/SA_B3101W";
import SA_B3600W from "./routes/SA_B3600W";
import SY_A0010W from "./routes/SY_A0010W";
import SY_A0010_301W from "./routes/SY_A0010_301W";
import SY_A0011W from "./routes/SY_A0011W";
import SY_A0012W from "./routes/SY_A0012W";
import SY_A0013W from "./routes/SY_A0013W";
import SY_A0025W from "./routes/SY_A0025W";
import SY_A0100W from "./routes/SY_A0100W";
import SY_A0110W from "./routes/SY_A0110W";
import SY_A0120W from "./routes/SY_A0120W";
import SY_A0125W from "./routes/SY_A0125W";
import SY_A0500W from "./routes/SY_A0500W";
import TO_B0011W from "./routes/TO_B0011W";
import {
  colors,
  isMobileMenuOpendState,
  loginResultState,
} from "./store/atoms";
const Login = lazy(() => import("./routes/Login"));
const Main = lazy(() => import("./routes/Main"));

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
  const isAdmin = role === "ADMIN";
  const [color, setColor] = useRecoilState(colors);
  const [themecolor, setThemeColor] = useState<string[]>([
    "#2196f3",
    "#1976d2",
    "#64b5f6",
    "#bbdefb",
  ]);

  useEffect(() => {
    setThemeColor(color);
  }, [color]);

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

  useEffect(() => {
    switcher({ theme: "blue" });
  }, []);

  function link(str: any) {
    if (str == "Home" || str == "") {
      if (loginResult.companyCode == "2302BA03") {
        return MainBIO;
      } else {
        return Main;
      }
    } else if (str == "AC_A0000W") {
      return AC_A0000W;
    } else if (str == "BA_A0020W") {
      return BA_A0020W;
    } else if (str == "BA_A0040W") {
      return BA_A0040W;
    } else if (str == "BA_A0041W") {
      return BA_A0041W;
    } else if (str == "BA_A0050W") {
      return BA_A0050W;
    } else if (str == "BA_A0070W") {
      return BA_A0070W;
    } else if (str == "BA_A0080W") {
      return BA_A0080W;
    } else if (str == "BA_A0100W") {
      return BA_A0100W;
    } else if (str == "BA_B0080W") {
      return BA_B0080W;
    } else if (str == "CM_B8100W") {
      return CM_B8100W;
    } else if (str == "SY_A0125W") {
      return SY_A0125W;
    } else if (str == "SY_A0500W") {
      return SY_A0500W;
    } else if (str == "PS_A0060_301W") {
      return PS_A0060_301W;
    } else if (str == "MA_A0010W") {
      return MA_A0010W;
    } else if (str == "MA_A1000W") {
      return MA_A1000W;
    } else if (str == "MA_A2000W") {
      return MA_A2000W;
    } else if (str == "MA_A2300W") {
      return MA_A2300W;
    } else if (str == "MA_A2310_606W") {
      return MA_A2310_606W;
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
    } else if (str == "MA_A7000W") {
      return MA_A7000W;
    } else if (str == "MA_A3300W") {
      return MA_A3300W;
    } else if (str == "MA_A3400W") {
      return MA_A3400W;
    } else if (str == "MA_A3500W") {
      return MA_A3500W;
    } else if (str == "MA_A9001W") {
      return MA_A9001W;
    } else if (str == "MA_B2000W") {
      return MA_B2000W;
    } else if (str == "MA_B2100W") {
      return MA_B2100W;
    } else if (str == "MA_B2500W") {
      return MA_B2500W;
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
    } else if (str == "MA_B7000_606W") {
      return MA_B7000_606W;
    } else if (str == "MA_B7200W") {
      return MA_B7200W;
    } else if (str == "MA_B7201W") {
      return MA_B7201W;
    } else if (str == "SA_A2000W") {
      return SA_A2000W;
    } else if (str == "SA_A2010W") {
      return SA_A2010W;
    } else if (str == "SA_A2300W") {
      return SA_A2300W;
    } else if (str == "SA_A2300W_PDA") {
      return SA_A2300W_PDA;
    } else if (str == "SA_A3000W") {
      return SA_A3000W;
    } else if (str == "SA_A5000W") {
      return SA_A5000W;
    } else if (str == "SA_A5001W") {
      return SA_A5001W;
    } else if (str == "SA_A5010W") {
      return SA_A5010W;
    } else if (str == "SA_B2200W") {
      return SA_B2200W;
    } else if (str == "SA_B2211W") {
      return SA_B2211W;
    } else if (str == "SA_B2221W") {
      return SA_B2221W;
    } else if (str == "SA_B2410W") {
      return SA_B2410W;
    } else if (str == "SA_B2410_290W") {
      return SA_B2410_290W;
    } else if (str == "SA_B3000W") {
      return SA_B3000W;
    } else if (str == "SA_B3100W") {
      return SA_B3100W;
    } else if (str == "SA_B3101W") {
      return SA_B3101W;
    } else if (str == "PR_A0030W") {
      return PR_A0030W;
    } else if (str == "PR_A0040W") {
      return PR_A0040W;
    } else if (str == "PR_A0060W") {
      return PR_A0060W;
    } else if (str == "PR_A4000W") {
      return PR_A4000W;
    } else if (str == "PR_A4100W") {
      return PR_A4100W;
    } else if (str == "PR_A5000W") {
      return PR_A5000W;
    } else if (str == "PR_A1100W") {
      return PR_A1100W;
    } else if (str == "PR_A9100W") {
      return PR_A9100W;
    } else if (str == "PR_B0020W") {
      return PR_B0020W;
    } else if (str == "PR_B3000W") {
      return PR_B3000W;
    } else if (str == "PR_A2000W") {
      return PR_A2000W;
    } else if (str == "PR_A3000W") {
      return PR_A3000W;
    } else if (str == "PR_A6000W") {
      return PR_A6000W;
    } else if (str == "PR_A7000W") {
      return PR_A7000W;
    } else if (str == "PR_A9000W") {
      return PR_A9000W;
    } else if (str == "QC_A0060W") {
      return QC_A0060W;
    } else if (str == "QC_A0120W") {
      return QC_A0120W;
    } else if (str == "QC_A2000W") {
      return QC_A2000W;
    } else if (str == "QC_A2500W") {
      return QC_A2500W;
    } else if (str == "QC_A3000W") {
      return QC_A3000W;
    } else if (str == "QC_A6000W") {
      return QC_A6000W;
    } else if (str == "QC_B0200W") {
      return QC_B0200W;
    } else if (str == "QC_B0300W") {
      return QC_B0300W;
    } else if (str == "QC_B0040W") {
      return QC_B0040W;
    } else if (str == "QC_B0030W") {
      return QC_B0030W;
    } else if (str == "SY_A0120W") {
      return SY_A0120W;
    } else if (str == "SY_A0110W") {
      return SY_A0110W;
    } else if (str == "SY_A0010W") {
      return SY_A0010W;
    } else if (str == "SY_A0010_301W") {
      return SY_A0010_301W;
    } else if (str == "SY_A0012W") {
      return SY_A0012W;
    } else if (str == "SY_A0013W") {
      return SY_A0013W;
    } else if (str == "SY_A0011W") {
      return SY_A0011W;
    } else if (str == "SY_A0100W") {
      return SY_A0100W;
    } else if (str == "SY_A0025W") {
      return SY_A0025W;
    } else if (str == "CM_A0000W") {
      return CM_A0000W;
    } else if (str == "CM_A1000W") {
      return CM_A1000W;
    } else if (str == "CM_A1600W") {
      return CM_A1600W;
    } else if (str == "CM_A1710W") {
      return CM_A1710W;
    } else if (str == "CM_A2000W") {
      return CM_A2000W;
    } else if (str == "CM_A3000W") {
      return CM_A3000W;
    } else if (str == "CM_A4100W") {
      return CM_A4100W;
    } else if (str == "CM_A5000W") {
      return CM_A5000W;
    } else if (str == "CM_A5001W") {
      return CM_A5001W;
    } else if (str == "CM_A7000W") {
      return CM_A7000W;
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
    } else if (str == "EA_A1000W") {
      return EA_A1000W;
    } else if (str == "EA_A2000W") {
      return EA_A2000W;
    } else if (str == "CT_A0111W") {
      return CT_A0111W;
    } else if (str == "HU_A1000W") {
      return HU_A1000W;
    } else if (str == "HU_A2070W") {
      return HU_A2070W;
    } else if (str == "HU_A2100W") {
      return HU_A2100W;
    } else if (str == "HU_A2140W") {
      return HU_A2140W;
    } else if (str == "HU_A3020W") {
      return HU_A3020W;
    } else if (str == "HU_A4100W") {
      return HU_A4100W;
    } else if (str == "HU_A5020W") {
      return HU_A5020W;
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
    } else if (str == "HU_B3140W") {
      return HU_B3140W;
    } else if (str == "HU_B3160W") {
      return HU_B3140W;
    } else if (str == "HU_B3180W") {
      return HU_B3140W;
    } else if (str == "HU_B3220W") {
      return HU_B3220W;
    } else if (str == "HU_B4001W") {
      return HU_B4001W;
    } else if (str == "HU_B4000W") {
      return HU_B4000W;
    } else if (str == "HU_B4010W") {
      return HU_B4010W;
    } else if (str == "AC_A0020W") {
      return AC_A0020W;
    } else if (str == "AC_A0030W") {
      return AC_A0030W;
    } else if (str == "AC_A0070W") {
      return AC_A0070W;
    } else if (str == "AC_A1000W") {
      return AC_A1000W;
    } else if (str == "AC_B1100W") {
      return AC_B1100W;
    } else if (str == "AC_B1240W") {
      return AC_B1240W;
    } else if (str == "AC_B1280W") {
      return AC_B1280W;
    } else if (str == "AC_B1300W") {
      return AC_B1300W;
    } else if (str == "AC_B1340W") {
      return AC_B1340W;
    } else if (str == "AC_B2080W") {
      return AC_B2080W;
    } else if (str == "AC_B3000W") {
      return AC_B3000W;
    } else if (str == "AC_B5000W") {
      return AC_B5000W;
    } else if (str == "AC_B5080W") {
      return AC_B5080W;
    } else if (str == "AC_B6020W") {
      return AC_B6020W;
    } else if (str == "AC_B6060W") {
      return AC_B6060W;
    } else if (str == "AC_B6080W") {
      return AC_B6080W;
    } else if (str == "AC_B8030W") {
      return AC_B8030W;
    } else if (str == "AC_B8040W") {
      return AC_B8040W;
    } else if (str == "AC_B8080W") {
      return AC_B8080W;
    } else if (str == "AC_B8100W") {
      return AC_B8100W;
    } else if (str == "TO_B0011W") {
      return TO_B0011W;
    } else if (str == "CHAT_A0001W") {
      return CHAT_A0001W;
    } else if (str == "CHAT_A0002W") {
      return CHAT_A0002W;
    } else if (str == "CHAT_TEST_TRAVEL_BOT") {
      return CHAT_TEST_TRAVEL_BOT;
    } else if (str == "GANTT") {
      return GANTT;
    } else if (str == "SA_B3600W") {
      return SA_B3600W;
    } else if (str == "PR_B1103W") {
      return PR_B1103W;
    } else if (str == "QC_B0100W") {
      return QC_B0100W;
    } else if (str == "PR_B1104W") {
      return PR_B1104W;
    } else if (str == "BA_A0020W_603") {
      return BA_A0020W_603;
    } else if (str == "CR_A0010W") {
      return CR_A0010W;
    } else if (str == "CR_A0020W") {
      return CR_A0020W;
    } else if (str == "CR_A0040W") {
      return CR_A0040W;
    } else if (str == "CR_A1001W") {
      return CR_A1001W;
    } else if (str == "CR_A1100W") {
      return CR_A1100W;
    } else if (str == "CR_A1101W") {
      return CR_A1101W;
    } else if (str == "QC_A2500_603W") {
      return QC_A2500_603W;
    } else if (str == "SA_A1000_603W") {
      return SA_A1000_603W;
    } else if (str == "SA_A1001_603W") {
      return SA_A1001_603W;
    } else if (str == "SA_A1100_603W") {
      return SA_A1100_603W;
    } else if (str == "SA_B1000W_603") {
      return SA_B1000W_603;
    } else if (str == "SA_B2216W") {
      return SA_B2216W;
    } else if (str == "SA_B2226W") {
      return SA_B2226W;
    } else if (str == "CR_A0000W") {
      return CR_A0000W;
    } else {
      if (loginResult.companyCode == "2302BA03") {
        return MainBIO;
      } else {
        return Main;
      }
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
          <Suspense fallback={<div></div>}>
            <GlobalStyle isMobileMenuOpend={isMobileMenuOpend} />
            <Router>
              <Switch>
                <Route path="/" component={Login} exact />

                <PanelBarNavContainerWEBERP>
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

                  {/* 기준정보 */}
                  <AuthRoute path="/AC_A0000W" component={AC_A0000W} exact />
                  <AuthRoute path="/BA_A0020W" component={BA_A0020W} exact />
                  <AuthRoute path="/BA_A0040W" component={BA_A0040W} exact />
                  <AuthRoute path="/BA_A0041W" component={BA_A0041W} exact />
                  <AuthRoute path="/BA_A0050W" component={BA_A0050W} exact />
                  <AuthRoute path="/BA_A0070W" component={BA_A0070W} exact />
                  <AuthRoute path="/BA_A0080W" component={BA_A0080W} exact />
                  <AuthRoute path="/BA_A0100W" component={BA_A0100W} exact />
                  <AuthRoute path="/BA_B0080W" component={BA_B0080W} exact />
                  <AuthRoute path="/CM_B8100W" component={CM_B8100W} exact />
                  <AuthRoute path="/SY_A0125W" component={SY_A0125W} exact />
                  <AuthRoute path="/SY_A0500W" component={SY_A0500W} exact />
                  {/* 물류관리 */}
                  <AuthRoute path="/MA_A0010W" component={MA_A0010W} exact />
                  <AuthRoute path="/MA_A1000W" component={MA_A1000W} exact />
                  <AuthRoute path="/MA_A2000W" component={MA_A2000W} exact />
                  <AuthRoute path="/MA_A2300W" component={MA_A2300W} exact />
                  <AuthRoute
                    path="/MA_A2310_606W"
                    component={MA_A2310_606W}
                    exact
                  />
                  <AuthRoute path="/MA_A2400W" component={MA_A2400W} exact />
                  <AuthRoute path="/MA_A2410W" component={MA_A2410W} exact />
                  <AuthRoute path="/MA_A2500W" component={MA_A2500W} exact />
                  <AuthRoute path="/MA_A2700W" component={MA_A2700W} exact />
                  <AuthRoute path="/MA_A3000W" component={MA_A3000W} exact />
                  <AuthRoute path="/MA_A7000W" component={MA_A7000W} exact />
                  <AuthRoute path="/MA_A3300W" component={MA_A3300W} exact />
                  <AuthRoute path="/MA_A3400W" component={MA_A3400W} exact />
                  <AuthRoute path="/MA_A3500W" component={MA_A3500W} exact />
                  <AuthRoute path="/MA_A9001W" component={MA_A9001W} exact />
                  <AuthRoute path="/MA_B2000W" component={MA_B2000W} exact />
                  <AuthRoute path="/MA_B2100W" component={MA_B2100W} exact />
                  <AuthRoute path="/MA_B2500W" component={MA_B2500W} exact />
                  <AuthRoute path="/MA_B2700W" component={MA_B2700W} exact />
                  <AuthRoute path="/MA_B2800W" component={MA_B2800W} exact />
                  <AuthRoute path="/MA_B3000W" component={MA_B3000W} exact />
                  <AuthRoute path="/MA_B3100W" component={MA_B3100W} exact />
                  <AuthRoute path="/MA_B7000W" component={MA_B7000W} exact />
                  <AuthRoute
                    path="/MA_B7000_606W"
                    component={MA_B7000_606W}
                    exact
                  />
                  <AuthRoute path="/MA_B7200W" component={MA_B7200W} exact />
                  <AuthRoute path="/MA_B7201W" component={MA_B7201W} exact />
                  {/* 영업관리 */}
                  <AuthRoute path="/SA_A2000W" component={SA_A2000W} exact />
                  <AuthRoute path="/SA_A2010W" component={SA_A2010W} exact />
                  <AuthRoute path="/SA_A2300W" component={SA_A2300W} exact />
                  <AuthRoute path="/SA_A3000W" component={SA_A3000W} exact />
                  <AuthRoute path="/SA_A5000W" component={SA_A5000W} exact />
                  <AuthRoute path="/SA_A5001W" component={SA_A5001W} exact />
                  <AuthRoute path="/SA_A5010W" component={SA_A5010W} exact />
                  <AuthRoute
                    path="/SA_A1100_603W"
                    component={SA_A1100_603W}
                    exact
                  />
                  <AuthRoute path="/SA_B2200W" component={SA_B2200W} exact />
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
                  <AuthRoute path="/SA_B3101W" component={SA_B3101W} exact />
                  {/* 생산관리 */}
                  <AuthRoute path="/PR_A0030W" component={PR_A0030W} exact />
                  <AuthRoute path="/PR_A0040W" component={PR_A0040W} exact />
                  <AuthRoute path="/PR_A0060W" component={PR_A0060W} exact />
                  <AuthRoute path="/PR_A4000W" component={PR_A4000W} exact />
                  <AuthRoute path="/PR_A4100W" component={PR_A4100W} exact />
                  <AuthRoute path="/PR_A5000W" component={PR_A5000W} exact />
                  <AuthRoute path="/PR_A1100W" component={PR_A1100W} exact />
                  <AuthRoute path="/PR_A9100W" component={PR_A9100W} exact />
                  <AuthRoute path="/PR_B0020W" component={PR_B0020W} exact />
                  <AuthRoute path="/PR_B3000W" component={PR_B3000W} exact />
                  <AuthRoute path="/PR_A2000W" component={PR_A2000W} exact />
                  <AuthRoute path="/PR_A3000W" component={PR_A3000W} exact />
                  <AuthRoute path="/PR_A6000W" component={PR_A6000W} exact />
                  <AuthRoute path="/PR_A7000W" component={PR_A7000W} exact />
                  <AuthRoute path="/PR_A9000W" component={PR_A9000W} exact />
                  {/* 품질관리 */}
                  <AuthRoute path="/QC_A0060W" component={QC_A0060W} exact />
                  <AuthRoute path="/QC_A0120W" component={QC_A0120W} exact />
                  <AuthRoute path="/QC_A2000W" component={QC_A2000W} exact />
                  <AuthRoute path="/QC_A2500W" component={QC_A2500W} exact />
                  <AuthRoute path="/QC_A3000W" component={QC_A3000W} exact />
                  <AuthRoute path="/QC_A6000W" component={QC_A6000W} exact />
                  <AuthRoute path="/QC_B0200W" component={QC_B0200W} exact />
                  <AuthRoute path="/QC_B0300W" component={QC_B0300W} exact />
                  <AuthRoute path="/QC_B0040W" component={QC_B0040W} exact />
                  <AuthRoute path="/QC_B0030W" component={QC_B0030W} exact />
                  {/* 시스템 */}
                  <AuthRoute path="/SY_A0120W" component={SY_A0120W} exact />
                  <AuthRoute path="/SY_A0110W" component={SY_A0110W} exact />
                  <AuthRoute path="/SY_A0010W" component={SY_A0010W} exact />
                  <AuthRoute path="/SY_A0012W" component={SY_A0012W} exact />
                  <AuthRoute path="/SY_A0013W" component={SY_A0013W} exact />
                  <AuthRoute path="/SY_A0011W" component={SY_A0011W} exact />
                  <AuthRoute path="/SY_A0100W" component={SY_A0100W} exact />
                  <AuthRoute path="/SY_A0025W" component={SY_A0025W} exact />
                  {/* 전사관리 */}
                  <AuthRoute path="/CM_A0000W" component={CM_A0000W} exact />
                  <AuthRoute path="/CM_A1000W" component={CM_A1000W} exact />
                  <AuthRoute path="/CM_A1600W" component={CM_A1600W} exact />
                  <AuthRoute path="/CM_A1710W" component={CM_A1710W} exact />
                  <AuthRoute path="/CM_A2000W" component={CM_A2000W} exact />
                  <AuthRoute path="/CM_A3000W" component={CM_A3000W} exact />
                  <AuthRoute path="/CM_A4100W" component={CM_A4100W} exact />
                  <AuthRoute path="/CM_A8000W" component={CM_A8000W} exact />
                  <AuthRoute path="/CM_A8210W" component={CM_A8210W} exact />
                  <AuthRoute path="/CM_A8250W" component={CM_A8250W} exact />
                  <AuthRoute path="/CM_B1000W" component={CM_B1000W} exact />
                  <AuthRoute path="/CM_B1101W" component={CM_B1101W} exact />
                  {/* 전자결재 */}
                  <AuthRoute path="/EA_A1000W" component={EA_A1000W} exact />
                  <AuthRoute path="/EA_A2000W" component={EA_A2000W} exact />
                  {/* 원가관리 */}
                  <AuthRoute path="/CT_A0111W" component={CT_A0111W} exact />
                  {/* 인사관리 */}
                  <AuthRoute path="/HU_A1000W" component={HU_A1000W} exact />
                  <AuthRoute path="/HU_A2070W" component={HU_A2070W} exact />
                  <AuthRoute path="/HU_A2100W" component={HU_A2100W} exact />
                  <AuthRoute path="/HU_A2140W" component={HU_A2140W} exact />
                  <AuthRoute path="/HU_A3020W" component={HU_A3020W} exact />
                  <AuthRoute path="/HU_A4100W" component={HU_A4100W} exact />
                  <AuthRoute path="/HU_A5020W" component={HU_A5020W} exact />
                  <AuthRoute path="/HU_B1020W" component={HU_B1020W} exact />
                  <AuthRoute path="/HU_B1040W" component={HU_B1040W} exact />
                  <AuthRoute path="/HU_B2100W" component={HU_B2100W} exact />
                  <AuthRoute path="/HU_B2120W" component={HU_B2120W} exact />
                  <AuthRoute path="/HU_B2140W" component={HU_B2140W} exact />
                  <AuthRoute path="/HU_B3140W" component={HU_B3140W} exact />
                  <AuthRoute path="/HU_B3160W" component={HU_B3160W} exact />
                  <AuthRoute path="/HU_B3180W" component={HU_B3180W} exact />
                  <AuthRoute path="/HU_B3220W" component={HU_B3220W} exact />
                  <AuthRoute path="/HU_B4001W" component={HU_B4001W} exact />
                  <AuthRoute path="/HU_B4000W" component={HU_B4000W} exact />
                  <AuthRoute path="/HU_B4010W" component={HU_B4010W} exact />

                  {/* 회계관리 */}
                  <AuthRoute path="/AC_A0020W" component={AC_A0020W} exact />
                  <AuthRoute path="/AC_A0030W" component={AC_A0030W} exact />
                  <AuthRoute path="/AC_A0070W" component={AC_A0070W} exact />
                  <AuthRoute path="/AC_A1000W" component={AC_A1000W} exact />
                  <AuthRoute path="/AC_B1100W" component={AC_B1100W} exact />
                  <AuthRoute path="/AC_B1240W" component={AC_B1240W} exact />
                  <AuthRoute path="/AC_B1280W" component={AC_B1280W} exact />
                  <AuthRoute path="/AC_B1300W" component={AC_B1300W} exact />
                  <AuthRoute path="/AC_B1340W" component={AC_B1340W} exact />
                  <AuthRoute path="/AC_B2080W" component={AC_B2080W} exact />
                  <AuthRoute path="/AC_B3000W" component={AC_B3000W} exact />
                  <AuthRoute path="/AC_B5000W" component={AC_B5000W} exact />
                  <AuthRoute path="/AC_B5080W" component={AC_B5080W} exact />
                  <AuthRoute path="/AC_B6020W" component={AC_B6020W} exact />
                  <AuthRoute path="/AC_B6060W" component={AC_B6060W} exact />
                  <AuthRoute path="/AC_B6080W" component={AC_B6080W} exact />
                  <AuthRoute path="/AC_B8030W" component={AC_B8030W} exact />
                  <AuthRoute path="/AC_B8040W" component={AC_B8040W} exact />
                  <AuthRoute path="/AC_B8080W" component={AC_B8080W} exact />
                  <AuthRoute path="/AC_B8100W" component={AC_B8100W} exact />
                  {/* 목형관리 */}
                  <AuthRoute path="/TO_B0011W" component={TO_B0011W} exact />
                  {/* CHAT BOT */}
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
                  <AuthRoute
                    path="/CHAT_TEST_TRAVEL_BOT"
                    component={CHAT_TEST_TRAVEL_BOT}
                    exact
                  />
                  {/* 연구개발 */}
                  <AuthRoute path="/GANTT" component={GANTT} exact />

                  {/*KPI관리 */}
                  <AuthRoute path="/SA_B3600W" component={SA_B3600W} exact />
                  <AuthRoute path="/PR_B1103W" component={PR_B1103W} exact />
                  <AuthRoute path="/QC_B0100W" component={QC_B0100W} exact />
                  <AuthRoute path="/PR_B1104W" component={PR_B1104W} exact />
                  {/* DDGD 고객페이지 */}
                  <AuthRoute path="/CR_A0000W" component={CR_A0000W} exact />
                  <AuthRoute path="/CR_A1101W" component={CR_A1101W} exact />
                  {/* 바이오톡스텍 대쉬보드 */}
                  <AuthRoute path="/SA_B2226W" component={SA_B2226W} exact />
                  <AuthRoute path="/SA_B2216W" component={SA_B2216W} exact />

                  {/* DDGD 관리자페이지 */}
                  <AuthRoute path="/CR_A0010W" component={CR_A0010W} exact />
                  <AuthRoute path="/CR_A0020W" component={CR_A0020W} exact />
                  <AuthRoute path="/CR_A0040W" component={CR_A0040W} exact />
                  <AuthRoute path="/CR_A1001W" component={CR_A1001W} exact />
                  <AuthRoute path="/CR_A1100W" component={CR_A1100W} exact />
                  <AuthRoute
                    path="/PS_A0060_301W"
                    component={PS_A0060_301W}
                    exact
                  />
                  <AuthRoute
                    path="/SY_A0010_301W"
                    component={SY_A0010_301W}
                    exact
                  />

                  {/*바이오톡스텍CRM */}
                  <AuthRoute
                    path="/BA_A0020W_603"
                    component={BA_A0020W_603}
                    exact
                  />
                  <AuthRoute
                    path="/QC_A2500_603W"
                    component={QC_A2500_603W}
                    exact
                  />
                  <AuthRoute path="/CM_A7000W" component={CM_A7000W} exact />
                  <AuthRoute
                    path="/SA_A1000_603W"
                    component={SA_A1000_603W}
                    exact
                  />
                  <AuthRoute
                    path="/SA_A1001_603W"
                    component={SA_A1001_603W}
                    exact
                  />
                  <AuthRoute
                    path="/SA_B1000W_603"
                    component={SA_B1000W_603}
                    exact
                  />
                  <AuthRoute path="/CM_A5000W" component={CM_A5000W} exact />
                  <AuthRoute path="/CM_A5001W" component={CM_A5001W} exact />

                  {/* PDA */}
                  <AuthRoute
                    path="/SA_A2300W_PDA"
                    component={SA_A2300W_PDA}
                    exact
                  />

                  {/* 에러페이지 */}
                  <AuthRoute path="/Error" component={NotFound} exact />
                </PanelBarNavContainerWEBERP>
              </Switch>
            </Router>
          </Suspense>
        </IntlProvider>
      </LocalizationProvider>
    </>
  );
  //}
};
export default App;
