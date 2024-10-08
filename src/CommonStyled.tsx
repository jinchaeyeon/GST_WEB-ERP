import styled from "styled-components";
import { CLOSED_GNV_WIDTH, GNV_WIDTH } from "./components/CommonString";
import logoBIO from "./img/Biotoxtech.png";
import logoFNF from "./img/fnf_main_logo.jpg";
import loginBgSrc from "./img/login_bg.png";
import logoDDGD from "./img/login_ddgd.png";
import logoWEBERP from "./img/login_web_erp.png";
import logoSrc from "./img/logo.png";
import logoOLED from "./img/logoOLED.png";
import processStsSrc from "./img/process_16.png";
import successStsSrc from "./img/success_16.png";

export const WebErpcolorList: string[] = [
  "#2289c3",
  "#f798ae",
  "#ffe162",
  "#1fdd94",
  "#4b5ffa",
  "#14cae9",
];

export const DDGDcolorList: string[] = [
  "#f5b901",
  "#f798ae",
  "#ffe162",
  "#1fdd94",
  "#4b5ffa",
  "#14cae9",
];

export const ScrollableContainerBox = styled.div`
  padding: 10px;
  position: relative;
  height: 90%;
  overflow: hidden !important;

  .scroll-wrapper {
    height: 100%;
    overflow: auto !important;

    /* Scrollbar styles */
    ::-webkit-scrollbar {
      width: 8px !important; /* Set the width of the scrollbar */
    }

    ::-webkit-scrollbar-track {
      border-radius: 10px; /* Optional: Add border-radius to track */
    }

    ::-webkit-scrollbar-thumb {
      background-color: #dfdfdf; /* Set the color of the scroll thumb */
      border-radius: 10px; /* Set the border-radius of the scroll thumb */
    }

    ::-webkit-scrollbar-thumb:hover {
      background-color: #b6b6b6; /* Set the color when hovering */
    }
  }
  /* ::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 80px; /* control the height of the fade out effect 
    background-image: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 1)
    ); 
    pointer-events: none; /* let users still interact with the content 
  } */
`;

type TColor = {
  theme: string;
};

type TLayout = {
  top: number;
  left: number;
};

/*우클릭 이벤트 박스*/
export const ContextMenu = styled.div<TLayout>`
  position: fixed;
  width: 200px;
  background-color: #ffffff;
  border-radius: 5px;
  box-sizing: border-box;
  border: 1px solid black;
  z-index: 10000;
  top: ${(props) => props.top}px;
  left: ${(props) => props.left}px;

  ul {
    box-sizing: border-box;
    margin: 0;
    list-style: none;
  }
  ul li {
    padding: 10px 10px;
    font-weight: 600;
  }

  ul li:hover {
    cursor: pointer;
    background-color: #2289c3;
  }
`;

export const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
  padding-top: 10px;
  padding-bottom: 5px;

  .iot-title {
    font-size: 26px;
  }

  @media (max-width: 1200px) {
    display: inline-block;
    width: 100%;
    padding: 0 5px 5px 0;
  }
`;

export const LoginImg = styled.div`
  background: url(${loginBgSrc});
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center right;
  opacity: 0.9;
  height: 100%;
  width: 50%;
  top: 0;
  right: 0;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 1200px) {
    display: none;
  }
`;

export const LoginImgWEBERP = styled.div`
  background: url(${loginBgSrc});
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center right;
  opacity: 0.9;
  height: ${window.location.href.split("/")[2].split(".")[1] == "gsti"
    ? `calc(100% - 120px)`
    : `100%`};
  width: 50%;
  top: 0;
  right: 0;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 1200px) {
    display: none;
    height: 100%;
  }
`;

export const MainTopContainer = styled(TitleContainer)`
  padding-top: 20px;

  @media (max-width: 1200px) {
    padding-top: 0;
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const MainWorkStartEndContainer = styled.div`
  display: flex;
  float: right;
  margin-top: 20px;
  margin-left: auto;
  margin-right: 10px;

  input,
  button {
    margin-left: 5px;
  }

  @media (max-width: 1200px) {
    margin-left: 0;
    margin-bottom: 10px;
    margin-right: 0;
    margin-top: 0;
  }
`;

export const TextContainer = styled.div<TColor>`
  display: flex;
  border: 1px solid ${(props) => props.theme};
  color: ${(props) => props.theme};
  border-radius: 50px;
  width: 180px;
  line-height: 30px;
  align-items: center;
  justify-content: center;
`;

export const Title = styled.h3`
  font-size: 22px;
  font-weight: 600;
  color: #424242;
  margin-bottom: 10px;
`;

export const SubTitle = styled.h5`
  font-size: 15px;
  font-weight: 700;
  color: #7f7e7e;
  margin-bottom: 10px;
`;

type TButtonContainer = {
  flexDirection?: "column" | "row";
};
//  flex-wrap: wrap;
export const ButtonContainer = styled.div<TButtonContainer>`
  display: flex;
  justify-content: flex-end;
  flex-direction: ${(props) =>
    props.flexDirection ? props.flexDirection : "row"};
  align-items: center;
  padding: 5px 0px;

  input,
  button {
    margin-left: 5px;
  }

  .iot-btn {
    margin-top: 5px;
    margin-right: 10px;
    max-width: 250px;
    width: 100%;
    height: 120px;
    font-size: 32px;
    font-weight: 600;
    box-shadow: none;
  }
  .iot-btn.green {
    background-color: #6fab41;
    border-color: #6fab41;
  }
  .iot-btn.red {
    background-color: #ff4949;
    border-color: #ff4949;
  }
  .iot-btn.gray {
    background-color: gray;
    border-color: gray;
  }
  .iot-btn .k-icon {
    font-size: 32px;
  }

  @media (max-width: 1200px) {
    overflow: auto;
    flex-wrap: wrap;
  }
`;

export const BottomContainer = styled(TitleContainer)`
  flex-direction: row-reverse;
  button {
    width: 100px;
    height: 40px;
  }

  @media (max-width: 1200px) {
    padding-top: 5px;
  }
`;

export const FilterBoxWrap = styled.div`
  padding: 5px 0 10px;
  width: 100%;
`;

export const FilterBox = styled.table`
  /* line-height: 1.5; */
  border: solid 1px #d7d7d7;
  background-color: #fff;
  width: 100%;
  tr th + td {
    min-height: 40px;
  }
  tr th {
    background-color: #fafafa;
    border: solid 1px #d7d7d7;
    width: 120px;
    color: #333333;
    font-weight: 400;
    font-size: 13px;
    text-align: center;
    vertical-align: middle;
  }
  tr td {
    background-color: #ffffff;
    border: solid 1px #d7d7d7;
    width: 270px;
    text-align: center;
    padding: 5px;
    position: relative;
    vertical-align: middle;
  }
  .filter-item-wrap {
    display: flex;
    align-items: center;
  }
  .k-radio-list.k-list-horizontal {
    justify-content: center;
  }

  .PR_A3000W tr th,
  .PR_A3000W tr td {
    height: 80px;
    font-size: 26px;
    font-weight: 600;
  }
  .PR_A3000W tr th {
    font-size: 22px;
  }

  .PR_A3000W tr td .k-input-md,
  .PR_A3000W tr td .k-picker-md {
    height: 65px;
    font-size: 26px;
    font-weight: 600;
    padding-left: 10px;
  }

  @media (max-width: 1200px) {
    tr {
      display: flex;
      flex-direction: column;
    }
    tr th,
    tr td {
      width: 100%;
      border: none;
    }
    tr th {
      min-height: 35px;
      line-height: 35px;
    }
  }
`;

type TFormBoxWrap = {
  border?: boolean;
  className?: string;
};
export const FormBoxWrap = styled.div<TFormBoxWrap>`
  width: 100%;
  padding: 10px;
  overflow: auto;
  border: ${(props) =>
    props.border ? "solid 1px rgba(0, 0, 0, 0.08);" : undefined};
`;
export const FormBox = styled.table`
  /* line-height: 1.5; */
  /* border: solid 1px #d7d7d7;
  background-color: #fff; */
  width: 100%;

  tr th + td {
    min-height: 40px;
  }
  tr th {
    /* background-color: #f5f5f8;
    border: solid 1px #d7d7d7; */
    min-width: 120px;
    color: #333333;
    font-weight: 400;
    font-size: 13px;
    text-align: right;
    vertical-align: middle;
    padding-right: 10px;
    padding-left: 7px;
    text-align: right;
    white-space: pre;
    width: 10%;
  }
  tr td {
    /* background-color: #ffffff;
    border: solid 1px #d7d7d7; */
    text-align: center;
    padding: 5px;
    position: relative;
    vertical-align: middle;
    white-space: pre;
    width: auto;
  }
  .filter-item-wrap {
    display: flex;
    align-items: center;
  }
  .k-radio-list.k-list-horizontal {
    justify-content: center;
    border: solid 1px rgba(0, 0, 0, 0.08);
    border-radius: 4px;
  }
  @media (max-width: 1200px) {
    tr {
      display: flex;
      flex-direction: column;
    }
    tr th,
    tr td {
      width: 100%;
      border: none;
    }
    tr th {
      min-height: 35px;
      line-height: 35px;
    }
  }
`;

export const FormBoxFNF = styled.table`
  /* line-height: 1.5; */
  /* border: solid 1px #d7d7d7;
  background-color: #fff; */
  width: 100%;

  tr th + td {
    min-height: 40px;
  }
  tr th {
    /* background-color: #f5f5f8;
    border: solid 1px #d7d7d7; */
    color: #333333;
    font-weight: 400;
    font-size: 13px;
    text-align: right;
    vertical-align: middle;
    padding-right: 10px;
    padding-left: 7px;
    text-align: right;
  }
  tr td {
    /* background-color: #ffffff;
    border: solid 1px #d7d7d7; */
    width: 100px;
    text-align: center;
    padding: 5px;
    position: relative;
    vertical-align: middle;
  }
  .filter-item-wrap {
    display: flex;
    align-items: center;
  }
  .k-radio-list.k-list-horizontal {
    justify-content: center;
    border: solid 1px rgba(0, 0, 0, 0.08);
    border-radius: 4px;
  }
  @media (max-width: 1200px) {
    tr {
      display: flex;
      flex-direction: column;
    }
    tr th,
    tr td {
      width: 100%;
      border: none;
    }
    tr th {
      min-height: 35px;
      line-height: 35px;
    }
  }
`;

type TGridContainerWrap = {
  flexDirection?: "column" | "row" | "row-reverse" | "column-reverse";
  maxWidth?: string | number;
  height?: string | number;
  mobilemaxWidth?: number;
};

export const GridContainerWrap = styled.div<TGridContainerWrap>`
  display: flex;
  gap: ${(props) => (props.flexDirection == "column" ? "0" : "15px")};
  justify-content: space-between;
  flex-direction: ${(props) => props.flexDirection};
  max-width: ${(props) =>
    typeof props.maxWidth == "number" ? props.maxWidth + "px" : props.maxWidth};
  height: ${(props) =>
    typeof props.height == "number" ? props.height + "px" : props.height};

  @media (max-width: ${(props) =>
      props.mobilemaxWidth != undefined ? props.mobilemaxWidth : 1200}px) {
    flex-direction: column;
  }
`;

type TGridContainer = {
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;
  clientWidth?: number;
  height?: string;
  width?: string;
  inTab?: boolean;
  margin?: TMargin;
  overflowY?: string;
  mobilemaxWidth?: number;
  color?: string;
};

type TMargin = {
  left?: string;
  top?: string;
  bottom?: string;
  right?: string;
};

export const FormFieldWrap = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;

  @media (max-width: 1200px) {
    flex-direction: column;
  }
`;

export const GridContainer = styled.div<TGridContainer>`
  flex-direction: column;
  max-width: ${(props) => props.maxWidth};
  min-height: ${(props) => props.minHeight};
  max-height: ${(props) => props.maxHeight};
  overflow-y: ${(props) => (props.overflowY ? props.overflowY : "visible")};

  width: ${(props) =>
    props.width
      ? props.width
      : props.clientWidth
      ? "calc(" +
        props.clientWidth +
        "px - " +
        (props.inTab ? 65 : 0) + //65: 탭 마진
        "px - 150px)" //150: 기본 마진
      : ""};

  height: ${(props) => props.height};
  margin-top: ${(props) => (props.margin ? props.margin.top ?? "" : "")};
  margin-bottom: ${(props) => (props.margin ? props.margin.bottom ?? "" : "")};
  margin-left: ${(props) => (props.margin ? props.margin.left ?? "" : "")};
  margin-right: ${(props) => (props.margin ? props.margin.right ?? "" : "")};

  .k-grid {
    padding: 0px;
  }

  .k-scheduler {
    padding: 5px 0;
  }
  .k-grid .k-command-cell {
    text-align: center;
  }
  .k-grid td {
    white-space: nowrap; //그리드 셀 말줄임표
  }
  .k-radio-list.k-list-horizontal {
    justify-content: center;
  }
  /* .required {
    background-color: #fff0ef;
  } */

  .k-panelbar-item-icon.k-icon {
    color: ${(props) => props.color} !important;
  }

  .k-panelbar > .k-panelbar-header > .k-link.k-selected,
  .k-panelbar > .k-panelbar-header > .k-link.k-selected:hover,
  .k-panelbar-group > .k-panelbar-item > .k-link.k-selected,
  .k-panelbar-group > .k-panelbar-item > .k-link.k-selected:hover {
    background-color: ${(props) => props.color} !important;
  }

  @media (max-width: ${(props) =>
      props.mobilemaxWidth != undefined ? props.mobilemaxWidth : 1200}px) {
    width: 100%;
  }
`;

export const GridTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #424242;
  padding-bottom: 10px;
  @media (max-width: 1200px) {
    padding-top: 5px;
    text-align: left;
  }
`;

export const PrimaryP = styled.p<TColor>`
  color: black;
`;

export const PortraitPrint = styled.div`
  @media print {
    @page {
      size: 29.7cm 21cm;
      margin-top: 1cm;
      margin-right: 1cm;
      margin-bottom: 0cm;
      margin-left: 1cm;
    }
    /* html, body { border:0; margin:0; padding:0; margin-top:0px; }
	 */

    .printable {
      display: block;
    }

    #non-printable {
      display: none;
    }
  }
`;
export const LandscapePrint = styled.div`
  @media print {
    @page {
      size: 29.7cm 21cm;
      margin-top: 1cm;
      margin-right: 1cm;
      margin-bottom: 0cm;
      margin-left: 1cm;
    }
    /* html, body { border:0; margin:0; padding:0; margin-top:0px; }
	 */

    .printable {
      display: block;
    }

    #non-printable {
      display: none;
    }
  }
`;

export const DeliyReportPrint = styled.div`
  @media print {
    @page {
      size: 29.7cm 41.9958cm;
      margin-top: 1cm;
      margin-right: 1cm;
      margin-bottom: 0cm;
      margin-left: 1cm;
    }
    /* html, body { border:0; margin:0; padding:0; margin-top:0px; }
	 */

    .printable {
      display: block;
    }

    #non-printable {
      display: none;
    }
  }
`;

export const GridTitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0px;

  @media (max-width: 1200px) {
    display: inline-block;
    width: 100%;
  }
`;

export const ButtonInInput = styled.div`
  position: absolute;
  top: 50%;
  right: 5px;
  transform: translateY(-50%);
`;

export const ButtonInGridInput = styled.div`
  position: absolute;
  top: 3px;
  right: 12px;
`;

export const ButtonInFieldWrap = styled.div`
  position: relative;
`;

export const ButtonInField = styled(ButtonInInput)`
  top: -7px;
  right: 0;
`;

type TFieldWrap = {
  fieldWidth?: string;
};
export const FieldWrap = styled.div<TFieldWrap>`
  display: flex;
  justify-content: flex-start;
  align-items: center;

  > span {
    margin: 0 5px;
  }
  > span:first-child {
    margin-left: 0;
  }
  > span:last-child {
    margin-right: 0;
  }
  > .k-form-field {
    width: ${(props) => props.fieldWidth ?? ""};
  }
  .k-picker,
  .k-picker:hover,
  .k-picker.k-hover {
    background-color: #ffffff;
  }
`;

export const LoginBox = styled.div<TColor>`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => props.theme};
  height: 100%;
  width: 50%;
  border-top-left-radius: 300px;
  background-color: #fff;

  > form {
    width: 400px;
    padding: 50px;
    border-radius: 5px;
  }
  .k-button.login-btn {
    width: 100%;
    margin-top: 40px;
    height: 48px;
    font-size: 18px;
    font-weight: 600;
    background-color: ${(props) => props.theme};
    border-color: 1px solid ${(props) => props.theme};
  }
  .k-input {
    height: 44px;
    padding-left: 20px;
    font-size: 14px;
    border-color: rgba(0, 0, 0, 0.2);
  }
  .k-form-horizontal .k-form-field > .k-label,
  .k-form-horizontal .k-form-field > kendo-label,
  .k-form-horizontal .k-form-field > .k-form-label {
    align-items: flex-start;
    width: 25% !important;
  }
  .k-form-horizontal .k-form-field-wrap {
    max-width: calc(75% - 10px) !important;
  }
  @media (max-width: 1200px) {
    width: 100%;
  }
`;

export const LoginBoxFNF = styled.div<TColor>`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => props.theme};
  height: 100vh;
  width: 100%;
  border-top-left-radius: 300px;
  background-color: #fff;

  > form {
    width: 400px;
    padding: 50px;
    border-radius: 5px;
  }
  .k-button.login-btn {
    width: 100%;
    margin-top: 40px;
    height: 48px;
    font-size: 18px;
    font-weight: 600;
    background-color: ${(props) => props.theme};
    border-color: 1px solid ${(props) => props.theme};
  }
  .k-input {
    height: 44px;
    padding-left: 20px;
    font-size: 14px;
    border-color: rgba(0, 0, 0, 0.2);
  }
  .k-form-horizontal .k-form-field > .k-label,
  .k-form-horizontal .k-form-field > kendo-label,
  .k-form-horizontal .k-form-field > .k-form-label {
    align-items: flex-start;
    width: 25% !important;
  }
  .k-form-horizontal .k-form-field-wrap {
    max-width: calc(75% - 10px) !important;
  }
  @media (max-width: 1200px) {
    width: 100%;
  }
`;

export const RadioButtonBox = styled.div`
  display: flex;
`;

export const ApprovalBox = styled.div`
  display: flex;
  justify-content: space-evenly;
  width: 350px;
  height: 60px;
  border: solid 1px #dfdfdf;
  background-color: #fafafa;

  > div:nth-child(1) > div:last-child {
    background-color: #ffb849;
  }
  > div:nth-child(2) > div:last-child {
    background-color: #49c9ff;
  }
  > div:nth-child(3) > div:last-child {
    background-color: #ff8549;
  }

  @media (max-width: 1200px) {
    margin-top: 10px;
    margin-left: 0;
    width: 100%;
    height: 40px;
  }
`;

export const ApprovalInner = styled.div`
  display: flex;
  justify-content: space-evenly;
  width: 33%;
  height: 100%;
  align-items: center;

  :nth-child(2) {
    border-right: 0;
    border-left: 0;
  }
  > div:last-child {
    width: 40px;
    line-height: 35px;
    border-radius: 5px;
    vertical-align: middle;
    text-align: center;
    font-weight: 600;
    color: #fff;
  }
`;

export const InfoList = styled.ul<TColor>`
  display: flex;
  gap: 20px;
  display: flex;
  flex-direction: column;
  border: solid 1px #ebebeb;
  padding: 30px;
  border-radius: 15px;
  margin-top: 35px;

  .k-form-fieldset {
    margin: 0;
    border-top: solid 1px gainsboro;
    padding-top: 40px;
    margin-top: 20px;
    padding-bottom: 10px;
  }

  .k-form-field {
    margin: 0;
  }

  .k-form-field > .k-label {
    display: flex;
    justify-content: center;
    padding-top: 0;
  }

  .big-input {
    height: 50px;
    border: 1px solid ${(props) => props.theme};
    border-radius: 10px;
    color: ${(props) => props.theme};
    text-align: right;
    padding-left: 15px;
    font-size: 18px;
    font-weight: 600;
  }
`;
export const InfoTitle = styled.p`
  text-align: center;
  color: #727272;
  padding-bottom: 10px;
`;
export const InfoItem = styled.li`
  display: flex;
  justify-content: space-between;
`;
export const InfoLabel = styled.span``;
export const InfoValue = styled.span`
  font-weight: 600;
`;

export const NumberKeypad = styled.div`
  width: 100%;
  padding: 1%;
  border: solid 1px #f0f0f0;
  display: inline-block;
  @media (min-width: 1200px) {
    padding: 5px 0;
    padding-left: 5px;
  }
`;
export const NumberKeypadRow = styled.div`
  display: flex;
  justify-content: space-between;
`;
export const NumberKeypadCell = styled.div<TColor>`
  border: 1px solid ${(props) => props.theme};
  color: ${(props) => props.theme};
  font-size: 20px;
  text-align: center;
  border-radius: 5px;
  width: 100%;
  padding: 1%;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  :hover {
    background-color: ${(props) => props.theme};
    color: #ffffff;
  }
  :focus {
    background-color: ${(props) => props.theme};
    color: #ffffff;
  }
  :active {
    background-color: ${(props) => props.theme};
    color: #ffffff;
  }
`;

/*=================================================
	// PanelBarNavContainer 시작
=================================================*/

type TWrapper = {
  isMobileMenuOpend: boolean;
  theme: string;
};

export const Wrapper = styled.div<TWrapper>`
  display: flex;
  width: 100%;
  //overflow: ${(props) => (props.isMobileMenuOpend ? "hidden" : "auto")};
`;

type TGnvPanel = {
  height: string;
  isBoolean: boolean;
};

export const GnvPanel = styled.div<TGnvPanel>`
  overflow: scroll;
  position: fixed;
  width: ${GNV_WIDTH}px;
  height: ${(props) => props.height};
  display: ${(props) => (props.isBoolean ? "flex" : "")};
  flex-direction: column;
  justify-content: space-between;
  ::-webkit-scrollbar {
    display: none;
  }
`;

type TGnv = TWrapper;
export const Gnv = styled.div<TGnv>`
  width: ${GNV_WIDTH}px;
  text-align: center;

  border-right: 1px solid rgb(235, 235, 235);
  background-color: #fff;

  .logout span {
    color: #656565;
  }
  .logout > .k-link {
    justify-content: center;
  }

  .k-panelbar-item-icon.k-icon.k-i-gear,
  .k-panelbar-item-icon.k-icon.k-i-star,
  .k-panelbar-item-icon.k-icon.k-i-star-outline {
    color: ${(props) => props.theme} !important;
  }

  .k-selected > .k-panelbar-item-icon.k-icon.k-i-star-outline {
    color: #fff;
  }

  .k-panelbar-item-icon.k-icon.k-i-circle {
    color: transparent;
    /* color: #ebebeb; */
  }

  .k-panelbar > .k-panelbar-item.fav-menu > .k-link,
  .k-panelbar > .k-panelbar-item.fav-menu > div.k-animation-container {
    background-color: rgba(51, 122, 183, 0.05);
  }

  .k-panelbar .k-group > .k-item > .k-link,
  .k-panelbar .k-panelbar-group > .k-panelbar-item > .k-link {
    flex-direction: row-reverse;
    justify-content: space-between;
  }

  /*=================================================
	미디어 쿼리
	##Device = 모바일
	##Screen = 1200px 이하 해상도 모바일
  =================================================*/
  @media (max-width: 1200px) {
    display: ${(props) => (props.isMobileMenuOpend ? "block" : "none")};
    z-index: 10;
    position: fixed;
    height: 100vh;
    overflow: scroll;

    h1 {
      display: none;
    }
  }
`;

type ContentType = {
  isMenuOpen: boolean;
};
export const Content = styled.div<ContentType>`
  width: calc(
    100% - ${(props) => (props.isMenuOpen ? GNV_WIDTH : CLOSED_GNV_WIDTH)}px
  );
  /* 컨테이너 고정 추가 */
  left: calc(${(props) => (props.isMenuOpen ? GNV_WIDTH : "25")}px);
  height: 97vh;
  position: fixed;
  overflow: scroll;
  ::-webkit-scrollbar {
    display: none;
  }
  /*=================================================
  미디어 쿼리
  ##Device = 모바일
  ##Screen = 1200px 이하 해상도 모바일
  =================================================*/
  @media (max-width: 1200px) {
    width: 100%;
    left: 0;
    height: 100vh;
  }
`;

type FilterType = {
  isMenuOpen: number;
};

export const PageWrap = styled.div<FilterType>`
  padding: 0 15px;
  height: 100%;

  @media (max-width: 1200px) {
    min-height: auto;
    height: calc(
      100vh + ${(props) => (props.isMenuOpen ? props.isMenuOpen : 0)}px
    );
    position: relative;
    padding-top: 50px;
  }
`;

export const Footer = styled.div`
  width: 100%;
  height: 30px;
  position: fixed;
  bottom: 0;
  background-color: #656565;
  display: flex;
  align-items: center;
  z-index: 10000;

  a {
    width: 100%;
    display: flex;
    height: 100%;
    justify-content: space-between;
    line-height: 30px;
    color: #fff;
    padding-right: 10px;
    font-size: 13px;
    font-weight: 100;
    padding-left: 10px;
  }
  p {
    width: 100%;
    display: flex;
    height: 100%;
    justify-content: flex-end;
  }
  p > div {
    line-height: 30px;
    border-left: solid 1px gray;
    color: #fff;
    padding-right: 10px;
    padding-left: 10px;
    font-size: 13px;
    font-weight: 100;
  }
  a > p > div {
    line-height: 30px;
    border-left: solid 1px gray;
    color: #fff;
    padding-right: 10px;
    padding-left: 10px;
    font-size: 13px;
    font-weight: 100;
  }

  @media (max-width: 1200px) {
    display: none;
  }
`;

export const AppName = styled.h1<TColor>`
  font-size: 20px;
  color: ${(props) => props.theme};
  font-weight: 400;
  /* padding: 10px 0; */
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3px;
  background-color: #fff;
  cursor: pointer;

  @media (max-width: 1200px) {
    border-right: none;
  }
`;

export const MenuSearchBox = styled.div`
  padding: 5px;
  border-right: solid 1px #ebebeb;
  position: relative;

  input::placeholder {
    color: #bdbdbd;
  }
  .k-i-search {
    position: absolute;
    z-index: 1;
    top: 10px;
    right: 15px;
    color: #bdbdbd;
  }
`;

export const LoginAppName = styled(AppName)`
  background: url(${(props) => logoSrc});
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center right;
  width: 502px;
  height: 400px;
  background-color: transparent;
  font-size: 22px;
  gap: 5px;
`;

export const TopTitle = styled.div`
  min-width: ${GNV_WIDTH}px;
  /* text-align: center; */
  padding: 0 15px;
  display: none;
  justify-content: space-between;
  align-items: center;

  button {
    height: 30px;
  }

  /*=================================================
  미디어 쿼리
  ##Device = 모바일
  ##Screen = 1200px 이하 해상도 모바일
  =================================================*/
  @media (max-width: 1200px) {
    display: flex;
    position: fixed;
    z-index: 9;
    width: 100%;
    background-color: #fff;
  }
`;

type TModal = TGnv;
export const Modal = styled.div<TModal>`
  position: fixed;
  z-index: 10;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: ${(props) => (props.isMobileMenuOpend ? "block" : "none")};
  background-color: rgba(0, 0, 0, 0.4);
`;
/*=================================================
	// PanelBarNavContainer 종료
=================================================*/
type TLogo = { size: string; name: string; bio: boolean };

export const Logo = styled.div<TLogo>`
  background: url(${(props) =>
    props.bio == true
      ? logoBIO
      : props.name == "blue"
      ? logoWEBERP
      : props.name == "yellow"
      ? logoDDGD
      : props.name == "navy"
      ? logoFNF
      : props.name == "orange"
      ? logoOLED
      : logoWEBERP});
  background-size: contain;
  background-repeat: no-repeat;
  width: ${(props) => props.size};
  height: ${(props) => props.size};
  background-position: center;
`;

export const AdminQuestionBox = styled.div`
  padding: 15px;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;

  > div:nth-child(2) {
    width: 60%;
  }

  .title {
    font-size: 0.8rem;
    font-weight: 500;
  }
  .customer {
    font-size: 0.8rem;
    padding-top: 10px;
    font-weight: 400;
  }
  .date {
    font-size: 0.8rem;
  }
  .status {
    width: 60px;
    height: 32px;
    border-radius: 30px;
    padding: 0 5px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #877201;
    color: #fff;
    font-size: 0.8rem;
  }
  .Y {
    background-color: #f5b901;
  }

  .R {
    background-color: #f76700;
  }

  @media (max-width: 1200px) {
    min-width: auto;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;

    > div:nth-child(2) {
      width: 100%;
    }

    > .date {
      width: 100%;
      display: flex;
      justify-content: flex-end;
    }

    > .status {
      font-size: 0.7rem;
      width: 50px;
      height: 25px;
    }
  }
`;

type TScrollableContainer = {
  atBottom?: boolean;
};

export const ScrollableContainer = styled.div<TScrollableContainer>`
  border: solid 1px #ebebeb;
  border-radius: 10px;
  padding: 10px;
  position: relative;
  height: 100%;
  overflow: hidden;

  .scroll-wrapper {
    height: 100%;
    overflow: auto;
  }
  @media (max-width: 1200px) {
    border: 2px solid #f5b901;
  }
`;

type TStatusIcon = { status: string };

export const StatusIcon = styled.span<TStatusIcon>`
  background: url(${(props) => (props.status == "001" ? processStsSrc : "")});
  background-size: contain;
  background-repeat: no-repeat;
  width: 15px;
  height: 15px;
  background-position: center;
  display: inline-block;
  margin-right: 5px;
`;

type TAnsweIcon = { status: string };

export const AnswerIcon = styled.span<TAnsweIcon>`
  background: url(${(props) =>
    props.status == "N"
      ? processStsSrc
      : props.status == "Y"
      ? successStsSrc
      : processStsSrc});
  background-size: contain;
  background-repeat: no-repeat;
  width: 15px;
  height: 15px;
  background-position: center;
  display: inline-block;
  margin-right: 5px;
`;
