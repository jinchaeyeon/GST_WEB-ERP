import React, { useEffect, useRef, useState } from "react";
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
import { gridList } from "../store/columns/AC_A0030W_C";
import {
  Checkbox,
} from "@progress/kendo-react-inputs";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import {
  Title,
  FilterBox,
  GridContainer,
  GridTitle,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
  FormBoxWrap,
  FormBox,
  GridContainerWrap,
} from "../CommonStyled";
import FilterContainer from "../components/Containers/FilterContainer";
import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { useApi } from "../hooks/api";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import {
  chkScrollHandler,
  UseBizComponent,
  UseCustomOption,
  UsePermissions,
  handleKeyPressSearch,
  getGridItemChangedData,
  UseParaPc,
  UseGetValueFromSessionItem,
  useSysMessage,
  GetPropertyValueByName,
} from "../components/CommonFunction";
import {
  //PAGE_SIZE,
  SELECTED_FIELD,
  EDIT_FIELD,
  GAP,
} from "../components/CommonString";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import TopButtons from "../components/Buttons/TopButtons";
import { useSetRecoilState } from "recoil";
import {
  isLoading,
} from "../store/atoms";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";

const DATA_ITEM_KEY = "acntcd";
const SUB_DATA_ITEM_KEY = "num";
const SUB_DATA_ITEM_KEY2 = "num";
let deletedMainRows: any[] = [];
let deletedMainRows2: any[] = [];

const requiredField = [
  "mngitemcd",
  "reportgb",
  "acntgrpcd"
];

const checkBoxField = [
  "mngdrctlyn",
  "mngcrctlyn"
];

const comboBoxField = [
  "mngitemcd",
  "reportgb"
];

const readOnlyField = [
  "acntgrpnm"
];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_AC023T, L_AC062", setBizComponentData);

  const field = props.field ?? "";

  let bizComponentIdVal: string;
  let vField: string;
  let tField: string;

  if (field === "mngitemcd") {
    bizComponentIdVal = "L_AC023T";
    vField = "mngitemcd";
    tField = "mngitemnm";
  }
  else if (field === "reportgb") {
    bizComponentIdVal = "L_AC062";
    vField = "sub_code";
    tField = "code_name";
  }
  else {
    bizComponentIdVal = ""
    vField = "sub_code";
    tField = "code_name";
  }

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} valueField={vField} textField={tField} {...props} />
  ) : (
    <td />
  );
};

const AC_A0030W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const listIdGetter = getter(DATA_ITEM_KEY);
  const detailIdGetter = getter(SUB_DATA_ITEM_KEY);
  const idGetter3 = getter(SUB_DATA_ITEM_KEY2);
  const processApi = useApi();
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const userId = UseGetValueFromSessionItem("user_id");
  const orgdiv = UseGetValueFromSessionItem("orgdiv");
  const pathname = window.location.pathname.replace("/", "");
  // const [loginResult] = useRecoilState(loginResultState);
  // const companyCode = loginResult ? loginResult.companyCode : "";
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const PAGE_SIZE = 40;
  let gridRef: any = useRef(null); // 요약정보 그리드

  //폼 메시지 조회
  // const [messagesData, setMessagesData] = React.useState<any>(null);
  // UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(customOptionData.menuCustomDefaultOptions, "query");
      setFilters((prev) => ({
        ...prev,
        useyn: defaultOption?.find((item: any) => item.id === "useyn")?.valueCode ?? "Y",
        acntses: defaultOption?.find((item: any) => item.id === "acntsts")?.valueCode ?? "",
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_AC023T, R_USEYN, L_AC012, L_AC008, L_AC033, L_BA073, L_AC009, L_AC010, L_AC090, L_AC007, L_AC001, L_AC061", setBizComponentData);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [subDataState, setSubDataState] = useState<State>({
    sort: [],
  });
  const [subDataState2, setSubDataState2] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [subDataResult, setSubDataResult] = useState<DataResult>(
    process([], subDataState)
  );

  const [subDataResult2, setSubDataResult2] = useState<DataResult>(
    process([], subDataState2)
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

  // 요약정보 행 변경
  useEffect(() => {
    setSubDataResult(process([], subDataState));
    deletedMainRows = [];
    setSubPgNum(1);

    setSubDataResult2(process([], subDataState2));
    deletedMainRows2 = [];
    setSubPgNum2(1);

    if (Object.getOwnPropertyNames(selectedState).length > 0
      && selectedState[""] !== false) {
      Retrieve("MNGITEM");
      Retrieve("FINDETAIL");
    }
  }, [selectedState]);

  const [subPgNum, setSubPgNum] = useState(1);
  const [subPgNum2, setSubPgNum2] = useState(1);
  const [tabSelected, setTabSelected] = React.useState(0);

  const InputChange = (e: any) => {
    const { value, name } = e.target;
    if (value != null) {
      setParaData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const CheckChange = (e: any) => {
    const { value, name } = e.target;
    if (value != null) {
      if (value == false || value == "N") {
        setParaData((prev) => ({
          ...prev,
          [name]: "N",
        }));
      } else {
        setParaData((prev) => ({
          ...prev,
          [name]: "Y",
        }));
      }
    }
  };

  //Form정보 Change함수
  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setParaData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

  //조회조건
  const [filters, setFilters] = useState({
    isSearch: false, // true면 조회조건(filters) 변경 되었을때 조회
    pgNum: 1,

    acntcd: "",
    acntnm: "",
    acntses: "",
    mngitemcd: "",
    useyn: "%",

    find_row_value: "",

    scrollDirrection: "down",
    pgGap: 0,
  });

  const FillValuesFromDataRow = (row: any) => {
    if (row) {
      setParaData({
        acntcd             : row.acntcd             ,
        acntnm             : row.acntnm             ,
        mngdrcustyn        : row.mngdrcustyn        ,
        mngcrcustyn        : row.mngcrcustyn        ,
        mngsumcustyn       : row.mngsumcustyn       ,
        mngdramtyn         : row.mngdramtyn         ,
        mngcramtyn         : row.mngcramtyn         ,
        mngdrrateyn        : row.mngdrrateyn        ,
        mngcrrateyn        : row.mngcrrateyn        ,
        acntgrp            : row.acntgrp            ,
        acntchr            : row.acntchr            ,
        alcchr             : row.alcchr             ,
        profitchr          : row.profitchr          ,
        acntbaldiv         : row.acntbaldiv         ,
        budgyn             : row.budgyn             ,
        system_yn          : row.system_yn          ,
        useyn              : row.useyn              ,
        profitsha          : row.profitsha          ,
        makesha            : row.makesha            ,
        acntdiv            : row.acntdiv            ,
        show_payment_yn    : row.show_payment_yn    ,
        show_collect_yn    : row.show_collect_yn    ,
        show_pur_sal_yn    : row.show_pur_sal_yn    ,
        douzonecd	         : row.douzonecd	         ,
        mngitemcd1         : row.mngitemcd1         ,
        mngitemcd2         : row.mngitemcd2         ,
        mngitemcd3         : row.mngitemcd3         ,
        mngitemcd4         : row.mngitemcd4         ,
        mngitemcd5         : row.mngitemcd5         ,
        mngitemcd6         : row.mngitemcd6         ,
        mngdrctlyn1        : row.mngdrctlyn1        ,
        mngdrctlyn2        : row.mngdrctlyn2        ,
        mngdrctlyn3        : row.mngdrctlyn3        ,
        mngdrctlyn4        : row.mngdrctlyn4        ,
        mngdrctlyn5        : row.mngdrctlyn5        ,
        mngdrctlyn6        : row.mngdrctlyn6        ,
        mngcrctlyn1        : row.mngcrctlyn1        ,
        mngcrctlyn2        : row.mngcrctlyn2        ,
        mngcrctlyn3        : row.mngcrctlyn3        ,
        mngcrctlyn4        : row.mngcrctlyn4        ,
        mngcrctlyn5        : row.mngcrctlyn5        ,
        mngcrctlyn6        : row.mngcrctlyn6        ,
      });
    }
    else {
      setParaData({
        acntcd             : ""    ,
        acntnm             : ""    ,
        mngdrcustyn        : ""    ,
        mngcrcustyn        : ""    ,
        mngsumcustyn       : ""    ,
        mngdramtyn         : ""    ,
        mngcramtyn         : ""    ,
        mngdrrateyn        : ""    ,
        mngcrrateyn        : ""    ,
        acntgrp            : ""    ,
        acntchr            : ""    ,
        alcchr             : ""    ,
        profitchr          : ""    ,
        acntbaldiv         : ""    ,
        budgyn             : ""    ,
        system_yn          : ""    ,
        useyn              : ""    ,
        profitsha          : ""    ,
        makesha            : ""    ,
        acntdiv            : ""    ,
        show_payment_yn    : ""    ,
        show_collect_yn    : ""    ,
        show_pur_sal_yn    : ""    ,
        douzonecd	         : ""    ,
        mngitemcd1         : ""    ,
        mngitemcd2         : ""    ,
        mngitemcd3         : ""    ,
        mngitemcd4         : ""    ,
        mngitemcd5         : ""    ,
        mngitemcd6         : ""    ,
        mngdrctlyn1        : ""    ,
        mngdrctlyn2        : ""    ,
        mngdrctlyn3        : ""    ,
        mngdrctlyn4        : ""    ,
        mngdrctlyn5        : ""    ,
        mngdrctlyn6        : ""    ,
        mngcrctlyn1        : ""    ,
        mngcrctlyn2        : ""    ,
        mngcrctlyn3        : ""    ,
        mngcrctlyn4        : ""    ,
        mngcrctlyn5        : ""    ,
        mngcrctlyn6        : ""    ,
      });
    }
  };

  useEffect(() => {
    if (filters.isSearch) { // 조회가 끝나지 않음
      return;
    }

    // 선택된 행이 없거나 삭제됐을때 첫번째 행을 선택함
    const selectedValue = Object.getOwnPropertyNames(selectedState)[0];
    if (!selectedValue
      || !mainDataResult.data.map((item: any) => { return listIdGetter(item); }).includes(selectedValue)) {
      if (mainDataResult.total > 0) {
        // 첫번째 행 선택하기
        const rowData = mainDataResult.data[0];

        setSelectedState({ [listIdGetter(rowData)]: true });

        FillValuesFromDataRow(rowData);
      }
      else {
        setSelectedState({"": false});

        FillValuesFromDataRow(null);
      }
    } 
    else {
      setSelectedState({[selectedValue]: true});
    }

    // 이전 페이지 조회를 위해 스크롤 아래로 이동
    if (filters.pgNum > 1 
      && filters.pgGap == 0) {
      gridRef.current.vs.container.scroll(0, 20);
    }
  }, [mainDataResult]);

  const Retrieve = async (workType: string) => {
    setLoading(true);

    let acntcd: string;
    let pgNum: number;

    if (workType == "Q") {
      acntcd = filters.acntcd;
      pgNum = filters.pgNum;
    }
    else if (workType == "MNGITEM") {
      acntcd = Object.getOwnPropertyNames(selectedState)[0];
      pgNum = subPgNum;
    }
    else if (workType == "FINDETAIL") {
      acntcd = Object.getOwnPropertyNames(selectedState)[0];
      pgNum = subPgNum2;
    }
    else {
      acntcd = ""
      pgNum = 1
    }

    const procedure: Iparameters = {
      procedureName: "P_AC_A0030W_Q",
      pageNumber: pgNum,
      pageSize: PAGE_SIZE,
      parameters: {
        "@p_work_type": workType,
        "@p_orgdiv": orgdiv,
        "@p_acntcd": acntcd,
        "@p_acntnm": filters.acntnm,
        "@p_acntses": filters.acntses,
        "@p_mngitemcd": filters.mngitemcd,
        "@p_useyn": filters.useyn,
        "@p_find_row_value": filters.find_row_value,
      },
    };

    let data: any;
    try {
      data = await processApi<any>("procedure", procedure);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess === true) {
      const totalRowCnt = Math.max(data.tables[0].TotalRowCount, 0); // -1인 경우 0 반환
      const rows = data.tables[0].Rows;

      if (workType == "Q") {
        // 스크롤에 따라 데이터를 추가할 위치 변경
        setMainDataResult((prev) => {
          return filters.scrollDirrection == "down" ? {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          } : {
            data: [...rows, ...prev.data],
            total: totalRowCnt,
          };
        });

        setFilters((prev) => ({
          ...prev,
          pgNum: data.pageNumber,
          find_row_value: "",
          isSearch: false,
        }));
      }
      else if (workType == "MNGITEM") {
        setSubDataResult((prev) => {
          return {
            data: [...prev.data, ...rows], //data: row,
            total: totalRowCnt,
          };
        });
        const firstRowData = rows[0];
        setSelectedsubDataState({ [detailIdGetter(firstRowData)]: true });
      }
      else if (workType == "FINDETAIL") {
        setSubDataResult2((prev) => {
          return {
            data: [...prev.data, ...rows], //data: row,
            total: totalRowCnt,
          };
        });
        const firstRowData = rows[0];
        setSelectedsubDataState2({ [idGetter3(firstRowData)]: true });
      }
    } 
    else {
      console.log("[오류 발생]");
      console.log(data);
    }

    setLoading(false);
  }

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch) {
      Retrieve("Q");
    }
  }, [filters]);

  useEffect(() => {
    if (Object.getOwnPropertyNames(selectedState).length > 0
      && selectedState[""] !== false) {
      Retrieve("MNGITEM");
    }
  }, [subPgNum]);

  useEffect(() => {
    if (Object.getOwnPropertyNames(selectedState).length > 0
      && selectedState[""] !== false) {
      Retrieve("FINDETAIL");
    }
  }, [subPgNum2]);

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

    FillValuesFromDataRow(selectedRowData);
  };

  const onSubDataSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedsubDataState,
      dataItemKey: SUB_DATA_ITEM_KEY,
    });
    
    setSelectedsubDataState(newSelectedState);
  };

  const onSubDataSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedsubDataState2,
      dataItemKey: SUB_DATA_ITEM_KEY2,
    });
    setSelectedsubDataState2(newSelectedState);
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

        bottomPgNum: pgNumWithGap + 1,
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
    if (chkScrollHandler(event, subPgNum, PAGE_SIZE))
      setSubPgNum((prev) => prev + 1);
  };

  const onSubScrollHandler2 = (event: GridEvent) => {
    if (chkScrollHandler(event, subPgNum2, PAGE_SIZE))
      setSubPgNum2((prev) => prev + 1);
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

  //상세 그리드 푸터
  const detailTotalFooterCell = (props: GridFooterCellProps) => {
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

  //재무제표 그리드 푸터
  const finTotalFooterCell = (props: GridFooterCellProps) => {
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

  const onNewClick = () => {
    setSelectedState({"": false});
    FillValuesFromDataRow(null);
  };

  const addRowDetail = () => {
    if (subDataResult.total >= 6) {
      alert("관리항목은 최대 6개까지 입력 가능합니다.");
      return;
    }

    let seq = subDataResult.total + deletedMainRows.length + 1;

    const newDataItem = {
      rowstatus: "N",
      mngitemcd: "",
      mngdrctlyn: "",
      mngcrctlyn: "",
      num: seq
    };
    
    setSubDataResult((prev) => {
      return {
        data: [...prev.data, newDataItem],
        total: prev.total + 1,
      };
    });

    setSelectedsubDataState({ [detailIdGetter(newDataItem)]: true });
  };

  // 요약정보 행 변경
  const retrieveDetail2 = () => {
    setSubDataResult2(process([], subDataState2));
    deletedMainRows2 = [];
    setSubPgNum2(1);

    if (Object.getOwnPropertyNames(selectedState).length > 0
      && selectedState[""] !== false) {
      Retrieve("FINDETAIL");
    }
  };

  const addRowDetail2 = () => {
    let seq = subDataResult2.total + deletedMainRows.length + 1;

    const newDataItem = {
      rowstatus: "N",
      reportgb: "",
      acntgrpcd: "",
      acntgrpnm: "",
      num: seq
    };
    
    setSubDataResult2((prev) => {
      return {
        data: [...prev.data, newDataItem],
        total: prev.total + 1,
      };
    });

    setSelectedsubDataState2({ [idGetter3(newDataItem)]: true });
  };

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
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

  const search = () => {
    setMainDataResult(process([], mainDataState));
    setSelectedState({"": false});

    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true, pgGap: 0 }));
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

  const onSubItemChange2 = (event: GridItemChangeEvent) => {
    setSubDataState2((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      subDataResult2,
      setSubDataResult2,
      SUB_DATA_ITEM_KEY2
    );
  };

  const enterEdit = (dataItem: any, field: string) => {
    if (field != "rowstatus" && field != "files") {
      const newData = subDataResult.data.map((item) =>
        detailIdGetter(item) === detailIdGetter(dataItem)
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

  const enterEdit2 = (dataItem: any, field: string) => {
    if (field != "rowstatus") {
      const newData = subDataResult2.data.map((item) =>
        item[SUB_DATA_ITEM_KEY2] === dataItem[SUB_DATA_ITEM_KEY2]
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

      setSubDataResult2((prev) => {
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

  const exitEdit2 = () => {
    const newData = subDataResult2.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    setSubDataResult2((prev) => {
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

  const customCellRender2 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit2}
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

  const customRowRender2 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit2}
      editField={EDIT_FIELD}
    />
  );

  const removeRowDetail = () => {
    let newData: any[] = [];
    let newID: any;

    subDataResult.data.forEach((item, index, array) => {
      if (!selectedsubDataState[detailIdGetter(item)]) {
        newData.push(item);
      } else {
        newID = array.length > index + 1 ? detailIdGetter(array[index + 1]) 
              : index > 0 ? detailIdGetter(array[index - 1]) : "";

        if (item.rowstatus != "N") {
          const newData2 = {
            ...item,
            rowstatus: "D",
          };
          deletedMainRows.push(newData2);
        }
      }
    });
    setSubDataResult(() => ({
      data: newData,
      total: newData.length,
    }));

    setSubDataState({});
    setSelectedsubDataState({[newID] : newID != ""});
  };

  const removeRowDetail2 = () => {
    let newData: any[] = [];
    let newID: any;

    subDataResult2.data.forEach((item, index, array) => {
      if (!selectedsubDataState2[item[SUB_DATA_ITEM_KEY2]]) {
        newData.push(item);
      } else {
        newID = array.length > index + 1 ? detailIdGetter(array[index + 1]) 
              : index > 0 ? detailIdGetter(array[index - 1]) : "";

        if (item.rowstatus != "N") {
          const newData2 = {
            ...item,
            rowstatus: "D",
          };
          deletedMainRows2.push(newData2);
        }
      }
    });
    setSubDataResult2(() => ({
      data: newData,
      total: newData.length,
    }));

    setSubDataState2({});
    setSelectedsubDataState2({[newID] : newID != ""});
  };
  
  const questionToDelete = useSysMessage("QuestionToDelete");

  const deleteList = () => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }
  
    ExecuteSave("D")
  };

  const [paraData, setParaData] = useState({
    acntcd             : "",
    acntnm             : "",
    mngdrcustyn        : "",
    mngcrcustyn        : "",
    mngsumcustyn       : "",
    mngdramtyn         : "",
    mngcramtyn         : "",
    mngdrrateyn        : "",
    mngcrrateyn        : "",
    acntgrp            : "",
    acntchr            : "",
    alcchr             : "",
    profitchr          : "",
    acntbaldiv         : "",
    budgyn             : "",
    system_yn          : "",
    useyn              : "",
    profitsha          : "",
    makesha            : "",
    acntdiv            : "",
    show_payment_yn    : "",
    show_collect_yn    : "",
    show_pur_sal_yn    : "",
    douzonecd	         : "",
    mngitemcd1: "",
    mngitemcd2: "",
    mngitemcd3: "",
    mngitemcd4: "",
    mngitemcd5: "",
    mngitemcd6: "",
    mngdrctlyn1: "",
    mngdrctlyn2: "",
    mngdrctlyn3: "",
    mngdrctlyn4: "",
    mngdrctlyn5: "",
    mngdrctlyn6: "",
    mngcrctlyn1: "",
    mngcrctlyn2: "",
    mngcrctlyn3: "",
    mngcrctlyn4: "",
    mngcrctlyn5: "",
    mngcrctlyn6: "",
  });

  const saveList = async () => {
    let workType: string;

    workType = (selectedState[""] === false ? "N" : "U");

    ExecuteSave(workType);
  };

  const saveDetail2 = async () => {
    ExecuteSaveDetail2();
  };

  const ExecuteSave = async (workType: string) => {
    let valid = true;
    try {
      if (paraData.acntcd == "") {
        throw "계정코드는 필수입력입니다.";
      }

      if (paraData.acntnm== "") {
        throw "계정명은 필수입력입니다.";
      }

      if (paraData.acntbaldiv== "") {
        throw "잔액구분은 필수입력입니다.";
      }
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    let mngitemcds: any[] = []; 
    let mngdrctlyns: any[] = [];
    let mngcrctlyns: any[] = [];

    if (workType !== "D") {
      const dataDetail = subDataResult.data;

      dataDetail.forEach((item) => {
        const {
          mngitemcd,
          mngdrctlyn,
          mngcrctlyn,
        } = item;

        mngitemcds.push(mngitemcd);
        mngdrctlyns.push(mngdrctlyn == true ? "Y" 
                        : mngdrctlyn == false ? "N"
                        : mngdrctlyn);
        mngcrctlyns.push(mngcrctlyn == true ? "Y" 
                        : mngcrctlyn == false ? "N"
                        : mngcrctlyn);
      });
    }

    setLoading(true);

    const procedure: Iparameters = {
      procedureName: "P_AC_A0030W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": workType,

        "@p_orgdiv": orgdiv,

        "@p_acntcd": paraData.acntcd,           
        "@p_acntnm": paraData.acntnm,            
        "@p_mngdrcustyn": paraData.mngdrcustyn,       
        "@p_mngcrcustyn": paraData.mngcrcustyn,       
        "@p_mngsumcustyn": paraData.mngsumcustyn,      
        "@p_mngdramtyn": paraData.mngdramtyn,       
        "@p_mngcramtyn": paraData.mngcramtyn, 
        "@p_mngdrrateyn": paraData.mngdrrateyn,       
        "@p_mngcrrateyn": paraData.mngcrrateyn,          
        "@p_acntgrp": paraData.acntgrp,           
        "@p_acntchr": paraData.acntchr,           
        "@p_alcchr": paraData.alcchr, 
        "@p_profitchr": paraData.profitchr, 
        "@p_acntbaldiv": paraData.acntbaldiv, 
        "@p_budgyn": paraData.budgyn, 
        "@p_system_yn": paraData.system_yn, 
        "@p_useyn": paraData.useyn, 
        "@p_profitsha": paraData.profitsha, 
        "@p_makesha": paraData.makesha, 
        "@p_acntdiv": paraData.acntdiv, 
        "@p_show_payment_yn": paraData.show_payment_yn, 
        "@p_show_collect_yn": paraData.show_collect_yn, 
        "@p_show_pur_sal_yn": paraData.show_pur_sal_yn, 
        "@p_douzonecd": paraData.douzonecd, 

        "@p_mngitemcd1": mngitemcds[0] ?? "",
        "@p_mngitemcd2": mngitemcds[1] ?? "",
        "@p_mngitemcd3": mngitemcds[2] ?? "",
        "@p_mngitemcd4": mngitemcds[3] ?? "",
        "@p_mngitemcd5": mngitemcds[4] ?? "",
        "@p_mngitemcd6": mngitemcds[5] ?? "",
        "@p_mngdrctlyn1": mngdrctlyns[0] ?? "",
        "@p_mngdrctlyn2": mngdrctlyns[1] ?? "",
        "@p_mngdrctlyn3": mngdrctlyns[2] ?? "",
        "@p_mngdrctlyn4": mngdrctlyns[3] ?? "",
        "@p_mngdrctlyn5": mngdrctlyns[4] ?? "",
        "@p_mngdrctlyn6": mngdrctlyns[5] ?? "",
        "@p_mngcrctlyn1": mngcrctlyns[0] ?? "",
        "@p_mngcrctlyn2": mngcrctlyns[1] ?? "", 
        "@p_mngcrctlyn3": mngcrctlyns[2] ?? "", 
        "@p_mngcrctlyn4": mngcrctlyns[3] ?? "", 
        "@p_mngcrctlyn5": mngcrctlyns[4] ?? "", 
        "@p_mngcrctlyn6": mngcrctlyns[5] ?? "", 
  
        "@p_insert_userid": userId,
        "@p_insert_pc": pc,
        "@p_form_id": pathname,
      },
    };

    let data: any;

    try {
      data = await processApi<any>("procedure", procedure);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      filters.find_row_value = data.returnString;
      setMainDataResult(process([], mainDataState));
      setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true, pgGap: 0 }));
    } 
    else {
      console.log("[오류 발생]");
      console.log(data);
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }
    setLoading(false);
  };

  const ExecuteSaveDetail2 = async () => {

    let rowstatuss: any[] = [];
    let acntsess: any[] = [];
    let reportgbs: any[] = []; 
    let acntgrpcds: any[] = [];
    let acntcds: any[] = [];
    let acntgrpnms: any[] = [];

    const dataSource = subDataResult2.data;

    dataSource.forEach((item) => {
      if (item.rowstatus == "N"
        || item.rowstatus == "U") {
        const {
          rowstatus,
          reportgb,
          acntgrpcd,
          acntgrpnm,
        } = item;

        rowstatuss.push(rowstatus);
        acntsess.push(filters.acntses);
        reportgbs.push(reportgb);
        acntgrpcds.push(acntgrpcd);
        acntcds.push(paraData.acntcd);
        acntgrpnms.push(acntgrpnm);
      }
    });

    const dataDeleted = deletedMainRows2;

    dataDeleted.forEach((item) => {
        const {
          reportgb,
          acntgrpcd,
          acntgrpnm,
        } = item;

        rowstatuss.push("D");
        acntsess.push(filters.acntses);
        reportgbs.push(reportgb);
        acntgrpcds.push(acntgrpcd);
        acntcds.push(paraData.acntcd);
        acntgrpnms.push(acntgrpnm);
    });

    if (rowstatuss.length == 0) {
      return;
    }

    setLoading(true);

    const procedure: Iparameters = {
      procedureName: "P_AC020TW_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": "A",

        "@p_orgdiv": orgdiv,
    
        "@p_rowstatus_s": rowstatuss.join("|"),
        "@p_acntses_s": acntsess.join("|"),
        "@p_reportgb_s": reportgbs.join("|"),
        "@p_acntgrpcd_s": acntgrpcds.join("|"),
        "@p_acntcd_s": acntcds.join("|"),
        "@p_acntgrpnm_s": acntgrpnms.join("|"),

        "@p_userid": userId,
        "@p_pc": pc,
        "@p_form_id": pathname,
      },
    };

    let data: any;

    try {
      data = await processApi<any>("procedure", procedure);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      retrieveDetail2();
    } 
    else {
      console.log("[오류 발생]");
      console.log(data);
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }
    setLoading(false);
  };

  return (
    <>
      <TitleContainer>
        <Title>계정관리</Title>

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
              <th>계정코드</th>
              <td>
                <Input
                  name="acntcd"
                  type="text"
                  value={filters.acntcd}
                  onChange={filterInputChange}
                />
              </td>

              <th>계정명</th>
              <td>
                <Input
                  name="acntnm"
                  type="text"
                  value={filters.acntnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>사용여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="useyn"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainerWrap>
        <GridContainer width={`25%`}>
          <ExcelExport
            data={mainDataResult.data}
            ref={(exporter) => {
              _export = exporter;
            }}
          >
            <GridTitleContainer>
              <GridTitle>요약정보</GridTitle>
            </GridTitleContainer>
            <Grid
              style={{ height: "81.5vh" }} //76vh
              data={process(
                mainDataResult.data.map((item) => ({
                  ...item,
                  [SELECTED_FIELD]: selectedState[listIdGetter(item)],
                })), 
                mainDataState
              )}
              {...mainDataState}
              ref = {gridRef}//{(g) => {gridRef = g;}}
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
                customOptionData.menuCustomColumnOptions["grdHeaderList"].map(
                  (item: any, idx: number) =>
                    item.sortOrder !== -1 && (
                      <GridColumn
                        key={idx}
                        id={item.id}
                        field={item.fieldName}
                        title={item.caption}
                        width={item.width}
                        cell={
                          checkBoxField.includes(item.fieldName)
                            ? CheckBoxCell
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
        <GridContainer width={`calc(75% - ${GAP}px)`}>
          <TabStrip
            selected={tabSelected}
            onSelect={handleSelectTab}
            style={{ width: "100%" }}
          >
            <TabStripTab title="상세정보">
              <ButtonContainer style={{ float: "right" }}>
                <Button
                  onClick={onNewClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="file-add"
                >
                  신규
                </Button>
                <Button
                  onClick={saveList}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="save"
                >
                  저장
                </Button>
                <Button
                  onClick={deleteList}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="delete"
                >
                  삭제
                </Button>
              </ButtonContainer>
              <FormBoxWrap style={{ height: "41vh", overflow: "auto"}} /*67.5*/> 
                <FormBox>
                  <tbody>
                    <tr>
                      <th>계정코드</th>
                      <td>
                        {selectedState[""] === false ? (
                          <Input
                            name="acntcd"
                            type="text"
                            value={paraData.acntcd}
                            className="required"
                            onChange={InputChange}
                          />
                        ) : (
                          <Input
                            name="acntcd"
                            type="text"
                            value={paraData.acntcd}
                            className="readonly"
                          />
                        ) }
                      </td>
                      <th>계정명</th>
                      <td>
                        <Input
                          name="acntnm"
                          type="text"
                          value={paraData.acntnm}
                          onChange={InputChange}
                          className="required"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>잔액구분</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="acntbaldiv"
                            value={paraData.acntbaldiv}
                            bizComponentId="L_AC001"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                            className="required"
                            textField="code_name"
                            valueField="sub_code"
                          />
                        )}
                      </td>
                      <th>사용여부</th>
                      <td>
                        <Checkbox
                          name="useyn"
                          value={paraData.useyn == "Y" ? true : false}
                          onChange={CheckChange}
                        />
                      </td>
                      <th>시스템코드여부</th>
                      <td>
                        <Checkbox
                          name="system_yn"
                          value={paraData.system_yn == "Y" ? true : false}
                          onChange={CheckChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>계정그룹</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="acntgrp"
                            value={paraData.acntgrp}
                            bizComponentId="L_AC012"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                          />
                        )}
                      </td>
                      <th>거래처관리여부</th>
                      <td>
                        <Checkbox
                          name="mngdrcustyn"
                          label={"차변"}
                          value={paraData.mngdrcustyn == "Y" ? true : false}
                          onChange={CheckChange}
                        />
                      </td>
                      <td>
                        <Checkbox
                          name="mngcrcustyn"
                          label={"대변"}
                          value={paraData.mngcrcustyn == "Y" ? true : false}
                          onChange={CheckChange}
                        />
                      </td>
                      <td>
                        <Checkbox
                          name="mngsumcustyn"
                          label={"누계"}
                          value={paraData.mngsumcustyn == "Y" ? true : false}
                          onChange={CheckChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>계정특성</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="acntchr"
                            value={paraData.acntchr}
                            bizComponentId="L_AC008"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                          />
                        )}
                      </td>
                      <th>RATE관리</th>
                      <td>
                        <Checkbox
                          name="mngdrrateyn"
                          label={"차변"}
                          value={paraData.mngdrrateyn == "Y" ? true : false}
                          onChange={CheckChange}
                        />
                      </td>
                      <td>
                        <Checkbox
                          name="mngcrrateyn"
                          label={"대변"}
                          value={paraData.mngcrrateyn == "Y" ? true : false}
                          onChange={CheckChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>자금/예산</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="budgyn"
                            value={paraData.budgyn}
                            bizComponentId="L_AC033"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                          />
                        )}
                      </td>
                      <th>관리금액관리</th>
                      <td>
                        <Checkbox
                          name="mngdramtyn"
                          label={"차변"}
                          value={paraData.mngdramtyn == "Y" ? true : false}
                          onChange={CheckChange}
                        />
                      </td>
                      <td>
                        <Checkbox
                          name="mngcramtyn"
                          label={"대변"}
                          value={paraData.mngcramtyn == "Y" ? true : false}
                          onChange={CheckChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>손익분배</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="profitsha"
                            value={paraData.profitsha}
                            bizComponentId="L_BA073"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                          />
                        )}
                      </td>
                      <th rowSpan={3}>자동전표기준</th>
                      <th>지급</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="show_payment_yn"
                            value={paraData.show_payment_yn}
                            bizComponentId="L_AC090"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>자산부채특성</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="alcchr"
                            value={paraData.alcchr}
                            bizComponentId="L_AC009"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                          />
                        )}
                      </td>
                      <th>수금</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="show_collect_yn"
                            value={paraData.show_collect_yn}
                            bizComponentId="L_AC090"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>손익특성</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="profitchr"
                            value={paraData.profitchr}
                            bizComponentId="L_AC010"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                          />
                        )}
                      </td>
                      <th>매입매출</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="show_pur_sal_yn"
                            value={paraData.show_pur_sal_yn}
                            bizComponentId="L_AC090"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>제조분배</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="makesha"
                            value={paraData.makesha}
                            bizComponentId="L_BA073"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                          />
                        )}
                      </td>
                      <th>세목구분</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="acntdiv"
                            value={paraData.acntdiv}
                            bizComponentId="L_AC007"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                          />
                        )}
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <GridContainer>
                <GridTitleContainer>
                  <GridTitle>관리항목</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={addRowDetail}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="plus"
                    ></Button>
                    <Button
                      onClick={removeRowDetail}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="minus"
                    ></Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <Grid
                  style={{ height: "25vh"}} // 65
                  data={process(
                    subDataResult.data.map((row) => ({
                      ...row,
                      rowstatus:
                        row.rowstatus == null ||
                        row.rowstatus == "" ||
                        row.rowstatus == undefined
                          ? ""
                          : row.rowstatus,
                      [SELECTED_FIELD]: selectedsubDataState[detailIdGetter(row)],
                    })),
                    subDataState
                  )}
                  {...subDataState}
                  onDataStateChange={onSubDataStateChange}
                  //선택 기능
                  dataItemKey={SUB_DATA_ITEM_KEY}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single"
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
                    customOptionData.menuCustomColumnOptions["grdDetailList"].map(
                      (item: any, idx: number) =>
                        item.sortOrder !== -1 && (
                          <GridColumn
                            key={idx}
                            id={item.id}
                            field={item.fieldName}
                            title={item.caption}
                            width={item.width}
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
                            cell={
                              checkBoxField.includes(item.fieldName)
                                ? CheckBoxCell
                                : comboBoxField.includes(item.fieldName)
                                ? CustomComboBoxCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 0 ? detailTotalFooterCell : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </GridContainer>
            </TabStripTab>
            <TabStripTab title="제무재표상세">
              <FilterContainer>
                <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)} >
                  <tbody>
                    <tr>
                      <th>회기</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="acntses"
                            value={filters.acntses}
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
                <GridTitleContainer>
                  <GridTitle>재무현황</GridTitle>
                  <ButtonContainer>
                  <Button
                      onClick={retrieveDetail2}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="arrow-rotate-cw-small"
                    ></Button>
                    <Button
                      onClick={addRowDetail2}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="plus"
                    ></Button>
                    <Button
                      onClick={removeRowDetail2}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="minus"
                    ></Button>
                    <Button
                      onClick={saveDetail2}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="save"
                    ></Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <Grid
                  style={{ height: "64vh"}}
                  data={process(
                    subDataResult2.data.map((row) => ({
                      ...row,
                      rowstatus:
                        row.rowstatus == null ||
                        row.rowstatus == "" ||
                        row.rowstatus == undefined
                          ? ""
                          : row.rowstatus,
                      [SELECTED_FIELD]: selectedsubDataState2[idGetter3(row)],
                    })),
                    subDataState2
                  )}
                  {...subDataState2}
                  onDataStateChange={onSubDataStateChange2}
                  //선택 기능
                  dataItemKey={SUB_DATA_ITEM_KEY}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single"
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
                  onItemChange={onSubItemChange2}
                  cellRender={customCellRender2}
                  rowRender={customRowRender2}
                  editField={EDIT_FIELD}
                >
                  <GridColumn field="rowstatus" title=" " width="50px" />
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdFinDetail"]?.map(
                      (item: any, idx: number) =>
                        item.sortOrder !== -1 && (
                          <GridColumn
                            key={idx}
                            id={item.id}
                            field={item.fieldName}
                            title={item.caption}
                            width={item.width}
                            className={
                              requiredField.includes(item.fieldName)
                                ? "required"
                                : readOnlyField.includes(item.fieldName)
                                ? "read-only"
                                : undefined
                            }
                            headerCell={
                              requiredField.includes(item.fieldName)
                                ? RequiredHeader
                                : undefined
                            }
                            cell={
                              checkBoxField.includes(item.fieldName)
                                ? CheckBoxCell
                                : comboBoxField.includes(item.fieldName)
                                ? CustomComboBoxCell
                                : undefined
                            }
                            editable={
                              readOnlyField.includes(item.fieldName)
                                ? false
                                : true}
                            footerCell={
                              item.sortOrder === 0 ? finTotalFooterCell : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </GridContainer>
            </TabStripTab>
          </TabStrip>
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

export default AC_A0030W;
