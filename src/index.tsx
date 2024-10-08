import "primeflex/primeflex.css";
import "primeicons/primeicons.css"; // icons
import "primereact/resources/primereact.css"; // core css
import "primereact/resources/themes/lara-light-indigo/theme.css"; // theme
import "react-app-polyfill/stable";
import { ThemeSwitcherProvider } from "react-css-theme-switcher";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
import APP from "./APP";
import "./flags.css";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root")!);
const path = window.location.href;
const themes = {
  blue: `WEBERP.css`,
  yellow: `DDGD.css`,
  navy: `FNF.css`,
  orange: `OLED.css`,
};

const defaultTheme = path.includes("localhost")
  ? //WEB ERP개발할떄 바꿀부분입니다.
    //"yellow"
    "blue"
    //"navy"
    //"orange"
  : path.split("/")[2].split(".")[1] == "ddgd"
  ? "yellow"
  : path.split("/")[2].split(".")[0] == "fnf-test" //추후수정
  ? "navy"
  : path.split("/")[2].split(".")[0] == "ctp-oled"
  ? "orange"
  : "blue";

root.render(
  //<React.StrictMode>
  <ThemeSwitcherProvider
    themeMap={themes}
    defaultTheme={defaultTheme}
    insertionPoint="styles-insertion-point"
  >
    <RecoilRoot>
      <HelmetProvider>
        <BrowserRouter>
           <APP />
        </BrowserRouter>
      </HelmetProvider>
    </RecoilRoot>
  </ThemeSwitcherProvider>
  //</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
