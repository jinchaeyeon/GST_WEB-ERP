import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { DatePicker } from "@progress/kendo-react-dateinputs";
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
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import YearCalendar from "../components/Calendars/YearCalendar";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UsePermissions,
  convertDateToStr,
  getQueryFromBizComponent,
  handleKeyPressSearch,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/AC_B8000W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
const DATA_ITEM_KEY4 = "num";
const DATA_ITEM_KEY5 = "num";
const DATA_ITEM_KEY6 = "num";

const numberField = [
  "CONT",
  "AMT",
  "taxamt",
  "MAESU",
  "splyAMT",
  "AMT1",
  "MAESU1",
  "AMT2",
  "MAESU2",
  "AMT3",
  "MAESU3",
  "CUST_C",
  "AMT_C",
  "MAESU_C",
  "mngamt",
  "rate",
  "slipamt",
];

const dateField = ["shipdt"];

const AC_B8000W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const [page4, setPage4] = useState(initialPageState);
  const [page5, setPage5] = useState(initialPageState);
  const [page6, setPage6] = useState(initialPageState);
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

    setPage2({
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

  const pageChange4 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters4((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage4({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange5 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters5((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage5({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange6 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters6((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage6({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);
  let gridRef3: any = useRef(null);
  let gridRef4: any = useRef(null);
  let gridRef5: any = useRef(null);
  let gridRef6: any = useRef(null);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const idGetter4 = getter(DATA_ITEM_KEY4);
  const idGetter5 = getter(DATA_ITEM_KEY5);
  const idGetter6 = getter(DATA_ITEM_KEY6);
  const processApi = useApi();
  const [tabSelected, setTabSelected] = React.useState(0);

  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("AC_B8000W", setCustomOptionData);
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        gisu: defaultOption.find((item: any) => item.id === "gisu").valueCode,
        chasu: defaultOption.find((item: any) => item.id === "chasu").valueCode,
      }));
      setFilters2((prev) => ({
        ...prev,
        gisu: defaultOption.find((item: any) => item.id === "gisu").valueCode,
        chasu: defaultOption.find((item: any) => item.id === "chasu").valueCode,
      }));
      setFilters3((prev) => ({
        ...prev,
        gisu: defaultOption.find((item: any) => item.id === "gisu").valueCode,
        chasu: defaultOption.find((item: any) => item.id === "chasu").valueCode,
      }));
      setFilters4((prev) => ({
        ...prev,
        gisu: defaultOption.find((item: any) => item.id === "gisu").valueCode,
        chasu: defaultOption.find((item: any) => item.id === "chasu").valueCode,
      }));
      setFilters5((prev) => ({
        ...prev,
        gisu: defaultOption.find((item: any) => item.id === "gisu").valueCode,
        chasu: defaultOption.find((item: any) => item.id === "chasu").valueCode,
      }));
      setFilters6((prev) => ({
        ...prev,
        gisu: defaultOption.find((item: any) => item.id === "gisu").valueCode,
        chasu: defaultOption.find((item: any) => item.id === "chasu").valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA025,L_BA002,L_BA027, L_BA020",
    //수량단위, 과세구분, 내수구분, 화폐단위, 사용자, 계산서유형, 입고유형, 전표입력경로
    setBizComponentData
  );
  const [mngdata3ListData, setMngdata3ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [locationListData, setLocationListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [compclassListData, setCompclassListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [bizdivListData, setBizdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      const mngdata3QueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA020")
      );
      const compclassQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA025")
      );
      const locationQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA002")
      );
      const bizdivQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA027")
      );
      fetchQuery(mngdata3QueryStr, setMngdata3ListData);
      fetchQuery(locationQueryStr, setLocationListData);
      fetchQuery(compclassQueryStr, setCompclassListData);
      fetchQuery(bizdivQueryStr, setBizdivListData);
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

  //조회조건 초기값
  const [filters, setFilters] = useState<{ [name: string]: any }>({
    pgSize: PAGE_SIZE,
    worktype: "ETAX",
    orgdiv: "01",
    fdate: new Date(),
    tdate: new Date(),
    location: "01",
    taxyy: new Date(),
    gisu: "",
    chasu: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 초기값
  const [filters2, setFilters2] = useState<{ [name: string]: any }>({
    pgSize: PAGE_SIZE,
    worktype: "ETAX2",
    orgdiv: "01",
    fdate: new Date(),
    tdate: new Date(),
    location: "01",
    taxyy: new Date(),
    gisu: "",
    chasu: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 초기값
  const [filters3, setFilters3] = useState<{ [name: string]: any }>({
    pgSize: PAGE_SIZE,
    worktype: "ETAX3",
    orgdiv: "01",
    fdate: new Date(),
    tdate: new Date(),
    location: "01",
    taxyy: new Date(),
    gisu: "",
    chasu: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });
  //조회조건 초기값
  const [filters4, setFilters4] = useState<{ [name: string]: any }>({
    pgSize: PAGE_SIZE,
    worktype: "ETAX4",
    orgdiv: "01",
    fdate: new Date(),
    tdate: new Date(),
    location: "01",
    taxyy: new Date(),
    gisu: "",
    chasu: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });
  //조회조건 초기값
  const [filters5, setFilters5] = useState<{ [name: string]: any }>({
    pgSize: PAGE_SIZE,
    worktype: "ETAX5",
    orgdiv: "01",
    fdate: new Date(),
    tdate: new Date(),
    location: "01",
    taxyy: new Date(),
    gisu: "",
    chasu: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });
  //조회조건 초기값
  const [filters6, setFilters6] = useState<{ [name: string]: any }>({
    pgSize: PAGE_SIZE,
    worktype: "ETAX6",
    orgdiv: "01",
    fdate: new Date(),
    tdate: new Date(),
    location: "01",
    taxyy: new Date(),
    gisu: "",
    chasu: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters2((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters3((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters4((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters5((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters6((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 조회 파라미터로 세팅
  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters2((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters3((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters4((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters5((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters6((prev) => ({
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
  const [mainDataState4, setMainDataState4] = useState<State>({
    sort: [],
  });
  const [mainDataState5, setMainDataState5] = useState<State>({
    sort: [],
  });
  const [mainDataState6, setMainDataState6] = useState<State>({
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

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_B8000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.worktype,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.fdate),
        "@p_todt": convertDateToStr(filters.tdate),
        "@p_taxyy": convertDateToStr(filters.taxyy).substring(0, 4),
        "@p_gisu": filters.gisu,
        "@p_chasu": filters.chasu,
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
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_B8000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.worktype,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.fdate),
        "@p_todt": convertDateToStr(filters.tdate),
        "@p_taxyy": convertDateToStr(filters.taxyy).substring(0, 4),
        "@p_gisu": filters.gisu,
        "@p_chasu": filters.chasu,
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
  const fetchMainGrid3 = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_B8000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.worktype,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.fdate),
        "@p_todt": convertDateToStr(filters.tdate),
        "@p_taxyy": convertDateToStr(filters.taxyy).substring(0, 4),
        "@p_gisu": filters.gisu,
        "@p_chasu": filters.chasu,
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

  //그리드 데이터 조회
  const fetchMainGrid4 = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_B8000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.worktype,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.fdate),
        "@p_todt": convertDateToStr(filters.tdate),
        "@p_taxyy": convertDateToStr(filters.taxyy).substring(0, 4),
        "@p_gisu": filters.gisu,
        "@p_chasu": filters.chasu,
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

      setMainDataResult4((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState4({ [rows[0][DATA_ITEM_KEY4]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters4((prev) => ({
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
  const fetchMainGrid5 = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_B8000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.worktype,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.fdate),
        "@p_todt": convertDateToStr(filters.tdate),
        "@p_taxyy": convertDateToStr(filters.taxyy).substring(0, 4),
        "@p_gisu": filters.gisu,
        "@p_chasu": filters.chasu,
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

      setMainDataResult5((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState5({ [rows[0][DATA_ITEM_KEY5]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters5((prev) => ({
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
  const fetchMainGrid6 = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_B8000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.worktype,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.fdate),
        "@p_todt": convertDateToStr(filters.tdate),
        "@p_taxyy": convertDateToStr(filters.taxyy).substring(0, 4),
        "@p_gisu": filters.gisu,
        "@p_chasu": filters.chasu,
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

      setMainDataResult6((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState6({ [rows[0][DATA_ITEM_KEY6]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters6((prev) => ({
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

      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters2.isSearch && permissions !== null) {
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
    if (filters3.isSearch && permissions !== null) {
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters4.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters4);
      setFilters4((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록

      fetchMainGrid4(deepCopiedFilters);
    }
  }, [filters4]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters5.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters5);
      setFilters5((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록

      fetchMainGrid5(deepCopiedFilters);
    }
  }, [filters5]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters6.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters6);
      setFilters6((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록

      fetchMainGrid6(deepCopiedFilters);
    }
  }, [filters6]);

  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setPage2(initialPageState);
    setPage3(initialPageState);
    setPage4(initialPageState);
    setPage5(initialPageState);
    setPage6(initialPageState);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
    setMainDataResult3(process([], mainDataState3));
    setMainDataResult4(process([], mainDataState4));
    setMainDataResult5(process([], mainDataState5));
    setMainDataResult6(process([], mainDataState6));
  };

  const search = () => {
    try {
      resetAllGrid();
      if (tabSelected == 0) {
        setFilters((prev) => ({
          ...prev,
          worktype: "ETAX",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters2((prev) => ({
          ...prev,
          worktype: "ETAX2",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters3((prev) => ({
          ...prev,
          worktype: "ETAX3",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters4((prev) => ({
          ...prev,
          worktype: "ETAX4",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters5((prev) => ({
          ...prev,
          worktype: "ETAX5",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters6((prev) => ({
          ...prev,
          worktype: "ETAX6",
          pgNum: 1,
          isSearch: true,
        }));
      } else if (tabSelected == 1) {
        setFilters((prev) => ({
          ...prev,
          worktype: "CD",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters2((prev) => ({
          ...prev,
          worktype: "CD2",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters3((prev) => ({
          ...prev,
          worktype: "CD3",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters4((prev) => ({
          ...prev,
          worktype: "CD4",
          pgNum: 1,
          isSearch: true,
        }));
      } else if (tabSelected == 2) {
        setFilters((prev) => ({
          ...prev,
          worktype: "TAX",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters2((prev) => ({
          ...prev,
          worktype: "TAX2",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters3((prev) => ({
          ...prev,
          worktype: "TAX3",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters4((prev) => ({
          ...prev,
          worktype: "TAX4",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters5((prev) => ({
          ...prev,
          worktype: "TAX5",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters6((prev) => ({
          ...prev,
          worktype: "TAX6",
          pgNum: 1,
          isSearch: true,
        }));
      } else if (tabSelected == 3) {
        setFilters((prev) => ({
          ...prev,
          worktype: "OUT_TAX",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters2((prev) => ({
          ...prev,
          worktype: "OUT_TAX2",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters3((prev) => ({
          ...prev,
          worktype: "OUT_TAX3",
          pgNum: 1,
          isSearch: true,
        }));
      }
    } catch (e) {
      alert(e);
    }
  };

  const handleSelectTab = (e: any) => {
    resetAllGrid();
    if (e.selected == 0) {
      setFilters((prev) => ({
        ...prev,
        worktype: "ETAX",
        pgNum: 1,
        isSearch: true,
      }));
      setFilters2((prev) => ({
        ...prev,
        worktype: "ETAX2",
        pgNum: 1,
        isSearch: true,
      }));
      setFilters3((prev) => ({
        ...prev,
        worktype: "ETAX3",
        pgNum: 1,
        isSearch: true,
      }));
      setFilters4((prev) => ({
        ...prev,
        worktype: "ETAX4",
        pgNum: 1,
        isSearch: true,
      }));
      setFilters5((prev) => ({
        ...prev,
        worktype: "ETAX5",
        pgNum: 1,
        isSearch: true,
      }));
      setFilters6((prev) => ({
        ...prev,
        worktype: "ETAX6",
        pgNum: 1,
        isSearch: true,
      }));
    } else if (e.selected == 1) {
      setFilters((prev) => ({
        ...prev,
        worktype: "CD",
        pgNum: 1,
        isSearch: true,
      }));
      setFilters2((prev) => ({
        ...prev,
        worktype: "CD2",
        pgNum: 1,
        isSearch: true,
      }));
      setFilters3((prev) => ({
        ...prev,
        worktype: "CD3",
        pgNum: 1,
        isSearch: true,
      }));
      setFilters4((prev) => ({
        ...prev,
        worktype: "CD4",
        pgNum: 1,
        isSearch: true,
      }));
    } else if (e.selected == 2) {
      setFilters((prev) => ({
        ...prev,
        worktype: "TAX",
        pgNum: 1,
        isSearch: true,
      }));
      setFilters2((prev) => ({
        ...prev,
        worktype: "TAX2",
        pgNum: 1,
        isSearch: true,
      }));
      setFilters3((prev) => ({
        ...prev,
        worktype: "TAX3",
        pgNum: 1,
        isSearch: true,
      }));
      setFilters4((prev) => ({
        ...prev,
        worktype: "TAX4",
        pgNum: 1,
        isSearch: true,
      }));
      setFilters5((prev) => ({
        ...prev,
        worktype: "TAX5",
        pgNum: 1,
        isSearch: true,
      }));
      setFilters6((prev) => ({
        ...prev,
        worktype: "TAX6",
        pgNum: 1,
        isSearch: true,
      }));
    } else if (e.selected == 3) {
      setFilters((prev) => ({
        ...prev,
        worktype: "OUT_TAX",
        pgNum: 1,
        isSearch: true,
      }));
      setFilters2((prev) => ({
        ...prev,
        worktype: "OUT_TAX2",
        pgNum: 1,
        isSearch: true,
      }));
      setFilters3((prev) => ({
        ...prev,
        worktype: "OUT_TAX3",
        pgNum: 1,
        isSearch: true,
      }));
    }
    setTabSelected(e.selected);
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

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
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

  const onSelectionChange4 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState4,
      dataItemKey: DATA_ITEM_KEY4,
    });

    setSelectedState4(newSelectedState);
  };

  const onSelectionChange5 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState5,
      dataItemKey: DATA_ITEM_KEY5,
    });

    setSelectedState5(newSelectedState);
  };

  const onSelectionChange6 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState6,
      dataItemKey: DATA_ITEM_KEY6,
    });

    setSelectedState6(newSelectedState);
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

  const mainTotalFooterCell4 = (props: GridFooterCellProps) => {
    var parts = mainDataResult4.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const mainTotalFooterCell5 = (props: GridFooterCellProps) => {
    var parts = mainDataResult5.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const mainTotalFooterCell6 = (props: GridFooterCellProps) => {
    var parts = mainDataResult6.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const gridSumQtyFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );
    if (sum != undefined) {
      var parts = sum.toString().split(".");

      return parts[0] != "NaN" ? (
        <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
          {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        </td>
      ) : (
        <td></td>
      );
    } else {
      return <td></td>;
    }
  };

  const gridSumQtyFooterCell2 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult2.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );
    if (sum != undefined) {
      var parts = sum.toString().split(".");

      return parts[0] != "NaN" ? (
        <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
          {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        </td>
      ) : (
        <td></td>
      );
    } else {
      return <td></td>;
    }
  };

  const gridSumQtyFooterCell3 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult3.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );
    if (sum != undefined) {
      var parts = sum.toString().split(".");

      return parts[0] != "NaN" ? (
        <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
          {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        </td>
      ) : (
        <td></td>
      );
    } else {
      return <td></td>;
    }
  };

  const gridSumQtyFooterCell4 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult4.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );
    if (sum != undefined) {
      var parts = sum.toString().split(".");

      return parts[0] != "NaN" ? (
        <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
          {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        </td>
      ) : (
        <td></td>
      );
    } else {
      return <td></td>;
    }
  };

  const gridSumQtyFooterCell5 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult5.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );
    if (sum != undefined) {
      var parts = sum.toString().split(".");

      return parts[0] != "NaN" ? (
        <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
          {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        </td>
      ) : (
        <td></td>
      );
    } else {
      return <td></td>;
    }
  };

  const gridSumQtyFooterCell6 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult6.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );
    if (sum != undefined) {
      var parts = sum.toString().split(".");

      return parts[0] != "NaN" ? (
        <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
          {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        </td>
      ) : (
        <td></td>
      );
    } else {
      return <td></td>;
    }
  };

  const createColumn = () => {
    const array = [];
    array.push(
      <GridColumn
        field="location"
        title="사업장"
        width="120px"
        footerCell={mainTotalFooterCell3}
      />
    );
    array.push(
      <GridColumn
        field="cumaesu"
        title="거래처수"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    array.push(
      <GridColumn
        field="maesu"
        title="매수"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    array.push(
      <GridColumn
        field="amt"
        title="금액"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    array.push(
      <GridColumn
        field="taxamt"
        title="부가세액"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    return array;
  };

  const createColumn2 = () => {
    const array = [];
    array.push(
      <GridColumn
        field="cumaesu1"
        title="거래처수"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    array.push(
      <GridColumn
        field="maesu1"
        title="매수"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    array.push(
      <GridColumn
        field="amt1"
        title="금액"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    array.push(
      <GridColumn
        field="taxamt1"
        title="부가세액"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    return array;
  };

  const createColumn3 = () => {
    const array = [];
    array.push(
      <GridColumn
        field="cumaesu2"
        title="거래처수"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    array.push(
      <GridColumn
        field="maesu2"
        title="매수"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    array.push(
      <GridColumn
        field="amt2"
        title="금액"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    array.push(
      <GridColumn
        field="taxamt2"
        title="부가세액"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell3}
      />
    );
    return array;
  };

  const createColumn4 = () => {
    const array = [];
    array.push(
      <GridColumn
        field="location"
        title="사업장"
        width="120px"
        footerCell={mainTotalFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field="cumaesu"
        title="거래처수"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field="maesu"
        title="매수"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field="amt"
        title="금액"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field="taxamt"
        title="부가세액"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    return array;
  };

  const createColumn5 = () => {
    const array = [];
    array.push(
      <GridColumn
        field="cumaesu1"
        title="거래처수"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field="maesu1"
        title="매수"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field="amt1"
        title="금액"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field="taxamt1"
        title="부가세액"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    return array;
  };

  const createColumn6 = () => {
    const array = [];
    array.push(
      <GridColumn
        field="cumaesu2"
        title="거래처수"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field="maesu2"
        title="매수"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field="amt2"
        title="금액"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    array.push(
      <GridColumn
        field="taxamt2"
        title="부가세액"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell4}
      />
    );
    return array;
  };

  const createColumn7 = () => {
    const array = [];
    array.push(
      <GridColumn
        field="location"
        title="사업장"
        width="120px"
        footerCell={mainTotalFooterCell5}
      />
    );
    array.push(
      <GridColumn
        field="cumaesu"
        title="거래처수"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell5}
      />
    );
    array.push(
      <GridColumn
        field="maesu"
        title="매수"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell5}
      />
    );
    array.push(
      <GridColumn
        field="amt"
        title="금액"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell5}
      />
    );
    array.push(
      <GridColumn
        field="taxamt"
        title="부가세액"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell5}
      />
    );
    return array;
  };

  const createColumn8 = () => {
    const array = [];
    array.push(
      <GridColumn
        field="cumaesu1"
        title="거래처수"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell5}
      />
    );
    array.push(
      <GridColumn
        field="maesu1"
        title="매수"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell5}
      />
    );
    array.push(
      <GridColumn
        field="amt1"
        title="금액"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell5}
      />
    );
    array.push(
      <GridColumn
        field="taxamt1"
        title="부가세액"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell5}
      />
    );
    return array;
  };

  const createColumn9 = () => {
    const array = [];
    array.push(
      <GridColumn
        field="cumaesu2"
        title="거래처수"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell5}
      />
    );
    array.push(
      <GridColumn
        field="maesu2"
        title="매수"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell5}
      />
    );
    array.push(
      <GridColumn
        field="amt2"
        title="금액"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell5}
      />
    );
    array.push(
      <GridColumn
        field="taxamt2"
        title="부가세액"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell5}
      />
    );
    return array;
  };

  const createColumn10 = () => {
    const array = [];
    array.push(
      <GridColumn
        field="location"
        title="사업장"
        width="120px"
        footerCell={mainTotalFooterCell6}
      />
    );
    array.push(
      <GridColumn
        field="cumaesu"
        title="거래처수"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell6}
      />
    );
    array.push(
      <GridColumn
        field="maesu"
        title="매수"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell6}
      />
    );
    array.push(
      <GridColumn
        field="amt"
        title="금액"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell6}
      />
    );
    array.push(
      <GridColumn
        field="taxamt"
        title="부가세액"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell6}
      />
    );
    return array;
  };

  const createColumn11 = () => {
    const array = [];
    array.push(
      <GridColumn
        field="cumaesu1"
        title="거래처수"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell6}
      />
    );
    array.push(
      <GridColumn
        field="maesu1"
        title="매수"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell6}
      />
    );
    array.push(
      <GridColumn
        field="amt1"
        title="금액"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell6}
      />
    );
    array.push(
      <GridColumn
        field="taxamt1"
        title="부가세액"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell6}
      />
    );
    return array;
  };

  const createColumn12 = () => {
    const array = [];
    array.push(
      <GridColumn
        field="cumaesu2"
        title="거래처수"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell6}
      />
    );
    array.push(
      <GridColumn
        field="maesu2"
        title="매수"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell6}
      />
    );
    array.push(
      <GridColumn
        field="amt2"
        title="금액"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell6}
      />
    );
    array.push(
      <GridColumn
        field="taxamt2"
        title="부가세액"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell6}
      />
    );
    return array;
  };

  const createColumn13 = () => {
    const array = [];
    array.push(
      <GridColumn
        field="cnt"
        title="건수"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
      />
    );
    array.push(
      <GridColumn
        field="mngamt"
        title="외화금액"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
      />
    );
    array.push(
      <GridColumn
        field="slipamt"
        title="원화금액"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
      />
    );
    return array;
  };

  const createColumn14 = () => {
    const array = [];
    array.push(
      <GridColumn
        field="cnt1"
        title="건수"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
      />
    );
    array.push(
      <GridColumn
        field="mngamt1"
        title="외화금액"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
      />
    );
    array.push(
      <GridColumn
        field="slipamt1"
        title="원화금액"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
      />
    );
    return array;
  };

  const createColumn15 = () => {
    const array = [];
    array.push(
      <GridColumn
        field="cnt2"
        title="건수"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
      />
    );
    array.push(
      <GridColumn
        field="mngamt2"
        title="외화금액"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
      />
    );
    array.push(
      <GridColumn
        field="slipamt2"
        title="원화금액"
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
      />
    );
    return array;
  };

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters2((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters3((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters4((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters5((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters6((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
      <TitleContainer>
        <Title>홈택스관리</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="AC_B8000W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <TabStrip
        style={{ width: "100%" }}
        selected={tabSelected}
        onSelect={handleSelectTab}
      >
        <TabStripTab title="세금계산서 홈택스">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>처리일자</th>
                  <td>
                    <CommonDateRangePicker
                      value={{
                        start: filters.fdate,
                        end: filters.tdate,
                      }}
                      onChange={(e: { value: { start: any; end: any } }) => {
                        setFilters((prev) => ({
                          ...prev,
                          fdate: e.value.start,
                          tdate: e.value.end,
                        }));
                        setFilters2((prev) => ({
                          ...prev,
                          fdate: e.value.start,
                          tdate: e.value.end,
                        }));
                        setFilters3((prev) => ({
                          ...prev,
                          fdate: e.value.start,
                          tdate: e.value.end,
                        }));
                        setFilters4((prev) => ({
                          ...prev,
                          fdate: e.value.start,
                          tdate: e.value.end,
                        }));
                        setFilters5((prev) => ({
                          ...prev,
                          fdate: e.value.start,
                          tdate: e.value.end,
                        }));
                        setFilters6((prev) => ({
                          ...prev,
                          fdate: e.value.start,
                          tdate: e.value.end,
                        }));
                      }}
                    />
                  </td>
                  <th>본사</th>
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
              </tbody>
            </FilterBox>
          </FilterContainer>
          <GridContainerWrap>
            <GridContainer width="50%">
              <GridTitleContainer>
                <GridTitle>매출표제일반(개인 제외)</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: "25vh" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    location: locationListData.find(
                      (item: any) => item.sub_code === row.location
                    )?.code_name,
                    compclass: compclassListData.find(
                      (item: any) => item.sub_code === row.compclass
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
                            numberField.includes(item.fieldName)
                              ? NumberCell
                              : undefined
                          }
                          footerCell={
                            item.sortOrder === 1
                              ? mainTotalFooterCell
                              : numberField.includes(item.fieldName)
                              ? gridSumQtyFooterCell
                              : undefined
                          }
                        />
                      )
                  )}
              </Grid>
            </GridContainer>
            <GridContainer width={`calc(50% - ${GAP}px)`}>
              <GridTitleContainer>
                <GridTitle>매입표제일반(개인 제외)</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: "25vh" }}
                data={process(
                  mainDataResult2.data.map((row) => ({
                    ...row,
                    location: locationListData.find(
                      (item: any) => item.sub_code === row.location
                    )?.code_name,
                    compclass: compclassListData.find(
                      (item: any) => item.sub_code === row.compclass
                    )?.code_name,
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
                            numberField.includes(item.fieldName)
                              ? NumberCell
                              : undefined
                          }
                          footerCell={
                            item.sortOrder === 1
                              ? mainTotalFooterCell2
                              : numberField.includes(item.fieldName)
                              ? gridSumQtyFooterCell2
                              : undefined
                          }
                        />
                      )
                  )}
              </Grid>
            </GridContainer>
          </GridContainerWrap>
          <GridContainerWrap>
            <GridContainer width="50%">
              <GridTitleContainer>
                <GridTitle>매출합계일반(개인 포함)</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: "25vh" }}
                data={process(
                  mainDataResult3.data.map((row) => ({
                    ...row,
                    location: locationListData.find(
                      (item: any) => item.sub_code === row.location
                    )?.code_name,
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
              >
                <GridColumn title="합계분">{createColumn()}</GridColumn>
                <GridColumn title="사업자등록번호 발행분">
                  {createColumn2()}
                </GridColumn>
                <GridColumn title="주민등록번호 발행분">
                  {createColumn3()}
                </GridColumn>
              </Grid>
            </GridContainer>
            <GridContainer width={`calc(50% - ${GAP}px)`}>
              <GridTitleContainer>
                <GridTitle>매입합계일반(개인 포함)</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: "25vh" }}
                data={process(
                  mainDataResult4.data.map((row) => ({
                    ...row,
                    location: locationListData.find(
                      (item: any) => item.sub_code === row.location
                    )?.code_name,
                    [SELECTED_FIELD]: selectedState4[idGetter4(row)],
                  })),
                  mainDataState4
                )}
                {...mainDataState4}
                onDataStateChange={onMainDataStateChange4}
                //선택 기능
                dataItemKey={DATA_ITEM_KEY4}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onSelectionChange4}
                //스크롤 조회 기능
                fixedScroll={true}
                total={mainDataResult4.total}
                skip={page4.skip}
                take={page4.take}
                pageable={true}
                onPageChange={pageChange4}
                //원하는 행 위치로 스크롤 기능
                ref={gridRef4}
                rowHeight={30}
                //정렬기능
                sortable={true}
                onSortChange={onMainSortChange4}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              >
                <GridColumn title="합계분">{createColumn4()}</GridColumn>
                <GridColumn title="사업자등록번호 발행분">
                  {createColumn5()}
                </GridColumn>
                <GridColumn title="주민등록번호 발행분">
                  {createColumn6()}
                </GridColumn>
              </Grid>
            </GridContainer>
          </GridContainerWrap>
          <GridContainerWrap>
            <GridContainer width="50%">
              <GridTitleContainer>
                <GridTitle>매출합계ETAX(개인 포함)</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: "25vh" }}
                data={process(
                  mainDataResult5.data.map((row) => ({
                    ...row,
                    location: locationListData.find(
                      (item: any) => item.sub_code === row.location
                    )?.code_name,
                    [SELECTED_FIELD]: selectedState5[idGetter5(row)],
                  })),
                  mainDataState5
                )}
                {...mainDataState5}
                onDataStateChange={onMainDataStateChange5}
                //선택 기능
                dataItemKey={DATA_ITEM_KEY5}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onSelectionChange5}
                //스크롤 조회 기능
                fixedScroll={true}
                total={mainDataResult5.total}
                skip={page5.skip}
                take={page5.take}
                pageable={true}
                onPageChange={pageChange5}
                //원하는 행 위치로 스크롤 기능
                ref={gridRef5}
                rowHeight={30}
                //정렬기능
                sortable={true}
                onSortChange={onMainSortChange5}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              >
                <GridColumn title="합계분">{createColumn7()}</GridColumn>
                <GridColumn title="사업자등록번호 발행분">
                  {createColumn8()}
                </GridColumn>
                <GridColumn title="주민등록번호 발행분">
                  {createColumn9()}
                </GridColumn>
              </Grid>
            </GridContainer>
            <GridContainer width={`calc(50% - ${GAP}px)`}>
              <GridTitleContainer>
                <GridTitle>매입합계ETAX(개인 포함)</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: "25vh" }}
                data={process(
                  mainDataResult6.data.map((row) => ({
                    ...row,
                    location: locationListData.find(
                      (item: any) => item.sub_code === row.location
                    )?.code_name,
                    [SELECTED_FIELD]: selectedState6[idGetter6(row)],
                  })),
                  mainDataState6
                )}
                {...mainDataState6}
                onDataStateChange={onMainDataStateChange6}
                //선택 기능
                dataItemKey={DATA_ITEM_KEY6}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onSelectionChange6}
                //스크롤 조회 기능
                fixedScroll={true}
                total={mainDataResult6.total}
                skip={page6.skip}
                take={page6.take}
                pageable={true}
                onPageChange={pageChange6}
                //원하는 행 위치로 스크롤 기능
                ref={gridRef6}
                rowHeight={30}
                //정렬기능
                sortable={true}
                onSortChange={onMainSortChange6}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              >
                <GridColumn title="합계분">{createColumn10()}</GridColumn>
                <GridColumn title="사업자등록번호 발행분">
                  {createColumn11()}
                </GridColumn>
                <GridColumn title="주민등록번호 발행분">
                  {createColumn12()}
                </GridColumn>
              </Grid>
            </GridContainer>
          </GridContainerWrap>
        </TabStripTab>
        <TabStripTab title="신용카드 홈택스">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>처리일자</th>
                  <td>
                    <CommonDateRangePicker
                      value={{
                        start: filters.fdate,
                        end: filters.tdate,
                      }}
                      onChange={(e: { value: { start: any; end: any } }) => {
                        setFilters((prev) => ({
                          ...prev,
                          fdate: e.value.start,
                          tdate: e.value.end,
                        }));
                        setFilters2((prev) => ({
                          ...prev,
                          fdate: e.value.start,
                          tdate: e.value.end,
                        }));
                        setFilters3((prev) => ({
                          ...prev,
                          fdate: e.value.start,
                          tdate: e.value.end,
                        }));
                        setFilters4((prev) => ({
                          ...prev,
                          fdate: e.value.start,
                          tdate: e.value.end,
                        }));
                        setFilters5((prev) => ({
                          ...prev,
                          fdate: e.value.start,
                          tdate: e.value.end,
                        }));
                        setFilters6((prev) => ({
                          ...prev,
                          fdate: e.value.start,
                          tdate: e.value.end,
                        }));
                      }}
                    />
                  </td>
                  <th>본사</th>
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
              </tbody>
            </FilterBox>
          </FilterContainer>
          <GridContainerWrap>
            <GridContainer width="50%">
              <GridTitleContainer>
                <GridTitle>신용, 직불카드(개인 제외)</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: "84.5vh" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    location: locationListData.find(
                      (item: any) => item.sub_code === row.location
                    )?.code_name,
                    compclass: compclassListData.find(
                      (item: any) => item.sub_code === row.compclass
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
                            numberField.includes(item.fieldName)
                              ? NumberCell
                              : undefined
                          }
                          footerCell={
                            item.sortOrder === 1
                              ? mainTotalFooterCell
                              : numberField.includes(item.fieldName)
                              ? gridSumQtyFooterCell
                              : undefined
                          }
                        />
                      )
                  )}
              </Grid>
            </GridContainer>
            <GridContainer width={`calc(50% - ${GAP}px)`}>
              <GridContainer>
                <GridTitleContainer>
                  <GridTitle>신용카드매입합계자료</GridTitle>
                </GridTitleContainer>
                <Grid
                  style={{ height: "25vh" }}
                  data={process(
                    mainDataResult2.data.map((row) => ({
                      ...row,
                      location: locationListData.find(
                        (item: any) => item.sub_code === row.location
                      )?.code_name,
                      compclass: compclassListData.find(
                        (item: any) => item.sub_code === row.compclass
                      )?.code_name,
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
                              numberField.includes(item.fieldName)
                                ? NumberCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 1
                                ? mainTotalFooterCell
                                : numberField.includes(item.fieldName)
                                ? gridSumQtyFooterCell
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </GridContainer>
              <GridContainer>
                <GridTitleContainer>
                  <GridTitle>신용, 직불카드 외</GridTitle>
                </GridTitleContainer>
                <Grid
                  style={{ height: "25vh" }}
                  data={process(
                    mainDataResult3.data.map((row) => ({
                      ...row,
                      location: locationListData.find(
                        (item: any) => item.sub_code === row.location
                      )?.code_name,
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
                              numberField.includes(item.fieldName)
                                ? NumberCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 0
                                ? mainTotalFooterCell
                                : numberField.includes(item.fieldName)
                                ? gridSumQtyFooterCell
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </GridContainer>
              <GridContainer>
                <GridTitleContainer>
                  <GridTitle>신용카드매입합계자료(개인)</GridTitle>
                </GridTitleContainer>
                <Grid
                  style={{ height: "25vh" }}
                  data={process(
                    mainDataResult4.data.map((row) => ({
                      ...row,
                      location: locationListData.find(
                        (item: any) => item.sub_code === row.location
                      )?.code_name,
                      [SELECTED_FIELD]: selectedState4[idGetter4(row)],
                    })),
                    mainDataState4
                  )}
                  {...mainDataState4}
                  onDataStateChange={onMainDataStateChange4}
                  //선택 기능
                  dataItemKey={DATA_ITEM_KEY4}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange4}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={mainDataResult4.total}
                  skip={page4.skip}
                  take={page4.take}
                  pageable={true}
                  onPageChange={pageChange4}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef4}
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
                              numberField.includes(item.fieldName)
                                ? NumberCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 0
                                ? mainTotalFooterCell
                                : numberField.includes(item.fieldName)
                                ? gridSumQtyFooterCell
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </GridContainer>
            </GridContainer>
          </GridContainerWrap>
        </TabStripTab>
        <TabStripTab title="계산서 홈택스">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>처리일자</th>
                  <td>
                    <CommonDateRangePicker
                      value={{
                        start: filters.fdate,
                        end: filters.tdate,
                      }}
                      onChange={(e: { value: { start: any; end: any } }) => {
                        setFilters((prev) => ({
                          ...prev,
                          fdate: e.value.start,
                          tdate: e.value.end,
                        }));
                        setFilters2((prev) => ({
                          ...prev,
                          fdate: e.value.start,
                          tdate: e.value.end,
                        }));
                        setFilters3((prev) => ({
                          ...prev,
                          fdate: e.value.start,
                          tdate: e.value.end,
                        }));
                        setFilters4((prev) => ({
                          ...prev,
                          fdate: e.value.start,
                          tdate: e.value.end,
                        }));
                        setFilters5((prev) => ({
                          ...prev,
                          fdate: e.value.start,
                          tdate: e.value.end,
                        }));
                        setFilters6((prev) => ({
                          ...prev,
                          fdate: e.value.start,
                          tdate: e.value.end,
                        }));
                      }}
                    />
                  </td>
                  <th>본사</th>
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
              </tbody>
            </FilterBox>
          </FilterContainer>
          <GridContainerWrap>
            <GridContainer width="25%">
              <GridContainer>
                <GridTitleContainer>
                  <GridTitle>매출집계자료(전자계산서 외)</GridTitle>
                </GridTitleContainer>
                <Grid
                  style={{ height: "35vh" }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
                      location: locationListData.find(
                        (item: any) => item.sub_code === row.location
                      )?.code_name,
                      compclass: compclassListData.find(
                        (item: any) => item.sub_code === row.compclass
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
                              numberField.includes(item.fieldName)
                                ? NumberCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 0
                                ? mainTotalFooterCell
                                : numberField.includes(item.fieldName)
                                ? gridSumQtyFooterCell
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </GridContainer>
              <GridContainer>
                <GridTitleContainer>
                  <GridTitle>매출집계자료(전자계산서분)</GridTitle>
                </GridTitleContainer>
                <Grid
                  style={{ height: "45vh" }}
                  data={process(
                    mainDataResult2.data.map((row) => ({
                      ...row,
                      location: locationListData.find(
                        (item: any) => item.sub_code === row.location
                      )?.code_name,
                      compclass: compclassListData.find(
                        (item: any) => item.sub_code === row.compclass
                      )?.code_name,
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
                              numberField.includes(item.fieldName)
                                ? NumberCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 0
                                ? mainTotalFooterCell2
                                : numberField.includes(item.fieldName)
                                ? gridSumQtyFooterCell2
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </GridContainer>
            </GridContainer>
            <GridContainer width={`calc(25% - ${GAP}px)`}>
              <GridTitleContainer>
                <GridTitle>매출명세자료(전자계산서 외)</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: "84.5vh" }}
                data={process(
                  mainDataResult3.data.map((row) => ({
                    ...row,
                    location: locationListData.find(
                      (item: any) => item.sub_code === row.location
                    )?.code_name,
                    bizdiv: bizdivListData.find(
                      (item: any) => item.sub_code === row.bizdiv
                    )?.code_name,
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
              >
                {customOptionData !== null &&
                  customOptionData.menuCustomColumnOptions["grdList9"].map(
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
                              : undefined
                          }
                          footerCell={
                            item.sortOrder === 0
                              ? mainTotalFooterCell3
                              : numberField.includes(item.fieldName)
                              ? gridSumQtyFooterCell3
                              : undefined
                          }
                        />
                      )
                  )}
              </Grid>
            </GridContainer>
            <GridContainer width={`calc(25% - ${GAP}px)`}>
              <GridContainer>
                <GridTitleContainer>
                  <GridTitle>매입집계자료(전자계산서 외)</GridTitle>
                </GridTitleContainer>
                <Grid
                  style={{ height: "35vh" }}
                  data={process(
                    mainDataResult4.data.map((row) => ({
                      ...row,
                      location: locationListData.find(
                        (item: any) => item.sub_code === row.location
                      )?.code_name,
                      [SELECTED_FIELD]: selectedState4[idGetter4(row)],
                    })),
                    mainDataState4
                  )}
                  {...mainDataState4}
                  onDataStateChange={onMainDataStateChange4}
                  //선택 기능
                  dataItemKey={DATA_ITEM_KEY4}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange4}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={mainDataResult4.total}
                  skip={page4.skip}
                  take={page4.take}
                  pageable={true}
                  onPageChange={pageChange4}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef4}
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
                    customOptionData.menuCustomColumnOptions["grdList10"].map(
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
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 0
                                ? mainTotalFooterCell4
                                : numberField.includes(item.fieldName)
                                ? gridSumQtyFooterCell4
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </GridContainer>
              <GridContainer>
                <GridTitleContainer>
                  <GridTitle>매입집계자료(전자계산서분)</GridTitle>
                </GridTitleContainer>
                <Grid
                  style={{ height: "45vh" }}
                  data={process(
                    mainDataResult5.data.map((row) => ({
                      ...row,
                      location: locationListData.find(
                        (item: any) => item.sub_code === row.location
                      )?.code_name,
                      [SELECTED_FIELD]: selectedState5[idGetter5(row)],
                    })),
                    mainDataState5
                  )}
                  {...mainDataState5}
                  onDataStateChange={onMainDataStateChange5}
                  //선택 기능
                  dataItemKey={DATA_ITEM_KEY5}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange5}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={mainDataResult5.total}
                  skip={page5.skip}
                  take={page5.take}
                  pageable={true}
                  onPageChange={pageChange5}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef5}
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
                    customOptionData.menuCustomColumnOptions["grdList11"].map(
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
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 0
                                ? mainTotalFooterCell5
                                : numberField.includes(item.fieldName)
                                ? gridSumQtyFooterCell5
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </GridContainer>
            </GridContainer>
            <GridContainer width={`calc(25% - ${GAP}px)`}>
              <GridTitleContainer>
                <GridTitle>매입명세자료(전자계산서 외)</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: "84.5vh" }}
                data={process(
                  mainDataResult6.data.map((row) => ({
                    ...row,
                    location: locationListData.find(
                      (item: any) => item.sub_code === row.location
                    )?.code_name,
                    [SELECTED_FIELD]: selectedState6[idGetter6(row)],
                  })),
                  mainDataState6
                )}
                {...mainDataState6}
                onDataStateChange={onMainDataStateChange6}
                //선택 기능
                dataItemKey={DATA_ITEM_KEY6}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onSelectionChange6}
                //스크롤 조회 기능
                fixedScroll={true}
                total={mainDataResult6.total}
                skip={page6.skip}
                take={page6.take}
                pageable={true}
                onPageChange={pageChange6}
                //원하는 행 위치로 스크롤 기능
                ref={gridRef6}
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
                  customOptionData.menuCustomColumnOptions["grdList12"].map(
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
                              : undefined
                          }
                          footerCell={
                            item.sortOrder === 0
                              ? mainTotalFooterCell6
                              : numberField.includes(item.fieldName)
                              ? gridSumQtyFooterCell6
                              : undefined
                          }
                        />
                      )
                  )}
              </Grid>
            </GridContainer>
          </GridContainerWrap>
        </TabStripTab>
        <TabStripTab title="수출실적 홈택스">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>기준년도</th>
                  <td>
                    <DatePicker
                      name="taxyy"
                      format="yyyy"
                      value={filters.taxyy}
                      onChange={filterInputChange}
                      placeholder=""
                      calendar={YearCalendar}
                    />
                  </td>
                  <th>본사</th>
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
                  <th>기수</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="gisu"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                  <th>차수</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="chasu"
                        value={filters.chasu}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                        textField="name"
                        valueField="code"
                      />
                    )}
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <GridContainer>
            <GridTitleContainer>
              <GridTitle>합계</GridTitle>
            </GridTitleContainer>
            <Grid
              style={{ height: "25vh" }}
              data={process(
                mainDataResult.data.map((row) => ({
                  ...row,
                  location: locationListData.find(
                    (item: any) => item.sub_code === row.location
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
              <GridColumn
                field="location"
                title="사업장"
                width="120px"
                footerCell={mainTotalFooterCell}
              />
              <GridColumn title="합계">{createColumn13()}</GridColumn>
              <GridColumn title="수출하는 재화">{createColumn14()}</GridColumn>
              <GridColumn title="기타 영세율 적용">
                {createColumn15()}
              </GridColumn>
            </Grid>
          </GridContainer>
          <GridContainer>
            <GridTitleContainer>
              <GridTitle>기타영세율적용</GridTitle>
            </GridTitleContainer>
            <Grid
              style={{ height: "25vh" }}
              data={process(
                mainDataResult2.data.map((row) => ({
                  ...row,
                  location: locationListData.find(
                    (item: any) => item.sub_code === row.location
                  )?.code_name,
                  mngdata3: mngdata3ListData.find(
                    (item: any) => item.sub_code === row.mngdata3
                  )?.code_name,
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
            >
              {customOptionData !== null &&
                customOptionData.menuCustomColumnOptions["grdList13"].map(
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
                            : dateField.includes(item.fieldName)
                            ? DateCell
                            : undefined
                        }
                        footerCell={
                          item.sortOrder === 0
                            ? mainTotalFooterCell2
                            : numberField.includes(item.fieldName)
                            ? gridSumQtyFooterCell2
                            : undefined
                        }
                      />
                    )
                )}
            </Grid>
          </GridContainer>
          <GridContainer>
            <GridTitleContainer>
              <GridTitle>수출하는 재화</GridTitle>
            </GridTitleContainer>
            <Grid
              style={{ height: "25vh" }}
              data={process(
                mainDataResult3.data.map((row) => ({
                  ...row,
                  location: locationListData.find(
                    (item: any) => item.sub_code === row.location
                  )?.code_name,
                  mngdata3: mngdata3ListData.find(
                    (item: any) => item.sub_code === row.mngdata3
                  )?.code_name,
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
            >
              {customOptionData !== null &&
                customOptionData.menuCustomColumnOptions["grdList14"].map(
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
                            : dateField.includes(item.fieldName)
                            ? DateCell
                            : undefined
                        }
                        footerCell={
                          item.sortOrder === 0
                            ? mainTotalFooterCell3
                            : numberField.includes(item.fieldName)
                            ? gridSumQtyFooterCell3
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

export default AC_B8000W;
