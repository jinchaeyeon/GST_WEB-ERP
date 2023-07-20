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
  GridPageChangeEvent,
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
let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;
let temp = 0;
const SY_A0025W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const userId = UseGetValueFromSessionItem("user_id");
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);

  UsePermissions(setPermissions);
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 768;

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

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
    setFilters2((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
    }));

    setPage2(initialPageState);
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
  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);

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
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [subDataResult, setSubDataResult] = useState<DataResult>(
    process([], subDataState)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [selectedsubDataState, setSelectedsubDataState] = useState<{
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
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 초기값
  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "HISTORY",
    numbering_id: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

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
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SY_A0025W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_numbering_id": filters.numbering_id,
        "@p_numbering_name": filters.numbering_name,
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
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });
      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.numbering_id == filters.find_row_value
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
          total: totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) => row.numbering_id == filters.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          setFilters2((prev) => ({
            ...prev,
            numbering_id: selectedRow.numbering_id,
            isSearch: true,
          }));

          setInfomation({
            worktype: "U",
            numbering_id: selectedRow.numbering_id,
            use_yn: selectedRow.use_yn == "Y" ? true : false,
            numbering_name: selectedRow.numbering_name,
            numbering_length: selectedRow.number_length,
            memo: selectedRow.memo,
            number_element1: selectedRow.number_element1,
            number_element2: selectedRow.number_element2,
            number_element3: selectedRow.number_element3,
            number_element4: selectedRow.number_element4,
            number_element5: selectedRow.number_element5,
            number_value1: selectedRow.number_value1,
            number_value2: selectedRow.number_value2,
            number_value3: selectedRow.number_value3,
            number_value4: selectedRow.number_value4,
            number_value5: selectedRow.number_value5,
            start_serno: selectedRow.start_serno,
            sampleno: "",
          });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setFilters2((prev) => ({
            ...prev,
            numbering_id: rows[0].numbering_id,
            isSearch: true,
          }));

          setInfomation({
            worktype: "U",
            numbering_id: rows[0].numbering_id,
            use_yn: rows[0].use_yn == "Y" ? true : false,
            numbering_name: rows[0].numbering_name,
            numbering_length: rows[0].number_length,
            memo: rows[0].memo,
            number_element1: rows[0].number_element1,
            number_element2: rows[0].number_element2,
            number_element3: rows[0].number_element3,
            number_element4: rows[0].number_element4,
            number_element5: rows[0].number_element5,
            number_value1: rows[0].number_value1,
            number_value2: rows[0].number_value2,
            number_value3: rows[0].number_value3,
            number_value4: rows[0].number_value4,
            number_value5: rows[0].number_value5,
            start_serno: rows[0].start_serno,
            sampleno: "",
          });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
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
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters2: Iparameters = {
      procedureName: "P_SY_A0025W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.workType,
        "@p_numbering_id": filters2.numbering_id,
        "@p_numbering_name": "",
        "@p_find_row_value": filters2.find_row_value,
      },
    };
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

      if (filters2.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef2.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.number_prefix == filters2.find_row_value
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

      setSubDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          filters2.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) => row.number_prefix == filters2.find_row_value
              );
        if (selectedRow != undefined) {
          setSelectedsubDataState({ [selectedRow[DATA_ITEM_KEY]]: true });
        } else {
          setSelectedsubDataState({ [rows[0][DATA_ITEM_KEY]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    } // 필터 isSearch false처리, pgNum 세팅
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

  useEffect(() => {
    if (filters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions]);

  useEffect(() => {
    if (filters2.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, permissions]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (targetRowIndex2 !== null && gridRef2.current) {
      gridRef2.current.scrollIntoView({ rowIndex: targetRowIndex2 });
      targetRowIndex2 = null;
    }
  }, [subDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState); // 페이지 초기화
    setPage2(initialPageState); // 페이지 초기화
    setMainDataResult(process([], mainDataState));
    setSubDataResult(process([], subDataState));
    setInfomation({
      worktype: "N",
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
      numbering_id: selectedRowData.numbering_id,
      pgNum: 1,
      pgSize: initialPageState.take,
      isSearch: true,
    }));
    setPage2(initialPageState);
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
        총
        {mainDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
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
        총
        {subDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
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
    setFilters2((prev) => ({ ...prev, pgNum: 1, isSearch: false }));
    resetAllGrid();
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
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
              [EDIT_FIELD]: field,
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
      setSubDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult.data != subDataResult.data) {
      const newData = subDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] ==
        Object.getOwnPropertyNames(selectedsubDataState)[0]
          ? {
              ...item,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
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
      setSubDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = subDataResult.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setSubDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
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
    subDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });
    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
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
    setPage2((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
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
      let valid = false;
      subDataResult.data.map((item: any) => {
        subDataResult.data.map((item2: any) => {
          if (
            item.number_prefix == item2.number_prefix &&
            item.num != item2.num &&
            valid == false
          ) {
            alert("채번접두사가 중복됩니다.");
            valid = true;
          }
        });
      });

      if (valid == false) {
        let data: any;
        let data2: any;
        let data3: any;
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
              data2 = await processApi<any>("procedure", para2);
            } catch (error) {
              data2 = null;
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
              data3 = await processApi<any>("procedure", para2);
            } catch (error) {
              data3 = null;
            }
          });
          const isLastDataDeleted =
            subDataResult.data.length == 0 && filters2.pgNum > 1;

          if (isLastDataDeleted) {
            setPage2({
              skip:
                filters2.pgNum == 1 || filters2.pgNum == 0
                  ? 0
                  : PAGE_SIZE * (filters2.pgNum - 2),
              take: PAGE_SIZE,
            });
          }

          const findRow = subDataResult.data.filter(
            (row: any) =>
              row.num == Object.getOwnPropertyNames(selectedsubDataState)[0]
          )[0];

          if (findRow != undefined) {
            setFilters2((prev) => ({
              ...prev,
              find_row_value: findRow.number_prefix,
              pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
            }));
          } else {
            setFilters2((prev) => ({
              ...prev,
              find_row_value: "",
              pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
            }));
          }

          if (data.isSuccess == true) {
            setFilters((prev) => ({
              ...prev,
              find_row_value: data.returnString,
              isSearch: true,
            }));
          }
        } else if (data.isSuccess == true && infomation.worktype == "D") {
          const isLastDataDeleted =
            mainDataResult.data.length === 1 && filters.pgNum > 1;
          const findRowIndex = mainDataResult.data.findIndex(
            (row: any) =>
              row.num == Object.getOwnPropertyNames(selectedState)[0]
          );
          if (isLastDataDeleted) {
            setPage({
              skip:
                filters.pgNum == 1 || filters.pgNum == 0
                  ? 0
                  : PAGE_SIZE * (filters.pgNum - 2),
              take: PAGE_SIZE,
            });
            setFilters((prev) => ({
              ...prev,
              find_row_value: "",
              pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
              isSearch: true,
            }));
          } else {
            resetAllGrid();
            setFilters((prev) => ({
              ...prev,
              find_row_value:
                mainDataResult.data[findRowIndex == 0 ? 1 : findRowIndex - 1]
                  .numbering_id,
              pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
              isSearch: true,
            }));
          }
        } else {
          alert(data.resultMessage);
        }
      }
    }
  };

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    subDataResult.data.forEach((item: any, index: number) => {
      if (!selectedsubDataState[item[DATA_ITEM_KEY]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        const newData2 = {
          ...item,
          rowstatus: "D",
        };
        Object.push(index);
        deletedMainRows.push(newData2);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = subDataResult.data[Math.min(...Object2)];
    } else {
      data = subDataResult.data[Math.min(...Object) - 1];
    }
    const isLastDataDeleted =
      subDataResult.data.length === 0 && filters2.pgNum > 1;

    if (isLastDataDeleted) {
      setPage2({
        skip:
          filters2.pgNum == 1 || filters2.pgNum == 0
            ? 0
            : PAGE_SIZE * (filters2.pgNum - 2),
        take: PAGE_SIZE,
      });
    }

    setSubDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setSelectedsubDataState({
      [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
    });
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

        <GridContainer width={`calc(54% - ${GAP}px)`}>
          <GridContainer>
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
              </ButtonContainer>
            </GridTitleContainer>
            <FormBoxWrap border={true}>
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
                    <th></th>
                    <td>
                      {" "}
                      <Checkbox
                        name="use_yn"
                        label={"사용여부"}
                        value={infomation.use_yn}
                        onChange={InputChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>관리번호명</th>
                    <td>
                      <Input
                        name="numbering_name"
                        type="text"
                        value={infomation.numbering_name}
                        onChange={InputChange}
                        className="required"
                      />
                    </td>
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
          </GridContainer>
          <GridContainer>
            <GridTitleContainer>
              <GridTitle>채번구성정보</GridTitle>
            </GridTitleContainer>
            <FormBoxWrap
              border={true}
              style={{
                minHeight: "56.5vh",
                display: isMobile == true ? "block" : "flex",
                alignItems: "center",
              }}
            >
              <FormBox>
                <tbody>
                  <tr>
                    <th>채번요소1</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="number_element1"
                          value={infomation.number_element1}
                          customOptionData={customOptionData}
                          changeData={ComboBoxChange}
                          className="required"
                        />
                      )}
                    </td>
                    <th>채번요소값1</th>
                    {infomation.number_element1 == "FIXED" ? (
                      <td>
                        <Input
                          name="number_value1"
                          type="text"
                          value={infomation.number_value1}
                          onChange={InputChange}
                        />
                      </td>
                    ) : (
                      <td>
                        <Input
                          name="number_value1"
                          type="text"
                          value={infomation.number_value1}
                          className="readonly"
                        />
                      </td>
                    )}
                  </tr>
                  <tr>
                    <th>채번요소2</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="number_element2"
                          value={infomation.number_element2}
                          customOptionData={customOptionData}
                          changeData={ComboBoxChange}
                        />
                      )}
                    </td>
                    <th>채번요소값2</th>
                    {infomation.number_element2 == "FIXED" ? (
                      <td>
                        <Input
                          name="number_value2"
                          type="text"
                          value={infomation.number_value2}
                          onChange={InputChange}
                        />
                      </td>
                    ) : (
                      <td>
                        <Input
                          name="number_value2"
                          type="text"
                          value={infomation.number_value2}
                          className="readonly"
                        />
                      </td>
                    )}
                  </tr>
                  <tr>
                    <th>채번요소3</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="number_element3"
                          value={infomation.number_element3}
                          customOptionData={customOptionData}
                          changeData={ComboBoxChange}
                        />
                      )}
                    </td>
                    <th>채번요소값3</th>
                    {infomation.number_element3 == "FIXED" ? (
                      <td>
                        <Input
                          name="number_value3"
                          type="text"
                          value={infomation.number_value3}
                          onChange={InputChange}
                        />
                      </td>
                    ) : (
                      <td>
                        <Input
                          name="number_value3"
                          type="text"
                          value={infomation.number_value3}
                          className="readonly"
                        />
                      </td>
                    )}
                  </tr>
                  <tr>
                    <th>채번요소4</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="number_element4"
                          value={infomation.number_element4}
                          customOptionData={customOptionData}
                          changeData={ComboBoxChange}
                        />
                      )}
                    </td>
                    <th>채번요소값4</th>
                    {infomation.number_element4 == "FIXED" ? (
                      <td>
                        <Input
                          name="number_value4"
                          type="text"
                          value={infomation.number_value4}
                          onChange={InputChange}
                        />
                      </td>
                    ) : (
                      <td>
                        <Input
                          name="number_value4"
                          type="text"
                          value={infomation.number_value4}
                          className="readonly"
                        />
                      </td>
                    )}
                  </tr>
                  <tr>
                    <th>채번요소5</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="number_element5"
                          value={infomation.number_element5}
                          customOptionData={customOptionData}
                          changeData={ComboBoxChange}
                        />
                      )}
                    </td>
                    <th>채번요소값5</th>
                    {infomation.number_element5 == "FIXED" ? (
                      <td>
                        <Input
                          name="number_value5"
                          type="text"
                          value={infomation.number_value5}
                          onChange={InputChange}
                        />
                      </td>
                    ) : (
                      <td>
                        <Input
                          name="number_value5"
                          type="text"
                          value={infomation.number_value5}
                          className="readonly"
                        />
                      </td>
                    )}
                  </tr>
                  <tr>
                    <th>시작채번연변</th>
                    <td colSpan={3}>
                      <Input
                        name="start_serno"
                        type="text"
                        value={infomation.start_serno}
                        onChange={InputChange}
                        className="required"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>
                      <Button
                        onClick={onSample}
                        fillMode="outline"
                        themeColor={"primary"}
                      >
                        샘플채번보기
                      </Button>
                    </th>
                    <td colSpan={3}>
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
          </GridContainer>
        </GridContainer>
        <GridContainer width={`calc(23% - ${GAP}px)`}>
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
                  onClick={onSaveClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="save"
                  title="전체 저장"
                />
              </ButtonContainer>
            </GridTitleContainer>
            <Grid
              style={{ height: "80vh" }}
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
              total={subDataResult.total}
              skip={page2.skip}
              take={page2.take}
              pageable={true}
              onPageChange={pageChange2}
              //원하는 행 위치로 스크롤 기능
              ref={gridRef2}
              rowHeight={30}
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
                width="155px"
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
      </GridContainerWrap>
    </>
  );
};

export default SY_A0025W;
