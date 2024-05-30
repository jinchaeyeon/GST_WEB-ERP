import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input, TextArea } from "@progress/kendo-react-inputs";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInInput,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridTitle,
  GridTitleContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IAttachmentData, IWindowPosition } from "../../hooks/interfaces";
import {
  deletedNameState,
  isLoading,
  loginResultState,
  unsavedNameState,
} from "../../store/atoms";
import { Iparameters } from "../../store/types";
import ComboBoxCell from "../Cells/ComboBoxCell";
import NumberCell from "../Cells/NumberCell";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  convertDateToStr,
  dateformat,
  findMessage,
  getBizCom,
  getGridItemChangedData,
  numberWithCommas,
  toDate,
} from "../CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../CommonString";
import { CellRender, RowRender } from "../Renderers/Renderers";
import CustomersWindow from "./CommonWindows/CustomersWindow";
import PopUpAttachmentsWindow from "./CommonWindows/PopUpAttachmentsWindow";
import CopyWindow2 from "./SA_A5001W_Inven_Window";
import Window from "./WindowComponent/Window";

type IWindow = {
  workType: "N" | "U";
  data?: Idata;
  setVisible(t: boolean): void;
  reload(str: string): void; //data : 선택한 품목 데이터를 전달하는 함수
  modal?: boolean;
  pathname: string;
};
let temp = 0;
let targetRowIndex: null | number = null;

type TdataArr = {
  rowstatus_s: string[];
  seq2_s: string[];
  rtnyn_s: string[];
  rtntype_s: string[];
  ordnum_s: string[];
  ordseq_s: string[];
  portcd_s: string[];
  portnm_s: string[];
  shipnm_s: string[];
  pacmeth_s: string[];
  paymeth1_s: string[];
  prcterms_s: string[];
  poregnum_s: string[];
  itemgrade_s: string[];
  itemcd_s: string[];
  itemnm_s: string[];
  itemacnt_s: string[];
  qty_s: string[];
  qtyunit_s: string[];
  lenunit_s: string[];
  totlen_s: string[];
  unitwgt_s: string[];
  totwgt_s: string[];
  wgtunit_s: string[];
  unpcalmeth_s: string[];
  unp_s: string[];
  amt_s: string[];
  wonamt_s: string[];
  taxamt_s: string[];
  dlramt_s: string[];
  lotnum_s: string[];
  orglot_s: string[];
  heatno_s: string[];
  pcncd_s: string[];
  remark_s: string[];
  inrecdt_s: string[];
  inseq1_s: string[];
  inseq2_s: string[];
  gonum_s: string[];
  goseq_s: string[];
  connum_s: string[];
  conseq_s: string[];
  spno_s: string[];
  boxno_s: string[];
  endyn_s: string[];
  reqnum_s: string[];
  reqseq_s: string[];
  boxcd_s: string[];
  specialunp_s: string[];
};

type Idata = {
  acseq1: number;
  acseq2: number;
  actdt: string;
  actloca: string;
  amt: number;
  amtunit: string;
  attdatnum: string;
  baseamt: number;
  busadiv: string;
  cargb: string;
  cargocd: string;
  custcd: string;
  custnm: string;
  custprsncd: string;
  doexdiv: string;
  dvnm: string;
  dvnum: string;
  eregno: string;
  files: string;
  finaldes: string;
  gugancd: string;
  invoiceno: string;
  lcdt: string;
  lcno: string;
  location: string;
  orgdiv: string;
  outdt: string;
  outdt2: string;
  outkind: string;
  outtype: string;
  person: string;
  pgmdiv: string;
  port: string;
  qty: number;
  rcvcustcd: string;
  rcvcustnm: string;
  recdt: string;
  recdtfind: string;
  remark: string;
  seq1: number;
  shipdt: string;
  taxamt: number;
  taxdiv: string;
  taxdt: string;
  taxnum: string;
  taxtype: string;
  totamt: number;
  trcost: number;
  unprate: number;
  uschgrat: number;
  wonamt: number;
  wonchgrat: number;
};

let deletedMainRows: object[] = [];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_BA019", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal = field == "unpcalmeth" ? "L_BA019" : "";
  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );
  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td />
  );
};

const CopyWindow = ({
  workType,
  data,
  setVisible,
  reload,
  modal = false,
  pathname,
}: IWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 1600) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 900) / 2,
    width: isMobile == true ? deviceWidth : 1600,
    height: isMobile == true ? deviceHeight : 900,
  });
  const onChangePostion = (position: any) => {
    setPosition(position);
  };
  const DATA_ITEM_KEY = "num";

  const idGetter = getter(DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");

  //메시지 조회

  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null && workType != "U") {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA002,L_CUST, L_BA020,L_BA016,L_BA061,L_BA015, R_USEYN,L_BA005,L_BA029,L_BA171,L_BA172,L_BA173,R_YESNOALL",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [custcdListData, setCustcdListData] = useState([
    {
      custcd: "",
      custnm: "",
    },
  ]);
  const [itemacntListData, setItemacntListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [doexdivListData, setDoexdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [taxdivListData, setTaxdivListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [qtyunitListData, setQtyunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl1ListData, setItemlvl1ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl2ListData, setItemlvl2ListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl3ListData, setItemlvl3ListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  const [locationListData, setLocationListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setItemlvl1ListData(getBizCom(bizComponentData, "L_BA171"));
      setItemlvl2ListData(getBizCom(bizComponentData, "L_BA172"));
      setItemlvl3ListData(getBizCom(bizComponentData, "L_BA173"));
      setQtyunitListData(getBizCom(bizComponentData, "L_BA015"));
      setCustcdListData(getBizCom(bizComponentData, "L_CUST"));
      setDoexdivListData(getBizCom(bizComponentData, "L_BA005"));
      setTaxdivListData(getBizCom(bizComponentData, "L_BA029"));
      setItemacntListData(getBizCom(bizComponentData, "L_BA061"));
      setLocationListData(getBizCom(bizComponentData, "L_BA002"));
    }
  }, [bizComponentData]);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [custWindowVisible2, setCustWindowVisible2] = useState<boolean>(false);
  const [CopyWindowVisible, setCopyWindowVisible] = useState<boolean>(false);

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;
    if (name == "uschgrat" && value != filters.uschgrat) {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
      const newData = mainDataResult.data.map((item) => {
        return {
          ...item,
          rowstatus: item.rowstatus == "N" ? "N" : "U",
          amt:
            item.unpcalmeth == "Q" || item.unpcalmeth == ""
              ? filters.amtunit == "KRW"
                ? item.qty * item.unp
                : item.qty * item.unp * filters.wonchgrat
              : item.unpcalmeth == "F" || item.unpcalmeth == "L"
              ? filters.amtunit == "KRW"
                ? (item.len == undefined ? 0 : item.len) * item.unp
                : (item.len == undefined ? 0 : item.len) *
                  item.unp *
                  filters.wonchgrat
              : item.unpcalmeth == "W"
              ? filters.amtunit == "KRW"
                ? item.totwgt * item.unp
                : item.totwgt * item.unp * filters.wonchgrat
              : filters.amtunit == "KRW"
              ? item.amt
              : item.amt * filters.wonchgrat,
          wonamt:
            item.unpcalmeth == "Q" || item.unpcalmeth == ""
              ? filters.amtunit == "KRW"
                ? item.qty * item.unp
                : item.qty * item.unp * filters.wonchgrat
              : item.unpcalmeth == "F" || item.unpcalmeth == "L"
              ? filters.amtunit == "KRW"
                ? (item.len == undefined ? 0 : item.len) * item.unp
                : (item.len == undefined ? 0 : item.len) *
                  item.unp *
                  filters.wonchgrat
              : item.unpcalmeth == "W"
              ? filters.amtunit == "KRW"
                ? item.totwgt * item.unp
                : item.totwgt * item.unp * filters.wonchgrat
              : filters.amtunit == "KRW"
              ? item.amt
              : item.amt * filters.wonchgrat,
          taxamt: Math.round(
            filters.taxdiv == "A"
              ? item.unpcalmeth == "Q" || item.unpcalmeth == ""
                ? filters.amtunit == "KRW"
                  ? item.qty * item.unp * 0.1
                  : item.qty * item.unp * filters.wonchgrat * 0.1
                : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                ? filters.amtunit == "KRW"
                  ? (item.len == undefined ? 0 : item.len) * item.unp * 0.1
                  : (item.len == undefined ? 0 : item.len) *
                    item.unp *
                    filters.wonchgrat *
                    0.1
                : item.unpcalmeth == "W"
                ? filters.amtunit == "KRW"
                  ? item.totwgt * item.unp * 0.1
                  : item.totwgt * item.unp * filters.wonchgrat * 0.1
                : filters.amtunit == "KRW"
                ? item.amt * 0.1
                : item.amt * filters.wonchgrat * 0.1
              : 0
          ),
          totamt: Math.round(
            (item.unpcalmeth == "Q" || item.unpcalmeth == ""
              ? filters.amtunit == "KRW"
                ? item.qty * item.unp
                : item.qty * item.unp * filters.wonchgrat
              : item.unpcalmeth == "F" || item.unpcalmeth == "L"
              ? filters.amtunit == "KRW"
                ? (item.len == undefined ? 0 : item.len) * item.unp
                : (item.len == undefined ? 0 : item.len) *
                  item.unp *
                  filters.wonchgrat
              : item.unpcalmeth == "W"
              ? filters.amtunit == "KRW"
                ? item.totwgt * item.unp
                : item.totwgt * item.unp * filters.wonchgrat
              : filters.amtunit == "KRW"
              ? item.amt
              : item.amt * filters.wonchgrat) +
              Math.round(
                filters.taxdiv == "A"
                  ? filters.amtunit == "KRW"
                    ? (item.qty * item.unp) / 10
                    : (item.qty * item.unp * filters.wonchgrat) / 10
                  : 0
              )
          ),
          dlramt: Math.round(
            value != 0
              ? (item.unpcalmeth == "Q" || item.unpcalmeth == ""
                  ? filters.amtunit == "KRW"
                    ? item.qty * item.unp
                    : item.qty * item.unp * filters.wonchgrat
                  : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                  ? filters.amtunit == "KRW"
                    ? (item.len == undefined ? 0 : item.len) * item.unp
                    : (item.len == undefined ? 0 : item.len) *
                      item.unp *
                      filters.wonchgrat
                  : item.unpcalmeth == "W"
                  ? filters.amtunit == "KRW"
                    ? item.totwgt * item.unp
                    : item.totwgt * item.unp * filters.wonchgrat
                  : filters.amtunit == "KRW"
                  ? item.amt
                  : item.amt * filters.wonchgrat) * value
              : 0
          ),
        };
      });

      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }

    if (name == "wonchgrat" && value != filters.wonchgrat) {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
      const newData = mainDataResult.data.map((item) => {
        return {
          ...item,
          rowstatus: item.rowstatus == "N" ? "N" : "U",
          amt:
            item.unpcalmeth == "Q" || item.unpcalmeth == ""
              ? filters.amtunit == "KRW"
                ? item.qty * item.unp
                : item.qty * item.unp * value
              : item.unpcalmeth == "F" || item.unpcalmeth == "L"
              ? filters.amtunit == "KRW"
                ? (item.len == undefined ? 0 : item.len) * item.unp
                : (item.len == undefined ? 0 : item.len) * item.unp * value
              : item.unpcalmeth == "W"
              ? filters.amtunit == "KRW"
                ? item.totwgt * item.unp
                : item.totwgt * item.unp * value
              : filters.amtunit == "KRW"
              ? item.amt
              : item.amt * value,
          wonamt:
            item.unpcalmeth == "Q" || item.unpcalmeth == ""
              ? filters.amtunit == "KRW"
                ? item.qty * item.unp
                : item.qty * item.unp * value
              : item.unpcalmeth == "F" || item.unpcalmeth == "L"
              ? filters.amtunit == "KRW"
                ? (item.len == undefined ? 0 : item.len) * item.unp
                : (item.len == undefined ? 0 : item.len) * item.unp * value
              : item.unpcalmeth == "W"
              ? filters.amtunit == "KRW"
                ? item.totwgt * item.unp
                : item.totwgt * item.unp * value
              : filters.amtunit == "KRW"
              ? item.amt
              : item.amt * value,
          taxamt: Math.round(
            filters.taxdiv == "A"
              ? item.unpcalmeth == "Q" || item.unpcalmeth == ""
                ? filters.amtunit == "KRW"
                  ? item.qty * item.unp * 0.1
                  : item.qty * item.unp * value * 0.1
                : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                ? filters.amtunit == "KRW"
                  ? (item.len == undefined ? 0 : item.len) * item.unp * 0.1
                  : (item.len == undefined ? 0 : item.len) *
                    item.unp *
                    value *
                    0.1
                : item.unpcalmeth == "W"
                ? filters.amtunit == "KRW"
                  ? item.totwgt * item.unp * 0.1
                  : item.totwgt * item.unp * value * 0.1
                : filters.amtunit == "KRW"
                ? item.amt * 0.1
                : item.amt * value * 0.1
              : 0
          ),
          totamt: Math.round(
            (item.unpcalmeth == "Q" || item.unpcalmeth == ""
              ? filters.amtunit == "KRW"
                ? item.qty * item.unp
                : item.qty * item.unp * value
              : item.unpcalmeth == "F" || item.unpcalmeth == "L"
              ? filters.amtunit == "KRW"
                ? (item.len == undefined ? 0 : item.len) * item.unp
                : (item.len == undefined ? 0 : item.len) * item.unp * value
              : item.unpcalmeth == "W"
              ? filters.amtunit == "KRW"
                ? item.totwgt * item.unp
                : item.totwgt * item.unp * value
              : filters.amtunit == "KRW"
              ? item.amt
              : item.amt * value) +
              Math.round(
                filters.taxdiv == "A"
                  ? filters.amtunit == "KRW"
                    ? (item.qty * item.unp) / 10
                    : (item.qty * item.unp * value) / 10
                  : 0
              )
          ),
          dlramt: Math.round(
            filters.uschgrat != 0
              ? (item.unpcalmeth == "Q" || item.unpcalmeth == ""
                  ? filters.amtunit == "KRW"
                    ? item.qty * item.unp
                    : item.qty * item.unp * value
                  : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                  ? filters.amtunit == "KRW"
                    ? (item.len == undefined ? 0 : item.len) * item.unp
                    : (item.len == undefined ? 0 : item.len) * item.unp * value
                  : item.unpcalmeth == "W"
                  ? filters.amtunit == "KRW"
                    ? item.totwgt * item.unp
                    : item.totwgt * item.unp * value
                  : filters.amtunit == "KRW"
                  ? item.amt
                  : item.amt * value) * filters.uschgrat
              : 0
          ),
        };
      });

      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
    if (name == "rcvcustcd") {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
        rcvcustnm:
          custcdListData.find((item: any) => item.custcd == value)?.custnm ==
          undefined
            ? ""
            : custcdListData.find((item: any) => item.custcd == value)?.custnm,
      }));
    } else if (name == "rcvcustnm") {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
        rcvcustcd:
          custcdListData.find((item: any) => item.custnm == value)?.custcd ==
          undefined
            ? ""
            : custcdListData.find((item: any) => item.custnm == value)?.custcd,
      }));
    } else if (name == "custcd") {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
        custnm:
          custcdListData.find((item: any) => item.custcd == value)?.custnm ==
          undefined
            ? ""
            : custcdListData.find((item: any) => item.custcd == value)?.custnm,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    if (name == "amtunit" && value != filters.amtunit) {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
      const newData = mainDataResult.data.map((item) => {
        return {
          ...item,
          rowstatus: item.rowstatus == "N" ? "N" : "U",
          amt:
            item.unpcalmeth == "Q" || item.unpcalmeth == ""
              ? value == "KRW"
                ? item.qty * item.unp
                : item.qty * item.unp * filters.wonchgrat
              : item.unpcalmeth == "F" || item.unpcalmeth == "L"
              ? value == "KRW"
                ? (item.len == undefined ? 0 : item.len) * item.unp
                : (item.len == undefined ? 0 : item.len) *
                  item.unp *
                  filters.wonchgrat
              : item.unpcalmeth == "W"
              ? value == "KRW"
                ? item.totwgt * item.unp
                : item.totwgt * item.unp * filters.wonchgrat
              : value == "KRW"
              ? item.amt
              : item.amt * filters.wonchgrat,
          wonamt:
            item.unpcalmeth == "Q" || item.unpcalmeth == ""
              ? value == "KRW"
                ? item.qty * item.unp
                : item.qty * item.unp * filters.wonchgrat
              : item.unpcalmeth == "F" || item.unpcalmeth == "L"
              ? value == "KRW"
                ? (item.len == undefined ? 0 : item.len) * item.unp
                : (item.len == undefined ? 0 : item.len) *
                  item.unp *
                  filters.wonchgrat
              : item.unpcalmeth == "W"
              ? value == "KRW"
                ? item.totwgt * item.unp
                : item.totwgt * item.unp * filters.wonchgrat
              : value == "KRW"
              ? item.amt
              : item.amt * filters.wonchgrat,
          taxamt: Math.round(
            filters.taxdiv == "A"
              ? item.unpcalmeth == "Q" || item.unpcalmeth == ""
                ? value == "KRW"
                  ? item.qty * item.unp * 0.1
                  : item.qty * item.unp * filters.wonchgrat * 0.1
                : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                ? value == "KRW"
                  ? (item.len == undefined ? 0 : item.len) * item.unp * 0.1
                  : (item.len == undefined ? 0 : item.len) *
                    item.unp *
                    filters.wonchgrat *
                    0.1
                : item.unpcalmeth == "W"
                ? value == "KRW"
                  ? item.totwgt * item.unp * 0.1
                  : item.totwgt * item.unp * filters.wonchgrat * 0.1
                : value == "KRW"
                ? item.amt * 0.1
                : item.amt * filters.wonchgrat * 0.1
              : 0
          ),
          totamt: Math.round(
            (item.unpcalmeth == "Q" || item.unpcalmeth == ""
              ? value == "KRW"
                ? item.qty * item.unp
                : item.qty * item.unp * filters.wonchgrat
              : item.unpcalmeth == "F" || item.unpcalmeth == "L"
              ? value == "KRW"
                ? (item.len == undefined ? 0 : item.len) * item.unp
                : (item.len == undefined ? 0 : item.len) *
                  item.unp *
                  filters.wonchgrat
              : item.unpcalmeth == "W"
              ? value == "KRW"
                ? item.totwgt * item.unp
                : item.totwgt * item.unp * filters.wonchgrat
              : value == "KRW"
              ? item.amt
              : item.amt * filters.wonchgrat) +
              Math.round(
                filters.taxdiv == "A"
                  ? value == "KRW"
                    ? (item.qty * item.unp) / 10
                    : (item.qty * item.unp * filters.wonchgrat) / 10
                  : 0
              )
          ),
          dlramt: Math.round(
            filters.uschgrat != 0
              ? (item.unpcalmeth == "Q" || item.unpcalmeth == ""
                  ? value == "KRW"
                    ? item.qty * item.unp
                    : item.qty * item.unp * filters.wonchgrat
                  : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                  ? filters.amtunit == "KRW"
                    ? (item.len == undefined ? 0 : item.len) * item.unp
                    : (item.len == undefined ? 0 : item.len) *
                      item.unp *
                      filters.wonchgrat
                  : item.unpcalmeth == "W"
                  ? value == "KRW"
                    ? item.totwgt * item.unp
                    : item.totwgt * item.unp * filters.wonchgrat
                  : value == "KRW"
                  ? item.amt
                  : item.amt * filters.wonchgrat) * filters.uschgrat
              : 0
          ),
        };
      });

      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const onClose = () => {
    if (unsavedName.length > 0) setDeletedName(unsavedName);

    setVisible(false);
  };
  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  const onCustWndClick2 = () => {
    setCustWindowVisible2(true);
  };
  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };
  interface ICustData {
    address: string;
    custcd: string;
    custnm: string;
    custabbr: string;
    bizregnum: string;
    custdivnm: string;
    useyn: string;
    remark: string;
    compclass: string;
    ceonm: string;
  }
  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };
  const setCustData2 = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      rcvcustcd: data.custcd,
      rcvcustnm: data.custnm,
    }));
  };

  const processApi = useApi();
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const [filters, setFilters] = useState<{ [name: string]: any }>({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    reckey: "",
    outdt: new Date(),
    shipdt: null,
    person: userId,
    doexdiv: "",
    taxdiv: "",
    amtunit: "",
    wonchgrat: 0,
    uschgrat: 0,
    custcd: "",
    custnm: "",
    custprsncd: "",
    rcvcustcd: "",
    rcvcustnm: "",
    eregno: "",
    outtype: "",
    files: "",
    attdatnum: "",
    remark: "",
    acseq1: 0,
    acseq2: 0,
    amt: 0,
    qty: 0,
    taxamt: 0,
    wonamt: 0,
    baseamt: 0,
    totamt: 0,
    trcost: 0,
    unprate: 0,
    recdt: new Date(),
    seq1: 0,
    pgNum: 1,
    isSearch: false,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    const parameters: Iparameters = {
      procedureName: "P_SA_A5001W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_outdt": convertDateToStr(filters.outdt),
        "@p_outdt2": "",
        "@p_person": "",
        "@p_custcd": "",
        "@p_custnm": "",
        "@p_recdt": convertDateToStr(filters.recdt),
        "@p_seq1": filters.seq1,
        "@p_gubun1": "",
        "@p_gubun2": "",
        "@p_doexdiv": "",
        "@p_taxdiv": "",
        "@p_itemcd": "",
        "@p_itemnm": "",
        "@p_rcvcustcd": "",
        "@p_rcvcustnm": "",
        "@p_finaldes": "",
        "@p_cargocd": "",
        "@p_taxyn": "",
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setFilters((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  useEffect(() => {
    if (filters.isSearch && workType != "N") {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  useEffect(() => {
    if (workType == "U" && data != undefined) {
      setFilters((prev) => ({
        ...prev,
        acseq1: data.acseq1,
        acseq2: data.acseq2,
        actdt: data.actdt,
        actloca: data.actloca,
        amt: data.amt,
        amtunit: data.amtunit,
        attdatnum: data.attdatnum,
        baseamt: data.baseamt,
        busadiv: data.busadiv,
        cargb: data.cargb,
        cargocd: data.cargocd,
        custcd: data.custcd,
        custnm: data.custnm,
        custprsncd: data.custprsncd,
        doexdiv: data.doexdiv,
        dvnm: data.dvnm,
        dvnum: data.dvnum,
        eregno: data.eregno,
        files: data.files,
        finaldes: data.finaldes,
        gugancd: data.gugancd,
        invoiceno: data.invoiceno,
        lcdt: data.lcdt,
        lcno: data.lcno,
        location: data.location,
        orgdiv: data.orgdiv,
        outdt: toDate(data.outdt),
        outdt2: data.outdt2,
        outkind: data.outkind,
        outtype: data.outtype,
        person: data.person,
        pgmdiv: data.pgmdiv,
        port: data.port,
        qty: data.qty,
        rcvcustcd: data.rcvcustcd,
        rcvcustnm: data.rcvcustnm,
        recdt: toDate(data.recdt),
        recdtfind: data.recdtfind,
        remark: data.remark,
        seq1: data.seq1,
        shipdt: data.shipdt == "" ? null : toDate(data.shipdt),
        taxamt: data.taxamt,
        taxdiv: data.taxdiv,
        taxdt: data.taxdt.length == 8 ? new Date(dateformat(data.taxdt)) : null,
        taxnum: data.taxnum,
        taxtype: data.taxtype,
        totamt: data.totamt,
        trcost: data.trcost,
        unprate: data.unprate,
        uschgrat: data.uschgrat,
        wonamt: data.wonamt,
        wonchgrat: data.wonchgrat,
        isSearch: true,
        pgNum: 1,
      }));
    }
  }, []);
  let gridRef: any = useRef(null);
  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onCopyWndClick = () => {
    setCopyWindowVisible(true);
  };

  const getAttachmentsData = (data: IAttachmentData) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        attdatnum: data.attdatnum,
        files:
          data.original_name +
          (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : ""),
      };
    });
  };

  const setCopyData = (data: any) => {
    mainDataResult.data.map((item) => {
      if (item[DATA_ITEM_KEY] > temp) {
        temp = item[DATA_ITEM_KEY];
      }
    });

    data.map((item: any) => {
      const newDataItem = {
        [DATA_ITEM_KEY]: ++temp,
        amt:
          item.unpcalmeth == "Q" || item.unpcalmeth == ""
            ? filters.amtunit == "KRW"
              ? item.qty * item.unp
              : item.qty * item.unp * filters.wonchgrat
            : item.unpcalmeth == "F" || item.unpcalmeth == "L"
            ? filters.amtunit == "KRW"
              ? (item.len == undefined ? 0 : item.len) * item.unp
              : (item.len == undefined ? 0 : item.len) *
                item.unp *
                filters.wonchgrat
            : item.unpcalmeth == "W"
            ? filters.amtunit == "KRW"
              ? item.totwgt * item.unp
              : item.totwgt * item.unp * filters.wonchgrat
            : filters.amtunit == "KRW"
            ? item.amt
            : item.amt * filters.wonchgrat,
        amtunit: filters.amtunit,
        boxcd: "",
        boxno: "",
        chk: item.chk,
        connum: "",
        conseq: 0,
        contractno: "",
        countrycd: "",
        custcd: item.custcd,
        custnm: item.custnm,
        dlramt: Math.round(
          filters.uschgrat != 0
            ? (item.unpcalmeth == "Q" || item.unpcalmeth == ""
                ? filters.amtunit == "KRW" || filters.amtunit == ""
                  ? item.qty * item.unp
                  : item.qty * item.unp * filters.wonchgrat
                : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                ? filters.amtunit == "KRW" || filters.amtunit == ""
                  ? (item.len == undefined ? 0 : item.len) * item.unp
                  : (item.len == undefined ? 0 : item.len) *
                    item.unp *
                    filters.wonchgrat
                : item.unpcalmeth == "W"
                ? filters.amtunit == "KRW" || filters.amtunit == ""
                  ? item.totwgt * item.unp
                  : item.totwgt * item.unp * filters.wonchgrat
                : filters.amtunit == "KRW" || filters.amtunit == ""
                ? item.amt
                : item.amt * filters.wonchgrat) * filters.uschgrat
            : 0
        ),
        doexdiv: item.doexdiv,
        endyn: "",
        gonum: "",
        goseq: 0,
        heatno: "",
        inrecdt: "",
        inseq1: 0,
        inseq2: 0,
        insiz: item.insiz,
        itemacnt: item.itemacnt,
        itemcd: item.itemcd,
        itemgrade: "",
        itemlvl1: item.itemlvl1,
        itemlvl2: item.itemlvl2,
        itemlvl3: item.itemlvl3,
        itemnm: item.itemnm,
        lcno: "",
        lenunit: "",
        location: item.location,
        lotnum: item.lotnum,
        ordkey: item.ordkey,
        ordnum: item.ordnum,
        ordseq: item.ordseq,
        orgdiv: item.orgdiv,
        orglot: "",
        outdt: convertDateToStr(filters.outdt),
        outdt2: "",
        outkind: "",
        outtype: filters.outtype,
        pacmeth: "",
        paymeth1: "",
        pcncd: "",
        person: item.person,
        pgmdiv: "",
        poregnum: item.poregnum,
        portcd: "",
        portnm: item.portnm,
        prcterms: "",
        qty: item.qty,
        qtyunit: item.qtyunit,
        rcvcustcd: item.rcvcustcd,
        rcvcustnm: item.rcvcustnm,
        recdt: convertDateToStr(filters.recdt),
        remark: "",
        reqnum: "",
        reqseq: 0,
        rtntype: "",
        rtnyn: "",
        seq1: filters.seq1,
        seq2: 0,
        shipdt: filters.shipdt == null ? "" : convertDateToStr(filters.shipdt),
        shipnm: "",
        specialunp: 0,
        spno: 0,
        taxamt: Math.round(
          filters.taxdiv == "A"
            ? item.unpcalmeth == "Q" || item.unpcalmeth == ""
              ? filters.amtunit == "KRW"
                ? item.qty * item.unp * 0.1
                : item.qty * item.unp * filters.wonchgrat * 0.1
              : item.unpcalmeth == "F" || item.unpcalmeth == "L"
              ? filters.amtunit == "KRW"
                ? (item.len == undefined ? 0 : item.len) * item.unp * 0.1
                : (item.len == undefined ? 0 : item.len) *
                  item.unp *
                  filters.wonchgrat *
                  0.1
              : item.unpcalmeth == "W"
              ? filters.amtunit == "KRW"
                ? item.totwgt * item.unp * 0.1
                : item.totwgt * item.unp * filters.wonchgrat * 0.1
              : filters.amtunit == "KRW"
              ? item.amt * 0.1
              : item.amt * filters.wonchgrat * 0.1
            : 0
        ),
        totlen: 0,
        totwgt: item.totwgt,
        unitwgt: item.unitwgt,
        unp: item.unp,
        unpcalmeth: item.unpcalmeth,
        uschgrat: item.uschgrat,
        wgtunit: item.wgtunit,
        wonamt:
          item.unpcalmeth == "Q" || item.unpcalmeth == ""
            ? filters.amtunit == "KRW"
              ? item.qty * item.unp
              : item.qty * item.unp * filters.wonchgrat
            : item.unpcalmeth == "F" || item.unpcalmeth == "L"
            ? filters.amtunit == "KRW"
              ? (item.len == undefined ? 0 : item.len) * item.unp
              : (item.len == undefined ? 0 : item.len) *
                item.unp *
                filters.wonchgrat
            : item.unpcalmeth == "W"
            ? filters.amtunit == "KRW"
              ? item.totwgt * item.unp
              : item.totwgt * item.unp * filters.wonchgrat
            : filters.amtunit == "KRW"
            ? item.amt
            : item.amt * filters.wonchgrat,
        rowstatus: "N",
        wonchgrat: item.wonchgrat,
      };

      setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });

      setMainDataResult((prev) => {
        return {
          data: [newDataItem, ...prev.data],
          total: prev.total + 1,
        };
      });

      if (filters.custcd == "") {
        setFilters((prev) => ({
          ...prev,
          custcd: data[0].custcd,
          custnm: data[0].custnm,
        }));
      }
      if (filters.amtunit == "") {
        setFilters((prev) => ({
          ...prev,
          amtunit: data[0].amtunit,
        }));
      }
      if (filters.doexdiv == "") {
        setFilters((prev) => ({
          ...prev,
          doexdiv: data[0].doexdiv,
        }));
      }
      if (filters.taxdiv == "") {
        setFilters((prev) => ({
          ...prev,
          taxdiv: data[0].taxdiv,
        }));
      }
    });
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const editNumberFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult.data.forEach((item) =>
      props.field !== undefined
        ? (sum += parseFloat(
            item[props.field] == "" || item[props.field] == undefined
              ? 0
              : item[props.field]
          ))
        : 0
    );

    return (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {numberWithCommas(sum)}
      </td>
    );
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  // 부모로 데이터 전달, 창 닫기 (그리드 인라인 오픈 제외)
  const selectData = (selectedData: any) => {
    let valid = true;

    for (var i = 0; i < mainDataResult.data.length; i++) {
      if (mainDataResult.data[i].qty == 0 && valid == true) {
        alert("수량을 채워주세요.");
        valid = false;
        return false;
      }
    }

    try {
      if (mainDataResult.data.length == 0) {
        throw findMessage(messagesData, "SA_A5000W_003");
      } else if (
        convertDateToStr(filters.outdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.outdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.outdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.outdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "SA_A5001W_001");
      } else if (
        filters.amtunit == null ||
        filters.amtunit == "" ||
        filters.amtunit == undefined
      ) {
        throw findMessage(messagesData, "SA_A5001W_002");
      } else if (
        filters.custcd == null ||
        filters.custcd == "" ||
        filters.custcd == undefined
      ) {
        throw findMessage(messagesData, "SA_A5001W_002");
      } else if (
        filters.rcvcustcd == null ||
        filters.rcvcustcd == "" ||
        filters.rcvcustcd == undefined
      ) {
        throw findMessage(messagesData, "SA_A5001W_002");
      } else {
        if (valid == true) {
          const dataItem = mainDataResult.data.filter((item: any) => {
            return (
              (item.rowstatus == "N" || item.rowstatus == "U") &&
              item.rowstatus !== undefined
            );
          });

          if (dataItem.length == 0) {
            setParaData((prev) => ({
              ...prev,
              workType: workType,
              orgdiv: filters.orgdiv,
              recdt: filters.recdt,
              seq1: filters.seq1,
              busadiv: "",
              location: filters.location,
              doexdiv: filters.doexdiv,
              outkind: "",
              outtype: filters.outtype,
              outdt: filters.outdt,
              shipdt:
                filters.shipdt == null ? "" : convertDateToStr(filters.shipdt),
              person: filters.person,
              custcd: filters.custcd,
              rcvcustcd: filters.rcvcustcd,
              taxdiv: filters.taxdiv,
              amtunit: filters.amtunit,
              baseamt: filters.baseamt,
              wonchgrat: filters.wonchgrat,
              uschgrat: filters.uschgrat,
              contractno: "",
              remark: filters.remark,
              cargb: "",
              dvnm: "",
              dvnum: "",
              port: "",
              lcno: "",
              lcdt: "",
              actloca: "",
              actdt: "",
              acseq1: filters.acseq1,
              acseq2: filters.acseq2,
              eregno: filters.eregno,
              custprsncd: filters.custprsncd,
              unprate: filters.unprate,
              countrycd: "",
              custnm: filters.custnm,
              rcvcustnm: filters.rcvcustnm,
              attdatnum: filters.attdatnum,
              boxnm: "",
              wgt: "",
              userid: userId,
              pc: pc,
              form_id: "SA_A5001W",
              serviceid: companyCode,
            }));
          } else {
            let dataArr: TdataArr = {
              rowstatus_s: [],
              seq2_s: [],
              rtnyn_s: [],
              rtntype_s: [],
              ordnum_s: [],
              ordseq_s: [],
              portcd_s: [],
              portnm_s: [],
              shipnm_s: [],
              pacmeth_s: [],
              paymeth1_s: [],
              prcterms_s: [],
              poregnum_s: [],
              itemgrade_s: [],
              itemcd_s: [],
              itemnm_s: [],
              itemacnt_s: [],
              qty_s: [],
              qtyunit_s: [],
              lenunit_s: [],
              totlen_s: [],
              unitwgt_s: [],
              totwgt_s: [],
              wgtunit_s: [],
              unpcalmeth_s: [],
              unp_s: [],
              amt_s: [],
              wonamt_s: [],
              taxamt_s: [],
              dlramt_s: [],
              lotnum_s: [],
              orglot_s: [],
              heatno_s: [],
              pcncd_s: [],
              remark_s: [],
              inrecdt_s: [],
              inseq1_s: [],
              inseq2_s: [],
              gonum_s: [],
              goseq_s: [],
              connum_s: [],
              conseq_s: [],
              spno_s: [],
              boxno_s: [],
              endyn_s: [],
              reqnum_s: [],
              reqseq_s: [],
              boxcd_s: [],
              specialunp_s: [],
            };

            dataItem.forEach((item: any, idx: number) => {
              const {
                rowstatus = "",
                seq2 = "",
                rtnyn = "",
                rtntype = "",
                ordnum = "",
                ordseq = "",
                portcd = "",
                portnm = "",
                shipnm = "",
                pacmeth = "",
                paymeth1 = "",
                prcterms = "",
                poregnum = "",
                itemgrade = "",
                itemcd = "",
                itemnm = "",
                itemacnt = "",
                qty = "",
                qtyunit = "",
                lenunit = "",
                totlen = "",
                unitwgt = "",
                totwgt = "",
                wgtunit = "",
                unpcalmeth = "",
                unp = "",
                amt = "",
                wonamt = "",
                taxamt = "",
                dlramt = "",
                lotnum = "",
                orglot = "",
                heatno = "",
                pcncd = "",
                remark = "",
                inrecdt = "",
                inseq1 = "",
                inseq2 = "",
                gonum = "",
                goseq = "",
                connum = "",
                conseq = "",
                spno = "",
                boxno = "",
                endyn = "",
                reqnum = "",
                reqseq = "",
                boxcd = "",
                specialunp = "",
              } = item;
              dataArr.rowstatus_s.push(rowstatus);
              dataArr.seq2_s.push(seq2 == "" ? 0 : seq2);
              dataArr.rtnyn_s.push(rtnyn);
              dataArr.rtntype_s.push(rtntype);
              dataArr.ordnum_s.push(ordnum);
              dataArr.ordseq_s.push(ordseq);
              dataArr.portcd_s.push(portcd);
              dataArr.portnm_s.push(portnm);
              dataArr.shipnm_s.push(shipnm);
              dataArr.pacmeth_s.push(pacmeth);
              dataArr.paymeth1_s.push(paymeth1);
              dataArr.prcterms_s.push(prcterms);
              dataArr.poregnum_s.push(poregnum);
              dataArr.itemgrade_s.push(itemgrade);
              dataArr.itemcd_s.push(itemcd == undefined ? "" : itemcd);
              dataArr.itemnm_s.push(itemnm);
              dataArr.itemacnt_s.push(itemacnt == "" ? "" : itemacnt);
              dataArr.qty_s.push(qty == "" ? 0 : qty);
              dataArr.qtyunit_s.push(qtyunit == undefined ? "" : qtyunit);
              dataArr.lenunit_s.push(lenunit);
              dataArr.totlen_s.push(totlen);
              dataArr.unitwgt_s.push(unitwgt == "" ? 0 : unitwgt);
              dataArr.totwgt_s.push(totwgt == "" ? 0 : totwgt);
              dataArr.wgtunit_s.push(wgtunit == undefined ? "" : wgtunit);
              dataArr.unpcalmeth_s.push(
                unpcalmeth == undefined ? "Q" : unpcalmeth
              );
              dataArr.unp_s.push(unp == "" ? 0 : unp);
              dataArr.amt_s.push(amt == "" ? 0 : amt);
              dataArr.wonamt_s.push(wonamt == "" ? 0 : wonamt);
              dataArr.taxamt_s.push(taxamt == "" ? 0 : taxamt);
              dataArr.dlramt_s.push(dlramt == "" ? 0 : dlramt);
              dataArr.lotnum_s.push(lotnum);
              dataArr.orglot_s.push(orglot);
              dataArr.heatno_s.push(heatno);
              dataArr.pcncd_s.push(pcncd);
              dataArr.remark_s.push(remark == undefined ? "" : remark);
              dataArr.inrecdt_s.push(inrecdt);
              dataArr.inseq1_s.push(inseq1);
              dataArr.inseq2_s.push(inseq2);
              dataArr.gonum_s.push(gonum);
              dataArr.goseq_s.push(goseq);
              dataArr.connum_s.push(connum);
              dataArr.conseq_s.push(conseq);
              dataArr.spno_s.push(spno);
              dataArr.boxno_s.push(boxno);
              dataArr.endyn_s.push(endyn);
              dataArr.reqnum_s.push(reqnum);
              dataArr.reqseq_s.push(reqseq);
              dataArr.boxcd_s.push(boxcd);
              dataArr.specialunp_s.push(specialunp);
            });
            deletedMainRows.forEach((item: any, idx: number) => {
              const {
                rowstatus = "",
                seq2 = "",
                rtnyn = "",
                rtntype = "",
                ordnum = "",
                ordseq = "",
                portcd = "",
                portnm = "",
                shipnm = "",
                pacmeth = "",
                paymeth1 = "",
                prcterms = "",
                poregnum = "",
                itemgrade = "",
                itemcd = "",
                itemnm = "",
                itemacnt = "",
                qty = "",
                qtyunit = "",
                lenunit = "",
                totlen = "",
                unitwgt = "",
                totwgt = "",
                wgtunit = "",
                unpcalmeth = "",
                unp = "",
                amt = "",
                wonamt = "",
                taxamt = "",
                dlramt = "",
                lotnum = "",
                orglot = "",
                heatno = "",
                pcncd = "",
                remark = "",
                inrecdt = "",
                inseq1 = "",
                inseq2 = "",
                gonum = "",
                goseq = "",
                connum = "",
                conseq = "",
                spno = "",
                boxno = "",
                endyn = "",
                reqnum = "",
                reqseq = "",
                boxcd = "",
                specialunp = "",
              } = item;
              dataArr.rowstatus_s.push(rowstatus);
              dataArr.seq2_s.push(seq2 == "" ? 0 : seq2);
              dataArr.rtnyn_s.push(rtnyn);
              dataArr.rtntype_s.push(rtntype);
              dataArr.ordnum_s.push(ordnum);
              dataArr.ordseq_s.push(ordseq);
              dataArr.portcd_s.push(portcd);
              dataArr.portnm_s.push(portnm);
              dataArr.shipnm_s.push(shipnm);
              dataArr.pacmeth_s.push(pacmeth);
              dataArr.paymeth1_s.push(paymeth1);
              dataArr.prcterms_s.push(prcterms);
              dataArr.poregnum_s.push(poregnum);
              dataArr.itemgrade_s.push(itemgrade);
              dataArr.itemcd_s.push(itemcd == undefined ? "" : itemcd);
              dataArr.itemnm_s.push(itemnm);
              dataArr.itemacnt_s.push(itemacnt == "" ? "" : itemacnt);
              dataArr.qty_s.push(qty == "" ? 0 : qty);
              dataArr.qtyunit_s.push(qtyunit == undefined ? "" : qtyunit);
              dataArr.lenunit_s.push(lenunit);
              dataArr.totlen_s.push(totlen);
              dataArr.unitwgt_s.push(unitwgt == "" ? 0 : unitwgt);
              dataArr.totwgt_s.push(totwgt == "" ? 0 : totwgt);
              dataArr.wgtunit_s.push(wgtunit == undefined ? "" : wgtunit);
              dataArr.unpcalmeth_s.push(
                unpcalmeth == undefined ? "Q" : unpcalmeth
              );
              dataArr.unp_s.push(unp == "" ? 0 : unp);
              dataArr.amt_s.push(amt == "" ? 0 : amt);
              dataArr.wonamt_s.push(wonamt == "" ? 0 : wonamt);
              dataArr.taxamt_s.push(taxamt == "" ? 0 : taxamt);
              dataArr.dlramt_s.push(dlramt == "" ? 0 : dlramt);
              dataArr.lotnum_s.push(lotnum);
              dataArr.orglot_s.push(orglot);
              dataArr.heatno_s.push(heatno);
              dataArr.pcncd_s.push(pcncd);
              dataArr.remark_s.push(remark == undefined ? "" : remark);
              dataArr.inrecdt_s.push(inrecdt);
              dataArr.inseq1_s.push(inseq1);
              dataArr.inseq2_s.push(inseq2);
              dataArr.gonum_s.push(gonum);
              dataArr.goseq_s.push(goseq);
              dataArr.connum_s.push(connum);
              dataArr.conseq_s.push(conseq);
              dataArr.spno_s.push(spno);
              dataArr.boxno_s.push(boxno);
              dataArr.endyn_s.push(endyn);
              dataArr.reqnum_s.push(reqnum);
              dataArr.reqseq_s.push(reqseq);
              dataArr.boxcd_s.push(boxcd);
              dataArr.specialunp_s.push(specialunp);
            });

            setParaData((prev) => ({
              ...prev,
              workType: workType,
              orgdiv: filters.orgdiv,
              recdt: filters.recdt,
              seq1: filters.seq1,
              busadiv: "",
              location: filters.location,
              doexdiv: filters.doexdiv,
              outkind: "",
              outtype: filters.outtype,
              outdt: filters.outdt,
              shipdt:
                filters.shipdt == null ? "" : convertDateToStr(filters.shipdt),
              person: filters.person,
              custcd: filters.custcd,
              rcvcustcd: filters.rcvcustcd,
              taxdiv: filters.taxdiv,
              amtunit: filters.amtunit,
              baseamt: filters.baseamt,
              wonchgrat: filters.wonchgrat,
              uschgrat: filters.uschgrat,
              contractno: "",
              remark: filters.remark,
              cargb: "",
              dvnm: "",
              dvnum: "",
              port: "",
              lcno: "",
              lcdt: "",
              actloca: "",
              actdt: "",
              acseq1: filters.acseq1,
              acseq2: filters.acseq2,
              eregno: filters.eregno,
              custprsncd: filters.custprsncd,
              unprate: filters.unprate,
              countrycd: "",
              custnm: filters.custnm,
              rcvcustnm: filters.rcvcustnm,
              attdatnum: filters.attdatnum,
              boxnm: "",
              wgt: "",
              userid: userId,
              pc: pc,
              form_id: "SA_A5001W",
              serviceid: companyCode,
              rowstatus_s: dataArr.rowstatus_s.join("|"),
              seq2_s: dataArr.seq2_s.join("|"),
              rtnyn_s: dataArr.rtnyn_s.join("|"),
              rtntype_s: dataArr.rtntype_s.join("|"),
              ordnum_s: dataArr.ordnum_s.join("|"),
              ordseq_s: dataArr.ordseq_s.join("|"),
              portcd_s: dataArr.portcd_s.join("|"),
              portnm_s: dataArr.portnm_s.join("|"),
              shipnm_s: dataArr.shipnm_s.join("|"),
              pacmeth_s: dataArr.pacmeth_s.join("|"),
              paymeth1_s: dataArr.paymeth1_s.join("|"),
              prcterms_s: dataArr.prcterms_s.join("|"),
              poregnum_s: dataArr.poregnum_s.join("|"),
              itemgrade_s: dataArr.itemgrade_s.join("|"),
              itemcd_s: dataArr.itemcd_s.join("|"),
              itemnm_s: dataArr.itemnm_s.join("|"),
              itemacnt_s: dataArr.itemacnt_s.join("|"),
              qty_s: dataArr.qty_s.join("|"),
              qtyunit_s: dataArr.qtyunit_s.join("|"),
              lenunit_s: dataArr.lenunit_s.join("|"),
              totlen_s: dataArr.totlen_s.join("|"),
              unitwgt_s: dataArr.unitwgt_s.join("|"),
              totwgt_s: dataArr.totwgt_s.join("|"),
              wgtunit_s: dataArr.wgtunit_s.join("|"),
              unpcalmeth_s: dataArr.unpcalmeth_s.join("|"),
              unp_s: dataArr.unp_s.join("|"),
              amt_s: dataArr.amt_s.join("|"),
              wonamt_s: dataArr.wonamt_s.join("|"),
              taxamt_s: dataArr.taxamt_s.join("|"),
              dlramt_s: dataArr.dlramt_s.join("|"),
              lotnum_s: dataArr.lotnum_s.join("|"),
              orglot_s: dataArr.orglot_s.join("|"),
              heatno_s: dataArr.heatno_s.join("|"),
              pcncd_s: dataArr.pcncd_s.join("|"),
              remark_s: dataArr.remark_s.join("|"),
              inrecdt_s: dataArr.inrecdt_s.join("|"),
              inseq1_s: dataArr.inseq1_s.join("|"),
              inseq2_s: dataArr.inseq2_s.join("|"),
              gonum_s: dataArr.gonum_s.join("|"),
              goseq_s: dataArr.goseq_s.join("|"),
              connum_s: dataArr.connum_s.join("|"),
              conseq_s: dataArr.conseq_s.join("|"),
              spno_s: dataArr.spno_s.join("|"),
              boxno_s: dataArr.boxno_s.join("|"),
              endyn_s: dataArr.endyn_s.join("|"),
              reqnum_s: dataArr.reqnum_s.join("|"),
              reqseq_s: dataArr.reqseq_s.join("|"),
              boxcd_s: dataArr.boxcd_s.join("|"),
              specialunp_s: dataArr.specialunp_s.join("|"),
            }));
          }
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  const [ParaData, setParaData] = useState<{ [name: string]: any }>({
    pgSize: PAGE_SIZE,
    workType: "N",
    orgdiv: sessionOrgdiv,
    recdt: new Date(),
    seq1: 0,
    busadiv: "",
    location: sessionLocation,
    doexdiv: "A",
    outkind: "",
    outtype: "",
    outdt: new Date(),
    shipdt: "",
    person: "admin",
    custcd: "",
    rcvcustcd: "",
    taxdiv: "A",
    amtunit: "",
    baseamt: 0,
    wonchgrat: 0,
    uschgrat: 0,
    contractno: "",
    remark: "",
    cargb: "",
    dvnm: "",
    dvnum: "",
    port: "",
    lcno: "",
    lcdt: "",
    actloca: "",
    actdt: "",
    acseq1: 0,
    acseq2: 0,
    eregno: "",
    custprsncd: "",
    unprate: "",
    countrycd: "",
    custnm: "",
    rcvcustnm: "",
    attdatnum: "",

    rowstatus_s: "",
    seq2_s: "",
    rtnyn_s: "",
    rtntype_s: "",
    ordnum_s: "",
    ordseq_s: "",
    portcd_s: "",
    portnm_s: "",
    shipnm_s: "",
    pacmeth_s: "",
    paymeth1_s: "",
    prcterms_s: "",
    poregnum_s: "",
    itemgrade_s: "",
    itemcd_s: "",
    itemnm_s: "",
    itemacnt_s: "",
    qty_s: "",
    qtyunit_s: "",
    lenunit_s: "",
    totlen_s: "",
    unitwgt_s: "",
    totwgt_s: "",
    wgtunit_s: "",
    unpcalmeth_s: "",
    unp_s: "",
    amt_s: "",
    wonamt_s: "",
    taxamt_s: "",
    dlramt_s: "",
    lotnum_s: "",
    orglot_s: "",
    heatno_s: "",
    pcncd_s: "",
    remark_s: "",
    inrecdt_s: "",
    inseq1_s: "",
    inseq2_s: "",
    gonum_s: "",
    goseq_s: "",
    connum_s: "",
    conseq_s: "",
    spno_s: "",
    boxno_s: "",
    endyn_s: "",
    reqnum_s: "",
    reqseq_s: "",
    boxcd_s: "",
    boxnm: "",
    wgt: "",
    specialunp_s: "",
    boxno_b: "",
    wgtunit_b: "",
    boxcd_b: "",
    rowstatus2: "",
    remark_b: "",
    userid: userId,
    pc: pc,
    files: "",
  });

  const para: Iparameters = {
    procedureName: "P_SA_A5001W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_recdt": convertDateToStr(ParaData.recdt),
      "@p_seq1": ParaData.seq1,
      "@p_busadiv": ParaData.busadiv,
      "@p_location": ParaData.location,
      "@p_doexdiv": ParaData.doexdiv,
      "@p_outkind": ParaData.outkind,
      "@p_outtype": ParaData.outtype,
      "@p_outdt": convertDateToStr(ParaData.outdt),
      "@p_shipdt": ParaData.shipdt,
      "@p_person": ParaData.person,
      "@p_custcd": ParaData.custcd,
      "@p_rcvcustcd": ParaData.rcvcustcd,
      "@p_taxdiv": ParaData.taxdiv,
      "@p_amtunit": ParaData.amtunit,
      "@p_baseamt": ParaData.baseamt,
      "@p_wonchgrat": ParaData.wonchgrat,
      "@p_uschgrat": ParaData.uschgrat,
      "@p_contractno": ParaData.contractno,
      "@p_remark": ParaData.remark,
      "@p_cargb": ParaData.cargb,
      "@p_dvnm": ParaData.dvnm,
      "@p_dvnum": ParaData.dvnum,
      "@p_port": ParaData.port,
      "@p_lcno": ParaData.lcno,
      "@p_lcdt": ParaData.lcdt,
      "@p_actloca": ParaData.actloca,
      "@p_actdt": ParaData.actdt,
      "@p_acseq1": ParaData.acseq1,
      "@p_acseq2": ParaData.acseq2,
      "@p_eregno": ParaData.eregno,
      "@p_custprsncd": ParaData.custprsncd,
      "@p_unprate": ParaData.unprate,
      "@p_attdatnum": ParaData.attdatnum,
      "@p_rowstatus": ParaData.rowstatus_s,
      "@p_seq2": ParaData.seq2_s,
      "@p_rtnyn": ParaData.rtnyn_s,
      "@p_rtntype": ParaData.rtntype_s,
      "@p_ordnum": ParaData.ordnum_s,
      "@p_ordseq": ParaData.ordseq_s,
      "@p_custnm": ParaData.custnm,
      "@p_rcvcustnm": ParaData.rcvcustnm,
      "@p_countrycd": ParaData.countrycd,
      "@p_portcd": ParaData.portcd_s,
      "@p_portnm": ParaData.portnm_s,
      "@p_shipnm": ParaData.shipnm_s,
      "@p_pacmeth": ParaData.pacmeth_s,
      "@p_paymeth1": ParaData.paymeth1_s,
      "@p_prcterms": ParaData.prcterms_s,
      "@p_poregnum": ParaData.poregnum_s,
      "@p_itemgrade": ParaData.itemgrade_s,
      "@p_itemcd": ParaData.itemcd_s,
      "@p_itemnm": ParaData.itemnm_s,
      "@p_itemacnt": ParaData.itemacnt_s,
      "@p_qty": ParaData.qty_s,
      "@p_qtyunit": ParaData.qtyunit_s,
      "@p_lenunit": ParaData.lenunit_s,
      "@p_totlen": ParaData.totlen_s,
      "@p_unitwgt": ParaData.unitwgt_s,
      "@p_wgtunit": ParaData.wgtunit_s,
      "@p_totwgt": ParaData.totwgt_s,
      "@p_unpcalmeth": ParaData.unpcalmeth_s,
      "@p_unp": ParaData.unp_s,
      "@p_amt": ParaData.amt_s,
      "@p_dlramt": ParaData.dlramt_s,
      "@p_wonamt": ParaData.wonamt_s,
      "@p_taxamt": ParaData.taxamt_s,
      "@p_lotnum": ParaData.lotnum_s,
      "@p_orglot": ParaData.orglot_s,
      "@p_heatno": ParaData.heatno_s,
      "@p_pcncd": ParaData.pcncd_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_inrecdt": ParaData.inrecdt_s,
      "@p_inseq1": ParaData.inseq1_s,
      "@p_inseq2": ParaData.inseq2_s,
      "@p_gonum": ParaData.gonum_s,
      "@p_goseq": ParaData.goseq_s,
      "@p_connum": ParaData.connum_s,
      "@p_conseq": ParaData.conseq_s,
      "@p_spno": ParaData.spno_s,
      "@p_boxno": ParaData.boxno_s,
      "@p_endyn": ParaData.endyn_s,
      "@p_reqnum": ParaData.reqnum_s,
      "@p_reqseq": ParaData.reqseq_s,
      "@p_boxcd": ParaData.boxcd_s,
      "@p_boxnm": ParaData.boxnm,
      "@p_wgt": ParaData.wgt,
      "@p_specialunp": ParaData.specialunp_s,
      "@p_boxno_b": ParaData.boxno_b,
      "@p_wgtunit_b": ParaData.wgtunit_b,
      "@p_boxcd_b": ParaData.boxcd_b,
      "@p_rowstatus2": ParaData.rowstatus2,
      "@p_remark_b": ParaData.remark_b,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "P_SA_A5001W",
    },
  };

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      deletedMainRows = [];
      setUnsavedName([]);
      reload(data.returnString);
      if (workType == "N") {
        onClose();
      } else {
        setFilters((prev) => ({
          ...prev,
          isSearch: true,
          pgNum: 1,
          find_row_value: data.returnString,
        }));
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.custcd != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object3: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult.data.forEach((item: any, index: number) => {
      if (!selectedState[item[DATA_ITEM_KEY]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
          deletedMainRows.push(newData2);
        }
        Object3.push(index);
      }
    });

    if (Math.min(...Object3) < Math.min(...Object2)) {
      data = mainDataResult.data[Math.min(...Object2)];
    } else {
      data = mainDataResult.data[Math.min(...Object3) - 1];
    }

    setMainDataResult((prev) => ({
      data: newData,
      total: prev.total - Object3.length,
    }));
    setSelectedState({
      [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
    });
  };

  const onMainItemChange = (event: GridItemChangeEvent) => {
    setMainDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };

  const customCellRender = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit}
      editField={EDIT_FIELD}
    />
  );

  const customRowRender = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit}
      editField={EDIT_FIELD}
    />
  );

  const enterEdit = (dataItem: any, field: string) => {
    if (
      field != "insiz" &&
      field != "itemcd" &&
      field != "itemnm" &&
      field != "itemacnt" &&
      field != "qtyunit" &&
      field != "rowstatus" &&
      field != "itemlvl1" &&
      field != "itemlvl2" &&
      field != "itemlvl3"
    ) {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult((prev) => {
        return {
          data: mainDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult.data != mainDataResult.data) {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
          ? {
              ...item,
              rowstatus: item.rowstatus == "N" ? "N" : "U",
              amt:
                item.unpcalmeth == "Q" || item.unpcalmeth == ""
                  ? filters.amtunit == "KRW"
                    ? item.qty * item.unp
                    : item.qty * item.unp * filters.wonchgrat
                  : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                  ? filters.amtunit == "KRW"
                    ? (item.len == undefined ? 0 : item.len) * item.unp
                    : (item.len == undefined ? 0 : item.len) *
                      item.unp *
                      filters.wonchgrat
                  : item.unpcalmeth == "W"
                  ? filters.amtunit == "KRW"
                    ? item.totwgt * item.unp
                    : item.totwgt * item.unp * filters.wonchgrat
                  : filters.amtunit == "KRW"
                  ? item.amt
                  : item.amt * filters.wonchgrat,
              wonamt:
                item.unpcalmeth == "Q" || item.unpcalmeth == ""
                  ? filters.amtunit == "KRW"
                    ? item.qty * item.unp
                    : item.qty * item.unp * filters.wonchgrat
                  : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                  ? filters.amtunit == "KRW"
                    ? (item.len == undefined ? 0 : item.len) * item.unp
                    : (item.len == undefined ? 0 : item.len) *
                      item.unp *
                      filters.wonchgrat
                  : item.unpcalmeth == "W"
                  ? filters.amtunit == "KRW"
                    ? item.totwgt * item.unp
                    : item.totwgt * item.unp * filters.wonchgrat
                  : filters.amtunit == "KRW"
                  ? item.amt
                  : item.amt * filters.wonchgrat,
              taxamt: Math.round(
                filters.taxdiv == "A"
                  ? item.unpcalmeth == "Q" || item.unpcalmeth == ""
                    ? filters.amtunit == "KRW"
                      ? item.qty * item.unp * 0.1
                      : item.qty * item.unp * filters.wonchgrat * 0.1
                    : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                    ? filters.amtunit == "KRW"
                      ? (item.len == undefined ? 0 : item.len) * item.unp * 0.1
                      : (item.len == undefined ? 0 : item.len) *
                        item.unp *
                        filters.wonchgrat *
                        0.1
                    : item.unpcalmeth == "W"
                    ? filters.amtunit == "KRW"
                      ? item.totwgt * item.unp * 0.1
                      : item.totwgt * item.unp * filters.wonchgrat * 0.1
                    : filters.amtunit == "KRW"
                    ? item.amt * 0.1
                    : item.amt * filters.wonchgrat * 0.1
                  : 0
              ),
              totamt: Math.round(
                (item.unpcalmeth == "Q" || item.unpcalmeth == ""
                  ? filters.amtunit == "KRW"
                    ? item.qty * item.unp
                    : item.qty * item.unp * filters.wonchgrat
                  : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                  ? filters.amtunit == "KRW"
                    ? (item.len == undefined ? 0 : item.len) * item.unp
                    : (item.len == undefined ? 0 : item.len) *
                      item.unp *
                      filters.wonchgrat
                  : item.unpcalmeth == "W"
                  ? filters.amtunit == "KRW"
                    ? item.totwgt * item.unp
                    : item.totwgt * item.unp * filters.wonchgrat
                  : filters.amtunit == "KRW"
                  ? item.amt
                  : item.amt * filters.wonchgrat) +
                  Math.round(
                    filters.taxdiv == "A"
                      ? filters.amtunit == "KRW"
                        ? (item.qty * item.unp) / 10
                        : (item.qty * item.unp * filters.wonchgrat) / 10
                      : 0
                  )
              ),
              dlramt: Math.round(
                filters.uschgrat != 0
                  ? (item.unpcalmeth == "Q" || item.unpcalmeth == ""
                      ? filters.amtunit == "KRW"
                        ? item.qty * item.unp
                        : item.qty * item.unp * filters.wonchgrat
                      : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                      ? filters.amtunit == "KRW"
                        ? (item.len == undefined ? 0 : item.len) * item.unp
                        : (item.len == undefined ? 0 : item.len) *
                          item.unp *
                          filters.wonchgrat
                      : item.unpcalmeth == "W"
                      ? filters.amtunit == "KRW"
                        ? item.totwgt * item.unp
                        : item.totwgt * item.unp * filters.wonchgrat
                      : filters.amtunit == "KRW"
                      ? item.amt
                      : item.amt * filters.wonchgrat) * filters.uschgrat
                  : 0
              ),
              [EDIT_FIELD]: undefined,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );

      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        amt:
          item.unpcalmeth == "Q" || item.unpcalmeth == ""
            ? filters.amtunit == "KRW"
              ? item.qty * item.unp
              : item.qty * item.unp * filters.wonchgrat
            : item.unpcalmeth == "F" || item.unpcalmeth == "L"
            ? filters.amtunit == "KRW"
              ? (item.len == undefined ? 0 : item.len) * item.unp
              : (item.len == undefined ? 0 : item.len) *
                item.unp *
                filters.wonchgrat
            : item.unpcalmeth == "W"
            ? filters.amtunit == "KRW"
              ? item.totwgt * item.unp
              : item.totwgt * item.unp * filters.wonchgrat
            : filters.amtunit == "KRW"
            ? item.amt
            : item.amt * filters.wonchgrat,
        wonamt:
          item.unpcalmeth == "Q" || item.unpcalmeth == ""
            ? filters.amtunit == "KRW"
              ? item.qty * item.unp
              : item.qty * item.unp * filters.wonchgrat
            : item.unpcalmeth == "F" || item.unpcalmeth == "L"
            ? filters.amtunit == "KRW"
              ? (item.len == undefined ? 0 : item.len) * item.unp
              : (item.len == undefined ? 0 : item.len) *
                item.unp *
                filters.wonchgrat
            : item.unpcalmeth == "W"
            ? filters.amtunit == "KRW"
              ? item.totwgt * item.unp
              : item.totwgt * item.unp * filters.wonchgrat
            : filters.amtunit == "KRW"
            ? item.amt
            : item.amt * filters.wonchgrat,
        taxamt: Math.round(
          filters.taxdiv == "A"
            ? item.unpcalmeth == "Q" || item.unpcalmeth == ""
              ? filters.amtunit == "KRW"
                ? item.qty * item.unp * 0.1
                : item.qty * item.unp * filters.wonchgrat * 0.1
              : item.unpcalmeth == "F" || item.unpcalmeth == "L"
              ? filters.amtunit == "KRW"
                ? (item.len == undefined ? 0 : item.len) * item.unp * 0.1
                : (item.len == undefined ? 0 : item.len) *
                  item.unp *
                  filters.wonchgrat *
                  0.1
              : item.unpcalmeth == "W"
              ? filters.amtunit == "KRW"
                ? item.totwgt * item.unp * 0.1
                : item.totwgt * item.unp * filters.wonchgrat * 0.1
              : filters.amtunit == "KRW"
              ? item.amt * 0.1
              : item.amt * filters.wonchgrat * 0.1
            : 0
        ),
        totamt: Math.round(
          (item.unpcalmeth == "Q" || item.unpcalmeth == ""
            ? filters.amtunit == "KRW"
              ? item.qty * item.unp
              : item.qty * item.unp * filters.wonchgrat
            : item.unpcalmeth == "F" || item.unpcalmeth == "L"
            ? filters.amtunit == "KRW"
              ? (item.len == undefined ? 0 : item.len) * item.unp
              : (item.len == undefined ? 0 : item.len) *
                item.unp *
                filters.wonchgrat
            : item.unpcalmeth == "W"
            ? filters.amtunit == "KRW"
              ? item.totwgt * item.unp
              : item.totwgt * item.unp * filters.wonchgrat
            : filters.amtunit == "KRW"
            ? item.amt
            : item.amt * filters.wonchgrat) +
            Math.round(
              filters.taxdiv == "A"
                ? filters.amtunit == "KRW"
                  ? (item.qty * item.unp) / 10
                  : (item.qty * item.unp * filters.wonchgrat) / 10
                : 0
            )
        ),
        dlramt: Math.round(
          filters.uschgrat != 0
            ? (item.unpcalmeth == "Q" || item.unpcalmeth == ""
                ? filters.amtunit == "KRW"
                  ? item.qty * item.unp
                  : item.qty * item.unp * filters.wonchgrat
                : item.unpcalmeth == "F" || item.unpcalmeth == "L"
                ? filters.amtunit == "KRW"
                  ? (item.len == undefined ? 0 : item.len) * item.unp
                  : (item.len == undefined ? 0 : item.len) *
                    item.unp *
                    filters.wonchgrat
                : item.unpcalmeth == "W"
                ? filters.amtunit == "KRW"
                  ? item.totwgt * item.unp
                  : item.totwgt * item.unp * filters.wonchgrat
                : filters.amtunit == "KRW"
                ? item.amt
                : item.amt * filters.wonchgrat) * filters.uschgrat
            : 0
        ),
        [EDIT_FIELD]: undefined,
      }));
      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  return (
    <>
      <Window
        titles={workType == "N" ? "판매처리(수출)생성" : "판매처리(수출)정보"}
        positions={position}
        Close={onClose}
        modals={modal}
        onChangePostion={onChangePostion}
      >
        <FormBoxWrap>
          <FormBox>
            <tbody>
              <tr>
                <th>판매번호</th>
                <td>
                  <Input
                    name="reckey"
                    type="text"
                    value={filters.reckey}
                    className="readonly"
                  />
                </td>
                <th>사업장</th>
                <td>
                  <Input
                    name="location"
                    type="text"
                    value={
                      locationListData.find(
                        (item: any) => item.sub_code == filters.location
                      )?.code_name
                    }
                    className="readonly"
                  />
                </td>
                <th>판매일자</th>
                <td>
                  <div className="filter-item-wrap">
                    <DatePicker
                      name="outdt"
                      value={filters.outdt}
                      format="yyyy-MM-dd"
                      onChange={filterInputChange}
                      className="required"
                      placeholder=""
                    />
                  </div>
                </td>
                <th>선적일자</th>
                <td>
                  <div className="filter-item-wrap">
                    <DatePicker
                      name="shipdt"
                      value={filters.shipdt}
                      format="yyyy-MM-dd"
                      onChange={filterInputChange}
                      placeholder=""
                    />
                  </div>
                </td>
                <th>담당자</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="person"
                      value={filters.person}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                      textField="user_name"
                      valueField="user_id"
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>내수구분</th>
                <td>
                  <Input
                    name="doexdiv"
                    type="text"
                    value={
                      doexdivListData.find(
                        (item: any) => item.sub_code == filters.doexdiv
                      )?.code_name
                    }
                    className="readonly"
                  />
                </td>
                <th>과세구분</th>
                <td>
                  <Input
                    name="taxdiv"
                    type="text"
                    value={
                      taxdivListData.find(
                        (item: any) => item.sub_code == filters.taxdiv
                      )?.code_name
                    }
                    className="readonly"
                  />
                </td>
                <th>화폐단위</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="amtunit"
                      value={filters.amtunit}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                      className="required"
                    />
                  )}
                </td>
                <th>원화환율</th>
                <td>
                  <Input
                    name="wonchgrat"
                    type="number"
                    value={filters.wonchgrat}
                    onChange={filterInputChange}
                  />
                </td>
                <th>미화환율</th>
                <td>
                  <Input
                    name="uschgrat"
                    type="number"
                    value={filters.uschgrat}
                    onChange={filterInputChange}
                  />
                </td>
              </tr>
              <tr>
                <th>판매처코드</th>
                <td>
                  <Input
                    name="custcd"
                    type="text"
                    value={filters.custcd}
                    onChange={filterInputChange}
                    className="required"
                  />
                  <ButtonInInput>
                    <Button
                      onClick={onCustWndClick}
                      icon="more-horizontal"
                      fillMode="flat"
                    />
                  </ButtonInInput>
                </td>
                <th>판매처명</th>
                <td>
                  <Input
                    name="custnm"
                    type="text"
                    value={filters.custnm}
                    className="readonly"
                  />
                </td>
                <th>업체담당자</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="custprsncd"
                      value={filters.custprsncd}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                      textField="user_name"
                      valueField="user_id"
                    />
                  )}
                </td>
                <th>인수처코드</th>
                <td>
                  <Input
                    name="rcvcustcd"
                    type="text"
                    value={filters.rcvcustcd}
                    onChange={filterInputChange}
                    className="required"
                  />
                  <ButtonInInput>
                    <Button
                      onClick={onCustWndClick2}
                      icon="more-horizontal"
                      fillMode="flat"
                    />
                  </ButtonInInput>
                </td>
                <th>인수처명</th>
                <td>
                  <Input
                    name="rcvcustnm"
                    type="text"
                    value={filters.rcvcustnm}
                    className="readonly"
                  />
                </td>
              </tr>
              <tr>
                <th>수출신고번호</th>
                <td>
                  <Input
                    name="eregno"
                    type="text"
                    value={filters.eregno}
                    className="readonly"
                  />
                </td>
                <th>매출형태</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="outtype"
                      value={filters.outtype}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                    />
                  )}
                </td>
                <th>첨부파일</th>
                <td colSpan={5}>
                  <Input
                    name="files"
                    type="text"
                    value={filters.files}
                    className="readonly"
                  />
                  <ButtonInInput>
                    <Button
                      type={"button"}
                      onClick={onAttachmentsWndClick}
                      icon="more-horizontal"
                      fillMode="flat"
                    />
                  </ButtonInInput>
                </td>
              </tr>
              <tr>
                <th>비고</th>
                <td colSpan={9}>
                  <TextArea
                    value={filters.remark}
                    name="remark"
                    rows={2}
                    onChange={filterInputChange}
                  />
                </td>
              </tr>
            </tbody>
          </FormBox>
        </FormBoxWrap>
        <GridContainer height={`calc(100% - 390px)`}>
          <GridTitleContainer>
            <GridTitle>상세정보</GridTitle>
            <ButtonContainer>
              <Button
                themeColor={"primary"}
                onClick={onCopyWndClick}
                icon="folder-open"
              >
                자료참조
              </Button>
              <Button
                onClick={onDeleteClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="minus"
                title="행 삭제"
              ></Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            style={{ height: "100%" }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                itemacnt: itemacntListData.find(
                  (item: any) => item.sub_code == row.itemacnt
                )?.code_name,
                qtyunit: qtyunitListData.find(
                  (item: any) => item.sub_code == row.qtyunit
                )?.code_name,
                itemlvl1: itemlvl1ListData.find(
                  (item: any) => item.sub_code == row.itemlvl1
                )?.code_name,
                itemlvl2: itemlvl2ListData.find(
                  (item: any) => item.sub_code == row.itemlvl2
                )?.code_name,
                itemlvl3: itemlvl3ListData.find(
                  (item: any) => item.sub_code == row.itemlvl3
                )?.code_name,
                rowstatus:
                  row.rowstatus == null ||
                  row.rowstatus == "" ||
                  row.rowstatus == undefined
                    ? ""
                    : row.rowstatus,
                [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
              })),
              mainDataState
            )}
            onDataStateChange={onMainDataStateChange}
            {...mainDataState}
            //선택 subDataState
            dataItemKey={DATA_ITEM_KEY}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onSelectionChange}
            //스크롤 조회기능
            fixedScroll={true}
            total={mainDataResult.total}
            //정렬기능
            sortable={true}
            onSortChange={onMainSortChange}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
            onItemChange={onMainItemChange}
            cellRender={customCellRender}
            rowRender={customRowRender}
            editField={EDIT_FIELD}
          >
            <GridColumn field="rowstatus" title=" " width="50px" />
            <GridColumn
              field="itemcd"
              title="품목코드"
              width="150px"
              footerCell={mainTotalFooterCell}
            />
            <GridColumn field="itemnm" title="품목명" width="150px" />
            <GridColumn field="itemacnt" title="품목계정" width="120px" />
            <GridColumn field="insiz" title="규격" width="150px" />
            <GridColumn field="qtyunit" title="수량단위" width="120px" />
            <GridColumn
              field="unpcalmeth"
              title="단가산정방법"
              width="120px"
              cell={CustomComboBoxCell}
            />
            <GridColumn
              field="unitwgt"
              title="단량"
              width="100px"
              cell={NumberCell}
              footerCell={editNumberFooterCell}
            />
            <GridColumn
              field="qty"
              title="수량"
              width="100px"
              cell={NumberCell}
              footerCell={editNumberFooterCell}
            />
            <GridColumn
              field="totwgt"
              title="중량"
              width="100px"
              cell={NumberCell}
              footerCell={editNumberFooterCell}
            />
            <GridColumn
              field="specialunp"
              title="특정화폐단위단가"
              width="150px"
              cell={NumberCell}
            />
            <GridColumn
              field="unp"
              title="단가"
              width="100px"
              cell={NumberCell}
            />
            <GridColumn
              field="amt"
              title="금액"
              width="100px"
              cell={NumberCell}
              footerCell={editNumberFooterCell}
            />
            <GridColumn
              field="wonamt"
              title="원화금액"
              width="100px"
              cell={NumberCell}
              footerCell={editNumberFooterCell}
            />
            <GridColumn
              field="taxamt"
              title="세액"
              width="100px"
              cell={NumberCell}
              footerCell={editNumberFooterCell}
            />
            <GridColumn
              field="dlramt"
              title="달러금액"
              width="100px"
              cell={NumberCell}
              footerCell={editNumberFooterCell}
            />
            <GridColumn field="remark" title="비고" width="200px" />
            <GridColumn field="itemlvl1" title="대분류" width="120px" />
            <GridColumn field="itemlvl2" title="중분류" width="120px" />
            <GridColumn field="itemlvl3" title="소분류" width="120px" />
          </Grid>
          <BottomContainer>
            <ButtonContainer>
              <Button themeColor={"primary"} onClick={selectData}>
                저장
              </Button>
              <Button
                themeColor={"primary"}
                fillMode={"outline"}
                onClick={onClose}
              >
                닫기
              </Button>
            </ButtonContainer>
          </BottomContainer>
        </GridContainer>
      </Window>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={workType}
          setData={setCustData}
        />
      )}
      {custWindowVisible2 && (
        <CustomersWindow
          setVisible={setCustWindowVisible2}
          workType={workType}
          setData={setCustData2}
        />
      )}
      {CopyWindowVisible && (
        <CopyWindow2
          setVisible={setCopyWindowVisible}
          setData={setCopyData}
          custcd={filters.custcd}
          custnm={filters.custnm == undefined ? "" : filters.custnm}
          pathname={pathname}
        />
      )}
      {attachmentsWindowVisible && (
        <PopUpAttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={filters.attdatnum}
        />
      )}
    </>
  );
};

export default CopyWindow;
