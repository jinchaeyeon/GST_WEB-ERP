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
import { useCallback, useEffect, useState } from "react";
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
import NumberCell from "../Cells/NumberCell";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UseParaPc,
  convertDateToStr,
  findMessage,
  getGridItemChangedData,
  getQueryFromBizComponent,
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
import CopyWindow2 from "./BA_A0080W_Copy_Window";
import CustomersWindow from "./CommonWindows/CustomersWindow";
import PopUpAttachmentsWindow from "./CommonWindows/PopUpAttachmentsWindow";
import CopyWindow3 from "./MA_A3400W_Inven_Window";

type IWindow = {
  workType: "N" | "U";
  data?: Idata;
  setVisible(t: boolean): void;
  reload(str: string): void; //data : 선택한 품목 데이터를 전달하는 함수
  modal?: boolean;
  pathname: string;
};

type Idata = {
  recdt: string;
  location: string;
  outdt: string;
  person: string;
  custcd: string;
  custnm: string;
  remark: string;
  attdatnum: string;
  outuse: string;
  reckey: string;
  seq1: number;
  files: string;
};
let deletedMainRows: object[] = [];
let temp = 0;

type TdataArr = {
  rowstatus_s: string[];
  seq2_s: string[];
  rtnyn_s: string[];
  rtntype_s: string[];
  ordnum_s: string[];
  ordseq_s: string[];
  itemgrade_s: string[];
  itemcd_s: string[];
  itemnm_s: string[];
  itemacnt_s: string[];
  pacmeth_s: string[];
  qty_s: string[];
  qtyunit_s: string[];
  lenunit_s: string[];
  totlen_s: string[];
  unitwgt_s: string[];
  wgtunit_s: string[];
  totwgt_s: string[];
  len_s: string[];
  itemthick_s: string[];
  width_s: string[];
  unpcalmeth_s: string[];
  unp_s: string[];
  amt_s: string[];
  dlramt_s: string[];
  wonamt_s: string[];
  taxamt_s: string[];
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
  serialno_s: string[];
  load_place_s: string[];
  outdt_s: string[];
  person_s: string[];
};

const CopyWindow = ({
  workType,
  data,
  setVisible,
  reload,
  modal = false,
  pathname
}: IWindow) => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 1600,
    height: 870,
  });
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const userId = loginResult ? loginResult.userId : "";
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const DATA_ITEM_KEY = "num";
  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  const idGetter = getter(DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);
  //메시지 조회

  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        cboLocation:
          defaultOption.find((item: any) => item.id === "cboLocation")
            .valueCode == ""
            ? "01"
            : defaultOption.find((item: any) => item.id === "cboLocation")
                .valueCode,
        cboPerson:
          defaultOption.find((item: any) => item.id === "cboPerson")
            .valueCode == ""
            ? "admin"
            : defaultOption.find((item: any) => item.id === "cboPerson")
                .valueCode,
        outuse:
          defaultOption.find((item: any) => item.id === "outuse").valueCode ==
          ""
            ? "10"
            : defaultOption.find((item: any) => item.id === "outuse").valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA061,L_BA015, R_USEYN,L_BA171,L_BA172,L_BA173,R_YESNOALL, L_BA002",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [itemacntListData, setItemacntListData] = useState([
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
      const itemacntQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA061")
      );
      const locationQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA002")
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
      fetchQuery(itemlvl1QueryStr, setItemlvl1ListData);
      fetchQuery(itemlvl2QueryStr, setItemlvl2ListData);
      fetchQuery(itemlvl3QueryStr, setItemlvl3ListData);
      fetchQuery(itemacntQueryStr, setItemacntListData);
      fetchQuery(locationQueryStr, setLocationListData);
      fetchQuery(qtyunitQueryStr, setQtyunitListData);
      fetchQuery(itemacntQueryStr, setLocationListData);
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
  const [CopyWindowVisible, setCopyWindowVisible] = useState<boolean>(false);
  const [CopyWindowVisible2, setCopyWindowVisible2] = useState<boolean>(false);
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
    if (unsavedName.length > 0) setDeletedName(unsavedName);

    setVisible(false);
  };

  const onCustWndClick = () => {
    setCustWindowVisible(true);
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

  const processApi = useApi();

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    recdt: "",
    seq1: 0,
    cboLocation: "01",
    outdt: new Date(),
    cboPerson: "admin",
    custcd: "",
    custnm: "",
    remark: "",
    attdatnum: "",
    outuse: "",
    rowstatus_s: "",
    seq2_s: 0,
    rtnyn_s: "",
    rtntype_s: "",
    ordnum_s: "",
    ordseq_s: "",
    itemgrade_s: "",
    itemcd_s: "",
    itemnm_s: "",
    itemacnt_s: "",
    pacmeth_s: "",
    qty_s: "",
    qtyunit_s: "",
    lenunit_s: "",
    totlen_s: "",
    unitwgt_s: "",
    wgtunit_s: "",
    totwgt_s: "",
    len_s: "",
    itemthick_s: "",
    width_s: "",
    unpcalmeth_s: "",
    unp_s: "",
    amt_s: "",
    dlramt_s: "",
    wonamt_s: "",
    taxamt_s: "",
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
    serialno_s: "",
    load_place_s: "",
    outdt_s: "",
    person_s: "",
    userid: userId,
    pc: pc,
    form_id: "MA_A3400W",
    serviceid: companyCode,
    reckey: "",
    files: "",
    pgNum: 1,
    isSearch: false,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    const Parameters: Iparameters = {
      procedureName: "P_MA_A3400W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.cboLocation,
        "@p_frdt": "",
        "@p_todt": "",
        "@p_person": filters.cboPerson,
        "@p_itemcd": "",
        "@p_itemnm": "",
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_lotnum": "",
        "@p_reckey": filters.reckey,
        "@p_find_row_value": "",
      },
    };
    setLoading(true);
    try {
      data = await processApi<any>("procedure", Parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });
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
        recdt: data.recdt,
        cboLocation: data.location,
        outdt: toDate(data.outdt),
        cboPerson: data.person,
        custcd: data.custcd,
        custnm: data.custnm,
        remark: data.remark,
        attdatnum: data.attdatnum,
        outuse: data.outuse,
        reckey: data.reckey,
        seq1: data.seq1,
        files: data.files,
        isSearch: true,
        pgNum: 1,
      }));
    }
  }, []);

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

  const onCopyWndClick2 = () => {
    setCopyWindowVisible2(true);
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

  const setCopyData2 = (data: any) => {
    if (data.length === 0) return false;

    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    for (var i = 1; i < data.length; i++) {
      if (data[0].itemcd == data[i].itemcd) {
        alert("중복되는 품목이있습니다.");
        return false;
      }
    }

    for (var i = 0; i < data.length; i++) {
      data[i].num = ++temp;
      data[i].rowstatus = "N"
    }

    try {
      data.map((item: any) => {
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, item],
            total: prev.total + 1,
          };
        });
        setSelectedState({ [item[DATA_ITEM_KEY]]: true });
      });
    } catch (e) {
      alert(e);
    }
  };
  const setCopyData = (data: any) => {
    const dataItem = data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length === 0) return false;

    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    if (data[0].now_qty != undefined) {
      for (var i = 1; i < data.length; i++) {
        if (
          data[0].itemcd == data[i].itemcd &&
          data[0].lotnum == data[i].lotnum
        ) {
          alert("중복되는 품목이있습니다.");
          data[i].num = ++temp;
          data[i].type = "재고";
          return false;
        }
      }
    } else {
      for (var i = 1; i < data.length; i++) {
        if (data[0].itemcd == data[i].itemcd) {
          alert("중복되는 품목이있습니다.");
          data[i].num = ++temp;
          data[i].type = "품목";
          return false;
        }
      }
    }

    for (var i = 0; i < data.length; i++) {
      data[i].num = ++temp;
      data[i].rowstatus = "N"
    }

    try {
      data.map((item: any) => {
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, item],
            total: prev.total + 1,
          };
        });
        setSelectedState({ [item[DATA_ITEM_KEY]]: true });
      });
    } catch (e) {
      alert(e);
    }
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
        ? (sum += parseFloat(item[props.field] == "" || item[props.field] == undefined ? 0 : item[props.field]))
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
    try {
      if (mainDataResult.data.length == 0) {
        throw findMessage(messagesData, "MA_A3400W_001");
      } else if (
        convertDateToStr(filters.outdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.outdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.outdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.outdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "MA_A3400W_003");
      }
      for (var i = 0; i < mainDataResult.data.length; i++) {
        if (mainDataResult.data[i].qty == 0) {
          alert("수량은 필수입니다.");
          return false;
        }
      }
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (valid == true) {
      const dataItem = mainDataResult.data.filter((item: any) => {
        return (
          (item.rowstatus === "N" || item.rowstatus === "U") &&
          item.rowstatus !== undefined
        );
      });

      setParaData((prev) => ({
        ...prev,
        pgSize: PAGE_SIZE,
        workType: workType,
        recdt: filters.recdt,
        seq1: filters.seq1,
        cboLocation: filters.cboLocation,
        outdt: filters.outdt,
        cboPerson: filters.cboPerson,
        custcd: filters.custcd,
        custnm: filters.custnm,
        remark: filters.remark,
        attdatnum: filters.attdatnum,
        outuse: filters.outuse,
        reckey: filters.reckey,
      }));
      if (dataItem.length === 0 && deletedMainRows.length == 0) return false;

      let dataArr: TdataArr = {
        rowstatus_s: [],
        seq2_s: [],
        rtnyn_s: [],
        rtntype_s: [],
        ordnum_s: [],
        ordseq_s: [],
        itemgrade_s: [],
        itemcd_s: [],
        itemnm_s: [],
        itemacnt_s: [],
        pacmeth_s: [],
        qty_s: [],
        qtyunit_s: [],
        lenunit_s: [],
        totlen_s: [],
        unitwgt_s: [],
        wgtunit_s: [],
        totwgt_s: [],
        len_s: [],
        itemthick_s: [],
        width_s: [],
        unpcalmeth_s: [],
        unp_s: [],
        amt_s: [],
        dlramt_s: [],
        wonamt_s: [],
        taxamt_s: [],
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
        serialno_s: [],
        load_place_s: [],
        outdt_s: [],
        person_s: [],
      };
      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          seq2 = "",
          rtnyn = "",
          rtntype = "",
          ordnum = "",
          ordseq = "",
          itemgrade = "",
          itemcd = "",
          itemnm = "",
          itemacnt = "",
          pacmeth = "",
          qty = "",
          qtyunit = "",
          lenunit = "",
          totlen = "",
          unitwgt = "",
          wgtunit = "",
          totwgt = "",
          len = "",
          itemthick = "",
          width = "",
          unpcalmeth = "",
          unp = "",
          amt = "",
          dlramt = "",
          wonamt = "",
          taxamt = "",
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
          serialno = "",
          load_place = "",
          outdt = "",
          person = "",
        } = item;

        dataArr.rowstatus_s.push(rowstatus);
        dataArr.seq2_s.push(seq2 == "" ? 0 : seq2);
        dataArr.rtnyn_s.push(rtnyn == "" ? "N" : rtnyn);
        dataArr.rtntype_s.push(rtntype);
        dataArr.ordnum_s.push(ordnum);
        dataArr.ordseq_s.push(ordseq == "" ? 0 : ordseq);
        dataArr.itemgrade_s.push(itemgrade);
        dataArr.itemcd_s.push(itemcd);
        dataArr.itemnm_s.push(itemnm);
        dataArr.itemacnt_s.push(itemacnt);
        dataArr.pacmeth_s.push(pacmeth);
        dataArr.qty_s.push(qty == "" ? 0 : qty);
        dataArr.qtyunit_s.push(qtyunit);
        dataArr.lenunit_s.push(lenunit);
        dataArr.totlen_s.push(totlen == "" ? 0 : totlen);
        dataArr.unitwgt_s.push(unitwgt == "" ? 0 : unitwgt);
        dataArr.wgtunit_s.push(wgtunit);
        dataArr.totwgt_s.push(totwgt == "" ? 0 : totwgt);
        dataArr.len_s.push(len == "" ? 0 : len);
        dataArr.itemthick_s.push(itemthick == "" ? 0 : itemthick);
        dataArr.width_s.push(width == "" ? 0 : width);
        dataArr.unpcalmeth_s.push(unpcalmeth);
        dataArr.unp_s.push(unp == "" ? 0 : unp);
        dataArr.amt_s.push(amt == "" ? 0 : amt);
        dataArr.dlramt_s.push(dlramt == "" ? 0 : dlramt);
        dataArr.wonamt_s.push(wonamt == "" ? 0 : wonamt);
        dataArr.taxamt_s.push(taxamt == "" ? 0 : taxamt);
        dataArr.lotnum_s.push(lotnum);
        dataArr.orglot_s.push(orglot);
        dataArr.heatno_s.push(heatno);
        dataArr.pcncd_s.push(pcncd);
        dataArr.remark_s.push(remark);
        dataArr.inrecdt_s.push(inrecdt);
        dataArr.inseq1_s.push(inseq1 == "" ? 0 : inseq1);
        dataArr.inseq2_s.push(inseq2 == "" ? 0 : inseq2);
        dataArr.gonum_s.push(gonum);
        dataArr.goseq_s.push(goseq == "" ? 0 : goseq);
        dataArr.connum_s.push(connum);
        dataArr.conseq_s.push(conseq == "" ? 0 : conseq);
        dataArr.spno_s.push(spno == "" ? 0 : spno);
        dataArr.boxno_s.push(boxno);
        dataArr.endyn_s.push(endyn);
        dataArr.reqnum_s.push(reqnum);
        dataArr.reqseq_s.push(reqseq == "" ? 0 : reqseq);
        dataArr.serialno_s.push(serialno);
        dataArr.load_place_s.push(load_place);
        dataArr.outdt_s.push(outdt);
        dataArr.person_s.push(person);
      });

      deletedMainRows.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          seq2 = "",
          rtnyn = "",
          rtntype = "",
          ordnum = "",
          ordseq = "",
          itemgrade = "",
          itemcd = "",
          itemnm = "",
          itemacnt = "",
          pacmeth = "",
          qty = "",
          qtyunit = "",
          lenunit = "",
          totlen = "",
          unitwgt = "",
          wgtunit = "",
          totwgt = "",
          len = "",
          itemthick = "",
          width = "",
          unpcalmeth = "",
          unp = "",
          amt = "",
          dlramt = "",
          wonamt = "",
          taxamt = "",
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
          serialno = "",
          load_place = "",
          outdt = "",
          person = "",
        } = item;

        dataArr.rowstatus_s.push(rowstatus);
        dataArr.seq2_s.push(seq2 == "" ? 0 : seq2);
        dataArr.rtnyn_s.push(rtnyn == "" ? "N" : rtnyn);
        dataArr.rtntype_s.push(rtntype);
        dataArr.ordnum_s.push(ordnum);
        dataArr.ordseq_s.push(ordseq == "" ? 0 : ordseq);
        dataArr.itemgrade_s.push(itemgrade);
        dataArr.itemcd_s.push(itemcd);
        dataArr.itemnm_s.push(itemnm);
        dataArr.itemacnt_s.push(itemacnt);
        dataArr.pacmeth_s.push(pacmeth);
        dataArr.qty_s.push(qty == "" ? 0 : qty);
        dataArr.qtyunit_s.push(qtyunit);
        dataArr.lenunit_s.push(lenunit);
        dataArr.totlen_s.push(totlen == "" ? 0 : totlen);
        dataArr.unitwgt_s.push(unitwgt == "" ? 0 : unitwgt);
        dataArr.wgtunit_s.push(wgtunit);
        dataArr.totwgt_s.push(totwgt == "" ? 0 : totwgt);
        dataArr.len_s.push(len == "" ? 0 : len);
        dataArr.itemthick_s.push(itemthick == "" ? 0 : itemthick);
        dataArr.width_s.push(width == "" ? 0 : width);
        dataArr.unpcalmeth_s.push(unpcalmeth);
        dataArr.unp_s.push(unp == "" ? 0 : unp);
        dataArr.amt_s.push(amt == "" ? 0 : amt);
        dataArr.dlramt_s.push(dlramt == "" ? 0 : dlramt);
        dataArr.wonamt_s.push(wonamt == "" ? 0 : wonamt);
        dataArr.taxamt_s.push(taxamt == "" ? 0 : taxamt);
        dataArr.lotnum_s.push(lotnum);
        dataArr.orglot_s.push(orglot);
        dataArr.heatno_s.push(heatno);
        dataArr.pcncd_s.push(pcncd);
        dataArr.remark_s.push(remark);
        dataArr.inrecdt_s.push(inrecdt);
        dataArr.inseq1_s.push(inseq1 == "" ? 0 : inseq1);
        dataArr.inseq2_s.push(inseq2 == "" ? 0 : inseq2);
        dataArr.gonum_s.push(gonum);
        dataArr.goseq_s.push(goseq == "" ? 0 : goseq);
        dataArr.connum_s.push(connum);
        dataArr.conseq_s.push(conseq == "" ? 0 : conseq);
        dataArr.spno_s.push(spno == "" ? 0 : spno);
        dataArr.boxno_s.push(boxno);
        dataArr.endyn_s.push(endyn);
        dataArr.reqnum_s.push(reqnum);
        dataArr.reqseq_s.push(reqseq == "" ? 0 : reqseq);
        dataArr.serialno_s.push(serialno);
        dataArr.load_place_s.push(load_place);
        dataArr.outdt_s.push(outdt);
        dataArr.person_s.push(person);
      });
      setParaData((prev) => ({
        ...prev,
        workType: workType,
        outdt: filters.outdt,
        rowstatus_s: dataArr.rowstatus_s.join("|"),
        seq2_s: dataArr.seq2_s.join("|"),
        rtnyn_s: dataArr.rtnyn_s.join("|"),
        rtntype_s: dataArr.rtntype_s.join("|"),
        ordnum_s: dataArr.ordnum_s.join("|"),
        ordseq_s: dataArr.ordseq_s.join("|"),
        itemgrade_s: dataArr.itemgrade_s.join("|"),
        itemcd_s: dataArr.itemcd_s.join("|"),
        itemnm_s: dataArr.itemnm_s.join("|"),
        itemacnt_s: dataArr.itemacnt_s.join("|"),
        pacmeth_s: dataArr.pacmeth_s.join("|"),
        qty_s: dataArr.qty_s.join("|"),
        qtyunit_s: dataArr.qtyunit_s.join("|"),
        lenunit_s: dataArr.lenunit_s.join("|"),
        totlen_s: dataArr.totlen_s.join("|"),
        unitwgt_s: dataArr.unitwgt_s.join("|"),
        wgtunit_s: dataArr.wgtunit_s.join("|"),
        totwgt_s: dataArr.totwgt_s.join("|"),
        len_s: dataArr.len_s.join("|"),
        itemthick_s: dataArr.itemthick_s.join("|"),
        width_s: dataArr.width_s.join("|"),
        unpcalmeth_s: dataArr.unpcalmeth_s.join("|"),
        unp_s: dataArr.unp_s.join("|"),
        amt_s: dataArr.amt_s.join("|"),
        dlramt_s: dataArr.dlramt_s.join("|"),
        wonamt_s: dataArr.wonamt_s.join("|"),
        taxamt_s: dataArr.taxamt_s.join("|"),
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
        serialno_s: dataArr.serialno_s.join("|"),
        load_place_s: dataArr.load_place_s.join("|"),
        outdt_s: dataArr.outdt_s.join("|"),
        person_s: dataArr.person_s.join("|"),
      }));
    }
  };

  const [ParaData, setParaData] = useState<{ [name: string]: any }>({
    pgSize: PAGE_SIZE,
    workType: "N",
    orgdiv: "01",
    recdt: "",
    seq1: 0,
    cboLocation: "01",
    outdt: null,
    cboPerson: "admin",
    custcd: "",
    custnm: "",
    remark: "",
    attdatnum: "",
    outuse: "",
    rowstatus_s: "",
    seq2_s: "",
    rtnyn_s: "",
    rtntype_s: "",
    ordnum_s: "",
    ordseq_s: "",
    itemgrade_s: "",
    itemcd_s: "",
    itemnm_s: "",
    itemacnt_s: "",
    pacmeth_s: "",
    qty_s: "",
    qtyunit_s: "",
    lenunit_s: "",
    totlen_s: "",
    unitwgt_s: "",
    wgtunit_s: "",
    totwgt_s: "",
    len_s: "",
    itemthick_s: "",
    width_s: "",
    unpcalmeth_s: "",
    unp_s: "",
    amt_s: "",
    dlramt_s: "",
    wonamt_s: "",
    taxamt_s: "",
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
    serialno_s: "",
    load_place_s: "",
    outdt_s: "",
    person_s: "",
    userid: userId,
    pc: pc,
    form_id: "MA_A3400",
    serviceid: companyCode,
    reckey: "",
  });

  const para: Iparameters = {
    procedureName: "P_MA_A3400W_S",
    pageNumber: 0,
    pageSize: ParaData.pgSize,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_recdt": ParaData.recdt,
      "@p_seq1": ParaData.seq1,
      "@p_location": ParaData.cboLocation,
      "@p_outdt": convertDateToStr(ParaData.outdt),
      "@p_person": ParaData.cboPerson,
      "@p_custcd": ParaData.custcd,
      "@p_custnm": ParaData.custnm,
      "@p_remark": ParaData.remark,
      "@p_attdatnum": ParaData.attdatnum,
      "@p_outuse": ParaData.outuse,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_seq2_s": ParaData.seq2_s,
      "@p_rtnyn_s": ParaData.rtnyn_s,
      "@p_rtntype_s": ParaData.rtntype_s,
      "@p_ordnum_s": ParaData.ordnum_s,
      "@p_ordseq_s": ParaData.ordseq_s,
      "@p_itemgrade_s": ParaData.itemgrade_s,
      "@p_itemcd_s": ParaData.itemcd_s,
      "@p_itemnm_s": ParaData.itemnm_s,
      "@p_itemacnt_s": ParaData.itemacnt_s,
      "@p_pacmeth_s": ParaData.pacmeth_s,
      "@p_qty_s": ParaData.qty_s,
      "@p_qtyunit_s": ParaData.qtyunit_s,
      "@p_lenunit_s": ParaData.lenunit_s,
      "@p_totlen_s": ParaData.totlen_s,
      "@p_unitwgt_s": ParaData.unitwgt_s,
      "@p_wgtunit_s": ParaData.wgtunit_s,
      "@p_totwgt_s": ParaData.totwgt_s,
      "@p_len_s": ParaData.len_s,
      "@p_itemthick_s": ParaData.itemthick_s,
      "@p_width_s": ParaData.width_s,
      "@p_unpcalmeth_s": ParaData.unpcalmeth_s,
      "@p_unp_s": ParaData.unp_s,
      "@p_amt_s": ParaData.amt_s,
      "@p_dlramt_s": ParaData.dlramt_s,
      "@p_wonamt_s": ParaData.wonamt_s,
      "@p_taxamt_s": ParaData.taxamt_s,
      "@p_lotnum_s": ParaData.lotnum_s,
      "@p_orglot_s": ParaData.orglot_s,
      "@p_heatno_s": ParaData.heatno_s,
      "@p_pcncd_s": ParaData.pcncd_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_inrecdt_s": ParaData.inrecdt_s,
      "@p_inseq1_s": ParaData.inseq1_s,
      "@p_inseq2_s": ParaData.inseq2_s,
      "@p_gonum_s": ParaData.gonum_s,
      "@p_goseq_s": ParaData.goseq_s,
      "@p_connum_s": ParaData.connum_s,
      "@p_conseq_s": ParaData.conseq_s,
      "@p_spno_s": ParaData.spno_s,
      "@p_boxno_s": ParaData.boxno_s,
      "@p_endyn_s": ParaData.endyn_s,
      "@p_reqnum_s": ParaData.reqnum_s,
      "@p_reqseq_s": ParaData.reqseq_s,
      "@p_serialno_s": ParaData.serialno_s,
      "@p_load_place_s": ParaData.load_place_s,
      "@p_outdt_s": ParaData.outdt_s,
      "@p_person_s": ParaData.person_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "MA_A3400",
      "@p_serviceid": companyCode,
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
      setUnsavedName([]);
      reload(data.returnString);
      if (workType == "N") {
        setVisible(false);
      } else {
        setFilters((prev) => ({
          ...prev,
          isSearch: true,
          pgNum: 1,
          find_row_value: data.returnString,
        }));
      }
      setParaData({
        pgSize: PAGE_SIZE,
        workType: "N",
        orgdiv: "01",
        recdt: "",
        seq1: 0,
        cboLocation: "01",
        outdt: null,
        cboPerson: "admin",
        custcd: "",
        custnm: "",
        remark: "",
        attdatnum: "",
        outuse: "",
        rowstatus_s: "",
        seq2_s: "",
        rtnyn_s: "",
        rtntype_s: "",
        ordnum_s: "",
        ordseq_s: "",
        itemgrade_s: "",
        itemcd_s: "",
        itemnm_s: "",
        itemacnt_s: "",
        pacmeth_s: "",
        qty_s: "",
        qtyunit_s: "",
        lenunit_s: "",
        totlen_s: "",
        unitwgt_s: "",
        wgtunit_s: "",
        totwgt_s: "",
        len_s: "",
        itemthick_s: "",
        width_s: "",
        unpcalmeth_s: "",
        unp_s: "",
        amt_s: "",
        dlramt_s: "",
        wonamt_s: "",
        taxamt_s: "",
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
        serialno_s: "",
        load_place_s: "",
        outdt_s: "",
        person_s: "",
        userid: userId,
        pc: pc,
        form_id: "MA_A3400",
        serviceid: companyCode,
        reckey: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.outdt != null) {
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
          const newData2 = {
            ...item,
            rowstatus: "D",
          };
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
    if (field != "itemcd" && field != "itemnm" && field != "rowstatus") {
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
              amt: item.qty * item.unp,
              taxamt: Math.round(item.qty * item.unp * 0.1),
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
        title={workType === "N" ? "기타출고생성" : "기타출고정보"}
        width={position.width}
        height={position.height}
        onMove={handleMove}
        onResize={handleResize}
        onClose={onClose}
        modal={modal}
      >
        <FormBoxWrap style={{ width: "1530px", marginLeft: "-70px" }}>
          <FormBox>
            <tbody>
              <tr>
                <th>출고번호</th>
                <td>
                  <Input
                    name="reckey"
                    type="text"
                    value={filters.reckey}
                    className="readonly"
                  />
                </td>
                <th>출고일자</th>
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
                <th>담당자</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="cboPerson"
                      value={filters.cboPerson}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                      textField="user_name"
                      valueField="user_id"
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>업체코드</th>
                <td>
                  <Input
                    name="custcd"
                    type="text"
                    value={filters.custcd}
                    onChange={filterInputChange}
                  />
                  <ButtonInInput>
                    <Button
                      onClick={onCustWndClick}
                      icon="more-horizontal"
                      fillMode="flat"
                    />
                  </ButtonInInput>
                </td>
                <th>업체명</th>
                <td>
                  <Input
                    name="custnm"
                    type="text"
                    value={filters.custnm}
                    className="readonly"
                  />
                </td>
                <th>사업장</th>
                <td>
                  <Input
                    name="cboLocation"
                    type="text"
                    value={
                      locationListData.find(
                        (items: any) => items.sub_code === filters.cboLocation
                      )?.code_name == undefined
                        ? "본사"
                        : locationListData.find(
                            (items: any) =>
                              items.sub_code === filters.cboLocation
                          )?.code_name
                    }
                    className="readonly"
                  />
                </td>
              </tr>
              <tr>
                <th>비고</th>
                <td colSpan={5}>
                  <TextArea
                    value={filters.remark}
                    name="remark"
                    rows={4}
                    onChange={filterInputChange}
                  />
                </td>
              </tr>
              <tr>
                <th>출고용도</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="outuse"
                      value={filters.outuse}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                    />
                  )}
                </td>
                <th>첨부파일</th>
                <td colSpan={3}>
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
            </tbody>
          </FormBox>
        </FormBoxWrap>
        <GridContainer>
          <GridTitleContainer>
            <GridTitle>상세정보</GridTitle>
            <ButtonContainer>
              <Button
                themeColor={"primary"}
                onClick={onCopyWndClick}
                icon="folder-open"
              >
                품목참조
              </Button>
              <Button
                themeColor={"primary"}
                onClick={onCopyWndClick2}
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
            style={{ height: "450px" }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                itemacnt: itemacntListData.find(
                  (items: any) => items.sub_code === row.itemacnt
                )?.code_name,
                itemlvl1: itemlvl1ListData.find(
                  (item: any) => item.sub_code === row.itemlvl1
                )?.code_name,
                itemlvl2: itemlvl2ListData.find(
                  (item: any) => item.sub_code === row.itemlvl2
                )?.code_name,
                itemlvl3: itemlvl3ListData.find(
                  (item: any) => item.sub_code === row.itemlvl3
                )?.code_name,
                invunit: qtyunitListData.find(
                  (item: any) => item.sub_code === row.invunit
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
              width="200px"
              footerCell={mainTotalFooterCell}
            />
            <GridColumn field="itemnm" title="품목명" width="200px" />
            <GridColumn
              field="qty"
              title="수량"
              width="120px"
              cell={NumberCell}
              footerCell={editNumberFooterCell}
            />
            <GridColumn
              field="unp"
              title="단가"
              width="120px"
              cell={NumberCell}
            />
            <GridColumn
              field="amt"
              title="금액"
              width="120px"
              cell={NumberCell}
              footerCell={editNumberFooterCell}
            />
            <GridColumn
              field="taxamt"
              title="세액"
              width="120px"
              cell={NumberCell}
              footerCell={editNumberFooterCell}
            />
            <GridColumn field="remark" title="비고" width="380px" />
            <GridColumn field="lotnum" title="LOT NO" width="200px" />
            <GridColumn field="load_place" title="적재장소" width="180px" />
          </Grid>
        </GridContainer>
        <BottomContainer>
          <ButtonContainer>
            <Button themeColor={"primary"} onClick={selectData}>
              확인
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
      </Window>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={workType}
          setData={setCustData}
        />
      )}
      {CopyWindowVisible && (
        <CopyWindow2
          setVisible={setCopyWindowVisible}
          setData={setCopyData}
          itemacnt={""}
          pathname={pathname}
        />
      )}
      {CopyWindowVisible2 && (
        <CopyWindow3
          setVisible={setCopyWindowVisible2}
          setData={setCopyData2}
          itemacnt={"1"}
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
