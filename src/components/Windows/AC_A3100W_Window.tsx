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
import { Input, NumericTextBox } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import React, { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  FilterBoxWrap,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridTitleContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import { isLoading } from "../../store/atoms";
import { Iparameters } from "../../store/types";
import MonthCalendar from "../Calendars/MonthCalendar";
import ComboBoxCell from "../Cells/ComboBoxCell";
import DateCell from "../Cells/DateCell";
import MonthDateCell from "../Cells/MonthDateCell";
import NumberCell from "../Cells/NumberCell";
import YearDateCell from "../Cells/YearDateCell";
import BizComponentComboBox from "../ComboBoxes/BizComponentComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseParaPc,
  convertDateToStr,
  dateformat,
  getGridItemChangedData,
  numberWithCommas,
  setDefaultDate,
  toDate,
} from "../CommonFunction";
import { EDIT_FIELD, PAGE_SIZE, SELECTED_FIELD } from "../CommonString";
import { CellRender, RowRender } from "../Renderers/Renderers";
import CustomersWindow from "./CommonWindows/CustomersWindow";

type IWindow = {
  workType: "N" | "U";
  data?: any;
  setVisible(t: boolean): void;
  setData(str: string): void;
  modal?: boolean;
  pathname: string;
};

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
let deletedMainRows: object[] = [];
let deletedMainRows2: object[] = [];
let deletedMainRows3: object[] = [];
let temp = 0;
let temp2 = 0;
let temp3 = 0;

type TdataArr = {
  rowstatus_s: string[];
  fxcode_s: string[];
  seq_s: string[];
  gubun_s: string[];
  fxdt_s: string[];
  remark_s: string[];
  amt_s: string[];
  qty_s: string[];
  transamt_s: string[];
};

type TdataArr2 = {
  rowstatus_s: string[];
  fxcode_s: string[];
  fxyrmm_s: string[];
  growamt_s: string[];
  dropamt_s: string[];
  predamt_s: string[];
  curdamt_s: string[];
  dropdamt_s: string[];
  growdamt_s: string[];
  dptcd_s: string[];
  baseamt_s: string[];
};

type TdataArr3 = {
  rowstatus_s: string[];
  fxcode_s: string[];
  fxyrmm_s: string[];
  growamt_s: string[];
  dropamt_s: string[];
  predamt_s: string[];
  curdamt_s: string[];
  dropdamt_s: string[];
  growdamt_s: string[];
  baseamt_s: string[];
};

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_AC230, L_dptcd_001", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field === "gubun" ? "L_AC230" : field === "dptcd" ? "L_dptcd_001" : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  const textField = field == "dptcd" ? "dptnm" : "code_name";
  const valueField = field == "dptcd" ? "dptcd" : "sub_code";

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      textField={textField}
      valueField={valueField}
      {...props}
    />
  ) : (
    <td />
  );
};

const CopyWindow = ({
  workType,
  data,
  setVisible,
  setData,
  modal = false,
  pathname,
}: IWindow) => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const setLoading = useSetRecoilState(isLoading);
  const [tabSelected, setTabSelected] = useState(0);
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const userId = UseGetValueFromSessionItem("user_id");
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 1600,
    height: 580,
  });
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
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
        fxdiv: defaultOption.find((item: any) => item.id === "fxdiv").valueCode,
        fxdepsts: defaultOption.find((item: any) => item.id === "fxdepsts")
          .valueCode,
      }));

      setFilters2((prev) => ({
        ...prev,
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
        fxdiv: defaultOption.find((item: any) => item.id === "fxdiv").valueCode,
        fxdepsts: defaultOption.find((item: any) => item.id === "fxdepsts")
          .valueCode,
      }));

      setFilters3((prev) => ({
        ...prev,
        fxdiv: defaultOption.find((item: any) => item.id === "fxdiv").valueCode,
        fxdepsts: defaultOption.find((item: any) => item.id === "fxdepsts")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  const processApi = useApi();
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
    setVisible(false);
  };

  const handleSelectTab = (e: any) => {
    if (e.selected == 0) {
      setPosition((prev) => ({
        ...prev,
        height: isMobile == true ? 900 : 580,
      }));
    } else {
      setPosition((prev) => ({
        ...prev,
        height: 900,
      }));
    }
    setTabSelected(e.selected);
  };

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    fxcode: "",
    fxnm: "",
    fxdiv: "",
    custcd: "",
    custnm: "",
    fxdepsts: "",
    dptcd: "",
    acntcd: "",
    frdt: new Date(),
    todt: new Date(),
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    fxcode: "",
    fxnm: "",
    fxdiv: "",
    custcd: "",
    custnm: "",
    fxdepsts: "",
    dptcd: "",
    acntcd: "",
    frdt: new Date(),
    todt: new Date(),
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [filters3, setFilters3] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    fxcode: "",
    fxnm: "",
    fxdiv: "",
    custcd: "",
    custnm: "",
    fxdepsts: "",
    dptcd: "",
    acntcd: "",
    frdt: new Date(),
    todt: new Date(),
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters2((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [mainDataState3, setMainDataState3] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [tempState2, setTempState2] = useState<State>({
    sort: [],
  });
  const [tempState3, setTempState3] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [mainDataResult3, setMainDataResult3] = useState<DataResult>(
    process([], mainDataState3)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [tempResult2, setTempResult2] = useState<DataResult>(
    process([], tempState2)
  );
  const [tempResult3, setTempResult3] = useState<DataResult>(
    process([], tempState3)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState3, setSelectedState3] = useState<{
    [id: string]: boolean | number[];
  }>({});
  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A3100W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "PROPERTY",
        "@p_orgdiv": filters.orgdiv,
        "@p_fxcode": filters.fxcode,
        "@p_fxnm": filters.fxnm,
        "@p_fxdiv": filters.fxdiv,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_fxdepsts": filters.fxdepsts,
        "@p_frdt": "",
        "@p_todt": "",
        "@p_find_row_value": filters.find_row_value,
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

      setMainDataResult({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });

      if (totalRowCnt > 0) {
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
      }
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

  //그리드 데이터 조회
  const fetchMainGrid2 = async (filters2: any) => {
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A3100W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": "MON",
        "@p_orgdiv": filters2.orgdiv,
        "@p_fxcode": filters2.fxcode,
        "@p_fxnm": filters2.fxnm,
        "@p_fxdiv": filters2.fxdiv,
        "@p_custcd": filters2.custcd,
        "@p_custnm": filters2.custnm,
        "@p_fxdepsts": filters2.fxdepsts,
        "@p_frdt": convertDateToStr(filters2.frdt),
        "@p_todt": convertDateToStr(filters2.todt),
        "@p_find_row_value": filters2.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
      }));

      setMainDataResult2({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });

      if (totalRowCnt > 0) {
        setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
      }
    }
    setFilters2((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  //그리드 데이터 조회
  const fetchMainGrid3 = async (filters3: any) => {
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A3100W_Q",
      pageNumber: filters3.pgNum,
      pageSize: filters3.pgSize,
      parameters: {
        "@p_work_type": "YEAR",
        "@p_orgdiv": filters3.orgdiv,
        "@p_fxcode": filters3.fxcode,
        "@p_fxnm": filters3.fxnm,
        "@p_fxdiv": filters3.fxdiv,
        "@p_custcd": filters3.custcd,
        "@p_custnm": filters3.custnm,
        "@p_fxdepsts": filters3.fxdepsts,
        "@p_frdt": "",
        "@p_todt": "",
        "@p_find_row_value": filters3.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
      }));

      setMainDataResult3({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });

      if (totalRowCnt > 0) {
        setSelectedState3({ [rows[0][DATA_ITEM_KEY3]]: true });
      }
    }
    setFilters3((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };
  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && customOptionData !== null) {
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters2.isSearch && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters3.isSearch && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3);
      setFilters3((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid3(deepCopiedFilters);
    }
  }, [filters3]);

  const selectData = () => {
    if (tabSelected == 0) {
      setParaData((prev) => ({
        ...prev,
        workType: workType,
        orgdiv: "01",
        fxcode: Information.fxcode,
        fxnm: Information.fxnm,
        fxsize: Information.fxsize,
        fxdetail: Information.fxdetail,
        fxnum: Information.fxnum,
        fxdiv: Information.fxdiv,
        qty: Information.qty,
        custcd: Information.custcd,
        custnm: Information.custnm,
        maker: Information.maker,
        model: Information.model,
        location: Information.location,
        dptcd: Information.dptcd,
        indt: convertDateToStr(Information.indt),
        fxuser1: Information.fxuser1,
        fxuser2: Information.fxuser2,
        costgb1: Information.costgb1,
        depgb: Information.depgb,
        fxsts: Information.fxsts,
        fxinmeth: Information.fxinmeth,
        fxdepyrmm: Information.fxdepyrmm,
        rate: Information.rate,
        fxpurcost: Information.fxpurcost,
        findt:
          Information.findt == null ? "" : convertDateToStr(Information.findt),
        fxdepsts: Information.fxdepsts,
        projectno: Information.projectno,
        fxdespdt:
          Information.fxdespdt == null
            ? ""
            : convertDateToStr(Information.fxdespdt),
        fxdespqty: Information.fxdespqty,
        fxdespamt: Information.fxdespamt,
        fxdespcust: Information.fxdespcust,
        fxrevaldt: Information.fxrevaldt,
        fxtaxincost: Information.fxtaxincost,
        fxacumlamt: Information.fxacumlamt,
        fxdepamtdpyr: Information.fxdepamtdpyr,
        fxdepcumdpyr: Information.fxdepcumdpyr,
        fxdepbaldpyr: Information.fxdepbaldpyr,
        fxdepamtyr: Information.fxdepamtyr,
        fxdepcumyr: Information.fxdepcumyr,
        fxdepbalyr: Information.fxdepbalyr,
        fxamt: Information.fxamt,
        chlditemcd: Information.chlditemcd,
        lawdiv: Information.lawdiv,
        remark: Information.remark,
        attdatnum: Information.attdatnum,
      }));
    } else if (tabSelected == 1) {
      const dataItem = mainDataResult.data.filter((item: any) => {
        return (
          (item.rowstatus === "N" || item.rowstatus === "U") &&
          item.rowstatus !== undefined
        );
      });

      if (dataItem.length === 0 && deletedMainRows.length == 0) return false;

      let dataArr: TdataArr = {
        rowstatus_s: [],
        fxcode_s: [],
        seq_s: [],
        gubun_s: [],
        fxdt_s: [],
        remark_s: [],
        amt_s: [],
        qty_s: [],
        transamt_s: [],
      };

      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          fxcode = "",
          seq = "",
          gubun = "",
          fxdt = "",
          remark = "",
          amt = "",
          qty = "",
          transamt = "",
        } = item;
        dataArr.rowstatus_s.push(rowstatus);
        dataArr.fxcode_s.push(fxcode);
        dataArr.seq_s.push(seq);
        dataArr.gubun_s.push(gubun);
        dataArr.fxdt_s.push(fxdt);
        dataArr.remark_s.push(remark);
        dataArr.amt_s.push(amt);
        dataArr.qty_s.push(qty);
        dataArr.transamt_s.push(transamt);
      });
      deletedMainRows.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          fxcode = "",
          seq = "",
          gubun = "",
          fxdt = "",
          remark = "",
          amt = "",
          qty = "",
          transamt = "",
        } = item;
        dataArr.rowstatus_s.push(rowstatus);
        dataArr.fxcode_s.push(fxcode);
        dataArr.seq_s.push(seq);
        dataArr.gubun_s.push(gubun);
        dataArr.fxdt_s.push(fxdt);
        dataArr.remark_s.push(remark);
        dataArr.amt_s.push(amt);
        dataArr.qty_s.push(qty);
        dataArr.transamt_s.push(transamt);
      });

      setParaData((prev) => ({
        ...prev,
        workType: "PROPERTY",
        orgdiv: "01",
        fxcode: Information.fxcode,
        rowstatus_s: dataArr.rowstatus_s.join("|"),
        fxcode_s: dataArr.fxcode_s.join("|"),
        seq_s: dataArr.seq_s.join("|"),
        gubun_s: dataArr.gubun_s.join("|"),
        fxdt_s: dataArr.fxdt_s.join("|"),
        remark_s: dataArr.remark_s.join("|"),
        amt_s: dataArr.amt_s.join("|"),
        qty_s: dataArr.qty_s.join("|"),
        transamt_s: dataArr.transamt_s.join("|"),
      }));
    } else if (tabSelected == 2) {
      const dataItem = mainDataResult2.data.filter((item: any) => {
        return (
          (item.rowstatus === "N" || item.rowstatus === "U") &&
          item.rowstatus !== undefined
        );
      });

      if (dataItem.length === 0 && deletedMainRows2.length == 0) return false;

      let dataArr: TdataArr2 = {
        rowstatus_s: [],
        fxcode_s: [],
        fxyrmm_s: [],
        growamt_s: [],
        dropamt_s: [],
        predamt_s: [],
        curdamt_s: [],
        dropdamt_s: [],
        growdamt_s: [],
        dptcd_s: [],
        baseamt_s: [],
      };

      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          fxcode = "",
          fxyrmm = "",
          growamt = "",
          dropamt = "",
          predamt = "",
          curdamt = "",
          dropdamt = "",
          growdamt = "",
          dptcd = "",
          baseamt = "",
        } = item;
        dataArr.rowstatus_s.push(rowstatus);
        dataArr.fxcode_s.push(fxcode);
        dataArr.fxyrmm_s.push(fxyrmm.substr(0, 6));
        dataArr.growamt_s.push(growamt);
        dataArr.dropamt_s.push(dropamt);
        dataArr.predamt_s.push(predamt);
        dataArr.curdamt_s.push(curdamt);
        dataArr.dropdamt_s.push(dropdamt);
        dataArr.growdamt_s.push(growdamt);
        dataArr.dptcd_s.push(dptcd);
        dataArr.baseamt_s.push(baseamt);
      });
      deletedMainRows2.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          fxcode = "",
          fxyrmm = "",
          growamt = "",
          dropamt = "",
          predamt = "",
          curdamt = "",
          dropdamt = "",
          growdamt = "",
          dptcd = "",
          baseamt = "",
        } = item;
        dataArr.rowstatus_s.push(rowstatus);
        dataArr.fxcode_s.push(fxcode);
        dataArr.fxyrmm_s.push(fxyrmm.substr(0, 6));
        dataArr.growamt_s.push(growamt);
        dataArr.dropamt_s.push(dropamt);
        dataArr.predamt_s.push(predamt);
        dataArr.curdamt_s.push(curdamt);
        dataArr.dropdamt_s.push(dropdamt);
        dataArr.growdamt_s.push(growdamt);
        dataArr.dptcd_s.push(dptcd);
        dataArr.baseamt_s.push(baseamt);
      });

      setParaData((prev) => ({
        ...prev,
        workType: "MON",
        orgdiv: "01",
        fxcode: Information.fxcode,
        rowstatus_s: dataArr.rowstatus_s.join("|"),
        fxcode_s: dataArr.fxcode_s.join("|"),
        fxyrmm_s: dataArr.fxyrmm_s.join("|"),
        growamt_s: dataArr.growamt_s.join("|"),
        dropamt_s: dataArr.dropamt_s.join("|"),
        predamt_s: dataArr.predamt_s.join("|"),
        curdamt_s: dataArr.curdamt_s.join("|"),
        dropdamt_s: dataArr.dropdamt_s.join("|"),
        growdamt_s: dataArr.growdamt_s.join("|"),
        dptcd_s: dataArr.dptcd_s.join("|"),
        baseamt_s: dataArr.baseamt_s.join("|"),
      }));
    } else if (tabSelected == 3) {
      const dataItem = mainDataResult3.data.filter((item: any) => {
        return (
          (item.rowstatus === "N" || item.rowstatus === "U") &&
          item.rowstatus !== undefined
        );
      });

      if (dataItem.length === 0 && deletedMainRows3.length == 0) return false;

      let dataArr: TdataArr3 = {
        rowstatus_s: [],
        fxcode_s: [],
        fxyrmm_s: [],
        growamt_s: [],
        dropamt_s: [],
        predamt_s: [],
        curdamt_s: [],
        dropdamt_s: [],
        growdamt_s: [],
        baseamt_s: [],
      };

      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          fxcode = "",
          fxyrmm = "",
          growamt = "",
          dropamt = "",
          predamt = "",
          curdamt = "",
          dropdamt = "",
          growdamt = "",
          baseamt = "",
        } = item;
        dataArr.rowstatus_s.push(rowstatus);
        dataArr.fxcode_s.push(fxcode);
        dataArr.fxyrmm_s.push(fxyrmm.substr(0, 4));
        dataArr.growamt_s.push(growamt);
        dataArr.dropamt_s.push(dropamt);
        dataArr.predamt_s.push(predamt);
        dataArr.curdamt_s.push(curdamt);
        dataArr.dropdamt_s.push(dropdamt);
        dataArr.growdamt_s.push(growdamt);
        dataArr.baseamt_s.push(baseamt);
      });
      deletedMainRows3.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          fxcode = "",
          fxyrmm = "",
          growamt = "",
          dropamt = "",
          predamt = "",
          curdamt = "",
          dropdamt = "",
          growdamt = "",
          dptcd = "",
          baseamt = "",
        } = item;
        dataArr.rowstatus_s.push(rowstatus);
        dataArr.fxcode_s.push(fxcode);
        dataArr.fxyrmm_s.push(fxyrmm.substr(0, 4));
        dataArr.growamt_s.push(growamt);
        dataArr.dropamt_s.push(dropamt);
        dataArr.predamt_s.push(predamt);
        dataArr.curdamt_s.push(curdamt);
        dataArr.dropdamt_s.push(dropdamt);
        dataArr.growdamt_s.push(growdamt);
        dataArr.baseamt_s.push(baseamt);
      });

      setParaData((prev) => ({
        ...prev,
        workType: "YEAR",
        orgdiv: "01",
        fxcode: Information.fxcode,
        rowstatus_s: dataArr.rowstatus_s.join("|"),
        fxcode_s: dataArr.fxcode_s.join("|"),
        fxyrmm_s: dataArr.fxyrmm_s.join("|"),
        growamt_s: dataArr.growamt_s.join("|"),
        dropamt_s: dataArr.dropamt_s.join("|"),
        predamt_s: dataArr.predamt_s.join("|"),
        curdamt_s: dataArr.curdamt_s.join("|"),
        dropdamt_s: dataArr.dropdamt_s.join("|"),
        growdamt_s: dataArr.growdamt_s.join("|"),
        baseamt_s: dataArr.baseamt_s.join("|"),
      }));
    }
  };

  const [paraData, setParaData] = useState({
    workType: "",
    orgdiv: "01",
    fxcode: "",
    fxnm: "",
    fxsize: "",
    fxdetail: "",
    fxnum: "",
    fxdiv: "",
    qty: 0,
    custcd: "",
    custnm: "",
    maker: "",
    model: "",
    location: "",
    dptcd: "",
    indt: "",
    fxuser1: "",
    fxuser2: "",
    costgb1: "",
    depgb: "",
    fxsts: "",
    fxinmeth: "",
    fxdepyrmm: 0,
    rate: 0,
    fxpurcost: 0,
    findt: "",
    fxdepsts: "",
    projectno: "",
    fxdespdt: "",
    fxdespqty: 0,
    fxdespamt: 0,
    fxdespcust: "",
    fxrevaldt: "",
    fxtaxincost: 0,
    fxacumlamt: 0,
    fxdepamtdpyr: 0,
    fxdepcumdpyr: 0,
    fxdepbaldpyr: 0,
    fxdepamtyr: 0,
    fxdepcumyr: 0,
    fxdepbalyr: 0,
    fxamt: 0,
    chlditemcd: "",
    lawdiv: "",
    remark: "",
    attdatnum: "",

    rowstatus_s: "",
    fxcode_s: "",
    seq_s: "",
    gubun_s: "",
    fxdt_s: "",
    remark_s: "",
    amt_s: "",
    qty_s: "",
    transamt_s: "",

    fxyrmm_s: "",
    growamt_s: "",
    dropamt_s: "",
    predamt_s: "",
    curdamt_s: "",
    dropdamt_s: "",
    growdamt_s: "",
    dptcd_s: "",
    baseamt_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_AC_A3100W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,
      "@p_orgdiv": paraData.orgdiv,
      "@p_fxcode": paraData.fxcode,
      "@p_fxnm": paraData.fxnm,
      "@p_fxsize": paraData.fxsize,
      "@p_fxdetail": paraData.fxdetail,
      "@p_fxnum": paraData.fxnum,
      "@p_fxdiv": paraData.fxdiv,
      "@p_qty": paraData.qty,
      "@p_custcd": paraData.custcd,
      "@p_custnm": paraData.custnm,
      "@p_maker": paraData.maker,
      "@p_model": paraData.model,
      "@p_location": paraData.location,
      "@p_dptcd": paraData.dptcd,
      "@p_indt": paraData.indt,
      "@p_fxuser1": paraData.fxuser1,
      "@p_fxuser2": paraData.fxuser2,
      "@p_costgb1": paraData.costgb1,
      "@p_depgb": paraData.depgb,
      "@p_fxsts": paraData.fxsts,
      "@p_fxinmeth": paraData.fxinmeth,
      "@p_fxdepyrmm": paraData.fxdepyrmm,
      "@p_rate": paraData.rate,
      "@p_fxpurcost": paraData.fxpurcost,
      "@p_findt": paraData.findt,
      "@p_fxdepsts": paraData.fxdepsts,
      "@p_projectno": paraData.projectno,
      "@p_fxdespdt": paraData.fxdespdt,
      "@p_fxdespqty": paraData.fxdespqty,
      "@p_fxdespamt": paraData.fxdespamt,
      "@p_fxdespcust": paraData.fxdespcust,
      "@p_fxrevaldt": paraData.fxrevaldt,
      "@p_fxtaxincost": paraData.fxtaxincost,
      "@p_fxacumlamt": paraData.fxacumlamt,
      "@p_fxdepamtdpyr": paraData.fxdepamtdpyr,
      "@p_fxdepcumdpyr": paraData.fxdepcumdpyr,
      "@p_fxdepbaldpyr": paraData.fxdepbaldpyr,
      "@p_fxdepamtyr": paraData.fxdepamtyr,
      "@p_fxdepcumyr": paraData.fxdepcumyr,
      "@p_fxdepbalyr": paraData.fxdepbalyr,
      "@p_fxamt": paraData.fxamt,
      "@p_chlditemcd": paraData.chlditemcd,
      "@p_lawdiv": paraData.lawdiv,
      "@p_remark": paraData.remark,
      "@p_attdatnum": paraData.attdatnum,

      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_fxcode_s": paraData.fxcode_s,
      "@p_seq_s": paraData.seq_s,
      "@p_gubun_s": paraData.gubun_s,
      "@p_fxdt_s": paraData.fxdt_s,
      "@p_remark_s": paraData.remark_s,
      "@p_amt_s": paraData.amt_s,
      "@p_qty_s": paraData.qty_s,
      "@p_transamt_s": paraData.transamt_s,

      "@p_fxyrmm_s": paraData.fxyrmm_s,
      "@p_growamt_s": paraData.growamt_s,
      "@p_dropamt_s": paraData.dropamt_s,
      "@p_predamt_s": paraData.predamt_s,
      "@p_curdamt_s": paraData.curdamt_s,
      "@p_dropdamt_s": paraData.dropdamt_s,
      "@p_growdamt_s": paraData.growdamt_s,
      "@p_dptcd_s": paraData.dptcd_s,
      "@p_baseamt_s": paraData.baseamt_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "AC_A3100W",
    },
  };

  useEffect(() => {
    if (paraData.workType != "") {
      fetchTodoGridSaved();
    }
  }, [paraData]);

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      setData(data.returnString);
      deletedMainRows = [];
      deletedMainRows2 = [];
      deletedMainRows3 = [];

      setFilters((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        isSearch: true,
        pgNum: 1,
      }));
      setFilters2((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        isSearch: true,
        pgNum: 1,
      }));
      setFilters3((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        isSearch: true,
        pgNum: 1,
      }));
      if (paraData.workType == "N") {
        setVisible(false);
      }
      setParaData({
        workType: "",
        orgdiv: "01",
        fxcode: "",
        fxnm: "",
        fxsize: "",
        fxdetail: "",
        fxnum: "",
        fxdiv: "",
        qty: 0,
        custcd: "",
        custnm: "",
        maker: "",
        model: "",
        location: "",
        dptcd: "",
        indt: "",
        fxuser1: "",
        fxuser2: "",
        costgb1: "",
        depgb: "",
        fxsts: "",
        fxinmeth: "",
        fxdepyrmm: 0,
        rate: 0,
        fxpurcost: 0,
        findt: "",
        fxdepsts: "",
        projectno: "",
        fxdespdt: "",
        fxdespqty: 0,
        fxdespamt: 0,
        fxdespcust: "",
        fxrevaldt: "",
        fxtaxincost: 0,
        fxacumlamt: 0,
        fxdepamtdpyr: 0,
        fxdepcumdpyr: 0,
        fxdepbaldpyr: 0,
        fxdepamtyr: 0,
        fxdepcumyr: 0,
        fxdepbalyr: 0,
        fxamt: 0,
        chlditemcd: "",
        lawdiv: "",
        remark: "",
        attdatnum: "",

        rowstatus_s: "",
        fxcode_s: "",
        seq_s: "",
        gubun_s: "",
        fxdt_s: "",
        remark_s: "",
        amt_s: "",
        qty_s: "",
        transamt_s: "",

        fxyrmm_s: "",
        growamt_s: "",
        dropamt_s: "",
        predamt_s: "",
        curdamt_s: "",
        dropdamt_s: "",
        growdamt_s: "",
        dptcd_s: "",
        baseamt_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (workType === "U" && data != undefined) {
      setInformation((prev) => ({
        ...prev,
        acseq1: data.acseq1,
        acseq2: data.acseq2,
        actdt: data.actdt == "" ? null : toDate(data.actdt),
        attdatnum: data.attdatnum,
        chlditemcd: data.chlditemcd,
        costgb1: data.costgb1,
        custcd: data.custcd,
        custnm: data.custnm,
        depgb: data.depgb,
        dptcd: data.dptcd,
        findt: data.findt == "" ? null : toDate(data.findt),
        fxacumlamt: data.fxacumlamt,
        fxamt: data.fxamt,
        fxcode: data.fxcode,
        fxdepamtdpyr: data.fxdepamtdpyr,
        fxdepamtyr: data.fxdepamtyr,
        fxdepbaldpyr: data.fxdepbaldpyr,
        fxdepbalyr: data.fxdepbalyr,
        fxdepcumdpyr: data.fxdepcumdpyr,
        fxdepcumyr: data.fxdepcumyr,
        fxdepsts: data.fxdepsts,
        fxdepyrmm: data.fxdepyrmm,
        fxdespamt: data.fxdespamt,
        fxdespcust: data.fxdespcust,
        fxdespdt: data.fxdespdt == "" ? null : toDate(data.fxdespdt),
        fxdespqty: data.fxdespqty,
        fxdetail: data.fxdetail,
        fxdiv: data.fxdiv,
        fxinmeth: data.fxinmeth,
        fxnm: data.fxnm,
        fxnum: data.fxnum,
        fxpurcost: data.fxpurcost,
        fxrevaldt: data.fxrevaldt,
        fxsize: data.fxsize,
        fxsts: data.fxsts,
        fxtaxincost: data.fxtaxincost,
        fxuser1: data.fxuser1,
        fxuser2: data.fxuser2,
        indt: data.indt == "" ? new Date() : toDate(data.indt),
        lawdiv: data.lawdiv,
        location: data.location,
        maker: data.maker,
        model: data.model,
        orgdiv: data.orgdiv,
        projectno: data.projectno,
        qty: data.qty,
        rate: data.rate,
        remark: data.remark,
      }));
      setFilters((prev) => ({
        ...prev,
        fxcode: data.fxcode,
        isSearch: true,
        pgNum: 1,
      }));
      setFilters2((prev) => ({
        ...prev,
        fxcode: data.fxcode,
        isSearch: true,
        pgNum: 1,
      }));
      setFilters3((prev) => ({
        ...prev,
        fxcode: data.fxcode,
        isSearch: true,
        pgNum: 1,
      }));
    }
  }, []);

  const [Information, setInformation] = useState<{ [name: string]: any }>({
    fxdiv: "",
    fxcode: "",
    fxnum: "",
    indt: new Date(),
    fxpurcost: 0,
    custcd: "",
    custnm: "",
    lawdiv: "",
    fxnm: "",
    maker: "",
    fxsize: "",
    model: "",
    location: "",
    qty: 0,
    fxuser1: "",
    dptcd: "",
    fxdepsts: "",
    depgb: "",
    fxuser2: "",
    fxinmeth: "",
    fxdepyrmm: 0,
    rate: 0,
    costgb1: "",
    fxsts: "",
    fxdepamtyr: 0,
    findt: null,
    remark: "",
    //폼입력아닌정보
    acseq1: 0,
    acseq2: 0,
    actdt: null,
    attdatnum: "",
    chlditemcd: "",
    fxacumlamt: 0,
    fxamt: 0,
    fxdepamtdpyr: 0,
    fxdepbaldpyr: 0,
    fxdepbalyr: 0,
    fxdepcumdpyr: 0,
    fxdepcumyr: 0,
    fxdespamt: 0,
    fxdespcust: "",
    fxdespdt: null,
    fxdespqty: 0,
    fxdetail: "",
    fxrevaldt: "",
    fxtaxincost: 0,
    projectno: "",
  });

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA191, L_AC164, L_BA190, L_AC160, L_AC161, L_BA002, L_sysUserMaster_002, L_dptcd_001, L_AC054, L_AC053",
    //공정, 관리항목리스트
    setBizComponentData
  );

  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const onCustWndClick = () => {
    setCustWindowVisible(true);
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
    setInformation((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      amt: 0,
      fxcode: Information.fxcode,
      fxdt: convertDateToStr(new Date()),
      gubun: "",
      orgdiv: "01",
      qty: 0,
      remark: "",
      seq: 0,
      transamt: 0,
      rowstatus: "N",
    };

    setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onAddClick2 = () => {
    mainDataResult2.data.map((item) => {
      if (item.num > temp2) {
        temp2 = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp2,
      baseamt: 0,
      curdamt: 0,
      dptcd: "",
      dropamt: 0,
      dropdamt: 0,
      fxcode: Information.fxcode,
      fxyrmm: convertDateToStr(new Date()),
      growamt: 0,
      growdamt: 0,
      orgdiv: "01",
      predamt: 0,
      rowstatus: "N",
    };

    setSelectedState2({ [newDataItem[DATA_ITEM_KEY2]]: true });
    setMainDataResult2((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onAddClick3 = () => {
    mainDataResult3.data.map((item) => {
      if (item.num > temp3) {
        temp3 = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp3,
      allcuramt: 0,
      baseamt: 0,
      chamt: 0,
      curdamt: 0,
      dropamt: 0,
      dropdamt: 0,
      finamt: 0,
      fxcode: Information.fxcode,
      fxyrmm: convertDateToStr(new Date()),
      growamt: 0,
      growdamt: 0,
      orgdiv: "01",
      predamt: 0,
      rowstatus: "N",
    };

    setSelectedState3({ [newDataItem[DATA_ITEM_KEY3]]: true });
    setMainDataResult3((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
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
        Object.push(index);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult.data[Math.min(...Object2)];
    } else {
      data = mainDataResult.data[Math.min(...Object) - 1];
    }

    setMainDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    if (Object.length > 0) {
      setSelectedState({
        [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
      });
    }
  };

  const onDeleteClick2 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult2.data.forEach((item: any, index: number) => {
      if (!selectedState2[item[DATA_ITEM_KEY2]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
          deletedMainRows2.push(newData2);
        }
        Object.push(index);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult2.data[Math.min(...Object2)];
    } else {
      data = mainDataResult2.data[Math.min(...Object) - 1];
    }

    setMainDataResult2((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    if (Object.length > 0) {
      setSelectedState2({
        [data != undefined ? data[DATA_ITEM_KEY2] : newData[0]]: true,
      });
    }
  };

  const onDeleteClick3 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult3.data.forEach((item: any, index: number) => {
      if (!selectedState3[item[DATA_ITEM_KEY3]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
          deletedMainRows3.push(newData2);
        }
        Object.push(index);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult3.data[Math.min(...Object2)];
    } else {
      data = mainDataResult3.data[Math.min(...Object) - 1];
    }

    setMainDataResult3((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    if (Object.length > 0) {
      setSelectedState3({
        [data != undefined ? data[DATA_ITEM_KEY3] : newData[0]]: true,
      });
    }
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
  };
  const onMainDataStateChange3 = (event: GridDataStateChangeEvent) => {
    setMainDataState3(event.dataState);
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
  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = mainDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult2.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  const mainTotalFooterCell3 = (props: GridFooterCellProps) => {
    var parts = mainDataResult3.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult3.total == -1
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
  const editNumberFooterCell2 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult2.data.forEach((item) =>
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
  const editNumberFooterCell3 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult3.data.forEach((item) =>
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
  const TwoFooterCell = (props: GridFooterCellProps) => {
    const gubun1 = mainDataResult.data.filter((item) => item.gubun == "1");
    const gubun2 = mainDataResult.data.filter(
      (item) => item.gubun != "1" && item.gubun != ""
    );

    if (props.field != undefined) {
      return (
        <td colSpan={props.colSpan} style={props.style}>
          자본적지출 계:&nbsp;
          {mainDataResult.total == 0 ? 0 : gubun1.length}
          건
          <br />
          양도/폐기 계:&nbsp;
          {mainDataResult.total == 0 ? 0 : gubun2.length}
          건
          <br />
        </td>
      );
    } else {
      return <td></td>;
    }
  };

  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };
  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });
    setSelectedState2(newSelectedState);
  };
  const onSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState3,
      dataItemKey: DATA_ITEM_KEY3,
    });
    setSelectedState3(newSelectedState);
  };
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange3 = (e: any) => {
    setMainDataState3((prev) => ({ ...prev, sort: e.sort }));
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
  const onMainItemChange2 = (event: GridItemChangeEvent) => {
    setMainDataState2((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult2,
      setMainDataResult2,
      DATA_ITEM_KEY2
    );
  };
  const onMainItemChange3 = (event: GridItemChangeEvent) => {
    setMainDataState3((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult3,
      setMainDataResult3,
      DATA_ITEM_KEY3
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
  const customCellRender2 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit2}
      editField={EDIT_FIELD}
    />
  );
  const customCellRender3 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit3}
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
  const customRowRender2 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit2}
      editField={EDIT_FIELD}
    />
  );
  const customRowRender3 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit3}
      editField={EDIT_FIELD}
    />
  );

  const enterEdit = (dataItem: any, field: string) => {
    if (field != "rowstatus") {
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

  const enterEdit2 = (dataItem: any, field: string) => {
    let valid = true;
    if (field == "fxyrmm" && dataItem.rowstatus != "N") {
      valid = false;
    }

    if (field != "rowstatus" && field != "baseamt" && valid == true) {
      const newData = mainDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY2] == dataItem[DATA_ITEM_KEY2]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
      );

      setTempResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult2((prev) => {
        return {
          data: mainDataResult2.data,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit3 = (dataItem: any, field: string) => {
    let valid = true;
    if (field == "fxyrmm" && dataItem.rowstatus != "N") {
      valid = false;
    }
    if (
      field != "rowstatus" &&
      field != "finamt" &&
      field != "allcuramt" &&
      field != "chamt" &&
      valid == true
    ) {
      const newData = mainDataResult3.data.map((item) =>
        item[DATA_ITEM_KEY3] == dataItem[DATA_ITEM_KEY3]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
      );

      setTempResult3((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult3((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult3((prev) => {
        return {
          data: mainDataResult3.data,
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

  const exitEdit2 = () => {
    if (tempResult2.data != mainDataResult2.data) {
      const newData = mainDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY2] == Object.getOwnPropertyNames(selectedState2)[0]
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

      setTempResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult2.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit3 = () => {
    if (tempResult3.data != mainDataResult3.data) {
      const newData = mainDataResult3.data.map((item) =>
        item[DATA_ITEM_KEY3] == Object.getOwnPropertyNames(selectedState3)[0]
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

      setTempResult3((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult3((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult3.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult3((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult3((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const onSearch = () => {
    setFilters2((prev) => ({
      ...prev,
      isSearch: true,
      pgNum: 1,
    }));
  };

  return (
    <>
      <Window
        title={workType === "N" ? "고정자산생성" : "고정자산정보"}
        width={position.width}
        height={position.height}
        onMove={handleMove}
        onResize={handleResize}
        onClose={onClose}
        modal={modal}
      >
        <TabStrip
          style={{ width: "100%", height: `calc(100% - 80px)` }}
          selected={tabSelected}
          onSelect={handleSelectTab}
        >
          <TabStripTab title="기본정보">
            <FormBoxWrap border={true}>
              <FormBox>
                <tbody>
                  <tr>
                    <th>자산분류</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentComboBox
                          name="fxdiv"
                          value={Information.fxdiv}
                          bizComponentId="L_AC160"
                          bizComponentData={bizComponentData}
                          changeData={ComboBoxChange}
                          para="AC_A3100W"
                          className="required"
                        />
                      )}
                    </td>
                    <th>자산코드</th>
                    <td>
                      <Input
                        name="fxcode"
                        type="text"
                        value={Information.fxcode}
                        className="readonly"
                      />
                    </td>
                    <th>자산고유번호</th>
                    <td>
                      <Input
                        name="fxnum"
                        type="text"
                        value={Information.fxnum}
                        onChange={InputChange}
                      />
                    </td>
                    <th>취득일자</th>
                    <td>
                      <DatePicker
                        name="indt"
                        value={Information.indt}
                        format="yyyy-MM-dd"
                        onChange={InputChange}
                        placeholder=""
                        className="required"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>취득원가</th>
                    <td>
                      <NumericTextBox
                        name="fxpurcost"
                        value={Information.fxpurcost}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                    <th>구입업체</th>
                    <td>
                      <Input
                        name="custcd"
                        type="text"
                        value={Information.custcd}
                        onChange={InputChange}
                      />
                      <ButtonInInput>
                        <Button
                          onClick={onCustWndClick}
                          icon="more-horizontal"
                          fillMode="flat"
                        />
                      </ButtonInInput>
                    </td>
                    <th>구입업체명</th>
                    <td>
                      <Input
                        name="custnm"
                        type="text"
                        value={Information.custnm}
                        onChange={InputChange}
                      />
                    </td>
                    <th>법구분</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentComboBox
                          name="lawdiv"
                          value={Information.lawdiv}
                          bizComponentId="L_AC161"
                          bizComponentData={bizComponentData}
                          changeData={ComboBoxChange}
                          para="AC_A3100W"
                        />
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>자산명</th>
                    <td colSpan={3}>
                      <Input
                        name="fxnm"
                        type="text"
                        value={Information.fxnm}
                        onChange={InputChange}
                      />
                    </td>
                    <th>제조사</th>
                    <td colSpan={3}>
                      <Input
                        name="maker"
                        type="text"
                        value={Information.maker}
                        onChange={InputChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>자산규격</th>
                    <td colSpan={3}>
                      <Input
                        name="fxsize"
                        type="text"
                        value={Information.fxsize}
                        onChange={InputChange}
                      />
                    </td>
                    <th>모델명</th>
                    <td>
                      <Input
                        name="model"
                        type="text"
                        value={Information.model}
                        onChange={InputChange}
                      />
                    </td>
                    <th>사업장</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentComboBox
                          name="location"
                          value={Information.location}
                          bizComponentId="L_BA002"
                          bizComponentData={bizComponentData}
                          changeData={ComboBoxChange}
                          para="AC_A3100W"
                        />
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>수량</th>
                    <td>
                      <NumericTextBox
                        name="qty"
                        value={Information.qty}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                    <th>관리자_정</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentComboBox
                          name="fxuser1"
                          value={Information.fxuser1}
                          bizComponentId="L_sysUserMaster_002"
                          bizComponentData={bizComponentData}
                          changeData={ComboBoxChange}
                          para="AC_A3100W"
                          textField="user_name"
                          valueField="user_id"
                        />
                      )}
                    </td>
                    <th>귀속부서</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentComboBox
                          name="dptcd"
                          value={Information.dptcd}
                          bizComponentId="L_dptcd_001"
                          bizComponentData={bizComponentData}
                          changeData={ComboBoxChange}
                          textField="dptnm"
                          valueField="dptcd"
                          para="AC_A3100W"
                        />
                      )}
                    </td>
                    <th>상각상태</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentComboBox
                          name="fxdepsts"
                          value={Information.fxdepsts}
                          bizComponentId="L_AC054"
                          bizComponentData={bizComponentData}
                          changeData={ComboBoxChange}
                          para="AC_A3100W"
                        />
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>상각방법</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentComboBox
                          name="depgb"
                          value={Information.depgb}
                          bizComponentId="L_AC053"
                          bizComponentData={bizComponentData}
                          changeData={ComboBoxChange}
                          para="AC_A3100W"
                        />
                      )}
                    </td>
                    <th>관리자_부</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentComboBox
                          name="fxuser2"
                          value={Information.fxuser2}
                          bizComponentId="L_sysUserMaster_002"
                          bizComponentData={bizComponentData}
                          changeData={ComboBoxChange}
                          para="AC_A3100W"
                          textField="user_name"
                          valueField="user_id"
                        />
                      )}
                    </td>
                    <th>구입방법</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentComboBox
                          name="fxinmeth"
                          value={Information.fxinmeth}
                          bizComponentId="L_BA190"
                          bizComponentData={bizComponentData}
                          changeData={ComboBoxChange}
                          para="AC_A3100W"
                        />
                      )}
                    </td>
                    <th>내용년수</th>
                    <td>
                      <NumericTextBox
                        name="fxdepyrmm"
                        value={Information.fxdepyrmm}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>상각율</th>
                    <td>
                      <NumericTextBox
                        name="rate"
                        value={Information.rate}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                    <th>원가구분</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentComboBox
                          name="costgb1"
                          value={Information.costgb1}
                          bizComponentId="L_AC164"
                          bizComponentData={bizComponentData}
                          changeData={ComboBoxChange}
                          para="AC_A3100W"
                        />
                      )}
                    </td>
                    <th>자산상태</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentComboBox
                          name="fxsts"
                          value={Information.fxsts}
                          bizComponentId="L_BA191"
                          bizComponentData={bizComponentData}
                          changeData={ComboBoxChange}
                          para="AC_A3100W"
                        />
                      )}
                    </td>
                    <th>당기상각액</th>
                    <td>
                      <NumericTextBox
                        name="fxdepamtyr"
                        value={Information.fxdepamtyr}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>상각완료년도</th>
                    <td>
                      <DatePicker
                        name="findt"
                        value={Information.findt}
                        format="yyyy-MM-dd"
                        onChange={InputChange}
                        placeholder=""
                      />
                    </td>
                    <th>비고</th>
                    <td colSpan={5}>
                      <Input
                        name="remark"
                        type="text"
                        value={Information.remark}
                        onChange={InputChange}
                      />
                    </td>
                  </tr>
                </tbody>
              </FormBox>
            </FormBoxWrap>
          </TabStripTab>
          <TabStripTab
            title="자산변동"
            disabled={workType == "N" ? true : false}
          >
            <GridContainer height={position.height - 250 + "px"}>
              <GridTitleContainer>
                <ButtonContainer>
                  <Button
                    onClick={onAddClick}
                    themeColor={"primary"}
                    icon="plus"
                    title="행 추가"
                  ></Button>
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
                style={{ height: `calc(100% - 35px)` }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    fxdt: row.fxdt
                      ? new Date(dateformat(row.fxdt))
                      : new Date(dateformat("99991231")),
                    [SELECTED_FIELD]: selectedState[idGetter(row)],
                  })),
                  mainDataState
                )}
                {...mainDataState}
                onDataStateChange={onMainDataStateChange}
                //선택 기능
                dataItemKey={DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onSelectionChange}
                //스크롤 조회 기능
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
                  field="fxdt"
                  title="일자"
                  width="120px"
                  cell={DateCell}
                  footerCell={mainTotalFooterCell}
                />
                <GridColumn
                  field="gubun"
                  title="구분"
                  cell={CustomComboBoxCell}
                  footerCell={TwoFooterCell}
                  width="120px"
                />
                <GridColumn
                  field="amt"
                  title="취득원가"
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
                  field="transamt"
                  title="완전양도금액"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell}
                />
                <GridColumn field="remark" title="비고" width="200px" />
              </Grid>
            </GridContainer>
          </TabStripTab>
          <TabStripTab
            title="월감가상각"
            disabled={workType == "N" ? true : false}
          >
            <FilterBoxWrap>
              <FilterBox>
                <tbody>
                  <tr>
                    <th>기준년월</th>
                    <td>
                      <div className="filter-item-wrap">
                        <DatePicker
                          name="frdt"
                          value={filters2.frdt}
                          format="yyyy-MM"
                          onChange={filterInputChange}
                          placeholder=""
                          calendar={MonthCalendar}
                        />
                        <DatePicker
                          name="todt"
                          value={filters2.todt}
                          format="yyyy-MM"
                          onChange={filterInputChange}
                          placeholder=""
                          calendar={MonthCalendar}
                        />
                      </div>
                    </td>
                    <th></th>
                    <td></td>
                  </tr>
                </tbody>
              </FilterBox>
            </FilterBoxWrap>
            <GridContainer height={position.height - 300 + "px"}>
              <GridTitleContainer>
                <ButtonContainer>
                  <Button
                    onClick={onSearch}
                    themeColor={"primary"}
                    icon="search"
                    title="검색"
                  ></Button>
                  <Button
                    onClick={onAddClick2}
                    themeColor={"primary"}
                    icon="plus"
                    title="행 추가"
                  ></Button>
                  <Button
                    onClick={onDeleteClick2}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="minus"
                    title="행 삭제"
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <Grid
                style={{ height: `calc(100% - 35px)` }}
                data={process(
                  mainDataResult2.data.map((row) => ({
                    ...row,
                    fxyrmm: row.fxyrmm
                      ? new Date(dateformat(row.fxyrmm))
                      : new Date(dateformat("99991231")),
                    [SELECTED_FIELD]: selectedState2[idGetter2(row)],
                  })),
                  mainDataState2
                )}
                {...mainDataState2}
                onDataStateChange={onMainDataStateChange2}
                //선택 기능
                dataItemKey={DATA_ITEM_KEY2}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onSelectionChange2}
                //스크롤 조회 기능
                fixedScroll={true}
                total={mainDataResult2.total}
                //정렬기능
                sortable={true}
                onSortChange={onMainSortChange2}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
                onItemChange={onMainItemChange2}
                cellRender={customCellRender2}
                rowRender={customRowRender2}
                editField={EDIT_FIELD}
              >
                <GridColumn field="rowstatus" title=" " width="50px" />
                <GridColumn
                  field="fxyrmm"
                  title="상각년월"
                  width="120px"
                  cell={MonthDateCell}
                  footerCell={mainTotalFooterCell2}
                />
                <GridColumn
                  field="baseamt"
                  title="기초금액"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell2}
                />
                <GridColumn
                  field="growamt"
                  title="당기증가액"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell2}
                />
                <GridColumn
                  field="dropamt"
                  title="당기감소액"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell2}
                />
                <GridColumn
                  field="predamt"
                  title="당기충당금누계액"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell2}
                />
                <GridColumn
                  field="curdamt"
                  title="당월감가상각액"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell2}
                />
                <GridColumn
                  field="dropdamt"
                  title="당월충당금감소액"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell2}
                />
                <GridColumn
                  field="growdamt"
                  title="당월충당금증가액"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell2}
                />
                <GridColumn
                  field="dptcd"
                  title="귀속부서"
                  cell={CustomComboBoxCell}
                  width="120px"
                />
              </Grid>
            </GridContainer>
          </TabStripTab>
          <TabStripTab
            title="년감가상각"
            disabled={workType == "N" ? true : false}
          >
            <GridContainer height={position.height - 250 + "px"}>
              <GridTitleContainer>
                <ButtonContainer>
                  <Button
                    onClick={onAddClick3}
                    themeColor={"primary"}
                    icon="plus"
                    title="행 추가"
                  ></Button>
                  <Button
                    onClick={onDeleteClick3}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="minus"
                    title="행 삭제"
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <Grid
                style={{ height: `calc(100% - 35px)` }}
                data={process(
                  mainDataResult3.data.map((row) => ({
                    ...row,
                    fxyrmm: row.fxyrmm
                      ? new Date(dateformat(row.fxyrmm))
                      : new Date(dateformat("99991231")),
                    [SELECTED_FIELD]: selectedState3[idGetter3(row)],
                  })),
                  mainDataState3
                )}
                {...mainDataState3}
                onDataStateChange={onMainDataStateChange3}
                //선택 기능
                dataItemKey={DATA_ITEM_KEY3}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onSelectionChange3}
                //스크롤 조회 기능
                fixedScroll={true}
                total={mainDataResult3.total}
                //정렬기능
                sortable={true}
                onSortChange={onMainSortChange3}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
                onItemChange={onMainItemChange3}
                cellRender={customCellRender3}
                rowRender={customRowRender3}
                editField={EDIT_FIELD}
              >
                <GridColumn field="rowstatus" title=" " width="50px" />
                <GridColumn
                  field="fxyrmm"
                  title="상각년도"
                  width="120px"
                  cell={YearDateCell}
                  footerCell={mainTotalFooterCell3}
                />
                <GridColumn
                  field="baseamt"
                  title="기초금액"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell3}
                />
                <GridColumn
                  field="growamt"
                  title="당기증가액"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell3}
                />
                <GridColumn
                  field="dropamt"
                  title="당기감소액"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell3}
                />
                <GridColumn
                  field="finamt"
                  title="기말잔액"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell3}
                />
                <GridColumn
                  field="predamt"
                  title="전기충당금누계액"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell3}
                />
                <GridColumn
                  field="curdamt"
                  title="당기감가상각액"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell3}
                />
                <GridColumn
                  field="growdamt"
                  title="당기충당금증가액"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell3}
                />
                <GridColumn
                  field="dropdamt"
                  title="당기충당금감소액"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell3}
                />
                <GridColumn
                  field="allcuramt"
                  title="충당금누계액"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell3}
                />
                <GridColumn
                  field="chamt"
                  title="미상각잔액"
                  width="100px"
                  cell={NumberCell}
                  footerCell={editNumberFooterCell3}
                />
              </Grid>
            </GridContainer>
          </TabStripTab>
        </TabStrip>
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
        {custWindowVisible && (
          <CustomersWindow
            setVisible={setCustWindowVisible}
            workType={workType}
            setData={setCustData}
          />
        )}
      </Window>
    </>
  );
};

export default CopyWindow;
