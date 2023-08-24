import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input, TextArea } from "@progress/kendo-react-inputs";
import { bytesToBase64 } from "byte-base64";
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
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
  deletedAttadatnumsState,
  isLoading,
  loginResultState,
  unsavedAttadatnumsState,
} from "../../store/atoms";
import { Iparameters } from "../../store/types";
import NumberCell from "../Cells/NumberCell";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UseParaPc,
  convertDateToStr,
  dateformat,
  findMessage,
  getGridItemChangedData,
  getQueryFromBizComponent,
  isValidDate,
  toDate,
} from "../CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../CommonString";
import { CellRender, RowRender } from "../Renderers/Renderers";
import AttachmentsWindow from "./CommonWindows/AttachmentsWindow";
import CustomersWindow from "./CommonWindows/CustomersWindow";
import CopyWindow2 from "./SA_A5001W_Inven_Window";

type IWindow = {
  workType: "N" | "U";
  data?: Idata;
  setVisible(t: boolean): void;
  reload(str: string): void; //data : 선택한 품목 데이터를 전달하는 함수
  modal?: boolean;
};
let temp = 0;
let targetRowIndex: null | number = null;

type TdataArr = {
  rowstatus_s: string[];
  seq2_s: string[];
  itemcd_s: string[];
  itemacnt_s: string[];
  qty_s: string[];
  qtyunit_s: string[];
  unpcalmeth_s: string[];
  unp_s: string[];
  amt_s: string[];
  wonamt_s: string[];
  taxamt_s: string[];
  dlramt_s: string[];
  unitwgt_s: string[];
  totwgt_s: string[];
  wgtunit_s: string[];
  remark_s: string[];
  poregnum_s: string[];
  ordnum_s: string[];
  ordseq_s: string[];
  outrecdt_s: string[];
  outseq1_s: string[];
  outseq2_s: string[];
  sort_seq_s: string[];
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

const CopyWindow = ({
  workType,
  data,
  setVisible,
  reload,
  modal = false,
}: IWindow) => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 850;
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 1600,
    height: 900,
  });
  const DATA_ITEM_KEY = "num";

  const idGetter = getter(DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);
  const [pc, setPc] = useState("");
  const userId = UseGetValueFromSessionItem("user_id");
  UseParaPc(setPc);
  //메시지 조회
  const pathname: string = window.location.pathname.replace("/", "");
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  // 삭제할 첨부파일 리스트를 담는 함수
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null && workType != "U") {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;
      setFilters((prev) => ({
        ...prev,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA002,L_CUST, L_BA020,L_BA016,L_BA061,L_BA015, R_USEYN,L_BA005,L_BA029,L_BA171,L_BA172,L_BA173,R_YESNOALL,L_BA019",
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
  const [unpcalmethListData, setUnpcalmethListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [locationListData, setLocationListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      const locationQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA002")
      );
      const unpcalmethQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA019")
      );
      const itemacntQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA061")
      );
      const doexdivQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA005")
      );
      const taxdivQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA029")
      );
      const custcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_CUST")
      );
      const qtyunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA015")
      );
      const itemlvl1QueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA171")
      );
      const itemlvl2QueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA172")
      );
      const itemlvl3QueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA173")
      );
      fetchQuery(unpcalmethQueryStr, setUnpcalmethListData);
      fetchQuery(itemlvl1QueryStr, setItemlvl1ListData);
      fetchQuery(itemlvl2QueryStr, setItemlvl2ListData);
      fetchQuery(itemlvl3QueryStr, setItemlvl3ListData);
      fetchQuery(qtyunitQueryStr, setQtyunitListData);
      fetchQuery(custcdQueryStr, setCustcdListData);
      fetchQuery(doexdivQueryStr, setDoexdivListData);
      fetchQuery(taxdivQueryStr, setTaxdivListData);
      fetchQuery(itemacntQueryStr, setItemacntListData);
      fetchQuery(locationQueryStr, setLocationListData);
    }
  }, [bizComponentData]);

  const fetchQuery = useCallback(async (queryStr: string, setListData: any) => {
    let data: any;

    const bytes = require("utf8-bytes");
    const convertedQueryStr = bytesToBase64(bytes(queryStr));

    let query = {
      query: convertedQueryStr,
    };

    try {
      data = await processApi<any>("query", query);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const rows = data.tables[0].Rows;
      setListData(rows);
    }
  }, []);

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

  const handleMove = (event: WindowMoveEvent) => {
    setPosition({ ...position, left: event.left, top: event.top });
  };
  const handleResize = (event: WindowMoveEvent) => {
    setPosition({
      left: event.left,
      top: event.top,
      width: event.width,
      height: event.height,
    });
  };

  const onClose = () => {
    if (unsavedAttadatnums.length > 0)
      setDeletedAttadatnums(unsavedAttadatnums);

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

  const [filters, setFilters] = useState<{ [name: string]: any }>({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    location: "",
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

    if (data.isSuccess === true) {
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
        pgNum: 1,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  useEffect(() => {
    if (workType === "U" && data != undefined) {
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
        shipdt:
          data.shipdt.length == 8 ? new Date(dateformat(data.shipdt)) : null,
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
    if (!filters.attdatnum) {
      setUnsavedAttadatnums([data.attdatnum]);
    }

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
        amt: item.amt,
        amtunit: item.amtunit,
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
        shipdt: convertDateToStr(filters.shipdt),
        shipnm: "",
        specialunp: 0,
        spno: 0,
        taxamt: item.taxamt,
        totlen: 0,
        totwgt: item.totwgt,
        unitwgt: item.unitwgt,
        unp: item.unp,
        unpcalmeth: item.unpcalmeth,
        uschgrat: item.uschgrat,
        wgtunit: item.wgtunit,
        wonamt: item.wonamt,
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
          amtunit: data[0].amtunit,
          doexdiv: data[0].doexdiv,
          taxdiv: data[0].taxdiv,
        }));
      }
    });
  };

  const setCopyData2 = (data: any) => {
    mainDataResult.data.map((item) => {
      if (item[DATA_ITEM_KEY] > temp) {
        temp = item[DATA_ITEM_KEY];
      }
    });

    data.map((item: any) => {
      const newDataItem = {
        [DATA_ITEM_KEY]: ++temp,
        amt: item.amt,
        chk: item.chk,
        dlramt: item.dlramt,
        insiz: item.insiz,
        itemacnt: item.itemacnt,
        itemcd: item.itemcd,
        itemnm: item.itemnm,
        ordkey: item.ordnum + item.ordseq,
        ordnum: item.ordnum,
        ordseq: item.ordseq,
        orgdiv: "01",
        outrecdt: item.outdt,
        outreckey: item.outreckey,
        outseq1: 0,
        outseq2: 0,
        poregnum: "",
        qty: item.qty,
        qtyunit: item.qtyunit,
        recdt: convertDateToStr(filters.recdt),
        reckey: filters.reckey,
        remark: "",
        seq1: filters.seq1,
        seq2: 0,
        sort_seq: 0,
        taxamt: item.taxamt,
        totamt: item.totamt,
        totwgt: item.totwgt,
        unitwgt: item.unitwgt,
        unp: item.unp,
        unpcalmeth: item.unpcalmeth,
        wgtunit: item.wgtunit,
        wonamt: item.wonamt,
        rowstatus: "N",
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
          amtunit: data[0].amtunit == undefined ? "KRW" : data[0].amtunit,
          doexdiv: data[0].doexdiv == "" ? "A" : data[0].doexdiv,
          taxdiv: data[0].taxdiv == undefined ? "A" : data[0].taxdiv,
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
      for (var j = i + 1; j < mainDataResult.data.length; j++) {
        if (
          mainDataResult.data[i].sort_seq == mainDataResult.data[j].sort_seq &&
          valid == true
        ) {
          alert("정렬순서가 겹칩니다. 수정해주세요.");
          valid = false;
          return false;
        }
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
        throw findMessage(messagesData, "SA_A5000W_001");
      } else if (
        filters.person == null ||
        filters.person == "" ||
        filters.person == undefined
      ) {
        throw findMessage(messagesData, "SA_A5000W_004");
      } else if (
        filters.location == null ||
        filters.location == "" ||
        filters.location == undefined
      ) {
        throw findMessage(messagesData, "SA_A5000W_005");
      } else {
        if (valid == true) {
          const dataItem = mainDataResult.data.filter((item: any) => {
            return (
              (item.rowstatus === "N" || item.rowstatus === "U") &&
              item.rowstatus !== undefined
            );
          });

          setParaData((prev) => ({
            ...prev,
            workType: workType,
            location: filters.location,
            position: filters.position,
            outdt: filters.outdt,
            shipdt: filters.shipdt,
            doexdiv: filters.doexdiv,
            taxdiv: filters.taxdiv,
            amtunit: filters.amtunit,
            wonchgrat: filters.wonchgrat,
            uschgrat: filters.uschgrat,
            person: filters.person,
            custcd: filters.custcd,
            custnm: filters.custnm,
            recdt: filters.recdt,
            rcvcustcd: filters.rcvcustcd,
            rcvcustnm: filters.rcvcustnm,
            attdatnum: filters.attdatnum,
            remark: filters.remark,
            seq1: filters.seq1,
            userid: userId,
            pc: pc,
            form_id: "SA_A2300W",
            serviceid: companyCode,
            files: filters.files,
          }));
          if (dataItem.length === 0 && deletedMainRows.length == 0)
            return false;
          let dataArr: TdataArr = {
            rowstatus_s: [],
            seq2_s: [],
            itemcd_s: [],
            itemacnt_s: [],
            qty_s: [],
            qtyunit_s: [],
            unpcalmeth_s: [],
            unp_s: [],
            amt_s: [],
            wonamt_s: [],
            taxamt_s: [],
            dlramt_s: [],
            unitwgt_s: [],
            totwgt_s: [],
            wgtunit_s: [],
            remark_s: [],
            poregnum_s: [],
            ordnum_s: [],
            ordseq_s: [],
            outrecdt_s: [],
            outseq1_s: [],
            outseq2_s: [],
            sort_seq_s: [],
          };

          dataItem.forEach((item: any, idx: number) => {
            const {
              rowstatus = "",
              seq2 = "",
              itemcd = "",
              itemacnt = "",
              qty = "",
              qtyunit = "",
              unpcalmeth = "",
              unp = "",
              amt = "",
              wonamt = "",
              taxamt = "",
              dlramt = "",
              unitwgt = "",
              totwgt = "",
              wgtunit = "",
              remark = "",
              poregnum = "",
              ordnum = "",
              ordseq = "",
              outdt = "",
              outseq1 = "",
              outseq2 = "",
              sort_seq = "",
              outrecdt = "",
            } = item;
            dataArr.rowstatus_s.push(rowstatus);
            dataArr.seq2_s.push(seq2 == "" ? 0 : seq2);
            dataArr.itemcd_s.push(itemcd == undefined ? "" : itemcd);
            dataArr.itemacnt_s.push(itemacnt == "" ? "" : itemacnt);
            dataArr.qty_s.push(qty == "" ? 0 : qty);
            dataArr.qtyunit_s.push(qtyunit == undefined ? "" : qtyunit);
            dataArr.unpcalmeth_s.push(
              unpcalmeth == undefined ? "Q" : unpcalmeth
            );
            dataArr.unp_s.push(unp == "" ? 0 : unp);
            dataArr.amt_s.push(amt == "" ? 0 : amt);
            dataArr.wonamt_s.push(wonamt == "" ? 0 : wonamt);
            dataArr.taxamt_s.push(taxamt == "" ? 0 : taxamt);
            dataArr.dlramt_s.push(dlramt == "" ? 0 : dlramt);
            dataArr.unitwgt_s.push(unitwgt == "" ? 0 : unitwgt);
            dataArr.totwgt_s.push(totwgt == "" ? 0 : totwgt);
            dataArr.wgtunit_s.push(wgtunit == undefined ? "" : wgtunit);
            dataArr.remark_s.push(remark == undefined ? "" : remark);
            dataArr.poregnum_s.push(poregnum == undefined ? "" : poregnum);
            dataArr.ordnum_s.push(ordnum == undefined ? "" : ordnum);
            dataArr.ordseq_s.push(ordseq == "" ? 0 : ordseq);
            dataArr.outrecdt_s.push(
              outdt == "" ? (outrecdt == "" ? "" : outrecdt) : outdt
            );
            dataArr.outseq1_s.push(outseq1 == "" ? 0 : outseq1);
            dataArr.outseq2_s.push(outseq2 == "" ? 0 : outseq2);
            dataArr.sort_seq_s.push(sort_seq == "" ? 0 : sort_seq);
          });
          deletedMainRows.forEach((item: any, idx: number) => {
            const {
              rowstatus = "",
              seq2 = "",
              itemcd = "",
              itemacnt = "",
              qty = "",
              qtyunit = "",
              unpcalmeth = "",
              unp = "",
              amt = "",
              wonamt = "",
              taxamt = "",
              dlramt = "",
              unitwgt = "",
              totwgt = "",
              wgtunit = "",
              remark = "",
              poregnum = "",
              ordnum = "",
              ordseq = "",
              outdt = "",
              outseq1 = "",
              outseq2 = "",
              sort_seq = "",
              outrecdt = "",
            } = item;
            dataArr.rowstatus_s.push(rowstatus);
            dataArr.seq2_s.push(seq2 == "" ? 0 : seq2);
            dataArr.itemcd_s.push(itemcd == undefined ? "" : itemcd);
            dataArr.itemacnt_s.push(itemacnt == "" ? "" : itemacnt);
            dataArr.qty_s.push(qty == "" ? 0 : qty);
            dataArr.qtyunit_s.push(qtyunit == undefined ? "" : qtyunit);
            dataArr.unpcalmeth_s.push(
              unpcalmeth == undefined ? "Q" : unpcalmeth
            );
            dataArr.unp_s.push(unp == "" ? 0 : unp);
            dataArr.amt_s.push(amt == "" ? 0 : amt);
            dataArr.wonamt_s.push(wonamt == "" ? 0 : wonamt);
            dataArr.taxamt_s.push(taxamt == "" ? 0 : taxamt);
            dataArr.dlramt_s.push(dlramt == "" ? 0 : dlramt);
            dataArr.unitwgt_s.push(unitwgt == "" ? 0 : unitwgt);
            dataArr.totwgt_s.push(totwgt == "" ? 0 : totwgt);
            dataArr.wgtunit_s.push(wgtunit == undefined ? "" : wgtunit);
            dataArr.remark_s.push(remark == undefined ? "" : remark);
            dataArr.poregnum_s.push(poregnum == undefined ? "" : poregnum);
            dataArr.ordnum_s.push(ordnum == undefined ? "" : ordnum);
            dataArr.ordseq_s.push(ordseq == "" ? 0 : ordseq);
            dataArr.outrecdt_s.push(
              outdt == "" ? (outrecdt == "" ? "" : outrecdt) : outdt
            );
            dataArr.outseq1_s.push(outseq1 == "" ? 0 : outseq1);
            dataArr.outseq2_s.push(outseq2 == "" ? 0 : outseq2);
            dataArr.sort_seq_s.push(sort_seq == "" ? 0 : sort_seq);
          });
          setParaData((prev) => ({
            ...prev,
            workType: workType,
            rowstatus_s: dataArr.rowstatus_s.join("|"),
            seq2_s: dataArr.seq2_s.join("|"),
            itemcd_s: dataArr.itemcd_s.join("|"),
            itemacnt_s: dataArr.itemacnt_s.join("|"),
            qty_s: dataArr.qty_s.join("|"),
            qtyunit_s: dataArr.qtyunit_s.join("|"),
            unpcalmeth_s: dataArr.unpcalmeth_s.join("|"),
            unp_s: dataArr.unp_s.join("|"),
            amt_s: dataArr.amt_s.join("|"),
            dlramt_s: dataArr.dlramt_s.join("|"),
            wonamt_s: dataArr.wonamt_s.join("|"),
            taxamt_s: dataArr.taxamt_s.join("|"),
            unitwgt_s: dataArr.unitwgt_s.join("|"),
            totwgt_s: dataArr.totwgt_s.join("|"),
            wgtunit_s: dataArr.wgtunit_s.join("|"),
            remark_s: dataArr.remark_s.join("|"),
            poregnum_s: dataArr.poregnum_s.join("|"),
            ordnum_s: dataArr.ordnum_s.join("|"),
            ordseq_s: dataArr.ordseq_s.join("|"),
            outrecdt_s: dataArr.outrecdt_s.join("|"),
            outseq1_s: dataArr.outseq1_s.join("|"),
            outseq2_s: dataArr.outseq2_s.join("|"),
            sort_seq_s: dataArr.sort_seq_s.join("|"),
          }));
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "N",
    orgdiv: "01",
    recdt: new Date(),
    seq1: 0,
    location: "01",
    position: "",
    outdt: new Date(),
    shipdt: new Date(),
    doexdiv: "A",
    taxdiv: "A",
    amtunit: "",
    baseamt: 0,
    wonchgrat: 0,
    uschgrat: 0,
    person: "admin",
    custcd: "",
    custnm: "",
    rcvcustcd: "",
    rcvcustnm: "",
    attdatnum: "",
    remark: "",
    rowstatus_s: "",
    seq2_s: "",
    itemcd_s: "",
    itemacnt_s: "",
    qty_s: "",
    qtyunit_s: "",
    unpcalmeth_s: "",
    unp_s: "",
    amt_s: "",
    wonamt_s: "",
    taxamt_s: "",
    dlramt_s: "",
    unitwgt_s: "",
    totwgt_s: "",
    wgtunit_s: "",
    remark_s: "",
    poregnum_s: "",
    ordnum_s: "",
    ordseq_s: "",
    outrecdt_s: "",
    outseq1_s: "",
    outseq2_s: "",
    sort_seq_s: "",
    userid: userId,
    pc: pc,
    files: "",
  });

  const para: Iparameters = {
    procedureName: "P_SA_A5000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_recdt": convertDateToStr(ParaData.recdt),
      "@p_seq1": ParaData.seq1,
      "@p_location": ParaData.location,
      "@p_position": ParaData.position,
      "@p_outdt": convertDateToStr(ParaData.outdt),
      "@p_shipdt": convertDateToStr(ParaData.shipdt),
      "@p_doexdiv": ParaData.doexdiv,
      "@p_taxdiv": ParaData.taxdiv,
      "@p_amtunit": ParaData.amtunit,
      "@p_baseamt": ParaData.baseamt,
      "@p_wonchgrat": ParaData.wonchgrat,
      "@p_uschgrat": ParaData.uschgrat,
      "@p_person": ParaData.person,
      "@p_custcd": ParaData.custcd,
      "@p_custnm": ParaData.custnm,
      "@p_rcvcustcd": ParaData.rcvcustcd,
      "@p_rcvcustnm": ParaData.rcvcustnm,
      "@p_attdatnum": ParaData.attdatnum,
      "@p_remark": ParaData.remark,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_seq2_s": ParaData.seq2_s,
      "@p_itemcd_s": ParaData.itemcd_s,
      "@p_itemacnt_s": ParaData.itemacnt_s,
      "@p_qty_s": ParaData.qty_s,
      "@p_qtyunit_s": ParaData.qtyunit_s,
      "@p_unpcalmeth_s": ParaData.unpcalmeth_s,
      "@p_unp_s": ParaData.unp_s,
      "@p_amt_s": ParaData.amt_s,
      "@p_wonamt_s": ParaData.wonamt_s,
      "@p_taxamt_s": ParaData.taxamt_s,
      "@p_dlramt_s": ParaData.dlramt_s,
      "@p_unitwgt_s": ParaData.unitwgt_s,
      "@p_totwgt_s": ParaData.totwgt_s,
      "@p_wgtunit_s": ParaData.wgtunit_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_poregnum_s": ParaData.poregnum_s,
      "@p_ordnum_s": ParaData.ordnum_s,
      "@p_ordseq_s": ParaData.ordseq_s,
      "@p_outrecdt_s": ParaData.outrecdt_s,
      "@p_outseq1_s": ParaData.outseq1_s,
      "@p_outseq2_s": ParaData.outseq2_s,
      "@p_sort_seq_s": ParaData.sort_seq_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "P_SA_A5000W",
      "@p_company_code": companyCode,
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

    if (data.isSuccess === true) {
      deletedMainRows = [];
      setUnsavedAttadatnums([]);
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
        const newData2 = {
          ...item,
          rowstatus: "D",
        };
        Object3.push(index);
        deletedMainRows.push(newData2);
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
      field != "unpcalmeth" &&
      field != "qty" &&
      field != "rowstatus" &&
      field != "itemlvl1" &&
      field != "itemlvl2" &&
      field != "itemlvl3" && 
      field != "taxamt" && 
      field != "dlramt" && 
      field != "wonamt"
    ) {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
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
        title={workType === "N" ? "판매처리(수출)생성" : "판매처리(수출)정보"}
        width={position.width}
        height={position.height}
        onMove={handleMove}
        onResize={handleResize}
        onClose={onClose}
        modal={modal}
      >
        <FormBoxWrap style={{ paddingRight: "50px" }}>
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
                        (item: any) => item.sub_code === filters.doexdiv
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
                        (item: any) => item.sub_code === filters.taxdiv
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
                unpcalmeth: unpcalmethListData.find(
                  (item: any) => item.sub_code == row.unpcalmeth
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
            <GridColumn field="unpcalmeth" title="단가산정방법" width="120px" />
            <GridColumn
              field="unitwgt"
              title="단량"
              width="100px"
              cell={NumberCell}
            />
            <GridColumn
              field="qty"
              title="수량"
              width="100px"
              cell={NumberCell}
            />
            <GridColumn
              field="totwgt"
              title="중량"
              width="100px"
              cell={NumberCell}
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
            />
            <GridColumn
              field="wonamt"
              title="원화금액"
              width="100px"
              cell={NumberCell}
            />
            <GridColumn
              field="taxamt"
              title="세액"
              width="100px"
              cell={NumberCell}
            />
            <GridColumn
              field="dlramt"
              title="달러금액"
              width="100px"
              cell={NumberCell}
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
        />
      )}
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={filters.attdatnum}
        />
      )}
    </>
  );
};

export default CopyWindow;
