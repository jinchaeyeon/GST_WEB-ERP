import { useSetRecoilState } from "recoil";
import { 
  ButtonContainer, 
  ButtonInInput, 
  FilterBox, 
  GridContainer, 
  GridContainerWrap, 
  GridTitle, 
  GridTitleContainer, 
  Title, 
  TitleContainer 
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { isLoading } from "../store/atoms";
import { useCallback, useEffect, useRef, useState } from "react";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
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
  setDefaultDate 
} from "../components/CommonFunction";
import { useApi } from "../hooks/api";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import React from "react";
import FilterContainer from "../components/Containers/FilterContainer";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import { COM_CODE_DEFAULT_VALUE, GAP, PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import { Input } from "@progress/kendo-react-inputs";
import { Button } from "@progress/kendo-react-buttons";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { ICustData, IItemData } from "../hooks/interfaces";
import { 
  Grid, 
  GridColumn, 
  GridDataStateChangeEvent, 
  GridFooterCellProps, 
  GridPageChangeEvent, 
  GridSelectionChangeEvent, 
  getSelectedState 
} from "@progress/kendo-react-grid";
import NumberCell from "../components/Cells/NumberCell";
import DateCell from "../components/Cells/DateCell";
import { bytesToBase64 } from "byte-base64";
import { gridList } from "../store/columns/QC_B0030W_C";

const DATA_ITEM_KEY = "num";
const DETAIL_DATA_ITEM_KEY = "num";
const DETAIL_DATA_ITEM_KEY2 = "num";

let targetRowIndex: null | number = null;

const numberField = ["qty", "badqty"];
const dateField = ["outdt", "proddt"];

const QC_B0030W: React.FC = () => {
  const orgdiv = UseGetValueFromSessionItem("orgdiv");
  const location = UseGetValueFromSessionItem("location");
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DETAIL_DATA_ITEM_KEY);
  const idGetter3 = getter(DETAIL_DATA_ITEM_KEY2);
  const processApi = useApi();
  
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);

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
      const defaultOption = GetPropertyValueByName(customOptionData.menuCustomDefaultOptions, 
        "query");
      setFilters((prev) => ({
        ...prev,
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
        dtgb: defaultOption.find((item: any) => item.id === "dtgb")
          .valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_PR010, L_sysUserMaster_001, L_fxcode, L_QC002, L_BA061",
    //공정, 작업자, 설비, 불량유형, 품목계정
    setBizComponentData
  );

  // 공통코드 리스트 조회
  const [proccdListData, setProccdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  const [prodempListData, setProdempListData] = useState([
    {user_id: "", user_name: ""},
  ]);

  const [prodmacListData, setProdmacListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  const [badcdListData, setBadcdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  const [itemacntListData, setItemacntListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const proccdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_PR010")
      );
      const prodempQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_sysUserMaster_001")
      );
      const prodmacQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_fxcode")
      );
      const badcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_QC002")
      );
      const itemacntQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA061")
      );
      fetchQuery(proccdQueryStr, setProccdListData);
      fetchQuery(prodempQueryStr, setProdempListData);
      fetchQuery(prodmacQueryStr, setProdmacListData);
      fetchQuery(badcdQueryStr, setBadcdListData);
      fetchQuery(itemacntQueryStr, setItemacntListData);
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

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

    //일자조건 변경될 시 재조회하게끔
    if (name == "dtgb") {
      search();
    }
  };

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  //업체마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  //품목마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setDetailFilters((prev) => ({
      ...prev,
      isSearch: true,
      pgNum: 1,
    }));
    setDetailFilters2((prev) => ({
      ...prev,
      isSearch: true,
      pgNum: 1,
    }));

    setPage2(initialPageState);
    setPage3(initialPageState);

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

    setDetailFilters((prev) => ({
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
  };

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [detailDataState, setDetailDataState] = useState<State>({
    sort: [],
  });
  const [detailDataState2, setDetailDataState2] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], detailDataState)
  );
  const [detailDataResult2, setDetailDataResult2] = useState<DataResult>(
    process([], detailDataState2)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [detailSelectedState, setDetailSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [detailSelectedState2, setDetailSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q",
    orgdiv: orgdiv,
    location: location,
    dtgb: "",
    frdt: new Date(),
    todt: new Date(),
    itemcd: "",
    itemnm: "",
    planno: "",
    lotnum: "",
    custcd: "",
    custnm: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [detailFilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    lotnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [detailFilters2, setDetailFilters2] = useState({
    pgSize: PAGE_SIZE,
    lotnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  let gridRef: any = useRef(null);

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_QC_B0030W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "LIST",
        "@p_orgdiv": orgdiv,
        "@p_location": location,
        "@p_dtgb": filters.dtgb,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_lotnum": filters.lotnum,
        "@p_planno": filters.planno,
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

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row[DATA_ITEM_KEY] == filters.find_row_value
          );
          targetRowIndex = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef.current) {
          targetRowIndex = 0;
        }
      }

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) => row[DATA_ITEM_KEY] == filters.find_row_value
              );
        
        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          setDetailFilters((prev) => ({
            ...prev,
            planno: selectedRow.planno,
            isSearch: true,
            pgNum: 1,
          }));
          setDetailFilters2((prev) => ({
            ...prev,
            planno: selectedRow.planno,
            isSearch: true,
            pgNum: 1,
          }));
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setDetailFilters((prev) => ({
            ...prev,
            planno: rows[0].planno,
            isSearch: true,
            pgNum: 1,
          }));
          setDetailFilters2((prev) => ({
            ...prev,
            planno: rows[0].planno,
            isSearch: true,
            pgNum: 1,
          }));
        }
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
    setLoading(false);
  };
  
  const fetchDetailGrid = async (detailFilters: any) => {
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_QC_B0030W_Q",
      pageNumber: detailFilters.pgNum,
      pageSize: detailFilters.pgSize,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_orgdiv": orgdiv,
        "@p_location": "",
        "@p_dtgb": "",
        "@p_frdt": "",
        "@p_todt": "",
        "@p_itemcd": "",
        "@p_itemnm": "",
        "@p_custcd": "",
        "@p_custnm": "",
        "@p_lotnum": "",
        "@p_planno": detailFilters.planno,
        "@p_find_row_value": "",
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

      setDetailDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setDetailSelectedState({ [rows[0][DETAIL_DATA_ITEM_KEY]]: true });
      }
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

  const fetchDetailGrid2 = async (detailFilters2: any) => {
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_QC_B0030W_Q",
      pageNumber: detailFilters2.pgNum,
      pageSize: detailFilters2.pgSize,
      parameters: {
        "@p_work_type": "INLOT",
        "@p_orgdiv": orgdiv,
        "@p_location": "",
        "@p_dtgb": "",
        "@p_frdt": "",
        "@p_todt": "",
        "@p_itemcd": "",
        "@p_itemnm": "",
        "@p_custcd": "",
        "@p_custnm": "",
        "@p_lotnum": "",
        "@p_planno": detailFilters2.planno,
        "@p_find_row_value": "",
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

      setDetailDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setDetailSelectedState2({ [rows[0][DETAIL_DATA_ITEM_KEY2]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && permissions !== null) {
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (detailFilters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailFilters);
      setDetailFilters((prev) => ({
        ...prev,
        pgNum: 1,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchDetailGrid(deepCopiedFilters);
    }
  }, [detailFilters]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (detailFilters2.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailFilters2);
      setDetailFilters2((prev) => ({
        ...prev,
        pgNum: 1,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchDetailGrid2(deepCopiedFilters);
    }
  }, [detailFilters2]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setDetailDataResult(process([], detailDataState));
    setDetailDataResult2(process([], detailDataState2));
  };

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onDetailDataStateChange = (event: GridDataStateChangeEvent) => {
    setDetailDataState(event.dataState);
  };
  const onDetailDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setDetailDataState2(event.dataState);
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
      planno: selectedRowData.planno,
      isSearch: true,
      pgNum: 1,
    }));
    setDetailFilters2((prev) => ({
      ...prev,
      planno: selectedRowData.planno,
      isSearch: true,
      pgNum: 1,
    }));
  };

  const onDetailSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailSelectedState,
      dataItemKey: DETAIL_DATA_ITEM_KEY,
    });
    setDetailSelectedState(newSelectedState);
  };

  const onDetailSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailSelectedState2,
      dataItemKey: DETAIL_DATA_ITEM_KEY2,
    });
    setDetailSelectedState2(newSelectedState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetailSortChange = (e: any) => {
    setDetailDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetailSortChange2 = (e: any) => {
    setDetailDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {mainDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const detailTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = detailDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {detailDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
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

  const gridSumQtyFooterCell1 = (props: GridFooterCellProps) => {
    let sum = 0;
    detailDataResult.data.forEach((item) =>
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

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "QC_B0030W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "QC_B0030W_001");
      } else if (
        filters.dtgb == undefined || 
        filters.dtgb == "" ||
        filters.dtgb == null
      ) {
        throw findMessage(messagesData, "QC_B0030W_002");
      } else {
        resetAllGrid();
        setPage(initialPageState); // 페이지 초기화
        setPage2(initialPageState);
        setPage3(initialPageState);
        setFilters((prev: any) => ({
          ...prev,
          pgNum: 1,
          isSearch: true,
        }));
      }
    } catch(e) {
      alert(e);
    }
  };

  const minGridWidth = React.useRef<number>(0);
  const minGridWidth1 = React.useRef<number>(0);
  const minGridWidth2 = React.useRef<number>(0);
  const minGridWidth3 = React.useRef<number>(0);
  const grid = React.useRef<any>(null);
  const grid1 = React.useRef<any>(null);
  const grid2 = React.useRef<any>(null);
  const grid3 = React.useRef<any>(null);
  const [applyMinWidth, setApplyMinWidth] = React.useState(false);
  const [applyMinWidth1, setApplyMinWidth1] = React.useState(false);
  const [applyMinWidth2, setApplyMinWidth2] = React.useState(false);
  const [applyMinWidth3, setApplyMinWidth3] = React.useState(false);
  const [gridCurrent, setGridCurrent] = React.useState(0);
  const [gridCurrent1, setGridCurrent1] = React.useState(0);
  const [gridCurrent2, setGridCurrent2] = React.useState(0);
  const [gridCurrent3, setGridCurrent3] = React.useState(0);

  React.useEffect(() => {
    if (customOptionData != null) {
      grid.current = document.getElementById("grdList");
      grid1.current = document.getElementById("grdList1");
      grid2.current = document.getElementById("grdList2");
      grid3.current = document.getElementById("grdList3");

      window.addEventListener("resize", handleResize);

      //가장작은 그리드 이름
      customOptionData.menuCustomColumnOptions["grdList"].map((item: TColumn) =>
        item.width !== undefined
          ? (minGridWidth.current += item.width)
          : minGridWidth.current
      );
      customOptionData.menuCustomColumnOptions["grdList1"].map(
        (item: TColumn) =>
          item.width !== undefined
            ? (minGridWidth1.current += item.width)
            : minGridWidth1.current
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
      if (grid.current) {
        setGridCurrent(grid.current.clientWidth);
        setApplyMinWidth(grid.current.clientWidth < minGridWidth.current);
      }
      if (grid1.current) {
        setGridCurrent1(grid1.current.clientWidth);
        setApplyMinWidth1(grid1.current.clientWidth < minGridWidth1.current);
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
  }, [customOptionData]);

  const handleResize = () => {
    if (grid.current) {
      if (grid.current.clientWidth < minGridWidth.current && !applyMinWidth) {
        setApplyMinWidth(true);
      } else if (grid.current.clientWidth > minGridWidth.current) {
        setGridCurrent(grid.current.clientWidth);
        setApplyMinWidth(false);
      }
    }
    if (grid1.current) {
      if (grid1.current.clientWidth < minGridWidth1.current && !applyMinWidth1) {
        setApplyMinWidth1(true);
      } else if (grid1.current.clientWidth > minGridWidth1.current) {
        setGridCurrent1(grid1.current.clientWidth);
        setApplyMinWidth1(false);
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

    if (grid1.current && Name == "grdList1") {
      let width = applyMinWidth1
        ? minWidth
        : minWidth +
          (gridCurrent1 - minGridWidth1.current) /
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

  return (
    <>
      <TitleContainer>
        <Title>LOT추적</Title>
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
                <th>일자조건</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="dtgb"
                      value={filters.dtgb}
                      customOptionData={customOptionData}
                      className="required"
                      changeData={filterComboBoxChange}
                      valueField="code"
                      textField="name"
                    />
                  )}
                </td>
                <td colSpan={2}>
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
              </tr>
              <tr>
                <th>생산계획번호</th>
                <td>
                  <Input
                    name="planno"
                    type="text"
                    value={filters.planno}
                    onChange={filterInputChange}
                  />
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
                    onChange={filterInputChange}
                  />
                </td>
              </tr>
            </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainer>
        <GridTitleContainer>
          <GridTitle>{filters.dtgb === "A" ? "제품입고내역" : "제품출하내역"}</GridTitle>
        </GridTitleContainer>
        {filters.dtgb === "A" ?
          <Grid
            style={{ height: "35vh"}}
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
            id="grdList"
          >
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["grdList"].map(
                (item: any, idx: number) =>
                  item.sortOrder !== -1 && (
                    <GridColumn
                      key={idx}
                      field={item.fieldName}
                      title={item.caption}
                      width={setWidth("grdList", item.width)}
                      cell={
                        numberField.includes(item.fieldName)
                          ? NumberCell
                          : dateField.includes(item.fieldName)
                          ? DateCell
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
        : <Grid
            style={{ height: "35vh"}}
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
            id="grdList1"
          >
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["grdList1"].map(
                (item: any, idx: number) =>
                  item.sortOrder !== -1 && (
                    <GridColumn
                      key={idx}
                      field={item.fieldName}
                      title={item.caption}
                      width={setWidth("grdList1", item.width)}
                      cell={
                        numberField.includes(item.fieldName)
                          ? NumberCell
                          : dateField.includes(item.fieldName)
                          ? DateCell
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
        }
      </GridContainer>
      <GridContainerWrap>
        <GridContainer width = "50%">
          <GridTitleContainer>
            <GridTitle>공정별 LOT 추적</GridTitle>
          </GridTitleContainer>
          <Grid
            style={{ height: "38vh"}}
            data={process(
              detailDataResult.data.map((row) => ({
                ...row,
                proccd: proccdListData.find(
                  (item: any) => item.sub_code === row.proccd
                )?.code_name,
                prodemp: prodempListData.find(
                  (item: any) => item.user_id === row.prodemp
                )?.user_name,
                prodmac: prodmacListData.find(
                  (item: any) => item.sub_code === row.prodmac
                )?.code_name,
                badcd: badcdListData.find(
                  (item: any) => item.sub_code === row.badcd
                )?.code_name,
                [SELECTED_FIELD]: detailSelectedState[idGetter2(row)],
              })),
              detailDataState
            )}
            {...detailDataState}
            onDataStateChange={onDetailDataStateChange}
            //선택 기능
            dataItemKey={DETAIL_DATA_ITEM_KEY}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onDetailSelectionChange}
            //스크롤 조회 기능
            fixedScroll={true}
            total={detailDataResult.total}
            skip={page2.skip}
            take={page2.take}
            pageable={true}
            onPageChange={pageChange2}
            //원하는 행 위치로 스크롤 기능
            rowHeight={30}
            //정렬기능
            sortable={true}
            onSortChange={onDetailSortChange}
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
                      field={item.fieldName}
                      title={item.caption}
                      width={setWidth("grdList2", item.width)}
                      cell={
                        numberField.includes(item.fieldName)
                          ? NumberCell
                          : dateField.includes(item.fieldName)
                          ? DateCell
                          : undefined
                      }
                      footerCell={
                        item.sortOrder === 0
                          ? detailTotalFooterCell
                          : numberField.includes(item.fieldName)
                          ? gridSumQtyFooterCell1
                          : undefined
                      }
                    />
                  )
              )}
          </Grid>
        </GridContainer>
        <GridContainer width={`calc(50% - ${GAP}px)`}>
          <GridTitleContainer>
            <GridTitle>소요자재 LOT</GridTitle>
          </GridTitleContainer>
          <Grid
            style={{ height: "38vh"}}
            data={process(
              detailDataResult2.data.map((row) => ({
                ...row,
                itemacnt: itemacntListData.find(
                  (item: any) => item.sub_code === row.itemacnt
                )?.code_name,
                [SELECTED_FIELD]: detailSelectedState2[idGetter3(row)],
              })),
              detailDataState2
            )}
            {...detailDataState2}
            onDataStateChange={onDetailDataStateChange2}
            //선택 기능
            dataItemKey={DETAIL_DATA_ITEM_KEY2}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onDetailSelectionChange2}
            //스크롤 조회 기능
            fixedScroll={true}
            total={detailDataResult2.total}
            skip={page3.skip}
            take={page3.take}
            pageable={true}
            onPageChange={pageChange3}
            //원하는 행 위치로 스크롤 기능
            rowHeight={30}
            //정렬기능
            sortable={true}
            onSortChange={onDetailSortChange2}
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
                      field={item.fieldName}
                      title={item.caption}
                      width={setWidth("grdList3", item.width)}
                      cell={
                        numberField.includes(item.fieldName)
                          ? NumberCell
                          : dateField.includes(item.fieldName)
                          ? DateCell
                          : undefined
                      }
                    />
                  )
            )}
          </Grid>
        </GridContainer>
      </GridContainerWrap>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"N"}
          setData={setCustData}
          modal={true}
        />
      )}
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"FILTER"}
          setData={setItemData}
          modal={true}
        />
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
  )
};

export default QC_B0030W;
