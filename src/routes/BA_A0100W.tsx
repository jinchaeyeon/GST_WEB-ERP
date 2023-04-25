import React, { useCallback, useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridCellProps,
} from "@progress/kendo-react-grid";
import { gridList } from "../store/columns/BA_A0100W_C";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { getter } from "@progress/kendo-react-common";
import { bytesToBase64 } from "byte-base64";
import { DataResult, process, State } from "@progress/kendo-data-query";
import {
  Title,
  FilterBox,
  GridContainer,
  GridTitle,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
  GridContainerWrap,
} from "../CommonStyled";
import FilterContainer from "../components/Containers/FilterContainer";
import { Button } from "@progress/kendo-react-buttons";
import { useApi } from "../hooks/api";
import { Iparameters, TPermissions } from "../store/types";
import {
  chkScrollHandler,
  convertDateToStr,
  findMessage,
  getQueryFromBizComponent,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  handleKeyPressSearch,
  getGridItemChangedData,
  dateformat,
  UseParaPc,
  UseGetValueFromSessionItem,
  setDefaultDate,
  toDate,
  useSysMessage,
} from "../components/CommonFunction";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
  EDIT_FIELD,
  GAP,
} from "../components/CommonString";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import TopButtons from "../components/Buttons/TopButtons";
import { useSetRecoilState } from "recoil";
import { isLoading } from "../store/atoms";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { Input } from "@progress/kendo-react-inputs";
import CheckBoxCell from "../components/Cells/CheckBoxCell";

const DATA_ITEM_KEY = "num";
const SUB_DATA_ITEM_KEY = "num";
let deletedMainRows: object[] = [];
let deletedMainRows2: object[] = [];

const CustomComboField = ["roomdiv", "animalkind", "testpart"];
const checkField = ["inspect_yn", "use_yn", "calculate_yn"];
const numberField = ["cageqty"];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  // 화폐단위
  UseBizComponent("L_BA006_603, L_BA002_603, L_BA171", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field === "roomdiv"
      ? "L_BA006_603"
      : field === "animalkind"
      ? "L_BA002_603"
      : field === "testpart"
      ? "L_BA171"
      : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td></td>
  );
};

const BA_A0100W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(SUB_DATA_ITEM_KEY);
  const processApi = useApi();
  const [pc, setPc] = useState("");
  UseParaPc(setPc);

  const userId = UseGetValueFromSessionItem("user_id");
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);

  UsePermissions(setPermissions);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;

      setFilters((prev) => ({
        ...prev,
        roomdiv: defaultOption.find((item: any) => item.id === "roomdiv")
          .valueCode,
        animalkind: defaultOption.find((item: any) => item.id === "animalkind")
          .valueCode,
        testpart: defaultOption.find((item: any) => item.id === "testpart")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_SA010",
    //환율사이트
    setBizComponentData
  );
  const [siteListData, setSiteListData] = useState([
    { sub_code: "", memo: "" },
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const siteQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_SA010")
      );

      fetchQuery(siteQueryStr, setSiteListData);
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

  const [subDataState, setSubDataState] = useState<State>({
    sort: [],
  });

  const [isInitSearch, setIsInitSearch] = useState(false);

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [subDataResult, setSubDataResult] = useState<DataResult>(
    process([], subDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [selectedsubDataState, setSelectedsubDataState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [mainPgNum, setMainPgNum] = useState(1);
  const [subPgNum, setSubPgNum] = useState(1);

  const [ifSelectFirstRow, setIfSelectFirstRow] = useState(true);

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

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    roomnum: "",
    roomdiv: "",
    animalkind: "",
    testpart: "",
  });

  //조회조건 초기값
  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "DETAIL",
    roomcd: "",
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_BA_A0100W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": filters.workType,
      "@p_orgdiv": "01",
      "@p_roomdiv": filters.roomdiv,
      "@p_roomcd": "",
      "@p_roomnum": filters.roomnum,
      "@p_animalkind": filters.animalkind,
      "@p_testpart": filters.testpart,
      "@p_find_row_value": "",
    },
  };

  //조회조건 파라미터
  const parameters2: Iparameters = {
    procedureName: "P_BA_A0100W_Q",
    pageNumber: subPgNum,
    pageSize: filters2.pgSize,
    parameters: {
      "@p_work_type": filters2.workType,
      "@p_orgdiv": "01",
      "@p_roomdiv": filters.roomdiv,
      "@p_roomcd": filters2.roomcd,
      "@p_roomnum": filters.roomnum,
      "@p_animalkind": filters.animalkind,
      "@p_testpart": filters.testpart,
      "@p_find_row_value": "",
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });

      if (totalRowCnt >= 0) {
        setMainDataResult((prev) => {
          return {
            data: rows,
            total: totalRowCnt,
          };
        });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  //그리드 데이터 조회
  const fetchSubGrid = async () => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });

      if (totalRowCnt >= 0) {
        setSubDataResult((prev) => {
          return {
            data: rows,
            total: totalRowCnt,
          };
        });
      }

    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      customOptionData !== null &&
      isInitSearch === false &&
      permissions !== null
    ) {
      fetchMainGrid();
      setIsInitSearch(true);
    }
  }, [filters, permissions]);

  useEffect(() => {
    if (customOptionData !== null) {
      setSubPgNum(1);
      setSubDataResult(process([], subDataState));
      fetchSubGrid();
    }
  }, [filters2]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (ifSelectFirstRow) {
      if (mainDataResult.total > 0) {
        const firstRowData = mainDataResult.data[0];

          setSelectedState({ [firstRowData.num]: true });
          setIfSelectFirstRow(true);
          setFilters2((prev) => ({
            ...prev,
            roomcd: firstRowData.roomcd,
          }));
      }
    }
  }, [mainDataResult]);

  useEffect(() => {
    if (ifSelectFirstRow) {
     if (subDataResult.total > 0) {
        const firstRowData = subDataResult.data[0];

        setSelectedsubDataState({ [firstRowData.num]: true });
        setIfSelectFirstRow(true);
      }
    }
  }, [subDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainPgNum(1);
    setSubPgNum(1);
    setMainDataResult(process([], mainDataState));
    setSubDataResult(process([], subDataState));
    setIfSelectFirstRow(true);
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
    setIfSelectFirstRow(false);
    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
    setFilters2((prev) => ({
      ...prev,
      roomcd: selectedRowData.roomcd,
    }));
  };

  const onSubDataSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedsubDataState,
      dataItemKey: SUB_DATA_ITEM_KEY,
    });
    setSelectedsubDataState(newSelectedState);
    setIfSelectFirstRow(false);
  };

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  //스크롤 핸들러
  const onMainScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, mainPgNum, PAGE_SIZE))
      setMainPgNum((prev) => prev + 1);
  };
  //스크롤 핸들러
  const onSubScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, subPgNum, PAGE_SIZE))
      setSubPgNum((prev) => prev + 1);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onSubDataStateChange = (event: GridDataStateChangeEvent) => {
    setSubDataState(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  //그리드 푸터
  const subTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = subDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onSubDataSortChange = (e: any) => {
    setSubDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    resetAllGrid();
    fetchMainGrid();
    deletedMainRows = [];
    deletedMainRows2 = [];
  };

  const enterEdit = (dataItem: any, field: string) => {
    if (field != "rowstatus") {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );

      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    const newData = mainDataResult.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    setMainDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const enterEdit2 = (dataItem: any, field: string) => {
    if (field != "rowstatus") {
      const newData = subDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );

      setSubDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit2 = () => {
    const newData = subDataResult.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    setSubDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
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

  const customCellRender2 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit2}
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

  const onMainItemChange = (event: GridItemChangeEvent) => {
    setMainDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };

  const onSubItemChange = (event: GridItemChangeEvent) => {
    setSubDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      subDataResult,
      setSubDataResult,
      SUB_DATA_ITEM_KEY
    );
  };

  const onAddClick = () => {
    let seq = 1;

    if (mainDataResult.total > 0) {
      mainDataResult.data.forEach((item) => {
        if (item[DATA_ITEM_KEY] > seq) {
          seq = item[DATA_ITEM_KEY];
        }
      });
      seq++;
    }
    const newDataItem = {
      [DATA_ITEM_KEY]: seq,
      animalkind: "",
      area: "",
      calculate_yn: "Y",
      inspect_yn: "Y",
      load_place: "",
      remark: "",
      roomcd: "",
      roomdiv: "",
      roomnum: "",
      testpart: "",
      use_yn: "Y",
      rowstatus: "N",
    };
    setSelectedState({ [newDataItem.num]: true });
    setIfSelectFirstRow(false);
    setMainDataResult((prev) => {
      return {
        data: [...prev.data, newDataItem],
        total: prev.total + 1,
      };
    });
  };

  const onAddClick2 = () => {
    let seq = 1;

    if (subDataResult.total > 0) {
      subDataResult.data.forEach((item) => {
        if (item[SUB_DATA_ITEM_KEY] > seq) {
          seq = item[SUB_DATA_ITEM_KEY];
        }
      });
      seq++;
    }
    const data = mainDataResult.data.filter((item) => item.num == Object.getOwnPropertyNames(selectedState)[0])[0];
    const newDataItem = {
      [SUB_DATA_ITEM_KEY]: seq,
      cageqty: 0,
      lacno: "",
      remark: "",
      roomcd: data.roomcd,
      use_yn: "Y",
      rowstatus: "N",
    };
    setSelectedsubDataState({ [newDataItem.num]: true });
    setIfSelectFirstRow(false);
    setSubDataResult((prev) => {
      return {
        data: [...prev.data, newDataItem],
        total: prev.total + 1,
      };
    });
  };

  const [paraData, setParaData] = useState({
    workType: "LIST_N",
    user_id: userId,
    form_id: "BA_A0100W",
    pc: pc,
    orgdiv: "01",
    roomcd: "",
    rowstatus_s: "",
    roomcd_s: "",
    roomnum_s: "",
    roomdiv_s: "",
    load_place_s: "",
    area_s: "",
    animalkind_s: "",
    testpart_s: "",
    inspect_yn_s: "",
    use_yn_s: "",
    calculate_yn_s: "",
    remark_s: "",
    seq_s: "",
    lacno_s: "",
    cageqty_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_BA_A0100W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,
      "@p_orgdiv": paraData.orgdiv,
      "@p_roomcd": paraData.roomcd,
      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_roomcd_s": paraData.roomcd_s,
      "@p_roomnum_s": paraData.roomnum_s,
      "@p_roomdiv_s": paraData.roomdiv_s,
      "@p_load_place_s" : paraData.load_place_s,
      "@p_area_s": paraData.area_s,
      "@p_animalkind_s":paraData.animalkind_s,
      "@p_testpart_s": paraData.testpart_s,
      "@p_inspect_yn_s":paraData.inspect_yn_s,
      "@p_use_yn_s":paraData.use_yn_s,
      "@p_calculate_yn_s":paraData.calculate_yn_s,
      "@p_remark_s":paraData.remark_s,
      "@p_seq_s":paraData.seq_s,
      "@p_lacno_s":paraData.lacno_s,
      "@p_cageqty_s":paraData.cageqty_s,
      "@p_userid": paraData.user_id,
      "@p_form_id": paraData.form_id,
      "@p_pc": paraData.pc,
    },
  };

  type TdataArr = {
    rowstatus_s: string[];
    roomcd_s: string[];
    roomnum_s: string[];
    roomdiv_s: string[];
    load_place_s: string[];
    area_s: string[];
    animalkind_s: string[];
    testpart_s: string[];
    inspect_yn_s: string[];
    use_yn_s: string[];
    calculate_yn_s: string[];
    remark_s: string[];
    seq_s: string[];
    lacno_s: string[];
    cageqty_s: string[];
  };

  const onSaveClick = async () => {
    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length === 0 && deletedMainRows.length === 0) return false;
    let dataArr: TdataArr = {
      rowstatus_s: [],
      roomcd_s: [],
      roomnum_s: [],
      roomdiv_s: [],
      load_place_s: [],
      area_s: [],
      animalkind_s: [],
      testpart_s: [],
      inspect_yn_s: [],
      use_yn_s: [],
      calculate_yn_s: [],
      remark_s: [],
      seq_s: [],
      lacno_s: [],
      cageqty_s: [],
    };
    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        roomcd = "",
        roomnum = "",
        roomdiv = "",
        load_place = "",
        area = "",
        animalkind = "",
        testpart="",
        inspect_yn="",
        use_yn="",
        calculate_yn="",
        remark="",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.roomcd_s.push(roomcd);
      dataArr.roomnum_s.push(roomnum);
      dataArr.roomdiv_s.push(roomdiv);
      dataArr.load_place_s.push(load_place);
      dataArr.area_s.push(area);
      dataArr.animalkind_s.push(animalkind);
      dataArr.testpart_s.push(testpart);
      dataArr.inspect_yn_s.push(inspect_yn == true ? "Y" : inspect_yn == false ? "N" : inspect_yn);
      dataArr.use_yn_s.push(use_yn == true ? "Y" : use_yn == false ? "N" : use_yn);
      dataArr.calculate_yn_s.push(calculate_yn == true ? "Y" : calculate_yn == false ? "N" : calculate_yn);
      dataArr.remark_s.push(remark);
    });
    deletedMainRows.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        roomcd = "",
        roomnum = "",
        roomdiv = "",
        load_place = "",
        area = "",
        animalkind = "",
        testpart="",
        inspect_yn="",
        use_yn="",
        calculate_yn="",
        remark="",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.roomcd_s.push(roomcd);
      dataArr.roomnum_s.push(roomnum);
      dataArr.roomdiv_s.push(roomdiv);
      dataArr.load_place_s.push(load_place);
      dataArr.area_s.push(area);
      dataArr.animalkind_s.push(animalkind);
      dataArr.testpart_s.push(testpart);
      dataArr.inspect_yn_s.push(inspect_yn == true ? "Y" : inspect_yn == false ? "N" : inspect_yn);
      dataArr.use_yn_s.push(use_yn == true ? "Y" : use_yn == false ? "N" : use_yn);
      dataArr.calculate_yn_s.push(calculate_yn == true ? "Y" : calculate_yn == false ? "N" : calculate_yn);
      dataArr.remark_s.push(remark);
    });

    setParaData((prev) => ({
      ...prev,
      workType: "LIST_N",
      user_id: userId,
      form_id: "AC_A0100W",
      pc: pc,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      roomcd_s: dataArr.roomcd_s.join("|"),
      roomnum_s: dataArr.roomnum_s.join("|"),
      roomdiv_s: dataArr.roomdiv_s.join("|"),
      load_place_s: dataArr.load_place_s.join("|"),
      area_s: dataArr.area_s.join("|"),
      animalkind_s: dataArr.animalkind_s.join("|"),
      testpart_s: dataArr.testpart_s.join("|"),
      inspect_yn_s: dataArr.inspect_yn_s.join("|"),
      use_yn_s: dataArr.use_yn_s.join("|"),
      calculate_yn_s: dataArr.calculate_yn_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
    }));
  };

  const onSaveClick2 = async () => {
    const dataItem = subDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length === 0 && deletedMainRows2.length === 0) return false;
    let dataArr: TdataArr = {
      rowstatus_s: [],
      roomcd_s: [],
      roomnum_s: [],
      roomdiv_s: [],
      load_place_s: [],
      area_s: [],
      animalkind_s: [],
      testpart_s: [],
      inspect_yn_s: [],
      use_yn_s: [],
      calculate_yn_s: [],
      remark_s: [],
      seq_s: [],
      lacno_s: [],
      cageqty_s: [],
    };
    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        roomcd = "",
        remark= "",
        seq= "",
        lacno= "",
        cageqty= "",
        use_yn = ""
      } = item;

      dataArr.roomcd_s.push(roomcd);
      dataArr.remark_s.push(remark);
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.seq_s.push(seq);
      dataArr.lacno_s.push(lacno);
      dataArr.cageqty_s.push(cageqty);
      dataArr.use_yn_s.push(use_yn == true ? "Y" : use_yn == false ? "N" : use_yn);
    });
    deletedMainRows2.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        roomcd = "",
        remark= "",
        seq= "",
        lacno= "",
        cageqty= "",
        use_yn = ""
      } = item;

      dataArr.roomcd_s.push(roomcd);
      dataArr.remark_s.push(remark);
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.seq_s.push(seq);
      dataArr.lacno_s.push(lacno);
      dataArr.cageqty_s.push(cageqty);dataArr.use_yn_s.push(use_yn == true ? "Y" : use_yn == false ? "N" : use_yn);
    });
    const data = mainDataResult.data.filter((item) => item.num == Object.getOwnPropertyNames(selectedState)[0])[0];
    setParaData((prev) => ({
      ...prev,
      workType: "DETAIL_N",
      user_id: userId,
      form_id: "AC_A0100W",
      pc: pc,
      roomcd: data.roomcd,
      roomcd_s: dataArr.roomcd_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      seq_s: dataArr.seq_s.join("|"),
      lacno_s: dataArr.lacno_s.join("|"),
      cageqty_s: dataArr.cageqty_s.join("|"),
      use_yn_s: dataArr.use_yn_s.join("|"),
    }));
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
      resetAllGrid();
      fetchMainGrid();
      setParaData({
        workType: "LIST_N",
        user_id: userId,
        form_id: "AC_A0100W",
        pc: pc,
        orgdiv: "01",
        roomcd: "",
        rowstatus_s: "",
        roomcd_s: "",
        roomnum_s: "",
        roomdiv_s: "",
        load_place_s: "",
        area_s: "",
        animalkind_s: "",
        testpart_s: "",
        inspect_yn_s: "",
        use_yn_s: "",
        calculate_yn_s: "",
        remark_s: "",
        seq_s: "",
        lacno_s: "",
        cageqty_s: "",
      });
      deletedMainRows = [];
      deletedMainRows2 = [];
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (paraData.rowstatus_s != "") {
      fetchTodoGridSaved();
    }
  }, [paraData]);

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];

    mainDataResult.data.forEach((item: any, index: number) => {
      if (!selectedState[item[DATA_ITEM_KEY]]) {
        newData.push(item);
      } else {
        const newData2 = {
          ...item,
          rowstatus: "D",
        };
        deletedMainRows.push(newData2);
      }
    });
    setMainDataResult((prev) => ({
      data: newData,
      total: newData.length,
    }));

    setMainDataState({});
  };

  const onDeleteClick2 = (e: any) => {
    let newData: any[] = [];

    subDataResult.data.forEach((item: any, index: number) => {
      if (!selectedsubDataState[item[SUB_DATA_ITEM_KEY]]) {
        newData.push(item);
      } else {
        const newData2 = {
          ...item,
          rowstatus: "D",
        };
        deletedMainRows2.push(newData2);
      }
    });
    setSubDataResult((prev) => ({
      data: newData,
      total: newData.length,
    }));

    setSubDataState({});
  };

  return (
    <>
      <TitleContainer>
        <Title>동물실관리</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>룸번호</th>
              <td>
                <Input
                  name="roomnum"
                  type="text"
                  value={filters.roomnum}
                  onChange={filterInputChange}
                />
              </td>
              <th>구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="roomdiv"
                    value={filters.roomdiv}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>동물종</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="animalkind"
                    value={filters.animalkind}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>시험파트</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="testpart"
                    value={filters.testpart}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainerWrap>
        <GridContainer width={`65%`}>
          <ExcelExport
            data={mainDataResult.data}
            ref={(exporter) => {
              _export = exporter;
            }}
          >
            <GridTitleContainer>
              <GridTitle>기본정보</GridTitle>
              <ButtonContainer>
                <Button
                  onClick={onAddClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="plus"
                ></Button>
                <Button
                  onClick={onDeleteClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="minus"
                ></Button>
                <Button
                  onClick={onSaveClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="save"
                ></Button>
              </ButtonContainer>
            </GridTitleContainer>
            <Grid
              style={{ height: "80vh" }}
              data={process(
                mainDataResult.data.map((row) => ({
                  ...row,
                  basedt: row.basedt
                    ? new Date(dateformat(row.basedt))
                    : new Date(),
                  rowstatus:
                    row.rowstatus == null ||
                    row.rowstatus == "" ||
                    row.rowstatus == undefined
                      ? ""
                      : row.rowstatus,
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
                mode: "multiple",
              }}
              onSelectionChange={onSelectionChange}
              //스크롤 조회 기능
              fixedScroll={true}
              total={mainDataResult.total}
              onScroll={onMainScrollHandler}
              //정렬기능
              sortable={true}
              onSortChange={onMainSortChange}
              //컬럼순서조정
              reorderable={true}
              //컬럼너비조정
              resizable={true}
              //incell 수정 기능
              onItemChange={onMainItemChange}
              cellRender={customCellRender}
              rowRender={customRowRender}
              editField={EDIT_FIELD}
            >
              <GridColumn
                field="rowstatus"
                title=" "
                width="50px"
                editable={false}
              />
              {customOptionData !== null &&
                customOptionData.menuCustomColumnOptions["grdList"].map(
                  (item: any, idx: number) =>
                    item.sortOrder !== -1 && (
                      <GridColumn
                        key={idx}
                        id={item.id}
                        field={item.fieldName}
                        title={item.caption}
                        width={item.width}
                        cell={
                          CustomComboField.includes(item.fieldName)
                            ? CustomComboBoxCell
                            : checkField.includes(item.fieldName)
                            ? CheckBoxCell
                            : undefined
                        }
                        footerCell={
                          item.sortOrder === 0 ? mainTotalFooterCell : undefined
                        }
                      />
                    )
                )}
            </Grid>
          </ExcelExport>
        </GridContainer>
        <GridContainer width={`calc(35% - ${GAP}px)`}>
          <GridTitleContainer>
            <GridTitle>상세정보</GridTitle>
            <ButtonContainer>
              <Button
                onClick={onAddClick2}
                fillMode="outline"
                themeColor={"primary"}
                icon="plus"
              ></Button>
              <Button
                onClick={onDeleteClick2}
                fillMode="outline"
                themeColor={"primary"}
                icon="minus"
              ></Button>
              <Button
                onClick={onSaveClick2}
                fillMode="outline"
                themeColor={"primary"}
                icon="save"
              ></Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            style={{ height: "80vh" }}
            data={process(
              subDataResult.data.map((row) => ({
                ...row,
                [SELECTED_FIELD]: selectedsubDataState[idGetter2(row)],
              })),
              subDataState
            )}
            {...subDataState}
            onDataStateChange={onSubDataStateChange}
            //선택 기능
            dataItemKey={SUB_DATA_ITEM_KEY}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onSubDataSelectionChange}
            //스크롤 조회 기능
            fixedScroll={true}
            onScroll={onSubScrollHandler}
            total={subDataResult.total}
            //정렬기능
            sortable={true}
            onSortChange={onSubDataSortChange}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
            //incell 수정 기능
            onItemChange={onSubItemChange}
            cellRender={customCellRender2}
            rowRender={customRowRender2}
            editField={EDIT_FIELD}
          >
            <GridColumn
              field="rowstatus"
              title=" "
              width="50px"
              editable={false}
            />
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["grdList2"].map(
                (item: any, idx: number) =>
                  item.sortOrder !== -1 && (
                    <GridColumn
                      key={idx}
                      id={item.id}
                      field={item.fieldName}
                      title={item.caption}
                      width={item.width}
                      cell={
                        numberField.includes(item.fieldName)
                          ? NumberCell
                          : checkField.includes(item.fieldName)
                          ? CheckBoxCell
                          : undefined
                      }
                      footerCell={
                        item.sortOrder === 0 ? subTotalFooterCell : undefined
                      }
                    />
                  )
              )}
          </Grid>
        </GridContainer>
      </GridContainerWrap>
      {gridList.map((grid: any) =>
        grid.columns.map((column: any) => (
          <div
            key={column.id}
            id={column.id}
            data-grid-name={grid.gridName}
            data-field={column.field}
            data-caption={column.caption}
            data-width={column.width}
            hidden
          />
        ))
      )}
    </>
  );
};

export default BA_A0100W;
