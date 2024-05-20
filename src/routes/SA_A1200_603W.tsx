import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
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
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseParaPc,
  UsePermissions,
  convertDateToStr,
  dateformat,
  dateformat2,
  getGridItemChangedData,
  getQueryFromBizComponent,
  numberWithCommas3,
  setDefaultDate,
} from "../components/CommonFunction";
import FilterContainer from "../components/Containers/FilterContainer";
import { useApi } from "../hooks/api";
import { gridList } from "../store/columns/SA_A1200_603W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

import { bytesToBase64 } from "byte-base64";
import { useHistory, useLocation } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import TopButtons from "../components/Buttons/TopButtons";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import ProjectsWindow from "../components/Windows/CM_A7000W_Project_Window";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import { isLoading } from "../store/atoms";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
let targetRowIndex: null | number = null;
const DateField = ["conplandt", "contradt", "recdt"];
const NumberField = ["passdt", "seq", "num"];

let temp = 0;
let deletedMainRows: any = [];

const SA_A1200_603W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);

  const processApi = useApi();
  const userId = UseGetValueFromSessionItem("user_id");
  const [worktype, setWorktype] = useState<"N" | "U">("U");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
const pc = UseGetValueFromSessionItem("pc");
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("SA_A1200_603W", setCustomOptionData);

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
          chkperson: defaultOption.find((item: any) => item.id === "chkperson")
            ?.valueCode,
          raduseyn: defaultOption.find((item: any) => item.id === "raduseyn")
            ?.valueCode,
          feasibility: defaultOption.find(
            (item: any) => item.id === "feasibility"
          )?.valueCode,
          weight: defaultOption.find((item: any) => item.id === "weight")
            ?.valueCode,
          quodtstr: setDefaultDate(customOptionData, "quodtstr"),
          quodtend: setDefaultDate(customOptionData, "quodtend"),
          stdt: defaultOption.find((item: any) => item.id === "stdt")
            ?.valueCode,
          endt: defaultOption.find((item: any) => item.id === "endt")
            ?.valueCode,
          find_row_value: queryParams.get("go") as string,
          isSearch: true,
        }));
      } else {
        setFilters((prev) => ({
          ...prev,
          chkperson: defaultOption.find((item: any) => item.id === "chkperson")
            ?.valueCode,
          raduseyn: defaultOption.find((item: any) => item.id === "raduseyn")
            ?.valueCode,
          feasibility: defaultOption.find(
            (item: any) => item.id === "feasibility"
          )?.valueCode,
          weight: defaultOption.find((item: any) => item.id === "weight")
            ?.valueCode,
          quodtstr: setDefaultDate(customOptionData, "quodtstr"),
          quodtend: setDefaultDate(customOptionData, "quodtend"),
          stdt: defaultOption.find((item: any) => item.id === "stdt")
            ?.valueCode,
          endt: defaultOption.find((item: any) => item.id === "endt")
            ?.valueCode,
          isSearch: true,
        }));
      }
    }
  }, [customOptionData]);

  let deviceWidth = document.documentElement.clientWidth;
  let isMobile = deviceWidth <= 1200;

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
    setFilters((prev: any) => {
      return {
        ...prev,
        custcd: data.custcd,
        custnm: data.custnm,
      };
    });
  };

  const [projectWindowVisible, setProjectWindowVisible] =
    useState<boolean>(false);
  const onProejctWndClick = () => {
    setProjectWindowVisible(true);
  };
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  // 비즈니스 컴포넌트 조회
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_sysUserMaster_001, L_SA001_603, L_BA037, L_SA012_603, L_SA013_603, L_SA014_603, L_SA015_603, L_SA016_603, L_SA017_603, L_SA018_603, R_YESNOALL, L_LEVEL_603",
    setBizComponentData
  );

  const [userListData, setUserListData] = useState([
    { user_id: "", user_name: "" },
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const userQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_sysUserMaster_001"
        )
      );

      fetchQueryData(userQueryStr, setUserListData);
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

  // 조회조건
  const [filters, setFilters] = useState<{ [name: string]: any }>({
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    quokey: "",
    custnm: "",
    custcd: "",
    custprsnnm: "",
    chkperson: "",
    finyn: "%",
    quodtstr: new Date(),
    quodtend: new Date(),
    cotracdtstr: null,
    cotracdtend: null,
    feasibility: "",
    weight: "",
    stdt: 0,
    endt: 0,
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
    pgSize: PAGE_SIZE,
  });

  // 조회조건
  const [filters2, setFilters2] = useState({
    quokey: "",
    pgNum: 1,
    isSearch: false,
    pgSize: PAGE_SIZE,
  });

  const [Information, setInformation] = useState<{ [name: string]: any }>({
    addordgb: "",
    amtgb: "",
    assaygbe: "",
    financegb: "",
    grade1: 0,
    grade2: 0,
    grade3: 0,
    grade4: 0,
    grade5: 0,
    grade6: 0,
    grade7: 0,
    materialgb: "",
    orgdiv: sessionOrgdiv,
    relationgb: "",
    startschgb: "",
    totgrade1: 0,
    totgrade2: 0,
    result1: "",
    result2: "",
    quorev: "",
    conplandt: "",
    submitdt: "",
    seq: 0,
    passdt: 0,
  });
  const history = useHistory();
  const location = useLocation();
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [tempState2, setTempState2] = useState<State>({
    sort: [],
  });
  const [tempResult2, setTempResult2] = useState<DataResult>(
    process([], tempState2)
  );

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);

  const setProjectData = (data: any) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        quokey: data.quokey,
      };
    });
  };

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const onRowDoubleClick = (event: GridRowDoubleClickEvent) => {
    const selectedRowData = event.dataItem;
    setSelectedState({ [selectedRowData[DATA_ITEM_KEY]]: true });
    setTabSelected(1);
    setFilters2((prev) => ({
      ...prev,
      quokey: selectedRowData.quokey,
      isSearch: true,
      pgNum: 1,
    }));
  };

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const InputChange = (e: any) => {
    const { value, name } = e.target;

    if (name == "custnm") {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
        custcd: value == "" ? "" : prev.custcd,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    if (name == "materialgb") {
      setInformation((prev) => ({
        ...prev,
        [name]: value,
        grade1: e.e.value.numref1 == undefined ? 0 : e.e.value.numref1,
        totgrade1:
          (e.e.value.numref1 == undefined ? 0 : e.e.value.numref1) +
          prev.grade2 +
          prev.grade3 +
          prev.grade4,
        result1:
          (e.e.value.numref1 == undefined ? 0 : e.e.value.numref1) +
            prev.grade2 +
            prev.grade3 +
            prev.grade4 >=
          12
            ? "상"
            : (e.e.value.numref1 == undefined ? 0 : e.e.value.numref1) +
                prev.grade2 +
                prev.grade3 +
                prev.grade4 >=
              7
            ? "중"
            : (e.e.value.numref1 == undefined ? 0 : e.e.value.numref1) +
                prev.grade2 +
                prev.grade3 +
                prev.grade4 >
              1
            ? "하"
            : "",
      }));
    } else if (name == "assaygbe") {
      setInformation((prev) => ({
        ...prev,
        [name]: value,
        grade2: e.e.value.numref1 == undefined ? 0 : e.e.value.numref1,
        totgrade1:
          prev.grade1 +
          (e.e.value.numref1 == undefined ? 0 : e.e.value.numref1) +
          prev.grade3 +
          prev.grade4,
        result1:
          prev.grade1 +
            (e.e.value.numref1 == undefined ? 0 : e.e.value.numref1) +
            prev.grade3 +
            prev.grade4 >=
          12
            ? "상"
            : prev.grade1 +
                (e.e.value.numref1 == undefined ? 0 : e.e.value.numref1) +
                prev.grade3 +
                prev.grade4 >=
              7
            ? "중"
            : prev.grade1 +
                (e.e.value.numref1 == undefined ? 0 : e.e.value.numref1) +
                prev.grade3 +
                prev.grade4 >
              1
            ? "하"
            : "",
      }));
    } else if (name == "startschgb") {
      setInformation((prev) => ({
        ...prev,
        [name]: value,
        grade3: e.e.value.numref1 == undefined ? 0 : e.e.value.numref1,
        totgrade1:
          prev.grade1 +
          prev.grade2 +
          (e.e.value.numref1 == undefined ? 0 : e.e.value.numref1) +
          prev.grade4,
        result1:
          prev.grade1 +
            prev.grade2 +
            (e.e.value.numref1 == undefined ? 0 : e.e.value.numref1) +
            prev.grade4 >=
          12
            ? "상"
            : prev.grade1 +
                prev.grade2 +
                (e.e.value.numref1 == undefined ? 0 : e.e.value.numref1) +
                prev.grade4 >=
              7
            ? "중"
            : prev.grade1 +
                prev.grade2 +
                (e.e.value.numref1 == undefined ? 0 : e.e.value.numref1) +
                prev.grade4 >
              1
            ? "하"
            : "",
      }));
    } else if (name == "financegb") {
      setInformation((prev) => ({
        ...prev,
        [name]: value,
        grade4: e.e.value.numref1 == undefined ? 0 : e.e.value.numref1,
        totgrade1:
          prev.grade1 +
          prev.grade2 +
          prev.grade3 +
          (e.e.value.numref1 == undefined ? 0 : e.e.value.numref1),
        result1:
          prev.grade1 +
            prev.grade2 +
            prev.grade3 +
            (e.e.value.numref1 == undefined ? 0 : e.e.value.numref1) >=
          12
            ? "상"
            : prev.grade1 +
                prev.grade2 +
                prev.grade3 +
                (e.e.value.numref1 == undefined ? 0 : e.e.value.numref1) >=
              7
            ? "중"
            : prev.grade1 +
                prev.grade2 +
                prev.grade3 +
                (e.e.value.numref1 == undefined ? 0 : e.e.value.numref1) >
              1
            ? "하"
            : "",
      }));
    } else if (name == "amtgb") {
      setInformation((prev) => ({
        ...prev,
        [name]: value,
        grade5: e.e.value.numref1 == undefined ? 0 : e.e.value.numref1,
        totgrade2:
          (e.e.value.numref1 == undefined ? 0 : e.e.value.numref1) +
          prev.grade6 +
          prev.grade7,
        result2:
          (e.e.value.numref1 == undefined ? 0 : e.e.value.numref1) +
            prev.grade6 +
            prev.grade7 >=
          7
            ? "상"
            : (e.e.value.numref1 == undefined ? 0 : e.e.value.numref1) +
                prev.grade6 +
                prev.grade7 >=
              4
            ? "중"
            : (e.e.value.numref1 == undefined ? 0 : e.e.value.numref1) +
                prev.grade6 +
                prev.grade7 >
              1
            ? "하"
            : "",
      }));
    } else if (name == "addordgb") {
      setInformation((prev) => ({
        ...prev,
        [name]: value,
        grade6: e.e.value.numref1 == undefined ? 0 : e.e.value.numref1,
        totgrade2:
          prev.grade5 +
          (e.e.value.numref1 == undefined ? 0 : e.e.value.numref1) +
          prev.grade7,
        result2:
          prev.grade5 +
            (e.e.value.numref1 == undefined ? 0 : e.e.value.numref1) +
            prev.grade7 >=
          7
            ? "상"
            : prev.grade5 +
                (e.e.value.numref1 == undefined ? 0 : e.e.value.numref1) +
                prev.grade7 >=
              4
            ? "중"
            : prev.grade5 +
                (e.e.value.numref1 == undefined ? 0 : e.e.value.numref1) +
                prev.grade7 >
              1
            ? "하"
            : "",
      }));
    } else if (name == "relationgb") {
      setInformation((prev) => ({
        ...prev,
        [name]: value,
        grade7: e.e.value.numref1 == undefined ? 0 : e.e.value.numref1,
        totgrade2:
          prev.grade5 +
          prev.grade6 +
          (e.e.value.numref1 == undefined ? 0 : e.e.value.numref1),
        result2:
          prev.grade5 +
            prev.grade6 +
            (e.e.value.numref1 == undefined ? 0 : e.e.value.numref1) >=
          7
            ? "상"
            : prev.grade5 +
                prev.grade6 +
                (e.e.value.numref1 == undefined ? 0 : e.e.value.numref1) >=
              4
            ? "중"
            : prev.grade5 +
                prev.grade6 +
                (e.e.value.numref1 == undefined ? 0 : e.e.value.numref1) >
              1
            ? "하"
            : "",
      }));
    }
  };

  //조회조건 Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 조회 파라미터로 세팅
  const filterRadioChange = (e: any) => {
    const { name, value } = e;
    setFilters((prev) => ({
      ...prev,
      finyn: value,
    }));
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, customOptionData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters2.isSearch && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, customOptionData]);

  let gridRef: any = useRef(null);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    deletedMainRows = [];
    setPage(initialPageState);
    setPage2(initialPageState);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    let data: any;

    setLoading(true);

    //조회프로시저  파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_A1200_603W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "LIST",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_quokey": filters.quokey,
        "@p_custcd": filters.custnm == "" ? "" : filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_custprsnnm": filters.custprsnnm,
        "@p_chkperson": filters.chkperson,
        "@p_finyn": filters.finyn,
        "@p_quodtstr": convertDateToStr(filters.quodtstr),
        "@p_quodtend": convertDateToStr(filters.quodtend),
        "@p_cotracdtstr": convertDateToStr(filters.cotracdtstr),
        "@p_cotracdtend": convertDateToStr(filters.cotracdtend),
        "@p_feasibility": filters.feasibility,
        "@p_weight": filters.weight,
        "@p_stdt": filters.stdt,
        "@p_endt": filters.endt,
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
          setFilters2((prev) => ({
            ...prev,
            quokey: selectedRow.quokey,
            isSearch: true,
            pgNum: 1,
          }));
          setWorktype("U");
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setFilters2((prev) => ({
            ...prev,
            quokey: rows[0].quokey,
            isSearch: true,
            pgNum: 1,
          }));
          setWorktype("U");
        }
      } else {
        setWorktype("N");
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
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
    let data: any;

    setLoading(true);

    //조회프로시저  파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_A1200_603W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_quokey": filters2.quokey,
        "@p_custcd": filters.custnm == "" ? "" : filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_custprsnnm": filters.custprsnnm,
        "@p_chkperson": filters.chkperson,
        "@p_finyn": filters.finyn,
        "@p_quodtstr": convertDateToStr(filters.quodtstr),
        "@p_quodtend": convertDateToStr(filters.quodtend),
        "@p_cotracdtstr": convertDateToStr(filters.cotracdtstr),
        "@p_cotracdtend": convertDateToStr(filters.cotracdtend),
        "@p_feasibility": filters.feasibility,
        "@p_weight": filters.weight,
        "@p_stdt": filters.stdt,
        "@p_endt": filters.endt,
        "@p_find_row_value": filters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;
      const totalRowCnt2 = data.tables[1].RowCount;
      const rows2 = data.tables[1].Rows;
      const totalRowCnt3 = data.tables[2].RowCount;
      const rows3 = data.tables[2].Rows;
      setMainDataResult2({
        data: rows3,
        total: totalRowCnt3 == -1 ? 0 : totalRowCnt3,
      });

      if (totalRowCnt > 0) {
        setInformation({
          addordgb: rows[0].addordgb,
          amtgb: rows[0].amtgb,
          assaygbe: rows[0].assaygbe,
          financegb: rows[0].financegb,
          grade1: rows[0].grade1,
          grade2: rows[0].grade2,
          grade3: rows[0].grade3,
          grade4: rows[0].grade4,
          grade5: rows[0].grade5,
          grade6: rows[0].grade6,
          grade7: rows[0].grade7,
          materialgb: rows[0].materialgb,
          orgdiv: rows[0].orgdiv,
          relationgb: rows[0].relationgb,
          startschgb: rows[0].startschgb,
          totgrade1: rows[0].totgrade1,
          totgrade2: rows[0].totgrade2,
          result1: rows[0].result1,
          result2: rows[0].result2,
          quorev: rows2[0].quorev,
          conplandt: rows2[0].conplandt,
          submitdt: rows2[0].submitdt,
          seq: rows2[0].seq,
          passdt: rows2[0].passdt,
        });
      } else {
        setInformation({
          addordgb: "",
          amtgb: "",
          assaygbe: "",
          financegb: "",
          grade1: 0,
          grade2: 0,
          grade3: 0,
          grade4: 0,
          grade5: 0,
          grade6: 0,
          grade7: 0,
          materialgb: "",
          orgdiv: sessionOrgdiv,
          relationgb: "",
          startschgb: "",
          totgrade1: 0,
          totgrade2: 0,
          result1: "",
          result2: "",
          quorev: "",
          conplandt: "",
          submitdt: "",
          seq: 0,
          passdt: 0,
        });
      }
      if (totalRowCnt3 > 0) {
        setSelectedState2({ [rows3[0][DATA_ITEM_KEY2]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
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
      quokey: selectedRowData.quokey,
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

  const [tabSelected, setTabSelected] = React.useState(0);
  const handleSelectTab = (e: any) => {
    if (e.selected == 0) {
      setFilters((prev) => ({
        ...prev,
        pgNum: 1,
        find_row_value: "",
        isSearch: true,
      }));
    } else {
      const selectedRow = mainDataResult.data.filter(
        (item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

      setFilters2((prev) => ({
        ...prev,
        quokey: selectedRow.quokey,
        isSearch: true,
        pgNum: 1,
      }));
    }
    setTabSelected(e.selected);
  };

  const search = () => {
    resetAllGrid();
    setFilters((prev) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
    setTabSelected(0);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
  };

  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
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
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
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

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      if (tabSelected == 0) {
        const optionsGridOne = _export.workbookOptions();
        optionsGridOne.sheets[0].title = "요약정보";
        _export.save(optionsGridOne);
      }
    }
    if (_export2 !== null && _export2 !== undefined) {
      if (tabSelected == 1) {
        const optionsGridTwo = _export2.workbookOptions();
        optionsGridTwo.sheets[0].title = "코멘트";
        _export2.save(optionsGridTwo);
      }
    }
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

  const [ParaData, setParaData] = useState({
    workType: "",
    quokey: "",
    materialgb: "",
    assaygbe: "",
    startschgb: "",
    financegb: "",
    amtgb: "",
    addordgb: "",
    relationgb: "",
  });

  const infopara: Iparameters = {
    procedureName: "P_SA_A1200_603W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": sessionOrgdiv,
      "@p_location": sessionLocation,
      "@p_quokey": ParaData.quokey,
      "@p_materialgb": ParaData.materialgb,
      "@p_assaygbe": ParaData.assaygbe,
      "@p_startschgb": ParaData.startschgb,
      "@p_financegb": ParaData.financegb,
      "@p_amtgb": ParaData.amtgb,
      "@p_addordgb": ParaData.addordgb,
      "@p_relationgb": ParaData.relationgb,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "SA_A1200_603W",
    },
  };

  const onSaveClick = () => {
    if (
      Information.amtgb == "" ||
      Information.addordgb == "" ||
      Information.relationgb == "" ||
      Information.financegb == "" ||
      Information.startschgb == "" ||
      Information.assaygbe == "" ||
      Information.materialgb == ""
    ) {
      alert("필수값을 채워주세요");
      return false;
    }

    setParaData((prev) => ({
      ...prev,
      workType: "N",
      quokey: filters2.quokey,
      materialgb: Information.materialgb,
      assaygbe: Information.assaygbe,
      startschgb: Information.startschgb,
      financegb: Information.financegb,
      amtgb: Information.amtgb,
      addordgb: Information.addordgb,
      relationgb: Information.relationgb,
    }));
  };

  useEffect(() => {
    if (ParaData.workType != "") {
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
      deletedMainRows = [];
      setFilters2((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
      }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
      if (data.resultMessage != undefined) {
        alert(data.resultMessage);
      }
    }
    setLoading(false);
  };

  const onAddClick = () => {
    mainDataResult2.data.map((item) => {
      if (item[DATA_ITEM_KEY2] > temp) {
        temp = item[DATA_ITEM_KEY2];
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY2]: ++temp,
      comment: "",
      id: "",
      insert_userid: userId,
      recdt: convertDateToStr(new Date()),
      seq: 0,
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

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object3: any[] = [];
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
          deletedMainRows.push(newData2);
        }
        Object3.push(index);
      }
    });

    if (Math.min(...Object3) < Math.min(...Object2)) {
      data = mainDataResult2.data[Math.min(...Object2)];
    } else {
      data = mainDataResult2.data[Math.min(...Object3) - 1];
    }

    setMainDataResult2((prev) => ({
      data: newData,
      total: prev.total - Object3.length,
    }));
    if (Object3.length > 0) {
      setSelectedState2({
        [data != undefined ? data[DATA_ITEM_KEY2] : newData[0]]: true,
      });
    }
  };

  const onSaveClick3 = () => {
    const dataItem: { [name: string]: any } = mainDataResult2.data.filter(
      (item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      }
    );
    if (dataItem.length == 0 && deletedMainRows.length == 0) return false;

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
      ref_key: filters2.quokey,
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
      "@p_form_id": "SA_A1200_603W",
      "@p_table_id": "SA050T",
      "@p_orgdiv": sessionOrgdiv,
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
    if (data.isSuccess == true) {
      deletedMainRows = [];
      setFilters2((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
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

  const ongrdDetailItemChange2 = (event: GridItemChangeEvent) => {
    setMainDataState2((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult2,
      setMainDataResult2,
      DATA_ITEM_KEY2
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

  const enterEdit2 = (dataItem: any, field: string) => {
    if (field != "rowstatus" && field != "num") {
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

  return (
    <>
      <TitleContainer>
        <Title>계약가능성관리</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="SA_A1200_603W"
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
                  <th>PJT NO.</th>
                  <td>
                    <Input
                      name="quokey"
                      type="text"
                      value={filters.quokey}
                      onChange={InputChange}
                    />
                    <ButtonInInput>
                      <Button
                        icon="more-horizontal"
                        fillMode="flat"
                        onClick={onProejctWndClick}
                      />
                    </ButtonInInput>
                  </td>
                  <th>업체명</th>
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
                  <th>의뢰자</th>
                  <td>
                    <Input
                      name="custprsnnm"
                      type="text"
                      value={filters.custprsnnm}
                      onChange={InputChange}
                    />
                  </td>
                  <th>영업담당자</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="chkperson"
                        value={filters.chkperson}
                        customOptionData={customOptionData}
                        textField="user_name"
                        valueField="user_id"
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                  <th>계약여부</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="raduseyn"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>계약목표일</th>
                  <td>
                    <CommonDateRangePicker
                      value={{
                        start: filters.cotracdtstr,
                        end: filters.cotracdtend,
                      }}
                      onChange={(e: { value: { start: any; end: any } }) =>
                        setFilters((prev) => ({
                          ...prev,
                          cotracdtstr: e.value.start,
                          cotracdtend: e.value.end,
                        }))
                      }
                    />
                  </td>
                  <th>의뢰일자</th>
                  <td>
                    <CommonDateRangePicker
                      value={{
                        start: filters.quodtstr,
                        end: filters.quodtend,
                      }}
                      onChange={(e: { value: { start: any; end: any } }) =>
                        setFilters((prev) => ({
                          ...prev,
                          quodtstr: e.value.start,
                          quodtend: e.value.end,
                        }))
                      }
                    />
                  </td>
                  <th>경과기간</th>
                  <td>
                    <div className="flex align-items-center gap-2">
                      <NumericTextBox
                        name="stdt"
                        value={filters.stdt}
                        onChange={InputChange}
                      />
                      ~
                      <NumericTextBox
                        name="endt"
                        value={filters.endt}
                        onChange={InputChange}
                      />
                    </div>
                  </td>
                  <th>Feasibility</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="feasibility"
                        value={filters.feasibility}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                  <th>Weight</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="weight"
                        value={filters.weight}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <GridContainer>
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
              fileName="계약가능성관리"
            >
              <Grid
                style={{ height: "65vh" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    chkperson: userListData.find(
                      (items: any) => items.user_id == row.chkperson
                    )?.user_name,
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
                  customOptionData.menuCustomColumnOptions["grdList"]?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)?.map(
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
        <TabStripTab title="상세정보" disabled={worktype == "U" ? false : true}>
          <GridContainerWrap style={{ flexDirection: "column" }}>
            <GridContainer>
              <GridTitleContainer>
                <GridTitle>계약가능성관리</GridTitle>
                <ButtonContainer>
                  <Button
                    themeColor={"primary"}
                    icon="save"
                    onClick={onSaveClick}
                  >
                    저장
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
            </GridContainer>
            <FormBoxWrap
              border={true}
              style={{ display: isMobile ? "block" : "flex" }}
            >
              <FormBox width={"50%"}>
                <GridTitleContainer>
                  <GridTitle>Feasibility</GridTitle>
                </GridTitleContainer>
                <tbody>
                  <tr>
                    <th>물질확보여부</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentComboBox
                          name="materialgb"
                          value={Information.materialgb}
                          bizComponentId="L_SA012_603"
                          bizComponentData={bizComponentData}
                          changeData={ComboBoxChange}
                          className="required"
                        />
                      )}
                    </td>
                    <td>
                      <Input
                        name="grade1"
                        type="number"
                        style={{
                          textAlign: "right",
                        }}
                        value={numberWithCommas3(Information.grade1)}
                        className="readonly"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>분석법 보유 여부</th>
                    <td>
                      <BizComponentComboBox
                        name="assaygbe"
                        value={Information.assaygbe}
                        bizComponentId="L_SA013_603"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                        className="required"
                      />
                    </td>
                    <td>
                      <Input
                        name="grade2"
                        type="number"
                        style={{
                          textAlign: "right",
                        }}
                        value={numberWithCommas3(Information.grade2)}
                        className="readonly"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>시작예정</th>
                    <td>
                      <BizComponentComboBox
                        name="startschgb"
                        value={Information.startschgb}
                        bizComponentId="L_SA014_603"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                        className="required"
                      />
                    </td>
                    <td>
                      <Input
                        name="grade3"
                        type="number"
                        style={{
                          textAlign: "right",
                        }}
                        value={numberWithCommas3(Information.grade3)}
                        className="readonly"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>재무/투자현황</th>
                    <td>
                      <BizComponentComboBox
                        name="financegb"
                        value={Information.financegb}
                        bizComponentId="L_SA015_603"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                        className="required"
                      />
                    </td>
                    <td>
                      <Input
                        name="grade4"
                        type="number"
                        style={{
                          textAlign: "right",
                        }}
                        value={numberWithCommas3(Information.grade4)}
                        className="readonly"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>합계</th>
                    <td colSpan={2}>
                      <Input
                        name="totgrade1"
                        type="number"
                        style={{
                          textAlign: "right",
                        }}
                        value={numberWithCommas3(Information.totgrade1)}
                        className="readonly"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>결과</th>
                    <td colSpan={2}>
                      <Input
                        name="result1"
                        type="text"
                        style={{
                          textAlign: "center",
                        }}
                        value={Information.result1}
                        className="readonly"
                      />
                    </td>
                  </tr>
                </tbody>
              </FormBox>
              <FormBox style={{ width: "100%" }}>
                <GridTitleContainer>
                  <GridTitle>Weight</GridTitle>
                </GridTitleContainer>
                <tbody>
                  <tr>
                    <th>금액</th>
                    <td>
                      <BizComponentComboBox
                        name="amtgb"
                        value={Information.amtgb}
                        bizComponentId="L_SA016_603"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                        className="required"
                      />
                    </td>
                    <td>
                      <Input
                        name="grade5"
                        type="number"
                        style={{
                          textAlign: "right",
                        }}
                        value={numberWithCommas3(Information.grade5)}
                        className="readonly"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>추가수주</th>
                    <td>
                      <BizComponentComboBox
                        name="addordgb"
                        value={Information.addordgb}
                        bizComponentId="L_SA017_603"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                        className="required"
                      />
                    </td>
                    <td>
                      <Input
                        name="grade6"
                        type="number"
                        style={{
                          textAlign: "right",
                        }}
                        value={numberWithCommas3(Information.grade6)}
                        className="readonly"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>BTT관계사 확장</th>
                    <td>
                      <BizComponentComboBox
                        name="relationgb"
                        value={Information.relationgb}
                        bizComponentId="L_SA018_603"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                        className="required"
                      />
                    </td>
                    <td>
                      <Input
                        name="grade7"
                        type="number"
                        style={{
                          textAlign: "right",
                        }}
                        value={numberWithCommas3(Information.grade7)}
                        className="readonly"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>합계</th>
                    <td colSpan={2}>
                      <Input
                        name="totgrade2"
                        type="number"
                        style={{
                          textAlign: "right",
                        }}
                        value={numberWithCommas3(Information.totgrade2)}
                        className="readonly"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>결과</th>
                    <td colSpan={2}>
                      <Input
                        name="result2"
                        type="text"
                        style={{
                          textAlign: "center",
                        }}
                        value={Information.result2}
                        className="readonly"
                      />
                    </td>
                  </tr>
                </tbody>
              </FormBox>
            </FormBoxWrap>

            <GridTitleContainer>
              <GridTitle>계약성사관리</GridTitle>
            </GridTitleContainer>
            <FormBoxWrap
              border={true}
              style={{ display: isMobile ? "block" : "flex" }}
            >
              <GridContainer style={{ flexDirection: "column" }}>
                <FormBox>
                  <tbody>
                    <tr>
                      <th style={{ textAlign: "right" }}>견적차수</th>
                      <td>
                        <Input
                          name="quorev"
                          type="text"
                          style={{
                            textAlign: "center",
                          }}
                          value={Information.quorev}
                          className="readonly"
                        />
                      </td>
                      <th style={{ textAlign: "right" }}>견적제출일</th>
                      <td>
                        <Input
                          name="submitdt"
                          type="text"
                          style={{
                            textAlign: "center",
                          }}
                          value={dateformat2(Information.submitdt)}
                          className="readonly"
                        />
                      </td>
                      <th style={{ textAlign: "right" }}>활동차수</th>
                      <td>
                        <Input
                          name="seq"
                          type="text"
                          style={{
                            textAlign: "center",
                          }}
                          value={Information.seq}
                          className="readonly"
                        />
                      </td>
                      <th style={{ textAlign: "right" }}>계약목표일</th>
                      <td>
                        <Input
                          name="conplandt"
                          type="text"
                          style={{
                            textAlign: "center",
                          }}
                          value={dateformat2(Information.conplandt)}
                          className="readonly"
                        />
                      </td>
                      <th style={{ textAlign: "right" }}>경과기간</th>
                      <td>
                        <Input
                          name="passdt"
                          type="text"
                          style={{
                            textAlign: "center",
                          }}
                          value={Information.passdt}
                          className="readonly"
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </GridContainer>
            </FormBoxWrap>
            <GridContainer>
              <ExcelExport
                data={mainDataResult2.data}
                ref={(exporter) => {
                  _export2 = exporter;
                }}
                fileName="계약가능성관리"
              >
                <GridTitleContainer>
                  <GridTitle>코멘트</GridTitle>
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
                  style={{ height: "25vh" }}
                  data={process(
                    mainDataResult2.data.map((row) => ({
                      ...row,
                      recdt: row.recdt
                        ? new Date(dateformat(row.recdt))
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
                  onItemChange={ongrdDetailItemChange2}
                  cellRender={customCellRender2}
                  rowRender={customRowRender2}
                  editField={EDIT_FIELD}
                >
                  <GridColumn field="rowstatus" title=" " width="50px" />
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList2"]?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)?.map(
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
                                ? mainTotalFooterCell2
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </ExcelExport>
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
      {projectWindowVisible && (
        <ProjectsWindow
          setVisible={setProjectWindowVisible}
          setData={setProjectData}
          modal={true}
          pathname="SA_A1200W_603"
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

export default SA_A1200_603W;
