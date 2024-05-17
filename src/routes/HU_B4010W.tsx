import {
  Card,
  CardHeader,
  Grid as GridMui,
  Typography,
  styled,
} from "@mui/material";
import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  Chart,
  ChartCategoryAxis,
  ChartCategoryAxisItem,
  ChartSeries,
  ChartSeriesItem,
  ChartSeriesItemTooltip,
  ChartTooltip,
  ChartValueAxis,
  ChartValueAxisItem,
} from "@progress/kendo-react-charts";
import { getter } from "@progress/kendo-react-common";
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
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
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
import MonthCalendar from "../components/Calendars/MonthCalendar";
import DateCell from "../components/Cells/DateCell";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  dateformat2,
  findMessage,
  getQueryFromBizComponent,
  handleKeyPressSearch,
  numberWithCommas,
  setDefaultDate,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import { useApi } from "../hooks/api";
import { heightstate, isLoading } from "../store/atoms";
import { gridList } from "../store/columns/HU_B4010W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
var index = 0;

const dateField = ["baddt", "reqdt"];

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
const DATA_ITEM_KEY4 = "num";
const DATA_ITEM_KEY5 = "num";
const DATA_ITEM_KEY6 = "num";
let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;
let targetRowIndex3: null | number = null;
let targetRowIndex4: null | number = null;
let targetRowIndex5: null | number = null;

const HU_B4010W: React.FC = () => {
  const [swiper, setSwiper] = useState<SwiperCore>();
  let deviceWidth = document.documentElement.clientWidth;
  const [deviceHeight, setDeviceHeight] = useRecoilState(heightstate);
  let isMobile = deviceWidth <= 1200;
  var height = 0;
  var height2 = 0;
  var height3 = 0;
  var height4 = 0;
  var height5 = 0;
  var height6 = 0;
  var container = document.querySelector(".ButtonContainer");
  var container2 = document.querySelector(".ButtonContainer2");
  var container3 = document.querySelector(".k-tabstrip-items-wrapper");
  var container4 = document.querySelector(".ButtonContainer4");
  var container5 = document.querySelector(".ButtonContainer5");
  var container6 = document.querySelector(".ButtonContainer6");

  if (container?.clientHeight != undefined) {
    height = container == undefined ? 0 : container.clientHeight;
  }
  if (container2?.clientHeight != undefined) {
    height2 = container2 == undefined ? 0 : container2.clientHeight;
  }
  if (container3?.clientHeight != undefined) {
    height3 = container3 == undefined ? 0 : container3.clientHeight;
  }
  if (container4?.clientHeight != undefined) {
    height4 = container4 == undefined ? 0 : container4.clientHeight;
  }
  if (container5?.clientHeight != undefined) {
    height5 = container5 == undefined ? 0 : container5.clientHeight;
  }
  if (container6?.clientHeight != undefined) {
    height6 = container6 == undefined ? 0 : container6.clientHeight;
  }
  const setLoading = useSetRecoilState(isLoading);

  const processApi = useApi();
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("HU_B4010W", setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("HU_B4010W", setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        yyyymm: setDefaultDate(customOptionData, "yyyymm"),
      }));
      const year = setDefaultDate(customOptionData, "yyyymm").getFullYear(); // 년
      const month = setDefaultDate(customOptionData, "yyyymm").getMonth(); // 월
      const day = 1; // 일
      setDate(new Date(year, month, day));
      setDate2(new Date(year, month - 1, day));
      setDate3(new Date(year, month - 2, day));
      setDate4(new Date(year, month - 3, day));
      setDate5(new Date(year, month - 4, day));
      setDate6(new Date(year, month - 5, day));
      setDate7(new Date(year, month - 6, day));
      setDate8(new Date(year, month - 7, day));
      setDate9(new Date(year, month - 8, day));
      setDate10(new Date(year, month - 9, day));
      setDate11(new Date(year, month - 10, day));
      setDate12(new Date(year, month - 11, day));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_HU110, L_QC002, L_HU017",
    //수주상태
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [reviewlvl1ListData, setReviewlvl1ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [badcdListData, setBadcdListData] = useState([COM_CODE_DEFAULT_VALUE]);
  const [rnpdivListData, setRnpdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const reviewlvl1QueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_HU110")
      );
      const badcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_QC002")
      );
      const rnpdivQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_HU017")
      );
      fetchQuery(reviewlvl1QueryStr, setReviewlvl1ListData);
      fetchQuery(badcdQueryStr, setBadcdListData);
      fetchQuery(rnpdivQueryStr, setRnpdivListData);
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

    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows;
      setListData(rows);
    }
  }, []);

  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const idGetter4 = getter(DATA_ITEM_KEY4);
  const idGetter5 = getter(DATA_ITEM_KEY5);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const [page4, setPage4] = useState(initialPageState);
  const [page5, setPage5] = useState(initialPageState);

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
  function convertDateLabel(label: any) {
    // 정규 표현식을 사용하여 연도와 월을 추출
    const matches = label.match(/(\d{4})년(\d{1,2})월/);
    if (matches) {
      // 연도의 뒷 두 자리와 월을 추출하여 포맷 변경
      const year = matches[1].slice(2); // 연도의 마지막 두 자리
      const month = matches[2]; // 월
      return `${year}/${month}`;
    }
    return label; // 변환이 필요 없는 경우 원래 라벨 반환
  }

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
  const [allChartDataResult, setAllChartDataResult] = useState({
    arguments: [""],
    series: [""],
    list: [],
  });
  const [allChartDataResult2, setAllChartDataResult2] = useState({
    arguments: [""],
    series: [""],
    list: [],
  });
  const [allChartDataResult3, setAllChartDataResult3] = useState({
    arguments: [""],
    series: [""],
    list: [],
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
  const [tabSelected, setTabSelected] = React.useState(0);
  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
  };

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    worktype: "LIST",
    orgdiv: sessionOrgdiv,
    person: "",
    yyyymm: new Date(),
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [detailFilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    person: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    worktype: "MONTHAVG",
    person: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [filters3, setFilters3] = useState({
    pgSize: PAGE_SIZE,
    worktype: "THATMONTH",
    person: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [filters4, setFilters4] = useState({
    pgSize: PAGE_SIZE,
    worktype: "BAD",
    person: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [filters5, setFilters5] = useState({
    pgSize: PAGE_SIZE,
    worktype: "REWARD",
    person: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [filters6, setFilters6] = useState({
    pgSize: PAGE_SIZE,
    worktype: "COUNT",
    person: "",
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
      procedureName: "P_HU_B4010W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "LIST",
        "@p_orgdiv": filters.orgdiv,
        "@p_person": filters.person,
        "@p_yyyymm": convertDateToStr(filters.yyyymm).substring(0, 6),
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
        setDetailFilters((prev) => ({
          ...prev,
          person: rows[0].prsnnum,
          isSearch: true,
          pgNum: 1,
        }));
        setFilters((prev) => ({
          ...prev,
          person: rows[0].prsnnum,
        }));
        setFilters2((prev) => ({
          ...prev,
          isSearch: true,
          person: rows[0].prsnnum,
          pgNum: 1,
        }));
        setFilters3((prev) => ({
          ...prev,
          isSearch: true,
          person: rows[0].prsnnum,
          pgNum: 1,
        }));
        setFilters4((prev) => ({
          ...prev,
          isSearch: true,
          person: rows[0].prsnnum,
          pgNum: 1,
        }));
        setFilters5((prev) => ({
          ...prev,
          isSearch: true,
          person: rows[0].prsnnum,
          pgNum: 1,
        }));
        setFilters6((prev) => ({
          ...prev,
          isSearch: true,
          person: rows[0].prsnnum,
          pgNum: 1,
        }));
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
  const fetchMainGrid2 = async (detailFilters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_B4010W_Q",
      pageNumber: detailFilters.pgNum,
      pageSize: detailFilters.pgSize,
      parameters: {
        "@p_work_type": "CHART",
        "@p_orgdiv": filters.orgdiv,
        "@p_person": detailFilters.person,
        "@p_yyyymm": convertDateToStr(filters.yyyymm).substring(0, 6),
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[2].TotalRowCount;
      const rows = data.tables[2].Rows;
      const totalRowCnt2 = data.tables[0].TotalRowCount;
      const rows2 = data.tables[0].Rows;
      const totalRowCnt3 = data.tables[1].TotalRowCount;
      const rows3 = data.tables[1].Rows;

      let argument: any[] = [];
      let arguments2: any[] = [];
      let arguments3: any[] = [];
      let series: any[] = [];
      let series2: any[] = [];
      let series3: any[] = [];

      if (rows.length == 0) {
        argument.push("");
        series.push("");
      }
      if (rows2.length == 0) {
        arguments2.push("");
        series2.push("");
      }
      if (rows3.length == 0) {
        arguments3.push("");
        series3.push("");
      }
      rows.forEach((row: any) => {
        if (!argument.includes(row.arguments)) {
          argument.push(row.arguments);
        }
        if (!series.includes(row.series)) {
          series.push(row.series);
        }
      });
      rows2.forEach((row: any) => {
        if (!arguments2.includes(row.arguments)) {
          arguments2.push(row.arguments);
        }
        if (!series2.includes(row.series)) {
          series2.push(row.series);
        }
      });
      rows3.forEach((row: any) => {
        if (!arguments3.includes(row.arguments)) {
          arguments3.push(row.arguments);
        }
        if (!series3.includes(row.series)) {
          series3.push(row.series);
        }
      });
      setAllChartDataResult({
        arguments: argument,
        series: series,
        list: rows,
      });
      setAllChartDataResult2({
        arguments: arguments2,
        series: series2,
        list: rows2,
      });
      setAllChartDataResult3({
        arguments: arguments3,
        series: series3,
        list: rows3,
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setDetailFilters((prev) => ({
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
      procedureName: "P_HU_B4010W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": "MONTHAVG",
        "@p_orgdiv": filters.orgdiv,
        "@p_person": filters2.person,
        "@p_yyyymm": convertDateToStr(filters.yyyymm).substring(0, 6),
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
  const fetchMainGrid4 = async (filters3: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_B4010W_Q",
      pageNumber: filters3.pgNum,
      pageSize: filters3.pgSize,
      parameters: {
        "@p_work_type": "THATMONTH",
        "@p_orgdiv": filters.orgdiv,
        "@p_person": filters3.person,
        "@p_yyyymm": convertDateToStr(filters.yyyymm).substring(0, 6),
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
  const fetchMainGrid5 = async (filters4: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_B4010W_Q",
      pageNumber: filters4.pgNum,
      pageSize: filters4.pgSize,
      parameters: {
        "@p_work_type": "BAD",
        "@p_orgdiv": filters.orgdiv,
        "@p_person": filters4.person,
        "@p_yyyymm": convertDateToStr(filters.yyyymm).substring(0, 6),
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
  const fetchMainGrid6 = async (filters5: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_B4010W_Q",
      pageNumber: filters5.pgNum,
      pageSize: filters5.pgSize,
      parameters: {
        "@p_work_type": "REWARD",
        "@p_orgdiv": filters.orgdiv,
        "@p_person": filters5.person,
        "@p_yyyymm": convertDateToStr(filters.yyyymm).substring(0, 6),
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
  const fetchMainGrid7 = async (filters6: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_B4010W_Q",
      pageNumber: filters6.pgNum,
      pageSize: filters6.pgSize,
      parameters: {
        "@p_work_type": "COUNT",
        "@p_orgdiv": filters.orgdiv,
        "@p_person": filters6.person,
        "@p_yyyymm": convertDateToStr(filters.yyyymm).substring(0, 6),
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
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (detailFilters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailFilters);
      setDetailFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [detailFilters, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters2.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid3(deepCopiedFilters);
    }
  }, [filters2, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters3.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3);
      setFilters3((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid4(deepCopiedFilters);
    }
  }, [filters3, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters4.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters4);
      setFilters4((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid5(deepCopiedFilters);
    }
  }, [filters4, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters5.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters5);
      setFilters5((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid6(deepCopiedFilters);
    }
  }, [filters5, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters6.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters6);
      setFilters6((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid7(deepCopiedFilters);
    }
  }, [filters6, permissions]);

  const search = () => {
    try {
      if (
        convertDateToStr(filters.yyyymm).substring(0, 4) < "1997" ||
        convertDateToStr(filters.yyyymm).substring(6, 8) > "31" ||
        convertDateToStr(filters.yyyymm).substring(6, 8) < "01" ||
        convertDateToStr(filters.yyyymm).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "HU_B4010W_001");
      } else {
        resetAllGrid();
        setFilters((prev) => ({
          ...prev,
          pgNum: 1,
          isSearch: true,
        }));
        setFilters2((prev) => ({
          ...prev,
          pgNum: 1,
          isSearch: true,
        }));
        setFilters3((prev) => ({
          ...prev,
          pgNum: 1,
          isSearch: true,
        }));
        setFilters4((prev) => ({
          ...prev,
          pgNum: 1,
          isSearch: true,
        }));
        setFilters5((prev) => ({
          ...prev,
          pgNum: 1,
          isSearch: true,
        }));
        setFilters6((prev) => ({
          ...prev,
          pgNum: 1,
          isSearch: true,
        }));
        const year = filters.yyyymm.getFullYear(); // 년
        const month = filters.yyyymm.getMonth(); // 월
        const day = 1; // 일
        setDate(new Date(year, month, day));
        setDate2(new Date(year, month - 1, day));
        setDate3(new Date(year, month - 2, day));
        setDate4(new Date(year, month - 3, day));
        setDate5(new Date(year, month - 4, day));
        setDate6(new Date(year, month - 5, day));
        setDate7(new Date(year, month - 6, day));
        setDate8(new Date(year, month - 7, day));
        setDate9(new Date(year, month - 8, day));
        setDate10(new Date(year, month - 9, day));
        setDate11(new Date(year, month - 10, day));
        setDate12(new Date(year, month - 11, day));
        if (swiper) {
          swiper.slideTo(0);
        }
      }
    } catch (e) {
      alert(e);
    }
  };
  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setPage2(initialPageState);
    setPage3(initialPageState);
    setPage4(initialPageState);
    setPage5(initialPageState);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
    setMainDataResult3(process([], mainDataState3));
    setMainDataResult4(process([], mainDataState4));
    setMainDataResult5(process([], mainDataState5));
    setMainDataResult6(process([], mainDataState6));
  };
  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  let _export3: any;
  let _export4: any;
  let _export5: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      const optionsGridTwo = _export2.workbookOptions();
      optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
      optionsGridOne.sheets[0].title = "사원목록";
      optionsGridOne.sheets[1].title = "월별 평균";
      if (tabSelected == 0) {
        const optionsGridThree = _export3.workbookOptions();
        optionsGridOne.sheets[2] = optionsGridThree.sheets[0];
        optionsGridOne.sheets[2].title = "당월 평가내용";
      } else if (tabSelected == 1) {
        const optionsGridFour = _export4.workbookOptions();
        optionsGridOne.sheets[2] = optionsGridFour.sheets[0];
        optionsGridOne.sheets[2].title = "불량내역";
      } else if (tabSelected == 2) {
        const optionsGridFive = _export5.workbookOptions();
        optionsGridOne.sheets[2] = optionsGridFive.sheets[0];
        optionsGridOne.sheets[2].title = "상벌내역";
      }
      _export.save(optionsGridOne);
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
  //그리드 푸터
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
  //그리드 푸터
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
  //그리드 푸터
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
  //그리드 푸터
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

    setDetailFilters((prev) => ({
      ...prev,
      person: selectedRowData.prsnnum,
      pgNum: 1,
      isSearch: true,
    }));
    setFilters2((prev) => ({
      ...prev,
      person: selectedRowData.prsnnum,
      isSearch: true,
      pgNum: 1,
    }));
    setFilters3((prev) => ({
      ...prev,
      person: selectedRowData.prsnnum,
      isSearch: true,
      pgNum: 1,
    }));
    setFilters4((prev) => ({
      ...prev,
      person: selectedRowData.prsnnum,
      isSearch: true,
      pgNum: 1,
    }));
    setFilters5((prev) => ({
      ...prev,
      person: selectedRowData.prsnnum,
      isSearch: true,
      pgNum: 1,
    }));
    setFilters6((prev) => ({
      ...prev,
      person: selectedRowData.prsnnum,
      isSearch: true,
      pgNum: 1,
    }));
    if (swiper && isMobile) {
      swiper.slideTo(1);
      swiper.update();
    }
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
  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState3,
      dataItemKey: DATA_ITEM_KEY3,
    });
    setSelectedState3(newSelectedState);
  };
  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange4 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState4,
      dataItemKey: DATA_ITEM_KEY4,
    });
    setSelectedState4(newSelectedState);
  };
  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange5 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState5,
      dataItemKey: DATA_ITEM_KEY5,
    });
    setSelectedState5(newSelectedState);
  };
  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);
  let gridRef3: any = useRef(null);
  let gridRef4: any = useRef(null);
  let gridRef5: any = useRef(null);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex2 !== null && gridRef2.current) {
      gridRef2.current.scrollIntoView({ rowIndex: targetRowIndex2 });
      targetRowIndex2 = null;
    }
  }, [mainDataResult2]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex3 !== null && gridRef3.current) {
      gridRef3.current.scrollIntoView({ rowIndex: targetRowIndex3 });
      targetRowIndex3 = null;
    }
  }, [mainDataResult3]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex4 !== null && gridRef4.current) {
      gridRef4.current.scrollIntoView({ rowIndex: targetRowIndex4 });
      targetRowIndex4 = null;
    }
  }, [mainDataResult4]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex5 !== null && gridRef5.current) {
      gridRef5.current.scrollIntoView({ rowIndex: targetRowIndex5 });
      targetRowIndex5 = null;
    }
  }, [mainDataResult5]);

  const [date, setDate] = useState(new Date());
  const [date2, setDate2] = useState(new Date());
  const [date3, setDate3] = useState(new Date());
  const [date4, setDate4] = useState(new Date());
  const [date5, setDate5] = useState(new Date());
  const [date6, setDate6] = useState(new Date());
  const [date7, setDate7] = useState(new Date());
  const [date8, setDate8] = useState(new Date());
  const [date9, setDate9] = useState(new Date());
  const [date10, setDate10] = useState(new Date());
  const [date11, setDate11] = useState(new Date());
  const [date12, setDate12] = useState(new Date());
  let column1 = dateformat2(convertDateToStr(date)).substring(0, 7);
  let column2 = dateformat2(convertDateToStr(date2)).substring(0, 7);
  let column3 = dateformat2(convertDateToStr(date3)).substring(0, 7);
  let column4 = dateformat2(convertDateToStr(date4)).substring(0, 7);
  let column5 = dateformat2(convertDateToStr(date5)).substring(0, 7);
  let column6 = dateformat2(convertDateToStr(date6)).substring(0, 7);
  let column7 = dateformat2(convertDateToStr(date7)).substring(0, 7);
  let column8 = dateformat2(convertDateToStr(date8)).substring(0, 7);
  let column9 = dateformat2(convertDateToStr(date9)).substring(0, 7);
  let column10 = dateformat2(convertDateToStr(date10)).substring(0, 7);
  let column11 = dateformat2(convertDateToStr(date11)).substring(0, 7);
  let column12 = dateformat2(convertDateToStr(date12)).substring(0, 7);

  const Barchart = () => {
    let array: any[] = [];
    allChartDataResult.series.map((item) => {
      let series2: any[] = [];
      let series: any[] = [];
      for (var i = 0; i < allChartDataResult.arguments.length; i++) {
        let valid = true;
        allChartDataResult.list.map((item2: any) => {
          if (
            allChartDataResult.arguments[i] == item2.arguments &&
            item == item2.series
          ) {
            series.push(item2.value);
            valid = false;
          }
        });
        if (valid == true) {
          series.push(0);
        }
      }
      series2.push(series);

      array.push(
        <ChartSeriesItem
          labels={{
            visible: true,
            content: (e) =>
              e.value == 0 ? "" : numberWithCommas(e.value) + "",
          }}
          type="column"
          data={series2[0]}
        >
          <ChartSeriesItemTooltip format={item + " : {0}"} />
        </ChartSeriesItem>
      );
    });

    return array;
  };

  const Barchart2 = () => {
    let array: any[] = [];
    allChartDataResult2.series.map((item) => {
      let series2: any[] = [];
      let series: any[] = [];
      for (var i = 0; i < allChartDataResult2.arguments.length; i++) {
        let valid = true;
        allChartDataResult2.list.map((item2: any) => {
          if (
            allChartDataResult2.arguments[i] == item2.arguments &&
            item == item2.series
          ) {
            series.push(item2.value);
            valid = false;
          }
        });
        if (valid == true) {
          series.push(0);
        }
      }
      series2.push(series);

      array.push(
        <ChartSeriesItem
          labels={{
            visible: true,
            content: (e) =>
              e.value == 0 ? "" : numberWithCommas(e.value) + "",
          }}
          type="column"
          data={series2[0]}
        >
          <ChartSeriesItemTooltip format={item + " : {0}"} />
        </ChartSeriesItem>
      );
    });

    return array;
  };

  const Barchart3 = () => {
    let array: any[] = [];
    allChartDataResult3.series.map((item) => {
      let series2: any[] = [];
      let series: any[] = [];
      for (var i = 0; i < allChartDataResult3.arguments.length; i++) {
        let valid = true;
        allChartDataResult3.list.map((item2: any) => {
          if (
            allChartDataResult3.arguments[i] == item2.arguments &&
            item == item2.series
          ) {
            series.push(item2.value);
            valid = false;
          }
        });
        if (valid == true) {
          series.push(0);
        }
      }
      series2.push(series);

      array.push(
        <ChartSeriesItem
          labels={{
            visible: true,
            content: (e) =>
              e.value == 0 ? "" : numberWithCommas(e.value) + "",
          }}
          type="column"
          data={series2[0]}
        >
          <ChartSeriesItemTooltip format={item + " : {0}"} />
        </ChartSeriesItem>
      );
    });

    return array;
  };

  const CustomCardHeader = styled(CardHeader)({
    padding: 2,
  });

  return (
    <>
      <TitleContainer>
        <Title style={{ height: "10%" }}>인사고과 모니터링</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="HU_B4010W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      {isMobile ? (
        <>
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>기준년월</th>
                  <td>
                    <DatePicker
                      name="yyyymm"
                      value={filters.yyyymm}
                      format="yyyy-MM"
                      onChange={filterInputChange}
                      className="required"
                      placeholder=""
                      calendar={MonthCalendar}
                    />
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <Swiper
            onSwiper={(swiper) => {
              setSwiper(swiper);
            }}
            onActiveIndexChange={(swiper) => {
              index = swiper.activeIndex;
            }}
          >
            <SwiperSlide key={0}>
              <GridContainer style={{ width: `${deviceWidth - 30}px` }}>
                <ExcelExport
                  data={mainDataResult.data}
                  ref={(exporter) => {
                    _export = exporter;
                  }}
                  fileName="인사고과 모니터링"
                >
                  <Grid
                    style={{ height: deviceHeight }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
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
                      customOptionData.menuCustomColumnOptions["grdList"]
                        ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                        ?.map(
                          (item: any, idx: number) =>
                            item.sortOrder !== -1 && (
                              <GridColumn
                                key={idx}
                                field={item.fieldName}
                                title={item.caption}
                                width={item.width}
                                footerCell={
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell
                                    : undefined
                                }
                              />
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={1}>
              <GridContainer
                style={{
                  width: `${deviceWidth - 30}px`,
                }}
              >
                <GridTitleContainer className="ButtonContainer">
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    <Button
                      onClick={() => {
                        if (swiper) {
                          swiper.slideTo(0);
                        }
                      }}
                      icon="arrow-left"
                      style={{ marginRight: "5px" }}
                    >
                      이전
                    </Button>
                    <Button
                      onClick={() => {
                        if (swiper) {
                          swiper.slideTo(2);
                        }
                      }}
                    >
                      월별 평균
                    </Button>
                  </ButtonContainer>
                  <GridTitle>업무효율 및 능률</GridTitle>
                </GridTitleContainer>
                <Chart
                  style={{
                    height: (deviceHeight - height - height5 - height6) / 3,
                  }}
                >
                  <ChartTooltip format="{0}" />
                  <ChartValueAxis>
                    <ChartValueAxisItem
                      labels={{
                        visible: true,
                        content: (e) => numberWithCommas(e.value) + "",
                      }}
                    />
                  </ChartValueAxis>
                  <ChartCategoryAxis>
                    <ChartCategoryAxisItem
                      categories={allChartDataResult.arguments.map(
                        convertDateLabel
                      )}
                    />
                  </ChartCategoryAxis>
                  <ChartSeries>{Barchart()}</ChartSeries>
                </Chart>
                <GridTitleContainer className="ButtonContainer5">
                  <GridTitle>인사고과 - 기본항목</GridTitle>
                </GridTitleContainer>
                <Chart
                  style={{
                    height: (deviceHeight - height - height5 - height6) / 3,
                  }}
                >
                  <ChartTooltip format="{0}" />
                  <ChartValueAxis>
                    <ChartValueAxisItem
                      labels={{
                        visible: true,
                        content: (e) => numberWithCommas(e.value) + "",
                      }}
                    />
                  </ChartValueAxis>
                  <ChartCategoryAxis>
                    <ChartCategoryAxisItem
                      categories={allChartDataResult2.arguments.map(
                        convertDateLabel
                      )}
                    />
                  </ChartCategoryAxis>
                  <ChartSeries>{Barchart2()}</ChartSeries>
                </Chart>
                <GridTitleContainer className="ButtonContainer6">
                  <GridTitle>인사고과 - 업무특화(모듈)</GridTitle>
                </GridTitleContainer>
                <Chart
                  style={{
                    height: (deviceHeight - height - height5 - height6) / 3,
                  }}
                >
                  <ChartTooltip format="{0}" />
                  <ChartValueAxis>
                    <ChartValueAxisItem
                      labels={{
                        visible: true,
                        content: (e) => numberWithCommas(e.value) + "",
                      }}
                    />
                  </ChartValueAxis>
                  <ChartCategoryAxis>
                    <ChartCategoryAxisItem
                      categories={allChartDataResult3.arguments.map(
                        convertDateLabel
                      )}
                    />
                  </ChartCategoryAxis>
                  <ChartSeries>{Barchart3()}</ChartSeries>
                </Chart>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={2}>
              <GridContainer
                style={{
                  width: `${deviceWidth - 30}px`,
                }}
              >
                <GridTitleContainer className="ButtonContainer4">
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    <Button
                      onClick={() => {
                        if (swiper) {
                          swiper.slideTo(1);
                        }
                      }}
                      icon="arrow-left"
                      style={{ marginRight: "5px" }}
                    >
                      이전
                    </Button>
                  </ButtonContainer>
                </GridTitleContainer>

                <GridContainer
                  style={{ marginTop: "5px", marginBottom: "5px" }}
                  className="ButtonContainer2"
                >
                  <GridMui container spacing={0.3}>
                    <GridMui item xs={2.4} sm={2.4} md={6} lg={2.4} xl={2.4}>
                      <Card
                        style={{
                          color: "white",
                          backgroundColor: "#6495ed",
                        }}
                      >
                        <CustomCardHeader
                          subheaderTypographyProps={{
                            color: "#8f918d",
                            fontWeight: 500,
                            fontFamily: "TheJamsil5Bold",
                          }}
                          title={
                            <>
                              <Typography
                                style={{
                                  color: "white",
                                  fontWeight: 700,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontFamily: "TheJamsil5Bold",
                                  fontSize: "0.8rem",
                                }}
                              >
                                지각
                              </Typography>
                            </>
                          }
                          subheader={
                            <Typography
                              style={{
                                color: "white",
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontFamily: "TheJamsil5Bold",
                                fontSize: "1rem",
                              }}
                            >
                              {mainDataResult6.total <= 0
                                ? "0 건"
                                : mainDataResult6.data[0].late}
                            </Typography>
                          }
                        />
                      </Card>
                    </GridMui>
                    <GridMui item xs={2.4} sm={2.4} md={6} lg={2.4} xl={2.4}>
                      <Card
                        style={{
                          color: "white",
                          backgroundColor: "#6495ed",
                        }}
                      >
                        <CustomCardHeader
                          subheaderTypographyProps={{
                            color: "#8f918d",
                            fontWeight: 500,
                            fontFamily: "TheJamsil5Bold",
                          }}
                          title={
                            <>
                              <Typography
                                style={{
                                  color: "white",
                                  fontWeight: 700,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontFamily: "TheJamsil5Bold",
                                  fontSize: "0.8rem",
                                }}
                              >
                                근태경고
                              </Typography>
                            </>
                          }
                          subheader={
                            <Typography
                              style={{
                                color: "white",
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontFamily: "TheJamsil5Bold",
                                fontSize: "1rem",
                              }}
                            >
                              {mainDataResult6.total <= 0
                                ? "0 건"
                                : mainDataResult6.data[0].caution}
                            </Typography>
                          }
                        />
                      </Card>
                    </GridMui>
                    <GridMui item xs={2.4} sm={2.4} md={6} lg={2.4} xl={2.4}>
                      <Card
                        style={{
                          color: "white",
                          backgroundColor: "#6495ed",
                        }}
                      >
                        <CustomCardHeader
                          subheaderTypographyProps={{
                            color: "#8f918d",
                            fontWeight: 500,
                            fontFamily: "TheJamsil5Bold",
                          }}
                          title={
                            <>
                              <Typography
                                style={{
                                  color: "white",
                                  fontWeight: 700,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontFamily: "TheJamsil5Bold",
                                  fontSize: "0.8rem",
                                }}
                              >
                                교육이수
                              </Typography>
                            </>
                          }
                          subheader={
                            <Typography
                              style={{
                                color: "white",
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontFamily: "TheJamsil5Bold",
                                fontSize: "1rem",
                              }}
                            >
                              {mainDataResult6.total <= 0
                                ? "0 건"
                                : mainDataResult6.data[0].edu}
                            </Typography>
                          }
                        />
                      </Card>
                    </GridMui>
                    <GridMui item xs={2.4} sm={2.4} md={6} lg={2.4} xl={2.4}>
                      <Card
                        style={{
                          color: "white",
                          backgroundColor: "#6495ed",
                        }}
                      >
                        <CustomCardHeader
                          subheaderTypographyProps={{
                            color: "#8f918d",
                            fontWeight: 500,
                            fontFamily: "TheJamsil5Bold",
                          }}
                          title={
                            <>
                              <Typography
                                style={{
                                  color: "white",
                                  fontWeight: 700,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontFamily: "TheJamsil5Bold",
                                  fontSize: "0.8rem",
                                }}
                              >
                                상벌사항
                              </Typography>
                            </>
                          }
                          subheader={
                            <Typography
                              style={{
                                color: "white",
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontFamily: "TheJamsil5Bold",
                                fontSize: "1rem",
                              }}
                            >
                              {mainDataResult6.total <= 0
                                ? "0 건"
                                : mainDataResult6.data[0].rnp}
                            </Typography>
                          }
                        />
                      </Card>
                    </GridMui>
                    <GridMui item xs={2.4} sm={2.4} md={6} lg={2.4} xl={2.4}>
                      <Card
                        style={{
                          color: "white",
                          backgroundColor: "#6495ed",
                        }}
                      >
                        <CustomCardHeader
                          subheaderTypographyProps={{
                            color: "#8f918d",
                            fontWeight: 500,
                            fontFamily: "TheJamsil5Bold",
                          }}
                          title={
                            <>
                              <Typography
                                style={{
                                  color: "white",
                                  fontWeight: 700,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontFamily: "TheJamsil5Bold",
                                  fontSize: "0.8rem",
                                }}
                              >
                                처리불량
                              </Typography>
                            </>
                          }
                          subheader={
                            <Typography
                              style={{
                                color: "white",
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontFamily: "TheJamsil5Bold",
                                fontSize: "1rem",
                              }}
                            >
                              {mainDataResult6.total <= 0
                                ? "0 건"
                                : mainDataResult6.data[0].bad}
                            </Typography>
                          }
                        />
                      </Card>
                    </GridMui>
                  </GridMui>
                </GridContainer>
                <TabStrip selected={tabSelected} onSelect={handleSelectTab}>
                  <TabStripTab title="월별 평균">
                    <ExcelExport
                      data={mainDataResult2.data}
                      ref={(exporter) => {
                        _export2 = exporter;
                      }}
                      fileName="인사고과 모니터링"
                    >
                      <Grid
                        style={{
                          height: deviceHeight - height2 - height3 - height4,
                        }}
                        data={process(
                          mainDataResult2.data.map((row) => ({
                            ...row,
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
                        <GridColumn
                          field={"gubun"}
                          title={"구분"}
                          width="120px"
                          footerCell={mainTotalFooterCell2}
                        />
                        <GridColumn
                          field={"yyyymm01"}
                          title={column12}
                          width="120px"
                        />
                        <GridColumn
                          field={"yyyymm02"}
                          title={column11}
                          width="120px"
                        />
                        <GridColumn
                          field={"yyyymm03"}
                          title={column10}
                          width="120px"
                        />
                        <GridColumn
                          field={"yyyymm04"}
                          title={column9}
                          width="120px"
                        />
                        <GridColumn
                          field={"yyyymm05"}
                          title={column8}
                          width="120px"
                        />
                        <GridColumn
                          field={"yyyymm06"}
                          title={column7}
                          width="120px"
                        />
                        <GridColumn
                          field={"yyyymm07"}
                          title={column6}
                          width="120px"
                        />
                        <GridColumn
                          field={"yyyymm08"}
                          title={column5}
                          width="120px"
                        />
                        <GridColumn
                          field={"yyyymm09"}
                          title={column4}
                          width="120px"
                        />
                        <GridColumn
                          field={"yyyymm10"}
                          title={column3}
                          width="120px"
                        />
                        <GridColumn
                          field={"yyyymm11"}
                          title={column2}
                          width="120px"
                        />
                        <GridColumn
                          field={"yyyymm12"}
                          title={column1}
                          width="120px"
                        />
                      </Grid>
                    </ExcelExport>
                  </TabStripTab>
                  <TabStripTab title="당월 평가내용">
                    <ExcelExport
                      data={mainDataResult3.data}
                      ref={(exporter) => {
                        _export3 = exporter;
                      }}
                      fileName="인사고과 모니터링"
                    >
                      <Grid
                        style={{
                          height: deviceHeight - height2 - height3 - height4,
                        }}
                        data={process(
                          mainDataResult3.data.map((row) => ({
                            ...row,
                            reviewlvl1: reviewlvl1ListData.find(
                              (item: any) => item.sub_code == row.reviewlvl1
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
                          customOptionData.menuCustomColumnOptions["grdList2"]
                            ?.sort(
                              (a: any, b: any) => a.sortOrder - b.sortOrder
                            )
                            ?.map(
                              (item: any, idx: number) =>
                                item.sortOrder !== -1 && (
                                  <GridColumn
                                    key={idx}
                                    field={item.fieldName}
                                    title={item.caption}
                                    width={item.width}
                                    footerCell={
                                      item.sortOrder == 0
                                        ? mainTotalFooterCell3
                                        : undefined
                                    }
                                  />
                                )
                            )}
                      </Grid>
                    </ExcelExport>
                  </TabStripTab>
                  <TabStripTab title="불량내역">
                    <ExcelExport
                      data={mainDataResult4.data}
                      ref={(exporter) => {
                        _export4 = exporter;
                      }}
                      fileName="인사고과 모니터링"
                    >
                      <Grid
                        style={{ height: deviceHeight - height2 - height3 }}
                        data={process(
                          mainDataResult4.data.map((row) => ({
                            ...row,
                            badcd: badcdListData.find(
                              (item: any) => item.sub_code == row.badcd
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
                          customOptionData.menuCustomColumnOptions["grdList3"]
                            ?.sort(
                              (a: any, b: any) => a.sortOrder - b.sortOrder
                            )
                            ?.map(
                              (item: any, idx: number) =>
                                item.sortOrder !== -1 && (
                                  <GridColumn
                                    key={idx}
                                    field={item.fieldName}
                                    title={item.caption}
                                    width={item.width}
                                    cell={
                                      dateField.includes(item.fieldName)
                                        ? DateCell
                                        : undefined
                                    }
                                    footerCell={
                                      item.sortOrder == 0
                                        ? mainTotalFooterCell4
                                        : undefined
                                    }
                                  />
                                )
                            )}
                      </Grid>
                    </ExcelExport>
                  </TabStripTab>
                  <TabStripTab title="상벌내역">
                    <ExcelExport
                      data={mainDataResult5.data}
                      ref={(exporter) => {
                        _export5 = exporter;
                      }}
                      fileName="인사고과 모니터링"
                    >
                      <Grid
                        style={{ height: deviceHeight - height2 - height3 }}
                        data={process(
                          mainDataResult5.data.map((row) => ({
                            ...row,
                            rnpdiv: rnpdivListData.find(
                              (item: any) => item.sub_code == row.rnpdiv
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
                        ref={gridRef4}
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
                          customOptionData.menuCustomColumnOptions["grdList4"]
                            ?.sort(
                              (a: any, b: any) => a.sortOrder - b.sortOrder
                            )
                            ?.map(
                              (item: any, idx: number) =>
                                item.sortOrder !== -1 && (
                                  <GridColumn
                                    key={idx}
                                    field={item.fieldName}
                                    title={item.caption}
                                    width={item.width}
                                    cell={
                                      dateField.includes(item.fieldName)
                                        ? DateCell
                                        : undefined
                                    }
                                    footerCell={
                                      item.sortOrder == 0
                                        ? mainTotalFooterCell5
                                        : undefined
                                    }
                                  />
                                )
                            )}
                      </Grid>
                    </ExcelExport>
                  </TabStripTab>
                </TabStrip>
              </GridContainer>
            </SwiperSlide>
          </Swiper>
        </>
      ) : (
        <>
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>기준년월</th>
                  <td>
                    <DatePicker
                      name="yyyymm"
                      value={filters.yyyymm}
                      format="yyyy-MM"
                      onChange={filterInputChange}
                      className="required"
                      placeholder=""
                      calendar={MonthCalendar}
                    />
                  </td>
                  <th></th>
                  <td></td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>

          <GridContainerWrap>
            <GridContainer width="17%">
              <GridTitleContainer>
                <GridTitle>사원목록</GridTitle>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
                fileName="인사고과 모니터링"
              >
                <Grid
                  style={{ height: "78vh" }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
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
                    customOptionData.menuCustomColumnOptions["grdList"]
                      ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                      ?.map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              footerCell={
                                item.sortOrder == 0
                                  ? mainTotalFooterCell
                                  : undefined
                              }
                            />
                          )
                      )}
                </Grid>
              </ExcelExport>
            </GridContainer>
            <GridContainer width={`calc(50% - ${GAP}px)`}>
              <GridContainer>
                <GridTitleContainer>
                  <GridTitle>업무효율 및 능률</GridTitle>
                </GridTitleContainer>
                <Chart style={{ height: "24vh" }}>
                  <ChartTooltip format="{0}" />
                  <ChartValueAxis>
                    <ChartValueAxisItem
                      labels={{
                        visible: true,
                        content: (e) => numberWithCommas(e.value) + "",
                      }}
                    />
                  </ChartValueAxis>
                  <ChartCategoryAxis>
                    <ChartCategoryAxisItem
                      categories={allChartDataResult.arguments}
                    />
                  </ChartCategoryAxis>
                  <ChartSeries>{Barchart()}</ChartSeries>
                </Chart>
              </GridContainer>
              <GridContainer>
                <GridTitleContainer>
                  <GridTitle>인사고과 - 기본항목</GridTitle>
                </GridTitleContainer>
                <Chart style={{ height: "24vh" }}>
                  <ChartTooltip format="{0}" />
                  <ChartValueAxis>
                    <ChartValueAxisItem
                      labels={{
                        visible: true,
                        content: (e) => numberWithCommas(e.value) + "",
                      }}
                    />
                  </ChartValueAxis>
                  <ChartCategoryAxis>
                    <ChartCategoryAxisItem
                      categories={allChartDataResult2.arguments}
                    />
                  </ChartCategoryAxis>
                  <ChartSeries>{Barchart2()}</ChartSeries>
                </Chart>
              </GridContainer>
              <GridContainer>
                <GridTitleContainer>
                  <GridTitle>인사고과 - 업무특화(모듈)</GridTitle>
                </GridTitleContainer>
                <Chart style={{ height: "24vh" }}>
                  <ChartTooltip format="{0}" />
                  <ChartValueAxis>
                    <ChartValueAxisItem
                      labels={{
                        visible: true,
                        content: (e) => numberWithCommas(e.value) + "",
                      }}
                    />
                  </ChartValueAxis>
                  <ChartCategoryAxis>
                    <ChartCategoryAxisItem
                      categories={allChartDataResult3.arguments}
                    />
                  </ChartCategoryAxis>
                  <ChartSeries>{Barchart3()}</ChartSeries>
                </Chart>
              </GridContainer>
            </GridContainer>
            <GridContainer width={`calc(33% - ${GAP}px)`}>
              <GridContainer>
                <GridTitleContainer>
                  <GridTitle>월별 평균</GridTitle>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult2.data}
                  ref={(exporter) => {
                    _export2 = exporter;
                  }}
                  fileName="인사고과 모니터링"
                >
                  <Grid
                    style={{ height: "28vh" }}
                    data={process(
                      mainDataResult2.data.map((row) => ({
                        ...row,
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
                    <GridColumn
                      field={"gubun"}
                      title={"구분"}
                      width="120px"
                      footerCell={mainTotalFooterCell2}
                    />
                    <GridColumn
                      field={"yyyymm01"}
                      title={column12}
                      width="120px"
                    />
                    <GridColumn
                      field={"yyyymm02"}
                      title={column11}
                      width="120px"
                    />
                    <GridColumn
                      field={"yyyymm03"}
                      title={column10}
                      width="120px"
                    />
                    <GridColumn
                      field={"yyyymm04"}
                      title={column9}
                      width="120px"
                    />
                    <GridColumn
                      field={"yyyymm05"}
                      title={column8}
                      width="120px"
                    />
                    <GridColumn
                      field={"yyyymm06"}
                      title={column7}
                      width="120px"
                    />
                    <GridColumn
                      field={"yyyymm07"}
                      title={column6}
                      width="120px"
                    />
                    <GridColumn
                      field={"yyyymm08"}
                      title={column5}
                      width="120px"
                    />
                    <GridColumn
                      field={"yyyymm09"}
                      title={column4}
                      width="120px"
                    />
                    <GridColumn
                      field={"yyyymm10"}
                      title={column3}
                      width="120px"
                    />
                    <GridColumn
                      field={"yyyymm11"}
                      title={column2}
                      width="120px"
                    />
                    <GridColumn
                      field={"yyyymm12"}
                      title={column1}
                      width="120px"
                    />
                  </Grid>
                </ExcelExport>
              </GridContainer>
              <TabStrip selected={tabSelected} onSelect={handleSelectTab}>
                <TabStripTab title="당월 평가내용">
                  <ExcelExport
                    data={mainDataResult3.data}
                    ref={(exporter) => {
                      _export3 = exporter;
                    }}
                    fileName="인사고과 모니터링"
                  >
                    <Grid
                      style={{ height: "30vh" }}
                      data={process(
                        mainDataResult3.data.map((row) => ({
                          ...row,
                          reviewlvl1: reviewlvl1ListData.find(
                            (item: any) => item.sub_code == row.reviewlvl1
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
                        customOptionData.menuCustomColumnOptions["grdList2"]
                          ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                          ?.map(
                            (item: any, idx: number) =>
                              item.sortOrder !== -1 && (
                                <GridColumn
                                  key={idx}
                                  field={item.fieldName}
                                  title={item.caption}
                                  width={item.width}
                                  footerCell={
                                    item.sortOrder == 0
                                      ? mainTotalFooterCell3
                                      : undefined
                                  }
                                />
                              )
                          )}
                    </Grid>
                  </ExcelExport>
                </TabStripTab>
                <TabStripTab title="불량내역">
                  <ExcelExport
                    data={mainDataResult4.data}
                    ref={(exporter) => {
                      _export4 = exporter;
                    }}
                    fileName="인사고과 모니터링"
                  >
                    <Grid
                      style={{ height: "30vh" }}
                      data={process(
                        mainDataResult4.data.map((row) => ({
                          ...row,
                          badcd: badcdListData.find(
                            (item: any) => item.sub_code == row.badcd
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
                        customOptionData.menuCustomColumnOptions["grdList3"]
                          ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                          ?.map(
                            (item: any, idx: number) =>
                              item.sortOrder !== -1 && (
                                <GridColumn
                                  key={idx}
                                  field={item.fieldName}
                                  title={item.caption}
                                  width={item.width}
                                  cell={
                                    dateField.includes(item.fieldName)
                                      ? DateCell
                                      : undefined
                                  }
                                  footerCell={
                                    item.sortOrder == 0
                                      ? mainTotalFooterCell4
                                      : undefined
                                  }
                                />
                              )
                          )}
                    </Grid>
                  </ExcelExport>
                </TabStripTab>
                <TabStripTab title="상벌내역">
                  <ExcelExport
                    data={mainDataResult5.data}
                    ref={(exporter) => {
                      _export5 = exporter;
                    }}
                    fileName="인사고과 모니터링"
                  >
                    <Grid
                      style={{ height: "30vh" }}
                      data={process(
                        mainDataResult5.data.map((row) => ({
                          ...row,
                          rnpdiv: rnpdivListData.find(
                            (item: any) => item.sub_code == row.rnpdiv
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
                      ref={gridRef4}
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
                        customOptionData.menuCustomColumnOptions["grdList4"]
                          ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                          ?.map(
                            (item: any, idx: number) =>
                              item.sortOrder !== -1 && (
                                <GridColumn
                                  key={idx}
                                  field={item.fieldName}
                                  title={item.caption}
                                  width={item.width}
                                  cell={
                                    dateField.includes(item.fieldName)
                                      ? DateCell
                                      : undefined
                                  }
                                  footerCell={
                                    item.sortOrder == 0
                                      ? mainTotalFooterCell5
                                      : undefined
                                  }
                                />
                              )
                          )}
                    </Grid>
                  </ExcelExport>
                </TabStripTab>
              </TabStrip>
              <GridContainer style={{ marginTop: "10px" }}>
                <GridMui container spacing={2}>
                  <GridMui item xs={12} sm={6} md={6} lg={2.4} xl={2.4}>
                    <Card
                      style={{
                        height: "10vh",
                        color: "white",
                        backgroundColor: "#6495ed",
                      }}
                    >
                      <CardHeader
                        subheaderTypographyProps={{
                          color: "#8f918d",
                          fontWeight: 500,
                          fontFamily: "TheJamsil5Bold",
                        }}
                        title={
                          <>
                            <Typography
                              style={{
                                color: "white",
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontFamily: "TheJamsil5Bold",
                              }}
                            >
                              지각
                            </Typography>
                          </>
                        }
                        subheader={
                          <Typography
                            style={{
                              color: "white",
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontFamily: "TheJamsil5Bold",
                              fontSize: "1.4rem",
                            }}
                          >
                            {mainDataResult6.total <= 0
                              ? "0 건"
                              : mainDataResult6.data[0].late}
                          </Typography>
                        }
                      />
                    </Card>
                  </GridMui>
                  <GridMui item xs={12} sm={6} md={6} lg={2.4} xl={2.4}>
                    <Card
                      style={{
                        height: "10vh",
                        color: "white",
                        backgroundColor: "#6495ed",
                      }}
                    >
                      <CardHeader
                        subheaderTypographyProps={{
                          color: "#8f918d",
                          fontWeight: 500,
                          fontFamily: "TheJamsil5Bold",
                        }}
                        title={
                          <>
                            <Typography
                              style={{
                                color: "white",
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontFamily: "TheJamsil5Bold",
                              }}
                            >
                              근태 경고
                            </Typography>
                          </>
                        }
                        subheader={
                          <Typography
                            style={{
                              color: "white",
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontFamily: "TheJamsil5Bold",
                              fontSize: "1.4rem",
                            }}
                          >
                            {mainDataResult6.total <= 0
                              ? "0 건"
                              : mainDataResult6.data[0].caution}
                          </Typography>
                        }
                      />
                    </Card>
                  </GridMui>
                  <GridMui item xs={12} sm={6} md={6} lg={2.4} xl={2.4}>
                    <Card
                      style={{
                        height: "10vh",
                        color: "white",
                        backgroundColor: "#6495ed",
                      }}
                    >
                      <CardHeader
                        subheaderTypographyProps={{
                          color: "#8f918d",
                          fontWeight: 500,
                          fontFamily: "TheJamsil5Bold",
                        }}
                        title={
                          <>
                            <Typography
                              style={{
                                color: "white",
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontFamily: "TheJamsil5Bold",
                              }}
                            >
                              교육 이수
                            </Typography>
                          </>
                        }
                        subheader={
                          <Typography
                            style={{
                              color: "white",
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontFamily: "TheJamsil5Bold",
                              fontSize: "1.4rem",
                            }}
                          >
                            {mainDataResult6.total <= 0
                              ? "0 건"
                              : mainDataResult6.data[0].edu}
                          </Typography>
                        }
                      />
                    </Card>
                  </GridMui>
                  <GridMui item xs={12} sm={6} md={6} lg={2.4} xl={2.4}>
                    <Card
                      style={{
                        height: "10vh",
                        color: "white",
                        backgroundColor: "#6495ed",
                      }}
                    >
                      <CardHeader
                        subheaderTypographyProps={{
                          color: "#8f918d",
                          fontWeight: 500,
                          fontFamily: "TheJamsil5Bold",
                        }}
                        title={
                          <>
                            <Typography
                              style={{
                                color: "white",
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontFamily: "TheJamsil5Bold",
                              }}
                            >
                              상벌사항
                            </Typography>
                          </>
                        }
                        subheader={
                          <Typography
                            style={{
                              color: "white",
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontFamily: "TheJamsil5Bold",
                              fontSize: "1.4rem",
                            }}
                          >
                            {mainDataResult6.total <= 0
                              ? "0 건"
                              : mainDataResult6.data[0].rnp}
                          </Typography>
                        }
                      />
                    </Card>
                  </GridMui>
                  <GridMui item xs={12} sm={6} md={6} lg={2.4} xl={2.4}>
                    <Card
                      style={{
                        height: "10vh",
                        color: "white",
                        backgroundColor: "#6495ed",
                      }}
                    >
                      <CardHeader
                        subheaderTypographyProps={{
                          color: "#8f918d",
                          fontWeight: 500,
                          fontFamily: "TheJamsil5Bold",
                        }}
                        title={
                          <>
                            <Typography
                              style={{
                                color: "white",
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontFamily: "TheJamsil5Bold",
                              }}
                            >
                              처리불량
                            </Typography>
                          </>
                        }
                        subheader={
                          <Typography
                            style={{
                              color: "white",
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontFamily: "TheJamsil5Bold",
                              fontSize: "1.4rem",
                            }}
                          >
                            {mainDataResult6.total <= 0
                              ? "0 건"
                              : mainDataResult6.data[0].bad}
                          </Typography>
                        }
                      />
                    </Card>
                  </GridMui>
                </GridMui>
              </GridContainer>
            </GridContainer>
          </GridContainerWrap>
        </>
      )}
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

export default HU_B4010W;
