import "./index.css";
import "primeflex/primeflex.css";
import "primeicons/primeicons.css"; // icons
import "primereact/resources/primereact.css"; // core css
import "primereact/resources/themes/lara-light-indigo/theme.css"; // theme
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
import APPDDGD from "./APPDDGD";
import APPWEBERP from "./APPWEBERP";
import "./flags.css";
import reportWebVitals from "./reportWebVitals";
import { ThemeSwitcherProvider } from "react-css-theme-switcher";

const root = ReactDOM.createRoot(document.getElementById("root")!);
const path = window.location.href;
const themes = {
  blue: `${process.env.PUBLIC_URL}/WEBERP.css`,
  yellow: `${process.env.PUBLIC_URL}/DDGD.css`,
};

const defaultTheme = path.includes("localhost")
  ? //WEB ERP개발할떄 바꿀부분입니다.
  //"yellow"
  "blue"
  :
  path.split("/")[2].split(".")[1] == "gsti"
  ? "blue"
  : path.split("/")[2].split(".")[1] == "ddgd"
  ? "yellow"
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
          {defaultTheme == "yellow" ? <APPDDGD /> : <APPWEBERP />}
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
