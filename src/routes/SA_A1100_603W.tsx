import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridRowDoubleClickEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input, NumericTextBox } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  GetPropertyValueByName,
  ThreeNumberceil,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseParaPc,
  UsePermissions,
  convertDateToStr,
  getGridItemChangedData,
  getQueryFromBizComponent,
  numberWithCommas,
} from "../components/CommonFunction";
import FilterContainer from "../components/Containers/FilterContainer";
import { useApi } from "../hooks/api";
import { gridList } from "../store/columns/SA_A1100_603W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

import { bytesToBase64 } from "byte-base64";
import { useHistory, useLocation } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import TopButtons from "../components/Buttons/TopButtons";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import NumberCommaCell from "../components/Cells/NumberCommaCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import { isLoading } from "../store/atoms";

type TdataArr = {
  rowstatus_s: string[];
  quoseq_s: string[];
  wonamt_s: string[];
  taxamt_s: string[];
  amt_s: string[];
  margin_s: string[];
  margin_div_s: string[];
  marginamt_s: string[];
  discount_s: string[];
  discount_div_s: string[];
  discountamt_s: string[];
};

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
const DATA_ITEM_KEY4 = "num";
const DATA_ITEM_KEY5 = "num";
let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;
let targetRowIndex3: null | number = null;
let targetRowIndex4: null | number = null;
let targetRowIndex5: null | number = null;
const DateField = ["materialindt", "recdt"];
const NumberField = [
  "amt",
  "wonamt",
  "taxamt",
  "totamt",
  "ordamt",
  "saleamt",
  "collamt",
  "janamt",
];

const NumberCommaField = [
  "margin",
  "marginamt",
  "discount",
  "discountamt",
  "amt",
];

const NumberField2 = [
  "marginamt",
  "discountamt",
  "wonamt",
  "taxamt",
  "amt",
];

const customField = ["insert_userid", "margin_div", "discount_div"];
let temp = 0;
const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent(
    "L_sysUserMaster_001, L_MARGIN, L_DISCOUNT",
    // 구분, 단위, 불량유형
    setBizComponentData
  );

  const field = props.field ?? "";
  const bizComponentIdVal =
    field === "insert_userid"
      ? "L_sysUserMaster_001"
      : field === "margin_div"
      ? "L_MARGIN"
      : field === "discount_div"
      ? "L_DISCOUNT"
      : "";

  const fieldName = field === "insert_userid" ? "user_name" : undefined;
  const fieldValue = field === "insert_userid" ? "user_id" : undefined;

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      textField={fieldName}
      valueField={fieldValue}
      {...props}
    />
  ) : (
    <td />
  );
};

let deletedMainRows: any[] = [];
const SA_A1100_603W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const idGetter4 = getter(DATA_ITEM_KEY4);
  const idGetter5 = getter(DATA_ITEM_KEY5);
  const processApi = useApi();
  const userId = UseGetValueFromSessionItem("user_id");
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const [page4, setPage4] = useState(initialPageState);
  const [page5, setPage5] = useState(initialPageState);
  const [checked, setChecked] = useState(false);

  interface ICustData {
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
    setFilters((prev: any) => {
      return {
        ...prev,
        custcd: data.custcd,
        custnm: data.custnm,
      };
    });
  };

  // 비즈니스 컴포넌트 조회
  const [bizComponentData, setBizComponentData] = useState<any>([]);
  UseBizComponent(
    "L_dptcd_001,L_sysUserMaster_001, L_SA016, L_SA004, L_SA001_603",
    setBizComponentData
  );
  const [dptcdListData, setdptcdListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);
  const [userListData, setUserListData] = useState([
    { user_id: "", user_name: "" },
  ]);

  const [quotypeListData, setQuotypeListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [quostsListData, setQuostsListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [materialtypeListData, setMaterialtypeListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData.length > 0) {
      const userQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_sysUserMaster_001"
        )
      );
      const dptcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_dptcd_001"
        )
      );
      const quotypeQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_SA016")
      );

      const quostsQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_SA004")
      );

      const materialtypeQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_SA001_603"
        )
      );
      fetchQueryData(userQueryStr, setUserListData);
      fetchQueryData(quotypeQueryStr, setQuotypeListData);
      fetchQueryData(quostsQueryStr, setQuostsListData);
      fetchQueryData(materialtypeQueryStr, setMaterialtypeListData);
      fetchQueryData(dptcdQueryStr, setdptcdListData);
    }
  }, [bizComponentData]);

  const fetchQueryData = useCallback(
    async (queryStr: string, setListData: any) => {
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
    },
    []
  );
  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");
  // 조회조건
  const [filters, setFilters] = useState<{ [name: string]: any }>({
    orgdiv: "01",
    location: "01",
    quokey: "",
    custcd: "",
    custnm: "",
    testnum: "",
    finyn: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
    pgSize: PAGE_SIZE,
  });

  const [subFilters, setSubFilters] = useState<{ [name: string]: any }>({
    workType: "",
    orgdiv: "01",
    location: "01",
    quonum: "",
    quorev: 0,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
    pgSize: PAGE_SIZE,
  });

  const [subFilters2, setSubFilters2] = useState<{ [name: string]: any }>({
    workType: "",
    orgdiv: "01",
    location: "01",
    quonum: "",
    quorev: 0,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
    pgSize: PAGE_SIZE,
  });
  const [subFilters3, setSubFilters3] = useState<{ [name: string]: any }>({
    workType: "",
    quonum: "",
    orgdiv: "01",
    location: "01",
    quorev: 0,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
    pgSize: PAGE_SIZE,
  });
  const [subFilters4, setSubFilters4] = useState<{ [name: string]: any }>({
    workType: "",
    quonum: "",
    orgdiv: "01",
    location: "01",
    quorev: 0,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
    pgSize: PAGE_SIZE,
  });
  const [Information, setInformation] = useState<{ [name: string]: any }>({
    project: "",
    paymeth: "",
    materialnm: "",
    totamt: 0,
    quorev: 0,
    rev_reason: "",
    ordamt: 0,
    saleamt: 0,
    collamt: 0,
    janamt: 0,
    wonchgrat: 0,
    amtunit: "",
  });

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
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [tempState2, setTempState2] = useState<State>({
    sort: [],
  });
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [tempResult2, setTempResult2] = useState<DataResult>(
    process([], tempState2)
  );
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
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const onRowDoubleClick = (event: GridRowDoubleClickEvent) => {
    const selectedRowData = event.dataItem;
    setSelectedState({ [selectedRowData[DATA_ITEM_KEY]]: true });

    setChecked(true);
    setSubFilters((prev) => ({
      ...prev,
      workType: "DETAIL",
      quonum: selectedRowData.quonum,
      quorev: selectedRowData.quorev,
      pgNum: 1,
      isSearch: true,
    }));
    setSubFilters2((prev) => ({
      ...prev,
      workType: "COMMENT",
      quonum: selectedRowData.quonum,
      quorev: selectedRowData.quorev,
      pgNum: 1,
      isSearch: true,
    }));
    setSubFilters3((prev) => ({
      ...prev,
      workType: "SALE",
      quonum: selectedRowData.quonum,
      quorev: selectedRowData.quorev,
      pgNum: 1,
      isSearch: true,
    }));
    setSubFilters4((prev) => ({
      ...prev,
      workType: "MEETING",
      quonum: selectedRowData.quonum,
      quorev: selectedRowData.quorev,
      pgNum: 1,
      isSearch: true,
    }));
    setTabSelected(1);
  };

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const InfoInputChange = (e: any) => {
    const { value, name } = e.target;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const InfoInputChange2 = (e: any) => {
    const { name } = e.target;
    const value = e.value;

    if (name == "wonchgrat") {
      setInformation((prev) => ({
        ...prev,
        [name]: value,
      }));

      const newData = mainDataResult2.data.map((item) => ({
        ...item,
        wonamt: Math.round(item.discountamt * value),
        taxamt: Math.round(Math.round(item.discountamt * value) * 0.1),
        rowstatus: item.rowstatus == "N" ? "N" : "U",
      }));

      setTempResult((prev) => {
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
      setInformation((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  const history = useHistory();
  const location = useLocation();

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const queryParams = new URLSearchParams(location.search);
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      if (queryParams.has("go")) {
        history.replace({}, "");
        setFilters((prev) => ({
          ...prev,
          isSearch: true,
          find_row_value: queryParams.get("go") as string,
        }));
      } else {
        setFilters((prev) => ({
          ...prev,
        }));
      }
    }
  }, [customOptionData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (subFilters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subFilters);

      setSubFilters((prev) => ({ ...prev, isSearch: false })); // 한번만 조회되도록
      fetchSubGrid(deepCopiedFilters);
    }
  }, [subFilters, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (subFilters2.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subFilters2);

      setSubFilters2((prev) => ({ ...prev, isSearch: false })); // 한번만 조회되도록
      fetchSubGrid2(deepCopiedFilters);
    }
  }, [subFilters2, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (subFilters3.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subFilters3);

      setSubFilters3((prev) => ({ ...prev, isSearch: false })); // 한번만 조회되도록
      fetchSubGrid3(deepCopiedFilters);
    }
  }, [subFilters3, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (subFilters4.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subFilters4);

      setSubFilters4((prev) => ({ ...prev, isSearch: false })); // 한번만 조회되도록
      fetchSubGrid4(deepCopiedFilters);
    }
  }, [subFilters4, permissions]);

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

  //그리드 리셋
  const resetAllGrid = () => {
    deletedMainRows = [];
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
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    let data: any;

    setLoading(true);

    //조회프로시저  파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_A1100_603W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "LIST",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_quokey": filters.quokey,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_testnum": filters.testnum,
        "@p_finyn": filters.finyn,
        "@p_quonum": "",
        "@p_quorev": 0,
        "@p_quoseq": 0,
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
            (row: any) => row.quokey == filters.find_row_value
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

      setMainDataResult({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.quokey == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert("[" + data.statusCode + "] " + data.resultMessage);
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
  const fetchSubGrid = async (subFilters: any) => {
    let data: any;
    setLoading(true);

    //조회프로시저  파라미터
    const parameters1: Iparameters = {
      procedureName: "P_SA_A1100_603W_Q",
      pageNumber: subFilters.pgNum,
      pageSize: subFilters.pgSize,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_orgdiv": subFilters.orgdiv,
        "@p_location": subFilters.location,
        "@p_quokey": "",
        "@p_custcd": "",
        "@p_custnm": "",
        "@p_testnum": "",
        "@p_finyn": "",
        "@p_quonum": subFilters.quonum,
        "@p_quorev": subFilters.quorev,
        "@p_quoseq": 0,
        "@p_find_row_value": subFilters.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters1);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[1].TotalRowCount;
      const rows = data.tables[1].Rows;
      if (subFilters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef2.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.testnum == subFilters.find_row_value
          );
          targetRowIndex2 = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage2({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef2.current) {
          targetRowIndex2 = 0;
        }
      }

      if (data.tables[0].TotalRowCount > 0) {
        setInformation((prev) => ({
          ...prev,
          project: data.tables[0].Rows[0].project,
          paymeth: data.tables[0].Rows[0].paymeth,
          materialnm: data.tables[0].Rows[0].materialnm,
          totamt: data.tables[0].Rows[0].totamt,
          quorev: data.tables[0].Rows[0].quorev,
          rev_reason: data.tables[0].Rows[0].rev_reason,
          wonchgrat: data.tables[0].Rows[0].wonchgrat,
          amtunit: data.tables[0].Rows[0].amtunit,
        }));
      } else {
        setInformation((prev) => ({
          ...prev,
          project: "",
          paymeth: "",
          materialnm: "",
          totamt: 0,
          quorev: 0,
          rev_reason: "",
          wonchgrat: 0,
        }));
      }
      setMainDataResult2({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          subFilters.find_row_value === ""
            ? rows[0]
            : rows.find((row: any) => row.testnum == subFilters.find_row_value);
        if (selectedRow != undefined) {
          setSelectedState2({ [selectedRow[DATA_ITEM_KEY2]]: true });
        } else {
          setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setSubFilters((prev) => ({
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
  const fetchSubGrid2 = async (subFilters2: any) => {
    let data: any;
    setLoading(true);

    //조회프로시저  파라미터
    //조회프로시저  파라미터
    const parameters2: Iparameters = {
      procedureName: "P_SA_A1100_603W_Q",
      pageNumber: subFilters2.pgNum,
      pageSize: subFilters2.pgSize,
      parameters: {
        "@p_work_type": "COMMENT",
        "@p_orgdiv": subFilters2.orgdiv,
        "@p_location": subFilters2.location,
        "@p_quokey": "",
        "@p_custcd": "",
        "@p_custnm": "",
        "@p_testnum": "",
        "@p_finyn": "",
        "@p_quonum": subFilters2.quonum,
        "@p_quorev": subFilters2.quorev,
        "@p_quoseq": 0,
        "@p_find_row_value": subFilters2.find_row_value,
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
      if (subFilters2.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef3.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.testnum == subFilters2.find_row_value
          );
          targetRowIndex3 = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage3({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef3.current) {
          targetRowIndex3 = 0;
        }
      }

      setMainDataResult3({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          subFilters2.find_row_value === ""
            ? rows[0]
            : rows.find(
                (row: any) => row.testnum == subFilters2.find_row_value
              );
        if (selectedRow != undefined) {
          setSelectedState3({ [selectedRow[DATA_ITEM_KEY3]]: true });
        } else {
          setSelectedState3({ [rows[0][DATA_ITEM_KEY3]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setSubFilters2((prev) => ({
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
  const fetchSubGrid3 = async (subFilters3: any) => {
    let data: any;
    setLoading(true);

    //조회프로시저  파라미터
    const parameters3: Iparameters = {
      procedureName: "P_SA_A1100_603W_Q",
      pageNumber: subFilters3.pgNum,
      pageSize: subFilters3.pgSize,
      parameters: {
        "@p_work_type": "SALE",
        "@p_orgdiv": subFilters3.orgdiv,
        "@p_location": subFilters3.location,
        "@p_quokey": "",
        "@p_custcd": "",
        "@p_custnm": "",
        "@p_testnum": "",
        "@p_finyn": "",
        "@p_quonum": subFilters3.quonum,
        "@p_quorev": subFilters3.quorev,
        "@p_quoseq": 0,
        "@p_find_row_value": subFilters3.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters3);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[1].TotalRowCount;
      const rows = data.tables[1].Rows;
      if (subFilters3.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef4.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.quonum == subFilters3.find_row_value
          );
          targetRowIndex4 = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage4({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef4.current) {
          targetRowIndex4 = 0;
        }
      }
      if (data.tables[0].TotalRowCount > 0) {
        setInformation((prev) => ({
          ...prev,
          ordamt: data.tables[0].Rows[0].ordamt,
          saleamt: data.tables[0].Rows[0].saleamt,
          collamt: data.tables[0].Rows[0].collamt,
          janamt: data.tables[0].Rows[0].janamt,
        }));
      } else {
        setInformation((prev) => ({
          ...prev,
          ordamt: 0,
          saleamt: 0,
          collamt: 0,
          janamt: 0,
        }));
      }
      setMainDataResult4({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          subFilters3.find_row_value === ""
            ? rows[0]
            : rows.find((row: any) => row.quonum == subFilters3.find_row_value);
        if (selectedRow != undefined) {
          setSelectedState4({ [selectedRow[DATA_ITEM_KEY4]]: true });
        } else {
          setSelectedState4({ [rows[0][DATA_ITEM_KEY4]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setSubFilters3((prev) => ({
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
  const fetchSubGrid4 = async (subFilters4: any) => {
    let data: any;
    setLoading(true);

    //조회프로시저  파라미터
    const parameters4: Iparameters = {
      procedureName: "P_SA_A1100_603W_Q",
      pageNumber: subFilters4.pgNum,
      pageSize: subFilters4.pgSize,
      parameters: {
        "@p_work_type": "MEETING",
        "@p_orgdiv": subFilters4.orgdiv,
        "@p_location": subFilters4.location,
        "@p_quokey": "",
        "@p_custcd": "",
        "@p_custnm": "",
        "@p_testnum": "",
        "@p_finyn": "",
        "@p_quonum": subFilters4.quonum,
        "@p_quorev": subFilters4.quorev,
        "@p_quoseq": 0,
        "@p_find_row_value": subFilters4.find_row_value,
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
      if (subFilters4.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef5.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.meetingnum == subFilters4.find_row_value
          );
          targetRowIndex5 = subFilters4;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage5({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef5.current) {
          targetRowIndex5 = 0;
        }
      }

      setMainDataResult5({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          subFilters4.find_row_value === ""
            ? rows[0]
            : rows.find(
                (row: any) => row.meetingnum == subFilters4.find_row_value
              );
        if (selectedRow != undefined) {
          setSelectedState5({ [selectedRow[DATA_ITEM_KEY5]]: true });
        } else {
          setSelectedState5({ [rows[0][DATA_ITEM_KEY5]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setSubFilters4((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));

    setPage({
      ...event.page,
    });
  };

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setSubFilters((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));

    setPage2({
      ...event.page,
    });
  };

  const pageChange3 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setSubFilters2((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));

    setPage3({
      ...event.page,
    });
  };

  const pageChange4 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setSubFilters3((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));

    setPage4({
      ...event.page,
    });
  };

  const pageChange5 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setSubFilters4((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));

    setPage5({
      ...event.page,
    });
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

  const [tabSelected, setTabSelected] = React.useState(0);
  const handleSelectTab = (e: any) => {
    if (e.selected == 0) {
      setChecked(false);
    }
    setTabSelected(e.selected);
  };

  const search = () => {
    try {
      resetAllGrid();
      setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
      setTabSelected(0);
      setChecked(false);
    } catch (e) {
      alert(e);
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
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
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
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
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
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
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
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
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
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const editNumberFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult2.data.forEach((item) =>
      props.field !== undefined ? (sum += parseFloat(item[props.field])) : 0
    );

    return (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {numberWithCommas(sum)}
      </td>
    )
  };

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  const ongrdDetailItemChange = (event: GridItemChangeEvent) => {
    setMainDataState2((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult2,
      setMainDataResult2,
      DATA_ITEM_KEY2
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

  const ongrdDetailItemChange2 = (event: GridItemChangeEvent) => {
    setMainDataState3((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult3,
      setMainDataResult3,
      DATA_ITEM_KEY3
    );
  };

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

  const enterEdit = (dataItem: any, field: string) => {
    if (field != "rowstatus" && field != "testnum") {
      const newData = mainDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY2] == dataItem[DATA_ITEM_KEY2]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
      );

      setEditIndex(dataItem[DATA_ITEM_KEY]);
      if (field) {
        setEditedField(field);
      }

      setTempResult((prev) => {
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
      setTempResult((prev) => {
        return {
          data: mainDataResult2.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult.data != mainDataResult2.data) {
      const newData = mainDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY2] == Object.getOwnPropertyNames(selectedState2)[0]
          ? {
              ...item,
              rowstatus: item.rowstatus == "N" ? "N" : "U",
              marginamt:
                editedField != "amt" &&
                editedField != "margin" &&
                editedField != "margin_div"
                  ? item.marginamt
                  : ThreeNumberceil(
                      item.margin_div == ""
                        ? item.amt
                        : item.margin_div == "1"
                        ? item.amt +
                          ThreeNumberceil((item.amt * item.margin) / 100)
                        : item.margin_div == "2"
                        ? item.amt + item.margin
                        : item.amt
                    ),
              discountamt:
                editedField != "amt" &&
                editedField != "margin" &&
                editedField != "margin_div" &&
                editedField != "marginamt" &&
                editedField != "discount" &&
                editedField != "discount_div"
                  ? item.discountamt
                  : editedField != "marginamt" &&
                    editedField != "discount" &&
                    editedField != "discount_div"
                  ? ThreeNumberceil(
                      item.discount_div == ""
                        ? ThreeNumberceil(
                            item.margin_div == ""
                              ? item.amt
                              : item.margin_div == "1"
                              ? item.amt +
                                ThreeNumberceil((item.amt * item.margin) / 100)
                              : item.margin_div == "2"
                              ? item.amt + item.margin
                              : item.amt
                          )
                        : item.discount_div == "1"
                        ? ThreeNumberceil(
                            item.margin_div == ""
                              ? item.amt
                              : item.margin_div == "1"
                              ? item.amt +
                                ThreeNumberceil((item.amt * item.margin) / 100)
                              : item.margin_div == "2"
                              ? item.amt + item.margin
                              : item.amt
                          ) -
                          ThreeNumberceil(
                            (item.marginamt * item.discount) / 100
                          )
                        : item.discount_div == "2"
                        ? ThreeNumberceil(
                            item.margin_div == ""
                              ? item.amt
                              : item.margin_div == "1"
                              ? item.amt +
                                ThreeNumberceil((item.amt * item.margin) / 100)
                              : item.margin_div == "2"
                              ? item.amt + item.margin
                              : item.amt
                          ) - item.discount
                        : ThreeNumberceil(
                            item.margin_div == ""
                              ? item.amt
                              : item.margin_div == "1"
                              ? item.amt +
                                ThreeNumberceil((item.amt * item.margin) / 100)
                              : item.margin_div == "2"
                              ? item.amt + item.margin
                              : item.amt
                          )
                    )
                  : ThreeNumberceil(
                      item.discount_div == ""
                        ? item.marginamt
                        : item.discount_div == "1"
                        ? item.marginamt -
                          ThreeNumberceil(
                            (item.marginamt * item.discount) / 100
                          )
                        : item.discount_div == "2"
                        ? item.marginamt - item.discount
                        : item.marginamt
                    ),
              wonamt:
                editedField != "amt" &&
                editedField != "margin" &&
                editedField != "margin_div" &&
                editedField != "marginamt" &&
                editedField != "discount" &&
                editedField != "discount_div" &&
                editedField != "discountamt"
                  ? item.wonamt
                  : editedField != "discountamt"
                  ? Math.round(
                      ThreeNumberceil(
                        item.discount_div == ""
                          ? ThreeNumberceil(
                              item.margin_div == ""
                                ? item.amt
                                : item.margin_div == "1"
                                ? item.amt +
                                  ThreeNumberceil(
                                    (item.amt * item.margin) / 100
                                  )
                                : item.margin_div == "2"
                                ? item.amt + item.margin
                                : item.amt
                            )
                          : item.discount_div == "1"
                          ? ThreeNumberceil(
                              item.margin_div == ""
                                ? item.amt
                                : item.margin_div == "1"
                                ? item.amt +
                                  ThreeNumberceil(
                                    (item.amt * item.margin) / 100
                                  )
                                : item.margin_div == "2"
                                ? item.amt + item.margin
                                : item.amt
                            ) -
                            ThreeNumberceil(
                              (item.marginamt * item.discount) / 100
                            )
                          : item.discount_div == "2"
                          ? ThreeNumberceil(
                              item.margin_div == ""
                                ? item.amt
                                : item.margin_div == "1"
                                ? item.amt +
                                  ThreeNumberceil(
                                    (item.amt * item.margin) / 100
                                  )
                                : item.margin_div == "2"
                                ? item.amt + item.margin
                                : item.amt
                            ) - item.discount
                          : ThreeNumberceil(
                              item.margin_div == ""
                                ? item.amt
                                : item.margin_div == "1"
                                ? item.amt +
                                  ThreeNumberceil(
                                    (item.amt * item.margin) / 100
                                  )
                                : item.margin_div == "2"
                                ? item.amt + item.margin
                                : item.amt
                            )
                      ) * Information.wonchgrat
                    )
                  : Math.round(item.discountamt * Information.wonchgrat),
              taxamt:
                editedField != "amt" &&
                editedField != "margin" &&
                editedField != "margin_div" &&
                editedField != "marginamt" &&
                editedField != "discount" &&
                editedField != "discount_div" &&
                editedField != "discountamt" &&
                editedField != "wonamt"
                  ? item.taxamt
                  : editedField != "discountamt" && editedField != "wonamt"
                  ? Math.round(
                      Math.round(
                        ThreeNumberceil(
                          item.discount_div == ""
                            ? ThreeNumberceil(
                                item.margin_div == ""
                                  ? item.amt
                                  : item.margin_div == "1"
                                  ? item.amt +
                                    ThreeNumberceil(
                                      (item.amt * item.margin) / 100
                                    )
                                  : item.margin_div == "2"
                                  ? item.amt + item.margin
                                  : item.amt
                              )
                            : item.discount_div == "1"
                            ? ThreeNumberceil(
                                item.margin_div == ""
                                  ? item.amt
                                  : item.margin_div == "1"
                                  ? item.amt +
                                    ThreeNumberceil(
                                      (item.amt * item.margin) / 100
                                    )
                                  : item.margin_div == "2"
                                  ? item.amt + item.margin
                                  : item.amt
                              ) -
                              ThreeNumberceil(
                                (item.marginamt * item.discount) / 100
                              )
                            : item.discount_div == "2"
                            ? ThreeNumberceil(
                                item.margin_div == ""
                                  ? item.amt
                                  : item.margin_div == "1"
                                  ? item.amt +
                                    ThreeNumberceil(
                                      (item.amt * item.margin) / 100
                                    )
                                  : item.margin_div == "2"
                                  ? item.amt + item.margin
                                  : item.amt
                              ) - item.discount
                            : ThreeNumberceil(
                                item.margin_div == ""
                                  ? item.amt
                                  : item.margin_div == "1"
                                  ? item.amt +
                                    ThreeNumberceil(
                                      (item.amt * item.margin) / 100
                                    )
                                  : item.margin_div == "2"
                                  ? item.amt + item.margin
                                  : item.amt
                              )
                        ) * Information.wonchgrat
                      ) * 0.1
                    )
                  : editedField != "wonamt"
                  ? Math.round(
                      Math.round(item.discountamt * Information.wonchgrat) * 0.1
                    )
                  : Math.round(item.wonamt * 0.1),
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
      setTempResult((prev) => {
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

  const enterEdit2 = (dataItem: any, field: string) => {
    if (field != "rowstatus" && field != "recdt") {
      const newData = mainDataResult3.data.map((item) =>
        item[DATA_ITEM_KEY3] == dataItem[DATA_ITEM_KEY3]
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
      setMainDataResult3((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult2((prev) => {
        return {
          data: mainDataResult3.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit2 = () => {
    if (tempResult2.data != mainDataResult3.data) {
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

      setTempResult2((prev) => {
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
      setTempResult2((prev) => {
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
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onLinkChange = (event: GridRowDoubleClickEvent) => {
    const selectedRowData = event.dataItem;
    const origin = window.location.origin;
    window.open(
      origin +
        `/CM_A7000W?go=` +
        selectedRowData.orgdiv +
        "_" +
        selectedRowData.meetingnum
    );
  };

  const onAddClick = () => {
    mainDataResult3.data.map((item) => {
      if (item[DATA_ITEM_KEY3] > temp) {
        temp = item[DATA_ITEM_KEY3];
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY3]: ++temp,
      comment: "",
      id: "",
      insert_userid: userId,
      recdt: convertDateToStr(new Date()),
      seq: 0,
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
    let Object3: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult3.data.forEach((item: any, index: number) => {
      if (!selectedState3[item[DATA_ITEM_KEY3]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = {
            ...item,
            rowstatus: "D",
          };
          deletedMainRows.push(newData2);
        }
        Object3.push(index);
      }
    });

    if (Math.min(...Object3) < Math.min(...Object2)) {
      data = mainDataResult3.data[Math.min(...Object2)];
    } else {
      data = mainDataResult3.data[Math.min(...Object3) - 1];
    }

    setMainDataResult3((prev) => ({
      data: newData,
      total: prev.total - Object3.length,
    }));
    if (Object3.length > 0) {
      setSelectedState3({
        [data != undefined ? data[DATA_ITEM_KEY3] : newData[0]]: true,
      });
    }
  };

  const [ParaData, setParaData] = useState({
    rowstatus_s: "",
    quoseq_s: "",
    wonamt_s: "",
    taxamt_s: "",
    amt_s: "",
    margin_s: "",
    margin_div_s: "",
    marginamt_s: "",
    discount_s: "",
    discount_div_s: "",
    discountamt_s: "",
  });

  const infopara: Iparameters = {
    procedureName: "P_SA_A1100_603W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": "N",
      "@p_orgdiv": "01",
      "@p_quonum": subFilters.quonum,
      "@p_quorev": Information.quorev,
      "@p_location": "01",
      "@p_paymeth": Information.paymeth,
      "@p_wonchgrat": Information.wonchgrat,
      "@p_amtunit": Information.amtunit,
      "@p_amt_s": ParaData.amt_s,
      "@p_margin_s": ParaData.margin_s,
      "@p_margin_div_s": ParaData.margin_div_s,
      "@p_marginamt_s": ParaData.marginamt_s,
      "@p_discount_s": ParaData.discount_s,
      "@p_discount_div_s": ParaData.discount_div_s,
      "@p_discountamt_s": ParaData.discountamt_s,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_quoseq_s": ParaData.quoseq_s,
      "@p_wonamt_s": ParaData.wonamt_s,
      "@p_taxamt_s": ParaData.taxamt_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "SA_A1100_603W",
    },
  };

  const onSaveClick = () => {
    const dataItem = mainDataResult2.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    let dataArr: TdataArr = {
      rowstatus_s: [],
      quoseq_s: [],
      wonamt_s: [],
      taxamt_s: [],
      amt_s: [],
      margin_s: [],
      margin_div_s: [],
      marginamt_s: [],
      discount_s: [],
      discount_div_s: [],
      discountamt_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        amt = "",
        margin = "",
        margin_div = "",
        marginamt = "",
        discount = "",
        discount_div = "",
        discountamt = "",
        quoseq = "",
        wonamt = "",
        taxamt = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.quoseq_s.push(quoseq);
      dataArr.wonamt_s.push(wonamt);
      dataArr.taxamt_s.push(taxamt);
      dataArr.amt_s.push(amt);
      dataArr.margin_s.push(margin);
      dataArr.margin_div_s.push(margin_div);
      dataArr.marginamt_s.push(marginamt);
      dataArr.discount_s.push(discount);
      dataArr.discount_div_s.push(discount_div);
      dataArr.discountamt_s.push(discountamt);
    });

    setParaData((prev) => ({
      ...prev,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      quoseq_s: dataArr.quoseq_s.join("|"),
      wonamt_s: dataArr.wonamt_s.join("|"),
      taxamt_s: dataArr.taxamt_s.join("|"),
      amt_s: dataArr.amt_s.join("|"),
      margin_s: dataArr.margin_s.join("|"),
      margin_div_s: dataArr.margin_div_s.join("|"),
      marginamt_s: dataArr.marginamt_s.join("|"),
      discount_s: dataArr.discount_s.join("|"),
      discount_div_s: dataArr.discount_div_s.join("|"),
      discountamt_s: dataArr.discountamt_s.join("|"),
    }));
  };

  useEffect(() => {
    if (ParaData.rowstatus_s != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  const fetchTodoGridSaved = async () => {
    let data: any;

    setLoading(true);

    try {
      data = await processApi<any>("procedure", infopara);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess === true) {
      setSubFilters((prev) => ({
        ...prev,
        workType: "DETAIL",
        pgNum: 1,
        isSearch: true,
      }));
      setParaData({
        rowstatus_s: "",
        quoseq_s: "",
        wonamt_s: "",
        taxamt_s: "",
        amt_s: "",
        margin_s: "",
        margin_div_s: "",
        marginamt_s: "",
        discount_s: "",
        discount_div_s: "",
        discountamt_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      if (data.resultMessage != undefined) {
        alert(data.resultMessage);
      }
    }
    setLoading(false);
  };

  const onSaveClick3 = () => {
    const dataItem: { [name: string]: any } = mainDataResult3.data.filter(
      (item: any) => {
        return (
          (item.rowstatus === "N" || item.rowstatus === "U") &&
          item.rowstatus !== undefined
        );
      }
    );
    if (dataItem.length === 0 && deletedMainRows.length === 0) return false;

    type TData = {
      row_status: string[];
      id: string[];
      seq: string[];
      recdt: string[];
      comment: string[];
      user_id: string[];
    };

    let dataArr: TData = {
      row_status: [],
      id: [],
      comment: [],
      seq: [],
      recdt: [],
      user_id: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const { comment, rowstatus, id = "", seq, recdt, insert_userid } = item;

      dataArr.comment.push(comment);
      dataArr.id.push(id);
      dataArr.row_status.push(rowstatus);
      dataArr.seq.push(seq);
      dataArr.recdt.push(recdt);
      dataArr.user_id.push(insert_userid);
    });

    deletedMainRows.forEach((item: any, idx: number) => {
      const { comment, id = "", seq, recdt, insert_userid } = item;

      dataArr.row_status.push("D");
      dataArr.comment.push(comment);
      dataArr.id.push(id);
      dataArr.seq.push(seq);
      dataArr.recdt.push(recdt);
      dataArr.user_id.push(insert_userid);
    });

    setParaDataSaved((prev) => ({
      ...prev,
      work_type: "save",
      row_status: dataArr.row_status.join("|"),
      comment: dataArr.comment.join("|"),
      id: dataArr.id.join("|"),
      seq: dataArr.seq.join("|"),
      recdt: dataArr.recdt.join("|"),
      user_id: dataArr.user_id.join("|"),
      ref_key: subFilters.quonum + "-" + subFilters.quorev,
    }));
  };

  const [paraDataSaved, setParaDataSaved] = useState({
    work_type: "",
    row_status: "",
    id: "",
    seq: "",
    recdt: "",
    comment: "",
    user_id: "",
    ref_key: "",
  });

  const paraSaved: Iparameters = {
    procedureName: "sys_sav_comments",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataSaved.work_type,
      "@p_row_status": paraDataSaved.row_status,
      "@p_id": paraDataSaved.id,
      "@p_seq": paraDataSaved.seq,
      "@p_recdt": paraDataSaved.recdt,
      "@p_comment": paraDataSaved.comment,
      "@p_user_id": paraDataSaved.user_id,
      "@p_form_id": "SA_A1100_603W",
      "@p_table_id": "SA050T",
      "@p_orgdiv": "01",
      "@p_ref_key": paraDataSaved.ref_key,
      "@p_exec_pc": pc,
    },
  };

  const fetchTodoGridSaved2 = async () => {
    let data: any;

    setLoading(true);

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess === true) {
      setSubFilters2((prev) => ({
        ...prev,
        workType: "COMMENT",
        pgNum: 1,
        isSearch: true,
      }));
      setParaDataSaved((prev) => ({ ...prev, work_type: "" }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
      if (data.resultMessage != undefined) {
        alert(data.resultMessage);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (paraDataSaved.work_type !== "") fetchTodoGridSaved2();
  }, [paraDataSaved]);

  return (
    <>
      <TitleContainer>
        <Title>계약관리</Title>
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
      <TabStrip
        selected={tabSelected}
        onSelect={handleSelectTab}
        style={{ width: "100%" }}
      >
        <TabStripTab title="요약정보">
          <FilterContainer>
            <FilterBox style={{ height: "10%" }}>
              <tbody>
                <tr>
                  <th>견적번호</th>
                  <td>
                    <Input
                      name="quoekey"
                      type="text"
                      value={filters.quoekey}
                      onChange={InputChange}
                    />
                  </td>
                  <th> 고객사</th>
                  <td>
                    <Input
                      name="custnm"
                      type="text"
                      value={filters.custnm}
                      onChange={InputChange}
                    />
                    <ButtonInInput>
                      <Button
                        type={"button"}
                        onClick={onCustWndClick}
                        icon="more-horizontal"
                        fillMode="flat"
                      />
                    </ButtonInInput>
                  </td>
                  <th>시험번호</th>
                  <td>
                    <Input
                      name="testnum"
                      type="text"
                      value={filters.testnum}
                      onChange={InputChange}
                    />
                  </td>
                  <th>진행상태</th>
                  <td></td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <GridContainer>
            <Grid
              style={{ height: "77vh" }}
              data={process(
                mainDataResult.data.map((row) => ({
                  ...row,
                  quotype: quotypeListData.find(
                    (items: any) => items.sub_code == row.quotype
                  )?.code_name,
                  quosts: quostsListData.find(
                    (items: any) => items.sub_code == row.quosts
                  )?.code_name,
                  person: userListData.find(
                    (items: any) => items.user_id == row.person
                  )?.user_name,
                  dptcd: dptcdListData.find(
                    (items: any) => items.dptcd == row.dptcd
                  )?.dptnm,
                  chkperson: userListData.find(
                    (items: any) => items.user_id == row.chkperson
                  )?.user_name,
                  materialtype: materialtypeListData.find(
                    (items: any) => items.sub_code == row.materialtype
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
              onRowDoubleClick={onRowDoubleClick}
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
                          DateField.includes(item.fieldName)
                            ? DateCell
                            : NumberField.includes(item.fieldName)
                            ? NumberCell
                            : undefined
                        }
                        footerCell={
                          item.sortOrder === 0 ? mainTotalFooterCell : undefined
                        }
                      />
                    )
                )}
            </Grid>
          </GridContainer>
        </TabStripTab>

        <TabStripTab title="상세정보" disabled={checked == true ? false : true}>
          <GridContainerWrap>
            <GridContainer width="30%">
              <GridTitleContainer>
                <GridTitle>계약내용</GridTitle>
              </GridTitleContainer>
              <FormBoxWrap border={true}>
                <FormBox>
                  <tbody>
                    <tr>
                      <th style={{ textAlign: "right" }}>계약명 </th>
                      <td>
                        <Input
                          name="project"
                          type="text"
                          value={Information.project}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th style={{ textAlign: "right" }}> 지급조건 </th>
                      <td>
                        <Input
                          name="paymeth"
                          type="text"
                          value={Information.paymeth}
                          onChange={InfoInputChange}
                        />
                      </td>
                    </tr>

                    <tr>
                      <th style={{ textAlign: "right" }}> 시험물질명 </th>
                      <td>
                        <Input
                          name="materialnm"
                          type="text"
                          value={Information.materialnm}
                          className="readonly"
                        />
                      </td>
                    </tr>

                    <tr>
                      <th style={{ textAlign: "right" }}> 합계금액 </th>
                      <td>
                        <Input
                          name="totamt"
                          type="number"
                          value={numberWithCommas(Information.totamt)}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>화폐단위</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="amtunit"
                            value={Information.amtunit}
                            customOptionData={customOptionData}
                            changeData={ComboBoxChange}
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th style={{ textAlign: "right" }}> 환율 </th>
                      <td>
                        <NumericTextBox
                          name="wonchgrat"
                          value={
                            Information.wonchgrat == null
                              ? 0
                              : Information.wonchgrat.toString()
                          }
                          format="n2"
                          onChange={InfoInputChange2}
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <GridContainer>
                <GridTitleContainer>
                  <GridTitle>계약에 대한 코멘트</GridTitle>
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
                    <Button
                      onClick={onSaveClick3}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="save"
                      title="저장"
                    ></Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <Grid
                  style={{ height: "55vh" }}
                  data={process(
                    mainDataResult3.data.map((row) => ({
                      ...row,
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
                  onItemChange={ongrdDetailItemChange2}
                  cellRender={customCellRender2}
                  rowRender={customRowRender2}
                  editField={EDIT_FIELD}
                >
                  <GridColumn field="rowstatus" title=" " width="50px" />
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
                              DateField.includes(item.fieldName)
                                ? DateCell
                                : customField.includes(item.fieldName)
                                ? CustomComboBoxCell
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
            <GridContainer width={`calc(70% - ${GAP}px)`}>
              <GridTitleContainer>
                <GridTitle>시험리스트</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onSaveClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                  >
                    상세정보 저장
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <Grid
                style={{ height: "79vh" }}
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
                onItemChange={ongrdDetailItemChange}
                cellRender={customCellRender}
                rowRender={customRowRender}
                editField={EDIT_FIELD}
              >
                <GridColumn field="rowstatus" title=" " width="50px" />
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
                            DateField.includes(item.fieldName)
                              ? DateCell
                              : NumberCommaField.includes(item.fieldName)
                              ? NumberCommaCell
                              : NumberField.includes(item.fieldName)
                              ? NumberCell
                              : customField.includes(item.fieldName)
                              ? CustomComboBoxCell
                              : undefined
                          }
                          footerCell={
                            item.sortOrder === 0
                              ? mainTotalFooterCell2
                              : NumberField2.includes(item.fieldName)
                              ? editNumberFooterCell
                              : undefined
                          }
                        />
                      )
                  )}
              </Grid>
            </GridContainer>
          </GridContainerWrap>
        </TabStripTab>
        <TabStripTab title="세부내용" disabled={checked == true ? false : true}>
          <GridContainerWrap>
            <GridContainer>
              <GridTitleContainer>
                <GridTitle>기존거래내역</GridTitle>
              </GridTitleContainer>
              <FormBoxWrap border={true}>
                <FormBox>
                  <tbody>
                    <tr>
                      <th style={{ textAlign: "center" }}>거래금액</th>
                      <th style={{ textAlign: "center" }}>수금금액</th>
                      <th style={{ textAlign: "center" }}>수주금액</th>
                      <th style={{ textAlign: "center" }}>미수잔액</th>
                    </tr>
                    <tr>
                      <td>
                        <Input
                          name="saleamt"
                          type="text"
                          value={numberWithCommas(Information.saleamt)}
                          readOnly={true}
                        />
                      </td>
                      <td>
                        <Input
                          name="collamt"
                          type="text"
                          value={numberWithCommas(Information.collamt)}
                          readOnly={true}
                        />
                      </td>
                      <td>
                        <Input
                          name="ordamt"
                          type="text"
                          value={numberWithCommas(Information.ordamt)}
                          readOnly={true}
                        />
                      </td>
                      <td>
                        <Input
                          name="janamt"
                          type="text"
                          value={numberWithCommas(Information.janamt)}
                          readOnly={true}
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <Grid
                style={{ height: "69vh" }}
                data={process(
                  mainDataResult4.data.map((row) => ({
                    ...row,
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
                            DateField.includes(item.fieldName)
                              ? DateCell
                              : NumberField.includes(item.fieldName)
                              ? NumberCell
                              : undefined
                          }
                          footerCell={
                            item.sortOrder === 0
                              ? mainTotalFooterCell4
                              : undefined
                          }
                        />
                      )
                  )}
              </Grid>
            </GridContainer>
            <GridContainer>
              <GridTitleContainer>
                <GridTitle>회의록 리스트</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: "78vh" }}
                data={process(
                  mainDataResult5.data.map((row) => ({
                    ...row,
                    person: userListData.find(
                      (items: any) => items.user_id == row.person
                    )?.user_name,
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
                onRowDoubleClick={onLinkChange}
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
                            DateField.includes(item.fieldName)
                              ? DateCell
                              : undefined
                          }
                          footerCell={
                            item.sortOrder === 0
                              ? mainTotalFooterCell5
                              : undefined
                          }
                        />
                      )
                  )}
              </Grid>
            </GridContainer>
          </GridContainerWrap>
        </TabStripTab>
      </TabStrip>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"N"}
          setData={setCustData}
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
  );
};

export default SA_A1100_603W;
