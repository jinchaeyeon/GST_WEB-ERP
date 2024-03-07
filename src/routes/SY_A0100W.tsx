import {
  DataResult,
  GroupDescriptor,
  GroupResult,
  State,
  getter,
  groupBy,
  process,
} from "@progress/kendo-data-query";
import {
  getSelectedState,
  setExpandedState,
  setGroupIds,
} from "@progress/kendo-react-data-tools";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridColumn,
  GridExpandChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
} from "@progress/kendo-react-grid";
import { Checkbox } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import "hammerjs";
import React, { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  FilterBox,
  GridContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import MonthCalendar from "../components/Calendars/MonthCalendar";
import NumberCell from "../components/Cells/NumberCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  findMessage,
  handleKeyPressSearch,
  setDefaultDate,
} from "../components/CommonFunction";
import { PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import ExcelWindow from "../components/Windows/CommonWindows/ExcelWindow";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { Iparameters, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";

const initialGroup: GroupDescriptor[] = [{ field: "group_menu_name" }];

const processWithGroups = (data: any[], group: GroupDescriptor[]) => {
  const newDataState = groupBy(data, group);

  setGroupIds({ data: newDataState, group: group });

  return newDataState;
};

const App: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const userId = UseGetValueFromSessionItem("user_id");

  const [usedUserCnt, setUsedUserCnt] = useState(0);
  const [usedUserCnt2, setUsedUserCnt2] = useState(0);
  const [usedUserCnt3, setUsedUserCnt3] = useState(0);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [group, setGroup] = React.useState(initialGroup);
  const [group2, setGroup2] = React.useState(initialGroup);
  const [group3, setGroup3] = React.useState(initialGroup);
  const [total, setTotal] = useState(0);
  const [total2, setTotal2] = useState(0);
  const [total3, setTotal3] = useState(0);
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("SY_A0100W", setMessagesData);

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
  const pageChange3 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters3((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage3({
      skip: page.skip,
      take: initialPageState.take,
    });
  };
  const resetAllGrid = () => {
    setPage(initialPageState); // 페이지 초기화
    setPage2(initialPageState); // 페이지 초기화
    setPage3(initialPageState); // 페이지 초기화
    setFilters((prev) => ({ ...prev, pgNum: 1 }));
    setFilters2((prev) => ({ ...prev, pgNum: 1 }));
    setFilters3((prev) => ({ ...prev, pgNum: 1 }));
  };
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("SY_A0100W", setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setDataFilters((prev) => ({
        ...prev,
        cboViewType: defaultOption.find(
          (item: any) => item.id === "cboViewType"
        ).valueCode,
      }));
      setFilters((prev) => ({
        ...prev,
        yyyymm: setDefaultDate(customOptionData, "yyyymm"),
        cboLocation: defaultOption.find(
          (item: any) => item.id === "cboLocation"
        ).valueCode,
      }));
      setFilters2((prev) => ({
        ...prev,
        yyyymm: setDefaultDate(customOptionData, "yyyymm"),
        cboLocation: defaultOption.find(
          (item: any) => item.id === "cboLocation"
        ).valueCode,
      }));
      setFilters3((prev) => ({
        ...prev,
        yyyymm: setDefaultDate(customOptionData, "yyyymm"),
        cboLocation: defaultOption.find(
          (item: any) => item.id === "cboLocation"
        ).valueCode,
      }));
    }
  }, [customOptionData]);

  const [resultState, setResultState] = React.useState<GroupResult[]>(
    processWithGroups([], initialGroup)
  );
  const [resultState2, setResultState2] = React.useState<GroupResult[]>(
    processWithGroups([], initialGroup)
  );
  const [resultState3, setResultState3] = React.useState<GroupResult[]>(
    processWithGroups([], initialGroup)
  );
  //그리드 데이터 스테이트
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [mainDataState3, setMainDataState3] = useState<State>({
    sort: [],
  });
  //그리드 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [mainDataResult3, setMainDataResult3] = useState<DataResult>(
    process([], mainDataState3)
  );
  const [collapsedState, setCollapsedState] = React.useState<string[]>([]);
  const [collapsedState2, setCollapsedState2] = React.useState<string[]>([]);
  const [collapsedState3, setCollapsedState3] = React.useState<string[]>([]);
  //선택 상태
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState3, setSelectedState3] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [tabSelected, setTabSelected] = React.useState(0);

  const handleSelectTab = (e: any) => {
    resetAllGrid();
    setTabSelected(e.selected);

    if (e.selected === 0) {
      setGroup([
        {
          field: "group_menu_name",
        },
      ]);

      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        work_type: "ENTRY",
      }));
    } else if (e.selected === 1) {
      setGroup2([
        {
          field: "group_menu_name",
        },
      ]);

      setFilters2((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        work_type: "usage_log",
      }));
    } else if (e.selected === 2) {
      setGroup3([
        {
          field: "user_id",
        },
      ]);
      setFilters3((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        work_type: "usergroup",
      }));
    }
  };

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters2((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters3((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    if (name === "cboViewType") {
      setDataFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
      setFilters2((prev) => ({
        ...prev,
        [name]: value,
      }));
      setFilters3((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  //조회조건 CheckBox Change 함수 => 체크박스 값을 조회 파라미터로 세팅
  const programFilterChecBoxChange = (e: any) => {
    const { value, name } = e.target;
    setProgramFilters((prev) => ({
      ...prev,
      [name]: value ? "Y" : "N",
    }));
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgNum: 1,
    work_type: "ENTRY",
    orgdiv: "01",
    cboLocation: "01",
    yyyymm: new Date(),
    find_row_value: "",
    isSearch: true,
    pgSize: PAGE_SIZE,
  });
  const [filters2, setFilters2] = useState({
    pgNum: 1,
    work_type: "usage_log",
    orgdiv: "01",
    cboLocation: "01",
    yyyymm: new Date(),
    find_row_value: "",
    isSearch: true,
    pgSize: PAGE_SIZE,
  });
  const [filters3, setFilters3] = useState({
    pgNum: 1,
    work_type: "usergroup",
    orgdiv: "01",
    cboLocation: "01",
    yyyymm: new Date(),
    find_row_value: "",
    isSearch: true,
    pgSize: PAGE_SIZE,
  });

  const [dataFilters, setDataFilters] = useState({
    cboViewType: "A",
  });
  const [programFilters, setProgramFilters] = useState({
    is_all_menu: "False",
    user_groupping: "False",
  });

  //그리드 데이터 조회
  const fetchDataGrid = async (
    filters: any,
    dataFilters: any,
    programFilters: any
  ) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const dataParameters: Iparameters = {
      procedureName: "sys_sel_data_entry_log_web",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.work_type,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.cboLocation,
        "@p_yyyymm": convertDateToStr(filters.yyyymm),
        "@p_menu_group": "",
        "@p_menu_id": "",
        "@p_user_id": userId,
        "@p_viewType": dataFilters.cboViewType,
      },
    };

    try {
      data = await processApi<any>("procedure", dataParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const usedUserCnt = data.returnString;
      const useTotalRow = data.tables[1].Rows;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
        useTotalRow,
      }));

      // 실사용자수
      if (usedUserCnt !== "") setUsedUserCnt(usedUserCnt);

      const newDataState = processWithGroups(rows, group);
      setTotal(totalRowCnt);
      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      setResultState(newDataState);

      if (totalRowCnt > 0) {
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
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

  //그리드 데이터 조회
  const fetchDataGrid2 = async (
    filters2: any,
    dataFilters: any,
    programFilters: any
  ) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    const programParameters: Iparameters = {
      procedureName: "P_SY_A0100W_Q2",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.work_type,
        "@p_orgdiv": filters2.orgdiv,
        "@p_location": filters2.cboLocation,
        "@p_yyyymm": convertDateToStr(filters2.yyyymm),
        "@p_is_all_menu": programFilters.is_all_menu,
        "@p_user_groupping": programFilters.user_groupping,
      },
    };

    try {
      data = await processApi<any>("procedure", programParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const usedUserCnt = data.returnString;
      const useTotalRow = data.tables[1].Rows;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
        useTotalRow,
      }));

      // 실사용자수
      if (usedUserCnt !== "") setUsedUserCnt2(usedUserCnt);

      const newDataState = processWithGroups(rows, group2);
      setTotal2(totalRowCnt);
      setMainDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      setResultState2(newDataState);

      if (totalRowCnt > 0) {
        setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
      }
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

  //그리드 데이터 조회
  const fetchDataGrid3 = async (
    filters3: any,
    dataFilters: any,
    programFilters: any
  ) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    const userParameters: Iparameters = {
      procedureName: "P_SY_A0100W_Q2",
      pageNumber: filters3.pgNum,
      pageSize: filters3.pgSize,
      parameters: {
        "@p_work_type": filters3.work_type,
        "@p_orgdiv": filters3.orgdiv,
        "@p_location": filters3.cboLocation,
        "@p_yyyymm": convertDateToStr(filters3.yyyymm).substring(0, 6),
        "@p_is_all_menu": programFilters.is_all_menu,
        "@p_user_groupping": programFilters.user_groupping,
      },
    };

    try {
      data = await processApi<any>("procedure", userParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const usedUserCnt = data.returnString;
      const useTotalRow = data.tables[1].Rows;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
        useTotalRow,
      }));

      // 실사용자수
      if (usedUserCnt !== "") setUsedUserCnt3(usedUserCnt);

      const newDataState = processWithGroups(rows, group3);
      setTotal3(totalRowCnt);
      setMainDataResult3((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      setResultState3(newDataState);

      if (totalRowCnt > 0) {
        setSelectedState3({ [rows[0][DATA_ITEM_KEY3]]: true });
      }
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters3((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };
  const [excelPopUpWindowVisible, setExcelPopUpWindowVisible] = useState(false);

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  let _export2: ExcelExport | null | undefined;
  let _export3: ExcelExport | null | undefined;
  const exportExcel = () => {
    setFilters((prev) => ({
      ...prev,
      isSearch: true,
    }));
    setExcelPopUpWindowVisible(true);
  };

  const setDownload = (index: any) => {
    setExcelPopUpWindowVisible(false);
    if(index == 0) {
      if (_export !== null && _export !== undefined) {
        _export.save();
      }
    } else if(index == 1) {
      if (_export2 !== null && _export2 !== undefined) {
        _export2.save();
      }
    } else if(index == 3) {
      if (_export3 !== null && _export3 !== undefined) {
        _export3.save();
      }
    }
  };

  const TotalFooterCell = (props: GridFooterCellProps) => {
    var parts = total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const TotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = total2.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {total2 == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const TotalFooterCell3 = (props: GridFooterCellProps) => {
    var parts = total3.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {total3 == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const TitleFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        합계
        <br />
        사용자 계<br />
        사용률(%)
      </td>
    );
  };

  const UsedUserFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        기준사용자 {usedUserCnt}명
      </td>
    );
  };
  const UsedUserFooterCell2 = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        기준사용자 {usedUserCnt2}명
      </td>
    );
  };
  const UsedUserFooterCell3 = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        기준사용자 {usedUserCnt3}명
      </td>
    );
  };
  const DateFooterCell = (props: GridFooterCellProps) => {
    if (props.field != undefined && newData[0] != undefined) {
      return (
        <td colSpan={props.colSpan} style={props.style}>
          {newData[0].items[0].useTotalRow[0]["tt"]} <br />
          {newData[0].items[0].useTotalRow[1]["tt"]} <br />
          {newData[0].items[0].useTotalRow[2]["tt"]} <br />
        </td>
      );
    } else {
      return <td></td>;
    }
  };

  const DateFooterCell2 = (props: GridFooterCellProps) => {
    if (props.field != undefined && newData2[0] != undefined) {
      return (
        <td colSpan={props.colSpan} style={props.style}>
          {newData2[0].items[0].useTotalRow[0]["tt"]} <br />
          {newData2[0].items[0].useTotalRow[1]["tt"]} <br />
          {newData2[0].items[0].useTotalRow[2]["tt"]} <br />
        </td>
      );
    } else {
      return <td></td>;
    }
  };

  const DateFooterCell3 = (props: GridFooterCellProps) => {
    if (props.field != undefined && newData3[0] != undefined) {
      return (
        <td colSpan={props.colSpan} style={props.style}>
          {newData3[0].items[0].useTotalRow[0]["tt"]} <br />
          {newData3[0].items[0].useTotalRow[1]["tt"]} <br />
          {newData3[0].items[0].useTotalRow[2]["tt"]} <br />
        </td>
      );
    } else {
      return <td></td>;
    }
  };
  const onExpandChange = React.useCallback(
    (event: GridExpandChangeEvent) => {
      const item = event.dataItem;

      if (item.groupId) {
        const collapsedIds = !event.value
          ? [...collapsedState, item.groupId]
          : collapsedState.filter((groupId) => groupId != item.groupId);
        setCollapsedState(collapsedIds);
      }
    },
    [collapsedState]
  );
  const onExpandChange2 = React.useCallback(
    (event: GridExpandChangeEvent) => {
      const item = event.dataItem;

      if (item.groupId) {
        const collapsedIds = !event.value
          ? [...collapsedState2, item.groupId]
          : collapsedState2.filter((groupId) => groupId != item.groupId);
        setCollapsedState2(collapsedIds);
      }
    },
    [collapsedState2]
  );

  const onExpandChange3 = React.useCallback(
    (event: GridExpandChangeEvent) => {
      const item = event.dataItem;

      if (item.groupId) {
        const collapsedIds = !event.value
          ? [...collapsedState3, item.groupId]
          : collapsedState3.filter((groupId) => groupId != item.groupId);
        setCollapsedState3(collapsedIds);
      }
    },
    [collapsedState3]
  );

  useEffect(() => {
    if (filters.isSearch && permissions !== null && customOptionData != null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);

      const _2 = require("lodash");
      const deepCopiedFilters2 = _2.cloneDeep(dataFilters);

      const _3 = require("lodash");
      const deepCopiedFilters3 = _3.cloneDeep(programFilters);

      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchDataGrid(deepCopiedFilters, deepCopiedFilters2, deepCopiedFilters3);
    }
  }, [filters, permissions, dataFilters, programFilters]);

  useEffect(() => {
    if (filters2.isSearch && permissions !== null && customOptionData != null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);

      const _2 = require("lodash");
      const deepCopiedFilters2 = _2.cloneDeep(dataFilters);

      const _3 = require("lodash");
      const deepCopiedFilters3 = _3.cloneDeep(programFilters);

      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchDataGrid2(deepCopiedFilters, deepCopiedFilters2, deepCopiedFilters3);
    }
  }, [filters2, permissions, dataFilters, programFilters]);

  useEffect(() => {
    if (filters3.isSearch && permissions !== null && customOptionData != null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3);

      const _2 = require("lodash");
      const deepCopiedFilters2 = _2.cloneDeep(dataFilters);

      const _3 = require("lodash");
      const deepCopiedFilters3 = _3.cloneDeep(programFilters);

      setFilters3((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchDataGrid3(deepCopiedFilters, deepCopiedFilters2, deepCopiedFilters3);
    }
  }, [filters3, permissions, dataFilters, programFilters]);

  const newData = setExpandedState({
    data: resultState,
    collapsedIds: collapsedState,
  });

  const newData2 = setExpandedState({
    data: resultState2,
    collapsedIds: collapsedState2,
  });

  const newData3 = setExpandedState({
    data: resultState3,
    collapsedIds: collapsedState3,
  });

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
  };
  const onMainSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });

    setSelectedState2(newSelectedState);
  };
  const onMainSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState3,
      dataItemKey: DATA_ITEM_KEY3,
    });

    setSelectedState3(newSelectedState);
  };

  const CusomizedGrid = () => {
    return (
      <GridContainer width="100%" inTab={true}>
        <ExcelExport
          data={mainDataResult.data}
          ref={(exporter) => {
            _export = exporter;
          }}
        >
          <Grid
            style={{ height: "75vh" }}
            data={newData.map((item) => ({
              ...item,
              items: item.items.map((row: any) => ({
                ...row,
                [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
              })),
            }))}
            //스크롤 조회 기능
            fixedScroll={true}
            //그룹기능
            group={group}
            groupable={true}
            onExpandChange={onExpandChange}
            expandField="expanded"
            //선택 기능
            dataItemKey={DATA_ITEM_KEY}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onMainSelectionChange}
            //페이지네이션
            total={total}
            skip={page.skip}
            take={page.take}
            pageable={true}
            onPageChange={pageChange}
            resizable={true}
          >
            <GridColumn
              field="form_id"
              title="프로그램ID"
              width="140px"
              footerCell={TotalFooterCell}
            />
            <GridColumn
              field="menu_name"
              title="프로그램명"
              width="140px"
              footerCell={TitleFooterCell}
            />
            <GridColumn
              field="user_name"
              title="사용자"
              width="120px"
              footerCell={TitleFooterCell}
            />
            <GridColumn title="일자">{createDateColumn()}</GridColumn>
            <GridColumn
              field={"data_cnt_tt"}
              title="합계"
              width="120px"
              footerCell={DateFooterCell}
            />
          </Grid>
        </ExcelExport>
      </GridContainer>
    );
  };

  const CusomizedGrid2 = () => {
    return (
      <GridContainer width="100%" inTab={true}>
        <ExcelExport
          data={mainDataResult2.data}
          ref={(exporter) => {
            _export2 = exporter;
          }}
        >
          <Grid
            style={{ height: "75vh" }}
            data={newData2.map((item) => ({
              ...item,
              items: item.items.map((row: any) => ({
                ...row,
                [SELECTED_FIELD]: selectedState2[idGetter2(row)], //선택된 데이터
              })),
            }))}
            //스크롤 조회 기능
            fixedScroll={true}
            //그룹기능
            group={group2}
            groupable={true}
            onExpandChange={onExpandChange2}
            expandField="expanded"
            //선택 기능
            dataItemKey={DATA_ITEM_KEY2}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onMainSelectionChange2}
            //페이지네이션
            total={total2}
            skip={page2.skip}
            take={page2.take}
            pageable={true}
            onPageChange={pageChange2}
            resizable={true}
          >
            <GridColumn
              field="form_id"
              title="프로그램ID"
              width="140px"
              footerCell={TotalFooterCell2}
            />
            <GridColumn
              field="menu_name"
              title="프로그램명"
              width="140px"
              footerCell={TitleFooterCell}
            />
            <GridColumn
              field="user_name"
              title="사용자"
              width="120px"
              footerCell={TitleFooterCell}
            />
            <GridColumn title="일자">{createDateColumn2()}</GridColumn>
            <GridColumn
              field={"use_cnt_tt"}
              title="합계"
              width="120px"
              footerCell={DateFooterCell2}
            />
          </Grid>
        </ExcelExport>
      </GridContainer>
    );
  };

  const CusomizedGrid3 = () => {
    return (
      <GridContainer width="100%" inTab={true}>
        <ExcelExport
          data={mainDataResult3.data}
          ref={(exporter) => {
            _export3 = exporter;
          }}
        >
          <Grid
            style={{ height: "75vh" }}
            data={newData3.map((item) => ({
              ...item,
              items: item.items.map((row: any) => ({
                ...row,
                [SELECTED_FIELD]: selectedState3[idGetter3(row)], //선택된 데이터
              })),
            }))}
            //스크롤 조회 기능
            fixedScroll={true}
            //그룹기능
            group={group3}
            groupable={true}
            onExpandChange={onExpandChange3}
            expandField="expanded"
            //선택 기능
            dataItemKey={DATA_ITEM_KEY3}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onMainSelectionChange3}
            //페이지네이션
            total={total3}
            skip={page3.skip}
            take={page3.take}
            pageable={true}
            onPageChange={pageChange3}
            resizable={true}
          >
            <GridColumn
              field="user_name"
              title="사용자"
              width="120px"
              footerCell={TotalFooterCell3}
            />
            <GridColumn
              field="form_id"
              title="프로그램ID"
              width="140px"
              footerCell={UsedUserFooterCell3}
            />
            <GridColumn
              field="menu_name"
              title="프로그램명"
              width="140px"
              footerCell={UsedUserFooterCell3}
            />
            <GridColumn title="일자">{createDateColumn3()}</GridColumn>
            <GridColumn
              field={"use_cnt_tt"}
              title="합계"
              width="120px"
              footerCell={DateFooterCell3}
            />
          </Grid>
        </ExcelExport>
      </GridContainer>
    );
  };

  const createDateColumn = () => {
    const array = [];
    for (var i = 1; i <= 31; i++) {
      const num = i < 10 ? "0" + i : i + "";
      array.push(
        <GridColumn
          key={i}
          field={"data_cnt_" + num}
          title={num}
          width="70px"
          cell={NumberCell}
          footerCell={gridSumQtyFooterCell}
        />
      );
    }
    return array;
  };

  const createDateColumn2 = () => {
    const array = [];
    for (var i = 1; i <= 31; i++) {
      const num = i < 10 ? "0" + i : i + "";
      array.push(
        <GridColumn
          key={i}
          field={"use_cnt_" + num}
          title={num}
          width="70px"
          cell={NumberCell}
          footerCell={gridSumQtyFooterCell2}
        />
      );
    }
    return array;
  };

  const createDateColumn3 = () => {
    const array = [];
    for (var i = 1; i <= 31; i++) {
      const num = i < 10 ? "0" + i : i + "";
      array.push(
        <GridColumn
          key={i}
          field={"use_cnt_" + num}
          title={num}
          width="70px"
          cell={NumberCell}
          footerCell={gridSumQtyFooterCell3}
        />
      );
    }
    return array;
  };

  const gridSumQtyFooterCell = (props: GridFooterCellProps) => {
    const title =
      props.field != undefined ? props.field.replace("data_cnt_", "") : "";

    if (props.field != undefined && newData[0] != undefined) {
      return (
        <td colSpan={props.colSpan} style={props.style}>
          {newData[0].items[0].useTotalRow[0][title]} <br />
          {newData[0].items[0].useTotalRow[1][title]} <br />
          {newData[0].items[0].useTotalRow[2][title]} <br />
        </td>
      );
    } else {
      return <td></td>;
    }
  };

  const gridSumQtyFooterCell2 = (props: GridFooterCellProps) => {
    const title =
      props.field != undefined ? props.field.replace("use_cnt_", "") : "";

    if (props.field != undefined && newData[0] != undefined) {
      return (
        <td colSpan={props.colSpan} style={props.style}>
          {newData2[0].items[0].useTotalRow[0][title]} <br />
          {newData2[0].items[0].useTotalRow[1][title]} <br />
          {newData2[0].items[0].useTotalRow[2][title]} <br />
        </td>
      );
    } else {
      return <td></td>;
    }
  };

  const gridSumQtyFooterCell3 = (props: GridFooterCellProps) => {
    const title =
      props.field != undefined ? props.field.replace("use_cnt_", "") : "";

    if (props.field != undefined && newData[0] != undefined) {
      return (
        <td colSpan={props.colSpan} style={props.style}>
          {newData3[0].items[0].useTotalRow[0][title]} <br />
          {newData3[0].items[0].useTotalRow[1][title]} <br />
          {newData3[0].items[0].useTotalRow[2][title]} <br />
        </td>
      );
    } else {
      return <td></td>;
    }
  };

  const search = () => {
    try {
      if (convertDateToStr(filters.yyyymm).substring(0, 4) < "1997") {
        throw findMessage(messagesData, "SY_A0100W_001");
      } else if (
        filters.cboLocation == "" ||
        filters.cboLocation == null ||
        filters.cboLocation == undefined
      ) {
        throw findMessage(messagesData, "SY_A0100W_002");
      } else if (
        tabSelected == 0 &&
        (dataFilters.cboViewType == "" ||
          dataFilters.cboViewType == null ||
          dataFilters.cboViewType == undefined)
      ) {
        throw findMessage(messagesData, "SY_A0100W_003");
      } else {
        resetAllGrid();
        setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
        setFilters2((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
        setFilters3((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
      }
    } catch (e) {
      alert(e);
    }
  };

  return (
    <>
      <TitleContainer>
        <Title>데이터등록현황</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="SY_A0100W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>사업장</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="cboLocation"
                    value={filters.cboLocation}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    className="required"
                  />
                )}
              </td>
              <th>기준년월</th>
              <td>
                <DatePicker
                  name="yyyymm"
                  value={filters.yyyymm}
                  format="yyyy-MM"
                  calendar={MonthCalendar}
                  onChange={filterInputChange}
                  placeholder=""
                  className="required"
                />
              </td>
              {tabSelected === 0 && (
                <>
                  <th>조회타입</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="cboViewType"
                        value={dataFilters.cboViewType}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                        textField="name"
                        valueField="code"
                        className="required"
                      />
                    )}
                  </td>
                </>
              )}
              {tabSelected === 1 && (
                <>
                  <th>전체메뉴</th>
                  <td>
                    <Checkbox
                      name="is_all_menu"
                      value={programFilters.is_all_menu === "Y" ? true : false}
                      onChange={programFilterChecBoxChange}
                    />
                  </td>
                  <th>사용자그룹</th>
                  <td>
                    <Checkbox
                      name="user_groupping"
                      value={
                        programFilters.user_groupping === "Y" ? true : false
                      }
                      onChange={programFilterChecBoxChange}
                    />
                  </td>
                </>
              )}
              {tabSelected === 2 && (
                <>
                  <th></th>
                  <td></td>
                  <th></th>
                  <td></td>
                </>
              )}
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>

      <TabStrip
        style={{ width: "100%" }}
        selected={tabSelected}
        onSelect={handleSelectTab}
      >
        <TabStripTab title="데이터 등록 현황">
          <CusomizedGrid></CusomizedGrid>
        </TabStripTab>
        <TabStripTab title="프로그램 접속 현황">
          <CusomizedGrid2></CusomizedGrid2>
        </TabStripTab>
        <TabStripTab title="사용자별 프로그램 접속 현황">
          <CusomizedGrid3></CusomizedGrid3>
        </TabStripTab>
      </TabStrip>
      {excelPopUpWindowVisible && (
        <ExcelWindow
          setVisible={setExcelPopUpWindowVisible}
          name={[
            "데이터 등록현황",
            "프로그램 접속 현황",
            "사용자별 프로그램 접속 현황",
          ]}
          setDownload={(index: any) => setDownload(index)}
          modal={true}
        />
      )}
    </>
  );
};

export default App;
