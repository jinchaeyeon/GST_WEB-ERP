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
import { gridList } from "../store/columns/BA_A0070W_C";
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
  FormBoxWrap,
  FormBox,
} from "../CommonStyled";
import FilterContainer from "../components/Containers/FilterContainer";
import { Button } from "@progress/kendo-react-buttons";
import { useApi } from "../hooks/api";
import { Iparameters, TPermissions } from "../store/types";
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
import { useSetRecoilState } from "recoil";
import { isLoading } from "../store/atoms";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { Checkbox, Input, TextArea } from "@progress/kendo-react-inputs";
import CheckBoxReadOnlyCell from "../components/Cells/CheckBoxReadOnlyCell";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";

const DATA_ITEM_KEY = "num";
const SUB_DATA_ITEM_KEY = "num";
let deletedMainRows: any[] = [];

const SY_A0025W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
  const [pc, setPc] = useState("");
  UseParaPc(setPc);

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
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_SYS003",
    //환율사이트
    setBizComponentData
  );

  useEffect(() => {
    if (bizComponentData !== null) {
    }
  }, [bizComponentData]);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [subDataState, setSubDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [subDataResult, setSubDataResult] = useState<DataResult>(
    process([], subDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [selectedsubDataState, setSelectedsubDataState] = useState<{
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

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const InputChange = (e: any) => {
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
    numbering_id: "",
    numbering_name: "",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  //조회조건 초기값
  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "HISTORY",
    numbering_id: "",
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_SY_A0025W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": filters.workType,
      "@p_numbering_id": filters.numbering_id,
      "@p_numbering_name": filters.numbering_name,
      "@p_find_row_value": "",
    },
  };

  //조회조건 파라미터
  const parameters2: Iparameters = {
    procedureName: "P_SY_A0025W_Q",
    pageNumber: mainPgNum,
    pageSize: filters2.pgSize,
    parameters: {
      "@p_work_type": filters2.workType,
      "@p_numbering_id": filters2.numbering_id,
      "@p_numbering_name": "",
      "@p_find_row_value": "",
    },
  };

  const [infomation, setInfomation] = useState({
    worktype: "U",
    numbering_id: "",
    use_yn: false,
    numbering_name: "",
    numbering_length: 0,
    memo: "",
    number_element1: "",
    number_element2: "",
    number_element3: "",
    number_element4: "",
    number_element5: "",
    number_value1: "",
    number_value2: "",
    number_value3: "",
    number_value4: "",
    number_value5: "",
    start_serno: "",
    sampleno: "",
  });

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
          setFilters2((prev) => ({
            ...prev,
            numbering_id: firstRowData.numbering_id,
          }));

          setInfomation({
            worktype: "U",
            numbering_id: firstRowData.numbering_id,
            use_yn: firstRowData.use_yn == "Y" ? true : false,
            numbering_name: firstRowData.numbering_name,
            numbering_length: firstRowData.number_length,
            memo: firstRowData.memo,
            number_element1: firstRowData.number_element1,
            number_element2: firstRowData.number_element2,
            number_element3: firstRowData.number_element3,
            number_element4: firstRowData.number_element4,
            number_element5: firstRowData.number_element5,
            number_value1: firstRowData.number_value1,
            number_value2: firstRowData.number_value2,
            number_value3: firstRowData.number_value3,
            number_value4: firstRowData.number_value4,
            number_value5: firstRowData.number_value5,
            start_serno: firstRowData.start_serno,
            sampleno: "",
          });
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
            data: rows,
            total: totalRowCnt,
          };
        });
      } else {
        setSubDataResult((prev) => {
          return {
            data: [],
            total: 0,
          };
        });
      }

      setIfSelectFirstRow(true);
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      customOptionData != null &&
      filters.isSearch &&
      permissions !== null &&
      bizComponentData !== null
    ) {
      setFilters((prev) => ({ ...prev, isSearch: false }));
      fetchMainGrid();
    }
  }, [filters, permissions]);

  useEffect(() => {
    if (customOptionData !== null) {
      fetchMainGrid2();
    }
  }, [filters2]);

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

  useEffect(() => {
    if (ifSelectFirstRow2) {
      if (subDataResult.total > 0) {
        const firstRowData = subDataResult.data[0];

        if (firstRowData != null) {
          setSelectedsubDataState({ [firstRowData.num]: true });
        } else {
          setSelectedsubDataState({});
        }
        setIfSelectFirstRow2(false);
      }
    }
  }, [subDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setSubDataResult(process([], subDataState));
    setIfSelectFirstRow2(true);
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
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
    setIfSelectFirstRow2(true);
    setFilters2((prev) => ({
      ...prev,
      numbering_id: selectedRowData.numbering_id,
    }));
    setInfomation({
      worktype: "U",
      numbering_id: selectedRowData.numbering_id,
      use_yn: selectedRowData.use_yn,
      numbering_name: selectedRowData.numbering_name,
      numbering_length: selectedRowData.number_length,
      memo: selectedRowData.memo,
      number_element1: selectedRowData.number_element1,
      number_element2: selectedRowData.number_element2,
      number_element3: selectedRowData.number_element3,
      number_element4: selectedRowData.number_element4,
      number_element5: selectedRowData.number_element5,
      number_value1: selectedRowData.number_value1,
      number_value2: selectedRowData.number_value2,
      number_value3: selectedRowData.number_value3,
      number_value4: selectedRowData.number_value4,
      number_value5: selectedRowData.number_value5,
      start_serno: selectedRowData.start_serno,
      sampleno: "",
    });
  };

  const onSubDataSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedsubDataState,
      dataItemKey: SUB_DATA_ITEM_KEY,
    });
    setSelectedsubDataState(newSelectedState);
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

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onSubDataStateChange = (event: GridDataStateChangeEvent) => {
    setSubDataState(event.dataState);
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

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onSubDataSortChange = (e: any) => {
    setSubDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    resetAllGrid();
    deletedMainRows = [];
  };

  const enterEdit = (dataItem: any, field: string) => {
    if (
      field != "rowstatus" &&
      !(
        field == "number_prefix" &&
        (dataItem.rowstatus == "" || dataItem.rowstatus == "U")
      )
    ) {
      const newData = subDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
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

  const onMainItemChange = (event: GridItemChangeEvent) => {
    setSubDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      subDataResult,
      setSubDataResult,
      DATA_ITEM_KEY
    );
  };

  const onAddClick = () => {
    let seq = subDataResult.total + deletedMainRows.length + 1;

    const newDataItem = {
      [DATA_ITEM_KEY]: seq,
      number_prefix: "",
      last_serno: 0,
      rowstatus: "N",
    };
    setSelectedsubDataState({ [newDataItem.num]: true });

    setSubDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const para: Iparameters = {
    procedureName: "P_SY_A0025W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": infomation.worktype,
      "@p_numbering_id": infomation.numbering_id,
      "@p_numbering_name": infomation.numbering_name,
      "@p_number_length": infomation.numbering_length,
      "@p_number_element1": infomation.number_element1,
      "@p_number_element2": infomation.number_element2,
      "@p_number_element3": infomation.number_element3,
      "@p_number_element4": infomation.number_element4,
      "@p_number_element5": infomation.number_element5,
      "@p_number_value1": infomation.number_value1,
      "@p_number_value2": infomation.number_value2,
      "@p_number_value3": infomation.number_value3,
      "@p_number_value4": infomation.number_value4,
      "@p_number_value5": infomation.number_value5,
      "@p_start_serno": infomation.start_serno,
      "@p_memo": infomation.memo,
      "@p_use_yn":
        infomation.use_yn === true
          ? "Y"
          : infomation.use_yn === false
          ? "N"
          : infomation.use_yn,
      "@p_userid": userId,
      "@p_pc": pc,
    },
  };

  const onSaveClick = async () => {
    if (
      infomation.numbering_id == "" ||
      infomation.numbering_name == "" ||
      infomation.numbering_length == 0 ||
      infomation.number_element1 == "" ||
      infomation.start_serno == ""
    ) {
      alert("필수항목을 채워주세요.");
    } else {
      let data: any;
      try {
        data = await processApi<any>("procedure", para);
      } catch (error) {
        data = null;
      }

      if (data.isSuccess == true && infomation.worktype != "D") {
        const dataItem = subDataResult.data.filter((item: any) => {
          return (
            (item.rowstatus === "N" || item.rowstatus === "U") &&
            item.rowstatus !== undefined
          );
        });

        dataItem.map(async (item) => {
          const para2: Iparameters = {
            procedureName: "P_SY_A0025W_S1",
            pageNumber: 0,
            pageSize: 0,
            parameters: {
              "@p_work_type": item.rowstatus,
              "@p_numbering_id": infomation.numbering_id,
              "@p_number_prefix": item.number_prefix,
              "@p_last_serno": item.last_serno,
            },
          };
          try {
            data = await processApi<any>("procedure", para2);
          } catch (error) {
            data = null;
          }
        });
        deletedMainRows.map(async (item) => {
          const para2: Iparameters = {
            procedureName: "P_SY_A0025W_S1",
            pageNumber: 0,
            pageSize: 0,
            parameters: {
              "@p_work_type": item.rowstatus,
              "@p_numbering_id": infomation.numbering_id,
              "@p_number_prefix": item.number_prefix,
              "@p_last_serno": item.last_serno,
            },
          };
          try {
            data = await processApi<any>("procedure", para2);
          } catch (error) {
            data = null;
          }
        });
        if (data.isSuccess == true) {
          resetAllGrid();
        }
      } else if(data.isSuccess == true && infomation.worktype == "D") {
        resetAllGrid();
      } else {
        alert(data.resultMessage);
      }
    }
  };

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];

    subDataResult.data.forEach((item: any, index: number) => {
      if (!selectedsubDataState[item[DATA_ITEM_KEY]]) {
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

    setSubDataState({});
  };

  const questionToDelete = useSysMessage("QuestionToDelete");
  const onDeleteClick2 = (e: any) => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }
    setInfomation((prev) => ({
      ...prev,
      worktype: "D",
    }));
  };

  useEffect(() => {
    if (customOptionData !== null && infomation.worktype == "D") {
      onSaveClick();
    }
  }, [infomation]);

  const onNewClick = async () => {
    setInfomation({
      worktype: "N",
      numbering_id: "",
      use_yn: true,
      numbering_name: "",
      numbering_length: 10,
      memo: "",
      number_element1: "",
      number_element2: "",
      number_element3: "",
      number_element4: "",
      number_element5: "",
      number_value1: "",
      number_value2: "",
      number_value3: "",
      number_value4: "",
      number_value5: "",
      start_serno: "1",
      sampleno: "",
    });
    setSubDataResult(process([], subDataState));
  };

  const onSample = async () => {
    let data: any;
    const para: Iparameters = {
      procedureName: "P_SY_A0025W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": "SAMPLE",
        "@p_numbering_id": infomation.numbering_id,
        "@p_numbering_name": infomation.numbering_name,
        "@p_number_length": infomation.numbering_length,
        "@p_number_element1": infomation.number_element1,
        "@p_number_element2": infomation.number_element2,
        "@p_number_element3": infomation.number_element3,
        "@p_number_element4": infomation.number_element4,
        "@p_number_element5": infomation.number_element5,
        "@p_number_value1": infomation.number_value1,
        "@p_number_value2": infomation.number_value2,
        "@p_number_value3": infomation.number_value3,
        "@p_number_value4": infomation.number_value4,
        "@p_number_value5": infomation.number_value5,
        "@p_start_serno": infomation.start_serno,
        "@p_memo": infomation.memo,
        "@p_use_yn":
          infomation.use_yn === true
            ? "Y"
            : infomation.use_yn === false
            ? "N"
            : infomation.use_yn,
        "@p_userid": userId,
        "@p_pc": pc,
      },
    };

    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      setInfomation((prev) => ({
        ...prev,
        sampleno: data.returnString,
      }));
    } else {
      alert(data.resultMessage);
    }
  };

  return (
    <>
      <TitleContainer>
        <Title>관리번호 채번정보</Title>

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
              <th>관리번호ID</th>
              <td>
                <Input
                  name="numbering_id"
                  type="text"
                  value={filters.numbering_id}
                  onChange={filterInputChange}
                />
              </td>
              <th>관리번호명</th>
              <td>
                <Input
                  name="numbering_name"
                  type="text"
                  value={filters.numbering_name}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainerWrap>
        <GridContainer width={`23%`}>
          <GridTitleContainer>
            <GridTitle>요약정보</GridTitle>
          </GridTitleContainer>
          <Grid
            style={{ height: "80vh" }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                use_yn: row.use_yn == "Y" ? true : false,
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
            onScroll={onMainScrollHandler}
            //스크롤 조회 기능
            fixedScroll={true}
            total={mainDataResult.total}
            //정렬기능
            sortable={true}
            onSortChange={onMainSortChange}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
          >
            <GridColumn
              field="numbering_id"
              title="관리번호ID"
              width="120px"
              footerCell={mainTotalFooterCell}
            />
            <GridColumn
              field="numbering_name"
              title="관리번호명"
              width="150px"
            />
            <GridColumn
              field="use_yn"
              title="사용여부"
              width="100px"
              cell={CheckBoxReadOnlyCell}
            />
          </Grid>
        </GridContainer>
        <GridContainer width={`calc(77% - ${GAP}px)`}>
          <GridTitleContainer>
            <GridTitle>기본정보</GridTitle>
            <ButtonContainer>
              <Button
                onClick={onNewClick}
                themeColor={"primary"}
                icon="file-add"
              >
                신규
              </Button>
              <Button
                onClick={onDeleteClick2}
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
          <FormBoxWrap style={{ paddingRight: "15%" }} border={true}>
            <FormBox>
              <tbody>
                <tr>
                  <th>관리번호ID</th>
                  {infomation.worktype == "N" ? (
                    <td>
                      <Input
                        name="numbering_id"
                        type="text"
                        value={infomation.numbering_id}
                        onChange={InputChange}                      
                        className="required"
                      />
                    </td>
                  ) : (
                    <td>
                      <Input
                        name="numbering_id"
                        type="text"
                        value={infomation.numbering_id}
                        className="readonly"
                      />
                    </td>
                  )}
                  <th>
                    <Checkbox
                      name="use_yn"
                      label={"사용여부"}
                      value={infomation.use_yn}
                      onChange={InputChange}
                    />
                  </th>
                  <td></td>
                </tr>
                <tr>
                  <th>관리번호명</th>
                  <td colSpan={3}>
                    <Input
                      name="numbering_name"
                      type="text"
                      value={infomation.numbering_name}
                      onChange={InputChange}
                      className="required"
                    />
                  </td>
                </tr>
                <tr>
                  <th>채번 길이</th>
                  <td>
                    <Input
                      name="numbering_length"
                      type="number"
                      value={infomation.numbering_length}
                      onChange={InputChange}
                      className="required"
                    />
                  </td>
                  <th></th>
                  <td></td>
                </tr>
                <tr>
                  <th>메모</th>
                  <td colSpan={3}>
                    <TextArea
                      value={infomation.memo}
                      name="memo"
                      rows={3}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
              </tbody>
            </FormBox>
          </FormBoxWrap>
          <GridTitleContainer>
            <GridTitle>채번구성정보</GridTitle>
          </GridTitleContainer>
          <FormBoxWrap style={{ paddingRight: "15%" }} border={true}>
            <FormBox>
              <tbody>
                <tr>
                  <th>채번요소1</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="number_element1"
                        value={infomation.number_element1}
                        bizComponentId="L_SYS003"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                        className="required"
                      />
                    )}
                  </td>
                  <th>채번요소값1</th>
                  <td>
                    <Input
                      name="number_value1"
                      type="text"
                      value={infomation.number_value1}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>채번요소2</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="number_element2"
                        value={infomation.number_element2}
                        bizComponentId="L_SYS003"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    )}
                  </td>
                  <th>채번요소값2</th>
                  <td>
                    <Input
                      name="number_value2"
                      type="text"
                      value={infomation.number_value2}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>채번요소3</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="number_element3"
                        value={infomation.number_element3}
                        bizComponentId="L_SYS003"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    )}
                  </td>
                  <th>채번요소값3</th>
                  <td>
                    <Input
                      name="number_value3"
                      type="text"
                      value={infomation.number_value3}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>채번요소4</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="number_element4"
                        value={infomation.number_element4}
                        bizComponentId="L_SYS003"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    )}
                  </td>
                  <th>채번요소값4</th>
                  <td>
                    <Input
                      name="number_value4"
                      type="text"
                      value={infomation.number_value4}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>채번요소5</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="number_element5"
                        value={infomation.number_element5}
                        bizComponentId="L_SYS003"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    )}
                  </td>
                  <th>채번요소값5</th>
                  <td>
                    <Input
                      name="number_value5"
                      type="text"
                      value={infomation.number_value5}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>시작채번연변</th>
                  <td>
                    <Input
                      name="start_serno"
                      type="text"
                      value={infomation.start_serno}
                      onChange={InputChange}
                      className="required"
                    />
                  </td>
                  <th>
                    <Button
                      onClick={onSample}
                      fillMode="outline"
                      themeColor={"primary"}
                    >
                      샘플채번보기
                    </Button>
                  </th>
                  <td>
                    <Input
                      name="sampleno"
                      type="text"
                      value={infomation.sampleno}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
              </tbody>
            </FormBox>
          </FormBoxWrap>
          <GridContainer>
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
            >
              <GridTitleContainer>
                <GridTitle>상세정보</GridTitle>
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
                </ButtonContainer>
              </GridTitleContainer>
              <Grid
                style={{ height: "20vh" }}
                data={process(
                  subDataResult.data.map((row) => ({
                    ...row,
                    basedt: row.basedt
                      ? new Date(dateformat(row.basedt))
                      : new Date(),
                    rowstatus:
                      row.rowstatus == null ||
                      row.rowstatus == "" ||
                      row.rowstatus == undefined
                        ? ""
                        : row.rowstatus,
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
                  mode: "multiple",
                }}
                onSelectionChange={onSubDataSelectionChange}
                //스크롤 조회 기능
                fixedScroll={true}
                total={mainDataResult.total}
                //정렬기능
                sortable={true}
                onSortChange={onSubDataSortChange}
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
                <GridColumn
                  field="number_prefix"
                  title="채번접두사"
                  width="120px"
                  footerCell={subTotalFooterCell}
                />
                <GridColumn
                  field="last_serno"
                  title="최종순번"
                  cell={NumberCell}
                  width="150px"
                />
              </Grid>
            </ExcelExport>
          </GridContainer>
        </GridContainer>
      </GridContainerWrap>
    </>
  );
};

export default SY_A0025W;
