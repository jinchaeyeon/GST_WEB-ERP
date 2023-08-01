import React, { useEffect, useState, useRef } from "react";
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
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { Icon, getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import {
  Title,
  FilterBox,
  GridContainer,
  GridTitle,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
  FormBox,
  FormBoxWrap,
  GridContainerWrap,
} from "../CommonStyled";
import FilterContainer from "../components/Containers/FilterContainer";
import { Button } from "@progress/kendo-react-buttons";
import { Input, TextArea } from "@progress/kendo-react-inputs";
import { useApi } from "../hooks/api";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import { gridList } from "../store/columns/PR_A0030W_C";
import {
  chkScrollHandler,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  handleKeyPressSearch,
  getGridItemChangedData,
  UseParaPc,
  UseGetValueFromSessionItem,
  getCodeFromValue,
  useSysMessage,
} from "../components/CommonFunction";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  PAGE_SIZE,
  SELECTED_FIELD,
  EDIT_FIELD,
  GAP,
} from "../components/CommonString";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import TopButtons from "../components/Buttons/TopButtons";
import { useRecoilState, useSetRecoilState } from "recoil";
import { isLoading, loginResultState } from "../store/atoms";

const DATA_ITEM_KEY = "num";
const SUB_DATA_ITEM_KEY = "num";
const SUB_DATA_ITEM_KEY2 = "sub_code";
let temp = 0;
let deletedMainRows: object[] = [];

const CustomComboField = [
  "proccd",
  "outprocyn",
  "prodemp",
  "qtyunit",
  "procunit",
];

const NumberField = ["procseq", "unitqty", "procqty"];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent(
    "L_PR010,L_BA011,L_sysUserMaster_001,L_BA015",
    // 공정, 외주여부, 사용자, 수량단위, 공정단위
    setBizComponentData
  );

  const field = props.field ?? "";
  const bizComponentIdVal =
    field === "proccd"
      ? "L_PR010"
      : field === "outprocyn"
      ? "L_BA011"
      : field === "prodemp"
      ? "L_sysUserMaster_001"
      : field === "qtyunit"
      ? "L_BA015"
      : field === "procunit"
      ? "L_BA015"
      : "";

  const fieldName = field === "prodemp" ? "user_name" : undefined;
  const filedValue = field === "prodemp" ? "user_id" : undefined;
  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      textField={fieldName}
      valueField={filedValue}
      {...props}
    />
  ) : (
    <td />
  );
};

type TdataArr = {
  rowstatus_s: string[];
  seq_s: string[];
  proccd_s: string[];
  procseq_s: string[];
  outprocyn_s: string[];
};

const PR_A0030W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(SUB_DATA_ITEM_KEY2);
  const idGetter3 = getter(SUB_DATA_ITEM_KEY);
  const processApi = useApi();
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const userId = UseGetValueFromSessionItem("user_id");
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [workType, setWorkType] = useState<"U" | "N">("U");
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
        proccd: defaultOption.find((item: any) => item.id === "proccd")
          .valueCode,
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
      }));
    }
  }, [customOptionData]);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [subDataState, setSubDataState] = useState<State>({
    sort: [],
  });

  const [subData2State, setSubData2State] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [subDataResult, setSubDataResult] = useState<DataResult>(
    process([], subDataState)
  );

  const [subData2Result, setSubData2Result] = useState<DataResult>(
    process([], subData2State)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [selectedsubDataState, setSelectedsubDataState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [selectedsubData2State, setSelectedsubData2State] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [sub2PgNum, setSub2PgNum] = useState(1);

  const [ifSelectFirstRow2, setIfSelectFirstRow2] = useState(true);
  const [ifSelectFirstRow3, setIfSelectFirstRow3] = useState(true);

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

  //Form정보 Change
  const InputChange = (e: any) => {
    const { value, name } = e.target;
    setsubFilters2((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //Form정보 Change
  const InputChange2 = (e: any) => {
    const { value, name } = e.target;
    setInfomation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInfomation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    orgdiv: "01",
    location: "01",
    pattern_id: "",
    pattern_name: "",
    proccd: "",
    proccd2: "",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  //조회조건 초기값
  const [infomation, setInfomation] = useState({
    pattern_id: "",
    pattern_name: "",
    location: "",
    remark: "",
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_PR_A0030W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": filters.workType,
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.location,
      "@p_pattern_id": filters.pattern_id,
      "@p_pattern_name": filters.pattern_name,
      "@p_proccd2": filters.proccd2,
      "@p_proccd": filters.proccd,
      "@p_find_row_value": filters.find_row_value,
    },
  };

  const [subfilters2, setsubFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "PRODLIST",
    proccd2: "",
  });

  //조회조건 파라미터
  const subparameters: Iparameters = {
    procedureName: "P_PR_A0030W_Q",
    pageNumber: sub2PgNum,
    pageSize: subfilters2.pgSize,
    parameters: {
      "@p_work_type": subfilters2.workType,
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.location,
      "@p_pattern_id": filters.pattern_id,
      "@p_pattern_name": filters.pattern_name,
      "@p_proccd2": subfilters2.proccd2,
      "@p_proccd": filters.proccd,
      "@p_find_row_value": filters.find_row_value,
    },
  };

  const [subfilters, setsubFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "DETAIL",
    pattern_id: "",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  const subparameters2: Iparameters = {
    procedureName: "P_PR_A0030W_Q",
    pageNumber: subfilters.pgNum,
    pageSize: subfilters.pgSize,
    parameters: {
      "@p_work_type": subfilters.workType,
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.location,
      "@p_pattern_id": subfilters.pattern_id,
      "@p_pattern_name": filters.pattern_name,
      "@p_proccd2": filters.proccd2,
      "@p_proccd": filters.proccd,
      "@p_find_row_value": filters.find_row_value,
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
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
        if (filters.find_row_value === "" && filters.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedState({ [firstRowData[DATA_ITEM_KEY]]: true });
          setInfomation((prev) => ({
            ...prev,
            pattern_id: firstRowData.pattern_id,
            pattern_name: firstRowData.pattern_name,
            location: firstRowData.location,
            remark: firstRowData.remark,
          }));
          setsubFilters((prev) => ({
            ...prev,
            pattern_id: firstRowData.pattern_id,
            isSearch: true,
            pgNum: 1,
          }));
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  const fetchSubGrid2 = async () => {
    //if (!permissions?.view) return;
    let data: any;

    setLoading(true);
    try {
      data = await processApi<any>("procedure", subparameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        setSubData2Result((prev) => {
          return {
            data: rows,
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  const fetchSubGrid = async () => {
    //if (!permissions?.view) return;
    let data: any;

    setLoading(true);
    try {
      data = await processApi<any>("procedure", subparameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        setSubDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
        if (subfilters.find_row_value === "" && subfilters.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedsubDataState({ [firstRowData.num]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setsubFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (customOptionData != null && filters.isSearch && permissions !== null) {
      setFilters((prev) => ({ ...prev, isSearch: false }));
      fetchMainGrid();
    }
  }, [filters, permissions]);

  useEffect(() => {
    fetchSubGrid2();
  }, []);

  let gridRef : any = useRef(null); 

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (filters.find_row_value !== "" && mainDataResult.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = mainDataResult.data.findIndex(
          (item) => idGetter(item) === filters.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.container.scroll(0, scrollHeight);

        //초기화
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
          tab: 0,
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (filters.scrollDirrection === "up") {
        gridRef.container.scroll(0, 20);
      }
    }
  }, [mainDataResult]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (subfilters.find_row_value !== "" && subDataResult.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = subDataResult.data.findIndex(
          (item) => idGetter(item) === subfilters.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.container.scroll(0, scrollHeight);

        //초기화
        setsubFilters((prev) => ({
          ...prev,
          find_row_value: "",
          tab: 0,
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (subfilters.scrollDirrection === "up") {
        gridRef.container.scroll(0, 20);
      }
    }
  }, [subDataResult]);

  useEffect(() => {
    if (ifSelectFirstRow3) {
      if (subData2Result.total > 0) {
        const firstRowData = subData2Result.data[0];
        setSelectedsubData2State({ [firstRowData.sub_code]: true });

        setIfSelectFirstRow3(false);
      }
    }
  }, [subData2Result]);

  useEffect(() => {
    if (customOptionData !== null && subfilters.isSearch) {
      setsubFilters((prev) => ({ ...prev, isSearch: false }));
      fetchSubGrid();
    }
  }, [subfilters]);

  useEffect(() => {
    if (customOptionData !== null) {
      fetchSubGrid2();
    }
  }, [sub2PgNum]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
    setSub2PgNum(1);
    setSubDataResult(process([], subDataState));
    setSubData2Result(process([], subData2State));
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
    setWorkType("U");
    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
    setInfomation((prev) => ({
      ...prev,
      pattern_id: selectedRowData.pattern_id,
      pattern_name: selectedRowData.pattern_name,
      location: selectedRowData.location,
      remark: selectedRowData.remark,
    }));
    setSubDataResult(process([], subDataState));
    setsubFilters((prev) => ({
      ...prev,
      pattern_id: selectedRowData.pattern_id,
      isSearch: true,
      pgNum: 1,
    }));
    setIfSelectFirstRow2(true);
  };

  const onSubDataSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedsubDataState,
      dataItemKey: SUB_DATA_ITEM_KEY,
    });
    setSelectedsubDataState(newSelectedState);
  };

  const onAddRow = () => {
    let proseq = 1;
    let valid = true;
    if (subDataResult.total > 0) {
      const data = subData2Result.data.filter(
        (item: any) =>
          item.sub_code == Object.getOwnPropertyNames(selectedsubData2State)[0]
      )[0];

      subDataResult.data.forEach((item) => {
        if (item.procseq >= proseq) {
          proseq = item.procseq + 1;
        }

        if (item.proccd == data.sub_code && valid == true) {
          valid = false;
        }
      });
    }

    if (valid != true) alert("동일한 공정이 존재합니다.");
    else {
      subDataResult.data.map((item) => {
        if(item.num > temp){
          temp = item.num
        }
    })
      setIfSelectFirstRow2(false);
      const newDataItem = {
        [SUB_DATA_ITEM_KEY]: ++temp,
        chlditemcd: "",
        chlditemnm: "",
        custcd: "",
        custnm: "",
        orgdiv: "01",
        outgb: "",
        outprocyn: "N",
        prntitemcd: Object.getOwnPropertyNames(selectedState)[0],
        proccd: Object.getOwnPropertyNames(selectedsubData2State)[0],
        procitemcd: Object.getOwnPropertyNames(selectedState)[0],
        procqty: 1,
        procseq: proseq,
        procunit: "",
        prodemp: "",
        prodmac: "",
        qtyunit: "",
        recdt: "",
        remark: "",
        seq: 0,
        unitqty: 0,
        rowstatus: "N",
      };
      setSelectedsubDataState({ [newDataItem.num]: true });

      setSubDataResult((prev) => {
        return {
          data: [newDataItem, ...prev.data],
          total: prev.total + 1,
        };
      });
    }
  };
  const onSubData2SelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedsubData2State,
      dataItemKey: SUB_DATA_ITEM_KEY2,
    });

    setSelectedsubData2State(newSelectedState);
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
    if (filters.isSearch) return false; // 한꺼번에 여러번 조회 방지
    let pgNumWithGap =
      filters.pgNum + (filters.scrollDirrection === "up" ? filters.pgGap : 0);

    // 스크롤 최하단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE)) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "down",
        pgNum: pgNumWithGap + 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
      return false;
    }

    pgNumWithGap =
      filters.pgNum - (filters.scrollDirrection === "down" ? filters.pgGap : 0);
    // 스크롤 최상단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE, "up")) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "up",
        pgNum: pgNumWithGap - 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
    }
  };

  const onSubScrollHandler = (event: GridEvent) => {
    if (subfilters.isSearch) return false; // 한꺼번에 여러번 조회 방지
    let pgNumWithGap =
      subfilters.pgNum +
      (subfilters.scrollDirrection === "up" ? subfilters.pgGap : 0);

    // 스크롤 최하단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE)) {
      setsubFilters((prev) => ({
        ...prev,
        scrollDirrection: "down",
        pgNum: pgNumWithGap + 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
      return false;
    }

    pgNumWithGap =
      subfilters.pgNum -
      (subfilters.scrollDirrection === "down" ? subfilters.pgGap : 0);
    // 스크롤 최상단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE, "up")) {
      setsubFilters((prev) => ({
        ...prev,
        scrollDirrection: "up",
        pgNum: pgNumWithGap - 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
    }
  };

  const onSub2ScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, sub2PgNum, PAGE_SIZE))
      setSub2PgNum((prev) => prev + 1);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onSubDataStateChange = (event: GridDataStateChangeEvent) => {
    setSubDataState(event.dataState);
  };

  const onSubData2StateChange = (event: GridDataStateChangeEvent) => {
    setSubData2State(event.dataState);
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

  const sub2TotalFooterCell = (props: GridFooterCellProps) => {
    var parts = subData2Result.total.toString().split(".");
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

  const onSubData2SortChange = (e: any) => {
    setSubData2State((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    resetAllGrid();
    fetchSubGrid2();
    setWorkType("U");
    deletedMainRows = [];
  };

  const search2 = () => {
    setSub2PgNum(1);
    setSubData2Result(process([], subData2State));
    fetchSubGrid2();
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

  const enterEdit = (dataItem: any, field: string) => {
    if (field != "rowstatus") {
      const newData = subDataResult.data.map((item) =>
        item[SUB_DATA_ITEM_KEY] === dataItem[SUB_DATA_ITEM_KEY]
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

  const exitEdit = () => {
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

  const onAddClick = (e: any) => {
    setInfomation({
      pattern_id: "",
      pattern_name: "",
      location: "01",
      remark: "",
    });
    setSubDataResult(process([], subDataState));
    setWorkType("N");
  };

  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "D",
    pattern_id: "",
    pattern_name: "",
    location: "",
  });

  const questionToDelete = useSysMessage("QuestionToDelete");

  const onDeleteClick = (e: any) => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    const datas = mainDataResult.data.filter(
      (item) => item.num == Object.getOwnPropertyNames(selectedState)[0]
    )[0];

    setParaDataDeleted((prev) => ({
      ...prev,
      work_type: "D",
      pattern_id: datas.pattern_id,
      pattern_name: datas.pattern_name,
      location: datas.location,
    }));
  };

  const paraDeleted: Iparameters = {
    procedureName: "P_PR_A0030W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataDeleted.work_type,
      "@p_orgdiv": "01",
      "@p_location": paraDataDeleted.location,
      "@p_pattern_id": paraDataDeleted.pattern_id,
      "@p_pattern_name": paraDataDeleted.pattern_name,
      "@p_remark": "",
      "@p_rowstatus_s": "",
      "@p_seq_s": "",
      "@p_proccd_s": "",
      "@p_procseq_s": "",
      "@p_outprocyn_s": "",
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "PR_A0030W",
      "@p_company_code": companyCode,
    },
  };

  useEffect(() => {
    if (paraDataDeleted.pattern_id != "") fetchToDelete();
  }, [paraDataDeleted]);

  const fetchToDelete = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraDeleted);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      resetAllGrid();
      fetchSubGrid2();
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }

    paraDataDeleted.work_type = "D"; //초기화
    paraDataDeleted.pattern_id = "";
    paraDataDeleted.pattern_name = "";
    paraDataDeleted.location = "";
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

        deletedMainRows.push(newData2);
      }
    });
    setSubDataResult((prev) => ({
      data: newData,
      total: newData.length,
    }));

    setSubData2State({});
  };

  const [paraData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "",
    orgdiv: "01",
    location: "",
    pattern_id: "",
    pattern_name: "",
    remark: "",
    rowstatus_s: "",
    seq_s: "",
    proccd_s: "",
    procseq_s: "",
    outprocyn_s: "",
    userid: userId,
    pc: pc,
    form_id: "PR_A0030W",
    company_code: companyCode,
  });

  const para: Iparameters = {
    procedureName: "P_PR_A0030W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": workType,
      "@p_orgdiv": "01",
      "@p_location": paraData.location,
      "@p_pattern_id": paraData.pattern_id,
      "@p_pattern_name": paraData.pattern_name,
      "@p_remark": paraData.remark,
      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_seq_s": paraData.seq_s,
      "@p_proccd_s": paraData.proccd_s,
      "@p_procseq_s": paraData.procseq_s,
      "@p_outprocyn_s": paraData.outprocyn_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "PR_A0030W",
      "@p_company_code": companyCode,
    },
  };

  const onSaveClick = async () => {
    let valid = true;
    if (infomation.pattern_id == "") {
      alert("패턴ID를 입력해주세요.");
      valid = false;
      return false;
    }
    if (infomation.pattern_name == "") {
      alert("패턴명를 입력해주세요.");
      valid = false;
      return false;
    }
    if (infomation.location == "") {
      alert("사업장을 입력해주세요.");
      valid = false;
      return false;
    }

    const dataItem = subDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    if (subDataResult.data.length == 0) {
      alert("데이터가 없습니다.");
      valid = false;
      return false;
    }

    if (dataItem.length === 0 && deletedMainRows.length === 0) {
      setParaData((prev) => ({
        ...prev,
        workType: "U",
        location: infomation.location,
        pattern_id: infomation.pattern_id,
        pattern_name: infomation.pattern_name,
        remark: infomation.remark,
      }));
    } else {
      let dataArr: TdataArr = {
        rowstatus_s: [],
        seq_s: [],
        proccd_s: [],
        procseq_s: [],
        outprocyn_s: [],
      };
      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          seq = "",
          proccd = "",
          procseq = "",
          outprocyn = "",
        } = item;
        dataArr.rowstatus_s.push(rowstatus);
        dataArr.seq_s.push(seq);
        dataArr.proccd_s.push(proccd);
        dataArr.procseq_s.push(procseq);
        dataArr.outprocyn_s.push(outprocyn);
      });
      if (workType == "U") {
        deletedMainRows.forEach((item: any, idx: number) => {
          const {
            rowstatus = "",
            seq = "",
            proccd = "",
            procseq = "",
            outprocyn = "",
          } = item;
          dataArr.rowstatus_s.push(rowstatus);
          dataArr.seq_s.push(seq);
          dataArr.proccd_s.push(proccd);
          dataArr.procseq_s.push(procseq);
          dataArr.outprocyn_s.push(outprocyn);
        });
      }
      setParaData((prev) => ({
        ...prev,
        workType: "U",
        location: infomation.location,
        pattern_id: infomation.pattern_id,
        pattern_name: infomation.pattern_name,
        remark: infomation.remark,
        rowstatus_s: dataArr.rowstatus_s.join("|"),
        seq_s: dataArr.seq_s.join("|"),
        proccd_s: dataArr.proccd_s.join("|"),
        procseq_s: dataArr.procseq_s.join("|"),
        outprocyn_s: dataArr.outprocyn_s.join("|"),
      }));
    }
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
      setWorkType("U");
      setParaData({
        workType: "",
        pgSize: PAGE_SIZE,
        orgdiv: "01",
        location: "",
        pattern_id: "",
        pattern_name: "",
        remark: "",
        rowstatus_s: "",
        seq_s: "",
        proccd_s: "",
        procseq_s: "",
        outprocyn_s: "",
        userid: userId,
        pc: pc,
        form_id: "PR_A0030W",
        company_code: companyCode,
      });
      fetchSubGrid2();
      deletedMainRows = [];
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (paraData.workType != "") {
      fetchTodoGridSaved();
    }
  }, [paraData]);

  type TDataInfo = {
    SUB_DATA_ITEM_KEY: string;
    selectedsubDataState: {
      [id: string]: boolean | number[];
    };
    dataResult: DataResult;
    setDataResult: (p: any) => any;
  };

  type TArrowBtnClick = {
    direction: string;
    dataInfo: TDataInfo;
  };

  const arrowBtnClickPara = {
    SUB_DATA_ITEM_KEY: SUB_DATA_ITEM_KEY,
    selectedsubDataState: selectedsubDataState,
    dataResult: subDataResult,
    setDataResult: setSubDataResult,
  };

  const onArrowsBtnClick = (para: TArrowBtnClick) => {
    const { direction, dataInfo } = para;
    const {
      SUB_DATA_ITEM_KEY,
      selectedsubDataState,
      dataResult,
      setDataResult,
    } = dataInfo;
    const selectedField = Object.getOwnPropertyNames(selectedsubDataState)[0];

    const rowData = dataResult.data.find(
      (row) => row[SUB_DATA_ITEM_KEY] == selectedField
    );

    const rowIndex = dataResult.data.findIndex(
      (row) => row[SUB_DATA_ITEM_KEY] == selectedField
    );

    if (rowIndex === -1) {
      alert("이동시킬 행을 선택해주세요.");
      return false;
    }
    if (!(rowIndex == 0 && direction === "UP")) {
      const newData = dataResult.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      let replaceData = 0;
      if (direction === "UP" && rowIndex != 0) {
        replaceData = dataResult.data[rowIndex - 1].procseq;
      } else {
        replaceData = dataResult.data[rowIndex + 1].procseq;
      }

      newData.splice(rowIndex, 1);
      newData.splice(rowIndex + (direction === "UP" ? -1 : 1), 0, rowData);
      if (direction === "UP" && rowIndex != 0) {
        const newDatas = newData.map((item) =>
          item[DATA_ITEM_KEY] === rowData[DATA_ITEM_KEY]
            ? {
                ...item,
                procseq: replaceData,
                rowstatus: item.rowstatus === "N" ? "N" : "U",
                [EDIT_FIELD]: undefined,
              }
            : item[DATA_ITEM_KEY] === dataResult.data[rowIndex - 1].num
            ? {
                ...item,
                procseq: rowData.procseq,
                rowstatus: item.rowstatus === "N" ? "N" : "U",
                [EDIT_FIELD]: undefined,
              }
            : {
                ...item,
                [EDIT_FIELD]: undefined,
              }
        );

        setDataResult((prev: any) => {
          return {
            data: newDatas,
            total: prev.total,
          };
        });
      } else {
        const newDatas = newData.map((item) =>
          item[DATA_ITEM_KEY] === rowData[DATA_ITEM_KEY]
            ? {
                ...item,
                procseq: replaceData,
                rowstatus: item.rowstatus === "N" ? "N" : "U",
                [EDIT_FIELD]: undefined,
              }
            : item[DATA_ITEM_KEY] === dataResult.data[rowIndex + 1].num
            ? {
                ...item,
                procseq: rowData.procseq,
                rowstatus: item.rowstatus === "N" ? "N" : "U",
                [EDIT_FIELD]: undefined,
              }
            : {
                ...item,
                [EDIT_FIELD]: undefined,
              }
        );

        setDataResult((prev: any) => {
          return {
            data: newDatas,
            total: prev.total,
          };
        });
      }
    }
  };

  return (
    <>
      <TitleContainer>
        <Title>공정패턴관리</Title>

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
              <th>패턴ID</th>
              <td>
                <Input
                  name="pattern_id"
                  type="text"
                  value={filters.pattern_id}
                  onChange={filterInputChange}
                />
              </td>
              <th>패턴명</th>
              <td>
                <Input
                  name="pattern_name"
                  type="text"
                  value={filters.pattern_name}
                  onChange={filterInputChange}
                />
              </td>
              <th>공정</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="proccd"
                    value={filters.proccd}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>사업장</th>
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
        <GridContainer width={`37%`}>
          <GridTitleContainer>
            <GridTitle>요약정보</GridTitle>
          </GridTitleContainer>
          <Grid
            style={{ height: "77vh" }}
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
            onScroll={onMainScrollHandler}
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
                      footerCell={
                        item.sortOrder === 0 ? mainTotalFooterCell : undefined
                      }
                    />
                  )
              )}
          </Grid>
        </GridContainer>
        <GridContainer width={`calc(63% - ${GAP}px)`}>
          <GridTitleContainer>
            <GridTitle>기본정보</GridTitle>
            <ButtonContainer>
              <Button
                onClick={onAddClick}
                themeColor={"primary"}
                icon="file-add"
              >
                생성
              </Button>
              <Button
                onClick={onDeleteClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="delete"
              >
                삭제
              </Button>
              <Button
                onClick={onSaveClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="save"
              >
                저장
              </Button>
            </ButtonContainer>
          </GridTitleContainer>
          <FormBoxWrap border={true}>
            <FormBox>
              <tbody>
                <tr>
                  <th>패턴ID</th>
                  {workType == "U" ? (
                    <td>
                      <Input
                        name="pattern_id"
                        type="text"
                        value={infomation.pattern_id}
                        className="readonly"
                      />
                    </td>
                  ) : (
                    <td>
                      <Input
                        name="pattern_id"
                        type="text"
                        value={infomation.pattern_id}
                        onChange={InputChange2}
                        className="required"
                      />
                    </td>
                  )}
                  <th>패턴명</th>
                  <td>
                    <Input
                      name="pattern_name"
                      type="text"
                      value={infomation.pattern_name}
                      onChange={InputChange2}
                      className="required"
                    />
                  </td>
                  <th>사업장</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="location"
                        value={infomation.location}
                        customOptionData={customOptionData}
                        changeData={ComboBoxChange}
                        className="required"
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>비고</th>
                  <td colSpan={5}>
                    <TextArea
                      value={infomation.remark}
                      name="remark"
                      rows={2}
                      onChange={InputChange2}
                    />
                  </td>
                </tr>
              </tbody>
            </FormBox>
          </FormBoxWrap>
          <GridContainerWrap>
            <GridContainer width={`46%`}>
              <GridTitleContainer>
                <GridTitle>공정리스트</GridTitle>
              </GridTitleContainer>
              <FormBoxWrap border={true}>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>공정</th>
                      <td>
                        <Input
                          name="proccd2"
                          type="text"
                          value={subfilters2.proccd2}
                          onChange={InputChange}
                        />
                      </td>
                      <th>
                        <Button onClick={search2} themeColor={"primary"}>
                          조회
                        </Button>
                      </th>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <Grid
                style={{ height: "54.5vh" }}
                data={process(
                  subData2Result.data.map((row) => ({
                    ...row,
                    [SELECTED_FIELD]: selectedsubData2State[idGetter2(row)],
                  })),
                  subData2State
                )}
                {...subData2State}
                onDataStateChange={onSubData2StateChange}
                //선택 기능
                dataItemKey={SUB_DATA_ITEM_KEY2}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "multiple",
                }}
                onSelectionChange={onSubData2SelectionChange}
                //스크롤 조회 기능
                fixedScroll={true}
                total={subData2Result.total}
                onScroll={onSub2ScrollHandler}
                //정렬기능
                sortable={true}
                onSortChange={onSubData2SortChange}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
                onRowDoubleClick={onAddRow}
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
                          footerCell={
                            item.sortOrder === 0
                              ? sub2TotalFooterCell
                              : undefined
                          }
                        />
                      )
                  )}
              </Grid>
            </GridContainer>
            <GridContainer width={`calc(54% - ${GAP}px)`}>
              <ExcelExport
                data={subDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
              >
                <GridTitleContainer>
                  <GridTitle>공정패턴상세</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={onDeleteClick2}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="minus"
                      title="행 삭제"
                    />
                    <Button
                      onClick={() =>
                        onArrowsBtnClick({
                          direction: "UP",
                          dataInfo: arrowBtnClickPara,
                        })
                      }
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="chevron-up"
                      title="행 위로 이동"
                    ></Button>
                    <Button
                      onClick={() =>
                        onArrowsBtnClick({
                          direction: "DOWN",
                          dataInfo: arrowBtnClickPara,
                        })
                      }
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="chevron-down"
                      title="행 아래로 이동"
                    ></Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <Grid
                  style={{ height: "61vh" }}
                  data={process(
                    subDataResult.data.map((row) => ({
                      ...row,
                      rowstatus:
                        row.rowstatus == null ||
                        row.rowstatus == "" ||
                        row.rowstatus == undefined
                          ? ""
                          : row.rowstatus,
                      [SELECTED_FIELD]: selectedsubDataState[idGetter3(row)],
                    })),
                    subDataState
                  )}
                  {...subDataState}
                  onDataStateChange={onSubDataStateChange}
                  //선택 기능
                  dataItemKey={SUB_DATA_ITEM_KEY2}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "multiple",
                  }}
                  onSelectionChange={onSubDataSelectionChange}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={subDataResult.total}
                  onScroll={onSubScrollHandler}
                  //정렬기능
                  sortable={true}
                  onSortChange={onSubDataSortChange}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  onItemChange={onSubItemChange}
                  cellRender={customCellRender}
                  rowRender={customRowRender}
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
                              CustomComboField.includes(item.fieldName)
                                ? CustomComboBoxCell
                                : NumberField.includes(item.fieldName)
                                ? NumberCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 0
                                ? subTotalFooterCell
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </ExcelExport>
            </GridContainer>
          </GridContainerWrap>
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

export default PR_A0030W;
