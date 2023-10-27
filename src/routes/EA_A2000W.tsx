import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridHeaderCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { bytesToBase64 } from "byte-base64";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  FilterBox,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import CheckBoxReadOnlyCell from "../components/Cells/CheckBoxReadOnlyCell";
import DateCell from "../components/Cells/DateCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseDesignInfo,
  UseGetValueFromSessionItem,
  UseMessages,
  UseParaPc,
  UsePermissions,
  convertDateToStr,
  findMessage,
  getGridItemChangedData,
  getQueryFromBizComponent,
  handleKeyPressSearch,
  setDefaultDate,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import CommentsGrid from "../components/Grids/CommentsGrid";
import AbsenceRequest from "../components/Prints/AbsenceRequest";
import CashDisbursementVoucher from "../components/Prints/CashDisbursementVoucher";
import BizComponentRadioGroup from "../components/RadioGroups/BizComponentRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import WordText from "../components/WordText";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/EA_A2000W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
const dateField = ["recdt", "time"];

const EA_A2000W: React.FC = () => {
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);
  let gridRef3: any = useRef(null);
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const pathname: string = window.location.pathname.replace("/", "");
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  const [wordInfoData, setWordInfoData] = React.useState<any>(null);
  UseDesignInfo(pathname, setWordInfoData);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_dptcd_001,L_sysUserMaster_001,L_EA002,L_HU089,L_appyn,L_USERS,L_HU005,L_EA004,L_EA001, R_APPYN_1, R_APPGB_1",
    setBizComponentData
  );

  const [appynListData, setAppynListData] = React.useState([
    { code: "", name: "" },
  ]);
  const [pgmgbListData, setPgmgbListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [personListData, setPersonListData] = React.useState([
    { code: "", name: "" },
  ]);
  const [postcdListData, setPostcdListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [applineListData, setApplineListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [appgbListData, setAppgbListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const userQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_USERS")
      );

      const appynQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_appyn")
      );

      const pgmgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_EA002")
      );
      const postcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_HU005")
      );
      const applineQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_EA004")
      );
      const appgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_EA001")
      );

      fetchQuery(userQueryStr, setPersonListData);
      fetchQuery(appynQueryStr, setAppynListData);
      fetchQuery(pgmgbQueryStr, setPgmgbListData);
      fetchQuery(postcdQueryStr, setPostcdListData);
      fetchQuery(applineQueryStr, setApplineListData);
      fetchQuery(appgbQueryStr, setAppgbListData);
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
  //메시지 조회
  const [messagesData, setMessagesData] = useState<any>(null);
  UseMessages(pathname, setMessagesData);

  const setLoading = useSetRecoilState(isLoading);
  const userId = UseGetValueFromSessionItem("user_id");
  const processApi = useApi();

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
        dptcd: defaultOption.find((item: any) => item.id === "dptcd").valueCode,
        person: defaultOption.find((item: any) => item.id === "person")
          .valueCode,
        stddiv: defaultOption.find((item: any) => item.id === "stddiv")
          .valueCode,
        pgmgb: defaultOption.find((item: any) => item.id === "pgmgb").valueCode,
        appyn: defaultOption.find((item: any) => item.id === "appyn").valueCode,
        appgb: defaultOption.find((item: any) => item.id === "appgb").valueCode,
      }));
    }
  }, [customOptionData]);

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

  //조회조건 Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 조회 파라미터로 세팅
  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    if (name == "appgb") {
      setFilters((prev) => ({
        ...prev,
        workType:
          value == "A"
            ? "INDIVIDUAL"
            : value == "B"
            ? "UNDECIDE"
            : value == "C"
            ? "DECIDE"
            : value == "F"
            ? "REF"
            : prev.workType,
        [name]: value,
        isSearch: true,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));
    setPage({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));
    setPage({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange3 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters3((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));
    setPage3({
      skip: page.skip,
      take: initialPageState.take,
    });
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

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult3, setMainDataResult3] = useState<DataResult>(
    process([], mainDataState3)
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
  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  // 조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "UNDECIDE",
    frdt: new Date(),
    todt: new Date(),
    appnum: "",
    dptcd: "",
    person: "",
    stddiv: "",
    pgmgb: "",
    appnm: "",
    appyn: "",
    appgb: "",
    pgNum: 1,
    isSearch: false,
  });

  // 조회조건 초기값
  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "APP_PERSON",
    appnum: "",
    pgmgb: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters3, setFilters3] = useState({
    pgSize: PAGE_SIZE,
    workType: "REF_PERSON",
    appnum: "",
    pgmgb: "",
    pgNum: 1,
    isSearch: false,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_EA_A2000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": "01",
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_appnum": filters.appnum,
        "@p_appnm": filters.appnm,
        "@p_person": filters.person,
        "@p_pgmgb": filters.pgmgb,
        "@p_dptcd": filters.dptcd,
        "@p_appyn": filters.appyn,
        "@p_stddiv": filters.stddiv,
        "@p_attdatnum": "",
        "@p_user_id": userId,
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
        setFilters2((prev) => ({
          ...prev,
          appnum: rows[0].appnum,
          pgmgb: rows[0].pgmgb,
          isSearch: true,
          pgNum: 1,
        }));
        setFilters3((prev) => ({
          ...prev,
          appnum: rows[0].appnum,
          pgmgb: rows[0].pgmgb,
          isSearch: true,
          pgNum: 1,
        }));
      } else {
        setPage2(initialPageState);
        setPage3(initialPageState);
        setMainDataResult2(process([], mainDataState2));
        setMainDataResult3(process([], mainDataState3));
        setFilters2((prev)=> ({
          ...prev,
          pgmgb: "",
        }))
        setFilters3((prev)=> ({
          ...prev,
          pgmgb: "",
        }))
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
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
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_EA_A2000W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.workType,
        "@p_orgdiv": "01",
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_appnum": filters2.appnum,
        "@p_appnm": filters.appnm,
        "@p_person": filters.person,
        "@p_pgmgb": filters.pgmgb,
        "@p_dptcd": filters.dptcd,
        "@p_appyn": filters.appyn,
        "@p_stddiv": filters.stddiv,
        "@p_attdatnum": "",
        "@p_user_id": userId,
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

      setMainDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
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
  const fetchMainGrid3 = async (filters2: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_EA_A2000W_Q",
      pageNumber: filters3.pgNum,
      pageSize: filters3.pgSize,
      parameters: {
        "@p_work_type": filters3.workType,
        "@p_orgdiv": "01",
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_appnum": filters2.appnum,
        "@p_appnm": filters.appnm,
        "@p_person": filters.person,
        "@p_pgmgb": filters.pgmgb,
        "@p_dptcd": filters.dptcd,
        "@p_appyn": filters.appyn,
        "@p_stddiv": filters.stddiv,
        "@p_attdatnum": "",
        "@p_user_id": userId,
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

      setMainDataResult3((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState3({ [rows[0][DATA_ITEM_KEY3]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
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
    if (filters.isSearch && customOptionData != null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, customOptionData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters2.isSearch && customOptionData != null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, customOptionData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters3.isSearch && customOptionData != null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3);
      setFilters3((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid3(deepCopiedFilters);
    }
  }, [filters3, customOptionData]);

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setPage2(initialPageState);
    setPage3(initialPageState);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
    setMainDataResult3(process([], mainDataState3));
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "EA_A2000W_003");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "EA_A2000W_003");
      } else {
        resetAllGrid();
        setFilters((prev) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
      }
    } catch (e) {
      alert(e);
    }
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
  };

  const onMainDataStateChange3 = (event: GridDataStateChangeEvent) => {
    setMainDataState3(event.dataState);
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

  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = mainDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const mainTotalFooterCell3 = (props: GridFooterCellProps) => {
    var parts = mainDataResult3.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setFilters2((prev) => ({
      ...prev,
      appnum: selectedRowData.appnum,
      pgmgb: selectedRowData.pgmgb,
      isSearch: true,
      pgNum: 1,
    }));

    setFilters3((prev) => ({
      ...prev,
      appnum: selectedRowData.appnum,
      pgmgb: selectedRowData.pgmgb,
      isSearch: true,
      pgNum: 1,
    }));
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
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
    if (field == "chk") {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              chk:
                typeof item.chk == "boolean"
                  ? item.chk
                  : item.chk == "Y"
                  ? true
                  : false,
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

  const [values2, setValues2] = useState<boolean>(false);
  const CustomCheckBoxCell2 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        chk: !values2,
        [EDIT_FIELD]: props.field,
      }));
      setValues2(!values2);
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values2} onClick={changeCheck}></Checkbox>
      </div>
    );
  };

  const minGridWidth = React.useRef<number>(0);
  const minGridWidth2 = React.useRef<number>(0);
  const minGridWidth3 = React.useRef<number>(0);
  const grid = React.useRef<any>(null);
  const grid2 = React.useRef<any>(null);
  const grid3 = React.useRef<any>(null);
  const [applyMinWidth, setApplyMinWidth] = React.useState(false);
  const [applyMinWidth2, setApplyMinWidth2] = React.useState(false);
  const [applyMinWidth3, setApplyMinWidth3] = React.useState(false);
  const [gridCurrent, setGridCurrent] = React.useState(0);
  const [gridCurrent2, setGridCurrent2] = React.useState(0);
  const [gridCurrent3, setGridCurrent3] = React.useState(0);

  useEffect(() => {
    if (customOptionData != null) {
      grid.current = document.getElementById("grdList");
      grid2.current = document.getElementById("grdList2");
      grid3.current = document.getElementById("grdList3");

      window.addEventListener("resize", handleResize);

      //가장작은 그리드 이름
      customOptionData.menuCustomColumnOptions["grdList"].map((item: TColumn) =>
        item.width !== undefined
          ? (minGridWidth.current += item.width)
          : minGridWidth.current
      );
      customOptionData.menuCustomColumnOptions["grdList2"].map(
        (item: TColumn) =>
          item.width !== undefined
            ? (minGridWidth2.current += item.width)
            : minGridWidth2.current
      );
      customOptionData.menuCustomColumnOptions["grdList3"].map(
        (item: TColumn) =>
          item.width !== undefined
            ? (minGridWidth3.current += item.width)
            : minGridWidth3.current
      );

      if (filters.appgb == "B") {
        minGridWidth.current += 50;
      }

      if (grid.current) {
        setGridCurrent(grid.current.clientWidth);
        setApplyMinWidth(grid.current.clientWidth < minGridWidth.current);
      }
      if (grid2.current) {
        setGridCurrent2(grid2.current.clientWidth);
        setApplyMinWidth2(grid2.current.clientWidth < minGridWidth2.current);
      }
      if (grid3.current) {
        setGridCurrent3(grid3.current.clientWidth);
        setApplyMinWidth3(grid3.current.clientWidth < minGridWidth3.current);
      }
    }
  }, [customOptionData, filters.appgb]);

  const handleResize = () => {
    if (grid.current) {
      if (grid.current.clientWidth < minGridWidth.current && !applyMinWidth) {
        setApplyMinWidth(true);
      } else if (grid.current.clientWidth > minGridWidth.current) {
        setGridCurrent(grid.current.clientWidth);
        setApplyMinWidth(false);
      }
    }
    if (grid2.current) {
      if (
        grid2.current.clientWidth < minGridWidth2.current &&
        !applyMinWidth2
      ) {
        setApplyMinWidth2(true);
      } else if (grid2.current.clientWidth > minGridWidth2.current) {
        setGridCurrent2(grid2.current.clientWidth);
        setApplyMinWidth2(false);
      }
    }
    if (grid3.current) {
      if (
        grid3.current.clientWidth < minGridWidth3.current &&
        !applyMinWidth3
      ) {
        setApplyMinWidth(true);
      } else if (grid3.current.clientWidth > minGridWidth3.current) {
        setGridCurrent3(grid3.current.clientWidth);
        setApplyMinWidth3(false);
      }
    }
  };

  const setWidth = (Name: string, minWidth: number | undefined) => {
    if (minWidth == undefined) {
      minWidth = 0;
    }

    if (grid.current && Name == "grdList") {
      let width = applyMinWidth
        ? minWidth
        : minWidth +
          (gridCurrent - minGridWidth.current) /
            customOptionData.menuCustomColumnOptions[Name].length;

      return width;
    }

    if (grid2.current && Name == "grdList2") {
      let width = applyMinWidth2
        ? minWidth
        : minWidth +
          (gridCurrent2 - minGridWidth2.current) /
            customOptionData.menuCustomColumnOptions[Name].length;

      return width;
    }

    if (grid3.current && Name == "grdList3") {
      let width = applyMinWidth3
        ? minWidth
        : minWidth +
          (gridCurrent3 - minGridWidth3.current) /
            customOptionData.menuCustomColumnOptions[Name].length;

      return width;
    }
  };

  //계획 저장 파라미터 초기값
  const [detailParaDataSaved, setDetailParaDataSaved] = useState({
    work_type: "",
    orgdiv: "01",
    appnum: "",
    attdatnum: "",
    rtcomment: "",
    userid: userId,
    pc: pc,
    pagediv: "",
    comment: "",
    form_id: pathname,
    rowstatus_s: "",
    commseq_s: "",
    time_s: "",
  });

  const detailParaSaved: Iparameters = {
    procedureName: "P_EA_A2000W_S",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": detailParaDataSaved.work_type,
      "@p_orgdiv": detailParaDataSaved.orgdiv,
      "@p_appnum": detailParaDataSaved.appnum,
      
      "@p_userid": detailParaDataSaved.userid,
      "@p_pc": detailParaDataSaved.pc,
      "@p_form_id": detailParaDataSaved.form_id,
    },
  };

  const processApproval = (workType: string) => {
    const dataItem = mainDataResult.data.filter((item) => item.chk == true);

    type TData = {
      appnum: string[];
    };

    let dataArr: TData = {
      appnum: [],
    };

    if (workType == "APPCANCEL") {
      const dataItem = mainDataResult.data.filter(
        (item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

      if(dataItem == undefined) {
        alert(findMessage(messagesData, "EA_A2000W_002"));
        return false;
      }
      dataArr.appnum.push(dataItem.appnum);
    } else {
      if (dataItem.length === 0) {
        alert(findMessage(messagesData, "EA_A2000W_002"));
        return false;
      }
  
      dataItem.forEach((item: any, idx: number) => {
        const { appnum } = item;

        dataArr.appnum.push(appnum);
      });
    }

    setDetailParaDataSaved((prev) => ({
      ...prev,
      work_type: workType,
      appnum: dataArr.appnum.join("|"),
    }));
  };

  const fetchDetailGridSaved = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", detailParaSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      resetAllGrid();
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
      }));
    } else {
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }

    //초기화
    setDetailParaDataSaved((prev) => ({ ...prev, work_type: "" }));
  };

  useEffect(() => {
    if (detailParaDataSaved.work_type !== "") fetchDetailGridSaved();
  }, [detailParaDataSaved]);

  return (
    <>
      <TitleContainer>
        <Title>결재관리</Title>
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
              <th>일자구분</th>
              <td>
                <CommonDateRangePicker
                  value={{
                    start: filters.frdt,
                    end: filters.todt,
                  }}
                  onChange={(e: { value: { start: any; end: any } }) =>
                    setFilters((prev) => ({
                      ...prev,
                      frdt: e.value.start,
                      todt: e.value.end,
                    }))
                  }
                  className="required"
                />
              </td>
              <th>부서코드</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="dptcd"
                    value={filters.dptcd}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="dptnm"
                    valueField="dptcd"
                  />
                )}
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
              <th>근태구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="stddiv"
                    value={filters.stddiv}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>결재문서</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="pgmgb"
                    value={filters.pgmgb}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
            </tr>
            <tr>
              <th>표시형식</th>
              <td colSpan={3}>
                {customOptionData !== null && (
                  <BizComponentRadioGroup
                    name="appgb"
                    value={filters.appgb}
                    bizComponentId="R_APPGB_1"
                    bizComponentData={bizComponentData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>결재제목</th>
              <td>
                <Input
                  name="appnm"
                  type="text"
                  value={filters.appnm}
                  onChange={filterInputChange}
                />
              </td>
              {filters.appgb == "B" ? (
                ""
              ) : (
                <>
                  <th>결재유무</th>
                  <td colSpan={3}>
                    {customOptionData !== null && (
                      <BizComponentRadioGroup
                        name="appyn"
                        value={filters.appyn}
                        bizComponentId="R_APPYN_1"
                        bizComponentData={bizComponentData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                </>
              )}
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainerWrap>
        <GridContainer width="65%">
          <GridContainer>
            {filters.appgb == "B" ? (
              <GridTitleContainer>
                <GridTitle>미결함</GridTitle>
                {permissions && (
                  <ButtonContainer>
                    <Button
                      onClick={() => {
                        processApproval("APP");
                      }}
                      icon="check"
                      themeColor={"primary"}
                      disabled={permissions.save ? false : true}
                    >
                      승인
                    </Button>
                    <Button
                      onClick={() => {
                        processApproval("RTR");
                      }}
                      icon="x"
                      fillMode="outline"
                      themeColor={"primary"}
                      disabled={permissions.save ? false : true}
                    >
                      반려
                    </Button>
                  </ButtonContainer>
                )}
              </GridTitleContainer>
            ) : filters.appgb == "C" ? (
              <GridTitleContainer>
                <GridTitle>기결함</GridTitle>
                {permissions && (
                  <ButtonContainer>
                    <Button
                      onClick={() => {
                        processApproval("APPCANCEL");
                      }}
                      icon="x"
                      fillMode="outline"
                      themeColor={"primary"}
                      disabled={permissions.save ? false : true}
                    >
                      승인취소
                    </Button>
                  </ButtonContainer>
                )}
              </GridTitleContainer>
            ) : filters.appgb == "A" ? (
              <GridTitleContainer>
                <GridTitle>개인결재현황</GridTitle>
              </GridTitleContainer>
            ) : filters.appgb == "F" ? (
              <GridTitleContainer>
                <GridTitle>참조자확인</GridTitle>
              </GridTitleContainer>
            ) : (
              <GridTitleContainer>
                <GridTitle>미결함</GridTitle>
                {permissions && (
                  <ButtonContainer>
                    <Button
                      onClick={() => {
                        processApproval("APP");
                      }}
                      icon="check"
                      themeColor={"primary"}
                      disabled={permissions.save ? false : true}
                    >
                      승인
                    </Button>
                    <Button
                      onClick={() => {
                        processApproval("RTR");
                      }}
                      icon="x"
                      fillMode="outline"
                      themeColor={"primary"}
                      disabled={permissions.save ? false : true}
                    >
                      반려
                    </Button>
                  </ButtonContainer>
                )}
              </GridTitleContainer>
            )}
            <Grid
              style={{ height: "27svh" }}
              data={process(
                mainDataResult.data.map((row) => ({
                  ...row,
                  person: personListData.find(
                    (item: any) => item.code === row.person
                  )?.name,
                  appyn: appynListData.find(
                    (item: any) => item.code === row.appyn
                  )?.name,
                  pgmgb: pgmgbListData.find(
                    (item: any) => item.sub_code === row.pgmgb
                  )?.code_name,
                  [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                })),
                mainDataState
              )}
              {...mainDataState}
              onDataStateChange={onMainDataStateChange}
              // 선택기능
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
              skip={page.skip}
              take={page.take}
              pageable={true}
              onPageChange={pageChange}
              //원하는 행 위치로 스크롤 기능
              ref={gridRef}
              rowHeight={30}
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
              id="grdList"
            >
              {filters.appgb == "B" ? (
                <GridColumn
                  field="chk"
                  title=" "
                  width="45px"
                  headerCell={CustomCheckBoxCell2}
                  cell={CheckBoxCell}
                />
              ) : (
                ""
              )}

              {customOptionData !== null &&
                customOptionData.menuCustomColumnOptions["grdList"].map(
                  (item: any, idx: number) =>
                    item.sortOrder !== -1 && (
                      <GridColumn
                        key={idx}
                        id={item.id}
                        field={item.fieldName}
                        title={item.caption}
                        width={setWidth("grdList", item.width)}
                        cell={
                          dateField.includes(item.fieldName)
                            ? DateCell
                            : undefined
                        }
                        footerCell={
                          item.sortOrder === 0 ? mainTotalFooterCell : undefined
                        }
                        locked={item.fixed === "None" ? false : true}
                      />
                    )
                )}
            </Grid>
          </GridContainer>
          <GridContainerWrap>
            <GridContainer width="60%">
              <GridContainer>
                <GridTitleContainer>
                  <GridTitle>결재자</GridTitle>
                </GridTitleContainer>
                <Grid
                  style={{ height: "22vh" }}
                  data={process(
                    mainDataResult2.data.map((row) => ({
                      ...row,
                      resno: personListData.find(
                        (item: any) => item.code === row.resno
                      )?.name,
                      postcd: postcdListData.find(
                        (item: any) => item.sub_code === row.postcd
                      )?.code_name,
                      appline: applineListData.find(
                        (item: any) => item.sub_code === row.appline
                      )?.code_name,
                      [SELECTED_FIELD]: selectedState2[idGetter2(row)], //선택된 데이터
                    })),
                    mainDataState2
                  )}
                  {...mainDataState2}
                  onDataStateChange={onMainDataStateChange2}
                  // 선택기능
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
                  skip={page2.skip}
                  take={page2.take}
                  pageable={true}
                  onPageChange={pageChange2}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef2}
                  rowHeight={30}
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange2}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  id="grdList2"
                >
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList2"].map(
                      (item: any, idx: number) =>
                        item.sortOrder !== -1 && (
                          <GridColumn
                            key={idx}
                            id={item.id}
                            field={item.fieldName}
                            title={item.caption}
                            width={setWidth("grdList2", item.width)}
                            cell={
                              dateField.includes(item.fieldName)
                                ? DateCell
                                : item.fieldName === "appyn" ||
                                  item.fieldName === "arbitragb"
                                ? CheckBoxReadOnlyCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 0
                                ? mainTotalFooterCell2
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </GridContainer>
              <GridContainer>
                <GridTitleContainer>
                  <GridTitle>참조자</GridTitle>
                </GridTitleContainer>
                <Grid
                  style={{ height: "22vh" }}
                  data={process(
                    mainDataResult3.data.map((row) => ({
                      ...row,
                      resno: personListData.find(
                        (item: any) => item.code === row.resno
                      )?.name,
                      postcd: postcdListData.find(
                        (item: any) => item.sub_code === row.postcd
                      )?.code_name,
                      appgb: appgbListData.find(
                        (item: any) => item.sub_code === row.appgb
                      )?.code_name,
                      [SELECTED_FIELD]: selectedState3[idGetter3(row)], //선택된 데이터
                    })),
                    mainDataState3
                  )}
                  {...mainDataState3}
                  onDataStateChange={onMainDataStateChange3}
                  // 선택기능
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
                  skip={page3.skip}
                  take={page3.take}
                  pageable={true}
                  onPageChange={pageChange3}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef3}
                  rowHeight={30}
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange3}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  id="grdList3"
                >
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList3"].map(
                      (item: any, idx: number) =>
                        item.sortOrder !== -1 && (
                          <GridColumn
                            key={idx}
                            id={item.id}
                            field={item.fieldName}
                            title={item.caption}
                            width={setWidth("grdList3", item.width)}
                            cell={
                              dateField.includes(item.fieldName)
                                ? DateCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 0
                                ? mainTotalFooterCell3
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </GridContainer>
            </GridContainer>
            <GridContainer width={`calc(40% - ${GAP}px)`}>
              <CommentsGrid
                ref_key={filters2.appnum}
                form_id={pathname}
                table_id={"EA100T"}
                style={{ height: "47.7vh" }}
              ></CommentsGrid>
            </GridContainer>
          </GridContainerWrap>
        </GridContainer>
        <GridContainer
          className="preview-grid-container"
          width={`calc(35% - ${GAP}px)`}
        >
          <GridTitleContainer>
            <GridTitle>
              <WordText
                wordInfoData={wordInfoData}
                controlName="grtlPreview"
                altText="결재문서 미리보기"
              />
            </GridTitle>
          </GridTitleContainer>
          <GridContainer
            style={{
              height: "79vh",
              overflow: "scroll",
              border: "solid 1px #e6e6e6",
              margin: "5px 0",
            }}
          >
            {filters2.pgmgb === "지출결의서" ||
            filters2.pgmgb === "X" ||
            filters2.pgmgb === "Z" ? (
              <CashDisbursementVoucher
                data={
                  mainDataResult.data.filter(
                    (item) =>
                      item[DATA_ITEM_KEY] ==
                      Object.getOwnPropertyNames(selectedState)[0]
                  )[0] == undefined? "" : mainDataResult.data.filter(
                    (item) =>
                      item[DATA_ITEM_KEY] ==
                      Object.getOwnPropertyNames(selectedState)[0]
                  )[0]
                }
              />
            ) : filters2.pgmgb === "근태허가신청" || filters2.pgmgb === "W" ? (
              <AbsenceRequest
                data={
                  mainDataResult.data.filter(
                    (item) =>
                      item[DATA_ITEM_KEY] ==
                      Object.getOwnPropertyNames(selectedState)[0]
                  )[0] == undefined? "" : mainDataResult.data.filter(
                    (item) =>
                      item[DATA_ITEM_KEY] ==
                      Object.getOwnPropertyNames(selectedState)[0]
                  )[0]
                }
              />
            ) : (
              ""
            )}
          </GridContainer>
        </GridContainer>
      </GridContainerWrap>
      {gridList.map((grid: TGrid) =>
        grid.columns.map((column: TColumn) => (
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
export default EA_A2000W;
