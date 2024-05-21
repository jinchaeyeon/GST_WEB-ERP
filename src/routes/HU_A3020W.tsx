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
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import React, { useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import NameCell from "../components/Cells/NameCell";
import NumberCell from "../components/Cells/NumberCell";
import RadioGroupCell from "../components/Cells/RadioGroupCell";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UseParaPc,
  UsePermissions,
  getGridItemChangedData,
  getHeight,
} from "../components/CommonFunction";
import {
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { useApi } from "../hooks/api";
import { heightstate, isLoading } from "../store/atoms";
import { gridList } from "../store/columns/HU_A3020W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
const DATA_ITEM_KEY = "num";
let deletedMainRows: object[] = [];
let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;
let temp = 0;
let temp2 = 0;
const NumberField = ["notaxlmt", "stdamt"];
const requiredField = ["payitemcd", "payitemnm"];
const customField = ["payitemkind", "taxcd"];
const checkField = [
  "empinsuranceyn",
  "monthlypayyn",
  "avgwageyn",
  "ordwageyn",
  "rtrpayyn",
  "totincluyn",
  "daycalyn",
];
const radioField = ["fraction"];

type TdataArr = {
  rowstatus_s: string[];
  payitemcd_s: string[];
  payitemnm_s: string[];
  payitemkind_s: string[];
  payitemgroup_s: string[];
  taxcd_s: string[];
  notaxlmt_s: string[];
  empinsuranceyn_s: string[];
  monthlypayyn_s: string[];
  avgwageyn_s: string[];
  ordwageyn_s: string[];
  rtrpayyn_s: string[];
  totincluyn_s: string[];
  stdamt_s: string[];
  fraction_s: string[];
  daycalyn_s: string[];
};

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_HU042, L_HU029", setBizComponentData);
  //수당종류, 세액구분

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "payitemkind" ? "L_HU042" : field == "taxcd" ? "L_HU029" : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td />
  );
};

const CustomRadioCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("R_fraction", setBizComponentData);
  //끝전처리

  const field = props.field ?? "";
  const bizComponentIdVal = field == "fraction" ? "R_fraction" : "";
  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <RadioGroupCell bizComponentData={bizComponent} {...props} />
  ) : (
    <td />
  );
};

const HU_A3020W: React.FC = () => {
  let deviceWidth = document.documentElement.clientWidth;
  const [deviceHeight, setDeviceHeight] = useRecoilState(heightstate);
  let isMobile = deviceWidth <= 1200;

  var height = getHeight(".ButtonContainer");
  var height2 = getHeight(".k-tabstrip-items-wrapper");


  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");

  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("HU_A3020W", setMessagesData);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
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

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("HU_A3020W", setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
      }));
    }
  }, [customOptionData]);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [tempState2, setTempState2] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [tempResult2, setTempResult2] = useState<DataResult>(
    process([], tempState2)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [tabSelected, setTabSelected] = React.useState(0);

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    worktype: "PAY",
    orgdiv: sessionOrgdiv,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 초기값
  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    worktype: "DEDUCT",
    orgdiv: sessionOrgdiv,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A3020W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.worktype,
        "@p_orgdiv": filters.orgdiv,
        "@p_find_row_value": filters.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.payitemcd == filters.find_row_value
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
            : rows.find((row: any) => row.payitemcd == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
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
    const parameters: Iparameters = {
      procedureName: "P_HU_A3020W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.worktype,
        "@p_orgdiv": filters.orgdiv,
        "@p_find_row_value": filters2.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (filters2.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef2.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.payitemcd == filters2.find_row_value
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

      setMainDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          filters2.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.payitemcd == filters2.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState2({ [selectedRow[DATA_ITEM_KEY]]: true });
        } else {
          setSelectedState2({ [rows[0][DATA_ITEM_KEY]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록

      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters2.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록

      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, permissions]);

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);

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

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setPage2(initialPageState);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
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

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      if (tabSelected == 0) {
        const optionsGridOne = _export.workbookOptions();
        optionsGridOne.sheets[0].title = "지급항목";
        _export.save(optionsGridOne);
      }
    }
    if (_export2 !== null && _export2 !== undefined) {
      if (tabSelected == 1) {
        const optionsGridTwo = _export2.workbookOptions();
        optionsGridTwo.sheets[0].title = "공제항목";
        _export2.save(optionsGridTwo);
      }
    }
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
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

  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = mainDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult2.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
    resetAllGrid();
    if (e.selected == 0) {
      setFilters((prev: any) => ({
        ...prev,
        find_row_value: "",
        pgNum: 1,
        isSearch: true,
      }));
    } else if (e.selected == 1) {
      setFilters2((prev: any) => ({
        ...prev,
        find_row_value: "",
        pgNum: 1,
        isSearch: true,
      }));
    }
    deletedMainRows = [];
  };

  const search = () => {
    resetAllGrid();
    deletedMainRows = [];
    if (tabSelected == 0) {
      setFilters((prev: any) => ({
        ...prev,
        find_row_value: "",
        pgNum: 1,
        isSearch: true,
      }));
    } else if (tabSelected == 1) {
      setFilters2((prev: any) => ({
        ...prev,
        find_row_value: "",
        pgNum: 1,
        isSearch: true,
      }));
    }
  };

  const onMainItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
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

  const enterEdit = (dataItem: any, field: string) => {
    if (field != "rowstatus") {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
      );
      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult((prev) => {
        return {
          data: mainDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult.data != mainDataResult.data) {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
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
      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const onMainItemChange2 = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      mainDataResult2,
      setMainDataResult2,
      DATA_ITEM_KEY
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
    if (
      !(
        field == "payitemcd" &&
        (dataItem.rowstatus == undefined || dataItem.rowstatus == "U")
      )
    ) {
      const newData = mainDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY] == dataItem[DATA_ITEM_KEY]
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
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState2)[0]
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

  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });
    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      avgwageyn: "N",
      daycalyn: "N",
      empinsuranceyn: "N",
      fraction: "0",
      monthlypayyn: "N",
      notaxlmt: 0,
      ordwageyn: "N",
      orgdiv: sessionOrgdiv,
      paydeductdiv: "1",
      payitemcd: "",
      payitemgroup: "",
      payitemkind: "",
      payitemnm: "",
      rtrpayyn: "N",
      seq: 0,
      stdamt: 0,
      taxcd: "",
      totincluyn: "N",
      rowstatus: "N",
    };

    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
    setPage((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
  };

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;

    mainDataResult.data.forEach((item: any, index: number) => {
      if (!selectedState[item[DATA_ITEM_KEY]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
          deletedMainRows.push(newData2);
        }
        Object.push(index);
      }
    });
    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult.data[Math.min(...Object2)];
    } else {
      data = mainDataResult.data[Math.min(...Object) - 1];
    }
    setMainDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));

    setSelectedState({
      [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
    });
  };

  const onSaveClick = () => {
    let valid = true;
    try {
      const dataItem = mainDataResult.data.filter((item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      });
      dataItem.map((item) => {
        if (
          item.payitemcd == undefined ||
          item.payitemcd == null ||
          item.payitemcd == ""
        ) {
          valid = false;
        }
        if (
          item.payitemnm == undefined ||
          item.payitemnm == null ||
          item.payitemnm == ""
        ) {
          valid = false;
        }
      });
      let dataArr: TdataArr = {
        rowstatus_s: [],
        payitemcd_s: [],
        payitemnm_s: [],
        payitemkind_s: [],
        payitemgroup_s: [],
        taxcd_s: [],
        notaxlmt_s: [],
        empinsuranceyn_s: [],
        monthlypayyn_s: [],
        avgwageyn_s: [],
        ordwageyn_s: [],
        rtrpayyn_s: [],
        totincluyn_s: [],
        stdamt_s: [],
        fraction_s: [],
        daycalyn_s: [],
      };

      if (valid == true) {
        if (dataItem.length == 0 && deletedMainRows.length == 0) return false;
        dataItem.forEach((item: any, idx: number) => {
          const {
            rowstatus = "",
            payitemcd = "",
            payitemnm = "",
            payitemkind = "",
            payitemgroup = "",
            taxcd = "",
            notaxlmt = "",
            empinsuranceyn = "",
            monthlypayyn = "",
            avgwageyn = "",
            ordwageyn = "",
            rtrpayyn = "",
            totincluyn = "",
            stdamt = "",
            fraction = "",
            daycalyn = "",
          } = item;

          dataArr.rowstatus_s.push(rowstatus);
          dataArr.payitemcd_s.push(payitemcd);
          dataArr.payitemnm_s.push(payitemnm);
          dataArr.payitemkind_s.push(payitemkind);
          dataArr.payitemgroup_s.push(payitemgroup);
          dataArr.taxcd_s.push(taxcd);
          dataArr.notaxlmt_s.push(notaxlmt);
          dataArr.empinsuranceyn_s.push(
            empinsuranceyn == true
              ? "Y"
              : empinsuranceyn == false
              ? "N"
              : empinsuranceyn
          );
          dataArr.monthlypayyn_s.push(
            monthlypayyn == true
              ? "Y"
              : monthlypayyn == false
              ? "N"
              : monthlypayyn
          );
          dataArr.avgwageyn_s.push(
            avgwageyn == true ? "Y" : avgwageyn == false ? "N" : avgwageyn
          );
          dataArr.ordwageyn_s.push(
            ordwageyn == true ? "Y" : ordwageyn == false ? "N" : ordwageyn
          );
          dataArr.rtrpayyn_s.push(
            rtrpayyn == true ? "Y" : rtrpayyn == false ? "N" : rtrpayyn
          );
          dataArr.totincluyn_s.push(
            totincluyn == true ? "Y" : totincluyn == false ? "N" : totincluyn
          );
          dataArr.stdamt_s.push(stdamt);
          dataArr.fraction_s.push(fraction);
          dataArr.daycalyn_s.push(
            daycalyn == true ? "Y" : daycalyn == false ? "N" : daycalyn
          );
        });
        deletedMainRows.forEach((item: any, idx: number) => {
          const {
            rowstatus = "",
            payitemcd = "",
            payitemnm = "",
            payitemkind = "",
            payitemgroup = "",
            taxcd = "",
            notaxlmt = "",
            empinsuranceyn = "",
            monthlypayyn = "",
            avgwageyn = "",
            ordwageyn = "",
            rtrpayyn = "",
            totincluyn = "",
            stdamt = "",
            fraction = "",
            daycalyn = "",
          } = item;
          dataArr.rowstatus_s.push(rowstatus);
          dataArr.payitemcd_s.push(payitemcd);
          dataArr.payitemnm_s.push(payitemnm);
          dataArr.payitemkind_s.push(payitemkind);
          dataArr.payitemgroup_s.push(payitemgroup);
          dataArr.taxcd_s.push(taxcd);
          dataArr.notaxlmt_s.push(notaxlmt);
          dataArr.empinsuranceyn_s.push(
            empinsuranceyn == true
              ? "Y"
              : empinsuranceyn == false
              ? "N"
              : empinsuranceyn
          );
          dataArr.monthlypayyn_s.push(
            monthlypayyn == true
              ? "Y"
              : monthlypayyn == false
              ? "N"
              : monthlypayyn
          );
          dataArr.avgwageyn_s.push(
            avgwageyn == true ? "Y" : avgwageyn == false ? "N" : avgwageyn
          );
          dataArr.ordwageyn_s.push(
            ordwageyn == true ? "Y" : ordwageyn == false ? "N" : ordwageyn
          );
          dataArr.rtrpayyn_s.push(
            rtrpayyn == true ? "Y" : rtrpayyn == false ? "N" : rtrpayyn
          );
          dataArr.totincluyn_s.push(
            totincluyn == true ? "Y" : totincluyn == false ? "N" : totincluyn
          );
          dataArr.stdamt_s.push(stdamt);
          dataArr.fraction_s.push(fraction);
          dataArr.daycalyn_s.push(
            daycalyn == true ? "Y" : daycalyn == false ? "N" : daycalyn
          );
        });
        setParaData((prev) => ({
          ...prev,
          workType: "N",
          paydeductdiv: "1",
          rowstatus_s: dataArr.rowstatus_s.join("|"),
          payitemcd_s: dataArr.payitemcd_s.join("|"),
          payitemnm_s: dataArr.payitemnm_s.join("|"),
          payitemkind_s: dataArr.payitemkind_s.join("|"),
          payitemgroup_s: dataArr.payitemgroup_s.join("|"),
          taxcd_s: dataArr.taxcd_s.join("|"),
          notaxlmt_s: dataArr.notaxlmt_s.join("|"),
          empinsuranceyn_s: dataArr.empinsuranceyn_s.join("|"),
          monthlypayyn_s: dataArr.monthlypayyn_s.join("|"),
          avgwageyn_s: dataArr.avgwageyn_s.join("|"),
          ordwageyn_s: dataArr.ordwageyn_s.join("|"),
          rtrpayyn_s: dataArr.rtrpayyn_s.join("|"),
          totincluyn_s: dataArr.totincluyn_s.join("|"),
          stdamt_s: dataArr.stdamt_s.join("|"),
          fraction_s: dataArr.fraction_s.join("|"),
          daycalyn_s: dataArr.daycalyn_s.join("|"),
        }));
      } else {
        alert("필수항목을 채워주세요.");
      }
    } catch (e) {
      alert(e);
    }
  };

  const onSaveClick2 = () => {
    let valid = true;
    try {
      const dataItem = mainDataResult2.data.filter((item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      });
      dataItem.map((item) => {
        if (
          item.payitemcd == undefined ||
          item.payitemcd == null ||
          item.payitemcd == ""
        ) {
          valid = false;
        }
        if (
          item.payitemnm == undefined ||
          item.payitemnm == null ||
          item.payitemnm == ""
        ) {
          valid = false;
        }
      });
      let dataArr: TdataArr = {
        rowstatus_s: [],
        payitemcd_s: [],
        payitemnm_s: [],
        payitemkind_s: [],
        payitemgroup_s: [],
        taxcd_s: [],
        notaxlmt_s: [],
        empinsuranceyn_s: [],
        monthlypayyn_s: [],
        avgwageyn_s: [],
        ordwageyn_s: [],
        rtrpayyn_s: [],
        totincluyn_s: [],
        stdamt_s: [],
        fraction_s: [],
        daycalyn_s: [],
      };

      if (valid == true) {
        if (dataItem.length == 0 && deletedMainRows.length == 0) return false;
        dataItem.forEach((item: any, idx: number) => {
          const {
            rowstatus = "",
            payitemcd = "",
            payitemnm = "",
            payitemkind = "",
            payitemgroup = "",
            taxcd = "",
            notaxlmt = "",
            empinsuranceyn = "",
            monthlypayyn = "",
            avgwageyn = "",
            ordwageyn = "",
            rtrpayyn = "",
            totincluyn = "",
            stdamt = "",
            fraction = "",
            daycalyn = "",
          } = item;

          dataArr.rowstatus_s.push(rowstatus);
          dataArr.payitemcd_s.push(payitemcd);
          dataArr.payitemnm_s.push(payitemnm);
          dataArr.payitemkind_s.push(
            payitemkind == undefined ? "" : payitemkind
          );
          dataArr.payitemgroup_s.push(payitemgroup);
          dataArr.taxcd_s.push(taxcd == undefined ? "" : payitemkind);
          dataArr.notaxlmt_s.push(notaxlmt == undefined ? "" : notaxlmt);
          dataArr.empinsuranceyn_s.push(
            empinsuranceyn == undefined ? "" : empinsuranceyn
          );
          dataArr.monthlypayyn_s.push(
            monthlypayyn == undefined ? "" : monthlypayyn
          );
          dataArr.avgwageyn_s.push(avgwageyn == undefined ? "" : avgwageyn);
          dataArr.ordwageyn_s.push(ordwageyn == undefined ? "" : ordwageyn);
          dataArr.rtrpayyn_s.push(rtrpayyn == undefined ? "" : rtrpayyn);
          dataArr.totincluyn_s.push(
            totincluyn == true ? "Y" : totincluyn == false ? "N" : totincluyn
          );
          dataArr.stdamt_s.push(stdamt);
          dataArr.fraction_s.push(fraction);
          dataArr.daycalyn_s.push(daycalyn == undefined ? "" : daycalyn);
        });
        deletedMainRows.forEach((item: any, idx: number) => {
          const {
            rowstatus = "",
            payitemcd = "",
            payitemnm = "",
            payitemkind = "",
            payitemgroup = "",
            taxcd = "",
            notaxlmt = "",
            empinsuranceyn = "",
            monthlypayyn = "",
            avgwageyn = "",
            ordwageyn = "",
            rtrpayyn = "",
            totincluyn = "",
            stdamt = "",
            fraction = "",
            daycalyn = "",
          } = item;
          dataArr.rowstatus_s.push(rowstatus);
          dataArr.payitemcd_s.push(payitemcd);
          dataArr.payitemnm_s.push(payitemnm);
          dataArr.payitemkind_s.push(
            payitemkind == undefined ? "" : payitemkind
          );
          dataArr.payitemgroup_s.push(payitemgroup);
          dataArr.taxcd_s.push(taxcd == undefined ? "" : payitemkind);
          dataArr.notaxlmt_s.push(notaxlmt == undefined ? "" : notaxlmt);
          dataArr.empinsuranceyn_s.push(
            empinsuranceyn == undefined ? "" : empinsuranceyn
          );
          dataArr.monthlypayyn_s.push(
            monthlypayyn == undefined ? "" : monthlypayyn
          );
          dataArr.avgwageyn_s.push(avgwageyn == undefined ? "" : avgwageyn);
          dataArr.ordwageyn_s.push(ordwageyn == undefined ? "" : ordwageyn);
          dataArr.rtrpayyn_s.push(rtrpayyn == undefined ? "" : rtrpayyn);
          dataArr.totincluyn_s.push(
            totincluyn == true ? "Y" : totincluyn == false ? "N" : totincluyn
          );
          dataArr.stdamt_s.push(stdamt);
          dataArr.fraction_s.push(fraction);
          dataArr.daycalyn_s.push(daycalyn == undefined ? "" : daycalyn);
        });
        setParaData((prev) => ({
          ...prev,
          workType: "N",
          paydeductdiv: "2",
          rowstatus_s: dataArr.rowstatus_s.join("|"),
          payitemcd_s: dataArr.payitemcd_s.join("|"),
          payitemnm_s: dataArr.payitemnm_s.join("|"),
          payitemkind_s: dataArr.payitemkind_s.join("|"),
          payitemgroup_s: dataArr.payitemgroup_s.join("|"),
          taxcd_s: dataArr.taxcd_s.join("|"),
          notaxlmt_s: dataArr.notaxlmt_s.join("|"),
          empinsuranceyn_s: dataArr.empinsuranceyn_s.join("|"),
          monthlypayyn_s: dataArr.monthlypayyn_s.join("|"),
          avgwageyn_s: dataArr.avgwageyn_s.join("|"),
          ordwageyn_s: dataArr.ordwageyn_s.join("|"),
          rtrpayyn_s: dataArr.rtrpayyn_s.join("|"),
          totincluyn_s: dataArr.totincluyn_s.join("|"),
          stdamt_s: dataArr.stdamt_s.join("|"),
          fraction_s: dataArr.fraction_s.join("|"),
          daycalyn_s: dataArr.daycalyn_s.join("|"),
        }));
      } else {
        alert("필수항목을 채워주세요.");
      }
    } catch (e) {
      alert(e);
    }
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "N",
    orgdiv: sessionOrgdiv,
    paydeductdiv: "1",
    rowstatus_s: "",
    payitemcd_s: "",
    payitemnm_s: "",
    payitemkind_s: "",
    payitemgroup_s: "",
    taxcd_s: "",
    notaxlmt_s: "",
    empinsuranceyn_s: "",
    monthlypayyn_s: "",
    avgwageyn_s: "",
    ordwageyn_s: "",
    rtrpayyn_s: "",
    totincluyn_s: "",
    stdamt_s: "",
    fraction_s: "",
    daycalyn_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_HU_A3020W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_paydeductdiv": ParaData.paydeductdiv,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_payitemcd_s": ParaData.payitemcd_s,
      "@p_payitemnm_s": ParaData.payitemnm_s,
      "@p_payitemkind_s": ParaData.payitemkind_s,
      "@p_payitemgroup_s": ParaData.payitemgroup_s,
      "@p_taxcd_s": ParaData.taxcd_s,
      "@p_notaxlmt_s": ParaData.notaxlmt_s,
      "@p_empinsuranceyn_s": ParaData.empinsuranceyn_s,
      "@p_monthlypayyn_s": ParaData.monthlypayyn_s,
      "@p_avgwageyn_s": ParaData.avgwageyn_s,
      "@p_ordwageyn_s": ParaData.ordwageyn_s,
      "@p_rtrpayyn_s": ParaData.rtrpayyn_s,
      "@p_totincluyn_s": ParaData.totincluyn_s,
      "@p_stdamt_s": ParaData.stdamt_s,
      "@p_fraction_s": ParaData.fraction_s,
      "@p_daycalyn_s": ParaData.daycalyn_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "HU_A3020W",
    },
  };

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      setParaData({
        pgSize: PAGE_SIZE,
        workType: "N",
        orgdiv: sessionOrgdiv,
        paydeductdiv: "1",
        rowstatus_s: "",
        payitemcd_s: "",
        payitemnm_s: "",
        payitemkind_s: "",
        payitemgroup_s: "",
        taxcd_s: "",
        notaxlmt_s: "",
        empinsuranceyn_s: "",
        monthlypayyn_s: "",
        avgwageyn_s: "",
        ordwageyn_s: "",
        rtrpayyn_s: "",
        totincluyn_s: "",
        stdamt_s: "",
        fraction_s: "",
        daycalyn_s: "",
      });
      deletedMainRows = [];
      resetAllGrid();
      if (tabSelected == 0) {
        setFilters((prev: any) => ({
          ...prev,
          find_row_value: data.returnString,
          pgNum: 1,
          isSearch: true,
        }));
      } else if (tabSelected == 1) {
        setFilters2((prev: any) => ({
          ...prev,
          find_row_value: data.returnString,
          pgNum: 1,
          isSearch: true,
        }));
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.rowstatus_s != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  const onAddClick2 = () => {
    mainDataResult2.data.map((item) => {
      if (item.num > temp2) {
        temp2 = item.num;
      }
    });
    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp2,
      fraction: "0",
      orgdiv: sessionOrgdiv,
      payitemcd: "",
      payitemgroup: "",
      payitemnm: "",
      seq: 0,
      stdamt: 0,
      totincluyn: "N",
      rowstatus: "N",
    };

    setMainDataResult2((prev) => {
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
    setSelectedState2({ [newDataItem[DATA_ITEM_KEY]]: true });
  };

  const onDeleteClick2 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult2.data.forEach((item: any, index: number) => {
      if (!selectedState2[item[DATA_ITEM_KEY]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
          deletedMainRows.push(newData2);
        }
        Object.push(index);
      }
    });
    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult2.data[Math.min(...Object2)];
    } else {
      data = mainDataResult2.data[Math.min(...Object) - 1];
    }
    setMainDataResult2((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));

    setSelectedState2({
      [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
    });
  };

  return (
    <>
      <TitleContainer>
        <Title>지급, 공제항목</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="HU_A3020W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <TabStrip
        style={{ width: "100%" }}
        selected={tabSelected}
        onSelect={handleSelectTab}
        scrollable={isMobile}
      >
        <TabStripTab title="지급항목">
          <GridContainer width="100%">
            <GridTitleContainer className="ButtonContainer">
              <GridTitle></GridTitle>
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
                  title="저장"
                ></Button>
              </ButtonContainer>
            </GridTitleContainer>
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
              fileName="지급항목"
            >
              <Grid
                style={{ height: isMobile ? deviceHeight - height - height2 : "77.5vh" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    fraction: row.fraction == "" ? "4" : row.fraction,
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
                onItemChange={onMainItemChange}
                cellRender={customCellRender}
                rowRender={customRowRender}
                editField={EDIT_FIELD}
              >
                <GridColumn field="rowstatus" title=" " width="50px" />
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
                            NumberField.includes(item.fieldName)
                              ? NumberCell
                              : customField.includes(item.fieldName)
                              ? CustomComboBoxCell
                              : checkField.includes(item.fieldName)
                              ? CheckBoxCell
                              : radioField.includes(item.fieldName)
                              ? CustomRadioCell
                              : NameCell
                          }
                          headerCell={
                            requiredField.includes(item.fieldName)
                              ? RequiredHeader
                              : undefined
                          }
                          footerCell={
                            item.sortOrder == 0
                              ? mainTotalFooterCell
                              : undefined
                          }
                        />
                      )
                  )}
              </Grid>
            </ExcelExport>
          </GridContainer>
        </TabStripTab>
        <TabStripTab title="공제항목">
          <GridContainer width="100%">
            <GridTitleContainer className="ButtonContainer">
              <GridTitle></GridTitle>
              <ButtonContainer>
                <Button
                  onClick={onAddClick2}
                  themeColor={"primary"}
                  icon="plus"
                  title="행 추가"
                ></Button>
                <Button
                  onClick={onDeleteClick2}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="minus"
                  title="행 삭제"
                ></Button>
                <Button
                  onClick={onSaveClick2}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="save"
                  title="저장"
                ></Button>
              </ButtonContainer>
            </GridTitleContainer>
            <ExcelExport
              data={mainDataResult2.data}
              ref={(exporter) => {
                _export2 = exporter;
              }}
              fileName="지급항목"
            >
              <Grid
                style={{ height: isMobile ? deviceHeight - height - height2 : "77.5vh" }}
                data={process(
                  mainDataResult2.data.map((row) => ({
                    ...row,
                    fraction: row.fraction == "" ? "4" : row.fraction,
                    [SELECTED_FIELD]: selectedState2[idGetter(row)],
                  })),
                  mainDataState2
                )}
                {...mainDataState2}
                onDataStateChange={onMainDataStateChange2}
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
                onItemChange={onMainItemChange2}
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
                            NumberField.includes(item.fieldName)
                              ? NumberCell
                              : customField.includes(item.fieldName)
                              ? CustomComboBoxCell
                              : checkField.includes(item.fieldName)
                              ? CheckBoxCell
                              : radioField.includes(item.fieldName)
                              ? CustomRadioCell
                              : NameCell
                          }
                          headerCell={
                            requiredField.includes(item.fieldName)
                              ? RequiredHeader
                              : undefined
                          }
                          footerCell={
                            item.sortOrder == 0
                              ? mainTotalFooterCell2
                              : undefined
                          }
                        />
                      )
                  )}
              </Grid>
            </ExcelExport>
          </GridContainer>
        </TabStripTab>
      </TabStrip>
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

export default HU_A3020W;
