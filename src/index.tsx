import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
import "./flags.css";
import "primereact/resources/themes/lara-light-indigo/theme.css"; // theme
import "primereact/resources/primereact.css"; // core css
import "primeicons/primeicons.css"; // icons
import "primeflex/primeflex.css";
import { ThemeSwitcherProvider } from "react-css-theme-switcher";

const themes = {
  blue: `${process.env.PUBLIC_URL}/WEBERP-theme.css`,
  yellow: `${process.env.PUBLIC_URL}/DDGD-theme.css`,
};
const root = ReactDOM.createRoot(document.getElementById("root")!);
const path = window.location.href;

const defaultTheme = path.includes("localhost")
  ? "yellow"
  : path.split("/")[2].split(".")[1] == "gsti"
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
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </RecoilRoot>
  </ThemeSwitcherProvider>
  //</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
