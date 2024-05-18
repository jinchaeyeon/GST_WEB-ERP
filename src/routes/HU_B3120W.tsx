import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { useTableKeyboardNavigation } from "@progress/kendo-react-data-tools";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridCellProps,
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
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { bytesToBase64 } from "byte-base64";
import React, { useCallback, useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
  FilterBox,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridContainerWrap,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import MonthCalendar from "../components/Calendars/MonthCalendar";
import MonthDateCell from "../components/Cells/MonthDateCell";
import NumberCell from "../components/Cells/NumberCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  dateformat,
  findMessage,
  getGridItemChangedData,
  getHeight,
  getQueryFromBizComponent,
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
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import FileViewers from "../components/Viewer/FileViewers";
import { useApi } from "../hooks/api";
import { heightstate, isFilterHideState, isLoading } from "../store/atoms";
import { gridList } from "../store/columns/HU_B3120W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
var index = 0;

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
const numberField = [
  "totpayamt",
  "ANU",
  "MED",
  "HIR",
  "MME",
  "INC",
  "LOC",
  "MIN02",
  "MIN01",
  "totded",
  "rlpayamt",
];

const dateField = ["payyrmm"];
const HU_B3120W: React.FC = () => {
  const [swiper, setSwiper] = useState<SwiperCore>();

  let deviceWidth = document.documentElement.clientWidth;
  const [deviceHeight, setDeviceHeight] = useRecoilState(heightstate);
  let isMobile = deviceWidth <= 1200;

  var height = getHeight(".ButtonContainer");
  var height2 = getHeight(".ButtonContainer2");
  var height3 = getHeight(".k-tabstrip-items-wrapper");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const processApi = useApi();
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const [tabSelected, setTabSelected] = useState(0);
  const [isFilterHideStates, setIsFilterHideStates] =
    useRecoilState(isFilterHideState);
  const handleSelectTab = (e: any) => {
    if (isMobile) {
      if (e.selected == 0) {
        setFilters2((prev) => ({
          ...prev,
          isSearch: true,
        }));
      } else if (e.selected == 1) {
        setFilters3((prev) => ({
          ...prev,
          isSearch: true,
        }));
      } else if (e.selected == 2) {
        setFilters4((prev) => ({
          ...prev,
          isSearch: true,
        }));
      }
      setIsFilterHideStates(true);
    }

    setTabSelected(e.selected);
  };
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;
    setUrl("");
    setPage2(initialPageState);
    setPage3(initialPageState);
    setFilters2((prev) => ({
      ...prev,
      pgNum: 1,
    }));

    setFilters3((prev) => ({
      ...prev,
      pgNum: 1,
    }));

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

  const [url, setUrl] = useState<string>("");
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("HU_B3120W", setCustomOptionData);
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("HU_B3120W", setMessagesData);
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_HU032, L_dptcd_001",
    //직위, 부서, 급상여구분
    setBizComponentData
  );
  const [dptcdListData, setdptcdListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);
  const [paytypeListData, setPaytypeListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      const dptcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_dptcd_001"
        )
      );
      const paytypeQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_HU032")
      );
      fetchQuery(dptcdQueryStr, setdptcdListData);
      fetchQuery(paytypeQueryStr, setPaytypeListData);
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

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      const frdts = new Date();
      frdts.setFullYear(setDefaultDate(customOptionData, "frdt").getFullYear());
      frdts.setMonth(0);
      frdts.setDate(1);
      const todt = new Date();
      todt.setFullYear(setDefaultDate(customOptionData, "frdt").getFullYear());
      todt.setMonth(11);
      todt.setDate(1);
      setFilters((prev) => ({
        ...prev,
        frdt: frdts,
        todt: todt,
        paytype: defaultOption.find((item: any) => item.id == "paytype")
          ?.valueCode,
      }));
      setFilters2((prev) => ({
        ...prev,
        frdt: frdts,
        todt: todt,
      }));
      setFilters3((prev) => ({
        ...prev,
        frdt: frdts,
        todt: todt,
      }));
      setFilters4((prev) => ({
        ...prev,
        frdt: frdts,
        todt: todt,
        prdate: setDefaultDate(customOptionData, "prdate"),
        paytypeCombo: defaultOption.find(
          (item: any) => item.id == "paytypeCombo"
        )?.valueCode,
      }));
    }
  }, [customOptionData]);

  //조회조건 Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 조회 파라미터로 세팅
  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters4((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters4((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    frdt: new Date(),
    todt: new Date(),
    prsnnum: "",
    paytype: "",
    prdate: new Date(),
    pgNum: 1,
    isSearch: true,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    frdt: new Date(),
    todt: new Date(),
    prsnnum: "",
    prsnnm: "",
    pgNum: 1,
    isSearch: true,
  });

  const [filters3, setFilters3] = useState({
    pgSize: PAGE_SIZE,
    frdt: new Date(),
    todt: new Date(),
    prsnnum: "",
    prsnnm: "",
    pgNum: 1,
    isSearch: true,
  });

  const [filters4, setFilters4] = useState({
    pgSize: PAGE_SIZE,
    paytypeCombo: "",
    prsnnum: "",
    prsnnm: "",
    prdate: new Date(),
    pgNum: 1,
    isSearch: true,
  });

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
    process([], mainDataState2)
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

  //그리드 조회
  const fetchMainGrid = async (filters: any) => {
    let data: any;
    const parameters: Iparameters = {
      procedureName: "P_HU_B3120W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "PERSON",
        "@p_orgdiv": sessionOrgdiv,
        "@p_frdt": convertDateToStr(filters.frdt).substring(0, 6),
        "@p_todt": convertDateToStr(filters.todt).substring(0, 6),
        "@p_prsnnum": filters.prsnnum,
        "@p_paytype": filters.paytype,
        "@p_prdate": convertDateToStr(filters.prdate).substring(0, 6),
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
        chk: item.chk == "N" ? false : true,
      }));

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
          isSearch: true,
          pgNum: 1,
          prsnnum: rows[0].prsnnum,
          prsnnm: rows[0].prsnnm,
        }));
        setFilters3((prev) => ({
          ...prev,
          isSearch: true,
          pgNum: 1,
          prsnnum: rows[0].prsnnum,
          prsnnm: rows[0].prsnnm,
        }));
        setFilters4((prev) => ({
          ...prev,
          isSearch: true,
          pgNum: 1,
          prsnnum: rows[0].prsnnum,
          prsnnm: rows[0].prsnnm,
        }));
      }
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
  };

  //그리드 조회
  const fetchMainGrid2 = async (filters2: any) => {
    let data: any;
    const parameters: Iparameters = {
      procedureName: "P_HU_B3120W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": "MONTH",
        "@p_orgdiv": sessionOrgdiv,
        "@p_frdt": convertDateToStr(filters2.frdt).substring(0, 6),
        "@p_todt": convertDateToStr(filters2.todt).substring(0, 6),
        "@p_prsnnum": filters2.prsnnum,
        "@p_paytype": filters.paytype,
        "@p_prdate": convertDateToStr(filters.prdate).substring(0, 6),
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
        payyrmm: item.payyrmm + "01",
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
  };

  //그리드 조회
  const fetchMainGrid3 = async (filters3: any) => {
    let data: any;
    const parameters: Iparameters = {
      procedureName: "P_HU_B3120W_Q",
      pageNumber: filters3.pgNum,
      pageSize: filters3.pgSize,
      parameters: {
        "@p_work_type": "BNS",
        "@p_orgdiv": sessionOrgdiv,
        "@p_frdt": convertDateToStr(filters3.frdt).substring(0, 6),
        "@p_todt": convertDateToStr(filters3.todt).substring(0, 6),
        "@p_prsnnum": filters3.prsnnum,
        "@p_paytype": filters.paytype,
        "@p_prdate": convertDateToStr(filters.prdate).substring(0, 6),
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
  };

  //그리드 데이터 조회
  const fetchMainGrid4 = async () => {
    //if (!permissions?.view) return;
    let data: any;
    let data2: any;

    setLoading(true);
    const parameters = {
      para: "list?emmId=HU_B3120_01",
    };
    const parameters2 = {
      para: "list?emmId=HU_B3120_02",
    };
    try {
      data = await processApi<any>(
        "excel-view-mail",
        filters4.paytypeCombo == "1" ? parameters2 : parameters
      );
    } catch (error) {
      data = null;
    }

    if (data.RowCount > 0) {
      const rows = data.Rows;

      const parameters2 = {
        para: "document-json?id=" + rows[0].document_id,
        "@p_orgdiv": filters.orgdiv,
        "@p_payyrmm": convertDateToStr(filters4.prdate).substring(0, 6),
        "@p_paytype": filters4.paytypeCombo,
        "@p_prsnnum": filters4.prsnnum,
      };
      try {
        data2 = await processApi<any>("excel-view", parameters2);
      } catch (error) {
        data2 = null;
      }
      if (data2 !== null) {
        const byteCharacters = atob(data2.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: "application/pdf",
        });
        setUrl(URL.createObjectURL(blob));
      } else {
        setUrl("");
      }
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
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

  useEffect(() => {
    if (filters.isSearch && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  useEffect(() => {
    if (filters2.isSearch && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2]);

  useEffect(() => {
    if (filters3.isSearch && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3);
      setFilters3((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid3(deepCopiedFilters);
    }
  }, [filters3]);

  useEffect(() => {
    if (filters4.isSearch && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters4);
      setFilters4((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid4();
    }
  }, [filters4]);

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setPage2(initialPageState);
    setPage3(initialPageState);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
    setMainDataResult3(process([], mainDataState3));
    setUrl("");
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
  //메인 그리드 선택 이벤트
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
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
      isSearch: true,
      pgNum: 1,
      prsnnum: selectedRowData.prsnnum,
      prsnnm: selectedRowData.prsnnm,
    }));
    setFilters3((prev) => ({
      ...prev,
      isSearch: true,
      pgNum: 1,
      prsnnum: selectedRowData.prsnnum,
      prsnnm: selectedRowData.prsnnm,
    }));
    setFilters4((prev) => ({
      ...prev,
      isSearch: true,
      pgNum: 1,
      prsnnum: selectedRowData.prsnnum,
      prsnnm: selectedRowData.prsnnm,
    }));
    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  const onMainSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });

    setSelectedState2(newSelectedState);
  };

  const onMainSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState3,
      dataItemKey: DATA_ITEM_KEY3,
    });

    setSelectedState3(newSelectedState);
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

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  let _export3: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "사원리스트";
      if (tabSelected == 0) {
        const optionsGridTwo = _export2.workbookOptions();
        const optionsGridThree = _export3.workbookOptions();
        optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
        optionsGridOne.sheets[2] = optionsGridThree.sheets[0];
        optionsGridOne.sheets[1].title = "급여";
        optionsGridOne.sheets[2].title = "상여";
      }
      _export.save(optionsGridOne);
    }
  };

  const search = () => {
    resetAllGrid();
    setFilters((prev: any) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
  };

  const search2 = () => {
    try {
      if (
        convertDateToStr(filters2.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters2.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters2.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters2.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "HU_B3120W_001");
      } else if (
        convertDateToStr(filters2.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters2.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters2.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters2.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "HU_B3120W_001");
      } else {
        setPage2(initialPageState); // 페이지 초기화
        setPage3(initialPageState); // 페이지 초기화
        setFilters2((prev: any) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
        setFilters3((prev: any) => ({
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

  const search3 = () => {
    try {
      if (convertDateToStr(filters4.prdate).substring(0, 4) < "1997") {
        throw findMessage(messagesData, "HU_B3120W_001");
      } else {
        setFilters4((prev: any) => ({
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

  const [values2, setValues2] = React.useState<boolean>(false);
  const CustomCheckBoxCell2 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        rowstatus: item.rowstatus == "N" ? "N" : "U",
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

  const CustomCheckBoxCell = (props: GridCellProps) => {
    const navigationAttributes = useTableKeyboardNavigation(props.id);
    const field = props.field || "";

    const onChange = () => {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == props.dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              rowstatus: item.rowstatus == "N" ? "N" : "U",
              chk: !item.chk,
              [EDIT_FIELD]: props.field,
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
    };

    return (
      <td
        style={props.style} // this applies styles that lock the column at a specific position
        className={props.className} // this adds classes needed for locked columns
        colSpan={props.colSpan}
        role={"gridcell"}
        aria-colindex={props.ariaColumnIndex}
        aria-selected={props.isSelected}
        {...navigationAttributes}
      >
        <Checkbox value={props.dataItem[field]} onClick={onChange}></Checkbox>
      </td>
    );
  };

  const enterEdit = (dataItem: any, field: string) => {};

  const exitEdit = () => {};

  const onSend = async () => {
    let data: any;

    const dataItem = mainDataResult.data.filter(
      (item: any) => item.chk == true
    );

    if (dataItem.length == 0) {
      alert("체크된 행이 없습니다.");
      return false;
    }

    let valid = true;
    dataItem.map((item) => {
      if (item.email == "") {
        valid = false;
      }
    });

    if (valid != true) {
      alert("사용자 정보에서 이메일 등록 후 진행해주세요.");
      return false;
    }

    let regex = new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}");
    let valid2 = true;
    dataItem.map((item) => {
      if (regex.test(item.email) == false) {
        valid2 = false;
      }
    });
    if (valid2 != true) {
      alert("올바른 형식의 이메일 주소가 아닙니다.");
      return false;
    }
    setLoading(true);
    const promises = dataItem.map(async (item) => {
      const parameters = {
        para: "send-mail?id=2023CF13D7",
        to: item.email,
        title: `${convertDateToStr(filters4.prdate).substring(
          0,
          4
        )}년 ${convertDateToStr(filters4.prdate).substring(4, 6)}월 ${
          item.prsnnm
        } 급여명세서`,
        TextBody: `${convertDateToStr(filters4.prdate).substring(
          0,
          4
        )}년 ${convertDateToStr(filters4.prdate).substring(
          4,
          6
        )}월 급여명세서입니다. 지난 노고에 감사드립니다.수고하셨습니다.`,
        printoutName: `${convertDateToStr(filters4.prdate).substring(
          0,
          4
        )}년 ${convertDateToStr(filters4.prdate).substring(
          4,
          6
        )}월 급여명세서.pdf`,
        queryParamValues: `{
          "@p_orgdiv": ${filters.orgdiv},
          "@p_payyrmm": ${convertDateToStr(filters4.prdate).substring(0, 6)},
          "@p_paytype": "1",
          "@p_prsnnum": ${item.prsnnum}
        }`,
      };
      return await processApi<any>("send-email", parameters);
    });

    const results = await Promise.all(promises);
    if (results != null) {
      alert("전송했습니다.");
    } else {
      alert("오류가 발생했습니다.");
    }

    setLoading(false);
  };

  return (
    <>
      <TitleContainer>
        <Title>개인별 명세</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={
                index == 1 && tabSelected == 0
                  ? search2
                  : index == 1 && tabSelected == 1
                  ? search2
                  : index == 1 && tabSelected == 2
                  ? search3
                  : search
              }
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="HU_B3120W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      {isMobile ? (
        <>
          <Swiper
            onSwiper={(swiper) => {
              setSwiper(swiper);
            }}
            onActiveIndexChange={(swiper) => {
              index = swiper.activeIndex;
            }}
          >
            <SwiperSlide key={0}>
              <GridContainer
                style={{
                  width: `${deviceWidth - 30}px`,
                  overflow: "auto",
                }}
              >
                <FilterContainer>
                  <FilterBox>
                    <tbody>
                      <tr>
                        <th>재직여부</th>
                        <td>
                          {customOptionData !== null && (
                            <CustomOptionRadioGroup
                              name="paytype"
                              customOptionData={customOptionData}
                              changeData={filterRadioChange}
                            />
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </FilterBox>
                </FilterContainer>
                <GridContainer>
                  <GridTitleContainer className="ButtonContainer">
                    <ButtonContainer>
                      <Button
                        themeColor={"primary"}
                        onClick={onSend}
                        icon="email"
                      >
                        전송
                      </Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult.data}
                    ref={(exporter) => {
                      _export = exporter;
                    }}
                    fileName="개인별 명세"
                  >
                    <Grid
                      style={{ height: deviceHeight - height }}
                      data={process(
                        mainDataResult.data.map((row) => ({
                          ...row,
                          dptcd: dptcdListData.find(
                            (item: any) => item.dptcd == row.dptcd
                          )?.dptnm,
                          [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                        })),
                        mainDataState
                      )}
                      onDataStateChange={onMainDataStateChange}
                      {...mainDataState}
                      //선택 기능
                      dataItemKey={DATA_ITEM_KEY}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onMainSelectionChange}
                      //스크롤 조회기능
                      fixedScroll={true}
                      total={mainDataResult.total}
                      skip={page.skip}
                      take={page.take}
                      pageable={true}
                      onPageChange={pageChange}
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
                      <GridColumn
                        field="chk"
                        title=" "
                        width="45px"
                        headerCell={CustomCheckBoxCell2}
                        cell={CustomCheckBoxCell}
                      />
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions["grdList"]
                          ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                          ?.map(
                            (item: any, idx: number) =>
                              item.sortOrder !== -1 && (
                                <GridColumn
                                  key={idx}
                                  id={item.id}
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
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={1}>
              <GridContainer style={{ width: `${deviceWidth - 30}px` }}>
                {tabSelected == 0 ? (
                  <FilterContainer>
                    <FilterBox>
                      <tbody>
                        <tr>
                          <th>기간</th>
                          <td>
                            <CommonDateRangePicker
                              value={{
                                start: filters2.frdt,
                                end: filters2.todt,
                              }}
                              onChange={(e: {
                                value: { start: any; end: any };
                              }) => {
                                setFilters2((prev) => ({
                                  ...prev,
                                  frdt: e.value.start,
                                  todt: e.value.end,
                                }));
                                setFilters3((prev) => ({
                                  ...prev,
                                  frdt: e.value.start,
                                  todt: e.value.end,
                                }));
                              }}
                              className="required"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </FilterBox>
                  </FilterContainer>
                ) : tabSelected == 1 ? (
                  <FilterContainer>
                    <FilterBox>
                      <tbody>
                        <tr>
                          <th>기간</th>
                          <td>
                            <CommonDateRangePicker
                              value={{
                                start: filters2.frdt,
                                end: filters2.todt,
                              }}
                              onChange={(e: {
                                value: { start: any; end: any };
                              }) => {
                                setFilters2((prev) => ({
                                  ...prev,
                                  frdt: e.value.start,
                                  todt: e.value.end,
                                }));
                                setFilters3((prev) => ({
                                  ...prev,
                                  frdt: e.value.start,
                                  todt: e.value.end,
                                }));
                              }}
                              className="required"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </FilterBox>
                  </FilterContainer>
                ) : (
                  <FilterContainer>
                    <FilterBox>
                      <tbody>
                        <tr>
                          <th>급여유형</th>
                          <td>
                            {customOptionData !== null && (
                              <CustomOptionComboBox
                                name="paytypeCombo"
                                value={filters4.paytypeCombo}
                                customOptionData={customOptionData}
                                changeData={filterComboBoxChange}
                              />
                            )}
                          </td>
                          <th>년월</th>
                          <td>
                            <DatePicker
                              name="prdate"
                              value={filters4.prdate}
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
                )}
                <FormBoxWrap border={true} className="ButtonContainer2">
                  <FormBox>
                    <tbody>
                      <tr>
                        <th>사번</th>
                        <td>
                          <Input
                            name="prsnnum"
                            type="text"
                            value={filters2.prsnnum}
                            className="readonly"
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>성명</th>
                        <td>
                          <Input
                            name="prsnnm"
                            type="text"
                            value={filters2.prsnnm}
                            className="readonly"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </FormBox>
                </FormBoxWrap>
                <TabStrip
                  style={{ width: "100%" }}
                  selected={tabSelected}
                  onSelect={handleSelectTab}
                >
                  <TabStripTab title="급여(월별 내역)">
                    <GridContainer>
                      <ExcelExport
                        data={mainDataResult2.data}
                        ref={(exporter) => {
                          _export2 = exporter;
                        }}
                        fileName="개인별 명세"
                      >
                        <Grid
                          style={{
                            height: deviceHeight - height2 - height3 - 15,
                          }}
                          data={process(
                            mainDataResult2.data.map((row) => ({
                              ...row,
                              payyrmm: row.payyrmm
                                ? new Date(dateformat(row.payyrmm))
                                : new Date(dateformat("99991231")),
                              [SELECTED_FIELD]: selectedState2[idGetter2(row)], //선택된 데이터
                            })),
                            mainDataState2
                          )}
                          onDataStateChange={onMainDataStateChange2}
                          {...mainDataState2}
                          //선택 기능
                          dataItemKey={DATA_ITEM_KEY2}
                          selectedField={SELECTED_FIELD}
                          selectable={{
                            enabled: true,
                            mode: "single",
                          }}
                          onSelectionChange={onMainSelectionChange2}
                          //스크롤 조회기능
                          fixedScroll={true}
                          total={mainDataResult2.total}
                          skip={page2.skip}
                          take={page2.take}
                          pageable={true}
                          onPageChange={pageChange2}
                          //정렬기능
                          sortable={true}
                          onSortChange={onMainSortChange2}
                          //컬럼순서조정
                          reorderable={true}
                          //컬럼너비조정
                          resizable={true}
                          //더블클릭
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
                                      id={item.id}
                                      field={item.fieldName}
                                      title={item.caption}
                                      width={item.width}
                                      cell={
                                        numberField.includes(item.fieldName)
                                          ? NumberCell
                                          : dateField.includes(item.fieldName)
                                          ? MonthDateCell
                                          : undefined
                                      }
                                      footerCell={
                                        item.sortOrder == 0
                                          ? mainTotalFooterCell2
                                          : numberField.includes(item.fieldName)
                                          ? gridSumQtyFooterCell2
                                          : undefined
                                      }
                                    />
                                  )
                              )}
                        </Grid>
                      </ExcelExport>
                    </GridContainer>
                  </TabStripTab>
                  <TabStripTab title="상여(월별 내역)">
                    <GridContainer>
                      <ExcelExport
                        data={mainDataResult3.data}
                        ref={(exporter) => {
                          _export3 = exporter;
                        }}
                        fileName="개인별 명세"
                      >
                        <Grid
                          style={{
                            height: deviceHeight - height2 - height3 - 15,
                          }}
                          data={process(
                            mainDataResult3.data.map((row) => ({
                              ...row,
                              payyrmm: row.payyrmm
                                ? new Date(dateformat(row.payyrmm))
                                : new Date(dateformat("99991231")),
                              paytype: paytypeListData.find(
                                (item: any) => item.sub_code == row.paytype
                              )?.code_name,
                              [SELECTED_FIELD]: selectedState3[idGetter3(row)], //선택된 데이터
                            })),
                            mainDataState3
                          )}
                          onDataStateChange={onMainDataStateChange3}
                          {...mainDataState3}
                          //선택 기능
                          dataItemKey={DATA_ITEM_KEY3}
                          selectedField={SELECTED_FIELD}
                          selectable={{
                            enabled: true,
                            mode: "single",
                          }}
                          onSelectionChange={onMainSelectionChange3}
                          //스크롤 조회기능
                          fixedScroll={true}
                          total={mainDataResult3.total}
                          skip={page3.skip}
                          take={page3.take}
                          pageable={true}
                          onPageChange={pageChange3}
                          //정렬기능
                          sortable={true}
                          onSortChange={onMainSortChange3}
                          //컬럼순서조정
                          reorderable={true}
                          //컬럼너비조정
                          resizable={true}
                          //더블클릭
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
                                      id={item.id}
                                      field={item.fieldName}
                                      title={item.caption}
                                      width={item.width}
                                      cell={
                                        numberField.includes(item.fieldName)
                                          ? NumberCell
                                          : dateField.includes(item.fieldName)
                                          ? MonthDateCell
                                          : undefined
                                      }
                                      footerCell={
                                        item.sortOrder == 0
                                          ? mainTotalFooterCell3
                                          : numberField.includes(item.fieldName)
                                          ? gridSumQtyFooterCell3
                                          : undefined
                                      }
                                    />
                                  )
                              )}
                        </Grid>
                      </ExcelExport>
                    </GridContainer>
                  </TabStripTab>
                  <TabStripTab title="급여상여(명세서)">
                    <div
                      style={{
                        height: deviceHeight - height2 - height3 - 15,
                        marginBottom: "10px",
                      }}
                    >
                      {url != "" ? <FileViewers fileUrl={url} /> : ""}
                    </div>
                  </TabStripTab>
                </TabStrip>
              </GridContainer>
            </SwiperSlide>
          </Swiper>
        </>
      ) : (
        <>
          <GridContainerWrap>
            <GridContainer width="20%">
              <FilterContainer>
                <FilterBox>
                  <tbody>
                    <tr>
                      <th>재직여부</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionRadioGroup
                            name="paytype"
                            customOptionData={customOptionData}
                            changeData={filterRadioChange}
                          />
                        )}
                      </td>
                    </tr>
                  </tbody>
                </FilterBox>
              </FilterContainer>
              <GridContainer>
                <ButtonContainer>
                  <Button themeColor={"primary"} onClick={onSend} icon="email">
                    전송
                  </Button>
                </ButtonContainer>
                <ExcelExport
                  data={mainDataResult.data}
                  ref={(exporter) => {
                    _export = exporter;
                  }}
                  fileName="개인별 명세"
                >
                  <Grid
                    style={{ height: "80vh" }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
                        dptcd: dptcdListData.find(
                          (item: any) => item.dptcd == row.dptcd
                        )?.dptnm,
                        [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                      })),
                      mainDataState
                    )}
                    onDataStateChange={onMainDataStateChange}
                    {...mainDataState}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onMainSelectionChange}
                    //스크롤 조회기능
                    fixedScroll={true}
                    total={mainDataResult.total}
                    skip={page.skip}
                    take={page.take}
                    pageable={true}
                    onPageChange={pageChange}
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
                    <GridColumn
                      field="chk"
                      title=" "
                      width="45px"
                      headerCell={CustomCheckBoxCell2}
                      cell={CustomCheckBoxCell}
                    />
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList"]
                        ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                        ?.map(
                          (item: any, idx: number) =>
                            item.sortOrder !== -1 && (
                              <GridColumn
                                key={idx}
                                id={item.id}
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
            </GridContainer>
            <GridContainer width={`calc(80% - ${GAP}px)`}>
              <FormBoxWrap border={true}>
                <FormBox>
                  <tbody>
                    <tr>
                      <th style={{ width: "10%" }}>사번</th>
                      <td>
                        <Input
                          name="prsnnum"
                          type="text"
                          value={filters2.prsnnum}
                          className="readonly"
                        />
                      </td>
                      <th style={{ width: "10%" }}>성명</th>
                      <td>
                        <Input
                          name="prsnnm"
                          type="text"
                          value={filters2.prsnnm}
                          className="readonly"
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <TabStrip
                style={{ width: "100%" }}
                selected={tabSelected}
                onSelect={handleSelectTab}
              >
                <TabStripTab title="급여상여(월별 내역)">
                  <FilterContainer>
                    <FilterBox>
                      <tbody>
                        <tr>
                          <th>기간</th>
                          <td>
                            <CommonDateRangePicker
                              value={{
                                start: filters2.frdt,
                                end: filters2.todt,
                              }}
                              onChange={(e: {
                                value: { start: any; end: any };
                              }) => {
                                setFilters2((prev) => ({
                                  ...prev,
                                  frdt: e.value.start,
                                  todt: e.value.end,
                                }));
                                setFilters3((prev) => ({
                                  ...prev,
                                  frdt: e.value.start,
                                  todt: e.value.end,
                                }));
                              }}
                              className="required"
                            />
                          </td>
                          <td>
                            <Button
                              onClick={search2}
                              icon="search"
                              themeColor={"primary"}
                            >
                              조회
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </FilterBox>
                  </FilterContainer>
                  <GridContainer>
                    <ExcelExport
                      data={mainDataResult2.data}
                      ref={(exporter) => {
                        _export2 = exporter;
                      }}
                      fileName="개인별 명세"
                    >
                      <Grid
                        style={{ height: "33.5vh" }}
                        data={process(
                          mainDataResult2.data.map((row) => ({
                            ...row,
                            payyrmm: row.payyrmm
                              ? new Date(dateformat(row.payyrmm))
                              : new Date(dateformat("99991231")),
                            [SELECTED_FIELD]: selectedState2[idGetter2(row)], //선택된 데이터
                          })),
                          mainDataState2
                        )}
                        onDataStateChange={onMainDataStateChange2}
                        {...mainDataState2}
                        //선택 기능
                        dataItemKey={DATA_ITEM_KEY2}
                        selectedField={SELECTED_FIELD}
                        selectable={{
                          enabled: true,
                          mode: "single",
                        }}
                        onSelectionChange={onMainSelectionChange2}
                        //스크롤 조회기능
                        fixedScroll={true}
                        total={mainDataResult2.total}
                        skip={page2.skip}
                        take={page2.take}
                        pageable={true}
                        onPageChange={pageChange2}
                        //정렬기능
                        sortable={true}
                        onSortChange={onMainSortChange2}
                        //컬럼순서조정
                        reorderable={true}
                        //컬럼너비조정
                        resizable={true}
                        //더블클릭
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
                                    id={item.id}
                                    field={item.fieldName}
                                    title={item.caption}
                                    width={item.width}
                                    cell={
                                      numberField.includes(item.fieldName)
                                        ? NumberCell
                                        : dateField.includes(item.fieldName)
                                        ? MonthDateCell
                                        : undefined
                                    }
                                    footerCell={
                                      item.sortOrder == 0
                                        ? mainTotalFooterCell2
                                        : numberField.includes(item.fieldName)
                                        ? gridSumQtyFooterCell2
                                        : undefined
                                    }
                                  />
                                )
                            )}
                      </Grid>
                    </ExcelExport>
                  </GridContainer>
                  <GridContainer>
                    <ExcelExport
                      data={mainDataResult3.data}
                      ref={(exporter) => {
                        _export3 = exporter;
                      }}
                      fileName="개인별 명세"
                    >
                      <Grid
                        style={{ height: "33.5vh" }}
                        data={process(
                          mainDataResult3.data.map((row) => ({
                            ...row,
                            payyrmm: row.payyrmm
                              ? new Date(dateformat(row.payyrmm))
                              : new Date(dateformat("99991231")),
                            paytype: paytypeListData.find(
                              (item: any) => item.sub_code == row.paytype
                            )?.code_name,
                            [SELECTED_FIELD]: selectedState3[idGetter3(row)], //선택된 데이터
                          })),
                          mainDataState3
                        )}
                        onDataStateChange={onMainDataStateChange3}
                        {...mainDataState3}
                        //선택 기능
                        dataItemKey={DATA_ITEM_KEY3}
                        selectedField={SELECTED_FIELD}
                        selectable={{
                          enabled: true,
                          mode: "single",
                        }}
                        onSelectionChange={onMainSelectionChange3}
                        //스크롤 조회기능
                        fixedScroll={true}
                        total={mainDataResult3.total}
                        skip={page3.skip}
                        take={page3.take}
                        pageable={true}
                        onPageChange={pageChange3}
                        //정렬기능
                        sortable={true}
                        onSortChange={onMainSortChange3}
                        //컬럼순서조정
                        reorderable={true}
                        //컬럼너비조정
                        resizable={true}
                        //더블클릭
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
                                    id={item.id}
                                    field={item.fieldName}
                                    title={item.caption}
                                    width={item.width}
                                    cell={
                                      numberField.includes(item.fieldName)
                                        ? NumberCell
                                        : dateField.includes(item.fieldName)
                                        ? MonthDateCell
                                        : undefined
                                    }
                                    footerCell={
                                      item.sortOrder == 0
                                        ? mainTotalFooterCell3
                                        : numberField.includes(item.fieldName)
                                        ? gridSumQtyFooterCell3
                                        : undefined
                                    }
                                  />
                                )
                            )}
                      </Grid>
                    </ExcelExport>
                  </GridContainer>
                </TabStripTab>
                <TabStripTab title="급여상여(명세서)">
                  <FilterContainer>
                    <FilterBox>
                      <tbody>
                        <tr>
                          <th>급여유형</th>
                          <td>
                            {customOptionData !== null && (
                              <CustomOptionComboBox
                                name="paytypeCombo"
                                value={filters4.paytypeCombo}
                                customOptionData={customOptionData}
                                changeData={filterComboBoxChange}
                              />
                            )}
                          </td>
                          <th>년월</th>
                          <td>
                            <DatePicker
                              name="prdate"
                              value={filters4.prdate}
                              format="yyyy-MM"
                              onChange={filterInputChange}
                              className="required"
                              placeholder=""
                              calendar={MonthCalendar}
                            />
                          </td>
                          <td>
                            <Button
                              onClick={search3}
                              icon="search"
                              themeColor={"primary"}
                            >
                              조회
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </FilterBox>
                  </FilterContainer>
                  <div
                    style={{
                      height: "67vh",
                      marginBottom: "10px",
                    }}
                  >
                    {url != "" ? <FileViewers fileUrl={url} /> : ""}
                  </div>
                </TabStripTab>
              </TabStrip>
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

export default HU_B3120W;
