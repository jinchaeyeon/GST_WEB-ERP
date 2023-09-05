import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
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
import { deletedAttadatnumsState, isLoading, loginResultState, unsavedAttadatnumsState } from "../../store/atoms";
import { Iparameters } from "../../store/types";
import ComboBoxCell from "../Cells/ComboBoxCell";
import NumberCell from "../Cells/NumberCell";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  UseBizComponent,
  UseCustomOption,
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
import { COM_CODE_DEFAULT_VALUE, EDIT_FIELD, PAGE_SIZE, SELECTED_FIELD } from "../CommonString";
import { CellRender, RowRender } from "../Renderers/Renderers";
import AttachmentsWindow from "./CommonWindows/AttachmentsWindow";
import CustomersWindow from "./CommonWindows/CustomersWindow";
import CopyWindow2 from "./SA_A2300W_Inven_Window";
let targetRowIndex: null | number = null;
type IWindow = {
  workType: "N" | "U";
  data?: Idata;
  setVisible(t: boolean): void;
  reload(str: string): void;
  modal?: boolean;
};
let temp = 0;

type TdataArr = {
  rowstatus: string[];
  seq2: string[];
  ordnum: string[];
  ordseq: string[];
  portcd: string[];
  portnm: string[];
  prcterms: string[];
  poregnum: string[];
  itemcd: string[];
  itemnm: string[];
  itemacnt: string[];
  qty: string[];
  qtyunit: string[];
  unp: string[];
  amt: string[];
  dlramt: string[];
  wonamt: string[];
  taxamt: string[];
  lotnum: string[];
  remark_s: string[];
  inrecdt: string[];
  reqnum: string[];
  reqseq: string[];
  serialno: string[];
  outlot: string[];
  unitqty: string[];
};
type Idata = {
  amt: number;
  amtunit: string;
  attdatnum: string;
  baseamt: number;
  busadiv: string;
  cargocd: string;
  carno: string;
  chk: string;
  custcd: string;
  custnm: string;
  doexdiv: string;
  dvnm: string;
  dvnum: string;
  files: string;
  finaldes: string;
  location: string;
  num: number;
  orgdiv: string;
  outdt: string;
  outkind: string;
  outtype: string;
  outuse: string;
  person: string;
  pgmdiv: string;
  portnm: string;
  project: string;
  qty: number;
  rcvcustcd: string;
  rcvcustnm: string;
  recdt: string;
  recdtfind: string;
  remark: string;
  reqnum: string;
  seq1: number;
  shipdt: string;
  taxamt: number;
  taxdiv: string;
  taxdt: string;
  taxnu: string;
  taxtype: string;
  totamt: number;
  trcost: number;
  uschgrat: number;
  wonchgrat: number;
};
let deletedMainRows: object[] = [];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_BA015,L_BA061", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field === "qtyunit" ? "L_BA015" : field === "itemacnt" ? "L_BA061" : "";
  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
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
}: IWindow) => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 850;
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 1600,
    height: 900,
  });
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const userId = loginResult ? loginResult.userId : "";
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const DATA_ITEM_KEY = "num";

  const idGetter = getter(DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);
  //메시지 조회
  const pathname: string = window.location.pathname.replace("/", "");
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  // 삭제할 첨부파일 리스트를 담는 함수
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null && workType != "U") {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;
      setFilters((prev) => ({
        ...prev,
        person: defaultOption.find((item: any) => item.id === "person")
          .valueCode,
        doexdiv: defaultOption.find((item: any) => item.id === "doexdiv")
          .valueCode,
        cargocd: defaultOption.find((item: any) => item.id === "cargocd")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA002,L_BA016,L_BA061,L_BA015, R_USEYN,L_BA171,L_BA172,L_BA173,R_YESNOALL",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [locationListData, setLocationListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const locationQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA002")
      );

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

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    amt: 0,
    amtunit: "",
    attdatnum: "",
    chk: "",
    custcd: "",
    custnm: "",
    carno: "",
    cargocd: "",
    trcost: 0,
    doexdiv: "",
    dvnm: "",
    dvnum: "",
    finaldes: "",
    dlramt: 0,
    inredt: new Date(),
    insiz: "",
    itemacnt: "",
    itemcd: "",
    itemnm: "",
    itemno: "",
    location: "01",
    lotnum: "",
    num: 0,
    recdtfind: "",
    ordnum: "",
    ordseq: 0,
    orgdiv: "01",
    orglot: "",
    outdt: new Date(),
    outkind: "",
    outlot: "",
    outtype: "",
    pacmeth: "",
    person: "",
    portnm: "",
    qty: 0,
    qtyunit: "",
    rcvcustcd: "",
    rcvcustnm: "",
    recdt: new Date(),
    remark: "",
    reqnum: "",
    reqseq: 0,
    seq1: 0,
    seq2: 0,
    serialno: "",
    shipdt: null,
    taxamt: 0,
    totwgt: 0,
    unitqty: 0,
    unitwgt: 0,
    unp: 0,
    unpcalmeth: "",
    uschgrat: 0,
    wgtunit: "",
    wonamt: 0,
    wonchgrat: 0,
    userid: userId,
    pc: pc,
    form_id: "SA_A2300W",
    serviceid: companyCode,
    files: "",
    pgNum: 1,
    isSearch: true,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    const parameters: Iparameters = {
      procedureName: "P_SA_A2300W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": "",
        "@p_todt": "",
        "@p_person": "",
        "@p_custcd": "",
        "@p_custnm": "",
        "@p_recdt": convertDateToStr(filters.recdt),
        "@p_seq1": filters.seq1,
        "@p_gubun1": "",
        "@p_gubun2": "",
        "@p_doexdiv": "",
        "@p_itemcd": "",
        "@p_itemnm": "",
        "@p_lotnum": "",
        "@p_remark": "",
        "@p_ordnum": "",
        "@p_orglot": "",
        "@p_reqnum": "",
        "@p_reckey": filters.recdtfind,
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
        recdt: toDate(data.recdt),
        seq1: data.seq1,
        recdtfind: data.recdtfind,
        outdt: toDate(data.outdt),
        person: data.person,
        doexdiv: data.doexdiv,
        location: data.location,
        custcd: data.custcd,
        custnm: data.custnm,
        rcvcustcd: data.rcvcustcd,
        rcvcustnm: data.rcvcustnm,
        carno: data.carno,
        finaldes: data.finaldes,
        portnm: data.portnm,
        dvnm: data.dvnm,
        dvnum: data.dvnum,
        shipdt: isValidDate(data.shipdt)
          ? new Date(dateformat(data.shipdt))
          : null,
        cargocd: data.cargocd,
        trcost: data.trcost,
        files: data.files,
        attdatnum: data.attdatnum,
        remark: data.remark,
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

    data.map(
      (item: {
        amt: number;
        amtunit: string;
        chk: any;
        custcd: any;
        custnm: any;
        uschgrat: number;
        unpcalmeth: string;
        qty: number;
        unp: number;
        wonchgrat: number;
        len: undefined;
        totwgt: number;
        insiz: any;
        itemacnt: any;
        itemcd: any;
        itemnm: any;
        itemno: any;
        lotnum: any;
        ordkey: any;
        ordnum: any;
        ordseq: any;
        qtyunit: any;
        taxamt: any;
        unitwgt: any;
        wonamt: any;
      }) => {
        const newDataItem = {
          [DATA_ITEM_KEY]: ++temp,
          amt: item.amt,
          amtunit: item.amtunit,
          chk: item.chk,
          custcd: item.custcd,
          custnm: item.custnm,
          dlramt: Math.round(
            filters.uschgrat != 0
              ? (filters.unpcalmeth == "Q" || filters.unpcalmeth == ""
                  ? item.amtunit == "KRW" || item.amtunit == ""
                    ? item.qty * item.unp
                    : item.qty * item.unp * filters.wonchgrat
                  : filters.unpcalmeth == "F" || filters.unpcalmeth == "L"
                  ? item.amtunit == "KRW" || item.amtunit == ""
                    ? (item.len == undefined ? 0 : item.len) * item.unp
                    : (item.len == undefined ? 0 : item.len) *
                      item.unp *
                      filters.wonchgrat
                  : filters.unpcalmeth == "W"
                  ? item.amtunit == "KRW" || item.amtunit == ""
                    ? item.totwgt * item.unp
                    : item.totwgt * item.unp * filters.wonchgrat
                  : item.amtunit == "KRW" || item.amtunit == ""
                  ? item.amt
                  : item.amt * filters.wonchgrat) * filters.uschgrat
              : 0
          ),
          doexdiv: filters.doexdiv,
          outtype: filters.outtype,
          insiz: item.insiz,
          itemacnt: item.itemacnt,
          itemcd: item.itemcd,
          itemnm: item.itemnm,
          itemno: item.itemno,
          location: "01",
          lotnum: item.lotnum,
          ordkey: item.ordkey,
          ordnum: item.ordnum,
          ordseq: item.ordseq,
          orgdiv: "01",
          outdt: convertDateToStr(filters.outdt),
          outkind: filters.outkind,
          outlot: filters.outlot,
          pacmeth: filters.pacmeth,
          person: userId,
          pgmdiv: "",
          portnm: filters.portnm,
          qty: item.qty,
          qtyunit: item.qtyunit,
          rcvcustcd: filters.rcvcustcd,
          rcvcustnm: filters.rcvcustnm,
          recdt: convertDateToStr(filters.recdt),
          remark: "",
          reqnum: filters.reqnum,
          reqseq: filters.reqseq,
          seq1: filters.seq1,
          seq2: filters.seq2,
          serialno: filters.serialno,
          shipdt:
            filters.shipdt == null ? "" : convertDateToStr(filters.shipdt),
          taxamt: item.taxamt,
          totwgt: item.totwgt,
          unitqty: 0,
          unitwgt: item.unitwgt,
          unp: item.unp,
          unpcalmeth: item.unpcalmeth == "" ? "Q" : item.unpcalmeth,
          uschgrat: filters.uschgrat,
          wgtunit: "",
          width: 0,
          wonamt: item.wonamt,
          wonchgrat: filters.wonchgrat,
          rowstatus: "N",
        };
        setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });

        setMainDataResult((prev) => {
          return {
            data: [newDataItem, ...prev.data],
            total: prev.total + 1,
          };
        });
      }
    );
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
    mainDataResult.data.map((item) => {
      if (item.qty == 0) {
        alert("수량을 채워주세요.");
        valid = false;
        return false;
      }
    });

    try {
      if (mainDataResult.data.length == 0) {
        throw findMessage(messagesData, "SA_A2300W_005");
      } else if (
        filters.doexdiv == null ||
        filters.doexdiv == "" ||
        filters.doexdiv == undefined
      ) {
        throw findMessage(messagesData, "SA_A2300W_002");
      } else if (
        filters.person == null ||
        filters.person == "" ||
        filters.person == undefined
      ) {
        throw findMessage(messagesData, "SA_A2300W_001");
      } else if (
        filters.custcd == null ||
        filters.custcd == "" ||
        filters.custcd == undefined
      ) {
        throw findMessage(messagesData, "SA_A2300W_003");
      } else if (
        convertDateToStr(filters.outdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.outdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.outdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.outdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "SA_A2300W_004");
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
            amtunit: filters.amtunit,
            attdatnum: filters.attdatnum,
            custcd: filters.custcd,
            custnm: filters.custnm,
            carno: filters.carno,
            cargocd: filters.cargocd,
            trcost: parseInt(filters.trcost),
            doexdiv: filters.doexdiv,
            dvnm: filters.dvnm,
            dvnum: filters.dvnum,
            finaldes: filters.finaldes,
            location: "01",
            orgdiv: "01",
            outdt:
              filters.outdt == null
                ? ""
                : filters.outdt.length == 8
                ? filters.outdt
                : convertDateToStr(filters.outdt),
            outtype: filters.outtype,
            person: filters.person,
            rcvcustcd: filters.rcvcustcd,
            rcvcustnm: filters.rcvcustnm,
            recdt:
              filters.recdt == null
                ? ""
                : filters.recdt.length == 8
                ? filters.recdt
                : convertDateToStr(filters.recdt),
            remark: filters.remark,
            seq1: filters.seq1,
            shipdt:
              filters.shipdt == null
                ? ""
                : filters.shipdt.length == 8
                ? filters.shipdt
                : convertDateToStr(filters.shipdt),
            wonchgrat: filters.wonchgrat,
            userid: userId,
            pc: pc,
            form_id: "SA_A2300W",
            serviceid: companyCode,
            files: filters.files,
          }));
          if (dataItem.length === 0 && deletedMainRows.length == 0) return false;
          let dataArr: TdataArr = {
            rowstatus: [],
            seq2: [],
            ordnum: [],
            ordseq: [],
            portcd: [],
            portnm: [],
            prcterms: [],
            poregnum: [],
            itemcd: [],
            itemnm: [],
            itemacnt: [],
            qty: [],
            qtyunit: [],
            unp: [],
            amt: [],
            dlramt: [],
            wonamt: [],
            taxamt: [],
            lotnum: [],
            remark_s: [],
            inrecdt: [],
            reqnum: [],
            reqseq: [],
            serialno: [],
            outlot: [],
            unitqty: [],
          };

          dataItem.forEach((item: any, idx: number) => {
            const {
              amt = "",
              itemacnt = "",
              itemcd = "",
              itemnm = "",
              lotnum = "",
              ordnum = "",
              ordseq = "",
              poregnum = "",
              rowstatus = "",
              seq2 = "",
              taxamt = "",
              unp = "",
              qty = "",
              qtyunit = "",
              wonamt = "",
              dlramt = "",
              unitqty = "",
              reqseq = "",
              remark = "",
              inrecdt = "",
              reqnum = "",
              serialno = "",
              outlot = "",
              portcd = "",
              portnm = "",
              prcterms = "",
            } = item;

            dataArr.rowstatus.push(rowstatus);
            dataArr.seq2.push(seq2 == "" ? 0 : seq2);
            dataArr.ordnum.push(ordnum == undefined ? "" : ordnum);
            dataArr.ordseq.push(ordseq == "" ? 0 : ordseq);
            dataArr.portcd.push(portcd == undefined ? "" : portcd);
            dataArr.portnm.push(portnm == undefined ? "" : portnm);
            dataArr.prcterms.push(prcterms == undefined ? "" : prcterms);
            dataArr.poregnum.push(poregnum == undefined ? "" : poregnum);
            dataArr.itemcd.push(itemcd);
            dataArr.itemnm.push(itemnm);
            dataArr.itemacnt.push(itemacnt == undefined ? "" : itemacnt);
            dataArr.qty.push(qty == "" ? 0 : qty);
            dataArr.qtyunit.push(qtyunit == undefined ? "" : qtyunit);
            dataArr.unp.push(unp == "" ? 0 : unp);
            dataArr.amt.push(amt == "" ? 0 : amt);
            dataArr.dlramt.push(dlramt == "" ? 0 : dlramt);
            dataArr.wonamt.push(wonamt == "" ? 0 : wonamt);
            dataArr.taxamt.push(taxamt == "" ? 0 : taxamt);
            dataArr.lotnum.push(lotnum == undefined ? "" : lotnum);
            dataArr.remark_s.push(remark == undefined ? "" : remark);
            dataArr.inrecdt.push(inrecdt == undefined ? "" : inrecdt);
            dataArr.reqnum.push(reqnum == undefined ? "" : reqnum);
            dataArr.reqseq.push(reqseq == "" ? 0 : reqseq);
            dataArr.outlot.push(outlot == undefined ? "" : outlot);
            dataArr.serialno.push(serialno == undefined ? "" : serialno);
            dataArr.unitqty.push(unitqty == "" ? 0 : unitqty);
          });
          deletedMainRows.forEach((item: any, idx: number) => {
            const {
              amt = "",
              itemacnt = "",
              itemcd = "",
              itemnm = "",
              lotnum = "",
              ordnum = "",
              ordseq = "",
              poregnum = "",
              rowstatus = "",
              seq2 = "",
              taxamt = "",
              unp = "",
              qty = "",
              qtyunit = "",
              wonamt = "",
              dlramt = "",
              unitqty = "",
              reqseq = "",
              remark = "",
              inrecdt = "",
              reqnum = "",
              serialno = "",
              outlot = "",
              portcd = "",
              portnm = "",
              prcterms = "",
            } = item;

            dataArr.rowstatus.push(rowstatus);
            dataArr.seq2.push(seq2 == "" ? 0 : seq2);
            dataArr.ordnum.push(ordnum == undefined ? "" : ordnum);
            dataArr.ordseq.push(ordseq == "" ? 0 : ordseq);
            dataArr.portcd.push(portcd == undefined ? "" : portcd);
            dataArr.portnm.push(portnm == undefined ? "" : portnm);
            dataArr.prcterms.push(prcterms == undefined ? "" : prcterms);
            dataArr.poregnum.push(poregnum == undefined ? "" : poregnum);
            dataArr.itemcd.push(itemcd);
            dataArr.itemnm.push(itemnm);
            dataArr.itemacnt.push(itemacnt == undefined ? "" : itemacnt);
            dataArr.qty.push(qty == "" ? 0 : qty);
            dataArr.qtyunit.push(qtyunit == undefined ? "" : qtyunit);
            dataArr.unp.push(unp == "" ? 0 : unp);
            dataArr.amt.push(amt == "" ? 0 : amt);
            dataArr.dlramt.push(dlramt == "" ? 0 : dlramt);
            dataArr.wonamt.push(wonamt == "" ? 0 : wonamt);
            dataArr.taxamt.push(taxamt == "" ? 0 : taxamt);
            dataArr.lotnum.push(lotnum == undefined ? "" : lotnum);
            dataArr.remark_s.push(remark == undefined ? "" : remark);
            dataArr.inrecdt.push(inrecdt == undefined ? "" : inrecdt);
            dataArr.reqnum.push(reqnum == undefined ? "" : reqnum);
            dataArr.reqseq.push(reqseq == "" ? 0 : reqseq);
            dataArr.outlot.push(outlot == undefined ? "" : outlot);
            dataArr.serialno.push(serialno == undefined ? "" : serialno);
            dataArr.unitqty.push(unitqty == "" ? 0 : unitqty);
          });
          setParaData((prev) => ({
            ...prev,
            workType: workType,
            rowstatus: dataArr.rowstatus.join("|"),
            seq2: dataArr.seq2.join("|"),
            ordnum: dataArr.ordnum.join("|"),
            ordseq: dataArr.ordseq.join("|"),
            portcd: dataArr.portcd.join("|"),
            portnm: dataArr.portnm.join("|"),
            prcterms: dataArr.prcterms.join("|"),
            poregnum: dataArr.poregnum.join("|"),
            itemcd: dataArr.itemcd.join("|"),
            itemnm: dataArr.itemnm.join("|"),
            itemacnt: dataArr.itemacnt.join("|"),
            qty: dataArr.qty.join("|"),
            qtyunit: dataArr.qtyunit.join("|"),
            unp: dataArr.unp.join("|"),
            amt: dataArr.amt.join("|"),
            dlramt: dataArr.dlramt.join("|"),
            wonamt: dataArr.wonamt.join("|"),
            taxamt: dataArr.taxamt.join("|"),
            lotnum: dataArr.lotnum.join("|"),
            remark_s: dataArr.remark_s.join("|"),
            inrecdt: dataArr.inrecdt.join("|"),
            reqnum: dataArr.reqnum.join("|"),
            reqseq: dataArr.reqseq.join("|"),
            serialno: dataArr.serialno.join("|"),
            outlot: dataArr.outlot.join("|"),
            unitqty: dataArr.unitqty.join("|"),
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
    doexdiv: "A",
    outtype: "",
    outdt: new Date(),
    shipdt: new Date(),
    person: "admin",
    custcd: "",
    rcvcustcd: "",
    taxdiv: "",
    userid: userId,
    pc: pc,
    amtunit: "",
    baseamt: 0,
    wonchgrat: 0,
    uschgrat: 0,
    remark: "",
    carno: "",
    cargocd: "",
    cargb: "",
    dvnm: "",
    dvnum: "",
    trcost: 0,
    portnm: "",
    finaldes: "",
    attdatnum: "",
    outuse: "",
    rowstatus: "",
    seq2: "",
    ordnum: "",
    ordseq: "",
    portcd: "",
    prcterms: "",
    poregnum: "",
    itemcd: "",
    itemnm: "",
    itemacnt: "",
    qty: "",
    qtyunit: "",
    unp: "",
    amt: "",
    dlramt: "",
    wonamt: "",
    taxamt: "",
    lotnum: "",
    remark_s: "",
    inrecdt: "",
    reqnum: "",
    reqseq: "",
    serialno: "",
    outlot: "",
    custnm: "",
    rcvcustnm: "",
    unitqty: "",
    form_id: "SA_A2300W",
    serviceid: companyCode,
  });

  const para: Iparameters = {
    procedureName: "P_SA_A2300W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": "01",
      "@p_recdt": ParaData.recdt,
      "@p_seq1": ParaData.seq1,
      "@p_location": ParaData.location,
      "@p_doexdiv": ParaData.doexdiv,
      "@p_outtype": ParaData.outtype,
      "@p_outdt": ParaData.outdt,
      "@p_shipdt": ParaData.shipdt,
      "@p_person": ParaData.person,
      "@p_custcd": ParaData.custcd,
      "@p_custnm": ParaData.custnm,
      "@p_rcvcustcd": ParaData.rcvcustcd,
      "@p_rcvcustnm": ParaData.rcvcustnm,
      "@p_taxdiv": ParaData.taxdiv,
      "@p_amtunit": ParaData.amtunit,
      "@p_baseamt": ParaData.baseamt,
      "@p_wonchgrat": ParaData.wonchgrat,
      "@p_uschgrat": ParaData.uschgrat,
      "@p_remark": ParaData.remark,
      "@p_carno": ParaData.carno,
      "@p_cargocd": ParaData.cargocd,
      "@p_dvnm": ParaData.dvnm,
      "@p_dvnum": ParaData.dvnum,
      "@p_trcost": ParaData.trcost,
      "@p_finaldes": ParaData.finaldes,
      "@p_attdatnum": ParaData.attdatnum,
      "@p_outuse": ParaData.outuse,
      "@p_rowstatus": ParaData.rowstatus,
      "@p_seq2": ParaData.seq2,
      "@p_ordnum": ParaData.ordnum,
      "@p_ordseq": ParaData.ordseq,
      "@p_portcd": ParaData.portcd,
      "@p_prcterms": ParaData.prcterms,
      "@p_poregnum": ParaData.poregnum,
      "@p_itemcd": ParaData.itemcd,
      "@p_itemnm": ParaData.itemnm,
      "@p_itemacnt": ParaData.itemacnt,
      "@p_qty": ParaData.qty,
      "@p_qtyunit": ParaData.qtyunit,
      "@p_unp": ParaData.unp,
      "@p_amt": ParaData.amt,
      "@p_dlramt": ParaData.dlramt,
      "@p_wonamt": ParaData.wonamt,
      "@p_taxamt": ParaData.taxamt,
      "@p_lotnum": ParaData.lotnum,
      "@p_remark_s": ParaData.remark_s,
      "@p_inrecdt": ParaData.inrecdt,
      "@p_reqnum": ParaData.reqnum,
      "@p_reqseq": ParaData.reqseq,
      "@p_serialno": ParaData.serialno,
      "@p_outlot": ParaData.outlot,
      "@p_unitqty": ParaData.unitqty,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "P_SA_A2300W",
      "@p_portnm": ParaData.portnm,
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
      reload(data.returnString)
      if (workType == "N") {
        onClose();
      } else {
        setFilters((prev) => ({
          ...prev,
          isSearch: true,
          pgNum: 1,
          find_row_value: data.returnString
        }))
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.itemcd != "" || ParaData.workType == "U") {
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
      field != "rowstatus" &&
      field != "insiz" &&
      field != "itemcd" &&
      field != "itemnm"
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
        title={workType === "N" ? "출하처리생성" : "출하처리정보"}
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
                <th>출하번호</th>
                <td>
                  <Input
                    name="recdtfind"
                    type="text"
                    value={filters.recdtfind}
                    className="readonly"
                  />
                </td>
                <th>출하일자</th>
                <td>
                  <div className="filter-item-wrap">
                    <DatePicker
                      name="outdt"
                      value={filters.outdt}
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
                      className="required"
                    />
                  )}
                </td>
                <th>내수구분</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="doexdiv"
                      value={filters.doexdiv}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                      className="required"
                    />
                  )}
                </td>
                <th>사업장</th>
                <td>
                  <Input
                    name="location"
                    type="text"
                    value={
                      locationListData.find(
                        (item: any) => item.sub_code === filters.location
                      )?.code_name
                    }
                    className="readonly"
                  />
                </td>
              </tr>
              <tr>
                <th>출하처코드</th>
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
                <th>출하처명</th>
                <td>
                  <Input
                    name="custnm"
                    type="text"
                    value={filters.custnm}
                    className="readonly"
                  />
                </td>
                <th>인수처코드</th>
                <td>
                  <Input
                    name="rcvcustcd"
                    type="text"
                    value={filters.rcvcustcd}
                    onChange={filterInputChange}
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
                    onChange={filterInputChange}
                  />
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
              </tr>
              <tr>
                <th>차량번호</th>
                <td>
                  <Input
                    name="carno"
                    type="text"
                    value={filters.carno}
                    onChange={filterInputChange}
                  />
                </td>
                <th>도착지</th>
                <td>
                  <Input
                    name="finaldes"
                    type="text"
                    value={filters.finaldes}
                    onChange={filterInputChange}
                  />
                </td>
                <th>선적지</th>
                <td>
                  <Input
                    name="portnm"
                    type="text"
                    value={filters.portnm}
                    onChange={filterInputChange}
                  />
                </td>
                <th>운전자명</th>
                <td>
                  <Input
                    name="dvnm"
                    type="text"
                    value={filters.dvnm}
                    onChange={filterInputChange}
                  />
                </td>
                <th>운전자연락처</th>
                <td>
                  <Input
                    name="dvnum"
                    type="text"
                    value={filters.dvnum}
                    onChange={filterInputChange}
                  />
                </td>
              </tr>
              <tr>
                <th>운송사</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="cargocd"
                      value={filters.cargocd}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                    />
                  )}
                </td>
                <th>운송비</th>
                <td>
                  <Input
                    name="trcost"
                    type="number"
                    value={filters.trcost}
                    onChange={filterInputChange}
                  />
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
        <GridContainer height={`calc(100% - 370px)`}>
          <GridTitleContainer>
            <GridTitle>상세정보</GridTitle>
            <ButtonContainer>
              <Button
                themeColor={"primary"}
                onClick={onCopyWndClick}
                icon="folder-open"
              >
                재고참조
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
                enddt:
                  workType == "U" && isValidDate(row.enddt)
                    ? new Date(dateformat(row.enddt))
                    : new Date(),
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
              width="250px"
              footerCell={mainTotalFooterCell}
            />
            <GridColumn field="itemnm" title="품목명" width="250px" />
            <GridColumn
              field="itemacnt"
              title="품목계정"
              width="200px"
              cell={CustomComboBoxCell}
            />
            <GridColumn
              field="qty"
              title="수량"
              width="130px"
              cell={NumberCell}
            />
            <GridColumn
              field="qtyunit"
              title="수량단위"
              width="150px"
              cell={CustomComboBoxCell}
            />
            <GridColumn field="remark" title="비고" width="300px" />
            <GridColumn field="lotnum" title="LOT NO" width="210px" />
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
        <CopyWindow2 setVisible={setCopyWindowVisible} setData={setCopyData} />
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
