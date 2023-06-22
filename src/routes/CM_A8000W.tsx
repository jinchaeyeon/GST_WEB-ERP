import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { gridList } from "../store/columns/CM_A8000W_C";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { getter } from "@progress/kendo-react-common";
import { bytesToBase64 } from "byte-base64";
import { DataResult, process, State } from "@progress/kendo-data-query";
import {
  Title,
  FilterBox,
  GridContainer,
  GridTitle,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
  GridContainerWrap,
} from "../CommonStyled";
import FilterContainer from "../components/Containers/FilterContainer";
import { Button } from "@progress/kendo-react-buttons";
import { useApi } from "../hooks/api";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import {
  chkScrollHandler,
  convertDateToStr,
  findMessage,
  getQueryFromBizComponent,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  handleKeyPressSearch,
  getGridItemChangedData,
  dateformat,
  UseParaPc,
  UseGetValueFromSessionItem,
  setDefaultDate,
  toDate,
  useSysMessage,
} from "../components/CommonFunction";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
  EDIT_FIELD,
  GAP,
} from "../components/CommonString";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import TopButtons from "../components/Buttons/TopButtons";
import { useRecoilState, useSetRecoilState } from "recoil";
import { isLoading, loginResultState } from "../store/atoms";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { Input } from "@progress/kendo-react-inputs";
import CheckBoxCell from "../components/Cells/CheckBoxCell";

const DATA_ITEM_KEY = "num";
const SUB_DATA_ITEM_KEY = "num";
let deletedMainRows: object[] = [];

const NumberField = ["fnscore", "exptime", "absolutedays"];
const CustomComboField = [
  "level",
  "DesignPerson",
  "DevPerson",
  "itemlvl1",
  "itemlvl2",
  "itemlvl3",
];
const requiredField = ["valueboxnm"];
const CheckField = ["useyn"];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent(
    "L_BA010_GST,L_BA011_GST,L_BA012_GST,L_sysUserMaster_001,L_CM000100_002",
    setBizComponentData
  );

  const field = props.field ?? "";
  const bizComponentIdVal =
    field === "itemlvl1"
      ? "L_BA010_GST"
      : field === "itemlvl2"
      ? "L_BA011_GST"
      : field === "itemlvl3"
      ? "L_BA012_GST"
      : field === "DesignPerson"
      ? "L_sysUserMaster_001"
      : field === "DevPerson"
      ? "L_sysUserMaster_001"
      : field === "level"
      ? "L_CM000100_002"
      : "";
  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  if (bizComponentIdVal == "L_CM000100_002") {
    return bizComponent ? (
      <ComboBoxCell
        bizComponent={bizComponent}
        valueField="code"
        textField="name"
        {...props}
      />
    ) : (
      <td />
    );
  } else if (bizComponentIdVal == "L_sysUserMaster_001") {
    return bizComponent ? (
      <ComboBoxCell
        bizComponent={bizComponent}
        valueField="user_id"
        textField="user_name"
        {...props}
      />
    ) : (
      <td />
    );
  } else {
    return bizComponent ? (
      <ComboBoxCell bizComponent={bizComponent} {...props} />
    ) : (
      <td />
    );
  }
};

const CM_A8000W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(SUB_DATA_ITEM_KEY);
  const processApi = useApi();
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const userId = UseGetValueFromSessionItem("user_id");
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
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;

      setFilters((prev) => ({
        ...prev,
        itemlvl1: defaultOption.find((item: any) => item.id === "itemlvl1")
          .valueCode,
        itemlvl2: defaultOption.find((item: any) => item.id === "itemlvl2")
          .valueCode,
        itemlvl3: defaultOption.find((item: any) => item.id === "itemlvl3")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_SA010",
    //환율사이트
    setBizComponentData
  );
  const [siteListData, setSiteListData] = useState([
    { sub_code: "", memo: "" },
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const siteQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_SA010")
      );

      fetchQuery(siteQueryStr, setSiteListData);
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

  const [subDataState, setSubDataState] = useState<State>({
    sort: [],
  });

  const [subDataState2, setSubDataState2] = useState<State>({
    sort: [],
  });

  const [subDataState3, setSubDataState3] = useState<State>({
    sort: [],
  });

  const [isInitSearch, setIsInitSearch] = useState(false);

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [subDataResult, setSubDataResult] = useState<DataResult>(
    process([], subDataState)
  );

  const [subDataResult2, setSubDataResult2] = useState<DataResult>(
    process([], subDataState2)
  );

  const [subDataResult3, setSubDataResult3] = useState<DataResult>(
    process([], subDataState3)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [selectedsubDataState, setSelectedsubDataState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [selectedsubDataState2, setSelectedsubDataState2] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [selectedsubDataState3, setSelectedsubDataState3] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [mainPgNum, setMainPgNum] = useState(1);

  const [ifSelectFirstRow, setIfSelectFirstRow] = useState(true);
  const [ifSelectFirstRow2, setIfSelectFirstRow2] = useState(true);

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

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q",
    orgdiv: "01",
    valueboxcd: "",
    valueboxnm: "",
    remark2: "",
    itemlvl1: "",
    itemlvl2: "",
    itemlvl3: "",
    DesignPerson: "",
    DevPerson: "",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  //조회조건 초기값
  const [filters1, setFilters1] = useState({
    pgSize: PAGE_SIZE,
    workType: "LVL1",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  //조회조건 초기값
  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "LVL2",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  //조회조건 초기값
  const [filters3, setFilters3] = useState({
    pgSize: PAGE_SIZE,
    workType: "LVL3",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_CM_A8000W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": filters.workType,
      "@p_orgdiv": filters.orgdiv,
      "@p_valueboxcd": filters.valueboxcd,
      "@p_valueboxnm": filters.valueboxnm,
      "@p_remark2": filters.remark2,
      "@p_itemlvl1": filters.itemlvl1,
      "@p_itemlvl2": filters.itemlvl2,
      "@p_itemlvl3": filters.itemlvl3,
      "@p_DesignPerson": filters.DesignPerson,
      "@p_DevPerson": filters.DevPerson,
    },
  };

  //조회조건 파라미터
  const parameters2: Iparameters = {
    procedureName: "P_CM_A8000W_Q",
    pageNumber: filters1.pgNum,
    pageSize: filters1.pgSize,
    parameters: {
      "@p_work_type": filters1.workType,
      "@p_orgdiv": "01",
      "@p_valueboxcd": filters.valueboxcd,
      "@p_valueboxnm": filters.valueboxnm,
      "@p_remark2": filters.remark2,
      "@p_itemlvl1": filters.itemlvl1,
      "@p_itemlvl2": filters.itemlvl2,
      "@p_itemlvl3": filters.itemlvl3,
      "@p_DesignPerson": filters.DesignPerson,
      "@p_DevPerson": filters.DevPerson,
    },
  };

  //조회조건 파라미터
  const parameters3: Iparameters = {
    procedureName: "P_CM_A8000W_Q",
    pageNumber: filters2.pgNum,
    pageSize: filters2.pgSize,
    parameters: {
      "@p_work_type": filters2.workType,
      "@p_orgdiv": "01",
      "@p_valueboxcd": filters.valueboxcd,
      "@p_valueboxnm": filters.valueboxnm,
      "@p_remark2": filters.remark2,
      "@p_itemlvl1": filters.itemlvl1,
      "@p_itemlvl2": filters.itemlvl2,
      "@p_itemlvl3": filters.itemlvl3,
      "@p_DesignPerson": filters.DesignPerson,
      "@p_DevPerson": filters.DevPerson,
    },
  };

  //조회조건 파라미터
  const parameters4: Iparameters = {
    procedureName: "P_CM_A8000W_Q",
    pageNumber: filters3.pgNum,
    pageSize: filters3.pgSize,
    parameters: {
      "@p_work_type": filters3.workType,
      "@p_orgdiv": "01",
      "@p_valueboxcd": filters.valueboxcd,
      "@p_valueboxnm": filters.valueboxnm,
      "@p_remark2": filters.remark2,
      "@p_itemlvl1": filters.itemlvl1,
      "@p_itemlvl2": filters.itemlvl2,
      "@p_itemlvl3": filters.itemlvl3,
      "@p_DesignPerson": filters.DesignPerson,
      "@p_DevPerson": filters.DevPerson,
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
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });

      if (totalRowCnt >= 0) {
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
        if (filters.find_row_value === "" && filters.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedState({ [firstRowData[DATA_ITEM_KEY]]: true });
        }
      }

      setIfSelectFirstRow2(true);
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

  //그리드 데이터 조회
  const fetchMainGrid2 = async () => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });

      if (totalRowCnt >= 0) {
        setSubDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
        if (filters1.find_row_value === "" && filters1.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedsubDataState({ [firstRowData[DATA_ITEM_KEY]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setFilters1((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  //그리드 데이터 조회
  const fetchMainGrid3 = async () => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters3);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });

      if (totalRowCnt >= 0) {
        setSubDataResult2((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
        if (filters2.find_row_value === "" && filters2.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedsubDataState2({ [firstRowData[DATA_ITEM_KEY]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setFilters2((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  //그리드 데이터 조회
  const fetchMainGrid4 = async () => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters4);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });

      if (totalRowCnt >= 0) {
        setSubDataResult3((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
        if (filters3.find_row_value === "" && filters3.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedsubDataState3({ [firstRowData[DATA_ITEM_KEY]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setFilters3((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      customOptionData != null &&
      filters.isSearch &&
      permissions !== null &&
      bizComponentData !== null &&
      isInitSearch == false
    ) {
      setFilters((prev) => ({ ...prev, isSearch: false }));
      fetchMainGrid();
      fetchMainGrid2();
      fetchMainGrid3();
      fetchMainGrid4();
      setIsInitSearch(true);
    }
  }, [filters, permissions]);

  useEffect(() => {
    if (
      customOptionData != null &&
      filters.isSearch &&
      permissions !== null &&
      bizComponentData !== null &&
      isInitSearch == true
    ) {
      setFilters((prev) => ({ ...prev, isSearch: false }));
      fetchMainGrid();
    }
  }, [filters, permissions]);

  useEffect(() => {
    if (
      customOptionData != null &&
      filters1.isSearch &&
      permissions !== null &&
      bizComponentData !== null
    ) {
      setFilters1((prev) => ({ ...prev, isSearch: false }));
      fetchMainGrid2();
    }
  }, [filters1]);

  useEffect(() => {
    if (
      customOptionData != null &&
      filters2.isSearch &&
      permissions !== null &&
      bizComponentData !== null
    ) {
      setFilters2((prev) => ({ ...prev, isSearch: false }));
      fetchMainGrid3();
    }
  }, [filters2]);

  useEffect(() => {
    if (
      customOptionData != null &&
      filters3.isSearch &&
      permissions !== null &&
      bizComponentData !== null
    ) {
      setFilters3((prev) => ({ ...prev, isSearch: false }));
      fetchMainGrid4();
    }
  }, [filters3]);

  let gridRef: any = useRef(null);

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
        gridRef.vs.container.scroll(0, scrollHeight);

        //초기화
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (filters.scrollDirrection === "up") {
        gridRef.vs.container.scroll(0, 20);
      }
    }
  }, [mainDataResult]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (filters1.find_row_value !== "" && subDataResult.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = subDataResult.data.findIndex(
          (item) => idGetter(item) === filters1.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.vs.container.scroll(0, scrollHeight);

        //초기화
        setFilters1((prev) => ({
          ...prev,
          find_row_value: "",
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (filters1.scrollDirrection === "up") {
        gridRef.vs.container.scroll(0, 20);
      }
    }
  }, [subDataResult]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (filters2.find_row_value !== "" && subDataResult2.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = subDataResult2.data.findIndex(
          (item) => idGetter(item) === filters2.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.vs.container.scroll(0, scrollHeight);

        //초기화
        setFilters2((prev) => ({
          ...prev,
          find_row_value: "",
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (filters2.scrollDirrection === "up") {
        gridRef.vs.container.scroll(0, 20);
      }
    }
  }, [subDataResult2]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (filters3.find_row_value !== "" && subDataResult3.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = subDataResult3.data.findIndex(
          (item) => idGetter(item) === filters3.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.vs.container.scroll(0, scrollHeight);

        //초기화
        setFilters3((prev) => ({
          ...prev,
          find_row_value: "",
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (filters3.scrollDirrection === "up") {
        gridRef.vs.container.scroll(0, 20);
      }
    }
  }, [subDataResult3]);

  //그리드 리셋
  const resetAllGrid = () => {
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
    setMainDataResult(process([], mainDataState));
    setFilters1((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
    setSubDataResult(process([], subDataState));
    setFilters2((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
    setSubDataResult2(process([], subDataState2));
    setFilters3((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
    setSubDataResult3(process([], subDataState3));
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

  const onSubDataSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedsubDataState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedsubDataState(newSelectedState);
  };

  const onSubDataSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedsubDataState2,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedsubDataState2(newSelectedState);
  };

  const onSubDataSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedsubDataState3,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedsubDataState3(newSelectedState);
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
        tab: 0,
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
        tab: 0,
      }));
    }
  };

  //스크롤 핸들러
  const onSubScrollHandler = (event: GridEvent) => {
    if (filters1.isSearch) return false; // 한꺼번에 여러번 조회 방지
    let pgNumWithGap =
      filters1.pgNum +
      (filters1.scrollDirrection === "up" ? filters1.pgGap : 0);

    // 스크롤 최하단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE)) {
      setFilters1((prev) => ({
        ...prev,
        scrollDirrection: "down",
        pgNum: pgNumWithGap + 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
        tab: 0,
      }));
      return false;
    }

    pgNumWithGap =
      filters1.pgNum -
      (filters1.scrollDirrection === "down" ? filters1.pgGap : 0);
    // 스크롤 최상단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE, "up")) {
      setFilters1((prev) => ({
        ...prev,
        scrollDirrection: "up",
        pgNum: pgNumWithGap - 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
        tab: 0,
      }));
    }
  };

  //스크롤 핸들러
  const onSubScrollHandler2 = (event: GridEvent) => {
    if (filters2.isSearch) return false; // 한꺼번에 여러번 조회 방지
    let pgNumWithGap =
      filters2.pgNum +
      (filters2.scrollDirrection === "up" ? filters2.pgGap : 0);

    // 스크롤 최하단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE)) {
      setFilters2((prev) => ({
        ...prev,
        scrollDirrection: "down",
        pgNum: pgNumWithGap + 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
        tab: 0,
      }));
      return false;
    }

    pgNumWithGap =
      filters2.pgNum -
      (filters2.scrollDirrection === "down" ? filters2.pgGap : 0);
    // 스크롤 최상단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE, "up")) {
      setFilters2((prev) => ({
        ...prev,
        scrollDirrection: "up",
        pgNum: pgNumWithGap - 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
        tab: 0,
      }));
    }
  };

  //스크롤 핸들러
  const onSubScrollHandler3 = (event: GridEvent) => {
    if (filters3.isSearch) return false; // 한꺼번에 여러번 조회 방지
    let pgNumWithGap =
      filters3.pgNum +
      (filters3.scrollDirrection === "up" ? filters3.pgGap : 0);

    // 스크롤 최하단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE)) {
      setFilters3((prev) => ({
        ...prev,
        scrollDirrection: "down",
        pgNum: pgNumWithGap + 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
        tab: 0,
      }));
      return false;
    }

    pgNumWithGap =
      filters3.pgNum -
      (filters3.scrollDirrection === "down" ? filters3.pgGap : 0);
    // 스크롤 최상단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE, "up")) {
      setFilters3((prev) => ({
        ...prev,
        scrollDirrection: "up",
        pgNum: pgNumWithGap - 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
        tab: 0,
      }));
    }
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onSubDataStateChange = (event: GridDataStateChangeEvent) => {
    setSubDataState(event.dataState);
  };

  const onSubDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setSubDataState2(event.dataState);
  };

  const onSubDataStateChange3 = (event: GridDataStateChangeEvent) => {
    setSubDataState3(event.dataState);
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
  const SubTotalFooterCell = (props: GridFooterCellProps) => {
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

  //그리드 푸터
  const SubTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = subDataResult2.total.toString().split(".");
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
  const SubTotalFooterCell3 = (props: GridFooterCellProps) => {
    var parts = subDataResult3.total.toString().split(".");
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

  const onSubDataSortChange2 = (e: any) => {
    setSubDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

  const onSubDataSortChange3 = (e: any) => {
    setSubDataState3((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    resetAllGrid();
    deletedMainRows = [];
  };

  const enterEdit = (dataItem: any, field: string) => {
    if (field != "rowstatus") {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              useyn: typeof item.useyn == "boolean" ? item.useyn : item.useyn == "Y" ? true : false,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );

      setIfSelectFirstRow(false);
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

  const onMainItemChange = (event: GridItemChangeEvent) => {
    setMainDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };

  const onAddClick = () => {
    let seq = mainDataResult.total + deletedMainRows.length + 1;

    const newDataItem = {
      [DATA_ITEM_KEY]: seq,
      DesignPerson: "",
      DevPerson: "",
      absolutedays: 0,
      exptime: 0,
      fnscore: 0,
      itemlvl1: "",
      itemlvl2: "",
      itemlvl3: "",
      level: "",
      orgdiv: "01",
      remark2: "",
      useyn: "N",
      valBasecode: "",
      valueboxcd: "",
      valueboxnm: "",
      rowstatus: "N",
    };

    setSelectedState({ [newDataItem.num]: true });
    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onCopyClick = () => {
    let seq = mainDataResult.total + deletedMainRows.length + 1;
    const data = mainDataResult.data.filter(
      (item) => item.num == Object.getOwnPropertyNames(selectedState)[0]
    )[0];
    console.log(data);
    const newDataItem = {
      [DATA_ITEM_KEY]: seq,
      DesignPerson: "",
      DevPerson: "",
      absolutedays: 0,
      exptime: data.exptime,
      fnscore: data.fnscore,
      itemlvl1: data.itemlvl1,
      itemlvl2: data.itemlvl2,
      itemlvl3: data.itemlvl3,
      level: data.level,
      orgdiv: "01",
      remark2: data.remark2,
      useyn: data.useyn,
      valBasecode: data.valBasecode,
      valueboxcd: "",
      valueboxnm: data.valueboxnm,
      rowstatus: "N",
    };

    setSelectedState({ [newDataItem.num]: true });
    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const [paraData, setParaData] = useState({
    workType: "N",
    orgdiv: "01",
    rowstatus_s: "",
    valueboxcd_s: "",
    valueboxnm_s: "",
    itemlvl1_s: "",
    itemlvl2_s: "",
    itemlvl3_s: "",
    fnscore_s: "",
    level_s: "",
    exptime_s: "",
    useyn_s: "",
    remark2_s: "",
    valBasecode_s: "",
    absolutedays_s: "",
    DesignPerson_s: "",
    DevPerson_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_CM_A8000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,
      "@p_orgdiv": "01",
      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_valueboxcd_s": paraData.valueboxcd_s,
      "@p_valueboxnm_s": paraData.valueboxnm_s,
      "@p_itemlvl1_s": paraData.itemlvl1_s,
      "@p_itemlvl2_s": paraData.itemlvl2_s,
      "@p_itemlvl3_s": paraData.itemlvl3_s,
      "@p_fnscore_s": paraData.fnscore_s,
      "@p_level_s": paraData.level_s,
      "@p_exptime_s": paraData.exptime_s,
      "@p_useyn_s": paraData.useyn_s,
      "@p_remark2_s": paraData.remark2_s,
      "@p_valBasecode_s": paraData.valBasecode_s,
      "@p_absolutedays_s": paraData.absolutedays_s,
      "@p_DesignPerson_s": paraData.DesignPerson_s,
      "@p_DevPerson_s": paraData.DevPerson_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "CM_A8000W",
    },
  };

  type TdataArr = {
    rowstatus_s: string[];
    valueboxcd_s: string[];
    valueboxnm_s: string[];
    itemlvl1_s: string[];
    itemlvl2_s: string[];
    itemlvl3_s: string[];
    fnscore_s: string[];
    level_s: string[];
    exptime_s: string[];
    useyn_s: string[];
    remark2_s: string[];
    valBasecode_s: string[];
    absolutedays_s: string[];
    DesignPerson_s: string[];
    DevPerson_s: string[];
  };

  const onSaveClick = async () => {
    let valid = true;
    try {
      mainDataResult.data.map((item: any) => {
        if (item.valueboxnm == "") {
          throw findMessage(messagesData, "CM_A8000W_001");
        }
        mainDataResult.data.map((item2: any) => {
          if (item.valueboxcd == item2.valueboxcd && item.num != item2.num) {
            throw findMessage(messagesData, "CM_A8000W_002");
          }
        });
      });
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length === 0 && deletedMainRows.length === 0) return false;
    let dataArr: TdataArr = {
      rowstatus_s: [],
      valueboxcd_s: [],
      valueboxnm_s: [],
      itemlvl1_s: [],
      itemlvl2_s: [],
      itemlvl3_s: [],
      fnscore_s: [],
      level_s: [],
      exptime_s: [],
      useyn_s: [],
      remark2_s: [],
      valBasecode_s: [],
      absolutedays_s: [],
      DesignPerson_s: [],
      DevPerson_s: [],
    };
    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        valueboxcd = "",
        valueboxnm = "",
        itemlvl1 = "",
        itemlvl2 = "",
        itemlvl3 = "",
        fnscore = "",
        level = "",
        exptime = "",
        useyn = "",
        remark2 = "",
        valBasecode = "",
        absolutedays = "",
        DesignPerson = "",
        DevPerson = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.valueboxcd_s.push(valueboxcd);
      dataArr.valueboxnm_s.push(valueboxnm);
      dataArr.itemlvl1_s.push(itemlvl1);
      dataArr.itemlvl2_s.push(itemlvl2);
      dataArr.itemlvl3_s.push(itemlvl3);
      dataArr.fnscore_s.push(fnscore);
      dataArr.level_s.push(level);
      dataArr.exptime_s.push(exptime);
      dataArr.useyn_s.push(useyn === true ? "Y" : "N");
      dataArr.remark2_s.push(remark2);
      dataArr.valBasecode_s.push(valBasecode);
      dataArr.absolutedays_s.push(absolutedays);
      dataArr.DesignPerson_s.push(DesignPerson);
      dataArr.DevPerson_s.push(DevPerson);
    });
    deletedMainRows.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        valueboxcd = "",
        valueboxnm = "",
        itemlvl1 = "",
        itemlvl2 = "",
        itemlvl3 = "",
        fnscore = "",
        level = "",
        exptime = "",
        useyn = "",
        remark2 = "",
        valBasecode = "",
        absolutedays = "",
        DesignPerson = "",
        DevPerson = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.valueboxcd_s.push(valueboxcd);
      dataArr.valueboxnm_s.push(valueboxnm);
      dataArr.itemlvl1_s.push(itemlvl1);
      dataArr.itemlvl2_s.push(itemlvl2);
      dataArr.itemlvl3_s.push(itemlvl3);
      dataArr.fnscore_s.push(fnscore);
      dataArr.level_s.push(level);
      dataArr.exptime_s.push(exptime);
      dataArr.useyn_s.push(useyn === true ? "Y" : "N");
      dataArr.remark2_s.push(remark2);
      dataArr.valBasecode_s.push(valBasecode);
      dataArr.absolutedays_s.push(absolutedays);
      dataArr.DesignPerson_s.push(DesignPerson);
      dataArr.DevPerson_s.push(DevPerson);
    });

    setParaData((prev) => ({
      ...prev,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      valueboxcd_s: dataArr.valueboxcd_s.join("|"),
      valueboxnm_s: dataArr.valueboxnm_s.join("|"),
      itemlvl1_s: dataArr.itemlvl1_s.join("|"),
      itemlvl2_s: dataArr.itemlvl2_s.join("|"),
      itemlvl3_s: dataArr.itemlvl3_s.join("|"),
      fnscore_s: dataArr.fnscore_s.join("|"),
      level_s: dataArr.level_s.join("|"),
      exptime_s: dataArr.exptime_s.join("|"),
      useyn_s: dataArr.useyn_s.join("|"),
      remark2_s: dataArr.remark2_s.join("|"),
      valBasecode_s: dataArr.valBasecode_s.join("|"),
      absolutedays_s: dataArr.absolutedays_s.join("|"),
      DesignPerson_s: dataArr.DesignPerson_s.join("|"),
      DevPerson_s: dataArr.DevPerson_s.join("|"),
    }));
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
      setParaData({
        workType: "N",
        orgdiv: "01",
        rowstatus_s: "",
        valueboxcd_s: "",
        valueboxnm_s: "",
        itemlvl1_s: "",
        itemlvl2_s: "",
        itemlvl3_s: "",
        fnscore_s: "",
        level_s: "",
        exptime_s: "",
        useyn_s: "",
        remark2_s: "",
        valBasecode_s: "",
        absolutedays_s: "",
        DesignPerson_s: "",
        DevPerson_s: "",
      });
      deletedMainRows = [];
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (paraData.rowstatus_s != "") {
      fetchTodoGridSaved();
    }
  }, [paraData]);

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];

    mainDataResult.data.forEach((item: any, index: number) => {
      if (!selectedState[item[DATA_ITEM_KEY]]) {
        newData.push(item);
      } else {
        const newData2 = {
          ...item,
          rowstatus: "D",
        };
        deletedMainRows.push(newData2);
      }
    });
    setMainDataResult((prev) => ({
      data: newData,
      total: newData.length,
    }));

    setMainDataState({});
  };

  const onItemlvl1Click = (props: any) => {
    const selectedData = props.dataItem;

    const newData = mainDataResult.data.map((item) =>
      item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
        ? {
            ...item,
            itemlvl1: selectedData.sub_code,
          }
        : {
            ...item,
          }
    );

    setMainDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };
  const onItemlvl2Click = (props: any) => {
    const selectedData = props.dataItem;

    const newData = mainDataResult.data.map((item) =>
      item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
        ? {
            ...item,
            itemlvl2: selectedData.sub_code,
          }
        : {
            ...item,
          }
    );

    setMainDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };
  const onItemlvl3Click = (props: any) => {
    const selectedData = props.dataItem;

    const newData = mainDataResult.data.map((item) =>
      item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
        ? {
            ...item,
            itemlvl3: selectedData.sub_code,
          }
        : {
            ...item,
          }
    );

    setMainDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const onPlusClick = async () => {
    if (companyCode == "2207A046") {
      //조회조건 파라미터
      const parameters: Iparameters = {
        procedureName: "P_CM_A8000W_Q",
        pageNumber: 1,
        pageSize: 20,
        parameters: {
          "@p_work_type": "PGM",
          "@p_orgdiv": filters.orgdiv,
          "@p_valueboxcd": filters.valueboxcd,
          "@p_valueboxnm": filters.valueboxnm,
          "@p_remark2": filters.remark2,
          "@p_itemlvl1": filters.itemlvl1,
          "@p_itemlvl2": filters.itemlvl2,
          "@p_itemlvl3": filters.itemlvl3,
          "@p_DesignPerson": filters.DesignPerson,
          "@p_DevPerson": filters.DevPerson,
        },
      };
      let data: any;
      try {
        data = await processApi<any>("procedure", parameters);
      } catch (error) {
        data = null;
      }

      if (data.isSuccess === true) {
        const totalRowCnt = data.tables[0].TotalRowCount;
        const rows = data.tables[0].Rows.map((row: any) => {
          return {
            ...row,
          };
        });
        console.log(rows);
        if (totalRowCnt >= 0) {
          let seq = mainDataResult.total + deletedMainRows.length + 1;

          rows.map((row: any) => {
            const newDataItem = {
              [DATA_ITEM_KEY]: seq,
              DesignPerson: row.DesignPerson,
              DevPerson: row.DevPerson,
              absolutedays: row.absolutedays,
              exptime: row.exptime,
              fnscore: row.fnscore,
              itemlvl1: row.itemlvl1,
              itemlvl2: row.itemlvl2,
              itemlvl3: row.itemlvl3,
              level: row.level,
              orgdiv: row.orgdiv,
              remark2: row.remark2,
              useyn: row.useyn,
              valBasecode: row.valBasecode,
              valueboxcd:row.valueboxcd,
              valueboxnm: row.valueboxnm,
              rowstatus: "N",
            };

            setMainDataResult((prev) => {
              return {
                data: [newDataItem, ...prev.data],
                total: prev.total + 1,
              };
            });
            seq++;
          })
        }
      } else {
        console.log("[오류 발생]");
        console.log(data);
      }
    } else {
      alert("데이터가 없습니다.");
    }
  };
  return (
    <>
      <TitleContainer>
        <Title>ValueBox</Title>

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
              <th>ValueBox코드</th>
              <td>
                <Input
                  name="valueboxcd"
                  type="text"
                  value={filters.valueboxcd}
                  onChange={filterInputChange}
                />
              </td>
              <th>ValueBox명</th>
              <td>
                <Input
                  name="valueboxnm"
                  type="text"
                  value={filters.valueboxnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>비고</th>
              <td>
                <Input
                  name="remark2"
                  type="text"
                  value={filters.remark2}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
            <tr>
              <th>대분류</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="itemlvl1"
                    value={filters.itemlvl1}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>중분류</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="itemlvl2"
                    value={filters.itemlvl2}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>소분류</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="itemlvl3"
                    value={filters.itemlvl3}
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
        <GridContainer width={`10%`}>
          <GridTitleContainer>
            <GridTitle>대분류</GridTitle>
          </GridTitleContainer>
          <Grid
            style={{ height: "80vh" }}
            data={process(
              subDataResult.data.map((row) => ({
                ...row,
                [SELECTED_FIELD]: selectedsubDataState[idGetter(row)],
              })),
              subDataState
            )}
            {...subDataState}
            onDataStateChange={onSubDataStateChange}
            //선택 기능
            dataItemKey={DATA_ITEM_KEY}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
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
            onRowDoubleClick={onItemlvl1Click}
          >
            <GridColumn
              field="code_name"
              title="대분류"
              width="150px"
              footerCell={SubTotalFooterCell}
            />
          </Grid>
        </GridContainer>
        <GridContainer width={`10%`}>
          <GridTitleContainer>
            <GridTitle>중분류</GridTitle>
          </GridTitleContainer>
          <Grid
            style={{ height: "80vh" }}
            data={process(
              subDataResult2.data.map((row) => ({
                ...row,
                [SELECTED_FIELD]: selectedsubDataState2[idGetter(row)],
              })),
              subDataState2
            )}
            {...subDataState2}
            onDataStateChange={onSubDataStateChange2}
            //선택 기능
            dataItemKey={DATA_ITEM_KEY}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onSubDataSelectionChange2}
            //스크롤 조회 기능
            fixedScroll={true}
            total={subDataResult2.total}
            onScroll={onSubScrollHandler2}
            //정렬기능
            sortable={true}
            onSortChange={onSubDataSortChange2}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
            onRowDoubleClick={onItemlvl2Click}
          >
            <GridColumn
              field="code_name"
              title="중분류"
              width="150px"
              footerCell={SubTotalFooterCell2}
            />
          </Grid>
        </GridContainer>
        <GridContainer width={`10%`}>
          <GridTitleContainer>
            <GridTitle>소분류</GridTitle>
          </GridTitleContainer>
          <Grid
            style={{ height: "80vh" }}
            data={process(
              subDataResult3.data.map((row) => ({
                ...row,
                [SELECTED_FIELD]: selectedsubDataState3[idGetter(row)],
              })),
              subDataState3
            )}
            {...subDataState3}
            onDataStateChange={onSubDataStateChange3}
            //선택 기능
            dataItemKey={DATA_ITEM_KEY}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onSubDataSelectionChange3}
            //스크롤 조회 기능
            fixedScroll={true}
            total={subDataResult3.total}
            onScroll={onSubScrollHandler3}
            //정렬기능
            sortable={true}
            onSortChange={onSubDataSortChange3}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
            onRowDoubleClick={onItemlvl3Click}
          >
            <GridColumn
              field="code_name"
              title="소분류"
              width="150px"
              footerCell={SubTotalFooterCell3}
            />
          </Grid>
        </GridContainer>
        <GridContainer width={`calc(70% - ${GAP * 3}px)`}>
          <ExcelExport
            data={mainDataResult.data}
            ref={(exporter) => {
              _export = exporter;
            }}
          >
            <GridTitleContainer>
              <GridTitle>
                상세정보{" "}
                <Button
                  onClick={onPlusClick}
                  fillMode="outline"
                  themeColor={"primary"}
                >
                  [추가]
                </Button>
              </GridTitle>
              <ButtonContainer>
                <Button
                  onClick={onAddClick}
                  fillMode="outline"
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
                  onClick={onCopyClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="copy"
                  title="행 복사"
                ></Button>
                <Button
                  onClick={onSaveClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="save"
                  title="저장"
                ></Button>
              </ButtonContainer>
            </GridTitleContainer>
            <Grid
              style={{ height: "80vh" }}
              data={process(
                mainDataResult.data.map((row) => ({
                  ...row,
                  rowstatus:
                    row.rowstatus == null ||
                    row.rowstatus == "" ||
                    row.rowstatus == undefined
                      ? ""
                      : row.rowstatus,
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
                mode: "multiple",
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
              //incell 수정 기능
              onItemChange={onMainItemChange}
              cellRender={customCellRender}
              rowRender={customRowRender}
              editField={EDIT_FIELD}
            >
              <GridColumn
                field="rowstatus"
                title=" "
                width="50px"
                editable={false}
              />
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
                          CustomComboField.includes(item.fieldName)
                            ? CustomComboBoxCell
                            : NumberField.includes(item.fieldName)
                            ? NumberCell
                            : CheckField.includes(item.fieldName)
                            ? CheckBoxCell
                            : undefined
                        }
                        className={
                          requiredField.includes(item.fieldName)
                            ? "required"
                            : undefined
                        }
                        headerCell={
                          requiredField.includes(item.fieldName)
                            ? RequiredHeader
                            : undefined
                        }
                        footerCell={
                          item.sortOrder === 0 ? mainTotalFooterCell : undefined
                        }
                      />
                    )
                )}
            </Grid>
          </ExcelExport>
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

export default CM_A8000W;
