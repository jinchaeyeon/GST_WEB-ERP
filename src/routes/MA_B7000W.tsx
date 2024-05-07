import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
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
import { Input } from "@progress/kendo-react-inputs";
import { bytesToBase64 } from "byte-base64";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
  ButtonInInput,
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
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  findMessage,
  getQueryFromBizComponent,
  handleKeyPressSearch,
  setDefaultDate,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { useApi } from "../hooks/api";
import { IItemData } from "../hooks/interfaces";
import { isLoading, loginResultState } from "../store/atoms";
import { gridList } from "../store/columns/MA_B7000W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const numberField = [
  "safeqty",
  "stockqty",
  "stockwgt",
  "unp",
  "baseqty",
  "basewgt",
  "inqty",
  "inwgt",
  "outqty",
  "outwgt",
  "amt",
  "amt2",
  "unp2",
  "bnatur_insiz",
];
var index = 0;

const dateField = ["indt"];

//그리드 별 키 필드값
const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;
let targetRowIndex3: null | number = null;

const MA_B7000: React.FC = () => {
  const [swiper, setSwiper] = useState<SwiperCore>();
  let deviceWidth = window.innerWidth;
  let deviceHeight = window.innerHeight - 50;
  let isMobile = deviceWidth <= 1200;
  var index = 0;
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);

  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");

  // 권한
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("MA_B7000W", setCustomOptionData);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA171,L_BA172,L_BA173,L_BA042",
    //대분류,중분류,소분류,품목등급
    setBizComponentData
  );

  const [itemlvl1ListData, setItemlvl1ListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl2ListData, setItemlvl2ListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl3ListData, setItemlvl3ListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemgradeListData, setItemgradeListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const itemlvl1QueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA171")
      );
      const itemlvl2QueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA172")
      );
      const itemlvl3QueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA173")
      );
      const itemgradeQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA042")
      );

      fetchQuery(itemlvl1QueryStr, setItemlvl1ListData);
      fetchQuery(itemlvl2QueryStr, setItemlvl2ListData);
      fetchQuery(itemlvl3QueryStr, setItemlvl3ListData);
      fetchQuery(itemgradeQueryStr, setItemgradeListData);
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

  //그리드 데이터 스테이트
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [detail1DataState, setDetail1DataState] = useState<State>({
    sort: [],
  });

  const [detail2DataState, setDetail2DataState] = useState<State>({
    sort: [],
  });

  //그리드 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [detail1DataResult, setDetail1DataResult] = useState<DataResult>(
    process([], detail1DataState)
  );

  const [detail2DataResult, setDetail2DataResult] = useState<DataResult>(
    process([], detail2DataState)
  );

  //선택 상태
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailSelectedState2, setDetailSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailSelectedState3, setDetailSelectedState3] = useState<{
    [id: string]: boolean | number[];
  }>({});

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
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
  };

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //페이지네이션 세팅
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setDetailFilters1((prev) => ({
      ...prev,
      pgNum: 1,
    }));

    setPage2(initialPageState);
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

    setDetailFilters2((prev) => ({
      ...prev,
      pgNum: 1,
    }));

    setPage3(initialPageState);
    setDetailFilters1((prev) => ({
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

    setDetailFilters2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage3({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "LIST",
    orgdiv: sessionOrgdiv,
    cboLocation: "",
    itemcd: "",
    itemnm: "",
    insiz: "",
    ymdyyyy: new Date(),
    cboItemacnt: "", //filterData.find((item: any) => item.name == "itemacnt").value,
    radzeroyn: "",
    lotnum: "",
    load_place: "",
    heatno: "",
    cboItemlvl1: "",
    cboItemlvl2: "",
    cboItemlvl3: "",
    radUseyn: "", //filterData.find((item: any) => item.name == "useyn").value,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
    itemgrade: "",
  });

  const [detailFilters1, setDetailFilters1] = useState({
    pgSize: PAGE_SIZE,
    work_type: "DETAIL1",
    itemcd: "",
    itemgrade: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [detailFilters2, setDetailFilters2] = useState({
    pgSize: PAGE_SIZE,
    work_type: "DETAIL2",
    lotnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //그리드 데이터 조회1
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_MA_B7000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "LIST",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.cboLocation,
        "@p_yyyymm": convertDateToStr(filters.ymdyyyy).slice(0, 4),
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_insiz": filters.insiz,
        "@p_itemacnt": filters.cboItemacnt,
        "@p_zeroyn": filters.radzeroyn,
        "@p_lotnum": filters.lotnum,
        "@p_load_place": filters.load_place,
        "@p_heatno": filters.heatno,
        "@p_itemlvl1": filters.cboItemlvl1,
        "@p_itemlvl2": filters.cboItemlvl2,
        "@p_itemlvl3": filters.cboItemlvl3,
        "@p_useyn": filters.radUseyn,
        "@p_itemgrade": filters.itemgrade,
        "@p_company_code": companyCode,
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
        setDetailFilters1((prev) => ({
          ...prev,
          itemcd: rows[0].itemcd,
          itemgrade: rows[0].itemgrade,
          isSearch: true,
          pgNum: 1,
        }));
      } else {
        setDetail1DataResult(process([], detail1DataState));
        setDetail2DataResult(process([], detail2DataState));
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

  //그리드 데이터 조회2
  const fetchDetailGrid1 = async (detailFilters1: any) => {
    let data: any;
    setLoading(true);
    const detailParameters: Iparameters = {
      procedureName: "P_MA_B7000W_Q",
      pageNumber: detailFilters1.pgNum,
      pageSize: detailFilters1.pgSize,
      parameters: {
        "@p_work_type": "DETAIL1",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.cboLocation,
        "@p_yyyymm": convertDateToStr(filters.ymdyyyy).slice(0, 4),
        "@p_itemcd": detailFilters1.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_insiz": filters.insiz,
        "@p_itemacnt": filters.cboItemacnt,
        "@p_zeroyn": filters.radzeroyn,
        "@p_lotnum": filters.lotnum,
        "@p_load_place": filters.load_place,
        "@p_heatno": filters.heatno,
        "@p_itemlvl1": filters.cboItemlvl1,
        "@p_itemlvl2": filters.cboItemlvl2,
        "@p_itemlvl3": filters.cboItemlvl3,
        "@p_useyn": filters.radUseyn,
        "@p_itemgrade": detailFilters1.itemgrade,
        "@p_company_code": companyCode,
      },
    };
    try {
      data = await processApi<any>("procedure", detailParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setDetail1DataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        setDetailSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
        setDetailFilters2((prev) => ({
          ...prev,
          lotnum: rows[0].lotnum,
          isSearch: true,
          pgNum: 1,
        }));
      } else {
        setDetail2DataResult(process([], detail2DataState));
      }
    }
    setDetailFilters1((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  //그리드 데이터 조회3
  const fetchDetailGrid2 = async (detailFilters2: any) => {
    let data: any;
    setLoading(true);

    const detailParameters: Iparameters = {
      procedureName: "P_MA_B7000W_Q",
      pageNumber: detailFilters2.pgNum,
      pageSize: detailFilters2.pgSize,
      parameters: {
        "@p_work_type": "DETAIL2",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.cboLocation,
        "@p_yyyymm": convertDateToStr(filters.ymdyyyy).slice(0, 4),
        "@p_itemcd": detailFilters1.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_insiz": filters.insiz,
        "@p_itemacnt": filters.cboItemacnt,
        "@p_zeroyn": filters.radzeroyn,
        "@p_lotnum": detailFilters2.lotnum,
        "@p_load_place": filters.load_place,
        "@p_heatno": filters.heatno,
        "@p_itemlvl1": filters.cboItemlvl1,
        "@p_itemlvl2": filters.cboItemlvl2,
        "@p_itemlvl3": filters.cboItemlvl3,
        "@p_useyn": filters.radUseyn,
        "@p_itemgrade": detailFilters1.itemgrade,
        "@p_company_code": companyCode,
      },
    };

    try {
      data = await processApi<any>("procedure", detailParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setDetail2DataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setDetailSelectedState3({ [rows[0][DATA_ITEM_KEY3]]: true });
      }
    }
    setDetailFilters2((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행1
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행2
  useEffect(() => {
    if (detailFilters1.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailFilters1);
      setDetailFilters1((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchDetailGrid1(deepCopiedFilters);
    }
  }, [detailFilters1]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행3
  useEffect(() => {
    if (detailFilters2.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailFilters2);
      setDetailFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchDetailGrid2(deepCopiedFilters);
    }
  }, [detailFilters2]);

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);
  let gridRef3: any = useRef(null);
  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동2
    if (targetRowIndex2 !== null && gridRef2.current) {
      gridRef2.current.scrollIntoView({ rowIndex: targetRowIndex2 });
      targetRowIndex2 = null;
    }
  }, [detail1DataResult]);
  //
  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동3
    if (targetRowIndex3 !== null && gridRef3.current) {
      gridRef3.current.scrollIntoView({ rowIndex: targetRowIndex3 });
      targetRowIndex3 = null;
    }
  }, [detail2DataResult]);

  const [messagesData, setMessagesData] = useState<any>(null);
  UseMessages("MA_B7000W", setMessagesData);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setDetail1DataResult(process([], detail1DataState));
    setDetail2DataResult(process([], detail2DataState));
  };

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    const itemgrade = itemgradeListData.find(
      (item: any) => item.code_name == selectedRowData.itemgrade
    )?.sub_code;

    setDetailFilters1((prev) => ({
      ...prev,
      itemcd: selectedRowData.itemcd,
      itemgrade: itemgrade == undefined ? "A" : itemgrade,
      isSearch: true,
      pgNum: 1,
    }));
    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  //디테일1 그리드 선택 이벤트 => 디테일2 그리드 조회
  const onDetailSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailSelectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });
    setDetailSelectedState2(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setDetailFilters2((prev) => ({
      ...prev,
      lotnum: selectedRowData.lotnum,
      isSearch: true,
      pgNum: 1,
    }));
    if (swiper && isMobile) {
      swiper.slideTo(2);
		}
  };

  const onDetailSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailSelectedState3,
      dataItemKey: DATA_ITEM_KEY3,
    });
    setDetailSelectedState3(newSelectedState);
  };

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  let _export3: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      const optionsGridTwo = _export2.workbookOptions();
      const optionsGridThree = _export3.workbookOptions();
      optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
      optionsGridOne.sheets[2] = optionsGridThree.sheets[0];
      optionsGridOne.sheets[0].title = "요약정보";
      optionsGridOne.sheets[1].title = "계정별LOT";
      optionsGridOne.sheets[2].title = "LOT별 상세이력";
      _export.save(optionsGridOne);
    }
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onDetail1DataStateChange = (event: GridDataStateChangeEvent) => {
    setDetail1DataState(event.dataState);
  };
  const onDetail2DataStateChange = (event: GridDataStateChangeEvent) => {
    setDetail2DataState(event.dataState);
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
    detail1DataResult.data.forEach((item) =>
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
    detail2DataResult.data.forEach((item) =>
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

  const detail1TotalFooterCell = (props: GridFooterCellProps) => {
    var parts = detail1DataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {detail1DataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const detail2TotalFooterCell = (props: GridFooterCellProps) => {
    var parts = detail2DataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {detail2DataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  //품목마스터 팝업
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };
  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetail1SortChange = (e: any) => {
    setDetail1DataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetail2SortChange = (e: any) => {
    setDetail2DataState((prev) => ({ ...prev, sort: e.sort }));
  };

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      const ids = [
        "cboItemacnt",
        "cboItemlvl1",
        "cboItemlvl2",
        "cboItemlvl3",
        "cboLocation",
        "radUseyn",
        "radzeroyn",
      ];

      // Combo, Radio
      ids.forEach((id) =>
        setFilters((prev) => ({
          ...prev,
          [id]: defaultOption.find((item: any) => item.id == id)?.valueCode,
        }))
      );

      // Date
      setFilters((prev) => ({
        ...prev,
        ymdyyyy: setDefaultDate(customOptionData, "ymdyyyy"),
      }));
    }
  }, [customOptionData]);

  const search = () => {
    try {
      if (filters.ymdyyyy == null || filters.ymdyyyy == undefined) {
        throw findMessage(messagesData, "MA_B7000W_001");
      } else {
        resetAllGrid();
        setPage(initialPageState); // 페이지 초기화
        setPage2(initialPageState); // 페이지 초기화
        setPage3(initialPageState); // 페이지 초기화
        setFilters((prev: any) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
      }
    } catch (e) {
      alert(e);
    }
    if (swiper && isMobile) {
      swiper.slideTo(0);
    }
  };

  return (
    <>
      <TitleContainer>
        <Title>재고조회</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="MA_B7000W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>재고년도</th>
              <td>
                <DatePicker
                  name="ymdyyyy"
                  value={filters.ymdyyyy}
                  format="yyyy"
                  onChange={filterInputChange}
                  calendar={YearCalendar}
                  className="required"
                  placeholder=""
                />
              </td>

              <th>품목코드</th>
              <td>
                <Input
                  name="itemcd"
                  type="text"
                  value={filters.itemcd}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    onClick={onItemWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
              <th>품목명</th>
              <td>
                <Input
                  name="itemnm"
                  type="text"
                  value={filters.itemnm}
                  onChange={filterInputChange}
                />
              </td>

              <th>품목계정</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="cboItemacnt"
                    value={filters.cboItemacnt}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>

              <th>대분류</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="cboItemlvl1"
                    value={filters.cboItemlvl1}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>

              <th>중분류</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="cboItemlvl2"
                    value={filters.cboItemlvl2}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>

              <th>소분류</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="cboItemlvl3"
                    value={filters.cboItemlvl3}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
            </tr>

            <tr>
              <th>사용여부</th>
              <td style={{ minWidth: "220px" }}>
                {customOptionData !== null && (
                  <CommonRadioGroup
                    name="radUseyn"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>

              <th>재고수량</th>
              <td colSpan={3}>
                <div className="radio_form_box">
                  <div className="radio_inner">
                    {customOptionData !== null && (
                      <CommonRadioGroup
                        name="radzeroyn"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </div>
                </div>
              </td>
              <th>사업장</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="cboLocation"
                    value={filters.cboLocation}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>

              <th>LOT NO</th>
              <td>
                <Input
                  name="lotnum"
                  type="text"
                  value={filters.lotnum}
                  onChange={filterInputChange}
                />
              </td>

              <th>규격</th>
              <td>
                <Input
                  name="insiz"
                  type="text"
                  value={filters.insiz}
                  onChange={filterInputChange}
                />
              </td>

              <th>적재장소</th>
              <td>
                <Input
                  name="load_place"
                  type="text"
                  value={filters.load_place}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>

      {isMobile ? (
        <>
          <GridContainerWrap>
            <Swiper
              className="leading_78_Swiper"
              onSwiper={(swiper) => {
                setSwiper(swiper);
              }}
              onActiveIndexChange={(swiper) => {
                index = swiper.activeIndex;
              }}
            >
              <SwiperSlide key={0} className="leading_PDA_custom">
                <GridContainer style={{ height: "100%" }}>
                  <ExcelExport
                    data={mainDataResult.data}
                    ref={(exporter) => {
                      _export = exporter;
                    }}
                    fileName="재고조회"
                  >
                    <Grid
                      style={{
                        height: `${deviceHeight * 0.8 + 10}px`,
                        width: "90vw",
                      }}
                      data={process(
                        mainDataResult.data.map((row) => ({
                          ...row,
                          itemlvl1: itemlvl1ListData.find(
                            (item: any) => item.sub_code == row.itemlvl1
                          )?.code_name,
                          itemlvl2: itemlvl2ListData.find(
                            (item: any) => item.sub_code == row.itemlvl2
                          )?.code_name,
                          itemlvl3: itemlvl3ListData.find(
                            (item: any) => item.sub_code == row.itemlvl3
                          )?.code_name,
                          itemgrade: itemgradeListData.find(
                            (item: any) => item.sub_code == row.itemgrade
                          )?.code_name,
                          [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
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
                      onSelectionChange={onMainSelectionChange}
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
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell
                                    : numberField.includes(item.fieldName)
                                    ? gridSumQtyFooterCell
                                    : undefined
                                }
                                locked={item.fixed == "None" ? false : true}
                              ></GridColumn>
                            )
                        )}
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </SwiperSlide>
              <SwiperSlide key={1} className="leading_PDA_custom">
                <GridContainer style={{ height: "100%" }}>
                  <GridTitleContainer>
                    <GridTitle>계정별LOT</GridTitle>
                  </GridTitleContainer>
                  <div
                  style={{
                    display: "flex",
                    justifyContent: "left",
                    width: "100%",
                  }}
                >
                  <Button
                    onClick={() => {
                      if (swiper) {
                        swiper.slideTo(0);
                      }
                    }}
                    icon="arrow-left"
                    themeColor={"primary"}
                    fillMode={"outline"}
                  >
                    이전
                  </Button>
                </div>
                  <ExcelExport
                    data={detail1DataResult.data}
                    ref={(exporter) => {
                      _export2 = exporter;
                    }}
                    fileName="재고조회"
                  >
                    <Grid
                      style={{
                        height: `${deviceHeight * 0.8 - 50}px`,
                        width: "90vw",
                      }}
                      data={process(
                        detail1DataResult.data.map((row) => ({
                          ...row,
                          [SELECTED_FIELD]:
                            detailSelectedState2[idGetter2(row)],
                        })),
                        detail1DataState
                      )}
                      {...detail1DataState}
                      onDataStateChange={onDetail1DataStateChange}
                      //선택기능
                      dataItemKey={DATA_ITEM_KEY2}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onDetailSelectionChange2}
                      //정렬기능
                      sortable={true}
                      onSortChange={onDetail1SortChange}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={detail1DataResult.total}
                      skip={page2.skip}
                      take={page2.take}
                      pageable={true}
                      onPageChange={pageChange2}
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef}
                      rowHeight={3}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                    >
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions[
                          "grdList2"
                        ]?.map(
                          (item: any, idx: number) =>
                            item.sortOrder !== -1 && (
                              <GridColumn
                                key={idx}
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
                                  item.sortOrder == 0
                                    ? detail1TotalFooterCell
                                    : numberField.includes(item.fieldName)
                                    ? gridSumQtyFooterCell2
                                    : undefined
                                }
                                locked={item.fixed == "None" ? false : true}
                              />
                            )
                        )}
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </SwiperSlide>
              <SwiperSlide key={2} className="leading_PDA_custom">
                <GridContainer style={{ width: "100%", height: "100%" }}>
                  <GridTitleContainer>
                    <GridTitle>LOT별 상세이력</GridTitle>
                  </GridTitleContainer>
                  <div
                  style={{
                    display: "flex",
                    justifyContent: "left",
                    width: "100%",
                  }}
                >
                  <Button
                    onClick={() => {
                      if (swiper) {
                        swiper.slideTo(1);
                      }
                    }}
                    icon="arrow-left"
                    themeColor={"primary"}
                    fillMode={"outline"}
                  >
                    이전
                  </Button>
                </div>
                  <ExcelExport
                    data={detail2DataResult.data}
                    ref={(exporter) => {
                      _export3 = exporter;
                    }}
                    fileName="재고조회"
                  >
                    <Grid
                      style={{
                        height: `${deviceHeight * 0.8 - 50}px`,
                        width: "90vw",
                      }}
                      data={process(
                        detail2DataResult.data.map((row) => ({
                          ...row,
                          [SELECTED_FIELD]:
                            detailSelectedState3[idGetter3(row)],
                        })),
                        detail2DataState
                      )}
                      {...detail2DataState}
                      onDataStateChange={onDetail2DataStateChange}
                      //정렬기능
                      sortable={true}
                      onSortChange={onDetail2SortChange}
                      dataItemKey={DATA_ITEM_KEY3}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onDetailSelectionChange3}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={detail2DataResult.total}
                      skip={page3.skip}
                      take={page3.take}
                      pageable={true}
                      onPageChange={pageChange3}
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef3}
                      rowHeight={30}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                    >
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions[
                          "grdList3"
                        ]?.map(
                          (item: any, idx: number) =>
                            item.sortOrder !== -1 && (
                              <GridColumn
                                key={idx}
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
                                  item.sortOrder == 0
                                    ? detail2TotalFooterCell
                                    : numberField.includes(item.fieldName)
                                    ? gridSumQtyFooterCell3
                                    : undefined
                                }
                                locked={item.fixed == "None" ? false : true}
                              ></GridColumn>
                            )
                        )}
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </SwiperSlide>
            </Swiper>
          </GridContainerWrap>
        </>
      ) : (
        <>
          <GridContainer>
            <GridTitleContainer>
              <GridTitle>요약정보</GridTitle>
            </GridTitleContainer>
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
              fileName="재고조회"
            >
              <Grid
                style={{ height: "36vh" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    itemlvl1: itemlvl1ListData.find(
                      (item: any) => item.sub_code == row.itemlvl1
                    )?.code_name,
                    itemlvl2: itemlvl2ListData.find(
                      (item: any) => item.sub_code == row.itemlvl2
                    )?.code_name,
                    itemlvl3: itemlvl3ListData.find(
                      (item: any) => item.sub_code == row.itemlvl3
                    )?.code_name,
                    itemgrade: itemgradeListData.find(
                      (item: any) => item.sub_code == row.itemgrade
                    )?.code_name,
                    [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
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
                onSelectionChange={onMainSelectionChange}
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
                  customOptionData.menuCustomColumnOptions["grdList"]?.map(
                    (item: any, idx: number) =>
                      item.sortOrder !== -1 && (
                        <GridColumn
                          key={idx}
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
                            item.sortOrder == 0
                              ? mainTotalFooterCell
                              : numberField.includes(item.fieldName)
                              ? gridSumQtyFooterCell
                              : undefined
                          }
                          locked={item.fixed == "None" ? false : true}
                        ></GridColumn>
                      )
                  )}
              </Grid>
            </ExcelExport>
          </GridContainer>
          <GridContainerWrap>
            <GridContainer width={`20%`}>
              <GridTitleContainer>
                <GridTitle>계정별LOT</GridTitle>
              </GridTitleContainer>
              <ExcelExport
                data={detail1DataResult.data}
                ref={(exporter) => {
                  _export2 = exporter;
                }}
                fileName="재고조회"
              >
                <Grid
                  style={{ height: "37.5vh" }}
                  data={process(
                    detail1DataResult.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: detailSelectedState2[idGetter2(row)],
                    })),
                    detail1DataState
                  )}
                  {...detail1DataState}
                  onDataStateChange={onDetail1DataStateChange}
                  //선택기능
                  dataItemKey={DATA_ITEM_KEY2}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onDetailSelectionChange2}
                  //정렬기능
                  sortable={true}
                  onSortChange={onDetail1SortChange}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={detail1DataResult.total}
                  skip={page2.skip}
                  take={page2.take}
                  pageable={true}
                  onPageChange={pageChange2}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef}
                  rowHeight={3}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                >
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList2"]?.map(
                      (item: any, idx: number) =>
                        item.sortOrder !== -1 && (
                          <GridColumn
                            key={idx}
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
                              item.sortOrder == 0
                                ? detail1TotalFooterCell
                                : numberField.includes(item.fieldName)
                                ? gridSumQtyFooterCell2
                                : undefined
                            }
                            locked={item.fixed == "None" ? false : true}
                          />
                        )
                    )}
                </Grid>
              </ExcelExport>
            </GridContainer>
            <GridContainer width={`calc(80% - ${GAP}px)`}>
              <GridTitleContainer>
                <GridTitle>LOT별 상세이력</GridTitle>
              </GridTitleContainer>
              <ExcelExport
                data={detail2DataResult.data}
                ref={(exporter) => {
                  _export3 = exporter;
                }}
                fileName="재고조회"
              >
                <Grid
                  style={{ height: "37.5vh" }}
                  data={process(
                    detail2DataResult.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: detailSelectedState3[idGetter3(row)],
                    })),
                    detail2DataState
                  )}
                  {...detail2DataState}
                  onDataStateChange={onDetail2DataStateChange}
                  //정렬기능
                  sortable={true}
                  onSortChange={onDetail2SortChange}
                  dataItemKey={DATA_ITEM_KEY3}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onDetailSelectionChange3}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={detail2DataResult.total}
                  skip={page3.skip}
                  take={page3.take}
                  pageable={true}
                  onPageChange={pageChange3}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef3}
                  rowHeight={30}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                >
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList3"]?.map(
                      (item: any, idx: number) =>
                        item.sortOrder !== -1 && (
                          <GridColumn
                            key={idx}
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
                              item.sortOrder == 0
                                ? detail2TotalFooterCell
                                : numberField.includes(item.fieldName)
                                ? gridSumQtyFooterCell3
                                : undefined
                            }
                            locked={item.fixed == "None" ? false : true}
                          ></GridColumn>
                        )
                    )}
                </Grid>
              </ExcelExport>
            </GridContainer>
          </GridContainerWrap>
        </>
      )}
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"FILTER"}
          setData={setItemData}
          modal={true}
        />
      )}

      {/* 컨트롤 네임 불러오기 용 */}
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

export default MA_B7000;
