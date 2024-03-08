import { DataResult, State, process } from "@progress/kendo-data-query";
import { getter } from "@progress/kendo-react-common";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { bytesToBase64 } from "byte-base64";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  FilterBox,
  GridContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  convertDateToStrWithTime2,
  findMessage,
  getQueryFromBizComponent,
  handleKeyPressSearch,
  setDefaultDate,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/AC_B5080W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DateField = ["outdt", "recdt", "indt", "actdt"];
const NumberField = [
  "qty",
  "wonamt",
  "taxamt",
  "amt",
  "wonchgrat",
  "splyamt",
  "acseq1",
  "dramt",
  "cramt",
  "dcamt",
];
let targetRowIndex: null | number = null;

const AC_B5080W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();

  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
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

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("AC_B5080W", setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("AC_B5080W", setCustomOptionData);

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
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA015,L_BA029,L_BA005,L_BA020, L_sysUserMaster_001, L_AC014,L_BA003, L_AC006",
    //수량단위, 과세구분, 내수구분, 화폐단위, 사용자, 계산서유형, 입고유형, 전표입력경로
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [qtyunitListData, setQtyunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [taxdivListData, setTaxdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [taxtypeListData, setTaxtypeListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [doexdivListData, setDoexdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [amtunitListData, setAmtunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [userListData, setUserListData] = React.useState([
    { user_id: "", user_name: "" },
  ]);
  const [inkindListData, setInkindListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [inputpathListData, setInputpathListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      const qtyunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA015")
      );
      const taxdivQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA029")
      );
      const doexdivQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA005")
      );
      const amtunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA020")
      );
      const userQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_sysUserMaster_001"
        )
      );
      const taxtypeQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_AC014")
      );
      const inkindQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA003")
      );
      const inputpathQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_AC006")
      );
      fetchQuery(userQueryStr, setUserListData);
      fetchQuery(amtunitQueryStr, setAmtunitListData);
      fetchQuery(doexdivQueryStr, setDoexdivListData);
      fetchQuery(qtyunitQueryStr, setQtyunitListData);
      fetchQuery(taxdivQueryStr, setTaxdivListData);
      fetchQuery(taxtypeQueryStr, setTaxtypeListData);
      fetchQuery(inkindQueryStr, setInkindListData);
      fetchQuery(inputpathQueryStr, setInputpathListData);
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
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [mainDataState3, setMainDataState3] = useState<State>({
    sort: [],
  });
  const [mainDataState4, setMainDataState4] = useState<State>({
    sort: [],
  });
  const [mainDataState5, setMainDataState5] = useState<State>({
    sort: [],
  });
  const [mainDataState6, setMainDataState6] = useState<State>({
    sort: [],
  });
  const [mainDataState7, setMainDataState7] = useState<State>({
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
  const [mainDataResult4, setMainDataResult4] = useState<DataResult>(
    process([], mainDataState4)
  );
  const [mainDataResult5, setMainDataResult5] = useState<DataResult>(
    process([], mainDataState5)
  );
  const [mainDataResult6, setMainDataResult6] = useState<DataResult>(
    process([], mainDataState6)
  );
  const [mainDataResult7, setMainDataResult7] = useState<DataResult>(
    process([], mainDataState7)
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
  const [selectedState4, setSelectedState4] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState5, setSelectedState5] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState6, setSelectedState6] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState7, setSelectedState7] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [tabSelected, setTabSelected] = React.useState(0);

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    frdt: new Date(),
    todt: new Date(),
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_B5080W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "TAB1_1",
        "@p_orgdiv": filters.orgdiv,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
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
  const fetchMainGrid2 = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    const parameters2: Iparameters = {
      procedureName: "P_AC_B5080W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "TAB2_1",
        "@p_orgdiv": filters.orgdiv,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
      },
    };
    try {
      data = await processApi<any>("procedure", parameters2);
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
        setSelectedState2({ [rows[0][DATA_ITEM_KEY]]: true });
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

  const fetchMainGrid3 = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    const parameters3: Iparameters = {
      procedureName: "P_AC_B5080W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "TAB3_1",
        "@p_orgdiv": filters.orgdiv,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
      },
    };
    try {
      data = await processApi<any>("procedure", parameters3);
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
        setSelectedState3({ [rows[0][DATA_ITEM_KEY]]: true });
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

  const fetchMainGrid4 = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    const parameters4: Iparameters = {
      procedureName: "P_AC_B5080W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "TAB1_2",
        "@p_orgdiv": filters.orgdiv,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
      },
    };

    try {
      data = await processApi<any>("procedure", parameters4);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;
      setMainDataResult4((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState4({ [rows[0][DATA_ITEM_KEY]]: true });
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

  const fetchMainGrid5 = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    const parameters5: Iparameters = {
      procedureName: "P_AC_B5080W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "TAB2_2",
        "@p_orgdiv": filters.orgdiv,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
      },
    };
    try {
      data = await processApi<any>("procedure", parameters5);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setMainDataResult5((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState5({ [rows[0][DATA_ITEM_KEY]]: true });
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

  const fetchMainGrid6 = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    const parameters6: Iparameters = {
      procedureName: "P_AC_B5080W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "TAB3_2",
        "@p_orgdiv": filters.orgdiv,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
      },
    };
    try {
      data = await processApi<any>("procedure", parameters6);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setMainDataResult6((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState6({ [rows[0][DATA_ITEM_KEY]]: true });
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

  const fetchMainGrid7 = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    const parameters7: Iparameters = {
      procedureName: "P_AC_B5080W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "ALL",
        "@p_orgdiv": filters.orgdiv,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
      },
    };
    try {
      data = await processApi<any>("procedure", parameters7);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setMainDataResult7((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState7({ [rows[0][DATA_ITEM_KEY]]: true });
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      if (tabSelected == 0) {
        fetchMainGrid(deepCopiedFilters);
      } else if (tabSelected == 1) {
        fetchMainGrid2(deepCopiedFilters);
      } else if (tabSelected == 2) {
        fetchMainGrid3(deepCopiedFilters);
      } else if (tabSelected == 3) {
        fetchMainGrid4(deepCopiedFilters);
      } else if (tabSelected == 4) {
        fetchMainGrid5(deepCopiedFilters);
      } else if (tabSelected == 5) {
        fetchMainGrid6(deepCopiedFilters);
      } else {
        fetchMainGrid7(deepCopiedFilters);
      }
    }
  }, [filters]);

  let gridRef: any = useRef(null);
  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [
    mainDataResult,
    mainDataResult2,
    mainDataResult3,
    mainDataResult4,
    mainDataResult5,
    mainDataResult6,
    mainDataResult7,
  ]);

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
    setMainDataResult3(process([], mainDataState3));
    setMainDataResult4(process([], mainDataState4));
    setMainDataResult5(process([], mainDataState5));
    setMainDataResult6(process([], mainDataState6));
    setMainDataResult7(process([], mainDataState7));
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    if (tabSelected === 0) {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState,
        dataItemKey: DATA_ITEM_KEY,
      });

      setSelectedState(newSelectedState);
    } else if (tabSelected === 1) {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState2,
        dataItemKey: DATA_ITEM_KEY,
      });

      setSelectedState2(newSelectedState);
    } else if (tabSelected === 2) {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState3,
        dataItemKey: DATA_ITEM_KEY,
      });

      setSelectedState3(newSelectedState);
    } else if (tabSelected === 3) {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState4,
        dataItemKey: DATA_ITEM_KEY,
      });

      setSelectedState4(newSelectedState);
    } else if (tabSelected === 4) {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState5,
        dataItemKey: DATA_ITEM_KEY,
      });

      setSelectedState5(newSelectedState);
    } else if (tabSelected === 5) {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState6,
        dataItemKey: DATA_ITEM_KEY,
      });

      setSelectedState6(newSelectedState);
    } else {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState7,
        dataItemKey: DATA_ITEM_KEY,
      });

      setSelectedState7(newSelectedState);
    }
  };

  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
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
  const onMainDataStateChange4 = (event: GridDataStateChangeEvent) => {
    setMainDataState4(event.dataState);
  };
  const onMainDataStateChange5 = (event: GridDataStateChangeEvent) => {
    setMainDataState5(event.dataState);
  };
  const onMainDataStateChange6 = (event: GridDataStateChangeEvent) => {
    setMainDataState6(event.dataState);
  };
  const onMainDataStateChange7 = (event: GridDataStateChangeEvent) => {
    setMainDataState7(event.dataState);
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

  const mainTotalFooterCell4 = (props: GridFooterCellProps) => {
    var parts = mainDataResult4.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult4.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const mainTotalFooterCell5 = (props: GridFooterCellProps) => {
    var parts = mainDataResult5.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult5.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const mainTotalFooterCell6 = (props: GridFooterCellProps) => {
    var parts = mainDataResult6.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult6.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const mainTotalFooterCell7 = (props: GridFooterCellProps) => {
    var parts = mainDataResult7.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult7.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainSortChange3 = (e: any) => {
    setMainDataState3((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainSortChange4 = (e: any) => {
    setMainDataState4((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainSortChange5 = (e: any) => {
    setMainDataState5((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainSortChange6 = (e: any) => {
    setMainDataState6((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainSortChange7 = (e: any) => {
    setMainDataState7((prev) => ({ ...prev, sort: e.sort }));
  };

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
    resetAllGrid();
    setFilters((prev: any) => ({
      ...prev,
      find_row_value: "",
      pgNum: 1,
      isSearch: true,
    }));
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "AC_B5080W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "AC_B5080W_001");
      } else {
        resetAllGrid();
        setFilters((prev: any) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
      }
    } catch (e) {
      alert(e);
    }
  };

  const gridSumQtyFooterCell = (props: GridFooterCellProps) => {
    let sum = "";
    mainDataResult.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );

    var parts = parseFloat(sum).toString().split(".");
    return parts[0] != "NaN" ? (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
      </td>
    ) : (
      <td></td>
    );
  };

  const gridSumQtyFooterCell2 = (props: GridFooterCellProps) => {
    let sum = "";
    mainDataResult2.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );

    var parts = parseFloat(sum).toString().split(".");
    return parts[0] != "NaN" ? (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
      </td>
    ) : (
      <td></td>
    );
  };

  const gridSumQtyFooterCell3 = (props: GridFooterCellProps) => {
    let sum = "";
    mainDataResult3.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );

    var parts = parseFloat(sum).toString().split(".");
    return parts[0] != "NaN" ? (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
      </td>
    ) : (
      <td></td>
    );
  };

  const gridSumQtyFooterCell4 = (props: GridFooterCellProps) => {
    let sum = "";
    mainDataResult4.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );

    var parts = parseFloat(sum).toString().split(".");

    return parts[0] != "NaN" ? (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
      </td>
    ) : (
      <td></td>
    );
  };

  const gridSumQtyFooterCell5 = (props: GridFooterCellProps) => {
    let sum = "";
    mainDataResult5.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );

    var parts = parseFloat(sum).toString().split(".");
    return parts[0] != "NaN" ? (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
      </td>
    ) : (
      <td></td>
    );
  };

  const gridSumQtyFooterCell6 = (props: GridFooterCellProps) => {
    let sum = "";
    mainDataResult6.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );

    var parts = parseFloat(sum).toString().split(".");
    return parts[0] != "NaN" ? (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
      </td>
    ) : (
      <td></td>
    );
  };

  const gridSumQtyFooterCell7 = (props: GridFooterCellProps) => {
    let sum = "";
    mainDataResult7.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );

    var parts = parseFloat(sum).toString().split(".");
    return parts[0] != "NaN" ? (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
      </td>
    ) : (
      <td></td>
    );
  };

  return (
    <>
      <TitleContainer>
        <Title>계산서&전표체크</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="AC_B5080W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>기준일자</th>
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
              <th></th>
              <td></td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <TabStrip
        style={{ width: "100%" }}
        selected={tabSelected}
        onSelect={handleSelectTab}
      >
        <TabStripTab title="TAX미발(매출)">
          <GridContainer width="100%">
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
            >
              <Grid
                style={{ height: "76vh" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    taxdiv: taxdivListData.find(
                      (item: any) => item.sub_code === row.taxdiv
                    )?.code_name,
                    qtyunit: qtyunitListData.find(
                      (item: any) => item.sub_code === row.qtyunit
                    )?.code_name,
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
              >
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
                            NumberField.includes(item.fieldName)
                              ? NumberCell
                              : DateField.includes(item.fieldName)
                              ? DateCell
                              : undefined
                          }
                          footerCell={
                            item.sortOrder === 1
                              ? mainTotalFooterCell
                              : NumberField.includes(item.fieldName)
                              ? gridSumQtyFooterCell
                              : undefined
                          }
                        />
                      )
                  )}
              </Grid>
            </ExcelExport>
          </GridContainer>
        </TabStripTab>
        <TabStripTab title="전표미발(매출)">
          <GridContainer width="100%">
            <Grid
              style={{ height: "76vh" }}
              data={process(
                mainDataResult2.data.map((row) => ({
                  ...row,
                  taxtype: taxtypeListData.find(
                    (item: any) => item.sub_code === row.taxtype
                  )?.code_name,
                  doexdiv: doexdivListData.find(
                    (item: any) => item.sub_code === row.doexdiv
                  )?.code_name,
                  amtunit: amtunitListData.find(
                    (item: any) => item.sub_code === row.amtunit
                  )?.code_name,
                  insert_userid: userListData.find(
                    (item: any) => item.user_id === row.insert_userid
                  )?.user_name,
                  insert_time: convertDateToStrWithTime2(
                    new Date(row.insert_time)
                  ),
                  [SELECTED_FIELD]: selectedState2[idGetter(row)],
                })),
                mainDataState2
              )}
              {...mainDataState2}
              onDataStateChange={onMainDataStateChange2}
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
              total={mainDataResult2.total}
              skip={page.skip}
              take={page.take}
              pageable={true}
              onPageChange={pageChange}
              //원하는 행 위치로 스크롤 기능
              ref={gridRef}
              rowHeight={30}
              //정렬기능
              sortable={true}
              onSortChange={onMainSortChange2}
              //컬럼순서조정
              reorderable={true}
              //컬럼너비조정
              resizable={true}
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
                        width={item.width}
                        cell={
                          NumberField.includes(item.fieldName)
                            ? NumberCell
                            : DateField.includes(item.fieldName)
                            ? DateCell
                            : undefined
                        }
                        footerCell={
                          item.sortOrder === 1
                            ? mainTotalFooterCell2
                            : NumberField.includes(item.fieldName)
                            ? gridSumQtyFooterCell2
                            : undefined
                        }
                      />
                    )
                )}
            </Grid>
          </GridContainer>
        </TabStripTab>
        <TabStripTab title="TAX오류(매출)">
          <GridContainer width="100%">
            <Grid
              style={{ height: "76vh" }}
              data={process(
                mainDataResult3.data.map((row) => ({
                  ...row,
                  taxdiv: taxdivListData.find(
                    (item: any) => item.sub_code === row.taxdiv
                  )?.code_name,
                  qtyunit: qtyunitListData.find(
                    (item: any) => item.sub_code === row.qtyunit
                  )?.code_name,
                  insert_userid: userListData.find(
                    (item: any) => item.user_id === row.insert_userid
                  )?.user_name,
                  insert_time: convertDateToStrWithTime2(
                    new Date(row.insert_time)
                  ),
                  [SELECTED_FIELD]: selectedState3[idGetter(row)],
                })),
                mainDataState3
              )}
              {...mainDataState3}
              onDataStateChange={onMainDataStateChange3}
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
              total={mainDataResult3.total}
              skip={page.skip}
              take={page.take}
              pageable={true}
              onPageChange={pageChange}
              //원하는 행 위치로 스크롤 기능
              ref={gridRef}
              rowHeight={30}
              //정렬기능
              sortable={true}
              onSortChange={onMainSortChange3}
              //컬럼순서조정
              reorderable={true}
              //컬럼너비조정
              resizable={true}
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
                        width={item.width}
                        cell={
                          NumberField.includes(item.fieldName)
                            ? NumberCell
                            : DateField.includes(item.fieldName)
                            ? DateCell
                            : undefined
                        }
                        footerCell={
                          item.sortOrder === 1
                            ? mainTotalFooterCell3
                            : NumberField.includes(item.fieldName)
                            ? gridSumQtyFooterCell3
                            : undefined
                        }
                      />
                    )
                )}
            </Grid>
          </GridContainer>
        </TabStripTab>
        <TabStripTab title="TAX미발(매입)">
          <GridContainer width="100%">
            <Grid
              style={{ height: "76vh" }}
              data={process(
                mainDataResult4.data.map((row) => ({
                  ...row,
                  inkind: inkindListData.find(
                    (item: any) => item.sub_code === row.inkind
                  )?.code_name,
                  doexdiv: doexdivListData.find(
                    (item: any) => item.sub_code === row.doexdiv
                  )?.code_name,
                  taxdiv: taxdivListData.find(
                    (item: any) => item.sub_code === row.taxdiv
                  )?.code_name,
                  qtyunit: qtyunitListData.find(
                    (item: any) => item.sub_code === row.qtyunit
                  )?.code_name,
                  insert_userid: userListData.find(
                    (item: any) => item.user_id === row.insert_userid
                  )?.user_name,
                  insert_time: convertDateToStrWithTime2(
                    new Date(row.insert_time)
                  ),
                  [SELECTED_FIELD]: selectedState4[idGetter(row)],
                })),
                mainDataState4
              )}
              {...mainDataState4}
              onDataStateChange={onMainDataStateChange4}
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
              total={mainDataResult4.total}
              skip={page.skip}
              take={page.take}
              pageable={true}
              onPageChange={pageChange}
              //원하는 행 위치로 스크롤 기능
              ref={gridRef}
              rowHeight={30}
              //정렬기능
              sortable={true}
              onSortChange={onMainSortChange4}
              //컬럼순서조정
              reorderable={true}
              //컬럼너비조정
              resizable={true}
            >
              {customOptionData !== null &&
                customOptionData.menuCustomColumnOptions["grdList4"].map(
                  (item: any, idx: number) =>
                    item.sortOrder !== -1 && (
                      <GridColumn
                        key={idx}
                        id={item.id}
                        field={item.fieldName}
                        title={item.caption}
                        width={item.width}
                        cell={
                          NumberField.includes(item.fieldName)
                            ? NumberCell
                            : DateField.includes(item.fieldName)
                            ? DateCell
                            : undefined
                        }
                        footerCell={
                          item.sortOrder === 1
                            ? mainTotalFooterCell4
                            : NumberField.includes(item.fieldName)
                            ? gridSumQtyFooterCell4
                            : undefined
                        }
                      />
                    )
                )}
            </Grid>
          </GridContainer>
        </TabStripTab>
        <TabStripTab title="전표미발(매입)">
          <GridContainer width="100%">
            <Grid
              style={{ height: "76vh" }}
              data={process(
                mainDataResult5.data.map((row) => ({
                  ...row,
                  taxtype: taxtypeListData.find(
                    (item: any) => item.sub_code === row.taxtype
                  )?.code_name,
                  insert_userid: userListData.find(
                    (item: any) => item.user_id === row.insert_userid
                  )?.user_name,
                  insert_time: convertDateToStrWithTime2(
                    new Date(row.insert_time)
                  ),
                  [SELECTED_FIELD]: selectedState5[idGetter(row)],
                })),
                mainDataState5
              )}
              {...mainDataState5}
              onDataStateChange={onMainDataStateChange5}
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
              total={mainDataResult5.total}
              skip={page.skip}
              take={page.take}
              pageable={true}
              onPageChange={pageChange}
              //원하는 행 위치로 스크롤 기능
              ref={gridRef}
              rowHeight={30}
              //정렬기능
              sortable={true}
              onSortChange={onMainSortChange5}
              //컬럼순서조정
              reorderable={true}
              //컬럼너비조정
              resizable={true}
            >
              {customOptionData !== null &&
                customOptionData.menuCustomColumnOptions["grdList5"].map(
                  (item: any, idx: number) =>
                    item.sortOrder !== -1 && (
                      <GridColumn
                        key={idx}
                        id={item.id}
                        field={item.fieldName}
                        title={item.caption}
                        width={item.width}
                        cell={
                          NumberField.includes(item.fieldName)
                            ? NumberCell
                            : DateField.includes(item.fieldName)
                            ? DateCell
                            : undefined
                        }
                        footerCell={
                          item.sortOrder === 1
                            ? mainTotalFooterCell5
                            : NumberField.includes(item.fieldName)
                            ? gridSumQtyFooterCell5
                            : undefined
                        }
                      />
                    )
                )}
            </Grid>
          </GridContainer>
        </TabStripTab>
        <TabStripTab title="TAX오류(매입)">
          <GridContainer width="100%">
            <Grid
              style={{ height: "76vh" }}
              data={process(
                mainDataResult6.data.map((row) => ({
                  ...row,
                  inkind: inkindListData.find(
                    (item: any) => item.sub_code === row.inkind
                  )?.code_name,
                  doexdiv: doexdivListData.find(
                    (item: any) => item.sub_code === row.doexdiv
                  )?.code_name,
                  taxdiv: taxdivListData.find(
                    (item: any) => item.sub_code === row.taxdiv
                  )?.code_name,
                  qtyunit: qtyunitListData.find(
                    (item: any) => item.sub_code === row.qtyunit
                  )?.code_name,
                  insert_userid: userListData.find(
                    (item: any) => item.user_id === row.insert_userid
                  )?.user_name,
                  insert_time: convertDateToStrWithTime2(
                    new Date(row.insert_time)
                  ),
                  [SELECTED_FIELD]: selectedState6[idGetter(row)],
                })),
                mainDataState6
              )}
              {...mainDataState6}
              onDataStateChange={onMainDataStateChange6}
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
              total={mainDataResult6.total}
              skip={page.skip}
              take={page.take}
              pageable={true}
              onPageChange={pageChange}
              //원하는 행 위치로 스크롤 기능
              ref={gridRef}
              rowHeight={30}
              //정렬기능
              sortable={true}
              onSortChange={onMainSortChange6}
              //컬럼순서조정
              reorderable={true}
              //컬럼너비조정
              resizable={true}
            >
              {customOptionData !== null &&
                customOptionData.menuCustomColumnOptions["grdList6"].map(
                  (item: any, idx: number) =>
                    item.sortOrder !== -1 && (
                      <GridColumn
                        key={idx}
                        id={item.id}
                        field={item.fieldName}
                        title={item.caption}
                        width={item.width}
                        cell={
                          NumberField.includes(item.fieldName)
                            ? NumberCell
                            : DateField.includes(item.fieldName)
                            ? DateCell
                            : undefined
                        }
                        footerCell={
                          item.sortOrder === 1
                            ? mainTotalFooterCell6
                            : NumberField.includes(item.fieldName)
                            ? gridSumQtyFooterCell6
                            : undefined
                        }
                      />
                    )
                )}
            </Grid>
          </GridContainer>
        </TabStripTab>
        <TabStripTab title="전표오류(전체)">
          <GridContainer width="100%">
            <Grid
              style={{ height: "76vh" }}
              data={process(
                mainDataResult7.data.map((row) => ({
                  ...row,
                  insert_userid: userListData.find(
                    (item: any) => item.user_id === row.insert_userid
                  )?.user_name,
                  insert_time: convertDateToStrWithTime2(
                    new Date(row.insert_time)
                  ),
                  update_userid: userListData.find(
                    (item: any) => item.user_id === row.update_userid
                  )?.user_name,
                  update_time: convertDateToStrWithTime2(
                    new Date(row.update_time)
                  ),
                  inputpath: inputpathListData.find(
                    (item: any) => item.sub_code === row.inputpath
                  )?.code_name,
                  [SELECTED_FIELD]: selectedState7[idGetter(row)],
                })),
                mainDataState7
              )}
              {...mainDataState7}
              onDataStateChange={onMainDataStateChange7}
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
              total={mainDataResult7.total}
              skip={page.skip}
              take={page.take}
              pageable={true}
              onPageChange={pageChange}
              //원하는 행 위치로 스크롤 기능
              ref={gridRef}
              rowHeight={30}
              //정렬기능
              sortable={true}
              onSortChange={onMainSortChange7}
              //컬럼순서조정
              reorderable={true}
              //컬럼너비조정
              resizable={true}
            >
              {customOptionData !== null &&
                customOptionData.menuCustomColumnOptions["grdList7"].map(
                  (item: any, idx: number) =>
                    item.sortOrder !== -1 && (
                      <GridColumn
                        key={idx}
                        id={item.id}
                        field={item.fieldName}
                        title={item.caption}
                        width={item.width}
                        cell={
                          NumberField.includes(item.fieldName)
                            ? NumberCell
                            : DateField.includes(item.fieldName)
                            ? DateCell
                            : undefined
                        }
                        footerCell={
                          item.sortOrder === 1
                            ? mainTotalFooterCell7
                            : NumberField.includes(item.fieldName)
                            ? gridSumQtyFooterCell7
                            : undefined
                        }
                      />
                    )
                )}
            </Grid>
          </GridContainer>
        </TabStripTab>
      </TabStrip>
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

export default AC_B5080W;
