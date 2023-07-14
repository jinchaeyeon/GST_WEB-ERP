import React, { useEffect, useState, useRef, useCallback } from "react";
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
  GridHeaderCellProps,
  GridFilterChangeEvent,
} from "@progress/kendo-react-grid";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { Icon, getter } from "@progress/kendo-react-common";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { CompositeFilterDescriptor, DataResult, filterBy, process, State } from "@progress/kendo-data-query";
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
  ButtonInInput,
} from "../CommonStyled";
import FilterContainer from "../components/Containers/FilterContainer";
import { Button } from "@progress/kendo-react-buttons";
import { Checkbox, Input, TextArea } from "@progress/kendo-react-inputs";
import { useApi } from "../hooks/api";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import { gridList } from "../store/columns/PR_A0040W_C";
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
  getQueryFromBizComponent,
} from "../components/CommonFunction";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  PAGE_SIZE,
  SELECTED_FIELD,
  EDIT_FIELD,
  GAP,
  COM_CODE_DEFAULT_VALUE,
} from "../components/CommonString";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import TopButtons from "../components/Buttons/TopButtons";
import { useRecoilState, useSetRecoilState } from "recoil";
import { isLoading, loginResultState } from "../store/atoms";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import { bytesToBase64 } from "byte-base64";

const DATA_ITEM_KEY = "num";
const SUB_DATA_ITEM_KEY = "num";
const SUB_DATA_ITEM_KEY2 = "sub_code";

let deletedMainRows: object[] = [];

const CustomComboField = [
  "proccd",
  "outprocyn",
  "prodemp",
  "qtyunit",
  "procunit",
];

const NumberField = ["procseq", "stdtime", "procqty"];

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
  itemcd_s: string[];
  proccd_s: string[];
  procseq_s: string[];
  remark_s: string[];
  outprocyn_s: string[];
  stdtime_s: string[];
  procqty_s: string[];
  procunit_s: string[];
  workcnt_s: string[];
};
let temp = 0;
const initialFilter: CompositeFilterDescriptor = {
  logic: "and",
  filters: [{ field: "code_name", operator: "contains", value: "" }],
};
const PR_A0040W: React.FC = () => {
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
  const [filter, setFilter] = React.useState(initialFilter);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;
      setFilters((prev) => ({
        ...prev,
        proccd2: defaultOption.find((item: any) => item.id === "proccd2")
          .valueCode,
        itemacnt: defaultOption.find((item: any) => item.id === "itemacnt")
          .valueCode,
        gubun: defaultOption.find((item: any) => item.id === "gubun").valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA061, L_BA015,L_BA029,L_BA005,L_BA020, L_sysUserMaster_001, L_AC014,L_BA003, L_AC006",
    //수량단위, 과세구분, 내수구분, 화폐단위, 사용자, 계산서유형, 입고유형, 전표입력경로
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [qtyunitListData, setQtyunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemacntListData, setItemacntListData] = React.useState([
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
      const itemacntQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA061")
      );
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
      fetchQuery(itemacntQueryStr, setItemacntListData);
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

  //Form정보 Change
  const InputChange = (e: any) => {
    const { value, name } = e.target;
    setSub2PgNum(1);
    setSubData2Result(process([], subData2State));
    setsubFilters2((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "ITEM",
    orgdiv: "01",
    prntitemcd: "",
    itemcd: "",
    itemnm: "",
    gubun: "",
    insiz: "",
    proccd2: "",
    itemacnt: "",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_PR_A0040W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": filters.workType,
      "@p_orgdiv": filters.orgdiv,
      "@p_prntitemcd": filters.prntitemcd,
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_gubun": filters.gubun,
      "@p_insiz": filters.insiz,
      "@p_proccd2": filters.proccd2,
      "@p_itemacnt": filters.itemacnt,
      "@p_find_row_value": filters.find_row_value,
    },
  };

  const [subfilters2, setsubFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "PROCCD",
    proccd2: "",
  });

  //조회조건 파라미터
  const subparameters: Iparameters = {
    procedureName: "P_PR_A0040W_Q",
    pageNumber: sub2PgNum,
    pageSize: subfilters2.pgSize,
    parameters: {
      "@p_work_type": subfilters2.workType,
      "@p_orgdiv": filters.orgdiv,
      "@p_prntitemcd": filters.prntitemcd,
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_gubun": filters.gubun,
      "@p_insiz": filters.insiz,
      "@p_proccd2": subfilters2.proccd2,
      "@p_itemacnt": filters.itemacnt,
      "@p_find_row_value": filters.find_row_value,
    },
  };

  const [subfilters, setsubFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "DETAIL",
    prntitemcd: "",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  const subparameters2: Iparameters = {
    procedureName: "P_PR_A0040W_Q",
    pageNumber: subfilters.pgNum,
    pageSize: subfilters.pgSize,
    parameters: {
      "@p_work_type": subfilters.workType,
      "@p_orgdiv": filters.orgdiv,
      "@p_prntitemcd": subfilters.prntitemcd,
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_gubun": filters.gubun,
      "@p_insiz": filters.insiz,
      "@p_proccd2": filters.proccd2,
      "@p_itemacnt": filters.itemacnt,
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
            total: totalRowCnt,
          };
        });
        if (filters.find_row_value === "" && filters.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedState({ [firstRowData[DATA_ITEM_KEY]]: true });

          setsubFilters((prev) => ({
            ...prev,
            prntitemcd: firstRowData.itemcd,
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
            data: [...prev.data, ...rows],
            total: totalRowCnt,
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
            total: totalRowCnt,
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

  useEffect(()=> {
    fetchSubGrid2();
  }, []);

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
          tab: 0,
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
      if (subfilters.find_row_value !== "" && subDataResult.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = subDataResult.data.findIndex(
          (item) => idGetter(item) === subfilters.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.vs.container.scroll(0, scrollHeight);

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
        gridRef.vs.container.scroll(0, 20);
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
  }, [subfilters2]);

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
    fetchSubGrid2();
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

    setSubDataResult(process([], subDataState));
    setsubFilters((prev) => ({
      ...prev,
      prntitemcd: selectedRowData.itemcd,
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

  const onSubData2SelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedsubData2State,
      dataItemKey: SUB_DATA_ITEM_KEY2,
    });
    
    setSelectedsubData2State(newSelectedState);

    let valid = true;
    subDataResult.data.forEach((item) => {
      if(Object.getOwnPropertyNames(newSelectedState)[0] == item.proccd) {
        valid = false;
      }
    });

    if(valid == true) {
      let proseq = 1;
    if (subDataResult.total > 0) {
      subDataResult.data.forEach((item) => {
        if (item.procseq >= proseq) {
          proseq = item.procseq + 1;
        }
      });
    }

    subDataResult.data.map((item) => {
      if(item.num > temp){
        temp = item.num
      }
  })
    const datas = mainDataResult.data.filter((item) => item.num == Object.getOwnPropertyNames(selectedState)[0])[0];

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
      itemcd: datas.itemcd,
      itemnm: datas.itemnm,
      insiz: datas.insiz,
      prntitemcd: Object.getOwnPropertyNames(selectedState)[0],
      proccd: Object.getOwnPropertyNames(newSelectedState)[0],
      procitemcd: Object.getOwnPropertyNames(selectedState)[0],
      procqty: 1,
      procseq: proseq,
      prodemp: "",
      prodmac: "",
      procunit: "001",
      stdtime: 0,
      recdt: "",
      remark: "",
      seq: 0,
      unitqty: 0,
      workcnt: 0,
      rowstatus: "N",
    };
    setSelectedsubDataState({ [newDataItem.num]: true });

    setSubDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
    } else {
      alert("중복된 공정이 있습니다.");
    }
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
    setWorkType("U");
    deletedMainRows = [];
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

  const enterEdit2 = (dataItem: any, field: string) => {
    var many = mainDataResult.data.filter((item) => item.chk_org == true);
    if(!(many.length >= 1 && field == "chk_org") || dataItem.chk_org == true) {
      if (field == "chk_org" || field == "chk_tar") {
        const newData = mainDataResult.data.map((item) =>
          item[SUB_DATA_ITEM_KEY] === dataItem[SUB_DATA_ITEM_KEY]
            ? {
                ...item,
                rowstatus: item.rowstatus === "N" ? "N" : "U",
                chk_org: typeof item.chk_org == "boolean" ? item.chk_org : item.chk_org == "Y" ? true : false,
                chk_tar: typeof item.chk_tar == "boolean" ? item.chk_tar : item.chk_tar == "Y" ? true : false,
                [EDIT_FIELD]: field,
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
      }
    }
  };

  const exitEdit2 = () => {
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

  const onCopyClick = (e: any) => {
    if (!window.confirm("공정 복사 처리 하시겠습니까?\n(주의, 대상의 공정은 삭제됩니다)")) {
      return false;
    }
    const datas = mainDataResult.data.filter(
      (item) => item.num == Object.getOwnPropertyNames(selectedState)[0]
    )[0];
    const chk_org = mainDataResult.data.filter(
      (item) => item.chk_org == true
    )[0];
    const chk_tar = mainDataResult.data.filter(
      (item) => item.chk_tar == true
    );
 
    if(chk_org != undefined && chk_tar!= undefined){
      let chk_tar_s: any[] = [];
      chk_tar.forEach((item: any, idx: number) => {
        const {
          itemcd= "",
        } = item;
        chk_tar_s.push(itemcd);
      });
      setParaData((prev) => ({
        ...prev,
        workType: "COPY",
        orgdiv: "01",
        prntitemcd: datas.itemcd,
        chk_itemcd_org: chk_org.itemcd,
        chk_itemcd_tar: chk_tar_s.join("|"),
      }));
    } else {
      alert("선택해주세요");
    }
  };

  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "D",
    prntitemcd: "",
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
      prntitemcd: datas.itemcd,
    }));
  };

  const paraDeleted: Iparameters = {
    procedureName: "P_PR_A0040W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataDeleted.work_type,
      "@p_rowstatus_s": "",
      "@p_orgdiv": "01",
      "@p_prntitemcd": paraDataDeleted.prntitemcd,
      "@p_seq_s": "",
      "@p_itemcd_s": "",
      "@p_proccd_s": "",
      "@p_procseq_s": "",
      "@p_remark_s": "",
      "@p_outprocyn_s": "",
      "@p_stdtime_s": "",
      "@p_procqty_s": "",
      "@p_procunit_s": "",
      "@p_workcnt_s": "",
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "PR_A0040W",
      "@p_chk_itemcd_org": "",
      "@p_chk_itemcd_tar": "",
    },
  };

  useEffect(() => {
    if (paraDataDeleted.prntitemcd != "") fetchToDelete();
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
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }

    paraDataDeleted.work_type = "D"; //초기화
    paraDataDeleted.prntitemcd = "";
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
    rowstatus_s: "",
    orgdiv: "01",
    prntitemcd: "",
    seq_s: "",
    itemcd_s: "",
    proccd_s: "",
    procseq_s: "",
    remark_s: "",
    outprocyn_s: "",
    stdtime_s: "",
    procqty_s: "",
    procunit_s: "",
    workcnt_s: "",
    userid: userId,
    pc: pc,
    form_id: "PR_A0040W",
    chk_itemcd_org: "",
    chk_itemcd_tar: "",
  });

  const para: Iparameters = {
    procedureName: "P_PR_A0040W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,
      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_orgdiv": paraData.orgdiv,
      "@p_prntitemcd": paraData.prntitemcd,
      "@p_seq_s": paraData.seq_s,
      "@p_itemcd_s":paraData.itemcd_s,
      "@p_proccd_s": paraData.proccd_s,
      "@p_procseq_s":paraData.procseq_s,
      "@p_remark_s": paraData.remark_s,
      "@p_outprocyn_s": paraData.outprocyn_s,
      "@p_stdtime_s": paraData.stdtime_s,
      "@p_procqty_s": paraData.procqty_s,
      "@p_procunit_s": paraData.procunit_s,
      "@p_workcnt_s": paraData.workcnt_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "PR_A0040W",
      "@p_chk_itemcd_org": paraData.chk_itemcd_org,
      "@p_chk_itemcd_tar": paraData.chk_itemcd_tar,
    },
  };

  const onSaveClick = async () => {
    let valid = true;

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

    if (dataItem.length === 0 && deletedMainRows.length === 0) return false;
      let dataArr: TdataArr = {
        rowstatus_s: [],
        seq_s: [],
        itemcd_s: [],
        proccd_s: [],
        procseq_s: [],
        remark_s: [],
        outprocyn_s: [],
        stdtime_s: [],
        procqty_s: [],
        procunit_s: [],
        workcnt_s: [],
      };

      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus= "",
          seq= "",
          itemcd= "",
          proccd= "",
          procseq= "",
          remark= "",
          outprocyn= "",
          stdtime= "",
          procqty= "",
          procunit= "",
          workcnt= "",
        } = item;
        dataArr.rowstatus_s.push(rowstatus);
        dataArr.seq_s.push(seq);
        dataArr.itemcd_s.push(itemcd);
        dataArr.proccd_s.push(proccd);
        dataArr.procseq_s.push(procseq);
        dataArr.remark_s.push(remark);
        dataArr.outprocyn_s.push(outprocyn);
        dataArr.stdtime_s.push(stdtime);
        dataArr.procqty_s.push(procqty);
        dataArr.procunit_s.push(procunit);
        dataArr.workcnt_s.push(workcnt);
      });

      deletedMainRows.forEach((item: any, idx: number) => {
        const {
          rowstatus= "",
          seq= "",
          itemcd= "",
          proccd= "",
          procseq= "",
          remark= "",
          outprocyn= "",
          stdtime= "",
          procqty= "",
          procunit= "",
          workcnt= "",
        } = item;
        dataArr.rowstatus_s.push(rowstatus);
        dataArr.seq_s.push(seq);
        dataArr.itemcd_s.push(itemcd);
        dataArr.proccd_s.push(proccd);
        dataArr.procseq_s.push(procseq);
        dataArr.remark_s.push(remark);
        dataArr.outprocyn_s.push(outprocyn);
        dataArr.stdtime_s.push(stdtime);
        dataArr.procqty_s.push(procqty);
        dataArr.procunit_s.push(procunit);
        dataArr.workcnt_s.push(workcnt);
      });
      const datas = mainDataResult.data.filter(
        (item) => item.num == Object.getOwnPropertyNames(selectedState)[0]
      )[0];
      setParaData((prev) => ({
        ...prev,
        workType: "U",
        rowstatus_s: dataArr.rowstatus_s.join("|"),
        orgdiv: "01",
        prntitemcd: datas.itemcd,
        seq_s: dataArr.seq_s.join("|"),
        itemcd_s: dataArr.itemcd_s.join("|"),
        proccd_s: dataArr.proccd_s.join("|"),
        procseq_s: dataArr.procseq_s.join("|"),
        remark_s: dataArr.remark_s.join("|"),
        outprocyn_s: dataArr.outprocyn_s.join("|"),
        stdtime_s: dataArr.stdtime_s.join("|"),
        procqty_s: dataArr.procqty_s.join("|"),
        procunit_s: dataArr.procunit_s.join("|"),
        workcnt_s: dataArr.workcnt_s.join("|"),
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
      setWorkType("U");
      setParaData({
        pgSize: PAGE_SIZE,
        workType: "",
        rowstatus_s: "",
        orgdiv: "01",
        prntitemcd: "",
        seq_s: "",
        itemcd_s: "",
        proccd_s: "",
        procseq_s: "",
        remark_s: "",
        outprocyn_s: "",
        stdtime_s: "",
        procqty_s: "",
        procunit_s: "",
        workcnt_s: "",
        userid: userId,
        pc: pc,
        form_id: "PR_A0040W",
        chk_itemcd_org: "",
        chk_itemcd_tar: "",
      });
      deletedMainRows = [];
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (paraData.rowstatus_s != "" || (paraData.chk_itemcd_org != "" && paraData.chk_itemcd_tar != "")) {
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

  interface IItemData {
    itemcd: string;
    itemno: string;
    itemnm: string;
    insiz: string;
    model: string;
    itemacnt: string;
    itemacntnm: string;
    bnatur: string;
    spec: string;
    invunit: string;
    invunitnm: string;
    unitwgt: string;
    wgtunit: string;
    wgtunitnm: string;
    maker: string;
    dwgno: string;
    remark: string;
    itemlvl1: string;
    itemlvl2: string;
    itemlvl3: string;
    extra_field1: string;
    extra_field2: string;
    extra_field7: string;
    extra_field6: string;
    extra_field8: string;
    packingsiz: string;
    unitqty: string;
    color: string;
    gubun: string;
    qcyn: string;
    outside: string;
    itemthick: string;
    itemlvl4: string;
    itemlvl5: string;
    custitemnm: string;
  }

  return (
    <>
      <TitleContainer>
        <Title>표준공정도</Title>

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
              <th>규격</th>
              <td>
                <Input
                  name="insiz"
                  type="text"
                  value={filters.insiz}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
            <tr>
              <th>품목계정</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="itemacnt"
                    value={filters.itemacnt}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>공정</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="proccd2"
                    value={filters.proccd2}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>등록여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="gubun"
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
        <GridTitleContainer>
          <GridTitle>요약정보</GridTitle>
          <ButtonContainer>
          <Button
              onClick={onCopyClick}
              fillMode="outline"
              themeColor={"primary"}
              icon="copy"
            >
              공정복사
            </Button>
            <Button
              onClick={onDeleteClick}
              fillMode="outline"
              themeColor={"primary"}
              icon="delete"
            >
              공정삭제
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
        <Grid
          style={{ height: "30vh" }}
          data={process(
            mainDataResult.data.map((row) => ({
              ...row,
              invunit: qtyunitListData.find(
                (item: any) => item.sub_code === row.invunit
              )?.code_name,
              itemacnt: itemacntListData.find(
                (item: any) => item.sub_code === row.itemacnt
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
          onScroll={onMainScrollHandler}
          //정렬기능
          sortable={true}
          onSortChange={onMainSortChange}
          //컬럼순서조정
          reorderable={true}
          //컬럼너비조정
          resizable={true}
          onItemChange={onMainItemChange}
          cellRender={customCellRender2}
          rowRender={customRowRender2}
          editField={EDIT_FIELD}
        >
          <GridColumn
            field="chk_org"
            title="원본"
            width="60px"
            cell={CheckBoxCell}
          />
          <GridColumn
            field="chk_tar"
            title="대상"
            width="60px"
            cell={CheckBoxCell}
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
                    footerCell={
                      item.sortOrder === 0 ? mainTotalFooterCell : undefined
                    }
                  />
                )
            )}
        </Grid>
      </GridContainer>
      <GridContainerWrap>
        <GridContainer width={"100%"}>
          <GridContainerWrap>
            <GridContainer width={`25%`}>
              <GridTitleContainer>
                <GridTitle>공정리스트</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: "42vh" }}
                data={filterBy(
                  subData2Result.data.map((row) => ({
                    ...row,
                    [SELECTED_FIELD]: selectedsubData2State[idGetter2(row)],
                  })), filter)}
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
                filterable={true}
                filter={filter}
                onFilterChange={(e: GridFilterChangeEvent) => setFilter(e.filter)}
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
            <GridContainer width={`calc(75% - ${GAP}px)`}>
              <ExcelExport
                data={subDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
              >
                <GridTitleContainer>
                  <GridTitle>표준공정도</GridTitle>
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
                      title="행 위로 이동" 
                      icon="chevron-up"
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
                <FormBoxWrap border={true}>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>품목코드</th>
                      <td>
                        <Input
                          name="itemcd"
                          type="text"
                          value={mainDataResult.data.filter(
                            (item) => item.num == Object.getOwnPropertyNames(selectedState)[0]
                          )[0] == undefined ? "" : mainDataResult.data.filter(
                            (item) => item.num == Object.getOwnPropertyNames(selectedState)[0]
                          )[0].itemcd}
                          className="readonly"
                        />
                      </td>
                      <th>품목명</th>
                      <td>
                        <Input
                          name="itemnm"
                          type="text"
                          value={mainDataResult.data.filter(
                            (item) => item.num == Object.getOwnPropertyNames(selectedState)[0]
                          )[0] == undefined ? "" : mainDataResult.data.filter(
                            (item) => item.num == Object.getOwnPropertyNames(selectedState)[0]
                          )[0].itemnm}
                          className="readonly"
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
                <Grid
                  style={{ height: "35vh" }}
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
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"ROW_ADD"}
          setData={setItemData}
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

export default PR_A0040W;
