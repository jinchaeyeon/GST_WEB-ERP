import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
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
import { IWindowPosition } from "../../hooks/interfaces";
import { isLoading, loginResultState } from "../../store/atoms";
import { Iparameters } from "../../store/types";
import CheckBoxReadOnlyCell from "../Cells/CheckBoxReadOnlyCell";
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
  isValidDate,
  numberWithCommas,
  toDate
} from "../CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../CommonString";
import { CellRender, RowRender } from "../Renderers/Renderers";
import CustomersWindow from "./CommonWindows/CustomersWindow";
import CopyWindow2 from "./SA_A3000W_Inven_Window";
import Window from "./WindowComponent/Window";

type IWindow = {
  workType: "N" | "U";
  data?: Idata;
  setVisible(t: boolean): void;
  reload(str: string): void;
  modal?: boolean;
  pathname: string;
};

type TdataArr = {
  rowstatus: string[];
  custcd: string[];
  custnm: string[];
  doqty: number[];
  dptcd: string[];
  itemacnt: string[];
  itemcd: string[];
  itemnm: string[];
  itemno: string[];
  len: number[];
  ordbnatur: string[];
  orddt: string[];
  ordinsiz: string[];
  ordkey: string[];
  ordnum: string[];
  ordseq: string[];
  ordsts: string[];
  person: string[];
  qty: number[];
  qtyunit: string[];
  rcvcustcd: string[];
  rcvcustnm: string[];
  remark: string[];
  reqqty: number[];
  unp: number[];
  reqseq: number[];
  unitwgt: number[];
  wgt: number[];
  wgtunit: string[];
  totwgt: number[];
  finyn: string[];
  spqty: number[];
  boxqty_w: number[];
  boxqty_h: number[];
  boxjanqty: number[];
  boxqty: number[];
  outlot: string[];
};

type Idata = {
  amt: number;
  amtunit: string;
  attdatnum: string;
  baseamt: number;
  busadiv: string;
  cargb: string;
  cargocd: string;
  carno: string;
  chk: string;
  custcd: string;
  custnm: string;
  custprsncd: string;
  doexdiv: string;
  dvnm: string;
  dvnum: string;
  files: string;
  finyn: string;
  finaldes: string;
  gugancd: string;
  itemacnt: string;
  location: string;
  jisiqty: number;
  num: number;
  orgdiv: string;
  outdt: string;
  outkind: string;
  outtype: string;
  outqty: number;
  outuse: string;
  person: string;
  pgmdiv: string;
  portnm: string;
  poregnum: string;
  project: string;
  position: string;
  qty: number;
  rcvcustcd: string;
  rcvcustnm: string;
  rcvperson: string;
  rcvnum: string;
  recdt: string;
  reqdt: string;
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
let temp = 0;
let targetRowIndex: null | number = null;

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
    top: isMobile == true ? 0 : (deviceHeight - 905) / 2,
    width: isMobile == true ? deviceWidth : 1600,
    height: isMobile == true ? deviceHeight : 905,
  });
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const userId = loginResult ? loginResult.userId : "";
  const pc = UseGetValueFromSessionItem("pc");
  const DATA_ITEM_KEY = "num";
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
    if (customOptionData !== null && workType != "U") {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        person: defaultOption.find((item: any) => item.id == "person")
          ?.valueCode,
        cargocd: defaultOption.find((item: any) => item.id == "cargocd")
          ?.valueCode,
        position: defaultOption.find((item: any) => item.id == "position")
          ?.valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA061,L_BA015",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [qtyunitListData, setQtyunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemacntListData, setItemacntListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setQtyunitListData(getBizCom(bizComponentData, "L_BA015"));
      setItemacntListData(getBizCom(bizComponentData, "L_BA061"));
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

  const onClose = () => {
    setVisible(false);
  };

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  const onCustWndClick2 = () => {
    setCustWindowVisible2(true);
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
    custcd: "",
    custnm: "",
    carno: "",
    cargocd: "",
    cargb: "",
    trcost: 0,
    dvnm: "",
    dvnum: "",
    finaldes: "",
    gugancd: "",
    location: sessionLocation,
    orgdiv: sessionOrgdiv,
    person: "",
    poregnum: "",
    portnm: "",
    position: "",
    rcvcustcd: "",
    rcvcustnm: "",
    rcvperson: "",
    rcvnum: "",
    reqdt: new Date(),
    remark: "",
    reqnum: "",
    shipdt: null,
    userid: userId,
    pc: pc,
    form_id: "SA_A2300W",
    serviceid: companyCode,
    files: "",
    frdt: new Date(),
    todt: new Date(),
    pgNum: 1,
    isSearch: false,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    const parameters: Iparameters = {
      procedureName: "P_SA_A3000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_position": "",
        "@p_reqnum": filters.reqnum,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_itemcd": "",
        "@p_itemnm": "",
        "@p_finyn": "",
        "@p_ordnum": "",
        "@p_poregnum": filters.poregnum,
        "@p_itemno": "",
        "@p_reqnum_s": "",
        "@p_reqseq_s": "",
        "@p_company_code": companyCode,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });
      setMainDataResult(() => {
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
        cargocd: data.cargocd,
        carno: data.carno,
        custcd: data.custcd,
        custnm: data.custnm,
        custprsncd: data.custprsncd,
        dvnm: data.dvnm,
        dvnum: data.dvnum,
        finaldes: data.finaldes,
        finyn: data.finyn,
        gugancd: data.gugancd,
        itemacnt: data.itemacnt,
        jisiqty: data.jisiqty,
        location: data.location,
        outqty: data.outqty,
        person: data.person,
        poregnum: data.poregnum,
        portnm: data.portnm,
        position: data.position,
        project: data.project,
        rcvcustcd: data.rcvcustcd,
        rcvcustnm: data.rcvcustnm,
        rcvperson: data.rcvperson,
        rcvnum: data.rcvnum,
        remark: data.remark,
        reqdt: toDate(data.reqdt),
        reqnum: data.reqnum,
        shipdt: data.shipdt == "" ? null : toDate(data.shipdt),
        trcost: data.trcost,
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

  const setCopyData = (data: any) => {
    mainDataResult.data.map((item) => {
      if (item[DATA_ITEM_KEY] > temp) {
        temp = item[DATA_ITEM_KEY];
      }
    });

    if (filters.custcd == "") {
      setFilters((prev: any) => ({
        ...prev,
        custcd: data[0].custcd,
        custnm: data[0].custnm,
      }));
    }

    data.map((item: any) => {
      const newDataItem = {
        [DATA_ITEM_KEY]: ++temp,
        boxjanqty: 0,
        boxqty: 0,
        boxqty_h: 0,
        boxqty_w: 0,
        cbm: 0,
        cbm2: 0,
        chk: "",
        custcd: item.custcd,
        custnm: item.custnm,
        dlvdt: item.dlvdt,
        extra_field6: item.extra_field6,
        finyn: "N",
        insiz: item.insiz,
        itemacnt: item.itemacnt,
        itemcd: item.itemcd,
        itemlvl1: "",
        itemlvl2: "",
        itemlvl3: "",
        itemnm: item.itemnm,
        itemno: item.itemno,
        len: item.len,
        location: filters.location,
        now_qty: 0,
        orddt: item.orddt,
        ordkey: item.ordkey,
        ordnum: item.ordnum,
        ordseq: item.ordseq,
        orgdiv: filters.orgdiv,
        outlot: "",
        outqty: 0,
        poregnum: "",
        position: filters.position,
        qty: item.qty,
        qtyunit: item.qtyunit,
        remark: "",
        reqdt: convertDateToStr(filters.reqdt),
        reqnum: filters.reqnum,
        reqseq: 0,
        spqty: 0,
        totwgt: 0,
        unitqty: 0,
        unitwgt: 0,
        unp: item.unp,
        wgt: 0,
        wgtunit: "",
        rowstatus: "N",
      };
      setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });

      setMainDataResult((prev) => {
        return {
          data: [newDataItem, ...prev.data],
          total: prev.total + 1,
        };
      });
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
    mainDataResult.data.map((item) => {
      if (item.qty == 0 && valid == true) {
        alert("수량을 채워주세요.");
        valid = false;
        return false;
      }
    });

    try {
      if (mainDataResult.data.length == 0) {
        throw findMessage(messagesData, "SA_A3000W_002");
      } else if (
        filters.custcd == "" ||
        filters.custcd == undefined ||
        filters.custcd == null
      ) {
        throw findMessage(messagesData, "SA_A3000W_004");
      } else if (
        filters.rcvcustcd == "" ||
        filters.rcvcustcd == undefined ||
        filters.rcvcustcd == null
      ) {
        throw findMessage(messagesData, "SA_A3000W_005");
      } else {
        if (valid == true) {
          const dataItem = mainDataResult.data.filter((item: any) => {
            return (
              (item.rowstatus == "N" || item.rowstatus == "U") &&
              item.rowstatus !== undefined
            );
          });
          if (dataItem.length == 0 && deletedMainRows.length == 0) {
            setParaData((prev) => ({
              ...prev,
              workType: workType,
              reqnum: filters.reqnum,
              location: filters.location,
              reqdt: filters.reqdt,
              shipdt:
                filters.shipdt == null ? "" : convertDateToStr(filters.shipdt),
              person: filters.person,
              custcd: filters.custcd,
              custnm: filters.custnm,
              rcvcustcd: filters.rcvcustcd,
              poregnum: filters.poregnum,
              portnm: filters.portnm,
              finaldes: filters.finaldes,
              carno: filters.carno,
              cargocd: filters.cargocd,
              cargb: filters.cargb,
              dvnm: filters.dvnm,
              dvnum: filters.dvnum,
              gugancd: filters.gugancd,
              trcost: parseInt(filters.trcost),
              remark: filters.remark,
              rcvperson: filters.rcvperson,
              rcvnum: filters.rcvnum,
            }));
          } else {
            const dataItem = mainDataResult.data.filter((item: any) => {
              return (
                (item.rowstatus == "N" || item.rowstatus == "U") &&
                item.rowstatus !== undefined
              );
            });
            if (dataItem.length == 0 && deletedMainRows.length == 0)
              return false;
            let dataArr: TdataArr = {
              rowstatus: [],
              custcd: [],
              custnm: [],
              doqty: [],
              dptcd: [],
              itemacnt: [],
              itemcd: [],
              itemnm: [],
              itemno: [],
              len: [],
              ordbnatur: [],
              orddt: [],
              ordinsiz: [],
              ordkey: [],
              ordnum: [],
              ordseq: [],
              ordsts: [],
              person: [],
              qty: [],
              qtyunit: [],
              rcvcustcd: [],
              rcvcustnm: [],
              remark: [],
              reqqty: [],
              unp: [],
              reqseq: [],
              unitwgt: [],
              wgt: [],
              wgtunit: [],
              totwgt: [],
              finyn: [],
              spqty: [],
              boxqty_w: [],
              boxqty_h: [],
              boxjanqty: [],
              boxqty: [],
              outlot: [],
            };

            dataItem.forEach((item: any, idx: number) => {
              const {
                rowstatus = "",
                itemacnt = "",
                itemcd = "",
                itemnm = "",
                len = "",
                ordnum = "",
                ordseq = "",
                qty = "",
                remark = "",
                unp = "",
                reqseq = "",
                unitwgt = "",
                wgt = "",
                wgtunit = "",
                totwgt = "",
                finyn = "",
                spqty = "",
                boxqty_w = "",
                boxqty_h = "",
                boxjanqty = "",
                boxqty = "",
              } = item;

              dataArr.rowstatus.push(rowstatus);
              dataArr.reqseq.push(reqseq == "" ? 0 : reqseq);
              dataArr.ordnum.push(ordnum == undefined ? "" : ordnum);
              dataArr.ordseq.push(ordseq == "" ? 0 : ordseq);
              dataArr.itemcd.push(itemcd);
              dataArr.itemnm.push(itemnm);
              dataArr.itemacnt.push(itemacnt == undefined ? "" : itemacnt);
              dataArr.qty.push(qty == "" ? 0 : qty);
              dataArr.len.push(len == "" ? 0 : len);
              dataArr.unitwgt.push(unitwgt == "" ? 0 : unitwgt);
              dataArr.wgt.push(wgt == "" ? 0 : wgt);
              dataArr.wgtunit.push(wgtunit == "" ? 0 : wgtunit);
              dataArr.totwgt.push(totwgt == "" ? 0 : totwgt);
              dataArr.remark.push(remark == undefined ? "" : remark);
              dataArr.finyn.push(finyn == undefined ? "" : finyn);
              dataArr.unp.push(unp == "" ? 0 : unp);
              dataArr.spqty.push(spqty == "" ? 0 : spqty);
              dataArr.boxqty_w.push(boxqty_w == "" ? 0 : boxqty_w);
              dataArr.boxqty_h.push(boxqty_h == "" ? 0 : boxqty_h);
              dataArr.boxjanqty.push(boxjanqty == "" ? 0 : boxjanqty);
              dataArr.boxqty.push(boxqty == "" ? 0 : boxqty);
              dataArr.outlot.push("");
            });
            deletedMainRows.forEach((item: any, idx: number) => {
              const {
                rowstatus = "",
                itemacnt = "",
                itemcd = "",
                itemnm = "",
                len = "",
                ordnum = "",
                ordseq = "",
                qty = "",
                remark = "",
                unp = "",
                reqseq = "",
                unitwgt = "",
                wgt = "",
                wgtunit = "",
                totwgt = "",
                finyn = "",
                spqty = "",
                boxqty_w = "",
                boxqty_h = "",
                boxjanqty = "",
                boxqty = "",
              } = item;

              dataArr.rowstatus.push(rowstatus);
              dataArr.reqseq.push(reqseq == "" ? 0 : reqseq);
              dataArr.ordnum.push(ordnum == undefined ? "" : ordnum);
              dataArr.ordseq.push(ordseq == "" ? 0 : ordseq);
              dataArr.itemcd.push(itemcd);
              dataArr.itemnm.push(itemnm);
              dataArr.itemacnt.push(itemacnt == undefined ? "" : itemacnt);
              dataArr.qty.push(qty == "" ? 0 : qty);
              dataArr.len.push(len == "" ? 0 : len);
              dataArr.unitwgt.push(unitwgt == "" ? 0 : unitwgt);
              dataArr.wgt.push(wgt == "" ? 0 : wgt);
              dataArr.wgtunit.push(wgtunit == "" ? 0 : wgtunit);
              dataArr.totwgt.push(totwgt == "" ? 0 : totwgt);
              dataArr.remark.push(remark == undefined ? "" : remark);
              dataArr.finyn.push(finyn == undefined ? "" : finyn);
              dataArr.unp.push(unp == "" ? 0 : unp);
              dataArr.spqty.push(spqty == "" ? 0 : spqty);
              dataArr.boxqty_w.push(boxqty_w == "" ? 0 : boxqty_w);
              dataArr.boxqty_h.push(boxqty_h == "" ? 0 : boxqty_h);
              dataArr.boxjanqty.push(boxjanqty == "" ? 0 : boxjanqty);
              dataArr.boxqty.push(boxqty == "" ? 0 : boxqty);
              dataArr.outlot.push("");
            });
            setParaData((prev) => ({
              ...prev,
              workType: workType,
              reqnum: filters.reqnum,
              location: filters.location,
              reqdt: filters.reqdt,
              shipdt:
                filters.shipdt == null ? "" : convertDateToStr(filters.shipdt),
              person: filters.person,
              custcd: filters.custcd,
              custnm: filters.custnm,
              rcvcustcd: filters.rcvcustcd,
              poregnum: filters.poregnum,
              portnm: filters.portnm,
              finaldes: filters.finaldes,
              carno: filters.carno,
              cargocd: filters.cargocd,
              cargb: filters.cargb,
              dvnm: filters.dvnm,
              dvnum: filters.dvnum,
              gugancd: filters.gugancd,
              trcost: parseInt(filters.trcost),
              remark: filters.remark,
              rcvperson: filters.rcvperson,
              rcvnum: filters.rcvnum,
              rowstatus: dataArr.rowstatus.join("|"),
              reqseq_s: dataArr.reqseq.join("|"),
              ordnum_s: dataArr.ordnum.join("|"),
              ordseq_s: dataArr.ordseq.join("|"),
              itemcd_s: dataArr.itemcd.join("|"),
              itemnm_s: dataArr.itemnm.join("|"),
              itemacnt_s: dataArr.itemacnt.join("|"),
              qty_s: dataArr.qty.join("|"),
              len_s: dataArr.len.join("|"),
              unitwgt_s: dataArr.unitwgt.join("|"),
              wgt_s: dataArr.wgt.join("|"),
              wgtunit_s: dataArr.wgtunit.join("|"),
              totwgt_s: dataArr.totwgt.join("|"),
              remark_s: dataArr.remark.join("|"),
              finyn_s: dataArr.finyn.join("|"),
              unp_s: dataArr.unp.join("|"),
              spqty_s: dataArr.spqty.join("|"),
              boxqty_w_s: dataArr.boxqty_w.join("|"),
              boxqty_h_s: dataArr.boxqty_h.join("|"),
              boxjanqty_s: dataArr.boxjanqty.join("|"),
              boxqty_s: dataArr.boxqty.join("|"),
              outlot_s: dataArr.outlot.join("|"),
            }));
          }
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "N",
    orgdiv: sessionOrgdiv,
    reqnum: "",
    location: sessionLocation,
    position: "",
    reqdt: new Date(),
    shipdt: "",
    person: "",
    custcd: "",
    custnm: "",
    rcvcustcd: "",
    poregnum: "",
    portnm: "",
    finaldes: "",
    carno: "",
    cargocd: "",
    cargb: "",
    dvnm: "",
    dvnum: "",
    gugancd: "",
    trcost: 0,
    remark: "",
    finyn: "",
    custprsncd: "",
    rcvperson: "",
    rcvnum: "",
    rcvnm: "",
    rowstatus: "",
    reqseq_s: "",
    ordnum_s: "",
    ordseq_s: "",
    itemcd_s: "",
    itemnm_s: "",
    itemacnt_s: "",
    qty_s: "",
    len_s: "",
    unitwgt_s: "",
    wgt_s: "",
    wgtunit_s: "",
    totwgt_s: "",
    remark_s: "",
    finyn_s: "",
    unp_s: "",
    spqty_s: "",
    boxqty_w_s: "",
    boxqty_h_s: "",
    boxjanqty_s: "",
    boxqty_s: "",
    userid: userId,
    pc: pc,
    outlot_s: "",
    form_id: "SA_A3000W",
    serviceid: companyCode,
  });

  const para: Iparameters = {
    procedureName: "P_SA_A3000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_reqnum": ParaData.reqnum,
      "@p_location": ParaData.location,
      "@p_position": ParaData.position,
      "@p_reqdt": convertDateToStr(ParaData.reqdt),
      "@p_shipdt": ParaData.shipdt,
      "@p_person": ParaData.person,
      "@p_custcd": ParaData.custcd,
      "@p_custnm": ParaData.custnm,
      "@p_rcvcustcd": ParaData.rcvcustcd,
      "@p_poregnum": ParaData.poregnum,
      "@p_portnm": ParaData.portnm,
      "@p_finaldes": ParaData.finaldes,
      "@p_carno": ParaData.carno,
      "@p_cargocd": ParaData.cargocd,
      "@p_cargb": ParaData.cargb,
      "@p_dvnm": ParaData.dvnm,
      "@p_dvnum": ParaData.dvnum,
      "@p_gugancd": ParaData.gugancd,
      "@p_trcost": ParaData.trcost,
      "@p_remark": ParaData.remark,
      "@p_finyn": ParaData.finyn,
      "@p_custprsncd": ParaData.custprsncd,
      "@p_rcvperson": ParaData.rcvperson,
      "@p_rcvnum": ParaData.rcvnum,
      "@p_rowstatus": ParaData.rowstatus,
      "@p_reqseq_s": ParaData.reqseq_s,
      "@p_ordnum_s": ParaData.ordnum_s,
      "@p_ordseq_s": ParaData.ordseq_s,
      "@p_itemcd_s": ParaData.itemcd_s,
      "@p_itemnm_s": ParaData.itemnm_s,
      "@p_itemacnt_s": ParaData.itemacnt_s,
      "@p_qty_s": ParaData.qty_s,
      "@p_len_s": ParaData.len_s,
      "@p_unitwgt_s": ParaData.unitwgt_s,
      "@p_wgt_s": ParaData.wgt_s,
      "@p_wgtunit_s": ParaData.wgtunit_s,
      "@p_totwgt_s": ParaData.totwgt_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_finyn_s": ParaData.finyn_s,
      "@p_unp_s": ParaData.unp_s,
      "@p_spqty_s": ParaData.spqty_s,
      "@p_boxqty_w_s": ParaData.boxqty_w_s,
      "@p_boxqty_h_s": ParaData.boxqty_h_s,
      "@p_boxjanqty_s": ParaData.boxjanqty_s,
      "@p_boxqty_s": ParaData.boxqty_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_outlot_s": ParaData.outlot_s,
      "@p_form_id": "P_SA_A3000W",
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

    if (data.isSuccess == true) {
      deletedMainRows = [];
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
      setParaData({
        pgSize: PAGE_SIZE,
        workType: "N",
        orgdiv: sessionOrgdiv,
        reqnum: "",
        location: sessionLocation,
        position: "",
        reqdt: new Date(),
        shipdt: "",
        person: "",
        custcd: "",
        custnm: "",
        rcvcustcd: "",
        poregnum: "",
        portnm: "",
        finaldes: "",
        carno: "",
        cargocd: "",
        cargb: "",
        dvnm: "",
        dvnum: "",
        gugancd: "",
        trcost: 0,
        remark: "",
        finyn: "",
        custprsncd: "",
        rcvperson: "",
        rcvnum: "",
        rcvnm: "",
        rowstatus: "",
        reqseq_s: "",
        ordnum_s: "",
        ordseq_s: "",
        itemcd_s: "",
        itemnm_s: "",
        itemacnt_s: "",
        qty_s: "",
        len_s: "",
        unitwgt_s: "",
        wgt_s: "",
        wgtunit_s: "",
        totwgt_s: "",
        remark_s: "",
        finyn_s: "",
        unp_s: "",
        spqty_s: "",
        boxqty_w_s: "",
        boxqty_h_s: "",
        boxjanqty_s: "",
        boxqty_s: "",
        userid: userId,
        pc: pc,
        outlot_s: "",
        form_id: "SA_A3000W",
        serviceid: companyCode,
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.rowstatus != "" || ParaData.reqnum != "") {
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
      field != "rowstatus" &&
      field != "insiz" &&
      field != "itemcd" &&
      field != "itemnm" &&
      field != "len" &&
      field != "ordnum" &&
      field != "finyn" &&
      field != "qtyunit"
    ) {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
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
        titles={workType == "N" ? "출하지시생성" : "출하지시정보"}
        positions={position}
        Close={onClose}
        modals={modal}
      >
        <FormBoxWrap>
          <FormBox>
            <tbody>
              <tr>
                <th>출하지시번호</th>
                <td>
                  <Input
                    name="reqnum"
                    type="text"
                    value={filters.reqnum}
                    className="readonly"
                  />
                </td>
                <th>지시일자</th>
                <td>
                  <div className="filter-item-wrap">
                    <DatePicker
                      name="reqdt"
                      value={filters.reqdt}
                      format="yyyy-MM-dd"
                      onChange={filterInputChange}
                      placeholder=""
                      className="required"
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
                <th>사업장</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="location"
                      value={filters.location}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
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
                <th>업체명</th>
                <td>
                  <Input
                    name="custnm"
                    type="text"
                    value={filters.custnm}
                    onChange={filterInputChange}
                  />
                </td>
                <th>PO번호</th>
                <td>
                  <Input
                    name="poregnum"
                    type="text"
                    value={filters.poregnum}
                    onChange={filterInputChange}
                  />
                </td>
                <th>운송비구간</th>
                <td>
                  <Input
                    name="gugancd"
                    type="text"
                    value={filters.gugancd}
                    onChange={filterInputChange}
                  />
                </td>
                <th>사업부</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="position"
                      value={filters.position}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                    />
                  )}
                </td>
              </tr>
              <tr>
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
                    onChange={filterInputChange}
                  />
                </td>
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
                <th>차량번호</th>
                <td>
                  <Input
                    name="carno"
                    type="text"
                    value={filters.carno}
                    onChange={filterInputChange}
                  />
                </td>
              </tr>
              <tr>
                <th>선적지</th>
                <td colSpan={3}>
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
                <th>도착지</th>
                <td colSpan={3}>
                  <Input
                    name="finaldes"
                    type="text"
                    value={filters.finaldes}
                    onChange={filterInputChange}
                  />
                </td>
                <th>인수자</th>
                <td>
                  <Input
                    name="rcvperson"
                    type="text"
                    value={filters.rcvperson}
                    onChange={filterInputChange}
                  />
                </td>
                <th>인수자연락처</th>
                <td>
                  <Input
                    name="rcvnum"
                    type="text"
                    value={filters.rcvnum}
                    onChange={filterInputChange}
                  />
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
        <GridContainer height={`calc(100% - 420px)`}>
          <GridTitleContainer>
            <GridTitle>상세정보</GridTitle>
            <ButtonContainer>
              <Button
                themeColor={"primary"}
                onClick={onCopyWndClick}
                icon="folder-open"
              >
                수주참조
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
                qtyunit: qtyunitListData.find(
                  (item: any) => item.sub_code == row.qtyunit
                )?.code_name,
                itemacnt: itemacntListData.find(
                  (item: any) => item.sub_code == row.itemacnt
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
              width="120px"
              footerCell={mainTotalFooterCell}
            />
            <GridColumn field="itemnm" title="품목명" width="120px" />
            <GridColumn field="insiz" title="규격" width="150px" />
            <GridColumn field="itemacnt" title="품목계정" width="120px" />
            <GridColumn
              field="qty"
              title="수량"
              width="100px"
              cell={NumberCell}
              footerCell={editNumberFooterCell}
            />
            <GridColumn field="qtyunit" title="수량단위" width="120px" />
            <GridColumn
              field="len"
              title="길이"
              width="100px"
              cell={NumberCell}
            />
            <GridColumn field="remark" title="비고" width="415px" />
            <GridColumn field="ordnum" title="수주번호" width="150px" />
            <GridColumn
              field="finyn"
              title="완료여부"
              width="100px"
              cell={CheckBoxReadOnlyCell}
            />
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
          custnm={filters.custnm}
          pathname={pathname}
        />
      )}
    </>
  );
};

export default CopyWindow;
